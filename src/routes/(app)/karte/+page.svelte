<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import 'leaflet.markercluster/dist/MarkerCluster.css';
	import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Topbar from '$lib/components/Topbar.svelte';

	let { data } = $props();

	let mapEl: HTMLDivElement;
	let L: any = null;
	let map: any = null;
	let personCluster: any = null;
	let eventCluster: any = null;

	let showPersons = $state(true);
	let showEvents = $state(true);
	let showSensitive = $state(false);
	let eventType = $state('');
	let filterOpen = $state(false); // mobile bottom-sheet

	const PERSON_COLOR = '#3a6ea5';
	const EVENT_COLOR = '#b06a2c';

	const eventTypes = $derived([...new Set(data.eventMarkers.map((e) => e.typeName))]);

	function markerSignature() {
		return (
			data.personMarkers.map((p) => `${p.id}:${p.name}:${p.city}:${p.lat}:${p.lng}`).join(',') +
			'|' +
			data.eventMarkers.map((e) => `${e.id}:${e.name}:${e.typeName}:${e.sensitive}:${e.when}:${e.lat}:${e.lng}`).join(',')
		);
	}

	function pinIcon(color: string) {
		return L.divIcon({
			className: '',
			html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)"></div>`,
			iconSize: [22, 22],
			iconAnchor: [11, 22],
			popupAnchor: [0, -20]
		});
	}

	function esc(s: string) {
		return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
	}

	function rebuild() {
		if (!map) return;
		personCluster.clearLayers();
		eventCluster.clearLayers();

		if (showPersons) {
			for (const p of data.personMarkers) {
				const m = L.marker([p.lat, p.lng], { icon: pinIcon(PERSON_COLOR) });
				m.bindPopup(
					`<b>${esc(p.name)}</b><br><span style="color:#777">${esc(p.city ?? 'Stadt')}</span><br><a href="/personen/${p.id}">Profil ↗</a>`
				);
				personCluster.addLayer(m);
			}
		}
		if (showEvents) {
			for (const e of data.eventMarkers) {
				if (e.sensitive && !showSensitive) continue;
				if (eventType && e.typeName !== eventType) continue;
				const m = L.marker([e.lat, e.lng], { icon: pinIcon(EVENT_COLOR) });
				m.bindPopup(
					`<b>${e.sensitive ? '🔒 ' : ''}${esc(e.name)}</b><br><span style="color:#777">${esc(e.typeName)} · ${esc(e.when)}</span><br><a href="/personen/${e.id}">Event ↗</a>`
				);
				eventCluster.addLayer(m);
			}
		}
	}

	async function initMap() {
		L = (await import('leaflet')).default;
		await import('leaflet.markercluster');

		map = L.map(mapEl, { zoomControl: true }).setView([51.3, 10.4], 6);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap',
			maxZoom: 19
		}).addTo(map);

		personCluster = L.markerClusterGroup({ iconCreateFunction: clusterIcon(PERSON_COLOR) });
		eventCluster = L.markerClusterGroup({ iconCreateFunction: clusterIcon(EVENT_COLOR) });
		map.addLayer(personCluster);
		map.addLayer(eventCluster);

		rebuild();
		// ?person=ID (from the graph "Auf Karte" menu) → zoom to that person's city; else fit all markers.
		// ponytail: only persons with stored coordinates can be zoomed to; those without fall back to fit-all.
		const pid = Number($page.url.searchParams.get('person'));
		const focusP = pid ? data.personMarkers.find((p) => p.id === pid) : undefined;
		const all = [...data.personMarkers, ...data.eventMarkers];
		if (focusP) {
			map.setView([focusP.lat, focusP.lng], 10); // city-level; ~half-view, not street-level
		} else if (all.length) {
			map.fitBounds(all.map((m) => [m.lat, m.lng]), { padding: [40, 40], maxZoom: 11 });
		}
		mapReady = true;
	}

	function clusterIcon(color: string) {
		return (cluster: any) =>
			L.divIcon({
				html: `<div style="background:${color}e6;color:#fff;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;border:2px solid #fff">${cluster.getChildCount()}</div>`,
				className: '',
				iconSize: [36, 36]
			});
	}

	// Nach einem Schreibvorgang über die Erzählfunktion ruft VoiceButton invalidateAll();
	// das aktualisiert `data` → hier die Leaflet-Layer neu aufbauen (Karte "live").
	let mapReady = false;
	$effect(() => {
		markerSignature(); // tracks marker data from load()
		showPersons;
		showEvents;
		showSensitive;
		eventType;
		if (!map || !mapReady) return;
		rebuild();
	});

	onMount(() => {
		initMap();
		return () => map?.remove();
	});
