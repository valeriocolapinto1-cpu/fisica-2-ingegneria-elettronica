/* Esame: struttura, punteggi, risultati di apprendimento */
page(async () => {
  const { esame, corso } = await loadData("esame", "corso");
  const s = esame.scritto, o = esame.orale, ra = esame.risultatiApprendimento;
  const app = $("#app");

  const table = (rows, max) => `
    <table class="score-table">
      <thead><tr><th>Parte</th><th class="num">N.</th><th class="num">Punti cad.</th><th class="num">Totale</th></tr></thead>
      <tbody>${rows.map((r) => `<tr><td>${esc(r.voce)}</td><td class="num">${r.numero}</td><td class="num">${r.puntiCadauno}</td><td class="num">${r.totale}</td></tr>`).join("")}</tbody>
      <tfoot><tr><td colspan="3">Massimo</td><td class="num">${max}</td></tr></tfoot>
    </table>`;

  app.innerHTML = `
    <h1>Esame</h1>
    <p class="page-intro">Struttura della prova d'esame di Fisica Generale II (a.a. ${esc(corso.annoAccademico)}).</p>

    <div class="exam-hero">
      <section class="card accent exam-card">
        <h2><span>Prova scritta</span><span class="badge">${esc(s.durata)}</span></h2>
        <p><strong>${esc(s.descrizione)}</strong> · ${esc(s.materiale)}.</p>
        ${table(s.composizione, s.massimo)}
        <p style="display:flex;align-items:center;gap:12px;margin-bottom:0">
          <span class="big-number">${s.soglia}/30</span>
          <span class="muted">soglia di superamento</span>
        </p>
      </section>
      <section class="card accent exam-card">
        <h2><span>Prova orale</span><span class="badge">${esc(o.descrizione)}</span></h2>
        ${table(o.composizione, o.massimo)}
        <ul>${o.note.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
        <a class="btn" href="laboratorio.html">Relazioni di laboratorio</a>
      </section>
    </div>

    <div class="card" style="margin-top:14px">
      <h2>Voto finale</h2>
      <p style="font-size:1.05rem">${esc(esame.votoFinale)}</p>
      <div class="formula" style="max-width:420px">${tex(String.raw`V_{\text{finale}} = \frac{V_{\text{scritto}} + V_{\text{orale}}}{2}`)}</div>
      <h3>Simulatore</h3>
      <div class="calc no-print">
        <label>Esercizi (0-6 ciascuno):
          ${[1, 2, 3, 4].map((i) => `<input type="number" class="sc-ex" min="0" max="6" step="0.5" aria-label="Esercizio ${i}" placeholder="E${i}">`).join("")}
        </label>
      </div>
      <div class="calc no-print" style="margin-top:8px">
        <label>Teoria (0-3 ciascuna):
          ${[1, 2].map((i) => `<input type="number" class="sc-th" min="0" max="3" step="0.5" aria-label="Domanda di teoria ${i}" placeholder="T${i}">`).join("")}
        </label>
        <label>Orale (0-30): <input type="number" id="orale" min="0" max="30" step="1" aria-label="Voto orale" placeholder="—"></label>
      </div>
      <p id="calc-out" class="small" style="margin-top:10px"></p>
    </div>

    <div class="card" style="margin-top:14px">
      <h2>Esercizi d'esame degli appelli precedenti</h2>
      <p>La raccolta ufficiale dei testi d'esame è il miglior allenamento per lo scritto.</p>
      <a class="btn primary" href="${esc(corso.link.dropboxEsami)}" target="_blank" rel="noopener">Apri la cartella Dropbox ↗</a>
      <a class="btn" href="esercizi.html">Tracce per argomento</a>
    </div>

    <div class="grid grid-2" style="margin-top:14px">
      <section class="card" id="risultati">
        <h2>Risultati di apprendimento attesi</h2>
        <p class="small muted">Checklist di autovalutazione: spunta un livello quando ti senti pronto.</p>
        ${ra.livelli.some((l) => l.placeholder) ? `<div class="notice small">${esc(ra.nota)}</div>` : ""}
        <ul class="topic-list" id="ra-list">
          ${ra.livelli.map((l) => `<li>${checkbox("outcome", l.id, `<strong>Livello ${l.livello}.</strong> ${l.placeholder ? `<span class="placeholder-text">${esc(l.testo)}</span>` : esc(l.testo)}`)}</li>`).join("")}
        </ul>
      </section>
      <section class="card" id="criteri">
        <h2>Criteri di accertamento</h2>
        <p class="small muted">Cosa viene valutato: spunta quando sai farlo senza aiuti.</p>
        <ul class="topic-list" id="cr-list">
          ${esame.criteri.map((c) => `<li>${checkbox("criterio", c.id, esc(c.testo))}</li>`).join("")}
        </ul>
      </section>
    </div>`;

  bindChecks($("#ra-list"));
  bindChecks($("#cr-list"));

  const num = (el) => (el.value === "" ? null : Math.max(0, Math.min(Number(el.max), Number(el.value))));
  function calc() {
    const ex = $all(".sc-ex").map(num), th = $all(".sc-th").map(num), or = num($("#orale"));
    const parts = [...ex, ...th];
    const out = $("#calc-out");
    if (parts.every((v) => v === null) && or === null) { out.textContent = "Inserisci i punteggi per stimare il voto."; return; }
    const scritto = parts.reduce((a, v) => a + (v || 0), 0);
    let msg = `Scritto: <strong>${scritto}/30</strong> — ${scritto >= s.soglia ? "superato" : `sotto la soglia di ${s.soglia}`}.`;
    if (or !== null && scritto >= s.soglia) msg += ` Voto finale stimato: <strong>${((scritto + or) / 2).toFixed(1)}/30</strong>.`;
    out.innerHTML = msg + ` <span class="muted">(stima: arrotondamenti e lode sono decisi dai docenti)</span>`;
  }
  $all(".calc input").forEach((i) => i.addEventListener("input", calc));
  calc();
});
