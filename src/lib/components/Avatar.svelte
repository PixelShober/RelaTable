<script lang="ts">
	import { initials, personImageSrc, type ImageBearer } from '$lib/util';

	interface Props {
		person: ImageBearer & { name: string };
		size?: number;
	}
	let { person, size = 34 }: Props = $props();

	let failed = $state(false);
	const src = $derived(personImageSrc(person));
	const showImg = $derived(!!src && !failed);
</script>

<span
	class="avatar overflow-hidden"
	style="width:{size}px;height:{size}px;font-size:{Math.round(size * 0.36)}px"
	title={person.name}
>
	{#if showImg}
		<img
			src={src}
			alt={person.name}
			class="h-full w-full object-cover"
			onerror={() => (failed = true)}
		/>
	{:else}
		{initials(person.name)}
	{/if}
</span>
