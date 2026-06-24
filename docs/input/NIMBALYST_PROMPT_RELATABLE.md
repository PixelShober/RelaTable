# Nimbalyst-Masterprompt für RelaTable

Ich habe die Datei `RELATABLE_REQUIREMENTS_V1_2.md` an dieses Projekt angehängt. Sie ist die verbindliche fachliche und technische Quelle für RelaTable.

## Deine Rolle

Arbeite als Kombination aus:

- Product Owner,
- Business Analyst,
- UX-/UI-Designer,
- Softwarearchitekt,
- Testarchitekt,
- technischer Projektplaner.

Deine Aufgabe ist **noch nicht die Implementierung von Code**. Baue aus der Spezifikation zunächst ein vollständiges, überprüfbares Projektmodell in Nimbalyst, das ich kommentieren, korrigieren und schrittweise freigeben kann.

## Grundregeln

1. Lies `RELATABLE_REQUIREMENTS_V1_2.md` vollständig.
2. Behandle bestätigte Anforderungen und Fachregeln als verbindlich.
3. Erfinde keine widersprechenden Produktregeln.
4. Löse Unklarheiten nicht stillschweigend:
   - kennzeichne sie als `Needs Decision`,
   - formuliere die konkrete Frage,
   - gib eine begründete Empfehlung,
   - blockiere deswegen aber nicht die erste Strukturierung.
5. Trenne klar zwischen:
   - V1/MVP,
   - späteren Erweiterungen,
   - ausdrücklich ausgeschlossenem Scope.
6. Erzeuge noch keinen produktiven Code und keine vollständige Implementierung.
7. Verwende nur synthetische Beispieldaten und neutrale Platzhalterbilder. Keine echten personenbezogenen Daten.
8. Alle erstellten Artefakte müssen untereinander verlinkt sein:
   - Epic → Feature → User Story → Akzeptanzkriterium → Mockup → Plan/Phase → Testidee.
9. Verwende stabile IDs, damit Kommentare eindeutig zugeordnet werden können:
   - `EPIC-xxx`
   - `FEAT-xxx`
   - `US-xxx`
   - `AC-xxx`
   - `SCR-xxx`
   - `FLOW-xxx`
   - `DEC-xxx`
   - `RISK-xxx`

---

# 1. Projektübersicht erstellen

Lege eine zentrale Projektübersicht **RelaTable** mit folgenden Bereichen an:

- Produktvision
- Zielgruppe und Benutzerkontext
- Kernproblem
- V1-Ziele
- Nicht-Ziele
- bestätigte Produktentscheidungen
- technische Zielarchitektur
- Datenschutz- und Sicherheitsprinzipien
- Deploymentziel
- Definition of Done
- offene Entscheidungen
- Risiken
- verknüpfte Epics, Features, Pläne, Diagramme und Mockups

Die Übersicht soll knapp genug zum Orientieren sein, aber direkt auf die detaillierten Artefakte verlinken.

## Verbindlicher Produktkontext

RelaTable ist eine private, selbst gehostete Webanwendung für genau einen globalen Eigentümer. Sie verwaltet Personen, Beziehungen, Beziehungsverläufe, Beziehungstagebuch-Einträge und gemeinsame Ereignisse und stellt diese als Graph, Timeline und Karte dar.

Verbindlich:

- ein globaler Benutzer,
- eigene SQLite-Datenbank,
- kein laufender Notion-Sync,
- einmaliger Notion-Initialimport,
- lokaler Betrieb oder VPS,
- ein App-Container mit persistentem Volume,
- kein Gastzugriff,
- keine Mehrmandantenfähigkeit,
- keine Beziehungstemperatur,
- kein historischer Graph-Zeitregler in V1,
- das Datenmodell muss historische Zeiträume trotzdem bereits korrekt speichern.

---

# 2. Epics und Feature-Backlog aufbauen

Erstelle ein hierarchisches Backlog. Nutze mindestens die folgenden fachlichen Bereiche, passe die genaue Epic-Struktur aber sinnvoll an:

