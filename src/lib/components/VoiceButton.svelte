<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	// Mikrofon → Web Speech API (Transkript) → /api/narrate (KI-Agent über die
	// MCP-Tools) → Rückfragen im Panel → Graph aktualisiert sich (invalidateAll).
	// ponytail: Web Speech API ist gratis & ohne Dependency, läuft aber v.a. in
	// Chrome/Edge. Fallback: Tippen. Upgrade-Pfad: Server-Transkription (Whisper),
	// falls Firefox-Support oder höhere Genauigkeit nötig wird.
	type ChatMsg = { role: 'user' | 'assistant'; content: string };
	type ApiMsg = { role: string; content: string | null; [k: string]: unknown };

	const BARS = 20;
	const SR: any =
		typeof window !== 'undefined' &&
		((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

	let active = $state(false); // Aufnahme läuft
	let error = $state('');
	let bars = $state<number[]>(Array(BARS).fill(0));

	// Voice-Backend-Status (OpenRouter): Mikro sperren, wenn kein gültiger Key /
	// keine Credits — mit Tooltip + Popup, statt erst nach dem Senden zu scheitern.
	type Reason = 'loading' | 'no-key' | 'invalid-key' | 'no-credits' | 'error' | null;
	const MSG: Record<NonNullable<Reason>, string> = {
		loading: 'Sprachdienst wird geprüft…',
		'no-key': 'Kein OpenRouter-API-Key — in den Einstellungen hinterlegen.',
		'invalid-key': 'OpenRouter-API-Key ungültig.',
		'no-credits': 'Keine Credits mehr verfügbar.',
		error: 'Sprachdienst nicht erreichbar.'
	};
	let reason = $state<Reason>('loading');
	let popup = $state(false);
	let popupTimer = 0;
	const blocked = $derived(reason !== null);

	onMount(async () => {
		try {
			const r = await fetch('/api/voice-status');
			reason = r.ok ? ((await r.json()).reason ?? null) : 'error';
		} catch {
			reason = 'error';
		}
	});

	function blockedClick() {
		popup = true;
		clearTimeout(popupTimer);
		popupTimer = window.setTimeout(() => (popup = false), 4000);
	}

	let convoOpen = $state(false);
	let convo = $state<ChatMsg[]>([]); // sichtbare Verlauf (nur user/assistant-Text)
	let history: ApiMsg[] = []; // vollständige API-Konversation (inkl. system/tool)
	let busy = $state(false); // wartet auf KI
	let draft = $state(''); // Tipp-Antwort / Fallback-Eingabe

	let stream: MediaStream | null = null;
	let ctx: AudioContext | null = null;
	let raf = 0;
	let rec: any = null;
	let transcript = '';

	async function start() {
		error = '';
		transcript = '';
		try {
			stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch {
			error = 'Kein Mikrofonzugriff';
			return;
		}
		// Pegel-Visualisierung
		ctx = new AudioContext();
		const src = ctx.createMediaStreamSource(stream);
		const an = ctx.createAnalyser();
		an.fftSize = 128;
		src.connect(an);
		const freq = new Uint8Array(an.frequencyBinCount);
		active = true;
		const tick = () => {
			an.getByteFrequencyData(freq);
			const next = new Array(BARS);
			const usable = Math.max(BARS, Math.floor(freq.length * 0.6));
			const span = Math.floor(usable / BARS);
			for (let i = 0; i < BARS; i++) {
				let m = 0;
				for (let j = 0; j < span; j++) m = Math.max(m, freq[i * span + j]);
				next[i] = m / 255;
			}
			bars = next;
			raf = requestAnimationFrame(tick);
		};
		tick();

		// Spracherkennung (parallel zur Pegelanzeige)
		if (SR) {
			rec = new SR();
			rec.lang = 'de-DE';
			rec.continuous = true;
			rec.interimResults = false;
			rec.onresult = (e: any) => {
				for (let i = e.resultIndex; i < e.results.length; i++) {
					if (e.results[i].isFinal) transcript += e.results[i][0].transcript + ' ';
				}
			};
			rec.onerror = (e: any) => {
				if (e.error === 'not-allowed') error = 'Kein Mikrofonzugriff';
			};
			rec.start();
		}
	}

	function stopCapture() {
		active = false;
		bars = Array(BARS).fill(0);
		if (raf) cancelAnimationFrame(raf);
		try {
			rec?.stop();
		} catch {
			/* schon gestoppt */
		}
		rec = null;
		stream?.getTracks().forEach((t) => t.stop());
		ctx?.close();
		stream = null;
		ctx = null;
	}

	function cancel() {
		stopCapture();
		transcript = '';
	}

	async function confirm() {
		stopCapture();
		const text = transcript.trim();
		if (!text) {
			error = SR ? 'Nichts verstanden — bitte erneut.' : 'Spracherkennung nicht verfügbar — bitte tippen.';
			convoOpen = SR ? convoOpen : true; // ohne SR direkt Tipp-Panel öffnen
			return;
		}
		await send(text);
	}

	async function send(text: string) {
		error = '';
		convoOpen = true;
		convo = [...convo, { role: 'user', content: text }];
		history = [...history, { role: 'user', content: text }];
		busy = true;
		// Client-Timeout, damit ein hängender Request nicht ewig "KI denkt nach…" zeigt.
		const ctrl = new AbortController();
		const timer = window.setTimeout(() => ctrl.abort(), 150_000);
		try {
			const res = await fetch('/api/narrate', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ messages: history }),
				signal: ctrl.signal
			});
			if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.message || `Fehler ${res.status}`);
			const data = await res.json();
			history = data.messages;
			convo = [...convo, { role: 'assistant', content: data.reply || '(keine Antwort)' }];
			if (data.wrote) await invalidateAll(); // Graph live aktualisieren
		} catch (e) {
			error =
				e instanceof Error && e.name === 'AbortError'
					? 'Zeitüberschreitung (150 s) — Modell zu langsam, in den Einstellungen ein anderes wählen.'
					: e instanceof Error
						? e.message
						: 'Anfrage fehlgeschlagen';
			// Persistente Ursache → Mikro grau schalten (OpenRouter meldet "402"/"401").
			if (/402|credit|insufficient/i.test(error)) reason = 'no-credits';
			else if (/401|api.?key|unauthor/i.test(error)) reason = 'invalid-key';
		} finally {
			window.clearTimeout(timer);
			busy = false;
		}
	}

	function submitDraft() {
		const t = draft.trim();
		if (!t || busy) return;
		draft = '';
		send(t);
	}

	function closeConvo() {
		convoOpen = false;
		convo = [];
		history = [];
		draft = '';
		error = '';
	}

	onDestroy(stopCapture);
