"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Pedido, dinheiro } from "../lib/cardapio";

const SENHA_PAINEL = "1234";

export default function PainelPage() {
  const [senha, setSenha] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const salvo = sessionStorage.getItem("painel-autorizado");
    if (salvo === "sim") {
      setAutorizado(true);
    }
  }, []);

  useEffect(() => {
    if (!autorizado) return;
    carregarPedidos();

    const intervalo = setInterval(() => {
      carregarPedidos();
    }, 3000);

    return () => clearInterval(intervalo);
  }, [autorizado]);

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

  function entrar() {
    if (senha !== SENHA_PAINEL) {
      alert("Senha incorreta.");
      return;
    }

    sessionStorage.setItem("painel-autorizado", "sim");
    setAutorizado(true);
  }

  function sair() {
    sessionStorage.removeItem("painel-autorizado");
    setAutorizado(false);
    setSenha("");
  }

  async function atualizarStatus(id: number, status: "novo" | "preparo" | "entregue") {
    const { error } = await supabase.from("pedidos").update({ status }).eq("id", id);

    if (error) {
      alert("Erro ao atualizar status.");
      return;
    }

    carregarPedidos();
  }

  if (!autorizado) {
    return (
      <main className="pagina">
        <div className="container">
          <div className="card login-card">
            <h1 className="titulo-principal">🔒 Painel do atendente</h1>
            <p className="subtitulo">Digite a senha para entrar</p>

            <input
              className="campo"
              type="password"
              placeholder="Senha do painel"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            <button type="button" className="principal-btn margem-top" onClick={entrar}>
              Entrar
            </button>

            <div className="margem-top">
              <Link href="/" className="aba">
                Voltar para o cliente
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const novos = pedidos.filter((p) => p.status === "novo");
  const preparo = pedidos.filter((p) => p.status === "preparo");
  const entregues = pedidos.filter((p) => p.status === "entregue");
  const faturamento = entregues.reduce((soma, pedido) => soma + Number(pedido.total), 0);

  return (
    <main className="pagina">
      <div className="container">
        <div className="topo-card">
          <div className="topo-flex">
            <div>
              <h1 className="titulo-principal">📋 Painel do atendente</h1>
              <p className="subtitulo">Controle dos pedidos</p>
            </div>

            <div className="painel-topo-acoes">
              <Link href="/" className="aba">
                Ver cliente
              </Link>
              <button type="button" className="danger-btn" onClick={sair}>
                Sair
              </button>
            </div>
          </div>
        </div>

        <div className="painel-resumo">
          <div className="resumo-card">
            <span>Novos</span>
            <strong>{novos.length}</strong>
          </div>
          <div className="resumo-card">
            <span>Em preparo</span>
            <strong>{preparo.length}</strong>
          </div>
          <div className="resumo-card">
            <span>Entregues</span>
            <strong>{entregues.length}</strong>
          </div>
          <div className="resumo-card">
            <span>Faturamento</span>
            <strong>{dinheiro(faturamento)}</strong>
          </div>
        </div>

        {carregando && <p className="muted">Carregando pedidos...</p>}

        <div className="painel-grid">
          <section className="card">
            <h2 className="secao-titulo">Novos</h2>

            {novos.length === 0 ? (
              <p className="muted">Nenhum pedido novo.</p>
            ) : (
              novos.map((pedido) => (
                <div key={pedido.id} className="pedido-card">
                  <div className="pedido-topo">
                    <strong>Pedido #{pedido.id}</strong>
                    <span className="status-badge">{pedido.status}</span>
                  </div>

                  <div className="pedido-linha"><b>Cliente:</b> {pedido.nome}</div>
                  <div className="pedido-linha"><b>Telefone:</b> {pedido.telefone}</div>
                  <div className="pedido-linha"><b>Entrega:</b> {pedido.tipo_entrega}</div>
                  <div className="pedido-linha"><b>Local:</b> {pedido.endereco}</div>
                  <div className="pedido-linha"><b>Pagamento:</b> {pedido.pagamento}</div>

                  {pedido.observacao ? (
                    <div className="pedido-linha"><b>Obs:</b> {pedido.observacao}</div>
                  ) : null}

                  <div className="pedido-itens">
                    {pedido.itens?.map((item) => (
                      <div key={`${pedido.id}-${item.id}`}>
                        {item.qtd}x {item.nome}
                      </div>
                    ))}
                  </div>

                  <div className="pedido-total">{dinheiro(Number(pedido.total))}</div>

                  <div className="pedido-acoes">
                    <button
                      type="button"
                      className="principal-btn pequeno-btn"
                      onClick={() => atualizarStatus(pedido.id, "preparo")}
                    >
                      Colocar em preparo
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>

          <section className="card">
            <h2 className="secao-titulo">Em preparo</h2>

            {preparo.length === 0 ? (
              <p className="muted">Nenhum pedido em preparo.</p>
            ) : (
              preparo.map((pedido) => (
                <div key={pedido.id} className="pedido-card">
                  <div className="pedido-topo">
                    <strong>Pedido #{pedido.id}</strong>
                    <span className="status-badge preparo">{pedido.status}</span>
                  </div>

                  <div className="pedido-linha"><b>Cliente:</b> {pedido.nome}</div>
                  <div className="pedido-linha"><b>Telefone:</b> {pedido.telefone}</div>
                  <div className="pedido-linha"><b>Entrega:</b> {pedido.tipo_entrega}</div>
                  <div className="pedido-linha"><b>Local:</b> {pedido.endereco}</div>

                  <div className="pedido-itens">
                    {pedido.itens?.map((item) => (
                      <div key={`${pedido.id}-${item.id}`}>
                        {item.qtd}x {item.nome}
                      </div>
                    ))}
                  </div>

                  <div className="pedido-total">{dinheiro(Number(pedido.total))}</div>

                  <div className="pedido-acoes">
                    <button
                      type="button"
                      className="principal-btn pequeno-btn"
                      onClick={() => atualizarStatus(pedido.id, "entregue")}
                    >
                      Marcar como entregue
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>

          <section className="card">
            <h2 className="secao-titulo">Entregues</h2>

            {entregues.length === 0 ? (
              <p className="muted">Nenhum pedido entregue.</p>
            ) : (
              entregues.map((pedido) => (
                <div key={pedido.id} className="pedido-card">
                  <div className="pedido-topo">
                    <strong>Pedido #{pedido.id}</strong>
                    <span className="status-badge entregue">{pedido.status}</span>
                  </div>

                  <div className="pedido-linha"><b>Cliente:</b> {pedido.nome}</div>
                  <div className="pedido-linha"><b>Total:</b> {dinheiro(Number(pedido.total))}</div>
                </div>
              ))
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
