# Flow TTS Java SDK

Java SDK for Tencent Cloud Flow TTS with OpenAI-compatible interface.

## Requirements

- Java 11 or later
- Maven 3.6+

## Installation

### Maven

```xml
<dependency>
    <groupId>com.flowtts</groupId>
    <artifactId>flow-tts</artifactId>
    <version>0.1.0</version>
</dependency>
```

### Gradle

```groovy
implementation 'com.flowtts:flow-tts:0.1.0'
```

## Quick Start

```java
import com.flowtts.FlowTTS;
import com.flowtts.FlowTTSConfig;
import com.flowtts.model.SynthesizeOptions;
import com.flowtts.model.SynthesizeResponse;

import java.nio.file.Files;
import java.nio.file.Paths;

public class QuickStart {
    public static void main(String[] args) throws Exception {
        // Create configuration
        FlowTTSConfig config = FlowTTSConfig.builder()
                .secretId("your-secret-id")
                .secretKey("your-secret-key")
                .sdkAppId(123456789)
                .build();

        // Create client
        FlowTTS client = new FlowTTS(config);

        // Synthesize speech
        SynthesizeResponse response = client.synthesize(
                SynthesizeOptions.builder()
                        .text("Hello, world!")
                        .voice("nova")  // OpenAI-compatible voice
                        .build()
        );

        // Save to file
        Files.write(Paths.get("output.mp3"), response.getAudio());

        client.close();
    }
}
```

## OpenAI Voice Compatibility

The SDK supports OpenAI-compatible voice names that map to Tencent Cloud voices:

| OpenAI Voice | Tencent Voice ID | Description |
|--------------|------------------|-------------|
| alloy | male-qn-qingse | Young Youthful Voice |
| echo | male-qn-jingying | Young Elite Voice |
| fable | male-qn-badao | Young Dominant Voice |
| onyx | male-qn-daxuesheng | Young College Student Voice |
| nova | female-shaonv | Girl Female Voice |
| shimmer | female-yujie | Mature Female Voice |

You can also use native Tencent Cloud voice IDs directly.

## Streaming

```java
client.synthesizeStream(
        SynthesizeOptions.builder()
                .text("Long text for streaming synthesis...")
                .voice("alloy")
                .build(),
        new StreamListener() {
            @Override
            public void onChunk(StreamChunk chunk) {
                if (chunk.hasAudio()) {
                    // Process audio chunk
                    byte[] audio = chunk.getAudio();
                }
            }

            @Override
            public void onComplete() {
                System.out.println("Synthesis complete!");
            }

            @Override
            public void onError(Exception error) {
                error.printStackTrace();
            }
        }
);
```

## Configuration Options

```java
FlowTTSConfig config = FlowTTSConfig.builder()
        .secretId("your-secret-id")      // Required
        .secretKey("your-secret-key")    // Required
        .sdkAppId(123456789)             // Required
        .region("ap-beijing")            // Optional, default: ap-beijing
        .endpoint("trtc.ai.tencentcloudapi.com")  // Optional
        .build();
```

## Synthesis Options

```java
SynthesizeOptions options = SynthesizeOptions.builder()
        .text("Text to synthesize")      // Required
        .voice("nova")                   // Default: alloy
        .model("flow-01-turbo")          // Default: flow-01-turbo
        .codec("mp3")                    // Default: mp3 (mp3/wav/pcm/ogg_opus/flac)
        .sampleRate(24000)               // Default: 24000
        .speed(1.0)                      // Default: 1.0 (0.25-4.0)
        .volume(0.0)                     // Default: 0.0 (-10.0 to 10.0 dB)
        .build();
```

## Available Models

- `flow-01-turbo` - Fast synthesis, good for real-time applications
- `flow-01-ex` - Enhanced quality, more voices available

## Running Examples

```bash
# Set environment variables
export TENCENT_SECRET_ID="your-secret-id"
export TENCENT_SECRET_KEY="your-secret-key"
export TENCENT_SDK_APP_ID="123456789"

# Build
mvn compile

# Run basic example
mvn exec:java -Dexec.mainClass="BasicExample" -Dexec.sourceRoot="examples"

# Run streaming example
mvn exec:java -Dexec.mainClass="StreamingExample" -Dexec.sourceRoot="examples"

# Run voice list example
mvn exec:java -Dexec.mainClass="VoiceListExample" -Dexec.sourceRoot="examples"
```

## Building

```bash
mvn clean package
```

## Running Tests

```bash
mvn test
```

## License

MIT License
