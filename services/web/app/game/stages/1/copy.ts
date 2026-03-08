import stage1Json from "config/copy/stage1.json";
import { applyTemplate } from "../../utils/applyTemplate";

export const COPY = {
  ...stage1Json,
  resultsWhoGuessed: (name: string) =>
    applyTemplate((stage1Json as { resultsWhoGuessedTemplate: string }).resultsWhoGuessedTemplate, { name }),
} as const;
