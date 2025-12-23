/**
 * Streaming TTS Example
 * Demonstrates SSE streaming synthesis for real-time audio
 */

import 'dotenv/config';
import { FlowTTS } from '../src/index.js';
import { writeFileSync } from 'fs';

async function main() {
  const client = new FlowTTS({
    secretId: process.env.TX_SECRET_ID!,
    secretKey: process.env.TX_SECRET_KEY!,
    sdkAppId: parseInt(process.env.TRTC_SDK_APP_ID!)
  });

  console.log('🎤 FlowTTS Streaming Example\n');

  const text = '这是一段用于测试流式语音合成的文本。FlowTTS 支持实时流式传输，可以在生成音频的同时播放，大大提升用户体验。';

  console.log('📡 Starting SSE streaming...');
  console.log(`   Text: "${text}"\n`);

  const audioChunks: Buffer[] = [];
  let chunkCount = 0;

  try {
    for await (const chunk of client.synthesizeStream({
      text,
      voice: 'v-female-R2s4N9qJ',
      speed: 1.0
    })) {
      if (chunk.type === 'audio') {
        chunkCount++;
        audioChunks.push(chunk.data!);
        process.stdout.write(`\r   Received chunk ${chunkCount} (${chunk.data!.length} bytes)...`);
      } else if (chunk.type === 'end') {
        console.log(`\n✅ Streaming completed!`);
        console.log(`   Total chunks: ${chunk.totalChunks}`);
        console.log(`   Request ID: ${chunk.requestId}`);
      }
    }

    // Combine all chunks
    const fullAudio = Buffer.concat(audioChunks);
    console.log(`\n📊 Total audio size: ${fullAudio.length} bytes`);

    // Save to file (PCM format, 24kHz)
    writeFileSync('output-streaming.pcm', fullAudio);
    console.log('💾 Saved to output-streaming.pcm');
    console.log('   Note: PCM format can be converted to WAV using ffmpeg:\n');
    console.log('   ffmpeg -f s16le -ar 24000 -ac 1 -i output-streaming.pcm output-streaming.wav\n');

  } catch (error) {
    console.error('❌ Streaming failed:', error);
  }
}

main().catch(console.error);
