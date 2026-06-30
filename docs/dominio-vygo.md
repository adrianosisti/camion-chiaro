# Dominio Vygo

## Dominio acquistato

Dominio principale acquistato:

`vy-go.com`

Registrar:

Register.it

## DNS

Gestione DNS consigliata:

Cloudflare

Nameserver Cloudflare impostati su Register.it:

- `ashley.ns.cloudflare.com`
- `bryce.ns.cloudflare.com`

## Record sito

Record da tenere in Cloudflare, se il sito resta su Netlify:

```text
Tipo: A
Nome: @
Valore: 75.2.60.5
Proxy: DNS only
TTL: Auto
```

```text
Tipo: CNAME
Nome: www
Valore: reliable-unicorn-eb61fe.netlify.app
Proxy: DNS only
TTL: Auto
```

## Netlify

Domini da aggiungere al progetto Netlify:

- `vy-go.com`
- `www.vy-go.com`

Dominio principale consigliato:

`www.vy-go.com`

Il dominio senza `www` deve reindirizzare al dominio principale.

## Email

Email non ancora attivata.

Scelta consigliata:

Google Workspace Business Starter con utente principale:

`info@vy-go.com`

Alias consigliati:

- `support@vy-go.com`
- `demo@vy-go.com`
- `commerciale@vy-go.com`
- `amministrazione@vy-go.com`

Quando Google Workspace sara attivo, aggiungere in Cloudflare i record MX, SPF, DKIM e DMARC indicati da Google.

## Nota pratica

Non cambiare nameserver dopo aver collegato Cloudflare, altrimenti i record sito e mail smettono di essere letti da Internet.
