"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Pedido, dinheiro } from "../../lib/cardapio";

function textoStatus(status: string) {
  if (status === "novo") return "Novo";
  if (status === "preparo") return "Em preparo";
  if (status === "entregue") return "Entregue";
  return status;
}

function classeStatus(status: string) {
  if (status === "preparo") return "status-badge preparo";
  if (status === "entregue") return "status-badge entregue";
  return "status-badge";
}

export default function AcompanharPedidoPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!id) return;

    buscarPedido();

    const intervalo = setInterval(() => {
      buscarPedido();
    }, 3000);

    return () => clearInterval(intervalo);
  }, [id]);

  async function buscarPedido() {
    if (!id) return;

    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .eq("id", Number(id))
      .single();

    if (!error && data) {
      setPedido(data as Pedido);
    }

    setCarregando(false);
  }

  if (carregando) {
    return (
      <main className="pagina">
        <div className="container">
          <div className="hero-card">
            <div className="hero-centro">
              <div className="hero-badge">Acompanhamento</div>
              <h1 className="hero-titulo centralizado">Carregando pedido...</h1>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!pedido) {
    return (
      <main className="pagina">
        <div className="container">
          <div className="hero-card">
            <div className="hero-centro">
              <div className="hero-badge">Pedido</div>
              <h1 className="hero-titulo centralizado">Pedido não encontrado</h1>
              <div style={{ marginTop: 20 }}>
                <Link href="/" className="botao-secundario">
                  Voltar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pagina">
      <div className="container">
        <div className="hero-card">
          <div className="hero-topbar">
            <Link href="/" className="botao-secundario">
              Fazer novo pedido
            </Link>

            <div className={classeStatus(pedido.status)}>
              {textoStatus(pedido.status)}
            </div>
          </div>

          <div className="hero-centro">
            <div className="hero-badge">Acompanhamento em tempo real</div>
            <h1 className="hero-titulo centralizado">Pedido #{pedido.id}</h1>
            <p className="hero-frase">Acompanhe o andamento do seu pedido.</p>

            <div className="hero-resumo">
              <div className="hero-mini-card">
                <span>Status atual</span>
                <strong>{textoStatus(pedido.status)}</strong>
              </div>

              <div className="hero-mini-card">
                <span>Total</span>
                <strong>{dinheiro(Number(pedido.total))}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="conteudo-grid">
          <div className="conteudo-principal">
            <section className="card">
              <div className="secao-topo">
                <h2 className="secao-titulo">Detalhes do pedido</h2>
                <p className="secao-subtitulo">Informações enviadas pelo cliente.</p>
              </div>

              <div className="pedido-card">
                <div className="pedido-linha">
                  <b>Cliente:</b> {pedido.nome}
                </div>

                <div className="pedido-linha">
                  <b>Telefone:</b> {pedido.telefone}
                </div>

                <div className="pedido-linha">
                  <b>Entrega:</b> {pedido.tipo_entrega}
                </div>

                <div className="pedido-linha">
                  <b>Local:</b> {pedido.endereco}
                </div>

                <div className="pedido-linha">
                  <b>Pagamento:</b> {pedido.pagamento}
                </div>

                {pedido.observacao ? (
                  <div className="pedido-linha">
                    <b>Observação:</b> {pedido.observacao}
                  </div>
                ) : null}
              </div>
            </section>

            <section className="card">
              <div className="secao-topo">
                <h2 className="secao-titulo">Itens do pedido</h2>
                <p className="secao-subtitulo">Resumo completo do seu carrinho.</p>
              </div>

              <div className="itens-carrinho">
                {pedido.itens?.map((item) => (
                  <div key={`${pedido.id}-${item.id}`} className="item-card">
                    <div className="item-topo">
                      <div>
                        <div className="item-nome">{item.nome}</div>
                        <div className="item-info">
                          {item.qtd}x {dinheiro(item.preco)}
                        </div>
                      </div>

                      <div className="item-total">
                        {dinheiro(item.preco * item.qtd)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="total-box">
                <div className="total-texto">
                  Total: {dinheiro(Number(pedido.total))}
                </div>
                <div className="texto-suave pequeno">
                  Obrigado por pedir com a gente 💛
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