1. Technische Basis, Setup und Authentifizierung
2. Personen und Social Accounts
3. Connections und Beziehungstypen
4. Beziehungsverlauf und Beziehungstagebuch
5. Ereignisse und Timeline
6. Hauptgraph und fokussierter Graph
7. Pair-Detailansicht über eine Graphkante
8. Kartenansicht
9. Vernetzungs-Finder
10. Einmaliger Notion-Import
11. Einstellungen und konfigurierbare Typen
12. Backup, Restore und Betrieb
13. Responsive Design, Barrierearmut und Theme
14. Tests, Sicherheit und Qualität

## Für jedes Epic

Erstelle:

- Ziel und Nutzen
- Scope
- Out of Scope
- enthaltene Features
- Abhängigkeiten
- Risiken
- messbare Erfolgskriterien
- zugehörige Screens und User Flows
- vorgesehene Implementierungsphase

## Für jedes Feature

Erstelle mindestens:

- Feature-ID
- verständlicher Titel
- Problem/Ziel
- Nutzerwert
- Priorität: Must / Should / Could
- V1 oder später
- fachliche Regeln
- Vorbedingungen
- Hauptablauf
- Alternativ- und Fehlerabläufe
- Akzeptanzkriterien in überprüfbarer Form
- benötigte Daten
- Berechtigungs-/Sicherheitsaspekte
- Responsive-/Accessibility-Hinweise
- Abhängigkeiten
- Risiken und Edge Cases
- Testideen
- verknüpfte Mockups
- offene Fragen

Vermeide Features, die nur technische Arbeitspakete ohne Nutzerwert darstellen. Technische Enabler dürfen separat als Enabler gekennzeichnet werden.

## Akzeptanzkriterien

Formuliere Akzeptanzkriterien möglichst konkret als:

- **Given**
- **When**
- **Then**

Sie müssen testbar sein. Begriffe wie „intuitiv“, „schnell“ oder „schön“ dürfen nicht ohne messbare oder beobachtbare Bedeutung verwendet werden.

---

# 3. Fachregeln ausdrücklich modellieren

Lege eine eigene Seite **Relationship Rules / Beziehungsregeln** an und dokumentiere die Regeln als Entscheidungstabelle und Zustandsübergänge.

## Nähegrad

Exklusive, geordnete Stufen:

1. Bekanntschaft
2. Freundschaft
3. Enge Freundschaft

Zu einem Zeitpunkt darf für dieselbe Connection höchstens eine dieser Stufen aktiv sein. Hoch- oder Herabstufungen beenden den alten Zeitraum und starten einen neuen, ohne Historie zu überschreiben.

## Freundschaft Plus

- ist ein andauernder Beziehungstyp,
- darf parallel zu einem Nähegrad bestehen,
- einzelne sexuelle Kontakte sind Ereignisse vom Typ `Sex`,
- ein Sex-Ereignis ändert den Beziehungsstatus nicht automatisch.

## Romantische Beziehung

- ist ein andauernder Beziehungstyp,
- blockiert während ihrer Laufzeit den Nähegrad derselben Connection,
- beendet beim Start einen aktiven Nähegrad,
- beendet beim Start einen aktiven Status `Freundschaft Plus`,
- lässt parallele Kontexte wie Cosplay oder Business bestehen.

## Ende einer romantischen Beziehung

Beim Beenden muss ein Dialog fragen:

- welcher Nähegrad danach gilt:
  - Bekanntschaft,
  - Freundschaft,
  - Enge Freundschaft,
  - kein Nähegrad;
- ob `Ex-Partner/in` aktiviert wird.

`Ex-Partner/in` ist ein paralleler Folgestatus und darf beispielsweise zusammen mit Freundschaft oder Bekanntschaft bestehen.

Erstelle dazu:

- Zustandsdiagramm,
- Entscheidungstabelle,
- Beispiele mit Zeiträumen,
- Validierungsregeln,
- relevante Fehlerfälle,
- verknüpfte Features und Mockups.

