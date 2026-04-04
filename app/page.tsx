"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabase";
import { PRODUTOS, dinheiro } from "./lib/cardapio";

export default function Page() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [observacao, setObservacao] = useState("");
  const [pagamento, setPagamento] = useState("Pix");

  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [enviando, setEnviando] = useState(false);

  const total = useMemo(() => {
    return carrinho.reduce((s, i) => s + i.preco * i.qtd, 0);
  }, [carrinho]);

  function adicionar(produto: any) {
    setCarrinho((prev) => {
      const existe = prev.find((i) => i.id === produto.id);
      if (existe) {
        return prev.map((i) =>
          i.id === produto.id ? { ...i, qtd: i.qtd + 1 } : i
        );
      }
      return [...prev, { ...produto, qtd: 1 }];
    });
  }

  function remover(id: number) {
    setCarrinho((prev) => prev.filter((i) => i.id !== id));
  }

  async function enviarPedido() {
    if (!nome || !telefone || carrinho.length === 0) {
      alert("Preenche tudo!");
      return;
    }

    setEnviando(true);

    const { data, error } = await supabase
      .from("pedidos")
      .insert([
        {
          nome,
          telefone,
          endereco,
          observacao,
          pagamento,
          itens: carrinho,
          total,
          status: "novo",
        },
      ])
      .select()
      .single();

    setEnviando(false);

    if (error) {
      alert("Erro ao enviar");
      return;
    }

    router.push(`/acompanhar/${data.id}`);
  }

  return (
    <main className="pagina">
      <div className="container">
        <h1 className="titulo">🔥 Espetinho do Thalisca</h1>

        <div className="card">
          <input
            placeholder="Nome"
            className="campo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            placeholder="Telefone"
            className="campo"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
          <input
            placeholder="Endereço"
            className="campo"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />

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
            placeholder="Observação: exemplo, sem arroz..."
            className="campo"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
        </div>

        <h2 className="subtitulo">Cardápio</h2>

        {["Espetinho avulso tradicional",
          "Espetinho avulso premium",
          "Acompanhamento + tradicional",
          "Acompanhamento + premium",
          "Sucos",
          "Geladinho"].map((categoria) => (
          <div key={categoria} className="categoria">
            <h3>{categoria}</h3>

            <div className="grid">
              {PRODUTOS.filter((p) => p.categoria === categoria).map((p) => (
                <div
                  key={p.id}
                  className="produto"
                  onClick={() => adicionar(p)}
                >
                  <div>{p.nome}</div>
                  <span>{dinheiro(p.preco)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="carrinho">
          <h2>Carrinho</h2>

          {carrinho.map((item) => (
            <div key={item.id} className="item">
              {item.nome} x{item.qtd}
              <button onClick={() => remover(item.id)}>X</button>
            </div>
          ))}

          <h3>Total: {dinheiro(total)}</h3>

          <button className="btn" onClick={enviarPedido}>
            {enviando ? "Enviando..." : "Enviar pedido"}
          </button>
        </div>
      </div>
    </main>
  );
}
