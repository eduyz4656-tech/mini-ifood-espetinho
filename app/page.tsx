“use client”;

Import Link from “next/link”;
Import { useMemo, useRef, useState } from “react”;
Import { supabase } from “./lib/supabase”;
Import { PRODUTOS, Produto, ItemCarrinho, dinheiro } from “./lib/cardapio”;

Type CampoErros = {
  Nome?: boolean;
  Telefone?: boolean;
  Endereco?: boolean;
  Mesa?: boolean;
  Pagamento?: boolean;
  trocoPara?: boolean;
  carrinho?: boolean;
};

Function campoStyle(erro?: boolean): React.CSSProperties {
  Return {
    Border: erro ? “2px solid #ff4d4f” : undefined,
    boxShadow: erro ? “0 0 0 2px rgba(255,77,79,0.15)” : undefined,
  };
}

Function CategoriaBloco({
  Titulo,
  Produtos,
  onAdd,
  aberta,
  onToggle,
}: {
  Titulo: string;
  Produtos: Produto[];
  onAdd: (produto: Produto) => void;
  aberta: boolean;
  onToggle: () => void;
}) {
  If (produtos.length === 0) return null;

  Return (
    <div style={{ marginBottom: 14 }}>
      <button
        Type=”button”
        onClick={onToggle}
        style={{
          width: “100%”,
          display: “flex”,
          justifyContent: “space-between”,
          alignItems: “center”,
          background: “#1ª1a1a”,
          color: “#fff”,
          border: “1px solid #333”,
          borderRadius: 18,
          padding: “16px 18px”,
          fontSize: “1rem”,
          fontWeight: 700,
          cursor: “pointer”,
        }}
      >
        <span>{titulo}</span>
        <span>{aberta ? “▲” : “▼”}</span>
      </button>

      {aberta ? (
        <div className=”produtos-grid” style={{ marginTop: 12 }}>
          {produtos.map((produto) => (
            <button
              Key={produto.id}
              onClick={() => onAdd(produto)}
              className=”produto-card”
            >
              <div className=”produto-nome”>{produto.nome}</div>
              <div className=”produto-preco”>{dinheiro(produto.preco)}</div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

Export default function Page() {
  Const [nome, setNome] = useState(“”);
  Const [telefone, setTelefone] = useState(“”);
  Const [tipoEntrega, setTipoEntrega] = useState<”delivery” | “retirada” | “mesa”>(“delivery”);
  Const [endereco, setEndereco] = useState(“”);
  Const [mesa, setMesa] = useState(“”);
  Const [pagamento, setPagamento] = useState(“Pix”);
  Const [precisaTroco, setPrecisaTroco] = useState(false);
  Const [trocoPara, setTrocoPara] = useState(“”);
  Const [observação, setObservacao] = useState(“”);

  Const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  Const [enviando, setEnviando] = useState(false);
  Const [mostrarCarrinho, setMostrarCarrinho] = useState(false);
  Const [categoriaAberta, setCategoriaAberta] = useState<string | null>(“Espetinho avulso tradicional”);
  Const [erros, setErros] = useState<CampoErros>({});

  Const nomeRef = useRef<HTMLInputElement | null>(null);
  Const telefoneRef = useRef<HTMLInputElement | null>(null);
  Const enderecoRef = useRef<HTMLInputElement | null>(null);
  Const mesaRef = useRef<HTMLInputElement | null>(null);
  Const pagamentoRef = useRef<HTMLSelectElement | null>(null);
  Const trocoParaRef = useRef<HTMLInputElement | null>(null);
  Const cardapioRef = useRef<HTMLElement | null>(null);

  Const total = useMemo(() => {
    Return carrinho.reduce((soma, item) => soma + item.preco * item.qtd, 0);
  }, [carrinho]);

  Function adicionar(produto: Produto) {
    setCarrinho((prev) => {
      const existe = prev.find((item) => item.id === produto.id);

      if (existe) {
        return prev.map((item) =>
          item.id === produto.id ? { ...item, qtd: item.qtd + 1 } : item
        );
      }

      Return [...prev, { ...produto, qtd: 1 }];
    });

    setErros((prev) => ({ ...prev, carrinho: false }));
  }

  Function diminuir(id: number) {
    setCarrinho((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qtd: item.qtd – 1 } : item))
        .filter((item) => item.qtd > 0)
    );
  }

  Function aumentar(id: number) {
    setCarrinho((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qtd: item.qtd + 1 } : item))
    );
  }

  Function removerDoCarrinho(id: number) {
    setCarrinho((prev) => prev.filter((item) => item.id !== id));
  }

  Function focarPrimeiroErro(novosErros: CampoErros) {
    If (novosErros.nome) {
      nomeRef.current?.scrollIntoView({ behavior: “smooth”, block: “center” });
      nomeRef.current?.focus();
      return;
    }

    If (novosErros.telefone) {
      telefoneRef.current?.scrollIntoView({ behavior: “smooth”, block: “center” });
      telefoneRef.current?.focus();
      return;
    }

    If (novosErros.endereco) {
      enderecoRef.current?.scrollIntoView({ behavior: “smooth”, block: “center” });
      enderecoRef.current?.focus();
      return;
    }

    If (novosErros.mesa) {
      mesaRef.current?.scrollIntoView({ behavior: “smooth”, block: “center” });
      mesaRef.current?.focus();
      return;
    }

    If (novosErros.pagamento) {
      pagamentoRef.current?.scrollIntoView({ behavior: “smooth”, block: “center” });
      pagamentoRef.current?.focus();
      return;
    }

    If (novosErros.trocoPara) {
      trocoParaRef.current?.scrollIntoView({ behavior: “smooth”, block: “center” });
      trocoParaRef.current?.focus();
      return;
    }

    If (novosErros.carrinho) {
      cardapioRef.current?.scrollIntoView({ behavior: “smooth”, block: “start” });
    }
  }

  Function validarFormulario() {
    Const novosErros: CampoErros = {};

    If (!nome.trim()) novosErros.nome = true;
    If (!telefone.trim()) novosErros.telefone = true;
    If (!pagamento.trim()) novosErros.pagamento = true;
    If (tipoEntrega === “delivery” && !endereco.trim()) novosErros.endereco = true;
    If (tipoEntrega === “mesa” && !mesa.trim()) novosErros.mesa = true;
    If (pagamento === “Dinheiro” && precisaTroco && !trocoPara.trim()) {
      novosErros.trocoPara = true;
    }
    If (carrinho.length === 0) novosErros.carrinho = true;

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      focarPrimeiroErro(novosErros);
      return false;
    }

    Return true;
  }

  Function montarMensagemWhatsApp() {
    Const itensTexto = carrinho
      .map((item) => `- ${item.qtd}x ${item.nome} (${dinheiro(item.preco * item.qtd)})`)
      .join(“\n”);

    Const detalhePagamento =
      Pagamento === “Dinheiro” && precisaTroco
        ? `${pagamento} | Troco para ${trocoPara}`
        : pagamento;

    Const entregaTexto =
      tipoEntrega === “delivery”
        ? endereco
        : tipoEntrega === “mesa”
        ? `Mesa ${mesa}`
        : “Retirada no local”;

    Return `🔥 *Novo pedido – Espetinho do Thalisca*

*Cliente:* ${nome}
*Telefone:* ${telefone}
*Entrega:* ${tipoEntrega}
*Local:* ${entregaTexto}
*Pagamento:* ${detalhePagamento}
*Observação:* ${observação || “sem observação”}

*Itens:*
${itensTexto}

*Total:* ${dinheiro(total)}`;
  }

  Async function enviarPedido() {
    If (!validarFormulario()) return;

    setEnviando(true);

    const enderecoFinal =
      tipoEntrega === “delivery”
        ? endereco
        : tipoEntrega === “mesa”
        ? `Mesa ${mesa}`
        : “retirada no local”;

    Const observacaoFinal =
      Pagamento === “Dinheiro” && precisaTroco
        ? observação
          ? `${observação} | Troco para ${trocoPara}`
          : `Troco para ${trocoPara}`
        : observação || “”;

    Const { data, error } = await supabase
      .from(“pedidos”)
      .insert([
        {
          Nome,
          Telefone,
          Tipo_entrega: tipoEntrega,
          Endereco: enderecoFinal,
          Pagamento,
          Observação: observacaoFinal,
          Itens: carrinho,
          Total,
          Status: “novo”,
        },
      ])
      .select();

    setEnviando(false);

    if (error) {
      alert(“Erro ao enviar pedido: “ + error.message);
      return;
    }

    Const pedidoCriado = data?.[0];
    Const mensagem = montarMensagemWhatsApp();
    Const numero = “5568992252648”;
    Const linkWhatsapp = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

    Alert(`Pedido enviado com sucesso! Código do pedido: ${pedidoCriado?.id}`);

    setNome(“”);
    setTelefone(“”);
    setTipoEntrega(“delivery”);
    setEndereco(“”);
    setMesa(“”);
    setPagamento(“Pix”);
    setPrecisaTroco(false);
    setTrocoPara(“”);
    setObservacao(“”);
    setCarrinho([]);
    setErros({});
    setMostrarCarrinho(false);

    window.open(linkWhatsapp, “_blank”);
  }

  Return (
    <main className=”pagina”>
      <div className=”container”>
        <div className=”topo-card”>
          <div
            Style={{
              Display: “flex”,
              justifyContent: “space-between”,
              gap: 16,
              alignItems: “flex-start”,
              flexWrap: “wrap”,
            }}
          >
            <div style={{ flex: 1, minWidth: 240 }}>
              <h1 className=”titulo-principal”>🔥 Espetinho do Thalisca</h1>
              <p className=”subtitulo”>”Fala comigo, fala com nós!”</p>

              <div className=”info-grid”>
                <div>📞 (68) 99225-2648</div>
                <div>📍 Av. Diamantino Augusto de Macedo, 866 – Olaria</div>
              </div>

              <div style={{ marginTop: 16, display: “flex”, gap: 10, flexWrap: “wrap” }}>
                <a
                  Href=https://wa.me/5568992252648?text=Ol%C3%A1%2C%20gostaria%20de%20fazer%20um%20pedido.
                  Target=”_blank”
                  Rel=”noopener noreferrer”
                  className=”principal-btn”
                  style={{ display: “inline-block”, width: “auto”, textDecoration: “none” }}
                >
                  🔥 Pedir pelo WhatsApp
                </a>

                <Link href=”/acompanhar” className=”aba” style={{ textDecoration: “none” }}>
                  Acompanhar pedido
                </Link>

                <Link href=”/painel” className=”aba” style={{ textDecoration: “none” }}>
                  Painel do atendente
                </Link>
              </div>
            </div>

            <button
              onClick={() => setMostrarCarrinho(true)}
              className=”principal-btn”
              style={{ width: “auto”, minWidth: 120 }}
            >
              🛒 {carrinho.reduce((soma, item) => soma + item.qtd, 0)}
            </button>
          </div>
        </div>

        <div className=”layout-cliente”>
          <div className=”coluna-principal”>
            <section className=”card”>
              <h2 style={{ fontSize: “2rem”, marginBottom: 18 }}>Novo pedido</h2>

              <div className=”grid-2”>
                <input
                  Ref={nomeRef}
                  className=”campo”
                  style={campoStyle(erros.nome)}
                  placeholder=”Nome do cliente”
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value);
                    if (e.target.value.trim()) setErros((prev) => ({ ...prev, nome: false }));
                  }}
                />

                <input
                  Ref={telefoneRef}
                  className=”campo”
                  style={campoStyle(erros.telefone)}
                  placeholder=”Telefone”
                  value={telefone}
                  onChange={(e) => {
                    setTelefone(e.target.value);
                    if (e.target.value.trim()) setErros((prev) => ({ ...prev, telefone: false }));
                  }}
                />
              </div>

              <div className=”tipo-entrega”>
                <button
                  onClick={() => setTipoEntrega(“delivery”)}
                  className={tipoEntrega === “delivery” ? “aba ativa pequena” : “aba pequena”}
                >
                  Delivery
                </button>
                <button
                  onClick={() => setTipoEntrega(“retirada”)}
                  className={tipoEntrega === “retirada” ? “aba ativa pequena” : “aba pequena”}
                >
                  Retirada
                </button>
                <button
                  onClick={() => setTipoEntrega(“mesa”)}
                  className={tipoEntrega === “mesa” ? “aba ativa pequena” : “aba pequena”}
                >
                  Mesa
                </button>
              </div>

              {tipoEntrega === “delivery” ? (
                <input
                  Ref={enderecoRef}
                  className=”campo margem-top”
                  style={campoStyle(erros.endereco)}
                  placeholder=”Endereço”
                  value={endereco}
                  onChange={(e) => {
                    setEndereco(e.target.value);
                    if (e.target.value.trim()) setErros((prev) => ({ ...prev, endereco: false }));
                  }}
                />
              ) : null}

              {tipoEntrega === “mesa” ? (
                <input
                  Ref={mesaRef}
                  className=”campo margem-top”
                  style={campoStyle(erros.mesa)}
                  placeholder=”Número da mesa”
                  value={mesa}
                  onChange={(e) => {
                    setMesa(e.target.value);
                    if (e.target.value.trim()) setErros((prev) => ({ ...prev, mesa: false }));
                  }}
                />
              ) : null}

              <div className=”grid-2 margem-top”>
                <select
                  Ref={pagamentoRef}
                  className=”campo”
                  style={campoStyle(erros.pagamento)}
                  value={pagamento}
                  onChange={(e) => {
                    setPagamento(e.target.value);
                    if (e.target.value !== “Dinheiro”) {
                      setPrecisaTroco(false);
                      setTrocoPara(“”);
                    }
                  }}
                >
                  <option>Pix</option>
                  <option>Dinheiro</option>
                  <option>Cartão</option>
                </select>

                <textarea
                  className=”campo”
                  placeholder=”Observação”
                  value={observação}
                  onChange={(e) => setObservacao(e.target.value)}
                  rows={3}
                />
              </div>

              {pagamento === “Dinheiro” ? (
                <div style={{ marginTop: 14 }}>
                  <div style={{ marginBottom: 10, fontWeight: 700 }}>Precisa de troco?</div>

                  <div style={{ display: “flex”, gap: 10, flexWrap: “wrap” }}>
                    <button
                      Type=”button”
                      onClick={() => setPrecisaTroco(true)}
                      className={precisaTroco ? “aba ativa pequena” : “aba pequena”}
                    >
                      Sim
                    </button>

                    <button
                      Type=”button”
                      onClick={() => {
                        setPrecisaTroco(false);
                        setTrocoPara(“”);
                      }}
                      className={!precisaTroco ? “aba ativa pequena” : “aba pequena”}
                    >
                      Não
                    </button>
                  </div>

                  {precisaTroco ? (
                    <input
                      Ref={trocoParaRef}
                      className=”campo margem-top”
                      style={campoStyle(erros.trocoPara)}
                      placeholder=”Troco para quanto?”
                      value={trocoPara}
                      onChange={(e) => {
                        setTrocoPara(e.target.value);
                        if (e.target.value.trim()) setErros((prev) => ({ ...prev, trocoPara: false }));
                      }}
                    />
                  ) : null}
                </div>
              ) : null}
            </section>

            <section ref={cardapioRef} className=”card”>
              <h2 style={{ fontSize: “2rem”, marginBottom: 18 }}>Cardápio</h2>

              {erros.carrinho ? (
                <div style={{ marginBottom: 14, color: “#ff6b6b”, fontWeight: 700 }}>
                  Adiciona pelo menos 1 item no pedido.
                </div>
              ) : null}

              <CategoriaBloco
                Titulo=”Espetinho avulso tradicional”
                Produtos={PRODUTOS.filter((p) => p.categoria === “Espetinho avulso tradicional”)}
                onAdd={adicionar}
                aberta={categoriaAberta === “Espetinho avulso tradicional”}
                onToggle={() =>
                  setCategoriaAberta(
                    categoriaAberta === “Espetinho avulso tradicional”
                      ? null
                      : “Espetinho avulso tradicional”
                  )
                }
              />

              <CategoriaBloco
                Titulo=”Espetinho avulso Premium”
                Produtos={PRODUTOS.filter((p) => p.categoria === “Espetinho avulso Premium”)}
                onAdd={adicionar}
                aberta={categoriaAberta === “Espetinho avulso Premium”}
                onToggle={() =>
                  setCategoriaAberta(
                    categoriaAberta === “Espetinho avulso Premium”
                      ? null
                      : “Espetinho avulso Premium”
                  )
                }
              />

              <CategoriaBloco
                Titulo=”Acompanhamento + espetinho tradicional”
                Produtos={PRODUTOS.filter(
                  (p) => p.categoria === “Acompanhamento + espetinho tradicional”
                )}
                onAdd={adicionar}
                aberta={categoriaAberta === “Acompanhamento + espetinho tradicional”}
                onToggle={() =>
                  setCategoriaAberta(
                    categoriaAberta === “Acompanhamento + espetinho tradicional”
                      ? null
                      : “Acompanhamento + espetinho tradicional”
                  )
                }
              />

              <CategoriaBloco
                Titulo=”Acompanhamento + espetinho Premium”
                Produtos={PRODUTOS.filter(
                  (p) => p.categoria === “Acompanhamento + espetinho Premium”
                )}
                onAdd={adicionar}
                aberta={categoriaAberta === “Acompanhamento + espetinho Premium”}
                onToggle={() =>
                  setCategoriaAberta(
                    categoriaAberta === “Acompanhamento + espetinho Premium”
                      ? null
                      : “Acompanhamento + espetinho Premium”
                  )
                }
              />

              <CategoriaBloco
                Titulo=”Sucos”
                Produtos={PRODUTOS.filter((p) => p.categoria === “Sucos”)}
                onAdd={adicionar}
                aberta={categoriaAberta === “Sucos”}
                onToggle={() => setCategoriaAberta(categoriaAberta === “Sucos” ? null : “Sucos”)}
              />

              <CategoriaBloco
                Titulo=”Geladinho”
                Produtos={PRODUTOS.filter((p) => p.categoria === “Geladinho”)}
                onAdd={adicionar}
                aberta={categoriaAberta === “Geladinho”}
                onToggle={() =>
                  setCategoriaAberta(categoriaAberta === “Geladinho” ? null : “Geladinho”)
                }
              />
            </section>
          </div>
        </div>
      </div>

      {mostrarCarrinho ? (
        <div
          Style={{
            Position: “fixed”,
            Inset: 0,
            Background: “rgba(0,0,0,0.65)”,
            Display: “flex”,
            justifyContent: “flex-end”,
            zIndex: 9999,
          }}
          onClick={() => setMostrarCarrinho(false)}
        >
          <div
            Style={{
              Width: “100%”,
              maxWidth: 420,
          

