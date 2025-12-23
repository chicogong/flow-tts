package flowtts

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"strings"
	"sync"
)

//go:embed data/voices-flow_01_turbo.json
var turboVoicesJSON []byte

//go:embed data/voices-flow_01_ex.json
var exVoicesJSON []byte

// voiceResolver manages voice library with O(1) lookups.
type voiceResolver struct {
	turboVoices   []Voice
	exVoices      []Voice
	turboVoiceMap map[string]Voice
	exVoiceMap    map[string]Voice
	initialized   bool
	initOnce      sync.Once
}

// Global voice resolver instance
var defaultResolver = &voiceResolver{}

// init initializes the voice library (lazy loading with sync.Once).
func (vr *voiceResolver) init() error {
	var initErr error
	vr.initOnce.Do(func() {
		// Load Turbo voices
		var turboData struct {
			Voices []Voice `json:"voices"`
		}
		if err := json.Unmarshal(turboVoicesJSON, &turboData); err != nil {
			initErr = fmt.Errorf("failed to load turbo voices: %w", err)
			return
		}
		vr.turboVoices = turboData.Voices
		vr.turboVoiceMap = make(map[string]Voice)
		for _, v := range vr.turboVoices {
			vr.turboVoiceMap[v.ID] = v
		}

		// Load Ex voices
		var exData struct {
			Voices []Voice `json:"voices"`
		}
		if err := json.Unmarshal(exVoicesJSON, &exData); err != nil {
			initErr = fmt.Errorf("failed to load ex voices: %w", err)
			return
		}
		vr.exVoices = exData.Voices
		vr.exVoiceMap = make(map[string]Voice)
		for _, v := range vr.exVoices {
			vr.exVoiceMap[v.ID] = v
		}

		vr.initialized = true
	})
	return initErr
}

// getModelForVoice returns the model name for a voice ID (O(1) lookup).
func (vr *voiceResolver) getModelForVoice(voiceID string) (string, error) {
	if err := vr.init(); err != nil {
		return "", err
	}

	if _, ok := vr.turboVoiceMap[voiceID]; ok {
		return "flow_01_turbo", nil
	}
	if _, ok := vr.exVoiceMap[voiceID]; ok {
		return "flow_01_ex", nil
	}

	return "", &TTSError{
		Code:    "UnknownVoiceID",
		Message: fmt.Sprintf("Unknown voice ID: %s. Use GetVoices() to see available voices.", voiceID),
	}
}

// getVoice returns voice metadata by ID.
func (vr *voiceResolver) getVoice(voiceID string) (*Voice, error) {
	if err := vr.init(); err != nil {
		return nil, err
	}

	if v, ok := vr.turboVoiceMap[voiceID]; ok {
		return &v, nil
	}
	if v, ok := vr.exVoiceMap[voiceID]; ok {
		return &v, nil
	}

	return nil, nil
}

// getVoices returns all available voices.
func (vr *voiceResolver) getVoices(includeExtended bool) (*VoiceLibrary, error) {
	if err := vr.init(); err != nil {
		return nil, err
	}

	preset := make([]Voice, len(vr.turboVoices))
	copy(preset, vr.turboVoices)

	if includeExtended {
		preset = append(preset, vr.exVoices...)
	}

	return &VoiceLibrary{Preset: preset}, nil
}

// searchVoices searches voices by name, description, or language.
func (vr *voiceResolver) searchVoices(query string) ([]Voice, error) {
	if err := vr.init(); err != nil {
		return nil, err
	}

	queryLower := strings.ToLower(query)
	var results []Voice

	allVoices := make([]Voice, 0, len(vr.turboVoices)+len(vr.exVoices))
	allVoices = append(allVoices, vr.turboVoices...)
	allVoices = append(allVoices, vr.exVoices...)
	for _, voice := range allVoices {
		if strings.Contains(strings.ToLower(voice.Name), queryLower) ||
			strings.Contains(strings.ToLower(voice.Description), queryLower) ||
			strings.Contains(strings.ToLower(voice.Language), queryLower) {
			results = append(results, voice)
		}
	}

	return results, nil
}

// getFallbackVoice returns the default fallback voice.
func (vr *voiceResolver) getFallbackVoice() (*Voice, error) {
	if err := vr.init(); err != nil {
		return nil, err
	}

	if len(vr.turboVoices) > 0 {
		return &vr.turboVoices[0], nil
	}

	return nil, &TTSError{
		Code:    "NoVoicesAvailable",
		Message: "No voices available in voice library",
	}
}
