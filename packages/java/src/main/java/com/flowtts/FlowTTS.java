package com.flowtts;

import com.flowtts.core.VoiceResolver;
import com.flowtts.exception.FlowTTSException;
import com.flowtts.model.StreamChunk;
import com.flowtts.model.SynthesizeOptions;
import com.flowtts.model.SynthesizeResponse;
import com.flowtts.model.Voice;
import com.flowtts.utils.Signature;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import okhttp3.*;
import okhttp3.sse.EventSource;
import okhttp3.sse.EventSourceListener;
import okhttp3.sse.EventSources;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * Flow TTS client for Tencent TRTC AI TTS with OpenAI-compatible interface.
 *
 * <p>Example usage:</p>
 * <pre>{@code
 * FlowTTSConfig config = FlowTTSConfig.builder()
 *     .secretId("your-secret-id")
 *     .secretKey("your-secret-key")
 *     .sdkAppId(123456789)
 *     .build();
 *
 * FlowTTS client = new FlowTTS(config);
 *
 * // Synchronous synthesis
 * SynthesizeResponse response = client.synthesize(
 *     SynthesizeOptions.builder()
 *         .text("Hello, world!")
 *         .voice("alloy")
 *         .build()
 * );
 *
 * // Save to file
 * Files.write(Paths.get("output.mp3"), response.getAudio());
 * }</pre>
 */
public class FlowTTS {
    private static final String ACTION_SYNC = "TextToSpeech";
    private static final String ACTION_STREAM = "TextToSpeechSSE";
    private static final MediaType JSON_MEDIA_TYPE = MediaType.parse("application/json; charset=utf-8");
    private static final Gson gson = new Gson();

    private final FlowTTSConfig config;
    private final OkHttpClient httpClient;
    private final VoiceResolver voiceResolver;

    /**
     * Create a new FlowTTS client.
     *
     * @param config the client configuration
     */
    public FlowTTS(FlowTTSConfig config) {
        this.config = config;
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build();
        this.voiceResolver = VoiceResolver.getInstance();
    }

    /**
     * Synthesize text to speech synchronously.
     *
     * @param options the synthesis options
     * @return the synthesis response containing audio data
     * @throws FlowTTSException if synthesis fails
     */
    public SynthesizeResponse synthesize(SynthesizeOptions options) {
        String resolvedVoice = voiceResolver.resolve(options.getVoice(), options.getModel());
        String sessionId = UUID.randomUUID().toString();

        JsonObject payload = buildPayload(options, resolvedVoice, false);
        String payloadJson = gson.toJson(payload);

        long timestamp = Instant.now().getEpochSecond();
        TreeMap<String, String> headers = Signature.generateHeaders(
                config.getSecretId(),
                config.getSecretKey(),
                config.getEndpoint(),
                ACTION_SYNC,
                payloadJson,
                timestamp
        );
        headers.put("X-TC-Region", config.getRegion());

        Request.Builder requestBuilder = new Request.Builder()
                .url("https://" + config.getEndpoint())
                .post(RequestBody.create(payloadJson, JSON_MEDIA_TYPE));

        for (Map.Entry<String, String> entry : headers.entrySet()) {
            requestBuilder.addHeader(entry.getKey(), entry.getValue());
        }

        try (Response response = httpClient.newCall(requestBuilder.build()).execute()) {
            if (!response.isSuccessful()) {
                String body = response.body() != null ? response.body().string() : "";
                throw new FlowTTSException("HTTP error " + response.code() + ": " + body);
            }

            ResponseBody responseBody = response.body();
            if (responseBody == null) {
                throw new FlowTTSException("Empty response body");
            }

            // Parse JSON response (sync API returns JSON, not SSE)
            String responseJson = responseBody.string();
            JsonObject result = gson.fromJson(responseJson, JsonObject.class);
            
            // Check for error
            if (result.has("Response")) {
                JsonObject resp = result.getAsJsonObject("Response");
                
                if (resp.has("Error")) {
                    JsonObject error = resp.getAsJsonObject("Error");
                    String code = error.has("Code") ? error.get("Code").getAsString() : "Unknown";
                    String message = error.has("Message") ? error.get("Message").getAsString() : "Unknown error";
                    String reqId = resp.has("RequestId") ? resp.get("RequestId").getAsString() : null;
                    throw new FlowTTSException(code, message, reqId);
                }
                
                // Extract audio data
                String requestId = resp.has("RequestId") ? resp.get("RequestId").getAsString() : null;
                byte[] audioBytes = new byte[0];
                
                if (resp.has("Audio") && !resp.get("Audio").isJsonNull()) {
                    String audioBase64 = resp.get("Audio").getAsString();
                    audioBytes = Base64.getDecoder().decode(audioBase64);
                }
                
                return new SynthesizeResponse(
                        audioBytes,
                        requestId,
                        sessionId,
                        options.getCodec()
                );
            } else {
                throw new FlowTTSException("Invalid response format: " + responseJson);
            }
        } catch (IOException e) {
            throw new FlowTTSException("Network error: " + e.getMessage(), e);
        }
    }

