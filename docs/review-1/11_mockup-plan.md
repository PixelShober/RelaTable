# 11. Plan der Mockup-Runde

> ↩ [Index](README.md) · Voraussetzung: Freigabe der [8 Prüfpunkte](10_offene-entscheidungen.md#wichtigste-prüfpunkte-vor-den-mockups)

## Ansatz

**Low- bis Mid-Fidelity**, kein finales Branding. Ziel: Struktur, Bedienung und Fachlogik kommentierbar machen. Umsetzung als MockupLM-Dateien (`.mockup.html`) mit konsistenter Shell, synthetischen Namen, neutralen Avataren, nummerierten Callouts und je Screen einer Annotationsliste (Zweck / primäre Aktion / sekundäre Aktionen / Zustände / offene Designentscheidung).

Jeder Screen wird mit Features ([03](03_feature-landkarte.md)) und Flows ([Sitemap](05_sitemap.md)) verlinkt. Pflicht-Zustände je relevantem Screen: leer · Laden · Fehler · Validierung · Bestätigung · lange Inhalte. **Kein** historischer Graph-Zeitregler (nicht V1). Timeline **ist** in V1.

## Reihenfolge (entspricht Review 3)

| # | Block | Screens (SCR) | Breakpoints |
|---|---|---|---|
| 1 | Navigation & Shell | SCR-001 First-Run, SCR-002 Login, SCR-003 Nav Desktop, SCR-004 Nav Smartphone | 1440 / 390 |
| 2 | Personen | Liste (+leer), anlegen/bearbeiten, Profilbild Upload, Profilbild URL (Vorschau+Fehler), Profil, Social Accounts, Löschdialog | 1440 / 390 |
| 3 | Hauptgraph | Hauptgraph, Profilpanel (Klick), Legende, Leer-/Ladezustand, mobile Graphansicht, Long-Press-Menü | 1440 / 1024 / 390 |
| 4 | Pair-Details | Desktop-Detailseite/Panel, mobile Seite/Bottom-Sheet, Historie+Zeiträume, Tagebuch, gemeinsame Timeline/Events, Filter | 1440 / 390 |
| 5 | Beziehungsdialoge | Connection erstellen, Nähegrad wählen/ändern, Freundschaft Plus, Romantik beginnen (Vorschau endender Status), beenden+Folgestatus, Ex-Partner, ungenaue Zeit, Konflikt/Validierung | 1440 / 390 |
| 6 | Ereignisse & Timeline | Ereignisliste, Ereignis anlegen, Teilnehmerauswahl, Ortseingabe, globale/Personen-/Pair-Timeline, ungenaue Daten (`Sommer 2022`) | 1440 / 390 |
| 7 | Karte | Standard (Personen+Events), Filterpanel, nur Personen, nur Events, Cluster, Marker-Detail, fehlende Standorte, mobil | 1440 / 1024 / 390 |
| 8 | Finder | Auswahl zweier Personen, Ergebnis, kein Ergebnis, Wechsel Profil/Fokus | 1440 / 390 |
| 9 | Import & Einstellungen | Notion-Import (Zugang/Vorschau/Mapping/Konflikte/Bericht), Beziehungstypen+Ausschlussregeln, Ereignistypen, Theme, Backup/Restore | 1440 / 390 |

Kritische Screens zusätzlich auf **Tablet 1024 px** (v. a. Graph & Karte).

## Vor der Mockup-Runde noch zu liefern (Review 2 – Kernabläufe)

1. Beziehungsregeln final (nach Kommentaren zu [07](07_beziehungsregeln.md)).
2. Zentrale **User Flows** FLOW-01…FLOW-27 als Diagramm + nummerierte Schritte (inkl. Abbrechen, Validierungsfehler, leere Zustände, Regelkonflikte, Bestätigung).
3. Volle **Akzeptanzkriterien** (Given/When/Then) je Must-Feature.
4. **UX-Varianten** (2–3 je Entscheidung, Prompt §8) mit Empfehlung.
5. **Testmatrix** mit AC-Verknüpfung (Prompt §10).

## Danach

- **Review 3:** Low-Fi-Mockups in obiger Reihenfolge.
- **Review 4:** Responsive & Fehlerzustände (Smartphone/Tablet, leere/Fehler/Validierung, A11y).
- **Review 5:** Finalisierung → Übergabepaket für Claude Code / Codex CLI.

> Start der Mockups erst nach Freigabe der [Prüfpunkte](10_offene-entscheidungen.md#wichtigste-prüfpunkte-vor-den-mockups).
