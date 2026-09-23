/* Esercizi: tracce per blocco/argomento, testo da completare */
page(async () => {
  const { programma, esercizi, corso } = await loadData("programma", "esercizi", "corso");
  const { sezioni } = indexProgramma(programma);
  const list = esercizi.esercizi;
  const app = $("#app");
  const params = new URLSearchParams(location.search);

  const byBlock = programma.blocchi.map((b) => ({ b, items: list.filter((e) => blockOfSection(e.sezione) === b.id) }))
    .concat([{ b: null, items: list.filter((e) => !e.sezione) }])
    .filter((g) => g.items.length);

  const card = (e) => {
    const s = sezioni[e.sezione];
    return `<article class="card exercise" id="${e.id}" style="margin:8px 0"
        data-block="${blockOfSection(e.sezione) || ""}" data-search="${esc(norm(`${e.titolo} ${e.testo || ""} L${e.lezione} ${s ? sectionLabel(s) : ""}`))}">
      <div class="lhead" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px">
        <a class="chip" href="programma.html#lez-${e.lezione}">Lezione ${e.lezione}</a>
        ${s ? `<a class="chip bchip" style="--bc:${blockColor(s.blocco.id)}" href="programma.html#${s.id}">${esc(sectionLabel(s))}</a>` : ""}
        ${e.testo ? "" : `<span class="badge">testo in arrivo</span>`}
      </div>
      ${checkbox("exercise", e.id, `<strong>${esc(e.titolo)}</strong>`)}
      <div class="ex-body" style="margin-top:6px">
        ${e.testo
          ? `<div>${esc(e.testo)}</div>`
          : `<p class="soft-text small" style="margin:0">Il testo completo arriverà presto. Intanto ripassa la lezione ${e.lezione} e cerca un esercizio simile negli appelli passati.</p>`}
        ${e.soluzione ? `<details class="official"><summary>Soluzione</summary><div>${esc(e.soluzione)}</div></details>` : ""}
      </div>
    </article>`;
  };

  app.innerHTML = `
    ${pageHead("Esercizi", "Esercizi per argomento", `Le tipologie di esercizio svolte a lezione, divise per blocco. Segna quelle che sai risolvere e allenati sui testi veri degli <a href="${esc(corso.link.dropboxEsami)}" target="_blank" rel="noopener">appelli passati${EXT}</a>.`)}
    <div class="notice info"><span class="ico">${icon("timer")}</span><span>Allo scritto hai <strong>4 esercizi da 6 punti</strong> e 2 domande di teoria in 2 ore e 30 minuti, senza appunti né formulario. Prova a risolvere ogni esercizio in circa 30 minuti, oppure <a href="simulazione.html">genera una simulazione</a>.</span></div>
    <div class="card" style="margin:14px 0">
      <div class="progress-row" style="margin:0">
        <span class="label">Tipologie risolte</span><span class="val" id="ex-count"></span>
        <span id="ex-bar" style="grid-column:1/-1"></span>
      </div>
    </div>
    <div class="toolbar no-print">
      <input type="search" id="q" name="q" placeholder="Filtra (es. condensatore, solenoide, Thevenin)…" aria-label="Filtra esercizi" autocomplete="off">
      <select id="f-blocco" name="blocco" aria-label="Filtra per blocco">
        <option value="">Tutti i blocchi</option>
        ${programma.blocchi.map((b) => `<option value="${b.id}">${b.numero}. ${esc(b.titolo)}</option>`).join("")}
      </select>
      <label><input type="checkbox" id="f-todo" name="todo"> Solo da risolvere</label>
    </div>
    <div id="groups">
      ${byBlock.map(({ b, items }) => `
        <section class="exgroup" data-group="${b ? b.id : "altro"}">
          <div class="section-title"><h2 style="display:flex;align-items:center;gap:10px"><span class="dot" style="--bc:${blockColor(b && b.id)};width:10px;height:10px"></span>${b ? `${b.numero}. ${esc(b.titolo)}` : "Trasversali"}</h2></div>
          ${items.map(card).join("")}
        </section>`).join("")}
    </div>
    <p class="small muted" id="none" role="status" hidden>Nessun esercizio corrisponde ai filtri: prova un'altra parola o scegli “Tutti i blocchi”.</p>`;

  $all(".ex-body").forEach(renderMathIn);

  function updateProgress() {
    const done = Store.count("exercise", list.map((e) => e.id));
    $("#ex-count").textContent = `${done}/${list.length}`;
    $("#ex-bar").innerHTML = progressBar(pct(done, list.length));
  }
  function applyFilters() {
    const words = norm($("#q").value.trim()).split(/\s+/).filter(Boolean);
    const fb = $("#f-blocco").value;
    const todo = $("#f-todo").checked;
    let any = false;
    $all(".exercise").forEach((el) => {
      const ok = words.every((w) => el.dataset.search.includes(w))
        && (!fb || el.dataset.block === fb)
        && (!todo || !Store.get("exercise", el.id));
      el.classList.toggle("hidden", !ok);
      any = any || ok;
    });
    $all(".exgroup").forEach((g) => g.classList.toggle("hidden", !$all(".exercise:not(.hidden)", g).length));
    $("#none").hidden = any;
    setParams({ q: $("#q").value.trim(), blocco: fb, todo });
  }

  $("#q").value = params.get("q") || "";
  $("#f-blocco").value = params.get("blocco") || "";
  $("#f-todo").checked = params.get("todo") === "1";
  updateProgress();
  applyFilters();
  bindChecks($("#groups"), () => { updateProgress(); if ($("#f-todo").checked) applyFilters(); });
  ["#q", "#f-blocco", "#f-todo"].forEach((s) => $(s).addEventListener("input", applyFilters));
});
