// Package flowtts provides an OpenAI-compatible TTS SDK for Tencent Cloud.
package flowtts

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
)

// Client is the FlowTTS client for text-to-speech synthesis.
type Client struct {
	secretID  string
	secretKey string
	sdkAppID  int64
	region    string
}

// NewClient creates a new FlowTTS client.
func NewClient(config Config) (*Client, error) {
	if err := config.Validate(); err != nil {
		return nil, err
	}

	return &Client{
		secretID:  config.SecretID,
		secretKey: config.SecretKey,
		sdkAppID:  config.SdkAppID,
		region:    config.Region,
	}, nil
}

// Synthesize converts text to speech synchronously.
func (c *Client) Synthesize(options SynthesizeOptions) (*SynthesizeResponse, error) {
	// Validate text
	if options.Text == "" {
		return nil, ErrInvalidOptions("text cannot be empty")
	}

	// Set defaults and validate parameters
	if options.Speed == 0 {
		options.Speed = 1.0
	}
	if options.Volume == 0 {
		options.Volume = 1.0
	}
	if options.Format == "" {
		options.Format = AudioFormatWAV
	}

	if options.Speed < 0.5 || options.Speed > 2.0 {
		return nil, ErrInvalidOptions("speed must be between 0.5 and 2.0")
	}
	if options.Volume < 0.5 || options.Volume > 2.0 {
		return nil, ErrInvalidOptions("volume must be between 0.5 and 2.0")
	}
	if options.Pitch < -12 || options.Pitch > 12 {
		return nil, ErrInvalidOptions("pitch must be between -12 and 12 semitones")
	}

	// Detect language if not provided
	language := options.Language
	autoDetected := false
	if language == "" {
		language = detectLanguage(options.Text)
		autoDetected = true
	}

	// Get voice ID
	voiceID := options.Voice
	if voiceID == "" {
		fallback, err := defaultResolver.getFallbackVoice()
		if err != nil {
			return nil, err
		}
		voiceID = fallback.ID
	}

	// Get model for voice
	model, err := defaultResolver.getModelForVoice(voiceID)
	if err != nil {
		return nil, err
	}

	// Build request payload
	request := synthesizeRequest{
		SdkAppID: c.sdkAppID,
		Text:     options.Text,
		Model:    model,
		Voice: voiceConfig{
			VoiceID: voiceID,
			Speed:   options.Speed,
			Volume:  options.Volume,
			Pitch:   options.Pitch,
		},
		AudioFormat: audioFormatConfig{
			Format:     string(options.Format),
			SampleRate: 24000,
		},
	}

	payload, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Generate headers
	headers := generateHeaders(c.secretID, c.secretKey, string(payload), false)

	// Make request
	resp, err := makeRequest(headers, string(payload))
	if err != nil {
		return nil, err
	}

	// Decode audio
	if resp.Response.Audio == "" {
		return nil, &TTSError{
			Code:      "NoAudioData",
			Message:   "No audio data in response",
			RequestID: resp.Response.RequestID,
		}
	}

	audioBytes, err := base64.StdEncoding.DecodeString(resp.Response.Audio)
	if err != nil {
		return nil, fmt.Errorf("failed to decode audio: %w", err)
	}

	response := &SynthesizeResponse{
		Audio:        audioBytes,
		Format:       options.Format,
		AutoDetected: autoDetected,
		RequestID:    resp.Response.RequestID,
	}

	if autoDetected {
		response.DetectedLanguage = &language
	}

	return response, nil
}

// SynthesizeStream converts text to speech with streaming.
func (c *Client) SynthesizeStream(options SynthesizeOptions) (<-chan StreamChunk, error) {
	// Validate text
	if options.Text == "" {
		return nil, ErrInvalidOptions("text cannot be empty")
	}

	// Set defaults and validate parameters
	if options.Speed == 0 {
		options.Speed = 1.0
	}
	if options.Volume == 0 {
		options.Volume = 1.0
	}

	if options.Speed < 0.5 || options.Speed > 2.0 {
		return nil, ErrInvalidOptions("speed must be between 0.5 and 2.0")
	}
	if options.Volume < 0.5 || options.Volume > 2.0 {
		return nil, ErrInvalidOptions("volume must be between 0.5 and 2.0")
	}

	// Get voice ID
	voiceID := options.Voice
	if voiceID == "" {
		fallback, err := defaultResolver.getFallbackVoice()
		if err != nil {
			return nil, err
		}
		voiceID = fallback.ID
	}

	// Get model for voice
	model, err := defaultResolver.getModelForVoice(voiceID)
	if err != nil {
		return nil, err
	}

	// Build request payload (streaming format is PCM)
	request := synthesizeRequest{
		SdkAppID: c.sdkAppID,
		Text:     options.Text,
		Model:    model,
		Voice: voiceConfig{
			VoiceID: voiceID,
			Speed:   options.Speed,
			Volume:  options.Volume,
		},
		AudioFormat: audioFormatConfig{
			Format:     "pcm",
			SampleRate: 24000,
		},
	}

	payload, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Generate headers
	headers := generateHeaders(c.secretID, c.secretKey, string(payload), true)

	// Create channel for chunks
	chunkChan := make(chan StreamChunk, 10)

	// Process stream in goroutine
	go func() {
		defer close(chunkChan)

		sequence := 0
		err := makeStreamRequest(headers, string(payload), func(data streamChunkData) {
			if data.Type == "audio" && data.Audio != "" {
				audioBytes, err := base64.StdEncoding.DecodeString(data.Audio)
				if err == nil {
					chunkChan <- StreamChunk{
						Type:     "audio",
						Data:     audioBytes,
						Sequence: sequence,
					}
					sequence++
				}
			}

			if data.Type == "end" || data.IsEnd {
				chunkChan <- StreamChunk{
					Type:        "end",
					TotalChunks: sequence,
					RequestID:   data.RequestID,
				}
			}
		})

		if err != nil {
			// Send error as a special chunk (in real impl, might want error channel)
			chunkChan <- StreamChunk{
				Type: "error",
			}
		}
	}()

	return chunkChan, nil
}

// GetVoices returns all available voices.
func (c *Client) GetVoices(includeExtended bool) (*VoiceLibrary, error) {
	return defaultResolver.getVoices(includeExtended)
}

// SearchVoices searches for voices by query string.
func (c *Client) SearchVoices(query string) ([]Voice, error) {
	return defaultResolver.searchVoices(query)
}

// GetVoice returns metadata for a specific voice by ID.
func (c *Client) GetVoice(voiceID string) (*Voice, error) {
	return defaultResolver.getVoice(voiceID)
}

// detectLanguage performs basic language detection.
func detectLanguage(text string) string {
	// Simple heuristic: check for Chinese characters
	for _, r := range text {
		if r >= 0x4E00 && r <= 0x9FFF {
			return "zh-CN"
		}
	}
	return "en-US"
}
