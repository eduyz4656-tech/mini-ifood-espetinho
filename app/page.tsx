"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

type Produto = {
  id: number;
  nome: string;
  preco: number;
  categoria: string;
};

type ItemCarrinho = Produto & {
  qtd: number;
};

type Pedido = {
  id: number;
  nome: string;
  telefone: string;
  tipo_entrega: string;
  endereco: string;
  pagamento: string;
  observacao: string;
  itens: ItemCarrinho[];
  total: number;
  status: string;
};

const PRODUTOS: Produto[] = [
  { id: 1, nome: "Carne", preco: 8, categoria: "Espetinho avulso tradicional" },
  { id: 2, nome: "Misto Tradicional", preco: 8, categoria: "Espetinho avulso tradicional" },

  { id: 3, nome: "Tulipa", preco: 12, categoria: "Espetinho avulso Premium" },
  { id: 4, nome: "Medalhão de Frango", preco: 12, categoria: "Espetinho avulso Premium" },
  { id: 5, nome: "Medalhão de Carne", preco: 12, categoria: "Espetinho avulso Premium" },
  { id: 6, nome: "Kafta", preco: 12, categoria: "Espetinho avulso Premium" },

  {
    id: 7,
    nome: "Simples - Farofa e Macaxeira",
    preco: 10,
    categoria: "Acompanhamento + espetinho tradicional",
  },
  {
    id: 8,
    nome: "Especial - Macaxeira e Vinagrete",
    preco: 15,
    categoria: "Acompanhamento + espetinho tradicional",
  },
  {
    id: 9,
    nome: "Completo - Arroz, Vinagrete, Farofa, Macaxeira e Banana Frita",
    preco: 20,
    categoria: "Acompanhamento + espetinho tradicional",
  },

  {
    id: 10,
    nome: "Simples Premium - Farofa e Macaxeira",
    preco: 14,
    categoria: "Acompanhamento + espetinho Premium",
  },
  {
    id: 11,
    nome: "Especial Premium - Macaxeira e Vinagrete",
    preco: 18,
    categoria: "Acompanhamento + espetinho Premium",
  },
  {
    id: 12,
    nome: "Completo Premium - Arroz, Vinagrete, Farofa, Macaxeira e Banana Frita",
    preco: 23,
    categoria: "Acompanhamento + espetinho Premium",
  },

  { id: 13, nome: "Maracujá 350ml", preco: 10, categoria: "Sucos" },
  { id: 14, nome: "Acerola 350ml", preco: 8, categoria: "Sucos" },
  { id: 15, nome: "Cupuaçu 350ml", preco: 8, categoria: "Sucos" },
  { id: 16, nome: "Abacaxi c/ Hortelã 350ml", preco: 8, categoria: "Sucos" },

  { id: 17, nome: "Ninho com Nutella", preco: 10, categoria: "Geladinho" },
  { id: 18, nome: "Maracujá com Chocolate", preco: 10, categoria: "Geladinho" },
  { id: 19, nome: "Pudim", preco: 10, categoria: "Geladinho" },
  { id: 20, nome: "Oreo", preco: 10, categoria: "Geladinho" },
  { id: 21, nome: "Ovomaltine", preco: 10, categoria: "Geladinho" },
  { id: 22, nome: "Paçoca", preco: 10, categoria: "Geladinho" },
];

