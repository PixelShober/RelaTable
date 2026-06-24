<script lang="ts">
	import { page } from '$app/stores';
	import Topbar from '$lib/components/Topbar.svelte';
	import PersonForm from '$lib/components/PersonForm.svelte';
	let { data, form } = $props();

	// Honour the graph deep-link: cancel returns where the user came from.
	const cancelHref = $derived(
		$page.url.searchParams.get('return') === 'graph' ? '/graph' : `/personen/${data.personId}`
	);
</script>

<svelte:head><title>{data.initial.name} bearbeiten – RelaTable</title></svelte:head>

<Topbar title="Person bearbeiten" back={{ href: `/personen/${data.personId}`, label: 'Profil' }} />

<div class="flex-1 overflow-auto p-3.5">
	<PersonForm
		initial={form?.values ?? data.initial}
		errors={form?.errors}
		submitLabel="Speichern"
		{cancelHref}
	/>
</div>
