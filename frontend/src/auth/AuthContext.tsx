import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { getDeviceId } from "./deviceId";
import { getToken, setToken, clearToken } from "./tokenStore";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;
const API = `${BASE}/api`;

export interface AuthUser {
  user_id: string;
  email: string;
  name: string;
  picture?: string | null;
}

type AuthState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "authenticated"; user: AuthUser };

interface AuthContextValue {
  state: AuthState;
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function processSessionId(sessionId: string): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${API}/auth/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    await setToken(data.session_token);

    // Claim any anonymous conversations from this device
    try {
      const deviceId = await getDeviceId();
      await fetch(`${API}/auth/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session_token}`,
        },
        body: JSON.stringify({ device_id: deviceId }),
      });
    } catch {}

    return data.user as AuthUser;
  } catch (e) {
    console.warn("processSessionId error", e);
    return null;
  }
}

async function fetchMe(token: string): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  const refresh = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setState({ status: "anonymous" });
      return;
    }
    const me = await fetchMe(token);
    if (me) setState({ status: "authenticated", user: me });
    else {
      await clearToken();
      setState({ status: "anonymous" });
    }
  }, []);

  // On mount: handle web URL session_id, otherwise restore existing token
  useEffect(() => {
    (async () => {
      // Web: check URL hash/query
      if (Platform.OS === "web") {
        try {
          const url = new URL(window.location.href);
          let sid = url.searchParams.get("session_id");
          if (!sid && url.hash) {
            const h = new URLSearchParams(url.hash.replace(/^#/, ""));
            sid = h.get("session_id");
          }
          if (sid) {
            const user = await processSessionId(sid);
            window.history.replaceState(null, "", url.pathname + url.search.replace(/[?&]?session_id=[^&]*/, ""));
            if (user) {
              setState({ status: "authenticated", user });
              return;
            }
          }
        } catch {}
      } else {
        // Native: check initial URL (cold start)
        try {
          const initial = await Linking.getInitialURL();
          if (initial) {
            const parsed = Linking.parse(initial);
            const sid =
              (parsed.queryParams?.session_id as string | undefined) ||
              extractFromHash(initial);
            if (sid) {
              const user = await processSessionId(sid);
              if (user) {
                setState({ status: "authenticated", user });
                return;
              }
            }
          }
        } catch {}
      }
      await refresh();
    })();
  }, [refresh]);

  const signIn = useCallback(async () => {
    const redirectUrl =
      Platform.OS === "web"
        ? `${globalThis.location?.origin ?? ""}/`
        : Linking.createURL("auth");
    const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;

    if (Platform.OS === "web") {
      globalThis.location.href = authUrl;
      return;
    }

    try {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      if (result.type !== "success" || !result.url) return;
      const parsed = Linking.parse(result.url);
      const sid =
        (parsed.queryParams?.session_id as string | undefined) ||
        extractFromHash(result.url);
      if (!sid) return;
      const user = await processSessionId(sid);
      if (user) setState({ status: "authenticated", user });
    } catch (e) {
      console.warn("signIn error", e);
    }
  }, []);

  const signOut = useCallback(async () => {
    const token = await getToken();
    if (token) {
      try {
        await fetch(`${API}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    await clearToken();
    setState({ status: "anonymous" });
  }, []);

  const value: AuthContextValue = {
    state,
    user: state.status === "authenticated" ? state.user : null,
    isAuthenticated: state.status === "authenticated",
    signIn,
    signOut,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

function extractFromHash(url: string): string | undefined {
  const i = url.indexOf("#");
  if (i < 0) return undefined;
  const params = new URLSearchParams(url.substring(i + 1));
  return params.get("session_id") ?? undefined;
}
