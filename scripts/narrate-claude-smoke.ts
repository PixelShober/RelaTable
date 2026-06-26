import { runNarration, type Msg } from '../src/lib/server/narrate';

const SENTINEL = 'RELATABLE_CLAUDE_SMOKE_OK';

const messages: Msg[] = [
	{
		role: 'system',
		content: [
			'Du bist ein interner RelaTable Smoke-Test.',
			'Wenn du den folgenden Beispieltext verarbeiten kannst, gib exakt nur diese Zeile aus:',
			SENTINEL
		].join('\n')
	},
	{
		role: 'user',
		content: [
			'Verarbeite diesen Beispieltext so, als kaeme er aus der Sprachfunktion:',
			'Ich habe Mara gestern in Berlin getroffen.'
		].join('\n')
	}
];

console.info('[relatable-smoke] provider=claude-cli, OpenRouter wird nicht verwendet');

const result = await runNarration(messages, {
	provider: 'claude-cli',
	model: process.env.CLAUDE_MODEL || 'sonnet',
	autoApprove: false
});

const reply = result.reply.trim();
if (reply !== SENTINEL) {
	console.error(`[relatable-smoke] Unerwartete Antwort: ${JSON.stringify(reply)}`);
	process.exit(1);
}

console.info(`[relatable-smoke] ${SENTINEL}`);
