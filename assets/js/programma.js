/* Programma: 7 blocchi espandibili con argomenti spuntabili */
page(async () => {
  const { programma, lezioni } = await loadData("programma", "lezioni");
  const app = $("#app");

  // lezioni collegate a ciascuna sezione
  const lezPerSez = {};
  for (const l of lezioni.lezioni) for (const s of l.sezioni) (lezPerSez[s] = lezPerSez[s] || []).push(l);

  const totOre = programma.blocchi.reduce((a, b) => a + b.ore, 0);

  app.innerHTML = `
    <h1>Programma ufficiale</h1>
    <p class="page-intro">I 7 blocchi del programma con ore e capitoli di riferimento del Mencuccini-Silvestrini (${totOre} ore complessive).
      Gli argomenti sono quelli del testo ufficiale, divisi in voci spuntabili; il testo integrale di ogni sezione è sotto "Testo ufficiale".</p>
    <div class="toolbar no-print">
      <button class="btn" id="open-all" type="button">Espandi tutto</button>
      <button class="btn" id="close-all" type="button">Comprimi tutto</button>
    </div>
    <div id="blocks">
      ${programma.blocchi.map((b) => `
        <details class="block" id="${b.id}" style="--bc:${blockColor(b.id)}">
          <summary>
            <span class="num">${b.numero}</span>
            <span>
              <span class="title">${esc(b.titolo)}</span><br>
              <span class="meta">${b.ore} ore${b.capitoli ? ` · riferimento ${esc(b.capitoli)}` : ""}</span>
            </span>
            <span class="pct" data-pct="${b.id}"></span>
            <span class="progress-slot" data-bar="${b.id}" style="grid-column:2 / -1"></span>
          </summary>
          <div class="block-body">
            ${b.sezioni.map((s) => `
              <div class="section" id="${s.id}">
                ${s.titolo ? `<h3>${esc(s.titolo)}</h3>` : ""}
                <ul class="topic-list">
                  ${s.argomenti.map((a) => `<li id="${a.id}">${checkbox("topic", a.id, esc(a.testo))}</li>`).join("")}
                </ul>
                <details class="official">
                  <summary>Testo ufficiale</summary>
                  <blockquote>${esc(s.testoUfficiale)}</blockquote>
                </details>
                ${(lezPerSez[s.id] || []).length ? `
                  <div class="small muted">Lezioni collegate:</div>
                  <div class="chips">${lezPerSez[s.id].map((l) => `<a class="chip" href="calendario.html#lez-${l.n}" title="${esc(l.titolo)}">L${l.n}</a>`).join("")}</div>` : ""}
                <div class="chips" style="margin-top:6px">
                  <a class="chip" href="formulario.html#${b.id}">Formule del blocco</a>
                  <a class="chip" href="esercizi.html?blocco=${b.id}">Esercizi del blocco</a>
                </div>
              </div>`).join("")}
          </div>
        </details>`).join("")}
    </div>`;

  function updateProgress() {
    for (const b of programma.blocchi) {
      const ids = b.sezioni.flatMap((s) => s.argomenti.map((a) => a.id));
      const done = Store.count("topic", ids);
      $(`[data-pct="${b.id}"]`).textContent = `${done}/${ids.length}`;
      $(`[data-bar="${b.id}"]`).innerHTML = progressBar(pct(done, ids.length), blockColor(b.id));
    }
  }
  updateProgress();
  bindChecks($("#blocks"), updateProgress);

  $("#open-all").onclick = () => $all("details.block").forEach((d) => (d.open = true));
  $("#close-all").onclick = () => $all("details.block").forEach((d) => (d.open = false));
});
