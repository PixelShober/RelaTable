<script lang="ts">
	import Topbar from '$lib/components/Topbar.svelte';
	import EventForm from '$lib/components/EventForm.svelte';
	let { data, form } = $props();
</script>

<svelte:head><title>Neues Ereignis – RelaTable</title></svelte:head>

<Topbar title="Neues Ereignis" back={{ href: '/ereignisse', label: 'Ereignisse' }} />

<div class="flex-1 overflow-auto p-3.5">
	<EventForm
		eventTypes={data.eventTypes}
		persons={data.persons}
		initial={{ participantIds: data.prefill }}
		error={form?.error}
		submitLabel="Speichern"
		cancelHref="/ereignisse"
	/>
</div>
