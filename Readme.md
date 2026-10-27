booktrack/
├── config/
│   └── passport.js          # Configurazione Passport con strategia JWT
├── controllers/
│   ├── authController.js    # Registrazione, Login, Logout
│   ├── bookController.js    # Ricerca API Open Library e salvataggio
│   └── shelfController.js   # Gestione scaffali, avanzamento e recensioni
├── models/
│   ├── User.js              # Schema Utente
│   └── Book.js              # Schema Libro dell'utente (scaffale, recensione, ecc.)
├── routes/
│   ├── auth.js              # Rotte di autenticazione
│   ├── books.js             # Rotte di ricerca e integrazione
│   └── shelves.js           # Rotte di gestione contenuti personali
├── .env                     # Variabili d'ambiente (Porta, MongoDB URI, JWT Secret)
├── server.js                # Entry point dell'applicazione
└── package.json

# BookTrack

Piattaforma per tracciare le proprie letture. Stack: Node.js (>= 20), Express 4, MongoDB + Mongoose, Joi.

## Avvio

```bash
npm install
cp .env.example .env     # impostare MONGODB_URI
npm run dev
```

## Ripartizione del lavoro

| Parte | Responsabile | Stato |
|-------|--------------|-------|
| A. Gestione utenti (Passport.js + JWT) | Collega A | **da fare** (file con `TODO COLLEGA A`) |
| B. Integrazione Open Library | Collega B | **da fare** (file con `TODO COLLEGA B`) |
| C. Gestione contenuti personali | — | **completo** |

Per trovare i punti da completare: `grep -rn "TODO COLLEGA" src`

## Contratti tra le parti

**A → C.** Dopo `authenticate`, `req.user.id` deve contenere l'id dell'utente (stringa). Con Passport-JWT che
restituisce il documento Mongoose `User` funziona già. Il modello deve chiamarsi `User`.
Alla registrazione chiamare `ensureDefaultShelves(user.id)` (`src/services/shelf.service.js`).

**B → C.** Il salvataggio del libro è già implementato in C (`addBookToShelf` / `POST /api/user-books`).
B deve produrre lo "snapshot" del libro in questo formato:

```json
{
  "olKey": "/works/OL45883W",
  "title": "Titolo",
  "authors": ["Autore"],
  "firstPublishYear": 1999,
  "pageCount": 320,
  "subjects": ["Fantasy"],
  "coverUrl": "https://..."
}
```

`olKey` e `title` sono obbligatori. `pageCount` serve per la percentuale di avanzamento.

## API del punto C

Tutte le rotte richiedono `Authorization: Bearer <token>`. Risposte nel formato `{ data, meta? }`;
errori nel formato `{ error: { message, details? } }`.

### Scaffali — `/api/shelves`

| Metodo | Rotta | Descrizione |
|--------|-------|-------------|
| GET | `/` | Elenco scaffali con `booksCount` (crea quelli di default se mancano) |
| POST | `/` | Crea scaffale `{ name, description? }` |
| GET | `/:id?page&limit` | Scaffale con i suoi libri (paginato) |
| PATCH | `/:id` | Modifica nome/descrizione |
| DELETE | `/:id?moveTo=<shelfId>` | Elimina; se contiene libri serve `moveTo`, altrimenti 409 |

Gli scaffali di default ("Da leggere", "In lettura", "Letti") non si possono rinominare né eliminare (403).

### Libri personali — `/api/user-books`

| Metodo | Rotta | Body | Descrizione |
|--------|-------|------|-------------|
| POST | `/` | `{ shelfId, book }` | Salva un libro in uno scaffale |
| GET | `/?shelf&status&page&limit` | | Elenco filtrabile |
| GET | `/:id` | | Dettaglio |
| PATCH | `/:id/shelf` | `{ shelfId }` | Sposta in un altro scaffale |
| PATCH | `/:id/status` | `{ status }` | `to_read` \| `reading` \| `read` |
| PATCH | `/:id/progress` | `{ currentPage }` | Pagina corrente (solo se `reading`) |
| PUT | `/:id/review` | `{ rating?, review? }` | Valutazione 1–5 e/o recensione |
| DELETE | `/:id/review` | | Rimuove valutazione e recensione |
| DELETE | `/:id` | | Rimuove il libro dai salvati |

Ogni libro include `progressPercent`: 100 se `read`, 0 se `to_read`, `currentPage / pageCount` se `reading`
(`null` se il numero di pagine non è noto).

## Scelte di progetto (da confermare con il docente se serve)

- Spostare un libro in uno scaffale di default ne aggiorna lo stato; cambiare stato a un libro in uno
  scaffale di default lo sposta nello scaffale corrispondente. Negli scaffali personalizzati lo stato resta indipendente.
- Un libro può essere salvato una sola volta per utente (indice univoco su `olKey`).
- Un utente non può mai vedere o modificare i dati di un altro: le risorse altrui rispondono 404.
- Sicurezza: `helmet`, CORS configurabile, rate limit, body limit 100 KB, validazione Joi su params/query/body
  (i campi sconosciuti vengono scartati, quindi niente operatori `$` nelle query).