---

# 4. Datenmodell und Diagramme erstellen

Erstelle ein logisch konsistentes Datenmodell auf Basis der Spezifikation.

Mindestens enthalten:

- AppUser
- Person
- SocialAccount
- Connection
- RelationshipCategory
- RelationshipType
- RelationshipExclusionRule
- ConnectionRelationshipPeriod
- ConnectionJournalEntry
- RelationshipChangeLog
- EventType
- Event
- EventParticipant
- Location
- ImportBatch
- ExternalImportMap
- AppSetting

## Anforderungen an das Datenmodell

- Eine Connection repräsentiert genau ein ungeordnetes Personenpaar.
- Dasselbe Personenpaar darf nicht doppelt existieren.
- Beziehungstypen werden über Zeiträume historisiert.
- Ereignisse sind fachlich unabhängig von Beziehungen.
- Gemeinsame Ereignisse eines Personenpaars werden über gemeinsame Teilnehmer ermittelt.
- Profilbilder unterstützen lokalen Upload und externe HTTPS-URL.
- Ereignisse benötigen mindestens einen Teilnehmer.
- Personenadressen sind optional und können Straße, PLZ, Stadt, Region und Land enthalten.
- Karte funktioniert auch mit nur Stadt/Region.
- Exakte und ungenaue historische Zeitangaben werden unterstützt:
  - Tag,
  - Monat,
  - Jahr,
  - Jahreszeit,
  - ungefähr,
  - unbekannt.
- Die Oberfläche darf ungenaue Angaben nicht als exakten Tag vortäuschen.

Erzeuge:

1. ein Mermaid-ER-Diagramm,
2. ein vereinfachtes fachliches Datenmodell für Nicht-Techniker,
3. ein Zustandsdiagramm für Beziehungswechsel,
4. ein System-/Containerdiagramm,
5. ein Diagramm für den einmaligen Notion-Import.

Kennzeichne abgeleitete Timeline-Einträge als Projektion und nicht als unnötig duplizierte Datenquelle.

---

# 5. Informationsarchitektur und Navigation entwickeln

Entwirf eine klare Informationsarchitektur für Desktop, Tablet und Smartphone.

Die Navigation soll mindestens Zugriff ermöglichen auf:

- Graph
- Personen
- Ereignisse
- Timeline
- Karte
- Vernetzungs-Finder
- Einstellungen

Zusätzliche Bereiche:

- Profil/Account
- Import
- Backup/Restore
- Beziehungstypen und Kategorien
- Ereignistypen
- Theme

Erstelle:

- Sitemap,
- Hauptnavigation,
- mobile Navigation,
- Breadcrumb-/Zurück-Verhalten,
- Deep-Link-Struktur,
- Zuordnung der Screens zu Features.

Die Anwendung soll datenorientiert wirken, aber nicht wie ein technisches Admin-Tool.

---

# 6. User Flows erstellen

Erstelle mindestens die folgenden User Flows als Diagramm und als nummerierte Schrittfolge:

1. First-Run-Setup
2. Anmeldung
3. Person anlegen
4. Person mit lokalem Profilbild anlegen
5. Person mit externer Bild-URL anlegen
6. Social Account ergänzen
7. Connection zwischen zwei Personen erstellen
8. Nähegrad hoch- oder herunterstufen
9. Freundschaft Plus beginnen und beenden
10. Sex als separates Ereignis erfassen
11. Romantische Beziehung beginnen
12. Romantische Beziehung beenden und Folgestatus auswählen
13. Tagebucheintrag für eine Connection erfassen
14. Ereignis mit einer oder mehreren Personen erfassen
15. Globale Timeline filtern
16. Personen-Timeline öffnen
17. Hauptgraph bedienen
18. Profil über einfachen Node-Klick öffnen
19. Person über Doppelklick fokussieren
20. Mobile Aktionen über langen Druck öffnen
21. Pair-Details über Klick auf eine Graphkante öffnen
22. Gemeinsame Ereignisse eines Personenpaars filtern
23. Im fokussierten Graph zu einem direkten Kontakt wechseln
24. Personen- und Ereignisorte auf der Karte filtern
25. Gemeinsame direkte Kontakte zweier Personen finden
26. Notion-Import als Vorschau und anschließend kontrolliert ausführen
27. Backup erstellen und Restore-Verfahren nachvollziehen

