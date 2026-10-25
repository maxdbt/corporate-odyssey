# Indagine: la scelta finale (CEO / Caraibi)

Alla fine del gioco ogni scelta viene inviata, in forma anonima, a un Google Sheet tramite un Google Apps Script.
Il codice del gioco è in `src/systems/Survey.js`. Le ultime 50 scelte restano anche nel browser, nella chiave
localStorage `co_final_choices`.

## Dati registrati (una riga per finale)

| colonna | contenuto |
|---|---|
| ts | data e ora (UTC, ISO) |
| choice | `ceo` oppure `caraibi` |
| character | `man` (Jack) oppure `woman` (Wendy) |
| version | versione del gioco (da `package.json`) |
| tripLeg | tappa della trasferta: `desert` / `glacier` / `sea` (vuoto se non giocata) |
| startedFrom | livello da cui è partita la partita (es. `1-1` = partita completa) |
| minutes | minuti dall'inizio della partita alla scelta |
| player | id casuale anonimo per browser, per riconoscere le partite ripetute |

Non ci sono dati personali. La schermata della scelta mostra un avviso.

## Configurazione (una volta sola)

1. Crea un nuovo Google Sheet, per esempio "Corporate Odyssey - scelte".
2. Apri il menu **Estensioni → Apps Script**, cancella il codice di esempio e incolla questo:

   ```js
   const COLS = ['ts', 'choice', 'character', 'version', 'tripLeg', 'startedFrom', 'minutes', 'player'];

   function doPost(e) {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
     if (sheet.getLastRow() === 0) sheet.appendRow(COLS);
     const d = JSON.parse(e.postData.contents);
     if (d.choice !== 'ceo' && d.choice !== 'caraibi') return ContentService.createTextOutput('bad');
     sheet.appendRow(COLS.map((c) => String(d[c] ?? '').slice(0, 40)));
     return ContentService.createTextOutput('ok');
   }
   ```

3. Fai clic su **Esegui il deployment → Nuovo deployment** e scegli il tipo **App web**, con:
   - "Esegui come": **Me**;
   - "Chi può accedere": **Chiunque**.

   Poi fai clic su **Esegui il deployment** e autorizza l'accesso.
4. Copia l'URL dell'app web, del tipo `https://script.google.com/macros/s/.../exec`, e incollalo in
   `SURVEY_URL` dentro `src/systems/Survey.js`. Poi pubblica una nuova release.

Se cambi lo script, crea un nuovo deployment oppure aggiorna quello esistente da **Gestisci deployment**: l'URL resta lo stesso.

## Note

- L'invio usa `fetch` con `no-cors` e il tipo `text/plain`: il gioco non legge la risposta, e se il giocatore è
  offline la scelta si perde senza bloccare il finale.
- L'URL è pubblico nel codice, quindi chiunque potrebbe inviare righe false. Lo script accetta solo `ceo` /
  `caraibi` e tronca i campi. Per l'analisi conviene filtrare per `version` e per `player`.
