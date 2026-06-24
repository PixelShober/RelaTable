# RelaTable – konsolidierte Produkt- und Implementierungsanforderungen

**Dokumentstatus:** Entwurf v0.9 – offene fachliche Entscheidungen sind in Abschnitt 13 markiert  
**Zielgruppe:** Claude Code / Codex CLI sowie menschliche Entwickler  
**Stand:** 18.06.2026  
**Projektname:** RelaTable

> Dieses Dokument konsolidiert die im Notion-Projekt „RelaTable“ erfassten Features, die ältere Anforderungsseite sowie die dort modellierten Datenbanken. Wo Notion nur Ideen oder Platzhalter enthält, werden daraus keine stillschweigend bestätigten Anforderungen gemacht. Solche Punkte sind als **Annahme**, **Vorschlag** oder **offene Frage** gekennzeichnet.

---

## 1. Arbeitsanweisung für den Coding-Agenten

1. Lies dieses Dokument vollständig, bevor du Code änderst.
2. Prüfe anschließend den vorhandenen Repository-Stand, die aktuelle Architektur, das Datenmodell, bestehende Migrationen und Tests.
3. Behandle die mit **BESTÄTIGT** gekennzeichneten Anforderungen als verbindlich.
4. Behandle **VORSCHLAG** als empfohlene Konkretisierung, die implementiert werden darf, sofern sie nicht einer offenen Frage widerspricht.
5. Implementiere keine Punkte mit Status **OFFEN**, bis eine Entscheidung dokumentiert wurde.
6. Erstelle vor größeren Änderungen einen kurzen Umsetzungsplan und teile die Arbeit in kleine, überprüfbare Schritte.
7. Erstelle Änderungen in logisch getrennten Commits mit verständlichen Commit-Nachrichten.
8. Ergänze Unit-, Integrations- und End-to-End-Tests. Kritische Nutzerflüsse sind mit Playwright zu testen.
9. Führe Build, Linting, Tests und vorhandene Qualitätsprüfungen vor Abschluss aus.
10. Dokumentiere Abweichungen vom vorliegenden Dokument im Pull Request oder in einer separaten `DECISIONS.md`.
11. Keine sensiblen Zugangsdaten, API-Keys oder personenbezogenen Testdaten committen.
12. Bei einer bestehenden Anwendung gilt: vorhandene Funktionalität nicht ohne dokumentierten Grund entfernen oder inkompatibel verändern.

---

## 2. Produktziel

RelaTable ist eine private Anwendung zur strukturierten Verwaltung und Visualisierung persönlicher Beziehungen und Vernetzungen.

Die Anwendung soll insbesondere ermöglichen:

- Personen mit Profilinformationen zu verwalten,
- Beziehungen zwischen Personen abzubilden,
- Veränderungen und gemeinsame Ereignisse chronologisch zu dokumentieren,
- das Netzwerk als interaktiven Graph darzustellen,
- eine einzelne Person und deren direkte Vernetzungen fokussiert zu betrachten,
- geografische Verteilungen von Personen oder Ereignissen auf einer Karte zu untersuchen,
- gemeinsame Verbindungspunkte zweier Personen zu finden.

Die Daten sind potenziell hochsensibel. Datenschutz, Zugriffsschutz und kontrollierte Freigaben sind daher Kernanforderungen und keine nachträglichen Ergänzungen.

---

## 3. Herkunft und Verbindlichkeit der Anforderungen

### 3.1 Konsolidierte Notion-Quellen

- RelaTable-Projektseite
- Feature-Datenbank
- „Projekt – Anforderungen (alt)“
- Feature „Datenbank Struktur“
- Feature „Graph Individual View“
- Feature „Map-View“
- Feature „Vernetzungs Finder“
- Feature „Dark/Light Mode“
- Feature „Mockup – Graph“
- Feature „VS-Code Project Structure“
- Notion-Datenbanken `Person`, `Relation`, `Event` und `Instagram Account`

### 3.2 Prioritätsinterpretation

Die Notion-Prioritäten werden wie folgt übernommen:

| Priorität | Bedeutung in diesem Dokument |
|---|---|
| High | Kernfunktion oder notwendige Grundlage |
| Medium | nach dem Kernumfang umzusetzen |
| Low | spätere Ausbaustufe / Komfortfunktion |

### 3.3 Statusinterpretation

- `In Work`: bereits vorgesehen oder begonnen, aber nicht automatisch vollständig spezifiziert.
- `Backlog`: fachliche Idee, die vor Umsetzung weiter konkretisiert werden muss.
- Leere Platzhalter in Notion gelten nicht als Akzeptanzkriterium.

---

## 4. Vorgeschlagener Lieferumfang

### 4.1 Phase 1 – technischer und fachlicher Kern

1. Projekt- und Repository-Struktur
2. Authentifizierung und sicherer Einzelbenutzerbetrieb
3. Persistentes Datenmodell
4. Personenliste mit Suche und Filterung
5. Personenprofil
6. Beziehungen zwischen genau zwei Personen
7. Ereignisse und Beziehungshistorie
8. Interaktiver Hauptgraph
9. Fokussierte Einzelpersonen-Graphansicht
10. Responsive Bedienbarkeit für Desktop, Tablet und Smartphone
11. Automatisierte Tests und CI

### 4.2 Phase 2 – erweiterte Visualisierung

1. Kartenansicht
2. Clusterung geografisch naher Einträge
3. Verbindungstemperatur beziehungsweise Beziehungsaktivität
4. Chronologische Darstellung von Änderungen auf einer Beziehung
5. kontrollierter Lesezugriff beziehungsweise Freigaben, sofern bestätigt

### 4.3 Phase 3 – Komfort und Analyse

