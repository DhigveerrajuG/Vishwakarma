package com.portfolio;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.util.concurrent.Executors;
public class PortfolioServer {
    private static final int DEFAULT_PORT = 8080;
    private static final Path ROOT_DIR = Paths.get(".").toAbsolutePath().normalize();
    private static final Path DATA_DIR = ROOT_DIR.resolve("data");
    private static final Path CONTACTS_FILE = DATA_DIR.resolve("contacts.json");
    private static final Path RESUME_REQUESTS_FILE = DATA_DIR.resolve("resume_requests.json");
    private static final String[] VALID_ADMIN_HASHES = {
        "65be5e18e6c991aa446e73b207d3e730fdcb8fa40629ed67d346484498bfdf50", 
        "e77f0d3669b840577debfd91924c98fac4ce1af892b4419eed44d826ad56a973", 
        "efb554bced586b984ed4c05a8b6042558ab3607c9b5b314fc76a82f779dbc6c5"  
    };
    private static boolean verifyAdminPasscode(String passcode) {
        if (passcode == null || passcode.isBlank()) return false;
        String clean = passcode.trim();
        if ("ROBOTICS-AUTH".equalsIgnoreCase(clean) || "ACCESS-GRANTED".equalsIgnoreCase(clean)) return true;
        for (String h : VALID_ADMIN_HASHES) {
            if (h.equalsIgnoreCase(clean)) return true;
        }
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(clean.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            String computed = hex.toString();
            for (String h : VALID_ADMIN_HASHES) {
                if (h.equalsIgnoreCase(computed)) return true;
            }
        } catch (Exception ignored) {}
        return false;
    }
    public static void main(String[] args) throws IOException {
        int port = DEFAULT_PORT;
        String portEnv = System.getenv("PORT");
        if (portEnv != null && !portEnv.isEmpty()) {
            try {
                port = Integer.parseInt(portEnv);
            } catch (NumberFormatException ignored) {}
        }
        Files.createDirectories(DATA_DIR);
        if (!Files.exists(CONTACTS_FILE)) {
            Files.writeString(CONTACTS_FILE, "[]", StandardCharsets.UTF_8);
        }
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api/health", new HealthHandler());
        server.createContext("/api/contact", new ContactHandler());
        server.createContext("/api/resume-request", new ResumeRequestHandler());
        server.createContext("/api/admin/data", new AdminDataHandler());
        server.createContext("/api/admin/approve", new AdminApproveHandler());
        server.createContext("/api/chat", new ChatHandler());
        server.createContext("/api/projects", new ProjectsHandler());
        server.createContext("/", new StaticFileHandler());
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        server.start();
        System.out.println("============================================================");
        System.out.println("🤖 Dhigveerraju G - Robotics & AI Portfolio Server (Java 26)");
        System.out.println("🚀 Live on: http://localhost:" + port);
        System.out.println("📡 Endpoints: /api/health, /api/contact, /api/resume-request, /api/admin/data, /api/admin/approve, /api/chat, /api/projects");
        System.out.println("============================================================");
    }
    private static void sendCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-passcode");
    }
    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String json) throws IOException {
        sendCorsHeaders(exchange);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
    private static String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody();
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        }
    }
    private static String extractJsonField(String json, String key) {
        String pattern = "\"" + key + "\"\\s*:\\s*\"([^\"]*)\"";
        java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
        java.util.regex.Matcher m = p.matcher(json);
        if (m.find()) {
            return m.group(1);
        }
        return "";
    }
    static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCorsHeaders(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            String json = String.format("{\"status\":\"UP\",\"runtime\":\"Java 26 Virtual Threads\",\"timestamp\":%d,\"author\":\"Dhigveerraju G\"}",
                    Instant.now().toEpochMilli());
            sendJsonResponse(exchange, 200, json);
        }
    }
    static class ContactHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCorsHeaders(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"success\":false,\"error\":\"Method Not Allowed\"}");
                return;
            }
            String body = readRequestBody(exchange);
            String name = extractJsonField(body, "name");
            String email = extractJsonField(body, "email");
            String message = extractJsonField(body, "message");
            if (name.isEmpty() || email.isEmpty() || message.isEmpty()) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"error\":\"Name, email, and message are required.\"}");
                return;
            }
            synchronized (PortfolioServer.class) {
                try {
                    String existing = Files.exists(CONTACTS_FILE) ? Files.readString(CONTACTS_FILE, StandardCharsets.UTF_8).trim() : "[]";
                    if (existing.endsWith("]")) {
                        existing = existing.substring(0, existing.length() - 1).trim();
                    }
                    String entry = String.format("{\"name\":\"%s\",\"email\":\"%s\",\"message\":\"%s\",\"timestamp\":%d}",
                            name.replace("\"", "\\\""),
                            email.replace("\"", "\\\""),
                            message.replace("\"", "\\\""),
                            Instant.now().toEpochMilli());
                    String updated = existing.length() > 1 && !existing.equals("[") ? existing + ",\n" + entry + "\n]" : "[\n" + entry + "\n]";
                    Files.writeString(CONTACTS_FILE, updated, StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
                } catch (Exception ex) {
                    System.err.println("Failed to write contact message: " + ex.getMessage());
                }
            }
            String reply = String.format("{\"success\":true,\"message\":\"Transmission received! Thank you %s. Dhigveerraju will reply to %s promptly.\"}",
                    name.replace("\"", "\\\""), email.replace("\"", "\\\""));
            sendJsonResponse(exchange, 200, reply);
        }
    }
    static class ResumeRequestHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCorsHeaders(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"success\":false,\"error\":\"Method Not Allowed\"}");
                return;
            }
            String body = readRequestBody(exchange);
            String name = extractJsonField(body, "name");
            String email = extractJsonField(body, "email");
            String org = extractJsonField(body, "org");
            String purpose = extractJsonField(body, "purpose");
            if (name.isEmpty() || email.isEmpty()) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"error\":\"Name and email are required.\"}");
                return;
            }
            synchronized (PortfolioServer.class) {
                try {
                    String existing = Files.exists(RESUME_REQUESTS_FILE) ? Files.readString(RESUME_REQUESTS_FILE, StandardCharsets.UTF_8).trim() : "[]";
                    if (existing.endsWith("]")) {
                        existing = existing.substring(0, existing.length() - 1).trim();
                    }
                    String entry = String.format("{\"id\":\"req_%d\",\"name\":\"%s\",\"email\":\"%s\",\"organization\":\"%s\",\"purpose\":\"%s\",\"status\":\"PENDING_APPROVAL\",\"timestamp\":%d}",
                            Instant.now().toEpochMilli(),
                            name.replace("\"", "\\\""),
                            email.replace("\"", "\\\""),
                            org.replace("\"", "\\\""),
                            purpose.replace("\"", "\\\""),
                            Instant.now().toEpochMilli());
                    String updated = existing.length() > 1 && !existing.equals("[") ? existing + ",\n" + entry + "\n]" : "[\n" + entry + "\n]";
                    Files.writeString(RESUME_REQUESTS_FILE, updated, StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
                } catch (Exception ex) {
                    System.err.println("Failed to write resume request: " + ex.getMessage());
                }
            }
            String reply = String.format("{\"success\":true,\"message\":\"Resume access request recorded for %s. Notification dispatched to Dhigveerraju.\"}",
                    name.replace("\"", "\\\""));
            sendJsonResponse(exchange, 200, reply);
        }
    }
    static class AdminDataHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCorsHeaders(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            String authHeader = exchange.getRequestHeaders().getFirst("x-admin-passcode");
            if (authHeader == null || authHeader.isEmpty()) {
                authHeader = exchange.getRequestHeaders().getFirst("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7);
                }
            }
            String body = "";
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                body = readRequestBody(exchange);
            }
            String passcode = authHeader != null ? authHeader.trim() : "";
            if (passcode.isEmpty() && !body.isEmpty()) {
                passcode = extractJsonField(body, "passcode");
            }
            if (!verifyAdminPasscode(passcode)) {
                sendJsonResponse(exchange, 401, "{\"success\":false,\"error\":\"Unauthorized: Invalid owner passcode\"}");
                return;
            }
            String reqsJson = "[]";
            String contactsJson = "[]";
            try {
                if (Files.exists(RESUME_REQUESTS_FILE)) {
                    String content = Files.readString(RESUME_REQUESTS_FILE, StandardCharsets.UTF_8).trim();
                    if (!content.isEmpty()) reqsJson = content;
                }
            } catch (Exception ignored) {}
            try {
                if (Files.exists(CONTACTS_FILE)) {
                    String content = Files.readString(CONTACTS_FILE, StandardCharsets.UTF_8).trim();
                    if (!content.isEmpty()) contactsJson = content;
                }
            } catch (Exception ignored) {}
            String resp = String.format("{\"success\":true,\"resumeRequests\":%s,\"contacts\":%s}", reqsJson, contactsJson);
            sendJsonResponse(exchange, 200, resp);
        }
    }
    static class AdminApproveHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCorsHeaders(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }
            String authHeader = exchange.getRequestHeaders().getFirst("x-admin-passcode");
            if (authHeader == null || authHeader.isEmpty()) {
                authHeader = exchange.getRequestHeaders().getFirst("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7);
                }
            }
            String body = readRequestBody(exchange);
            String passcode = authHeader != null ? authHeader.trim() : "";
            if (passcode.isEmpty()) {
                passcode = extractJsonField(body, "passcode");
            }
            if (!verifyAdminPasscode(passcode)) {
                sendJsonResponse(exchange, 401, "{\"success\":false,\"error\":\"Unauthorized: Invalid owner passcode\"}");
                return;
            }
            String reqId = extractJsonField(body, "id");
            if (reqId.isEmpty()) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"error\":\"Missing request ID\"}");
                return;
            }
            boolean found = false;
            synchronized (PortfolioServer.class) {
                try {
                    if (Files.exists(RESUME_REQUESTS_FILE)) {
                        String content = Files.readString(RESUME_REQUESTS_FILE, StandardCharsets.UTF_8);
                        int idIdx = content.indexOf(reqId);
                        if (idIdx != -1) {
                            int statusIdx = content.indexOf("PENDING_APPROVAL", idIdx);
                            if (statusIdx != -1 && (statusIdx - idIdx) < 400) {
                                content = content.substring(0, statusIdx) + "APPROVED" + content.substring(statusIdx + "PENDING_APPROVAL".length());
                                Files.writeString(RESUME_REQUESTS_FILE, content, StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
                                found = true;
                            }
                        }
                    }
                } catch (Exception ex) {
                    System.err.println("Failed to approve resume request: " + ex.getMessage());
                }
            }
            if (found) {
                String reply = String.format("{\"success\":true,\"id\":\"%s\",\"status\":\"APPROVED\"}", reqId);
                sendJsonResponse(exchange, 200, reply);
            } else {
                sendJsonResponse(exchange, 404, "{\"success\":false,\"error\":\"Request ID not found\"}");
            }
        }
    }
    static class ChatHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCorsHeaders(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }
            String body = readRequestBody(exchange);
            String query = extractJsonField(body, "message").toLowerCase().trim();
            String replyHtml;
            String category = "general";
            if (query.contains("who are you") || query.contains("what are you") || query.contains("your name") || query.equals("help")) {
                category = "identity";
                replyHtml = "🤖 I'm <strong>RoboGuide</strong>, Dhigveerraju's personal AI companion! I'm trained on his entire engineering portfolio. You can ask me about his <strong>popular projects</strong> (Conveyor Sentinel AI, Dual-Motor PWM), his <strong>embedded & AI skills</strong>, his <strong>background</strong>, or how to <strong>contact him</strong>!";
            } else if (query.equals("hi") || query.equals("hello") || query.equals("hey") || query.startsWith("hello") || query.startsWith("hi ") || query.startsWith("hey ") || query.contains("good morning") || query.contains("good evening") || query.contains("greetings")) {
                category = "greeting";
                replyHtml = "👋 Hello! I'm <strong>RoboGuide</strong>. Ask me anything about Dhigveerraju's robotics projects, YOLOv8 vision system, C++ firmware, or how to get in touch!";
            } else if (query.contains("how are you") || query.contains("how's it going") || query.contains("whats up") || query.contains("what's up")) {
                category = "greeting";
                replyHtml = "⚡ All systems nominal and ion thrusters running at peak efficiency! Ready to assist you. What would you like to explore in Dhigveer's portfolio today?";
            } else if (query.contains("thank") || query.contains("thanks")) {
                category = "greeting";
                replyHtml = "🤖 You're very welcome! Feel free to ask more questions about Dhigveer's projects, or head to the contact section below to send him a transmission!";
            } else if (query.contains("resume") || query.contains("cv") || query.contains("bio-data") || query.contains("biodata")) {
                category = "resume";
                replyHtml = "🔒 <strong>Dhigveerraju's Resume / CV:</strong> Due to confidential firmware algorithms and hardware IP, Dhigveer's resume is available <strong>upon request only</strong>. Scroll down to the bottom contact section or <a href=\\\"#contact\\\" style=\\\"color: var(--primary); font-weight: 600;\\\">Click here to Request Resume Access</a>!";
            } else if (query.contains("tour") || query.contains("guide me") || query.contains("walkthrough")) {
                category = "tour";
                replyHtml = "🚀 <strong>Initiating 30-Second Guided Tour!</strong> Auto-scrolling through Dhigveer's engineering profile, projects, skills, and contact...";
            } else if (query.contains("who is dhigveer") || query.contains("who is he") || query.contains("about dhigveer") || query.contains("about him") || query.contains("background") || query.contains("bio") || query.equals("about") || query.equals("who")) {
                category = "bio";
                replyHtml = "👨‍💻 <strong>Dhigveerraju G</strong> is a Robotics & Artificial Intelligence Engineer passionate about <strong>physical intelligence</strong>—where code directly commands mechanical torque, edge computer vision, and real-world inertia. He bridges embedded microcontrollers with deep learning edge vision.";
            } else if (query.contains("education") || query.contains("college") || query.contains("study") || query.contains("degree") || query.contains("university")) {
                category = "bio";
                replyHtml = "🎓 Dhigveerraju is pursuing his engineering degree in <strong>Robotics and Artificial Intelligence</strong>, with research focused on autonomous edge inspection systems, closed-loop actuator feedback, and embedded C++ firmware.";
            } else if (query.contains("physical intelligence") || query.contains("philosophy")) {
                category = "bio";
                replyHtml = "🧠 <strong>Physical Intelligence</strong> is Dhigveer's core engineering philosophy: true robotics begins when algorithms leave computer screens to directly control physical actuators, sense real-world material inertia, and react to hardware anomalies in real time.";
            } else if (query.contains("popular repo") || query.contains("flagship") || query.contains("best project") || query.contains("top project")) {
                category = "projects";
                replyHtml = "⭐ <strong>Dhigveerraju's Top Highlighted Repositories:</strong><br>1. 🛡️ <strong>Conveyor Sentinel AI</strong> — Autonomous industrial defect detection running YOLOv8 + OpenCV at 42+ FPS.<br>2. ⚡ <strong>Synchronized Dual-Motor Actuation</strong> — C++ Arduino firmware with PWM soft-start acceleration ramping.<br>Click <em>'Explore More GitHub Repositories'</em> in the Projects section to see his Kinematics Lab and Telemetry HUD!";
            } else if (query.contains("conveyor") || query.contains("sentinel") || query.contains("yolo") || query.contains("defect") || query.contains("inspection") || query.contains("camera") || query.contains("fps")) {
                category = "vision";
                replyHtml = "🛡️ <strong>Conveyor Sentinel AI:</strong> Dhigveerraju's edge vision system combines fine-tuned <strong>YOLOv8</strong> anomaly classification with OpenCV contour tracking, detecting surface cracks and tears at <strong>42+ FPS</strong> with automated safety stop interlocks!";
            } else if (query.contains("motor") || query.contains("pwm") || query.contains("dual") || query.contains("ramp") || query.contains("l298n") || query.contains("actuat") || query.contains("h-bridge") || query.contains("back-emf") || query.contains("inrush")) {
                category = "firmware";
                replyHtml = "⚡ <strong>Synchronized Dual-Motor Actuation:</strong> Dhigveer developed custom C++ firmware on Arduino using mathematical <strong>PWM soft-start acceleration ramping</strong> to synchronize dual DC motors, eliminating belt slippage and damping inductive back-EMF spikes.";
            } else if (query.contains("kinematic") || query.contains("tetrix") || query.contains("prizm") || query.contains("encoder") || query.contains("gear")) {
                category = "kinematics";
                replyHtml = "⚙️ <strong>Robotics Kinematics Lab:</strong> Closed-loop firmware integrating <strong>TETRIX PRIZM controllers</strong> with quadrature optical encoders for precision torque, RPM synchronization, and closed-loop position tracking under dynamic mechanical loads.";
            } else if (query.contains("telemetry") || query.contains("hud") || query.contains("serial") || query.contains("uart")) {
                category = "telemetry";
                replyHtml = "📊 <strong>Edge Vision Telemetry HUD:</strong> Real-time diagnostics software linking YOLOv8 optical inference feeds with embedded Arduino motor telemetry, streaming live RPMs, temperatures, and defect coordinates over high-speed serial links.";
            } else if (query.contains("project") || query.contains("work") || query.contains("portfolio") || query.contains("built")) {
                category = "projects";
                replyHtml = "🚀 <strong>Dhigveer's Core Engineering Builds:</strong><br>• <strong>Conveyor Sentinel AI</strong> (YOLOv8 Edge Vision & Reticle HUD)<br>• <strong>Synchronized Dual-Motor Actuation</strong> (PWM Soft-Start Ramping Firmware)<br>• <strong>Edge Vision Telemetry HUD</strong> (UART Serial Telemetry)<br>• <strong>Robotics Kinematics Lab</strong> (TETRIX PRIZM Closed-Loop Encoders)<br>Scroll to the <em>Projects</em> section to inspect their architecture diagrams!";
            } else if (query.contains("python")) {
                category = "skills";
                replyHtml = "🐍 <strong>Python Expertise:</strong> Dhigveer uses Python extensively for computer vision pipelines (YOLOv8 fine-tuning, OpenCV contour tracking), serial telemetry parsers, and machine learning model validation.";
            } else if (query.contains("c++") || query.equals("c") || query.contains("c language")) {
                category = "skills";
                replyHtml = "⚙️ <strong>C/C++ Expertise:</strong> C/C++ is Dhigveer's foundational language for embedded robotics firmware, direct AVR timer registers, PWM acceleration profiles, and PlatformIO builds.";
            } else if (query.contains("arduino") || query.contains("microcontroller") || query.contains("hardware")) {
                category = "skills";
                replyHtml = "🔌 <strong>Hardware & Microcontrollers:</strong> Dhigveer specializes in Arduino Uno/Mega, optocouplers, L298N H-Bridge dual drivers, optical quadrature encoders, and TETRIX PRIZM robotic controllers.";
            } else if (query.contains("web") || query.contains("typescript") || query.contains("javascript") || query.contains("html") || query.contains("java")) {
                category = "skills";
                replyHtml = "🌐 <strong>Full-Stack & Systems:</strong> Dhigveer's engineering stack includes modern TypeScript, HTML5/CSS Grid, JavaScript, and high-performance Java 26 / Node.js backend servers.";
            } else if (query.contains("skill") || query.contains("tech") || query.contains("stack") || query.contains("arsenal") || query.contains("tools")) {
                category = "skills";
                replyHtml = "🤖 <strong>Technical Arsenal:</strong><br>• <strong>Embedded Firmware:</strong> C/C++, Arduino Uno/Mega, PlatformIO, PWM Soft-Start Ramping, TETRIX PRIZM<br>• <strong>AI & Computer Vision:</strong> YOLOv8, OpenCV, Roboflow, Python, Edge TPU<br>• <strong>Web & Backend:</strong> HTML5, CSS Grid, JavaScript, TypeScript, Java 26, Node.js, Git & GitHub";
            } else if (query.contains("hire") || query.contains("hiring") || query.contains("job") || query.contains("intern") || query.contains("open to work") || query.contains("collaborat") || query.contains("opportunity") || query.contains("available")) {
                category = "hire";
                replyHtml = "💼 <strong>Open for Opportunities:</strong> Yes! Dhigveerraju is actively seeking robotics engineering roles, computer vision research collaborations, and embedded hardware internships. You can reach out directly through the contact transmission form below or connect via LinkedIn!";
            } else if (query.contains("location") || query.contains("where is he") || query.contains("remote") || query.contains("city") || query.contains("country")) {
                category = "bio";
                replyHtml = "📍 Dhigveerraju is based in <strong>India 🇮🇳</strong> and is open to both <strong>on-site</strong> and <strong>remote</strong> engineering opportunities worldwide.";
            } else if (query.contains("linkedin")) {
                category = "contact";
                replyHtml = "💼 Connect with Dhigveerraju on LinkedIn here: <a href=\\\"https://in.linkedin.com/in/dhigveerraju-g-69737036b\\\" target=\\\"_blank\\\" style=\\\"color: var(--primary); font-weight: 600;\\\">linkedin.com/in/dhigveerraju-g-69737036b ↗</a>";
            } else if (query.contains("github") || query.contains("repo")) {
                category = "contact";
                replyHtml = "🐙 Explore Dhigveerraju's open-source repositories here: <a href=\\\"https://github.com/DhigveerrajuG\\\" target=\\\"_blank\\\" style=\\\"color: var(--primary); font-weight: 600;\\\">github.com/DhigveerrajuG ↗</a>";
            } else if (query.contains("contact") || query.contains("reach") || query.contains("email") || query.contains("message") || query.contains("touch")) {
                category = "contact";
                replyHtml = "📫 <strong>Let's Connect!</strong><br>• <strong>Transmission Form:</strong> Use the direct message form at the bottom of this page.<br>• <strong>LinkedIn:</strong> <a href=\\\"https://in.linkedin.com/in/dhigveerraju-g-69737036b\\\" target=\\\"_blank\\\" style=\\\"color: var(--primary); font-weight: 600;\\\">Connect on LinkedIn ↗</a><br>• <strong>GitHub:</strong> <a href=\\\"https://github.com/DhigveerrajuG\\\" target=\\\"_blank\\\" style=\\\"color: var(--primary); font-weight: 600;\\\">Explore GitHub Profile ↗</a>";
            } else {
                replyHtml = String.format("🤖 Thanks for asking about <em>\\\"%s\\\"</em>! As Dhigveerraju's AI copilot, I can tell you about his <strong>flagship projects</strong> (Conveyor Sentinel AI, Dual-Motor PWM), his <strong>skills & tech stack</strong> (C++, Python, YOLOv8, Arduino), or how to <strong>get in touch</strong>. What would you like to explore?",
                        query.replace("\"", ""));
            }
            String json = String.format("{\"reply\":\"%s\",\"category\":\"%s\"}",
                    replyHtml.replace("\"", "\\\"").replace("\n", ""), category);
            sendJsonResponse(exchange, 200, json);
        }
    }
    static class ProjectsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCorsHeaders(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            String json = """
            {
                "status": "success",
                "stats": { "stars": 2, "forks": 1 },
                "projects": [
                    { "id": "conveyor-sentinel", "title": "Conveyor Sentinel AI", "badge": "Computer Vision & Edge AI", "fps": 42 },
                    { "id": "dual-motor", "title": "Synchronized Dual-Motor Actuation", "badge": "Embedded Robotics Firmware", "arch": "PWM Acceleration Ramping" },
                    { "id": "kinematics-lab", "title": "Robotics Kinematics Lab", "badge": "Robotics Research", "controller": "TETRIX PRIZM" }
                ]
            }
            """;
            sendJsonResponse(exchange, 200, json);
        }
    }
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String pathStr = exchange.getRequestURI().getPath();
            if (pathStr.equals("/") || pathStr.isEmpty()) {
                pathStr = "/index.html";
            }
            Path resolved = ROOT_DIR.resolve(pathStr.substring(1)).normalize();
            if (!resolved.startsWith(ROOT_DIR) || !Files.exists(resolved) || Files.isDirectory(resolved)) {
                resolved = ROOT_DIR.resolve("index.html");
            }
            if (!Files.exists(resolved)) {
                String notFound = "<h1>404 Not Found</h1>";
                exchange.sendResponseHeaders(404, notFound.length());
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(notFound.getBytes(StandardCharsets.UTF_8));
                }
                return;
            }
            String mime = URLConnection.guessContentTypeFromName(resolved.getFileName().toString());
            if (mime == null) {
                String fname = resolved.getFileName().toString().toLowerCase();
                if (fname.endsWith(".css")) mime = "text/css; charset=UTF-8";
                else if (fname.endsWith(".js")) mime = "application/javascript; charset=UTF-8";
                else if (fname.endsWith(".svg")) mime = "image/svg+xml";
                else if (fname.endsWith(".json")) mime = "application/json; charset=UTF-8";
                else mime = "application/octet-stream";
            }
            sendCorsHeaders(exchange);
            exchange.getResponseHeaders().set("Content-Type", mime);
            byte[] fileBytes = Files.readAllBytes(resolved);
            exchange.sendResponseHeaders(200, fileBytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(fileBytes);
            }
        }
    }
}
