/* =========================================================
   common.js — funzioni condivise da tutte le pagine
   - intestazione/navigazione, tema chiaro/scuro
   - caricamento dei file JSON in /data
   - salvataggio dei progressi in localStorage
   - rendering matematico con KaTeX
   ========================================================= */

const NAV = [
  { href: "index.html", label: "Home" },
  { href: "programma.html", label: "Programma" },
  { href: "calendario.html", label: "Percorso" },
  { href: "formulario.html", label: "Formulario" },
  { href: "esercizi.html", label: "Esercizi" },
  { href: "laboratorio.html", label: "Laboratorio" },
  { href: "esame.html", label: "Esame" },
  { href: "risorse.html", label: "Risorse" },
];

const TIPI_LEZIONE = {
  teoria: "Teoria",
  esercitazione: "Esercitazione",
  laboratorio: "Laboratorio",
  misura: "Teoria della misura",
  altro: "Altro",
};

/* ---------- utilità DOM ---------- */
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
function pct(done, total) { return total ? Math.round((done / total) * 100) : 0; }
function progressBar(p, color) {
  return `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}"><span style="width:${p}%;${color ? `--bc:${color}` : ""}"></span></div>`;
}
/* testo normalizzato per la ricerca: minuscolo, senza accenti */
function norm(s) {
  return String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/* ---------- tema ---------- */
const THEME_KEY = "fg2-theme";
function currentTheme() {
  const t = document.documentElement.dataset.theme;
  if (t) return t;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function toggleTheme() {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage non disponibile */ }
  updateThemeButton();
}
function updateThemeButton() {
  const b = $("#theme-btn");
  if (!b) return;
  const dark = currentTheme() === "dark";
  b.textContent = dark ? "☀" : "☾";
  b.title = dark ? "Tema chiaro" : "Tema scuro";
  b.setAttribute("aria-label", b.title);
}

/* ---------- header / footer ---------- */
function renderChrome() {
  const page = location.pathname.split("/").pop() || "index.html";
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="header-inner">
      <a class="brand" href="index.html">Fisica <span>II</span></a>
      <nav class="nav" id="nav" aria-label="Navigazione principale">
        ${NAV.map((n) => `<a href="${n.href}"${n.href === page ? ' aria-current="page"' : ""}>${n.label}</a>`).join("")}
      </nav>
      <form class="header-search" action="cerca.html" role="search">
        <input type="search" name="q" placeholder="Cerca argomento…" aria-label="Cerca nel sito">
      </form>
      <div class="header-tools">
        <button class="icon-btn" id="theme-btn" type="button"></button>
        <button class="icon-btn menu-btn" id="menu-btn" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav">☰</button>
      </div>
    </div>`;
  document.body.prepend(header);

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `Fisica Generale II · Ingegneria Elettronica · Roma · a.a. 2026/2027 — sito di studio personale, non ufficiale.
    I progressi sono salvati solo in questo browser (localStorage).`;
  document.body.append(footer);

  $("#theme-btn").addEventListener("click", toggleTheme);
  updateThemeButton();
  const menuBtn = $("#menu-btn");
  menuBtn.addEventListener("click", () => {
    const open = $("#nav").classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
}

/* ---------- dati ---------- */
const _cache = {};
async function loadData(...names) {
  const out = {};
  await Promise.all(names.map(async (n) => {
    if (!_cache[n]) {
      _cache[n] = fetch(`data/${n}.json`).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} su data/${n}.json`);
        return r.json();
      });
    }
    out[n] = await _cache[n];
  }));
  return out;
}
function showLoadError(err) {
  const main = $("main");
  const fileProto = location.protocol === "file:";
  main.insertAdjacentHTML("afterbegin", `<div class="notice"><strong>Impossibile caricare i dati.</strong> ${esc(err.message)}<br>
    ${fileProto ? "Stai aprendo il sito come file locale: i browser bloccano la lettura dei JSON. Avvia un server locale nella cartella del sito, ad esempio <code>python3 -m http.server</code>, e apri <code>http://localhost:8000</code> (oppure usa la versione su GitHub Pages)." : "Controlla che il file JSON esista e sia valido."}</div>`);
}

