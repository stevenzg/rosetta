import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function createThemeState() {
	let current = $state<Theme>('light');

	if (browser) {
		const stored = localStorage.getItem('theme') as Theme | null;
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		current = stored ?? (prefersDark ? 'dark' : 'light');
		applyTheme(current);
	}

	function applyTheme(theme: Theme) {
		if (!browser) return;
		document.documentElement.classList.toggle('dark', theme === 'dark');
		localStorage.setItem('theme', theme);
	}

	function toggle() {
		current = current === 'light' ? 'dark' : 'light';
		applyTheme(current);
	}

	return {
		get current() {
			return current;
		},
		toggle
	};
}

export const theme = createThemeState();
