# Vygo - Costi operativi e break-even

Documento interno. Le cifre sono stime prudenziali, non contabilita ufficiale. Servono per decidere quando aprire societa, quanto reinvestire e quanti clienti servono per stare tranquilli.

Fonti ufficiali da controllare periodicamente:

- Supabase pricing: https://supabase.com/pricing
- Netlify pricing: https://www.netlify.com/pricing/
- Expo pricing: https://expo.dev/pricing
- Apple Developer Program: https://developer.apple.com/programs/
- Google Play Console: https://support.google.com/googleplay/android-developer/answer/6112435
- Stripe pricing Italia: https://stripe.com/it/pricing
- Google Workspace pricing: https://workspace.google.com/pricing.html
- LexDo.it prezzi apertura/contabilita societa: https://www.lexdo.it/prezzi/
- Fiscozen prezzi commercialista online: https://www.fiscozen.it/prezzi/

## Costi fissi stimati mensili

| Voce | Stima mensile | Note |
| --- | ---: | --- |
| Commercialista | 180 euro | Fascia prudente per societa piccola operativa |
| Supabase / cloud dati | 30 euro | Base iniziale; cresce con storage/egress |
| Netlify Pro | 20 euro | Piano team/produttivo |
| Codex / ChatGPT | 24 euro | Stima abbonamento usato per sviluppo, da correggere col costo reale |
| Email dominio / Workspace | 7 euro | Una casella iniziale |
| Banca, PEC, firma, dominio | 25 euro | Media mensile prudente |
| Dominio vy-go.com | 4 euro | Costo annuo del dominio spalmato al mese, da aggiornare col prezzo reale |
| Apple Developer | 9 euro | 99 USD/anno accantonati mensilmente |
| Google Play Console | 2 euro | 25 USD una tantum ammortizzati |
| Margine sicurezza cloud/supporto | 75 euro | Buffer per egress, storage, strumenti e imprevisti |

Totale fisso prudente: circa **376 euro/mese**.

## Apertura societa e commercialista

Opzioni realistiche:

| Strada | Quando usarla | Stima |
| --- | --- | ---: |
| Servizio online per apertura societa | Ottimo per partire snelli, se preventivo e chiaro | LexDo.it dichiara societa da 99 euro/anno + IVA, notaio e imposte |
| Contabilita online societa | Buona fase iniziale se fatture e operativita sono semplici | LexDo.it dichiara contabilita da 125 euro/mese con limiti |
| Commercialista tradizionale SaaS/SRL | Da usare appena entrano clienti veri e contratti ricorrenti | 150-300 euro/mese prudente |
| Servizi Partita IVA | Utili solo se parti come ditta/forfettario, non come SRL SaaS | Fiscozen mostra piani da 49,9 euro/mese e 119,9 euro/mese |

Scelta consigliata per Vygo: iniziare con preventivo online se conviene, ma appena ci sono clienti paganti usare un commercialista che capisca SRL/SRLS, SaaS, IVA, Stripe, contratti B2B, dati esteri e fatturazione ricorrente.

## Tasse e IVA: riserva prudente

Questa parte non sostituisce il commercialista. Per decidere internamente, pero, Vygo deve ragionare cosi:

- i prezzi sono sempre **+ IVA**;
- l IVA incassata non e guadagno: entra in cassa ma appartiene allo Stato;
- il margine operativo non e ancora soldi liberi;
- su ogni margine positivo va accantonata una riserva tasse prudente;
- per una SRL/SRLS entrano in gioco imposte societarie, possibili imposte regionali, compenso amministratore o dividendi;
- per stare larghi, nel pannello admin usiamo **35% di riserva fiscale prudente** sul margine positivo.

Regola pratica: se Vygo incassa 450 euro + IVA, i 450 euro sono ricavo, l IVA e passaggio. Poi togli costi cloud, strumenti, Stripe, supporto e commercialista. Sul margine che resta accantoni il 35%.

## Costi variabili

| Voce | Metodo prudente | Perche |
| --- | ---: | --- |
| Stripe | circa 1,8% MRR + 0,25 euro/cliente | Commissioni carta e arrotondamento |
| Supporto cliente | 12 euro/cliente/mese | Tempo, onboarding leggero, piccoli interventi |
| Storage extra | coperto da pacchetti extra | Non regalarlo se il cliente carica molti file |
| Push/chat realtime | dentro cloud iniziale, da monitorare | Cresce con utilizzo reale |

## Scenari ricavo

| Clienti Fleet 10 | MRR netto IVA | Costi stimati | Margine prima tasse | Riserva tasse 35% | Netto prudente |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 450 euro | ~396 euro | ~54 euro | ~19 euro | ~35 euro |
| 2 | 900 euro | ~417 euro | ~483 euro | ~169 euro | ~314 euro |
| 5 | 2.250 euro | ~477 euro | ~1.773 euro | ~621 euro | ~1.152 euro |
| 10 | 4.500 euro | ~580 euro | ~3.920 euro | ~1.372 euro | ~2.548 euro |

L obiettivo iniziale non e vivere di Vygo: e dimostrare che 5-10 aziende pagano.

## Punto di pareggio

Con costi snelli, il pareggio operativo puo arrivare gia con 1-2 clienti Fleet 10.

Pero il vero punto di sicurezza e **5 clienti paganti**, perche coprono:

- costi fissi;
- imprevisti;
- prime spese legali/contabili;
- tempo di assistenza;
- piccoli errori di pricing.

## Regole di controllo

- Niente dipendenti finche il MRR non e stabile.
- Niente ufficio fisico.
- Nessuna campagna marketing costosa senza demo validate.
- Ogni extra cloud deve essere coperto da pricing storage.
- Tenere nel pannello admin un cruscotto con costi, MRR, margine e break-even.
- Rivedere questi costi ogni mese.

## Cosa guardare nel pannello admin

- MRR stimato;
- incassato storico;
- aziende attive;
- costi fissi stimati;
- commissioni Stripe stimate;
- margine mensile stimato;
- clienti necessari al pareggio;
- scenari a 1, 2, 5 e 10 clienti.
- riserva tasse stimata;
- netto prudente dopo riserva fiscale.

Se il margine scende, prima di abbassare prezzi bisogna controllare:

- storage usato;
- egress Supabase;
- allegati video;
- numero richieste supporto;
- deploy/build inutili;
- clienti senza piano corretto.
