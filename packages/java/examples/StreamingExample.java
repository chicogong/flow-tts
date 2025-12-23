import com.flowtts.FlowTTS;
import com.flowtts.FlowTTSConfig;
import com.flowtts.StreamListener;
import com.flowtts.model.StreamChunk;
import com.flowtts.model.SynthesizeOptions;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/**
 * Example of using Flow TTS for streaming text-to-speech synthesis.
 */
public class StreamingExample {
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

        // Use CountDownLatch to wait for streaming to complete
        CountDownLatch latch = new CountDownLatch(1);
        ByteArrayOutputStream audioBuffer = new ByteArrayOutputStream();

        System.out.println("Starting streaming synthesis...");

        try {
            client.synthesizeStream(
                    SynthesizeOptions.builder()
                            .text("这是一个流式语音合成的示例。流式合成可以让您在音频生成过程中就开始播放，" +
                                    "从而大大减少首字节延迟，提供更好的用户体验。")
                            .voice("alloy")
                            .model("flow-01-turbo")
                            .codec("mp3")
                            .build(),
                    new StreamListener() {
                        private int chunkCount = 0;
                        private long startTime = System.currentTimeMillis();

                        @Override
                        public void onChunk(StreamChunk chunk) {
                            chunkCount++;
                            if (chunk.hasAudio()) {
                                try {
                                    audioBuffer.write(chunk.getAudio());
                                } catch (IOException e) {
                                    e.printStackTrace();
                                }

                                if (chunkCount == 1) {
                                    long ttfb = System.currentTimeMillis() - startTime;
                                    System.out.println("Time to first byte: " + ttfb + "ms");
                                }

                                System.out.println("Received chunk #" + chunkCount +
                                        " - " + chunk.getAudio().length + " bytes" +
                                        (chunk.isFinal() ? " (final)" : ""));
                            }
                        }

                        @Override
                        public void onComplete() {
                            long totalTime = System.currentTimeMillis() - startTime;
                            System.out.println("\nStreaming complete!");
                            System.out.println("Total chunks: " + chunkCount);
                            System.out.println("Total time: " + totalTime + "ms");
                            System.out.println("Total audio size: " + audioBuffer.size() + " bytes");
                            latch.countDown();
                        }

                        @Override
                        public void onError(Exception error) {
                            System.err.println("Error during streaming: " + error.getMessage());
                            error.printStackTrace();
                            latch.countDown();
                        }
                    }
            );

            // Wait for streaming to complete (timeout after 60 seconds)
            if (latch.await(60, TimeUnit.SECONDS)) {
                // Save the collected audio
                if (audioBuffer.size() > 0) {
                    String outputPath = "output_streaming.mp3";
                    Files.write(Paths.get(outputPath), audioBuffer.toByteArray());
                    System.out.println("Audio saved to: " + outputPath);
                }
            } else {
                System.err.println("Streaming timed out!");
            }

        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        } finally {
            client.close();
        }
    }
}
