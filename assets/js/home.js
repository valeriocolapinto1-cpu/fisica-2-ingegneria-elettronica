/* Home: presentazione del corso, avanzamento e accesso rapido alle sezioni */
page(async () => {
  const { corso, programma, lezioni, esame, esercizi, formule } = await loadData("corso", "programma", "lezioni", "esame", "esercizi", "formule");
  const app = $("#app");
  const nFormule = formule.blocchi.reduce((a, b) => a + b.gruppi.reduce((x, g) => x + g.formule.length, 0), 0);

  function render() {
    const lez = lezioni.lezioni;
    const lezDone = lez.filter((l) => Store.get("lesson", String(l.n))).length;
    const next = lez.find((l) => !Store.get("lesson", String(l.n)));
    const exTot = esercizi.esercizi.length;
    const exDone = Store.count("exercise", esercizi.esercizi.map((e) => e.id));
    const s = esame.scritto, o = esame.orale;

    const blockRows = programma.blocchi.map((b) => {
      const bl = lez.filter((l) => l.sezioni.some((x) => blockOfSection(x) === b.id));
      const d = bl.filter((l) => Store.get("lesson", String(l.n))).length;
      return `<div class="progress-row">
          <a class="label" href="programma.html?vista=programma#${b.id}"><span class="dot" style="--bc:${blockColor(b.id)}"></span>${b.numero}. ${esc(b.titolo)}</a>
          <span class="val">${d}/${bl.length} lezioni</span>
          ${progressBar(pct(d, bl.length), blockColor(b.id))}
        </div>`;
    }).join("");

    const features = [
      ["programma.html", "book", "var(--b1)", "Programma", "Le 60 lezioni in ordine e il programma ufficiale in 7 blocchi."],
      ["formulario.html", "sigma", "var(--b3)", "Formulario", `${nFormule} formule chiave, dalle equazioni di Maxwell a Fresnel.`],
      ["esercizi.html", "pencil", "var(--b2)", "Esercizi", "Le tipologie svolte a lezione, divise per argomento."],
      ["simulazione.html", "timer", "var(--b5)", "Simula l'esame", "Genera uno scritto o un orale casuale, con timer e punteggio."],
      ["laboratorio.html", "flask", "var(--b4)", "Laboratorio", "Le 5 esperienze e cosa mettere nella relazione."],
      ["esame.html", "target", "var(--b6)", "Esame", "Struttura, punteggi, soglia e risultati attesi."],
    ];

    app.innerHTML = `
      <section class="hero">
        <div class="hero-glow" aria-hidden="true"></div>
        <p class="kicker"><span class="pill">a.a.&nbsp;${esc(corso.annoAccademico)}</span> ${esc(corso.corsoDiLaurea)} · ${esc(corso.ateneo)}</p>
        <h1>Fisica Generale&nbsp;II,<br><span class="grad">tutto in un posto.</span></h1>
        <p class="lead">Programma, lezioni, formulario, esercizi e simulazioni d'esame per il corso di ${corso.docenti.map((d) => esc(d.nome)).join(" ed ")} (${corso.cfu}&nbsp;CFU). Gratis, senza registrazione: i progressi restano nel tuo browser.</p>
        <div class="hero-actions">
          ${next
            ? `<a class="btn primary lg" href="programma.html#lez-${next.n}">${lezDone ? "Continua" : "Inizia"} dalla lezione&nbsp;${next.n} <span aria-hidden="true">→</span></a>`
            : `<a class="btn primary lg" href="simulazione.html">Simula l'esame <span aria-hidden="true">→</span></a>`}
          <a class="btn lg" href="simulazione.html">${icon("timer")} Simula l'esame</a>
        </div>
        ${next ? `<p class="hero-next">Prossima: ${esc(next.titolo)}</p>` : `<p class="hero-next">Hai completato tutte le ${lez.length} lezioni. Ottimo lavoro!</p>`}
      </section>

      <div class="grid grid-3">
        <div class="card">
          <div class="stat"><span data-count="${pct(lezDone, lez.length)}" data-suffix="%">${pct(lezDone, lez.length)}%</span></div>
          <div class="stat-label">Lezioni studiate · ${lezDone} su ${lez.length}</div>
          ${progressBar(pct(lezDone, lez.length))}
        </div>
        <div class="card">
          <div class="stat"><span data-count="${pct(exDone, exTot)}" data-suffix="%">${pct(exDone, exTot)}%</span></div>
          <div class="stat-label">Tipologie di esercizi risolte · ${exDone} su ${exTot}</div>
          ${progressBar(pct(exDone, exTot))}
        </div>
        <div class="card">
          <div class="stat">${s.soglia}<span class="muted" style="font-size:1.1rem">/30</span></div>
          <div class="stat-label">Soglia dello scritto · ${esc(s.descrizione)} in ${esc(s.durata)}</div>
          <a class="small" href="esame.html">Come funziona l'esame <span aria-hidden="true">→</span></a>
        </div>
      </div>

      <div class="section-title"><h2>Sezioni</h2></div>
      <div class="grid grid-features">
        ${features.map(([h, ic, c, t, d]) => `
          <a class="card card-link" href="${h}" style="--bc:${c}">
            <div class="feature-ico">${icon(ic)}</div>
            <h3>${t} <span class="arrow" aria-hidden="true">→</span></h3>
            <p class="small muted" style="margin:0">${d}</p>
          </a>`).join("")}
      </div>

      <div class="section-title"><h2>Avanzamento per blocco</h2><a class="small" href="programma.html">Vai alle lezioni <span aria-hidden="true">→</span></a></div>
      <div class="card">${blockRows}</div>

      <div class="grid grid-2" style="margin-top:14px">
        <div class="card">
          <h2>Il corso</h2>
          <dl class="kv">
            <dt>Docenti</dt><dd>${corso.docenti.map((d) => `${esc(d.nome)} <span class="muted small">(${esc(d.ruolo)})</span>`).join("<br>")}</dd>
            <dt>CFU</dt><dd>${corso.cfu} · SSD ${esc(corso.ssd)}</dd>
            <dt>Ore</dt><dd>${corso.ore.totali} totali: ${corso.ore.aula} aula + ${corso.ore.esercitazioniLaboratorio} esercitazioni e laboratorio</dd>
            <dt>Prerequisiti</dt><dd>${corso.prerequisiti.map(esc).join("<br>")}</dd>
            <dt>Testo</dt><dd>C. Mencuccini, V. Silvestrini, <em>Fisica II – Elettromagnetismo, Ottica</em>, Zanichelli</dd>
          </dl>
        </div>
        <div class="card">
          <h2>L'esame in breve</h2>
          <p><strong>Scritto</strong> · ${esc(s.descrizione)}, ${esc(s.durata)}, ${esc(s.materiale.toLowerCase())}. Si passa con ${s.soglia}/30.</p>
          <p><strong>Orale</strong> · ${esc(o.descrizione)} da ${o.composizione[0].puntiCadauno} punti; porta le relazioni di laboratorio.</p>
          <p><strong>Voto finale</strong> · ${esc(esame.votoFinale.toLowerCase())}</p>
          <div class="toolbar" style="margin-bottom:0">
            <a class="btn primary" href="esame.html">Dettagli</a>
            <a class="btn" href="${esc(corso.link.dropboxEsami)}" target="_blank" rel="noopener">Esami passati${EXT}</a>
          </div>
        </div>
      </div>

      <div class="section-title" id="backup"><h2>Porta i progressi con te</h2></div>
      <div class="card no-print">
        <p class="small muted" style="margin-top:0">I progressi restano solo in questo browser. Per spostarli tra computer e telefono esporta il file e importalo sull'altro dispositivo.</p>
        <div class="toolbar" style="margin-bottom:0">
          <button class="btn" id="export-btn" type="button">Esporta progressi</button>
          <button class="btn" id="import-btn" type="button">Importa progressi</button>
          <input type="file" id="import-file" name="import-file" accept="application/json,.json" class="hidden" aria-label="File dei progressi da importare">
          <button class="btn danger" id="reset-btn" type="button">Azzera tutto</button>
        </div>
        <p class="status" id="backup-status" role="status" aria-live="polite"></p>
      </div>`;

    const status = (msg, kind) => {
      const el = $("#backup-status");
      el.textContent = msg;
      el.className = `status ${kind || ""}`;
    };
    $("#export-btn").onclick = () => {
      const blob = new Blob([Store.exportJSON()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `fisica2-progressi-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      status(`File scaricato: ${a.download} (${Store.total()} voci). Importalo sull'altro dispositivo da questa sezione.`, "ok");
    };
    $("#import-btn").onclick = () => $("#import-file").click();
    $("#import-file").onchange = async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        Store.importJSON(await f.text());
        render(); reveal(app); countUp(app);
        status(`Progressi importati: ${Store.total()} voci ripristinate.`, "ok");
      } catch (err) {
        status(`Importazione non riuscita. ${err.message}`, "error");
      }
    };
    $("#reset-btn").onclick = () => {
      if (confirm("Vuoi davvero azzerare tutti i progressi salvati in questo browser?")) {
        Store.reset();
        render(); reveal(app); countUp(app);
        status("Progressi azzerati.", "ok");
      }
    };
  }

  render();
});
