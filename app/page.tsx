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
        boxShadow: "0 0 0 2px rgba(255, 77, 79, 0.12)",
      }
    : {};
}

function CategoriaBloco({
  titulo,
  produtos,
  aberta,
  onToggle,
  onAdd,
}: {
  titulo: string;
  produtos: Produto[];
  aberta: boolean;
  onToggle: () => void;
  onAdd: (produto: Produto) => void;
}) {
  if (!produtos.length) return null;

  return (
    <div className="categoria-wrap">
      <button type="button" className="categoria-botao" onClick={onToggle}>
        <span>{titulo}</span>
        <span>{aberta ? "▲" : "▼"}</span>
      </button>

      {aberta && (
        <div className="produtos-grid">
          {produtos.map((produto) => (
            <button
              type="button"
              key={produto.id}
              className="produto-card"
              onClick={() => onAdd(produto)}
            >
              <div className="produto-nome">{produto.nome}</div>
              <div className="produto-preco">{dinheiro(produto.preco)}</div>
            </button>
          ))}
        </div>
      )}
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
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [categoriaAberta, setCategoriaAberta] = useState<string | null>("Espetinho avulso tradicional");
  const [erros, setErros] = useState<CampoErros>({});

  const nomeRef = useRef<HTMLInputElement | null>(null);
  const telefoneRef = useRef<HTMLInputElement | null>(null);
  const enderecoRef = useRef<HTMLInputElement | null>(null);
  const mesaRef = useRef<HTMLInputElement | null>(null);
  const pagamentoRef = useRef<HTMLSelectElement | null>(null);
  const trocoRef = useRef<HTMLInputElement | null>(null);
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

  function aumentar(id: number) {
    setCarrinho((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qtd: item.qtd + 1 } : item
      )
    );
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

  function removerDoCarrinho(id: number) {
    setCarrinho((prev) => prev.filter((item) => item.id !== id));
  }

  function irAoPrimeiroErro(novosErros: CampoErros) {
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
      trocoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      trocoRef.current?.focus();
      return;
    }

    if (novosErros.carrinho) {
      cardapioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function validar() {
    const novosErros: CampoErros = {};

    if (!nome.trim()) novosErros.nome = true;
    if (!telefone.trim()) novosErros.telefone = true;
    if (!pagamento.trim()) novosErros.pagamento = true;
    if (tipoEntrega === "delivery" && !endereco.trim()) novosErros.endereco = true;
    if (tipoEntrega === "mesa" && !mesa.trim()) novosErros.mesa = true;
    if (pagamento === "Dinheiro" && precisaTroco && !trocoPara.trim()) novosErros.trocoPara = true;
    if (carrinho.length === 0) novosErros.carrinho = true;

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      irAoPrimeiroErro(novosErros);
      return false;
    }

    return true;
  }

  async function enviarPedido() {
    if (!validar()) return;

    setEnviando(true);

    const enderecoFinal =
      tipoEntrega === "delivery"
        ? endereco
        : tipoEntrega === "mesa"
        ? `Mesa ${mesa}`
        : "Retirada no local";

    const observacaoFinal =
      pagamento === "Dinheiro" && precisaTroco
        ? observacao.trim()
          ? `${observacao.trim()} | Troco para ${trocoPara}`
          : `Troco para ${trocoPara}`
        : observacao.trim();

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

              <div className="topo-botoes">
                <Link href="/painel" className="aba">
                  Painel do atendente
                </Link>
              </div>
            </div>

            <button
              type="button"
              className="principal-btn carrinho-topo-btn"
              onClick={() => setMostrarCarrinho(true)}
            >
              🛒 {carrinho.reduce((soma, item) => soma + item.qtd, 0)}
            </button>
          </div>
        </div>

        <div className="layout-cliente">
          <div className="coluna-principal">
            <section className="card">
              <h2 className="secao-titulo">Novo pedido</h2>

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
                  className={tipoEntrega === "delivery" ? "aba ativa pequena" : "aba pequena"}
                  onClick={() => setTipoEntrega("delivery")}
                >
                  Delivery
                </button>

                <button
                  type="button"
                  className={tipoEntrega === "retirada" ? "aba ativa pequena" : "aba pequena"}
                  onClick={() => setTipoEntrega("retirada")}
                >
                  Retirada
                </button>

                <button
                  type="button"
                  className={tipoEntrega === "mesa" ? "aba ativa pequena" : "aba pequena"}
                  onClick={() => setTipoEntrega("mesa")}
                >
                  Mesa
                </button>
              </div>

              {tipoEntrega === "delivery" && (
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
              )}

              {tipoEntrega === "mesa" && (
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
              )}

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
                  placeholder="Observação: exemplo, sem arroz, sem cebola..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  rows={3}
                />
              </div>

              {pagamento === "Dinheiro" && (
                <div className="margem-top">
                  <div className="troco-label">Precisa de troco?</div>

                  <div className="tipo-entrega">
                    <button
                      type="button"
                      className={precisaTroco ? "aba ativa pequena" : "aba pequena"}
                      onClick={() => setPrecisaTroco(true)}
                    >
                      Sim
                    </button>

                    <button
                      type="button"
                      className={!precisaTroco ? "aba ativa pequena" : "aba pequena"}
                      onClick={() => {
                        setPrecisaTroco(false);
                        setTrocoPara("");
                      }}
                    >
                      Não
                    </button>
                  </div>

                  {precisaTroco && (
                    <input
                      ref={trocoRef}
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
                  )}
                </div>
              )}
            </section>

            <section ref={cardapioRef} className="card">
              <h2 className="secao-titulo">Cardápio</h2>

              {erros.carrinho && (
                <div className="erro-texto">Adiciona pelo menos 1 item no pedido.</div>
              )}

              <CategoriaBloco
                titulo="Espetinho avulso tradicional"
                produtos={PRODUTOS.filter((p) => p.categoria === "Espetinho avulso tradicional")}
                aberta={categoriaAberta === "Espetinho avulso tradicional"}
                onToggle={() =>
                  setCategoriaAberta((prev) =>
                    prev === "Espetinho avulso tradicional" ? null : "Espetinho avulso tradicional"
                  )
                }
                onAdd={adicionar}
              />

              <CategoriaBloco
                titulo="Espetinho avulso premium"
                produtos={PRODUTOS.filter((p) => p.categoria === "Espetinho avulso premium")}
                aberta={categoriaAberta === "Espetinho avulso premium"}
                onToggle={() =>
                  setCategoriaAberta((prev) =>
                    prev === "Espetinho avulso premium" ? null : "Espetinho avulso premium"
                  )
                }
                onAdd={adicionar}
              />

              <CategoriaBloco
                titulo="Acompanhamento + tradicional"
                produtos={PRODUTOS.filter((p) => p.categoria === "Acompanhamento + tradicional")}
                aberta={categoriaAberta === "Acompanhamento + tradicional"}
                onToggle={() =>
                  setCategoriaAberta((prev) =>
                    prev === "Acompanhamento + tradicional" ? null : "Acompanhamento + tradicional"
                  )
                }
                onAdd={adicionar}
              />

              <CategoriaBloco
                titulo="Acompanhamento + premium"
                produtos={PRODUTOS.filter((p) => p.categoria === "Acompanhamento + premium")}
                aberta={categoriaAberta === "Acompanhamento + premium"}
                onToggle={() =>
                  setCategoriaAberta((prev) =>
                    prev === "Acompanhamento + premium" ? null : "Acompanhamento + premium"
                  )
                }
                onAdd={adicionar}
              />

              <CategoriaBloco
                titulo="Sucos"
                produtos={PRODUTOS.filter((p) => p.categoria === "Sucos")}
                aberta={categoriaAberta === "Sucos"}
                onToggle={() =>
                  setCategoriaAberta((prev) => (prev === "Sucos" ? null : "Sucos"))
                }
                onAdd={adicionar}
              />

              <CategoriaBloco
                titulo="Geladinho"
                produtos={PRODUTOS.filter((p) => p.categoria === "Geladinho")}
                aberta={categoriaAberta === "Geladinho"}
                onToggle={() =>
                  setCategoriaAberta((prev) => (prev === "Geladinho" ? null : "Geladinho"))
                }
                onAdd={adicionar}
              />
            </section>
          </div>
        </div>
      </div>

      {mostrarCarrinho && (
        <div className="overlay" onClick={() => setMostrarCarrinho(false)}>
          <div className="carrinho-modal" onClick={(e) => e.stopPropagation()}>
            <div className="carrinho-topo">
              <h2 className="secao-titulo" style={{ marginBottom: 0 }}>Carrinho</h2>
              <button type="button" className="aba" onClick={() => setMostrarCarrinho(false)}>
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
                      <button
                        type="button"
                        className="mini-btn"
                        onClick={() => diminuir(item.id)}
                      >
                        -
                      </button>

                      <span>{item.qtd}</span>

                      <button
                        type="button"
                        className="mini-btn"
                        onClick={() => aumentar(item.id)}
                      >
                        +
                      </button>

                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => removerDoCarrinho(item.id)}
                      >
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

            <button
              type="button"
              onClick={enviarPedido}
              className="principal-btn"
              disabled={enviando}
              style={{ marginTop: 16 }}
            >
              {enviando ? "Enviando..." : "Enviar pedido"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
