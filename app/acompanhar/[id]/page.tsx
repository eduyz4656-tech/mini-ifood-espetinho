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
          <div className="login-box">
            <div className="card login-card">
              <h1 className="hero-titulo">Carregando pedido...</h1>
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
          <div className="login-box">
            <div className="card login-card">
              <h1 className="hero-titulo">Pedido não encontrado</h1>
              <div className="margem-top">
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
          <div className="hero-topo">
            <div>
              <div className="hero-badge">Acompanhamento em tempo real</div>
              <h1 className="hero-titulo">📦 Pedido #{pedido.id}</h1>
              <p className="hero-subtitulo">Acompanhe o andamento do seu pedido.</p>
            </div>

            <Link href="/" className="botao-secundario">
              Fazer novo pedido
            </Link>
          </div>
        </div>

        <div className="acompanhar-grid">
          <section className="card">
            <h2 className="secao-titulo">Status</h2>
            <div className="status-grande">{textoStatus(pedido.status)}</div>
          </section>

          <section className="card">
            <h2 className="secao-titulo">Detalhes do pedido</h2>

            <div className="pedido-linha"><b>Cliente:</b> {pedido.nome}</div>
            <div className="pedido-linha"><b>Telefone:</b> {pedido.telefone}</div>
            <div className="pedido-linha"><b>Entrega:</b> {pedido.tipo_entrega}</div>
            <div className="pedido-linha"><b>Local:</b> {pedido.endereco}</div>
            <div className="pedido-linha"><b>Pagamento:</b> {pedido.pagamento}</div>

            {pedido.observacao ? (
              <div className="pedido-linha"><b>Obs:</b> {pedido.observacao}</div>
            ) : null}

            <div className="pedido-itens margem-top">
              {pedido.itens?.map((item) => (
                <div key={`${pedido.id}-${item.id}`}>
                  {item.qtd}x {item.nome} - {dinheiro(item.preco * item.qtd)}
                </div>
              ))}
            </div>

            <div className="pedido-total">{dinheiro(Number(pedido.total))}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
