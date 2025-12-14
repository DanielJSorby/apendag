# Feilsøking: 535 Incorrect authentication data

## Steg-for-steg sjekkliste:

### 1. Verifiser at passordet er riktig
Test passordet ved å logge inn på webmail:
- Gå til: https://webmail.domeneshop.no
- Brukernavn: `elvebakkenapend1`
- Passord: Det samme som i `.env`-filen
- Hvis innlogging feiler → Passordet er feil

### 2. Sjekk .env-filen
Kontroller at `.env`-filen inneholder:
```env
SMTP_HOST=smtp.domeneshop.no
SMTP_PORT=587
SMTP_USER=elvebakkenapend1
SMTP_PASS=ditt-passord-her
```

**Viktig:**
- Ingen ekstra mellomrom rundt `=`
- Ingen anførselstegn rundt verdiene
- Passordet må være eksakt det samme som i Domeneshop

### 3. Hvis passordet er feil
1. Gå til Domeneshop kundesenter
2. Gå til "Mine domener" > "elvebakkenapendag.no" > "Administrere epost"
3. Klikk på "Developer (elvebakkenapend1)" brukeren
4. Klikk "Endre passord"
5. Sett et nytt passord
6. Oppdater `.env`-filen med det nye passordet
7. Restart serveren

### 4. Test med webmail først
Før du tester SMTP, test at du kan logge inn på webmail med samme brukernavn og passord.

### 5. Hvis alt feiler
Kontakt Domeneshop support og be dem verifisere:
- At brukernavnet `elvebakkenapend1` er aktivt
- At SMTP-tilgang er aktivert for kontoen
- Om det er noen spesielle krav for SMTP-autentisering

