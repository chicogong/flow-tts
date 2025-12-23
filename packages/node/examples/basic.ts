/**
 * Basic TTS Example
 * Demonstrates simple text-to-speech synthesis
 */

import 'dotenv/config';
import { FlowTTS } from '../src/index.js';
import { writeFileSync } from 'fs';

async function main() {
  // Initialize client with credentials
  const client = new FlowTTS({
    secretId: process.env.TX_SECRET_ID!,
    secretKey: process.env.TX_SECRET_KEY!,
    sdkAppId: parseInt(process.env.TRTC_SDK_APP_ID!),
    region: 'ap-beijing' // Optional, defaults to ap-beijing
  });

  console.log('🎤 FlowTTS Basic Example\n');

  // Example 1: Synthesize Chinese text
  console.log('1️⃣ Synthesizing Chinese text...');
  const response1 = await client.synthesize({
    text: '你好，世界！欢迎使用 FlowTTS SDK。',
    voice: 'v-female-R2s4N9qJ', // 温柔姐姐
    format: 'wav'
  });

  console.log(`✅ Success! Generated ${response1.audio.length} bytes`);
  console.log(`   Language: ${response1.detectedLanguage} (auto-detected: ${response1.autoDetected})`);
  console.log(`   Request ID: ${response1.requestId}\n`);

  // Save to file
  writeFileSync('output-chinese.wav', response1.audio);
  console.log('💾 Saved to output-chinese.wav\n');

  // Example 2: Synthesize English text
  console.log('2️⃣ Synthesizing English text...');
  const response2 = await client.synthesize({
    text: 'Hello, world! Welcome to FlowTTS SDK.',
    language: 'en', // Explicitly specify language
    format: 'wav'
  });

  console.log(`✅ Success! Generated ${response2.audio.length} bytes`);
  console.log(`   Language: ${response2.detectedLanguage || 'en'}\n`);

  writeFileSync('output-english.wav', response2.audio);
  console.log('💾 Saved to output-english.wav\n');

  // Example 3: List available voices
  console.log('3️⃣ Listing available voices...');
  const { preset } = client.getVoices(false); // Standard voices only
  console.log(`Found ${preset.length} voices:`);
  preset.slice(0, 5).forEach(voice => {
    console.log(`   - ${voice.id}: ${voice.name} (${voice.language})`);
  });
  console.log(`   ... and ${preset.length - 5} more\n`);

  // Example 4: Search voices
  console.log('4️⃣ Searching for "温柔" voices...');
  const searchResults = client.searchVoices('温柔');
  console.log(`Found ${searchResults.length} matching voices:`);
  searchResults.forEach(voice => {
    console.log(`   - ${voice.id}: ${voice.name}`);
  });

  console.log('\n✨ All examples completed successfully!');
}

main().catch(console.error);
