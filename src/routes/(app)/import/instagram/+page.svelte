<script lang="ts">
	import { enhance } from '$app/forms';
	import Topbar from '$lib/components/Topbar.svelte';
	import type { Followee } from '$lib/server/igImport';

	let { data, form } = $props();

	let fetching = $state(false);
	let importing = $state(false);

	type Row = { username: string; name: string; profilePicUrl: string; selected: boolean; matchPersonId: number | '' };

	// Rebuild editable rows only when a fetch returns — other form updates (e.g. import result) must not wipe them.
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
				selected: !match, // default: import the ones not already known
				matchPersonId: match as number | ''
			};
		});
	});

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
		<!-- Step 1: load followings -->
		<section class="card p-3 text-[13px]">
			<b class="text-[13px]">1 · Followings laden</b>
			<p class="mt-1 text-[11px] text-mut">
				Nutzt eine gespeicherte instaloader-Session. Einmalig im Terminal anmelden:
				<code>instaloader --login=DEIN_IG_NAME</code>. Danach hier denselben Namen eingeben.
			</p>
			<form
				method="POST"
				action="?/fetch"
				use:enhance={() => {
					fetching = true;
					return async ({ update }) => {
						await update({ reset: false });
						fetching = false;
					};
				}}
				class="mt-2 flex flex-wrap items-center gap-2"
			>
				<input
					name="igUsername"
					value={form?.igUsername ?? ''}
					placeholder="instagram-benutzername"
					class="inp flex-1"
					autocomplete="off"
				/>
				<button class="btn btn-sm btn-primary" disabled={fetching}>{fetching ? 'lädt …' : 'Laden'}</button>
			</form>
			{#if form?.fetchError}<p class="mt-2 text-[12px] text-warn">⚠ {form.fetchError}</p>{/if}

			<details class="mt-3">
				<summary class="cursor-pointer text-[11px] text-mut">Auf gehostetem Server (VPS)?</summary>

				<p class="mt-1.5 text-[11px] text-mut">
					<b>Login (Server):</b> Benutzername, Passwort und — falls 2FA aktiv — den aktuellen Code aus deiner
					Authenticator-App eingeben. Die Session wird am Server gespeichert; danach „Laden" oben.
					Hinweis: Instagram blockt Logins von Server-IPs manchmal mit Checkpoint.
				</p>
				<form
					method="POST"
					action="?/login"
					use:enhance={() => {
						fetching = true;
						return async ({ update }) => {
							await update({ reset: false });
							fetching = false;
						};
					}}
					class="mt-1.5 flex flex-wrap items-center gap-2"
				>
					<input name="igUsername" placeholder="benutzername" class="inp flex-1" autocomplete="off" />
					<input name="password" type="password" placeholder="passwort" class="inp flex-1" autocomplete="off" />
					<input name="code" placeholder="2FA-Code" class="inp w-28" autocomplete="off" inputmode="numeric" />
					<button class="btn btn-sm btn-primary" disabled={fetching}>Einloggen</button>
				</form>
				{#if form?.loginError}<p class="mt-1.5 text-[12px] text-warn">⚠ {form.loginError}</p>{/if}
				{#if form?.loginOk}<p class="mt-1.5 text-[12px] text-ok">✓ Eingeloggt als @{form.loginOk} — jetzt „Laden".</p>{/if}

				<p class="mt-3 text-[11px] text-mut">
					<b>Alternativ:</b> Session einmalig <b>lokal</b> erzeugen — <code>instaloader --login=DEIN_IG_NAME</code> —
					und die Datei <code>~/.config/instaloader/session-NAME</code> hochladen.
				</p>
				<form
					method="POST"
					action="?/session"
					enctype="multipart/form-data"
					use:enhance={() => {
						fetching = true;
						return async ({ update }) => {
							await update({ reset: false });
							fetching = false;
						};
					}}
					class="mt-1.5 flex flex-wrap items-center gap-2"
				>
					<input name="igUsername" placeholder="instagram-benutzername" class="inp flex-1" autocomplete="off" />
					<input name="session" type="file" class="text-[11px]" />
					<button class="btn btn-sm" disabled={fetching}>Session hochladen</button>
				</form>
				{#if form?.sessionError}<p class="mt-1.5 text-[12px] text-warn">⚠ {form.sessionError}</p>{/if}
				{#if form?.sessionSaved}<p class="mt-1.5 text-[12px] text-ok">✓ Session für @{form.sessionSaved} gespeichert — jetzt „Laden".</p>{/if}

				<p class="mt-3 text-[11px] text-mut">
					Alternativ ganz ohne Server-Fetch: lokal <code>python3 scripts/ig_followings.py DEIN_IG_NAME</code> ausführen
					und die Ausgabe einfügen.
				</p>
				<form
					method="POST"
					action="?/paste"
					use:enhance={() => {
						fetching = true;
						return async ({ update }) => {
							await update({ reset: false });
							fetching = false;
						};
					}}
					class="mt-1.5"
				>
					<textarea
						name="json"
						rows="4"
						spellcheck="false"
						class="inp w-full font-mono text-[11px]"
						placeholder={'{"ok":true,"followees":[{"username":"…","full_name":"…","profile_pic_url":"https://…"}]}'}
					></textarea>
					<button class="btn btn-sm mt-1.5" disabled={fetching}>JSON übernehmen</button>
				</form>
			</details>
		</section>

		<!-- Step 2: pick + match -->
		{#if rows.length}
			<section class="card p-3 text-[13px]">
				<div class="flex flex-wrap items-center justify-between gap-2">
					<b class="text-[13px]">2 · Auswählen &amp; zuordnen ({selectedCount}/{rows.length})</b>
					<div class="flex gap-2">
						<button class="btn btn-sm" onclick={() => toggleAll(true)}>Alle</button>
						<button class="btn btn-sm" onclick={() => toggleAll(false)}>Keine</button>
					</div>
				</div>
				<p class="mt-1 text-[11px] text-mut">
					Profilbild &amp; Instagram-Link werden befüllt. „Zuordnen" ergänzt eine vorhandene Person statt eine neue
					anzulegen (Name/Bild bleiben dabei erhalten).
				</p>

				<div class="mt-2 space-y-1.5">
					{#each rows as row (row.username)}
						<div class="flex items-center gap-2.5 rounded-md border border-line p-1.5" class:opacity-50={!row.selected}>
							<input type="checkbox" bind:checked={row.selected} class="size-4 flex-none" />
							{#if row.profilePicUrl}
								<img src={`/import/instagram/thumb?u=${encodeURIComponent(row.profilePicUrl)}`} alt="" loading="lazy" class="size-9 flex-none rounded-full object-cover" />
							{:else}
								<div class="size-9 flex-none rounded-full bg-line"></div>
							{/if}
							<div class="min-w-0 flex-1">
								<input bind:value={row.name} class="inp w-full py-1 text-[12px]" />
								<a href={`https://www.instagram.com/${row.username}/`} target="_blank" rel="noreferrer" class="text-[11px] text-mut hover:text-ink">@{row.username}</a>
							</div>
							<select bind:value={row.matchPersonId} class="inp max-w-[40%] py-1 text-[12px]" title="Auf vorhandene Person zuordnen">
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
						return async ({ update }) => {
							await update({ reset: false });
							importing = false;
						};
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
