// Probes whether OpenRouter is actually usable (valid key + remaining credits),
// so the UI can gray out the mic and explain why instead of failing mid-request.
export type VoiceReason = 'no-key' | 'invalid-key' | 'no-credits' | 'error' | null;

/** Pure classifier (testable without network) → null means "ok". */
export function classifyStatus(p: { hasKey: boolean; httpStatus?: number; limitRemaining?: number | null }): VoiceReason {
	if (!p.hasKey) return 'no-key';
	if (p.httpStatus === 401 || p.httpStatus === 403) return 'invalid-key';
	if (p.httpStatus !== 200) return 'error';
	if (typeof p.limitRemaining === 'number' && p.limitRemaining <= 0) return 'no-credits';
	return null;
}

// One call to OpenRouter's key endpoint covers both validity and credit balance
// (limit_remaining is null for unmetered keys → treated as ok).
export async function openRouterStatus(key: string | null | undefined): Promise<{ ok: boolean; reason: VoiceReason }> {
	if (!key) return { ok: false, reason: 'no-key' };
	let httpStatus: number | undefined;
	let limitRemaining: number | null | undefined;
	try {
		const res = await fetch('https://openrouter.ai/api/v1/auth/key', { headers: { authorization: `Bearer ${key}` } });
		httpStatus = res.status;
		if (res.ok) limitRemaining = (await res.json().catch(() => null))?.data?.limit_remaining ?? null;
	} catch {
		/* network failure → httpStatus stays undefined → classified as 'error' */
	}
	const reason = classifyStatus({ hasKey: true, httpStatus, limitRemaining });
	return { ok: reason === null, reason };
}
