/**
 * Kompas Onboarding — 9-screen flow per spec (Deel B)
 * Steps: Welcome → Quiz x3 → Eerste Gesprek → Privacy → Paywall → Confirmatie
 */
import React, { useCallback } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/src/auth/AuthContext';
import { storage } from '@/src/utils/storage';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { trackEvent } from '@/src/utils/posthog';

import { WelcomeStep } from '@/src/components/onboarding/WelcomeStep';
import { QuizStep, QUIZ_INTENT, QUIZ_MOOD, QUIZ_THERAPY } from '@/src/components/onboarding/QuizStep';
import { FirstConversationStep } from '@/src/components/onboarding/FirstConversationStep';
import { PrivacyStep } from '@/src/components/onboarding/PrivacyStep';
import { PaywallStep } from '@/src/components/onboarding/PaywallStep';
import { ConfirmationStep } from '@/src/components/onboarding/ConfirmationStep';

export const ONBOARDED_KEY = 'kompas.onboarded';

export async function hasOnboarded(): Promise<boolean> {
  const v = await storage.getItem<boolean>(ONBOARDED_KEY, false);
  return v === true;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const store = useOnboardingStore();

  const finish = useCallback(async () => {
    // Sla quiz-data op in backend (best effort)
    try {
      const base = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
      await fetch(`${base}/api/onboarding/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intentions: store.intentions,
          mood: store.currentMood,
          therapy_experience: store.therapyExperience,
        }),
      });
    } catch {}

    await storage.setItem(ONBOARDED_KEY, true);
    trackEvent('onboarding_completed', {
      account_type: store.accountType ?? 'anonymous',
      trial_started: store.trialStarted,
    });
    router.replace('/');
  }, [store.intentions, store.currentMood, store.therapyExperience, store.accountType, store.trialStarted]);

  const goTo = (step: number) => {
    trackEvent('onboarding_step_viewed', { step });
    store.setStep(step);
  };

  // ── Step renderers ──────────────────────────────────
  const renderStep = () => {
    switch (store.step) {
      case 0:
        return (
          <WelcomeStep
            onNext={() => {
              trackEvent('onboarding_started');
              goTo(1);
            }}
          />
        );

      case 1:
        return (
          <QuizStep
            config={QUIZ_INTENT}
            onAnswer={(v) => {
              store.setIntentions(Array.isArray(v) ? v : [v]);
              trackEvent('quiz_question_answered', { question: 'intent', answer: v });
              goTo(2);
            }}
            onSkip={() => goTo(2)}
          />
        );

      case 2:
        return (
          <QuizStep
            config={QUIZ_MOOD}
            onAnswer={(v) => {
              store.setMood(v as string);
              trackEvent('quiz_question_answered', { question: 'mood', answer: v });
              goTo(3);
            }}
            onSkip={() => goTo(3)}
          />
        );

      case 3:
        return (
          <QuizStep
            config={QUIZ_THERAPY}
            onAnswer={(v) => {
              store.setTherapyExperience(v as string);
              trackEvent('quiz_question_answered', { question: 'therapy', answer: v });
              trackEvent('quiz_completed');
              goTo(4);
            }}
            onSkip={() => { trackEvent('quiz_completed'); goTo(4); }}
          />
        );

      case 4:
        return (
          <FirstConversationStep
            intentions={store.intentions}
            mood={store.currentMood}
            onComplete={(convId) => {
              store.completeFirstConversation(convId);
              trackEvent('first_conversation_completed');
              goTo(5);
            }}
            onSkip={() => goTo(5)}
          />
        );

      case 5:
        return (
          <PrivacyStep
            onAnonymous={() => {
              store.setAccountType('anonymous');
              trackEvent('anonymous_selected');
              goTo(6);
            }}
            onAccount={() => {
              store.setAccountType('account');
              trackEvent('account_selected');
              goTo(6);
            }}
          />
        );

      case 6:
        return (
          <PaywallStep
            userId={user?.user_id ?? null}
            onTrialStarted={(endsAt) => {
              store.startTrial(endsAt);
              trackEvent('trial_started');
              goTo(7);
            }}
            onSkip={() => {
              trackEvent('paywall_skipped');
              goTo(7);
            }}
          />
        );

      case 7:
        return (
          <ConfirmationStep
            trialEndsAt={store.trialEndsAt}
            onChat={finish}
            onTests={finish}
            onSettings={finish}
            onDone={finish}
          />
        );

      default:
        finish();
        return null;
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {renderStep()}
    </>
  );
}
