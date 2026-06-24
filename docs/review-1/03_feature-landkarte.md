# 3. Feature-Landkarte

> ↩ [Index](README.md) · gruppiert nach [Epics](02_epics.md). Spalten: Prio (Must/Should/Could) · Scope (V1/Später/Out) · Quelle (Entwurfs-ID). Detail-Akzeptanzkriterien je Feature folgen in Review 2; hier die überprüfbare Landkarte.

Legende Scope: **V1** = erste Auslieferung · **L** = später · **Out** = ausgeschlossen. *(Enabler)* = technischer Enabler ohne direkten Nutzerwert.

## EPIC-001 — Basis, Setup & Auth
| ID | Titel | Prio | Scope | Quelle | Nutzerwert / Regel |
| --- | --- | --- | --- | --- | --- |
| FEAT-001 | First-Run-Setup (einziger Account) | Must | V1 | — | Setup nur beim allerersten Start; danach gesperrt. |
| FEAT-002 | Login / Logout | Must | V1 | AUTH-001 | Ohne Anmeldung keine Daten (UI + API). |
| FEAT-003 | Session-/Token-Lebenszyklus | Must | V1 | AUTH-001 | Ablauf & Widerruf definiert. |
| FEAT-004 | App-Container + SQLite + Health-Check *(Enabler)* | Must | V1 | NFR-005 | Persistenz über Neustart, Health-Endpoint. |

## EPIC-002 — Personen & Social Accounts
| ID | Titel | Prio | Scope | Quelle | Nutzerwert / Regel |
| --- | --- | --- | --- | --- | --- |
| FEAT-010 | Personenliste mit Suche | Must | V1 | PER-001 | Bild, Name, Kontextwert; Namenssuche. |
| FEAT-011 | Personenliste Filter (Ort, Beziehungstyp) | Must | V1 | PER-001 | Serverseitige Filter. |
| FEAT-012 | Personenprofil | Must | V1 | PER-002 | Stammdaten, Accounts, Beziehungen, Ereignisse, Graph-Sprung. |
| FEAT-013 | Person anlegen/bearbeiten/löschen | Must | V1 | PER-003 | Name Pflicht; Löschdialog zeigt Abhängigkeiten. |
| FEAT-014 | Berechnetes Alter | Should | V1 | PER-004 | Alter nie redundant gespeichert. |
| FEAT-015 | Profilbild: Upload **und** externe HTTPS-URL | Must | V1 | PER-002, DEC-011 | URL-Vorschau + Fehlerfall; Upload validiert. |
| FEAT-016 | Social Accounts (0..n) | Must | V1 | SOC-001/002 | Plattform/Handle/URL/Sichtbarkeit; Duplikatwarnung; nur strukturiertes Modell. |

## EPIC-003 — Connections & Beziehungstypen
| ID | Titel | Prio | Scope | Quelle | Nutzerwert / Regel |
| --- | --- | --- | --- | --- | --- |
| FEAT-020 | Connection erstellen (ungeordnetes Paar) | Must | V1 | REL-001, DEC-004 | Genau 2 verschiedene Personen; kein Duplikat; keine Selbstkante. |
| FEAT-021 | Nähegrad setzen | Must | V1 | REL-001, [Regeln](07_beziehungsregeln.md) | Exklusive Stufe. |
| FEAT-022 | Nähegrad hoch-/herabstufen | Must | V1 | REL-002 | Alten Zeitraum beenden, neuen starten. |
| FEAT-023 | Freundschaft Plus beginnen/beenden | Must | V1 | [Regeln](07_beziehungsregeln.md) | Parallel zu Nähegrad erlaubt. |
| FEAT-024 | Romantische Beziehung beginnen | Must | V1 | [Regeln](07_beziehungsregeln.md) | Beendet Nähegrad + Freundschaft Plus; Vorschau der endenden Status. |
| FEAT-025 | Romantik beenden + Folgestatus-Dialog | Must | V1 | [Regeln](07_beziehungsregeln.md), DEC-009 | Folge-Nähegrad wählen; Ex-Partner/in optional. |
| FEAT-026 | Parallele Kontexte (Cosplay/Business) | Should | V1 | [Regeln](07_beziehungsregeln.md) | Bleiben bei Romantik bestehen. |

## EPIC-004 — Beziehungsverlauf & Tagebuch
| ID | Titel | Prio | Scope | Quelle | Nutzerwert / Regel |
| --- | --- | --- | --- | --- | --- |
| FEAT-030 | Historisierte Beziehungszeiträume | Must | V1 | REL-002, DEC-005 | Nie überschreiben; ein aktiver Nähegrad je Zeitpunkt. |
| FEAT-031 | RelationshipChangeLog (Audit) | Should | V1 | REL-002 | Maschinenlesbare Statuswechsel. |
| FEAT-032 | Beziehungstagebuch-Einträge | Must | V1 | REL-003 | Datum, Titel, optional Notiz; chronologisch. |
| FEAT-033 | Ungenaue Zeitangaben in Verlauf/Tagebuch | Must | V1 | DEC-013 | Tag/Monat/Jahr/Jahreszeit/ungefähr/unbekannt. |

