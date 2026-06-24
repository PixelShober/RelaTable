// In-App-Erzählung → KI-Agent → RelaTable.
// Wiederverwendet die 14 bestehenden MCP-Tools IN-PROCESS (kein Netzwerk, keine
// neuen Abhängigkeiten): handleMcpRequest wird mit einem JSON-RPC-Request direkt
// aufgerufen — derselbe Pfad, den mcp.test.ts für tools/list nachweist.
// Das LLM läuft über OpenRouter (ein API-Key, beliebiges Modell, OpenAI-Tool-Calling).
import { handleMcpRequest } from './mcp';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// ponytail: Prompt aus docs/input/ERZAEHLUNG_MCP_PROMPT.md, gekürzt + an den
// In-App-Loop angepasst (Rückfrage = Text ohne Tool-Aufruf statt MCP-Elicitation).
export const SYSTEM_PROMPT = `Du bist der Erzähl-Assistent von RelaTable, einem privaten Beziehungsnetzwerk
(Personen, Verbindungen zwischen je zwei Personen mit zeitlichem Verlauf,
gemeinsame Ereignisse, Tagebuch-Einträge). Du hast Werkzeuge, um live auf die
Datenbank zuzugreifen und zu schreiben.

ABLAUF
1. Lies die Erzählung des Nutzers und extrahiere sichere Fakten.
2. Schau nach, was existiert: search_persons für jeden Namen, bei Treffern
   get_person (Details, connectionIds, aktive Beziehungen). Ereignisse via get_event.
3. Entscheide pro Information: NEU anlegen oder BESTEHENDES ergänzen?
   - Neue Person/Verbindung/Ereignis → preview_import, dann apply_import
   - Geburtstag/Notiz/Stadt nachtragen → update_person
   - Beziehung starten/wechseln → start_relationship
   - Beziehung beenden (nicht Romantik) → end_relationship
   - Romantik beenden → end_romance (ERST nach Rückfrage, siehe unten)
   - Treffen/Notiz an Verbindung → add_journal
   - Ereignis ändern → update_event
4. Hole valide Werte zuerst: list_relationship_types und list_event_types.
   Für Import einmal get_import_schema, dann immer preview_import vor apply_import.

VOLLSTÄNDIGKEIT (wichtig)
- Lege JEDES erzählte Ereignis an — keines weglassen, auch beiläufig erwähnte.
- Hole pro Ereignis möglichst viele Infos: ALLE beteiligten Personen, Ort,
  Datum/Zeitraum, was passiert ist. Frage gezielt nach, wer noch dabei war.
- Erzählt der Nutzer von MEHREREN Ereignissen, frage aktiv nach ihrem Zusammenhang:
  gleicher Anlass? zeitliche oder kausale Folge (das eine führte zum anderen)?
  dieselben Personen? Halte Zusammenhänge als Notiz (add_journal) oder über die
  passenden Verbindungen fest.
- Sammle lieber eine Rückfrage zu viel als eine zu wenig — Ziel ist ein möglichst
  vollständiges Bild, bevor du schreibst. Bündle offene Fragen in EINER Nachricht.

RÜCKFRAGEN
- Fehlt etwas oder ist unklar (vollständiger Name, Datum/Zeitraum, wer war dabei),
  dann ANTWORTE EINFACH MIT TEXT (ohne Tool-Aufruf). Dein Text wird dem Nutzer
  als Frage gezeigt; seine Antwort kommt als nächste Nachricht. Schreibe erst,
  wenn du genug weißt.
- Bist du fertig, antworte mit einer kurzen Zusammenfassung dessen, was du
  angelegt/aktualisiert hast (ebenfalls Text ohne Tool-Aufruf).

ROMANTIK BEENDEN (V-5): Frage VORHER per Text: (1) welcher Folge-Nähegrad
(leer = keiner, sonst ein Nähegrad mit isClosenessLevel=true), (2) Ex-Partner/in
aktivieren ja/nein. Erst nach Antwort end_romance aufrufen.

REGELN
- Erfinde KEINE Fakten. Unbekannt = fragen oder weglassen.
- Eine Verbindung verbindet GENAU ZWEI Personen. Gruppen = EREIGNIS mit mehreren
  participants, keine Verbindung.
- Zeitangaben dürfen unscharf sein: "2023-08-15", "2023-08", "2023", "Sommer 2022".
- Verwende nur exakte Typnamen aus list_relationship_types / list_event_types.
- Geschlecht nur "Männlich", "Weiblich", "divers". Bild-URLs nur HTTPS.
- Lehnt ein Tool ab (Beziehungsregeln V-1..V-8), nimm die Begründung in die
  Rückfrage an den Nutzer auf.
- Antworte auf Deutsch.`;

