# RelaTable MCP-Server

## Übersicht

RelaTable stellt einen MCP-Server (Model Context Protocol) bereit, der es LLM-Clients (ChatGPT, Telegram-Bot, Claude Code/Deskop) ermöglicht, das Beziehungsnetzwerk zu lesen und zu schreiben. Der Server läuft **mit der App** als Streamable-HTTP-Endpunkt unter `/api/mcp`.

**Typischer Workflow (z. B. Sprach-zu-Text über Telegram):**

1. Nutzer schickt eine Nachricht über ein Treffen zwischen Louis und Conny
2. LLM ruft `search_persons` → löst "Louis"/"Conny" auf bestehende Personen auf
3. `get_person` → prüft Bestand, connectionIds, Historie → neu oder ergänzen?
4. `list_relationship_types` + `list_event_types` → valide Werte für Schreibvorgänge
5. LLM stellt Rückfragen an den Nutzer (Datum, wer noch dabei, Folge-Status bei Beendigung)
6. `start_relationship` / `update_person` / `update_event` / `apply_import` / `add_journal`
7. `end_romance` (nur nach User-Rückfrage zum Folge-Status — siehe Tool-Beschreibung)

---

## Abhängigkeiten

### Runtime

- **Node.js 18+**
- **RelaTable-App** (SvelteKit + Prisma + SQLite): muss laufen, der MCP-Server ist Teil der App
- **npm-Pakete** (bereits in `package.json`):
  - `@modelcontextprotocol/sdk` ^1.29.0 (offizieller TS-Server)
  - `zod` ^3.25 (Schema-Validierung; SDK nutzt `zod/v4` intern, bleibt abwärtskompatibel)
- **Kein separater Prozess** — der MCP-Server startet und endet mit der SvelteKit-App

### Env

| Variable | Beschreibung | Pflicht |
| --- | --- | --- |
| `RELATABLE_MCP_TOKEN` | Bearer-Token für `/api/mcp`. Fail-closed: leer → 503. Erzeugen mit `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. | ja |
| `DATABASE_URL` | SQLite-Pfad (siehe `.env`). | ja |

### Auth

- **Bearer-Token** via `Authorization: Bearer <token>` pro Request
- Fail-closed: Token nicht gesetzt → `503`, falsch/fehlend → `401`
- `timingSafeEqual` gegen Timing-Attacken
- Cookie-Session der App wird **nicht** verwendet — `/api/mcp` ist in `src/hooks.server.ts` von der Session-Auth ausgenommen

### Netzwerk

- HTTP/HTTPS; für Internet-Nutzung TLS-terminierenden Reverse Proxy (Caddy/Traefik/nginx) vor die App schalten
- Streamable HTTP, zustandslos (`sessionIdGenerator: undefined`, `enableJsonResponse: true`)
- Clients müssen `Authorization`-Header setzen

---

## Setup

```bash
# 1. Abhängigkeiten installieren (installiert auch MCP-SDK)
npm install

# 2. Token erzeugen und in .env eintragen
echo "RELATABLE_MCP_TOKEN=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" >> .env

# 3. DB anlegen
npm run db:push && npm run db:seed

# 4. App starten (startet MCP-Server mit)
npm run dev   # http://localhost:5173
```

---

## Schnelltest

```bash
TOKEN="<dein-token>"

# Tools listen
curl -s http://localhost:5173/api/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "content-type: application/json" \
  -H "accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Person suchen
curl -s http://localhost:5173/api/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "content-type: application/json" \
  -H "accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_persons","arguments":{"query":"Conny"}}}'
```

---

## Mit Claude Code verbinden

```bash
# Registrieren (einmalig)
claude mcp add --transport http relatable http://localhost:5173/api/mcp \
  -H "Authorization: Bearer <dein-token>"

# Prüfen
claude mcp list | grep relatable
# → relatable: http://localhost:5173/api/mcp (HTTP) - ✔ Connected

