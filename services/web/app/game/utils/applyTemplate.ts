/**
 * Replace {{key}} placeholders in str with values from vars.
 * Same contract as backend copyLoader.applyTemplate.
 */
export function applyTemplate(
  str: string | null | undefined,
  vars: Record<string, string | number> = {}
): string {
  if (str == null || typeof str !== "string") return "";
  let out = str;
  for (const [key, value] of Object.entries(vars)) {
    const placeholder = `{{${key}}}`;
    out = out.split(placeholder).join(String(value ?? ""));
  }
  return out;
}
