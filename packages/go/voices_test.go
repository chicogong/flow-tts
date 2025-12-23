package flowtts

import (
	"testing"
)

func TestVoiceResolverInit(t *testing.T) {
	vr := &voiceResolver{}
	err := vr.init()
	if err != nil {
		t.Fatalf("init() error = %v", err)
	}

	if !vr.initialized {
		t.Error("initialized should be true after init()")
	}

	if len(vr.turboVoices) == 0 {
		t.Error("turboVoices should not be empty")
	}

	if len(vr.turboVoiceMap) == 0 {
		t.Error("turboVoiceMap should not be empty")
	}
}

func TestVoiceResolverGetModelForVoice(t *testing.T) {
	vr := &voiceResolver{}

	// Get a valid turbo voice ID first
	err := vr.init()
	if err != nil {
		t.Fatalf("init() error = %v", err)
	}

	if len(vr.turboVoices) == 0 {
		t.Skip("No turbo voices available for testing")
	}

	turboVoiceID := vr.turboVoices[0].ID

	tests := []struct {
		name      string
		voiceID   string
		wantModel string
		wantErr   bool
	}{
		{
			name:      "valid turbo voice",
			voiceID:   turboVoiceID,
			wantModel: "flow_01_turbo",
			wantErr:   false,
		},
		{
			name:    "unknown voice",
			voiceID: "unknown-voice-id-12345",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			model, err := vr.getModelForVoice(tt.voiceID)
			if tt.wantErr {
				if err == nil {
					t.Error("getModelForVoice() expected error, got nil")
				}
			} else {
				if err != nil {
					t.Errorf("getModelForVoice() unexpected error: %v", err)
				}
				if model != tt.wantModel {
					t.Errorf("getModelForVoice() = %v, want %v", model, tt.wantModel)
				}
			}
		})
	}
}

func TestVoiceResolverGetVoice(t *testing.T) {
	vr := &voiceResolver{}
	err := vr.init()
	if err != nil {
		t.Fatalf("init() error = %v", err)
	}

	if len(vr.turboVoices) == 0 {
		t.Skip("No turbo voices available for testing")
	}

	// Test getting a valid voice
	voiceID := vr.turboVoices[0].ID
	voice, err := vr.getVoice(voiceID)
	if err != nil {
		t.Errorf("getVoice() unexpected error: %v", err)
	}
	if voice == nil {
		t.Error("getVoice() returned nil for valid voice ID")
	}
	if voice != nil && voice.ID != voiceID {
		t.Errorf("getVoice() returned voice with ID %v, want %v", voice.ID, voiceID)
	}

	// Test getting an unknown voice
	unknownVoice, err := vr.getVoice("unknown-voice-id")
	if err != nil {
		t.Errorf("getVoice() unexpected error for unknown voice: %v", err)
	}
	if unknownVoice != nil {
		t.Error("getVoice() should return nil for unknown voice ID")
	}
}

func TestVoiceResolverGetVoices(t *testing.T) {
	vr := &voiceResolver{}

	// Test without extended voices
	library, err := vr.getVoices(false)
	if err != nil {
		t.Errorf("getVoices(false) error = %v", err)
	}
	if library == nil {
		t.Fatal("getVoices(false) returned nil")
	}

	turboCount := len(library.Preset)
	if turboCount == 0 {
		t.Error("getVoices(false) returned empty preset")
	}

	// Test with extended voices
	libraryWithEx, err := vr.getVoices(true)
	if err != nil {
		t.Errorf("getVoices(true) error = %v", err)
	}
	if libraryWithEx == nil {
		t.Fatal("getVoices(true) returned nil")
	}

	// Extended should have more voices (or at least equal)
	if len(libraryWithEx.Preset) < turboCount {
		t.Errorf("getVoices(true) has fewer voices (%d) than getVoices(false) (%d)",
			len(libraryWithEx.Preset), turboCount)
	}
}

func TestVoiceResolverSearchVoices(t *testing.T) {
	vr := &voiceResolver{}
	err := vr.init()
	if err != nil {
		t.Fatalf("init() error = %v", err)
	}

	// Search for Chinese voices
	results, err := vr.searchVoices("中文")
	if err != nil {
		t.Errorf("searchVoices() error = %v", err)
	}

	// We should find some Chinese voices
	t.Logf("Found %d voices matching '中文'", len(results))

	// Search for something that likely doesn't exist
	noResults, err := vr.searchVoices("xyznonexistent12345")
	if err != nil {
		t.Errorf("searchVoices() error = %v", err)
	}
	if len(noResults) != 0 {
		t.Errorf("searchVoices() found %d results for nonexistent query, want 0", len(noResults))
	}
}

func TestVoiceResolverSearchVoicesCaseInsensitive(t *testing.T) {
	vr := &voiceResolver{}

	// Search should be case-insensitive
	results1, err := vr.searchVoices("female")
	if err != nil {
		t.Errorf("searchVoices() error = %v", err)
	}

	results2, err := vr.searchVoices("FEMALE")
	if err != nil {
		t.Errorf("searchVoices() error = %v", err)
	}

	results3, err := vr.searchVoices("Female")
	if err != nil {
		t.Errorf("searchVoices() error = %v", err)
	}

	// All should return the same number of results
	if len(results1) != len(results2) || len(results2) != len(results3) {
		t.Errorf("Case-insensitive search failed: %d vs %d vs %d",
			len(results1), len(results2), len(results3))
	}
}

func TestVoiceResolverGetFallbackVoice(t *testing.T) {
	vr := &voiceResolver{}

	voice, err := vr.getFallbackVoice()
	if err != nil {
		t.Errorf("getFallbackVoice() error = %v", err)
	}
	if voice == nil {
		t.Error("getFallbackVoice() returned nil")
	}
	if voice != nil && voice.ID == "" {
		t.Error("getFallbackVoice() returned voice with empty ID")
	}
}

func TestDefaultResolverGlobal(t *testing.T) {
	// Test that defaultResolver is properly initialized
	if defaultResolver == nil {
		t.Fatal("defaultResolver is nil")
	}

	// Test that it can be used
	voice, err := defaultResolver.getFallbackVoice()
	if err != nil {
		t.Errorf("defaultResolver.getFallbackVoice() error = %v", err)
	}
	if voice == nil {
		t.Error("defaultResolver.getFallbackVoice() returned nil")
	}
}
