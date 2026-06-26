<script lang="ts">
	import Topbar from '$lib/components/Topbar.svelte';

	let { data } = $props();

	const todos = $derived(data.items.filter((item) => item.severity === 'todo'));
	const hints = $derived(data.items.filter((item) => item.severity === 'hint'));
</script>

<svelte:head><title>Review: {data.person.name} – RelaTable</title></svelte:head>

<Topbar title={`Review: ${data.person.name}`} subtitle="Profil & direkte Verbindungen" back={{ href: `/graph?focus=${data.person.id}`, label: 'Graph' }}>
	<a class="btn btn-sm" href={`/personen/${data.person.id}`}>Profil</a>
</Topbar>

<div class="flex-1 overflow-auto p-3.5">
	<div class="mx-auto flex max-w-4xl flex-col gap-4">
		<section class="grid gap-2 sm:grid-cols-4">
			<div class="rounded-md border border-line bg-card p-3">
				<div class="text-[11px] text-mut">Offen</div>
				<b class="text-lg">{data.stats.openTodos}</b>
			</div>
			<div class="rounded-md border border-line bg-card p-3">
				<div class="text-[11px] text-mut">Hinweise</div>
				<b class="text-lg">{data.stats.hints}</b>
			</div>
			<div class="rounded-md border border-line bg-card p-3">
				<div class="text-[11px] text-mut">Direkt</div>
				<b class="text-lg">{data.stats.directContacts}</b>
			</div>
			<div class="rounded-md border border-line bg-card p-3">
				<div class="text-[11px] text-mut">Events</div>
				<b class="text-lg">{data.stats.events}</b>
			</div>
		</section>

		<section>
			<b class="text-[13px]">Offene Fragen</b>
			<div class="mt-1.5 flex flex-col gap-2">
				{#each todos as item (item.id)}
					<a href={item.href} class="rounded-md border border-line bg-card p-3 text-sm hover:bg-bg">
						<span class="mb-1 inline-block rounded-sm bg-warn/10 px-1.5 py-0.5 text-[11px] text-warn">{item.kind}</span>
						<b class="block">{item.title}</b>
						<span class="mt-0.5 block text-xs text-mut">{item.detail}</span>
					</a>
				{:else}
					<div class="rounded-md border border-line bg-card p-3 text-sm text-mut">Keine harten offenen Fragen gefunden.</div>
				{/each}
			</div>
		</section>

		<section>
			<b class="text-[13px]">Weitere Hinweise</b>
			<div class="mt-1.5 flex flex-col gap-2">
				{#each hints as item (item.id)}
					<a href={item.href} class="rounded-md border border-line bg-card p-3 text-sm hover:bg-bg">
						<span class="mb-1 inline-block rounded-sm bg-line px-1.5 py-0.5 text-[11px] text-mut">{item.kind}</span>
						<b class="block">{item.title}</b>
						<span class="mt-0.5 block text-xs text-mut">{item.detail}</span>
					</a>
				{:else}
					<div class="rounded-md border border-line bg-card p-3 text-sm text-mut">Keine weiteren Hinweise.</div>
				{/each}
			</div>
		</section>

		<section class="grid gap-4 md:grid-cols-2">
			<div>
				<b class="text-[13px]">Direkte Verbindungen</b>
				<div class="mt-1.5 flex flex-col gap-1.5">
					{#each data.directContacts as contact (contact.id)}
						<a class="rounded-md border border-line bg-card px-3 py-2 text-sm hover:bg-bg" href={`/pair/${data.person.id}-${contact.id}`}>
							<b>{contact.name}</b>
							<span class="ml-1 text-xs text-mut">{contact.typeName ?? 'ohne aktiven Typ'} · {contact.journalCount} Notizen</span>
						</a>
					{:else}
						<div class="rounded-md border border-line bg-card px-3 py-2 text-sm text-mut">Keine direkten Verbindungen.</div>
					{/each}
				</div>
			</div>

			<div>
				<b class="text-[13px]">Gemeinsame Ereignisse</b>
				<div class="mt-1.5 flex flex-col gap-1.5">
					{#each data.events as event (event.id)}
						<div class="rounded-md border border-line bg-card px-3 py-2 text-sm">
							<b>{event.name}</b>
							<div class="text-xs text-mut">{event.typeName} · {event.when}</div>
							<div class="mt-1 text-xs text-mut">{event.participants.map((p) => p.name).join(', ')}</div>
						</div>
					{:else}
						<div class="rounded-md border border-line bg-card px-3 py-2 text-sm text-mut">Keine Ereignisse.</div>
					{/each}
				</div>
			</div>
		</section>
	</div>
</div>