Zeige in den Flows auch:

- Abbrechen,
- Validierungsfehler,
- leere Zustände,
- Konflikte mit Beziehungsregeln,
- erfolgreiche Bestätigung.

---

# 7. Kommentierbare Mockups erstellen

Erstelle zunächst **Low- bis Mid-Fidelity-Mockups**. Noch kein finales Branding und keine unnötige visuelle Perfektion. Ziel ist, dass ich Struktur, Bedienung und Fachlogik kommentieren kann.

## Mockup-Regeln

- Verwende durchgehend dieselbe Navigation und dasselbe Komponentenmodell.
- Nutze synthetische Namen und neutrale Avatare.
- Kennzeichne interaktive Elemente.
- Nummeriere wichtige UI-Bereiche mit Callouts.
- Ergänze je Screen eine kurze Annotationsliste:
  - Zweck,
  - primäre Aktion,
  - sekundäre Aktionen,
  - Zustände,
  - offene Designentscheidung.
- Verlinke jeden Screen mit den zugehörigen Features und Flows.
- Erstelle für kritische Screens Varianten:
  - Desktop ca. 1440 px,
  - Tablet ca. 1024 px, insbesondere Graph und Karte,
  - Smartphone ca. 390 px.
- Zeige nicht nur den Happy Path, sondern auch:
  - leerer Zustand,
  - Ladezustand,
  - Fehlerzustand,
  - Validierungszustand,
  - Bestätigungsdialog,
  - lange Inhalte.
- Sorge dafür, dass Klick, Doppelklick und langer Druck nicht die einzige unsichtbare Bedienmöglichkeit sind. Aktionen müssen zusätzlich auffindbar sein.
- Der historische Graph-Zeitregler ist **nicht** Bestandteil der V1-Mockups.
- Die Timeline selbst ist Bestandteil von V1.

## Zu erstellende Screens

### Einstieg und Shell

- `SCR-001` First-Run-Setup
- `SCR-002` Login
- `SCR-003` Hauptnavigation Desktop
- `SCR-004` Hauptnavigation Smartphone

### Personen

- Personenliste mit Suche und Filtern
- leere Personenliste
- Person anlegen/bearbeiten
- Profilbild: lokaler Upload
- Profilbild: externe URL mit Vorschau und Fehlerfall
- Personenprofil
- Social Accounts
- Löschdialog mit Abhängigkeitswarnung

### Graph

- Hauptgraph
- Node-Profilpanel nach einfachem Klick
- fokussierter Graph mit nur direkten Kontakten
- Fokuswechsel auf direkten Kontakt
- mobile Graphansicht
- Long-Press-Aktionsmenü
- Legende für mehrere Beziehungstypen
- Graph-Leerzustand und Performance-/Ladezustand

### Pair-Detailansicht

Dieser Bereich ist besonders wichtig.

Ein Klick auf die Verbindungslinie zwischen zwei Personen öffnet die Detailansicht dieses Personenpaars.

Entwirf:

- Desktop-Ansicht als geeignete Detailseite oder großes Panel,
- Smartphone-Ansicht als eigene Seite oder Bottom-Sheet-zu-Seite-Übergang,
- Übersicht der beiden Personen,
- aktuelle Beziehungstypen,
- historische Beziehungstypen und Zeiträume,
- Statuswechsel,
- Beziehungstagebuch,
- gemeinsame Timeline,
- gemeinsame Ereignisse,
- Filter:
  - Zeitraum,
  - Ereignistyp,
  - Beziehungstyp,
  - alle gemeinsamen Events,
  - nur Events mit exakt diesen beiden Teilnehmern,
