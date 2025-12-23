package flowtts

import (
	"strings"
	"testing"
)

func TestTTSErrorError(t *testing.T) {
	tests := []struct {
		name      string
		err       TTSError
		wantParts []string
	}{
		{
			name: "error without request ID",
			err: TTSError{
				Code:    "TestError",
				Message: "Test message",
			},
			wantParts: []string{"TTS error", "TestError", "Test message"},
		},
		{
			name: "error with request ID",
			err: TTSError{
				Code:      "TestError",
				Message:   "Test message",
				RequestID: "req-12345",
			},
			wantParts: []string{"TTS error", "TestError", "Test message", "RequestID", "req-12345"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			errStr := tt.err.Error()
			for _, part := range tt.wantParts {
				if !strings.Contains(errStr, part) {
					t.Errorf("Error() = %v, want to contain %v", errStr, part)
				}
			}
		})
	}
}

func TestErrInvalidConfig(t *testing.T) {
	msg := "test config error"
	err := ErrInvalidConfig(msg)

	ttsErr, ok := err.(*TTSError)
	if !ok {
		t.Fatalf("ErrInvalidConfig() did not return *TTSError")
	}

	if ttsErr.Code != "InvalidConfig" {
		t.Errorf("Code = %v, want InvalidConfig", ttsErr.Code)
	}

	if ttsErr.Message != msg {
		t.Errorf("Message = %v, want %v", ttsErr.Message, msg)
	}
}

func TestErrInvalidOptions(t *testing.T) {
	msg := "test options error"
	err := ErrInvalidOptions(msg)

	ttsErr, ok := err.(*TTSError)
	if !ok {
		t.Fatalf("ErrInvalidOptions() did not return *TTSError")
	}

	if ttsErr.Code != "InvalidOptions" {
		t.Errorf("Code = %v, want InvalidOptions", ttsErr.Code)
	}

	if ttsErr.Message != msg {
		t.Errorf("Message = %v, want %v", ttsErr.Message, msg)
	}
}

func TestAudioFormatConstants(t *testing.T) {
	if AudioFormatWAV != "wav" {
		t.Errorf("AudioFormatWAV = %v, want wav", AudioFormatWAV)
	}

	if AudioFormatPCM != "pcm" {
		t.Errorf("AudioFormatPCM = %v, want pcm", AudioFormatPCM)
	}
}

func TestSynthesizeOptionsDefaults(t *testing.T) {
	opts := SynthesizeOptions{
		Text: "Hello",
	}

	// Check that zero values are acceptable defaults
	if opts.Speed != 0 {
		t.Errorf("Default Speed = %v, want 0", opts.Speed)
	}

	if opts.Volume != 0 {
		t.Errorf("Default Volume = %v, want 0", opts.Volume)
	}

	if opts.Pitch != 0 {
		t.Errorf("Default Pitch = %v, want 0", opts.Pitch)
	}

	if opts.Format != "" {
		t.Errorf("Default Format = %v, want empty", opts.Format)
	}
}

func TestVoiceStruct(t *testing.T) {
	voice := Voice{
		ID:          "test-voice-id",
		Name:        "Test Voice",
		Description: "A test voice",
		Language:    "zh-CN",
		Model:       "flow_01_turbo",
	}

	if voice.ID != "test-voice-id" {
		t.Errorf("ID = %v, want test-voice-id", voice.ID)
	}

	if voice.Name != "Test Voice" {
		t.Errorf("Name = %v, want Test Voice", voice.Name)
	}

	if voice.Language != "zh-CN" {
		t.Errorf("Language = %v, want zh-CN", voice.Language)
	}
}

func TestVoiceLibraryStruct(t *testing.T) {
	library := VoiceLibrary{
		Preset: []Voice{
			{ID: "voice1", Name: "Voice 1"},
			{ID: "voice2", Name: "Voice 2"},
		},
	}

	if len(library.Preset) != 2 {
		t.Errorf("Preset length = %d, want 2", len(library.Preset))
	}

	if library.Preset[0].ID != "voice1" {
		t.Errorf("Preset[0].ID = %v, want voice1", library.Preset[0].ID)
	}
}

func TestSynthesizeResponseStruct(t *testing.T) {
	lang := "zh-CN"
	resp := SynthesizeResponse{
		Audio:            []byte("audio data"),
		Format:           AudioFormatWAV,
		DetectedLanguage: &lang,
		AutoDetected:     true,
		RequestID:        "req-12345",
	}

	if len(resp.Audio) == 0 {
		t.Error("Audio should not be empty")
	}

	if resp.Format != AudioFormatWAV {
		t.Errorf("Format = %v, want %v", resp.Format, AudioFormatWAV)
	}

	if resp.DetectedLanguage == nil || *resp.DetectedLanguage != lang {
		t.Errorf("DetectedLanguage = %v, want %v", resp.DetectedLanguage, lang)
	}

	if !resp.AutoDetected {
		t.Error("AutoDetected should be true")
	}

	if resp.RequestID != "req-12345" {
		t.Errorf("RequestID = %v, want req-12345", resp.RequestID)
	}
}

func TestStreamChunkStruct(t *testing.T) {
	chunk := StreamChunk{
		Type:        "audio",
		Data:        []byte("chunk data"),
		Sequence:    1,
		TotalChunks: 10,
		RequestID:   "req-12345",
	}

	if chunk.Type != "audio" {
		t.Errorf("Type = %v, want audio", chunk.Type)
	}

	if chunk.Sequence != 1 {
		t.Errorf("Sequence = %d, want 1", chunk.Sequence)
	}

	if chunk.TotalChunks != 10 {
		t.Errorf("TotalChunks = %d, want 10", chunk.TotalChunks)
	}
}