## EPIC-005 — Ereignisse & Timeline
| ID | Titel | Prio | Scope | Quelle | Nutzerwert / Regel |
| --- | --- | --- | --- | --- | --- |
| FEAT-040 | Ereignis anlegen/bearbeiten/löschen | Must | V1 | EVT-001 | Name, Datum, Typ; ≥1 Teilnehmer. |
| FEAT-041 | Teilnehmer (1..n) | Must | V1 | EVT-001 | Erscheint in allen Teilnehmerprofilen. |
| FEAT-042 | Ereignistyp `Sex` als Ereignis | Must | V1 | [Regeln](07_beziehungsregeln.md) | Ändert Status **nicht** automatisch. |
| FEAT-043 | Sensible Inhalte: globaler Filter (default aus) | Must | V1 | EVT-001, NFR-001, DEC-027 | Toggle „Sensible Inhalte anzeigen"; `Sex` & sensible Typen standardmäßig versteckt. |
| FEAT-044 | Globale Timeline + Filter | Must | V1 | — | Filter Zeitraum/Typ/Person. |
| FEAT-045 | Personen-Timeline | Must | V1 | PER-002 | Chronologie pro Person. |
| FEAT-046 | Darstellung ungenauer Daten in Timeline | Must | V1 | DEC-013 | `Sommer 2022` nicht als exakter Tag. |

## EPIC-006 — Graph
| ID | Titel | Prio | Scope | Quelle | Nutzerwert / Regel |
| --- | --- | --- | --- | --- | --- |
| FEAT-050 | Hauptgraph (Zoom/Pan/Auswahl) | Must | V1 | GRF-001 | Node = Person, Edge = Connection. |
| FEAT-051 | Kantenfarbe = aktueller Typ + Legende | Must | V1 | GRF-001, C-010 | Standardkante zeigt aktuellen Typ. |
| FEAT-052 | Profilpanel bei einfachem Klick | Must | V1 | GRF-001 | Klick ≠ Fokus. |
| FEAT-053 | Doppelklick = Person fokussieren | Must | V1 | GRF-002 | Fokuswechsel ohne Seitenneustart. |
| FEAT-054 | Fokussierter Graph (nur direkte Kontakte) | Must | V1 | GRF-002, DEC-017 | Tiefe 1. |
| FEAT-055 | Mobile Long-Press-Aktionsmenü + sichtbare Alternative | Must | V1 | C-011, UX-001 | Keine Gesten-only-Bedienung. |
| FEAT-056 | Graph-Leer-/Ladezustand + Mehrtyp-Legende | Should | V1 | GRF-001, GRF-005 | Bleibt bei isolierten Nodes lesbar. |

## EPIC-007 — Pair-Detailansicht
| ID | Titel | Prio | Scope | Quelle | Nutzerwert / Regel |
| --- | --- | --- | --- | --- | --- |
| FEAT-060 | Kantenklick öffnet Pair-Details | Must | V1 | — | Desktop Seite/Panel, Mobil Seite/Bottom-Sheet. |
| FEAT-061 | Aktuelle & historische Typen + Zeiträume | Must | V1 | GRF-003, REL-002 | Chronologisch, eindeutig datiert. |
| FEAT-062 | Pair-Aktionen (Typ/Beziehung/Nähegrad/Tagebuch/Event) | Must | V1 | EPIC-003/004/005 | Alle Beziehungsaktionen hier ausführbar. |
| FEAT-063 | Gemeinsame Timeline & Events | Must | V1 | DEC-010 | Über gemeinsame Teilnehmer. |
| FEAT-064 | Pair-Filter inkl. „nur exakt diese zwei" | Must | V1 | — | Zeitraum/Eventtyp/Beziehungstyp/alle vs. exakt 2. |

## EPIC-008 — Karte
| ID | Titel | Prio | Scope | Quelle | Nutzerwert / Regel |
| --- | --- | --- | --- | --- | --- |
| FEAT-070 | Kartenansicht (Zoom/Pan) | Should | V1 | MAP-001 | Funktioniert mit Stadt/Region. |
| FEAT-071 | Getrennte Layer Personen/Ereignisse | Should | V1 | MAP-002, C-004 | Einzeln schaltbar. |
| FEAT-072 | Clustering | Should | V1 | MAP-003 | Anzahl im Cluster; überlappende erreichbar. |
| FEAT-073 | Marker-Detail | Should | V1 | MAP-001 | Name/Bild + Link Profil/Event. |
| FEAT-074 | Umgang mit fehlenden Standorten | Should | V1 | MAP-004 | Klare Behandlung statt Falschverortung. |

