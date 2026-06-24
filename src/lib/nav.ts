// Navigation config. Per the user's scope: rail shows Graph, Personen, Karte,
// Einstellungen (Ereignisse / Timeline / Finder are out of V1).

export interface NavItem {
	href: string;
	label: string;
	icon: string;
	/** match prefix for active state */
	match: string;
}

export const NAV_ITEMS: NavItem[] = [
	{ href: '/graph', label: 'Graph', icon: '◕', match: '/graph' },
	{ href: '/personen', label: 'Personen', icon: '☺', match: '/personen' },
	{ href: '/ereignisse', label: 'Ereignisse', icon: '★', match: '/ereignisse' },
	{ href: '/karte', label: 'Karte', icon: '⌖', match: '/karte' },
	{ href: '/einstellungen', label: 'Einstellungen', icon: '⚙', match: '/einstellungen' }
];

// Mobile bottom bar: Graph, Personen, Ereignisse, Karte, Mehr (Mehr → settings/theme/logout).
export const MOBILE_TABS: NavItem[] = [
	{ href: '/graph', label: 'Graph', icon: '◕', match: '/graph' },
	{ href: '/personen', label: 'Personen', icon: '☺', match: '/personen' },
	{ href: '/ereignisse', label: 'Events', icon: '★', match: '/ereignisse' },
	{ href: '/karte', label: 'Karte', icon: '⌖', match: '/karte' }
];

export function isActive(path: string, match: string): boolean {
	return path === match || path.startsWith(match + '/');
}
