"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type ItemPedido = {
  id?: number;
  nome: string;
  preco: number;
  qtd: number;
};

type Pedido = {
  id: number;
  nome: string;
  telefone: string;
  tipo_entrega: "delivery" | "retirada" | "mesa" | string;
  endereco: string;
  pagamento: string;
  observacao?: string | null;
  itens: ItemPedido[];
  total: number | string;
  status: "novo" | "preparo" | "entregue" | string;
};

function dinheiro(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function nomeStatus(status: string) {
  if (status === "novo") return "Pedido recebido";
  if (status === "preparo") return "Em preparo";
  if (status === "entregue") return "Finalizado";
  return status;
}

function descricaoStatus(status: string, tipoEntrega: string) {
  if (status === "novo") {
    return "Seu pedido já chegou pra gente e entrou na fila.";
  }

  if (status === "preparo") {
    if (tipoEntrega === "delivery") {
      return "Seu pedido está sendo preparado. Já já sai pra entrega.";
    }

    if (tipoEntrega === "mesa") {
      return "Seu pedido está sendo preparado e vai chegar na sua mesa.";
    }

    return "Seu pedido está sendo preparado pra retirada.";
  }

  if (status === "entregue") {
    if (tipoEntrega === "delivery") {
      return "Pedido finalizado. Entrega concluída.";
    }

    if (tipoEntrega === "mesa") {
      return "Pedido finalizado. Já foi entregue na mesa.";
    }

    return "Pedido finalizado. Já está pronto/retirado.";
  }

  return "Acompanhe as atualizações do seu pedido em tempo real.";
}

function corStatus(status: string) {
  if (status === "novo") {
    return {
      fundo: "rgba(255, 184, 56, 0.16)",
      borda: "rgba(255, 184, 56, 0.34)",
      cor: "#ffd87a",
      brilho: "0 0 0 1px rgba(255,184,56,0.08), 0 0 28px rgba(255,184,56,0.08)",
    };
  }

  if (status === "preparo") {
    return {
      fundo: "rgba(95, 170, 255, 0.16)",
      borda: "rgba(95, 170, 255, 0.34)",
      cor: "#9dcbff",
      brilho: "0 0 0 1px rgba(95,170,255,0.08), 0 0 28px rgba(95,170,255,0.08)",
    };
  }

  return {
    fundo: "rgba(49, 200, 132, 0.16)",
    borda: "rgba(49, 200, 132, 0.34)",
    cor: "#88efba",
    brilho: "0 0 0 1px rgba(49,200,132,0.08), 0 0 28px rgba(49,200,132,0.08)",
  };
}

function passoAtivo(statusAtual: string, passo: string) {
  const ordem = ["novo", "preparo", "entregue"];
  return ordem.indexOf(statusAtual) >= ordem.indexOf(passo);
}

export default function AcompanharPedidoPage({
  params,
}: {
  params: { id: string };
}) {
  const pedidoId = Number(params.id);

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const visualStatus = useMemo(
    () => corStatus(pedido?.status || "novo"),
    [pedido?.status]
  );

  useEffect(() => {
    if (!pedidoId || Number.isNaN(pedidoId)) {
      setErro("Pedido inválido.");
      setCarregando(false);
      return;
    }

    buscarPedido();

    const channel = supabase
      .channel(`acompanhar-pedido-${pedidoId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos",
        },
        (payload) => {
          const novo = payload.new as Pedido | undefined;
          const antigo = payload.old as Pedido | undefined;

          if (novo?.id === pedidoId || antigo?.id === pedidoId) {
            buscarPedidoSilencioso();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pedidoId]);

  async function buscarPedido() {
    setCarregando(true);
    setErro("");

    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .eq("id", pedidoId)
      .single();

    if (error || !data) {
      setErro("Não foi possível encontrar esse pedido.");
      setPedido(null);
      setCarregando(false);
      return;
    }

    setPedido(data as Pedido);
    setCarregando(false);
  }

  async function buscarPedidoSilencioso() {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .eq("id", pedidoId)
      .single();

    if (!error && data) {
      setPedido(data as Pedido);
    }
  }

  if (carregando) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          <section style={styles.hero}>
            <div style={styles.badge}>Acompanhando pedido</div>
            <h1 style={styles.title}>Carregando...</h1>
            <p style={styles.subtitle}>Buscando as informações do seu pedido.</p>
          </section>
        </div>
      </main>
    );
  }

  if (erro || !pedido) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          <section style={styles.hero}>
            <div style={styles.badge}>Pedido não encontrado</div>
            <h1 style={styles.title}>Oops</h1>
            <p style={styles.subtitle}>{erro || "Pedido não encontrado."}</p>

            <div style={styles.topButtons}>
              <Link href="/" style={styles.secondaryButton}>
                Voltar para o início
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.hero}>
          <div style={styles.heroTop}>
            <div>
              <div style={styles.badge}>Acompanhando pedido #{pedido.id}</div>
              <h1 style={styles.title}>Seu pedido</h1>
              <p style={styles.subtitle}>
                Atualização automática em tempo real.
              </p>
            </div>

            <div style={styles.topButtons}>
              <Link href="/" style={styles.secondaryButton}>
                Novo pedido
              </Link>
            </div>
          </div>

          <div
            style={{
              ...styles.statusBox,
              background: visualStatus.fundo,
              borderColor: visualStatus.borda,
              boxShadow: visualStatus.brilho,
            }}
          >
            <div style={{ ...styles.statusLabel, color: visualStatus.cor }}>
              {nomeStatus(pedido.status)}
            </div>
            <div style={styles.statusDescription}>
              {descricaoStatus(pedido.status, pedido.tipo_entrega)}
            </div>
          </div>

          <div style={styles.timeline}>
            <div style={styles.timelineLine} />

            <StatusStep
              ativo={passoAtivo(pedido.status, "novo")}
              titulo="Recebido"
              texto="Pedido entrou no sistema"
              cor={corStatus("novo").cor}
            />

            <StatusStep
              ativo={passoAtivo(pedido.status, "preparo")}
              titulo="Em preparo"
              texto="Cozinha preparando"
              cor={corStatus("preparo").cor}
            />

            <StatusStep
              ativo={passoAtivo(pedido.status, "entregue")}
              titulo="Finalizado"
              texto="Pedido concluído"
              cor={corStatus("entregue").cor}
            />
          </div>
        </section>

        <section style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.sectionHead}>
              <h2 style={styles.sectionTitle}>Detalhes</h2>
              <p style={styles.sectionText}>Informações principais do pedido.</p>
            </div>

            <div style={styles.detailsGrid}>
              <InfoCard label="Cliente" valor={pedido.nome} />
              <InfoCard label="Telefone" valor={pedido.telefone} />
              <InfoCard label="Entrega" valor={pedido.tipo_entrega} />
              <InfoCard label="Pagamento" valor={pedido.pagamento} />
              <InfoCard label="Local" valor={pedido.endereco} />
              <InfoCard label="Total" valor={dinheiro(Number(pedido.total || 0))} />
            </div>

            {pedido.observacao ? (
              <div style={{ ...styles.infoCard, marginTop: 14 }}>
                <div style={styles.infoLabel}>Observação</div>
                <div style={styles.infoValue}>{pedido.observacao}</div>
              </div>
            ) : null}
          </div>

          <div style={styles.card}>
            <div style={styles.sectionHead}>
              <h2 style={styles.sectionTitle}>Itens do pedido</h2>
              <p style={styles.sectionText}>Resumo completo do seu carrinho.</p>
            </div>

            <div style={styles.itemsList}>
              {(pedido.itens || []).map((item, index) => (
                <div key={`${pedido.id}-${index}`} style={styles.itemRow}>
                  <div>
                    <div style={styles.itemName}>
                      {item.qtd}x {item.nome}
                    </div>
                    <div style={styles.itemSub}>
                      {dinheiro(Number(item.preco || 0))} cada
                    </div>
                  </div>

                  <div style={styles.itemPrice}>
                    {dinheiro(Number(item.preco || 0) * Number(item.qtd || 0))}
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.totalBox}>
              <div style={styles.totalLabel}>Total do pedido</div>
              <div style={styles.totalValue}>{dinheiro(Number(pedido.total || 0))}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatusStep({
  ativo,
  titulo,
  texto,
  cor,
}: {
  ativo: boolean;
  titulo: string;
  texto: string;
  cor: string;
}) {
  return (
    <div style={styles.stepWrap}>
      <div
        style={{
          ...styles.stepCircle,
          background: ativo ? cor : "rgba(255,255,255,0.08)",
          boxShadow: ativo ? `0 0 22px ${cor}33` : "none",
        }}
      />
      <div style={styles.stepTextWrap}>
        <div style={{ ...styles.stepTitle, color: ativo ? "#fff" : "#9ea5b1" }}>
          {titulo}
        </div>
        <div style={styles.stepSub}>{texto}</div>
      </div>
    </div>
  );
}

function InfoCard({ label, valor }: { label: string; valor: string }) {
  return (
    <div style={styles.infoCard}>
      <div style={styles.infoLabel}>{label}</div>
      <div style={styles.infoValue}>{valor}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(255, 196, 86, 0.10), transparent 24%), linear-gradient(180deg, #090909 0%, #101011 48%, #131315 100%)",
    color: "#f6f7fb",
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    padding: "20px",
  },

  shell: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  hero: {
    background: "linear-gradient(180deg, rgba(18,18,20,0.96) 0%, rgba(15,15,17,0.95) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 28,
    padding: 28,
    boxShadow: "0 18px 48px rgba(0,0,0,0.28)",
    marginBottom: 18,
  },

  heroTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
  },

  badge: {
    display: "inline-flex",
    background: "rgba(255, 196, 86, 0.08)",
    border: "1px solid rgba(255, 196, 86, 0.18)",
    color: "#ffd87a",
    borderRadius: 999,
    padding: "9px 14px",
    fontSize: 14,
    fontWeight: 700,
  },

  title: {
    margin: "14px 0 0",
    fontSize: "clamp(2.2rem, 5vw, 4.3rem)",
    lineHeight: 0.95,
    letterSpacing: -2,
    color: "#ffd98a",
    fontWeight: 900,
  },

  subtitle: {
    marginTop: 14,
    color: "#d9dce3",
    fontSize: 17,
  },

  topButtons: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    padding: "12px 16px",
    background: "#18181b",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "none",
  },

  statusBox: {
    marginTop: 22,
    border: "1px solid",
    borderRadius: 24,
    padding: 18,
  },

  statusLabel: {
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: -0.8,
  },

  statusDescription: {
    marginTop: 8,
    color: "#e5e8ee",
    lineHeight: 1.5,
    fontSize: 15,
  },

  timeline: {
    marginTop: 22,
    position: "relative",
    display: "grid",
    gap: 16,
  },

  timelineLine: {
    position: "absolute",
    left: 11,
    top: 10,
    bottom: 10,
    width: 2,
    background: "rgba(255,255,255,0.08)",
  },

  stepWrap: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
    position: "relative",
    zIndex: 1,
  },

  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 999,
    flexShrink: 0,
    marginTop: 2,
  },

  stepTextWrap: {
    minWidth: 0,
  },

  stepTitle: {
    fontWeight: 900,
    fontSize: 17,
  },

  stepSub: {
    marginTop: 4,
    color: "#aeb3bd",
    fontSize: 14,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    gap: 18,
  },

  card: {
    background: "linear-gradient(180deg, rgba(18,18,20,0.96) 0%, rgba(15,15,17,0.95) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 28,
    padding: 22,
    boxShadow: "0 18px 48px rgba(0,0,0,0.28)",
  },

  sectionHead: {
    marginBottom: 16,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: -0.8,
  },

  sectionText: {
    margin: "8px 0 0",
    color: "#aeb3bd",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12,
  },

  infoCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "linear-gradient(180deg, #17171a 0%, #141417 100%)",
    borderRadius: 18,
    padding: 14,
  },

  infoLabel: {
    color: "#aeb3bd",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
  },

  infoValue: {
    color: "#fff",
    fontWeight: 800,
    lineHeight: 1.45,
  },

  itemsList: {
    display: "grid",
    gap: 10,
  },

  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "linear-gradient(180deg, #17171a 0%, #141417 100%)",
    borderRadius: 16,
    padding: 12,
  },

  itemName: {
    fontWeight: 800,
  },

  itemSub: {
    color: "#aeb3bd",
    fontSize: 13,
    marginTop: 4,
  },

  itemPrice: {
    fontWeight: 900,
    color: "#ffd87a",
  },

  totalBox: {
    marginTop: 16,
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "linear-gradient(180deg, rgba(22,22,24,0.96) 0%, rgba(16,16,18,0.96) 100%)",
    padding: 16,
    textAlign: "center",
  },

  totalLabel: {
    color: "#aeb3bd",
    fontWeight: 700,
    marginBottom: 8,
  },

  totalValue: {
    color: "#ffd87a",
    fontWeight: 900,
    fontSize: 34,
    lineHeight: 1,
  },
};
