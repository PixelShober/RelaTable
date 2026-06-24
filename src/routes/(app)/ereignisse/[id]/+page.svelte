<script lang="ts">
	import { enhance } from '$app/forms';
	import Topbar from '$lib/components/Topbar.svelte';
	import EventForm from '$lib/components/EventForm.svelte';
	let { data, form } = $props();
	let confirmDelete = $state(false);
</script>

<svelte:head><title>{data.initial.name} – RelaTable</title></svelte:head>

<Topbar title="Ereignis bearbeiten" back={{ href: '/ereignisse', label: 'Ereignisse' }}>
	<button class="btn btn-warn btn-sm" onclick={() => (confirmDelete = true)}>Löschen</button>
</Topbar>

<div class="flex-1 overflow-auto p-3.5">
	<EventForm
		eventTypes={data.eventTypes}
		persons={data.persons}
		initial={data.initial}
		error={form?.error}
		submitLabel="Speichern"
		cancelHref="/ereignisse"
		action="?/update"
	/>
</div>

{#if confirmDelete}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
		<div class="card w-full max-w-sm">
			<div class="border-b border-line p-3.5 font-semibold">Ereignis „{data.initial.name}" löschen?</div>
			<div class="p-3.5 text-sm text-mut">Das Ereignis wird endgültig entfernt. Teilnehmer und Personen bleiben erhalten.</div>
			<div class="flex justify-end gap-2 border-t border-line p-3.5">
				<button class="btn" onclick={() => (confirmDelete = false)}>Abbrechen</button>
				<form method="POST" action="?/delete" use:enhance><button class="btn btn-warn">Endgültig löschen</button></form>
			</div>
		</div>
	</div>
{/if}
