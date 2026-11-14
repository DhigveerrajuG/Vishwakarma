export interface ProjectDetail {
    title: string;
    subtitle: string;
    badge: string;
    summary: string;
    architecture: string[];
    tech: string[];
    github: string;
    codeSnippet?: {
        language: string;
        filename: string;
        code: string;
    };
    schematics?: {
        label: string;
        specs: { key: string; value: string }[];
    };
}
export type ProjectMap = Record<string, ProjectDetail>;
export interface ContactPayload {
    name: string;
    email: string;
    message: string;
    timestamp?: number;
}
export interface ResumeRequestPayload {
    id?: string;
    name: string;
    email: string;
    org?: string;
    purpose?: string;
    status?: 'PENDING_APPROVAL' | 'APPROVED';
    timestamp?: number;
}
export interface AdminDashboardData {
    resumeRequests: ResumeRequestPayload[];
    contacts: ContactPayload[];
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
export interface ChatQueryRequest {
    message: string;
}
export interface ChatQueryResponse {
    reply: string;
    category?: string;
    suggestions?: string[];
}
export interface SystemHealth {
    status: 'UP' | 'DOWN';
    runtime: string;
    timestamp: number;
    version: string;
}
