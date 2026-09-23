/* =========================================================
   common.js — funzioni condivise da tutte le pagine
   - intestazione/navigazione, tema chiaro/scuro, piè di pagina
   - caricamento dei file JSON in /data
   - salvataggio dei progressi in localStorage
   - banner cookie, statistiche facoltative, CTA fissa su mobile
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

const NUM = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 });
const EXT = '<span aria-hidden="true"> ↗</span>'; // indicatore di link esterno

/* ---------- utilità DOM ---------- */
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
function pct(done, total) { return total ? Math.round((done / total) * 100) : 0; }
function progressBar(p, color) {
  return `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}" aria-label="${p}% completato"><span style="transform:scaleX(${p / 100});${color ? `--bc:${color}` : ""}"></span></div>`;
}
/* testo normalizzato per la ricerca: minuscolo, senza accenti */
function norm(s) {
  return String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
function safeSet(key, val) { try { if (val === null) localStorage.removeItem(key); else localStorage.setItem(key, val); } catch (e) { /* storage non disponibile */ } }

/* ---------- stato nell'URL (filtri condivisibili) ---------- */
function getParams() { return new URLSearchParams(location.search); }
function setParams(obj) {
  const url = new URL(location);
  for (const [k, v] of Object.entries(obj)) {
    if (v === "" || v === false || v == null) url.searchParams.delete(k);
    else url.searchParams.set(k, v === true ? "1" : v);
  }
  history.replaceState(null, "", url);
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
  safeSet(THEME_KEY, next);
  updateThemeButton();
}
function updateThemeButton() {
  const dark = currentTheme() === "dark";
  const b = $("#theme-btn");
  if (b) {
    b.innerHTML = `<span aria-hidden="true">${dark ? "☀" : "☾"}</span>`;
    b.title = dark ? "Passa al tema chiaro" : "Passa al tema scuro";
    b.setAttribute("aria-label", b.title);
  }
  // la barra del browser segue il tema scelto a mano
  if (document.documentElement.dataset.theme) {
    $all('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", dark ? "#161d27" : "#ffffff"));
  }
}

/* ---------- header / footer ---------- */
function renderChrome() {
  const page = location.pathname.split("/").pop() || "index.html";
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="header-inner">
      <a class="brand" href="index.html" translate="no">Fisica <span>II</span></a>
      <nav class="nav" id="nav" aria-label="Navigazione principale">
        ${NAV.map((n) => `<a href="${n.href}"${n.href === page ? ' aria-current="page"' : ""}>${n.label}</a>`).join("")}
      </nav>
      <form class="header-search" action="cerca.html" role="search">
        <input type="search" name="q" placeholder="Cerca argomento…" aria-label="Cerca nel sito" autocomplete="off" enterkeyhint="search">
      </form>
      <div class="header-tools">
        <button class="icon-btn" id="theme-btn" type="button"></button>
        <button class="icon-btn menu-btn" id="menu-btn" type="button" aria-label="Apri il menu" aria-expanded="false" aria-controls="nav"><span aria-hidden="true">☰</span></button>
      </div>
    </div>`;
  document.body.prepend(header);
  $(".skip-link") && document.body.prepend($(".skip-link")); // lo skip link resta il primo elemento

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <p>Fisica Generale II · Ingegneria Elettronica · Roma · a.a.&nbsp;2026/2027 — sito di studio personale, non ufficiale.</p>
    <nav class="footer-links" aria-label="Link legali">
      <a href="privacy.html">Privacy</a>
      <a href="note-legali.html">Note legali</a>
      <span id="footer-contact"></span>
      <button type="button" class="linklike" id="cookie-prefs">Preferenze cookie</button>
    </nav>`;
  document.body.append(footer);

  $("#theme-btn").addEventListener("click", toggleTheme);
  updateThemeButton();
  const menuBtn = $("#menu-btn");
  menuBtn.addEventListener("click", () => {
    const open = $("#nav").classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
  });
  $("#cookie-prefs").addEventListener("click", () => { safeSet(CONSENT_KEY, null); showConsentBanner(true); });
}

/* contatti (da data/corso.json) nel piè di pagina e negli elementi [data-contact] */
function renderContacts(corso) {
  const c = corso.contatti || {};
  const parts = [];
  if (c.email) parts.push(`<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`);
  if (c.github) parts.push(`<a href="${esc(c.github)}" target="_blank" rel="noopener">GitHub${EXT}</a>`);
  const htmlC = parts.join(" · ");
  if (htmlC) {
    $("#footer-contact").innerHTML = `Contatti: ${htmlC}`;
    $all("[data-contact]").forEach((el) => (el.innerHTML = htmlC));
  }
}

/* ---------- cookie banner e statistiche facoltative ---------- */
const CONSENT_KEY = "fg2-consent";
let _analyticsCode = null;

function loadAnalytics() {
  if (!_analyticsCode || document.getElementById("goatcounter")) return;
  const s = document.createElement("script");
  s.id = "goatcounter";
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.dataset.goatcounter = `https://${_analyticsCode}.goatcounter.com/count`;
  document.body.append(s);
}

function showConsentBanner(force = false) {
  const state = safeGet(CONSENT_KEY);
  if (state === "granted") loadAnalytics();
  if (state && !force) return;
  $("#consent")?.remove();
  const box = document.createElement("section");
  box.id = "consent";
  box.className = "consent";
  box.setAttribute("aria-label", "Informativa sui cookie");
  box.innerHTML = _analyticsCode
    ? `<p>Questo sito non usa cookie. Vuoi consentire statistiche di visita anonime e senza cookie (GoatCounter)? <a href="privacy.html">Privacy</a></p>
       <div class="consent-actions">
         <button class="btn" type="button" data-consent="denied">Rifiuta</button>
         <button class="btn primary" type="button" data-consent="granted">Accetta statistiche</button>
       </div>`
    : `<p>Questo sito non usa cookie né statistiche. I tuoi progressi restano solo in questo browser. <a href="privacy.html">Privacy</a></p>
       <div class="consent-actions"><button class="btn primary" type="button" data-consent="ack">Ho capito</button></div>`;
  document.body.append(box);
  document.body.classList.add("has-consent");
  box.addEventListener("click", (e) => {
    const b = e.target.closest("[data-consent]");
    if (!b) return;
    safeSet(CONSENT_KEY, b.dataset.consent);
    if (b.dataset.consent === "granted") loadAnalytics();
    box.remove();
    document.body.classList.remove("has-consent");
  });
}

/* ---------- CTA fissa su mobile: continua dalla prossima lezione ---------- */
function renderStickyCta(lezioni) {
  const next = lezioni.lezioni.find((l) => !Store.get("lesson", String(l.n)));
  $("#sticky-cta")?.remove();
  const bar = document.createElement("div");
  bar.id = "sticky-cta";
  bar.className = "sticky-cta";
  bar.innerHTML = next
    ? `<a class="btn primary" href="calendario.html#lez-${next.n}">Continua: Lezione&nbsp;${next.n}</a>
       <a class="btn" href="cerca.html" aria-label="Cerca nel sito"><span aria-hidden="true">⌕</span> Cerca</a>`
    : `<a class="btn primary" href="esame.html">Tutte le lezioni fatte: ripassa per l'esame</a>`;
  document.body.append(bar);
  document.body.classList.add("has-sticky-cta");
}

/* ---------- dati ---------- */
const _cache = {};
async function loadData(...names) {
  const out = {};
  await Promise.all(names.map(async (n) => {
    if (!_cache[n]) {
      _cache[n] = fetch(`data/${n}.json`).then((r) => {
        if (!r.ok) throw new Error(`Il file data/${n}.json ha risposto con errore HTTP ${r.status}.`);
        return r.json();
      });
    }
    out[n] = await _cache[n];
  }));
  return out;
}
function showLoadError(err) {
  const main = $("main");
  main.removeAttribute("aria-busy");
  $(".loading", main)?.remove();
  const fileProto = location.protocol === "file:";
  main.insertAdjacentHTML("afterbegin", `<div class="notice" role="alert"><strong>Impossibile caricare i dati.</strong> ${esc(err.message)}<br>
    ${fileProto
      ? "Stai aprendo il sito come file locale e il browser blocca la lettura dei JSON. Avvia un server nella cartella del sito (<code>python3 -m http.server</code>) e apri <code>http://localhost:8000</code>, oppure usa la versione online."
      : "Controlla la connessione e riprova. Se hai modificato un file in <code>data/</code>, verifica che sia un JSON valido (virgole e virgolette)."}
    <div style="margin-top:8px"><button class="btn" type="button" onclick="location.reload()">Riprova</button></div></div>`);
}

/* stato di caricamento mostrato finché la pagina non ha i dati */
function showLoading() {
  const main = $("main");
  if (main.children.length) return; // pagina statica: niente da caricare
  main.setAttribute("aria-busy", "true");
  main.innerHTML = `<div class="loading" role="status">
      <div class="skeleton" style="width:40%;height:2rem"></div>
      <div class="skeleton" style="width:75%"></div>
      <div class="skeleton" style="width:60%"></div>
      <div class="skeleton" style="height:120px"></div>
      <span class="visually-hidden">Caricamento…</span>
    </div>`;
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
    try { this._data = JSON.parse(safeGet(STORE_KEY)) || {}; } catch (e) { this._data = {}; }
    return this._data;
  },
  _save() { safeSet(STORE_KEY, JSON.stringify(this._data)); },
  get(cat, id) { const d = this._load(); return !!(d[cat] && d[cat][id]); },
  set(cat, id, val) {
    const d = this._load();
    d[cat] = d[cat] || {};
    if (val) d[cat][id] = true; else delete d[cat][id];
    this._save();
  },
  count(cat, ids) { return ids.filter((id) => this.get(cat, id)).length; },
  total() { return Object.values(this._load()).reduce((a, c) => a + Object.keys(c).length, 0); },
  exportJSON() { return JSON.stringify({ versione: 1, esportato: new Date().toISOString(), progressi: this._load() }, null, 2); },
  importJSON(text) {
    let obj;
    try { obj = JSON.parse(text); } catch (e) { throw new Error("Il file non è un JSON valido. Scegli il file .json creato con “Esporta progressi”."); }
    if (!obj || typeof obj.progressi !== "object" || Array.isArray(obj.progressi)) {
      throw new Error("Il file non contiene progressi di questo sito. Scegli il file creato con “Esporta progressi”.");
    }
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
    if (cb.dataset.cat === "lesson" && _cache.lezioni) _cache.lezioni.then(renderStickyCta);
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
    return `<span translate="no">${katex.renderToString(src, { displayMode: display, throwOnError: false, strict: "ignore" })}</span>`;
  }
  return `<code translate="no">${esc(src)}</code>`;
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
    $all(".katex", el).forEach((k) => k.setAttribute("translate", "no"));
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

/* avvio comune: header/footer, stato di caricamento, poi la funzione della pagina */
function page(init) {
  document.addEventListener("DOMContentLoaded", async () => {
    renderChrome();
    showLoading();
    // contatti, banner cookie e CTA mobile non bloccano la pagina
    loadData("corso", "lezioni").then(({ corso, lezioni }) => {
      _analyticsCode = (corso.analytics && corso.analytics.goatcounter) || null;
      renderContacts(corso);
      showConsentBanner();
      renderStickyCta(lezioni);
    }).catch(() => showConsentBanner());
    try {
      await init();
      $("main").removeAttribute("aria-busy");
      scrollToHash();
    } catch (err) {
      console.error(err);
      showLoadError(err);
    }
  });
}
