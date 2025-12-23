# FlowTTS

> OpenAI-style TTS SDK for Tencent Cloud - Zero dependencies, TypeScript-first

FlowTTS is a lightweight, zero-dependency Text-to-Speech SDK that wraps Tencent Cloud's TRTC TTS API with an OpenAI-compatible interface. Write elegant code with just a few lines.

## Features

✨ **OpenAI-Compatible API** - Drop-in replacement for OpenAI TTS
⚡ **Zero Dependencies** - Uses only Node.js built-ins
🎯 **TypeScript-First** - Full type safety out of the box
🌊 **Streaming Support** - SSE streaming for real-time audio
🎤 **Rich Voice Library** - 100+ preset voices in multiple languages
🔍 **Auto Language Detection** - Automatically detects text language
📦 **Dual Build** - Supports both ESM and CommonJS

## Installation

```bash
npm install flow-tts
# or
pnpm add flow-tts
# or
yarn add flow-tts
```

## Quick Start

```typescript
import { FlowTTS } from 'flow-tts';

const client = new FlowTTS({
  secretId: process.env.TX_SECRET_ID!,
  secretKey: process.env.TX_SECRET_KEY!,
  sdkAppId: parseInt(process.env.TRTC_SDK_APP_ID!)
});

// OpenAI-compatible API
const response = await client.audio.speech.create({
  text: '你好，世界！',
  voice: 'v-female-R2s4N9qJ',
  format: 'wav'
});

// Save to file
await fs.writeFile('output.wav', response.audio);
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
TX_SECRET_ID=your-tencent-cloud-secret-id
TX_SECRET_KEY=your-tencent-cloud-secret-key
TRTC_SDK_APP_ID=your-trtc-app-id
```

### Client Options

```typescript
interface FlowTTSConfig {
  secretId: string;      // Tencent Cloud Secret ID
  secretKey: string;     // Tencent Cloud Secret Key
  sdkAppId: number;      // TRTC SDK App ID
  region?: string;       // Region (default: 'ap-beijing')
}
```

## Usage Examples

### Basic Synthesis

```typescript
import { FlowTTS } from 'flow-tts';
import fs from 'fs/promises';

const client = new FlowTTS({
  secretId: process.env.TX_SECRET_ID!,
  secretKey: process.env.TX_SECRET_KEY!,
  sdkAppId: parseInt(process.env.TRTC_SDK_APP_ID!)
});

// Synthesize speech
const response = await client.synthesize({
  text: '你好，世界！',
  voice: 'v-female-R2s4N9qJ',
  format: 'wav',
  speed: 1.0,
  volume: 1.0
});

// Save to file
await fs.writeFile('output.wav', response.audio);
console.log(`Generated ${response.audio.length} bytes`);
```

### OpenAI-Compatible API

```typescript
// Drop-in replacement for OpenAI TTS
const response = await client.audio.speech.create({
  text: 'Hello, world!',
  voice: 'v-female-R2s4N9qJ',
  format: 'wav'
});

await fs.writeFile('speech.wav', response.audio);
```

### Streaming (SSE)

```typescript
// Stream audio in real-time
const chunks: Buffer[] = [];

for await (const chunk of client.synthesizeStream({
  text: '这是一段流式语音合成的示例文本。',
  voice: 'v-female-R2s4N9qJ'
})) {
  if (chunk.type === 'audio') {
    chunks.push(chunk.data!);
    console.log(`Received chunk ${chunk.sequence}`);
  } else if (chunk.type === 'end') {
    console.log(`Streaming completed! Total chunks: ${chunk.totalChunks}`);
  }
}

// Combine all chunks
const fullAudio = Buffer.concat(chunks);
await fs.writeFile('streaming.pcm', fullAudio);
```

### Voice Management

```typescript
// List all available voices
const { preset } = client.getVoices();
console.log(`Found ${preset.length} voices`);

// Search for voices
const gentleVoices = client.searchVoices('温柔');
console.log(gentleVoices); // [{ id: 'v-female-R2s4N9qJ', name: '温柔姐姐', ... }]

// Get specific voice
const voice = client.getVoice('v-female-R2s4N9qJ');
console.log(voice?.name); // '温柔姐姐'
```

### Language Auto-Detection

```typescript
// Chinese text - automatically detected
const zh = await client.synthesize({
  text: '你好，世界！',
  format: 'wav'
});
console.log(zh.detectedLanguage); // 'zh'
console.log(zh.autoDetected); // true

// English text - automatically detected
const en = await client.synthesize({
  text: 'Hello, world!',
  format: 'wav'
});
console.log(en.detectedLanguage); // 'en'

// Explicitly specify language
const explicit = await client.synthesize({
  text: 'こんにちは',
  language: 'ja',
  format: 'wav'
});
console.log(explicit.autoDetected); // false
```

## API Reference

### `FlowTTS` Class

#### Constructor

```typescript
new FlowTTS(config: FlowTTSConfig)
```

#### Methods

##### `synthesize(options: SynthesizeOptions): Promise<SynthesizeResponse>`

Synthesize speech from text (non-streaming).

