<script lang="ts">
	import { enhance } from '$app/forms';
	import { checkPassword, passwordStrength, PASSWORD_MIN_LENGTH } from '$lib/domain/password';

	let { form } = $props();

	let displayName = $state(form?.displayName ?? '');
	let password = $state('');
	let confirm = $state('');

	const check = $derived(checkPassword(password));
	const strength = $derived(passwordStrength(password));
	const allValid = $derived(
		check.minLength && check.upper && check.lower && check.digit && check.special
	);
	const match = $derived(password.length > 0 && password === confirm);
	const canSubmit = $derived(allValid && match);

	const reqs = $derived([
		{ ok: check.minLength, label: `${PASSWORD_MIN_LENGTH}+ Zeichen` },
		{ ok: check.upper, label: 'A-Z' },
		{ ok: check.lower, label: 'a-z' },
		{ ok: check.digit, label: '0-9' },
		{ ok: check.special, label: 'Sonderzeichen' }
	]);
</script>

<svelte:head><title>RelaTable einrichten</title></svelte:head>

<div class="flex min-h-screen items-center justify-center bg-bg p-6">
	<div class="card w-full max-w-lg p-6 shadow-sm">
		<div class="mb-4 text-center">
			<h1 class="text-lg font-semibold">RelaTable einrichten</h1>
			<p class="text-xs text-mut">Einmalige Ersteinrichtung – es wird genau ein Konto angelegt.</p>
		</div>

		<form method="POST" use:enhance>
			<label class="label" for="displayName">Anzeigename</label>
			<input
				id="displayName"
				name="displayName"
				class="inp mb-3 mt-1"
				bind:value={displayName}
				placeholder="Dein Name"
				required
			/>

			<label class="label" for="password">Passwort</label>
			<input
				id="password"
				name="password"
				type="password"
				class="inp mb-1 mt-1"
				bind:value={password}
				placeholder="••••••••"
				required
			/>

			<!-- Strength meter -->
			<div class="mb-1 flex gap-1" aria-hidden="true">
				{#each Array(5) as _, i}
					<div
						class="h-1.5 flex-1 rounded {i < strength
							? strength >= 4
								? 'bg-ok'
								: 'bg-warn'
							: 'bg-line'}"
					></div>
				{/each}
			</div>

			<p class="mb-1 text-[11px] text-mut">
				Regel: ≥ {PASSWORD_MIN_LENGTH} Zeichen · Groß- &amp; Kleinbuchstaben · ≥ 1 Zahl · ≥ 1
				Sonderzeichen
			</p>
			<div class="mb-3 flex flex-wrap gap-2 text-[11px]">
				{#each reqs as r}
					<span class={r.ok ? 'text-ok' : 'text-mut'}>{r.ok ? '✓' : '✗'} {r.label}</span>
				{/each}
			</div>

			<label class="label" for="confirm">Passwort wiederholen</label>
			<input
				id="confirm"
				name="confirm"
				type="password"
				class="inp mb-1 mt-1"
				bind:value={confirm}
				placeholder="••••••••"
				required
			/>
			{#if confirm.length > 0 && !match}
				<p class="mb-2 text-[11px] text-warn">Passwörter stimmen nicht überein.</p>
			{/if}

			{#if form?.errors}
				<p class="mb-2 text-[12px] text-warn">
					{form.errors.password?.[0] ?? form.errors.confirm?.[0] ?? form.errors.displayName?.[0] ?? ''}
				</p>
			{/if}

			<button class="btn btn-primary mt-2 w-full justify-center" disabled={!canSubmit}>
				Konto erstellen &amp; starten
			</button>
		</form>
	</div>
</div>
