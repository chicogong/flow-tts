import com.flowtts.FlowTTS;
import com.flowtts.FlowTTSConfig;
import com.flowtts.model.SynthesizeOptions;
import com.flowtts.model.SynthesizeResponse;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

/**
 * Basic example of using Flow TTS for synchronous text-to-speech synthesis.
 */
public class BasicExample {
    public static void main(String[] args) {
        // Get credentials from environment variables
        String secretId = System.getenv("TENCENT_SECRET_ID");
        String secretKey = System.getenv("TENCENT_SECRET_KEY");
        String sdkAppIdStr = System.getenv("TENCENT_SDK_APP_ID");

        if (secretId == null || secretKey == null || sdkAppIdStr == null) {
            System.err.println("Please set environment variables:");
            System.err.println("  TENCENT_SECRET_ID");
            System.err.println("  TENCENT_SECRET_KEY");
            System.err.println("  TENCENT_SDK_APP_ID");
            System.exit(1);
        }

        long sdkAppId = Long.parseLong(sdkAppIdStr);

        // Create client configuration
        FlowTTSConfig config = FlowTTSConfig.builder()
                .secretId(secretId)
                .secretKey(secretKey)
                .sdkAppId(sdkAppId)
                .region("ap-beijing")
                .build();

        // Create client
        FlowTTS client = new FlowTTS(config);

        try {
            // Synthesize text to speech with OpenAI-compatible voice
            System.out.println("Synthesizing with OpenAI voice 'nova'...");
            SynthesizeResponse response = client.synthesize(
                    SynthesizeOptions.builder()
                            .text("你好，欢迎使用 Flow TTS 语音合成服务。这是一个简单的示例。")
                            .voice("nova")
                            .model("flow-01-turbo")
                            .codec("mp3")
                            .build()
            );

            // Save to file
            String outputPath = "output_basic.mp3";
            Files.write(Paths.get(outputPath), response.getAudio());
            System.out.println("Audio saved to: " + outputPath);
            System.out.println("Request ID: " + response.getRequestId());
            System.out.println("Audio size: " + response.getAudio().length + " bytes");

            // Synthesize with Tencent voice
            System.out.println("\nSynthesizing with Tencent voice 'female-yujie'...");
            SynthesizeResponse response2 = client.synthesize(
                    SynthesizeOptions.builder()
                            .text("这是使用御姐音色合成的语音，音质清晰自然。")
                            .voice("female-yujie")
                            .model("flow-01-turbo")
                            .speed(1.1)
                            .build()
            );

            String outputPath2 = "output_yujie.mp3";
            Files.write(Paths.get(outputPath2), response2.getAudio());
            System.out.println("Audio saved to: " + outputPath2);

        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        } finally {
            client.close();
        }
    }
}