1. Vernetzungs-Finder
2. Dark-/Light-Mode
3. optionale KI-Funktionen
4. weitere Import- oder Synchronisationsfunktionen

---

## 5. Rollen und Zugriffsmodell

### AUTH-001 – geschützter Zugriff

**Status:** BESTÄTIGT, konkrete Ausprägung OFFEN  
Die Anwendung darf persönliche Daten nicht ohne Authentifizierung ausliefern.

**Akzeptanzkriterien:**

- Nicht authentifizierte Nutzer können keine Personen-, Beziehungs-, Ereignis- oder Graphdaten abrufen.
- Direkte API-Aufrufe sind ebenso geschützt wie UI-Seiten.
- Passwörter werden ausschließlich mit einem aktuellen, geeigneten Passwort-Hashing-Verfahren gespeichert.
- Sitzungen beziehungsweise Tokens besitzen eine definierte Ablauf- und Widerrufslogik.
- Sicherheitsrelevante Konfiguration wird über Umgebungsvariablen oder Secret Stores bereitgestellt.

### AUTH-002 – Einzelbenutzer oder mehrere Profile

**Status:** OFFEN  
In Notion ist ungeklärt, ob eine Datenbank genau einer Person gehört oder mehrere voneinander getrennte Profile beziehungsweise Mandanten unterstützt werden.

**Vorgeschlagene V1-Annahme:** Ein globaler Eigentümer-Account; alle Fachdaten gehören diesem Account. Das Datenmodell soll eine spätere Zuordnung über `OwnerId` beziehungsweise `WorkspaceId` nicht unnötig verhindern.

### AUTH-003 – lesender Gastzugriff

**Status:** OFFEN  
Notion nennt einen optionalen, teilbaren Lesezugriff. Wegen der sensiblen Daten darf dies nicht als unbeschränkter Link umgesetzt werden.

**Mindestanforderungen bei späterer Umsetzung:**

- Freigabe ist standardmäßig deaktiviert.
- Freigaben sind widerrufbar und optional zeitlich befristet.
- Einzelne Datenkategorien können von der Freigabe ausgeschlossen werden.
- Ereignistypen, intime Informationen, private Accounts und interne Notizen sind standardmäßig verborgen.
- Freigaben werden protokolliert.

---

## 6. Funktionale Anforderungen

## 6.1 Personenverwaltung

### PER-001 – Personenliste

**Status:** BESTÄTIGT  
**Priorität:** High

Die Anwendung stellt ein Verzeichnis aller gespeicherten Personen bereit.

**Akzeptanzkriterien:**

- Die Liste zeigt mindestens Profilbild, Name und einen kompakten Kontextwert, beispielsweise Ort oder Beziehungskategorie.
- Nutzer können nach Namen suchen.
- Nutzer können die Liste mindestens nach Ort und Beziehungstyp filtern.
- Auswahl eines Eintrags öffnet das Personenprofil.
- Leere Ergebnisse, Ladezustände und Fehlerzustände werden verständlich dargestellt.
- Die Liste ist auf Smartphone, Tablet und Desktop bedienbar.

### PER-002 – Personenprofil

**Status:** BESTÄTIGT  
**Priorität:** High

Das Profil zeigt alle relevanten Informationen einer Person.

**Akzeptanzkriterien:**

- Anzeige und Bearbeitung von Name, Geburtsdatum, optionalem Geschlecht, Notizen, Profilbild und Standort.
- Anzeige verknüpfter Social-Media- beziehungsweise Instagram-Accounts.
- Anzeige aller Beziehungen, an denen die Person beteiligt ist.
- Anzeige relevanter Ereignisse in chronologischer Reihenfolge.
- Direkter Wechsel in die fokussierte Graphansicht der Person.
- Datenänderungen werden validiert und persistiert.

### PER-003 – Person anlegen, bearbeiten und löschen

**Status:** VORSCHLAG – technisch notwendig für eine vollständige Verwaltung

**Akzeptanzkriterien:**

- Personen können angelegt und bearbeitet werden.
- Name ist ein Pflichtfeld.
- Geburtsdatum, Standort, Profilbild, Notizen und Accounts sind optional.
- Vor dem Löschen wird angezeigt, welche Beziehungen und Ereignisse betroffen sind.
- Löschregeln verhindern verwaiste Referenzen.
- Für sensible oder umfangreiche Löschungen ist eine explizite Bestätigung erforderlich.

### PER-004 – Alter nicht redundant speichern

**Status:** VORSCHLAG  
Das aktuelle Notion-Modell enthält `Date of Birth` und `Age`. Das Alter soll nicht als unabhängige persistente Wahrheit gespeichert werden.

**Akzeptanzkriterien:**

- Alter wird aus dem Geburtsdatum und dem aktuellen Datum berechnet.
- Bei unbekanntem Geburtsdatum wird kein Alter angezeigt.
- Es gibt keine manuell editierbare Altersangabe, die vom Geburtsdatum abweichen kann.

---

## 6.2 Social-Media- und Instagram-Accounts

### SOC-001 – mehrere Accounts pro Person

**Status:** BESTÄTIGT durch das separate Account-Modell; genaue Felder VORSCHLAG

**Akzeptanzkriterien:**

- Eine Person kann null bis mehrere Accounts besitzen.
- Jeder Account besitzt mindestens Plattform, Benutzername beziehungsweise Handle, optionale URL und Sichtbarkeit beziehungsweise Account-Typ.
- Ein Account gehört in V1 genau einer Person.
- Doppelte Accounts derselben Plattform und desselben Handles werden verhindert oder deutlich gewarnt.

### SOC-002 – eine Quelle der Wahrheit

