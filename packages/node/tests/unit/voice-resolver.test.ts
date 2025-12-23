/**
 * Unit Tests for Voice Resolver
 */

import { describe, it, expect } from 'vitest';
import { voiceResolver } from '../../src/utils/voice-resolver.js';

describe('Voice Resolver', () => {
  describe('getModelForVoice', () => {
    it('returns flow_01_turbo for turbo voices', () => {
      expect(voiceResolver.getModelForVoice('v-female-R2s4N9qJ')).toBe('flow_01_turbo');
      expect(voiceResolver.getModelForVoice('v-male-Bk7vD3xP')).toBe('flow_01_turbo');
    });

    it('returns flow_01_ex for extended voices', () => {
      expect(voiceResolver.getModelForVoice('male-qn-qingse')).toBe('flow_01_ex');
      expect(voiceResolver.getModelForVoice('female-shaonv')).toBe('flow_01_ex');
    });

    it('throws error for unknown voice ID', () => {
      expect(() => voiceResolver.getModelForVoice('unknown-voice-id'))
        .toThrow('Unknown voice ID');
    });
  });

  describe('getVoice', () => {
    it('returns voice metadata for known voice', () => {
      const voice = voiceResolver.getVoice('v-female-R2s4N9qJ');
      expect(voice).toBeDefined();
      expect(voice?.id).toBe('v-female-R2s4N9qJ');
      expect(voice?.name).toBeDefined();
      expect(voice?.language).toBeDefined();
    });

    it('returns undefined for unknown voice', () => {
      expect(voiceResolver.getVoice('unknown-voice-id')).toBeUndefined();
    });
  });

  describe('getVoices', () => {
    it('returns all voices including extended by default', () => {
      const { preset } = voiceResolver.getVoices();
      expect(preset.length).toBeGreaterThan(77); // Should have turbo + extended
    });

    it('excludes extended voices when includeExtended=false', () => {
      const { preset } = voiceResolver.getVoices(false);
      expect(preset.length).toBe(77); // Only turbo voices
    });

    it('each voice has required fields', () => {
      const { preset } = voiceResolver.getVoices();
      preset.forEach(voice => {
        expect(voice.id).toBeDefined();
        expect(voice.name).toBeDefined();
        expect(voice.language).toBeDefined();
      });
    });
  });

  describe('searchVoices', () => {
    it('finds voices by name', () => {
      const voices = voiceResolver.searchVoices('温柔');
      expect(voices.length).toBeGreaterThan(0);
      voices.forEach(voice => {
        expect(
          voice.name.includes('温柔') ||
          voice.description?.includes('温柔')
        ).toBe(true);
      });
    });

    it('finds voices by language (case insensitive)', () => {
      const voices = voiceResolver.searchVoices('female');
      expect(voices.length).toBeGreaterThan(0);
      // Verify at least some results match the query
      expect(voices.some(v =>
        v.name.toLowerCase().includes('female') ||
        v.description?.toLowerCase().includes('female')
      )).toBe(true);
    });

    it('returns empty array for no matches', () => {
      const voices = voiceResolver.searchVoices('xyzzz-no-match-12345');
      expect(voices).toEqual([]);
    });

    it('search is case-insensitive', () => {
      const lowerCase = voiceResolver.searchVoices('female');
      const upperCase = voiceResolver.searchVoices('FEMALE');
      expect(lowerCase.length).toBe(upperCase.length);
    });
  });

  describe('getFallbackVoice', () => {
    it('returns a valid voice', () => {
      const voice = voiceResolver.getFallbackVoice();
      expect(voice).toBeDefined();
      expect(voice.id).toBeDefined();
      expect(voice.name).toBeDefined();
    });
  });
});
