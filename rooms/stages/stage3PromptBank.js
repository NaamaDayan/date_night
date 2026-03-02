/**
 * Stage 3 Vision Board – closed question bank (server source of truth).
 * Each prompt has 2 choices with id, label, assetKey.
 */

const PROMPTS = [
  {
    question: "Next vacation",
    options: [
      { id: "vacation_thailand", label: "Thailand beach trip", assetKey: "vacation_thailand" },
      { id: "vacation_ski", label: "Ski vacation", assetKey: "vacation_ski" },
    ],
  },
  {
    question: "Date night vibe",
    options: [
      { id: "date_fancy", label: "Fancy restaurant", assetKey: "date_fancy" },
      { id: "date_movie", label: "Home movie night", assetKey: "date_movie" },
    ],
  },
  {
    question: "Dream home",
    options: [
      { id: "home_city", label: "Modern city apartment", assetKey: "home_city" },
      { id: "home_yard", label: "Cozy house with yard", assetKey: "home_yard" },
    ],
  },
  {
    question: "Weekend morning",
    options: [
      { id: "morning_coffee", label: "Coffee & pastry", assetKey: "morning_coffee" },
      { id: "morning_brunch", label: "Big brunch", assetKey: "morning_brunch" },
    ],
  },
  {
    question: "Couple hobby",
    options: [
      { id: "hobby_dance", label: "Dance class", assetKey: "hobby_dance" },
      { id: "hobby_gym", label: "Gym together", assetKey: "hobby_gym" },
    ],
  },
  {
    question: "Future pet",
    options: [
      { id: "pet_dog", label: "Dog", assetKey: "pet_dog" },
      { id: "pet_cat", label: "Cat", assetKey: "pet_cat" },
    ],
  },
  {
    question: "Big purchase",
    options: [
      { id: "buy_home", label: "Upgrade home decor", assetKey: "buy_home" },
      { id: "buy_travel", label: "Travel fund", assetKey: "buy_travel" },
    ],
  },
  {
    question: "Celebration style",
    options: [
      { id: "celebrate_party", label: "Big party", assetKey: "celebrate_party" },
      { id: "celebrate_intimate", label: "Intimate dinner", assetKey: "celebrate_intimate" },
    ],
  },
  {
    question: "Learning goal",
    options: [
      { id: "learn_language", label: "New language", assetKey: "learn_language" },
      { id: "learn_cook", label: "Cooking mastery", assetKey: "learn_cook" },
    ],
  },
  {
    question: "Wellness goal",
    options: [
      { id: "wellness_yoga", label: "Weekly yoga", assetKey: "wellness_yoga" },
      { id: "wellness_hike", label: "Weekly hikes", assetKey: "wellness_hike" },
    ],
  },
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Simple deterministic hash for picking reaction index from (match, assetKey). */
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Deterministic TV reaction after each reveal.
 * @param {boolean} match - whether both players chose the same option
 * @param {string} [assetKey] - optional key for context-specific reactions
 * @returns {string}
 */
function getTvReaction(match, assetKey) {
  const matchReactions = [
    "Aligned again! ✨",
    "Power couple energy 💫",
    "Telepathy unlocked 🔮",
    "Vision synced 🔥",
  ];
  const mismatchReactions = [
    "Hmm… negotiations needed 🤝",
    "Parallel universes detected 🪐",
    "Almost soulmates 😅",
  ];
  const contextReactions = {
    pet_dog: "Hoo hoo! 🐶 Someone's barking with excitement!",
    pet_cat: "Meow-approved 😼",
    vacation_ski: "Shred mode activated 🎿❄️",
    vacation_thailand: "Sun, sand, yes please 🌴",
    morning_coffee: "Caffeine soulmates ☕",
    morning_brunch: "Brunch is a love language 🥐",
    hobby_dance: "Ok dancers 💃🕺",
    wellness_hike: "Nature couple unlocked 🌿",
    celebrate_party: "Social butterflies 🦋",
    celebrate_intimate: "Soft romance mode 🕯️",
  };

  if (match && assetKey && contextReactions[assetKey]) {
    return contextReactions[assetKey];
  }
  if (match) {
    const i = hash(String(match) + (assetKey || "")) % matchReactions.length;
    return matchReactions[i];
  }
  const i = hash("mismatch" + (assetKey || "")) % mismatchReactions.length;
  return mismatchReactions[i];
}

module.exports = {
  PROMPTS,
  shuffleArray,
  getTvReaction,
};
