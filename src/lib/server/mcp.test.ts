import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildMcpServer, MCP_TOOL_NAMES, handleMcpRequest, checkBearer } from './mcp';

const TOKEN = 'test-secret-token-1234567890';

// Self-Check ohne DB: der zustandslose Streamable-HTTP-Pfad muss auf einen
// JSON-RPC tools/list-POST antworten und genau die registrierten Tools nennen.
// Fällt dieser Test weg, ist die Tool-Registrierung oder der Transport kaputt.
describe('relatable mcp server', () => {
	beforeEach(() => {
		process.env.RELATABLE_MCP_TOKEN = TOKEN;
	});
	afterEach(() => {
		delete process.env.RELATABLE_MCP_TOKEN;
	});

	it('registers all expected tools (14)', () => {
		expect([...MCP_TOOL_NAMES]).toEqual([
			'search_persons',
			'get_person',
			'get_event',
			'list_relationship_types',
			'list_event_types',
			'get_import_schema',
			'preview_import',
			'apply_import',
			'update_person',
			'update_event',
			'start_relationship',
			'end_relationship',
			'end_romance',
			'add_journal'
		]);
	});

	it('builds a server without throwing', () => {
		const s = buildMcpServer();
		expect(s).toBeTruthy();
	});

	it('answers a stateless tools/list request with the registered tool names', async () => {
		const req = new Request('http://localhost/api/mcp', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				accept: 'application/json, text/event-stream',
				authorization: `Bearer ${TOKEN}`
			},
			body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' })
		});
		const res = await handleMcpRequest(req);
		expect(res.status).toBe(200);
		const raw = await res.text();
		const parsed = raw.trim().startsWith('{')
			? JSON.parse(raw)
			: JSON.parse((raw.split('\n').find((l) => l.startsWith('data:')) ?? '').replace(/^data:\s*/, ''));
		const names = parsed.result.tools.map((t: { name: string }) => t.name);
		for (const n of MCP_TOOL_NAMES) expect(names).toContain(n);
	});

	it('rejects requests without a bearer token (401)', async () => {
		const req = new Request('http://localhost/api/mcp', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' })
		});
		const res = await handleMcpRequest(req);
		expect(res.status).toBe(401);
	});

	it('rejects requests with a wrong bearer token (401)', async () => {
		const req = new Request('http://localhost/api/mcp', {
			method: 'POST',
			headers: { 'content-type': 'application/json', authorization: 'Bearer wrong-token' },
			body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' })
		});
		const res = await handleMcpRequest(req);
		expect(res.status).toBe(401);
	});

	it('refuses all requests when RELATABLE_MCP_TOKEN is not set (503)', async () => {
		delete process.env.RELATABLE_MCP_TOKEN;
		const req = new Request('http://localhost/api/mcp', {
			method: 'POST',
			headers: { 'content-type': 'application/json', authorization: 'Bearer whatever' },
			body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' })
		});
		const res = await handleMcpRequest(req);
		expect(res.status).toBe(503);
	});

	it('checkBearer passes with correct token', () => {
		const req = new Request('http://localhost/api/mcp', {
			headers: { authorization: `Bearer ${TOKEN}` }
		});
		expect(checkBearer(req)).toBeNull();
	});
});
