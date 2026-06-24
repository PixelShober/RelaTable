<script lang="ts">
	// Dropdown (native <details>) with checkboxes for multi-select filtering.
	interface Props {
		label: string;
		options: string[];
		selected: string[];
		onChange: (values: string[]) => void;
	}
	let { label, options, selected, onChange }: Props = $props();

	function toggle(opt: string, checked: boolean) {
		onChange(checked ? [...selected, opt] : selected.filter((s) => s !== opt));
	}
	const summary = $derived(
		selected.length === 0 ? 'Alle' : selected.length === 1 ? selected[0] : `${selected.length} ausgewählt`
	);
</script>

<details class="relative">
	<summary class="inp flex cursor-pointer list-none items-center justify-between gap-2">
		<span class="truncate {selected.length ? 'text-ink' : 'text-mut'}">{summary}</span>
		<span class="text-mut">▾</span>
	</summary>
	<div class="card absolute z-20 mt-1 max-h-60 w-full min-w-44 overflow-auto p-1 shadow-lg">
		{#each options as opt}
			<label class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-bg">
				<input type="checkbox" checked={selected.includes(opt)} onchange={(e) => toggle(opt, e.currentTarget.checked)} />
				<span class="truncate">{opt}</span>
			</label>
		{:else}
			<div class="px-2 py-1.5 text-xs text-mut">Keine Optionen</div>
		{/each}
	</div>
</details>

<style>
	summary::-webkit-details-marker { display: none; }
</style>
