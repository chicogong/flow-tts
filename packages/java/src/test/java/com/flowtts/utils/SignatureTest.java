package com.flowtts.utils;

import org.junit.jupiter.api.Test;

import java.util.TreeMap;

import static org.junit.jupiter.api.Assertions.*;

class SignatureTest {

    @Test
    void testGenerateHeaders() {
        String secretId = "test-secret-id-for-unit-test";
        String secretKey = "test-secret-key-for-unit-test";
        String host = "trtc.ai.tencentcloudapi.com";
        String action = "TextToSpeech";
        String payload = "{\"Text\":\"Hello\"}";
        long timestamp = 1704067200; // Fixed timestamp for testing

        TreeMap<String, String> headers = Signature.generateHeaders(
                secretId, secretKey, host, action, payload, timestamp
        );

        assertNotNull(headers);
        assertTrue(headers.containsKey("Authorization"));
        assertTrue(headers.containsKey("Content-Type"));
        assertTrue(headers.containsKey("Host"));
        assertTrue(headers.containsKey("X-TC-Action"));
        assertTrue(headers.containsKey("X-TC-Timestamp"));
        assertTrue(headers.containsKey("X-TC-Version"));

        assertEquals("application/json; charset=utf-8", headers.get("Content-Type"));
        assertEquals(host, headers.get("Host"));
        assertEquals(action, headers.get("X-TC-Action"));
        assertEquals(String.valueOf(timestamp), headers.get("X-TC-Timestamp"));
        assertEquals("2019-07-22", headers.get("X-TC-Version"));

        String auth = headers.get("Authorization");
        assertTrue(auth.startsWith("TC3-HMAC-SHA256"));
        assertTrue(auth.contains("Credential=" + secretId));
        assertTrue(auth.contains("SignedHeaders=content-type;host"));
        assertTrue(auth.contains("Signature="));
    }

    @Test
    void testSignatureConsistency() {
        String secretId = "test-id";
        String secretKey = "test-key";
        String host = "trtc.ai.tencentcloudapi.com";
        String action = "TextToSpeech";
        String payload = "{\"key\":\"value\"}";
        long timestamp = 1704067200;

        TreeMap<String, String> headers1 = Signature.generateHeaders(
                secretId, secretKey, host, action, payload, timestamp
        );
        TreeMap<String, String> headers2 = Signature.generateHeaders(
                secretId, secretKey, host, action, payload, timestamp
        );

        assertEquals(headers1.get("Authorization"), headers2.get("Authorization"));
    }

    @Test
    void testDifferentTimestampsProduceDifferentSignatures() {
        String secretId = "test-id";
        String secretKey = "test-key";
        String host = "trtc.ai.tencentcloudapi.com";
        String action = "TextToSpeech";
        String payload = "{\"key\":\"value\"}";

        TreeMap<String, String> headers1 = Signature.generateHeaders(
                secretId, secretKey, host, action, payload, 1704067200
        );
        TreeMap<String, String> headers2 = Signature.generateHeaders(
                secretId, secretKey, host, action, payload, 1704067201
        );

        assertNotEquals(headers1.get("Authorization"), headers2.get("Authorization"));
    }
}
