<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Topbar from '$lib/components/Topbar.svelte';
	let { data } = $props();

	let container: HTMLDivElement;
	let cy: any = null;
	const basePos = new Map<string, { x: number; y: number }>(); // layout positions, restored before each focus
	let layoutName = $state('circle');
	let panel = $state<null | { id: number; name: string; city: string | null; degree: number; x: number; y: number }>(null);
	let menu = $state<null | { id: number; name: string; x: number; y: number }>(null);
	let darkLabels = false;

	let searchOpen = $state(false);
	let searchQ = $state('');
	let searchInput: HTMLInputElement;
	let searchTimer: ReturnType<typeof setTimeout>;
	let longPressTimer: ReturnType<typeof setTimeout> | null = null;
	let suppressTapUntil = 0;

	// Filter only after the user pauses typing for 500ms.
	function onSearchInput() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => applySearch(searchQ), 500);
	}

	const focusId = $derived.by(() => {
		const f = $page.url.searchParams.get('focus');
		return f && /^\d+$/.test(f) ? Number(f) : null;
	});
	const focusName = $derived(data.graph.nodes.find((n) => n.id === focusId)?.name ?? null);

	function buildElements() {
		const nodes = data.graph.nodes.map((n) => ({
			data: { id: String(n.id), name: n.name, image: n.image, degree: n.degree, isolated: n.degree === 0 }
		}));
		const edges = data.graph.edges.map((e) => ({
			data: { id: e.id, source: String(e.source), target: String(e.target), color: e.color }
		}));
		return [...nodes, ...edges];
	}

	function styles(cytoscape: any): any[] {
		const label = darkLabels ? '#ddd' : '#333';
		return [
			{
				selector: 'node',
				style: {
					width: 'data(degree)',
					height: 'data(degree)',
					'background-color': '#ffffff',
					'background-image': 'data(image)',
					'background-fit': 'cover',
					'background-image-crossorigin': 'anonymous',
					'border-width': 2,
					'border-color': '#888',
					label: 'data(name)',
					'font-size': 10,
					color: label,
					'text-valign': 'bottom',
					'text-margin-y': 3,
					'text-wrap': 'wrap',
					'text-max-width': '90px',
					'transition-property': 'opacity, border-width, border-color, overlay-opacity',
					'transition-duration': '0.35s',
					'transition-timing-function': 'ease-in-out'
				}
			},
			// Size from degree (mapped at element build via degree number); ensure a floor.
			{ selector: 'node[degree < 6]', style: { width: 26, height: 26 } },
			{ selector: 'node[?isolated]', style: { 'border-style': 'dashed', 'border-color': '#bbb', 'background-color': '#fafafa' } },
			{ selector: 'node.faded', style: { opacity: 0.12 } },
			{ selector: 'node.dim', style: { opacity: 0.1 } }, // Spotlight: smooth fade, keeps node in place
			{ selector: 'node.hidden', style: { display: 'none' } },
			{ selector: 'node.search-hit', style: { 'border-color': '#8fa0bf', 'border-width': 3, 'z-index': 30 } },
			{
				selector: 'edge',
				style: {
					width: 3,
					'line-color': 'data(color)',
					'curve-style': 'bezier',
					opacity: 0.85,
					'transition-property': 'opacity, width',
					'transition-duration': '0.35s'
				}
			},
			{ selector: 'edge.dim', style: { opacity: 0.06 } },
			{ selector: 'edge.focus-edge', style: { width: 5, opacity: 1 } },
			{ selector: 'edge.hidden', style: { display: 'none' } }
		];
	}

	function nodeSize(degree: number) {
		return Math.min(60, 26 + degree * 4);
	}

	async function initCy() {
		const cytoscape = (await import('cytoscape')).default;
		darkLabels = document.documentElement.classList.contains('dark');
		// Pre-size nodes (degree value becomes the px size).
		const els = buildElements().map((el: any) =>
			el.data.source ? el : { data: { ...el.data, degree: nodeSize(el.data.degree) } }
		);
		cy = cytoscape({
			container,
			elements: els,
			style: styles(cytoscape),
			minZoom: 0.2,
			maxZoom: 3,
			wheelSensitivity: 0.2
		});

		cy.on('tap', 'node', (evt: any) => {
			if (Date.now() < suppressTapUntil) return;
			const n = evt.target;
			const id = Number(n.id());
			const meta = data.graph.nodes.find((x) => x.id === id)!;
			const pos = n.renderedPosition();
			panel = { id, name: meta.name, city: meta.city, degree: meta.degree, x: pos.x, y: pos.y };
			menu = null;
		});
		cy.on('dbltap', 'node', (evt: any) => focusOn(Number(evt.target.id())));
		// Right-click opens the context menu (browser menu suppressed on the wrapper div).
		const openMenu = (evt: any) => {
			const id = Number(evt.target.id());
			const meta = data.graph.nodes.find((x) => x.id === id)!;
			const pos = evt.renderedPosition ?? evt.target.renderedPosition();
			menu = { id, name: meta.name, x: pos.x, y: pos.y };
			panel = null;
		};
		const clearLongPress = () => {
			if (longPressTimer) clearTimeout(longPressTimer);
			longPressTimer = null;
		};
		cy.on('tapstart', 'node', (evt: any) => {
			clearLongPress();
			longPressTimer = setTimeout(() => {
				suppressTapUntil = Date.now() + 700;
				openMenu(evt);
				longPressTimer = null;
			}, 550);
		});
		cy.on('tapend tapdrag', clearLongPress);
		cy.on('cxttap', 'node', openMenu);
		cy.on('taphold', 'node', (evt: any) => {
			clearLongPress();
			suppressTapUntil = Date.now() + 700;
			openMenu(evt);
		});
		cy.on('tap', 'edge', (evt: any) => {
			const e = evt.target;
			goto(`/pair/${e.data('source')}-${e.data('target')}`);
		});
		cy.on('tap', (evt: any) => {
			if (evt.target === cy) {
				panel = null;
				menu = null;
			}
		});
		cy.on('pan zoom', () => {
			if (panel) {
				const p = cy.getElementById(String(panel.id)).renderedPosition();
				panel = { ...panel, x: p.x, y: p.y };
			}
		});

		// On first load with a focus, settle positions synchronously so applyFocus reads final
		// coordinates (animated layout would leave it reading mid-flight positions → wrong ring/zoom).
		if (focusId != null) {
			cy.layout({ name: layoutName, animate: false, fit: false, padding: 40 }).run();
			saveBase();
			applyFocus(focusId);
		} else {
			runLayout();
		}
		graphSig = graphSignature(); // baseline: don't let the rebuild effect fire on first pass
		graphReady = true;
	}

	// Cheap content signature: focus navigation (?focus=…) re-runs the server load → `data.graph`
	// gets a fresh reference even though nothing changed. Comparing content lets us skip the rebuild
	// (which tore nodes down mid-animation and called applyFocus a *second* time → double zoom,
	// lost ring flare, scrambled neighbour ring). Only a real change (voice write) rebuilds.
	function graphSignature() {
		return (
			data.graph.nodes.map((n) => `${n.id}:${n.name}:${n.image}:${n.degree}`).join(',') +
			'|' +
			data.graph.edges.map((e) => `${e.source}-${e.target}-${e.color}`).join(',')
		);
	}

	// Nach einem Schreibvorgang über die Erzählfunktion ruft VoiceButton invalidateAll();
	// das aktualisiert `data` → hier die Cytoscape-Elemente neu aufbauen (Graph "live").
	let graphReady = false;
	let graphSig = '';
	$effect(() => {
		const sig = graphSignature(); // tracks data.graph
		if (!cy || !graphReady || sig === graphSig) return;
		graphSig = sig;
		const els = buildElements().map((el: any) =>
			el.data.source ? el : { data: { ...el.data, degree: nodeSize(el.data.degree) } }
		);
		cy.elements().remove();
		cy.add(els);
		if (focusId != null) {
			cy.layout({ name: layoutName, animate: false, fit: false, padding: 40 }).run();
			saveBase();
		} else {
			runLayout();
			return;
		}
		applyFocus(focusId);
	});

	function saveBase() {
		basePos.clear();
		cy.nodes().forEach((n: any) => basePos.set(n.id(), { ...n.position() }));
	}
	function restoreBase() {
		cy.nodes().forEach((n: any) => {
			const p = basePos.get(n.id());
			if (p) n.position(p);
		});
	}

	function runLayout() {
		if (!cy) return;
		const lay = cy.nodes(':visible').layout({ name: layoutName, animate: true, animationDuration: 500, fit: true, padding: 40 });
		lay.on('layoutstop', saveBase); // remember the resting positions so focus can restore them
		lay.run();
	}

	function applyFocus(id: number | null) {
		if (!cy) return;
		cy.nodes().removeClass('hidden faded focus dim');
		cy.edges().removeClass('hidden dim focus-edge');
		cy.nodes().removeStyle('border-color border-width'); // clear any leftover flare from a previous focus
		if (id == null) {
			runLayout();
			return;
		}
		const node = cy.getElementById(String(id));
		if (node.empty()) return;
		restoreBase(); // reset to layout positions first, so refocusing never piles nodes up
		const neighborhood = node.closedNeighborhood(); // node + direct contacts + connecting edges (depth 1)
		const others = cy.elements().difference(neighborhood);

		others.addClass('dim');
		neighborhood.edges().addClass('focus-edge');

		// Silver ring lights up immediately (on the click), holds 400ms, fades in 200ms → no lasting ring.
		node
			.animate({ style: { 'border-color': '#dfe4ee', 'border-width': 2 }, duration: 120, easing: 'ease-out' })
			.delay(400)
			.animate({
				style: { 'border-color': '#888', 'border-width': 2 },
				duration: 200,
				easing: 'ease-in',
				complete: () => node.removeStyle('border-color border-width')
			});

		// Pull the contacts onto a tight ring around the focus → short edges, then zoom in close.
		const center = node.position();
		const ns = neighborhood.nodes().not(node);
		const r = 120 + ns.length * 8; // model units; grows a little so many contacts don't overlap
		ns.forEach((n: any, i: number) => {
			const a = (2 * Math.PI * i) / ns.length - Math.PI / 2;
			n.animate({ position: { x: center.x + r * Math.cos(a), y: center.y + r * Math.sin(a) }, duration: 500, easing: 'ease-in-out-cubic' });
		});
		// Zoom so the ring fills ~42% from centre (closer when fewer contacts → "relative" zoom). ×1.2 = tighter.
		const view = Math.min(container.clientWidth, container.clientHeight);
		const zoom = Math.max(cy.minZoom(), Math.min(cy.maxZoom(), (view * 0.42 * 1.2) / (r + 50)));
		cy.animate({ zoom, center: { eles: node }, duration: 600, easing: 'ease-in-out-cubic' });
	}

	function focusOn(id: number) {
		panel = null;
		menu = null;
		localStorage.setItem('graph.focus', String(id)); // remember across navigation
		goto(`/graph?focus=${id}`, { noScroll: true, keepFocus: true });
	}
	function clearFocus() {
		localStorage.removeItem('graph.focus');
		goto('/graph', { noScroll: true, keepFocus: true });
	}

	// Ctrl/Cmd+F → slide-in search. Non-destructive: dim non-matches + pan/zoom the camera onto the
	// hits (no node repositioning — moving nodes per keystroke piled them onto the centre).
	function applySearch(raw: string) {
		if (!cy) return;
		const q = raw.trim().toLowerCase();
		cy.nodes().removeClass('dim search-hit');
		cy.edges().removeClass('dim');
		if (!q) {
			applyFocus(focusId); // restore normal/focus view
			return;
		}
		const hits = cy.nodes().filter((n: any) => String(n.data('name')).toLowerCase().includes(q));
		if (hits.empty()) return; // no match → leave the graph as-is (already un-dimmed above)
		// Exactly one match → focus it directly.
		if (hits.length === 1) {
			clearTimeout(searchTimer);
			searchOpen = false;
			searchQ = '';
			focusOn(Number(hits[0].id()));
			return;
		}
		// Multiple matches: dim everything else (connections stay visible but dimmed), highlight the
		// hits and bring them into the centre of the screen by moving the camera, not the nodes.
		cy.nodes().addClass('dim');
		cy.edges().addClass('dim');
		hits.removeClass('dim').addClass('search-hit');
		cy.animate({ fit: { eles: hits, padding: 90 }, duration: 450, easing: 'ease-in-out' });
	}
	function openSearch() {
		searchOpen = true;
		queueMicrotask(() => searchInput?.focus());
	}
	function closeSearch() {
		clearTimeout(searchTimer);
		searchOpen = false;
		searchQ = '';
		cy?.nodes().removeClass('search-hit');
		applyFocus(focusId);
	}

	function zoomBy(factor: number) {
		if (!cy) return;
		cy.zoom({ level: cy.zoom() * factor, renderedPosition: { x: container.clientWidth / 2, y: container.clientHeight / 2 } });
	}
	function fit() {
		cy?.fit(undefined, 40);
	}

	// React to focus param + layout changes.
	$effect(() => {
		applyFocus(focusId);
	});
	$effect(() => {
		layoutName;
		if (cy && focusId == null) runLayout();
	});

	onMount(() => {
		// Restore last focus when arriving without an explicit ?focus (e.g. via nav after editing).
		// Await the URL change first so initCy sees focusId set and settles positions before focusing.
		const saved = localStorage.getItem('graph.focus');
		(async () => {
			if (focusId == null && saved && data.graph.nodes.some((n) => n.id === Number(saved))) {
				await goto(`/graph?focus=${saved}`, { replaceState: true, noScroll: true, keepFocus: true });
			}
			await initCy();
		})();
		const onKey = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
				e.preventDefault();
				openSearch();
			} else if (e.key === 'Escape' && searchOpen) {
				closeSearch();
			}
		};
		window.addEventListener('keydown', onKey);
		return () => {
			window.removeEventListener('keydown', onKey);
			if (longPressTimer) clearTimeout(longPressTimer);
			cy?.destroy();
		};
	});