</script>

<svelte:head><title>Karte – RelaTable</title></svelte:head>

<Topbar title="Karte" subtitle={`Quelle: ${data.provider === 'google' ? 'Google Maps' : 'OpenStreetMap'}`}>
	<button class="btn btn-sm md:hidden" onclick={() => (filterOpen = !filterOpen)}>Filter</button>
</Topbar>

<div class="relative flex-1 overflow-hidden">
	<div bind:this={mapEl} class="absolute inset-0 z-0"></div>

	<!-- Filter panel (desktop) -->
	<div class="absolute left-2.5 top-2.5 z-[500] hidden w-48 rounded-lg border border-line bg-card p-2.5 text-xs shadow md:block">
		<b>Layer</b>
		<label class="mt-1 flex items-center justify-between">
			<span><span class="mr-1.5 inline-block h-2.5 w-2.5 rounded-full" style="background:{PERSON_COLOR}"></span>Personen</span>
			<input type="checkbox" aria-label="Layer Personen" bind:checked={showPersons} />
		</label>
		<label class="mt-1 flex items-center justify-between">
			<span><span class="mr-1.5 inline-block h-2.5 w-2.5 rounded-full" style="background:{EVENT_COLOR}"></span>Ereignisse</span>
			<input type="checkbox" aria-label="Layer Ereignisse" bind:checked={showEvents} />
		</label>
		<hr class="my-1.5 border-line" />
		<b>Filter</b>
		<label class="mt-1 block">Eventtyp
			<select class="inp mt-1" bind:value={eventType}>
				<option value="">Alle</option>
				{#each eventTypes as t}<option value={t}>{t}</option>{/each}
			</select>
		</label>
		<label class="mt-1.5 flex items-center justify-between">
			<span>⊙ Sensible</span>
			<input type="checkbox" bind:checked={showSensitive} />
		</label>
	</div>

	<!-- Missing locations (AC-093) -->
	{#if data.missing.persons > 0 || data.missing.events > 0}
		<div class="absolute bottom-2.5 right-2.5 z-[500] max-w-[220px] rounded-lg border border-dashed border-line bg-card/95 p-2.5 text-xs">
			<b>Ohne Standort</b>
			<p class="mt-1 text-mut">Werden nicht falsch verortet, sondern separat gelistet:</p>
			<p class="mt-1">• {data.missing.persons} Personen ohne Ort<br />• {data.missing.events} Ereignisse ohne Ort</p>
		</div>
	{/if}

	<!-- Mobile filter sheet -->
	{#if filterOpen}
		<div class="absolute inset-0 z-[600] bg-black/30 md:hidden" role="button" tabindex="-1" aria-label="Schließen" onclick={() => (filterOpen = false)} onkeydown={() => {}}></div>
		<div class="absolute inset-x-0 bottom-0 z-[700] rounded-t-2xl border-t border-line bg-card p-4 text-sm md:hidden">
			<div class="mx-auto mb-3 h-1 w-10 rounded-full bg-line"></div>
			<label class="flex items-center justify-between py-1.5"><span>Personen</span><input type="checkbox" bind:checked={showPersons} /></label>
			<label class="flex items-center justify-between py-1.5"><span>Ereignisse</span><input type="checkbox" bind:checked={showEvents} /></label>
			<label class="flex items-center justify-between py-1.5"><span>Sensible</span><input type="checkbox" bind:checked={showSensitive} /></label>
			<button class="btn mt-2 w-full justify-center" onclick={() => (filterOpen = false)}>Schließen</button>
		</div>
	{/if}
</div>
