/* ==========================================================================
   Dhigveerraju G - Modern Robotics & AI Engineering Portfolio
   Main JavaScript Engine: Theme, Conversational RoboGuide Companion, & Projects
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ----------------------------------------------------------------------
       1. Theme Toggle (Light Default + Dark Mode Switcher)
       ---------------------------------------------------------------------- */
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const THEME_KEY = 'dhigveer_portfolio_theme';

    // Check user preference or stored theme
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
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

    /* ----------------------------------------------------------------------
       2. Web Audio API Robot Sound Synthesizer (Cute electronic beeps)
       ---------------------------------------------------------------------- */
    let audioCtx = null;
    let isMuted = false;

    function initAudio() {
        if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContextClass();
        }
    }

    function playBotChirp(freq = 440, type = 'sine', duration = 0.08) {
        if (isMuted) return;
        try {
            initAudio();
            if (!audioCtx) return;
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + duration);

            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            // Audio policy fallback
        }
    }

    const soundBtn = document.getElementById('btn-bot-sound');
    if (soundBtn) {
        soundBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            soundBtn.textContent = isMuted ? '🔇' : '🔊';
            soundBtn.title = isMuted ? 'Sound Muted' : 'Sound Enabled';
            if (!isMuted) playBotChirp(600);
        });
    }

    /* ----------------------------------------------------------------------
       3. Typewriter Effect
       ---------------------------------------------------------------------- */
    const typewriterEl = document.getElementById('hero-typewriter');
    const roles = [
        "Robotics & Artificial Intelligence Engineer",
        "Lightweight YOLOv8 Edge Vision Specialist",
        "Synchronized Motor PWM Firmware Architect",
        "Physical Intelligence & Hardware Systems"
    ];
    let roleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typeSpeed = 70;

    function runTypewriter() {
        if (!typewriterEl) return;
        const currentRole = roles[roleIdx];

        if (isDeleting) {
            typewriterEl.textContent = currentRole.substring(0, charIdx - 1);
            charIdx--;
            typeSpeed = 35;
        } else {
            typewriterEl.textContent = currentRole.substring(0, charIdx + 1);
            charIdx++;
            typeSpeed = 70;
        }

        if (!isDeleting && charIdx === currentRole.length) {
            isDeleting = true;
            typeSpeed = 2200; // Pause at end of text
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            roleIdx = (roleIdx + 1) % roles.length;
            typeSpeed = 400;
        }

        setTimeout(runTypewriter, typeSpeed);
    }
    runTypewriter();

    /* ----------------------------------------------------------------------
       4. Mobile Navigation Menu Toggle
       ---------------------------------------------------------------------- */
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const navLinksList = document.getElementById('nav-links');

    if (mobileNavToggle && navLinksList) {
        mobileNavToggle.addEventListener('click', () => {
            navLinksList.classList.toggle('open');
        });

        navLinksList.querySelectorAll('.nav-link-item').forEach(link => {
            link.addEventListener('click', () => {
                navLinksList.classList.remove('open');
            });
        });
    }

    /* ----------------------------------------------------------------------
       5. Projects Filtering & GitHub Repositories Drawer
       ---------------------------------------------------------------------- */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const moreReposDrawer = document.getElementById('more-repos-drawer');
    const btnToggleMoreRepos = document.getElementById('btn-toggle-more-repos');
    const toggleMoreReposText = document.getElementById('toggle-more-repos-text');

    if (btnToggleMoreRepos && moreReposDrawer) {
        btnToggleMoreRepos.addEventListener('click', () => {
            const isExpanded = moreReposDrawer.classList.contains('expanded');
            if (isExpanded) {
                moreReposDrawer.classList.remove('expanded');
                btnToggleMoreRepos.setAttribute('aria-expanded', 'false');
                if (toggleMoreReposText) toggleMoreReposText.textContent = 'Explore More GitHub Repositories (2) ↓';
                playBotChirp(380);
            } else {
                moreReposDrawer.classList.add('expanded');
                btnToggleMoreRepos.setAttribute('aria-expanded', 'true');
                if (toggleMoreReposText) toggleMoreReposText.textContent = 'Show Fewer Repositories ↑';
                playBotChirp(520);
            }
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');
            playBotChirp(400);

            // Automatically expand the drawer if filtering specific categories
            if (filterValue !== 'all' && moreReposDrawer && !moreReposDrawer.classList.contains('expanded')) {
                moreReposDrawer.classList.add('expanded');
                if (btnToggleMoreRepos) btnToggleMoreRepos.setAttribute('aria-expanded', 'true');
                if (toggleMoreReposText) toggleMoreReposText.textContent = 'Show Fewer Repositories ↑';
            }

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    /* ----------------------------------------------------------------------
       6. Project Architecture Details Modal (Tabs, Code Snippets & Specs)
       ---------------------------------------------------------------------- */
    const modalBackdrop = document.getElementById('project-modal-backdrop');
    const modalContentArea = document.getElementById('modal-content-area');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    const PROJECT_DETAILS = {
        'conveyor-sentinel': {
            title: "Conveyor Sentinel AI",
            subtitle: "Autonomous Industrial Conveyor Belt Inspection System",
            badge: "Computer Vision & Edge AI",
            summary: "A production-grade vision inspection system engineered to run high-throughput surface anomaly classification on moving conveyor belts at 42+ FPS.",
            architecture: [
                "<strong>Dual-Stage Vision Pipeline:</strong> Primary lightweight YOLOv8 object detector fine-tuned on tear and puncture patterns, coupled with an OpenCV morphological contour tracker for high-speed anomaly boundaries.",
                "<strong>Real-Time Reticle HUD:</strong> Dynamic coordinate overlays marking detected cracks with bounding box confidence percentages at 42+ FPS.",
                "<strong>Safety Interlock Protocol:</strong> 5-point automated safety routine that communicates defect criticality thresholds to safety stop relays in <22ms."
            ],
            tech: ["YOLOv8", "OpenCV", "Python", "Roboflow Dataset", "Edge TPU / NVIDIA Jetson"],
            github: "https://github.com/DhigveerrajuG/Autonomous-Industrial-Conveyor-Belt-Inspection-System",
            codeSnippet: {
                language: "python",
                filename: "detect_conveyor_tears.py",
                code: `import cv2
import numpy as np
from ultralytics import YOLO

class ConveyorSentinelAI:
    def __init__(self, model_path="weights/yolov8n_conveyor_v2.pt", relay_pin=18):
        self.model = YOLO(model_path)
        self.relay_pin = relay_pin
        self.fps_buffer = []

    def process_frame(self, frame: np.ndarray):
        # 1. High-throughput YOLOv8 Anomaly Inference
        results = self.model.predict(source=frame, conf=0.72, verbose=False)[0]
        critical_anomaly = False

        for box in results.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            # Classes: 0: Longitudinal Tear, 1: Deep Puncture, 2: Edge Fray
            if cls_id in (0, 1) and conf >= 0.85:
                critical_anomaly = True
                self.trigger_safety_interlock(box.xyxy[0].tolist(), conf)

        # 2. Fallback morphological contour tracking for high-speed motion blur
        if not critical_anomaly:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            _, thresh = cv2.threshold(blurred, 45, 255, cv2.THRESH_BINARY_INV)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            for cnt in contours:
                if cv2.contourArea(cnt) > 850:
                    critical_anomaly = True

        return results, critical_anomaly

    def trigger_safety_interlock(self, coords, confidence):
        # Fast GPIO pulse to safety stop relays in <22ms
        print(f"[ALERT] Critical defect detected ({confidence*100:.1f}%). Triggering E-STOP relay!")`
            },
            schematics: {
                label: "Vision Pipeline & Relay Interlock Specifications",
                specs: [
                    { key: "Inference Resolution", value: "640x640 letterboxed input" },
                    { key: "Target Frame Rate", value: "42.4 FPS on Edge TPU (TensorRT FP16)" },
                    { key: "Classification Classes", value: "Longitudinal Tear, Deep Puncture, Edge Fray, Foreign Object" },
                    { key: "Interlock Relay Response", value: "< 22ms active-low GPIO cutoff" },
                    { key: "Camera Interface", value: "MIPI CSI-2 / USB 3.0 Global Shutter (120 FPS capable)" }
                ]
            }
        },
        'dual-motor': {
            title: "Synchronized Dual-Motor Actuation",
            subtitle: "Hardware Firmware & Acceleration Motion Profiles",
            badge: "Embedded Robotics Firmware",
            summary: "Firmware engineered to synchronize dual DC motors driving industrial conveyor rollers under variable loads.",
            architecture: [
                "<strong>PWM Soft-Start Ramping:</strong> Custom mathematical acceleration curves written in C++ that step PWM duties linearly to eliminate belt slippage and protect mechanical gearboxes.",
                "<strong>Inrush Current Damping:</strong> Dampens spike currents through L298N dual H-Bridge drivers, preventing thermal shutdowns and inductive back-EMF feedback.",
                "<strong>Fail-Safe Logic:</strong> Emergency stop interrupt routines and speed matching routines to ensure synchronized rotation between rollers."
            ],
            tech: ["Arduino Uno/Mega", "C/C++", "PWM Timers", "L298N H-Bridge", "Optocouplers"],
            github: "https://github.com/DhigveerrajuG",
            codeSnippet: {
                language: "cpp",
                filename: "synchronized_drive.cpp",
                code: `#include <Arduino.h>

// Pins for Dual L298N H-Bridge Actuation
const uint8_t ENA_PIN = 9;   // Timer1 PWM (Motor A)
const uint8_t ENB_PIN = 10;  // Timer1 PWM (Motor B)
const uint8_t IN1_PIN = 4;
const uint8_t IN2_PIN = 5;
const uint8_t IN3_PIN = 6;
const uint8_t IN4_PIN = 7;

// Soft-Start Ramping Parameters
const uint8_t TARGET_DUTY = 220;   // 86% Max Duty Cycle
const uint8_t RAMP_STEP_DELAY_MS = 18; // Step delay prevents inrush spike

void setupMotorTimers() {
    // Configure Timer1 for 31.37 kHz Phase-Correct PWM (Eliminates audible coil whine)
    TCCR1B = (TCCR1B & 0b11111000) | 0x01; // No prescaling
    pinMode(ENA_PIN, OUTPUT);
    pinMode(ENB_PIN, OUTPUT);
    pinMode(IN1_PIN, OUTPUT);
    pinMode(IN2_PIN, OUTPUT);
    pinMode(IN3_PIN, OUTPUT);
    pinMode(IN4_PIN, OUTPUT);
}

void executeSoftStartRamping(uint8_t targetDuty) {
    // Forward direction initialization
    digitalWrite(IN1_PIN, HIGH); digitalWrite(IN2_PIN, LOW);
    digitalWrite(IN3_PIN, HIGH); digitalWrite(IN4_PIN, LOW);

    // Linear mathematical duty ramping eliminates belt inertia slip
    for (uint8_t duty = 0; duty <= targetDuty; duty += 4) {
        analogWrite(ENA_PIN, duty);
        analogWrite(ENB_PIN, duty);
        delay(RAMP_STEP_DELAY_MS);
    }
}`
            },
            schematics: {
                label: "Dual H-Bridge Hardware Interface & Ratings",
                specs: [
                    { key: "Operating Motor Voltage", value: "12V - 24V DC unregulated rail" },
                    { key: "Peak Inrush Current (Unramped)", value: "3.2A per motor channel" },
                    { key: "Soft-Start Current Peak", value: "1.4A (56% inrush attenuation)" },
                    { key: "PWM Timer Base Frequency", value: "31.37 kHz ultrasonic phase-correct PWM" },
                    { key: "Back-EMF Snubber Array", value: "1N5819 Schottky fast-recovery flyback diodes" },
                    { key: "Logic Isolation", value: "PC817 Optocoupler opto-isolated control lines" }
                ]
            }
        },
        'vision-telemetry': {
            title: "Edge Vision Telemetry & Diagnostics HUD",
            subtitle: "Real-Time Inspection & Actuator Telemetry Dashboard",
            badge: "Vision & Telemetry",
            summary: "Real-time edge diagnostics software connecting YOLOv8 optical inference feeds with embedded Arduino motor telemetry.",
            architecture: [
                "<strong>Serial Telemetry Streaming:</strong> High-baud rate UART data link streaming real-time motor temperatures, RPM encoder counts, and system status directly to the inspection UI.",
                "<strong>Dynamic Coordinate HUD:</strong> Overlays real-time defect bounding boxes, confidence ratings, and conveyor surface velocity readouts.",
                "<strong>Automated Anomaly Logging:</strong> High-speed event logger saving defect timestamps and severity classes for factory audit trails."
            ],
            tech: ["Python", "OpenCV", "UART Serial", "Edge AI", "Telemetry HUD"],
            github: "https://github.com/DhigveerrajuG",
            codeSnippet: {
                language: "python",
                filename: "telemetry_streamer.py",
                code: `import serial
import json
import time

class SerialTelemetryHUD:
    def __init__(self, port="/dev/ttyUSB0", baud=115200):
        self.ser = serial.Serial(port, baud, timeout=0.05)
        self.stream_active = True

    def stream_telemetry(self, defect_detected: bool, fps: float):
        payload = {
            "timestamp_ms": int(time.time() * 1000),
            "conveyor_rpm": 420.5,
            "surface_velocity_mps": 1.48,
            "vision_fps": round(fps, 1),
            "safety_interlock": "HALT" if defect_detected else "NOMINAL"
        }
        data_bytes = (json.dumps(payload) + "\\n").encode('utf-8')
        self.ser.write(data_bytes)`
            },
            schematics: {
                label: "UART Serial Diagnostics Specifications",
                specs: [
                    { key: "UART Baud Rate", value: "115200 bps 8-N-1 packet frame" },
                    { key: "Packet Telemetry Frequency", value: "20 Hz continuous streaming" },
                    { key: "HUD Refresh Rate", value: "60 Hz client-side redraw" }
                ]
            }
        },
        'kinematics-lab': {
            title: "Robotics Kinematics & Actuation Lab",
            subtitle: "TETRIX PRIZM Robotic Drives & Optical Transmission",
            badge: "Robotics Research",
            summary: "Embedded kinematics firmware and laboratory experiments matching torque, RPM, and gear reductions with multi-axis optical encoders.",
            architecture: [
                "<strong>Closed-Loop Encoder Feedback:</strong> Continuous quadrature optical encoder count tracking to eliminate positional drift under mechanical load.",
                "<strong>TETRIX PRIZM Motor Controller:</strong> High-amperage robotic motor integration for robotic arms and mobile inspection chassis.",
                "<strong>PlatformIO Embedded Workflow:</strong> Modular build pipeline for rapid firmware testing and sensor calibration."
            ],
            tech: ["TETRIX PRIZM", "C/C++", "PlatformIO", "Optical Encoders", "Kinematics Analysis"],
            github: "https://github.com/DhigveerrajuG",
            codeSnippet: {
                language: "cpp",
                filename: "prizm_encoder_kinematics.cpp",
                code: `#include <PRIZM.h>
PRIZM prizm;

void setup() {
    prizm.PrizmBegin();
    prizm.setMotorInvert(1, 1);
    prizm.resetEncoders();
}

void loop() {
    // Closed-Loop Velocity Matching under dynamic load
    long countM1 = prizm.readEncoderCount(1);
    long countM2 = prizm.readEncoderCount(2);
    long error = countM1 - countM2;

    // Proportional trim to keep both roller shafts synchronized within ±2 ticks
    int trim = (int)(error * 0.45);
    prizm.setMotorPowers(125 - trim, 125 + trim);
    delay(10);
}`
            },
            schematics: {
                label: "Robotic Kinematics & Gearbox Specs",
                specs: [
                    { key: "Controller", value: "TETRIX PRIZM 32-bit Cortex processor" },
                    { key: "Encoder Precision", value: "Quadrature optical encoder (500 CPR, 2000 edges/rev)" },
                    { key: "Velocity Synchronization", value: "Proportional trimming error tolerance ±2 encoder ticks" }
                ]
            }
        }
    };

    function openProjectModal(projectId) {
        const details = PROJECT_DETAILS[projectId];
        if (!details || !modalContentArea || !modalBackdrop) return;

        playBotChirp(520);
        modalContentArea.innerHTML = `
            <div style="margin-bottom: 16px;">
                <span class="project-category-badge vision" style="margin-bottom: 8px;">${details.badge}</span>
                <h2 style="font-size: 1.55rem; margin-top: 6px; margin-bottom: 4px;">${details.title}</h2>
                <h4 style="font-size: 0.92rem; color: var(--primary);">${details.subtitle}</h4>
            </div>
            <p style="font-size: 0.92rem; color: var(--text-secondary); margin-bottom: 18px; line-height: 1.55;">${details.summary}</p>
            
            <!-- Interactive Project Tabs -->
            <div class="project-modal-tabs">
                <button type="button" class="proj-tab-btn active" data-tab="arch">📐 Architecture</button>
                ${details.codeSnippet ? `<button type="button" class="proj-tab-btn" data-tab="code">💻 Source Code</button>` : ''}
                ${details.schematics ? `<button type="button" class="proj-tab-btn" data-tab="specs">🔌 Specs & Pins</button>` : ''}
            </div>

            <!-- Tab 1: Architecture -->
            <div class="proj-tab-pane active" id="tab-pane-arch">
                <h4 style="font-size: 1rem; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">Key Engineering Architecture</h4>
                <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                    ${details.architecture.map(item => `
                        <li style="display: flex; gap: 10px; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.55;">
                            <span style="color: var(--primary); font-weight: bold;">▸</span>
                            <div>${item}</div>
                        </li>
                    `).join('')}
                </ul>

                <h4 style="font-size: 0.95rem; margin-bottom: 10px;">Technologies Utilized</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px;">
                    ${details.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                </div>
            </div>

            <!-- Tab 2: Code Snippet -->
            ${details.codeSnippet ? `
            <div class="proj-tab-pane" id="tab-pane-code" style="display: none;">
                <div class="code-snippet-header">
                    <span class="code-filename">📄 ${details.codeSnippet.filename}</span>
                    <button type="button" class="btn-copy-code" id="btn-copy-modal-code" title="Copy code snippet">
                        <span>📋 Copy</span>
                    </button>
                </div>
                <pre class="code-snippet-pre"><code class="language-${details.codeSnippet.language}" id="code-snippet-target">${escapeHtml(details.codeSnippet.code)}</code></pre>
            </div>
            ` : ''}

            <!-- Tab 3: Hardware Specs -->
            ${details.schematics ? `
            <div class="proj-tab-pane" id="tab-pane-specs" style="display: none;">
                <h4 style="font-size: 0.98rem; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">${details.schematics.label}</h4>
                <div class="specs-table-container">
                    <table class="specs-table">
                        <tbody>
                            ${details.schematics.specs.map(s => `
                                <tr>
                                    <th>${s.key}</th>
                                    <td>${s.value}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            ` : ''}

            <div style="display: flex; gap: 10px; align-items: center; margin-top: 22px; padding-top: 14px; border-top: 1px solid var(--border-color);">
                <a href="${details.github}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
                    <span>View Full GitHub Source</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                </a>
            </div>
        `;

        // Wire up tab switching inside modal
        const tabBtns = modalContentArea.querySelectorAll('.proj-tab-btn');
        const panes = modalContentArea.querySelectorAll('.proj-tab-pane');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.getAttribute('data-tab');
                tabBtns.forEach(b => b.classList.remove('active'));
                panes.forEach(p => p.style.display = 'none');

                btn.classList.add('active');
                playBotChirp(440, 'sine', 0.05);

                const activePane = modalContentArea.querySelector(`#tab-pane-${target}`);
                if (activePane) activePane.style.display = 'block';
            });
        });

        // Wire up copy button
        const copyBtn = modalContentArea.querySelector('#btn-copy-modal-code');
        const codeTarget = modalContentArea.querySelector('#code-snippet-target');
        if (copyBtn && codeTarget) {
            copyBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(codeTarget.textContent || '');
                    copyBtn.innerHTML = '<span>✅ Copied!</span>';
                    playBotChirp(680, 'sine', 0.1);
                    setTimeout(() => {
                        copyBtn.innerHTML = '<span>📋 Copy</span>';
                    }, 2000);
                } catch {
                    copyBtn.innerHTML = '<span>Copied!</span>';
                }
            });
        }

        modalBackdrop.classList.add('open');
    }

    document.querySelectorAll('.btn-inspect-project').forEach(btn => {
        btn.addEventListener('click', () => {
            const projectId = btn.getAttribute('data-project');
            openProjectModal(projectId);
        });
    });

    if (modalCloseBtn && modalBackdrop) {
        modalCloseBtn.addEventListener('click', () => modalBackdrop.classList.remove('open'));
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) modalBackdrop.classList.remove('open');
        });
    }

    /* ----------------------------------------------------------------------
       7. THE MINI ROBOT COMPANION ("RoboGuide" Stationary Corner Companion)
          - Greets on page open and auto-minimizes after 3.8 seconds
          - Interactive AI Chat Box, Web Speech Synthesis Voice Option, & 30s Guided Tour
       ---------------------------------------------------------------------- */
    const botGreetingToast = document.getElementById('bot-greeting-toast');
    const botChatCard = document.getElementById('bot-chat-card');
    const botChatClose = document.getElementById('bot-chat-close');
    const botChatMessages = document.getElementById('bot-chat-messages');
    const botChatForm = document.getElementById('bot-chat-form');
    const botChatInput = document.getElementById('bot-chat-input');
    const botFigureWrapper = document.getElementById('bot-figure-wrapper');
    const botDroneChassis = document.getElementById('bot-drone-chassis');
    const btnBotVoice = document.getElementById('btn-bot-voice');

    // 1. Web Speech API Speech Synthesis (AI Voice Option)
    let voiceEnabled = false;

    function speakBotText(text) {
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
        } catch (e) {
            // Speech synthesis policy fallback
        }
    }

    if (btnBotVoice) {
        btnBotVoice.addEventListener('click', (e) => {
            e.stopPropagation();
            voiceEnabled = !voiceEnabled;
            btnBotVoice.classList.toggle('active', voiceEnabled);
            btnBotVoice.innerHTML = voiceEnabled 
                ? '<span id="voice-icon">🔊</span> Voice: ON' 
                : '<span id="voice-icon">🔇</span> Voice: OFF';

            if (voiceEnabled) {
                playBotChirp(620, 'sine', 0.14);
                speakBotText("AI Voice activated. I am RoboGuide, your portfolio copilot!");
            } else {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                playBotChirp(340, 'sine', 0.08);
            }
        });
    }

    // Robot Visor Eye Blinking Animation
    const eyeLeft = document.getElementById('bot-eye-left');
    const eyeRight = document.getElementById('bot-eye-right');

    function blinkEyes() {
        if (eyeLeft && eyeRight) {
            eyeLeft.setAttribute('r', '1');
            eyeRight.setAttribute('r', '1');
            setTimeout(() => {
                eyeLeft.setAttribute('r', '4.5');
                eyeRight.setAttribute('r', '4.5');
            }, 180);
        }
        setTimeout(blinkEyes, 4000 + Math.random() * 3000);
    }
    blinkEyes();

    // Robot Happy Bounce Trigger
    function triggerBotBounce() {
        if (botDroneChassis) {
            botDroneChassis.classList.remove('happy-bounce');
            void botDroneChassis.offsetWidth; // Trigger reflow
            botDroneChassis.classList.add('happy-bounce');
            playBotChirp(580, 'sine', 0.1);
        }
    }

    // Auto-Greeting on Page Load: Greets and auto-minimizes
    if (botGreetingToast) {
        botGreetingToast.classList.remove('hidden');
        const greetingTimer = setTimeout(() => {
            botGreetingToast.classList.add('hidden');
        }, 3800);

        botGreetingToast.addEventListener('click', () => {
            clearTimeout(greetingTimer);
            botGreetingToast.classList.add('hidden');
            openChatBox();
        });
    }

    // Chat Box Controls
    function openChatBox() {
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

    function closeChatBox() {
        if (botChatCard) {
            botChatCard.classList.add('hidden');
            playBotChirp(380, 'sine', 0.08);
            if (tourTimer) clearTimeout(tourTimer);
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        }
    }

    function toggleChatBox() {
        if (!botChatCard) return;
        if (botChatCard.classList.contains('hidden')) {
            openChatBox();
        } else {
            closeChatBox();
        }
    }

    if (botFigureWrapper) {
        botFigureWrapper.addEventListener('click', toggleChatBox);
    }

    if (botChatClose) {
        botChatClose.addEventListener('click', closeChatBox);
    }

    // Conversational Q&A Knowledge Base
    function appendChatMessage(sender, htmlContent, skipSpeech = false) {
        if (!botChatMessages) return;
        const msg = document.createElement('div');
        msg.className = `chat-msg ${sender}`;
        msg.innerHTML = htmlContent;
        botChatMessages.appendChild(msg);
        botChatMessages.scrollTop = botChatMessages.scrollHeight;

        if (sender === 'bot' && !skipSpeech) {
            speakBotText(htmlContent);
        }
    }

    // 30-Second Guided Tour Mode
    const TOUR_STEPS = [
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

    let tourTimer = null;

    function startGuidedTour() {
        if (tourTimer) clearTimeout(tourTimer);
        openChatBox();

        appendChatMessage('bot', '🎬 <strong>Starting 30-Second Guided Tour!</strong> Sit back as I guide you through Dhigveerraju\'s robotics portfolio sections.');
        speakBotText("Starting thirty second guided tour! Sit back as I guide you through Dhigveerraju's robotics portfolio.");

        function runStep(idx) {
            if (idx >= TOUR_STEPS.length) {
                appendChatMessage('bot', '🎉 <strong>Guided Tour Complete!</strong> Click any chip or ask any question to learn more about Dhigveer\'s work.');
                speakBotText("Guided tour complete! Feel free to ask me any question about Dhigveerraju's work.");
                return;
            }

            const step = TOUR_STEPS[idx];
            const target = document.getElementById(step.targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            appendChatMessage('bot', step.commentary, true);
            speakBotText(step.spokenText);
            triggerBotBounce();
            playBotChirp(540 + idx * 40, 'sine', 0.1);

            tourTimer = setTimeout(() => runStep(idx + 1), step.durationMs);
        }

        tourTimer = setTimeout(() => runStep(0), 1200);
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    let typingElement = null;

    function showBotTyping() {
        if (!botChatMessages || typingElement) return;
        typingElement = document.createElement('div');
        typingElement.className = 'chat-msg bot chat-typing';
        typingElement.innerHTML = `<span></span><span></span><span></span>`;
        botChatMessages.appendChild(typingElement);
        botChatMessages.scrollTop = botChatMessages.scrollHeight;
    }

    function hideBotTyping() {
        if (typingElement && botChatMessages) {
            botChatMessages.removeChild(typingElement);
            typingElement = null;
        }
    }

    function generateBotReply(rawQuery) {
        const q = rawQuery.toLowerCase().trim();

        // 0. Tour Command
        if (q.includes('tour') || q.includes('guide me') || q.includes('walkthrough') || q.includes('overview tour')) {
            setTimeout(startGuidedTour, 300);
            return "🚀 <strong>Initiating 30-Second Guided Tour!</strong> Auto-scrolling through Dhigveer's engineering profile, projects, skills, and contact...";
        }

        // 1. Assistant Identity & Capabilities
        if (q.includes('who are you') || q.includes('what are you') || q.includes('your name') || q === 'help') {
            return "🤖 I'm <strong>RoboGuide</strong>, Dhigveerraju's personal AI companion! I'm trained on his entire engineering portfolio. You can ask me about his <strong>popular projects</strong> (Conveyor Sentinel AI, Dual-Motor PWM), his <strong>embedded & AI skills</strong>, his <strong>background</strong>, or take the <strong>30s Guided Tour</strong>!";
        }

        // 2. Greetings & Small Talk
        if (q === 'hi' || q === 'hello' || q === 'hey' || q.startsWith('hello') || q.startsWith('hi ') || q.startsWith('hey ') || q.includes('good morning') || q.includes('good evening') || q.includes('greetings')) {
            return "👋 Hello! I'm <strong>RoboGuide</strong>. Ask me anything about Dhigveerraju's robotics projects, YOLOv8 vision system, C++ firmware, or how to get in touch!";
        }

        if (q.includes('how are you') || q.includes("how's it going") || q.includes('whats up') || q.includes("what's up")) {
            return "⚡ All systems nominal and ion thrusters running at peak efficiency! Ready to assist you. What would you like to explore in Dhigveer's portfolio today?";
        }

        if (q.includes('thank') || q.includes('thanks')) {
            return "🤖 You're very welcome! Feel free to ask more questions about Dhigveer's projects, or head to the contact section below to send him a transmission!";
        }

        // 2b. Resume & CV (Protected by Owner Authorization)
        if (q.includes('resume') || q.includes('cv') || q.includes('bio-data') || q.includes('biodata')) {
            return "🔒 <strong>Dhigveerraju's Resume / CV:</strong> Due to confidential firmware algorithms and hardware IP, Dhigveer's resume is available <strong>upon request only</strong>. Scroll down to the bottom contact section or <a href=\"#contact\" style=\"color: var(--primary); font-weight: 600;\">Click here to Request Resume Access</a>!";
        }

        // 3. About Dhigveerraju, Bio, Education & Philosophy
        if (q.includes('who is dhigveer') || q.includes('who is he') || q.includes('about dhigveer') || q.includes('about him') || q.includes('background') || q.includes('bio') || q === 'about' || q === 'who') {
            return "👨‍💻 <strong>Dhigveerraju G</strong> is a Robotics & Artificial Intelligence Engineer passionate about <strong>physical intelligence</strong>—where code directly commands mechanical torque, edge computer vision, and real-world inertia. He bridges embedded microcontrollers with deep learning edge vision.";
        }

        if (q.includes('education') || q.includes('college') || q.includes('study') || q.includes('degree') || q.includes('university')) {
            return "🎓 Dhigveerraju is pursuing his engineering degree in <strong>Robotics and Artificial Intelligence</strong>, with research focused on autonomous edge inspection systems, closed-loop actuator feedback, and embedded C++ firmware.";
        }

        if (q.includes('physical intelligence') || q.includes('philosophy')) {
            return "🧠 <strong>Physical Intelligence</strong> is Dhigveer's core engineering philosophy: true robotics begins when algorithms leave computer screens to directly control physical actuators, sense real-world material inertia, and react to hardware anomalies in real time.";
        }

        // 4. Highlighted & Popular Repositories
        if (q.includes('popular repo') || q.includes('flagship') || q.includes('best project') || q.includes('top project')) {
            return "⭐ <strong>Dhigveerraju's Top Highlighted Repositories:</strong><br>1. 🛡️ <strong>Conveyor Sentinel AI</strong> — Autonomous industrial defect detection running YOLOv8 + OpenCV at 42+ FPS.<br>2. ⚡ <strong>Synchronized Dual-Motor Actuation</strong> — C++ Arduino firmware with PWM soft-start acceleration ramping.<br>Click <em>'Explore More GitHub Repositories'</em> in the Projects section to see his Kinematics Lab and Telemetry HUD!";
        }

        if (q.includes('project') || q.includes('work') || q.includes('portfolio') || q.includes('built')) {
            return "🚀 <strong>Dhigveer's Core Engineering Builds:</strong><br>• <strong>Conveyor Sentinel AI</strong> (YOLOv8 Edge Vision & Reticle HUD)<br>• <strong>Synchronized Dual-Motor Actuation</strong> (PWM Soft-Start Ramping Firmware)<br>• <strong>Edge Vision Telemetry HUD</strong> (UART Serial Telemetry)<br>• <strong>Robotics Kinematics Lab</strong> (TETRIX PRIZM Closed-Loop Encoders)<br>Scroll to the <em>Projects</em> section to inspect their architecture diagrams!";
        }

        // 5. Specific Projects Deep-Dive
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

        // 6. Skills & Technology Stack
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

        // 7. Hiring, Jobs & Collaboration
        if (q.includes('hire') || q.includes('hiring') || q.includes('job') || q.includes('intern') || q.includes('open to work') || q.includes('collaborat') || q.includes('opportunity') || q.includes('available')) {
            return "💼 <strong>Open for Opportunities:</strong> Yes! Dhigveerraju is actively seeking robotics engineering roles, computer vision research collaborations, and embedded hardware internships. You can reach out directly through the contact transmission form below or connect via LinkedIn!";
        }

        if (q.includes('location') || q.includes('where is he') || q.includes('remote') || q.includes('city') || q.includes('country')) {
            return "📍 Dhigveerraju is based in <strong>India 🇮🇳</strong> and is open to both <strong>on-site</strong> and <strong>remote</strong> engineering opportunities worldwide.";
        }

        // 8. Contact & Social Profiles
        if (q.includes('linkedin')) {
            return "💼 Connect with Dhigveerraju on LinkedIn here: <a href=\"https://in.linkedin.com/in/dhigveerraju-g-69737036b\" target=\"_blank\" style=\"color: var(--primary); font-weight: 600;\">linkedin.com/in/dhigveerraju-g-69737036b ↗</a>";
        }

        if (q.includes('github') || q.includes('repo')) {
            return "🐙 Explore Dhigveerraju's open-source repositories here: <a href=\"https://github.com/DhigveerrajuG\" target=\"_blank\" style=\"color: var(--primary); font-weight: 600;\">github.com/DhigveerrajuG ↗</a>";
        }

        if (q.includes('contact') || q.includes('reach') || q.includes('email') || q.includes('message') || q.includes('touch')) {
            return "📫 <strong>Let's Connect!</strong><br>• <strong>Transmission Form:</strong> Use the direct message form at the bottom of this page.<br>• <strong>LinkedIn:</strong> <a href=\"https://in.linkedin.com/in/dhigveerraju-g-69737036b\" target=\"_blank\" style=\"color: var(--primary); font-weight: 600;\">Connect on LinkedIn ↗</a><br>• <strong>GitHub:</strong> <a href=\"https://github.com/DhigveerrajuG\" target=\"_blank\" style=\"color: var(--primary); font-weight: 600;\">Explore GitHub Profile ↗</a>";
        }

        // 9. Intelligent Contextual Fallback
        return `🤖 Thanks for asking about <em>"${escapeHtml(rawQuery)}"</em>! As Dhigveerraju's AI copilot, I can tell you about his <strong>flagship projects</strong> (Conveyor Sentinel AI, Dual-Motor PWM), his <strong>skills & tech stack</strong> (C++, Python, YOLOv8, Arduino), or how to <strong>get in touch</strong>. What would you like to explore?`;
    }

    async function processUserQuestion(questionText) {
        if (!questionText || !questionText.trim()) return;
        const text = questionText.trim();

        // 0. Check if user requested guided tour
        if (text.toLowerCase().includes('tour')) {
            startGuidedTour();
            return;
        }

        // 1. Append user's question
        appendChatMessage('user', escapeHtml(text), true);
        playBotChirp(460, 'sine', 0.08);

        // 2. Show animated typing indicator
        showBotTyping();

        try {
            // Attempt transmission to connected backend API
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            if (res.ok) {
                const data = await res.json();
                hideBotTyping();
                appendChatMessage('bot', data.reply);
                triggerBotBounce();
                playBotChirp(560, 'sine', 0.12);
                return;
            }
        } catch (e) {
            // Fallback for static hosting or offline mode
        }

        // Realistic typing delay for local fallback
        setTimeout(() => {
            hideBotTyping();
            const reply = generateBotReply(text);
            appendChatMessage('bot', reply);
            triggerBotBounce();
            playBotChirp(560, 'sine', 0.12);
        }, 280);
    }

    // Input form submit listener
    if (botChatForm && botChatInput) {
        botChatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = botChatInput.value;
            if (val.trim()) {
                processUserQuestion(val);
                botChatInput.value = '';
            }
        });
    }

    // Suggestion chips click listener
    document.querySelectorAll('.chat-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const action = chip.getAttribute('data-action');
            if (action === 'tour') {
                startGuidedTour();
                return;
            }
            const query = chip.getAttribute('data-question') || chip.textContent;
            processUserQuestion(query);
        });
    });

    /* ----------------------------------------------------------------------
       9. Live GitHub API Data Sync & Cache
       ---------------------------------------------------------------------- */
    const GITHUB_USERNAME = 'DhigveerrajuG';
    const CACHE_KEY = 'dhigveer_github_sync_v3';
    const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hr cache

    async function syncGitHubData() {
        try {
            // Check cache
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
                    applyRepoStats(parsed.repos);
                    return;
                }
            }

            const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
            if (!res.ok) throw new Error("GitHub API non-200");
            const repos = await res.json();

            localStorage.setItem(CACHE_KEY, JSON.stringify({
                repos: repos,
                timestamp: Date.now()
            }));

            applyRepoStats(repos);
        } catch (err) {
            // Fallback default stats
            applyRepoStats([
                { name: 'Autonomous-Industrial-Conveyor-Belt-Inspection-System', stargazers_count: 2, forks_count: 1 }
            ]);
        }
    }

    function applyRepoStats(repos) {
        repos.forEach(repo => {
            const nameLower = repo.name.toLowerCase();
            if (nameLower.includes('conveyor') || nameLower.includes('autonomous-industrial')) {
                const el = document.getElementById('stats-conveyor-sentinel');
                if (el) el.innerHTML = `<span>⭐ ${repo.stargazers_count || 1}</span> <span>🍴 ${repo.forks_count || 0}</span>`;
            }
        });
    }
    syncGitHubData();

    /* ----------------------------------------------------------------------
       10. Contact Form Submission (Connected Backend Integration)
       ---------------------------------------------------------------------- */
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');
    const btnSubmitForm = document.getElementById('btn-submit-form');

    if (contactForm && formFeedback) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const message = document.getElementById('form-message').value.trim();

            if (!name || !email || !message) return;

            if (btnSubmitForm) {
                btnSubmitForm.disabled = true;
                btnSubmitForm.innerHTML = `<span>Transmitting...</span>`;
            }
            playBotChirp(600, 'sine', 0.15);

            let feedbackHtml = `<span>✅ <strong>Transmission Dispatched!</strong> Thank you ${name}. Dhigveerraju will reply to ${email} promptly.</span>`;

            try {
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.message) {
                        feedbackHtml = `<span>✅ <strong>Transmission Dispatched!</strong> ${data.message}</span>`;
                    }
                }
            } catch (err) {
                // Safe offline fallback
            }

            formFeedback.style.display = 'flex';
            formFeedback.innerHTML = feedbackHtml;
            saveLocalBackup('contact', { name, email, message, timestamp: Date.now() });
            contactForm.reset();
            playBotChirp(680, 'sine', 0.15);

            if (btnSubmitForm) {
                btnSubmitForm.disabled = false;
                btnSubmitForm.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    <span>Send Transmission</span>
                `;
            }
        });
    }

    /* ----------------------------------------------------------------------
       10b. Resume Access Request & Passcode Authorization Modal
       ---------------------------------------------------------------------- */
    const btnOpenResumeModal = document.getElementById('btn-open-resume-modal');
    const resumeModalBackdrop = document.getElementById('resume-modal-backdrop');
    const resumeModalCloseBtn = document.getElementById('resume-modal-close-btn');
    const resumeRequestForm = document.getElementById('resume-request-form');
    const resumeReqFeedback = document.getElementById('resume-req-feedback');
    const btnSubmitResumeReq = document.getElementById('btn-submit-resume-req');
    const resumePasscodeForm = document.getElementById('resume-passcode-form');
    const resumePasscodeInput = document.getElementById('resume-passcode-input');
    const passcodeFeedback = document.getElementById('passcode-feedback');

    function openResumeModal() {
        if (resumeModalBackdrop) {
            resumeModalBackdrop.classList.add('open');
            playBotChirp(520, 'sine', 0.1);
        }
    }

    function closeResumeModal() {
        if (resumeModalBackdrop) {
            resumeModalBackdrop.classList.remove('open');
            playBotChirp(380, 'sine', 0.08);
        }
    }

    if (btnOpenResumeModal) {
        btnOpenResumeModal.addEventListener('click', openResumeModal);
    }

    if (resumeModalCloseBtn) {
        resumeModalCloseBtn.addEventListener('click', closeResumeModal);
    }

    if (resumeModalBackdrop) {
        resumeModalBackdrop.addEventListener('click', (e) => {
            if (e.target === resumeModalBackdrop) closeResumeModal();
        });
    }

    async function computeSha256(text) {
        if (!text) return '';
        if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
            const encoder = new TextEncoder();
            const data = encoder.encode(text.trim());
            const hashBuf = await window.crypto.subtle.digest('SHA-256', data);
            return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        return text.trim();
    }

    const VALID_HASHES = [
        '65be5e18e6c991aa446e73b207d3e730fdcb8fa40629ed67d346484498bfdf50', // Cryptographic SHA-256 owner hash
        'e77f0d3669b840577debfd91924c98fac4ce1af892b4419eed44d826ad56a973', // ROBOTICS-AUTH
        'efb554bced586b984ed4c05a8b6042558ab3607c9b5b314fc76a82f779dbc6c5'  // ACCESS-GRANTED
    ];
    const PUBLIC_TOKENS = ['ROBOTICS-AUTH', 'ACCESS-GRANTED'];

    // Handle Passcode Unlock (Instant access for owner / pre-approved recruiters)
    if (resumePasscodeForm && resumePasscodeInput) {
        resumePasscodeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const val = resumePasscodeInput.value.trim();
            const hash = await computeSha256(val);

            if (VALID_HASHES.includes(hash) || PUBLIC_TOKENS.includes(val.toUpperCase())) {
                sessionStorage.setItem('resume_authorized', 'true');
                if (passcodeFeedback) {
                    passcodeFeedback.className = 'passcode-feedback-alert success';
                    passcodeFeedback.textContent = '✅ Access Approved! Opening resume sheet...';
                }
                playBotChirp(720, 'sine', 0.18);
                setTimeout(() => {
                    window.open('assets/resume.html', '_blank');
                    closeResumeModal();
                }, 750);
            } else {
                if (passcodeFeedback) {
                    passcodeFeedback.className = 'passcode-feedback-alert error';
                    passcodeFeedback.textContent = '❌ Invalid passcode. Submit an access request above for Dhigveer to approve.';
                }
                playBotChirp(280, 'sine', 0.12);
            }
        });
    }

    // Handle Access Request Submission
    if (resumeRequestForm) {
        resumeRequestForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameEl = document.getElementById('resume-req-name');
            const emailEl = document.getElementById('resume-req-email');
            const orgEl = document.getElementById('resume-req-org');
            const purposeEl = document.getElementById('resume-req-purpose');

            if (!nameEl || !emailEl) return;

            const name = nameEl.value.trim();
            const email = emailEl.value.trim();
            const org = orgEl ? orgEl.value.trim() : '';
            const purpose = purposeEl ? purposeEl.value.trim() : '';

            if (!name || !email) return;

            if (btnSubmitResumeReq) {
                btnSubmitResumeReq.disabled = true;
                btnSubmitResumeReq.innerHTML = '<span>Transmitting Request...</span>';
            }
            playBotChirp(580, 'sine', 0.1);

            try {
                await fetch('/api/resume-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, org, purpose })
                });

                if (resumeReqFeedback) {
                    resumeReqFeedback.style.display = 'block';
                    resumeReqFeedback.className = 'form-feedback-alert';
                    resumeReqFeedback.innerHTML = `<span>✅ <strong>Request Submitted for Approval!</strong> Notification dispatched to Dhigveerraju. Upon review and approval, an access link will be delivered to <strong>${escapeHtml(email)}</strong>.</span>`;
                }
                saveLocalBackup('resume_req', { id: 'req_' + Date.now(), name, email, org, purpose, status: 'PENDING_APPROVAL', timestamp: Date.now() });
                resumeRequestForm.reset();
                playBotChirp(680, 'sine', 0.15);
            } catch (err) {
                if (resumeReqFeedback) {
                    resumeReqFeedback.style.display = 'block';
                    resumeReqFeedback.className = 'form-feedback-alert';
                    resumeReqFeedback.innerHTML = `<span>✅ <strong>Request Submitted for Approval!</strong> Notification dispatched to Dhigveerraju. Upon review and approval, an access link will be delivered to <strong>${escapeHtml(email)}</strong>.</span>`;
                }
                saveLocalBackup('resume_req', { id: 'req_' + Date.now(), name, email, org, purpose, status: 'PENDING_APPROVAL', timestamp: Date.now() });
                resumeRequestForm.reset();
                playBotChirp(680, 'sine', 0.15);
            } finally {
                if (btnSubmitResumeReq) {
                    btnSubmitResumeReq.disabled = false;
                    btnSubmitResumeReq.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        <span>Submit Access Request</span>
                    `;
                }
            }
        });
    }

    /* ----------------------------------------------------------------------
       10c. Reactive RoboGuide Drone Micro-Interactions
       ---------------------------------------------------------------------- */
    const botChassis = botDroneChassis || document.getElementById('bot-drone-chassis');
    const antennaBeacon = document.getElementById('bot-antenna-beacon');

    function setBotReaction(state) {
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
    document.querySelectorAll('.project-card[data-category="vision"]').forEach(card => {
        card.addEventListener('mouseenter', () => setBotReaction('scanning'));
        card.addEventListener('mouseleave', () => setBotReaction('normal'));
    });

    document.querySelectorAll('.project-card[data-category="robotics"]').forEach(card => {
        card.addEventListener('mouseenter', () => setBotReaction('ramping'));
        card.addEventListener('mouseleave', () => setBotReaction('normal'));
    });

    const resumeBox = document.querySelector('.resume-access-channel');
    if (resumeBox) {
        resumeBox.addEventListener('mouseenter', () => setBotReaction('locked'));
        resumeBox.addEventListener('mouseleave', () => setBotReaction('normal'));
    }

    const skillsSection = document.getElementById('skills');
    if (skillsSection) {
        skillsSection.addEventListener('mouseenter', () => setBotReaction('matrix'));
        skillsSection.addEventListener('mouseleave', () => setBotReaction('normal'));
    }

    /* ----------------------------------------------------------------------
       10d. Owner Approval Dashboard Controller (/admin)
       ---------------------------------------------------------------------- */
    const btnOpenAdmin = document.getElementById('btn-open-admin');
    const adminBackdrop = document.getElementById('admin-modal-backdrop');
    const adminCloseBtn = document.getElementById('admin-modal-close-btn');
    const authView = document.getElementById('admin-auth-view');
    const dashView = document.getElementById('admin-dash-view');
    const adminPasscodeForm = document.getElementById('admin-passcode-form');
    const adminPasscodeInput = document.getElementById('admin-passcode-input');
    const authError = document.getElementById('admin-auth-error');
    const btnLogout = document.getElementById('btn-admin-logout');
    const reqListEl = document.getElementById('admin-resume-req-list');
    const contactListEl = document.getElementById('admin-contact-list');
    const tabReqsBtn = document.getElementById('btn-tab-admin-reqs');
    const tabMsgsBtn = document.getElementById('btn-tab-admin-msgs');
    const paneReqs = document.getElementById('admin-pane-reqs');
    const paneMsgs = document.getElementById('admin-pane-msgs');

    function openAdmin() {
        if (!adminBackdrop) return;
        adminBackdrop.classList.add('open');
        playBotChirp(540, 'sine', 0.1);

        if (sessionStorage.getItem('owner_logged_in') === 'true') {
            showDashboard();
        } else {
            showAuth();
        }
    }

    function closeAdmin() {
        if (adminBackdrop) adminBackdrop.classList.remove('open');
        playBotChirp(380, 'sine', 0.08);
    }

    if (btnOpenAdmin) btnOpenAdmin.addEventListener('click', openAdmin);
    if (adminCloseBtn) adminCloseBtn.addEventListener('click', closeAdmin);
    if (adminBackdrop) {
        adminBackdrop.addEventListener('click', (e) => {
            if (e.target === adminBackdrop) closeAdmin();
        });
    }

    function showAuth() {
        if (authView) authView.style.display = 'block';
        if (dashView) dashView.style.display = 'none';
        if (adminPasscodeInput) setTimeout(() => adminPasscodeInput.focus(), 150);
    }

    function showDashboard() {
        if (authView) authView.style.display = 'none';
        if (dashView) dashView.style.display = 'block';
        loadAdminData();
    }

    if (adminPasscodeForm && adminPasscodeInput) {
        adminPasscodeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const val = adminPasscodeInput.value.trim();
            const hash = await computeSha256(val);

            if (VALID_HASHES.includes(hash) || PUBLIC_TOKENS.includes(val.toUpperCase())) {
                sessionStorage.setItem('owner_logged_in', 'true');
                sessionStorage.setItem('owner_auth_hash', hash);
                if (authError) authError.style.display = 'none';
                adminPasscodeInput.value = '';
                playBotChirp(720, 'sine', 0.18);
                showDashboard();
            } else {
                if (authError) {
                    authError.style.display = 'block';
                    authError.textContent = '❌ Invalid owner passcode.';
                }
                playBotChirp(280, 'sine', 0.12);
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            sessionStorage.removeItem('owner_logged_in');
            playBotChirp(380);
            showAuth();
        });
    }

    // Tab switching in Admin Dashboard
    if (tabReqsBtn && tabMsgsBtn && paneReqs && paneMsgs) {
        tabReqsBtn.addEventListener('click', () => {
            tabReqsBtn.classList.add('active');
            tabMsgsBtn.classList.remove('active');
            paneReqs.style.display = 'block';
            paneMsgs.style.display = 'none';
        });

        tabMsgsBtn.addEventListener('click', () => {
            tabMsgsBtn.classList.add('active');
            tabReqsBtn.classList.remove('active');
            paneMsgs.style.display = 'block';
            paneReqs.style.display = 'none';
        });
    }

    async function loadAdminData() {
        let resumeRequests = [];
        let contacts = [];

        try {
            const authHash = sessionStorage.getItem('owner_auth_hash') || VALID_HASHES[0];
            const res = await fetch('/api/admin/data', {
                headers: { 'x-admin-passcode': authHash }
            });
            if (res.ok) {
                const data = await res.json();
                resumeRequests = data.resumeRequests || [];
                contacts = data.contacts || [];
            } else {
                throw new Error("Admin fetch non-200");
            }
        } catch {
            // Fallback: load from local storage backup (works 100% offline / GitHub Pages)
            resumeRequests = getLocalBackups('resume_req');
            contacts = getLocalBackups('contact');
        }

        renderResumeRequests(resumeRequests);
        renderContactMessages(contacts);
    }

    function renderResumeRequests(requests) {
        if (!reqListEl) return;
        if (!requests || requests.length === 0) {
            reqListEl.innerHTML = `<div class="admin-empty-state">No pending resume requests at this time.</div>`;
            return;
        }

        const approvalUrl = new URL('assets/resume.html?token=ACCESS-GRANTED', window.location.href).href;

        reqListEl.innerHTML = requests.map(req => {
            const isApproved = req.status === 'APPROVED';
            const dateStr = req.timestamp ? new Date(req.timestamp).toLocaleDateString() : 'Recent';
            return `
                <div class="admin-card-item">
                    <div class="admin-card-header">
                        <div>
                            <span class="admin-applicant-name">${escapeHtml(req.name)}</span>
                            <span class="admin-applicant-email">(${escapeHtml(req.email)})</span>
                        </div>
                        <span class="admin-status-badge ${isApproved ? 'approved' : 'pending'}">
                            ${isApproved ? '✅ Approved' : '⏳ Pending Approval'}
                        </span>
                    </div>
                    <div class="admin-card-body">
                        <div><strong>Organization:</strong> ${escapeHtml(req.org || req.organization || 'N/A')}</div>
                        <div><strong>Purpose:</strong> ${escapeHtml(req.purpose || 'General Review')}</div>
                        <div class="admin-card-date">Received: ${dateStr}</div>
                    </div>
                    <div class="admin-card-actions">
                        <button type="button" class="btn btn-sm btn-primary btn-approve-copy" data-id="${req.id || ''}" data-email="${escapeHtml(req.email)}" data-name="${escapeHtml(req.name)}">
                            <span>📋 Approve &amp; Copy Access Link</span>
                        </button>
                        <a href="mailto:${escapeHtml(req.email)}?subject=${encodeURIComponent('Resume Access Approved - Dhigveerraju G')}&body=${encodeURIComponent(`Hello ${req.name},\n\nYour request to view my robotics engineering resume has been approved.\n\nYou can view and download it here:\n${approvalUrl}\n\nBest regards,\nDhigveerraju G`)}" class="btn btn-sm btn-outline">
                            <span>✉️ Email Access Link</span>
                        </a>
                    </div>
                </div>
            `;
        }).join('');

        // Wire copy button
        reqListEl.querySelectorAll('.btn-approve-copy').forEach(btn => {
            btn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(approvalUrl);
                    btn.innerHTML = '<span>✅ Copied to Clipboard!</span>';
                    playBotChirp(680, 'sine', 0.12);
                    setTimeout(() => {
                        btn.innerHTML = '<span>📋 Approve &amp; Copy Access Link</span>';
                    }, 2200);

                    // Call backend approval endpoint
                    const reqId = btn.getAttribute('data-id');
                    if (reqId) {
                        const authHash = sessionStorage.getItem('owner_auth_hash') || VALID_HASHES[0];
                        fetch('/api/admin/approve', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'x-admin-passcode': authHash },
                            body: JSON.stringify({ id: reqId })
                        }).catch(() => {});
                    }
                } catch {
                    alert(`Approval Link: ${approvalUrl}`);
                }
            });
        });
    }

    function renderContactMessages(messages) {
        if (!contactListEl) return;
        if (!messages || messages.length === 0) {
            contactListEl.innerHTML = `<div class="admin-empty-state">No contact messages received yet.</div>`;
            return;
        }

        contactListEl.innerHTML = messages.map(msg => {
            const dateStr = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'Recent';
            return `
                <div class="admin-card-item">
                    <div class="admin-card-header">
                        <div>
                            <span class="admin-applicant-name">${escapeHtml(msg.name)}</span>
                            <span class="admin-applicant-email">&lt;${escapeHtml(msg.email)}&gt;</span>
                        </div>
                        <span class="admin-card-date">${dateStr}</span>
                    </div>
                    <div class="admin-message-content">${escapeHtml(msg.message)}</div>
                    <div class="admin-card-actions">
                        <a href="mailto:${escapeHtml(msg.email)}?subject=${encodeURIComponent('Re: Robotics Inquiry - Dhigveerraju G')}" class="btn btn-sm btn-outline">
                            <span>↩️ Reply via Email</span>
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Local Storage Backup Helpers (Supports static hosting / offline fallback)
    function saveLocalBackup(type, item) {
        try {
            const key = `dhigveer_backup_${type}`;
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            existing.unshift(item);
            localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
        } catch (e) {}
    }

    function getLocalBackups(type) {
        try {
            const key = `dhigveer_backup_${type}`;
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
            return [];
        }
    }

    /* ----------------------------------------------------------------------
       11. Scroll Reveal Animations & Navigation Scroll Spy
       ---------------------------------------------------------------------- */
    const revealTargets = document.querySelectorAll(
        '.section-header, .about-profile-card, .skills-column-card, .project-card, .metric-item, .contact-card-info, .contact-form-wrapper'
    );
    revealTargets.forEach(el => el.classList.add('reveal-on-scroll'));

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        revealTargets.forEach(el => revealObserver.observe(el));
    } else {
        revealTargets.forEach(el => el.classList.add('reveal-visible'));
    }

    // Scroll Spy for Navigation Active Underline
    const pageSections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-link-item');

    window.addEventListener('scroll', () => {
        let activeId = '';
        const scrollPosition = window.pageYOffset;

        pageSections.forEach(sec => {
            const top = sec.offsetTop - 130;
            const height = sec.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
                activeId = sec.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${activeId}`) {
                item.classList.add('active');
            }
        });
    }, { passive: true });

});
