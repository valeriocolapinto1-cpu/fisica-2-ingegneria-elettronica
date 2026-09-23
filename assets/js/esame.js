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
      <form class="no-print" id="calc" novalidate>
        <fieldset class="calc-group">
          <legend>Esercizi (0–6 punti ciascuno)</legend>
          <div class="calc">${[1, 2, 3, 4].map((i) => `<input type="number" class="sc-ex" name="esercizio${i}" min="0" max="6" step="0.5" inputmode="decimal" autocomplete="off" aria-label="Punteggio esercizio ${i}" placeholder="E${i}…">`).join("")}</div>
        </fieldset>
        <fieldset class="calc-group">
          <legend>Domande di teoria (0–3 punti ciascuna)</legend>
          <div class="calc">${[1, 2].map((i) => `<input type="number" class="sc-th" name="teoria${i}" min="0" max="3" step="0.5" inputmode="decimal" autocomplete="off" aria-label="Punteggio domanda di teoria ${i}" placeholder="T${i}…">`).join("")}</div>
        </fieldset>
        <fieldset class="calc-group">
          <legend>Orale (0–30)</legend>
          <div class="calc"><input type="number" id="orale" name="orale" min="0" max="30" step="1" inputmode="numeric" autocomplete="off" aria-label="Voto dell'orale" placeholder="es. 27…"></div>
        </fieldset>
        <p class="field-error" id="calc-err" role="alert" hidden></p>
      </form>
      <p id="calc-out" class="small" style="margin-top:10px" role="status" aria-live="polite"></p>
    </div>

    <div class="card" style="margin-top:14px">
      <h2>Esercizi d'esame degli appelli precedenti</h2>
      <p>La raccolta ufficiale dei testi d'esame è il miglior allenamento per lo scritto.</p>
      <a class="btn primary" href="${esc(corso.link.dropboxEsami)}" target="_blank" rel="noopener">Apri la cartella Dropbox${EXT}</a>
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

  const fmt = (v) => NUM.format(v);
  function calc() {
    const errors = [];
    const val = (el) => {
      el.removeAttribute("aria-invalid");
      if (el.value === "" && !el.validity.badInput) return null;
      const v = Number(el.value);
      if (el.validity.badInput || Number.isNaN(v) || v < Number(el.min) || v > Number(el.max)) {
        el.setAttribute("aria-invalid", "true");
        errors.push(`${el.getAttribute("aria-label")}: inserisci un numero tra ${el.min} e ${el.max}.`);
        return null;
      }
      return v;
    };
    const ex = $all(".sc-ex").map(val), th = $all(".sc-th").map(val), or = val($("#orale"));
    const errBox = $("#calc-err");
    errBox.hidden = !errors.length;
    errBox.textContent = errors.join(" ");
    const parts = [...ex, ...th];
    const out = $("#calc-out");
    if (parts.every((v) => v === null) && or === null) { out.textContent = errors.length ? "" : "Inserisci i punteggi per stimare il voto."; return; }
    const scritto = parts.reduce((a, v) => a + (v || 0), 0);
    let msg = `Scritto: <strong>${fmt(scritto)}/30</strong> — ${scritto >= s.soglia ? "superato" : `sotto la soglia di ${s.soglia}`}.`;
    if (or !== null && scritto >= s.soglia) msg += ` Voto finale stimato: <strong>${fmt((scritto + or) / 2)}/30</strong>.`;
    out.innerHTML = msg + ` <span class="muted">(stima: arrotondamenti e lode li decidono i docenti)</span>`;
  }
  $("#calc").addEventListener("input", calc);
  $("#calc").addEventListener("submit", (e) => e.preventDefault());
  calc();
});