**Status:** VORSCHLAG  
Das aktuelle Notion-Modell enthält sowohl eine direkte URL an `Person` als auch eine Relation zur Account-Datenbank. In der Anwendung soll nur das strukturierte Account-Modell verwendet werden.

---

## 6.3 Beziehungen

### REL-001 – Beziehung zwischen zwei Personen

**Status:** BESTÄTIGT  
**Priorität:** High

**Akzeptanzkriterien:**

- Eine Beziehung verbindet in V1 exakt zwei unterschiedliche Personen.
- Eine Person kann nicht mit sich selbst verbunden werden.
- Pro Personenpaar kann entweder genau eine aktive Beziehung existieren oder mehrere historische Versionen; die gewählte Regel muss im Datenmodell eindeutig sein.
- Die Beziehung besitzt mindestens Typ, Startdatum und optionales Enddatum.
- Unterstützte Anfangstypen umfassen mindestens Freundschaft, enge Freundschaft, romantische Beziehung, Familie und Bekanntschaft.
- Beziehungstypen werden nicht als unveränderliche Code-Konstanten vorausgesetzt, sofern spätere Erweiterbarkeit gewünscht ist.

### REL-002 – Änderung des Beziehungstyps über Zeit

**Status:** BESTÄTIGT aus der alten Anforderung, im aktuellen Datenmodell NICHT ABGEBILDET

**Akzeptanzkriterien:**

- Änderungen des Beziehungstyps überschreiben nicht die Historie.
- Jede Änderung besitzt einen Gültigkeitsbeginn und optional ein Gültigkeitsende.
- Für einen Zeitpunkt darf höchstens ein aktiver Typ je Beziehung gelten, sofern Mehrfachtypen nicht ausdrücklich erlaubt werden.
- Das Personenprofil und der Graph können den aktuellen Typ bestimmen.
- Historische Typen können chronologisch angezeigt werden.

### REL-003 – Beziehungstagebuch / Log-Einträge

**Status:** BESTÄTIGT, genaue UX OFFEN

**Akzeptanzkriterien:**

- Nutzer können datierte Log-Einträge zu einer Beziehung erfassen.
- Ein Log-Eintrag enthält mindestens Datum, Titel oder Kurzbeschreibung und optional ausführliche Notizen.
- Einträge werden chronologisch angezeigt.
- Das Bearbeiten oder Löschen eines Eintrags verändert nicht unbemerkt andere historische Daten.

### REL-004 – Beziehungsaktivität beziehungsweise „Temperatur“

**Status:** BESTÄTIGTE Produktidee, Berechnungslogik OFFEN

Die Connection Map soll eine dynamische Aktivität beziehungsweise Temperatur anzeigen. Interaktionen erhöhen, verstrichene Zeit reduziert den Wert.

**Vorgeschlagenes Modell:**

- Temperatur wird berechnet und nicht als alleinige manuell gepflegte Wahrheit gespeichert.
- Relevante Ereignisse besitzen einen Gewichtungswert.
- Zeitverfall folgt einer dokumentierten Funktion.
- Der Wert ist reproduzierbar und durch Tests abgesichert.
- UI zeigt mindestens abgestufte Zustände oder einen numerischen Wert.

**Nicht ohne Entscheidung implementieren:** Gewichtungen, Zeitkonstante, Minimal-/Maximalwert und Einfluss manueller Korrekturen.

---

## 6.4 Ereignisse

### EVT-001 – Ereignisse verwalten

**Status:** BESTÄTIGT durch das Notion-Datenmodell  
**Priorität:** High

**Akzeptanzkriterien:**

- Ereignisse können angelegt, bearbeitet und gelöscht werden.
- Ein Ereignis besitzt mindestens Name, Datum und einen Typ.
- Optional sind Ort, Notiz und mehrere beteiligte Personen möglich.
- Anfangstypen umfassen mindestens Urlaub, Party, Konzert/Festival, Convention und einen generischen Typ.
- Intime oder besonders sensible Typen werden im UI und bei Freigaben besonders geschützt.
- Ereignisse erscheinen in den Profilen aller beteiligten Personen.

### EVT-002 – Beziehung zuordnen oder ableiten

**Status:** OFFEN

Das Notion-Modell verknüpft Ereignisse mit Personen, nicht direkt mit Beziehungen. Für Beziehungslogik und Temperatur muss entschieden werden:

- Wird ein Ereignis einer konkreten Beziehung zugeordnet?
- Oder werden bei mehreren beteiligten Personen automatisch alle Personenpaare beeinflusst?
- Wie werden Gruppenereignisse behandelt?

### EVT-003 – KI-Notiz

**Status:** OFFEN  
Das Feld `AI Note` existiert im Notion-Modell; eine fachliche KI-Anforderung ist jedoch nicht beschrieben.

Bis zur Klärung darf das Feld als normale optionale Notiz übernommen werden, aber es soll keine externe KI-Verarbeitung sensibler Daten aktiviert werden.

---

## 6.5 Hauptgraph / Connection Map

### GRF-001 – Netzwerk visualisieren

**Status:** BESTÄTIGT  
**Priorität:** High

**Akzeptanzkriterien:**

- Jede Person wird als Node dargestellt.
- Nodes zeigen mindestens Name und, sofern vorhanden, Profilbild.
- Jede Beziehung wird als Edge zwischen genau zwei Nodes dargestellt.
- Edge-Farbe oder ein gleichwertiges visuelles Merkmal zeigt den aktuellen Beziehungstyp.
- Eine Legende erklärt Farben und Symbole.
- Graph unterstützt Zoom, Verschieben und Auswahl.
- Die Darstellung bleibt bei fehlenden Bildern, langen Namen und isolierten Personen funktionsfähig.
- Auswahl einer Person öffnet deren fokussierte Ansicht oder Profil gemäß eindeutigem Interaktionskonzept.

