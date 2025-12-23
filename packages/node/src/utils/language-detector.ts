/**
 * Language Detection Utility
 * Zero-dependency language detection using Unicode ranges
 */

/**
 * Detect language from text using Unicode character ranges
 *
 * @param text - Text to analyze
 * @param defaultLang - Default language if detection fails (default: 'zh')
 * @returns ISO 639-1 language code (zh, en, ja, ko, etc.)
 */
export function detectLanguage(text: string, defaultLang = 'zh'): string {
  // Validate input
  if (!text || typeof text !== 'string') {
    return defaultLang;
  }

  const trimmedText = text.trim();
  if (trimmedText.length === 0) {
    return defaultLang;
  }

  // Get character code statistics
  let chineseCount = 0;
  let japaneseCount = 0;
  let koreanCount = 0;
  let latinCount = 0;
  let totalCount = 0;

  for (let i = 0; i < trimmedText.length; i++) {
    const code = trimmedText.charCodeAt(i);
    totalCount++;

    // Chinese Unicode ranges:
    // - Basic CJK Unified Ideographs: U+4E00 - U+9FFF (19968-40959)
    // - CJK Extension A: U+3400 - U+4DBF
    // - CJK Compatibility: U+F900 - U+FAFF
    if (
      (code >= 0x4e00 && code <= 0x9fff) ||
      (code >= 0x3400 && code <= 0x4dbf) ||
      (code >= 0xf900 && code <= 0xfaff)
    ) {
      chineseCount++;
      continue;
    }

    // Japanese Hiragana: U+3040 - U+309F
    // Japanese Katakana: U+30A0 - U+30FF
    if ((code >= 0x3040 && code <= 0x309f) || (code >= 0x30a0 && code <= 0x30ff)) {
      japaneseCount++;
      continue;
    }

    // Korean Hangul: U+AC00 - U+D7AF
    if (code >= 0xac00 && code <= 0xd7af) {
      koreanCount++;
      continue;
    }

    // Latin alphabet: A-Z, a-z
    if ((code >= 0x41 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a)) {
      latinCount++;
      continue;
    }
  }

  // Determine language based on character distribution
  // If >30% of characters are from a specific script, use that language
  const threshold = 0.3;

  if (japaneseCount / totalCount > threshold) {
    return 'ja';
  }

  if (koreanCount / totalCount > threshold) {
    return 'ko';
  }

  if (chineseCount / totalCount > threshold) {
    return 'zh';
  }

  if (latinCount / totalCount > threshold) {
    // For Latin scripts, default to English
    // Could be enhanced with more sophisticated detection
    return 'en';
  }

  // Fallback to default language
  return defaultLang;
}

/**
 * Batch detect languages for multiple texts
 *
 * @param texts - Array of texts to analyze
 * @param defaultLang - Default language if detection fails
 * @returns Array of detected language codes
 */
export function detectLanguages(texts: string[], defaultLang = 'zh'): string[] {
  return texts.map(text => detectLanguage(text, defaultLang));
}

/**
 * Check if text contains CJK characters
 *
 * @param text - Text to check
 * @returns True if text contains Chinese, Japanese, or Korean characters
 */
export function containsCJK(text: string): boolean {
  if (!text) return false;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);

    // Check for CJK ranges
    if (
      (code >= 0x4e00 && code <= 0x9fff) ||
      (code >= 0x3400 && code <= 0x4dbf) ||
      (code >= 0xf900 && code <= 0xfaff) ||
      (code >= 0x3040 && code <= 0x30ff) ||
      (code >= 0xac00 && code <= 0xd7af)
    ) {
      return true;
    }
  }

  return false;
}
