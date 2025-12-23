"""Basic FlowTTS Example."""

import os

from flow_tts import FlowTTS

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass


def main() -> None:
    """Run basic TTS example."""
    print("🎤 FlowTTS Basic Example\n")

    # Initialize client
    client = FlowTTS(
        {
            "secret_id": os.getenv("TX_SECRET_ID", ""),
            "secret_key": os.getenv("TX_SECRET_KEY", ""),
            "sdk_app_id": int(os.getenv("TRTC_SDK_APP_ID", "0")),
        }
    )

    # 1. Synthesize Chinese text
    print("1️⃣ Synthesizing Chinese text...")
    try:
        response = client.synthesize(
            {"text": "你好，世界！这是一个测试。", "format": "wav"}
        )

        with open("output-chinese.wav", "wb") as f:
            f.write(response["audio"])

        print(f"✅ Success! Generated {len(response['audio'])} bytes")
        print(
            f"   Language: {response.get('detected_language')} (auto-detected: {response.get('auto_detected')})"
        )
        print(f"   Request ID: {response['request_id']}")
        print("💾 Saved to output-chinese.wav\n")
    except Exception as e:
        print(f"❌ Error: {e}\n")

    # 2. Synthesize English text
    print("2️⃣ Synthesizing English text...")
    try:
        response = client.synthesize(
            {"text": "Hello, world! This is a test.", "format": "wav"}
        )

        with open("output-english.wav", "wb") as f:
            f.write(response["audio"])

        print(f"✅ Success! Generated {len(response['audio'])} bytes")
        print(f"   Language: {response.get('detected_language')}")
        print("💾 Saved to output-english.wav\n")
    except Exception as e:
        print(f"❌ Error: {e}\n")

    # 3. Get available voices
    print("3️⃣ Listing available voices...")
    voices = client.get_voices(include_extended=False)
    print(f"Found {len(voices['preset'])} voices:")
    for voice in voices["preset"][:5]:
        print(
            f"   - {voice['id']}: {voice['name']} ({voice.get('language', 'unknown')})"
        )

    # 4. Search voices
    print("\n4️⃣ Searching for '温柔' voices...")
    gentle_voices = client.search_voices("温柔")
    print(f"Found {len(gentle_voices)} gentle voices:")
    for voice in gentle_voices[:3]:
        print(f"   - {voice['id']}: {voice['name']}")


if __name__ == "__main__":
    main()
