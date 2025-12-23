package com.flowtts.example;

import com.flowtts.FlowTTS;
import com.flowtts.FlowTTSConfig;
import com.flowtts.model.SynthesizeOptions;
import com.flowtts.model.SynthesizeResponse;

import java.nio.file.Files;
import java.nio.file.Paths;

/**
 * Basic example demonstrating the FlowTTS Java SDK.
 *
 * <p>Run with environment variables:
 * <pre>
 * export TX_SECRET_ID=your-secret-id
 * export TX_SECRET_KEY=your-secret-key
 * export TRTC_SDK_APP_ID=your-sdk-app-id
 * mvn exec:java -Dexec.mainClass="com.flowtts.example.BasicExample"
 * </pre>
 */
public class BasicExample {
    public static void main(String[] args) {
        // Load credentials from environment variables
        String secretId = System.getenv("TX_SECRET_ID");
        String secretKey = System.getenv("TX_SECRET_KEY");
        String sdkAppIdStr = System.getenv("TRTC_SDK_APP_ID");
        String region = System.getenv("TRTC_REGION");

        if (secretId == null || secretKey == null || sdkAppIdStr == null) {
            System.err.println("Missing required environment variables:");
            System.err.println("  TX_SECRET_ID");
            System.err.println("  TX_SECRET_KEY");
            System.err.println("  TRTC_SDK_APP_ID");
            System.exit(1);
        }

        long sdkAppId = Long.parseLong(sdkAppIdStr);
        if (region == null) {
            region = "ap-beijing";
        }

        System.out.println("Creating FlowTTS client...");
        System.out.println("  Region: " + region);
        System.out.println("  SDK App ID: " + sdkAppId);

        // Create config
        FlowTTSConfig config = FlowTTSConfig.builder()
                .secretId(secretId)
                .secretKey(secretKey)
                .sdkAppId(sdkAppId)
                .region(region)
                .build();

        // Create client
        FlowTTS client = new FlowTTS(config);

        try {
            // Synthesize text
            String text = "Hello, this is a test of the FlowTTS Java SDK.";
            System.out.println("\nSynthesizing: \"" + text + "\"");

            SynthesizeOptions options = SynthesizeOptions.builder()
                    .text(text)
                    .voice("nova")  // OpenAI-compatible voice name
                    .model("flow-01-turbo")
                    .codec("wav")
                    .build();

            SynthesizeResponse response = client.synthesize(options);

            System.out.println("\nSynthesis successful!");
            System.out.println("  Request ID: " + response.getRequestId());
            System.out.println("  Audio size: " + response.getAudio().length + " bytes");

            // Save to file
            String outputFile = "output.wav";
            Files.write(Paths.get(outputFile), response.getAudio());
            System.out.println("  Saved to: " + outputFile);

        } catch (Exception e) {
            System.err.println("\nError: " + e.getMessage());
            e.printStackTrace();
        } finally {
            client.close();
        }
    }
}
