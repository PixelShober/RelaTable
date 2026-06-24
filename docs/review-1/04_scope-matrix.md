# 4. V1- / Später- / Out-of-Scope-Matrix

> ↩ [Index](README.md) · Quelle der Features: [Feature-Landkarte](03_feature-landkarte.md)

## V1 (erste Auslieferung)

| Bereich | Features |
| --- | --- |
| Basis & Auth | FEAT-001 … FEAT-004 |
| Personen & Accounts | FEAT-010 … FEAT-016 |
| Connections & Typen | FEAT-020 … FEAT-026 |
| Verlauf & Tagebuch | FEAT-030 … FEAT-033 |
| Ereignisse & Timeline | FEAT-040 … FEAT-046 |
| Graph | FEAT-050 … FEAT-056 |
| Pair-Details | FEAT-060 … FEAT-064 |
| Karte | FEAT-070 … FEAT-074 |
| Finder | FEAT-080, FEAT-081 |
| Notion-Import (einmalig) | FEAT-090 … FEAT-093 |
| Einstellungen & Typen | FEAT-100 … FEAT-103 |
| Backup/Restore | FEAT-110, FEAT-111 |
| Responsive & A11y | FEAT-120, FEAT-121 |
| Tests & Sicherheit | FEAT-130, FEAT-131 |

**V1-Leitsatz:** datenorientiert, aber kein Admin-Tool; jede Geste hat eine sichtbare Alternative; jede Anforderung hat einen Test.

## Später (nach V1)

| Thema | Quelle | Bedingung |
| --- | --- | --- |
| FEAT-082 Pfadsuche im Finder | FIND-002 | Pfadlänge/Gewichtung vorher festlegen. |
| Off-site-/automatisierte Backups | NFR-001 | V1 dokumentiert nur das Verfahren. |
| Erweiterte Map-Heatmaps/Zeitfilter | MAP | Nach Karten-MVP. |
| Erweiterte A11y-Zertifizierung | UX-002 | V1 = solide Barrierearmut. |
| Tablet-Feinschliff Graph/Karte | Prompt §7 | Mockup-Varianten in Review 4. |

## Out of Scope (bewusst ausgeschlossen)

| Thema | Quelle | Begründung |
| --- | --- | --- |
| Beziehungstemperatur / Aktivitätswert | REL-004, C-003 | Vom Masterprompt **gestrichen** – nicht implementieren. |
| Historischer Graph-Zeitregler | Prompt | Nicht in V1; Modell historisiert dennoch korrekt. |
| Laufender Notion-Sync / Schreiben nach Notion | C-012 | Nur einmaliger, kontrollierter Import. |
| Mehrbenutzer / Mandanten / `WorkspaceId`-Trennung als Feature | AUTH-002 | Ein globaler Eigentümer. |
| Gastzugriff / öffentliche Share-Links | AUTH-003, C-008 | Sensible Daten; nicht in V1. |
| Externe KI-Verarbeitung sensibler Inhalte | EVT-003, C-009 | `AiNote` bleibt reines lokales Textfeld. |
| Automatische Beziehungsänderung durch Events | [Regeln](07_beziehungsregeln.md) | `Sex`-Event ändert Status nicht. |
| Mehr als 2 Personen pro Connection | C-007 | Gruppen über Ereignisse. |

## Bewusst verschobene Funktionen (Kurzliste)

1. Pfadsuche Finder (FEAT-082).
2. Automatisierte/externe Backups.
3. Tablet-Detailoptimierung Graph & Karte.
4. Erweiterte Map-Analytik.

> Hinweis: Diese Matrix ist die Referenz für die Release-Checkliste (Phase 7) und für jede künftige Scope-Diskussion. Änderungen am Scope werden im [Decision Log](10_offene-entscheidungen.md) festgehalten.
