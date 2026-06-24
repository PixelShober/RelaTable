# 3. UX-Varianten & Empfehlungen

> ↩ [Index](README.md) · Für jede größere Designentscheidung 2–3 Varianten mit Vor-/Nachteilen. **Empfehlung** = Vorschlag für die erste Mockup-Runde (Review 3). Verworfene Varianten bleiben dokumentiert. Bitte hier kommentieren.

---

## VAR-01 — Hauptnavigation Desktop
| Variante | Vorteile | Nachteile |
| --- | --- | --- |
| A: Persistente breite Seitenleiste | viele Bereiche sichtbar, vertraut | nimmt dauerhaft Breite |
| B: Top-Bar | maximale Inhaltsbreite | wenig Platz für 7+ Einträge |
| **C: Einklappbare Icon-Rail, klappt bei Maus-Hover aus** ✅ | maximaler Platz für Graph/Karte, voll bei Bedarf | Icons brauchen Tooltips/Labels beim Hover |
**Empfehlung C (vom Eigentümer gewählt):** linke Leiste standardmäßig als schmale **Icon-Rail**; bei **Maus-Hover** gleitet sie zur vollen Leiste mit Labels aus und beim Verlassen wieder ein. Aktiver Bereich hervorgehoben; Icons mit Tooltip für Klarheit; mobil unverändert VAR-02.

## VAR-02 — Hauptnavigation Smartphone
| Variante | Vorteile | Nachteile |
| --- | --- | --- |
| **A: Bottom-Tab-Bar (5) + „Mehr"** ✅ | daumenfreundlich, schnelle Kernbereiche | nur 5 Primärziele |
| B: Hamburger-Drawer | beliebig viele Einträge | Aktionen versteckt, mehr Taps |
| C: Hybrid (Tabs + Drawer für Settings) | Balance | zwei Muster gleichzeitig |
**Empfehlung A:** Graph · Personen · Ereignisse · Karte · Mehr (Finder/Import/Settings unter „Mehr").

## VAR-03 — Pair-Details: Seite vs. Panel vs. Modal
| Variante | Vorteile | Nachteile |
| --- | --- | --- |
| **A: Desktop Side-Panel, Mobil eigene Seite** ✅ | Graph bleibt sichtbar (Kontext), mobil voller Platz | zwei Layouts |
| B: Immer eigene Seite | einfach, deep-linkbar | verliert Graph-Kontext am Desktop |
| C: Modal | schnell | zu klein für viel Inhalt, schlecht mobil |
**Empfehlung A** (beide deep-linkbar `/pair/:id`).

## VAR-04 — Mehrere Beziehungstypen auf einer Kante
| Variante | Vorteile | Nachteile |
| --- | --- | --- |
| **A: Eine Kante = aktueller Haupttyp (Farbe) + kleiner Badge bei Parallelstatus** ✅ | lesbar, klar (C-010) | Parallelstatus erst im Detail |
| B: Mehrere parallele Linien je Typ | alles sichtbar | unübersichtlich bei vielen |
| C: Gestrichelt/Muster je Typ | platzsparend | schwer unterscheidbar |
**Empfehlung A;** Details/Historie in Pair-Details.

## VAR-05 — Aktuelle vs. historische Beziehungen
| Variante | Vorteile | Nachteile |
| --- | --- | --- |
| **A: Standard = aktueller Stand; Historie als Timeline im Detail** ✅ | klare Standardansicht | Historie ein Klick entfernt |
| B: Immer alle Perioden inline | vollständig | überladen |
| C: Zeitregler | mächtig | **Out of Scope V1** |
**Empfehlung A** (Zeitregler bleibt Nicht-Ziel).

## VAR-06 — Eingabe ungenauer Zeitangaben
| Variante | Vorteile | Nachteile |
| --- | --- | --- |
| **A: Präzisions-Auswahl (Tag/Monat/Jahr/Jahreszeit/ungefähr/unbekannt) steuert Eingabefelder** ✅ | exakt das Datenmodell, ehrlich | etwas mehr UI |
| B: Freitext + Parser | schnell | mehrdeutig, fehleranfällig |
| C: Nur Datepicker mit „unbekannt"-Häkchen | einfach | bildet Jahreszeit/ungefähr nicht ab |
**Empfehlung A** (C-MODEL-9, DEC-013).

## VAR-07 — Timeline-Darstellung
| Variante | Vorteile | Nachteile |
| --- | --- | --- |
| **A: Gruppierte Chronik (nach Jahr/Monat) mit Icons je Typ** ✅ | gut lesbar, scanbar | bei sehr vielen lang |
| B: Reine Liste | einfach | schwerer zu scannen |
| C: Horizontaler Zeitstrahl | visuell | mobil schwierig, unscharfe Daten schwer |
**Empfehlung A;** unscharfe Daten als eigene Gruppen („Sommer 2022").

## VAR-08 — Profilpanel bei einfachem Node-Klick
| Variante | Vorteile | Nachteile |
| --- | --- | --- |
| **A: Kompaktes Panel (Bild, Name, Kurzinfo, Buttons: Profil/Fokus)** ✅ | schnell, ohne Kontextverlust | begrenzter Inhalt |
| B: Voll-Profil sofort | alles da | verlässt Graph |
| C: Tooltip | minimal | zu wenig, hover-lastig |
**Empfehlung A** (Klick=Panel, Doppelklick=Fokus, klar getrennt).

## VAR-09 — Filterbedienung Karte & Timeline
| Variante | Vorteile | Nachteile |
| --- | --- | --- |
| **A: Persistentes Filterpanel (Desktop) / Bottom-Sheet (Mobil) mit Chips** ✅ | sichtbar, schnell rücksetzbar | nimmt etwas Platz |
| B: Filter-Dialog auf Knopf | platzsparend | Zustand weniger sichtbar |
| C: Inline-Toolbar | kompakt | bei vielen Filtern eng |
**Empfehlung A;** aktive Filter als entfernbare Chips; „Sensible Inhalte"-Toggle hier verankert (DEC-027).

## VAR-10 — Start-/Enddialog romantische Beziehung
| Variante | Vorteile | Nachteile |
| --- | --- | --- |
| **A: Geführter Dialog mit Vorschau (Start: was endet) / Pflicht-Folgewahl (Ende)** ✅ | verhindert Fehler, erfüllt Regeln | mehr Schritte |
| B: Einfaches Formular | schnell | Regelwirkung unsichtbar, Fehlbedienung |
| C: Inline in Pair-Details ohne Dialog | wenig Klicks | riskant bei automatischen Statusenden |
**Empfehlung A** (FLOW-11/12, AC-048/050/051).

---

## Übersicht der Empfehlungen (für Review 3)
**VAR-01 = C** (einklappbare Icon-Rail mit Hover-Ausklappen, vom Eigentümer gewählt); alle übrigen **= A**. Bitte weitere abweichende Wünsche markieren — die gewählte Variante bestimmt das jeweilige Mockup.
