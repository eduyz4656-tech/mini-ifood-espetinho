"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabase";
import { PRODUTOS, Produto, ItemCarrinho, dinheiro } from "./lib/cardapio";

type CampoErros = {
  nome?: boolean;
  telefone?: boolean;
  endereco?: boolean;
  mesa?: boolean;
  pagamento?: boolean;
  trocoPara?: boolean;
  carrinho?: boolean;
};

function campoStyle(erro?: boolean): React.CSSProperties {
  return erro
    ? {
        border: "2px solid #ff4d4f",
        boxShadow: "0 0 0 2px rgba(255,77,79,0.15)",
      }
    : {};
}

function CategoriaBloco({
  titulo,
  produtos,
  onAdd,
  aberta,
  onToggle,
}: {
  titulo: string;
  produtos: Produto[];
  onAdd: (produto: Produto) => void;
  aberta: boolean;
  onToggle: () => void;
}) {
  if (produtos.length === 0) return null;

  return (
    <div style={{ marginBottom: 14 }}>
      <button type="button" onClick={onToggle} className="categoria-botao">
        <span>{titulo}</span>
        <span>{aberta ? "▲" : "▼"}</span>
      </button>

      {aberta ? (
        <div className="produtos-grid" style={{ marginTop: 12 }}>
          {produtos.map((produto) => (
            <button
              key={produto.id}
              onClick={() => onAdd(produto)}
              className="produto-card"
              type="button"
            >
              <div className="produto-nome">{produto.nome}</div>
              <div className="produto-preco">{dinheiro(produto.preco)}</div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Page() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState<"delivery" | "retirada" | "mesa">("delivery");
  const [endereco, setEndereco] = useState("");
  const [mesa, setMesa] = useState("");
  const [pagamento, setPagamento] = useState("Pix");
  const [precisaTroco, setPrecisaTroco] = useState(false);
  const [trocoPara, setTrocoPara] = useState("");
  const [observacao, setObservacao] = useState("");

  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);
  const [categoriaAberta, setCategoriaAberta] = useState<string | null>("Espetinho avulso tradicional");
  const [erros, setErros] = useState<CampoErros>({});

  const nomeRef = useRef<HTMLInputElement | null>(null);
  const telefoneRef = useRef<HTMLInputElement | null>(null);
  const enderecoRef = useRef<HTMLInputElement | null>(null);
  const mesaRef = useRef<HTMLInputElement | null>(null);
  const pagamentoRef = useRef<HTMLSelectElement | null>(null);
  const trocoParaRef = useRef<HTMLInputElement | null>(null);
  const cardapioRef = useRef<HTMLElement | null>(null);

  const total = useMemo(() => {
    return carrinho.reduce((soma, item) => soma + item.preco * item.qtd, 0);
  }, [carrinho]);

  function adicionar(produto: Produto) {
    setCarrinho((prev) => {
      const existe = prev.find((item) => item.id === produto.id);

      if (existe) {
        return prev.map((item) =>
          item.id === produto.id ? { ...item, qtd: item.qtd + 1 } : item
        );
      }

      return [...prev, { ...produto, qtd: 1 }];
    });

    setErros((prev) => ({ ...prev, carrinho: false }));
  }

  function diminuir(id: number) {
    setCarrinho((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qtd: item.qtd - 1 } : item
        )
        .filter((item) => item.qtd > 0)
    );
  }

  function aumentar(id: number) {
    setCarrinho((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qtd: item.qtd + 1 } : item
      )
    );
  }

  function removerDoCarrinho(id: number) {
    setCarrinho((prev) => prev.filter((item) => item.id !== id));
  }

  function focarPrimeiroErro(novosErros: CampoErros) {
    if (novosErros.nome) {
      nomeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      nomeRef.current?.focus();
      return;
    }

    if (novosErros.telefone) {
      telefoneRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      telefoneRef.current?.focus();
      return;
    }

    if (novosErros.endereco) {
      enderecoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      enderecoRef.current?.focus();
      return;
    }

    if (novosErros.mesa) {
      mesaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      mesaRef.current?.focus();
      return;
    }

    if (novosErros.pagamento) {
      pagamentoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      pagamentoRef.current?.focus();
      return;
    }

    if (novosErros.trocoPara) {
      trocoParaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      trocoParaRef.current?.focus();
      return;
    }

    if (novosErros.carrinho) {
      cardapioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function validarFormulario() {
    const novosErros: CampoErros = {};

    if (!nome.trim()) novosErros.nome = true;
    if (!telefone.trim()) novosErros.telefone = true;
    if (!pagamento.trim()) novosErros.pagamento = true;
    if (tipoEntrega === "delivery" && !endereco.trim()) novosErros.endereco = true;
    if (tipoEntrega === "mesa" && !mesa.trim()) novosErros.mesa = true;
    if (pagamento === "Dinheiro" && precisaTroco && !trocoPara.trim()) {
      novosErros.trocoPara = true;
    }
    if (carrinho.length === 0) novosErros.carrinho = true;

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      focarPrimeiroErro(novosErros);
      return false;
    }

    return true;
  }

  function montarMensagemWhatsApp(idPedido: number) {
    const itensTexto = carrinho
      .map(
        (item) =>
          `- ${item.qtd}x ${item.nome} (${dinheiro(item.preco * item.qtd)})`
      )
      .join("\n");

    const detalhePagamento =
      pagamento === "Dinheiro" && precisaTroco
        ? `${pagamento} | Troco para ${trocoPara}`
        : pagamento;

    const entregaTexto =
      tipoEntrega === "delivery"
        ? endereco
        : tipoEntrega === "mesa"
        ? `Mesa ${mesa}`
        : "Retirada no local";

    return `🔥 *Novo pedido - Espetinho do Thalisca*

*Pedido:* #${idPedido}
*Cliente:* ${nome}
*Telefone:* ${telefone}
*Entrega:* ${tipoEntrega}
*Local:* ${entregaTexto}
*Pagamento:* ${detalhePagamento}
*Observação:* ${observacao || "sem observação"}

*Itens:*
${itensTexto}

*Total:* ${dinheiro(total)}`;
  }

  async function enviarPedido() {
    if (!validarFormulario()) return;

    setEnviando(true);

    const enderecoFinal =
      tipoEntrega === "delivery"
        ? endereco
        : tipoEntrega === "mesa"
        ? `Mesa ${mesa}`
        : "retirada no local";

    const observacaoFinal =
      pagamento === "Dinheiro" && precisaTroco
        ? observacao
          ? `${observacao} | Troco para ${trocoPara}`
          : `Troco para ${trocoPara}`
        : observacao || "";

    const { data, error } = await supabase
      .from("pedidos")
      .insert([
        {
          nome,
          telefone,
          tipo_entrega: tipoEntrega,
          endereco: enderecoFinal,
          pagamento,
          observacao: observacaoFinal,
          itens: carrinho,
          total,
          status: "novo",
        },
      ])
      .select()
      .single();

    setEnviando(false);

    if (error || !data) {
      alert("Erro ao enviar pedido.");
      return;
    }

    const mensagem = montarMensagemWhatsApp(data.id);
    const numero = "5568992252648";
    const linkWhatsapp = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

    window.open(linkWhatsapp, "_blank");

    setNome("");
    setTelefone("");
    setTipoEntrega("delivery");
    setEndereco("");
    setMesa("");
    setPagamento("Pix");
    setPrecisaTroco(false);
    setTrocoPara("");
    setObservacao("");
    setCarrinho([]);
    setErros({});
    setMostrarCarrinho(false);

    router.push(`/acompanhar/${data.id}`);
  }

  return (
    <main className="pagina">
      <div className="container">
        <div className="topo-card">
          <div className="topo-flex">
            <div>
              <h1 className="titulo-principal">🔥 Espetinho do Thalisca</h1>
              <p className="subtitulo">"Fala comigo, fala com nós!"</p>

              <div className="info-grid">
                <div>📞 (68) 99225-2648</div>
                <div>📍 Av. Diamantino Augusto de Macedo, 866 - Olaria</div>
              </div>

              <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a
                  href="https://wa.me/5568992252648?text=Ol%C3%A1%2C%20gostaria%20de%20fazer%20um%20pedido."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="principal-btn"
                  style={{ display: "inline-block", width: "auto", textDecoration: "none" }}
                >
                  🔥 Pedir pelo WhatsApp
                </a>

                <Link href="/painel" className="aba" style={{ textDecoration: "none" }}>
                  Painel do atendente
                </Link>
              </div>
            </div>

            <button
              onClick={() => setMostrarCarrinho(true)}
              className="principal-btn"
              style={{ width: "auto", minWidth: 120 }}
              type="button"
            >
              🛒 {carrinho.reduce((soma, item) => soma + item.qtd, 0)}
            </button>
          </div>
        </div>

        <div className="layout-cliente">
          <div className="coluna-principal">
            <section className="card">
              <h2 style={{ fontSize: "2rem", marginBottom: 18 }}>Novo pedido</h2>

              <div className="grid-2">
                <input
                  ref={nomeRef}
                  className="campo"
                  style={campoStyle(erros.nome)}
                  placeholder="Nome do cliente"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value);
                    if (e.target.value.trim()) {
                      setErros((prev) => ({ ...prev, nome: false }));
                    }
                  }}
                />

                <input
                  ref={telefoneRef}
                  className="campo"
                  style={campoStyle(erros.telefone)}
                  placeholder="Telefone"
                  value={telefone}
                  onChange={(e) => {
                    setTelefone(e.target.value);
                    if (e.target.value.trim()) {
                      setErros((prev) => ({ ...prev, telefone: false }));
                    }
                  }}
                />
              </div>

              <div className="tipo-entrega">
                <button
                  type="button"
                  onClick={() => setTipoEntrega("delivery")}
                  className={tipoEntrega === "delivery" ? "aba ativa pequena" : "aba pequena"}
                >
                  Delivery
                </button>

                <button
                  type="button"
                  onClick={() => setTipoEntrega("retirada")}
                  className={tipoEntrega === "retirada" ? "aba ativa pequena" : "aba pequena"}
                >
                  Retirada
                </button>

                <button
                  type="button"
                  onClick={() => setTipoEntrega("mesa")}
                  className={tipoEntrega === "mesa" ? "aba ativa pequena" : "aba pequena"}
                >
                  Mesa
                </button>
              </div>

              {tipoEntrega === "delivery" ? (
                <input
                  ref={enderecoRef}
                  className="campo margem-top"
                  style={campoStyle(erros.endereco)}
                  placeholder="Endereço"
                  value={endereco}
                  onChange={(e) => {
                    setEndereco(e.target.value);
                    if (e.target.value.trim()) {
                      setErros((prev) => ({ ...prev, endereco: false }));
                    }
                  }}
                />
              ) : null}

              {tipoEntrega === "mesa" ? (
                <input
                  ref={mesaRef}
                  className="campo margem-top"
                  style={campoStyle(erros.mesa)}
                  placeholder="Número da mesa"
                  value={mesa}
                  onChange={(e) => {
                    setMesa(e.target.value);
                    if (e.target.value.trim()) {
                      setErros((prev) => ({ ...prev, mesa: false }));
                    }
                  }}
                />
              ) : null}

              <div className="grid-2 margem-top">
                <select
                  ref={pagamentoRef}
                  className="campo"
                  style={campoStyle(erros.pagamento)}
                  value={pagamento}
                  onChange={(e) => {
                    setPagamento(e.target.value);
                    if (e.target.value !== "Dinheiro") {
                      setPrecisaTroco(false);
                      setTrocoPara("");
                    }
                  }}
                >
                  <option>Pix</option>
                  <option>Dinheiro</option>
                  <option>Cartão</option>
                </select>

                <textarea
                  className="campo"
                  placeholder='Observação. Exemplo: sem arroz, sem cebola...'
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  rows={3}
                />
              </div>

              {pagamento === "Dinheiro" ? (
                <div style={{ marginTop: 14 }}>
                  <div style={{ marginBottom: 10, fontWeight: 700 }}>Precisa de troco?</div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => setPrecisaTroco(true)}
                      className={precisaTroco ? "aba ativa pequena" : "aba pequena"}
                    >
                      Sim
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPrecisaTroco(false);
                        setTrocoPara("");
                      }}
                      className={!precisaTroco ? "aba ativa pequena" : "aba pequena"}
                    >
                      Não
                    </button>
                  </div>

                  {precisaTroco ? (
                    <input
                      ref={trocoParaRef}
                      className="campo margem-top"
                      style={campoStyle(erros.trocoPara)}
                      placeholder="Troco para quanto?"
                      value={trocoPara}
                      onChange={(e) => {
                        setTrocoPara(e.target.value);
                        if (e.target.value.trim()) {
                          setErros((prev) => ({ ...prev, trocoPara: false }));
                        }
                      }}
                    />
                  ) : null}
                </div>
              ) : null}
            </section>

            <section ref={cardapioRef} className="card">
              <h2 style={{ fontSize: "2rem", marginBottom: 18 }}>Cardápio</h2>

              {erros.carrinho ? (
                <div style={{ marginBottom: 14, color: "#ff6b6b", fontWeight: 700 }}>
                  Adiciona pelo menos 1 item no pedido.
                </div>
              ) : null}

              <CategoriaBloco
                titulo="Espetinho avulso tradicional"
                produtos={PRODUTOS.filter((p) => p.categoria === "Espetinho avulso tradicional")}
                onAdd={adicionar}
                aberta={categoriaAberta === "Espetinho avulso tradicional"}
                onToggle={() =>
                  setCategoriaAberta(
                    categoriaAberta === "Espetinho avulso tradicional"
                      ? null
                      : "Espetinho avulso tradicional"
                  )
                }
              />

              <CategoriaBloco
                titulo="Espetinho avulso Premium"
                produtos={PRODUTOS.filter((p) => p.categoria === "Espetinho avulso Premium")}
                onAdd={adicionar}
                aberta={categoriaAberta === "Espetinho avulso Premium"}
                onToggle={() =>
                  setCategoriaAberta(
                    categoriaAberta === "Espetinho avulso Premium"
                      ? null
                      : "Espetinho avulso Premium"
                  )
                }
              />

              <CategoriaBloco
                titulo="Acompanhamento + espetinho tradicional"
                produtos={PRODUTOS.filter(
                  (p) => p.categoria === "Acompanhamento + espetinho tradicional"
                )}
                onAdd={adicionar}
                aberta={categoriaAberta === "Acompanhamento + espetinho tradicional"}
                onToggle={() =>
                  setCategoriaAberta(
                    categoriaAberta === "Acompanhamento + espetinho tradicional"
                      ? null
                      : "Acompanhamento + espetinho tradicional"
                  )
                }
              />

              <CategoriaBloco
                titulo="Acompanhamento + espetinho Premium"
                produtos={PRODUTOS.filter(
                  (p) => p.categoria === "Acompanhamento + espetinho Premium"
                )}
                onAdd={adicionar}
                aberta={categoriaAberta === "Acompanhamento + espetinho Premium"}
                onToggle={() =>
                  setCategoriaAberta(
                    categoriaAberta === "Acompanhamento + espetinho Premium"
                      ? null
                      : "Acompanhamento + espetinho Premium"
                  )
                }
              />

              <CategoriaBloco
                titulo="Sucos"
                produtos={PRODUTOS.filter((p) => p.categoria === "Sucos")}
                onAdd={adicionar}
                aberta={categoriaAberta === "Sucos"}
                onToggle={() =>
                  setCategoriaAberta(categoriaAberta === "Sucos" ? null : "Sucos")
                }
              />

              <CategoriaBloco
                titulo="Geladinho"
                produtos={PRODUTOS.filter((p) => p.categoria === "Geladinho")}
                onAdd={adicionar}
                aberta={categoriaAberta === "Geladinho"}
                onToggle={() =>
                  setCategoriaAberta(categoriaAberta === "Geladinho" ? null : "Geladinho")
                }
              />
            </section>
          </div>
        </div>
      </div>

      {mostrarCarrinho ? (
        <div className="overlay" onClick={() => setMostrarCarrinho(false)}>
          <div className="carrinho-modal" onClick={(e) => e.stopPropagation()}>
            <div className="carrinho-topo">
              <h2 style={{ fontSize: "2rem", margin: 0 }}>Carrinho</h2>
              <button onClick={() => setMostrarCarrinho(false)} className="aba" type="button">
                Fechar
              </button>
            </div>

            {carrinho.length === 0 ? (
              <p className="muted">Nenhum item adicionado.</p>
            ) : (
              <div className="itens-carrinho">
                {carrinho.map((item) => (
                  <div key={item.id} className="item-card">
                    <div className="item-topo">
                      <div>
                        <div className="item-nome">{item.nome}</div>
                        <div className="item-info">{dinheiro(item.preco)} cada</div>
                      </div>
                      <div className="item-total">{dinheiro(item.preco * item.qtd)}</div>
                    </div>

                    <div className="item-acoes">
                      <button onClick={() => diminuir(item.id)} className="mini-btn" type="button">
                        -
                      </button>
                      <span>{item.qtd}</span>
                      <button onClick={() => aumentar(item.id)} className="mini-btn" type="button">
                        +
                      </button>
                      <button onClick={() => removerDoCarrinho(item.id)} className="danger-btn" type="button">
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="total-box" style={{ marginTop: 20 }}>
              <div className="total-texto">Total: {dinheiro(total)}</div>
              <div className="muted pequeno">Sem taxa de entrega</div>
            </div>

            <button
              onClick={enviarPedido}
              className="principal-btn"
              disabled={enviando}
              style={{ marginTop: 16 }}
              type="button"
            >
              {enviando ? "Enviando..." : "Enviar pedido"}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
