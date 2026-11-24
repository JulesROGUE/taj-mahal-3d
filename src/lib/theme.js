// Light / dark theme: follows the system unless the user picked one (saved), or ?theme= forces it (screenshots).
const KEY = 'app.theme';

function apply(mode) {
  const dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}

export function getThemeMode() {
  return localStorage.getItem(KEY) || 'system';
}

export function setThemeMode(mode) {
  localStorage.setItem(KEY, mode);
  apply(mode);
}

export function initTheme() {
  const forced = new URLSearchParams(location.search).get('theme');
  if (forced === 'light' || forced === 'dark') return apply(forced);
  apply(getThemeMode());
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => apply(getThemeMode()));
}
