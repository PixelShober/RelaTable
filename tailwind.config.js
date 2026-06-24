/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				// Tokens mirror the review-3 mockups; resolved from CSS variables so dark mode can override them.
				ink: 'rgb(var(--c-ink) / <alpha-value>)',
				mut: 'rgb(var(--c-mut) / <alpha-value>)',
				line: 'rgb(var(--c-line) / <alpha-value>)',
				bg: 'rgb(var(--c-bg) / <alpha-value>)',
				card: 'rgb(var(--c-card) / <alpha-value>)',
				rail: 'rgb(var(--c-rail) / <alpha-value>)',
				accent: 'rgb(var(--c-accent) / <alpha-value>)',
				warn: 'rgb(var(--c-warn) / <alpha-value>)',
				ok: 'rgb(var(--c-ok) / <alpha-value>)'
			},
			fontFamily: {
				sans: ['system-ui', 'Segoe UI', 'Roboto', 'sans-serif']
			}
		}
	},
	plugins: []
};