- Aktionen:
  - Beziehungstyp starten,
  - Beziehungstyp beenden,
  - Nähegrad ändern,
  - Beziehung beginnen,
  - Beziehung beenden,
  - Tagebucheintrag hinzufügen,
  - gemeinsames Ereignis hinzufügen.

### Beziehungsdialoge

- Connection erstellen
- Nähegrad auswählen
- Nähegrad hoch-/herabstufen
- Freundschaft Plus beginnen
- romantische Beziehung beginnen mit Vorschau der automatisch endenden Status
- Beziehung beenden
- Folgezustand auswählen
- `Ex-Partner/in` aktivieren
- ungenaue Start-/Endzeit erfassen
- Konflikt- und Validierungsdialog

### Ereignisse und Timeline

- Ereignisliste
- Ereignis anlegen/bearbeiten
- Teilnehmerauswahl
- Ortseingabe
- Ereignistypen
- globale Timeline
- Personen-Timeline
- Pair-Timeline
- Timeline-Filter
- Darstellung ungenauer Daten wie `Sommer 2022` oder `ungefähr Anfang 2023`

### Karte

- Standardansicht mit Personen- und Ereignismarkern
- Filterpanel
- nur Personen
- nur Ereignisse
- Cluster
- Marker-Detail
- fehlende Standortdaten
- mobile Kartenansicht

### Vernetzungs-Finder

- Auswahl von zwei Personen
- Ergebnis mit gemeinsamen direkten Kontakten
- kein Ergebnis
- Wechsel in Profil oder fokussierten Graph

### Import und Einstellungen

- Notion-Import starten
- Zugangsdaten sicher erfassen
- Vorschau und Mapping
- Warnungen und Konflikte
- Importbericht
- Beziehungskategorien und -typen verwalten
- Ausschlussregeln verständlich anzeigen
- Ereignistypen verwalten
- Theme
- Backup/Restore-Hinweise

---

# 8. UX-Empfehlungen und Alternativen

Für größere Designentscheidungen sollst du nicht nur eine Lösung präsentieren.

Erstelle für mindestens diese Punkte jeweils 2–3 Varianten mit Vor- und Nachteilen und markiere eine Empfehlung:

1. Hauptnavigation Desktop
2. Hauptnavigation Smartphone
3. Pair-Details als Seite, Side Panel oder Modal
4. Darstellung mehrerer Beziehungstypen auf einer Graphkante
5. Darstellung aktueller und historischer Beziehungen
6. Eingabe ungenauer historischer Zeitangaben
7. Timeline als Liste, gruppierte Chronik oder hybride Ansicht
8. Profilpanel bei einfachem Node-Klick
9. Filterbedienung auf Karte und Timeline
10. Start-/Enddialog einer romantischen Beziehung

Wähle danach eine empfohlene Variante für die erste Mockup-Runde, lasse die Alternativen aber dokumentiert.

---

# 9. Umsetzungsplan und Releases erstellen

Erstelle einen realistischen, abhängigen Implementierungsplan in vertikalen, testbaren Scheiben.

Nutze die Phasen der Spezifikation als Ausgangspunkt:

- Phase 0: Repository und technische Basis
- Phase 1: Auth und Stammdaten
- Phase 2: Personen und Initialimport
- Phase 3: Connections und zeitliche Historie
- Phase 4: Ereignisse und Timeline
- Phase 5: Graph
- Phase 6: Karte und Finder
- Phase 7: Härtung und Betrieb

## Für jede Phase

Erstelle:

- Ziel
- enthaltene Epics und Features
- Abhängigkeiten
- konkrete Deliverables
- notwendige Mockup-Freigaben
- Datenbankmigrationen
- Testumfang
- Demo-Szenario
- Exit-Kriterien
- Risiken

Teile Features in kleine, umsetzbare Einheiten, ohne sie künstlich in technische Kleinstaufgaben zu zerlegen.

Erstelle zusätzlich:

- Dependency Map,
- kritischen Pfad,
- Risiko-Register,
- Release-Checkliste,
- V1-Scope-Übersicht,
- Liste der bewusst verschobenen Funktionen.

