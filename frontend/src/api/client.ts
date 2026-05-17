// API client for Kompas backend — auto-attaches Bearer token and X-Device-Id
import { getToken } from "@/src/auth/tokenStore";
import { getDeviceId } from "@/src/auth/deviceId";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

if (!BASE) {
  console.warn("EXPO_PUBLIC_BACKEND_URL not configured");
}

const API = `${BASE}/api`;

async function buildHeaders(extra: HeadersInit = {}): Promise<HeadersInit> {
  const [token, deviceId] = await Promise.all([getToken(), getDeviceId()]);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Device-Id": deviceId,
    ...(extra as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers = await buildHeaders(opts.headers);
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

export interface ApiMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  suggested_test_id?: string | null;
  created_at: string;
}

export interface ApiConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  suggested_test_id?: string | null;
}

export interface ChatResponse {
  conversation_id: string;
  user_message: ApiMessage;
  assistant_message: ApiMessage;
  suggested_test_id?: string | null;
  crisis_detected: boolean;
  profile_suggestion?: {
    id: string;
    field_path: string;
    value: string | number | boolean | string[];
    rationale?: string;
    question: string;
  } | null;
}

export const api = {
  chat: (message: string, conversation_id?: string) =>
    request<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify({ message, conversation_id }),
    }),

  listConversations: () => request<ApiConversation[]>("/conversations"),

  getConversation: (id: string) =>
    request<{ conversation: ApiConversation; messages: ApiMessage[] }>(`/conversations/${id}`),

  deleteConversation: (id: string) =>
    request<{ deleted: number }>(`/conversations/${id}`, { method: "DELETE" }),

  assessmentNarrative: (req: {
    assessment_id: string;
    assessment_title: string;
    score: number;
    max_score: number;
    interpretation_label: string;
    subscales?: Record<string, any> | null;
    crisis_flag: boolean;
  }) =>
    request<{ narrative: string }>("/assessment-narrative", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  saveAssessmentResult: (req: {
    assessment_id: string;
    assessment_title: string;
    raw_answers: any[];
    total_score: number;
    max_score: number;
    interpretation_label: string;
    interpretation_tier: string;
    subscales?: Record<string, any> | null;
    crisis_flag: boolean;
    narrative?: string | null;
  }) =>
    request<{
      id: string;
      assessment_id: string;
      assessment_title: string;
      total_score: number;
      max_score: number;
      interpretation_label: string;
      interpretation_tier: string;
      crisis_flag: boolean;
      narrative?: string | null;
      completed_at: string;
    }>("/assessment-results", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  listAssessmentResults: (assessment_id?: string) => {
    const qs = assessment_id ? `?assessment_id=${assessment_id}` : "";
    return request<any[]>(`/assessment-results${qs}`);
  },

  createStripeCheckoutSession: (req: { plan: "monthly" | "annual"; user_id?: string | null }) =>
    request<{ checkoutUrl: string | null; mock?: boolean; message?: string }>("/stripe/checkout-session", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  saveOnboardingQuiz: (req: { intentions: string[]; mood?: string | null; therapy_experience?: string | null }) =>
    request<{ ok: boolean }>("/onboarding/quiz", {
      method: "POST",
      body: JSON.stringify(req),
    }),
};
