/* Home: panoramica del corso e progressi */
page(async () => {
  const { corso, programma, lezioni, esame, esercizi } = await loadData("corso", "programma", "lezioni", "esame", "esercizi");
  const app = $("#app");

  function render() {
    const lez = lezioni.lezioni;
    const lezDone = lez.filter((l) => Store.get("lesson", String(l.n))).length;
    const allTopics = programma.blocchi.flatMap((b) => b.sezioni.flatMap((s) => s.argomenti.map((a) => a.id)));
    const topDone = Store.count("topic", allTopics);
    const next = lez.find((l) => !Store.get("lesson", String(l.n)));
    const exTot = esercizi.esercizi.length;
    const exDone = Store.count("exercise", esercizi.esercizi.map((e) => e.id));

    const blockRows = programma.blocchi.map((b) => {
      const ids = b.sezioni.flatMap((s) => s.argomenti.map((a) => a.id));
      const done = Store.count("topic", ids);
      const bl = lez.filter((l) => l.sezioni.some((s) => blockOfSection(s) === b.id));
      const blDone = bl.filter((l) => Store.get("lesson", String(l.n))).length;
      const p = pct(done, ids.length);
      return `<div class="progress-row">
          <a class="label" href="programma.html#${b.id}"><strong>${b.numero}.</strong> ${esc(b.titolo)}</a>
          <span class="val">${done}/${ids.length} argomenti · ${blDone}/${bl.length} lezioni</span>
          ${progressBar(p, blockColor(b.id))}
        </div>`;
    }).join("");

    const s = esame.scritto, o = esame.orale;
    app.innerHTML = `
      <section class="card hero">
        <p class="kicker">${esc(corso.corsoDiLaurea)} · ${esc(corso.ateneo)} · a.a.&nbsp;${esc(corso.annoAccademico)}</p>
        <h1>${esc(corso.nome)}</h1>
        <p class="muted" style="margin:0">${esc(corso.anno)}, ${esc(corso.semestre)} · ${corso.cfu}&nbsp;CFU · ${esc(corso.canale)} · ${corso.docenti.map((d) => esc(d.nome)).join(" e ")}</p>
        <div class="hero-actions">
          ${next
            ? `<a class="btn primary" href="calendario.html#lez-${next.n}">${lezDone ? "Continua" : "Inizia"}: Lezione&nbsp;${next.n}</a>`
            : `<a class="btn primary" href="esame.html">Ripassa per l'esame</a>`}
          <a class="btn" href="esame.html">Struttura d'esame</a>
          <a class="btn" href="formulario.html">Formulario</a>
        </div>
        ${next ? `<p class="hero-next">Prossima: ${esc(next.titolo)}</p>` : `<p class="hero-next">Hai completato tutte le ${lez.length} lezioni.</p>`}
      </section>

      <div class="grid grid-3">
        <div class="card">
          <div class="stat">${pct(lezDone, lez.length)}%</div>
          <div class="stat-label">Lezioni studiate (${lezDone}/${lez.length})</div>
          ${progressBar(pct(lezDone, lez.length))}
        </div>
        <div class="card">
          <div class="stat">${pct(topDone, allTopics.length)}%</div>
          <div class="stat-label">Argomenti del programma (${topDone}/${allTopics.length})</div>
          ${progressBar(pct(topDone, allTopics.length))}
        </div>
        <div class="card">
          <div class="stat">${pct(exDone, exTot)}%</div>
          <div class="stat-label">Tracce di esercizi risolte (${exDone}/${exTot})</div>
          ${progressBar(pct(exDone, exTot))}
        </div>
      </div>

      <h2>Progressi per blocco</h2>
      <div class="card">
        ${blockRows}
        <p class="small muted" style="margin-bottom:0">Gli argomenti si spuntano in <a href="programma.html">Programma</a>, le lezioni in <a href="calendario.html">Percorso</a>.</p>
      </div>

      <div class="grid grid-2" style="margin-top:14px">
        <div class="card">
          <h2>Il corso</h2>
          <dl class="kv">
            <dt>Docenti</dt><dd>${corso.docenti.map((d) => `${esc(d.nome)} <span class="muted small">(${esc(d.ruolo)})</span>`).join("<br>")}</dd>
            <dt>CFU</dt><dd>${corso.cfu} · SSD ${esc(corso.ssd)}</dd>
            <dt>Ore</dt><dd>${corso.ore.totali} totali: ${corso.ore.aula} aula + ${corso.ore.esercitazioniLaboratorio} esercitazioni/laboratorio</dd>
            <dt>Prerequisiti</dt><dd>${corso.prerequisiti.map(esc).join("<br>")}</dd>
            <dt>Testo</dt><dd>C. Mencuccini, V. Silvestrini, <em>Fisica II – Elettromagnetismo, Ottica</em>, Zanichelli</dd>
          </dl>
        </div>
        <div class="card">
          <h2>Esame in breve</h2>
          <p><strong>Scritto</strong>: ${esc(s.descrizione)} · ${esc(s.durata)} · ${esc(s.materiale.toLowerCase())}. Max ${s.massimo}, soglia <strong>${s.soglia}/30</strong>.</p>
          <p><strong>Orale</strong>: ${esc(o.descrizione)} (${o.composizione[0].puntiCadauno} punti ciascuna, max ${o.massimo}). Porta le relazioni di laboratorio.</p>
          <p><strong>Voto finale</strong>: ${esc(esame.votoFinale.toLowerCase())}</p>
          <p style="margin-bottom:0"><a class="btn primary" href="esame.html">Dettagli esame</a>
            <a class="btn" href="${esc(corso.link.dropboxEsami)}" target="_blank" rel="noopener">Esami passati (Dropbox)${EXT}</a></p>
        </div>
      </div>

      <h2>Sezioni</h2>
      <div class="grid grid-3">
        ${[
          ["programma.html", "Programma", "I 7 blocchi con ore, capitoli e argomenti ufficiali."],
          ["calendario.html", "Percorso di studio", "Le 60 lezioni in ordine cronologico, spuntabili."],
          ["formulario.html", "Formulario", "Formule chiave per blocco, Maxwell in forma integrale e locale."],
          ["esercizi.html", "Esercizi", "Tipologie di esercizi per argomento, dal calendario."],
          ["laboratorio.html", "Laboratorio", "Le 5 esperienze e la checklist delle relazioni."],
          ["esame.html", "Esame", "Struttura, punteggi, risultati di apprendimento."],
          ["risorse.html", "Risorse", "Testo, dispense, pagina Roma, Dropbox."],
          ["cerca.html", "Cerca", "Trova un argomento in blocchi, lezioni, formule."],
        ].map(([h, t, d]) => `<a class="card card-link" href="${h}"><h3 style="color:var(--accent)">${t}</h3><p class="small muted" style="margin:0">${d}</p></a>`).join("")}
      </div>

      <h2 id="backup">Backup dei progressi</h2>
      <div class="card no-print">
        <p class="small muted">I progressi restano solo in questo browser. Per spostarli tra computer e telefono esporta il file e importalo sull'altro dispositivo.</p>
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
        render();
        status(`Progressi importati: ${Store.total()} voci ripristinate.`, "ok");
      } catch (err) {
        status(`Importazione non riuscita. ${err.message}`, "error");
      }
    };
    $("#reset-btn").onclick = () => {
      if (confirm("Vuoi davvero azzerare tutti i progressi salvati in questo browser?")) {
        Store.reset();
        render();
        status("Progressi azzerati.", "ok");
      }
    };
  }

  render();
});
