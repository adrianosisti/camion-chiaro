# Guida import Excel Vygo

## A cosa serve

L'import Excel serve per avviare velocemente una nuova azienda senza inserire tutto a mano.
Con un solo file si possono caricare:

- autisti con username, password temporanea e telefono;
- persone di ufficio e magazzino;
- mezzi della flotta;
- muletti e attrezzature;
- documenti autista;
- scadenze collegate ad autisti, persone, targhe, muletti o azienda.

## File modello

Nel sito, dentro **Anagrafiche**, aprire **Importa da Excel** e scaricare:

- `Modello Excel`, consigliato;
- `CSV tecnico`, alternativa solo se Excel crea problemi.

Il modello Excel e diviso in fogli semplici:

- `LEGGIMI`: mini guida;
- `Autisti`: autisti con username, password, telefono e documento iniziale;
- `Persone`: ufficio, magazzino, carrellisti e altri dipendenti;
- `Mezzi`: targhe della flotta;
- `Attrezzature`: muletti, transpallet e strumenti di magazzino;
- `Documenti autisti`: altri documenti degli autisti;
- `Scadenze`: scadenze collegate ad autisti, persone, targhe, attrezzature o azienda.

Il cliente deve cancellare o sostituire le righe esempio e compilare solo i fogli che servono.

Nel modello i campi con `*` sono obbligatori. Gli altri sono facoltativi.

Esempio: nel foglio `Autisti` sono obbligatori nome, username, password e telefono. Documento iniziale e scadenza possono restare vuoti: l'autista potra caricarli dopo dall'app.

## Colonne principali senza complicazioni

Nel file Excel non serve scrivere `tipo_riga`: Vygo capisce cosa importare dal nome del foglio.

Nel foglio `Scadenze`, la colonna `Ambito scadenza` dice a cosa si riferisce la pratica:

- `autista`
- `persona`
- `mezzo`
- `attrezzatura`
- `azienda`

`username` collega autisti e persone.

`Username o targa o codice` collega la scadenza alla persona giusta, alla targa giusta o al muletto giusto.

Nel foglio `Scadenze`, `Username o targa o codice` e obbligatorio per autista, persona, mezzo e attrezzatura. Puo restare vuoto solo se `Ambito scadenza` e `azienda`.

Le date possono essere scritte come `2027-05-31` oppure `31/05/2027`.

## Regole importanti

Ogni username deve essere unico.

Ogni targa deve essere unica.

Ogni codice attrezzatura deve essere unico.

Le password temporanee devono avere almeno 8 caratteri.

Le scadenze devono puntare a un target già esistente o presente nello stesso file.

## Procedura consigliata

1. Scaricare il modello.
2. Compilare prima autisti, persone, mezzi e attrezzature.
3. Inserire sotto le scadenze collegate.
4. Caricare il file in Vygo.
5. Controllare l'anteprima.
6. Se Vygo dice `Tutto ok`, premere importa.
7. Se Vygo segnala righe rosse, correggere il file e ricaricarlo.

Le righe valide aggiornano subito anagrafiche, documenti e scadenze. Le righe con errori non vengono importate, cosi non sporcano l'archivio.

## Nota per onboarding clienti

Per aziende grandi conviene fare il primo import con pochi dati campione, controllare che tutto sia corretto, poi caricare l'anagrafica completa.
