/**
 * FlowTTS - OpenAI-style TTS SDK for Tencent Cloud
 * Zero dependencies, TypeScript-first
 *
 * @example
 * ```typescript
 * import { FlowTTS } from 'flow-tts';
 *
 * const client = new FlowTTS({
 *   secretId: process.env.TX_SECRET_ID!,
 *   secretKey: process.env.TX_SECRET_KEY!,
 *   sdkAppId: parseInt(process.env.TRTC_SDK_APP_ID!)
 * });
 *
 * // OpenAI-compatible API
 * const response = await client.audio.speech.create({
 *   text: '你好，世界！',
 *   voice: 'v-female-R2s4N9qJ',
 *   format: 'wav'
 * });
 *
 * // Or use direct method
 * const response = await client.synthesize({
 *   text: 'Hello, world!',
 *   voice: 'v-female-R2s4N9qJ'
 * });
 * ```
 */

// Export main client
export { FlowTTS, createClient } from './client.js';

// Export types
export type {
  FlowTTSConfig,
  SynthesizeOptions,
  SynthesizeResponse,
  SynthesizeStreamOptions,
  AudioChunk,
  Voice,
  VoiceLibrary,
  AudioFormat,
  TTSError
} from './types.js';

// Export utilities
export { detectLanguage, detectLanguages, containsCJK } from './utils/language-detector.js';
export { voiceResolver } from './utils/voice-resolver.js';

// Default export
export { FlowTTS as default } from './client.js';
