"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Acompanhar() {
  const { id } = useParams();
  const [pedido, setPedido] = useState<any>(null);

  useEffect(() => {
    buscar();
    const interval = setInterval(buscar, 3000);
    return () => clearInterval(interval);
  }, []);

  async function buscar() {
    const { data } = await supabase
      .from("pedidos")
      .select("*")
      .eq("id", id)
      .single();

    setPedido(data);
  }

  if (!pedido) return <div style={{ padding: 20 }}>Carregando...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>📦 Pedido #{pedido.id}</h1>

      <p><b>Status:</b> {pedido.status}</p>

      <div style={{ marginTop: 20 }}>
        {pedido.itens?.map((item: any) => (
          <div key={item.id}>
            {item.qtd}x {item.nome}
          </div>
        ))}
      </div>

      <h2>Total: R$ {pedido.total}</h2>
    </div>
  );
}