import { create } from 'zustand';

export interface OnboardingState {
  step: number;
  intentions: string[];
  currentMood: string | null;
  therapyExperience: string | null;
  firstConversationCompleted: boolean;
  onboardingConversationId: string | null;
  accountType: 'anonymous' | 'account' | null;
  trialStarted: boolean;
  trialEndsAt: string | null;
  completed: boolean;
}

interface OnboardingActions {
  setStep: (step: number) => void;
  nextStep: () => void;
  setIntentions: (v: string[]) => void;
  setMood: (v: string) => void;
  setTherapyExperience: (v: string) => void;
  completeFirstConversation: (conversationId: string | null) => void;
  setAccountType: (v: 'anonymous' | 'account') => void;
  startTrial: (endsAt: string) => void;
  reset: () => void;
}

const initialState: OnboardingState = {
  step: 0,
  intentions: [],
  currentMood: null,
  therapyExperience: null,
  firstConversationCompleted: false,
  onboardingConversationId: null,
  accountType: null,
  trialStarted: false,
  trialEndsAt: null,
  completed: false,
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: s.step + 1 })),
  setIntentions: (intentions) => set({ intentions }),
  setMood: (currentMood) => set({ currentMood }),
  setTherapyExperience: (therapyExperience) => set({ therapyExperience }),
  completeFirstConversation: (id) =>
    set({ firstConversationCompleted: true, onboardingConversationId: id }),
  setAccountType: (accountType) => set({ accountType }),
  startTrial: (endsAt) => set({ trialStarted: true, trialEndsAt: endsAt }),
  reset: () => set(initialState),
}));
