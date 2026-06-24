# 2. Epic-Struktur

> ↩ [Index](README.md) · siehe [Feature-Landkarte](03_feature-landkarte.md) · [Scope-Matrix](04_scope-matrix.md) · [Dependency Map](08_dependency-map.md)

14 Epics. Jedes Epic nennt Ziel/Nutzen, Scope, Out of Scope, enthaltene Features (→ [Landkarte](03_feature-landkarte.md)), Abhängigkeiten, Risiken, messbare Erfolgskriterien, Screens/Flows und die vorgesehene Phase (→ [Dependency Map](08_dependency-map.md)).

---

## EPIC-001 — Technische Basis, Setup & Authentifizierung
- **Ziel/Nutzen:** Sicherer Einzelbenutzerbetrieb; ohne Anmeldung keine Daten. First-Run richtet den einzigen Account ein.
- **Scope:** First-Run-Setup, Login/Logout, Session-/Token-Logik, Secret-Konfiguration, App-Container + SQLite, Health-Check.
- **Out of Scope:** Mehrbenutzer, Gastzugriff, SSO.
- **Features:** FEAT-001, FEAT-002, FEAT-003, FEAT-004 *(Enabler)*.
- **Abhängigkeiten:** keine (Fundament).
- **Risiken:** [RISK-001](09_risiko-register.md) (Auth-Ausprägung offen), [RISK-010](09_risiko-register.md) (Stack offen).
- **Erfolgskriterien:** Unauthentifizierter Zugriff auf jede API/Seite wird abgewiesen; Setup nur einmal möglich; Daten überleben Container-Neustart.
- **Screens/Flows:** SCR-001, SCR-002, SCR-003, SCR-004 · FLOW-01, FLOW-02.
- **Phase:** 0–1.

## EPIC-002 — Personen & Social Accounts
- **Ziel/Nutzen:** Stammdaten aller Personen inkl. mehrerer Social Accounts, Profilbild, optionaler Adresse.
- **Scope:** Personenliste (Suche/Filter), Profil, CRUD, Profilbild (Upload + URL), Social Accounts, Löschdialog mit Abhängigkeitswarnung, berechnetes Alter.
- **Out of Scope:** unstrukturierte Direkt-URL an Person (nur strukturierte Accounts), Account geteilt über mehrere Personen.
- **Features:** FEAT-010…FEAT-016.
- **Abhängigkeiten:** EPIC-001.
- **Risiken:** [RISK-006](09_risiko-register.md) (externe Bild-URL/SSRF), [RISK-004](09_risiko-register.md) (Löschintegrität).
- **Erfolgskriterien:** Person mit Pflichtfeld Name anlegbar; Suche/Filter serverseitig; Alter nie redundant gespeichert; Löschen warnt vor Abhängigkeiten.
- **Screens/Flows:** Personen-Screens (siehe [Mockup-Plan](11_mockup-plan.md)) · FLOW-03…FLOW-06.
- **Phase:** 1–2.

## EPIC-003 — Connections & Beziehungstypen
- **Ziel/Nutzen:** Beziehung als ungeordnetes Personenpaar mit konfigurierbaren, regelgebundenen Typen.
- **Scope:** Connection erstellen (kein Duplikat, keine Selbstkante), Nähegrad setzen/ändern, Freundschaft Plus, Romantik starten/beenden, Ex-Partner/in, parallele Kontexte (Cosplay/Business).
- **Out of Scope:** mehr als zwei Personen pro Connection, Beziehungstemperatur.
- **Features:** FEAT-020…FEAT-026.
- **Abhängigkeiten:** EPIC-002, [Beziehungsregeln](07_beziehungsregeln.md).
- **Risiken:** [RISK-002](09_risiko-register.md) (Regelkonsistenz/Überlappung), [RISK-003](09_risiko-register.md) (Duplikat-Paar).
- **Erfolgskriterien:** Exklusive Nähegrade durchgesetzt; Romantik beendet Nähegrad+FreundschaftPlus; Folgestatus-Dialog erscheint; doppeltes Paar unmöglich.
- **Screens/Flows:** Beziehungsdialoge · FLOW-07…FLOW-12.
- **Phase:** 3.

