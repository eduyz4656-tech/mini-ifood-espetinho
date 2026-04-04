@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Sora:wght@600;700;800&display=swap');

:root {
  --bg: #070707;
  --bg-soft: #101010;
  --card: rgba(18, 18, 18, 0.92);
  --card-2: rgba(24, 24, 24, 0.96);
  --line: rgba(255, 255, 255, 0.08);
  --text: #f8f8f8;
  --muted: #b8b8b8;
  --gold-1: #ffd67a;
  --gold-2: #ffb938;
  --danger: #ff5f6d;
  --shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
  --radius-xl: 28px;
  --radius-lg: 22px;
  --radius-md: 18px;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
  color: var(--text);
  font-family: 'Inter', sans-serif;
  background:
    radial-gradient(circle at top, rgba(255, 196, 86, 0.14), transparent 24%),
    radial-gradient(circle at 85% 10%, rgba(255, 153, 0, 0.08), transparent 20%),
    linear-gradient(180deg, #090909 0%, #0e0e0e 48%, #121212 100%);
  background-attachment: fixed;
  overflow-x: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
select,
textarea {
  font: inherit;
}

.pagina {
  min-height: 100vh;
}

.container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 20px;
}

.hero-card,
.card,
.hero-mini-card,
.item-card,
.total-box {
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.hero-card,
.card {
  background: linear-gradient(180deg, rgba(20,20,20,0.96) 0%, rgba(16,16,16,0.94) 100%);
  border: 1px solid var(--line);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow);
}

.hero-card {
  padding: 28px;
  margin-bottom: 18px;
  position: relative;
  overflow: hidden;
}

.hero-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top right, rgba(255, 196, 86, 0.10), transparent 26%),
    linear-gradient(180deg, transparent, rgba(255,255,255,0.01));
  pointer-events: none;
}

.card {
  padding: 22px;
}

