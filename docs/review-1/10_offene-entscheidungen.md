# 10. Offene Entscheidungen & erkannte Lücken (Needs Decision)

> ↩ [Index](README.md) · Diese Liste enthält nur die **nach** dem Masterprompt noch offenen Punkte. Viele Entwurfs-Fragen (Nutzerkonzept, Datenquelle, Beziehungsmodell, Fokus-Tiefe, Karte-Layer, Gastzugriff, KI, Temperatur, Theme) sind durch den Prompt **bereits entschieden** → siehe [DEC-001…017](01_projektuebersicht.md#bestätigte-produktentscheidungen).

## Decision Log (entschieden)

DEC-001…DEC-017 sind in der [Projektübersicht](01_projektuebersicht.md#bestätigte-produktentscheidungen) dokumentiert. In **dieser Runde** zusätzlich entschieden (auch als Tracker-`decision`-Items NIM-78…NIM-86 angelegt):

| ID | Entscheidung | Tracker |
| --- | --- | --- |
| DEC-018 | Auth: Cookie-Session (HttpOnly/Secure) + **Argon2id**; 2FA später. | NIM-79 |
| DEC-019 | Stack: **SvelteKit + TypeScript, Prisma + SQLite, Cytoscape.js, Google Maps (Fallback Leaflet/OSM), Docker** (vom Eigentümer delegiert). | NIM-78 |
| DEC-020 | Deployment: Docker-Image **nur für VPS**; lokales Debugging **ohne** Docker (nativ, lokale SQLite-Datei); ENV-identisch. | NIM-80 |
| DEC-021 | Geschlecht: optionales Feld **Männlich / Weiblich / divers**. | NIM-84 |
| DEC-022 | Pair-Filter „nur exakt diese zwei" = Event mit genau diesen beiden Teilnehmern. | NIM-81 |
| DEC-023 | Kontexttypen (Cosplay/Business) **frei anlegbar** in den Einstellungen. | NIM-86 |
| DEC-024 | Notion-Import: **alles Wichtige** (Person/Relation/Event/Account), Bilder als URL. | NIM-82 |
| DEC-025 | Karte: **Google Maps** bevorzugt (kostenloser Tier, ⚠️ Key+Billing-Account nötig); Fallback **OSM/Leaflet** keyless. | NIM-85 |
| DEC-027 | **Globaler Filter „Sensible Inhalte"** (default **aus**); `Sex` ist sensibel → standardmäßig versteckt, per Toggle einblendbar. | NIM-88 |
| DEC-030 | Beziehungstemperatur **ersatzlos gestrichen** (Out of Scope). | NIM-83 |
| DEC-031 | Backup/Restore (EPIC-012, FEAT-110/111) **niedrige Priorität** – bleibt V1-Minimum, ans Ende Phase 7. | NIM-87 |
| DEC-032 | Passwort-Policy: **≥ 16 Zeichen, Groß- &amp; Kleinbuchstaben, ≥ 1 Zahl, ≥ 1 Sonderzeichen**; live geprüft. | NIM-89 |
| DEC-033 | Graph-Nodes zeigen **Profilbilder** (kreisförmig), Fallback Initiale/Platzhalter; Default-Layout **Force-directed**. | NIM-90 |
| DEC-034 | **Animierter Fokuswechsel** im Graph (Nodes gleiten/ein-/ausblenden, „Obsidian-Style"). | NIM-91 |

Aus Review-3-Kommentaren zusätzlich festgelegt (UI-Detailentscheidungen, in den Mockups dokumentiert): „Angemeldet bleiben" = ja (ergänzt DEC-018) · Personenliste-Sortierung mit Auf-/Absteigend · Geschlecht als Dropdown · Profil-Beziehungen „engste zuerst" · kein Archivieren in V1 · Rail per Pin dauerhaft ausklappbar · mobiler Tap = Node-Panel · **Personenliste zeigt Ort + Anzahl Verbindungen statt eines (paarbezogenen) Beziehungstyps; Typ nur als Filter**.

Verworfene Varianten werden hier **markiert, nicht gelöscht** (z. B. Blazor/ASP.NET-Stack → ersetzt durch DEC-019; reines Leaflet → durch DEC-025 zu Google-bevorzugt).

## Needs Decision (offen)

| ID | Frage | Empfehlung | Blockiert | Tracker |
| --- | --- | --- | --- | --- |
| DEC-026 | **Backup-Granularität**: nur DB oder DB + Upload-Verzeichnis als ein Paket? | ein konsistentes Paket (DB + Uploads) | EPIC-012 | — |
| DEC-028 | **Kanonische Sortierung** der Personen in Connection: nach `Id` (stabil) ausreichend? | ja, `PersonLowId < PersonHighId` per Id | Phase 3 | — |

## Erkannte Lücken / Unklarheiten

- **L-1:** Akzeptanzkriterien je Feature sind in der Landkarte noch komprimiert – Voll-ACs (Given/When/Then) folgen in **Review 2**.
- **L-2:** Vollständige `SCR-xxx`-Liste und Callout-Annotationen entstehen erst in der **Mockup-Runde**.
- **L-3:** Testmatrix (Unit/API/E2E/A11y/Security/Backup) mit AC-Verknüpfung ist für **Review 2** vorgesehen (Prompt §10).
- **L-4:** UX-Varianten (2–3 je Designentscheidung, Prompt §8) sind noch nicht ausgearbeitet → Review 2.
- **L-5:** Konkrete Performance-Messmethode für „<200 ms Fokuswechsel" muss definiert werden (Tooling/Datenmenge).
- **L-6:** Verhalten bei Personen-Löschung, die Teil aktiver Romantik/Perioden ist (kaskadieren vs. blockieren) – mit DEC-022/Regeln abstimmen.

## Status der Prüfpunkte

**Freigegeben/entschieden:** Auth (DEC-018), Tech-Stack (DEC-019), Deployment (DEC-020), Geschlecht (DEC-021), Beziehungsregeln ([07](07_beziehungsregeln.md)), Datenmodell ([06](06_datenmodell.md)), Pair-Filter (DEC-022), Kontexttypen (DEC-023), Notion-Umfang (DEC-024), Karten-Provider (DEC-025), Temperatur gestrichen (DEC-030).

**Verbleibend offen (interne Vorschläge, keine Blocker):** DEC-026 (Backup-Granularität), DEC-027 (`Sex`-Sichtbarkeit), DEC-028 (kanonische Sortierung) – ich plane mit den Empfehlungen, sag Bescheid bei Abweichung.

> Nach deinen Kommentaren aktualisiere ich Features, Flows, Datenmodell und Pläne konsistent und führe wesentliche Entscheidungen hier im Decision Log fort.