## EPIC-004 — Beziehungsverlauf & Beziehungstagebuch
- **Ziel/Nutzen:** Lückenlose, nicht überschreibbare Historie pro Connection plus datierte Tagebucheinträge.
- **Scope:** ConnectionRelationshipPeriod (Zeiträume), RelationshipChangeLog (Audit), ConnectionJournalEntry (Tagebuch), chronologische Anzeige, ungenaue Zeiten.
- **Out of Scope:** Temperatur/Gewichtung.
- **Features:** FEAT-030…FEAT-033.
- **Abhängigkeiten:** EPIC-003.
- **Risiken:** [RISK-002](09_risiko-register.md) (Historie überschreiben).
- **Erfolgskriterien:** Statuswechsel beendet alten Zeitraum & startet neuen ohne Datenverlust; Tagebuchedit verändert keine anderen Datensätze.
- **Screens/Flows:** Pair-Details (Historie/Tagebuch) · FLOW-08, FLOW-09, FLOW-13.
- **Phase:** 3–4.

## EPIC-005 — Ereignisse & Timeline
- **Ziel/Nutzen:** Gemeinsame Erlebnisse erfassen und chronologisch – global, pro Person, pro Paar – darstellen.
- **Scope:** Event-CRUD (≥1 Teilnehmer), Ereignistypen inkl. `Sex`, Ort optional, Sensitivität, globale/Personen-/Pair-Timeline, Filter, Darstellung ungenauer Daten.
- **Out of Scope:** automatische Statusänderung durch Events; Eventzuordnung direkt an Connection (Ableitung über Teilnehmer).
- **Features:** FEAT-040…FEAT-046.
- **Abhängigkeiten:** EPIC-002 (Teilnehmer), EPIC-011 (Ereignistypen).
- **Risiken:** [RISK-005](09_risiko-register.md) (sensible Typen sichtbar), [RISK-007](09_risiko-register.md) (ungenaue Daten als exakt fehldargestellt).
- **Erfolgskriterien:** Event mit ≥1 Teilnehmer; erscheint in allen Teilnehmerprofilen; `Sex` ändert Status nicht; Timeline zeigt `Sommer 2022` korrekt als unscharf.
- **Screens/Flows:** Ereignis-/Timeline-Screens · FLOW-10, FLOW-14…FLOW-16, FLOW-22.
- **Phase:** 4.

## EPIC-006 — Hauptgraph & fokussierter Graph
- **Ziel/Nutzen:** Netzwerk als Graph erkunden; einzelne Person fokussiert betrachten.
- **Scope:** Hauptgraph (Zoom/Pan/Auswahl, Legende), aktueller Typ an Kante, fokussierter Graph (nur direkte Kontakte), Fokuswechsel ohne Seitenneustart, Profilpanel bei einfachem Klick, Doppelklick = Fokus, mobiler Long-Press, sichtbare Alternativaktionen, Leer-/Ladezustand.
- **Out of Scope:** historischer Zeitregler, Kontakte 2. Grades, mehrfarbig segmentierte Dauerkante.
- **Features:** FEAT-050…FEAT-056.
- **Abhängigkeiten:** EPIC-003/004 (Kantendaten), Graph-API ([API-002](../input/RELATABLE_REQUIREMENTS_DRAFT.md)).
- **Risiken:** [RISK-008](09_risiko-register.md) (Graph-Performance), [RISK-009](09_risiko-register.md) (verdeckte Interaktionen).
- **Erfolgskriterien:** 500 Nodes interaktiv; Fokuswechsel <200 ms nach Initialload; jede Aktion auch ohne Gesten-Geheimwissen erreichbar; Tastaturbedienbar.
- **Screens/Flows:** Graph-Screens · FLOW-17…FLOW-21, FLOW-23.
- **Phase:** 5.

