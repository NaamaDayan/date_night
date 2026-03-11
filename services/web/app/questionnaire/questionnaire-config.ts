/**
 * Questionnaire configuration.
 *
 * To change the questions shown in the couple questionnaire, edit this array.
 * The `name` field must match the API contract (see /api/questionnaire/route.ts).
 * Currently the server expects: partner1Name, partner2Name, howLong, howMet, whereMet.
 *
 * If you add/remove fields, update the API route to match.
 */

export const FAVORITE_GENRES_OPTIONS = [
  "Rock",
  "Classical",
  "Disney",
  "Middle Eastern",
  "Mainstream",
  "Pop",
  "Jazz",
  "Hip-Hop",
] as const;

export type FavoriteGenre = (typeof FAVORITE_GENRES_OPTIONS)[number];

export interface QuestionField {
  name: string;
  label: string;
  placeholder: string;
  type: "text" | "select" | "textarea" | "number" | "multiselect";
  required: boolean;
  icon: string;
  options?: string[];
}

export const QUESTIONNAIRE_FIELDS: QuestionField[] = [
  {
    name: "partner1Name",
    label: "Your name",
    placeholder: "Enter your first name",
    type: "text",
    required: true,
    icon: "💜",
  },
  {
    name: "partner2Name",
    label: "Your partner's name",
    placeholder: "Enter their first name",
    type: "text",
    required: true,
    icon: "💛",
  },
  {
    name: "howLong",
    label: "How long have you been together?",
    placeholder: "e.g. 2 years, 6 months",
    type: "text",
    required: true,
    icon: "⏳",
  },
  {
    name: "howMet",
    label: "How did you meet?",
    placeholder: "e.g. Through friends, at work, online",
    type: "text",
    required: true,
    icon: "💫",
  },
  {
    name: "whereMet",
    label: "Where did you meet?",
    placeholder: "e.g. A coffee shop in Tel Aviv",
    type: "text",
    required: true,
    icon: "📍",
  },
  {
    name: "yearOfMeeting",
    label: "Year you met",
    placeholder: "e.g. 2019",
    type: "number",
    required: true,
    icon: "📅",
  },
  {
    name: "favoriteGenres",
    label: "Favorite music genres (pick one or more)",
    placeholder: "Select genres",
    type: "multiselect",
    required: false,
    icon: "🎵",
    options: [...FAVORITE_GENRES_OPTIONS],
  },
];

export const QUESTIONNAIRE_TITLE = "Tell us about your love story";
export const QUESTIONNAIRE_SUBTITLE =
  "We'll use this to personalize your game experience";
