/**
 * Stage 3 Vision Board – copy for TV and player screens.
 */

export const COPY = {
  // TV
  tvTitle: "Our Vision Board",
  tvIntroSubtext: "Answer either/or questions. When you both pick the same, it becomes part of your vision.",
  tvRevealMatch: "You're aligned!",
  tvRevealMismatch: "Different picks – that's okay.",
  tvGenerating: "Creating your vision board… ✨",
  tvShowResultTitle: "Your Vision Board",
  tvShowResultContinue: "Tap Continue on your phone to go to the next stage.",
  tvFallbackNoImage: "Your vision:",

  // Phone – intro
  phoneIntroTitle: "Vision Board",
  phoneIntroSub: "You'll answer questions together. When you both choose the same option, it's added to your shared vision.",

  // Phone – asking
  phoneQuestionIntro: "Choose one:",
  phoneWaiting: "Waiting for your partner…",

  // Phone – reveal
  phoneNext: "Next question",

  // Phone – showResult
  phoneContinue: "Continue",
  phoneResultTitle: "Your vision board is ready!",
} as const;
