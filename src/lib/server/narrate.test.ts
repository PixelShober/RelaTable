import { describe, it, expect } from 'vitest';
import { agentLoop, buildPrompt, runNarration, SYSTEM_PROMPT, type Msg, type Tool } from './narrate';

// Self-Check ohne API/DB: der Agenten-Loop muss Tool-Aufrufe ausführen, deren
// Ergebnisse zurückreichen und beim ersten Text-ohne-Tool-Aufruf stoppen — und
// dabei wrote=true setzen, sobald ein Schreib-Tool lief. Bricht das, ist der
// Loop kaputt (Endlosschleife, fehlende Tool-Ergebnisse oder falsches wrote).
const tools: Tool[] = [
	{ type: 'function', function: { name: 'search_persons', parameters: {} } },
	{ type: 'function', function: { name: 'add_journal', parameters: {} } }
];

describe('agentLoop', () => {
	it('führt Tool-Aufrufe aus und stoppt bei Text (Rückfrage/Abschluss)', async () => {
		const calls: string[] = [];
		// Skript: erst search_persons, dann add_journal (Schreib-Tool), dann Text.
		const script: Msg[] = [
			{ role: 'assistant', content: null, tool_calls: [{ id: 't1', type: 'function', function: { name: 'search_persons', arguments: '{"query":"Louis"}' } }] },
			{ role: 'assistant', content: null, tool_calls: [{ id: 't2', type: 'function', function: { name: 'add_journal', arguments: '{}' } }] },
			{ role: 'assistant', content: 'Fertig: Journal-Eintrag angelegt.' }
		];
		let i = 0;
		const r = await agentLoop({
			messages: [{ role: 'user', content: 'Ich habe Louis getroffen.' }],
			tools,
			chat: async () => script[i++],
			callTool: async (name) => {
				calls.push(name);
				return `${name} ok`;
			}
		});
		expect(calls).toEqual(['search_persons', 'add_journal']);
		expect(r.wrote).toBe(true); // add_journal ist ein Schreib-Tool
		expect(r.reply).toBe('Fertig: Journal-Eintrag angelegt.');
		// Verlauf enthält die Tool-Ergebnisse, die ans LLM zurückgereicht wurden.
		expect(r.messages.filter((m) => m.role === 'tool')).toHaveLength(2);
	});

	it('stoppt bei reiner Lese-Konversation mit wrote=false', async () => {
		const r = await agentLoop({
			messages: [{ role: 'user', content: 'Wer ist Louis?' }],
			tools,
			chat: async () => ({ role: 'assistant', content: 'Welchen Louis meinst du?' }),
			callTool: async () => 'unused'
		});
		expect(r.wrote).toBe(false);
		expect(r.reply).toBe('Welchen Louis meinst du?');
	});

	it('bricht nach maxSteps ab statt endlos zu schleifen', async () => {
		const r = await agentLoop({
			messages: [],
			tools,
			maxSteps: 3,
			chat: async () => ({ role: 'assistant', content: null, tool_calls: [{ id: 'x', type: 'function', function: { name: 'search_persons', arguments: '{}' } }] }),
			callTool: async () => 'ok'
		});
		expect(r.reply).toMatch(/verschachtelt/);
	});

	it('fällt bei fehlerhaften JSON-Args auf {} zurück und läuft weiter', async () => {
		const receivedArgs: unknown[] = [];
		const script: Msg[] = [
			{ role: 'assistant', content: null, tool_calls: [{ id: 'b1', type: 'function', function: { name: 'search_persons', arguments: 'KEIN_JSON' } }] },
			{ role: 'assistant', content: 'Fallback erfolgreich.' }
		];
		let i = 0;
		const r = await agentLoop({
			messages: [{ role: 'user', content: 'Test.' }],
			tools,
			chat: async () => script[i++],
			callTool: async (_name, args) => {
				receivedArgs.push(args);
				return 'ok';
			}
		});
		expect(receivedArgs[0]).toEqual({});
		expect(r.reply).toBe('Fallback erfolgreich.');
	});
});

describe('buildPrompt', () => {
	it('enthält SYSTEM_PROMPT in beiden Modi', () => {
		expect(buildPrompt(true)).toContain(SYSTEM_PROMPT);
		expect(buildPrompt(false)).toContain(SYSTEM_PROMPT);
	});

	it('autoApprove=true → FREIGABE: AUTOMATISCH', () => {
		expect(buildPrompt(true)).toContain('FREIGABE: AUTOMATISCH');
	});

	it('autoApprove=false → FREIGABE: BESTÄTIGUNG ERFORDERLICH', () => {
		expect(buildPrompt(false)).toContain('FREIGABE: BESTÄTIGUNG ERFORDERLICH');
	});
});

describe('runNarration', () => {
	it('wirft ohne API-Key sofort', async () => {
		const saved = process.env.OPENROUTER_API_KEY;
		try {
			delete process.env.OPENROUTER_API_KEY;
			await expect(runNarration([])).rejects.toThrow('Kein OpenRouter-API-Key');
		} finally {
			if (saved !== undefined) process.env.OPENROUTER_API_KEY = saved;
		}
	});
});
