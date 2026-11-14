import { playBotChirp } from './audio';
const THEME_KEY = 'dhigveer_portfolio_theme';
export function initTheme(): void {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } else if (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
    }
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
            playBotChirp(isDark ? 320 : 540);
        });
    }
}
