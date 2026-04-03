"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const SENHA = "2026"; 

export default function Painel() {
  const [autorizado, setAutorizado] = useState(false);
  const [senha, setSenha] = useState("");
  const [pedidos, setPedidos] = useState<any[]>([]);

  useEffect(() => {
    if (autorizado) {
      buscarPedidos();
    }
  }, [autorizado]);

  async function buscarPedidos() {
    const { data } = await supabase
      .from("pedidos")
      .select("*")
      .order("id", { ascending: false });

    setPedidos(data || []);
  }

  async function atualizarStatus(id: number, status: string) {
    await supabase.from("pedidos").update({ status }).eq("id", id);
    buscarPedidos();
  }

  if (!autorizado) {
    return (
      <div style={{ padding: 40 }}>
        <h2>🔒 Painel do atendente</h2>
        <input
          placeholder="Digite a senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{ padding: 10, marginTop: 10 }}
        />
        <br />
        <button
          onClick={() => {
            if (senha === SENHA) setAutorizado(true);
            else alert("Senha errada");
          }}
          style={{ marginTop: 10 }}
        >
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>📋 Pedidos</h1>

      {pedidos.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #333",
            padding: 15,
            marginBottom: 10,
            borderRadius: 10,
          }}
        >
          <b>Pedido #{p.id}</b> - {p.nome} <br />
          📞 {p.telefone} <br />
          📍 {p.endereco} <br />
          💰 {p.pagamento} <br />
          📌 {p.observacao} <br />
          <b>Status:</b> {p.status}
          <br /><br />

          <button onClick={() => atualizarStatus(p.id, "preparando")}>
            Preparando
          </button>

          <button onClick={() => atualizarStatus(p.id, "pronto")}>
            Pronto
          </button>

          <button onClick={() => atualizarStatus(p.id, "entregue")}>
            Entregue
          </button>
        </div>
      ))}
    </div>
  );
}
