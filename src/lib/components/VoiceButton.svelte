<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { fade, scale } from 'svelte/transition';

	type ChatMsg = { role: 'user' | 'assistant'; content: string };
	type ApiMsg = { role: 'user' | 'assistant'; content: string };

	let { narrateAutoApprove = false, narratePragmaticMode = false } = $props<{
		narrateAutoApprove?: boolean;
		narratePragmaticMode?: boolean;
	}>();

	const BARS = 20;
	const SR: any =
		typeof window !== 'undefined' &&
		((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

	let active = $state(false);
	let error = $state('');
	let bars = $state<number[]>(Array(BARS).fill(0));

	type Reason = 'checking' | 'no-key' | 'invalid-key' | 'no-credits' | 'error' | null;
	const MSG: Record<NonNullable<Reason>, string> = {
		checking: 'Sprachdienst wird geprüft…',
		'no-key': 'Kein OpenRouter-API-Key — in den Einstellungen hinterlegen.',
		'invalid-key': 'OpenRouter-API-Key ungültig.',
		'no-credits': 'Keine Credits mehr verfügbar.',
		error: 'Sprachdienst nicht erreichbar.'
	};
	let reason = $state<Reason>(null);
	let statusMsg = $state('');
	let popup = $state(false);
	let popupTimer = 0;
	const blocked = $derived(reason !== null);
	let dimmed = $state(false);
	let convoOpen = $state(false);
	let convo = $state<ChatMsg[]>([]);
	let history: ApiMsg[] = [];
	let busy = $state(false);
	let draft = $state('');
	let msgList = $state<HTMLDivElement>();

	async function scrollToBottom() {
		await tick();
		requestAnimationFrame(() => msgList?.scrollTo({ top: msgList.scrollHeight }));
	}

	type VoicePhase = 'idle' | 'recording' | 'processing' | 'updating' | 'done' | 'error';
	let phase = $state<VoicePhase>('idle');
	let doneTimer = 0;
	const PHASE_MSG: Record<VoicePhase, string> = {
		idle: '',
		recording: 'Hört zu…',
		processing: 'Prompt läuft…',
		updating: 'Daten werden aktualisiert…',
		done: 'Antwort bereit',
		error: 'Fehler'
	};
	const compactAutoMode = $derived(narrateAutoApprove && narratePragmaticMode);
	const voiceStatus = $derived(
		reason === 'checking'
			? ''
			: active
				? PHASE_MSG.recording
				: busy
					? PHASE_MSG.processing
					: phase !== 'idle'
						? phase === 'done' && compactAutoMode
							? 'Aktualisiert'
							: PHASE_MSG[phase]
							: ''
	);

	function logClientEvent(event: string, fields: Record<string, unknown> = {}) {
		void fetch('/api/client-log', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				event,
				path: window.location.pathname,
				userAgent: navigator.userAgent,
				speechRecognition: Boolean(SR),
				...fields
			})
		}).catch(() => {
			/* diagnostics must never break the UI */
		});
	}

	onMount(() => {
		const onDim = (event: Event) => {
			const detail = (event as CustomEvent<{ dimmed?: boolean }>).detail;
			dimmed = Boolean(detail?.dimmed);
		};
		window.addEventListener('graph-voice-button-dim', onDim as EventListener);

		// Let the routed page render and restore graph focus before showing the
		// voice backend validation state.
		const timer = window.setTimeout(async () => {
			reason = 'checking';
			try {
				const r = await fetch('/api/voice-status');
				const data = await r.json().catch(() => ({}));
				reason = r.ok ? (data.reason ?? null) : 'error';
				if (data.message) statusMsg = data.message;
			} catch {
				reason = 'error';
			}
		}, 900);
		return () => {
			window.removeEventListener('graph-voice-button-dim', onDim as EventListener);
			window.clearTimeout(timer);
		};
	});

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
		interimTranscript = '';
		stream?.getTracks().forEach((t) => t.stop());
		void ctx?.close();
		stream = null;
		ctx = null;
	}

	function blockedClick() {
		popup = true;
		clearTimeout(popupTimer);
		popupTimer = window.setTimeout(() => (popup = false), 4000);
	}

	let stream: MediaStream | null = null;
	let ctx: AudioContext | null = null;
	let raf = 0;
	let rec: any = null;
	let transcript = $state('');
	let interimTranscript = $state('');
	let lastInterimTranscript = '';

	// Overlay is open while recording or while a conversation is in progress.
	const overlayOpen = $derived(active || convoOpen);

	async function openAndStart() {
		if (blocked) {
			blockedClick();
			return;
		}
		await start();
	}

	async function start() {
		error = '';
		transcript = '';
		interimTranscript = '';
		lastInterimTranscript = '';
		phase = 'recording';
		if (!SR) {
			logClientEvent('speech.unsupported');
			error = 'Spracherkennung nicht verfügbar — tippe deine Eingabe.';
			phase = 'error';
			active = true; // show recording overlay with text input
			return;
		}
		// Use synthetic pulse bars; a parallel WebAudio mic stream can starve SpeechRecognition on Android.
		const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
		logClientEvent('speech.visualizer_fallback', { reason: 'sr_active', android: isAndroid });
		active = true;
		let t = 0;
		const tick = () => {
			t += 0.08;
			bars = Array.from({ length: BARS }, (_, i) => 0.15 + 0.12 * Math.sin(t + i * 0.4));
			raf = requestAnimationFrame(tick);
		};
		tick();

		rec = new SR();
		rec.lang = 'de-DE';
		rec.continuous = !isAndroid;
		rec.interimResults = true;
		rec.onresult = (e: any) => {
			let interim = '';
			for (let i = e.resultIndex; i < e.results.length; i++) {
				if (e.results[i].isFinal) {
					transcript += e.results[i][0].transcript + ' ';
					lastInterimTranscript = '';
				} else {
					interim += e.results[i][0].transcript;
				}
			}
			interimTranscript = interim;
			if (interim.trim()) lastInterimTranscript = interim;
			logClientEvent('speech.recognition_result', {
				finalChars: transcript.trim().length,
				interimChars: interim.trim().length
			});
			console.log('[SR] result — final:', JSON.stringify(transcript), 'interim:', JSON.stringify(interim));
		};
		rec.onerror = (e: any) => {
			const code = String(e.error ?? 'unknown');
			console.warn('[SR] error:', code, e.message);
			logClientEvent('speech.recognition_error', {
				errorCode: code,
				errorMessage: e.message ? String(e.message) : undefined,
				phase,
				hadTranscript: Boolean(transcript.trim() || interimTranscript.trim())
			});
			if (code === 'no-speech') {
				error = 'Noch nichts verstanden — sprich bitte weiter oder tippe unten.';
				return;
			}
			if (code === 'aborted') return;
			if (code === 'not-allowed') {
				error = 'Kein Mikrofonzugriff — bitte Browser-Berechtigung erlauben.';
			} else if (code === 'service-not-allowed' || code === 'network') {
				// Chromium on Linux without embedded Google key — silently fall through to text input
				stopCapture();
				active = true;
				error = 'Spracherkennung nicht verfügbar — tippe deine Eingabe.';
				phase = 'error';
				return;
			} else if (code === 'audio-capture') {
				error = 'Mikrofon nicht verfügbar — Eingabegerät prüfen.';
			} else if (code === 'language-not-supported') {
				error = 'Deutsch wird von dieser Browser-Spracherkennung nicht unterstützt.';
			} else {
				error = `Spracherkennungsfehler: ${code}`;
			}
			phase = 'error';
			stopCapture();
			convoOpen = true;
			void scrollToBottom();
		};
		rec.onstart = () => {
			logClientEvent('speech.recognition_started');
			console.log('[SR] started');
		};
		rec.onend = () => {
			console.log('[SR] ended, active:', active);
			interimTranscript = '';
			// On mobile, SR auto-stops after silence — restart if still recording
			if (active && rec) {
				try {
					rec.start();
				} catch {
					/* already started */
				}
			}
		};
		try {
			rec.start();
		} catch (e) {
			logClientEvent('speech.start_failed', {
				errorName: e instanceof Error ? e.name : undefined,
				errorMessage: e instanceof Error ? e.message : String(e)
			});
			error = 'Spracherkennung konnte nicht gestartet werden — bitte erneut versuchen oder Text eingeben.';
			phase = 'error';
			stopCapture();
			convoOpen = true;
			void scrollToBottom();
		}
	}

	function cancel() {
		stopCapture();
		transcript = '';
		interimTranscript = '';
		lastInterimTranscript = '';
		phase = 'idle';
	}

	async function confirm() {
		const text = [transcript, interimTranscript || lastInterimTranscript].join(' ').trim();
		stopCapture();
		if (!text) {
			logClientEvent('speech.empty_confirm', {
				hadFinal: Boolean(transcript.trim()),
				hadInterim: Boolean(interimTranscript.trim() || lastInterimTranscript.trim())
			});
			error = SR
				? 'Nichts verstanden — bitte erneut.'
				: 'Spracherkennung nicht verfügbar — bitte tippen.';
			phase = 'error';
			convoOpen = true;
			void scrollToBottom();
			return;
		}
		await send(text, { compact: compactAutoMode });
	}

	async function send(text: string, opts: { compact?: boolean } = {}) {
		const compact = !!opts.compact;
		clearTimeout(doneTimer);
		error = '';
		phase = 'processing';
		convoOpen = !compact;
		const userMessage: ApiMsg = { role: 'user', content: text };
		const nextHistory: ApiMsg[] = compact ? [userMessage] : [...history, userMessage].slice(-16);
		if (compact) {
			convo = [];
			draft = '';
		} else {
			convo = [...convo, { role: 'user', content: text }];
			void scrollToBottom();
		}
		history = nextHistory;
		busy = true;
		if (!compact) void scrollToBottom();
		const ctrl = new AbortController();
		const timer = window.setTimeout(() => ctrl.abort(), 150_000);
		try {
			const res = await fetch('/api/narrate', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ messages: nextHistory }),
				signal: ctrl.signal
			});
			if (!res.ok)
				throw new Error((await res.json().catch(() => ({})))?.message || `Fehler ${res.status}`);
			const resp = await res.json();
			const reply = resp.reply || '(keine Antwort)';
			if (compact) {
				history = [];
				convo = [];
				convoOpen = false;
			} else {
				const assistantMessage: ApiMsg = { role: 'assistant', content: reply };
				history = [...nextHistory, assistantMessage].slice(-16);
				convo = [...convo, { role: 'assistant', content: reply }];
				void scrollToBottom();
			}
			if (resp.wrote) {
				phase = 'updating';
				await invalidateAll();
			}
			phase = 'done';
			doneTimer = window.setTimeout(() => (phase = 'idle'), 3000);
		} catch (e) {
			error =
				e instanceof Error && e.name === 'AbortError'
					? 'Zeitüberschreitung (150 s) — Modell zu langsam, in den Einstellungen ein anderes wählen.'
					: e instanceof Error
						? e.message
						: 'Anfrage fehlgeschlagen';
			phase = 'error';
			if (/402|credit|insufficient/i.test(error)) reason = 'no-credits';
			else if (/401|api.?key|unauthor/i.test(error)) reason = 'invalid-key';
			if (compact) {
				convoOpen = false;
			} else {
				void scrollToBottom();
			}
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
		phase = 'idle';
		clearTimeout(doneTimer);
	}

	onDestroy(() => {
		clearTimeout(doneTimer);
		stopCapture();
		dimmed = false;
	});
