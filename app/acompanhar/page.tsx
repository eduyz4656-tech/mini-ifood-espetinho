"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Pedido, dinheiro } from "../lib/cardapio";

export default function AcompanharPage() {
  const [codigo, setCodigo] = useState("");
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [buscando, setBuscando] = useState(false);

  async function buscarPedido() {
    if (!codigo.trim()) {
      alert("Digite o código do pedido.");
      return;
    }

    setBuscando(true);

    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .eq("id", Number(codigo))
      .single();

    setBuscando(false);

    if (error || !data) {
      setPedido(null);
      alert("Pedido não encontrado.");
      return;
    }

    setPedido(data as Pedido);
  }

  function textoStatus(status: string) {
    if (status === "novo") return "Novo";
    if (status === "preparo") return "Em preparo";
    if (status === "entregue") return "Entregue";
    return status;
  }

  return (
    <main className="pagina">
      <div className="container">
        <div className="topo-card">
          <h1 className="titulo-principal">📦 Acompanhar pedido</h1>
          <p className="subtitulo">Digite o código do pedido para ver o status</p>

          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/" className="aba ativa" style={{ textDecoration: "none" }}>
              Fazer pedido
            </Link>
            <Link href="/painel" className="aba" style={{ textDecoration: "none" }}>
              Painel do atendente
            </Link>
          </div>
        </div>

        <section className="card" style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: 18 }}>Buscar pedido</h2>

          <div className="grid-2">
            <input
              className="campo"
              placeholder="Código do pedido"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />

            <button onClick={buscarPedido} className="principal-btn" disabled={buscando}>
              {buscando ? "Buscando..." : "Buscar pedido"}
            </button>
          </div>

          {pedido ? (
            <div
              style={{
                marginTop: 24,
                background: "#111",
                border: "1px solid #333",
                borderRadius: 18,
                padding: 18,
              }}
            >
              <h3 style={{ marginTop: 0 }}>Pedido #{pedido.id}</h3>
              <p><strong>Cliente:</strong> {pedido.nome}</p>
              <p><strong>Telefone:</strong> {pedido.telefone}</p>
              <p><strong>Status:</strong> {textoStatus(pedido.status)}</p>
              <p><strong>Entrega:</strong> {pedido.tipo_entrega}</p>
              <p><strong>Local:</strong> {pedido.endereco}</p>
              <p><strong>Pagamento:</strong> {pedido.pagamento}</p>
              <p><strong>Total:</strong> {dinheiro(Number(pedido.total))}</p>

              {pedido.observacao ? (
                <p><strong>Obs:</strong> {pedido.observacao}</p>
              ) : null}

              <div style={{ marginTop: 14 }}>
                <strong>Itens:</strong>
                <div style={{ marginTop: 8 }}>
                  {pedido.itens?.map((item, i) => (
                    <div key={i}>
                      {item.qtd}x {item.nome} - {dinheiro(item.preco * item.qtd)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
