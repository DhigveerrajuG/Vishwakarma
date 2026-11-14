# ⚙️ Vishwakarma — Robotics & Artificial Intelligence Engineering Portfolio

[![Live Site](https://img.shields.io/badge/Live-GitHub%20Pages-2563eb?style=flat&logo=github)](https://dhigveerrajug.github.io/Vishwakarma/)
[![Release](https://img.shields.io/badge/Release-v1.0.0-emerald?style=flat&logo=tag)](https://github.com/DhigveerrajuG/Vishwakarma/releases)
[![Author](https://img.shields.io/badge/Author-Dhigveerraju%20G-slate)](https://github.com/DhigveerrajuG)

> **Vishwakarma**: The divine architect of physical intelligence — a high-performance modern engineering portfolio showcasing cyber-physical systems, edge computer vision with lightweight YOLOv8, embedded Arduino/C++ PWM motor actuation, and TETRIX PRIZM kinematics.

---

## ⚡ Architecture & Tech Stack

- **Frontend Structure**: Semantic HTML5 with ARIA accessibility, responsive CSS Grid & Flexbox, light/dark themes.
- **Frontend Logic & Animations**: Modular **TypeScript** (`src/`) compiled to ES2022 modules (`dist/`) featuring:
  - **RoboGuide AI Companion**: Stationary levitating drone with on-load auto-greeting toast, auto-minimize, interactive Q&A chat box, typing indicator, and suggestion chips.
  - **30-Second Guided Tour Mode**: Automated smooth-scroll walkthrough guiding visitors through Dhigveer's engineering profile, flagship builds, technical matrix, and contact channels.
  - **AI Voice Speech Synthesis (Web Speech API)**: Toggleable robotic voice narration with natural English cadence.
  - **Protected Resume / CV (Authorization Required)**: Access-protected printable resume sheet (`assets/resume.html`) with owner approval workflow and passcode authorization.
  - **Scroll Reveal & Micro-Interactions**: Smooth entrance animations, active navigation scroll-spy, and Web Audio API synthesized electronic chirps.
  - **Project Architecture Modals**: High-throughput YOLOv8 vision pipeline, PWM soft-start acceleration profiles, and closed-loop optical encoder specs.
- **Connected Backend**: Dual-ready API servers supporting:
  - **Java 26 Backend** (`backend-java/`): Zero-external-dependency HTTP server utilizing Java's `com.sun.net.httpserver.HttpServer` with Virtual Threads.
  - **Node.js Backend** (`server/server.js`): Fast, zero-dependency REST API server.
  - **REST API Endpoints**:
    - `POST /api/contact` — Validates and stores contact form transmissions in `data/contacts.json`.
    - `POST /api/resume-request` — Records resume access requests for owner review in `data/resume_requests.json`.
    - `POST /api/admin/data` — Owner dashboard data feed (passcode protected).
    - `POST /api/admin/approve` — One-click resume access request authorization.
    - `POST /api/chat` — Natural language query processor for RoboGuide.
    - `GET /api/projects` — Real-time project telemetry metrics.
    - `GET /api/health` — System health check for deployment platforms.
- **Offline / Static Resilient**: Full client-side fallback ensures all features (chat, modals, feedback) work seamlessly even on static hosts like GitHub Pages.

---

## 🚀 Quick Start (Local Development)

### 1. Run with Node.js
```bash
# Install dependencies (TypeScript compiler & types)
pnpm install  # or npm install

# Build TypeScript
pnpm run build

# Start the Node.js server
pnpm start    # or npm start
# Server live on: http://localhost:8080
```

### 2. Run with Java 26
```bash
# Compile Java server
pnpm run build:java

# Run Java server
pnpm run server:java
# Server live on: http://localhost:8080
```

### 3. Direct Browser Preview
You can also directly double-click `index.html` to open it in Chrome, Edge, or Firefox.

---

## 📦 How to Publish

### Option A: GitHub Pages (Free Static Hosting)
1. Push this repository to GitHub under `DhigveerrajuG/dhigveerraju-portfolio`.
2. Go to **Settings** → **Pages**.
3. Under **Build and deployment**, select **Source: Deploy from a branch** (Branch: `main`, folder: `/root`).
4. Click **Save**. Your portfolio will be live at `https://dhigveerrajug.github.io/dhigveerraju-portfolio/`!

### Option B: Vercel / Netlify (One-Click)
1. Import the repository into [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Set Build Command: `pnpm run build` (or `npm run build`).
3. Set Output Directory: `.` (root).
4. Click **Deploy**.

### Option C: Render / Railway / Docker (Full-Stack Backend)
1. Deploy using the included `Dockerfile` or connect your GitHub repository to [Render](https://render.com) as a **Web Service**.
2. Build Command: `pnpm install && pnpm run build`
3. Start Command: `npm start`
4. Set Port: `8080`

---

## 🛡️ Projects Featured
1. **Conveyor Sentinel AI**: Autonomous Industrial Conveyor Belt Inspection System combining YOLOv8 and OpenCV at 42+ FPS.
2. **Synchronized Dual-Motor Actuation**: C++ firmware on Arduino with mathematical PWM acceleration ramping.
3. **Edge Vision Telemetry & Diagnostics HUD**: Dynamic coordinate bounding boxes and UART serial link.
4. **Robotics Kinematics & Actuation Lab**: TETRIX PRIZM closed-loop motor control with quadrature optical encoders.

---

© 2026 Dhigveerraju G. All rights reserved.