### GRF-002 – fokussierte Einzelpersonenansicht

**Status:** BESTÄTIGT  
**Priorität:** High

Beim Anklicken einer Person wird auf diese Person zentriert und deren Vernetzung hervorgehoben.

**Akzeptanzkriterien:**

- Die gewählte Person wird zentriert und visuell hervorgehoben.
- Mindestens alle direkten Beziehungen der Person werden angezeigt.
- Nicht relevante Nodes werden ausgeblendet oder visuell deutlich zurückgenommen.
- Beziehungstypen sind visuell erkennbar.
- Durch Auswahl einer verbundenen Person wechselt der Fokus ohne vollständigen Seitenneustart.
- Browser-Zurück beziehungsweise eine sichtbare Zurück-Aktion stellt den vorherigen Kontext wieder her.
- Die Auswahl ist per Maus, Touch und Tastatur bedienbar.

### GRF-003 – chronologische Informationen an einer Edge

**Status:** BESTÄTIGTE Idee, Darstellungsform OFFEN

**Akzeptanzkriterien:**

- Eine Beziehung kann historische Typänderungen und relevante Ereignisse anzeigen.
- Die Standardansicht bleibt trotz Historie lesbar.
- Detailinformationen werden über Auswahl, Tooltip, Seitenpanel oder Timeline geöffnet.
- Die Reihenfolge ist chronologisch und eindeutig datiert.
- Mehrere Änderungen am selben Tag werden stabil sortiert.

### GRF-004 – neue Vernetzungen hervorheben

**Status:** NICE TO HAVE

- Eine konfigurierbare Definition legt fest, was „neu“ bedeutet.
- Neue Beziehungen können visuell hervorgehoben werden, ohne die Farbcodierung des Beziehungstyps unverständlich zu machen.

### GRF-005 – Performance

**Status:** OFFEN, Zielwerte vorgeschlagen

**Vorschlag für V1:**

- 500 Nodes und die zugehörigen Edges sollen auf einem aktuellen Desktop-Browser interaktiv bedienbar bleiben.
- Auswahl und Fokuswechsel sollen nach Abschluss des initialen Ladens typischerweise innerhalb von 200 ms reagieren.
- Für größere Datenmengen sind Clustering, reduzierte Details oder serverseitige Filterung vorzusehen.

---

## 6.6 Kartenansicht

### MAP-001 – geografische Übersicht

**Status:** BESTÄTIGTE Feature-Idee  
**Priorität:** Medium

**Akzeptanzkriterien:**

- Nutzer können eine Kartenansicht öffnen.
- Die Karte unterstützt Zoom und Verschieben.
- Einträge können international und lokal dargestellt werden.
- Auswahl eines Markers zeigt mindestens Name, Bild und einen Link zum Profil beziehungsweise Ereignis.
- Die Karte zeigt keine präziseren Daten, als im Datensatz gespeichert und für den aktuellen Nutzer freigegeben sind.

### MAP-002 – Datenquelle der Marker

**Status:** OFFEN

Zu entscheiden ist, ob die Karte primär zeigt:

1. den aktuellen Wohn- beziehungsweise Aufenthaltsort einer Person,
2. Orte gemeinsamer Ereignisse,
3. beide Kategorien mit unterscheidbaren Layern.

**Vorschlag:** getrennte, ein- und ausschaltbare Layer für `Personen` und `Ereignisse`.

### MAP-003 – Clusterung

**Status:** VORSCHLAG als Antwort auf die Notion-Challenge

**Akzeptanzkriterien:**

- Räumlich nahe Marker werden abhängig von der Zoomstufe geclustert.
- Cluster zeigen die Anzahl enthaltener Einträge.
- Auswahl eines Clusters zoomt hinein oder öffnet eine Liste.
- Überlappende Marker bleiben erreichbar.

### MAP-004 – Datenschutz bei Standortdaten

**Status:** VORSCHLAG, sicherheitskritisch

- Exakte Privatadressen werden nicht benötigt und sollen nicht als Standard gespeichert werden.
- Für Personen genügt standardmäßig Stadt/Region beziehungsweise eine grobe Koordinate.
- Export und Gastfreigabe können Standortdaten ausblenden oder vergröbern.

---

## 6.7 Vernetzungs-Finder

### FIND-001 – gemeinsame Verbindungspunkte

**Status:** BESTÄTIGTE Feature-Idee  
**Priorität:** Low

Der Nutzer wählt zwei Personen und erhält die Überschneidungen ihrer Graphen.

**Vorgeschlagene V1-Definition:** gemeinsame direkte Kontakte.

**Akzeptanzkriterien:**

- Zwei unterschiedliche Personen können ausgewählt werden.
- Die Anwendung zeigt alle Personen, die mit beiden ausgewählten Personen direkt verbunden sind.
- Ergebnisse enthalten mindestens Name, Profilbild und die beiden relevanten Beziehungstypen.
- Bei keinem Treffer wird ein verständlicher Leerzustand angezeigt.
- Die Berechnung liefert keine Personen außerhalb des berechtigten Datenraums.

### FIND-002 – Pfadsuche

**Status:** OFFEN / spätere Ausbaustufe

Optional kann der Finder zusätzlich kürzeste Verbindungspfade zwischen zwei Personen anzeigen. Maximale Pfadlänge, Mehrfachpfade und Gewichtung sind vor Umsetzung festzulegen.

---

## 6.8 Dark-/Light-Mode

### THEME-001 – Theme wechseln

**Status:** BESTÄTIGT  
**Priorität:** Low

**Akzeptanzkriterien:**

