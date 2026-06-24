<script lang="ts">
	import { enhance } from '$app/forms';
	import ImpreciseTimeInput from './ImpreciseTimeInput.svelte';
	import PersonMultiSelect from './PersonMultiSelect.svelte';
	import type { TimeKind } from '$lib/domain/time';

	interface EventType {
		id: number;
		name: string;
		sensitivity: string;
	}
	interface Person {
		id: number;
		name: string;
	}
	interface Initial {
		name?: string;
		eventTypeId?: number;
		whenKind?: TimeKind;
		whenDate?: string;
		whenText?: string;
		city?: string;
		participantIds?: number[];
		note?: string;
	}
	interface Props {
		eventTypes: EventType[];
		persons: Person[];
		initial?: Initial;
		error?: string | null;
		submitLabel?: string;
		cancelHref: string;
		action?: string;
	}
	let { eventTypes, persons, initial = {}, error, submitLabel = 'Speichern', cancelHref, action }: Props = $props();

	let name = $state(initial.name ?? '');
	let eventTypeId = $state(initial.eventTypeId ?? eventTypes[0]?.id);
	let city = $state(initial.city ?? '');
	let note = $state(initial.note ?? '');
</script>

<form method="POST" {action} use:enhance class="flex max-w-xl flex-col gap-3">
	<div>
		<label class="label" for="ev-name">Name</label>
		<input id="ev-name" name="name" class="inp mt-1" bind:value={name} required placeholder="z. B. Wochenendtrip" />
	</div>

	<div>
		<label class="label" for="ev-type">Typ</label>
		<select id="ev-type" name="eventTypeId" class="inp mt-1" bind:value={eventTypeId}>
			{#each eventTypes as t}
				<option value={t.id}>{t.name}{t.sensitivity === 'sensitive' ? ' (sensibel)' : ''}</option>
			{/each}
		</select>
	</div>

	<div>
		<ImpreciseTimeInput prefix="when" label="Datum" kind={initial.whenKind ?? 'month'} date={initial.whenDate ?? ''} text={initial.whenText ?? ''} />
	</div>

	<div>
		<span class="label">Teilnehmer (mind. 1)</span>
		<PersonMultiSelect {persons} initial={initial.participantIds ?? []} />
	</div>

	<div>
		<label class="label" for="ev-city">Ort (optional)</label>
		<input id="ev-city" name="city" class="inp mt-1" bind:value={city} placeholder="z. B. Ostsee (Stadt/Region genügt)" />
	</div>

	<div>
		<label class="label" for="ev-note">Notiz (optional)</label>
		<textarea id="ev-note" name="note" class="inp mt-1" rows="2" bind:value={note}></textarea>
	</div>

	{#if error}<p class="text-[12px] text-warn">{error}</p>{/if}

	<div class="flex justify-end gap-2">
		<a class="btn" href={cancelHref}>Abbrechen</a>
		<button class="btn btn-primary">{submitLabel}</button>
	</div>
</form>
