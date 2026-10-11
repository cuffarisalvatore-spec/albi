# Albi in Box — installazione (circa 20 minuti)

Servono due account gratuiti: **Supabase** (dati e copertine) e **GitHub** (per mettere online la pagina).
Non serve nessuna carta di credito.

## 1. Crea il database su Supabase
1. Vai su https://supabase.com e crea un account (puoi usare Google o GitHub).
2. **New project**: dai un nome (es. `albi`), scegli una password per il database (salvala, ma non ti servirà nell'app) e come regione **Frankfurt** o **Paris**. Attendi un paio di minuti.
3. Nel menu a sinistra apri **SQL Editor** → **New query**. Apri il file `supabase-setup.sql` di questa cartella con un editor di testo, copia tutto, incollalo e premi **Run**. Deve comparire "Success".
4. Menu **Authentication** → **Users** → **Add user** → **Create new user**. Inserisci la tua email e una password (quella che userai nell'app) e **lascia attiva la casella "Auto Confirm User"**.
5. Sempre in **Authentication**, nelle impostazioni dei metodi di accesso (**Sign In / Providers**), disattiva **Allow new users to sign up**, così nessun altro può registrarsi.
6. Apri **Project Settings** → **API** (in alcune versioni: pulsante **Connect**). Copia due valori:
   - **Project URL** (tipo `https://abcdefgh.supabase.co`)
   - la chiave **pubblica**: si chiama `anon` oppure `publishable`. **Non** usare mai la chiave `service_role` o `secret`.

## 2. Inserisci i due valori nell'app
Apri `config.js` con un editor di testo e sostituisci le due scritte `INCOLLA-QUI-...` con i valori copiati, tenendo gli apici:

    window.ALBI_CONFIG = {
      url: 'https://abcdefgh.supabase.co',
      key: 'la-tua-chiave-pubblica'
    };

I due valori non sono segreti: la protezione dei dati è nel login e nelle regole che hai creato al punto 3.

## 3. Pubblica su GitHub Pages
1. Su https://github.com crea un account (se non l'hai) e poi **New repository**: nome `albi`, **Public**, spunta "Add a README".
2. Nel repository: **Add file** → **Upload files**. Trascina dentro **tutto il contenuto** di questa cartella (anche le cartelle `icons` e `vendor`), tranne `GUIDA.md` e `supabase-setup.sql` se vuoi. **Non caricare il file di backup**: contiene la tua collezione e il repository è pubblico. Premi **Commit changes**.
3. **Settings** → **Pages** → in "Build and deployment" scegli **Deploy from a branch**, branch **main**, cartella **/ (root)**, **Save**.
4. Dopo uno-due minuti compare l'indirizzo: `https://TUONOME.github.io/albi/`. Aprilo.

## 4. Primo accesso e dati
1. Apri l'indirizzo, accedi con email e password del punto 1.4.
2. In **Collezione** premi **Importa backup** e scegli `albi-in-box-backup.json` (te l'ho dato a parte): carica i 1034 albi e i box già assegnati.
3. Copertine: **Importa copertine** e scegli di nuovo le immagini nella cartella `Copertine-ComicsBox` sul Mac, come già fatto.
4. Sul telefono: apri l'indirizzo in Chrome → menu ⋮ → **Installa app** (o "Aggiungi a schermata Home"). Apri l'app una volta con la rete, poi funziona anche in garage senza segnale; quello che inserisci parte da solo quando torna la rete.
5. Sul Mac: in Chrome compare l'icona di installazione nella barra dell'indirizzo; con Safari: File → **Aggiungi al Dock**.

## Aggiornare l'app in futuro
Sostituisci i file nel repository GitHub (Upload files, stesso nome = sovrascrive). Nel file `sw.js` cambia `VERSION = 'v1'` in `'v2'` (poi `'v3'`...) così i dispositivi scaricano la versione nuova.

## Se qualcosa non va
- **"sincronizzazione non configurata"**: `config.js` ha ancora le scritte di esempio o non è stato caricato.
- **"Email o password non corretti"**: l'utente va creato in Supabase (punto 1.4) con "Auto Confirm User".
- **Non sincronizza dopo giorni di inattività**: il progetto gratuito va in pausa dopo una settimana senza richieste. Supabase → apri il progetto → **Resume project**. I dati restano.
- **Backup**: ogni tanto usa **Esporta backup** in Collezione e conserva il file `.json`; **Esporta CSV** dà un elenco leggibile in Excel.
