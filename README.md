# Fisica Generale II — sito di studio

Sito statico per preparare l'esame di **Fisica Generale II** (Ingegneria Elettronica, Università di Roma, a.a. 2026/2027 — docenti [docente] ed [docente], 12 CFU).

Sito personale e **non ufficiale**. Programma, calendario e struttura d'esame sono quelli ufficiali del corso. I dettagli non disponibili sono segnati come segnaposto da completare.

## Pagine

| Pagina | File | Contenuto |
|---|---|---|
| Home | `index.html` | Panoramica del corso, progressi per blocco, prossima lezione, backup dei progressi |
| Programma | `programma.html` | Due viste nella stessa pagina: **Lezioni** (le 60 lezioni in ordine, spuntabili, con filtri) e **Programma ufficiale** (7 blocchi con ore, capitoli, argomenti e testo integrale). `calendario.html` rimanda qui |
| Simula esame | `simulazione.html` | Generatore di prove con i testi veri: scritto misto (4 esercizi di argomenti diversi + 2 domande di teoria), appello vero completo (timer 2h30) o orale (3 domande, opzionale una di laboratorio), autocorrezione con totale, soglia e voto stimato. Il codice prova nell'URL la rende riproducibile |
| Formulario | `formulario.html` | Formule per blocco con KaTeX (Maxwell in forma integrale e locale, ecc.), filtro, stampa |
| Esercizi | `esercizi.html` | Gli esercizi reali dei 48 appelli d'esame (con soluzioni) e le domande di teoria, filtrabili per argomento e anno |
| Laboratorio | `laboratorio.html` | Le 5 esperienze con obiettivo, strumentazione e checklist della relazione |
| Esame | `esame.html` | Struttura di scritto e orale, soglia, voto finale, risultati di apprendimento, materiali (`risorse.html` rimanda qui) |
| Cerca | `cerca.html` | Ricerca in programma, lezioni, formule, esercizi e laboratorio |
| Privacy | `privacy.html` | Informativa: nessun cookie, dati solo nel browser, statistiche facoltative |
| Note legali | `note-legali.html` | Termini d'uso, sito non ufficiale, licenze |
| 404 | `404.html` | Pagina di errore con ricerca (GitHub Pages la usa in automatico) |

## Struttura dei file

```
├── index.html, programma.html, …   gusci HTML (tutti uguali, cambia lo script di pagina)
├── data/                           ← CONTENUTI: modifica questi file
│   ├── corso.json                  dati generali, docenti, link
│   ├── programma.json              7 blocchi → sezioni → argomenti
│   ├── lezioni.json                60 lezioni (tipo, capitoli, sezioni collegate)
│   ├── formule.json                formulario in LaTeX
│   ├── appelli.json                48 appelli: esercizi, domande di teoria, soluzioni (estratti dai PDF)
│   ├── laboratorio.json            esperienze di laboratorio
│   ├── esame.json                  struttura d'esame, risultati di apprendimento, criteri
│   └── risorse.json                bibliografia e link
├── assets/
│   ├── css/style.css               stile (tema chiaro/scuro con variabili CSS)
│   ├── js/common.js                header, tema, caricamento dati, localStorage, KaTeX
│   ├── js/<pagina>.js              uno script per pagina
│   ├── vendor/katex/               KaTeX 0.16.22 incluso nel repo (funziona anche offline)
│   └── vendor/geist/               font Geist e Geist Mono (licenza OFL)
│   ├── js/static.js                script delle pagine statiche (privacy, note legali, 404)
│   ├── img/                        icone PWA e immagine Open Graph (PNG compressi)
│   └── appelli/                    ritagli WebP di esercizi e soluzioni dai PDF degli appelli
├── favicon.ico, favicon.svg, apple-touch-icon.png, site.webmanifest
├── robots.txt, sitemap.xml         indicizzazione (URL assoluti del sito su GitHub Pages)
├── .github/workflows/pages.yml     deploy automatico su GitHub Pages
└── .nojekyll                       serve file statici su GitHub Pages senza passare da Jekyll
```

### Perché HTML/CSS/JS puro

- **Nessuna build**: non servono Node, npm o un framework. Modifichi un file, fai commit e il sito è aggiornato.
- **Manutenzione minima**: nessuna dipendenza da aggiornare, a parte KaTeX, che è già incluso nel repo.
- **Dati separati dalla presentazione**: i contenuti stanno tutti in `data/*.json` e gli script si limitano a disegnarli.
- **KaTeX locale** invece del CDN: è leggero, il rendering è istantaneo e il sito funziona anche senza rete dopo il primo caricamento.

