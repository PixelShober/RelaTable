<script lang="ts">
	import { enhance } from '$app/forms';
	import Topbar from '$lib/components/Topbar.svelte';
	import ImpreciseTimeInput from '$lib/components/ImpreciseTimeInput.svelte';

	let { data, form } = $props();
	let toId = $state<number | undefined>(undefined);
	let typeId = $state<number | undefined>(data.types[0]?.id);
</script>

<svelte:head><title>Neue Verbindung – RelaTable</title></svelte:head>

<Topbar title="Neue Verbindung" back={{ href: `/personen/${data.from.id}`, label: data.from.name }} />

<div class="flex-1 overflow-auto p-3.5">
	<form method="POST" use:enhance class="flex max-w-xl flex-col gap-3">
		<input type="hidden" name="fromId" value={data.from.id} />

		<div class="rounded-md border border-line bg-bg/40 p-2.5 text-sm">
			Verbindung für <b>{data.from.name}</b>. Ein Paar ist ungeordnet und existiert nur einmal.
		</div>

		<div>
			<label class="label" for="toId">Zweite Person</label>
			<select id="toId" name="toId" class="inp mt-1" bind:value={toId} required>
				<option value="" disabled selected>Person wählen…</option>
				{#each data.others as p}<option value={p.id}>{p.name}</option>{/each}
			</select>
		</div>

		<div>
			<label class="label" for="typeId">Beziehungstyp</label>
			<select id="typeId" name="typeId" class="inp mt-1" bind:value={typeId}>
				{#each data.types as t}<option value={t.id}>{t.name} ({t.category})</option>{/each}
			</select>
		</div>

		<div>
			<ImpreciseTimeInput prefix="when" label="Gültig ab" kind="month" />
		</div>

		{#if form?.error}<p class="text-[12px] text-warn">{form.error}</p>{/if}

		<div class="flex justify-end gap-2">
			<a class="btn" href={`/personen/${data.from.id}`}>Abbrechen</a>
			<button class="btn btn-primary">Verbindung anlegen</button>
		</div>
	</form>
</div>
