# 4. Testmatrix (AC → Testtyp)

> ↩ [Index](README.md) · Testtypen: **U** Domain-Unit · **I** API/Integration · **E** Playwright-E2E · **UX** manuell · **A11y** · **S** Security · **B** Backup/Restore. Jedes kritische Akzeptanzkriterium hat ≥1 Test (Prompt §10).

## Kritische Bereiche (Pflicht-Abdeckung)

| TEST | Was wird geprüft | ACs | Typen |
|---|---|---|---|
| TEST-001 | Genau **ein** globaler Benutzer; Setup nur beim ersten Start | AC-001, AC-002 | U, I, E |
| TEST-002 | Auth schützt **alle** privaten API-Endpunkte & Seiten | AC-010, AC-130 | I, S, E |
| TEST-003 | Passwort-Hashing (Argon2id), Session-Ablauf/Widerruf, Rate-Limit | AC-011, AC-012, AC-013 | U, I, S |
| TEST-004 | Doppeltes Personenpaar verhindert (kanonisch, ungeordnet) | AC-040, AC-042 | U, I |
| TEST-005 | Selbstkante verhindert | AC-041 | U, I |
| TEST-006 | Historische Zeiträume werden **nie überschrieben** | AC-044, AC-053 | U, I |
| TEST-007 | Exklusiver Nähegrad (höchstens einer aktiv) | AC-043 | U, I |
| TEST-008 | Freundschaft Plus parallel zu Nähegrad erlaubt | AC-046 | U |
| TEST-009 | Romantik blockiert Nähegrad (E-NG-ROM) & Freundschaft Plus (E-FP-ROM) | AC-045, AC-047 | U, I, E |
| TEST-010 | Romantik-Start beendet aktiven Nähegrad + Freundschaft Plus; Vorschau stimmt | AC-048, AC-049 | U, E |
| TEST-011 | Romantik-Ende: Folgewahl Pflicht; Ex-Partner/in parallel | AC-050, AC-051 | U, I, E |
| TEST-012 | Überlappende Perioden / Ende<Start abgelehnt | AC-054, AC-055 | U, I |
| TEST-013 | Ungenaue Zeitangaben korrekt gespeichert & dargestellt | AC-058, AC-066 | U, E |
| TEST-014 | Graph: Klick=Panel, Doppelklick=Fokus, Long-Press + sichtbare Alternative | AC-073, AC-074, AC-077 | E, UX, A11y |
| TEST-015 | Edge-Klick öffnet Pair-Details | AC-080 | E |
| TEST-016 | Pair-Filter „nur exakt diese zwei Teilnehmer" | AC-083 | U, I, E |
| TEST-017 | Eventfilter & gemeinsame Events über gemeinsame Teilnehmer | AC-061, AC-065 | U, I |
| TEST-018 | Sensible Inhalte default versteckt; Toggle blendet konsistent ein | AC-063, AC-064 | U, E, S |
| TEST-019 | `Sex`-Event ändert Status nicht | AC-062 | U |
| TEST-020 | Event braucht ≥1 Teilnehmer | AC-060 | U, I |
| TEST-021 | Notion-Import ohne Duplikate; Vorschau vor Schreiben; Abbruch schreibt nichts | AC-110, AC-111, AC-112 | I, E |
| TEST-022 | Persistenz nach Container-Neustart | AC-014 | I |
| TEST-023 | Finder: korrekte Schnittmenge direkter Kontakte | AC-100, AC-101 | U, I, E |
| TEST-024 | Alter berechnet, nie redundant | AC-027, AC-028 | U |
| TEST-025 | Profilbild: Upload-Validierung + externe HTTPS-URL-Fehlerfall (SSRF-Schutz) | AC-029, AC-030, AC-031 | I, S |
| TEST-026 | Löschen zeigt Abhängigkeiten, keine verwaisten Referenzen | AC-025, AC-026 | I, E |
| TEST-027 | Graph-Performance: 500 Nodes interaktiv | AC-071 | U(perf), UX |
| TEST-028 | Backup → Restore = identischer Stand | AC-122 | B, I |
| TEST-029 | Eingabe-/Upload-Validierung serverseitig; Logs ohne Geheimnisse | AC-131, AC-132 | I, S |
| TEST-030 | Theme System/Light/Dark + Persistenz | AC-121 | E, UX |

## Querschnitt
| TEST | Was | ACs | Typen |
|---|---|---|---|
| TEST-040 | Responsive Kernflüsse 390 px | AC-123 | E, UX |
| TEST-041 | Tastatur/Fokus/Kontrast; Farbe nie alleiniger Träger | AC-124, AC-076 | A11y, UX |
| TEST-042 | Robustheit Graph (kein Bild/langer Name/isoliert) | AC-072 | E, UX |

## Testdaten (synthetisch, Pflicht)
Isolierte Personen · Zyklen · Gruppenereignisse · fehlende Bilder · lange Texte · unscharfe Daten · sensible Events. **Keine** echten personenbezogenen Daten in Fixtures/CI/Screenshots.

## E2E-Kernflows (Playwright, Minimum)
Login & Zugriffsschutz · Person+Profil · zweite Person+Connection · Connection im Graph · Fokusansicht · Nähegrad ändern + Historie · Romantik beginnen/beenden+Folgestatus · Event mit 2 Personen in beiden Profilen · Pair-Details über Kante + „nur diese zwei" · sensibler Filter · Suche/Filter Personenliste · Theme-Wechsel · Notion-Import-Vorschau · ein Smartphone-Viewport.
