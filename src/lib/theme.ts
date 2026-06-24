// Theme: System | Light | Dark (DEC-015). Persisted to localStorage for instant
// pre-paint application (see app.html) and to the server for the owner record.

export type Theme = 'System' | 'Light' | 'Dark';

const KEY = 'relatable-theme';

export function storedTheme(): Theme {
	if (typeof localStorage === 'undefined') return 'System';
	const v = localStorage.getItem(KEY);
	if (v === 'light' || v === 'Light') return 'Light';
	if (v === 'dark' || v === 'Dark') return 'Dark';
	return 'System';
}

export function applyTheme(theme: Theme) {
	if (typeof document === 'undefined') return;
	const stored = theme.toLowerCase();
	localStorage.setItem(KEY, stored);
	const dark =
		stored === 'dark' ||
		(stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
	document.documentElement.classList.toggle('dark', dark);
}

export function initThemeWatcher(getTheme: () => Theme) {
	if (typeof window === 'undefined') return () => {};
	const mq = window.matchMedia('(prefers-color-scheme: dark)');
	const handler = () => {
		if (getTheme() === 'System') applyTheme('System');
	};
	mq.addEventListener('change', handler);
	return () => mq.removeEventListener('change', handler);
}
