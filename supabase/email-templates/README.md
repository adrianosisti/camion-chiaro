# Template email Vygo per Supabase

Questi file sono pronti da copiare in Supabase:

- `password-recovery.html`: template **Reset password**.
- `confirm-signup.html`: template **Confirm sign up**.

In Supabase vai in **Authentication > Emails > Templates**, apri il template corretto e incolla l HTML.

I link usano `{{ .ConfirmationURL }}`, la variabile ufficiale di Supabase per conferme e reset password.

## Mittente personalizzato

Quando attiviamo la posta del dominio, in Supabase va configurato **Custom SMTP** con un mittente tipo:

- `Vygo <noreply@vy-go.com>`
- oppure `Vygo Support <support@vy-go.com>`

Prima servono provider email/SMTP e record DNS del dominio: SPF, DKIM e DMARC.