---

# 10. Test- und Review-Modell erstellen

Lege eine Testmatrix an:

- Domain-Unit-Test
- API-/Integrationstest
- Playwright-E2E-Test
- manueller UX-Test
- Accessibility-Test
- Security-Test
- Backup-/Restore-Test

Verknüpfe jedes kritische Akzeptanzkriterium mit mindestens einer Testidee.

Besonders kritisch:

- genau ein globaler Benutzer,
- Setup nur beim ersten Start,
- doppeltes Personenpaar verhindern,
- historische Zeiträume nicht überschreiben,
- exklusive Nähegrade,
- Freundschaft Plus parallel zu Nähegrad,
- Beziehung blockiert Nähegrad,
- Beziehung beendet Freundschaft Plus,
- Folgestatus nach Beziehungsende,
- Ex-Partner/in,
- ungenaue Zeitangaben,
- Graph-Klick/Doppelklick/Long-Press,
- Edge-Klick öffnet Pair-Details,
- Eventfilter eines Personenpaars,
- Notion-Import ohne Duplikate,
- Authentifizierung aller privaten API-Endpunkte,
- Persistenz nach Container-Neustart.

---

# 11. Review-Workflow in Nimbalyst

Baue die Artefakte so auf, dass ich sie schrittweise kommentieren kann.

## Review-Runden

### Review 1 – Struktur

Zeige zuerst:

- Projektübersicht
- Epics
- Feature-Landkarte
- Sitemap
- Datenmodell
- offene Entscheidungen und Risiken

### Review 2 – Kernabläufe

Danach:

- Beziehungsregeln
- zentrale User Flows
- Pair-Details
- Graphinteraktionen
- Ereignisse und Timeline

### Review 3 – Low-Fidelity-Mockups

Danach die Mockups in dieser Reihenfolge:

1. Navigation und Shell
2. Personen
3. Hauptgraph
4. Pair-Details
5. Beziehungsdialoge
6. Ereignisse und Timeline
7. Karte
8. Finder
9. Import und Einstellungen

### Review 4 – Responsive und Fehlerzustände

- Smartphone
- Tablet
- leere Zustände
- Fehlerzustände
- Validierungen
- Accessibility

### Review 5 – Finalisierung für Implementierung

Erst nach meinen Kommentaren:

- Features aktualisieren,
- Akzeptanzkriterien finalisieren,
- Mockups konsolidieren,
- Pläne aktualisieren,
- verbleibende Entscheidungen dokumentieren,
- ein umsetzbares Übergabepaket für Claude Code oder Codex CLI erstellen.

## Kommentarverarbeitung

Wenn ich einen Kommentar hinterlasse:

1. ordne ihn dem konkreten Artefakt und der ID zu,
2. beschreibe kurz die Auswirkung,
3. aktualisiere betroffene Features, Flows, Mockups und Pläne konsistent,
4. dokumentiere wesentliche Entscheidungen im Decision Log,
5. markiere nicht mehr gültige Varianten als verworfen, lösche die Historie aber nicht.

---

# 12. Erwartete erste Ausgabe

Beginne jetzt mit **Review 1 – Struktur**.

Erzeuge konkret:

1. Projektübersicht
2. Epic-Struktur
3. Feature-Landkarte
4. V1-/Später-/Out-of-Scope-Matrix
5. Sitemap
6. Mermaid-ER-Diagramm
7. Zustandsdiagramm der Beziehungslogik
8. Dependency Map
9. Risiko-Register
10. Liste erkannter Lücken oder Unklarheiten
11. Plan für die anschließende Mockup-Runde

Erstelle die Artefakte tatsächlich in den passenden Nimbalyst-Bereichen. Gib nicht nur eine textuelle Beschreibung dessen aus, was man später anlegen könnte.

Beende Review 1 mit einer kurzen Liste der 5–10 wichtigsten Punkte, die ich vor Beginn der Mockups prüfen oder kommentieren sollte.
