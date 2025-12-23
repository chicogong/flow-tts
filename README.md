# FlowTTS

> OpenAI-style TTS SDK for Tencent Cloud - Zero dependencies, TypeScript-first

English | [简体中文](./README_CN.md)

FlowTTS is a lightweight Text-to-Speech SDK that wraps Tencent Cloud's TRTC TTS API with an OpenAI-compatible interface.

## Features

✨ **OpenAI-Compatible** - Drop-in replacement for OpenAI TTS  
⚡ **Zero Dependencies** - Uses only built-in modules  
🎯 **TypeScript-First** - Full type safety  
🌊 **Streaming** - Real-time SSE streaming  
🎤 **Rich Voices** - 100+ preset voices  
🔍 **Auto-Detect** - Automatic language detection  

## Installation

```bash
npm install flow-tts
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
  voice: 'v-female-R2s4N9qJ'
});

await fs.writeFile('output.wav', response.audio);
```

## Documentation

See [packages/node/README.md](./packages/node/README.md) for full documentation.

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm --filter flow-tts build

# Run examples
cd packages/node
pnpm tsx examples/basic.ts
```

## License

MIT
