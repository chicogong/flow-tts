# FlowTTS Go SDK

[![Go Version](https://img.shields.io/badge/Go-1.20%2B-blue)](https://golang.org/dl/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> OpenAI-style TTS SDK for Tencent Cloud - Simple, elegant, Go-first

[English](#english) | [简体中文](#简体中文)

---

## English

FlowTTS is a lightweight Text-to-Speech SDK that wraps Tencent Cloud's TRTC TTS API with an OpenAI-compatible interface. Write elegant code with just a few lines.

### ✨ Features

- 🎯 **OpenAI-Compatible API** - Drop-in replacement for OpenAI TTS
- 🔷 **Type-Safe** - Full type safety with Go's static typing
- 🎤 **Rich Voice Library** - 380+ preset voices in multiple languages
- 🔍 **Auto Language Detection** - Automatically detects text language
- 📦 **Zero Dependencies** - Uses only Go standard library
- 🚀 **Streaming Support** - Real-time audio streaming

### 📦 Installation

```bash
go get github.com/chicogong/flow-tts/go
```

### 🚀 Quick Start

```go
package main

import (
    "log"
    "os"

    flowtts "github.com/chicogong/flow-tts/go"
)

func main() {
    // Create client
    client, err := flowtts.NewClient(flowtts.Config{
        SecretID:  os.Getenv("TX_SECRET_ID"),
        SecretKey: os.Getenv("TX_SECRET_KEY"),
        SdkAppID:  1400000000,
    })
    if err != nil {
        log.Fatal(err)
    }

    // Synthesize speech
    response, err := client.Synthesize(flowtts.SynthesizeOptions{
        Text:   "你好，世界！",
        Voice:  "v-female-R2s4N9qJ",
        Format: flowtts.AudioFormatWAV,
    })
    if err != nil {
        log.Fatal(err)
    }

    // Save to file
    os.WriteFile("output.wav", response.Audio, 0644)
}
```

### ⚙️ Configuration

#### Environment Variables

Create a `.env` file:

```env
TX_SECRET_ID=your-tencent-cloud-secret-id
TX_SECRET_KEY=your-tencent-cloud-secret-key
TRTC_SDK_APP_ID=your-trtc-app-id
```

#### Client Config

```go
config := flowtts.Config{
    SecretID:  "...",           // Tencent Cloud Secret ID
    SecretKey: "...",           // Tencent Cloud Secret Key
    SdkAppID:  1400000000,      // TRTC SDK App ID
    Region:    "ap-beijing",    // Region (optional)
}
```

### 📖 Voice Management

```go
// Get all available voices
voices, err := client.GetVoices(true)
log.Printf("Total voices: %d\n", len(voices.Preset))

// Search voices
gentleVoices, err := client.SearchVoices("温柔")
log.Printf("Found %d gentle voices\n", len(gentleVoices))

// Get specific voice info
voice, err := client.GetVoice("v-female-R2s4N9qJ")
log.Printf("Voice name: %s\n", voice.Name) // "温柔姐姐"
```

### 🎤 Voice Selection

The SDK provides 380+ preset voices:
- 77 Turbo voices (low latency)
- 303 Extended voices (high quality)

#### Recommended Voices

| Voice ID | Name | Language | Features |
|---------|------|---------|----------|
| `v-female-R2s4N9qJ` | 温柔姐姐 | Chinese | Gentle, Warm |
| `v-male-Bk7vD3xP` | 威严霸总 | Chinese | Mature, Steady |
| `v-female-p9Xy7Q1L` | 清晰女旁白 | English | Clear, Professional |

### 🌊 Streaming

```go
// Start streaming synthesis
chunkChan, err := client.SynthesizeStream(flowtts.SynthesizeOptions{
    Text:  "你好，世界！",
    Voice: "v-female-R2s4N9qJ",
})
if err != nil {
    log.Fatal(err)
}

// Process chunks
for chunk := range chunkChan {
    switch chunk.Type {
    case "audio":
        // Handle audio chunk
        log.Printf("Received %d bytes\n", len(chunk.Data))
    case "end":
        log.Printf("Stream complete\n")
    }
}
```

### 📚 Examples

- [Basic Synthesis](./examples/basic/main.go) - Simple text-to-speech
- [Streaming](./examples/stream/main.go) - Real-time streaming synthesis

### 📄 License

MIT License - see [LICENSE](../../LICENSE) file

### 🤝 Contributing

Issues and Pull Requests are welcome!

### 📮 Links

- GitHub: [chicogong/flow-tts](https://github.com/chicogong/flow-tts)
- Python SDK: [PyPI/flow-tts](https://pypi.org/project/flow-tts/)
- Node.js SDK: [npm/flow-tts](https://www.npmjs.com/package/flow-tts)

### 🙏 Acknowledgments

Built on top of Tencent Cloud TRTC TTS API.

---

## 简体中文

FlowTTS 是一个轻量级的文本转语音 SDK，它封装了腾讯云 TRTC TTS API，提供 OpenAI 兼容的接口。用几行代码就能写出优雅的应用。

### ✨ 特性

- 🎯 **OpenAI 兼容 API** - 可直接替换 OpenAI TTS
- 🔷 **类型安全** - Go 静态类型完全支持
- 🎤 **丰富的音色库** - 380+ 预设音色，支持多语言
- 🔍 **自动语言检测** - 自动检测文本语言
- 📦 **零依赖** - 仅使用 Go 标准库
- 🚀 **流式支持** - 实时音频流式传输

### 📦 安装

```bash
go get github.com/chicogong/flow-tts/go
```

### 🚀 快速开始

```go
package main

import (
    "log"
    "os"

    flowtts "github.com/chicogong/flow-tts/go"
)

func main() {
    // 创建客户端
    client, err := flowtts.NewClient(flowtts.Config{
        SecretID:  os.Getenv("TX_SECRET_ID"),
        SecretKey: os.Getenv("TX_SECRET_KEY"),
        SdkAppID:  1400000000,
    })
    if err != nil {
        log.Fatal(err)
    }

    // 合成语音
    response, err := client.Synthesize(flowtts.SynthesizeOptions{
        Text:   "你好，世界！",
        Voice:  "v-female-R2s4N9qJ",
        Format: flowtts.AudioFormatWAV,
    })
    if err != nil {
        log.Fatal(err)
    }

    // 保存文件
    os.WriteFile("output.wav", response.Audio, 0644)
}
```

### ⚙️ 配置

#### 环境变量

创建 `.env` 文件：

```env
TX_SECRET_ID=your-tencent-cloud-secret-id
TX_SECRET_KEY=your-tencent-cloud-secret-key
TRTC_SDK_APP_ID=your-trtc-app-id
```

#### 客户端配置

```go
config := flowtts.Config{
    SecretID:  "...",           // 腾讯云 Secret ID
    SecretKey: "...",           // 腾讯云 Secret Key
    SdkAppID:  1400000000,      // TRTC SDK App ID
    Region:    "ap-beijing",    // 地域（可选）
}
```

### 📖 音色管理

```go
// 获取所有可用音色
voices, err := client.GetVoices(true)
log.Printf("总音色数: %d\n", len(voices.Preset))

// 搜索音色
gentleVoices, err := client.SearchVoices("温柔")
log.Printf("找到 %d 个温柔音色\n", len(gentleVoices))

// 获取特定音色信息
voice, err := client.GetVoice("v-female-R2s4N9qJ")
log.Printf("音色名称: %s\n", voice.Name) // "温柔姐姐"
```

### 🎤 音色选择

SDK 提供 380+ 预设音色：
- 77 个 Turbo 音色（低延迟）
- 303 个 Extended 音色（高质量）

#### 推荐音色

| 音色 ID | 名称 | 语言 | 特点 |
|---------|------|---------|----------|
| `v-female-R2s4N9qJ` | 温柔姐姐 | 中文 | 温柔、温暖 |
| `v-male-Bk7vD3xP` | 威严霸总 | 中文 | 成熟、稳重 |
| `v-female-p9Xy7Q1L` | 清晰女旁白 | 英文 | 清晰、专业 |

### 🌊 流式合成

```go
// 开始流式合成
chunkChan, err := client.SynthesizeStream(flowtts.SynthesizeOptions{
    Text:  "你好，世界！",
    Voice: "v-female-R2s4N9qJ",
})
if err != nil {
    log.Fatal(err)
}

// 处理音频块
for chunk := range chunkChan {
    switch chunk.Type {
    case "audio":
        // 处理音频块
        log.Printf("接收到 %d 字节\n", len(chunk.Data))
    case "end":
        log.Printf("流式传输完成\n")
    }
}
```

### 📚 示例

- [基础合成](./examples/basic/main.go) - 简单的文本转语音
- [流式合成](./examples/stream/main.go) - 实时流式合成

### 📄 许可证

MIT License - 查看 [LICENSE](../../LICENSE) 文件

### 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

### 📮 链接

- GitHub: [chicogong/flow-tts](https://github.com/chicogong/flow-tts)
- Python SDK: [PyPI/flow-tts](https://pypi.org/project/flow-tts/)
- Node.js SDK: [npm/flow-tts](https://www.npmjs.com/package/flow-tts)

### 🙏 致谢

基于腾讯云 TRTC TTS API 构建。
