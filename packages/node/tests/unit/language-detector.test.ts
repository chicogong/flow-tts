/**
 * Unit Tests for Language Detection Utility
 */

import { describe, it, expect } from 'vitest';
import { detectLanguage, detectLanguages, containsCJK } from '../../src/utils/language-detector.js';

describe('Language Detection', () => {
  describe('detectLanguage', () => {
    it('detects Chinese text', () => {
      expect(detectLanguage('你好世界')).toBe('zh');
      expect(detectLanguage('这是中文文本')).toBe('zh');
    });

    it('detects English text', () => {
      expect(detectLanguage('Hello world')).toBe('en');
      expect(detectLanguage('This is English text')).toBe('en');
    });

    it('detects Japanese text', () => {
      expect(detectLanguage('こんにちは世界')).toBe('ja');
      expect(detectLanguage('これは日本語です')).toBe('ja');
    });

    it('detects Korean text', () => {
      expect(detectLanguage('안녕하세요')).toBe('ko');
      expect(detectLanguage('이것은 한국어입니다')).toBe('ko');
    });

    it('uses default language for empty text', () => {
      expect(detectLanguage('')).toBe('zh');
      expect(detectLanguage('', 'en')).toBe('en');
    });

    it('uses default language for unknown text', () => {
      expect(detectLanguage('123456')).toBe('zh');
      expect(detectLanguage('!@#$%', 'en')).toBe('en');
    });

    it('handles mixed text (chooses dominant language)', () => {
      expect(detectLanguage('Hello 世界')).toBe('en'); // More English chars (5 vs 2)
      expect(detectLanguage('你好世界 hi')).toBe('zh'); // More Chinese chars (4 vs 2)
    });
  });

  describe('detectLanguages', () => {
    it('detects multiple languages in batch', () => {
      const texts = ['你好', 'Hello', 'こんにちは', '안녕하세요'];
      const langs = detectLanguages(texts);
      expect(langs).toEqual(['zh', 'en', 'ja', 'ko']);
    });

    it('handles empty array', () => {
      expect(detectLanguages([])).toEqual([]);
    });
  });

  describe('containsCJK', () => {
    it('returns true for Chinese text', () => {
      expect(containsCJK('你好')).toBe(true);
      expect(containsCJK('Hello 世界')).toBe(true);
    });

    it('returns true for Japanese text', () => {
      expect(containsCJK('こんにちは')).toBe(true);
      expect(containsCJK('Hello ひらがな')).toBe(true);
    });

    it('returns true for Korean text', () => {
      expect(containsCJK('안녕하세요')).toBe(true);
      expect(containsCJK('Hello 한국어')).toBe(true);
    });

    it('returns false for non-CJK text', () => {
      expect(containsCJK('Hello World')).toBe(false);
      expect(containsCJK('123456')).toBe(false);
      expect(containsCJK('!@#$%')).toBe(false);
    });
  });
});
