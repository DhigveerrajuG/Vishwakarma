/**
 * RoboGuide Interactive Companion, Voice Speech Synthesis, & Guided Tour Controller
 */

import { playBotChirp } from './audio';
import { triggerBotBounce } from './animations';
import { ChatQueryResponse } from './types';

export function initBot(): void {
    const botGreetingToast = document.getElementById('bot-greeting-toast');
    const botChatCard = document.getElementById('bot-chat-card');
    const botChatClose = document.getElementById('bot-chat-close');
    const botChatMessages = document.getElementById('bot-chat-messages');
    const botChatForm = document.getElementById('bot-chat-form') as HTMLFormElement | null;
    const botChatInput = document.getElementById('bot-chat-input') as HTMLInputElement | null;
    const botFigureWrapper = document.getElementById('bot-figure-wrapper');
    const btnBotVoice = document.getElementById('btn-bot-voice') as HTMLButtonElement | null;

    // 1. Voice Synthesis (Web Speech API)
    let voiceEnabled = false;

    function speakText(text: string): void {
        if (!voiceEnabled || !('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const cleanText = text
                .replace(/<[^>]*>?/gm, ' ')
                .replace(/[🤖👋⚡⭐🛡️⚙️📊🐍🔌🌐💼📍📫↗•▸🚀✅🔇🔊🎉🎬]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            if (!cleanText) return;

            const utter = new SpeechSynthesisUtterance(cleanText);
            utter.rate = 1.04;
            utter.pitch = 1.14;

            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira'))) || voices.find(v => v.lang.startsWith('en'));
            if (preferredVoice) utter.voice = preferredVoice;

            window.speechSynthesis.speak(utter);
        } catch {
            // Speech synthesis policy fallback
        }
    }

    if (btnBotVoice) {
        btnBotVoice.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
            voiceEnabled = !voiceEnabled;
            btnBotVoice.classList.toggle('active', voiceEnabled);
            btnBotVoice.innerHTML = voiceEnabled 
                ? '<span id="voice-icon">🔊</span> Voice: ON' 
                : '<span id="voice-icon">🔇</span> Voice: OFF';

            if (voiceEnabled) {
                playBotChirp(620, 'sine', 0.14);
                speakText("AI Voice activated. I am RoboGuide, your portfolio copilot!");
            } else {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                playBotChirp(340, 'sine', 0.08);
            }
        });
    }

    // 2. Auto-Greeting on Page Load: greets and auto-minimizes after 3.8s
    if (botGreetingToast) {
        botGreetingToast.classList.remove('hidden');
        const timer = setTimeout(() => {
            botGreetingToast.classList.add('hidden');
        }, 3800);

        botGreetingToast.addEventListener('click', () => {
            clearTimeout(timer);
            botGreetingToast.classList.add('hidden');
            openChat();
        });
    }

    // 3. Chat Box Open / Close Controls
    function openChat(): void {
        if (botGreetingToast) botGreetingToast.classList.add('hidden');
        if (botChatCard) {
            botChatCard.classList.remove('hidden');
            triggerBotBounce();
            playBotChirp(520, 'sine', 0.1);
            if (botChatInput) {
                setTimeout(() => botChatInput.focus(), 150);
            }
        }
    }

    function closeChat(): void {
        if (botChatCard) {
            botChatCard.classList.add('hidden');
            playBotChirp(380, 'sine', 0.08);
            if (tourTimer) clearTimeout(tourTimer);
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        }
    }

    function toggleChat(): void {
        if (!botChatCard) return;
        if (botChatCard.classList.contains('hidden')) {
            openChat();
        } else {
            closeChat();
        }
    }

    if (botFigureWrapper) {
        botFigureWrapper.addEventListener('click', toggleChat);
    }

    if (botChatClose) {
        botChatClose.addEventListener('click', closeChat);
    }

    // 4. Render Message Bubbles
    function appendMessage(sender: 'bot' | 'user', htmlContent: string, skipSpeech = false): void {
        if (!botChatMessages) return;
        const msg = document.createElement('div');
        msg.className = `chat-msg ${sender}`;
        msg.innerHTML = htmlContent;
        botChatMessages.appendChild(msg);
        botChatMessages.scrollTop = botChatMessages.scrollHeight;

        if (sender === 'bot' && !skipSpeech) {
            speakText(htmlContent);
        }
    }

    function escapeHtml(str: string): string {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // 5. Typing Indicator Bubble
    let typingEl: HTMLElement | null = null;

    function showTyping(): void {
        if (!botChatMessages || typingEl) return;
        typingEl = document.createElement('div');
        typingEl.className = 'chat-msg bot chat-typing';
        typingEl.innerHTML = `<span></span><span></span><span></span>`;
        botChatMessages.appendChild(typingEl);
        botChatMessages.scrollTop = botChatMessages.scrollHeight;
    }

    function hideTyping(): void {
        if (typingEl && botChatMessages) {
            botChatMessages.removeChild(typingEl);
            typingEl = null;
        }
    }

    // 6. 30-Second Guided Tour Mode
    interface TourStep {
        targetId: string;
        commentary: string;
        spokenText: string;
        durationMs: number;
    }

    const TOUR_STEPS: TourStep[] = [
        {
            targetId: 'about',
            commentary: '🚀 <strong>Tour [1/4] — Physical Intelligence:</strong> Meet Dhigveerraju G, a Robotics & AI engineer merging embedded hardware with edge computer vision. Where code commands mechanical torque and real-world inertia!',
            spokenText: "Welcome to the thirty second guided tour! Step 1: Meet Dhigveerraju, a robotics engineer advancing physical intelligence, where code directly commands actuators and real-world inertia.",
            durationMs: 7000
        },
        {
            targetId: 'projects',
            commentary: '⭐ <strong>Tour [2/4] — Flagship Projects:</strong> Inspecting <em>Conveyor Sentinel AI</em> running YOLOv8 at 42+ FPS, and <em>Synchronized Dual-Motor Actuation</em> with PWM soft-start acceleration ramping.',
            spokenText: "Step 2: Here are his flagship builds: Conveyor Sentinel AI with real-time YOLOv8 defect detection at 42 frames per second, and Synchronized Dual-Motor Actuation firmware.",
            durationMs: 7500
        },
        {
            targetId: 'skills',
            commentary: '⚙️ <strong>Tour [3/4] — Technical Stack:</strong> Embedded C/C++, Arduino timer registers, Roboflow & YOLOv8, UART telemetry, and full-stack systems with Java & TypeScript.',
            spokenText: "Step 3: His technical matrix spans embedded C++, real-time AVR registers, YOLOv8 vision, telemetry streaming, and full-stack engineering.",
            durationMs: 7000
        },
        {
            targetId: 'contact',
            commentary: '📫 <strong>Tour [4/4] — Let\'s Collaborate:</strong> You can submit an access request for his official Resume/CV, send a direct transmission, or connect on LinkedIn and GitHub. Feel free to ask me anything!',
            spokenText: "Step 4: You can request his official resume, send him a transmission message, or connect on LinkedIn and GitHub. Feel free to ask me any questions!",
            durationMs: 6500
        }
    ];

    let tourTimer: ReturnType<typeof setTimeout> | null = null;

    function startGuidedTour(): void {
        if (tourTimer) clearTimeout(tourTimer);
        openChat();

        appendMessage('bot', '🎬 <strong>Starting 30-Second Guided Tour!</strong> Sit back as I guide you through Dhigveerraju\'s robotics portfolio sections.');
        speakText("Starting thirty second guided tour! Sit back as I guide you through Dhigveerraju's robotics portfolio.");

        function runStep(idx: number): void {
            if (idx >= TOUR_STEPS.length) {
                appendMessage('bot', '🎉 <strong>Guided Tour Complete!</strong> Click any chip or ask any question to learn more about Dhigveer\'s work.');
                speakText("Guided tour complete! Feel free to ask me any question about Dhigveerraju's work.");
                return;
            }

            const step = TOUR_STEPS[idx];
            const target = document.getElementById(step.targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            appendMessage('bot', step.commentary, true);
            speakText(step.spokenText);
            triggerBotBounce();
            playBotChirp(540 + idx * 40, 'sine', 0.1);

            tourTimer = setTimeout(() => runStep(idx + 1), step.durationMs);
        }

        tourTimer = setTimeout(() => runStep(0), 1200);
    }

    // 7. Comprehensive AI Response Generator (Natural language Q&A related to portfolio)
    function getLocalResponse(rawQuery: string): string {
        const q = rawQuery.toLowerCase().trim();

        // 1. Tour Command
        if (q.includes('tour') || q.includes('guide me') || q.includes('walkthrough') || q.includes('overview tour')) {
            setTimeout(startGuidedTour, 300);
            return "🚀 <strong>Initiating 30-Second Guided Tour!</strong> Auto-scrolling through Dhigveer's engineering profile, projects, skills, and contact...";
        }

        // 2. Assistant Identity & Capabilities
        if (q.includes('who are you') || q.includes('what are you') || q.includes('your name') || q === 'help') {
            return "🤖 I'm <strong>RoboGuide</strong>, Dhigveerraju's personal AI companion! I'm trained on his entire engineering portfolio. You can ask me about his <strong>popular projects</strong> (Conveyor Sentinel AI, Dual-Motor PWM), his <strong>embedded & AI skills</strong>, his <strong>background</strong>, or take the <strong>30s Guided Tour</strong>!";
        }

        // 3. Greetings & Small Talk
        if (q === 'hi' || q === 'hello' || q === 'hey' || q.startsWith('hello') || q.startsWith('hi ') || q.startsWith('hey ') || q.includes('good morning') || q.includes('good evening') || q.includes('greetings')) {
            return "👋 Hello! I'm <strong>RoboGuide</strong>. Ask me anything about Dhigveerraju's robotics projects, YOLOv8 vision system, C++ firmware, or how to get in touch!";
        }

        if (q.includes('how are you') || q.includes("how's it going") || q.includes('whats up') || q.includes("what's up")) {
            return "⚡ All systems nominal and ion thrusters running at peak efficiency! Ready to assist you. What would you like to explore in Dhigveer's portfolio today?";
        }

        if (q.includes('thank') || q.includes('thanks')) {
            return "🤖 You're very welcome! Feel free to ask more questions about Dhigveer's projects, or head to the contact section below to send him a transmission!";
        }

        // 4. Resume / CV (Protected by Owner Authorization)
        if (q.includes('resume') || q.includes('cv') || q.includes('bio-data') || q.includes('biodata')) {
            return "🔒 <strong>Dhigveerraju's Resume / CV:</strong> Due to confidential firmware algorithms and hardware IP, Dhigveer's resume is available <strong>upon request only</strong>. Scroll down to the bottom contact section or <a href=\"#contact\" style=\"color: var(--primary); font-weight: 600;\">Click here to Request Resume Access</a>!";
        }

        // 5. About Dhigveerraju, Bio, Education & Philosophy
        if (q.includes('who is dhigveer') || q.includes('who is he') || q.includes('about dhigveer') || q.includes('about him') || q.includes('background') || q.includes('bio') || q === 'about' || q === 'who') {
            return "👨‍💻 <strong>Dhigveerraju G</strong> is a Robotics & Artificial Intelligence Engineer passionate about <strong>physical intelligence</strong>—where code directly commands mechanical torque, edge computer vision, and real-world inertia. He bridges embedded microcontrollers with deep learning edge vision.";
        }

        if (q.includes('education') || q.includes('college') || q.includes('study') || q.includes('degree') || q.includes('university')) {
            return "🎓 Dhigveerraju is pursuing his engineering degree in <strong>Robotics and Artificial Intelligence</strong>, with research focused on autonomous edge inspection systems, closed-loop actuator feedback, and embedded C++ firmware.";
        }

        if (q.includes('physical intelligence') || q.includes('philosophy')) {
            return "🧠 <strong>Physical Intelligence</strong> is Dhigveer's core engineering philosophy: true robotics begins when algorithms leave computer screens to directly control physical actuators, sense real-world material inertia, and react to hardware anomalies in real time.";
        }

        // 6. Highlighted & Popular Repositories
        if (q.includes('popular repo') || q.includes('flagship') || q.includes('best project') || q.includes('top project')) {
            return "⭐ <strong>Dhigveerraju's Top Highlighted Repositories:</strong><br>1. 🛡️ <strong>Conveyor Sentinel AI</strong> — Autonomous industrial defect detection running YOLOv8 + OpenCV at 42+ FPS.<br>2. ⚡ <strong>Synchronized Dual-Motor Actuation</strong> — C++ Arduino firmware with PWM soft-start acceleration ramping.<br>Click <em>'Explore More GitHub Repositories'</em> in the Projects section to see his Kinematics Lab and Telemetry HUD!";
        }

        if (q.includes('project') || q.includes('work') || q.includes('portfolio') || q.includes('built')) {
            return "🚀 <strong>Dhigveer's Core Engineering Builds:</strong><br>• <strong>Conveyor Sentinel AI</strong> (YOLOv8 Edge Vision & Reticle HUD)<br>• <strong>Synchronized Dual-Motor Actuation</strong> (PWM Soft-Start Ramping Firmware)<br>• <strong>Edge Vision Telemetry HUD</strong> (UART Serial Telemetry)<br>• <strong>Robotics Kinematics Lab</strong> (TETRIX PRIZM Closed-Loop Encoders)<br>Scroll to the <em>Projects</em> section to inspect their architecture diagrams!";
        }

        // 7. Specific Projects Deep-Dive
        if (q.includes('conveyor') || q.includes('sentinel') || q.includes('yolo') || q.includes('defect') || q.includes('inspection') || q.includes('camera') || q.includes('fps')) {
            return "🛡️ <strong>Conveyor Sentinel AI:</strong> Dhigveerraju's flagship edge vision system. It combines lightweight <strong>YOLOv8</strong> deep learning with adaptive <strong>OpenCV contour tracking</strong> to classify tears, holes, and edge cuts on moving conveyor belts at <strong>42+ FPS</strong>, coupled with automated safety stop relays!";
        }

        if (q.includes('motor') || q.includes('pwm') || q.includes('dual') || q.includes('ramp') || q.includes('l298n') || q.includes('actuat') || q.includes('h-bridge') || q.includes('back-emf') || q.includes('inrush')) {
            return "⚡ <strong>Synchronized Dual-Motor Actuation:</strong> Dhigveer developed custom C++ firmware on Arduino using mathematical <strong>PWM soft-start acceleration ramping</strong> to synchronize dual DC motors driving conveyor rollers, eliminating belt slippage and damping inductive back-EMF spikes across L298N H-Bridges.";
        }

        if (q.includes('kinematic') || q.includes('tetrix') || q.includes('prizm') || q.includes('encoder') || q.includes('gear')) {
            return "⚙️ <strong>Robotics Kinematics Lab:</strong> Closed-loop firmware integrating <strong>TETRIX PRIZM controllers</strong> with quadrature optical encoders for precision torque, RPM synchronization, and closed-loop position tracking under dynamic mechanical loads.";
        }

        if (q.includes('telemetry') || q.includes('hud') || q.includes('serial') || q.includes('uart')) {
            return "📊 <strong>Edge Vision Telemetry HUD:</strong> Real-time diagnostics software linking YOLOv8 optical inference feeds with embedded Arduino motor telemetry, streaming live RPMs, temperatures, and defect coordinates over high-speed serial links.";
        }

        // 8. Skills & Technology Stack
        if (q.includes('python')) {
            return "🐍 <strong>Python Expertise:</strong> Dhigveer uses Python extensively for computer vision pipelines (YOLOv8 fine-tuning, OpenCV contour tracking), serial telemetry parsers, and machine learning model validation.";
        }

        if (q.includes('c++') || q === 'c' || q.includes('c language')) {
            return "⚙️ <strong>C/C++ Expertise:</strong> C/C++ is Dhigveer's foundational language for embedded robotics firmware, direct AVR timer registers, PWM acceleration profiles, and PlatformIO builds.";
        }

        if (q.includes('arduino') || q.includes('microcontroller') || q.includes('hardware')) {
            return "🔌 <strong>Hardware & Microcontrollers:</strong> Dhigveer specializes in Arduino Uno/Mega, optocouplers, L298N H-Bridge dual drivers, optical quadrature encoders, and TETRIX PRIZM robotic controllers.";
        }

        if (q.includes('web') || q.includes('typescript') || q.includes('javascript') || q.includes('html') || q.includes('java')) {
            return "🌐 <strong>Full-Stack & Systems:</strong> Dhigveer's engineering stack includes modern TypeScript, HTML5/CSS Grid, JavaScript, and high-performance Java 26 / Node.js backend servers.";
        }

        if (q.includes('skill') || q.includes('tech') || q.includes('stack') || q.includes('arsenal') || q.includes('tools')) {
            return "🤖 <strong>Technical Arsenal:</strong><br>• <strong>Embedded Firmware:</strong> C/C++, Arduino Uno/Mega, PlatformIO, PWM Soft-Start Ramping, TETRIX PRIZM<br>• <strong>AI & Computer Vision:</strong> YOLOv8, OpenCV, Roboflow, Python, Edge TPU<br>• <strong>Web & Backend:</strong> HTML5, CSS Grid, JavaScript, TypeScript, Java 26, Node.js, Git & GitHub";
        }

        // 9. Hiring, Jobs & Collaboration
        if (q.includes('hire') || q.includes('hiring') || q.includes('job') || q.includes('intern') || q.includes('open to work') || q.includes('collaborat') || q.includes('opportunity') || q.includes('available')) {
            return "💼 <strong>Open for Opportunities:</strong> Yes! Dhigveerraju is actively seeking robotics engineering roles, computer vision research collaborations, and embedded hardware internships. You can reach out directly through the contact transmission form below or connect via LinkedIn!";
        }

        if (q.includes('location') || q.includes('where is he') || q.includes('remote') || q.includes('city') || q.includes('country')) {
            return "📍 Dhigveerraju is based in <strong>India 🇮🇳</strong> and is open to both <strong>on-site</strong> and <strong>remote</strong> engineering opportunities worldwide.";
        }

        // 10. Contact & Social Profiles
        if (q.includes('linkedin')) {
            return "💼 Connect with Dhigveerraju on LinkedIn here: <a href=\"https://in.linkedin.com/in/dhigveerraju-g-69737036b\" target=\"_blank\" style=\"color: var(--primary); font-weight: 600;\">linkedin.com/in/dhigveerraju-g-69737036b ↗</a>";
        }

        if (q.includes('github') || q.includes('repo')) {
            return "🐙 Explore Dhigveerraju's open-source repositories here: <a href=\"https://github.com/DhigveerrajuG\" target=\"_blank\" style=\"color: var(--primary); font-weight: 600;\">github.com/DhigveerrajuG ↗</a>";
        }

        if (q.includes('contact') || q.includes('reach') || q.includes('email') || q.includes('message') || q.includes('touch')) {
            return "📫 <strong>Let's Connect!</strong><br>• <strong>Transmission Form:</strong> Use the direct message form at the bottom of this page.<br>• <strong>LinkedIn:</strong> <a href=\"https://in.linkedin.com/in/dhigveerraju-g-69737036b\" target=\"_blank\" style=\"color: var(--primary); font-weight: 600;\">Connect on LinkedIn ↗</a><br>• <strong>GitHub:</strong> <a href=\"https://github.com/DhigveerrajuG\" target=\"_blank\" style=\"color: var(--primary); font-weight: 600;\">Explore GitHub Profile ↗</a>";
        }

        // 11. Intelligent Contextual Fallback
        return `🤖 Thanks for asking about <em>"${escapeHtml(rawQuery)}"</em>! As Dhigveerraju's AI copilot, I can tell you about his <strong>flagship projects</strong> (Conveyor Sentinel AI, Dual-Motor PWM), his <strong>skills & tech stack</strong> (C++, Python, YOLOv8, Arduino), or how to <strong>get in touch</strong>. What would you like to explore?`;
    }

    // 8. Connected Query Dispatcher (Tries /api/chat, falls back to getLocalResponse)
    async function processQuestion(questionText: string): Promise<void> {
        if (!questionText || !questionText.trim()) return;
        const text = questionText.trim();

        // Check if user requested guided tour
        if (text.toLowerCase().includes('tour')) {
            startGuidedTour();
            return;
        }

        // Append user question bubble
        appendMessage('user', escapeHtml(text), true);
        playBotChirp(460, 'sine', 0.08);

        showTyping();

        try {
            // Attempt to fetch from connected backend
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            if (res.ok) {
                const data = (await res.json()) as ChatQueryResponse;
                hideTyping();
                appendMessage('bot', data.reply);
                triggerBotBounce();
                playBotChirp(560, 'sine', 0.12);
                return;
            }
        } catch {
            // Backend offline or running on static hosting
        }

        // Realistic typing delay for local fallback
        setTimeout(() => {
            hideTyping();
            const reply = getLocalResponse(text);
            appendMessage('bot', reply);
            triggerBotBounce();
            playBotChirp(560, 'sine', 0.12);
        }, 300);
    }

    // 9. Input Form Submit Listener
    if (botChatForm && botChatInput) {
        botChatForm.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            const val = botChatInput.value;
            if (val.trim()) {
                void processQuestion(val);
                botChatInput.value = '';
            }
        });
    }

    // 10. Suggestion Chips Click Listeners
    document.querySelectorAll<HTMLButtonElement>('.chat-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const action = chip.getAttribute('data-action');
            if (action === 'tour') {
                startGuidedTour();
                return;
            }
            const query = chip.getAttribute('data-question') || chip.textContent || '';
            void processQuestion(query);
        });
    });

    // 11. Reactive RoboGuide Drone Micro-Interactions
    const botChassis = document.getElementById('bot-drone-chassis');
    const antennaBeacon = document.getElementById('bot-antenna-beacon');
    const eyeLeft = document.getElementById('bot-eye-left');
    const eyeRight = document.getElementById('bot-eye-right');

    function setBotReaction(state: 'scanning' | 'ramping' | 'locked' | 'matrix' | 'normal'): void {
        if (!botChassis) return;

        botChassis.classList.remove('state-scanning', 'state-ramping', 'state-locked', 'state-matrix');

        if (state === 'normal') {
            if (antennaBeacon) antennaBeacon.setAttribute('fill', '#38bdf8');
            if (eyeLeft) eyeLeft.setAttribute('fill', '#38bdf8');
            if (eyeRight) eyeRight.setAttribute('fill', '#38bdf8');
            return;
        }

        botChassis.classList.add(`state-${state}`);

        if (state === 'scanning') {
            if (antennaBeacon) antennaBeacon.setAttribute('fill', '#38bdf8');
            if (eyeLeft) eyeLeft.setAttribute('fill', '#38bdf8');
            if (eyeRight) eyeRight.setAttribute('fill', '#38bdf8');
            playBotChirp(680, 'sine', 0.05);
        } else if (state === 'ramping') {
            if (antennaBeacon) antennaBeacon.setAttribute('fill', '#f59e0b');
            if (eyeLeft) eyeLeft.setAttribute('fill', '#f59e0b');
            if (eyeRight) eyeRight.setAttribute('fill', '#f59e0b');
            playBotChirp(420, 'sine', 0.08);
        } else if (state === 'locked') {
            if (antennaBeacon) antennaBeacon.setAttribute('fill', '#ec4899');
            if (eyeLeft) eyeLeft.setAttribute('fill', '#ec4899');
            if (eyeRight) eyeRight.setAttribute('fill', '#ec4899');
            playBotChirp(520, 'sine', 0.06);
        } else if (state === 'matrix') {
            if (antennaBeacon) antennaBeacon.setAttribute('fill', '#10b981');
            if (eyeLeft) eyeLeft.setAttribute('fill', '#10b981');
            if (eyeRight) eyeRight.setAttribute('fill', '#10b981');
            playBotChirp(580, 'sine', 0.05);
        }
    }

    // Bind hover triggers across the page
    document.querySelectorAll<HTMLElement>('.project-card[data-category="vision"]').forEach(card => {
        card.addEventListener('mouseenter', () => setBotReaction('scanning'));
        card.addEventListener('mouseleave', () => setBotReaction('normal'));
    });

    document.querySelectorAll<HTMLElement>('.project-card[data-category="robotics"]').forEach(card => {
        card.addEventListener('mouseenter', () => setBotReaction('ramping'));
        card.addEventListener('mouseleave', () => setBotReaction('normal'));
    });

    const resumeBox = document.querySelector<HTMLElement>('.resume-access-channel');
    if (resumeBox) {
        resumeBox.addEventListener('mouseenter', () => setBotReaction('locked'));
        resumeBox.addEventListener('mouseleave', () => setBotReaction('normal'));
    }

    const skillsSection = document.getElementById('skills');
    if (skillsSection) {
        skillsSection.addEventListener('mouseenter', () => setBotReaction('matrix'));
        skillsSection.addEventListener('mouseleave', () => setBotReaction('normal'));
    }
}
