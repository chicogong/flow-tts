package flowtts

import "fmt"

// AudioFormat represents supported audio formats.
type AudioFormat string

const (
	// AudioFormatWAV is WAV format (default)
	AudioFormatWAV AudioFormat = "wav"
	// AudioFormatPCM is raw PCM format (for streaming)
	AudioFormatPCM AudioFormat = "pcm"
)

// SynthesizeOptions holds options for text-to-speech synthesis.
type SynthesizeOptions struct {
	// Text is the text to synthesize (required)
	Text string

	// Voice is the voice ID to use (optional, uses fallback if not provided)
	Voice string

	// Format is the audio format (optional, default: "wav")
	Format AudioFormat

	// Language is the language code (optional, auto-detected if not provided)
	Language string

	// Speed is the speech speed, range: 0.5-2.0 (optional, default: 1.0)
	Speed float64

	// Volume is the speech volume, range: 0.5-2.0 (optional, default: 1.0)
	Volume float64

	// Pitch is the speech pitch in semitones, range: -12 to 12 (optional, default: 0)
	Pitch int
}

// SynthesizeResponse holds the response from text-to-speech synthesis.
type SynthesizeResponse struct {
	// Audio is the synthesized audio data
	Audio []byte

	// Format is the audio format
	Format AudioFormat

	// DetectedLanguage is the auto-detected language (if auto-detection was used)
	DetectedLanguage *string

	// AutoDetected indicates if language was auto-detected
	AutoDetected bool

	// RequestID is the Tencent Cloud request ID
	RequestID string
}

// StreamChunk represents a chunk of streaming audio data.
type StreamChunk struct {
	// Type is the chunk type ("audio" or "end")
	Type string

	// Data is the audio data (for audio chunks)
	Data []byte

	// Sequence is the chunk sequence number
	Sequence int

	// TotalChunks is the total number of chunks (for end chunks)
	TotalChunks int

	// RequestID is the request ID (for end chunks)
	RequestID string
}

// Voice represents a TTS voice.
type Voice struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Language    string `json:"language"`
	Model       string `json:"model"`
}

// VoiceLibrary holds collections of voices.
type VoiceLibrary struct {
	Preset []Voice `json:"preset"`
}

// Internal request/response types for Tencent Cloud API

type voiceConfig struct {
	VoiceID string  `json:"VoiceId"`
	Speed   float64 `json:"Speed"`
	Volume  float64 `json:"Volume"`
	Pitch   int     `json:"Pitch"`
}

type audioFormatConfig struct {
	Format     string `json:"Format"`
	SampleRate int    `json:"SampleRate"`
}

type synthesizeRequest struct {
	SdkAppID    int64             `json:"SdkAppId"`
	Text        string            `json:"Text"`
	Model       string            `json:"Model"`
	Voice       voiceConfig       `json:"Voice"`
	AudioFormat audioFormatConfig `json:"AudioFormat"`
}

type synthesizeAPIResponse struct {
	Response struct {
		Audio     string `json:"Audio"`
		RequestID string `json:"RequestId"`
		Error     *struct {
			Code    string `json:"Code"`
			Message string `json:"Message"`
		} `json:"Error,omitempty"`
	} `json:"Response"`
}

type streamChunkData struct {
	Type      string `json:"Type"`
	Audio     string `json:"Audio"`
	IsEnd     bool   `json:"IsEnd"`
	RequestID string `json:"RequestId"`
}

// Error types

// TTSError represents a TTS API error.
type TTSError struct {
	Code      string
	Message   string
	RequestID string
}

func (e *TTSError) Error() string {
	if e.RequestID != "" {
		return fmt.Sprintf("TTS error [%s]: %s (RequestID: %s)", e.Code, e.Message, e.RequestID)
	}
	return fmt.Sprintf("TTS error [%s]: %s", e.Code, e.Message)
}

// ErrInvalidConfig creates a config validation error.
func ErrInvalidConfig(message string) error {
	return &TTSError{
		Code:    "InvalidConfig",
		Message: message,
	}
}

// ErrInvalidOptions creates an options validation error.
func ErrInvalidOptions(message string) error {
	return &TTSError{
		Code:    "InvalidOptions",
		Message: message,
	}
}
