<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	let { form } = $props();
	const redirectTo = $derived($page.url.searchParams.get('redirect') ?? '');
</script>

<svelte:head><title>RelaTable – Anmelden</title></svelte:head>

<div class="flex min-h-screen items-center justify-center bg-bg p-6">
	<div class="card w-full max-w-sm p-6 shadow-sm">
		<div class="mb-4 text-center">
			<h1 class="text-lg font-semibold">RelaTable</h1>
			<p class="text-xs text-mut">Anmelden</p>
		</div>

		<form method="POST" use:enhance>
			<input type="hidden" name="redirect" value={redirectTo} />
			<label class="label" for="password">Passwort</label>
			<input id="password" name="password" type="password" class="inp mb-2 mt-1" placeholder="••••••••" required />

			{#if form?.error}
				<p class="mb-2 rounded border border-warn bg-warn/10 px-2 py-1.5 text-[12px] text-warn" role="alert">
					{form.error}
				</p>
			{/if}

			<label class="mb-3 mt-1 flex items-center gap-2 text-xs">
				<input type="checkbox" name="remember" checked /> Angemeldet bleiben
			</label>

			<button class="btn btn-primary w-full justify-center">Anmelden</button>
		</form>
	</div>
</div>
