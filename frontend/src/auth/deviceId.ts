// Persistent device identifier — used to scope anonymous data on the backend.
// Stored in expo-secure-store on native, localStorage on web.
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "kompas.device_id";

function uuid(): string {
  // Lightweight UUID v4 without external deps
  const tpl = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  return tpl.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function readKey(): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return globalThis.localStorage?.getItem(KEY) ?? null;
    } catch {
      return null;
    }
  }
  try {
    return await SecureStore.getItemAsync(KEY);
  } catch {
    return null;
  }
}

async function writeKey(value: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      globalThis.localStorage?.setItem(KEY, value);
    } catch {}
    return;
  }
  try {
    await SecureStore.setItemAsync(KEY, value);
  } catch {}
}

let cached: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  const existing = await readKey();
  if (existing) {
    cached = existing;
    return existing;
  }
  const fresh = uuid();
  await writeKey(fresh);
  cached = fresh;
  return fresh;
}