</script>

{#if convoOpen}
	<!-- Erzähl-Dialog: Verlauf + Rückfragen + Antwort (tippen oder Mikro) -->
	<div class="flex w-80 max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-line bg-card shadow-xl">
		<div class="flex items-center justify-between border-b border-line px-3 py-2">
			<b class="text-sm">Erzählung</b>
			<button type="button" onclick={closeConvo} class="text-mut hover:text-ink" aria-label="Schließen">✕</button>
		</div>
		<div class="flex max-h-80 flex-col gap-2 overflow-y-auto px-3 py-2 text-sm">
			{#each convo as m}
				<div class="flex {m.role === 'user' ? 'justify-end' : 'justify-start'}">
					<span class="max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-1.5 {m.role === 'user' ? 'bg-accent text-white' : 'bg-bg text-ink'}">{m.content}</span>
				</div>
			{/each}
			{#if busy}
				<div class="text-xs text-mut">KI denkt nach…</div>
			{/if}
			{#if error}
				<div class="text-xs text-warn">{error}</div>
			{/if}
		</div>
		<div class="flex items-center gap-1.5 border-t border-line p-2">
			<input
				bind:value={draft}
				onkeydown={(e) => e.key === 'Enter' && submitDraft()}
				placeholder="Antwort tippen…"
				disabled={busy}
				class="inp btn-sm flex-1"
				aria-label="Antwort"
			/>
			{#if active}
				<button type="button" onclick={confirm} class="grid h-8 w-8 place-items-center rounded-full bg-accent text-white" aria-label="Aufnahme senden">✓</button>
			{:else}
				<button type="button" onclick={start} class="grid h-8 w-8 place-items-center rounded-full border border-line text-ink hover:bg-bg" aria-label="Sprechen" title="Sprechen">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="19" x2="12" y2="22" /></svg>
				</button>
			{/if}
			<button type="button" onclick={submitDraft} disabled={busy || !draft.trim()} class="btn btn-primary btn-sm" aria-label="Senden">Senden</button>
		</div>
	</div>
{:else if active}
	<!-- ChatGPT-style live voice bar -->
	<div class="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 shadow-md">
		<div class="flex h-6 items-center gap-[2px]">
			{#each bars as b}
				<span class="w-[3px] rounded-full bg-accent" style="height:{Math.max(3, b * 24)}px"></span>
			{/each}
		</div>
		<button type="button" onclick={cancel} aria-label="Abbrechen"
			class="grid h-7 w-7 place-items-center rounded-full text-mut hover:bg-bg hover:text-ink">✕</button>
		<button type="button" onclick={confirm} aria-label="Bestätigen"
			class="grid h-7 w-7 place-items-center rounded-full bg-accent text-white hover:opacity-90">✓</button>
	</div>
{:else}
	<div class="relative">
		{#if popup && reason}
			<div class="absolute bottom-full right-0 mb-2 w-56 rounded-lg border border-warn bg-card px-3 py-2 text-[12px] text-warn shadow-lg" role="alert">
				{MSG[reason]}
			</div>
		{/if}
		<button
			type="button"
			onclick={() => (blocked ? blockedClick() : start())}
			aria-label="Mikrofon starten"
			aria-disabled={blocked}
			title={reason ? MSG[reason] : error || 'Erzählen'}
			class="grid h-11 w-11 place-items-center rounded-full border border-line shadow-md transition-colors
				{blocked ? 'cursor-not-allowed bg-card text-mut opacity-50' : error ? 'bg-card text-warn' : 'bg-card text-ink hover:bg-bg'}"
		>
			<!-- mic glyph -->
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="9" y="2" width="6" height="12" rx="3" />
				<path d="M5 10a7 7 0 0 0 14 0" />
				<line x1="12" y1="19" x2="12" y2="22" />
			</svg>
		</button>
	</div>
{/if}
