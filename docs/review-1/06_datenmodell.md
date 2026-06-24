# 6. Datenmodell & Mermaid-ER-Diagramm

> ↩ [Index](README.md) · Regeln: [Beziehungsregeln](07_beziehungsregeln.md) · Container: [Projektübersicht](01_projektuebersicht.md#technische-zielarchitektur)

Konsistentes logisches Modell auf SQLite. Es deckt alle vom Masterprompt geforderten Entitäten ab und speichert historische Zeiträume **korrekt**, auch ohne historischen Graph-Zeitregler in V1.

## 6.1 Entitäten (Überblick)

| Entität | Zweck |
| --- | --- |
| AppUser | Der **eine** Eigentümer-Account (Auth, Theme). |
| Person | Personenstammdaten. |
| SocialAccount | 0..n Accounts je Person (einzige Quelle der Wahrheit). |
| Connection | **Ungeordnetes** Personenpaar (genau 2, eindeutig). |
| RelationshipCategory | Gruppierung von Beziehungstypen (z. B. Nähegrad, Kontext, Romantik). |
| RelationshipType | Konfigurierbarer Typ (Bekanntschaft, Freundschaft, …, Freundschaft Plus, Romantik, Ex-Partner/in, Cosplay, Business). |
| RelationshipExclusionRule | Welche Typen einander ausschließen/beenden. |
| ConnectionRelationshipPeriod | Historisierter Zeitraum eines Typs auf einer Connection. |
| ConnectionJournalEntry | Beziehungstagebuch-Eintrag. |
| RelationshipChangeLog | Audit der Statuswechsel. |
| EventType | Konfigurierbarer Ereignistyp (Urlaub, Party, Konzert, Convention, `Sex`, generisch …) + Sensitivität. |
| Event | Ereignis (fachlich unabhängig von Beziehungen). |
| EventParticipant | Teilnehmer (1..n) eines Events. |
| Location | Ort (Stadt/Region genügt, optionale Koordinaten + Präzision). |
| ImportBatch | Ein einmaliger Notion-Importlauf. |
| ExternalImportMap | Mapping externer Notion-IDs → interne IDs (Duplikatschutz). |
| AppSetting | Schlüssel/Wert-App-Einstellungen. |

## 6.2 Mermaid-ER-Diagramm

```mermaid
erDiagram
  AppUser ||--o{ AppSetting : configures
  AppUser ||--o{ Person : owns

  Person ||--o{ SocialAccount : has
  Person }o--o| Location : "located at (optional)"

  Person ||--o{ Connection : "participates A"
  Person ||--o{ Connection : "participates B"

  Connection ||--o{ ConnectionRelationshipPeriod : "has periods"
  Connection ||--o{ ConnectionJournalEntry : "has journal"
  Connection ||--o{ RelationshipChangeLog : "has changelog"

  RelationshipCategory ||--o{ RelationshipType : groups
  RelationshipType ||--o{ ConnectionRelationshipPeriod : typed_as
  RelationshipType ||--o{ RelationshipExclusionRule : "excludes (source)"
  RelationshipType ||--o{ RelationshipExclusionRule : "excluded (target)"

  EventType ||--o{ Event : typed_as
  Event ||--o{ EventParticipant : has
  Person ||--o{ EventParticipant : "joins"
  Event }o--o| Location : "occurs at (optional)"

  ImportBatch ||--o{ ExternalImportMap : produced
  ExternalImportMap }o--|| Person : "maps to (poly)"

  AppUser {
    int Id PK
    string DisplayName
    string PasswordHash
    string ThemePreference "System|Light|Dark"
    datetime CreatedAt
  }
  Person {
    int Id PK
    int OwnerId FK
    string Name "required"
    date DateOfBirth "nullable"
    string Gender "nullable: Maennlich|Weiblich|divers"
    string Notes "nullable"
    string ProfileImagePath "nullable (upload)"
    string ProfileImageUrl "nullable (https)"
    int LocationId FK "nullable"
    datetime CreatedAt
    datetime UpdatedAt
  }
  SocialAccount {
    int Id PK
    int PersonId FK
    string Platform
    string Handle
    string Url "nullable https"
    string Visibility "nullable"
    datetime CreatedAt
  }
  Location {
    int Id PK
    string DisplayName
    string City "nullable"
    string Region "nullable"
    string Country "nullable"
    float Latitude "nullable"
    float Longitude "nullable"
    string Precision "exact|city|region|country|unknown"
  }
  Connection {
    int Id PK
    int OwnerId FK
    int PersonLowId FK "min(personA,personB)"
    int PersonHighId FK "max(personA,personB)"
    datetime CreatedAt
    datetime UpdatedAt
  }
  RelationshipCategory {
    int Id PK
    string Name "Naehegrad|Kontext|Romantik|Status"
    int SortOrder
  }
  RelationshipType {
    int Id PK
    int CategoryId FK
    string Name
    int Rank "nullable, ordnet Naehegrad"
    bool IsContinuous "andauernd vs. punktuell"
    bool IsClosenessLevel "Naehegrad-Stufe"
    bool IsActive
  }
  RelationshipExclusionRule {
    int Id PK
    int SourceTypeId FK
    int TargetTypeId FK
    string Effect "blocks|ends"
  }
  ConnectionRelationshipPeriod {
    int Id PK
    int ConnectionId FK
    int RelationshipTypeId FK
    string ValidFromKind "day|month|year|season|approx|unknown"
    date ValidFrom "nullable"
    string ValidFromText "nullable z.B. Sommer 2022"
    string ValidToKind "nullable"
    date ValidTo "nullable (offen=aktiv)"
    string ValidToText "nullable"
    string Note "nullable"
  }
  ConnectionJournalEntry {
    int Id PK
    int ConnectionId FK
    string OccurredAtKind
    date OccurredAt "nullable"
    string OccurredAtText "nullable"
    string Title
    string Note "nullable"
    datetime CreatedAt
  }
  RelationshipChangeLog {
    int Id PK
    int ConnectionId FK
    string Action "start|end|upgrade|downgrade|set-follow-status"
    int RelationshipTypeId FK "nullable"
    datetime ChangedAt
    string Detail
  }
  EventType {
    int Id PK
    string Name "Urlaub|Party|Konzert|Convention|Sex|Generisch"
    string Sensitivity "normal|sensitive"
    bool IsActive
  }
  Event {
    int Id PK
    int OwnerId FK
    string Name
    int EventTypeId FK
    string OccurredAtKind
    date OccurredAt "nullable"
    string OccurredAtText "nullable"
    int LocationId FK "nullable"
    string Note "nullable"
    string AiNote "nullable, lokales Textfeld"
    datetime CreatedAt
  }
  EventParticipant {
    int Id PK
    int EventId FK
    int PersonId FK
    string Role "nullable"
  }
  ImportBatch {
    int Id PK
    datetime StartedAt
    datetime FinishedAt "nullable"
    string Status "preview|applied|failed"
    int CreatedCount
    int SkippedCount
    int ErrorCount
  }
  ExternalImportMap {
    int Id PK
    int ImportBatchId FK
    string ExternalSource "notion"
    string ExternalId
    string EntityType "person|connection|event|account"
    int InternalId
  }
  AppSetting {
    int Id PK
    int OwnerId FK
    string Key
    string Value
  }
```

## 6.3 Datenmodellregeln (Constraints)

- **C-MODEL-1:** `Connection` ist **ungeordnet** → kanonische Speicherung als `PersonLowId < PersonHighId`; **Unique(OwnerId, PersonLowId, PersonHighId)** verhindert doppelte Paare (DEC-004).
- **C-MODEL-2:** `PersonLowId ≠ PersonHighId` (keine Selbstkante).
- **C-MODEL-3:** Höchstens **ein** aktiver Nähegrad-Period (offen `ValidTo`) je Connection (DEC-006); App-Service + partieller Unique-Index.
- **C-MODEL-4:** Statuswechsel **schließt** alten Period (`ValidTo` setzen) und legt neuen an – nie UPDATE des Typs in place (DEC-005).
- **C-MODEL-5:** `Event` braucht **≥1** `EventParticipant`.
- **C-MODEL-6:** Alle Fachdaten tragen `OwnerId` des einzigen `AppUser` (Vorbereitung, kein Mehrmandanten-Feature).
- **C-MODEL-7:** Profilbild: `ProfileImagePath` **oder** `ProfileImageUrl` (URL nur HTTPS), beide optional.
- **C-MODEL-8:** Alter wird **berechnet** aus `DateOfBirth` (DEC-014) – keine Alters-Spalte.
- **C-MODEL-9:** Ungenaue Zeit überall als Paar `*Kind` + (`date` **oder** `*Text`); UI rendert gemäß `Kind`, täuscht keinen exakten Tag vor (DEC-013).
- **C-MODEL-10:** `ExternalImportMap` Unique(ExternalSource, ExternalId) → kein Doppelimport (FEAT-092).
- **C-MODEL-11:** Zeitstempel intern UTC; reine Kalendertage als reine Datumswerte ohne künstliche Uhrzeit.
- **C-MODEL-12:** Löschverhalten über FK + Domainregeln; vor dem Löschen Abhängigkeiten anzeigen (FEAT-013).

## 6.4 Vereinfachtes fachliches Modell (für Nicht-Techniker)

```mermaid
mindmap
  root((RelaTable))
    Personen
      Profil, Bild, Adresse
      Social Accounts
    Verbindung zweier Personen
      Nähegrad (eine Stufe)
      Freundschaft Plus
      Romantik / Ex-Partner
      Verlauf (mit Zeiträumen)
      Tagebuch
    Ereignisse
      Teilnehmer
      Typ (inkl. Sex)
      Ort & Datum (auch unscharf)
    Sichten
      Graph
      Timeline
      Karte
      Finder
```

## 6.5 Abgeleitete Timeline = Projektion

Die Timeline (global/Person/Pair) ist eine **Projektion** über `ConnectionRelationshipPeriod`, `RelationshipChangeLog`, `ConnectionJournalEntry` und `Event`(+Participants) – **keine** zusätzliche, duplizierte Datenquelle. Gemeinsame Events eines Paars werden über **gemeinsame Teilnehmer** ermittelt (DEC-010), nicht gespeichert.

## 6.6 Weitere geforderte Diagramme (Verweise)

- **Zustandsdiagramm Beziehungswechsel:** in [07_beziehungsregeln.md](07_beziehungsregeln.md#zustandsdiagramm).
- **System-/Containerdiagramm:** in [01_projektuebersicht.md](01_projektuebersicht.md#technische-zielarchitektur).
- **Notion-Import-Ablauf:**

```mermaid
flowchart LR
  A[Notion-Zugang erfassen] --> B[Lesen via Notion API]
  B --> C[Mapping + Duplikatprüfung<br/>ExternalImportMap]
  C --> D{Vorschau ok?}
  D -- nein --> X[Abbrechen, nichts geschrieben]
  D -- ja --> E[Transaktional schreiben<br/>ImportBatch=applied]
  E --> F[Importbericht:<br/>erstellt / übersprungen / Fehler]
```

- **JSON-Import (Erzählung → Datenbank):** In den Einstellungen lassen sich Personen, Verbindungen (mit historisiertem Verlauf) und Ereignisse aus einem JSON-Objekt einpflegen. Personen werden per `ref`/Name referenziert; „Vorschau" prüft transaktional und macht zurück (schreibt nichts), „Importieren" schreibt und protokolliert via `ImportBatch`. Schema + LLM-Prompt zum Erzeugen des JSON: [`docs/import/`](../import/json-schema.md).

```mermaid
flowchart LR
  A[Erzählung] --> B[LLM-Prompt stellt Rückfragen]
  B --> C[JSON erzeugt]
  C --> D[Einstellungen → JSON-Import]
  D --> E{Vorschau ok?}
  E -- nein --> A
  E -- ja --> F[Importieren → ImportBatch=applied]
```

> **Optionaler nächster Schritt:** Dieses Modell kann zusätzlich als interaktives **DataModelLM** (`.datamodel`) angelegt werden. Sag Bescheid, dann erzeuge ich es aus diesem ER-Stand.