function dinheiro(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function CategoriaBloco({
  titulo,
  produtos,
  onAdd,
}: {
  titulo: string;
  produtos: Produto[];
  onAdd: (produto: Produto) => void;
}) {
  if (produtos.length === 0) return null;

  return (
    <div>
      <h3 className="categoria-titulo">{titulo}</h3>
      <div className="produtos-grid">
        {produtos.map((produto) => (
          <button
            key={produto.id}
            onClick={() => onAdd(produto)}
            className="produto-card"
          >
            <div className="produto-nome">{produto.nome}</div>
            <div className="produto-preco">{dinheiro(produto.preco)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function AdminColuna({
  titulo,
  quantidade,
  children,
}: {
  titulo: string;
  quantidade: number;
  children: React.ReactNode;
}) {
  return (
    <div className="card admin-coluna">
      <div className="admin-topo">
        <h2>{titulo}</h2>
        <span className="badge">{quantidade}</span>
      </div>
      {children}
    </div>
  );
}

function PedidoCard({
  pedido,
  botaoTexto,
  onClick,
  onDelete,
}: {
  pedido: Pedido;
  botaoTexto?: string;
  onClick?: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="pedido-card">
      <div className="pedido-topo">
        <div>
          <div className="pedido-nome">{pedido.nome}</div>
          <div className="pedido-info">{pedido.telefone}</div>
        </div>
        <span className="badge pequeno-badge">{pedido.tipo_entrega}</span>
      </div>

      <div className="pedido-info margem-top">{pedido.endereco}</div>
      <div className="pedido-info margem-top">Pagamento: {pedido.pagamento}</div>

      {pedido.observacao ? (
        <div className="pedido-obs">Obs: {pedido.observacao}</div>
      ) : null}

      <div className="pedido-itens">
        {pedido.itens?.map((item, i) => (
          <div key={i}>
            {item.qtd}x {item.nome} - {dinheiro(item.preco * item.qtd)}
          </div>
        ))}
      </div>

      <div className="pedido-total">Total: {dinheiro(Number(pedido.total))}</div>

      <div className="pedido-botoes">
        {botaoTexto ? (
          <button onClick={onClick} className="principal-btn pequeno-btn">
            {botaoTexto}
          </button>
        ) : null}

        <button onClick={onDelete} className="danger-btn pequeno-btn">
          Excluir
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const [aba, setAba] = useState<"cliente" | "atendente">("cliente");

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState("delivery");
  const [endereco, setEndereco] = useState("");
  const [pagamento, setPagamento] = useState("Pix");
  const [observacao, setObservacao] = useState("");

  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [pedidoParaExcluir, setPedidoParaExcluir] = useState<number | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const [linkWhatsapp, setLinkWhatsapp] = useState("");

  const total = useMemo(() => {
    return carrinho.reduce((soma, item) => soma + item.preco * item.qtd, 0);
  }, [carrinho]);

  const linkWhatsappDireto = `https://wa.me/5568992252648?text=${encodeURIComponent(
    "Olá! Gostaria de fazer um pedido. Pode me enviar o cardápio, por favor?"
  )}`;

  useEffect(() => {
    carregarPedidos();

    const channel = supabase
      .channel("pedidos-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        () => {
          carregarPedidos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function carregarPedidos() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.log("ERRO CARREGAR:", error);
      alert("Erro ao carregar pedidos do banco: " + error.message);
      setCarregando(false);
      return;
    }

    setPedidos((data as Pedido[]) || []);
    setCarregando(false);
  }

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

  function montarMensagemWhatsApp() {
    const itensTexto = carrinho
      .map(
        (item) =>
          `- ${item.qtd}x ${item.nome} (${dinheiro(item.preco * item.qtd)})`
      )
      .join("\n");

    return `🔥 *Novo pedido - Espetinho do Thalisca*

*Cliente:* ${nome}
*Telefone:* ${telefone}
*Entrega:* ${tipoEntrega}
*Endereço:* ${endereco || "não informado"}
*Pagamento:* ${pagamento}
*Observação:* ${observacao || "sem observação"}

*Itens:*
${itensTexto}

*Total:* ${dinheiro(total)}`;
  }

  async function enviarPedido() {
    if (!nome.trim() || !telefone.trim() || carrinho.length === 0) {
      alert("Preenche nome, telefone e coloca item no carrinho.");
      return;
    }

    setEnviando(true);

    const { error } = await supabase.from("pedidos").insert([
      {
        nome,
        telefone,
        tipo_entrega: tipoEntrega,
        endereco: endereco || "não informado",
        pagamento,
        observacao: observacao || "",
        itens: carrinho,
        total,
        status: "novo",
      },
    ]);

    setEnviando(false);

    if (error) {
      console.log("ERRO ENVIAR:", error);
      alert("Erro ao enviar pedido: " + error.message);
      return;
    }

    const mensagem = montarMensagemWhatsApp();
    const numero = "5568992252648";
    const link = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

    setLinkWhatsapp(link);

    alert("Pedido enviado com sucesso!");

    setNome("");
    setTelefone("");
    setTipoEntrega("delivery");
    setEndereco("");
    setPagamento("Pix");
    setObservacao("");
    setCarrinho([]);
    setAba("atendente");
    carregarPedidos();
  }

  async function atualizarStatus(id: number, status: string) {
    const { error } = await supabase
      .from("pedidos")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.log("ERRO UPDATE:", error);
      alert("Erro ao atualizar status: " + error.message);
      return;
    }

    carregarPedidos();
  }

  function pedirExclusao(id: number) {
    setPedidoParaExcluir(id);
  }

  function cancelarExclusao() {
    setPedidoParaExcluir(null);
  }

  async function confirmarExclusao() {
    if (pedidoParaExcluir === null) return;

    setExcluindo(true);

    const { error } = await supabase
      .from("pedidos")
      .delete()
      .eq("id", pedidoParaExcluir);

    setExcluindo(false);

    if (error) {
      console.log("ERRO DELETE:", error);
      alert("Erro ao excluir pedido: " + error.message);
      return;
    }

    setPedidoParaExcluir(null);
    carregarPedidos();
  }

  const novos = pedidos.filter((p) => p.status === "novo");
  const preparo = pedidos.filter((p) => p.status === "preparo");
  const concluidos = pedidos.filter((p) => p.status === "entregue");

  const faturamento = concluidos.reduce(
    (soma, pedido) => soma + Number(pedido.total),
    0
  );

  return (
    <main className="pagina">
      <div className="container">
        <div className="topo-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 className="titulo-principal">🔥 Espetinho do Thalisca</h1>
              <p className="subtitulo">"Fala comigo, fala com nós!"</p>
            </div>

            <div
              style={{
                minWidth: 220,
                background: "#111",
                border: "1px solid #333",
                borderRadius: 18,
                padding: 14,
              }}
            >
              <div className="muted pequeno">Faturamento finalizado</div>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "#ffcc73",
                  marginTop: 6,
                }}
              >
                {dinheiro(faturamento)}
              </div>
            </div>
          </div>

          <div className="info-grid">
            <div>📞 (68) 99225-2648</div>
            <div>📍 Av. Diamantino Augusto de Macedo, 866 - Olaria</div>
          </div>

          <div style={{ marginTop: 18 }}>
            <a
              href={linkWhatsappDireto}
              target="_blank"
              rel="noopener noreferrer"
              className="principal-btn"
              style={{
                display: "inline-block",
                width: "auto",
                textDecoration: "none",
              }}
            >
              🔥 Pedir pelo WhatsApp
            </a>
          </div>
        </div>

        {linkWhatsapp ? (
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginTop: 0 }}>Pedido enviado</h3>
            <p className="muted">
              Agora toca no botão abaixo para abrir a mensagem no WhatsApp.
            </p>
            <a
              href={linkWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="principal-btn"
              style={{
                display: "inline-block",
                width: "auto",
                textDecoration: "none",
              }}
            >
              Abrir WhatsApp
            </a>
          </div>
        ) : null}

        <div className="abas">
          <button
            onClick={() => setAba("cliente")}
            className={aba === "cliente" ? "aba ativa" : "aba"}
          >
            App do cliente
          </button>

          <button
            onClick={() => setAba("atendente")}
            className={aba === "atendente" ? "aba ativa" : "aba"}
          >
            Painel do atendente
          </button>
        </div>

        {aba === "cliente" ? (
          <div className="layout-cliente">
            <div className="coluna-principal">
              <section className="card">
                <h2 style={{ fontSize: "2rem", marginBottom: 18 }}>Novo pedido</h2>

                <div className="grid-2">
                  <input
                    className="campo"
                    placeholder="Nome do cliente"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />

                  <input
                    className="campo"
                    placeholder="Telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>

                <div className="tipo-entrega">
                  <button
                    onClick={() => setTipoEntrega("delivery")}
                    className={tipoEntrega === "delivery" ? "aba ativa pequena" : "aba pequena"}
                  >
                    Delivery
                  </button>

                  <button
                    onClick={() => setTipoEntrega("retirada")}
                    className={tipoEntrega === "retirada" ? "aba ativa pequena" : "aba pequena"}
                  >
                    Retirada
                  </button>
                </div>

                <input
                  className="campo margem-top"
                  placeholder="Endereço"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                />

                <div className="grid-2 margem-top">
                  <select
                    className="campo"
                    value={pagamento}
                    onChange={(e) => setPagamento(e.target.value)}
                  >
                    <option>Pix</option>
                    <option>Dinheiro</option>
                    <option>Cartão</option>
                  </select>

                  <textarea
                    className="campo"
                    placeholder="Observação"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    rows={3}
                  />
                </div>
              </section>

              <section className="card">
                <h2 style={{ fontSize: "2rem", marginBottom: 18 }}>Cardápio</h2>

                <div className="categorias">
                  <CategoriaBloco
                    titulo="Espetinho avulso tradicional"
                    produtos={PRODUTOS.filter(
                      (p) => p.categoria === "Espetinho avulso tradicional"
                    )}
                    onAdd={adicionar}
                  />

                  <CategoriaBloco
                    titulo="Espetinho avulso Premium"
                    produtos={PRODUTOS.filter(
                      (p) => p.categoria === "Espetinho avulso Premium"
                    )}
                    onAdd={adicionar}
                  />

                  <CategoriaBloco
                    titulo="Acompanhamento + espetinho tradicional"
                    produtos={PRODUTOS.filter(
                      (p) => p.categoria === "Acompanhamento + espetinho tradicional"
                    )}
                    onAdd={adicionar}
                  />

                  <CategoriaBloco
                    titulo="Acompanhamento + espetinho Premium"
                    produtos={PRODUTOS.filter(
                      (p) => p.categoria === "Acompanhamento + espetinho Premium"
                    )}
                    onAdd={adicionar}
                  />

                  <CategoriaBloco
                    titulo="Sucos"
                    produtos={PRODUTOS.filter((p) => p.categoria === "Sucos")}
                    onAdd={adicionar}
                  />

                  <CategoriaBloco
                    titulo="Geladinho"
                    produtos={PRODUTOS.filter((p) => p.categoria === "Geladinho")}
                    onAdd={adicionar}
                  />
                </div>
              </section>
            </div>

            <aside className="card carrinho-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  marginBottom: 16,
                  flexWrap: "wrap",
                }}
              >
                <h2 style={{ fontSize: "2rem", margin: 0 }}>Carrinho</h2>
                <span className="badge">{carrinho.length} itens</span>
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
                        <button onClick={() => diminuir(item.id)} className="mini-btn">
                          -
                        </button>
                        <span>{item.qtd}</span>
                        <button onClick={() => aumentar(item.id)} className="mini-btn">
                          +
                        </button>
                        <button onClick={() => removerDoCarrinho(item.id)} className="danger-btn">
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="total-box">
                <div className="total-texto">Total: {dinheiro(total)}</div>
                <div className="muted pequeno">Sem taxa de entrega</div>
              </div>

              <button onClick={enviarPedido} className="principal-btn" disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar pedido"}
              </button>
            </aside>
          </div>
        ) : (
          <div className="layout-admin">
            <AdminColuna titulo="Novos" quantidade={novos.length}>
              {carregando ? (
                <p className="muted">Carregando...</p>
              ) : novos.length === 0 ? (
                <p className="muted">Nenhum pedido</p>
              ) : (
                novos.map((pedido) => (
                  <PedidoCard
                    key={pedido.id}
                    pedido={pedido}
                    botaoTexto="Aceitar pedido"
                    onClick={() => atualizarStatus(pedido.id, "preparo")}
                    onDelete={() => pedirExclusao(pedido.id)}
                  />
                ))
              )}
            </AdminColuna>

            <AdminColuna titulo="Em preparo" quantidade={preparo.length}>
              {preparo.length === 0 ? (
                <p className="muted">Nenhum pedido</p>
              ) : (
                preparo.map((pedido) => (
                  <PedidoCard
                    key={pedido.id}
                    pedido={pedido}
                    botaoTexto="Marcar como entregue"
                    onClick={() => atualizarStatus(pedido.id, "entregue")}
                    onDelete={() => pedirExclusao(pedido.id)}
                  />
                ))
              )}
            </AdminColuna>

            <AdminColuna titulo="Entregues" quantidade={concluidos.length}>
              {concluidos.length === 0 ? (
                <p className="muted">Nenhum concluído</p>
              ) : (
                concluidos.map((pedido) => (
                  <PedidoCard
                    key={pedido.id}
                    pedido={pedido}
                    onDelete={() => pedirExclusao(pedido.id)}
                  />
                ))
              )}
            </AdminColuna>

            <AdminColuna titulo="Resumo" quantidade={pedidos.length}>
              <div className="resumo-box">
                <div>Total de pedidos: {pedidos.length}</div>
                <div>Concluídos: {concluidos.length}</div>
                <div className="faturamento">Faturamento: {dinheiro(faturamento)}</div>
              </div>
            </AdminColuna>
          </div>
        )}
      </div>

      {pedidoParaExcluir !== null ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              background: "#151515",
              border: "1px solid #333",
              borderRadius: 24,
              padding: 22,
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 10 }}>Excluir pedido?</h3>
            <p style={{ color: "#cfcfcf", marginBottom: 20 }}>
              Essa ação vai remover o pedido do painel.
            </p>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={cancelarExclusao}
                className="aba"
                style={{ minWidth: 120 }}
                disabled={excluindo}
              >
                Cancelar
              </button>

              <button
                onClick={confirmarExclusao}
                className="danger-btn"
                style={{ minWidth: 120 }}
                disabled={excluindo}
              >
                {excluindo ? "Excluindo..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
