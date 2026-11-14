import { playBotChirp } from './audio';
export function initAnimations(): void {
    initTypewriter();
    initMobileNav();
    initScrollReveal();
    initScrollSpy();
    initRobotEyeBlink();
}
function initTypewriter(): void {
    const typewriterEl = document.getElementById('hero-typewriter');
    if (!typewriterEl) return;
    const roles: string[] = [
        "Robotics & Artificial Intelligence Engineer",
        "Lightweight YOLOv8 Edge Vision Specialist",
        "Synchronized Motor PWM Firmware Architect",
        "Physical Intelligence & Hardware Systems"
    ];
    let roleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typeSpeed = 65;
    function runTypewriter(): void {
        if (!typewriterEl) return;
        const currentRole = roles[roleIdx];
        if (isDeleting) {
            typewriterEl.textContent = currentRole.substring(0, charIdx - 1);
            charIdx--;
            typeSpeed = 30;
        } else {
            typewriterEl.textContent = currentRole.substring(0, charIdx + 1);
            charIdx++;
            typeSpeed = 65;
        }
        if (!isDeleting && charIdx === currentRole.length) {
            isDeleting = true;
            typeSpeed = 2200;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            roleIdx = (roleIdx + 1) % roles.length;
            typeSpeed = 400;
        }
        setTimeout(runTypewriter, typeSpeed);
    }
    runTypewriter();
}
function initMobileNav(): void {
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const navLinksList = document.getElementById('nav-links');
    if (mobileNavToggle && navLinksList) {
        mobileNavToggle.addEventListener('click', () => {
            navLinksList.classList.toggle('open');
            playBotChirp(480);
        });
        navLinksList.querySelectorAll('.nav-link-item').forEach(link => {
            link.addEventListener('click', () => {
                navLinksList.classList.remove('open');
            });
        });
    }
}
function initScrollReveal(): void {
    const targets = document.querySelectorAll(
        '.section-header, .about-profile-card, .skills-column-card, .project-card, .metric-item, .contact-card-info, .contact-form-wrapper'
    );
    targets.forEach(el => el.classList.add('reveal-on-scroll'));
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });
        targets.forEach(el => observer.observe(el));
    } else {
        targets.forEach(el => el.classList.add('reveal-visible'));
    }
}
function initScrollSpy(): void {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link-item');
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;
        sections.forEach(section => {
            const sectionTop = (section as HTMLElement).offsetTop - 120;
            const sectionHeight = (section as HTMLElement).offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id') || '';
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }, { passive: true });
}
function initRobotEyeBlink(): void {
    const eyeLeft = document.getElementById('bot-eye-left');
    const eyeRight = document.getElementById('bot-eye-right');
    function blink(): void {
        if (eyeLeft && eyeRight) {
            eyeLeft.setAttribute('r', '1');
            eyeRight.setAttribute('r', '1');
            setTimeout(() => {
                eyeLeft.setAttribute('r', '4.5');
                eyeRight.setAttribute('r', '4.5');
            }, 180);
        }
        setTimeout(blink, 3800 + Math.random() * 3000);
    }
    blink();
}
export function triggerBotBounce(): void {
    const botDroneChassis = document.getElementById('bot-drone-chassis');
    if (botDroneChassis) {
        botDroneChassis.classList.remove('happy-bounce');
        void botDroneChassis.offsetWidth;
        botDroneChassis.classList.add('happy-bounce');
        playBotChirp(580, 'sine', 0.1);
    }
}
