<script lang="ts">
	// WhatsApp-style circular crop: pan (drag) + zoom (slider/wheel), exports a circular PNG.
	// Pan is clamped so the image always covers the box → the crop never shows empty/dark edges.
	import { cropDrawRect } from '$lib/cropMath';
	interface Props {
		src: string; // object URL of the picked file
		onConfirm: (blob: Blob) => void;
		onCancel: () => void;
	}
	let { src, onConfirm, onCancel }: Props = $props();

	const BOX = 280; // viewport px (square; circle is inscribed)
	const OUT = 320; // output px

	let img = $state<HTMLImageElement | null>(null);
	let nat = $state({ w: 0, h: 0 }); // natural dims, filled on load (0 until then)
	let userScale = $state(1);
	let tx = $state(0);
	let ty = $state(0);
	let dragging = false;
	let startX = 0;
	let startY = 0;

	// Cover scale so the image fills the box at userScale = 1 (needs the real natural size → onload).
	const base = $derived(nat.w ? Math.max(BOX / nat.w, BOX / nat.h) : 1);
	const s = $derived(base * userScale);

	// Keep the image covering the box: max pan = half the overhang of the scaled image past the box.
	function clamp() {
		const maxX = Math.max(0, (s * nat.w - BOX) / 2);
		const maxY = Math.max(0, (s * nat.h - BOX) / 2);
		tx = Math.min(maxX, Math.max(-maxX, tx));
		ty = Math.min(maxY, Math.max(-maxY, ty));
	}

	function onLoad(e: Event) {
		const el = e.currentTarget as HTMLImageElement;
		img = el;
		nat = { w: el.naturalWidth, h: el.naturalHeight };
	}

	function onPointerDown(e: PointerEvent) {
		dragging = true;
		startX = e.clientX - tx;
		startY = e.clientY - ty;
		(e.target as Element).setPointerCapture(e.pointerId);
	}
	function onPointerMove(e: PointerEvent) {
		if (!dragging) return;
		tx = e.clientX - startX;
		ty = e.clientY - startY;
		clamp();
	}
	function onPointerUp() {
		dragging = false;
	}
	function onWheel(e: WheelEvent) {
		e.preventDefault();
		userScale = Math.min(5, Math.max(1, userScale * (e.deltaY < 0 ? 1.08 : 0.92)));
		clamp();
	}

	function confirm() {
		if (!img) return;
		const canvas = document.createElement('canvas');
		canvas.width = OUT;
		canvas.height = OUT;
		const c = canvas.getContext('2d')!;
		// Clip to circle.
		c.beginPath();
		c.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2);
		c.clip();
		const { dx, dy, dw, dh } = cropDrawRect(img.naturalWidth, img.naturalHeight, s, tx, ty, BOX, OUT);
		c.drawImage(img, dx, dy, dw, dh);
		canvas.toBlob((b) => b && onConfirm(b), 'image/png');
	}
</script>

<div class="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true">
	<div class="card w-[320px] max-w-full p-4">
		<h3 class="mb-3 text-sm font-semibold">Bildausschnitt wählen</h3>

		<div
			class="relative mx-auto overflow-hidden rounded-md bg-bg"
			style="width:{BOX}px;height:{BOX}px;touch-action:none"
			onpointerdown={onPointerDown}
			onpointermove={onPointerMove}
			onpointerup={onPointerUp}
			onpointercancel={onPointerUp}
			onwheel={onWheel}
		>
			<!-- svelte-ignore a11y_missing_attribute -->
			<img
				{src}
				onload={onLoad}
				draggable="false"
				class="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
				style="transform: translate(-50%,-50%) translate({tx}px,{ty}px) scale({s}); visibility:{nat.w ? 'visible' : 'hidden'}"
			/>
			<!-- darken everything outside the crop circle -->
			<div
				class="pointer-events-none absolute inset-0"
				style="background: radial-gradient(circle at center, transparent {BOX / 2 - 1}px, rgba(0,0,0,.78) {BOX / 2}px);"
			></div>
		</div>

		<label class="mt-3 flex items-center gap-2 text-xs text-mut">
			Zoom
			<input type="range" min="1" max="5" step="0.01" bind:value={userScale} oninput={clamp} class="flex-1" />
		</label>

		<div class="mt-3 flex justify-end gap-2">
			<button type="button" class="btn btn-sm" onclick={onCancel}>Abbrechen</button>
			<button type="button" class="btn btn-primary btn-sm" onclick={confirm}>Übernehmen</button>
		</div>
	</div>
</div>