- Nutzer können zwischen hellem und dunklem Theme wechseln.
- Die Auswahl gilt für alle Ansichten einschließlich Graph und Karte.
- Text, Controls, Nodes, Edges, Marker, Dialoge und Fokuszustände erfüllen ausreichende Kontraste.
- Die Auswahl wird lokal oder im Benutzerprofil persistiert.
- Beim ersten Besuch kann die Systemeinstellung verwendet werden.
- Ein manueller Wechsel überschreibt die automatische Systemeinstellung, bis der Nutzer wieder „System“ auswählt.

**Vorschlag:** drei Werte `System`, `Light`, `Dark` statt nur eines booleschen Schalters.

---

## 6.9 Responsive und mobile Nutzung

### UX-001 – mobile Erreichbarkeit

**Status:** BESTÄTIGT

**Akzeptanzkriterien:**

- Kernfunktionen sind auf Smartphone, Tablet und Desktop erreichbar.
- Graph und Karte unterstützen Touch-Gesten, ohne normales Seitenscrollen dauerhaft zu blockieren.
- Detailinformationen sind nicht ausschließlich über Hover erreichbar.
- Dialoge und Seitenpanels passen sich kleinen Displays an.
- Wichtige Aktionen besitzen ausreichend große Touch-Ziele.

### UX-002 – Barrierearme Interaktion

**Status:** VORSCHLAG

- Alle Kernaktionen sind per Tastatur erreichbar.
- Fokuszustände sind sichtbar.
- Farbcodierung wird durch Text, Muster oder Icons ergänzt.
- Profilbilder besitzen geeignete Alternativtexte.

---

## 7. Konsolidiertes Datenmodell

Das aktuelle Notion-Modell ist ein wertvoller Prototyp, reicht jedoch für die beschriebenen Anforderungen nicht vollständig aus.

## 7.1 Empfohlene Entitäten

### User oder Workspace

- `Id`
- `Name`
- `CreatedAt`
- optionale Theme-Einstellung

### Person

- `Id`
- `WorkspaceId` beziehungsweise `OwnerId`
- `Name`
- `DateOfBirth` optional
- `Gender` optional und erweiterbar
- `Notes` optional
- `ProfileImage` optional
- `LocationId` optional
- `CreatedAt`
- `UpdatedAt`

### SocialAccount

- `Id`
- `PersonId`
- `Platform`
- `Handle`
- `Url` optional
- `AccountType` beziehungsweise `Visibility` optional

### Relationship

- `Id`
- `WorkspaceId`
- `PersonAId`
- `PersonBId`
- `StartedAt` optional
- `EndedAt` optional
- `CreatedAt`
- `UpdatedAt`

**Constraints:**

- `PersonAId != PersonBId`
- kanonische Sortierung oder Unique-Constraint verhindert doppelte aktive Paare

### RelationshipTypeHistory

- `Id`
- `RelationshipId`
- `TypeId` beziehungsweise `Type`
- `ValidFrom`
- `ValidTo` optional
- `Note` optional

### RelationshipLog

- `Id`
- `RelationshipId`
- `OccurredAt`
- `Title`
- `Note` optional
- `Weight` optional, falls für Temperatur relevant

### Event

- `Id`
- `WorkspaceId`
- `Name`
- `OccurredAt`
- `TypeId` beziehungsweise `Type`
- `LocationId` optional
- `Note` optional
- `AiNote` optional, bis KI-Scope geklärt ist nur Textfeld
- `Sensitivity` optional

### EventParticipant

- `EventId`
- `PersonId`
- optionale Rolle

### EventRelationship

**Nur erforderlich, wenn Ereignisse explizit Beziehungen zugeordnet werden.**

- `EventId`
- `RelationshipId`

### Location

- `Id`
- `DisplayName`
- `City` optional
- `Region` optional
- `Country` optional
- `Latitude` optional
- `Longitude` optional
- `Precision` beziehungsweise Genauigkeitsstufe

### ShareGrant

**Nur bei bestätigtem Gastzugriff.**

- `Id`
- `WorkspaceId`
- Token-Hash
- Ablaufdatum
- Widerrufsdatum
- Freigabeumfang

## 7.2 Datenmodellregeln

- Alle Fachdaten müssen dem Eigentümer beziehungsweise Workspace zugeordnet sein.
- Alterswerte werden berechnet.
- Social Accounts werden nicht zusätzlich als unstrukturierte URL an `Person` gespeichert.
- Beziehungshistorie darf nicht durch Änderung des aktuellen Typs verloren gehen.
- Standortpräzision muss explizit bekannt sein.
- Löschverhalten ist über Foreign Keys und Domainregeln festzulegen.
- Zeitstempel werden intern konsistent gespeichert, vorzugsweise UTC; reine Kalendertage bleiben Datumswerte ohne künstliche Uhrzeit.

---

## 8. API- und Anwendungslogik

Die genaue technische Architektur ist im Repository zu prüfen. Unabhängig vom Framework gelten folgende Anforderungen:

### API-001 – Ressourcen

Die Anwendung benötigt fachlich mindestens Operationen für:

- Personen
- Social Accounts
- Beziehungen
- Beziehungshistorie und Logs
- Ereignisse und Teilnehmer
- Graphdaten
- Kartenmarker
- Vernetzungs-Finder
- Authentifizierung und gegebenenfalls Freigaben

### API-002 – Graph-Endpunkte

**Vorschlag:**

- Gesamter Graph mit Filterparametern
- fokussierter Graph für eine Person mit konfigurierbarer Tiefe
- Beziehungsdetails inklusive Historie
- gemeinsame Kontakte zweier Personen

### API-003 – Validierung