</script>

<!-- Global FAB: visible when no overlay is open -->
{#if !overlayOpen}
	<div
		data-testid="voice-fab"
		class="fixed bottom-[70px] right-4 z-40 transition-opacity duration-200 md:bottom-6 md:right-6 {dimmed && !blocked ? 'opacity-35' : 'opacity-100'}"
		transition:scale={{ duration: 200, start: 0.8 }}
	>
		{#if popup && reason}
			<div
				class="absolute bottom-full right-0 mb-2 w-56 rounded-lg border border-warn bg-card px-3 py-2 text-[12px] text-warn shadow-lg"
				role="alert"
			>
				{statusMsg || MSG[reason]}
			</div>
		{/if}
		{#if voiceStatus && !popup}
			<div
				class="absolute bottom-full right-0 mb-2 max-w-[220px] rounded-lg border border-line bg-card px-3 py-1.5 text-[12px] text-ink shadow-lg"
				role="status"
				aria-live="polite"
			>
				{voiceStatus}
			</div>
		{/if}
		<button
			type="button"
			onclick={openAndStart}
			aria-label="Mikrofon starten"
			aria-disabled={blocked}
			title={reason ? (statusMsg || MSG[reason]) : error || 'Erzählen'}
			class="grid h-14 w-14 place-items-center rounded-full shadow-lg transition-all duration-200
				{blocked
				? 'cursor-not-allowed border border-line bg-card text-mut opacity-50'
				: error
					? 'border border-warn bg-card text-warn'
					: dimmed
						? 'bg-accent text-white active:scale-95'
						: 'bg-accent text-white hover:opacity-90 active:scale-95'}"
		>
			<svg
				width="26"
				height="26"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<rect x="9" y="2" width="6" height="12" rx="3" />
				<path d="M5 10a7 7 0 0 0 14 0" />
				<line x1="12" y1="19" x2="12" y2="22" />
			</svg>
		</button>
	</div>
{/if}

<!-- Full-screen overlay: recording or conversation -->
{#if overlayOpen}
	<div
		class="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		{#if convoOpen}
			<!-- Conversation panel -->
			<div class="flex flex-1 items-center justify-center p-4">
				<div
					class="flex w-full max-w-md flex-col rounded-2xl border border-line bg-card shadow-xl"
					transition:scale={{ duration: 250, start: 0.92 }}
				>
					<div class="flex items-center justify-between border-b border-line px-4 py-3">
						<b class="text-sm">Erzählung</b>
						{#if voiceStatus}
							<span class="rounded-full border border-line px-2 py-0.5 text-[11px] text-mut" role="status" aria-live="polite">
								{voiceStatus}
							</span>
						{/if}
						<button
							type="button"
							onclick={closeConvo}
							class="text-mut hover:text-ink"
							aria-label="Schließen">✕</button
						>
					</div>
					<div
						bind:this={msgList}
						data-testid="voice-convo-messages"
						class="flex max-h-96 flex-col gap-2 overflow-y-auto px-4 py-3 text-sm"
					>
						{#each convo as m}
							<div class="flex {m.role === 'user' ? 'justify-end' : 'justify-start'}">
								<span
									class="max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-1.5
										{m.role === 'user' ? 'bg-accent text-white' : 'bg-bg text-ink'}"
								>{m.content}</span>
							</div>
						{/each}
						{#if busy}
							<div class="flex items-center gap-2 text-xs text-mut" role="status" aria-live="polite">
								<span class="h-2 w-2 rounded-full bg-accent"></span>
								{voiceStatus || 'Prompt läuft…'}
							</div>
						{/if}
						{#if error}
							<div class="text-xs text-warn">{error}</div>
						{/if}
					</div>
					<div class="flex items-center gap-1.5 border-t border-line p-3">
						<input
							bind:value={draft}
							onkeydown={(e) => e.key === 'Enter' && submitDraft()}
							placeholder="Antwort tippen…"
							disabled={busy}
							class="inp btn-sm flex-1"
							aria-label="Antwort"
						/>
						{#if active}
							<button
								type="button"
								onclick={confirm}
								class="grid h-8 w-8 place-items-center rounded-full bg-accent text-white"
								aria-label="Aufnahme senden">✓</button
							>
						{:else}
							<button
								type="button"
								onclick={start}
								class="grid h-8 w-8 place-items-center rounded-full border border-line text-ink hover:bg-bg"
								aria-label="Sprechen"
								title="Sprechen"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><rect x="9" y="2" width="6" height="12" rx="3" /><path
										d="M5 10a7 7 0 0 0 14 0"
									/><line x1="12" y1="19" x2="12" y2="22" /></svg
								>
							</button>
						{/if}
						<button
							type="button"
							onclick={submitDraft}
							disabled={busy || !draft.trim()}
							class="btn btn-primary btn-sm"
							aria-label="Senden">Senden</button
						>
					</div>
				</div>
			</div>
		{:else}
			<!-- Recording UI: large mic + level bars + controls -->
			<div class="flex flex-1 flex-col items-center justify-center gap-8">
				<!-- Level visualiser: bars grow upward from baseline -->
				<div class="flex h-16 items-end gap-[3px]">
					{#each bars as b}
						<span
							class="w-1 rounded-full bg-white/70 transition-[height] duration-75"
							style="height:{Math.max(4, b * 64)}px"
						></span>
					{/each}
				</div>

				<!-- Live transcript display -->
				{#if transcript || interimTranscript}
					<div class="max-w-xs rounded-xl bg-black/40 px-4 py-2 text-center text-sm text-white/90">
						{transcript}<span class="text-white/50 italic">{interimTranscript}</span>
					</div>
				{/if}

				<!-- Big mic button: tap = confirm and send -->
				<button
					type="button"
					onclick={confirm}
					class="grid h-20 w-20 place-items-center rounded-full bg-accent text-white shadow-2xl ring-8 ring-accent/25 transition-transform active:scale-95"
					aria-label="Aufnahme bestätigen und senden"
					transition:scale={{ duration: 300, start: 0.5 }}
				>
					<svg
						width="36"
						height="36"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect x="9" y="2" width="6" height="12" rx="3" />
						<path d="M5 10a7 7 0 0 0 14 0" />
						<line x1="12" y1="19" x2="12" y2="22" />
					</svg>
				</button>

				<p class="text-sm text-white/70">Tippe zum Senden</p>
				{#if voiceStatus}
					<p class="rounded-lg bg-black/30 px-3 py-1.5 text-xs text-white/90" role="status" aria-live="polite">
						{voiceStatus}
					</p>
				{/if}

				{#if error}
					<p class="rounded-lg bg-black/30 px-3 py-1.5 text-xs text-warn">{error}</p>
				{/if}

				<!-- Cancel (✕) and confirm (✓) -->
				<div class="flex gap-6">
					<button
						type="button"
						onclick={cancel}
						class="grid h-12 w-12 place-items-center rounded-full border-2 border-white/30 text-white transition-colors hover:border-white/60 hover:bg-white/10"
						aria-label="Abbrechen"
					>✕</button>
					<button
						type="button"
						onclick={confirm}
						class="grid h-12 w-12 place-items-center rounded-full bg-white text-accent shadow-lg transition-all hover:bg-white/90 active:scale-95"
						aria-label="Bestätigen und senden"
					>✓</button>
				</div>

				<div class="flex w-full max-w-xs gap-2 px-4">
					<input
						bind:value={draft}
						onkeydown={(e) => { if (e.key === 'Enter') { stopCapture(); submitDraft(); } }}
						placeholder="Eingabe tippen…"
						class="inp flex-1 text-sm"
						aria-label="Text eingeben"
					/>
					<button
						type="button"
						onclick={() => { stopCapture(); submitDraft(); }}
						disabled={!draft.trim()}
						class="btn btn-primary btn-sm"
					>Senden</button>
				</div>
			</div>
		{/if}
	</div>
{/if}
