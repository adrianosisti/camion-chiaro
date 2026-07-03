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
- `Modello CSV`, alternativa leggera se Excel crea problemi.

Il modello contiene righe esempio. Il cliente deve sostituire gli esempi con i propri dati.

## Colonne principali

`tipo_riga` decide cosa crea Vygo:

- `autista`
- `persona`
- `mezzo`
- `attrezzatura`
- `documento_autista`
- `scadenza`

`ambito_scadenza` si usa per documenti e scadenze:

- `autista`
- `persona`
- `mezzo`
- `attrezzatura`
- `azienda`

`username` collega autisti e persone.

`targa_o_codice` collega mezzi e attrezzature.

`data_scadenza` va scritta in formato `AAAA-MM-GG`, esempio `2027-05-31`.

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
6. Importare solo le righe valide.
7. Correggere eventuali righe segnalate e ricaricare il file.

## Nota per onboarding clienti

Per aziende grandi conviene fare il primo import con pochi dati campione, controllare che tutto sia corretto, poi caricare l'anagrafica completa.