- Server-seitige Validierung ist verbindlich; Clientvalidierung allein genügt nicht.
- Ungültige Personenpaare, überlappende Typzeiträume und fremde Workspace-IDs werden abgelehnt.
- Fehlerantworten enthalten keine sensiblen internen Details.

### API-004 – Pagination und Filter

- Listenendpunkte unterstützen Pagination oder einen gleichwertigen Begrenzungsmechanismus.
- Suche und Filter werden nicht ausschließlich clientseitig auf bereits vollständig geladenen Daten ausgeführt, sobald Datenmengen wachsen.

---

## 9. Nichtfunktionale Anforderungen

### NFR-001 – Sicherheit und Datenschutz

- Zugriffskontrolle gilt auf jeder Datenabfrage.
- Schutz gegen übliche Webrisiken wie XSS, CSRF, Injection und unsichere Datei-Uploads.
- Uploads werden auf Typ und Größe validiert.
- Logs enthalten keine Passwörter, Tokens, intimen Notizen oder vollständigen personenbezogenen Datensätze.
- Produktionsbetrieb ausschließlich über HTTPS.
- Backup- und Wiederherstellungsverfahren werden dokumentiert.

### NFR-002 – Performance

- Personenlisten und Profile sollen unter normalen Bedingungen ohne wahrnehmbare Verzögerung reagieren.
- Große Graphdaten werden nicht unnötig mehrfach übertragen.
- Bilder werden in angemessenen Größen und Formaten ausgeliefert.
- Graphberechnung und Finder-Algorithmen besitzen Tests mit realistischen Datenmengen.

### NFR-003 – Zuverlässigkeit

- Datenänderungen sind transaktional, wenn mehrere Entitäten betroffen sind.
- Fehlgeschlagene Änderungen hinterlassen keine halbfertigen Beziehungen oder Ereignisse.
- Migrationen sind reproduzierbar und versioniert.

### NFR-004 – Wartbarkeit

- Fachlogik ist von UI und Persistenz getrennt.
- Graph- und Temperaturberechnungen sind in isoliert testbaren Services untergebracht.
- Öffentliche Schnittstellen und komplexe Regeln werden dokumentiert.
- Keine duplizierten fachlichen Konstanten in Frontend und Backend ohne gemeinsame Quelle.

### NFR-005 – Beobachtbarkeit

- Strukturierte Logs für technische Fehler und relevante administrative Aktionen.
- Korrelation von Frontend-/API-Fehlern, ohne sensible Inhalte zu protokollieren.
- Health-Check für Anwendung und Datenbank.

---

## 10. Testanforderungen

### 10.1 Unit-Tests

Mindestens zu testen:

- Altersberechnung
- Validierung von Personenpaaren
- Bestimmung des aktuellen Beziehungstyps
- Verhinderung überlappender Beziehungstyp-Zeiträume
- Temperaturberechnung nach Festlegung der Formel
- gemeinsame Kontakte zweier Personen
- Kartenclusterung beziehungsweise Datenaufbereitung
- Zugriffs- und Workspace-Filter

### 10.2 Integrationstests

Mindestens zu testen:

- CRUD für Person, Beziehung und Ereignis
- transaktionales Löschen beziehungsweise Schutz vor ungültigem Löschen
- Authentifizierung und nicht autorisierte API-Zugriffe
- Graphdaten aus realistischen relationalen Testdaten
- Migrationen auf einer leeren und einer bestehenden Datenbank

### 10.3 Playwright-End-to-End-Tests

Mindestens folgende Flows:

1. Anmeldung und Zugriffsschutz
2. Person anlegen und Profil öffnen
3. zweite Person anlegen und Beziehung erstellen
4. Beziehung im Hauptgraph sehen
5. Person im Graph auswählen und fokussierte Ansicht prüfen
6. Beziehungstyp ändern und Historie prüfen
7. Ereignis mit zwei Personen anlegen und in beiden Profilen sehen
8. Suche und Filter in der Personenliste
9. Kartenansicht mit Clustering, sobald umgesetzt
10. Theme wechseln und Persistenz prüfen
11. Responsive Kernflüsse mit mindestens einer Smartphone-Viewport-Größe

### 10.4 Testdaten

- Ausschließlich synthetische Personen und Inhalte.
- Keine echten privaten Notion-Daten in Fixtures, Screenshots oder CI-Artefakten.
- Datensätze sollen isolierte Personen, Zyklen, Gruppenereignisse, fehlende Bilder und lange Texte enthalten.

---

## 11. Definition of Done

Eine Anforderung gilt erst als abgeschlossen, wenn:

- Akzeptanzkriterien erfüllt sind,
- Build und statische Prüfungen erfolgreich sind,
- relevante Unit- und Integrationstests vorhanden und grün sind,
- kritische UI-Flows per Playwright geprüft wurden,
- Datenbankmigrationen erstellt und getestet wurden,
- Sicherheits- und Berechtigungsprüfung erfolgt ist,
- responsive Darstellung geprüft wurde,
- Dokumentation und Beispielkonfiguration aktualisiert wurden,
- Änderungen in nachvollziehbaren Commits vorliegen,
- keine bekannten Blocker oder undokumentierten Annahmen verbleiben.

---

## 12. Erkannte Widersprüche und Lücken

### C-001 – „secure“ versus „ein Passwort reicht“

Die alte Anforderung verlangt Sicherheit, schlägt aber gleichzeitig nur ein einfaches Passwort vor. Für die gespeicherten Daten ist ein ungeschütztes gemeinsames Passwort ohne Nutzer-, Sitzungs- und Schutzkonzept nicht ausreichend.

**Empfehlung:** normale Authentifizierung mit sicherer Passwortspeicherung; V1 kann trotzdem nur einen Eigentümer-Account besitzen.

### C-002 – Beziehungshistorie fehlt im Modell

