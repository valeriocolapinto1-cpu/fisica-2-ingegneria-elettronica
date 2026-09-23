# Fisica Generale II — sito di studio

Sito statico per preparare l'esame di **Fisica Generale II** (Ingegneria Elettronica, Università di Roma, a.a. 2026/2027 — docenti [docente] ed [docente], 12 CFU).

Sito personale e **non ufficiale**. Programma, calendario e struttura d'esame sono quelli ufficiali del corso. I dettagli non disponibili sono segnati come segnaposto da completare.

## Pagine

| Pagina | File | Contenuto |
|---|---|---|
| Home | `index.html` | Panoramica del corso, progressi per blocco, prossima lezione, backup dei progressi |
| Programma | `programma.html` | I 7 blocchi (ore, capitoli), sezioni e argomenti ufficiali spuntabili, testo integrale, lezioni collegate |
| Percorso | `calendario.html` | Le 60 lezioni in ordine cronologico, spuntabili, con filtri per blocco/tipo/testo |
| Formulario | `formulario.html` | Formule per blocco con KaTeX (Maxwell in forma integrale e locale, ecc.), filtro, stampa |
| Esercizi | `esercizi.html` | Tracce di esercizio ricavate dal calendario, per blocco; testi da completare |
| Laboratorio | `laboratorio.html` | Le 5 esperienze con obiettivo, strumentazione e checklist della relazione |
| Esame | `esame.html` | Struttura di scritto e orale, soglia, voto finale, simulatore, risultati di apprendimento, Dropbox |
| Risorse | `risorse.html` | Testo di riferimento, dispense, pagina Roma, Dropbox |
| Cerca | `cerca.html` | Ricerca in programma, lezioni, formule, esercizi e laboratorio |

## Struttura dei file

```
├── index.html, programma.html, …   gusci HTML (tutti uguali, cambia lo script di pagina)
├── data/                           ← CONTENUTI: modifica questi file
│   ├── corso.json                  dati generali, docenti, link
│   ├── programma.json              7 blocchi → sezioni → argomenti
│   ├── lezioni.json                60 lezioni (tipo, capitoli, sezioni collegate)
│   ├── formule.json                formulario in LaTeX
│   ├── esercizi.json               tracce di esercizi (testo/soluzione da completare)
│   ├── laboratorio.json            esperienze di laboratorio
│   ├── esame.json                  struttura d'esame, risultati di apprendimento, criteri
│   └── risorse.json                bibliografia e link
├── assets/
│   ├── css/style.css               stile (tema chiaro/scuro con variabili CSS)
│   ├── js/common.js                header, tema, caricamento dati, localStorage, KaTeX
│   ├── js/<pagina>.js              uno script per pagina
│   └── vendor/katex/               KaTeX 0.16.22 incluso nel repo (funziona anche offline)
└── .nojekyll                       serve file statici su GitHub Pages senza passare da Jekyll
```

### Perché HTML/CSS/JS puro

- **Nessuna build**: non servono Node, npm o un framework. Modifichi un file, fai commit e il sito è aggiornato.
- **Manutenzione minima**: nessuna dipendenza da aggiornare, a parte KaTeX, che è già incluso nel repo.
- **Dati separati dalla presentazione**: i contenuti stanno tutti in `data/*.json` e gli script si limitano a disegnarli.
- **KaTeX locale** invece del CDN: è leggero, il rendering è istantaneo e il sito funziona anche senza rete dopo il primo caricamento.

## Pubblicare su GitHub Pages

1. Su GitHub apri **Settings → Pages**.
2. In *Build and deployment* scegli **Source: Deploy from a branch**.
3. Seleziona il branch (es. `main`) e la cartella **`/ (root)`**, poi **Save**.
4. Dopo circa un minuto il sito è raggiungibile su `https://<utente>.github.io/<nome-repo>/`.

## Provarlo in locale

I browser bloccano la lettura dei JSON se apri i file con doppio clic (`file://`). Avvia un server locale nella cartella del sito:

```bash
python3 -m http.server 8000
# poi apri http://localhost:8000
```

## Aggiornare i contenuti

- **Non cambiare gli `id`** esistenti (`b1a-3`, `es12`, `lab2:c4`, …): sono le chiavi con cui vengono salvati i progressi. Puoi aggiungere voci nuove con `id` nuovi.
- **LaTeX nei JSON**: ogni backslash va raddoppiato (`"\\vec E"`). Nei campi di testo (`note`, `testo`, `soluzione`) la matematica inline va tra `$...$` e quella in display tra `$$...$$`.
- **Esercizi**: in `esercizi.json` i campi `testo` e `soluzione` sono `null`, cioè da completare. Quando inserisci il testo sparisce il segnaposto.
- **Risultati di apprendimento**: in `esame.json` i 6 livelli sono segnaposto (`"placeholder": true`). Copia il testo ufficiale dalla pagina Roma e imposta `placeholder` a `false`.
- **Laboratorio**: obiettivi e strumentazione sono indicativi (`"indicativo": true`). Correggili secondo le schede del docente e imposta `indicativo` a `false`.
- **Collegamenti lezione → programma**: il campo `sezioni` di `lezioni.json` è indicativo, ricavato dal titolo della lezione. Puoi correggerlo liberamente.

## Progressi

Le checkbox (argomenti, lezioni, esercizi, checklist del laboratorio e dell'esame) sono salvate in `localStorage` con la chiave `fg2-progress-v1`, quindi restano **solo nel browser in uso**. Per passare da computer a telefono usa **Home → Backup dei progressi → Esporta / Importa**.

## Contenuti da completare / verificare

- Testo esatto dei 6 livelli dei risultati di apprendimento (`data/esame.json`).
- Testi e soluzioni degli esercizi (`data/esercizi.json`).
- Link alle dispense sulla teoria della misura (`data/risorse.json`).
- Obiettivi e strumentazione delle esperienze di laboratorio (`data/laboratorio.json`).
- Formulario: formule standard in unità SI; verifica notazione e convenzioni di segno sul Mencuccini-Silvestrini.

KaTeX è distribuito con licenza MIT (`assets/vendor/katex/LICENSE`).
