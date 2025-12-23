package flowtts

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

const (
	ttsURL       = "https://trtc.ai.tencentcloudapi.com"
	ttsURLStream = "https://trtc.ai.tencentcloudapi.com"
)

// makeRequest makes a synchronous TTS request.
func makeRequest(headers map[string]string, payload string) (*synthesizeAPIResponse, error) {
	req, err := http.NewRequest("POST", ttsURL, strings.NewReader(payload))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	for key, value := range headers {
		req.Header.Set(key, value)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var result synthesizeAPIResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	// Check for API error
	if result.Response.Error != nil {
		return nil, &TTSError{
			Code:      result.Response.Error.Code,
			Message:   result.Response.Error.Message,
			RequestID: result.Response.RequestID,
		}
	}

	return &result, nil
}

// makeStreamRequest makes a streaming TTS request.
func makeStreamRequest(headers map[string]string, payload string, onChunk func(streamChunkData)) error {
	req, err := http.NewRequest("POST", ttsURLStream, strings.NewReader(payload))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	for key, value := range headers {
		req.Header.Set(key, value)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	// Check for non-200 status
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("request failed with status %d: %s", resp.StatusCode, string(body))
	}

	// Parse Server-Sent Events (SSE) stream
	scanner := bufio.NewScanner(resp.Body)
	var eventData bytes.Buffer

	for scanner.Scan() {
		line := scanner.Text()

		if strings.HasPrefix(line, "data:") {
			// Extract JSON data
			data := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
			eventData.WriteString(data)
		} else if line == "" {
			// Empty line marks end of event
			if eventData.Len() > 0 {
				var chunk streamChunkData
				if err := json.Unmarshal(eventData.Bytes(), &chunk); err == nil {
					onChunk(chunk)

					// Check for stream end
					if chunk.Type == "end" || chunk.IsEnd {
						break
					}
				}
				eventData.Reset()
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return fmt.Errorf("stream read error: %w", err)
	}

	return nil
}