/* blocchi del programma: indici utili */
function indexProgramma(programma) {
  const blocchi = {};
  const sezioni = {};
  for (const b of programma.blocchi) {
    blocchi[b.id] = b;
    for (const s of b.sezioni) sezioni[s.id] = { ...s, blocco: b };
  }
  return { blocchi, sezioni };
}
function blockColor(bid) { return bid ? `var(--${bid})` : "var(--border)"; }
function blockOfSection(sid) { return sid ? sid.slice(0, 2) : null; }
function sectionLabel(sez) {
  if (!sez) return "";
  return sez.titolo ? sez.titolo : `Blocco ${sez.blocco.numero} — ${sez.blocco.titolo}`;
}

/* ---------- progressi (localStorage) ---------- */
const STORE_KEY = "fg2-progress-v1";
const Store = {
  _data: null,
  _load() {
    if (this._data) return this._data;
    try { this._data = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { this._data = {}; }
    return this._data;
  },
  _save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this._data)); } catch (e) { /* storage pieno o bloccato */ }
  },
  get(cat, id) { const d = this._load(); return !!(d[cat] && d[cat][id]); },
  set(cat, id, val) {
    const d = this._load();
    d[cat] = d[cat] || {};
    if (val) d[cat][id] = true; else delete d[cat][id];
    this._save();
  },
  count(cat, ids) { return ids.filter((id) => this.get(cat, id)).length; },
  exportJSON() { return JSON.stringify({ versione: 1, esportato: new Date().toISOString(), progressi: this._load() }, null, 2); },
  importJSON(text) {
    const obj = JSON.parse(text);
    if (!obj || typeof obj.progressi !== "object") throw new Error("Formato non valido");
    this._data = obj.progressi;
    this._save();
  },
  reset() { this._data = {}; this._save(); },
};

/* checkbox collegata a una voce di Store; onChange viene chiamata dopo il salvataggio */
function bindChecks(root, onChange) {
  root.addEventListener("change", (e) => {
    const cb = e.target;
    if (!cb.matches('input[type="checkbox"][data-cat]')) return;
    Store.set(cb.dataset.cat, cb.dataset.id, cb.checked);
    const wrap = cb.closest(".check");
    if (wrap) wrap.classList.toggle("done", cb.checked);
    if (onChange) onChange(cb);
  });
}
function checkbox(cat, id, labelHtml, extraClass = "") {
  const on = Store.get(cat, id);
  return `<label class="check ${on ? "done" : ""} ${extraClass}"><input type="checkbox" data-cat="${cat}" data-id="${esc(id)}"${on ? " checked" : ""}><span class="check-text">${labelHtml}</span></label>`;
}

/* ---------- KaTeX ---------- */
function tex(src, display = true) {
  if (window.katex) {
    return katex.renderToString(src, { displayMode: display, throwOnError: false, strict: "ignore" });
  }
  return `<code>${esc(src)}</code>`;
}
function renderMathIn(el) {
  if (window.renderMathInElement) {
    renderMathInElement(el, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
      throwOnError: false,
      strict: "ignore",
    });
  }
}

/* porta in vista l'elemento indicato dall'hash dopo il rendering dinamico */
function scrollToHash() {
  if (!location.hash) return;
  const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (!t) return;
  const det = t.closest("details");
  if (det) det.open = true;
  // elementi alti (intere sezioni) allineati in alto, elementi piccoli al centro
  t.scrollIntoView({ block: t.offsetHeight > window.innerHeight / 2 ? "start" : "center" });
}

/* avvio comune: header/footer, poi la funzione della pagina */
function page(init) {
  document.addEventListener("DOMContentLoaded", async () => {
    renderChrome();
    try {
      await init();
      scrollToHash();
    } catch (err) {
      console.error(err);
      showLoadError(err);
    }
  });
}
