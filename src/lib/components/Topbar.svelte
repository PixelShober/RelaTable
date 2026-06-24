<script lang="ts">
	interface Props {
		title: string;
		subtitle?: string;
		back?: { href: string; label: string };
		children?: import('svelte').Snippet;
	}
	let { title, subtitle, back, children }: Props = $props();
</script>

<header class="flex h-12 flex-none items-center gap-2.5 border-b border-line bg-card px-3.5">
	{#if back}
		<a href={back.href} class="text-xs text-mut hover:text-ink">‹ {back.label}</a>
	{/if}
	<b class="text-[15px]">{title}</b>
	{#if subtitle}<span class="text-xs text-mut">· {subtitle}</span>{/if}
	<span class="flex-1"></span>
	{#if children}{@render children()}{/if}
</header>
