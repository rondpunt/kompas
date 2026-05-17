// PostHog singleton — EU hosting for GDPR compliance
// Key already configured in backend; also used on frontend.
import PostHog from 'posthog-react-native';

let _instance: PostHog | null = null;

function getInstance(): PostHog | null {
  const key = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  if (!_instance) {
    try {
      _instance = new PostHog(key, {
        host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://eu.posthog.com',
        persistence: 'memory',
      });
    } catch {
      return null;
    }
  }
  return _instance;
}

export function trackEvent(event: string, props?: Record<string, unknown>): void {
  try { getInstance()?.capture(event, props ?? {}); } catch {}
}

export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  try { getInstance()?.identify(userId, traits ?? {}); } catch {}
}
