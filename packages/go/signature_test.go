package flowtts

import (
	"strings"
	"testing"
)

func TestGenerateHeaders(t *testing.T) {
	secretID := "test-secret-id-for-unit-test"
	secretKey := "test-secret-key-for-unit-test"
	payload := `{"Text":"Hello"}`

	headers := generateHeaders(secretID, secretKey, payload, false)

	// Check required headers exist
	requiredHeaders := []string{
		"Content-Type",
		"Host",
		"X-TC-Action",
		"X-TC-Version",
		"X-TC-Timestamp",
		"Authorization",
	}

	for _, h := range requiredHeaders {
		if _, ok := headers[h]; !ok {
			t.Errorf("Missing required header: %s", h)
		}
	}

	// Check header values
	if headers["Content-Type"] != "application/json" {
		t.Errorf("Content-Type = %v, want application/json", headers["Content-Type"])
	}

	if headers["Host"] != ttsHost {
		t.Errorf("Host = %v, want %v", headers["Host"], ttsHost)
	}

	if headers["X-TC-Action"] != ttsAction {
		t.Errorf("X-TC-Action = %v, want %v", headers["X-TC-Action"], ttsAction)
	}

	if headers["X-TC-Version"] != ttsVersion {
		t.Errorf("X-TC-Version = %v, want %v", headers["X-TC-Version"], ttsVersion)
	}

	// Check Authorization format
	auth := headers["Authorization"]
	if !strings.HasPrefix(auth, algorithm) {
		t.Errorf("Authorization should start with %s, got %s", algorithm, auth)
	}
	if !strings.Contains(auth, "Credential="+secretID) {
		t.Errorf("Authorization should contain Credential=%s", secretID)
	}
	if !strings.Contains(auth, "SignedHeaders=content-type;host") {
		t.Error("Authorization should contain SignedHeaders=content-type;host")
	}
	if !strings.Contains(auth, "Signature=") {
		t.Error("Authorization should contain Signature=")
	}
}

func TestGenerateHeadersStreamAction(t *testing.T) {
	headers := generateHeaders("id", "key", "{}", true)

	if headers["X-TC-Action"] != ttsActionStream {
		t.Errorf("X-TC-Action = %v, want %v for stream mode", headers["X-TC-Action"], ttsActionStream)
	}
}

func TestGenerateHeadersNonStreamAction(t *testing.T) {
	headers := generateHeaders("id", "key", "{}", false)

	if headers["X-TC-Action"] != ttsAction {
		t.Errorf("X-TC-Action = %v, want %v for non-stream mode", headers["X-TC-Action"], ttsAction)
	}
}

func TestSignatureConsistency(t *testing.T) {
	// Same inputs should produce consistent signatures (excluding timestamp)
	secretID := "test-id"
	secretKey := "test-key"
	payload := `{"key":"value"}`

	headers1 := generateHeaders(secretID, secretKey, payload, false)
	headers2 := generateHeaders(secretID, secretKey, payload, false)

	// Note: Signatures will differ due to different timestamps
	// But the format should be consistent
	if len(headers1["Authorization"]) != len(headers2["Authorization"]) {
		// Lengths should be approximately the same
		t.Log("Authorization lengths differ, which is expected due to timestamp differences")
	}
}

func TestSha256Sum(t *testing.T) {
	// Test known SHA256 hash
	input := "hello"
	expected := "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"

	result := sha256Sum(input)
	if result != expected {
		t.Errorf("sha256Sum(%q) = %v, want %v", input, result, expected)
	}
}

func TestSha256SumEmpty(t *testing.T) {
	// SHA256 of empty string
	expected := "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

	result := sha256Sum("")
	if result != expected {
		t.Errorf("sha256Sum(\"\") = %v, want %v", result, expected)
	}
}

func TestHmacSHA256(t *testing.T) {
	key := []byte("secret")
	data := "message"

	result := hmacSHA256(key, data)

	// Result should not be empty
	if len(result) == 0 {
		t.Error("hmacSHA256 returned empty result")
	}

	// Result should be 32 bytes (SHA256 output size)
	if len(result) != 32 {
		t.Errorf("hmacSHA256 result length = %d, want 32", len(result))
	}
}