## EPIC-009 — Vernetzungs-Finder
| ID | Titel | Prio | Scope | Quelle | Nutzerwert / Regel |
| --- | --- | --- | --- | --- | --- |
| FEAT-080 | Zwei Personen wählen → gemeinsame direkte Kontakte | Could | V1 | FIND-001 | Name, Bild, beide Beziehungstypen. |
| FEAT-081 | Leerzustand + Wechsel in Profil/Graph | Could | V1 | FIND-001 | Verständlicher 0-Treffer-Zustand. |
| FEAT-082 | Pfadsuche (kürzester Pfad) | Could | **L** | FIND-002 | Spätere Ausbaustufe. |

## EPIC-010 — Notion-Import
| ID | Titel | Prio | Scope | Quelle | Nutzerwert / Regel |
| --- | --- | --- | --- | --- | --- |
| FEAT-090 | Zugangsdaten sicher erfassen | Must | V1 | C-012 | Secret-Handling, kein Klartext-Log. |
| FEAT-091 | Vorschau & Mapping | Must | V1 | C-012 | Vor jedem Schreiben. |
| FEAT-092 | Kontrollierte Ausführung ohne Duplikate | Must | V1 | C-012 | ExternalImportMap verhindert Doppelimport. |
| FEAT-093 | Importbericht + Konflikt-/Warnanzeige | Must | V1 | C-012 | Erstellt/übersprungen/Fehler. |

## EPIC-011 — Einstellungen & Typen
| ID | Titel | Prio | Scope | Quelle | Nutzerwert / Regel |
| --- | --- | --- | --- | --- | --- |
| FEAT-100 | Beziehungskategorien/-typen verwalten | Should | V1 | REL-001 | Erweiterbar, nicht nur Code-Konstanten. |
| FEAT-101 | Ausschlussregeln verständlich anzeigen | Should | V1 | [Regeln](07_beziehungsregeln.md) | Für Laien lesbar. |
| FEAT-102 | Ereignistypen verwalten | Should | V1 | EVT-001 | Inkl. Sensitivitätskennzeichen. |
| FEAT-103 | Theme System/Light/Dark | Could | V1 | THEME-001 | Persistiert; folgt System bis manuell. |

## EPIC-012 — Backup, Restore & Betrieb
| ID | Titel | Prio | Scope | Quelle | Nutzerwert / Regel |
| --- | --- | --- | --- | --- | --- |
| FEAT-110 | Backup erstellen | Could | V1 | NFR-001 | Konsistente Sicherung von DB + Uploads. Niedrige Prio (DEC-031). |
| FEAT-111 | Restore-Verfahren (dokumentiert/getestet) *(Enabler)* | Could | V1 | NFR-001/003 | Reproduzierbarer Wiederherstellungsstand. Niedrige Prio (DEC-031). |

## EPIC-013 — Responsive, A11y & Theme
| ID | Titel | Prio | Scope | Quelle | Nutzerwert / Regel |
| --- | --- | --- | --- | --- | --- |
| FEAT-120 | Responsive Shell & Navigation | Must | V1 | UX-001 | Desktop/Tablet/Smartphone. |
| FEAT-121 | Barrierearmut (Tastatur, Kontrast, Alt-Text) | Should | V1 | UX-002 | Farbe nie alleiniger Informationsträger. |

## EPIC-014 — Tests, Sicherheit & Qualität
| ID | Titel | Prio | Scope | Quelle | Nutzerwert / Regel |
| --- | --- | --- | --- | --- | --- |
| FEAT-130 | Testmatrix & CI *(Enabler)* | Must | V1 | §10 | Jedes kritische AC ≥1 Test. |
| FEAT-131 | Zugriffskontrolle & Eingabe-/Upload-Validierung | Must | V1 | NFR-001 | Auf jeder Datenabfrage. |

---

### Ausgeschlossen (Out of Scope, referenziert)
| Thema | Quelle | Begründung |
| --- | --- | --- |
| Beziehungstemperatur/Aktivität | REL-004, C-003 | Vom Masterprompt gestrichen. |
| Gastzugriff/Share-Link | AUTH-003, C-008 | Nicht in V1. |
| Externe KI auf sensiblen Daten | EVT-003, C-009 | `AiNote` bleibt reines Textfeld. |
| Historischer Graph-Zeitregler | Prompt | Modell speichert Zeiträume trotzdem. |
| Laufender Notion-Sync | C-012 | Nur einmaliger Import. |
| Mehrbenutzer/Mandanten | AUTH-002 | Ein globaler Eigentümer. |
