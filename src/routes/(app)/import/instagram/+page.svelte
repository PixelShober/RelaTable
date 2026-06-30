<script lang="ts">
	import { enhance } from '$app/forms';
	import Topbar from '$lib/components/Topbar.svelte';
	import type { Followee } from '$lib/server/igImport';

	let { data, form } = $props();

	let fetching = $state(false);
	let importing = $state(false);

	type Row = { username: string; name: string; profilePicUrl: string; selected: boolean; matchPersonId: number | '' };

	let rows = $state<Row[]>([]);
	$effect(() => {
		const f = form?.followees as Followee[] | undefined;
		if (!f) return;
		rows = f.map((x) => {
			const match = data.matchHandle[x.username.toLowerCase()] ?? data.matchName[x.fullName.toLowerCase()] ?? '';
			return {
				username: x.username,
				name: x.fullName || x.username,
				profilePicUrl: x.profilePicUrl,
				selected: !match,
				matchPersonId: match as number | ''
			};
		});
	});

	// After login, data.sessions is stale (server-side load ran before login). Patch it client-side.
	let sessions = $derived(
		form?.loginOk && !data.sessions.includes(form.loginOk as string)
			? [...data.sessions, form.loginOk as string]
			: data.sessions
	);

	let selectedCount = $derived(rows.filter((r) => r.selected).length);

	const selectionJson = () =>
		JSON.stringify(
			rows
				.filter((r) => r.selected)
				.map((r) => ({
					username: r.username,
					name: r.name,
					profilePicUrl: r.profilePicUrl,
					matchPersonId: r.matchPersonId === '' ? null : Number(r.matchPersonId)
				}))
		);

	function toggleAll(on: boolean) {
		rows = rows.map((r) => ({ ...r, selected: on }));
	}
</script>

<Topbar title="Instagram-Import" subtitle="Followings" back={{ href: '/einstellungen', label: 'Einstellungen' }} />

