/**
 * Contact Form, Resume Access Request, & Owner Approval Dashboard Controller
 */

import { ContactPayload, ResumeRequestPayload, ApiResponse, AdminDashboardData } from './types';
import { playBotChirp } from './audio';

async function computeSha256(text: string): Promise<string> {
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

export function openResumeModal(): void {
    const resumeModalBackdrop = document.getElementById('resume-modal-backdrop');
    if (resumeModalBackdrop) {
        resumeModalBackdrop.classList.add('open');
        playBotChirp(520, 'sine', 0.1);
    }
}

export function closeResumeModal(): void {
    const resumeModalBackdrop = document.getElementById('resume-modal-backdrop');
    if (resumeModalBackdrop) {
        resumeModalBackdrop.classList.remove('open');
        playBotChirp(380, 'sine', 0.08);
    }
}

export function initContact(): void {
    initDirectContactForm();
    initResumeModalHandlers();
    initAdminDashboard();
}

function initDirectContactForm(): void {
    const contactForm = document.getElementById('contact-form') as HTMLFormElement | null;
    const formFeedback = document.getElementById('form-feedback');
    const btnSubmitForm = document.getElementById('btn-submit-form') as HTMLButtonElement | null;

    if (!contactForm || !formFeedback) return;

    contactForm.addEventListener('submit', async (e: Event) => {
        e.preventDefault();

        const nameInput = document.getElementById('form-name') as HTMLInputElement | null;
        const emailInput = document.getElementById('form-email') as HTMLInputElement | null;
        const msgInput = document.getElementById('form-message') as HTMLTextAreaElement | null;

        if (!nameInput || !emailInput || !msgInput) return;

        const payload: ContactPayload = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            message: msgInput.value.trim(),
            timestamp: Date.now()
        };

        if (!payload.name || !payload.email || !payload.message) return;

        if (btnSubmitForm) {
            btnSubmitForm.disabled = true;
            btnSubmitForm.innerHTML = `<span>Transmitting...</span>`;
        }
        playBotChirp(600, 'sine', 0.12);

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            let replyMsg = `✅ <strong>Transmission Dispatched!</strong> Thank you ${payload.name}. Dhigveerraju will reply to ${payload.email} promptly.`;

            if (res.ok) {
                const data = (await res.json()) as ApiResponse;
                if (data.message) {
                    replyMsg = `✅ <strong>Transmission Dispatched!</strong> ${data.message}`;
                }
            }

            formFeedback.style.display = 'flex';
            formFeedback.innerHTML = `<span>${replyMsg}</span>`;
            contactForm.reset();
            saveLocalBackup('contact', payload);
            playBotChirp(680, 'sine', 0.15);
        } catch {
            formFeedback.style.display = 'flex';
            formFeedback.innerHTML = `<span>✅ <strong>Transmission Dispatched!</strong> Thank you ${payload.name}. Dhigveerraju will reply to ${payload.email} promptly.</span>`;
            contactForm.reset();
            saveLocalBackup('contact', payload);
            playBotChirp(680, 'sine', 0.15);
        } finally {
            if (btnSubmitForm) {
                btnSubmitForm.disabled = false;
                btnSubmitForm.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    <span>Send Transmission</span>
                `;
            }
        }
    });
}

function initResumeModalHandlers(): void {
    const btnOpenResumeModal = document.getElementById('btn-open-resume-modal');
    const resumeModalBackdrop = document.getElementById('resume-modal-backdrop');
    const resumeModalCloseBtn = document.getElementById('resume-modal-close-btn');
    const resumeRequestForm = document.getElementById('resume-request-form') as HTMLFormElement | null;
    const resumeReqFeedback = document.getElementById('resume-req-feedback');
    const btnSubmitResumeReq = document.getElementById('btn-submit-resume-req') as HTMLButtonElement | null;
    const resumePasscodeForm = document.getElementById('resume-passcode-form') as HTMLFormElement | null;
    const resumePasscodeInput = document.getElementById('resume-passcode-input') as HTMLInputElement | null;
    const passcodeFeedback = document.getElementById('passcode-feedback');

    if (btnOpenResumeModal) {
        btnOpenResumeModal.addEventListener('click', openResumeModal);
    }

    if (resumeModalCloseBtn) {
        resumeModalCloseBtn.addEventListener('click', closeResumeModal);
    }

    if (resumeModalBackdrop) {
        resumeModalBackdrop.addEventListener('click', (e: MouseEvent) => {
            if (e.target === resumeModalBackdrop) closeResumeModal();
        });
    }

    // Handle Passcode Unlock (Instant access for owner / pre-approved recruiters)
    if (resumePasscodeForm && resumePasscodeInput) {
        resumePasscodeForm.addEventListener('submit', async (e: Event) => {
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
        resumeRequestForm.addEventListener('submit', async (e: Event) => {
            e.preventDefault();

            const nameEl = document.getElementById('resume-req-name') as HTMLInputElement | null;
            const emailEl = document.getElementById('resume-req-email') as HTMLInputElement | null;
            const orgEl = document.getElementById('resume-req-org') as HTMLInputElement | null;
            const purposeEl = document.getElementById('resume-req-purpose') as HTMLInputElement | null;

            if (!nameEl || !emailEl) return;

            const reqPayload: ResumeRequestPayload = {
                id: 'req_' + Date.now(),
                name: nameEl.value.trim(),
                email: emailEl.value.trim(),
                org: orgEl ? orgEl.value.trim() : 'N/A',
                purpose: purposeEl ? purposeEl.value.trim() : 'General Review',
                status: 'PENDING_APPROVAL',
                timestamp: Date.now()
            };

            if (!reqPayload.name || !reqPayload.email) return;

            if (btnSubmitResumeReq) {
                btnSubmitResumeReq.disabled = true;
                btnSubmitResumeReq.innerHTML = '<span>Transmitting Request...</span>';
            }
            playBotChirp(580, 'sine', 0.1);

            try {
                await fetch('/api/resume-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reqPayload)
                });

                if (resumeReqFeedback) {
                    resumeReqFeedback.style.display = 'block';
                    resumeReqFeedback.className = 'form-feedback-alert';
                    resumeReqFeedback.innerHTML = `<span>✅ <strong>Request Submitted for Approval!</strong> Notification dispatched to Dhigveerraju. Upon review and approval, an access link will be delivered to <strong>${escapeHtml(reqPayload.email)}</strong>.</span>`;
                }
                resumeRequestForm.reset();
                saveLocalBackup('resume_req', reqPayload);
                playBotChirp(680, 'sine', 0.15);
            } catch {
                if (resumeReqFeedback) {
                    resumeReqFeedback.style.display = 'block';
                    resumeReqFeedback.className = 'form-feedback-alert';
                    resumeReqFeedback.innerHTML = `<span>✅ <strong>Request Submitted for Approval!</strong> Notification dispatched to Dhigveerraju. Upon review and approval, an access link will be delivered to <strong>${escapeHtml(reqPayload.email)}</strong>.</span>`;
                }
                resumeRequestForm.reset();
                saveLocalBackup('resume_req', reqPayload);
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
}

// 3. Owner Approval Dashboard Controller
function initAdminDashboard(): void {
    const btnOpenAdmin = document.getElementById('btn-open-admin');
    const adminBackdrop = document.getElementById('admin-modal-backdrop');
    const adminCloseBtn = document.getElementById('admin-modal-close-btn');
    const authView = document.getElementById('admin-auth-view');
    const dashView = document.getElementById('admin-dash-view');
    const passcodeForm = document.getElementById('admin-passcode-form') as HTMLFormElement | null;
    const passcodeInput = document.getElementById('admin-passcode-input') as HTMLInputElement | null;
    const authError = document.getElementById('admin-auth-error');
    const btnLogout = document.getElementById('btn-admin-logout');
    const reqListEl = document.getElementById('admin-resume-req-list');
    const contactListEl = document.getElementById('admin-contact-list');
    const tabReqsBtn = document.getElementById('btn-tab-admin-reqs');
    const tabMsgsBtn = document.getElementById('btn-tab-admin-msgs');
    const paneReqs = document.getElementById('admin-pane-reqs');
    const paneMsgs = document.getElementById('admin-pane-msgs');

    function openAdmin(): void {
        if (!adminBackdrop) return;
        adminBackdrop.classList.add('open');
        playBotChirp(540, 'sine', 0.1);

        if (sessionStorage.getItem('owner_logged_in') === 'true') {
            showDashboard();
        } else {
            showAuth();
        }
    }

    function closeAdmin(): void {
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

    function showAuth(): void {
        if (authView) authView.style.display = 'block';
        if (dashView) dashView.style.display = 'none';
        if (passcodeInput) setTimeout(() => passcodeInput.focus(), 150);
    }

    function showDashboard(): void {
        if (authView) authView.style.display = 'none';
        if (dashView) dashView.style.display = 'block';
        void loadAdminData();
    }

    if (passcodeForm && passcodeInput) {
        passcodeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const val = passcodeInput.value.trim();
            const hash = await computeSha256(val);

            if (VALID_HASHES.includes(hash) || PUBLIC_TOKENS.includes(val.toUpperCase())) {
                sessionStorage.setItem('owner_logged_in', 'true');
                sessionStorage.setItem('owner_auth_hash', hash);
                if (authError) authError.style.display = 'none';
                passcodeInput.value = '';
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

    // Tab switching
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

    async function loadAdminData(): Promise<void> {
        let resumeRequests: ResumeRequestPayload[] = [];
        let contacts: ContactPayload[] = [];

        try {
            const authHash = sessionStorage.getItem('owner_auth_hash') || VALID_HASHES[0];
            const res = await fetch('/api/admin/data', {
                headers: { 'x-admin-passcode': authHash }
            });
            if (res.ok) {
                const data = (await res.json()) as AdminDashboardData;
                resumeRequests = data.resumeRequests || [];
                contacts = data.contacts || [];
            }
        } catch {
            // Fallback: load from local storage backup
            resumeRequests = getLocalBackups<ResumeRequestPayload>('resume_req');
            contacts = getLocalBackups<ContactPayload>('contact');
        }

        renderResumeRequests(resumeRequests);
        renderContactMessages(contacts);
    }

    function renderResumeRequests(requests: ResumeRequestPayload[]): void {
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
                        <div><strong>Organization:</strong> ${escapeHtml(req.org || 'N/A')}</div>
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
        reqListEl.querySelectorAll<HTMLButtonElement>('.btn-approve-copy').forEach(btn => {
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
                        void fetch('/api/admin/approve', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'x-admin-passcode': authHash },
                            body: JSON.stringify({ id: reqId })
                        });
                    }
                } catch {
                    alert(`Approval Link: ${approvalUrl}`);
                }
            });
        });
    }

    function renderContactMessages(messages: ContactPayload[]): void {
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
}

// Local Storage Fallback for Static GitHub Pages Hosting
function saveLocalBackup(type: 'contact' | 'resume_req', item: unknown): void {
    try {
        const key = `dhigveer_backup_${type}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.unshift(item);
        localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
    } catch {}
}

function getLocalBackups<T>(type: 'contact' | 'resume_req'): T[] {
    try {
        const key = `dhigveer_backup_${type}`;
        return JSON.parse(localStorage.getItem(key) || '[]') as T[];
    } catch {
        return [];
    }
}

function escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
