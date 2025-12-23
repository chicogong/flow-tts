/**
 * FlowTTS TypeScript Type Definitions
 * OpenAI-compatible TTS SDK for Tencent Cloud
 */

/**
 * Client configuration options
 */
export interface FlowTTSConfig {
  /** Tencent Cloud Secret ID */
  secretId: string;
  /** Tencent Cloud Secret Key */
  secretKey: string;
  /** TRTC SDK App ID */
  sdkAppId: number;
  /** Tencent Cloud region (default: 'ap-beijing') */
  region?: string;
}

/**
 * Voice metadata
 */
export interface Voice {
  /** Unique voice identifier (e.g., 'v-female-R2s4N9qJ') */
  id: string;
  /** Display name (e.g., '小芮') */
  name: string;
  /** Language code (ISO 639-1, e.g., 'zh-CN', 'en-US') */
  language: string;
  /** Voice description */
  description?: string;
  /** Voice category/tags */
  tags?: string[];
}

/**
 * Audio format options
 */
export type AudioFormat = 'pcm' | 'wav';

/**
 * Synthesis options for TTS requests
 */
export interface SynthesizeOptions {
  /** Text to synthesize (required) */
  text: string;
  /** Voice ID (default: 'v-female-R2s4N9qJ') */
  voice?: string;
  /** Language override (auto-detected if not specified) */
  language?: string;
  /** Audio format (default: 'wav') */
  format?: AudioFormat;
  /** Speech speed ratio (0.5 - 2.0, default: 1.0) */
  speed?: number;
  /** Volume ratio (0.5 - 2.0, default: 1.0) */
  volume?: number;
  /** Pitch adjustment (-12 to 12 semitones, default: 0) */
  pitch?: number;
}

/**
 * Non-streaming synthesis response
 */
export interface SynthesizeResponse {
  /** Audio data as Buffer */
  audio: Buffer;
  /** Audio format */
  format: AudioFormat;
  /** Detected language (if auto-detected) */
  detectedLanguage?: string;
  /** Whether language was auto-detected */
  autoDetected?: boolean;
  /** Tencent Cloud request ID */
  requestId: string;
}

/**
 * Streaming audio chunk
 */
export interface AudioChunk {
  /** Chunk type: 'audio' or 'end' */
  type: 'audio' | 'end';
  /** Audio data (base64 or Buffer) */
  data?: Buffer;
  /** Chunk sequence number */
  sequence?: number;
  /** Total chunks (only in 'end' type) */
  totalChunks?: number;
  /** Request ID (only in 'end' type) */
  requestId?: string;
}

/**
 * Streaming synthesis options
 */
export interface SynthesizeStreamOptions extends Omit<SynthesizeOptions, 'format'> {
  /** Streaming always returns PCM format */
  format?: 'pcm';
}

/**
 * Voice library response
 */
export interface VoiceLibrary {
  /** Preset voices */
  preset: Voice[];
  /** Cloned/custom voices (if any) */
  cloned?: Voice[];
}

/**
 * Error response from Tencent Cloud API
 */
export interface TTSError extends Error {
  /** Error code from Tencent Cloud */
  code?: string;
  /** Request ID for debugging */
  requestId?: string;
  /** HTTP status code */
  statusCode?: number;
}

/**
 * Internal Tencent Cloud API parameters
 * @internal
 */
export interface TencentAPIParams {
  SdkAppId: number;
  Text: string;
  Model: 'flow_01_turbo' | 'flow_01_ex';
  Voice: {
    VoiceId: string;
    Speed?: number;
    Volume?: number;
    Pitch?: number;
  };
  AudioFormat?: {
    Format: 'pcm' | 'wav';
    SampleRate: number;
  };
  Language?: string;
}

/**
 * Internal TC3 signature result
 * @internal
 */
export interface TC3Signature {
  /** Authorization header value */
  authorization: string;
  /** All required headers */
  headers: {
    'Content-Type': string;
    'Host': string;
    'X-TC-Action': string;
    'X-TC-Timestamp': string;
    'X-TC-Version': string;
    'X-TC-Region': string;
    'Authorization': string;
  };
}
