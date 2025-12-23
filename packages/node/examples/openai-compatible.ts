/**
 * OpenAI-Compatible API Example
 * Demonstrates the OpenAI-style audio.speech.create() API
 */

import { createClient } from '../src/index.js';
import { writeFileSync } from 'fs';

async function main() {
  // Create client using factory function
  const client = createClient({
    secretId: process.env.TX_SECRET_ID!,
    secretKey: process.env.TX_SECRET_KEY!,
    sdkAppId: parseInt(process.env.TRTC_SDK_APP_ID!)
  });

  console.log('🎤 OpenAI-Compatible API Example\n');

  // Use OpenAI-style API: client.audio.speech.create()
  console.log('1️⃣ Using client.audio.speech.create() (OpenAI-compatible)...');

  const response = await client.audio.speech.create({
    text: '你好！这是使用 OpenAI 兼容 API 生成的语音。',
    voice: 'v-female-R2s4N9qJ',
    format: 'wav',
    speed: 1.0,
    volume: 1.0
  });

  console.log(`✅ Success! Generated ${response.audio.length} bytes`);
  console.log(`   Format: ${response.format}`);
  console.log(`   Language: ${response.detectedLanguage} (auto: ${response.autoDetected})\n`);

  writeFileSync('output-openai.wav', response.audio);
  console.log('💾 Saved to output-openai.wav\n');

  // Example 2: Different voices
  console.log('2️⃣ Trying different voices...');

  const voices = [
    { id: 'v-female-R2s4N9qJ', text: '我是温柔姐姐，说话很温柔。' },
    { id: 'v-female-m1KpW7zE', text: '哼，我是傲娇学姐，这么简单的问题都不会？' },
    { id: 'v-male-Bk7vD3xP', text: '我是威严霸总，这个方案很不错。' }
  ];

  for (const { id, text } of voices) {
    const voiceInfo = client.getVoice(id);
    console.log(`\n   Testing: ${voiceInfo?.name} (${id})`);

    const resp = await client.audio.speech.create({
      text,
      voice: id,
      format: 'wav'
    });

    const filename = `output-${voiceInfo?.name}.wav`;
    writeFileSync(filename, resp.audio);
    console.log(`   ✅ Generated ${resp.audio.length} bytes → ${filename}`);
  }

  console.log('\n✨ OpenAI-compatible API works perfectly!');
  console.log('\n💡 Migration from OpenAI TTS is as simple as:');
  console.log('   - import OpenAI from "openai" → import { FlowTTS } from "flow-tts"');
  console.log('   - const openai = new OpenAI() → const client = new FlowTTS({ ... })');
  console.log('   - openai.audio.speech.create() → client.audio.speech.create()');
}

main().catch(console.error);
