/**
 * FlowTTS Client
 * OpenAI-style TTS SDK for Tencent Cloud
 */

import { buildTC3Signature } from './core/signature.js';
import { makeRequest, makeStreamRequest } from './core/request.js';
import { voiceResolver } from './utils/voice-resolver.js';
import { detectLanguage } from './utils/language-detector.js';
import type {
  FlowTTSConfig,
  SynthesizeOptions,
  SynthesizeResponse,
  SynthesizeStreamOptions,
  AudioChunk,
  Voice,
  VoiceLibrary,
  TencentAPIParams
} from './types.js';

/**
 * Internal API response for TextToSpeech
 */
interface TextToSpeechResponse {
  Audio: string; // Base64-encoded PCM audio
  RequestId: string;
}

/**
 * FlowTTS Client Class
 */
export class FlowTTS {
  private secretId: string;
  private secretKey: string;
  private sdkAppId: number;
  private region: string;

  /**
   * OpenAI-compatible audio.speech API
   */
  public audio = {
    speech: {
      /**
       * Create speech from text (OpenAI-compatible)
       * @param options - Synthesis options
       * @returns Synthesis response with audio buffer
       */
      create: async (options: SynthesizeOptions): Promise<SynthesizeResponse> => {
        return this.synthesize(options);
      }
    }
  };

  /**
   * Initialize FlowTTS client
   *
   * @param config - Client configuration
   *
   * @example
   * ```typescript
   * const client = new FlowTTS({
   *   secretId: 'your-secret-id',
   *   secretKey: 'your-secret-key',
   *   sdkAppId: 123456789,
   *   region: 'ap-beijing' // optional
   * });
   * ```
   */
  constructor(config: FlowTTSConfig) {
    if (!config.secretId || !config.secretKey) {
      throw new Error('Missing required credentials: secretId and secretKey');
    }

    if (!config.sdkAppId || config.sdkAppId <= 0) {
      throw new Error('Invalid sdkAppId: must be a positive integer');
    }

    this.secretId = config.secretId;
    this.secretKey = config.secretKey;
    this.sdkAppId = config.sdkAppId;
    this.region = config.region || 'ap-beijing';
  }

  /**
   * Synthesize speech from text (non-streaming)
   *
   * @param options - Synthesis options
   * @returns Synthesis response with audio buffer
   *
   * @example
   * ```typescript
   * const response = await client.synthesize({
   *   text: '你好，世界！',
   *   voice: 'v-female-R2s4N9qJ',
   *   format: 'wav'
   * });
   *
   * // Save to file
   * await fs.writeFile('output.wav', response.audio);
   * ```
   */
  async synthesize(options: SynthesizeOptions): Promise<SynthesizeResponse> {
    const {
      text,
      voice = 'v-female-R2s4N9qJ',
      language,
      format = 'wav',
      speed = 1.0,
      volume = 1.0,
      pitch = 0
    } = options;

    // Validate required parameters
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    // Validate parameter ranges
    if (speed < 0.5 || speed > 2.0) {
      throw new Error('Speed must be between 0.5 and 2.0');
    }
    if (volume < 0.5 || volume > 2.0) {
      throw new Error('Volume must be between 0.5 and 2.0');
    }
    if (pitch < -12 || pitch > 12) {
      throw new Error('Pitch must be between -12 and 12 semitones');
    }

    // Get model for voice (O(1) lookup)
    const model = voiceResolver.getModelForVoice(voice);

    // Auto-detect language if not specified
    const detectedLanguage = language || detectLanguage(text, 'zh');

    // Build API parameters
    const params: TencentAPIParams = {
      SdkAppId: this.sdkAppId,
      Text: text,
      Model: model,
      Voice: {
        VoiceId: voice,
        Speed: speed,
        Volume: volume,
        Pitch: pitch
      },
      AudioFormat: {
        Format: format === 'pcm' ? 'pcm' : format,
        SampleRate: 24000
      },
      Language: detectedLanguage
    };

    const payload = JSON.stringify(params);

    // Build TC3 signature
    const { headers } = buildTC3Signature(
      'TextToSpeech',
      this.region,
      payload,
      this.secretId,
      this.secretKey
    );

    // Make API request
    const response = await makeRequest<TextToSpeechResponse>(headers, payload);

    // Decode base64 audio to Buffer
    const audioBuffer = Buffer.from(response.Audio, 'base64');

    return {
      audio: audioBuffer,
      format: format,
      detectedLanguage: language ? undefined : detectedLanguage,
      autoDetected: !language,
      requestId: response.RequestId
    };
  }

