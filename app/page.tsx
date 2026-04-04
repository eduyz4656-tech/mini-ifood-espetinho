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

type FlyingItem = {
  id: number;
  nome: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
};

function estiloErro(erro?: boolean): React.CSSProperties {
  return erro
    ? {
        border: "2px solid #ff5b5b",
        boxShadow: "0 0 0 2px rgba(255, 91, 91, 0.14)",
      }
    : {};
}

function CategoriaSecao({
  titulo,
  produtos,
  onAdd,
}: {
  titulo: string;
  produtos: Produto[];
  onAdd: (produto: Produto, e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  if (!produtos.length) return null;

  return (
    <div className="categoria-secao">
      <h3 className="categoria-titulo">{titulo}</h3>

      <div className="produtos-grid">
        {produtos.map((produto) => (
          <button
            key={produto.id}
            type="button"
            className="produto-card"
            onClick={(e) => onAdd(produto, e)}
          >
            <div className="produto-card-topo">
              <div className="produto-nome">{produto.nome}</div>
              <div className="produto-preco">{dinheiro(produto.preco)}</div>
            </div>

            <div className="produto-add-texto">Adicionar ao carrinho</div>
          </button>
        ))}
      </div>
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
  const [erros, setErros] = useState<CampoErros>({});
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

  const nomeRef = useRef<HTMLInputElement | null>(null);
  const telefoneRef = useRef<HTMLInputElement | null>(null);
  const enderecoRef = useRef<HTMLInputElement | null>(null);
  const mesaRef = useRef<HTMLInputElement | null>(null);
  const pagamentoRef = useRef<HTMLSelectElement | null>(null);
  const trocoRef = useRef<HTMLInputElement | null>(null);
  const cardapioRef = useRef<HTMLElement | null>(null);
  const cartButtonRef = useRef<HTMLButtonElement | null>(null);

  const total = useMemo(() => {
    return carrinho.reduce((soma, item) => soma + item.preco * item.qtd, 0);
  }, [carrinho]);

  const quantidadeTotal = useMemo(() => {
    return carrinho.reduce((soma, item) => soma + item.qtd, 0);
  }, [carrinho]);

  function adicionarSemAnimacao(produto: Produto) {
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

  function animarAteCarrinho(produto: Produto, origemEl: HTMLElement) {
    const cartEl = cartButtonRef.current;

    if (!cartEl) {
      adicionarSemAnimacao(produto);
      return;
    }

    const origem = origemEl.getBoundingClientRect();
    const destino = cartEl.getBoundingClientRect();

    const id = Date.now() + produto.id;

    const startX = origem.left + origem.width / 2;
    const startY = origem.top + origem.height / 2;
    const endX = destino.left + destino.width / 2;
    const endY = destino.top + destino.height / 2;

    setFlyingItems((prev) => [
      ...prev,
      {
        id,
        nome: produto.nome,
        x: startX,
        y: startY,
        tx: startX,
        ty: startY,
      },
    ]);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlyingItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, tx: endX, ty: endY } : item
          )
        );
      });
    });

    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((item) => item.id !== id));
      adicionarSemAnimacao(produto);
    }, 650);
  }

  function adicionar(produto: Produto, e: React.MouseEvent<HTMLButtonElement>) {
    animarAteCarrinho(produto, e.currentTarget);
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

  function remover(id: number) {
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

    if (tipoEntrega === "delivery" && !endereco.trim()) {
      novosErros.endereco = true;
    }

    if (tipoEntrega === "mesa" && !mesa.trim()) {
      novosErros.mesa = true;
    }

    if (pagamento === "Dinheiro" && precisaTroco && !trocoPara.trim()) {
      novosErros.trocoPara = true;
    }

    if (carrinho.length === 0) {
      novosErros.carrinho = true;
    }

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      focarPrimeiroErro(novosErros);
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
      {flyingItems.map((item) => (
        <div
          key={item.id}
          className="flying-item"
          style={{
            left: item.x,
            top: item.y,
            transform: `translate(${item.tx - item.x}px, ${item.ty - item.y}px) scale(0.35)`,
          }}
        >
          {item.nome}
        </div>
      ))}

      <div className="container">
        <div className="hero-card">
          <div className="hero-topbar">
            <Link href="/painel" className="botao-secundario">
              Painel do atendente
            </Link>

            <button
              ref={cartButtonRef}
              type="button"
              className="carrinho-topo"
              onClick={() => setMostrarCarrinho(true)}
              aria-label="Abrir carrinho"
            >
              <span className="carrinho-icone">🛒</span>
              {quantidadeTotal > 0 ? (
                <span className="badge-carrinho">{quantidadeTotal}</span>
              ) : null}
            </button>
          </div>

          <div className="hero-centro">
            <div className="hero-badge">Espetinho • Delivery • Mesa</div>

            <h1 className="hero-titulo centralizado">ESPETINHO DO THALISCA</h1>

            <p className="hero-frase">"Fala comigo, fala com nós!"</p>

            <p className="hero-insta">@espetinhodothalisca</p>

            <div className="hero-info hero-info-centralizada">
              <span>📞 (68) 99225-2648</span>
              <span>📍 Av. Diamantino Augusto de Macedo, 866 - Olaria</span>
            </div>

            <div className="hero-resumo">
              <div className="hero-mini-card">
                <span>Itens no carrinho</span>
                <strong>{quantidadeTotal}</strong>
              </div>

              <div className="hero-mini-card">
                <span>Total</span>
                <strong>{dinheiro(total)}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="conteudo-grid">
          <div className="conteudo-principal">
            <section className="card">
              <div className="secao-topo">
                <h2 className="secao-titulo">Novo pedido</h2>
                <p className="secao-subtitulo">Preenche os dados e monta teu pedido.</p>
              </div>

              <div className="grid-2">
                <input
                  ref={nomeRef}
                  className="campo"
                  style={estiloErro(erros.nome)}
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
                  style={estiloErro(erros.telefone)}
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
                  className={tipoEntrega === "delivery" ? "tag-ativa" : "tag"}
                  onClick={() => setTipoEntrega("delivery")}
                >
                  Delivery
                </button>

                <button
                  type="button"
                  className={tipoEntrega === "retirada" ? "tag-ativa" : "tag"}
                  onClick={() => setTipoEntrega("retirada")}
                >
                  Retirada
                </button>

                <button
                  type="button"
                  className={tipoEntrega === "mesa" ? "tag-ativa" : "tag"}
                  onClick={() => setTipoEntrega("mesa")}
                >
                  Mesa
                </button>
              </div>

              {tipoEntrega === "delivery" && (
                <input
                  ref={enderecoRef}
                  className="campo margem-top"
                  style={estiloErro(erros.endereco)}
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
                  style={estiloErro(erros.mesa)}
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
                  style={estiloErro(erros.pagamento)}
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
                      className={precisaTroco ? "tag-ativa" : "tag"}
                      onClick={() => setPrecisaTroco(true)}
                    >
                      Sim
                    </button>

                    <button
                      type="button"
                      className={!precisaTroco ? "tag-ativa" : "tag"}
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
                      style={estiloErro(erros.trocoPara)}
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
              <div className="secao-topo">
                <h2 className="secao-titulo">Cardápio</h2>
                <p className="secao-subtitulo">Escolhe os itens tocando nos cards.</p>
              </div>

              {erros.carrinho ? (
                <div className="erro-texto">Adiciona pelo menos 1 item no pedido.</div>
              ) : null}

              <CategoriaSecao
                titulo="Espetinho avulso tradicional"
                produtos={PRODUTOS.filter((p) => p.categoria === "Espetinho avulso tradicional")}
                onAdd={adicionar}
              />

              <CategoriaSecao
                titulo="Espetinho avulso premium"
                produtos={PRODUTOS.filter((p) => p.categoria === "Espetinho avulso premium")}
                onAdd={adicionar}
              />

              <CategoriaSecao
                titulo="Acompanhamento + tradicional"
                produtos={PRODUTOS.filter((p) => p.categoria === "Acompanhamento + tradicional")}
                onAdd={adicionar}
              />

              <CategoriaSecao
                titulo="Acompanhamento + premium"
                produtos={PRODUTOS.filter((p) => p.categoria === "Acompanhamento + premium")}
                onAdd={adicionar}
              />

              <CategoriaSecao
                titulo="Sucos"
                produtos={PRODUTOS.filter((p) => p.categoria === "Sucos")}
                onAdd={adicionar}
              />

              <CategoriaSecao
                titulo="Geladinho"
                produtos={PRODUTOS.filter((p) => p.categoria === "Geladinho")}
                onAdd={adicionar}
              />
            </section>
          </div>
        </div>

        <footer className="footer-creditos">
          <div>Desenvolvido por Eduardo Marques</div>
          <div>Instagram: @_s4ntozy</div>
          <div>Número: 68992562029</div>
        </footer>
      </div>

      {mostrarCarrinho ? (
        <div className="overlay" onClick={() => setMostrarCarrinho(false)}>
          <div className="carrinho-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-topo">
              <h2 className="secao-titulo">Carrinho</h2>
              <button
                type="button"
                className="botao-secundario"
                onClick={() => setMostrarCarrinho(false)}
              >
                Fechar
              </button>
            </div>

            {carrinho.length === 0 ? (
              <p className="texto-suave">Nenhum item adicionado.</p>
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
                        onClick={() => remover(item.id)}
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
              <div className="texto-suave pequeno">Sem taxa de entrega</div>
            </div>

            <button
              type="button"
              className="botao-principal margem-top"
              onClick={enviarPedido}
              disabled={enviando}
            >
              {enviando ? "Enviando..." : "Enviar pedido"}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
