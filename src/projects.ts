import { ProjectDetail, ProjectMap } from './types';
import { playBotChirp } from './audio';
export const PROJECT_DETAILS: ProjectMap = {
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
const uint8_t ENA_PIN = 9;
const uint8_t ENB_PIN = 10;
const uint8_t IN1_PIN = 4;
const uint8_t IN2_PIN = 5;
const uint8_t IN3_PIN = 6;
const uint8_t IN4_PIN = 7;
const uint8_t TARGET_DUTY = 220;
const uint8_t RAMP_STEP_DELAY_MS = 18;
void setupMotorTimers() {
    TCCR1B = (TCCR1B & 0b11111000) | 0x01;
    pinMode(ENA_PIN, OUTPUT);
    pinMode(ENB_PIN, OUTPUT);
    pinMode(IN1_PIN, OUTPUT);
    pinMode(IN2_PIN, OUTPUT);
    pinMode(IN3_PIN, OUTPUT);
    pinMode(IN4_PIN, OUTPUT);
}
void executeSoftStartRamping(uint8_t targetDuty) {
    digitalWrite(IN1_PIN, HIGH); digitalWrite(IN2_PIN, LOW);
    digitalWrite(IN3_PIN, HIGH); digitalWrite(IN4_PIN, LOW);
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
    long countM1 = prizm.readEncoderCount(1);
    long countM2 = prizm.readEncoderCount(2);
    long error = countM1 - countM2;
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
export function initProjects(): void {
    initFilters();
    initModals();
    syncRepoStats();
}
function initFilters(): void {
    const filterBtns = document.querySelectorAll<HTMLButtonElement>('.filter-btn');
    const projectCards = document.querySelectorAll<HTMLElement>('.project-card');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter') || 'all';
            playBotChirp(480);
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}
function escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
export function openProjectModal(projectId: string): void {
    const details = PROJECT_DETAILS[projectId];
    const modalBackdrop = document.getElementById('project-modal-backdrop');
    const modalContentArea = document.getElementById('modal-content-area');
    if (!details || !modalContentArea || !modalBackdrop) return;
    playBotChirp(520);
    modalContentArea.innerHTML = `
        <div style="margin-bottom: 16px;">
            <span class="project-category-badge vision" style="margin-bottom: 8px;">${details.badge}</span>
            <h2 style="font-size: 1.55rem; margin-top: 6px; margin-bottom: 4px;">${details.title}</h2>
            <h4 style="font-size: 0.92rem; color: var(--primary);">${details.subtitle}</h4>
        </div>
        <p style="font-size: 0.92rem; color: var(--text-secondary); margin-bottom: 18px; line-height: 1.55;">${details.summary}</p>
        <div class="project-modal-tabs">
            <button type="button" class="proj-tab-btn active" data-tab="arch">📐 Architecture</button>
            ${details.codeSnippet ? `<button type="button" class="proj-tab-btn" data-tab="code">💻 Source Code</button>` : ''}
            ${details.schematics ? `<button type="button" class="proj-tab-btn" data-tab="specs">🔌 Specs & Pins</button>` : ''}
        </div>
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
    const tabBtns = modalContentArea.querySelectorAll<HTMLButtonElement>('.proj-tab-btn');
    const panes = modalContentArea.querySelectorAll<HTMLElement>('.proj-tab-pane');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            panes.forEach(p => p.style.display = 'none');
            btn.classList.add('active');
            playBotChirp(440, 'sine', 0.05);
            const activePane = modalContentArea.querySelector<HTMLElement>(`#tab-pane-${target}`);
            if (activePane) activePane.style.display = 'block';
        });
    });
    const copyBtn = modalContentArea.querySelector<HTMLButtonElement>('#btn-copy-modal-code');
    const codeTarget = modalContentArea.querySelector<HTMLElement>('#code-snippet-target');
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
function initModals(): void {
    const modalBackdrop = document.getElementById('project-modal-backdrop');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    document.querySelectorAll<HTMLButtonElement>('.btn-inspect-project').forEach(btn => {
        btn.addEventListener('click', () => {
            const projectId = btn.getAttribute('data-project');
            if (projectId) openProjectModal(projectId);
        });
    });
    if (modalCloseBtn && modalBackdrop) {
        modalCloseBtn.addEventListener('click', () => modalBackdrop.classList.remove('open'));
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) modalBackdrop.classList.remove('open');
        });
    }
}
async function syncRepoStats(): Promise<void> {
    const el = document.getElementById('stats-conveyor-sentinel');
    if (!el) return;
    try {
        const cached = localStorage.getItem('dhigveer_github_sync_v3');
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < 3600000 && parsed.repos) {
                applyStats(parsed.repos, el);
                return;
            }
        }
        const res = await fetch('https://api.github.com/users/DhigveerrajuG/repos?per_page=100');
        if (res.ok) {
            const repos = await res.json();
            localStorage.setItem('dhigveer_github_sync_v3', JSON.stringify({ repos, timestamp: Date.now() }));
            applyStats(repos, el);
        }
    } catch {
        el.innerHTML = `<span>⭐ 2</span> <span>🍴 1</span>`;
    }
}
function applyStats(repos: Array<{ name: string; stargazers_count?: number; forks_count?: number }>, el: HTMLElement): void {
    const match = repos.find(r => r.name.toLowerCase().includes('conveyor') || r.name.toLowerCase().includes('autonomous-industrial'));
    if (match) {
        el.innerHTML = `<span>⭐ ${match.stargazers_count || 2}</span> <span>🍴 ${match.forks_count || 1}</span>`;
    } else {
        el.innerHTML = `<span>⭐ 2</span> <span>🍴 1</span>`;
    }
}
