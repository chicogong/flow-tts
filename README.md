# FlowTTS

[![Node.js CI](https://github.com/chicogong/flow-tts/actions/workflows/node-ci.yml/badge.svg)](https://github.com/chicogong/flow-tts/actions/workflows/node-ci.yml)
[![Python CI](https://github.com/chicogong/flow-tts/actions/workflows/python-ci.yml/badge.svg)](https://github.com/chicogong/flow-tts/actions/workflows/python-ci.yml)
[![Go CI](https://github.com/chicogong/flow-tts/actions/workflows/go-ci.yml/badge.svg)](https://github.com/chicogong/flow-tts/actions/workflows/go-ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> OpenAI-style TTS SDK for Tencent Cloud - Simple, elegant, multi-language

English | [简体中文](./README_CN.md)

FlowTTS is a lightweight Text-to-Speech SDK that wraps Tencent Cloud's TRTC TTS API with an OpenAI-compatible interface. Available in **Node.js**, **Python**, **Go**, and **Java**.

## 🎮 Try it Now

Experience FlowTTS instantly without any setup:

| Platform | Link | Description |
|----------|------|-------------|
| Hugging Face | [gonghaoran/flow-tts](https://huggingface.co/spaces/gonghaoran/flow-tts) | Free Gradio demo |
| Streamlit | [flowtts.streamlit.app](https://flowtts.streamlit.app) | Interactive demo |
| Replicate | [chicogong/flow-tts](https://replicate.com/chicogong/flow-tts) | API + Playground |

> **BYOK (Bring Your Own Key)**: You need your own Tencent Cloud credentials to use these demos.
> See [flowtts-byok](https://github.com/chicogong/flowtts-byok) for deployment guides.

## ✨ Features

- 🎯 **OpenAI-Compatible API** - Drop-in replacement for OpenAI TTS
- 🌍 **Multi-Language SDKs** - Node.js, Python, and Go implementations
- ⚡ **Zero Dependencies** - Uses only built-in libraries
- 🔷 **Type-Safe** - Full TypeScript, Python type hints, and Go static typing
- 🌊 **Streaming Support** - Real-time audio streaming
- 🎤 **Rich Voice Library** - 380+ preset voices in multiple languages
- 🔍 **Auto Language Detection** - Automatically detects text language

## 📦 Installation

### Node.js

```bash
npm install flow-tts
```

### Python

```bash
pip install flow-tts
```

### Go

```bash
go get github.com/chicogong/flow-tts/go
```

## 🚀 Quick Start

### Node.js

```typescript
import { FlowTTS } from 'flow-tts';

const client = new FlowTTS({
  secretId: process.env.TX_SECRET_ID!,
  secretKey: process.env.TX_SECRET_KEY!,
  sdkAppId: parseInt(process.env.TRTC_SDK_APP_ID!)
});

// OpenAI-compatible API
const response = await client.audio.speech.create({
  text: 'Hello, world!',
  voice: 'v-female-R2s4N9qJ'
});

await fs.writeFile('output.wav', response.audio);
```

### Python

```python
from flow_tts import FlowTTS

client = FlowTTS({
    "secret_id": "your-secret-id",
    "secret_key": "your-secret-key",
    "sdk_app_id": 1400000000
})

# Synthesize speech
response = client.synthesize({
    "text": "你好，世界！",
    "voice": "v-female-R2s4N9qJ",
    "format": "wav"
})

# Save to file
with open("output.wav", "wb") as f:
    f.write(response["audio"])
```

### Go

```go
package main

import (
    "os"
    flowtts "github.com/chicogong/flow-tts/go"
)

func main() {
    client, _ := flowtts.NewClient(flowtts.Config{
        SecretID:  os.Getenv("TX_SECRET_ID"),
        SecretKey: os.Getenv("TX_SECRET_KEY"),
        SdkAppID:  1400000000,
    })

    response, _ := client.Synthesize(flowtts.SynthesizeOptions{
        Text:   "你好，世界！",
        Voice:  "v-female-R2s4N9qJ",
        Format: flowtts.AudioFormatWAV,
    })

    os.WriteFile("output.wav", response.Audio, 0644)
}
```

## 📚 Documentation

- [Node.js SDK Documentation](./packages/node/README.md)
- [Python SDK Documentation](./packages/python/README.md)
- [Go SDK Documentation](./packages/go/README.md)

## 🎤 Voice Library

The SDK provides **380+ preset voices**:
- 77 Turbo voices (low latency)
- 303 Extended voices (high quality)

### Recommended Voices

| Voice ID | Name | Language | Features |
|---------|------|---------|----------|
| `v-female-R2s4N9qJ` | 温柔姐姐 | Chinese | Gentle, Warm |
| `v-male-Bk7vD3xP` | 威严霸总 | Chinese | Mature, Steady |
| `v-female-p9Xy7Q1L` | 清晰女旁白 | English | Clear, Professional |

## 🌊 Streaming Support

All SDKs support real-time streaming:

**Node.js:**
```typescript
for await (const chunk of client.synthesizeStream({ text: '...' })) {
  if (chunk.type === 'audio') {
    console.log(`Received ${chunk.data.length} bytes`);
  }
}
```

**Python:**
```python
for chunk in client.synthesize_stream({"text": "..."}):
    if chunk["type"] == "audio":
        print(f"Received {len(chunk['data'])} bytes")
```

**Go:**
```go
chunkChan, _ := client.SynthesizeStream(flowtts.SynthesizeOptions{Text: "..."})
for chunk := range chunkChan {
    if chunk.Type == "audio" {
        fmt.Printf("Received %d bytes\n", len(chunk.Data))
    }
}
```

## ⚙️ Configuration

All SDKs require the same credentials:

```bash
TX_SECRET_ID=your-tencent-cloud-secret-id
TX_SECRET_KEY=your-tencent-cloud-secret-key
TRTC_SDK_APP_ID=your-trtc-app-id
```

## 🔧 Development

```bash
# Install dependencies (Node.js)
pnpm install

# Build Node.js SDK
pnpm --filter flow-tts build

# Test Python SDK
cd packages/python && pytest

# Test Go SDK
cd packages/go && go test ./...
```

## 📊 SDK Comparison

| Feature | Node.js | Python | Go |
|---------|---------|--------|-----|
| Zero Dependencies | ✅ | ✅ | ✅ |
| Type Safety | TypeScript | Type Hints | Static Types |
| Streaming | ✅ | ✅ | ✅ |
| Voice Library | 380+ | 380+ | 380+ |
| OpenAI Compatible | ✅ | ✅ | ✅ |
| Package Manager | npm | PyPI | go get |

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📮 Links

- **Live Demo**: [Hugging Face Space](https://huggingface.co/spaces/gonghaoran/flow-tts)
- **BYOK Guide**: [flowtts-byok](https://github.com/chicogong/flowtts-byok)
- **GitHub**: [chicogong/flow-tts](https://github.com/chicogong/flow-tts)
- **npm**: [flow-tts](https://www.npmjs.com/package/flow-tts)
- **PyPI**: [flow-tts](https://pypi.org/project/flow-tts/)
- **Go Package**: [github.com/chicogong/flow-tts/go](https://pkg.go.dev/github.com/chicogong/flow-tts/go)

## 🙏 Acknowledgments

Built on top of Tencent Cloud TRTC TTS API.
