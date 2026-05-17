// Soft-paywall usage tracking — purely local, anonymous-friendly.
// Tracks: first_open_at, message_count, assessments_completed_count, last_plus_hint_dismissed_at.
// Triggers a contextual "Plus" hint AFTER N messages OR N days, never blocks.

import { storage } from "@/src/utils/storage";

const FIRST_OPEN_KEY = "kompas.usage.first_open_at";
const MSG_COUNT_KEY = "kompas.usage.message_count";
const ASSESS_COUNT_KEY = "kompas.usage.assessments_completed";
const PLUS_DISMISS_KEY = "kompas.usage.plus_hint_dismissed_at";

export interface UsageSnapshot {
  firstOpenAt: number;
  messageCount: number;
  assessmentsCompleted: number;
  plusHintDismissedAt: number; // 0 if never
  daysActive: number;
  shouldShowPlusHint: boolean;
}

const MS_PER_DAY = 86400000;
const HINT_AFTER_MESSAGES = 20;
const HINT_AFTER_DAYS = 3;
const HINT_REDISMISS_COOLDOWN_DAYS = 5;

async function readNumber(key: string): Promise<number> {
  const v = await storage.getItem<number>(key, 0);
  return typeof v === "number" ? v : 0;
}

export async function getUsage(): Promise<UsageSnapshot> {
  let firstOpenAt = await readNumber(FIRST_OPEN_KEY);
  if (!firstOpenAt) {
    firstOpenAt = Date.now();
    await storage.setItem(FIRST_OPEN_KEY, firstOpenAt);
  }
  const messageCount = await readNumber(MSG_COUNT_KEY);
  const assessmentsCompleted = await readNumber(ASSESS_COUNT_KEY);
  const plusHintDismissedAt = await readNumber(PLUS_DISMISS_KEY);
  const daysActive = Math.floor((Date.now() - firstOpenAt) / MS_PER_DAY);

  const cooledDown =
    plusHintDismissedAt === 0 ||
    Date.now() - plusHintDismissedAt > HINT_REDISMISS_COOLDOWN_DAYS * MS_PER_DAY;

  const reachedThreshold =
    messageCount >= HINT_AFTER_MESSAGES || daysActive >= HINT_AFTER_DAYS;

  return {
    firstOpenAt,
    messageCount,
    assessmentsCompleted,
    plusHintDismissedAt,
    daysActive,
    shouldShowPlusHint: reachedThreshold && cooledDown,
  };
}

export async function bumpMessageCount(): Promise<number> {
  const cur = await readNumber(MSG_COUNT_KEY);
  const next = cur + 1;
  await storage.setItem(MSG_COUNT_KEY, next);
  return next;
}

export async function bumpAssessmentCount(): Promise<number> {
  const cur = await readNumber(ASSESS_COUNT_KEY);
  const next = cur + 1;
  await storage.setItem(ASSESS_COUNT_KEY, next);
  return next;
}

export async function dismissPlusHint(): Promise<void> {
  await storage.setItem(PLUS_DISMISS_KEY, Date.now());
}

export async function resetUsage(): Promise<void> {
  await storage.removeItem(FIRST_OPEN_KEY);
  await storage.removeItem(MSG_COUNT_KEY);
  await storage.removeItem(ASSESS_COUNT_KEY);
  await storage.removeItem(PLUS_DISMISS_KEY);
}
