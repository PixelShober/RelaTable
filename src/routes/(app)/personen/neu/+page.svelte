<script lang="ts">
	import Topbar from '$lib/components/Topbar.svelte';
	import PersonForm from '$lib/components/PersonForm.svelte';
	let { form } = $props();
</script>

<svelte:head><title>Neue Person – RelaTable</title></svelte:head>

<Topbar title="Neue Person" back={{ href: '/personen', label: 'Personen' }} />

<div class="flex-1 overflow-auto p-3.5">
	<PersonForm initial={form?.values ?? {}} errors={form?.errors} submitLabel="Speichern" cancelHref="/personen" />
</div>