## EPIC-007 — Pair-Detailansicht (über Graphkante)
- **Ziel/Nutzen:** Vollständige Sicht auf ein Personenpaar – besonders wichtig.
- **Scope:** Klick auf Kante → Detailseite (Desktop) / Seite bzw. Bottom-Sheet (Mobil); aktuelle & historische Typen + Zeiträume, Statuswechsel, Tagebuch, gemeinsame Timeline & Events, Filter (Zeitraum/Eventtyp/Beziehungstyp/alle gemeinsamen vs. nur exakt diese zwei), Aktionen (Typ starten/beenden, Nähegrad ändern, Beziehung beginnen/beenden, Tagebuch, Event hinzufügen).
- **Out of Scope:** Temperatur-Anzeige.
- **Features:** FEAT-060…FEAT-064.
- **Abhängigkeiten:** EPIC-003, EPIC-004, EPIC-005, EPIC-006.
- **Risiken:** [RISK-002](09_risiko-register.md), [RISK-011](09_risiko-register.md) (Filter „nur diese zwei" semantisch unklar).
- **Erfolgskriterien:** Kantenklick öffnet Pair-Details; Filter „nur Events mit exakt diesen beiden Teilnehmern" liefert korrekte Teilmenge; alle Beziehungsaktionen aus dieser Ansicht ausführbar.
- **Screens/Flows:** Pair-Detail-Screens · FLOW-21, FLOW-22.
- **Phase:** 5–6.

## EPIC-008 — Kartenansicht
- **Ziel/Nutzen:** Geografische Verteilung von Personen und Ereignissen erkunden.
- **Scope:** Karte (Zoom/Pan), getrennte Layer Personen/Ereignisse, Clustering, Marker-Detail, Filterpanel, Umgang mit fehlenden Standorten, mobil.
- **Out of Scope:** exakte Privatadressen erzwingen.
- **Features:** FEAT-070…FEAT-074.
- **Abhängigkeiten:** EPIC-002 (Personen-Orte), EPIC-005 (Event-Orte), Location-Entität.
- **Risiken:** [RISK-012](09_risiko-register.md) (Standortpräzision/Datenschutz), [RISK-013](09_risiko-register.md) (Geocoding-Abhängigkeit).
- **Erfolgskriterien:** Layer einzeln schaltbar; Cluster zeigt Anzahl; Karte zeigt nie präziser als gespeichert; funktioniert mit nur Stadt/Region.
- **Screens/Flows:** Karten-Screens · FLOW-24.
- **Phase:** 6.

## EPIC-009 — Vernetzungs-Finder
- **Ziel/Nutzen:** Gemeinsame direkte Kontakte zweier Personen finden.
- **Scope:** Auswahl zweier Personen, Ergebnis (Name, Bild, beide Beziehungstypen), Leerzustand, Wechsel in Profil/fokussierten Graph.
- **Out of Scope:** Pfadsuche/kürzester Pfad (spätere Ausbaustufe).
- **Features:** FEAT-080, FEAT-081.
- **Abhängigkeiten:** EPIC-003, EPIC-006.
- **Risiken:** [RISK-008](09_risiko-register.md) (Berechnung bei großen Graphen).
- **Erfolgskriterien:** Liefert exakt die mit **beiden** direkt Verbundenen; verständlicher Leerzustand bei 0 Treffern.
- **Screens/Flows:** Finder-Screens · FLOW-25.
- **Phase:** 6.

## EPIC-010 — Einmaliger Notion-Import
- **Ziel/Nutzen:** Bestand aus Notion **einmalig** und kontrolliert übernehmen.
- **Scope:** Zugangsdaten sicher erfassen, Vorschau & Mapping, Duplikatprüfung, Konflikt-/Warnanzeige, kontrollierte Ausführung, Importbericht, Rückverfolgbarkeit (ImportBatch/ExternalImportMap).
- **Out of Scope:** laufender Sync, Schreiben nach Notion.
- **Features:** FEAT-090…FEAT-093.
- **Abhängigkeiten:** EPIC-002…EPIC-005 (Zieldatenmodell).
- **Risiken:** [RISK-014](09_risiko-register.md) (Import-Duplikate), [RISK-006](09_risiko-register.md) (Bildquellen).
- **Erfolgskriterien:** Vorschau vor Schreiben; kein Duplikat bei wiederholtem Import; Bericht listet erstellt/übersprungen/Fehler.
- **Screens/Flows:** Import-Screens · FLOW-26.
- **Phase:** 2 (Initialdaten), Wiederholbarkeit gehärtet bis Phase 7.

## EPIC-011 — Einstellungen & konfigurierbare Typen
- **Ziel/Nutzen:** Beziehungskategorien/-typen, Ausschlussregeln und Ereignistypen pflegbar; Theme & App-Settings.
- **Scope:** RelationshipCategory/Type verwalten, RelationshipExclusionRule verständlich anzeigen, EventType verwalten, Theme (System/Light/Dark), AppSetting.
- **Out of Scope:** beliebige Regel-Engine durch Endnutzer ohne Validierung.
- **Features:** FEAT-100…FEAT-103.
- **Abhängigkeiten:** EPIC-001; speist EPIC-003/004/005.
- **Risiken:** [RISK-015](09_risiko-register.md) (Typänderung bricht Historie/Regeln).
- **Erfolgskriterien:** Typänderungen verletzen keine bestehende Historie; Ausschlussregeln für Laien lesbar; Theme persistiert.
- **Screens/Flows:** Einstellungs-Screens.
- **Phase:** 1 (Stammtypen) → 6 (Komfort).

## EPIC-012 — Backup, Restore & Betrieb
- **Priorität:** niedrig (DEC-031) – aktuell nicht wichtig; V1-Minimum genügt, kann ans Ende der Phase 7 rutschen.
- **Ziel/Nutzen:** Datenverlust verhindern; reproduzierbarer Betrieb.
- **Scope:** Backup erzeugen, Restore-Verfahren dokumentiert/getestet, persistentes Volume, Migrationen, Health-Check, strukturierte Logs.
- **Out of Scope:** automatisierte Off-site-Backups (nur Verfahren dokumentieren).
- **Features:** FEAT-110, FEAT-111 *(Enabler)*.
- **Abhängigkeiten:** EPIC-001.
- **Risiken:** [RISK-016](09_risiko-register.md) (Restore ungetestet).
- **Erfolgskriterien:** Restore auf leerer Umgebung führt zu identischem Datenstand; Daten überstehen Container-Neustart.
- **Screens/Flows:** Backup/Restore-Hinweise · FLOW-27.
- **Phase:** 7 (Verfahren früh skizziert).

## EPIC-013 — Responsive Design, Barrierearmut & Theme
- **Ziel/Nutzen:** Bedienbar auf Smartphone/Tablet/Desktop, ohne reine Hover-/Gesten-Bedienung.
- **Scope:** Responsive Shell & Navigation, Touch-Gesten für Graph/Karte, sichtbare Aktionen, Tastaturzugang, Kontraste, Alternativtexte.
- **Out of Scope:** vollständige WCAG-AAA-Zertifizierung in V1 (Ziel: solide Barrierearmut).
- **Features:** FEAT-120, FEAT-121 *(Querschnitt)*.
- **Abhängigkeiten:** Querschnitt über alle UI-Epics.
- **Risiken:** [RISK-009](09_risiko-register.md), [RISK-011](09_risiko-register.md).
- **Erfolgskriterien:** Kernflüsse auf 390 px bedienbar; jede Geste hat sichtbare Alternative; Fokuszustände sichtbar.
- **Screens/Flows:** SCR-004, mobile Varianten kritischer Screens · FLOW-20.
- **Phase:** Querschnitt (1–7).

## EPIC-014 — Tests, Sicherheit & Qualität
- **Ziel/Nutzen:** Verlässliche, sichere, wartbare Anwendung; Regeln durch Tests abgesichert.
- **Scope:** Testmatrix (Unit/Integration/E2E/UX/A11y/Security/Backup), Zugriffskontrolle auf jeder Abfrage, Upload-/Eingabevalidierung, CI.
- **Out of Scope:** Pen-Test durch Dritte (V1).
- **Features:** FEAT-130, FEAT-131 *(Querschnitt/Enabler)*.
- **Abhängigkeiten:** Querschnitt.
- **Risiken:** [RISK-001](09_risiko-register.md), [RISK-002](09_risiko-register.md), [RISK-006](09_risiko-register.md).
- **Erfolgskriterien:** Jedes kritische Akzeptanzkriterium hat ≥1 Test (siehe Testmodell, Review 2); CI grün als Merge-Gate.
- **Screens/Flows:** – (Querschnitt).
- **Phase:** Querschnitt (0–7).

---

### Epic → Phase Überblick

| Phase | Schwerpunkt-Epics |
| --- | --- |
| 0 Basis | EPIC-001, EPIC-014 |
| 1 Auth & Stammdaten | EPIC-001, EPIC-011, EPIC-002 (Start) |
| 2 Personen & Import | EPIC-002, EPIC-010 |
| 3 Connections & Historie | EPIC-003, EPIC-004 |
| 4 Ereignisse & Timeline | EPIC-005 |
| 5 Graph | EPIC-006, EPIC-007 |
| 6 Karte & Finder | EPIC-008, EPIC-009 |
| 7 Härtung & Betrieb | EPIC-012, EPIC-013, EPIC-014 |