// ponytail: Freigabe wird per Prompt gesteuert, nicht serverseitig erzwungen —
// genügt für eine Single-Owner-App. Ceiling: ein bockiges Modell könnte trotzdem
// schreiben. Upgrade-Pfad: Schreib-Tools im manuellen Modus hart sperren (in
// mcpCall anhand WRITE_TOOLS + einem `allowWrites`-Flag).
const APPROVAL_MANUAL = `
FREIGABE: BESTÄTIGUNG ERFORDERLICH
- Recherchiere nur mit LESENDEN Tools (search_persons, get_person, get_event,
  list_*). Rufe KEINE Schreib-Tools auf, bevor der Nutzer bestätigt hat.
- Wenn du genug weißt, ANTWORTE MIT TEXT: eine nummerierte Zusammenfassung GENAU
  dessen, was du anlegen oder ändern würdest — jede Person, jede Verbindung, jedes
  Ereignis einzeln — und frage am Ende: "Soll ich das so übernehmen?".
- Erst wenn der Nutzer in einer FOLGENDEN Nachricht zustimmt ("ja", "passt",
  "übernehmen"), rufe die Schreib-Tools auf und fasse danach zusammen, was
  tatsächlich angelegt/aktualisiert wurde.`;

const APPROVAL_AUTO = `
FREIGABE: AUTOMATISCH
- Sobald du genug weißt, lege alles direkt über die passenden Tools an bzw.
  aktualisiere es. Rückfragen nur bei echten Lücken (Name, Datum, wer dabei war,
  Zusammenhang mehrerer Ereignisse).
- Fasse DANACH immer auf, welche Personen/Verbindungen/Ereignisse du angelegt oder
  geändert hast — einzeln aufgelistet.`;

/** System-Prompt je nach Freigabe-Modus. */
export function buildPrompt(autoApprove: boolean): string {
	return SYSTEM_PROMPT + '\n' + (autoApprove ? APPROVAL_AUTO : APPROVAL_MANUAL);
}

export type Msg = {
	role: 'system' | 'user' | 'assistant' | 'tool';
	content: string | null;
	tool_calls?: { id: string; type: 'function'; function: { name: string; arguments: string } }[];
	tool_call_id?: string;
	name?: string;
};
export type Tool = {
	type: 'function';
	function: { name: string; description?: string; parameters: unknown };
};

const WRITE_TOOLS = new Set([
	'apply_import',
	'update_person',
	'update_event',
	'start_relationship',
	'end_relationship',
	'end_romance',
	'add_journal'
]);

let _rpcId = 0;
async function mcpRpc(method: string, params?: unknown): Promise<Record<string, any>> {
	const token = process.env.RELATABLE_MCP_TOKEN;
	if (!token) throw new Error('RELATABLE_MCP_TOKEN nicht gesetzt — Erzählfunktion deaktiviert.');
	const req = new Request('http://localhost/api/mcp', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			accept: 'application/json, text/event-stream',
			authorization: `Bearer ${token}`
		},
		body: JSON.stringify({ jsonrpc: '2.0', id: ++_rpcId, method, params })
	});
	const res = await handleMcpRequest(req);
	const raw = await res.text();
	// enableJsonResponse → meist reines JSON; SSE-Frame als Fallback (wie in mcp.test.ts).
	const parsed = raw.trim().startsWith('{')
		? JSON.parse(raw)
		: JSON.parse((raw.split('\n').find((l) => l.startsWith('data:')) ?? '').replace(/^data:\s*/, ''));
	if (parsed.error) throw new Error(parsed.error.message ?? 'MCP-Fehler');
	return parsed.result;
}

