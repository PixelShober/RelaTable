<script lang="ts">
	import type { TimeKind } from '$lib/domain/time';

	interface Props {
		prefix: string;
		label?: string;
		kind?: TimeKind;
		date?: string; // yyyy-mm-dd | yyyy-mm | yyyy depending on kind
		text?: string;
		required?: boolean;
	}
	let { prefix, label, kind = 'month', date = '', text = '', required = false }: Props = $props();

	let curKind = $state<TimeKind>(kind);
	let dayVal = $state(kind === 'day' ? date : '');
	let monthVal = $state(kind === 'month' ? date : '');
	let yearVal = $state(kind === 'year' ? date : '');
	let textVal = $state(kind === 'season' || kind === 'approx' || kind === 'unknown' ? text : '');

	const KINDS: { k: TimeKind; label: string }[] = [
		{ k: 'day', label: 'Tag' },
		{ k: 'month', label: 'Monat' },
		{ k: 'year', label: 'Jahr' },
		{ k: 'season', label: 'Jahreszeit' },
		{ k: 'approx', label: 'ungefähr' },
		{ k: 'unknown', label: 'unbekannt' }
	];

	// The single `${prefix}_date` field the server reads, derived from the active kind.
	const dateField = $derived(
		curKind === 'day' ? dayVal : curKind === 'month' ? monthVal : curKind === 'year' ? yearVal : ''
	);
</script>

{#if label}<span class="label">{label}</span>{/if}
<input type="hidden" name={`${prefix}_kind`} value={curKind} />
<input type="hidden" name={`${prefix}_date`} value={dateField} />

<div class="mt-1 flex flex-wrap overflow-hidden rounded-md border border-line text-xs">
	{#each KINDS as opt}
		<button
			type="button"
			class="border-r border-line px-2.5 py-1 last:border-r-0 {curKind === opt.k ? 'bg-line/60 font-semibold' : ''}"
			onclick={() => (curKind = opt.k)}
		>
			{opt.label}
		</button>
	{/each}
</div>

<div class="mt-1.5">
	{#if curKind === 'day'}
		<input type="date" class="inp" bind:value={dayVal} {required} />
	{:else if curKind === 'month'}
		<input type="month" class="inp" bind:value={monthVal} {required} />
	{:else if curKind === 'year'}
		<input type="number" class="inp" min="1900" max="2100" placeholder="z. B. 2023" bind:value={yearVal} {required} />
	{:else if curKind === 'unknown'}
		<input class="inp" placeholder="unbekannt" disabled />
		<input type="hidden" name={`${prefix}_text`} value="" />
	{:else}
		<input class="inp" placeholder={curKind === 'season' ? 'z. B. Sommer 2022' : 'z. B. Anfang 2023'} bind:value={textVal} {required} />
	{/if}
</div>

{#if curKind === 'season' || curKind === 'approx'}
	<input type="hidden" name={`${prefix}_text`} value={textVal} />
{/if}