  /**
   * Synthesize speech with SSE streaming
   *
   * @param options - Streaming synthesis options
   * @returns Async iterator of audio chunks
   *
   * @example
   * ```typescript
   * for await (const chunk of client.synthesizeStream({ text: '你好' })) {
   *   if (chunk.type === 'audio') {
   *     process.stdout.write(chunk.data);
   *   }
   * }
   * ```
   */
  async *synthesizeStream(
    options: SynthesizeStreamOptions
  ): AsyncIterableIterator<AudioChunk> {
    const {
      text,
      voice = 'v-female-R2s4N9qJ',
      language,
      speed = 1.0,
      volume = 1.0,
      pitch = 0
    } = options;

    // Validate required parameters
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    // Validate parameter ranges
    if (speed < 0.5 || speed > 2.0) {
      throw new Error('Speed must be between 0.5 and 2.0');
    }
    if (volume < 0.5 || volume > 2.0) {
      throw new Error('Volume must be between 0.5 and 2.0');
    }
    if (pitch < -12 || pitch > 12) {
      throw new Error('Pitch must be between -12 and 12 semitones');
    }

    // Get model for voice
    const model = voiceResolver.getModelForVoice(voice);

    // Auto-detect language
    const detectedLanguage = language || detectLanguage(text, 'zh');

    // Build API parameters (streaming doesn't support AudioFormat)
    const params = {
      SdkAppId: this.sdkAppId,
      Text: text,
      Model: model,
      Voice: {
        VoiceId: voice,
        Speed: speed,
        Volume: volume,
        Pitch: pitch
      },
      Language: detectedLanguage
    };

    const payload = JSON.stringify(params);

    // Build TC3 signature for SSE endpoint
    const { headers } = buildTC3Signature(
      'TextToSpeechSSE',
      this.region,
      payload,
      this.secretId,
      this.secretKey
    );

    // Collect chunks for yielding
    const chunks: AudioChunk[] = [];

    // Make streaming request
    await makeStreamRequest(headers, payload, (chunk) => {
      // Parse chunk based on Tencent SSE format
      // Fields: Type, Audio, ChunkId, RequestId
      if (chunk.Type === 'audio' && chunk.Audio) {
        chunks.push({
          type: 'audio',
          data: Buffer.from(chunk.Audio, 'base64'),
          sequence: chunks.length // Use array length as sequence
        });
      } else if (chunk.Type === 'end') {
        chunks.push({
          type: 'end',
          totalChunks: chunks.length,
          requestId: chunk.RequestId
        });
      }
    });

    // Yield all collected chunks
    for (const chunk of chunks) {
      yield chunk;
    }
  }

  /**
   * Get available voices
   *
   * @param includeExtended - Include extended (flow_01_ex) voices (default: true)
   * @returns Voice library with preset voices
   *
   * @example
   * ```typescript
   * const { preset } = await client.getVoices();
   * console.log(preset); // Array of Voice objects
   * ```
   */
  getVoices(includeExtended = true): VoiceLibrary {
    return voiceResolver.getVoices(includeExtended);
  }

  /**
   * Search voices by query
   *
   * @param query - Search query (matches name, description, language)
   * @param includeExtended - Include extended voices
   * @returns Array of matching voices
   *
   * @example
   * ```typescript
   * const voices = client.searchVoices('温柔');
   * console.log(voices); // [{ id: 'v-female-R2s4N9qJ', name: '温柔姐姐', ... }]
   * ```
   */
  searchVoices(query: string, includeExtended = true): Voice[] {
    return voiceResolver.searchVoices(query, includeExtended);
  }

  /**
   * Get voice metadata by ID
   *
   * @param voiceId - Voice ID
   * @returns Voice metadata or undefined if not found
   */
  getVoice(voiceId: string): Voice | undefined {
    return voiceResolver.getVoice(voiceId);
  }
}

/**
 * Create a new FlowTTS client instance
 *
 * @param config - Client configuration
 * @returns FlowTTS client instance
 *
 * @example
 * ```typescript
 * import { createClient } from 'flow-tts';
 *
 * const client = createClient({
 *   secretId: process.env.TX_SECRET_ID!,
 *   secretKey: process.env.TX_SECRET_KEY!,
 *   sdkAppId: parseInt(process.env.TRTC_SDK_APP_ID!)
 * });
 * ```
 */
export function createClient(config: FlowTTSConfig): FlowTTS {
  return new FlowTTS(config);
}
