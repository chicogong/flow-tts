package com.flowtts;

import com.flowtts.core.VoiceResolver;
import com.flowtts.model.SynthesizeOptions;
import com.flowtts.model.Voice;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FlowTTSTest {

    @Test
    void testConfigBuilder() {
        FlowTTSConfig config = FlowTTSConfig.builder()
                .secretId("test-secret-id")
                .secretKey("test-secret-key")
                .sdkAppId(123456789)
                .region("ap-guangzhou")
                .build();

        assertEquals("test-secret-id", config.getSecretId());
        assertEquals("test-secret-key", config.getSecretKey());
        assertEquals(123456789, config.getSdkAppId());
        assertEquals("ap-guangzhou", config.getRegion());
        assertEquals("trtc.ai.tencentcloudapi.com", config.getEndpoint());
    }

    @Test
    void testConfigBuilderDefaults() {
        FlowTTSConfig config = FlowTTSConfig.builder()
                .secretId("test-secret-id")
                .secretKey("test-secret-key")
                .sdkAppId(123456789)
                .build();

        assertEquals("ap-beijing", config.getRegion());
        assertEquals("trtc.ai.tencentcloudapi.com", config.getEndpoint());
    }

    @Test
    void testConfigBuilderValidation() {
        assertThrows(IllegalArgumentException.class, () -> {
            FlowTTSConfig.builder()
                    .secretKey("test-secret-key")
                    .sdkAppId(123456789)
                    .build();
        });

        assertThrows(IllegalArgumentException.class, () -> {
            FlowTTSConfig.builder()
                    .secretId("test-secret-id")
                    .sdkAppId(123456789)
                    .build();
        });

        assertThrows(IllegalArgumentException.class, () -> {
            FlowTTSConfig.builder()
                    .secretId("test-secret-id")
                    .secretKey("test-secret-key")
                    .build();
        });
    }

    @Test
    void testSynthesizeOptionsBuilder() {
        SynthesizeOptions options = SynthesizeOptions.builder()
                .text("Hello, world!")
                .voice("nova")
                .model("flow-01-turbo")
                .codec("wav")
                .sampleRate(48000)
                .speed(1.5)
                .volume(5.0)
                .build();

        assertEquals("Hello, world!", options.getText());
        assertEquals("nova", options.getVoice());
        assertEquals("flow-01-turbo", options.getModel());
        assertEquals("wav", options.getCodec());
        assertEquals(48000, options.getSampleRate());
        assertEquals(1.5, options.getSpeed());
        assertEquals(5.0, options.getVolume());
    }

    @Test
    void testSynthesizeOptionsDefaults() {
        SynthesizeOptions options = SynthesizeOptions.builder()
                .text("Test")
                .build();

        assertEquals("alloy", options.getVoice());
        assertEquals("flow-01-turbo", options.getModel());
        assertEquals("wav", options.getCodec());
        assertEquals(24000, options.getSampleRate());
        assertEquals(1.0, options.getSpeed());
        assertEquals(1.0, options.getVolume());
    }

    @Test
    void testSynthesizeOptionsValidation() {
        assertThrows(IllegalArgumentException.class, () -> {
            SynthesizeOptions.builder().build();
        });

        assertThrows(IllegalArgumentException.class, () -> {
            SynthesizeOptions.builder().text("").build();
        });
    }

    @Test
    void testVoiceResolverOpenAIVoices() {
        VoiceResolver resolver = VoiceResolver.getInstance();

        assertEquals("v-male-W1tH9jVc", resolver.resolve("alloy", "flow-01-turbo"));
        assertEquals("v-male-Bk7vD3xP", resolver.resolve("echo", "flow-01-turbo"));
        assertEquals("v-male-s5NqE0rZ", resolver.resolve("fable", "flow-01-turbo"));
        assertEquals("v-male-Bk7vD3xP", resolver.resolve("onyx", "flow-01-turbo"));
        assertEquals("v-female-R2s4N9qJ", resolver.resolve("nova", "flow-01-turbo"));
        assertEquals("v-female-m1KpW7zE", resolver.resolve("shimmer", "flow-01-turbo"));
    }

    @Test
    void testVoiceResolverTencentVoices() {
        VoiceResolver resolver = VoiceResolver.getInstance();

        // Tencent voice IDs should pass through
        String tencentVoice = "v-female-R2s4N9qJ";
        assertEquals(tencentVoice, resolver.resolve(tencentVoice, "flow-01-turbo"));
    }

    @Test
    void testVoiceResolverCaseInsensitive() {
        VoiceResolver resolver = VoiceResolver.getInstance();

        assertEquals("v-male-W1tH9jVc", resolver.resolve("ALLOY", "flow-01-turbo"));
        assertEquals("v-female-R2s4N9qJ", resolver.resolve("Nova", "flow-01-turbo"));
    }

    @Test
    void testGetVoices() {
        VoiceResolver resolver = VoiceResolver.getInstance();
        List<Voice> voices = resolver.getVoices("flow-01-turbo");

        assertNotNull(voices);
        assertTrue(voices.size() > 0, "Should have at least one voice");
    }

    @Test
    void testIsValidVoice() {
        VoiceResolver resolver = VoiceResolver.getInstance();

        // OpenAI voices are always valid
        assertTrue(resolver.isValidVoice("alloy", "flow-01-turbo"));
        assertTrue(resolver.isValidVoice("nova", "flow-01-turbo"));

        // Check a voice that exists in flow-01-turbo
        assertTrue(resolver.isValidVoice("female-kefu-xiaomei", "flow-01-turbo"));

        // Check a voice that exists in flow-01-ex
        assertTrue(resolver.isValidVoice("male-qn-qingse", "flow-01-ex"));
    }
}
