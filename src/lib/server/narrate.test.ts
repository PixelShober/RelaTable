import { describe, it, expect } from 'vitest';
import { agentLoop, type Msg, type Tool } from './narrate';

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
});