Gefordert sind Typänderungen über Zeit und chronologische Informationen an Graph-Edges. Die aktuelle `Relation` besitzt nur einen Typ und ein Startdatum.

**Empfehlung:** `Relationship` plus `RelationshipTypeHistory` und `RelationshipLog`.

### C-003 – Temperatur ist nicht berechenbar

Die alte Graphanforderung beschreibt steigende Temperatur durch Interaktionen und sinkende Temperatur durch Zeit. Das aktuelle Modell definiert weder relevante Interaktionen noch Gewichtungen oder Zerfallsfunktion.

**Empfehlung:** erst fachliche Formel festlegen, dann als deterministischen Domain-Service implementieren.

### C-004 – Standortbedeutung ist unklar

`Person` besitzt einen Ort, `Event` besitzt ebenfalls einen Ort. Die Map-View sagt nur, wo „Vernetzungen“ bestehen.

**Empfehlung:** getrennte Kartenlayer für Personen und Ereignisse.

### C-005 – Instagram doppelt modelliert

`Person` besitzt eine direkte Instagram-URL und zugleich eine Relation zu einer Account-Datenbank.

**Empfehlung:** ausschließlich strukturierte `SocialAccount`-Entitäten.

### C-006 – Alter doppelt modelliert

Geburtsdatum und manuelles Alter können auseinanderlaufen.

**Empfehlung:** Alter nur berechnen.

### C-007 – Relation kann möglicherweise mehr als zwei Personen enthalten

Die Notion-Relation `People` besitzt keine erkennbare Begrenzung auf zwei Einträge. Der Graph und das Konzept einer Beziehungskante setzen jedoch ein Paar voraus.

**Empfehlung:** V1 exakt zwei Personen je Beziehung; Gruppen werden über Ereignisse modelliert.

### C-008 – Gastzugriff versus sensible Daten

Teilbarkeit steht im Konflikt mit intimen Ereignissen, Notizen und privaten Accounts.

**Empfehlung:** nicht Teil des ersten MVP oder nur mit feldbasiertem Freigabeumfang und sicherem, widerrufbarem Token.

### C-009 – KI-Feld ohne KI-Anforderung

Das Event-Modell besitzt `AI Note`, aber es gibt keine spezifizierte Datenübertragung, Einwilligung, Anbieterwahl oder fachliche Funktion.

**Empfehlung:** keine KI-Verarbeitung im MVP; Feld höchstens als normale Notiz behandeln.

### C-010 – Graph-Historie versus klare Standardansicht

Eine einzelne Edge soll Typ, Änderungen und Ereignisse chronologisch zeigen. Eine dauerhaft mehrfach segmentierte oder mehrfarbige Kante kann den Graph unlesbar machen.

**Empfehlung:** aktueller Typ bestimmt die Standardkante; Historie erscheint in einem Detailpanel oder einer Timeline.

### C-011 – mobile Nutzung versus komplexe Graphinteraktion

Mobile Erreichbarkeit ist gefordert, konkrete Touch-Interaktionen fehlen.

**Empfehlung:** Touch-Zoom, Drag, Tap-Auswahl, Bottom-Sheet für Details und keine Hover-only-Funktionen.

### C-012 – Notion als Prototyp oder produktive Datenquelle

Die Notion-Datenbanken beschreiben das Fachmodell, aber es ist nicht festgelegt, ob Notion langfristig die produktive Datenquelle, ein Importkanal oder nur die Spezifikation ist.

**Empfehlung:** produktive Anwendung mit eigener Datenbank; optionaler Notion-Import erst später. Direkter Notion-Betrieb würde Performance, Historie, Validierung und Sicherheit unnötig einschränken.

---

## 13. Offene Fragen an den Product Owner

Diese Entscheidungen sollten beantwortet werden, bevor der Coding-Agent den jeweiligen Bereich implementiert.

### Höchste Priorität

1. **Nutzerkonzept:** Ist RelaTable in V1 ausschließlich für dich als einen globalen Nutzer gedacht, oder sollen mehrere Nutzer jeweils vollständig getrennte Datenbestände besitzen?
2. **Datenquelle:** Soll die Anwendung eine eigene Datenbank verwenden und Notion nur als Anforderungs-/Importquelle dienen, oder sollen Personen und Beziehungen weiterhin direkt aus Notion gelesen und dorthin geschrieben werden?
3. **Beziehungen:** Soll zwischen zwei Personen immer genau eine Beziehung mit Historie existieren, oder dürfen parallel mehrere Beziehungen beziehungsweise Kategorien bestehen?
4. **Historie:** Soll eine Typänderung die bestehende Beziehung fortsetzen oder eine neue Beziehungsversion erzeugen?
5. **Ereignisse:** Werden Ereignisse direkt einer Beziehung zugeordnet, oder nur Personen? Wie soll ein Ereignis mit drei oder mehr Personen die Beziehungstemperatur beeinflussen?
6. **Temperatur:** Welche Aktionen erhöhen die Temperatur, wie stark, und wie schnell soll sie ohne neue Interaktion sinken?
7. **Graph-Scope:** Zeigt die fokussierte Ansicht nur direkte Kontakte oder zusätzlich Kontakte zweiten Grades?
8. **Graph-Interaktion:** Soll ein Klick zuerst fokussieren, das Profil öffnen oder über ein kleines Menü beide Optionen anbieten?

### Mittlere Priorität

