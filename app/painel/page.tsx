"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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

const SENHA_ADM = "1234";

function dinheiro(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function nomeStatus(status: string) {
  if (status === "novo") return "Novo";
  if (status === "preparo") return "Em preparo";
  if (status === "entregue") return "Entregue";
  return status;
}

function corStatus(status: string) {
  if (status === "novo") {
    return {
      fundo: "rgba(255, 184, 56, 0.14)",
      borda: "rgba(255, 184, 56, 0.34)",
      cor: "#ffd87a",
    };
  }

  if (status === "preparo") {
    return {
      fundo: "rgba(88, 160, 255, 0.14)",
      borda: "rgba(88, 160, 255, 0.34)",
      cor: "#8fc0ff",
    };
  }

  return {
    fundo: "rgba(42, 181, 125, 0.14)",
    borda: "rgba(42, 181, 125, 0.34)",
    cor: "#7be0b1",
  };
}

export default function PainelPage() {
  const [senha, setSenha] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [limpando, setLimpando] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "novo" | "preparo" | "entregue">("todos");

  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastPedidoIdRef = useRef<number | null>(null);
  const jaInicializouRef = useRef(false);

  function tocarSomNovoPedido() {
    try {
      const AudioContextClass =
        window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "triangle";

      osc1.frequency.setValueAtTime(880, now);
      osc2.frequency.setValueAtTime(1174, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.02);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } catch {}
  }

  useEffect(() => {
    const salvo = sessionStorage.getItem("adm-autorizado");
    if (salvo === "sim") {
      setAutorizado(true);
    } else {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!autorizado) return;

    buscarPedidos();

    const channel = supabase
      .channel("adm-pedidos-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos",
        },
        () => {
          buscarPedidosSilencioso();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [autorizado]);

  async function buscarPedidos() {
    setCarregando(true);

    const { data } = await supabase
      .from("pedidos")
      .select("*")
      .order("id", { ascending: false });

    const lista = (data as Pedido[]) || [];
    processarNovosPedidos(lista, false);
    setPedidos(lista);
    setCarregando(false);
  }

  async function buscarPedidosSilencioso() {
    const { data } = await supabase
      .from("pedidos")
      .select("*")
      .order("id", { ascending: false });

    const lista = (data as Pedido[]) || [];
    processarNovosPedidos(lista, true);
    setPedidos(lista);
  }

  function processarNovosPedidos(lista: Pedido[], permitirSom: boolean) {
    const maiorId = lista.length > 0 ? Math.max(...lista.map((p) => Number(p.id))) : null;

    if (!jaInicializouRef.current) {
      lastPedidoIdRef.current = maiorId;
      jaInicializouRef.current = true;
      return;
    }

    if (
      permitirSom &&
      maiorId !== null &&
      lastPedidoIdRef.current !== null &&
      maiorId > lastPedidoIdRef.current
    ) {
      tocarSomNovoPedido();
    }

    lastPedidoIdRef.current = maiorId;
  }

  function entrar() {
    if (senha !== SENHA_ADM) {
      alert("Senha incorreta.");
      return;
    }

    sessionStorage.setItem("adm-autorizado", "sim");
    setAutorizado(true);
    setCarregando(true);
  }

  function sair() {
    sessionStorage.removeItem("adm-autorizado");
    setAutorizado(false);
    setSenha("");
    setPedidos([]);
    setPedidoSelecionado(null);
    setCarregando(false);
    jaInicializouRef.current = false;
    lastPedidoIdRef.current = null;
  }

  async function mudarStatus(id: number, status: "novo" | "preparo" | "entregue") {
    setAtualizando(true);

    const { error } = await supabase.from("pedidos").update({ status }).eq("id", id);

    if (error) {
      alert("Erro ao atualizar status.");
    }

    await buscarPedidosSilencioso();

    if (pedidoSelecionado?.id === id) {
      setPedidoSelecionado((prev) => (prev ? { ...prev, status } : prev));
    }

    setAtualizando(false);
  }

  async function apagarEntregues() {
    const confirmar = confirm("Apagar todos os pedidos entregues?");
    if (!confirmar) return;

    setLimpando(true);

    const { error } = await supabase
      .from("pedidos")
      .delete()
      .eq("status", "entregue");

    if (error) {
      alert("Erro ao apagar pedidos entregues.");
    }

    await buscarPedidosSilencioso();
    setPedidoSelecionado(null);
    setLimpando(false);
  }

  function imprimirPedido(pedido: Pedido) {
    const itensTexto = (pedido.itens || [])
      .map(
        (item) =>
          `${item.qtd}x ${item.nome} - ${dinheiro(Number(item.preco || 0) * Number(item.qtd || 0))}`
      )
      .join("\n");

    const conteudo = `
ADM - Espetinho do Thalisca

Pedido #${pedido.id}
Status: ${nomeStatus(pedido.status)}

Cliente: ${pedido.nome}
Telefone: ${pedido.telefone}
Entrega: ${pedido.tipo_entrega}
Local: ${pedido.endereco}
Pagamento: ${pedido.pagamento}

Observação:
${pedido.observacao || "Sem observação"}

Itens:
${itensTexto || "Sem itens"}

Total:
${dinheiro(Number(pedido.total || 0))}
    `.trim();

    const janela = window.open("", "_blank", "width=700,height=900");
    if (!janela) return;

    janela.document.write(`
      <html>
        <head>
          <title>Pedido #${pedido.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              white-space: pre-wrap;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>${conteudo.replace(/\n/g, "<br/>")}</body>
      </html>
    `);
    janela.document.close();
    janela.focus();
    janela.print();
  }

  const pedidosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return pedidos.filter((pedido) => {
      const bateBusca =
        termo === "" ||
        pedido.nome?.toLowerCase().includes(termo) ||
        pedido.telefone?.toLowerCase().includes(termo) ||
        String(pedido.id).includes(termo);

      const bateStatus = filtroStatus === "todos" || pedido.status === filtroStatus;

      return bateBusca && bateStatus;
    });
  }, [pedidos, busca, filtroStatus]);

  const novos = useMemo(() => pedidosFiltrados.filter((p) => p.status === "novo"), [pedidosFiltrados]);
  const preparo = useMemo(() => pedidosFiltrados.filter((p) => p.status === "preparo"), [pedidosFiltrados]);
  const entregues = useMemo(() => pedidosFiltrados.filter((p) => p.status === "entregue"), [pedidosFiltrados]);

  const faturamento = useMemo(() => {
    return pedidos
      .filter((p) => p.status === "entregue")
      .reduce((acc, pedido) => acc + Number(pedido.total || 0), 0);
  }, [pedidos]);

  const ticketMedio = useMemo(() => {
    const entreguesBase = pedidos.filter((p) => p.status === "entregue");
    if (entreguesBase.length === 0) return 0;
    return faturamento / entreguesBase.length;
  }, [pedidos, faturamento]);

  if (!autorizado) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          <section style={styles.hero}>
            <div style={styles.badge}>Acesso restrito</div>
            <h1 style={styles.heroTitle}>ADM</h1>
            <p style={styles.heroText}>Entre para gerenciar os pedidos do espetinho.</p>
          </section>

          <section style={{ ...styles.card, maxWidth: 520, margin: "0 auto" }}>
            <label style={styles.label}>Senha do ADM</label>

            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite a senha"
              style={styles.input}
            />

            <button onClick={entrar} style={styles.primaryButton}>
              Entrar
            </button>

            <Link href="/" style={{ ...styles.secondaryButton, marginTop: 12 }}>
              Voltar para o cliente
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.hero}>
          <div style={styles.topBar}>
            <div>
              <div style={styles.badge}>Painel administrativo</div>
              <h1 style={styles.heroTitle}>ADM</h1>
              <p style={styles.heroText}>Gerencie os pedidos do espetinho em tempo real.</p>
            </div>

            <div style={styles.topButtons}>
              <Link href="/" style={styles.secondaryButton}>
                Ver cliente
              </Link>

              <button onClick={apagarEntregues} style={styles.warningButton}>
                {limpando ? "Limpando..." : "Limpar entregues"}
              </button>

              <button onClick={sair} style={styles.dangerButton}>
                Sair
              </button>
            </div>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Novos</span>
              <strong style={styles.statValue}>{pedidos.filter((p) => p.status === "novo").length}</strong>
            </div>

            <div style={styles.statCard}>
              <span style={styles.statLabel}>Em preparo</span>
              <strong style={styles.statValue}>{pedidos.filter((p) => p.status === "preparo").length}</strong>
            </div>

            <div style={styles.statCard}>
              <span style={styles.statLabel}>Entregues</span>
              <strong style={styles.statValue}>{pedidos.filter((p) => p.status === "entregue").length}</strong>
            </div>

            <div style={styles.statCard}>
              <span style={styles.statLabel}>Faturamento</span>
              <strong style={styles.statValue}>{dinheiro(faturamento)}</strong>
            </div>

            <div style={styles.statCard}>
              <span style={styles.statLabel}>Ticket médio</span>
              <strong style={styles.statValue}>
                {ticketMedio > 0 ? dinheiro(ticketMedio) : "R$ 0,00"}
              </strong>
            </div>
          </div>

          <div style={styles.filtersBar}>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, telefone ou número do pedido"
              style={styles.searchInput}
            />

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as "todos" | "novo" | "preparo" | "entregue")}
              style={styles.select}
            >
              <option value="todos">Todos os status</option>
              <option value="novo">Novos</option>
              <option value="preparo">Em preparo</option>
              <option value="entregue">Entregues</option>
            </select>
          </div>
        </section>

        {carregando ? (
          <section style={styles.card}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Carregando pedidos...</h2>
              <p style={styles.sectionText}>Buscando os dados no sistema.</p>
            </div>
          </section>
        ) : (
          <section style={styles.columnsGrid}>
            <ColunaPedidos
              titulo="🆕 Novos"
              subtitulo="Pedidos recém-chegados."
              pedidos={novos}
              vazio="Nenhum pedido novo."
              onAbrir={(pedido) => setPedidoSelecionado(pedido)}
              onImprimir={(pedido) => imprimirPedido(pedido)}
              acaoLabel="Colocar em preparo"
              onAcao={(id) => mudarStatus(id, "preparo")}
            />

            <ColunaPedidos
              titulo="🔥 Em preparo"
              subtitulo="Pedidos em andamento."
              pedidos={preparo}
              vazio="Nenhum pedido em preparo."
              onAbrir={(pedido) => setPedidoSelecionado(pedido)}
              onImprimir={(pedido) => imprimirPedido(pedido)}
              acaoLabel="Marcar como entregue"
              onAcao={(id) => mudarStatus(id, "entregue")}
            />

            <ColunaPedidos
              titulo="✅ Entregues"
              subtitulo="Pedidos finalizados."
              pedidos={entregues}
              vazio="Nenhum pedido entregue."
              onAbrir={(pedido) => setPedidoSelecionado(pedido)}
              onImprimir={(pedido) => imprimirPedido(pedido)}
            />
          </section>
        )}

        {atualizando ? <div style={styles.syncBadge}>Atualizando status...</div> : null}
      </div>

      {pedidoSelecionado ? (
        <div style={styles.overlay} onClick={() => setPedidoSelecionado(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTop}>
              <div>
                <div style={styles.badge}>Pedido #{pedidoSelecionado.id}</div>
                <h2 style={{ ...styles.sectionTitle, marginTop: 12 }}>Detalhes do pedido</h2>
              </div>

              <div style={styles.modalTopButtons}>
                <button
                  onClick={() => imprimirPedido(pedidoSelecionado)}
                  style={styles.warningButton}
                >
                  Imprimir
                </button>

                <button onClick={() => setPedidoSelecionado(null)} style={styles.secondaryButton}>
                  Fechar
                </button>
              </div>
            </div>

            <div
              style={{
                ...styles.statusBadge,
                background: corStatus(pedidoSelecionado.status).fundo,
                borderColor: corStatus(pedidoSelecionado.status).borda,
                color: corStatus(pedidoSelecionado.status).cor,
                marginBottom: 16,
              }}
            >
              {nomeStatus(pedidoSelecionado.status)}
            </div>

            <div style={styles.detailsGrid}>
              <InfoBox label="Cliente" valor={pedidoSelecionado.nome} />
              <InfoBox label="Telefone" valor={pedidoSelecionado.telefone} />
              <InfoBox label="Entrega" valor={pedidoSelecionado.tipo_entrega} />
              <InfoBox label="Pagamento" valor={pedidoSelecionado.pagamento} />
              <InfoBox label="Local" valor={pedidoSelecionado.endereco} />
              <InfoBox label="Total" valor={dinheiro(Number(pedidoSelecionado.total || 0))} />
            </div>

            {pedidoSelecionado.observacao ? (
              <div style={{ ...styles.infoCard, marginTop: 14 }}>
                <div style={styles.infoLabel}>Observação</div>
                <div style={styles.infoValue}>{pedidoSelecionado.observacao}</div>
              </div>
            ) : null}

            <div style={{ marginTop: 18 }}>
              <div style={{ ...styles.infoLabel, marginBottom: 10 }}>Itens do pedido</div>

              <div style={styles.itemsList}>
                {(pedidoSelecionado.itens || []).map((item, index) => (
                  <div key={`${pedidoSelecionado.id}-${index}`} style={styles.itemRow}>
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
            </div>

            <div style={styles.modalActions}>
              {pedidoSelecionado.status === "novo" ? (
                <button
                  onClick={() => mudarStatus(pedidoSelecionado.id, "preparo")}
                  style={styles.primaryButton}
                >
                  Colocar em preparo
                </button>
              ) : null}

              {pedidoSelecionado.status === "preparo" ? (
                <button
                  onClick={() => mudarStatus(pedidoSelecionado.id, "entregue")}
                  style={styles.primaryButton}
                >
                  Marcar como entregue
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function ColunaPedidos({
  titulo,
  subtitulo,
  pedidos,
  vazio,
  onAbrir,
  onImprimir,
  acaoLabel,
  onAcao,
}: {
  titulo: string;
  subtitulo: string;
  pedidos: Pedido[];
  vazio: string;
  onAbrir: (pedido: Pedido) => void;
  onImprimir: (pedido: Pedido) => void;
  acaoLabel?: string;
  onAcao?: (id: number) => void;
}) {
  return (
    <section style={styles.card}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>{titulo}</h2>
        <p style={styles.sectionText}>{subtitulo}</p>
      </div>

      {pedidos.length === 0 ? (
        <p style={styles.emptyText}>{vazio}</p>
      ) : (
        <div style={styles.cardsList}>
          {pedidos.map((pedido) => {
            const statusVisual = corStatus(pedido.status);

            return (
              <div key={pedido.id} style={styles.orderCard}>
                <div style={styles.orderTop}>
                  <strong style={styles.orderId}>Pedido #{pedido.id}</strong>
                  <span
                    style={{
                      ...styles.statusBadge,
                      background: statusVisual.fundo,
                      borderColor: statusVisual.borda,
                      color: statusVisual.cor,
                    }}
                  >
                    {nomeStatus(pedido.status)}
                  </span>
                </div>

                <div style={styles.orderName}>{pedido.nome}</div>
                <div style={styles.orderMeta}>
                  {pedido.tipo_entrega} • {pedido.pagamento}
                </div>
                <div style={styles.orderAddress}>{pedido.endereco}</div>

                <div style={styles.orderBottom}>
                  <div style={styles.orderTotal}>
                    {dinheiro(Number(pedido.total || 0))}
                  </div>

                  <div style={styles.cardActionsMini}>
                    <button onClick={() => onAbrir(pedido)} style={styles.miniButton}>
                      Ver
                    </button>

                    <button onClick={() => onImprimir(pedido)} style={styles.printButton}>
                      Imprimir
                    </button>
                  </div>
                </div>

                {acaoLabel && onAcao ? (
                  <button onClick={() => onAcao(pedido.id)} style={styles.primaryButtonSmall}>
                    {acaoLabel}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function InfoBox({ label, valor }: { label: string; valor: string }) {
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
    maxWidth: "1400px",
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

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
  },

  topButtons: {
    display: "flex",
    gap: 10,
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

  heroTitle: {
    margin: "14px 0 0",
    fontSize: "clamp(2.4rem, 5vw, 4.4rem)",
    lineHeight: 0.95,
    letterSpacing: -2,
    color: "#ffd98a",
    fontWeight: 900,
  },

  heroText: {
    marginTop: 14,
    color: "#d9dce3",
    fontSize: 17,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
    marginTop: 22,
  },

  statCard: {
    minWidth: 180,
    textAlign: "center",
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "linear-gradient(180deg, rgba(22,22,24,0.96) 0%, rgba(16,16,18,0.96) 100%)",
    padding: 18,
    display: "grid",
    gap: 8,
  },

  statLabel: {
    color: "#aeb3bd",
    fontWeight: 600,
    fontSize: 14,
  },

  statValue: {
    fontSize: 30,
    color: "#ffd87a",
    lineHeight: 1,
    fontWeight: 900,
  },

  filtersBar: {
    display: "grid",
    gridTemplateColumns: "1.5fr 0.8fr",
    gap: 12,
    marginTop: 18,
  },

  searchInput: {
    width: "100%",
    background: "linear-gradient(180deg, #111114 0%, #16161a 100%)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: "16px 18px",
    outline: "none",
  },

  select: {
    width: "100%",
    background: "linear-gradient(180deg, #111114 0%, #16161a 100%)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: "16px 18px",
    outline: "none",
  },

  card: {
    background: "linear-gradient(180deg, rgba(18,18,20,0.96) 0%, rgba(15,15,17,0.95) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 28,
    padding: 22,
    boxShadow: "0 18px 48px rgba(0,0,0,0.28)",
  },

  sectionHeader: {
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

  columnsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 18,
  },

  cardsList: {
    display: "grid",
    gap: 12,
  },

  orderCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "linear-gradient(180deg, #17171a 0%, #141417 100%)",
    borderRadius: 20,
    padding: 14,
  },

  orderTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },

  orderId: {
    fontSize: 18,
    fontWeight: 800,
  },

  orderName: {
    marginTop: 10,
    fontWeight: 800,
    fontSize: 17,
  },

  orderMeta: {
    marginTop: 8,
    color: "#aeb3bd",
    fontSize: 14,
  },

  orderAddress: {
    marginTop: 6,
    color: "#d9dce3",
    fontSize: 14,
    lineHeight: 1.4,
  },

  orderBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },

  orderTotal: {
    fontWeight: 900,
    color: "#ffd87a",
    fontSize: 20,
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid transparent",
    fontSize: 13,
    fontWeight: 800,
  },

  cardActionsMini: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  miniButton: {
    background: "#2a2a31",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "9px 14px",
    fontWeight: 800,
    cursor: "pointer",
  },

  printButton: {
    background: "rgba(255, 216, 122, 0.14)",
    color: "#ffd87a",
    border: "1px solid rgba(255, 216, 122, 0.28)",
    borderRadius: 12,
    padding: "9px 14px",
    fontWeight: 800,
    cursor: "pointer",
  },

  primaryButton: {
    width: "100%",
    borderRadius: 18,
    padding: "15px 18px",
    fontWeight: 900,
    color: "#111",
    background: "linear-gradient(180deg, #ffd87a 0%, #ffb938 100%)",
    border: "none",
    boxShadow: "0 14px 28px rgba(255, 185, 56, 0.18)",
    cursor: "pointer",
  },

  primaryButtonSmall: {
    width: "100%",
    marginTop: 12,
    borderRadius: 16,
    padding: "13px 16px",
    fontWeight: 900,
    color: "#111",
    background: "linear-gradient(180deg, #ffd87a 0%, #ffb938 100%)",
    border: "none",
    boxShadow: "0 14px 28px rgba(255, 185, 56, 0.18)",
    cursor: "pointer",
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
  },

  dangerButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    padding: "12px 16px",
    background: "linear-gradient(180deg, #ff7f8f 0%, #ff6477 100%)",
    border: "none",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },

  warningButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    padding: "12px 16px",
    background: "linear-gradient(180deg, #ffd87a 0%, #ffb938 100%)",
    border: "none",
    color: "#111",
    fontWeight: 900,
    cursor: "pointer",
  },

  emptyText: {
    color: "#aeb3bd",
    marginTop: 8,
  },

  syncBadge: {
    position: "fixed",
    right: 20,
    bottom: 20,
    zIndex: 9999,
    background: "rgba(255, 184, 56, 0.14)",
    border: "1px solid rgba(255, 184, 56, 0.34)",
    color: "#ffd87a",
    borderRadius: 999,
    padding: "10px 14px",
    fontWeight: 800,
  },

  label: {
    display: "block",
    marginBottom: 10,
    color: "#d9dce3",
    fontWeight: 700,
  },

  input: {
    width: "100%",
    background: "linear-gradient(180deg, #111114 0%, #16161a 100%)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: "16px 18px",
    outline: "none",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.66)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 9999,
  },

  modal: {
    width: "100%",
    maxWidth: 760,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "linear-gradient(180deg, #101013 0%, #141418 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 20,
  },

  modalTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },

  modalTopButtons: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
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

  modalActions: {
    marginTop: 18,
  },
};
