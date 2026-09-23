/* Percorso di studio: le 60 lezioni in ordine cronologico */
page(async () => {
  const { programma, lezioni } = await loadData("programma", "lezioni");
  const { sezioni } = indexProgramma(programma);
  const lez = lezioni.lezioni;
  const app = $("#app");

  app.innerHTML = `
    <h1>Percorso di studio</h1>
    <p class="page-intro">Le ${lez.length} lezioni nell'ordine reale del corso. Spunta una lezione quando l'hai studiata: lo stato resta salvato in questo browser.
      I collegamenti alle sezioni del programma sono indicativi, ricavati dal titolo della lezione.</p>
    <div class="card" style="margin:12px 0">
      <div class="progress-row" style="margin:0">
        <span class="label"><strong>Lezioni completate</strong></span><span class="val" id="lez-count"></span>
        <span id="lez-bar" style="grid-column:1/-1"></span>
      </div>
    </div>
    <div class="toolbar no-print">
      <input type="search" id="q" placeholder="Filtra per parola (es. Gauss, Thevenin, dipolo)…" aria-label="Filtra lezioni">
      <select id="f-blocco" aria-label="Filtra per blocco">
        <option value="">Tutti i blocchi</option>
        ${programma.blocchi.map((b) => `<option value="${b.id}">${b.numero}. ${esc(b.titolo)}</option>`).join("")}
      </select>
      <select id="f-tipo" aria-label="Filtra per tipo">
        <option value="">Tutti i tipi</option>
        ${Object.entries(TIPI_LEZIONE).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}
      </select>
      <label><input type="checkbox" id="f-todo"> Solo da studiare</label>
    </div>
    <p class="small muted" id="shown"></p>
    <div class="lessons" id="lessons">
      ${lez.map((l) => {
        const firstBlock = l.sezioni.length ? blockOfSection(l.sezioni[0]) : null;
        return `<article class="lesson" id="lez-${l.n}" data-n="${l.n}" style="--bc:${blockColor(firstBlock)}">
          <div class="lnum">${l.n}</div>
          <div>
            <div class="lhead">
              <span class="badge ${l.tipo}">${TIPI_LEZIONE[l.tipo] || esc(l.tipo)}</span>
              ${l.capitoli ? `<span class="badge">${esc(l.capitoli)}</span>` : ""}
            </div>
            ${checkbox("lesson", String(l.n), esc(l.titolo))}
            ${l.sezioni.length ? `<div class="chips" style="margin-top:6px">${l.sezioni.map((sid) => {
              const s = sezioni[sid];
              return s ? `<a class="chip bchip" style="--bc:${blockColor(blockOfSection(sid))}" href="programma.html#${sid}">${esc(s.titolo ? s.titolo : `${s.blocco.numero}. ${s.blocco.titolo}`)}</a>` : "";
            }).join("")}</div>` : ""}
          </div>
        </article>`;
      }).join("")}
    </div>`;

  const cards = $all(".lesson");

  function updateProgress() {
    const done = lez.filter((l) => Store.get("lesson", String(l.n))).length;
    $("#lez-count").textContent = `${done}/${lez.length}`;
    $("#lez-bar").innerHTML = progressBar(pct(done, lez.length));
    const next = lez.find((l) => !Store.get("lesson", String(l.n)));
    cards.forEach((c) => {
      const n = c.dataset.n;
      c.classList.toggle("done", Store.get("lesson", n));
      c.classList.toggle("next", !!next && String(next.n) === n);
    });
  }

  function applyFilters() {
    const q = norm($("#q").value.trim());
    const fb = $("#f-blocco").value;
    const ft = $("#f-tipo").value;
    const todo = $("#f-todo").checked;
    let shown = 0;
    lez.forEach((l, i) => {
      const hay = norm(`${l.n} ${l.titolo} ${l.capitoli || ""}`);
      const ok = (!q || q.split(/\s+/).every((w) => hay.includes(w)))
        && (!fb || l.sezioni.some((s) => blockOfSection(s) === fb))
        && (!ft || l.tipo === ft)
        && (!todo || !Store.get("lesson", String(l.n)));
      cards[i].classList.toggle("hidden", !ok);
      if (ok) shown++;
    });
    $("#shown").textContent = shown === lez.length ? "" : `${shown} lezioni mostrate su ${lez.length}`;
  }

  updateProgress();
  bindChecks($("#lessons"), () => { updateProgress(); if ($("#f-todo").checked) applyFilters(); });
  ["#q", "#f-blocco", "#f-tipo", "#f-todo"].forEach((s) => $(s).addEventListener("input", applyFilters));
});