<div class="flex-1 overflow-y-auto p-4">
	<div class="mx-auto max-w-3xl space-y-4">

		{#if sessions.length > 0}
			<!-- Session vorhanden: direkt Followings laden -->
			<section class="card p-3 text-[13px]">
				<b class="text-[13px]">Followings laden</b>
				<form
					method="POST"
					action="?/fetch"
					use:enhance={() => {
						fetching = true;
						return async ({ update }) => { await update({ reset: false }); fetching = false; };
					}}
					class="mt-2 flex items-center gap-2"
				>
					<select name="igUsername" class="inp flex-1">
						{#each sessions as s}
							<option value={s} selected={s === form?.igUsername || s === form?.loginOk}>@{s}</option>
						{/each}
					</select>
					<button class="btn btn-sm btn-primary flex-none" disabled={fetching}>
						{fetching ? 'lädt …' : 'Laden'}
					</button>
				</form>
				{#if form?.fetchError}<p class="mt-2 text-[12px] text-warn">⚠ {form.fetchError}</p>{/if}
				{#if form?.loginOk && !form?.fetchError}
					<p class="mt-1.5 text-[11px] text-ok">✓ Eingeloggt als @{form.loginOk}{form?.followees ? ' — Followings geladen.' : ' — jetzt Laden.'}</p>
				{/if}
			</section>
		{/if}

		<!-- Login (immer sichtbar wenn keine Session, oder als zweite Karte zum Konto hinzufügen) -->
		{#if sessions.length === 0 || true}
			<section class="card p-3 text-[13px]" class:hidden={sessions.length > 0 && rows.length > 0}>
				<b class="text-[13px]">{sessions.length === 0 ? 'Instagram-Login' : 'Weiteres Konto hinzufügen'}</b>
				{#if sessions.length === 0}
					<p class="mt-1 text-[11px] text-mut">Einmalig einloggen — Session wird am Server gespeichert, Followings werden direkt geladen.</p>
				{/if}
				<form
					method="POST"
					action="?/login"
					use:enhance={() => {
						fetching = true;
						return async ({ update }) => { await update({ reset: false }); fetching = false; };
					}}
					class="mt-2 grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2"
				>
					<input name="igUsername" placeholder="benutzername" class="inp" autocomplete="off" />
					<input name="password" type="password" placeholder="passwort" class="inp" autocomplete="off" />
					<input name="code" placeholder="2FA" class="inp w-20" autocomplete="off" inputmode="numeric" />
					<button class="btn btn-sm btn-primary" disabled={fetching}>Einloggen</button>
				</form>
				{#if form?.loginError}<p class="mt-1.5 text-[12px] text-warn">⚠ {form.loginError}</p>{/if}
			</section>
		{/if}

		<!-- Step 2: pick + match -->
		{#if rows.length}
			<section class="card p-3 text-[13px]">
				<div class="flex flex-wrap items-center justify-between gap-2">
					<b class="text-[13px]">Auswählen &amp; zuordnen ({selectedCount}/{rows.length})</b>
					<div class="flex gap-2">
						<button class="btn btn-sm" onclick={() => toggleAll(true)}>Alle</button>
						<button class="btn btn-sm" onclick={() => toggleAll(false)}>Keine</button>
					</div>
				</div>
				<p class="mt-1 text-[11px] text-mut">
					Profilbild &amp; Instagram-Link werden befüllt (Bilder werden überschrieben). „Zuordnen" ergänzt eine vorhandene Person.
				</p>

				<div class="mt-2 space-y-1">
					{#each rows as row (row.username)}
						<div
							class="grid items-center gap-x-2 rounded-md border border-line px-2 py-1.5"
							style="grid-template-columns: 1rem 2.25rem 1fr minmax(0,40%)"
							class:opacity-40={!row.selected}
						>
							<input type="checkbox" bind:checked={row.selected} class="size-4" />
							{#if row.profilePicUrl}
								<img
									src={`/import/instagram/thumb?u=${encodeURIComponent(row.profilePicUrl)}`}
									alt=""
									loading="lazy"
									class="size-9 rounded-full object-cover"
								/>
							{:else}
								<div class="size-9 rounded-full bg-line"></div>
							{/if}
							<div class="min-w-0">
								<input bind:value={row.name} class="inp w-full py-0.5 text-[12px]" />
								<a href={`https://www.instagram.com/${row.username}/`} target="_blank" rel="noreferrer" class="block truncate text-[11px] text-mut hover:text-ink">@{row.username}</a>
							</div>
							<select bind:value={row.matchPersonId} class="inp py-0.5 text-[12px]" title="Auf vorhandene Person zuordnen">
								<option value="">＋ Neu anlegen</option>
								{#each data.persons as p (p.id)}
									<option value={p.id}>↪ {p.name}</option>
								{/each}
							</select>
						</div>
					{/each}
				</div>

				<form
					method="POST"
					action="?/import"
					use:enhance={() => {
						importing = true;
						return async ({ update }) => { await update({ reset: false }); importing = false; };
					}}
					class="mt-3"
				>
					<input type="hidden" name="selection" value={selectionJson()} />
					<button class="btn btn-sm btn-primary" disabled={importing || selectedCount === 0}>
						{importing ? 'importiert …' : `${selectedCount} importieren`}
					</button>
				</form>
				{#if form?.importError}<p class="mt-2 text-[12px] text-warn">⚠ {form.importError}</p>{/if}
				{#if form?.importResult}
					{@const r = form.importResult}
					<p class="mt-2 text-[12px] text-ok">
						✓ {r.created} neu angelegt · {r.updated} ergänzt · {r.imagesSaved} Profilbilder gespeichert.
						<a href="/personen" class="underline">Personen ansehen</a>
					</p>
				{/if}
			</section>
		{/if}
	</div>
</div>
