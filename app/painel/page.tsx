"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Pedido, dinheiro } from "../lib/cardapio";

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

      <div className="pedido-total">Pedido #{pedido.id}</div>
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

export default function PainelPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [pedidoParaExcluir, setPedidoParaExcluir] = useState<number | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarPedidos();

    const channel = supabase
      .channel("pedidos-realtime-painel")
      .on("postgres_changes", { event: "*", schema: "public", table: "pedidos" }, () => {
        carregarPedidos();
      })
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

    if (!error) {
      setPedidos((data as Pedido[]) || []);
    }

    setCarregando(false);
  }

  async function atualizarStatus(id: number, status: string) {
    const { error } = await supabase.from("pedidos").update({ status }).eq("id", id);

    if (error) {
      alert("Erro ao atualizar status: " + error.message);
      return;
    }

    carregarPedidos();
  }

  async function confirmarExclusao() {
    if (pedidoParaExcluir === null) return;

    setExcluindo(true);

    const { error } = await supabase.from("pedidos").delete().eq("id", pedidoParaExcluir);

    setExcluindo(false);

    if (error) {
      alert("Erro ao excluir pedido: " + error.message);
      return;
    }

    setPedidoParaExcluir(null);
    carregarPedidos();
  }

  const novos = pedidos.filter((p) => p.status === "novo");
  const preparo = pedidos.filter((p) => p.status === "preparo");
  const concluidos = pedidos.filter((p) => p.status === "entregue");

  const faturamento = concluidos.reduce((soma, pedido) => soma + Number(pedido.total), 0);

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
              <h1 className="titulo-principal">🍢 Painel do atendente</h1>
              <p className="subtitulo">Gerencie os pedidos em tempo real</p>

              <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/" className="aba ativa" style={{ textDecoration: "none" }}>
                  Voltar para cliente
                </Link>
                <Link href="/acompanhar" className="aba" style={{ textDecoration: "none" }}>
                  Acompanhar pedido
                </Link>
              </div>
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
        </div>

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
                  onDelete={() => setPedidoParaExcluir(pedido.id)}
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
                  onDelete={() => setPedidoParaExcluir(pedido.id)}
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
                  onDelete={() => setPedidoParaExcluir(pedido.id)}
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
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 10 }}>Excluir pedido?</h3>
            <p style={{ color: "#cfcfcf", marginBottom: 20 }}>
              Essa ação vai remover o pedido do painel.
            </p>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setPedidoParaExcluir(null)}
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