</script>

<svelte:head><title>Graph – RelaTable</title></svelte:head>

{#if focusId && focusName}
	<Topbar title={`Fokus: ${focusName}`} subtitle="Tiefe 1">
		<button class="btn btn-sm" onclick={clearFocus}>‹ Zurück</button>
	</Topbar>
{:else}
	<Topbar title="Graph" subtitle={`${data.graph.nodes.length} Personen`}>
		<label class="flex items-center gap-1 text-xs text-mut">
			Layout
			<select class="inp btn-sm w-auto" bind:value={layoutName}>
				<option value="circle">Kreis</option>
				<option value="concentric">Konzentrisch</option>
				<option value="grid">Raster</option>
			</select>
		</label>
	</Topbar>
{/if}

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="relative flex-1 overflow-hidden" oncontextmenu={(e) => e.preventDefault()}>
	<div bind:this={container} class="absolute inset-0" style="touch-action: none"></div>

	<!-- Ctrl+F search: slides in top-centre, pulls name matches to the middle live -->
	{#if searchOpen}
		<div class="absolute left-1/2 top-3 z-30 -translate-x-1/2" transition:fly={{ y: -30, duration: 220 }}>
			<div class="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 shadow-lg">
				<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-mut">
					<circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
				<!-- svelte-ignore a11y_autofocus -->
				<input
					bind:this={searchInput}
					bind:value={searchQ}
					oninput={onSearchInput}
					placeholder="Name suchen…"
					class="w-48 bg-transparent text-sm outline-none"
					aria-label="Personen im Graph suchen"
				/>
				<button class="text-mut hover:text-ink" onclick={closeSearch} aria-label="Suche schließen">✕</button>
			</div>
		</div>
	{/if}

	{#if data.graph.nodes.length === 0}
		<div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
			<span class="text-mut">Noch keine Verbindungen</span>
			<a class="btn btn-primary pointer-events-auto" href="/personen/neu">+ Person/Connection</a>
		</div>
	{/if}

	<!-- Legend (SCR-020 ②) -->
	<div class="absolute right-2.5 top-2.5 rounded-lg border border-line bg-card p-2 text-[11px] shadow-sm">
		<b>Legende</b>
		{#each data.legend as l}
			<div class="mt-0.5 flex items-center gap-1.5">
				<span class="inline-block h-0.5 w-4" style="background:{l.color}"></span>{l.label}
			</div>
		{/each}
	</div>

	<!-- Zoom controls -->
	<div class="absolute bottom-2.5 left-2.5 flex flex-col overflow-hidden rounded-md border border-line bg-card">
		<button class="h-7 w-8 border-b border-line" onclick={() => zoomBy(1.25)} aria-label="Vergrößern">+</button>
		<button class="h-7 w-8 border-b border-line" onclick={() => zoomBy(0.8)} aria-label="Verkleinern">−</button>
		<button class="h-7 w-8" onclick={fit} aria-label="Einpassen">⤢</button>
	</div>

	<!-- Node panel (single click) -->
	{#if panel}
		<div class="absolute z-20 w-52 rounded-lg border border-line bg-card p-2.5 shadow-lg"
			style="left:{Math.min(panel.x + 12, (container?.clientWidth ?? 300) - 220)}px; top:{Math.min(panel.y + 12, (container?.clientHeight ?? 300) - 110)}px">
			<div class="flex items-center justify-between">
				<div>
					<b class="text-[13px]">{panel.name}</b>
					<div class="text-[11px] text-mut">{panel.city ?? 'Kein Ort'} · {panel.degree} Verbindungen</div>
				</div>
				<button class="text-mut hover:text-ink" onclick={() => (panel = null)} aria-label="Schließen">✕</button>
			</div>
			<div class="mt-2 flex gap-1.5">
				<a class="btn btn-sm flex-1 justify-center" href={`/personen/${panel.id}`}>Profil</a>
				<button class="btn btn-primary btn-sm flex-1 justify-center" onclick={() => panel && focusOn(panel.id)}>Fokus</button>
			</div>
		</div>
	{/if}

	<!-- Right-click / long-press context menu -->
	{#if menu}
		<div class="absolute z-20 w-44 overflow-hidden rounded-lg border border-line bg-card text-sm shadow-lg"
			style="left:{Math.min(menu.x, (container?.clientWidth ?? 300) - 184)}px; top:{menu.y}px">
			<a class="block border-b border-line px-3 py-2 hover:bg-bg" href={`/personen/${menu.id}/bearbeiten?return=graph`}>Profil bearbeiten</a>
			<a class="block border-b border-line px-3 py-2 hover:bg-bg" href={`/personen/${menu.id}/bearbeiten?pick=1&return=graph`}>Bild ändern</a>
			<button class="block w-full border-b border-line px-3 py-2 text-left hover:bg-bg" onclick={() => menu && focusOn(menu.id)}>Fokussieren</button>
			<a class="block px-3 py-2 hover:bg-bg" href={`/karte?person=${menu.id}`}>Auf Karte</a>
		</div>
	{/if}

</div>