/** MCP-Tools → OpenAI/OpenRouter-Function-Format (inputSchema ist bereits JSON-Schema). */
export async function mcpTools(): Promise<Tool[]> {
	const r = await mcpRpc('tools/list');
	return (r.tools as any[]).map((t) => ({
		type: 'function' as const,
		function: {
			name: t.name,
			description: t.description,
			parameters: t.inputSchema ?? { type: 'object', properties: {} }
		}
	}));
}

async function mcpCall(name: string, args: unknown): Promise<string> {
	const r = await mcpRpc('tools/call', { name, arguments: args });
	const txt = ((r.content as any[]) ?? []).map((c) => c.text ?? '').join('\n');
	return (r.isError ? 'FEHLER: ' : '') + (txt || '(leer)');
}

async function openRouterChat(messages: Msg[], tools: Tool[], key: string, model: string): Promise<Msg> {
	// Timeout, sonst hängt der Request bei langsamen "Thinking"-Modellen endlos
	// und der Nutzer sieht ewig "KI denkt nach…".
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), 120_000);
	let res: Response;
	try {
		res = await fetch(OPENROUTER_URL, {
			method: 'POST',
			headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
			body: JSON.stringify({ model, messages, tools, tool_choice: 'auto' }),
			signal: ctrl.signal
		});
	} catch (e) {
		throw new Error(
			(e as Error)?.name === 'AbortError'
				? `OpenRouter-Zeitüberschreitung (120 s) — Modell "${model}" zu langsam. Anderes Modell wählen.`
				: `OpenRouter nicht erreichbar: ${(e as Error)?.message ?? e}`
		);
	} finally {
		clearTimeout(t);
	}
	if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
	const data = await res.json();
	return data.choices[0].message as Msg;
}

/**
 * Agenten-Loop (rein, injizierbar → testbar ohne API/DB): ruft das LLM, führt
 * Tool-Aufrufe aus und reicht die Ergebnisse zurück, bis das LLM mit Text statt
 * Tool-Aufruf antwortet (= Rückfrage oder Abschluss).
 */
export async function agentLoop(opts: {
	messages: Msg[];
	tools: Tool[];
	chat: (messages: Msg[], tools: Tool[]) => Promise<Msg>;
	callTool: (name: string, args: unknown) => Promise<string>;
	maxSteps?: number;
}): Promise<{ reply: string; messages: Msg[]; wrote: boolean }> {
	const { messages, tools, chat, callTool, maxSteps = 24 } = opts;
	let wrote = false;
	for (let step = 0; step < maxSteps; step++) {
		const m = await chat(messages, tools);
		messages.push(m);
		if (!m.tool_calls?.length) return { reply: m.content ?? '', messages, wrote };
		for (const tc of m.tool_calls) {
			let args: unknown = {};
			try {
				args = JSON.parse(tc.function.arguments || '{}');
			} catch {
				/* malformed args → leeres Objekt, Tool meldet den Fehler selbst */
			}
			const result = await callTool(tc.function.name, args);
			if (WRITE_TOOLS.has(tc.function.name)) wrote = true;
			messages.push({ role: 'tool', tool_call_id: tc.id, name: tc.function.name, content: result });
		}
	}
	return { reply: 'Das wurde mir zu verschachtelt — bitte konkretere Angaben machen.', messages, wrote };
}

/**
 * Verdrahtet den Loop mit den echten Diensten (OpenRouter + In-Process-MCP).
 * apiKey/model kommen aus den App-Einstellungen (Fallback: ENV).
 */
export async function runNarration(
	prior: Msg[],
	opts: { apiKey?: string; model?: string; autoApprove?: boolean } = {}
): Promise<{ reply: string; messages: Msg[]; wrote: boolean }> {
	const key = opts.apiKey || process.env.OPENROUTER_API_KEY;
	if (!key) throw new Error('Kein OpenRouter-API-Key — bitte in den Einstellungen hinterlegen.');
	const model = opts.model || process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4.5';
	const tools = await mcpTools();
	const messages: Msg[] =
		prior[0]?.role === 'system'
			? prior
			: [{ role: 'system', content: buildPrompt(!!opts.autoApprove) }, ...prior];
	return agentLoop({
		messages,
		tools,
		chat: (m, t) => openRouterChat(m, t, key, model),
		callTool: mcpCall
	});
}