# Neue Session starten (MUSS neu gestartet werden, damit MCP-Tools geladen werden!)
claude
> suche nach Louis in meinem Netzwerk
> beende die Romantik zwischen Louis und Conny (frag mich nach dem Folge-Status)
```

Alternativ in `.mcp.json` (Projekt-Root):

```json
{
  "mcpServers": {
    "relatable": {
      "type": "http",
      "url": "http://localhost:5173/api/mcp",
      "headers": { "Authorization": "Bearer <dein-token>" }
    }
  }
}
```

---

## Dateien

| Datei | Zweck |
| --- | --- |
| `src/lib/server/mcp.ts` | Server, alle Tools, Bearer-Guard, Transport. Hauptdatei. |
| `src/routes/api/mcp/+server.ts` | SvelteKit-Route — dünner Handler, leitet Request an `handleMcpRequest` weiter. |
| `src/hooks.server.ts` | `/api/mcp` von Cookie-Session-Auth ausgenommen (Bearer statt Session). |
| `src/lib/server/mcp.test.ts` | Vitest: Tool-Registrierung, `tools/list` über echten Transport, Bearer-Guard (200/401/503). |
| `.env` / `.env.example` | `RELATABLE_MCP_TOKEN`. |

---

## Tools (14)

### READ

| Tool | Zweck |
| --- | --- |
| `search_persons` | Personen suchen (Name/Stadt/Notiz, case-insensitive). Leerer query → alle. |
| `get_person` | Person + Verbindungen (mit `connectionId`, Zeitraum-Historie) + Ereignisse. |
| `get_event` | Ereignis + Teilnehmer/Typ/Ort/Notiz. |
| `list_relationship_types` | Beziehungstypen (Kategorie, Rang, aktiv, Nähegrad). |
| `list_event_types` | Ereignistypen (Sensitivität, aktiv). |
| `get_import_schema` | Schema-Referenz `docs/import/json-schema.md`. |

### IMPORT (Create-Only)

| Tool | Zweck |
| --- | --- |
| `preview_import` | Import-JSON validieren (transaktional, kein Schreiben). Liefert Diff/Warnungen. |
| `apply_import` | Import-JSON endgültig anwenden. Personen/Verbindungen werden wiederverwendet, Zeiträume/Journal/Ereignisse neu angelegt. Legt `ImportBatch` an. |

### UPDATE

| Tool | Zweck |
| --- | --- |
| `update_person` | Person patchen (Geburtstag, Geschlecht, Stadt, Notiz, Bild-URL). Partial-Update. |
| `update_event` | Ereignis patchen (Name, Typ, Datum, Teilnehmer). Teilnehmerliste wird ersetzt. |

### RELATIONSHIPS (regelgeprüft via `relationshipService`)

| Tool | Zweck |
| --- | --- |
| `start_relationship` | Beziehungstyp starten/wechseln. Erzwingt V-1..V-6 (Nähegrad-Exklusivität, Romantik blockiert). |
| `end_relationship` | Aktiven Zeitraum beenden (nicht für Romantik — dafür `end_romance`). |
| `end_romance` | Romantik beenden mit Folge-Status (V-5, DEC-009). **Pflicht-Parameter** `followClosenessTypeName` + `activateEx` — das LLM muss den User vorher fragen. |
| `add_journal` | Tagebuch-Eintrag an Verbindung (Titel, Zeit, Notiz). |

---

## Tool-Parameter (Referenz)

### Personen-Referenz

Viele Tools nehmen `personA` / `personB` als Union aus `number` (id) oder `string` (exakter Name).

### Zeitangaben (unscharf, DEC-013)

Alle `from`/`to`/`at`-Parameter akzeptieren:

- String: `"2023-08-15"` (Tag), `"2023-08"` (Monat), `"2023"` (Jahr), `"Sommer 2022"` (Freitext)
- Objekt: `{ "kind": "day|month|year|season|approx|unknown", "date": "2023-08", "text": "Frühjahr 2021" }`

### Import-Payload

Siehe `get_import_schema`-Tool oder `docs/import/json-schema.md`. Struktur:

```json
{
  "version": 1,
  "persons": [{ "ref": "mara", "name": "Mara Vogt", "dateOfBirth": "1995-03-10", ... }],
  "connections": [{ "personA": "mara", "personB": "aylin", "periods": [...], "journal": [...] }],
  "events": [{ "name": "Festival", "type": "Konzert/Festival", "at": "2023-08", "participants": ["mara"] }]
}
```

---

## Architektur

```
Client (ChatGPT/Telegram/Claude)
  │
  │  POST /api/mcp  (JSON-RPC, Bearer-Token)
  ▼
SvelteKit (src/routes/api/mcp/+server.ts)
  │
  │  handleMcpRequest(request)
  ▼
checkBearer(request)  ── fail → 401/503
  │
  ▼
buildMcpServer() + WebStandardStreamableHTTPServerTransport
  │
  │  tools/call → jeweiliger Tool-Handler
  ▼
relationshipService / eventService / jsonImport / db (Prisma)
  │
  ▼
SQLite (data/relatable.db)
```

- **Zustandslos**: pro Request neuer Server + Transport, keine Session-Persistenz
- **JSON-Response** statt SSE-Streaming (keine Server-Notifications nötig)
- **Regeln** werden nicht im MCP-Code erfunden — alle Schreib-Tools rufen die已有 getesteten Services (`relationshipService`, `eventService`, `jsonImport`) auf, die V-1..V-8 erzwingen

---

## Tests

```bash
npm test     # 47 Tests, inkl. mcp.test.ts (7 Tests):
             #   - Tool-Registrierung (14 Tools)
             #   - tools/list über echten Streamable-HTTP-Transport
             #   - Bearer-Guard: 200/401/503
npm run check  # svelte-check, 0 Errors
```

---

## Sicherheitshinweise

- **Token**: lang halten (mindestens 32 Bytes hex), nicht in Git committen
- **HTTPS**: vor Internet-Exposition TLS-Reverse-Proxy davorlegen
- **Fail-closed**: ohne `RELATABLE_MCP_TOKEN` antwortet der Server mit 503
- **Kein CORS**: MCP-Clients senden direkt, kein Browser-CORS nötig
- **Löschen**: Es gibt keine `delete_*`-Tools (bewusst — destruktive Operationen über UI/Backup)
- **`endRomance` Folge-Status (V-5)**: das Tool erzwingt `followClosenessTypeName` + `activateEx`. Die Tool-Beschreibung weist das LLM an, den User vorher zu fragen — die Rückfrage passiert im Chat-Client, nicht im Server (portabel über ChatGPT/Telegram/Claude)

---

## Bekannte Einschränkungen

- **Kein Elicitation-Streaming**: `end_romance` nutzt Parameter-Pflicht statt MCP-Elicitation (Elicitation bräuchte SSE-Modus, nicht von allen Clients unterstützt). Die LLM-getriebene Rückfrage im Chat deckt den V-5-Dialog vollständig ab.
- **Keine Sessions**: jeder Request ist unabhängig. Für Chat-Historie ist der Client zuständig.
- **Owner = erster AppUser**: Single-Owner-App. Für Multi-Owner später `RELATABLE_OWNER_ID`-Env einführen.
- **Kein `endRomance` für nicht-romantische Beendigungs-Dialoge**: nur Romantik hat den V-5-Folge-Status. Andere Typen werden über `end_relationship` ohne Folge-Status beendet.
