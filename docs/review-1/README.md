# RelaTable – Review 1: Struktur

> Erzeugt aus `NIMBALYST_PROMPT_RELATABLE.md` auf Basis von `RELATABLE_REQUIREMENTS_DRAFT.md`.
> Status: **Entwurf zur Kommentierung** · Stand: 18.06.2026

Dies ist das Strukturpaket (Review 1). Es liefert das überprüfbare Projektmodell **vor** der Mockup-Runde. Noch **kein** produktiver Code, nur synthetische Beispieldaten.

## Verbindlicher Vorrang

Wo der **Masterprompt** (`NIMBALYST_PROMPT_RELATABLE.md`, „Verbindlicher Produktkontext") und der **Anforderungsentwurf** (`RELATABLE_REQUIREMENTS_DRAFT.md`) sich unterscheiden, **gilt der Masterprompt**. Der Prompt entscheidet u. a. mehrere im Entwurf offene Fragen. Wichtigste Überschreibungen:

| Thema | Entwurf (v0.9) | Verbindlich (Masterprompt) |
| --- | --- | --- |
| Beziehungstemperatur | Phase 2, „bestätigte Idee" | **Gestrichen / Out of Scope** |
| Notion-Import | spätere Phase | **In V1** (einmaliger Initialimport, kein laufender Sync) |
| Datenbank | „relational" offen | **SQLite**, ein App-Container + persistentes Volume |
| Nutzerkonzept | offen (AUTH-002) | **Ein globaler Eigentümer**, keine Mehrmandantenfähigkeit |
| Gastzugriff | offen (AUTH-003) | **Kein Gastzugriff in V1** |
| Beziehungsmodell | generischer Typ + Historie | **Nähegrad-Stufen + Freundschaft Plus + Romantik + Ex-Partner/in** (siehe Regeln) |
| Profilbild | offen (Frage 17) | **Lokaler Upload UND externe HTTPS-URL** |
| Fokus-Graph-Tiefe | offen (Frage 7) | **Nur direkte Kontakte** |
| Historischer Graph-Zeitregler | – | **Nicht in V1** (Modell speichert Zeiträume trotzdem korrekt) |

## Artefakte

| # | Artefakt | Datei |
| --- | --- | --- |
| 1 | Projektübersicht | [01_projektuebersicht.md](01_projektuebersicht.md) |
| 2 | Epic-Struktur | [02_epics.md](02_epics.md) |
| 3 | Feature-Landkarte | [03_feature-landkarte.md](03_feature-landkarte.md) |
| 4 | V1-/Später-/Out-of-Scope-Matrix | [04_scope-matrix.md](04_scope-matrix.md) |
| 5 | Sitemap & Informationsarchitektur | [05_sitemap.md](05_sitemap.md) |
| 6 | Datenmodell & Mermaid-ER-Diagramm | [06_datenmodell.md](06_datenmodell.md) |
| 7 | Beziehungsregeln & Zustandsdiagramm | [07_beziehungsregeln.md](07_beziehungsregeln.md) |
| 8 | Dependency Map & kritischer Pfad | [08_dependency-map.md](08_dependency-map.md) |
| 9 | Risiko-Register | [09_risiko-register.md](09_risiko-register.md) |
| 10 | Offene Entscheidungen (Needs Decision) | [10_offene-entscheidungen.md](10_offene-entscheidungen.md) |
| 11 | Plan der Mockup-Runde | [11_mockup-plan.md](11_mockup-plan.md) |

## ID-Schema

`EPIC-xxx` · `FEAT-xxx` · `US-xxx` · `AC-xxx` · `SCR-xxx` · `FLOW-xxx` · `DEC-xxx` · `RISK-xxx`

Anforderungs-IDs aus dem Entwurf (`PER-001`, `REL-002`, …) bleiben als Quellverweis erhalten.

## Nächster Schritt

Alle Struktur-Prüfpunkte sind freigegeben. ➡️ **[Review 2 – Kernabläufe](../review-2/README.md)** ist erstellt (User Flows, Akzeptanzkriterien, UX-Varianten, Testmatrix). Danach folgt die Mockup-Runde (siehe [11_mockup-plan.md](11_mockup-plan.md)).

### Prüfe vor den Mockups

Stand der Freigaben und verbleibende offene Punkte: [10_offene-entscheidungen.md](10_offene-entscheidungen.md#status-der-prüfpunkte). Backlog jetzt auch im **Nimbalyst-Tracker** (Typen `epic`/`feature`/`decision`, Refs NIM-1…NIM-86).
