<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { storedTheme, applyTheme, initThemeWatcher } from '$lib/theme';
	import { page } from '$app/stores';

	let { children, data } = $props();

	onMount(() => {
		// Sync the document class with the owner's saved preference on first load.
		const serverTheme = (data?.user?.themePreference as 'System' | 'Light' | 'Dark') ?? storedTheme();
		applyTheme(serverTheme);
		return initThemeWatcher(() => storedTheme());
	});
</script>

{@render children()}
