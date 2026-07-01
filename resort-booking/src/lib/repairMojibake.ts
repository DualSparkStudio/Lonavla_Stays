/** UTF-8 punctuation misread as Windows-1252 and stored as UTF-8 again. */
const MOJIBAKE_REPLACEMENTS: ReadonlyArray<readonly [string, string]> = [
  ['\u00E2\u20AC\u201D', '\u2014'], // em dash
  ['\u00E2\u20AC\u201C', '\u2013'], // en dash
  ['\u00E2\u20AC\u2122', '\u2019'], // right single quote
  ['\u00E2\u20AC\u0153', '\u201C'], // left double quote
  ['\u00E2\u20AC\u009D', '\u201D'], // right double quote
  ['\u00E2\u20AC\u00A6', '\u2026'], // ellipsis
];

export function repairMojibake(text: string | null | undefined): string {
  if (text == null || text === '') return text ?? '';
  if (!text.includes('\u00E2')) return text;

  let result = text;
  for (const [from, to] of MOJIBAKE_REPLACEMENTS) {
    if (result.includes(from)) {
      result = result.split(from).join(to);
    }
  }
  return result;
}

export function repairMojibakeDeep<T>(value: T): T {
  if (typeof value === 'string') return repairMojibake(value) as T;
  if (Array.isArray(value)) return value.map((item) => repairMojibakeDeep(item)) as T;
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = repairMojibakeDeep(nested);
    }
    return out as T;
  }
  return value;
}
