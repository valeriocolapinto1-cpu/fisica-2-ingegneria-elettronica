/* Risorse: testo, dispense, link */
page(async () => {
  const { risorse, programma } = await loadData("risorse", "programma");
  const { blocchi } = indexProgramma(programma);
  const t = risorse.testo;
  const app = $("#app");

  app.innerHTML = `
    <h1>Risorse</h1>
    <p class="page-intro">Materiale di riferimento indicato nel programma ufficiale del corso.</p>

    <section class="card accent">
      <h2>Testo di riferimento</h2>
      <p style="font-size:1.05rem">${esc(t.autori)}, <em>${esc(t.titolo)}</em>, ${esc(t.editore)}.</p>
      <table class="score-table" style="max-width:560px">
        <thead><tr><th>Capitoli</th><th>Blocco del programma</th></tr></thead>
        <tbody>${t.capitoli.map((c) => { const b = blocchi[c.blocco]; return `<tr><td>${esc(c.cap)}</td><td><a href="programma.html#${b.id}">${b.numero}. ${esc(b.titolo)}</a></td></tr>`; }).join("")}</tbody>
      </table>
      <p class="small muted" style="margin-bottom:0">I blocchi 6 (Cenni di Fisica Moderna) e 7 (Laboratorio) non hanno un capitolo indicato nel programma.</p>
    </section>

    <h2>Bibliografia aggiuntiva e link</h2>
    <div class="grid grid-2">
      ${risorse.altre.map((r) => `
        <div class="card">
          <h3>${esc(r.titolo)}</h3>
          <p class="small muted">${esc(r.descrizione)}</p>
          ${r.url
            ? `<a class="btn primary" href="${esc(r.url)}" target="_blank" rel="noopener">Apri${EXT}</a>`
            : `<p class="placeholder-text small" style="margin:0">Link non ancora disponibile: aggiungilo nel campo <code>url</code> di <code>data/risorse.json</code>.</p>`}
        </div>`).join("")}
    </div>

    <h2>Come aggiornare il sito</h2>
    <div class="card">
      <p>Tutti i contenuti sono nei file JSON della cartella <code>data/</code>:</p>
      <ul>
        <li><code>corso.json</code> — dati generali, docenti, link</li>
        <li><code>programma.json</code> — i 7 blocchi con sezioni e argomenti</li>
        <li><code>lezioni.json</code> — le 60 lezioni del calendario</li>
        <li><code>formule.json</code> — il formulario (LaTeX)</li>
        <li><code>esercizi.json</code> — le tracce degli esercizi (testi da completare)</li>
        <li><code>laboratorio.json</code> — le esperienze di laboratorio</li>
        <li><code>esame.json</code> — struttura d'esame e risultati di apprendimento</li>
        <li><code>risorse.json</code> — questa pagina</li>
      </ul>
      <p class="small muted" style="margin-bottom:0">Non cambiare gli <code>id</code> esistenti: sono le chiavi con cui vengono salvati i tuoi progressi. Istruzioni complete nel <code>README.md</code>.</p>
    </div>`;
});
