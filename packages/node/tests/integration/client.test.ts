/**
 * Integration Tests for FlowTTS Client
 * These tests require valid Tencent Cloud credentials
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { FlowTTS } from '../../src/client.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const hasCredentials = !!(
  process.env.TX_SECRET_ID &&
  process.env.TX_SECRET_KEY &&
  process.env.TRTC_SDK_APP_ID
);

describe.skipIf(!hasCredentials)('FlowTTS Client Integration', () => {
  let client: FlowTTS;

  beforeAll(() => {
    client = new FlowTTS({
      secretId: process.env.TX_SECRET_ID!,
      secretKey: process.env.TX_SECRET_KEY!,
      sdkAppId: parseInt(process.env.TRTC_SDK_APP_ID!)
    });
  });

  describe('Constructor', () => {
    it('throws error for missing credentials', () => {
      expect(() => new FlowTTS({
        secretId: '',
        secretKey: '',
        sdkAppId: 0
      })).toThrow();
    });

    it('throws error for invalid sdkAppId', () => {
      expect(() => new FlowTTS({
        secretId: 'test',
        secretKey: 'test',
        sdkAppId: -1
      })).toThrow('Invalid sdkAppId');
    });
  });

  describe('Voice Management', () => {
    it('getVoices returns voice library', () => {
      const { preset } = client.getVoices();
      expect(preset).toBeInstanceOf(Array);
      expect(preset.length).toBeGreaterThan(0);
    });

    it('searchVoices finds matching voices', () => {
      const voices = client.searchVoices('温柔');
      expect(voices).toBeInstanceOf(Array);
      expect(voices.length).toBeGreaterThan(0);
    });

    it('getVoice returns voice metadata', () => {
      const voice = client.getVoice('v-female-R2s4N9qJ');
      expect(voice).toBeDefined();
      expect(voice?.id).toBe('v-female-R2s4N9qJ');
    });
  });

  describe('Non-Streaming Synthesis', () => {
    it('synthesizes Chinese text to WAV', async () => {
      const response = await client.synthesize({
        text: '你好，世界',
        format: 'wav'
      });

      expect(response.audio).toBeInstanceOf(Buffer);
      expect(response.audio.length).toBeGreaterThan(0);
      expect(response.format).toBe('wav');
      expect(response.requestId).toBeDefined();
    }, 30000);

    it('synthesizes English text to WAV', async () => {
      const response = await client.synthesize({
        text: 'Hello, world',
        format: 'wav'
      });

      expect(response.audio).toBeInstanceOf(Buffer);
      expect(response.audio.length).toBeGreaterThan(0);
      expect(response.format).toBe('wav');
    }, 30000);

    it('throws error for empty text', async () => {
      await expect(client.synthesize({ text: '' }))
        .rejects.toThrow('Text cannot be empty');
    });

    it('throws error for invalid speed', async () => {
      await expect(client.synthesize({ text: 'test', speed: 3.0 }))
        .rejects.toThrow('Speed must be between 0.5 and 2.0');
    });

    it('throws error for invalid volume', async () => {
      await expect(client.synthesize({ text: 'test', volume: 3.0 }))
        .rejects.toThrow('Volume must be between 0.5 and 2.0');
    });

    it('throws error for invalid pitch', async () => {
      await expect(client.synthesize({ text: 'test', pitch: 20 }))
        .rejects.toThrow('Pitch must be between -12 and 12 semitones');
    });
  });

  describe('Streaming Synthesis', () => {
    it('synthesizes text with streaming', async () => {
      const chunks: Buffer[] = [];

      for await (const chunk of client.synthesizeStream({
        text: '这是测试文本'
      })) {
        if (chunk.type === 'audio' && chunk.data) {
          chunks.push(chunk.data);
        }
      }

      expect(chunks.length).toBeGreaterThan(0);
      const totalSize = chunks.reduce((sum, buf) => sum + buf.length, 0);
      expect(totalSize).toBeGreaterThan(0);
    }, 60000);

    it('throws error for empty text', async () => {
      const iterator = client.synthesizeStream({ text: '' });
      await expect(iterator.next()).rejects.toThrow('Text cannot be empty');
    });
  });

  describe('OpenAI-compatible API', () => {
    it('audio.speech.create works', async () => {
      const response = await client.audio.speech.create({
        text: '测试OpenAI兼容API',
        format: 'wav'
      });

      expect(response.audio).toBeInstanceOf(Buffer);
      expect(response.audio.length).toBeGreaterThan(0);
    }, 30000);
  });
});

describe('FlowTTS Client (No Credentials)', () => {
  it('constructor validates credentials', () => {
    expect(() => new FlowTTS({
      secretId: '',
      secretKey: '',
      sdkAppId: 0
    })).toThrow();
  });

  it('getVoices works without credentials', () => {
    const client = new FlowTTS({
      secretId: 'test',
      secretKey: 'test',
      sdkAppId: 123456
    });

    const { preset } = client.getVoices();
    expect(preset).toBeInstanceOf(Array);
    expect(preset.length).toBeGreaterThan(0);
  });
});
