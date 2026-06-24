# 9. Risiko-Register

> ↩ [Index](README.md) · W = Wahrscheinlichkeit, A = Auswirkung (je niedrig/mittel/hoch)

| ID | Risiko | W | A | Gegenmaßnahme | Bezug |
|---|---|---|---|---|---|
| RISK-001 | Konkrete Auth-Ausprägung offen → unsicheres Passwortkonzept | M | H | Standard-Auth mit aktuellem Hashing; Session/Token mit Ablauf+Widerruf; früh in Phase 1 entscheiden | AUTH-001, [DEC offen](10_offene-entscheidungen.md) |
| RISK-002 | Beziehungshistorie wird beim Statuswechsel überschrieben | M | H | Periodenmodell + ChangeLog; nie in-place-UPDATE; Domain-Service + Unit-Tests | C-MODEL-3/4, [Regeln](07_beziehungsregeln.md) |
| RISK-003 | Doppeltes Personenpaar entsteht (ungeordnet) | M | M | Kanonische Low/High-Speicherung + Unique-Index | C-MODEL-1 |
| RISK-004 | Löschen erzeugt verwaiste Referenzen | M | M | FK + Abhängigkeitswarnung + Bestätigung | FEAT-013 |
| RISK-005 | Sensible Ereignistypen versehentlich sichtbar | M | H | Sensitivität am EventType; Maskierung im UI; kein Gastzugriff in V1 | FEAT-043, NFR-001 |
| RISK-006 | Externe Profilbild-URL → SSRF / unsichere Inhalte | M | H | Nur HTTPS, Whitelist-Schema, Größen-/Typprüfung, kein serverseitiger Fetch sensibler interner Ziele | FEAT-015 |
| RISK-007 | Ungenaue Zeit wird als exakter Tag fehldargestellt | M | M | `*Kind`+`*Text`-Modell; UI rendert nach Kind; Tests | DEC-013, C-MODEL-9 |
| RISK-008 | Graph-/Finder-Performance bricht bei vielen Nodes ein | M | M | Zielwert 500 Nodes; Clustering/serverseitige Filter; Performance-Tests | GRF-005 |
| RISK-009 | Aktionen nur über verdeckte Gesten (Klick/Doppelklick/Long-Press) | H | M | Jede Geste hat **sichtbare** Alternative (Menü/Button) | C-011, FEAT-055 |
| RISK-010 | Stack nicht bestätigt (Blazor/Cytoscape?) | M | M | Repo-Prüfung (Paket A); Entscheidung dokumentieren bevor UI-Bau | Frage 15 |
| RISK-011 | Pair-Filter „nur exakt diese zwei Teilnehmer" semantisch unklar | M | M | Definition festlegen (Event hat genau 2 Participants = diese zwei); in Review 2 bestätigen | FEAT-064 |
| RISK-012 | Standortdaten zu präzise / Datenschutz | M | H | Default Stadt/Region; Präzisionsfeld; keine exakte Adresse erzwingen | MAP-004 |
| RISK-013 | Geocoding/Tile-Provider-Abhängigkeit (Kosten/Datenschutz) | M | M | Provider früh wählen; lokale/datenschutzfreundliche Option prüfen | MAP-001 |
| RISK-014 | Notion-Import erzeugt Duplikate bei Wiederholung | M | M | ExternalImportMap Unique; Vorschau vor Schreiben | FEAT-092, C-MODEL-10 |
| RISK-015 | Änderung an konfigurierbaren Typen bricht bestehende Historie/Regeln | M | M | Typen deaktivieren statt löschen; Migrationspfad; Validierung gegen genutzte Perioden | FEAT-100 |
| RISK-016 | Backup vorhanden, Restore nie getestet | M | H | Restore-Verfahren dokumentieren **und** automatisiert testen | FEAT-111, NFR-003 |
| RISK-017 | Scope-Verlust durch nachträgliche Temperatur-Wünsche | L | M | Temperatur ist Out of Scope; Wiederaufnahme nur über Decision Log | [Scope](04_scope-matrix.md) |

## Top-Risiken (zuerst adressieren)

1. **RISK-002** Historie-Integrität (Kernfachlichkeit).
2. **RISK-001** Auth-Konzept (Sicherheit, blockiert Phase 1).
3. **RISK-006 / RISK-005 / RISK-012** Datenschutz (Bilder, sensible Typen, Standort).
4. **RISK-016** Restore-Testbarkeit (Datenverlust).
