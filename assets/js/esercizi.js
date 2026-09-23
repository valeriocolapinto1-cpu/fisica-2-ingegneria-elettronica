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
    return `<article class="card exercise" id="${e.id}" style="border-left:4px solid ${blockColor(blockOfSection(e.sezione))};margin:8px 0"
        data-block="${blockOfSection(e.sezione) || ""}" data-search="${esc(norm(`${e.titolo} ${e.testo || ""} L${e.lezione} ${s ? sectionLabel(s) : ""}`))}">
      <div class="lhead" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px">
        <a class="chip" href="calendario.html#lez-${e.lezione}">Lezione ${e.lezione}</a>
        ${s ? `<a class="chip bchip" style="--bc:${blockColor(s.blocco.id)}" href="programma.html#${s.id}">${esc(sectionLabel(s))}</a>` : ""}
        ${e.testo ? "" : `<span class="badge placeholder">testo da completare</span>`}
      </div>
      ${checkbox("exercise", e.id, `<strong>${esc(e.titolo)}</strong>`)}
      <div class="ex-body" style="margin-top:6px">
        ${e.testo
          ? `<div>${esc(e.testo)}</div>`
          : `<p class="placeholder-text small" style="margin:0">Testo non disponibile: ricopialo dagli appunti della lezione ${e.lezione} o da un appello sul Dropbox, poi inseriscilo nel campo <code>testo</code> di <code>${e.id}</code> in <code>data/esercizi.json</code>.</p>`}
        ${e.soluzione ? `<details class="official"><summary>Soluzione</summary><div>${esc(e.soluzione)}</div></details>` : ""}
      </div>
    </article>`;
  };

  app.innerHTML = `
    <h1>Esercizi</h1>
    <p class="page-intro">Le tipologie di esercizio svolte a lezione, ricavate dal calendario e organizzate per blocco. Sono <strong>tracce</strong>:
      il testo completo non è riportato per non inventare dati. Completa i testi dagli appunti e allenati sugli
      <a href="${esc(corso.link.dropboxEsami)}" target="_blank" rel="noopener">esercizi d'esame degli appelli precedenti ↗</a>.</p>
    <div class="notice info">Allo scritto ci sono <strong>4 esercizi da 6 punti</strong> in 2 ore e 30 minuti, senza materiale: allenati a risolverli a tempo (circa 30 minuti l'uno) e senza formulario.</div>
    <div class="card" style="margin:12px 0">
      <div class="progress-row" style="margin:0">
        <span class="label"><strong>Tracce risolte</strong></span><span class="val" id="ex-count"></span>
        <span id="ex-bar" style="grid-column:1/-1"></span>
      </div>
    </div>
    <div class="toolbar no-print">
      <input type="search" id="q" placeholder="Filtra (es. condensatore, solenoide, Thevenin)…" aria-label="Filtra esercizi">
      <select id="f-blocco" aria-label="Filtra per blocco">
        <option value="">Tutti i blocchi</option>
        ${programma.blocchi.map((b) => `<option value="${b.id}">${b.numero}. ${esc(b.titolo)}</option>`).join("")}
      </select>
      <label><input type="checkbox" id="f-todo"> Solo da risolvere</label>
    </div>
    <div id="groups">
      ${byBlock.map(({ b, items }) => `
        <section class="exgroup" data-group="${b ? b.id : "altro"}">
          <h2 style="border-bottom:3px solid ${blockColor(b && b.id)};padding-bottom:6px">${b ? `${b.numero}. ${esc(b.titolo)}` : "Trasversali"}</h2>
          ${items.map(card).join("")}
        </section>`).join("")}
    </div>
    <p class="small muted" id="none" hidden>Nessun esercizio corrisponde al filtro.</p>`;

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
  }

  if (params.get("blocco")) $("#f-blocco").value = params.get("blocco");
  updateProgress();
  applyFilters();
  bindChecks($("#groups"), () => { updateProgress(); if ($("#f-todo").checked) applyFilters(); });
  ["#q", "#f-blocco", "#f-todo"].forEach((s) => $(s).addEventListener("input", applyFilters));
});
