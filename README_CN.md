# FlowTTS

> 腾讯云 TTS 的 OpenAI 风格 SDK - 零依赖、TypeScript 优先

[English](./README.md) | 简体中文

FlowTTS 是一个轻量级、零依赖的文本转语音 SDK，使用 OpenAI 兼容的接口封装了腾讯云 TRTC TTS API。只需几行代码即可实现优雅的语音合成。

## ✨ 特性

- 🎯 **OpenAI 兼容 API** - 可直接替换 OpenAI TTS
- ⚡ **零依赖** - 仅使用 Node.js 内置模块
- 🔷 **TypeScript 优先** - 开箱即用的完整类型安全
- 🌊 **流式支持** - 支持 SSE 流式传输实时音频
- 🎤 **丰富的音色库** - 380+ 预设音色，支持多种语言
- 🔍 **自动语言检测** - 自动识别文本语言
- 📦 **双构建模式** - 同时支持 ESM 和 CommonJS

## 📦 安装

```bash
npm install flow-tts
# 或
pnpm add flow-tts
# 或
yarn add flow-tts
```

## 🚀 快速开始

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
  voice: 'v-female-R2s4N9qJ',
  format: 'wav'
});

// 保存到文件
await fs.writeFile('output.wav', response.audio);
```

## ⚙️ 配置

### 环境变量

在项目根目录创建 `.env` 文件：

```env
TX_SECRET_ID=你的腾讯云密钥ID
TX_SECRET_KEY=你的腾讯云密钥Key
TRTC_SDK_APP_ID=你的TRTC应用ID
```

### 客户端选项

```typescript
interface FlowTTSConfig {
  secretId: string;      // 腾讯云 Secret ID
  secretKey: string;     // 腾讯云 Secret Key
  sdkAppId: number;      // TRTC SDK App ID
  region?: string;       // 区域（默认：'ap-beijing'）
}
```

## 📖 使用示例

### 基础合成

```typescript
import { FlowTTS } from 'flow-tts';
import fs from 'fs/promises';

const client = new FlowTTS({
  secretId: process.env.TX_SECRET_ID!,
  secretKey: process.env.TX_SECRET_KEY!,
  sdkAppId: parseInt(process.env.TRTC_SDK_APP_ID!)
});

// 合成语音
const response = await client.synthesize({
  text: '你好，世界！',
  voice: 'v-female-R2s4N9qJ',
  format: 'wav',
  speed: 1.0,
  volume: 1.0
});

// 保存到文件
await fs.writeFile('output.wav', response.audio);
console.log(`生成了 ${response.audio.length} 字节的音频`);
```

### 流式合成

```typescript
// 流式传输音频块
for await (const chunk of client.synthesizeStream({
  text: '这是一段测试文本',
  format: 'pcm'
})) {
  if (chunk.type === 'audio') {
    // 处理音频数据块
    console.log(`收到 ${chunk.data.length} 字节`);
  }
}
```

### 音色管理

```typescript
// 获取所有可用音色
const { preset } = client.getVoices();
console.log(`共有 ${preset.length} 个音色`);

// 搜索音色
const gentleVoices = client.searchVoices('温柔');
console.log(`找到 ${gentleVoices.length} 个温柔音色`);

// 获取特定音色信息
const voice = client.getVoice('v-female-R2s4N9qJ');
console.log(voice.name); // "温柔姐姐"
```

## 🎤 音色选择

SDK 提供 380+ 预设音色：
- 77 个 Turbo 音色（低延迟）
- 303 个扩展音色（高质量）

### 推荐音色

| 音色 ID | 名称 | 语言 | 特点 |
|---------|------|------|------|
| `v-female-R2s4N9qJ` | 温柔姐姐 | 中文 | 温柔、温暖 |
| `v-male-Bk7vD3xP` | 威严霸总 | 中文 | 成熟、稳重 |
| `v-female-p9Xy7Q1L` | 清晰女旁白 | 英文 | 清晰、专业 |

完整音色列表请运行：

```typescript
const { preset } = client.getVoices();
preset.forEach(v => console.log(`${v.id}: ${v.name} (${v.language})`));
```

## 🔧 API 参考

### 合成选项

```typescript
interface SynthesizeOptions {
  text: string;           // 要合成的文本（必需）
  voice?: string;         // 音色 ID（默认：自动选择）
  language?: string;      // 语言代码（默认：自动检测）
  format?: 'wav' | 'pcm'; // 音频格式（默认：'wav'）
  speed?: number;         // 语速 0.5-2.0（默认：1.0）
  volume?: number;        // 音量 0.5-2.0（默认：1.0）
  pitch?: number;         // 音调 -12 到 12（默认：0）
}
```

### 响应格式

```typescript
interface SynthesizeResponse {
  audio: Buffer;          // 音频数据
  format: AudioFormat;    // 音频格式
  detectedLanguage?: string;  // 检测到的语言
  autoDetected?: boolean;     // 是否自动检测
  requestId: string;          // 请求 ID
}
```

## 🌍 支持的语言

- 🇨🇳 中文（zh）
- 🇺🇸 英语（en）
- 🇯🇵 日语（ja）
- 🇰🇷 韩语（ko）

SDK 会自动检测文本语言并选择合适的音色。

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

- GitHub: [chicogong/flow-tts](https://github.com/chicogong/flow-tts)
- npm: [flow-tts](https://www.npmjs.com/package/flow-tts)

## 🙏 致谢

本项目基于腾讯云 TRTC TTS API 构建。
