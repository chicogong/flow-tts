# FlowTTS

[![Node.js CI](https://github.com/chicogong/flow-tts/actions/workflows/node-ci.yml/badge.svg)](https://github.com/chicogong/flow-tts/actions/workflows/node-ci.yml)
[![Python CI](https://github.com/chicogong/flow-tts/actions/workflows/python-ci.yml/badge.svg)](https://github.com/chicogong/flow-tts/actions/workflows/python-ci.yml)
[![Go CI](https://github.com/chicogong/flow-tts/actions/workflows/go-ci.yml/badge.svg)](https://github.com/chicogong/flow-tts/actions/workflows/go-ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 腾讯云 TTS 的 OpenAI 风格 SDK - 简单、优雅、多语言支持

[English](./README.md) | 简体中文

FlowTTS 是一个轻量级文本转语音 SDK，使用 OpenAI 兼容的接口封装了腾讯云 TRTC TTS API。提供 **Node.js**、**Python** 和 **Go** 三种语言实现。

## ✨ 特性

- 🎯 **OpenAI 兼容 API** - 可直接替换 OpenAI TTS
- 🌍 **多语言 SDK** - Node.js、Python 和 Go 实现
- ⚡ **零依赖** - 仅使用标准库
- 🔷 **类型安全** - 完整的 TypeScript、Python 类型提示和 Go 静态类型
- 🌊 **流式支持** - 实时音频流式传输
- 🎤 **丰富的音色库** - 380+ 预设音色，支持多种语言
- 🔍 **自动语言检测** - 自动识别文本语言

## 📦 安装

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

## 🚀 快速开始

### Node.js

```typescript
import { FlowTTS } from 'flow-tts';

const client = new FlowTTS({
  secretId: process.env.TX_SECRET_ID!,
  secretKey: process.env.TX_SECRET_KEY!,
  sdkAppId: parseInt(process.env.TRTC_SDK_APP_ID!)
});

// OpenAI 兼容 API
const response = await client.audio.speech.create({
  text: '你好，世界！',
  voice: 'v-female-R2s4N9qJ'
});

await fs.writeFile('output.wav', response.audio);
```

### Python

```python
from flow_tts import FlowTTS

client = FlowTTS({
    "secret_id": "你的-secret-id",
    "secret_key": "你的-secret-key",
    "sdk_app_id": 1400000000
})

# 合成语音
response = client.synthesize({
    "text": "你好，世界！",
    "voice": "v-female-R2s4N9qJ",
    "format": "wav"
})

# 保存到文件
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

## 📚 文档

- [Node.js SDK 文档](./packages/node/README.md)
- [Python SDK 文档](./packages/python/README.md)
- [Go SDK 文档](./packages/go/README.md)

## 🎤 音色库

SDK 提供 **380+ 预设音色**：
- 77 个 Turbo 音色（低延迟）
- 303 个扩展音色（高质量）

### 推荐音色

| 音色 ID | 名称 | 语言 | 特点 |
|---------|------|------|------|
| `v-female-R2s4N9qJ` | 温柔姐姐 | 中文 | 温柔、温暖 |
| `v-male-Bk7vD3xP` | 威严霸总 | 中文 | 成熟、稳重 |
| `v-female-p9Xy7Q1L` | 清晰女旁白 | 英文 | 清晰、专业 |

## 🌊 流式支持

所有 SDK 都支持实时流式传输：

**Node.js:**
```typescript
for await (const chunk of client.synthesizeStream({ text: '...' })) {
  if (chunk.type === 'audio') {
    console.log(`收到 ${chunk.data.length} 字节`);
  }
}
```

**Python:**
```python
for chunk in client.synthesize_stream({"text": "..."}):
    if chunk["type"] == "audio":
        print(f"收到 {len(chunk['data'])} 字节")
```

**Go:**
```go
chunkChan, _ := client.SynthesizeStream(flowtts.SynthesizeOptions{Text: "..."})
for chunk := range chunkChan {
    if chunk.Type == "audio" {
        fmt.Printf("收到 %d 字节\n", len(chunk.Data))
    }
}
```

## ⚙️ 配置

所有 SDK 都需要相同的凭证：

```bash
TX_SECRET_ID=你的腾讯云密钥ID
TX_SECRET_KEY=你的腾讯云密钥Key
TRTC_SDK_APP_ID=你的TRTC应用ID
```

## 🔧 开发

```bash
# 安装依赖 (Node.js)
pnpm install

# 构建 Node.js SDK
pnpm --filter flow-tts build

# 测试 Python SDK
cd packages/python && pytest

# 测试 Go SDK
cd packages/go && go test ./...
```

## 📊 SDK 对比

| 功能 | Node.js | Python | Go |
|------|---------|--------|-----|
| 零依赖 | ✅ | ✅ | ✅ |
| 类型安全 | TypeScript | 类型提示 | 静态类型 |
| 流式传输 | ✅ | ✅ | ✅ |
| 音色库 | 380+ | 380+ | 380+ |
| OpenAI 兼容 | ✅ | ✅ | ✅ |
| 包管理器 | npm | PyPI | go get |

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 链接

- **GitHub**: [chicogong/flow-tts](https://github.com/chicogong/flow-tts)
- **npm**: [flow-tts](https://www.npmjs.com/package/flow-tts)
- **PyPI**: [flow-tts](https://pypi.org/project/flow-tts/)
- **Go Package**: [github.com/chicogong/flow-tts/go](https://pkg.go.dev/github.com/chicogong/flow-tts/go)

## 🙏 致谢

基于腾讯云 TRTC TTS API 构建。
