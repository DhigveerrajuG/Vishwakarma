import { initTheme } from './theme';
import { initAnimations } from './animations';
import { initProjects } from './projects';
import { initContact } from './contact';
import { initBot } from './bot';
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAnimations();
    initProjects();
    initContact();
    initBot();
    console.log("⚡ Dhigveerraju G Portfolio Engine Loaded [TypeScript + HTML5 + Connected API]");
});
