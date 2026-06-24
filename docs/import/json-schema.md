# JSON-Import — Schema-Referenz

Import-Format für RelaTable (Einstellungen → **JSON-Import**). Personen, Verbindungen
(mit historischem Verlauf) und Ereignisse werden in **einem** JSON-Objekt beschrieben.

- **Vorschau** prüft + zählt alles in einer Transaktion und macht sie rückgängig — es wird **nichts** geschrieben.
- **Importieren** schreibt die Daten und legt einen `ImportBatch` (Audit) an.
- Personen werden über einen **`ref`-Schlüssel** oder ihren **exakten Namen** referenziert, damit
  Verbindungen/Ereignisse auf im selben Import angelegte Personen zeigen können.
- Eine Person mit identischem Namen (beim selben Eigentümer) wird **wiederverwendet**, nicht doppelt angelegt.
- Unbekannte Beziehungs-/Ereignistypen, fehlende Personen usw. werden **übersprungen** und als
  Warnung gemeldet — der Rest wird trotzdem importiert.
- **Re-Import:** Personen und Verbindungen werden anhand von Name/Paar erkannt und wiederverwendet.
  Beziehungs-Zeiträume, Tagebuch-Einträge und Ereignisse werden hingegen **erneut** angelegt — denselben
  Import also nicht doppelt „Importieren". Die Vorschau zeigt vorab, was geschrieben würde.

## Grundgerüst

```json
{
  "version": 1,
  "persons": [ … ],
  "connections": [ … ],
  "events": [ … ]
}
```

Alle drei Listen sind optional.

## Zeitangaben (`from`, `to`, `at`)

Zeiten dürfen **unscharf** sein (DEC-013). Zwei Schreibweisen sind erlaubt:

**Kurzform (String):**

| Wert            | Bedeutung            |
| --------------- | -------------------- |
| `"2023-08-15"`  | exakter Tag          |
| `"2023-08"`     | Monat                |
| `"2023"`        | Jahr                 |
| `"Sommer 2022"` | ungefähr (Freitext)  |

**Objektform (volle Kontrolle):**

```json
{ "kind": "season", "text": "Frühjahr 2021" }
{ "kind": "month",  "date": "2022-06" }
```

`kind` ∈ `day | month | year | season | approx | unknown`.
Bei `day`/`month`/`year` wird `date` genutzt, bei `season`/`approx`/`unknown` der `text`.
Eine **fehlende** `to`-Angabe bedeutet: Zeitraum ist **offen / noch aktiv**.

## `persons[]`

| Feld              | Pflicht | Hinweis                                                        |
| ----------------- | ------- | -------------------------------------------------------------- |
| `ref`             | nein    | Stabiler Schlüssel zum Referenzieren (z. B. `"mara"`).         |
| `name`            | **ja**  | Anzeigename.                                                   |
| `dateOfBirth`     | nein    | `yyyy-mm-dd`. Alter wird berechnet, nicht gespeichert.         |
| `gender`          | nein    | `Männlich` \| `Weiblich` \| `divers` (Synonyme werden gemappt).|
| `city`            | nein    | Ort; Location wird angelegt/wiederverwendet.                   |
| `notes`           | nein    | Freitext.                                                      |
| `profileImageUrl` | nein    | Nur **HTTPS**, sonst ignoriert.                                |
| `socialAccounts`  | nein    | Liste, siehe unten.                                            |

`socialAccounts[]`: `{ "platform": "Instagram", "handle": "@mara.v", "url": "https://…", "visibility": "öffentlich" }`
(`platform` + `handle` Pflicht; `url` nur HTTPS).

## `connections[]`

Eine Verbindung ist ein **ungeordnetes Paar** genau zweier Personen.

| Feld       | Pflicht | Hinweis                                              |
| ---------- | ------- | ---------------------------------------------------- |
| `personA`  | **ja**  | `ref` oder Name.                                     |
| `personB`  | **ja**  | `ref` oder Name (≠ personA).                         |
| `periods`  | nein    | Beziehungs-Zeiträume (Verlauf), siehe unten.         |
| `journal`  | nein    | Tagebuch-Einträge.                                   |

`periods[]`:

| Feld    | Pflicht | Hinweis                                                              |
| ------- | ------- | ------------------------------------------------------------------- |
| `type`  | **ja**  | Name eines Beziehungstyps (s. u.).                                  |
| `from`  | nein    | Beginn (Zeitangabe).                                                |
| `to`    | nein    | Ende; **weglassen = noch aktiv**.                                   |
| `note`  | nein    | Freitext.                                                           |

Mehrere `periods` bilden den Verlauf ab (z. B. Bekanntschaft → Freundschaft → Enge Freundschaft).

`journal[]`: `{ "title": "Tiefes Gespräch", "note": "…", "at": "2023-03" }` (`title` Pflicht).

## `events[]`

| Feld           | Pflicht | Hinweis                                            |
| -------------- | ------- | -------------------------------------------------- |
| `name`         | **ja**  | Bezeichnung.                                       |
| `type`         | **ja**  | Name eines Ereignistyps (s. u.).                   |
| `at`           | nein    | Zeitangabe.                                        |
| `city`         | nein    | Ort.                                               |
| `participants` | **ja**  | **≥ 1** Person(en) als `ref`/Name.                 |
| `note`         | nein    | Freitext.                                          |

## Erlaubte Typnamen (Standard-Seed)

**Beziehungstypen:** `Bekanntschaft`, `Freundschaft`, `Enge Freundschaft`,
`Freundschaft Plus`, `Romantik`, `Ex-Partner/in`, `Cosplay`, `Business`.

**Ereignistypen:** `Urlaub`, `Party`, `Konzert/Festival`, `Convention`, `Generisch`, `Sex`.

Eigene Typen lassen sich vorab in den Einstellungen anlegen; Namen müssen exakt
(Groß-/Kleinschreibung egal) übereinstimmen.

Ein vollständiges Beispiel: [`beispiel.json`](beispiel.json).