**Options:**
- `text` (required): Text to synthesize
- `voice`: Voice ID (default: `'v-female-R2s4N9qJ'`)
- `language`: Language code (auto-detected if not specified)
- `format`: Audio format - `'pcm' | 'wav'` (default: `'wav'`)
- `speed`: Speech speed 0.5-2.0 (default: `1.0`)
- `volume`: Volume 0.5-2.0 (default: `1.0`)
- `pitch`: Pitch adjustment -12 to 12 (default: `0`)

**Returns:**
- `audio`: Audio data as Buffer
- `format`: Audio format
- `detectedLanguage`: Detected language (if auto-detected)
- `autoDetected`: Whether language was auto-detected
- `requestId`: Tencent Cloud request ID

##### `synthesizeStream(options: SynthesizeStreamOptions): AsyncIterableIterator<AudioChunk>`

Synthesize speech with SSE streaming.

**Options:** Same as `synthesize()` except `format` (always PCM for streaming)

**Yields:**
- `type: 'audio'`: Audio data chunk
  - `data`: Audio Buffer
  - `sequence`: Chunk number
- `type: 'end'`: End of stream
  - `totalChunks`: Total number of chunks
  - `requestId`: Request ID

##### `getVoices(includeExtended?: boolean): VoiceLibrary`

Get available voices.

**Parameters:**
- `includeExtended`: Include extended voices (default: `true`)

**Returns:**
- `preset`: Array of preset voices

##### `searchVoices(query: string, includeExtended?: boolean): Voice[]`

Search voices by name, description, or language.

##### `getVoice(voiceId: string): Voice | undefined`

Get voice metadata by ID.

### OpenAI-Compatible API

```typescript
client.audio.speech.create(options: SynthesizeOptions): Promise<SynthesizeResponse>
```

Identical to `client.synthesize()` but follows OpenAI's API naming convention.

## Audio Formats

### Supported Formats

- **WAV**: Lossless audio with headers (default, recommended)
- **PCM**: Raw 16-bit PCM audio at 24kHz (streaming default)

### Converting PCM to WAV

Streaming returns PCM format. Convert using ffmpeg:

```bash
# PCM to WAV
ffmpeg -f s16le -ar 24000 -ac 1 -i input.pcm output.wav
```

## Voice Library

FlowTTS includes 100+ preset voices across two models:

### Standard Voices (`flow_01_turbo`)
- Fast, low-latency synthesis
- High-quality natural voices
- Supports Chinese, English, Japanese, Korean

### Extended Voices (`flow_01_ex`)
- Extended voice library
- More voice options and styles
- Specialized character voices

### Popular Voices

| Voice ID | Name | Language | Description |
|----------|------|----------|-------------|
| `v-female-R2s4N9qJ` | 温柔姐姐 | zh | Gentle, warm female |
| `v-female-m1KpW7zE` | 傲娇学姐 | zh | Sassy, playful female |
| `v-male-Bk7vD3xP` | 威严霸总 | zh | Authoritative male |
| `v-female-U8aT2yLf` | 夹子女生 | zh | High-pitch cutesy female |

Use `client.getVoices()` to see all available voices.

## Error Handling

```typescript
import { FlowTTS, type TTSError } from 'flow-tts';

try {
  const response = await client.synthesize({
    text: 'Hello!',
    voice: 'invalid-voice-id'
  });
} catch (error) {
  const ttsError = error as TTSError;
  console.error('TTS Error:', ttsError.message);
  console.error('Code:', ttsError.code);
  console.error('Request ID:', ttsError.requestId);
  console.error('Status:', ttsError.statusCode);
}
```

## Migration from OpenAI TTS

FlowTTS is designed as a drop-in replacement:

```diff
- import OpenAI from 'openai';
+ import { FlowTTS } from 'flow-tts';

- const openai = new OpenAI({
-   apiKey: process.env.OPENAI_API_KEY
- });
+ const client = new FlowTTS({
+   secretId: process.env.TX_SECRET_ID,
+   secretKey: process.env.TX_SECRET_KEY,
+   sdkAppId: parseInt(process.env.TRTC_SDK_APP_ID)
+ });

- const response = await openai.audio.speech.create({
+ const response = await client.audio.speech.create({
    text: 'Hello!',
-   model: 'tts-1',
-   voice: 'alloy'
+   voice: 'v-female-R2s4N9qJ'
  });

- const buffer = Buffer.from(await response.arrayBuffer());
+ const buffer = response.audio;
```

## TypeScript Support

FlowTTS is written in TypeScript and provides full type definitions:

```typescript
import type {
  FlowTTSConfig,
  SynthesizeOptions,
  SynthesizeResponse,
  AudioChunk,
  Voice,
  VoiceLibrary,
  TTSError
} from 'flow-tts';
```

## Zero Dependencies

FlowTTS uses only Node.js built-in modules:
- `crypto` - TC3-HMAC-SHA256 signature
- `https` - API requests
- `fs` - File I/O for voice library
- `path` - Path resolution

No external dependencies = faster installs, smaller bundles, fewer security risks.

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or PR.

## Support

- GitHub Issues: https://github.com/chicogong/flow-tts/issues
- Documentation: https://github.com/chicogong/flow-tts

---

Made with ❤️ by the FlowTTS Team
