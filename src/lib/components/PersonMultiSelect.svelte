<script lang="ts">
	interface P {
		id: number;
		name: string;
	}
	interface Props {
		persons: P[];
		initial?: number[];
		fieldName?: string;
	}
	let { persons, initial = [], fieldName = 'participantIds' }: Props = $props();

	let selected = $state<number[]>([...initial]);
	let query = $state('');
	let open = $state(false);

	const selectedPersons = $derived(selected.map((id) => persons.find((p) => p.id === id)).filter((p): p is P => !!p));
	const candidates = $derived(
		persons
			.filter((p) => !selected.includes(p.id))
			.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
			.slice(0, 8)
	);

	function add(id: number) {
		if (!selected.includes(id)) selected = [...selected, id];
		query = '';
		open = false;
	}
	function remove(id: number) {
		selected = selected.filter((x) => x !== id);
	}
</script>

{#each selected as id}<input type="hidden" name={fieldName} value={id} />{/each}

<div class="flex flex-wrap items-center gap-1.5">
	{#each selectedPersons as p (p.id)}
		<span class="chip">{p.name}<button type="button" class="ml-1 text-mut hover:text-warn" onclick={() => remove(p.id)} aria-label={`${p.name} entfernen`}>✕</button></span>
	{/each}
</div>

<div class="relative mt-1.5">
	<input
		class="inp"
		placeholder="Person suchen + hinzufügen…"
		bind:value={query}
		onfocus={() => (open = true)}
		oninput={() => (open = true)}
	/>
	{#if open && candidates.length > 0}
		<ul class="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-md border border-line bg-card shadow-lg">
			{#each candidates as p (p.id)}
				<li>
					<button type="button" class="block w-full px-3 py-2 text-left text-sm hover:bg-bg" onclick={() => add(p.id)}>{p.name}</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
