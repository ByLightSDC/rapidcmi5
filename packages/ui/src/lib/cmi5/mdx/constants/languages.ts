/**
 * Common BCP 47 language tags for the "Language of Parts" (WCAG 2.1 SC 3.1.2)
 * feature. Authors wrap an inline phrase in a `<span lang="...">` so screen
 * readers switch to the correct pronunciation engine.
 *
 * `tag` is the BCP 47 language subtag stored in the markup; `label` is the
 * human-readable name shown in the picker (endonym + English name where they
 * differ). This is a curated shortlist, not the full IANA registry — the picker
 * also accepts free-text entry for tags not listed here (e.g. `es-MX`,
 * `zh-Hant`).
 */
export interface LanguageOption {
  tag: string;
  label: string;
}

export const COMMON_LANGUAGES: readonly LanguageOption[] = [
  { tag: 'ar', label: 'العربية (Arabic)' },
  { tag: 'bn', label: 'বাংলা (Bengali)' },
  { tag: 'cs', label: 'Čeština (Czech)' },
  { tag: 'da', label: 'Dansk (Danish)' },
  { tag: 'de', label: 'Deutsch (German)' },
  { tag: 'el', label: 'Ελληνικά (Greek)' },
  { tag: 'en', label: 'English' },
  { tag: 'es', label: 'Español (Spanish)' },
  { tag: 'fa', label: 'فارسی (Persian)' },
  { tag: 'fi', label: 'Suomi (Finnish)' },
  { tag: 'fr', label: 'Français (French)' },
  { tag: 'he', label: 'עברית (Hebrew)' },
  { tag: 'hi', label: 'हिन्दी (Hindi)' },
  { tag: 'hu', label: 'Magyar (Hungarian)' },
  { tag: 'id', label: 'Bahasa Indonesia (Indonesian)' },
  { tag: 'it', label: 'Italiano (Italian)' },
  { tag: 'ja', label: '日本語 (Japanese)' },
  { tag: 'ko', label: '한국어 (Korean)' },
  { tag: 'nl', label: 'Nederlands (Dutch)' },
  { tag: 'no', label: 'Norsk (Norwegian)' },
  { tag: 'pl', label: 'Polski (Polish)' },
  { tag: 'pt', label: 'Português (Portuguese)' },
  { tag: 'ro', label: 'Română (Romanian)' },
  { tag: 'ru', label: 'Русский (Russian)' },
  { tag: 'sv', label: 'Svenska (Swedish)' },
  { tag: 'th', label: 'ไทย (Thai)' },
  { tag: 'tr', label: 'Türkçe (Turkish)' },
  { tag: 'uk', label: 'Українська (Ukrainian)' },
  { tag: 'ur', label: 'اردو (Urdu)' },
  { tag: 'vi', label: 'Tiếng Việt (Vietnamese)' },
  { tag: 'zh', label: '中文 (Chinese)' },
] as const;

/**
 * Loose validation of a BCP 47 language tag (primary subtag + optional
 * script/region subtags), e.g. `fr`, `es-MX`, `zh-Hant`. This is intentionally
 * permissive — it guards against obvious typos, not against every malformed
 * tag.
 */
export const isValidLanguageTag = (tag: string): boolean =>
  /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(tag.trim());

/**
 * Resolve a stored tag to its display label, falling back to the raw tag for
 * free-text entries not in {@link COMMON_LANGUAGES}.
 */
export const labelForLanguageTag = (tag: string): string =>
  COMMON_LANGUAGES.find((l) => l.tag.toLowerCase() === tag.toLowerCase())
    ?.label ?? tag;
