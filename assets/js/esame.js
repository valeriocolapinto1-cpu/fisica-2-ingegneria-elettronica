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
    ${pageHead(`a.a. ${esc(corso.annoAccademico)}`, "Come funziona l'esame", `Uno scritto e un orale, entrambi in trentesimi: il voto finale è la media dei due. Quando ti senti pronto, <a href="simulazione.html">simula una prova</a>.`)}

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
      <a class="btn primary" href="simulazione.html">${icon("timer")} Simula uno scritto o un orale</a>
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
        <p class="small muted">Sei livelli, dalla conoscenza di base al problem solving su induzione e onde. Spunta quelli che senti di aver raggiunto.</p>
        <ul class="topic-list" id="ra-list">
          ${ra.livelli.map((l) => `<li>${checkbox("outcome", l.id, `<strong>Livello ${l.livello}.</strong> ${l.placeholder && l.testo.startsWith("[") ? `<span class="soft-text">descrizione completa nella <a href="${esc(corso.link.paginaRoma)}" target="_blank" rel="noopener">scheda ufficiale del corso${EXT}</a></span>` : esc(l.testo)}`)}</li>`).join("")}
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

});
