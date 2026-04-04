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
    <section className="categoria-secao">
      <div className="categoria-header">
        <h3 className="categoria-titulo">{titulo}</h3>
      </div>

      <div className="produtos-grid">
        {produtos.map((produto) => (
          <button
            key={produto.id}
            type="button"
            className="produto-card"
            onClick={(e) => onAdd(produto, e)}
          >
            <div className="produto-info">
              <div className="produto-nome">{produto.nome}</div>
              <div className="produto-preco">{dinheiro(produto.preco)}</div>
            </div>

            <div className="produto-cta">Adicionar</div>
          </button>
        ))}
      </div>
    </section>
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
    <main className="app-page">
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

      <div className="app-shell">
        <header className="home-header">
          <div className="top-actions">
            <Link href="/painel" className="panel-link">
              ADM
            </Link>

            <button
              ref={cartButtonRef}
              type="button"
              className="cart-button"
              onClick={() => setMostrarCarrinho(true)}
              aria-label="Abrir carrinho"
            >
              <span className="cart-icon">🛒</span>
              {quantidadeTotal > 0 ? (
                <span className="cart-badge">{quantidadeTotal}</span>
              ) : null}
            </button>
          </div>

          <div className="brand-hero">
            <div className="hero-pill">Espetinho • Delivery • Mesa</div>

            <h1 className="brand-title">ESPETINHO DO THALISCA</h1>

            <p className="brand-slogan">"Fala comigo, fala com nós!"</p>

            <p className="brand-instagram">@espetinhodothalisca</p>

            <div className="brand-meta">
              <span>📞 (68) 99225-2648</span>
              <span>📍 Av. Diamantino Augusto de Macedo, 866 - Olaria</span>
            </div>

            <div className="hero-stats">
              <div className="hero-stat-card">
                <span>Itens no carrinho</span>
                <strong>{quantidadeTotal}</strong>
              </div>

              <div className="hero-stat-card">
                <span>Total</span>
                <strong>{dinheiro(total)}</strong>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          <section className="section-card order-card">
            <div className="section-head">
              <h2>Novo pedido</h2>
              <p>Preenche os dados e monta teu pedido.</p>
            </div>

            <div className="form-grid">
              <input
                ref={nomeRef}
                className="field"
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
                className="field"
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

            <div className="delivery-tabs">
              <button
                type="button"
                className={tipoEntrega === "delivery" ? "tab active" : "tab"}
                onClick={() => setTipoEntrega("delivery")}
              >
                Delivery
              </button>

              <button
                type="button"
                className={tipoEntrega === "retirada" ? "tab active" : "tab"}
                onClick={() => setTipoEntrega("retirada")}
              >
                Retirada
              </button>

              <button
                type="button"
                className={tipoEntrega === "mesa" ? "tab active" : "tab"}
                onClick={() => setTipoEntrega("mesa")}
              >
                Mesa
              </button>
            </div>

            {tipoEntrega === "delivery" ? (
              <input
                ref={enderecoRef}
                className="field field-margin"
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
            ) : null}

            {tipoEntrega === "mesa" ? (
              <input
                ref={mesaRef}
                className="field field-margin"
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
            ) : null}

            <div className="form-grid field-margin">
              <select
                ref={pagamentoRef}
                className="field"
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
                className="field"
                placeholder="Observação: exemplo, sem arroz, sem cebola..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                rows={3}
              />
            </div>

            {pagamento === "Dinheiro" ? (
              <div className="field-margin">
                <div className="troco-label">Precisa de troco?</div>

                <div className="delivery-tabs">
                  <button
                    type="button"
                    className={precisaTroco ? "tab active" : "tab"}
                    onClick={() => setPrecisaTroco(true)}
                  >
                    Sim
                  </button>

                  <button
                    type="button"
                    className={!precisaTroco ? "tab active" : "tab"}
                    onClick={() => {
                      setPrecisaTroco(false);
                      setTrocoPara("");
                    }}
                  >
                    Não
                  </button>
                </div>

                {precisaTroco ? (
                  <input
                    ref={trocoRef}
                    className="field field-margin"
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
                ) : null}
              </div>
            ) : null}
          </section>

          <section ref={cardapioRef} className="section-card menu-card">
            <div className="section-head">
              <h2>Cardápio</h2>
              <p>Escolhe os itens tocando nos cards.</p>
            </div>

            {erros.carrinho ? (
              <div className="error-text">Adiciona pelo menos 1 item no pedido.</div>
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

        <footer className="credits-footer">
          <div>Desenvolvido por Eduardo Marques</div>
          <div>Instagram: @_s4ntozy</div>
          <div>Número: 68992562029</div>
        </footer>
      </div>

      {mostrarCarrinho ? (
        <div className="cart-overlay" onClick={() => setMostrarCarrinho(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer-top">
              <h2>Carrinho</h2>

              <button
                type="button"
                className="panel-link"
                onClick={() => setMostrarCarrinho(false)}
              >
                Fechar
              </button>
            </div>

            {carrinho.length === 0 ? (
              <p className="muted-text">Nenhum item adicionado.</p>
            ) : (
              <div className="cart-items">
                {carrinho.map((item) => (
                  <div key={item.id} className="cart-item-card">
                    <div className="cart-item-top">
                      <div>
                        <div className="cart-item-name">{item.nome}</div>
                        <div className="cart-item-info">{dinheiro(item.preco)} cada</div>
                      </div>

                      <div className="cart-item-total">
                        {dinheiro(item.preco * item.qtd)}
                      </div>
                    </div>

                    <div className="cart-item-actions">
                      <button
                        type="button"
                        className="small-btn"
                        onClick={() => diminuir(item.id)}
                      >
                        -
                      </button>

                      <span>{item.qtd}</span>

                      <button
                        type="button"
                        className="small-btn"
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

            <div className="cart-total-box">
              <div className="cart-total-text">Total: {dinheiro(total)}</div>
              <div className="muted-text small-text">Sem taxa de entrega</div>
            </div>

            <button
              type="button"
              className="primary-btn drawer-send-btn"
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
