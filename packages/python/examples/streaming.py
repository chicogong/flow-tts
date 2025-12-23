"""Streaming FlowTTS Example."""

import os
from flow_tts import FlowTTS

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


def main() -> None:
    """Run streaming TTS example."""
    print("🎤 FlowTTS Streaming Example\n")

    # Initialize client
    client = FlowTTS({
        "secret_id": os.getenv("TX_SECRET_ID", ""),
        "secret_key": os.getenv("TX_SECRET_KEY", ""),
        "sdk_app_id": int(os.getenv("TRTC_SDK_APP_ID", "0")),
    })

    print("📡 Starting SSE streaming...")
    print('   Text: "这是一段用于测试流式语音合成的文本。"\n')

    try:
        audio_chunks = []
        chunk_count = 0

        for chunk in client.synthesize_stream({
            "text": "这是一段用于测试流式语音合成的文本。FlowTTS 支持实时流式传输。"
        }):
            if chunk["type"] == "audio":
                audio_chunks.append(chunk["data"])
                chunk_count += 1
                print(f"   Received chunk {chunk_count} ({len(chunk['data'])} bytes)...")
            elif chunk["type"] == "end":
                print(f"\n📊 Total audio size: {sum(len(c) for c in audio_chunks)} bytes")
                print(f"   Request ID: {chunk.get('request_id')}")

        # Save combined audio
        if audio_chunks:
            with open("output-streaming.pcm", "wb") as f:
                for chunk_data in audio_chunks:
                    f.write(chunk_data)

            print("💾 Saved to output-streaming.pcm")
            print("   Note: PCM format can be converted to WAV using ffmpeg:")
            print("   ffmpeg -f s16le -ar 24000 -ac 1 -i output-streaming.pcm output-streaming.wav")

    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    main()
