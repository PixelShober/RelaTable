<script lang="ts">
	import { page } from '$app/stores';
	import { NAV_ITEMS, MOBILE_TABS, isActive } from '$lib/nav';
	import VoiceButton from '$lib/components/VoiceButton.svelte';

	let { children, data } = $props();

	let pinned = $state(data.railPinned);
	let hovered = $state(false);
	let focused = $state(false);
	let moreOpen = $state(false);

	const expanded = $derived(pinned || hovered || focused);
	const path = $derived($page.url.pathname);

	async function togglePin() {
		pinned = !pinned;
		await fetch('/api/setting', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ key: 'railPinned', value: String(pinned) })
		}).catch(() => {});
	}
</script>

<div class="flex h-screen w-screen overflow-hidden bg-bg">
	<!-- Desktop icon rail (SCR-003) -->
	<nav
		class="hidden flex-none flex-col gap-1 border-r border-line bg-rail p-2 transition-[width] duration-150 md:flex {expanded
			? 'w-48 items-stretch'
			: 'w-14 items-center'}"
		aria-label="Hauptnavigation"
		onmouseenter={() => (hovered = true)}
		onmouseleave={() => (hovered = false)}
		onfocusin={() => (focused = true)}
		onfocusout={() => (focused = false)}
	>
		<button
			class="mb-1 flex h-7 items-center gap-2 rounded-md px-2 text-[11px] text-mut hover:bg-line/40 {expanded
				? 'justify-end'
				: 'justify-center'}"
			onclick={togglePin}
			title={pinned ? 'Rail lösen' : 'Rail anheften'}
			aria-pressed={pinned}
		>
			<span>📌</span>
			{#if expanded}<span>{pinned ? 'gelöst' : 'anheften'}</span>{/if}
		</button>

		{#each NAV_ITEMS as item}
			{@const active = isActive(path, item.match)}
			<a
				href={item.href}
				class="flex h-9 items-center gap-2.5 rounded-md px-2 text-ink hover:bg-line/40 {active
					? 'bg-line/60 font-semibold'
					: ''} {expanded ? '' : 'justify-center'}"
				aria-current={active ? 'page' : undefined}
				aria-label={item.label}
				title={item.label}
			>
				<span
					class="flex h-6 w-6 flex-none items-center justify-center rounded border border-line bg-card text-[13px]"
					aria-hidden="true">{item.icon}</span
				>
				{#if expanded}<span class="whitespace-nowrap text-sm">{item.label}</span>{/if}
			</a>
		{/each}

		<div class="flex-1"></div>
		<form method="POST" action="/logout">
			<button
				class="flex h-9 w-full items-center gap-2.5 rounded-md px-2 text-mut hover:bg-line/40 {expanded
					? ''
					: 'justify-center'}"
				title="Abmelden"
				aria-label="Abmelden"
			>
				<span class="flex h-6 w-6 flex-none items-center justify-center rounded border border-line bg-card text-[13px]">⎋</span>
				{#if expanded}<span class="whitespace-nowrap text-sm">Abmelden</span>{/if}
			</button>
		</form>
	</nav>

	<!-- Content -->
	<div class="flex min-w-0 flex-1 flex-col overflow-hidden pb-20 md:pb-0">
		{@render children()}
	</div>

	<!-- Mobile bottom tab bar (SCR-004) -->
	<nav
		class="fixed inset-x-0 bottom-0 z-30 flex h-20 border-t border-line bg-card md:hidden"
		aria-label="Hauptnavigation mobil"
	>
		{#each MOBILE_TABS as tab}
			{@const active = isActive(path, tab.match)}
			<a
				href={tab.href}
				class="flex flex-1 flex-col items-center justify-center gap-1 text-[11px] {active
					? 'font-semibold text-ink'
					: 'text-mut'}"
				aria-current={active ? 'page' : undefined}
			>
				<span class="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-lg {active ? 'bg-line/60' : 'bg-card'}">{tab.icon}</span>
				{tab.label}
			</a>
		{/each}
		<button
			class="flex flex-1 flex-col items-center justify-center gap-1 text-[11px] {moreOpen
				? 'font-semibold text-ink'
				: 'text-mut'}"
			onclick={() => (moreOpen = true)}
		>
			<span class="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-card text-lg">⋯</span>
			Mehr
		</button>
	</nav>

	<!-- Voice input is only part of the graph workflow. -->
	{#if path === '/graph'}
		<VoiceButton
			narrateAutoApprove={data.narrateAutoApprove}
			narratePragmaticMode={data.narratePragmaticMode}
		/>
	{/if}

	<!-- "Mehr" sheet -->
	{#if moreOpen}
		<div
			class="fixed inset-0 z-40 bg-black/40 md:hidden"
			role="button"
			tabindex="-1"
			aria-label="Schließen"
			onclick={() => (moreOpen = false)}
			onkeydown={(e) => e.key === 'Escape' && (moreOpen = false)}
		></div>
		<div class="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-line bg-card p-4 pb-8 md:hidden">
			<div class="mx-auto mb-3 h-1 w-10 rounded-full bg-line"></div>
			<a href="/einstellungen" class="block rounded-md px-3 py-3 hover:bg-bg" onclick={() => (moreOpen = false)}>⚙ Einstellungen</a>
			<div class="my-2 border-t border-line"></div>
			<form method="POST" action="/logout"><button class="w-full rounded-md px-3 py-3 text-left text-warn hover:bg-bg">⎋ Abmelden</button></form>
		</div>
	{/if}
</div>
