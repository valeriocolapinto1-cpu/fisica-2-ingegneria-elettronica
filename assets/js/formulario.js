/* Formulario: formule per blocco renderizzate con KaTeX */
page(async () => {
  const { programma, formule } = await loadData("programma", "formule");
  const { blocchi } = indexProgramma(programma);
  const app = $("#app");

  const wide = (f) => f.tex.length > 140; // formule lunghe occupano tutta la riga

  app.innerHTML = `
    <h1>Formulario</h1>
    <p class="page-intro">Formule chiave per ogni blocco, in unità SI. Ricontrollale sempre sul Mencuccini-Silvestrini e sugli appunti:
      notazione e convenzioni di segno possono variare. Per aggiungere o correggere una formula modifica <code>data/formule.json</code>.</p>
    <div class="toolbar no-print">
      <input type="search" id="q" placeholder="Filtra formule (es. Poynting, capacità, Snell)…" aria-label="Filtra formule">
      <button class="btn" type="button" onclick="window.print()">Stampa</button>
    </div>
    <nav class="toc no-print" aria-label="Blocchi">
      ${formule.blocchi.map((fb) => { const b = blocchi[fb.blocco]; return `<a class="chip bchip" style="--bc:${blockColor(b.id)}" href="#${b.id}">${b.numero}. ${esc(b.titolo)}</a>`; }).join("")}
    </nav>
    <div id="formule">
      ${formule.blocchi.map((fb) => {
        const b = blocchi[fb.blocco];
        return `<section class="fblock" id="${b.id}" style="--bc:${blockColor(b.id)}">
          <h2>${b.numero}. ${esc(b.titolo)} ${b.capitoli ? `<span class="badge">${esc(b.capitoli)}</span>` : ""}</h2>
          ${fb.gruppi.map((g) => `
            <div class="fgroup">
              <h3>${esc(g.titolo)}</h3>
              <div class="formulas">
                ${g.formule.map((f) => `
                  <div class="formula${wide(f) ? " wide" : ""}" id="f-${esc(f.id)}" data-search="${esc(norm(`${f.nome} ${f.note || ""} ${g.titolo} ${f.tex}`))}">
                    <div class="fname">${esc(f.nome)}</div>
                    <div class="fmath">${tex(f.tex, true)}</div>
                    ${f.note ? `<div class="fnote">${esc(f.note)}</div>` : ""}
                  </div>`).join("")}
              </div>
            </div>`).join("")}
        </section>`;
      }).join("")}
    </div>
    <p class="small muted" id="none" hidden>Nessuna formula corrisponde al filtro.</p>`;

  // matematica inline ($...$) nelle note
  $all(".fnote").forEach(renderMathIn);

  $("#q").addEventListener("input", () => {
    const q = norm($("#q").value.trim());
    const words = q ? q.split(/\s+/) : [];
    let any = false;
    $all(".formula").forEach((el) => {
      const ok = words.every((w) => el.dataset.search.includes(w));
      el.classList.toggle("hidden", !ok);
      any = any || ok;
    });
    $all(".fgroup").forEach((g) => g.classList.toggle("hidden", !$all(".formula:not(.hidden)", g).length));
    $all(".fblock").forEach((s) => s.classList.toggle("hidden", !$all(".formula:not(.hidden)", s).length));
    $("#none").hidden = any;
  });
});
