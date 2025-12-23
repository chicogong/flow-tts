/**
 * Voice Library Resolver
 * Provides O(1) voice lookups and model selection
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Voice, VoiceLibrary } from '../types.js';

// Get current directory path (works in both ESM and CJS)
function getDirname(): string {
  // In ESM, use import.meta.url
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    return dirname(fileURLToPath(import.meta.url));
  }
  // In CJS, __dirname is available globally
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore __dirname exists in CJS context
  return typeof __dirname !== 'undefined' ? __dirname : process.cwd();
}

const currentDir = getDirname();

/**
 * Voice library data structure
 */
interface VoiceData {
  voices: Voice[];
}

/**
 * Voice Resolver Class
 * Singleton pattern for efficient voice library management
 */
class VoiceResolver {
  private turboVoices: Voice[] = [];
  private exVoices: Voice[] = [];
  private turboVoiceIds: Set<string> = new Set();
  private exVoiceIds: Set<string> = new Set();
  private turboVoiceMap: Map<string, Voice> = new Map();
  private exVoiceMap: Map<string, Voice> = new Map();
  private initialized = false;

  /**
   * Initialize voice library (lazy loading)
   */
  private init(): void {
    if (this.initialized) return;

    try {
      // Determine data directory path
      // In dev: src/utils -> ../data
      // In built package: dist -> ../src/data
      const possiblePaths = [
        join(currentDir, '../data'),  // Development
        join(currentDir, '../../src/data'),  // Built (from dist/)
        join(currentDir, '../src/data')  // Alternative build structure
      ];

      let dataDir: string | null = null;
      for (const path of possiblePaths) {
        try {
          const testPath = join(path, 'voices-flow_01_turbo.json');
          readFileSync(testPath, 'utf8');
          dataDir = path;
          break;
        } catch {
          continue;
        }
      }

      if (!dataDir) {
        throw new Error(
          `Could not find voice data files. Searched paths: ${possiblePaths.join(', ')}`
        );
      }

      // Load Turbo voices
      const turboPath = join(dataDir, 'voices-flow_01_turbo.json');
      const turboData: VoiceData = JSON.parse(readFileSync(turboPath, 'utf8'));
      this.turboVoices = turboData.voices;
      this.turboVoiceIds = new Set(turboData.voices.map(v => v.id));
      this.turboVoiceMap = new Map(turboData.voices.map(v => [v.id, v]));

      // Load Ex voices
      const exPath = join(dataDir, 'voices-flow_01_ex.json');
      const exData: VoiceData = JSON.parse(readFileSync(exPath, 'utf8'));
      this.exVoices = exData.voices;
      this.exVoiceIds = new Set(exData.voices.map(v => v.id));
      this.exVoiceMap = new Map(exData.voices.map(v => [v.id, v]));

      this.initialized = true;
    } catch (error) {
      const err = error as Error;
      throw new Error(
        `Failed to load voice library. Please ensure the package is installed correctly.\n` +
        `Error: ${err.message}`
      );
    }
  }

  /**
   * Get model name for a voice ID (O(1) lookup)
   *
   * @param voiceId - Voice ID to look up
   * @returns Model name: 'flow_01_turbo' or 'flow_01_ex'
   * @throws Error if voice ID not found
   */
  getModelForVoice(voiceId: string): 'flow_01_turbo' | 'flow_01_ex' {
    this.init();

    // O(1) Set lookup for Turbo voices
    if (this.turboVoiceIds.has(voiceId)) {
      return 'flow_01_turbo';
    }

    // O(1) Set lookup for Ex voices
    if (this.exVoiceIds.has(voiceId)) {
      return 'flow_01_ex';
    }

    // Voice not found - throw error
    throw new Error(
      `Unknown voice ID: ${voiceId}. Use getVoices() to see available voices.`
    );
  }

  /**
   * Get voice metadata by ID (O(1) lookup)
   *
   * @param voiceId - Voice ID
   * @returns Voice metadata or undefined if not found
   */
  getVoice(voiceId: string): Voice | undefined {
    this.init();

    // O(1) Map lookup
    return this.turboVoiceMap.get(voiceId) ?? this.exVoiceMap.get(voiceId);
  }

  /**
   * Get all available voices
   *
   * @param includeExtended - Include extended (flow_01_ex) voices (default: true)
   * @returns Voice library with preset voices
   */
  getVoices(includeExtended = true): VoiceLibrary {
    this.init();

    const preset = includeExtended
      ? [...this.turboVoices, ...this.exVoices]
      : this.turboVoices;

    return {
      preset
    };
  }

  /**
   * Get standard (Turbo) voices only
   */
  getStandardVoices(): VoiceLibrary {
    return this.getVoices(false);
  }

  /**
   * Search voices by criteria
   *
   * @param query - Search query (matches name, description, language)
   * @param includeExtended - Include extended voices
   * @returns Matching voices
   */
  searchVoices(query: string, includeExtended = true): Voice[] {
    this.init();

    const allVoices = includeExtended
      ? [...this.turboVoices, ...this.exVoices]
      : this.turboVoices;

    const lowerQuery = query.toLowerCase();

    return allVoices.filter(voice => {
      return (
        voice.name.toLowerCase().includes(lowerQuery) ||
        voice.language.toLowerCase().includes(lowerQuery) ||
        voice.description?.toLowerCase().includes(lowerQuery)
      );
    });
  }

  /**
   * Get fallback voice (default when voice not specified)
   */
  getFallbackVoice(): Voice {
    this.init();
    // Return first Turbo voice as fallback (温柔姐姐 - Gentle Female)
    return this.turboVoices[0] || {
      id: 'v-female-R2s4N9qJ',
      name: '温柔姐姐',
      language: 'zh',
      description: 'Wenrou – Gentle Female'
    };
  }
}

// Export singleton instance
export const voiceResolver = new VoiceResolver();
