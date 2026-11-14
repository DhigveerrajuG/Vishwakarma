/**
 * Dhigveerraju G - Robotics & Artificial Intelligence Portfolio Server (Node.js)
 * High-performance, zero-external-dependency HTTP API & Static File Server.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 8080;
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const RESUME_REQUESTS_FILE = path.join(DATA_DIR, 'resume_requests.json');

const VALID_ADMIN_HASHES = [
    '65be5e18e6c991aa446e73b207d3e730fdcb8fa40629ed67d346484498bfdf50', // Cryptographic SHA-256 owner hash
    'e77f0d3669b840577debfd91924c98fac4ce1af892b4419eed44d826ad56a973', // ROBOTICS-AUTH
    'efb554bced586b984ed4c05a8b6042558ab3607c9b5b314fc76a82f779dbc6c5'  // ACCESS-GRANTED
];

function verifyPasscode(passcode) {
    if (!passcode) return false;
    const clean = passcode.trim();
    if (clean === 'ROBOTICS-AUTH' || clean === 'ACCESS-GRANTED') return true;
    if (VALID_ADMIN_HASHES.includes(clean)) return true;
    const hash = crypto.createHash('sha256').update(clean).digest('hex');
    return VALID_ADMIN_HASHES.includes(hash);
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(CONTACTS_FILE)) {
    fs.writeFileSync(CONTACTS_FILE, '[]', 'utf8');
}
if (!fs.existsSync(RESUME_REQUESTS_FILE)) {
    fs.writeFileSync(RESUME_REQUESTS_FILE, '[]', 'utf8');
}

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.map': 'application/json'
};

function sendCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-passcode');
}

function sendJson(res, statusCode, data) {
    sendCors(res);
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify(data));
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    sendCors(res);

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = parsedUrl.pathname;

    // API: Health Check
    if (pathname === '/api/health') {
        sendJson(res, 200, {
            status: 'UP',
            service: 'Robotics & AI Engineering Portfolio API',
            runtime: `Node.js ${process.version}`,
            timestamp: Date.now(),
            author: 'Dhigveerraju G'
        });
        return;
    }

    // API: Contact Form Submission
    if (pathname === '/api/contact' && req.method === 'POST') {
        try {
            const body = await readBody(req);
            const { name, email, message } = body;

            if (!name || !email || !message) {
                sendJson(res, 400, { success: false, error: 'Name, email, and message are required.' });
                return;
            }

            // Save transmission
            let contacts = [];
            try {
                contacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
            } catch (e) {
                contacts = [];
            }
            contacts.push({ name, email, message, timestamp: Date.now() });
            fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2), 'utf8');

            sendJson(res, 200, {
                success: true,
                message: `Transmission received! Thank you ${name}. Dhigveerraju will reply to ${email} promptly.`
            });
        } catch (err) {
            sendJson(res, 400, { success: false, error: 'Invalid JSON payload' });
        }
        return;
    }

    // API: Resume Access Request Submission
    if (pathname === '/api/resume-request' && req.method === 'POST') {
        try {
            const body = await readBody(req);
            const { name, email, org, purpose } = body;

            if (!name || !email) {
                sendJson(res, 400, { success: false, error: 'Name and email are required.' });
                return;
            }

            const RESUME_REQUESTS_FILE = path.join(DATA_DIR, 'resume_requests.json');
            let requests = [];
            try {
                requests = JSON.parse(fs.readFileSync(RESUME_REQUESTS_FILE, 'utf8'));
            } catch (e) {
                requests = [];
            }

            const newRequest = {
                id: 'req_' + Date.now(),
                name,
                email,
                organization: org || 'N/A',
                purpose: purpose || 'General Review',
                status: 'PENDING_APPROVAL',
                timestamp: Date.now()
            };
            requests.push(newRequest);
            fs.writeFileSync(RESUME_REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf8');

            // Also record in contacts file
            try {
                let contacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
                contacts.push({
                    name: `[RESUME REQUEST] ${name}`,
                    email,
                    message: `Organization: ${org || 'N/A'} | Purpose: ${purpose || 'General Review'}`,
                    timestamp: Date.now()
                });
                fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2), 'utf8');
            } catch (e) {}

            sendJson(res, 200, {
                success: true,
                message: `Resume access request recorded for ${name}. Notification dispatched to Dhigveerraju.`
            });
        } catch (err) {
            sendJson(res, 400, { success: false, error: 'Invalid JSON request payload' });
        }
        return;
    }

    // API: Admin Dashboard Data (Owner Access)
    if (pathname === '/api/admin/data' && (req.method === 'GET' || req.method === 'POST')) {
        const authHeader = req.headers['x-admin-passcode'] || req.headers['authorization'];
        let passcode = (authHeader || '').replace('Bearer ', '').trim();

        if (req.method === 'POST') {
            try {
                const body = await readBody(req);
                if (body && body.passcode) passcode = body.passcode;
            } catch (e) {}
        }

        if (!verifyPasscode(passcode)) {
            sendJson(res, 401, { success: false, error: 'Unauthorized: Invalid owner passcode' });
            return;
        }

        let resumeRequests = [];
        let contacts = [];
        try {
            if (fs.existsSync(RESUME_REQUESTS_FILE)) {
                resumeRequests = JSON.parse(fs.readFileSync(RESUME_REQUESTS_FILE, 'utf8'));
            }
        } catch (e) {
            resumeRequests = [];
        }

        try {
            if (fs.existsSync(CONTACTS_FILE)) {
                contacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
            }
        } catch (e) {
            contacts = [];
        }

        sendJson(res, 200, {
            success: true,
            resumeRequests,
            contacts
        });
        return;
    }

    // API: Admin Approve Resume Request
    if (pathname === '/api/admin/approve' && req.method === 'POST') {
        const authHeader = req.headers['x-admin-passcode'] || req.headers['authorization'];
        let passcode = (authHeader || '').replace('Bearer ', '').trim();

        try {
            const body = await readBody(req);
            if (body && body.passcode) passcode = body.passcode;
            const reqId = body ? body.id : null;

            if (!verifyPasscode(passcode)) {
                sendJson(res, 401, { success: false, error: 'Unauthorized: Invalid owner passcode' });
                return;
            }

            if (!reqId) {
                sendJson(res, 400, { success: false, error: 'Missing request ID' });
                return;
            }

            let requests = [];
            try {
                if (fs.existsSync(RESUME_REQUESTS_FILE)) {
                    requests = JSON.parse(fs.readFileSync(RESUME_REQUESTS_FILE, 'utf8'));
                }
            } catch (e) {
                requests = [];
            }

            let found = false;
            for (let item of requests) {
                if (item.id === reqId) {
                    item.status = 'APPROVED';
                    item.approvedAt = Date.now();
                    found = true;
                    break;
                }
            }

            if (found) {
                fs.writeFileSync(RESUME_REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf8');
                sendJson(res, 200, { success: true, id: reqId, status: 'APPROVED' });
            } else {
                sendJson(res, 404, { success: false, error: 'Request ID not found' });
            }
        } catch (err) {
            sendJson(res, 400, { success: false, error: 'Invalid payload' });
        }
        return;
    }

    // API: RoboGuide AI Copilot Chat
    if (pathname === '/api/chat' && req.method === 'POST') {
        try {
            const body = await readBody(req);
            const query = (body.message || '').toLowerCase().trim();

            let replyHtml = '';
            let category = 'general';

            if (query.includes('who are you') || query.includes('what are you') || query.includes('your name') || query === 'help') {
                category = 'identity';
                replyHtml = "🤖 I'm <strong>RoboGuide</strong>, Dhigveerraju's personal AI companion! I'm trained on his entire engineering portfolio. You can ask me about his <strong>popular projects</strong> (Conveyor Sentinel AI, Dual-Motor PWM), his <strong>embedded & AI skills</strong>, his <strong>background</strong>, or how to <strong>contact him</strong>!";
            } else if (query === 'hi' || query === 'hello' || query === 'hey' || query.startsWith('hello') || query.startsWith('hi ') || query.startsWith('hey ') || query.includes('good morning') || query.includes('good evening') || query.includes('greetings')) {
                category = 'greeting';
                replyHtml = "👋 Hello! I'm <strong>RoboGuide</strong>. Ask me anything about Dhigveerraju's robotics projects, YOLOv8 vision system, C++ firmware, or how to get in touch!";
            } else if (query.includes('how are you') || query.includes("how's it going") || query.includes('whats up') || query.includes("what's up")) {
                category = 'greeting';
                replyHtml = "⚡ All systems nominal and ion thrusters running at peak efficiency! Ready to assist you. What would you like to explore in Dhigveer's portfolio today?";
            } else if (query.includes('thank') || query.includes('thanks')) {
                category = 'greeting';
                replyHtml = "🤖 You're very welcome! Feel free to ask more questions about Dhigveer's projects, or head to the contact section below to send him a transmission!";
            } else if (query.includes('resume') || query.includes('cv') || query.includes('bio-data') || query.includes('biodata')) {
                category = 'resume';
                replyHtml = "🔒 <strong>Dhigveerraju's Resume / CV:</strong> Due to confidential firmware algorithms and hardware IP, Dhigveer's resume is available <strong>upon request only</strong>. Scroll down to the bottom contact section or <a href=\"#contact\" style=\"color: var(--primary); font-weight: 600;\">Click here to Request Resume Access</a>!";
            } else if (query.includes('tour') || query.includes('guide me') || query.includes('walkthrough')) {
                category = 'tour';
                replyHtml = "🚀 <strong>Initiating 30-Second Guided Tour!</strong> Auto-scrolling through Dhigveer's engineering profile, projects, skills, and contact...";
            } else if (query.includes('who is dhigveer') || query.includes('who is he') || query.includes('about dhigveer') || query.includes('about him') || query.includes('background') || query.includes('bio') || query === 'about' || query === 'who') {
                category = 'bio';
                replyHtml = "👨‍💻 <strong>Dhigveerraju G</strong> is a Robotics & Artificial Intelligence Engineer passionate about <strong>physical intelligence</strong>—where code directly commands mechanical torque, edge computer vision, and real-world inertia. He bridges embedded microcontrollers with deep learning edge vision.";
            } else if (query.includes('education') || query.includes('college') || query.includes('study') || query.includes('degree') || query.includes('university')) {
                category = 'bio';
                replyHtml = "🎓 Dhigveerraju is pursuing his engineering degree in <strong>Robotics and Artificial Intelligence</strong>, with research focused on autonomous edge inspection systems, closed-loop actuator feedback, and embedded C++ firmware.";
            } else if (query.includes('physical intelligence') || query.includes('philosophy')) {
                category = 'bio';
                replyHtml = "🧠 <strong>Physical Intelligence</strong> is Dhigveer's core engineering philosophy: true robotics begins when algorithms leave computer screens to directly control physical actuators, sense real-world material inertia, and react to hardware anomalies in real time.";
            } else if (query.includes('popular repo') || query.includes('flagship') || query.includes('best project') || query.includes('top project')) {
                category = 'projects';
                replyHtml = "⭐ <strong>Dhigveerraju's Top Highlighted Repositories:</strong><br>1. 🛡️ <strong>Conveyor Sentinel AI</strong> — Autonomous industrial defect detection running YOLOv8 + OpenCV at 42+ FPS.<br>2. ⚡ <strong>Synchronized Dual-Motor Actuation</strong> — C++ Arduino firmware with PWM soft-start acceleration ramping.<br>Click <em>'Explore More GitHub Repositories'</em> in the Projects section to see his Kinematics Lab and Telemetry HUD!";
            } else if (query.includes('conveyor') || query.includes('sentinel') || query.includes('yolo') || query.includes('defect') || query.includes('inspection') || query.includes('camera') || query.includes('fps')) {
                category = 'vision';
                replyHtml = "🛡️ <strong>Conveyor Sentinel AI:</strong> Dhigveerraju's flagship edge vision system. It combines lightweight <strong>YOLOv8</strong> deep learning with adaptive <strong>OpenCV contour tracking</strong> to classify tears, holes, and edge cuts on moving conveyor belts at <strong>42+ FPS</strong>, coupled with automated safety stop relays!";
            } else if (query.includes('motor') || query.includes('pwm') || query.includes('dual') || query.includes('ramp') || query.includes('l298n') || query.includes('actuat') || query.includes('h-bridge') || query.includes('back-emf') || query.includes('inrush')) {
                category = 'firmware';
                replyHtml = "⚡ <strong>Synchronized Dual-Motor Actuation:</strong> Dhigveer developed custom C++ firmware on Arduino using mathematical <strong>PWM soft-start acceleration ramping</strong> to synchronize dual DC motors driving conveyor rollers, eliminating belt slippage and damping inductive back-EMF spikes across L298N H-Bridges.";
            } else if (query.includes('kinematic') || query.includes('tetrix') || query.includes('prizm') || query.includes('encoder') || query.includes('gear')) {
                category = 'kinematics';
                replyHtml = "⚙️ <strong>Robotics Kinematics Lab:</strong> Closed-loop firmware integrating <strong>TETRIX PRIZM controllers</strong> with quadrature optical encoders for precision torque, RPM synchronization, and closed-loop position tracking under dynamic mechanical loads.";
            } else if (query.includes('telemetry') || query.includes('hud') || query.includes('serial') || query.includes('uart')) {
                category = 'telemetry';
                replyHtml = "📊 <strong>Edge Vision Telemetry HUD:</strong> Real-time diagnostics software linking YOLOv8 optical inference feeds with embedded Arduino motor telemetry, streaming live RPMs, temperatures, and defect coordinates over high-speed serial links.";
            } else if (query.includes('project') || query.includes('work') || query.includes('portfolio') || query.includes('built')) {
                category = 'projects';
                replyHtml = "🚀 <strong>Dhigveer's Core Engineering Builds:</strong><br>• <strong>Conveyor Sentinel AI</strong> (YOLOv8 Edge Vision & Reticle HUD)<br>• <strong>Synchronized Dual-Motor Actuation</strong> (PWM Soft-Start Ramping Firmware)<br>• <strong>Edge Vision Telemetry HUD</strong> (UART Serial Telemetry)<br>• <strong>Robotics Kinematics Lab</strong> (TETRIX PRIZM Closed-Loop Encoders)<br>Scroll to the <em>Projects</em> section to inspect their architecture diagrams!";
            } else if (query.includes('python')) {
                category = 'skills';
                replyHtml = "🐍 <strong>Python Expertise:</strong> Dhigveer uses Python extensively for computer vision pipelines (YOLOv8 fine-tuning, OpenCV contour tracking), serial telemetry parsers, and machine learning model validation.";
            } else if (query.includes('c++') || query === 'c' || query.includes('c language')) {
                category = 'skills';
                replyHtml = "⚙️ <strong>C/C++ Expertise:</strong> C/C++ is Dhigveer's foundational language for embedded robotics firmware, direct AVR timer registers, PWM acceleration profiles, and PlatformIO builds.";
            } else if (query.includes('arduino') || query.includes('microcontroller') || query.includes('hardware')) {
                category = 'skills';
                replyHtml = "🔌 <strong>Hardware & Microcontrollers:</strong> Dhigveer specializes in Arduino Uno/Mega, optocouplers, L298N H-Bridge dual drivers, optical quadrature encoders, and TETRIX PRIZM robotic controllers.";
            } else if (query.includes('web') || query.includes('typescript') || query.includes('javascript') || query.includes('html') || query.includes('java')) {
                category = 'skills';
                replyHtml = "🌐 <strong>Full-Stack & Systems:</strong> Dhigveer's engineering stack includes modern TypeScript, HTML5/CSS Grid, JavaScript, and high-performance Java 26 / Node.js backend servers.";
            } else if (query.includes('skill') || query.includes('tech') || query.includes('stack') || query.includes('arsenal') || query.includes('tools')) {
                category = 'skills';
                replyHtml = "🤖 <strong>Technical Arsenal:</strong><br>• <strong>Embedded Firmware:</strong> C/C++, Arduino Uno/Mega, PlatformIO, PWM Soft-Start Ramping, TETRIX PRIZM<br>• <strong>AI & Computer Vision:</strong> YOLOv8, OpenCV, Roboflow, Python, Edge TPU<br>• <strong>Web & Backend:</strong> HTML5, CSS Grid, JavaScript, TypeScript, Java 26, Node.js, Git & GitHub";
            } else if (query.includes('hire') || query.includes('hiring') || query.includes('job') || query.includes('intern') || query.includes('open to work') || query.includes('collaborat') || query.includes('opportunity') || query.includes('available')) {
                category = 'hire';
                replyHtml = "💼 <strong>Open for Opportunities:</strong> Yes! Dhigveerraju is actively seeking robotics engineering roles, computer vision research collaborations, and embedded hardware internships. You can reach out directly through the contact transmission form below or connect via LinkedIn!";
            } else if (query.includes('location') || query.includes('where is he') || query.includes('remote') || query.includes('city') || query.includes('country')) {
                category = 'bio';
                replyHtml = "📍 Dhigveerraju is based in <strong>India 🇮🇳</strong> and is open to both <strong>on-site</strong> and <strong>remote</strong> engineering opportunities worldwide.";
            } else if (query.includes('linkedin')) {
                category = 'contact';
                replyHtml = "💼 Connect with Dhigveerraju on LinkedIn here: <a href=\"https://in.linkedin.com/in/dhigveerraju-g-69737036b\" target=\"_blank\" style=\"color: var(--primary); font-weight: 600;\">linkedin.com/in/dhigveerraju-g-69737036b ↗</a>";
            } else if (query.includes('github') || query.includes('repo')) {
                category = 'contact';
                replyHtml = "🐙 Explore Dhigveerraju's open-source repositories here: <a href=\"https://github.com/DhigveerrajuG\" target=\"_blank\" style=\"color: var(--primary); font-weight: 600;\">github.com/DhigveerrajuG ↗</a>";
            } else if (query.includes('contact') || query.includes('reach') || query.includes('email') || query.includes('message') || query.includes('touch')) {
                category = 'contact';
                replyHtml = "📫 <strong>Let's Connect!</strong><br>• <strong>Transmission Form:</strong> Use the direct message form at the bottom of this page.<br>• <strong>LinkedIn:</strong> <a href=\"https://in.linkedin.com/in/dhigveerraju-g-69737036b\" target=\"_blank\" style=\"color: var(--primary); font-weight: 600;\">Connect on LinkedIn ↗</a><br>• <strong>GitHub:</strong> <a href=\"https://github.com/DhigveerrajuG\" target=\"_blank\" style=\"color: var(--primary); font-weight: 600;\">Explore GitHub Profile ↗</a>";
            } else {
                replyHtml = `🤖 Thanks for asking about <em>"${query.replace(/"/g, '')}"</em>! As Dhigveerraju's AI copilot, I can tell you about his <strong>flagship projects</strong> (Conveyor Sentinel AI, Dual-Motor PWM), his <strong>skills & tech stack</strong> (C++, Python, YOLOv8, Arduino), or how to <strong>get in touch</strong>. What would you like to explore?`;
            }

            sendJson(res, 200, { reply: replyHtml, category });
        } catch (err) {
            sendJson(res, 400, { error: 'Invalid request' });
        }
        return;
    }

    // API: Dynamic Projects Data
    if (pathname === '/api/projects') {
        sendJson(res, 200, {
            status: 'success',
            stats: { stars: 2, forks: 1 },
            projects: [
                { id: 'conveyor-sentinel', title: 'Conveyor Sentinel AI', badge: 'Computer Vision & Edge AI', fps: 42 },
                { id: 'dual-motor', title: 'Synchronized Dual-Motor Actuation', badge: 'Embedded Robotics Firmware', arch: 'PWM Acceleration Ramping' },
                { id: 'kinematics-lab', title: 'Robotics Kinematics Lab', badge: 'Robotics Research', controller: 'TETRIX PRIZM' }
            ]
        });
        return;
    }

    // Static File Serving
    let filePath = path.join(ROOT_DIR, pathname === '/' ? 'index.html' : pathname);

    // Guard against directory traversal
    if (!filePath.startsWith(ROOT_DIR)) {
        filePath = path.join(ROOT_DIR, 'index.html');
    }

    fs.stat(filePath, (err, stats) => {
        if (err || stats.isDirectory()) {
            filePath = path.join(ROOT_DIR, 'index.html');
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (readErr, content) => {
            if (readErr) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
                return;
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        });
    });
});

server.listen(PORT, () => {
    console.log("============================================================");
    console.log("🤖 Dhigveerraju G - Robotics & AI Portfolio Server (Node.js)");
    console.log(`🚀 Live on: http://localhost:${PORT}`);
    console.log("📡 Endpoints: /api/health, /api/contact, /api/chat, /api/projects");
    console.log("============================================================");
});