.top-fixed-actions {
  position: sticky;
  top: 16px;
  z-index: 100;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.botao-carrinho-fixo {
  width: auto;
  min-width: 92px;
  border-radius: 999px;
  padding: 13px 18px;
}

.hero-topo {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.hero-badge {
  display: inline-flex;
  background: rgba(255, 196, 86, 0.08);
  border: 1px solid rgba(255, 196, 86, 0.18);
  color: var(--gold-1);
  border-radius: 999px;
  padding: 9px 14px;
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.hero-instagram {
  color: #f6d799;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 0.4px;
}

.hero-titulo {
  margin: 0;
  font-family: 'Sora', sans-serif;
  font-size: clamp(2.5rem, 5.4vw, 4.8rem);
  line-height: 0.95;
  letter-spacing: -2px;
  color: #ffd98a;
  text-shadow: 0 0 30px rgba(255, 185, 56, 0.08);
}

.hero-subtitulo {
  max-width: 720px;
  margin: 14px auto 0;
  color: #d5d5d5;
  font-size: 1.08rem;
  line-height: 1.5;
  text-align: center;
}

.hero-info {
  display: grid;
  gap: 8px;
  margin-top: 22px;
  color: #ececec;
  font-weight: 600;
}

.hero-acoes {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.hero-resumo-centro {
  display: flex;
  gap: 14px;
  align-items: stretch;
  justify-content: center;
  width: 100%;
  margin-top: 18px;
  flex-wrap: wrap;
}

.destaque-centro {
  min-width: 220px;
  text-align: center;
}

.hero-mini-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(22,22,22,0.92) 0%, rgba(16,16,16,0.9) 100%);
  padding: 18px;
  display: grid;
  gap: 8px;
}

.hero-mini-card span {
  color: var(--muted);
  font-weight: 600;
}

.hero-mini-card strong {
  font-size: 2rem;
  color: var(--gold-1);
  line-height: 1;
}

.conteudo-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}

.sem-carrinho-lateral {
  grid-template-columns: 1fr;
}

.full-width {
  width: 100%;
}

.secao-topo {
  margin-bottom: 16px;
}

.secao-titulo {
  margin: 0;
  font-family: 'Sora', sans-serif;
  font-size: 1.9rem;
  letter-spacing: -0.8px;
}

.secao-subtitulo {
  margin: 8px 0 0;
  color: var(--muted);
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.campo {
  width: 100%;
  background: linear-gradient(180deg, #111 0%, #151515 100%);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: var(--radius-md);
  padding: 16px 18px;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.campo::placeholder {
  color: #949494;
}

.campo:focus {
  border-color: rgba(255, 196, 86, 0.5);
  box-shadow: 0 0 0 4px rgba(255, 196, 86, 0.10);
  transform: translateY(-1px);
}

textarea.campo {
  resize: vertical;
  min-height: 110px;
}

.margem-top {
  margin-top: 14px;
}

.tipo-entrega {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.tag,
.tag-ativa,
.botao-secundario,
.mini-btn,
.danger-btn,
.botao-principal {
  border: none;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, opacity 0.18s ease;
}

.tag,
.tag-ativa {
  border-radius: 999px;
  padding: 11px 17px;
  font-weight: 700;
  border: 1px solid rgba(255,255,255,0.10);
}

.tag {
  background: #171717;
  color: #fff;
}

.tag-ativa {
  background: linear-gradient(180deg, var(--gold-1) 0%, var(--gold-2) 100%);
  color: #111;
  font-weight: 800;
  box-shadow: 0 12px 24px rgba(255, 185, 56, 0.16);
}

.botao-principal {
  width: 100%;
  border-radius: 18px;
  padding: 15px 18px;
  font-weight: 900;
  color: #111;
  background: linear-gradient(180deg, var(--gold-1) 0%, var(--gold-2) 100%);
  box-shadow: 0 14px 28px rgba(255, 185, 56, 0.18);
}

.botao-principal:hover {
  transform: translateY(-2px);
}

.botao-principal:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

.botao-secundario {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  padding: 12px 16px;
  background: #171717;
  border: 1px solid rgba(255,255,255,0.12);
  color: #fff;
  font-weight: 700;
}

.troco-label {
  font-weight: 800;
  margin-bottom: 10px;
}

.erro-texto {
  margin-bottom: 14px;
  color: #ff7777;
  font-weight: 800;
}

.categoria-secao + .categoria-secao {
  margin-top: 26px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.categoria-titulo {
  margin: 0 0 14px;
  color: var(--gold-1);
  font-family: 'Sora', sans-serif;
  font-size: 1.18rem;
}

.produtos-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.produto-card {
  border: 1px solid rgba(255,255,255,0.08);
  background: linear-gradient(180deg, #171717 0%, #131313 100%);
  color: #fff;
  border-radius: 22px;
  padding: 16px 18px;
  min-height: 102px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.produto-card:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 196, 86, 0.28);
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.22);
}

.produto-card-topo {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
}

.produto-nome {
  font-weight: 800;
  line-height: 1.35;
}

.produto-preco {
  color: var(--gold-1);
  font-weight: 800;
  white-space: nowrap;
}

.produto-add-texto {
  margin-top: 14px;
  color: #a8a8a8;
  font-size: 0.92rem;
}

.itens-carrinho {
  display: grid;
  gap: 12px;
}

.item-card {
  border: 1px solid rgba(255,255,255,0.08);
  background: linear-gradient(180deg, #171717 0%, #141414 100%);
  border-radius: 20px;
  padding: 14px;
}

.item-topo,
.modal-topo {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.item-nome {
  font-weight: 800;
  line-height: 1.35;
}

.item-info,
.texto-suave {
  color: var(--muted);
}

.item-total,
.total-texto {
  font-weight: 900;
}

.item-acoes {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 12px;
}

.mini-btn {
  background: #2c2c2c;
  color: #fff;
  border-radius: 12px;
  padding: 9px 12px;
  font-weight: 800;
}

.danger-btn {
  background: linear-gradient(180deg, #ff7f88 0%, #ff5f6d 100%);
  color: #fff;
  border-radius: 14px;
  padding: 10px 14px;
  font-weight: 800;
}

.total-box {
  margin-top: 18px;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  background: linear-gradient(180deg, #171717 0%, #141414 100%);
  padding: 16px;
}

.pequeno {
  font-size: 0.92rem;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.66);
  display: flex;
  justify-content: flex-end;
  z-index: 9999;
  animation: fadeIn 0.18s ease;
}

.carrinho-modal {
  width: 100%;
  max-width: 430px;
  height: 100%;
  background: linear-gradient(180deg, #0f0f0f 0%, #121212 100%);
  border-left: 1px solid rgba(255,255,255,0.08);
  padding: 20px;
  overflow-y: auto;
  animation: slideIn 0.22s ease;
}

.footer-creditos {
  margin-top: 28px;
  padding: 24px;
  text-align: center;
  color: #d4d4d4;
  border-top: 1px solid rgba(255,255,255,0.08);
  font-size: 0.98rem;
  line-height: 1.8;
}

.flying-item {
  position: fixed;
  z-index: 99999;
  pointer-events: none;
  background: linear-gradient(180deg, var(--gold-1) 0%, var(--gold-2) 100%);
  color: #111;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 0.82rem;
  font-weight: 800;
  white-space: nowrap;
  transform: translate(0, 0) scale(1);
  transition: transform 0.65s cubic-bezier(.2,.8,.2,1), opacity 0.65s ease;
  box-shadow: 0 14px 24px rgba(255, 185, 56, 0.22);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    transform: translateX(18px);
    opacity: 0.4;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 920px) {
  .grid-2,
  .produtos-grid {
    grid-template-columns: 1fr;
  }

  .hero-titulo {
    font-size: 2.2rem;
    letter-spacing: -1px;
  }

  .hero-resumo-centro {
    flex-direction: column;
  }

  .botao-carrinho-fixo {
    min-width: 78px;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 14px;
  }

  .hero-card,
  .card {
    padding: 18px;
    border-radius: 22px;
  }

  .hero-titulo {
    font-size: 1.9rem;
  }

  .secao-titulo {
    font-size: 1.55rem;
  }

  .carrinho-modal {
    max-width: 100%;
  }

  .produto-card {
    min-height: 94px;
  }
}
