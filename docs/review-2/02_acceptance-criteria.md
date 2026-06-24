# 2. Akzeptanzkriterien (Given / When / Then)

> ↩ [Index](README.md) · `AC-xxx` je Feature. Testbar formuliert; keine vagen Begriffe. Verknüpft mit Tests in [04_testmatrix.md](04_testmatrix.md).

## EPIC-001 — Basis & Auth

**FEAT-001 First-Run-Setup**
- **AC-001** *Given* keine `AppUser` existiert, *When* die App geöffnet wird, *Then* erfolgt Weiterleitung auf `/setup`.
- **AC-002** *Given* ein `AppUser` existiert, *When* `/setup` aufgerufen wird, *Then* Redirect auf `/login`; kein zweiter Account anlegbar.
- **AC-003** *Given* Setup-Formular, *When* Passwort die Mindeststärke nicht erfüllt oder Wiederholung abweicht, *Then* Speichern blockiert mit Inline-Fehler.

**FEAT-002/003 Login & Session**
- **AC-010** *Given* nicht angemeldet, *When* eine geschützte Route oder API aufgerufen wird, *Then* HTTP 401/Redirect `/login`, keine Fachdaten im Response.
- **AC-011** *Given* gültiges Passwort, *When* Login, *Then* HttpOnly-Secure-Session-Cookie gesetzt und Redirect auf gemerkte Zielroute.
- **AC-012** *Given* falsches Passwort, *When* mehrfacher Login, *Then* generische Fehlermeldung + Rate-Limit/Verzögerung greift.
- **AC-013** *Given* abgelaufene/ widerrufene Session, *When* Anfrage, *Then* Zugriff verweigert.

**FEAT-004 Persistenz/Health**
- **AC-014** *Given* Daten existieren, *When* der Container neu startet, *Then* alle Daten bleiben erhalten.
- **AC-015** *Given* laufende App, *When* `/health` aufgerufen wird, *Then* Status der App und DB wird zurückgegeben.

## EPIC-002 — Personen & Accounts

**FEAT-010/011 Liste, Suche, Filter**
- **AC-020** *Given* Personen existieren, *When* die Liste geöffnet wird, *Then* je Eintrag Bild, Name und ein Kontextwert (Ort/Beziehungskategorie).
- **AC-021** *Given* Suchbegriff, *When* eingegeben, *Then* serverseitig nach Name gefilterte Ergebnisse.
- **AC-022** *Given* Filter Ort/Beziehungstyp, *When* gesetzt, *Then* nur passende Personen; kombinierbar.
- **AC-023** *Given* kein Treffer, *When* Suche/Filter, *Then* verständlicher Leerzustand.

**FEAT-013 CRUD**
- **AC-024** *Given* Anlageformular, *When* Name leer, *Then* Speichern blockiert.
- **AC-025** *Given* Person mit Beziehungen/Ereignissen, *When* Löschen ausgelöst, *Then* Dialog zeigt betroffene Abhängigkeiten und verlangt explizite Bestätigung.
- **AC-026** *Given* Löschung bestätigt, *When* ausgeführt, *Then* keine verwaisten Referenzen verbleiben.

**FEAT-014 Alter**
- **AC-027** *Given* Geburtsdatum gesetzt, *When* Profil angezeigt, *Then* Alter wird aus Datum + heute berechnet; keine editierbare Altersangabe.
- **AC-028** *Given* kein Geburtsdatum, *When* Profil, *Then* kein Alter angezeigt.

**FEAT-015 Profilbild**
- **AC-029** *Given* lokaler Upload, *When* Datei falschen Typs/zu groß, *Then* Ablehnung mit Hinweis, kein Upload.
- **AC-030** *Given* externe URL, *When* sie nicht `https` ist oder nicht lädt, *Then* Fehlerhinweis + neutraler Platzhalter; Speichern bleibt möglich.
- **AC-031** *Given* gültige HTTPS-Bild-URL, *When* eingegeben, *Then* Vorschau erscheint und `ProfileImageUrl` wird gespeichert.

**FEAT-016 Social Accounts**
- **AC-032** *Given* Person, *When* Account mit Plattform+Handle hinzugefügt, *Then* erscheint im Profil.
- **AC-033** *Given* gleicher Plattform+Handle existiert, *When* erneut angelegt, *Then* Duplikatwarnung.

## EPIC-003 — Connections & Typen (siehe [Regeln 07](../review-1/07_beziehungsregeln.md))

**FEAT-020 Connection**
- **AC-040** *Given* zwei verschiedene Personen ohne bestehende Connection, *When* erstellt, *Then* genau eine Connection (kanonisch) entsteht.
- **AC-041** *Given* eine Person, *When* Verbindung mit sich selbst versucht, *Then* blockiert.
- **AC-042** *Given* Paar A–B existiert, *When* B–A erstellt werden soll, *Then* verhindert + Hinweis/Sprung zur bestehenden.