9. **Kartenansicht:** Sollen Wohnorte von Personen, Orte gemeinsamer Ereignisse oder beide als getrennte Layer angezeigt werden?
10. **Standortgenauigkeit:** Reicht Stadt/Region oder sollen exakte Koordinaten unterstützt werden?
11. **Gastzugriff:** Gehört ein lesender Share-Link bereits zum MVP oder erst in eine spätere Phase?
12. **Sensible Felder:** Welche Felder dürfen bei einer Freigabe niemals sichtbar sein?
13. **Vernetzungs-Finder:** Reichen gemeinsame direkte Kontakte oder soll auch der kürzeste Pfad zwischen zwei Personen gefunden werden?
14. **Dark Mode:** Soll der Standard der Systemeinstellung folgen und zusätzlich manuell überschreibbar sein?

### Technische Bestätigung

15. **Bestehender Stack:** Soll der bekannte Ansatz mit Blazor WebAssembly, ASP.NET Core, PWA und Cytoscape.js beibehalten werden, sofern das Repository diesen Stand bestätigt?
16. **Deployment:** Wo soll RelaTable betrieben werden – eigener VPS/Docker, lokaler Server oder Cloud-Hosting?
17. **Bilder:** Sollen Profilbilder in der Anwendung gespeichert, aus Notion importiert oder nur über externe URLs referenziert werden?
18. **KI:** Ist `AI Note` ein echtes geplantes Feature? Falls ja: Welche konkrete Funktion soll KI übernehmen und dürfen sensible Inhalte einen externen Dienst verlassen?
19. **Geschlecht:** Wird dieses Feld benötigt, und sollen die Auswahlwerte frei beziehungsweise inklusiv konfigurierbar sein?
20. **Import:** Müssen vorhandene Datensätze aus der Notion-`Cosplay Relations DB` oder den neuen Testdatenbanken migriert werden?

---

## 14. Vorläufige Entscheidungen für einen umsetzbaren MVP

Falls keine gegenteilige Antwort vorliegt, sollte der Coding-Agent **nicht automatisch implementieren**, kann aber mit folgenden Annahmen planen:

- ein globaler Eigentümer-Account,
- eigene relationale Anwendungsdatenbank,
- Notion ist Spezifikations- und optionale spätere Importquelle,
- exakt zwei Personen pro Beziehung,
- eine fortlaufende Beziehung mit separater Typ- und Log-Historie,
- Hauptgraph zeigt aktuellen Typ; Historie im Detailpanel,
- fokussierter Graph zeigt direkte Kontakte,
- Karte besitzt getrennte Layer für Personen und Ereignisse,
- Standort standardmäßig auf Stadt-/Regionsniveau,
- kein Gastzugriff und keine externe KI im ersten MVP,
- Theme-Auswahl `System`, `Light`, `Dark`,
- synthetische Testdaten und vollständige Zugriffskontrolle.

---

## 15. Empfohlene erste Arbeitspakete für Claude Code / Codex CLI

### Paket A – Repository- und Architekturprüfung

- aktuellen Stack und Build dokumentieren,
- bestehende Funktionen und technische Schulden erfassen,
- Test- und CI-Status prüfen,
- Abweichungen zu diesem Dokument als Entscheidungsliste festhalten.

### Paket B – Domainmodell und Migrationen

- Entitäten und Constraints implementieren,
- Beziehungshistorie ergänzen,
- redundante Felder vermeiden,
- Seed-Daten ausschließlich synthetisch erstellen,
- Migrationen und Integrationstests ergänzen.

### Paket C – Personen und Beziehungen

- Personenliste, Suche und Filter,
- Profilseite,
- Personen-CRUD,
- Beziehungserstellung und Typ-Historie,
- Ereignisse und Teilnehmer.

### Paket D – Graph

- Graph-DTO beziehungsweise Graph-API,
- Hauptansicht,
- fokussierte Ansicht,
- Edge-Legende und Detailpanel,
- Touch- und Tastaturinteraktion,
- Performance-Tests.

### Paket E – Sicherheit und Qualität

- Authentifizierung,
- Autorisierung beziehungsweise Workspace-Filter,
- sichere Konfiguration,
- Playwright-Kernflüsse,
- CI und Deployment-Dokumentation.

### Paket F – spätere Features

- Kartenansicht,
- Temperaturmodell,
- Vernetzungs-Finder,
- Theme,
- Gastzugriff,
- optionaler Notion-Import und KI-Funktionen.

---

## 16. Quellenlinks aus Notion

- RelaTable: https://app.notion.com/p/a55d8ab4d8f9414f8fdfd0f72d3c81bd
- Feature-Datenbank: https://app.notion.com/p/30c2eff17a428099b7dbc1389f337e94
- Alte Anforderungen: https://app.notion.com/p/c3c94dd01d6a47368d5198418bc12576
- Datenbank Struktur: https://app.notion.com/p/30c2eff17a428065bd2cf3622659775e
- Graph Individual View: https://app.notion.com/p/30c2eff17a4280b1af60f47f24f830d1
- Map-View: https://app.notion.com/p/30c2eff17a42806593c7d9f1da7a29ed
- Vernetzungs Finder: https://app.notion.com/p/3102eff17a4280bb9f49e228edff4ed3
- Dark/Light Mode: https://app.notion.com/p/30c2eff17a4280baab8af5ccf85938f4
- Mockup – Graph: https://app.notion.com/p/30c2eff17a428082aa28f2eef1b1e1fa
- VS-Code Project Structure: https://app.notion.com/p/30c2eff17a4280239f94cee3671eab77
- Person-Datenbank: https://app.notion.com/p/30c2eff17a4280278b89fe4edb0f8274
- Relation-Datenbank: https://app.notion.com/p/30c2eff17a4280c0ae71d0f630876dbe
- Event-Datenbank: https://app.notion.com/p/30c2eff17a4280fc872fff61ff48238b
- Instagram-Account-Datenbank: https://app.notion.com/p/30c2eff17a428019a947cad8fa5b1253
