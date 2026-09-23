/* Risorse: testo, dispense, link */
page(async () => {
  const { risorse, programma } = await loadData("risorse", "programma");
  const { blocchi } = indexProgramma(programma);
  const t = risorse.testo;
  const app = $("#app");

  app.innerHTML = `
    ${pageHead("Risorse", "Libri e link utili", "Il materiale di riferimento indicato nel programma ufficiale del corso.")}

    <section class="card accent">
      <h2>Testo di riferimento</h2>
      <p style="font-size:1.05rem">${esc(t.autori)}, <em>${esc(t.titolo)}</em>, ${esc(t.editore)}.</p>
      <table class="score-table" style="max-width:560px">
        <thead><tr><th>Capitoli</th><th>Blocco del programma</th></tr></thead>
        <tbody>${t.capitoli.map((c) => { const b = blocchi[c.blocco]; return `<tr><td>${esc(c.cap)}</td><td><a href="programma.html#${b.id}">${b.numero}. ${esc(b.titolo)}</a></td></tr>`; }).join("")}</tbody>
      </table>
      <p class="small muted" style="margin-bottom:0">I blocchi 6 (Cenni di Fisica Moderna) e 7 (Laboratorio) non hanno un capitolo indicato nel programma.</p>
    </section>

    <div class="section-title"><h2>Bibliografia aggiuntiva e link</h2></div>
    <div class="grid grid-2">
      ${risorse.altre.map((r) => `
        <div class="card">
          <h3>${esc(r.titolo)}</h3>
          <p class="small muted">${esc(r.descrizione)}</p>
          ${r.url
            ? `<a class="btn primary" href="${esc(r.url)}" target="_blank" rel="noopener">Apri${EXT}</a>`
            : `<p class="soft-text small" style="margin:0">Distribuite dai docenti durante il corso: controlla la pagina ufficiale e le comunicazioni del corso.</p>`}
        </div>`).join("")}
    </div>

`;
});