**FEAT-021/022 Nähegrad**
- **AC-043** *Given* Connection ohne Romantik, *When* Nähegrad gesetzt, *Then* genau ein aktiver Nähegrad-Period.
- **AC-044** *Given* aktiver Nähegrad, *When* hoch-/herabgestuft, *Then* alter Period endet zum Stichtag, neuer beginnt; Historie bleibt.
- **AC-045** *Given* aktive Romantik, *When* Nähegrad gesetzt werden soll, *Then* blockiert mit Erklärung (E-NG-ROM).

**FEAT-023 Freundschaft Plus**
- **AC-046** *Given* aktiver Nähegrad, *When* Freundschaft Plus begonnen, *Then* parallel aktiv (kein Konflikt).
- **AC-047** *Given* aktive Romantik, *When* Freundschaft Plus begonnen werden soll, *Then* blockiert (E-FP-ROM).

**FEAT-024 Romantik beginnen**
- **AC-048** *Given* aktiver Nähegrad und/oder Freundschaft Plus, *When* Romantik beginnt, *Then* diese Perioden enden zum Startdatum; Vorschau hat dies vorab angezeigt.
- **AC-049** *Given* parallele Kontexte (Cosplay/Business), *When* Romantik beginnt, *Then* bleiben unberührt.

**FEAT-025 Romantik beenden**
- **AC-050** *Given* Beenden-Dialog, *When* Folge-Nähegrad nicht gewählt, *Then* Speichern blockiert (E-ROM-END-INCOMPLETE).
- **AC-051** *Given* Folge=Freundschaft + Ex-Partner/in=ja, *When* bestätigt, *Then* Romantik endet, Freundschaft- und Ex-Partner-Period starten parallel ab Enddatum.

**FEAT-026 Kontexttypen**
- **AC-052** *Given* Einstellungen, *When* neuer Kontexttyp angelegt, *Then* in Connection-Dialogen wählbar (DEC-023).

## EPIC-004 — Verlauf & Tagebuch

**FEAT-030 Historie**
- **AC-053** *Given* mehrere Typänderungen, *When* angezeigt, *Then* alle Perioden mit Start/Ende chronologisch, nichts überschrieben.
- **AC-054** *Given* exklusiver Typ, *When* überlappender Zeitraum entstünde, *Then* abgelehnt (E-PERIOD-OVERLAP).
- **AC-055** *Given* Enddatum vor Startdatum (exakt), *When* gespeichert, *Then* abgelehnt (E-TIME-ORDER).

**FEAT-032 Tagebuch**
- **AC-056** *Given* Tagebucheintrag mit Datum+Titel, *When* gespeichert, *Then* chronologisch einsortiert.
- **AC-057** *Given* ein Eintrag wird bearbeitet/gelöscht, *When* gespeichert, *Then* andere Einträge/Perioden unverändert.

**FEAT-033 Ungenaue Zeit**
- **AC-058** *Given* Eingabe „Sommer 2022", *When* gespeichert, *Then* `Kind=season`, Text erhalten, kein erfundener Tag.

## EPIC-005 — Ereignisse & Timeline

**FEAT-040/041 Events**
- **AC-060** *Given* Ereignis ohne Teilnehmer, *When* gespeichert, *Then* blockiert (≥1 Teilnehmer).
- **AC-061** *Given* Ereignis mit zwei Teilnehmern, *When* gespeichert, *Then* erscheint in beiden Profilen.
- **AC-062** *Given* `Sex`-Ereignis, *When* erfasst, *Then* kein automatischer Beziehungsstatuswechsel.

**FEAT-043 Sensible Inhalte (DEC-027)**
- **AC-063** *Given* Filter „Sensible Inhalte" = aus (Default), *When* Liste/Timeline/Pair angezeigt, *Then* sensible Einträge (inkl. `Sex`) sind verborgen.
- **AC-064** *Given* Toggle aktiviert, *When* erneut angezeigt, *Then* sensible Einträge erscheinen; Zustand gilt konsistent über Ansichten.

