/* Simulazione d'esame: genera uno scritto (4 esercizi + 2 domande) o un orale (3 domande)
   con la stessa struttura della prova reale. Il "codice prova" (seed) nell'URL rende la
   prova riproducibile e condivisibile. */
page(async () => {
  const { programma, esercizi, esame, laboratorio, corso } = await loadData("programma", "esercizi", "esame", "laboratorio", "corso");
  const { blocchi, sezioni } = indexProgramma(programma);
  const app = $("#app");
  const S = esame.scritto, O = esame.orale;
  const DURATA = 150 * 60; // 2 ore e 30 minuti

  /* ---------- generatore pseudo-casuale riproducibile ---------- */
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  const shuffle = (r, arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const newSeed = () => Math.floor(Math.random() * 900000) + 100000;

  /* ---------- materiale ---------- */
  // esercizi dei blocchi 1-5 (lo scritto non comprende laboratorio e fisica moderna)
  const exByBlock = {};
  for (const e of esercizi.esercizi) {
    const b = blockOfSection(e.sezione);
    if (!b || !["b1", "b2", "b3", "b4", "b5"].includes(b)) continue;
    (exByBlock[b] = exByBlock[b] || []).push(e);
  }
  // argomenti ufficiali per le domande di teoria (blocchi 1-6)
  const topicsByBlock = {};
  for (const b of programma.blocchi) {
    if (b.id === "b7") continue;
    topicsByBlock[b.id] = b.sezioni.flatMap((s) => s.argomenti.map((a) => ({ ...a, sezione: s })));
  }

  function genScritto(seed) {
    const r = rng(seed);
    const exBlocks = shuffle(r, Object.keys(exByBlock)).slice(0, 4).sort();
    const ex = exBlocks.map((b) => pick(r, exByBlock[b]));
    const thBlocks = shuffle(r, Object.keys(topicsByBlock)).slice(0, 2).sort();
    const th = thBlocks.map((b) => ({ blocco: b, topic: pick(r, topicsByBlock[b]) }));
    return { ex, th };
  }
  function genOrale(seed, conLab) {
    const r = rng(seed * 7 + 3);
    const n = conLab ? 2 : 3;
    const qBlocks = shuffle(r, Object.keys(topicsByBlock)).slice(0, n).sort();
    const qs = qBlocks.map((b) => ({ blocco: b, topic: pick(r, topicsByBlock[b]) }));
    if (conLab) qs.push({ blocco: "b7", lab: pick(r, laboratorio.esperienze) });
    return qs;
  }

  /* ---------- stato ---------- */
  const params = getParams();
  let seed = Number(params.get("prova")) || newSeed();
  let tipo = params.get("tipo") === "orale" ? "orale" : "scritto";
  let conLab = params.get("lab") !== "0";

  app.innerHTML = `
    ${pageHead("Allenamento", "Simula l'esame", `Genera una prova casuale con la stessa struttura di quella vera: lo scritto ha ${esc(S.descrizione)} in ${esc(S.durata)}, l'orale ${esc(O.descrizione)}. Correggiti da solo e guarda se superi la soglia.`)}
    <div class="notice info"><span class="ico">${icon("info")}</span><span>Gli esercizi sono scelti tra le tipologie svolte a lezione e le domande tra gli argomenti del programma ufficiale. Per allenarti sui testi veri usa gli <a href="${esc(corso.link.dropboxEsami)}" target="_blank" rel="noopener">appelli degli anni passati${EXT}</a>.</span></div>
    <div class="sim-bar no-print">
      <div class="segmented" role="tablist" aria-label="Tipo di prova">
        <button type="button" role="tab" id="tab-scritto" data-value="scritto" aria-controls="panel-scritto" aria-selected="true">Scritto</button>
        <button type="button" role="tab" id="tab-orale" data-value="orale" aria-controls="panel-orale" aria-selected="false">Orale</button>
      </div>
      <div class="sim-actions">
        <button class="btn primary" type="button" id="gen-btn">Genera nuova prova</button>
        <button class="btn" type="button" id="copy-btn">${icon("link")} Copia link</button>
        <button class="btn" type="button" id="print-btn">Stampa</button>
      </div>
    </div>
    <p class="small muted" id="seed-info" role="status" aria-live="polite"></p>

    <section id="panel-scritto" role="tabpanel" aria-labelledby="tab-scritto"></section>
    <section id="panel-orale" role="tabpanel" aria-labelledby="tab-orale" hidden></section>`;

  /* ---------- timer dello scritto ---------- */
  let remaining = DURATA, timerId = null;
  const fmtTime = (t) => [Math.floor(t / 3600), Math.floor((t % 3600) / 60), t % 60].map((x, i) => (i ? String(x).padStart(2, "0") : x)).join(":");
  function renderTimer() {
    const el = $("#timer");
    if (!el) return;
    el.textContent = fmtTime(remaining);
    el.classList.toggle("low", remaining <= 10 * 60 && remaining > 0);
    $("#timer-bar").innerHTML = progressBar(pct(DURATA - remaining, DURATA));
    $("#timer-btn").textContent = timerId ? "Pausa" : remaining === DURATA ? "Avvia timer" : remaining === 0 ? "Tempo scaduto" : "Riprendi";
    $("#timer-btn").disabled = remaining === 0;
  }
  function toggleTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; renderTimer(); return; }
    timerId = setInterval(() => {
      remaining = Math.max(0, remaining - 1);
      if (remaining === 0) { clearInterval(timerId); timerId = null; $("#timer-msg").textContent = "Tempo scaduto: consegna e passa alla correzione."; }
      renderTimer();
    }, 1000);
    renderTimer();
  }
  function resetTimer() { clearInterval(timerId); timerId = null; remaining = DURATA; $("#timer-msg").textContent = ""; renderTimer(); }
  window.addEventListener("beforeunload", (e) => { if (timerId) { e.preventDefault(); e.returnValue = ""; } });

  /* ---------- rendering ---------- */
  const scoreInput = (name, max, label) =>
    `<label class="q-score">Punteggio <input type="number" name="${name}" min="0" max="${max}" step="0.5" inputmode="decimal" autocomplete="off" placeholder="0–${max}…" aria-label="${label}"> / ${max}</label>`;
  const topicQuestion = (q) => {
    const s = q.topic.sezione, b = blocchi[q.blocco];
    return `<p class="q-title">Esponi: «${esc(q.topic.testo.charAt(0).toUpperCase() + q.topic.testo.slice(1))}»</p>
      <p class="small muted" style="margin:0">Dal blocco ${b.numero} · ${esc(s.titolo || b.titolo)}${b.capitoli ? ` · ${esc(b.capitoli)}` : ""}</p>`;
  };

  function renderScritto() {
    const { ex, th } = genScritto(seed);
    $("#panel-scritto").innerHTML = `
      <div class="card timer-card no-print">
        <div>
          <div class="small muted">Tempo a disposizione</div>
          <div class="timer" id="timer" role="timer" aria-live="off">${fmtTime(remaining)}</div>
        </div>
        <div class="sim-actions">
          <button class="btn blue" type="button" id="timer-btn">Avvia timer</button>
          <button class="btn" type="button" id="timer-reset">Azzera</button>
        </div>
        <div class="timer-track" id="timer-bar"></div>
        <p class="small muted" id="timer-msg" role="status" aria-live="polite" style="margin:0"></p>
      </div>
      <h2>Esercizi <span class="badge">${ex.length} × ${S.composizione[0].puntiCadauno} punti</span></h2>
      <div class="q-list">
        ${ex.map((e, i) => {
          const s = sezioni[e.sezione];
          return `<article class="card q-card" style="--bc:${blockColor(s.blocco.id)}">
            <div class="q-num" aria-hidden="true">${i + 1}</div>
            <div>
              <div class="q-head"><span class="chip bchip" style="--bc:${blockColor(s.blocco.id)};margin:0">${s.blocco.numero}. ${esc(s.blocco.titolo)}</span></div>
              <p class="q-title"><span class="visually-hidden">Esercizio ${i + 1}: </span>${esc(e.titolo)}</p>
              <div class="q-body">${e.testo
                ? esc(e.testo)
                : `<p class="soft-text small" style="margin:0">Tipologia svolta nella <a href="programma.html#lez-${e.lezione}">lezione ${e.lezione}</a>. Il testo completo non è ancora disponibile: cerca un esercizio di questo tipo negli appelli passati e risolvilo a tempo.</p>`}</div>
              ${scoreInput(`ex${i}`, S.composizione[0].puntiCadauno, `Punteggio esercizio ${i + 1}`)}
            </div>
          </article>`;
        }).join("")}
      </div>
      <h2>Domande di teoria <span class="badge">${th.length} × ${S.composizione[1].puntiCadauno} punti</span></h2>
      <div class="q-list">
        ${th.map((q, i) => `<article class="card q-card" style="--bc:${blockColor(q.blocco)}">
            <div class="q-num" aria-hidden="true">T${i + 1}</div>
            <div>${topicQuestion(q)}${scoreInput(`th${i}`, S.composizione[1].puntiCadauno, `Punteggio domanda di teoria ${i + 1}`)}</div>
          </article>`).join("")}
      </div>
      <div class="card total-card" aria-live="polite">
        <div><div class="small muted">Totale scritto</div><div class="stat" id="tot-scritto">—</div></div>
        <div id="esito-scritto" class="small muted">Inserisci i punteggi dopo esserti corretto.</div>
      </div>
      <p class="field-error" id="err-scritto" role="alert" hidden></p>`;
    $all(".q-body", $("#panel-scritto")).forEach(renderMathIn);
    $("#timer-btn").onclick = toggleTimer;
    $("#timer-reset").onclick = resetTimer;
    renderTimer();
    reveal($("#panel-scritto"));
  }

  function renderOrale() {
    const qs = genOrale(seed, conLab);
    $("#panel-orale").innerHTML = `
      <label class="toolbar no-print" style="margin-top:0"><input type="checkbox" id="lab-toggle" ${conLab ? "checked" : ""}> Includi una domanda sulle esperienze di laboratorio</label>
      <div class="q-list">
        ${qs.map((q, i) => `<article class="card q-card" style="--bc:${blockColor(q.blocco)}">
            <div class="q-num" aria-hidden="true">${i + 1}</div>
            <div>
              ${q.lab
                ? `<p class="q-title">Esperienza di laboratorio: «${esc(q.lab.titolo)}»</p>
                   <p class="small muted" style="margin:0">Descrivi scopo, apparato, procedura di misura e analisi dei dati, come nella tua relazione. <a href="laboratorio.html#${q.lab.id}">Scheda dell'esperienza</a></p>`
                : topicQuestion(q)}
              ${scoreInput(`or${i}`, O.composizione[0].puntiCadauno, `Punteggio domanda orale ${i + 1}`)}
            </div>
          </article>`).join("")}
      </div>
      <div class="card total-card" aria-live="polite">
        <div><div class="small muted">Totale orale</div><div class="stat" id="tot-orale">—</div></div>
        <div id="esito-orale" class="small muted">Con lo scritto compilato vedi anche il voto finale stimato.</div>
      </div>
      <p class="field-error" id="err-orale" role="alert" hidden></p>`;
    $("#lab-toggle").onchange = (e) => { conLab = e.target.checked; setParams({ lab: conLab ? "" : "0" }); renderOrale(); };
    reveal($("#panel-orale"));
  }

  /* ---------- punteggi ---------- */
  function readScores(panel) {
    const errors = [];
    const vals = $all('input[type="number"]', panel).map((el) => {
      el.removeAttribute("aria-invalid");
      if (el.value === "" && !el.validity.badInput) return null;
      const v = Number(el.value);
      if (el.validity.badInput || Number.isNaN(v) || v < 0 || v > Number(el.max)) {
        el.setAttribute("aria-invalid", "true");
        errors.push(`${el.getAttribute("aria-label")}: inserisci un numero tra 0 e ${el.max}.`);
        return null;
      }
      return v;
    });
    return { vals, errors };
  }
  let scrittoTot = null;
  function updateTotals() {
    const ps = $("#panel-scritto"), po = $("#panel-orale");
    const a = readScores(ps), b = readScores(po);
    const errS = $("#err-scritto"), errO = $("#err-orale");
    errS.hidden = !a.errors.length; errS.textContent = a.errors.join(" ");
    errO.hidden = !b.errors.length; errO.textContent = b.errors.join(" ");
    const any = (v) => v.some((x) => x !== null);
    scrittoTot = any(a.vals) ? a.vals.reduce((x, v) => x + (v || 0), 0) : null;
    const oraleTot = any(b.vals) ? b.vals.reduce((x, v) => x + (v || 0), 0) : null;
    $("#tot-scritto").textContent = scrittoTot === null ? "—" : `${NUM.format(scrittoTot)}/30`;
    $("#esito-scritto").innerHTML = scrittoTot === null ? "Inserisci i punteggi dopo esserti corretto."
      : scrittoTot >= S.soglia ? `<span class="badge ok">Superato</span> soglia ${S.soglia}/30` : `<span class="badge soft">Non superato</span> servono almeno ${S.soglia} punti`;
    $("#tot-orale").textContent = oraleTot === null ? "—" : `${NUM.format(oraleTot)}/30`;
    $("#esito-orale").innerHTML = oraleTot !== null && scrittoTot !== null && scrittoTot >= S.soglia
      ? `Voto finale stimato: <strong>${NUM.format((scrittoTot + oraleTot) / 2)}/30</strong> <span class="muted">(media tra scritto e orale)</span>`
      : "Con lo scritto superato vedi anche il voto finale stimato.";
  }

  function renderAll() {
    renderScritto();
    renderOrale();
    updateTotals();
    $("#seed-info").textContent = `Codice prova: ${seed}. Con “Copia link” puoi ritrovarla o condividerla.`;
    setParams({ prova: seed, tipo: tipo === "orale" ? "orale" : "" });
  }

  const tabs = segmented($(".segmented"), (v) => { tipo = v; setParams({ tipo: v === "orale" ? "orale" : "" }); });
  tabs.select(tipo);
  app.addEventListener("input", (e) => { if (e.target.matches('.q-score input')) updateTotals(); });
  $("#gen-btn").onclick = () => {
    if (timerId && !confirm("Il timer è in corso: vuoi davvero generare una nuova prova?")) return;
    seed = newSeed(); resetTimer(); renderAll();
  };
  $("#print-btn").onclick = () => window.print();
  $("#copy-btn").onclick = async () => {
    try { await navigator.clipboard.writeText(location.href); $("#seed-info").textContent = `Link copiato. Codice prova: ${seed}.`; }
    catch (e) { $("#seed-info").textContent = `Copia non riuscita: seleziona l'indirizzo nella barra del browser. Codice prova: ${seed}.`; }
  };
  renderAll();
});