    /**
     * Synthesize text to speech with streaming.
     *
     * @param options  the synthesis options
     * @param listener the listener to receive audio chunks
     */
    public void synthesizeStream(SynthesizeOptions options, StreamListener listener) {
        String resolvedVoice = voiceResolver.resolve(options.getVoice(), options.getModel());
        String sessionId = UUID.randomUUID().toString();

        JsonObject payload = buildPayload(options, resolvedVoice, true);
        String payloadJson = gson.toJson(payload);

        long timestamp = Instant.now().getEpochSecond();
        TreeMap<String, String> headers = Signature.generateHeaders(
                config.getSecretId(),
                config.getSecretKey(),
                config.getEndpoint(),
                ACTION_STREAM,
                payloadJson,
                timestamp
        );
        headers.put("X-TC-Region", config.getRegion());
        headers.put("Accept", "text/event-stream");

        Request.Builder requestBuilder = new Request.Builder()
                .url("https://" + config.getEndpoint())
                .post(RequestBody.create(payloadJson, JSON_MEDIA_TYPE));

        for (Map.Entry<String, String> entry : headers.entrySet()) {
            requestBuilder.addHeader(entry.getKey(), entry.getValue());
        }

        EventSource.Factory factory = EventSources.createFactory(httpClient);
        factory.newEventSource(requestBuilder.build(), new EventSourceListener() {
            private String requestId;

            @Override
            public void onEvent(EventSource eventSource, String id, String type, String data) {
                if (data.equals("[DONE]")) {
                    listener.onComplete();
                    return;
                }

                try {
                    JsonObject chunk = gson.fromJson(data, JsonObject.class);

                    // Check for error
                    if (chunk.has("Response") && chunk.getAsJsonObject("Response").has("Error")) {
                        JsonObject error = chunk.getAsJsonObject("Response").getAsJsonObject("Error");
                        String code = error.has("Code") ? error.get("Code").getAsString() : "Unknown";
                        String message = error.has("Message") ? error.get("Message").getAsString() : "Unknown error";
                        String reqId = chunk.getAsJsonObject("Response").has("RequestId")
                                ? chunk.getAsJsonObject("Response").get("RequestId").getAsString()
                                : null;
                        listener.onError(new FlowTTSException(code, message, reqId));
                        eventSource.cancel();
                        return;
                    }

                    // Extract audio data
                    byte[] audioBytes = new byte[0];
                    if (chunk.has("Audio")) {
                        String audioBase64 = chunk.get("Audio").getAsString();
                        audioBytes = Base64.getDecoder().decode(audioBase64);
                    }

                    if (requestId == null && chunk.has("RequestId")) {
                        requestId = chunk.get("RequestId").getAsString();
                    }

                    boolean isFinal = chunk.has("Final") && chunk.get("Final").getAsInt() == 1;
                    int subtitleSeq = chunk.has("SubtitleSeq") ? chunk.get("SubtitleSeq").getAsInt() : 0;

                    StreamChunk streamChunk = new StreamChunk(
                            audioBytes,
                            requestId,
                            sessionId,
                            isFinal,
                            subtitleSeq
                    );
                    listener.onChunk(streamChunk);

                    if (isFinal) {
                        listener.onComplete();
                    }
                } catch (Exception e) {
                    listener.onError(e);
                }
            }

            @Override
            public void onFailure(EventSource eventSource, Throwable t, Response response) {
                String message = "Stream failed";
                if (t != null) {
                    message = t.getMessage();
                } else if (response != null) {
                    message = "HTTP " + response.code();
                }
                listener.onError(new FlowTTSException(message));
            }

            @Override
            public void onClosed(EventSource eventSource) {
                // Stream closed normally
            }
        });
    }

    /**
     * Synthesize text to speech asynchronously.
     *
     * @param options the synthesis options
     * @return a CompletableFuture that resolves to the synthesis response
     */
    public CompletableFuture<SynthesizeResponse> synthesizeAsync(SynthesizeOptions options) {
        return CompletableFuture.supplyAsync(() -> synthesize(options));
    }

    /**
     * Get all available voices for a model.
     *
     * @param model the model name (e.g., "flow-01-turbo")
     * @return a list of available voices
     */
    public List<Voice> getVoices(String model) {
        return voiceResolver.getVoices(model);
    }

    /**
     * Get a specific voice by ID.
     *
     * @param voiceId the voice ID
     * @param model   the model name
     * @return the Voice object, or null if not found
     */
    public Voice getVoice(String voiceId, String model) {
        return voiceResolver.getVoice(voiceId, model);
    }

    /**
     * Close the client and release resources.
     */
    public void close() {
        httpClient.dispatcher().executorService().shutdown();
        httpClient.connectionPool().evictAll();
    }

    private JsonObject buildPayload(SynthesizeOptions options, String resolvedVoice, boolean isStream) {
        JsonObject payload = new JsonObject();
        
        // Match Go SDK structure exactly
        payload.addProperty("SdkAppId", config.getSdkAppId());
        payload.addProperty("Text", options.getText());
        
        // Convert user-friendly model name to API format
        // "flow-01-turbo" -> "flow_01_turbo", "flow-01-ex" -> "flow_01_ex"
        String model = options.getModel();
        String apiModel = model.replace("-", "_");
        payload.addProperty("Model", apiModel);
        
        // Voice config (nested object)
        JsonObject voice = new JsonObject();
        voice.addProperty("VoiceId", resolvedVoice);
        voice.addProperty("Speed", options.getSpeed());
        voice.addProperty("Volume", options.getVolume());
        voice.addProperty("Pitch", options.getPitch());
        payload.add("Voice", voice);
        
        // AudioFormat config (nested object)
        JsonObject audioFormat = new JsonObject();
        audioFormat.addProperty("Format", isStream ? "pcm" : options.getCodec());
        audioFormat.addProperty("SampleRate", options.getSampleRate());
        payload.add("AudioFormat", audioFormat);
        
        return payload;
    }
}