**FEAT-044/045/046 Timeline**
- **AC-065** *Given* Timeline-Filter Zeitraum/Typ/Person, *When* gesetzt, *Then* nur passende Einträge, chronologisch.
- **AC-066** *Given* unscharfe Datierung, *When* in Timeline gezeigt, *Then* als unscharf dargestellt (z. B. „Sommer 2022"), nicht als exakter Tag.

## EPIC-006 — Graph

**FEAT-050/051**
- **AC-070** *Given* Personen+Connections, *When* Graph geöffnet, *Then* Node je Person, Edge je Connection; Edge-Farbe = aktueller Typ; Legende vorhanden.
- **AC-071** *Given* 500 Nodes, *When* geladen, *Then* Zoom/Pan/Auswahl interaktiv bedienbar.
- **AC-072** *Given* Person ohne Bild/mit langem Namen/isoliert, *When* gerendert, *Then* Darstellung bleibt funktionsfähig.

**FEAT-052/053/054**
- **AC-073** *Given* Node, *When* einfacher Klick, *Then* Profilpanel ohne Fokuswechsel.
- **AC-074** *Given* Node, *When* Doppelklick, *Then* fokussierter Graph mit nur direkten Kontakten; URL ändert sich.
- **AC-075** *Given* Fokus-Graph, *When* Fokuswechsel oder Browser-Zurück, *Then* ohne vollständigen Seitenneustart; vorheriger Kontext wiederherstellbar.
- **AC-076** *Given* Maus/Touch/Tastatur, *When* Auswahl, *Then* jeweils bedienbar.

**FEAT-055**
- **AC-077** *Given* mobile Ansicht, *When* Long-Press auf Node, *Then* Aktionsmenü; dieselben Aktionen auch über sichtbaren Button erreichbar (keine Geste-only).

## EPIC-007 — Pair-Details

- **AC-080** *Given* Graph, *When* Klick auf Kante, *Then* Pair-Details des Paars öffnen (Desktop Seite/Panel, Mobil Seite/Bottom-Sheet).
- **AC-081** *Given* Pair-Details, *When* angezeigt, *Then* aktuelle + historische Typen mit Zeiträumen chronologisch, eindeutig datiert.
- **AC-082** *Given* Pair-Details, *When* eine Beziehungsaktion ausgelöst, *Then* alle Aktionen (Typ/Nähegrad/Romantik/Tagebuch/Event) hier ausführbar.
- **AC-083** *Given* Filter „nur exakt diese zwei", *When* aktiviert, *Then* nur Events mit genau diesen beiden Teilnehmern (DEC-022).

## EPIC-008 — Karte

- **AC-090** *Given* Layer Personen/Ereignisse, *When* einzeln umgeschaltet, *Then* nur der jeweilige Layer sichtbar.
- **AC-091** *Given* dicht beieinander liegende Marker, *When* gezoomt, *Then* Cluster mit Anzahl; Auswahl zoomt/öffnet Liste.
- **AC-092** *Given* nur Stadt/Region gespeichert, *When* dargestellt, *Then* grobe Position, nie präziser als gespeichert.
- **AC-093** *Given* fehlender Standort, *When* Karte, *Then* Eintrag wird nicht falsch verortet, sondern separat behandelt.

## EPIC-009 — Finder

- **AC-100** *Given* zwei verschiedene Personen, *When* gewählt, *Then* genau die mit **beiden** direkt Verbundenen werden gelistet (Name, Bild, beide Typen).
- **AC-101** *Given* keine Schnittmenge, *When* Suche, *Then* verständlicher Leerzustand.

## EPIC-010 — Notion-Import

- **AC-110** *Given* Import gestartet, *When* Vorschau angezeigt, *Then* neu/übersprungen/Konflikte vor jedem Schreiben sichtbar.
- **AC-111** *Given* abgebrochen vor Bestätigung, *When* Abbruch, *Then* keine Daten geschrieben.
- **AC-112** *Given* identischer Import wiederholt, *When* ausgeführt, *Then* keine Duplikate (ExternalImportMap).
- **AC-113** *Given* Ausführung, *When* fertig, *Then* Bericht mit Anzahl erstellt/übersprungen/Fehler.

## EPIC-011/012/013 — Einstellungen, Backup, Responsive/A11y

- **AC-120** *Given* Beziehungstyp in Nutzung, *When* geändert/deaktiviert, *Then* bestehende Historie bleibt gültig (deaktivieren statt löschen).
- **AC-121** *Given* Theme `System`, *When* OS-Theme wechselt, *Then* App folgt; manuelle Wahl überschreibt bis „System".
- **AC-122** *Given* Backup-Paket, *When* Restore auf leerer Umgebung, *Then* identischer Datenstand (DB + Uploads).
- **AC-123** *Given* Smartphone-Viewport (390 px), *When* Kernflüsse ausgeführt, *Then* alle Aktionen bedienbar; Touch-Ziele ausreichend groß.
- **AC-124** *Given* Tastaturnutzung, *When* navigiert, *Then* Fokuszustände sichtbar; Farbe nie alleiniger Informationsträger.

## EPIC-014 — Sicherheit (Querschnitt)
- **AC-130** *Given* beliebige Datenabfrage, *When* unauthentifiziert, *Then* abgelehnt (gilt für alle Ressourcen).
- **AC-131** *Given* Upload/Eingabe, *When* ungültig (Typ/Größe/Schema), *Then* serverseitig abgelehnt; Clientvalidierung allein genügt nicht.
- **AC-132** *Given* Logs, *When* geschrieben, *Then* keine Passwörter/Tokens/intime Notizen.
