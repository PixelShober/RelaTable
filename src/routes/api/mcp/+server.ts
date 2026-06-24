import type { RequestHandler } from './$types';
import { handleMcpRequest } from '$lib/server/mcp';

// ponytail: kein Auth, kein Token (v1). Streamable-HTTP-Endpunkt für Remote-MCP-Clients
// (ChatGPT, Telegram-Bot, Claude). POST=JSON-RPC, GET/DELETE vom Transport beantwortet.
export const GET: RequestHandler = ({ request }) => handleMcpRequest(request);
export const POST: RequestHandler = ({ request }) => handleMcpRequest(request);
export const DELETE: RequestHandler = ({ request }) => handleMcpRequest(request);
