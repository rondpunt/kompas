// Token storage — secure-store on native, localStorage on web
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "kompas.session_token";

export async function getToken(): Promise<string | null> {
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

export async function setToken(value: string): Promise<void> {
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

export async function clearToken(): Promise<void> {
  if (Platform.OS === "web") {
    try {
      globalThis.localStorage?.removeItem(KEY);
    } catch {}
    return;
  }
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch {}
}
