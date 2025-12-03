# Elvebakken Åpen Dag

Nettside for Elvebakken VGS sine åpne dag-arrangementer. Nettsiden gir informasjon om skolens studieretninger, aktiviteter, og praktisk informasjon for kommende elever og foresatte.

## 🎯 Om Prosjektet

Denne nettsiden er laget for å presentere Elvebakken VGS sine åpne dager som arrangeres i januar. Besøkende kan:
- Utforske skolens fem studieretninger (ST, KDA, MK, IM, EL)
- Se program for åpen dag tirsdag 20. januar og torsdag 22. januar
- Få svar på ofte stilte spørsmål (FAQ)
- Chatte med andre interesserte
- Lese detaljert informasjon om hver studieretning

## 🛠️ Teknologi

**Frontend:**
- [SvelteKit](https://kit.svelte.dev/) 2.47.1
- [Svelte](https://svelte.dev/) 5.41.0 (med Runes)
- [Vite](https://vitejs.dev/) 7.1.10
- TypeScript 5.9.3

**Backend:**
- [MariaDB](https://mariadb.org/) 11.8.3
- [Sequelize](https://sequelize.org/) 6.37.7 ORM
- Node.js med dotenv for miljøvariabler

**Styling:**
- CSS med custom properties
- Oslo Sans font
- Responsivt design (mobile-first)

## 📁 Prosjektstruktur

```
frontend/
├── src/
│   ├── routes/
│   │   ├── +page.svelte              # Hovedside med studieretninger
│   │   ├── kalender20/               # Program for tirsdag 20. januar
│   │   ├── kalender22/               # Program for torsdag 22. januar
│   │   ├── linjer/[linje]/           # Detaljsider for hver studieretning
│   │   ├── chatside/                 # Chat-funksjonalitet
│   │   ├── FAQ/                      # Ofte stilte spørsmål
│   │   └── api/                      # API-endepunkter
│   │       ├── messages/             # Chat-meldinger (GET/POST)
│   │       └── user/lagBruker/       # Brukerregistrering
│   ├── lib/
│   │   ├── components/               # Gjenbrukbare komponenter
│   │   │   ├── navbar.svelte         # Navigasjonsmeny
│   │   │   ├── footer.svelte         # Footer
│   │   │   ├── Linjeknapp.svelte     # Studieretning-knapper
│   │   │   ├── chat.svelte           # Chat-komponent
│   │   │   └── aktivitetsBoks.svelte # Aktivitetskort
│   │   ├── server/db.ts              # Database-konfigurasjon
│   │   └── functions/                # Hjelpefunksjoner
│   └── app.html                      # HTML-template
├── static/
│   ├── linjer.json                   # Data for studieretninger
│   ├── aktiviteter.json              # Aktivitetsdata
│   ├── api/faq.json                  # FAQ-data
│   ├── images/                       # Bilder
│   └── fonts/                        # Oslo Sans fonter
└── .env                              # Miljøvariabler (ikke i git)
```

## 🚀 Komme i gang

### Forutsetninger
- Node.js (v18 eller nyere)
- MariaDB server
- npm eller pnpm

### Installasjon

1. **Klon repositoriet:**
```bash
git clone https://github.com/DanielJSorby/apendag.git
cd apendag/frontend
```

2. **Installer avhengigheter:**
```bash
npm install
```

3. **Konfigurer miljøvariabler:**
Opprett en `.env`-fil i `frontend/`-mappen:
```env
DB_HOST=100.67.100.69
DB_PORT=3306
DB_USER=root
DB_PASSWORD=ditt_passord
DB_NAME=apendag
```

4. **Sett opp database:**
MariaDB må ha følgende tabeller:
- `bruker` (id, navn, email, kursfor, kursetter)
- `chat` (id, brukerID, melding, timestamp)

5. **Start utviklingsserver:**
```bash
npm run dev
```

Nettsiden kjører nå på `http://localhost:5173`

## 📝 Viktige Filer

### Konfigurasjon
- `/static/linjer.json` - Innhold for alle studieretninger
- `/static/aktiviteter.json` - Aktiviteter for åpne dager
- `/static/api/faq.json` - FAQ-innhold
- `/.env` - Database-tilkoblingsinfo (ikke commitet)

### Fargepalett
Definert i `/src/routes/+layout.svelte`:
- `--color-pink: #D93B60` (Medier og Kommunikasjon)
- `--color-blue: #31ABC6` (Studiespesialisering, IM)
- `--color-green: #497450` (Kunst, design og arkitektur)
- `--color-orange: #DC8946` (Elektro og datateknologi)
- Lysere varianter: `-light` suffiks

## 🎨 Studieretninger

Nettsiden presenterer fem studieretninger:

1. **ST** - Studiespesialisering (blå)
2. **KDA** - Kunst, design og arkitektur (grønn)
3. **MK** - Medier og Kommunikasjon (rosa)
4. **IM** - Informasjonsteknologi og medieproduksjon (blå)
5. **EL** - Elektro og datateknologi (oransje)

## 📱 Responsivt Design

- Desktop: Full bredde med animasjoner
- Mobil (<768px): Hamburger-meny, tilpasset layout
- Små skjermer (<570px): Optimalisert for mobilvisning

## 🔧 Kommandoer

```bash
npm run dev          # Start utviklingsserver
npm run build        # Bygg for produksjon
npm run preview      # Forhåndsvis produksjonsbuild
npm run check        # Kjør TypeScript/Svelte sjekk
```

## 🗄️ Database

**Bruker-tabell:**
- `id` (STRING, PRIMARY KEY)
- `navn` (STRING)
- `email` (STRING)
- `kursfor` (STRING)
- `kursetter` (STRING)

**Chat-tabell:**
- `id` (STRING, PRIMARY KEY)
- `brukerID` (STRING, FOREIGN KEY)
- `melding` (TEXT)
- `timestamp` (DATE)

## 🌐 API-endepunkter

- `GET /api/messages/get` - Hent chat-meldinger
- `POST /api/messages/post` - Send ny melding
- `POST /api/user/lagBruker` - Opprett ny bruker

## 👥 Bidra

Dette er et skoleprosjekt for Elvebakken VGS. For spørsmål eller forslag, kontakt prosjektadministrator.

## 📄 Lisens

Dette prosjektet er utviklet for Elvebakken VGS.

## 🎓 Kontakt

**Elvebakken VGS**
- Nettside: [elvebakken.vgs.no](https://elvebakken.vgs.no)
- Åpen dag: Tirsdag 20. januar og torsdag 22. januar

---

Utviklet med ❤️ for Elvebakken VGS
Av Daniel Johan Sørby, Simen Evenrud Blien, Johan Album Arntzen og Henrik Luan

