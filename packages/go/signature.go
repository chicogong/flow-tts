package flowtts

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"
)

const (
	// TTS API constants
	ttsService = "trtc"
	ttsVersion = "2019-07-22"
	ttsHost    = "trtc.ai.tencentcloudapi.com"

	// Actions
	ttsAction       = "TextToSpeech"
	ttsActionStream = "TextToSpeechSSE"

	// Algorithm
	algorithm = "TC3-HMAC-SHA256"
)

// generateHeaders generates HTTP headers with TC3-HMAC-SHA256 signature.
func generateHeaders(secretID, secretKey, payload string, stream bool) map[string]string {
	timestamp := time.Now().Unix()
	date := time.Unix(timestamp, 0).UTC().Format("2006-01-02")

	action := ttsAction
	if stream {
		action = ttsActionStream
	}

	// Step 1: Create canonical request
	httpMethod := "POST"
	canonicalURI := "/"
	canonicalQueryString := ""
	canonicalHeaders := fmt.Sprintf("content-type:application/json\nhost:%s\n", ttsHost)
	signedHeaders := "content-type;host"

	hashedPayload := sha256Sum(payload)
	canonicalRequest := fmt.Sprintf("%s\n%s\n%s\n%s\n%s\n%s",
		httpMethod,
		canonicalURI,
		canonicalQueryString,
		canonicalHeaders,
		signedHeaders,
		hashedPayload,
	)

	// Step 2: Create string to sign
	credentialScope := fmt.Sprintf("%s/%s/tc3_request", date, ttsService)
	hashedCanonicalRequest := sha256Sum(canonicalRequest)
	stringToSign := fmt.Sprintf("%s\n%d\n%s\n%s",
		algorithm,
		timestamp,
		credentialScope,
		hashedCanonicalRequest,
	)

	// Step 3: Calculate signature
	secretDate := hmacSHA256([]byte("TC3"+secretKey), date)
	secretService := hmacSHA256(secretDate, ttsService)
	secretSigning := hmacSHA256(secretService, "tc3_request")
	signature := hex.EncodeToString(hmacSHA256(secretSigning, stringToSign))

	// Step 4: Create authorization header
	authorization := fmt.Sprintf("%s Credential=%s/%s, SignedHeaders=%s, Signature=%s",
		algorithm,
		secretID,
		credentialScope,
		signedHeaders,
		signature,
	)

	// Return headers
	headers := map[string]string{
		"Content-Type":     "application/json",
		"Host":             ttsHost,
		"X-TC-Action":      action,
		"X-TC-Version":     ttsVersion,
		"X-TC-Timestamp":   fmt.Sprintf("%d", timestamp),
		"X-TC-Region":      "", // Region not required for TTS
		"Authorization":    authorization,
	}

	return headers
}

// sha256Sum returns the SHA256 hash of the input string.
func sha256Sum(s string) string {
	h := sha256.New()
	h.Write([]byte(s))
	return hex.EncodeToString(h.Sum(nil))
}

// hmacSHA256 computes HMAC-SHA256.
func hmacSHA256(key []byte, data string) []byte {
	h := hmac.New(sha256.New, key)
	h.Write([]byte(data))
	return h.Sum(nil)
}