## Pubblicare su GitHub Pages

Il workflow `.github/workflows/pages.yml` pubblica il sito automaticamente a ogni push su `main`.
Se il primo deploy fallisce perché Pages non è ancora attivo: **Settings → Pages → Build and deployment → Source: GitHub Actions**, poi rilancia il workflow da **Actions → Deploy su GitHub Pages → Run workflow**.

Indirizzo del sito: `https://<utente>.github.io/<nome-repo>/`.

## Provarlo in locale

I browser bloccano la lettura dei JSON se apri i file con doppio clic (`file://`). Avvia un server locale nella cartella del sito:

```bash
python3 -m http.server 8000
# poi apri http://localhost:8000
```

## Aggiornare i contenuti

- **Non cambiare gli `id`** esistenti (`b1a-3`, `es12`, `lab2:c4`, …): sono le chiavi con cui vengono salvati i progressi. Puoi aggiungere voci nuove con `id` nuovi.
- **LaTeX nei JSON**: ogni backslash va raddoppiato (`"\\vec E"`). Nei campi di testo (`note`, `testo`, `soluzione`) la matematica inline va tra `$...$` e quella in display tra `$$...$$`.
- **Appelli**: `appelli.json` e le immagini in `assets/appelli/` sono generati dai PDF della cartella Dropbox del corso. Per un nuovo appello aggiungi una voce con lo stesso formato (immagini di esercizi e soluzioni, testo per la ricerca, `blocco` = argomento b1–b5). Il campo `blocco` è stimato automaticamente: correggilo se è sbagliato.
- **Risultati di apprendimento**: in `esame.json` i 6 livelli sono segnaposto (`"placeholder": true`). Copia il testo ufficiale dalla pagina Roma e imposta `placeholder` a `false`.
- **Laboratorio**: obiettivi e strumentazione sono indicativi (`"indicativo": true`). Correggili secondo le schede del docente e imposta `indicativo` a `false`.
- **Collegamenti lezione → programma**: il campo `sezioni` di `lezioni.json` è indicativo, ricavato dal titolo della lezione. Puoi correggerlo liberamente.

## SEO, contatti, statistiche

- **URL del sito**: `canonical`, Open Graph, `sitemap.xml` e `robots.txt` usano `https://valeriocolapinto1-cpu.github.io/fisica-2-ingegneria-elettronica/`. Se rinomini il repo o usi un dominio tuo, aggiorna quell'indirizzo nelle pagine HTML e in `sitemap.xml`/`robots.txt`.
- **robots.txt**: i motori di ricerca lo leggono solo nella radice del dominio. Su un sito di progetto (`utente.github.io/repo/`) conta solo se hai anche un sito utente `utente.github.io`. La sitemap puoi comunque inviarla direttamente da Google Search Console.
- **Contatti**: `data/corso.json → contatti`. Per ora c'è solo il profilo GitHub. `email` è `null`, così l'indirizzo non viene pubblicato.
- **Statistiche (facoltative)**: crea un account gratuito su [goatcounter.com](https://www.goatcounter.com) (senza cookie) e inserisci il codice del sito in `data/corso.json → analytics.goatcounter`. Il banner allora chiede il consenso e lo script si carica solo dopo “Accetta”. Con `null` il banner è solo informativo.

## Progressi

Le checkbox (lezioni, esercizi d'esame, checklist del laboratorio e dell'esame) sono salvate in `localStorage` con la chiave `fg2-progress-v1`, quindi restano **solo nel browser in uso**. Per passare da computer a telefono usa **Programma → Porta i progressi con te → Esporta / Importa**.

## Contenuti da completare / verificare

- Testo esatto dei 6 livelli dei risultati di apprendimento (`data/esame.json`).
- Link alle dispense sulla teoria della misura (`data/risorse.json`).
- Obiettivi e strumentazione delle esperienze di laboratorio (`data/laboratorio.json`).
- Formulario: formule standard in unità SI; verifica notazione e convenzioni di segno sul Mencuccini-Silvestrini.

KaTeX è distribuito con licenza MIT (`assets/vendor/katex/LICENSE`).

## Design

Font Geist (self-hosted), tema chiaro/scuro, animazioni leggere: comparsa degli elementi allo scroll, transizioni tra pagine (View Transitions API, dove il browser la supporta), micro-interazioni su pulsanti e checkbox. Con l'impostazione di sistema "riduci movimento" le animazioni vengono disattivate. Il design segue le Web Interface Guidelines di Vercel (skill `web-design-guidelines` in `.agents/skills/`).
