package flowtts

import (
	"testing"
)

func TestConfigValidate(t *testing.T) {
	tests := []struct {
		name    string
		config  Config
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid config",
			config: Config{
				SecretID:  "test-secret-id",
				SecretKey: "test-secret-key",
				SdkAppID:  1400000000,
				Region:    "ap-beijing",
			},
			wantErr: false,
		},
		{
			name: "valid config without region (should use default)",
			config: Config{
				SecretID:  "test-secret-id",
				SecretKey: "test-secret-key",
				SdkAppID:  1400000000,
			},
			wantErr: false,
		},
		{
			name: "missing secret_id",
			config: Config{
				SecretKey: "test-secret-key",
				SdkAppID:  1400000000,
			},
			wantErr: true,
			errMsg:  "secret_id is required",
		},
		{
			name: "missing secret_key",
			config: Config{
				SecretID: "test-secret-id",
				SdkAppID: 1400000000,
			},
			wantErr: true,
			errMsg:  "secret_key is required",
		},
		{
			name: "invalid sdk_app_id (zero)",
			config: Config{
				SecretID:  "test-secret-id",
				SecretKey: "test-secret-key",
				SdkAppID:  0,
			},
			wantErr: true,
			errMsg:  "sdk_app_id must be positive",
		},
		{
			name: "invalid sdk_app_id (negative)",
			config: Config{
				SecretID:  "test-secret-id",
				SecretKey: "test-secret-key",
				SdkAppID:  -1,
			},
			wantErr: true,
			errMsg:  "sdk_app_id must be positive",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.config.Validate()
			if tt.wantErr {
				if err == nil {
					t.Errorf("Validate() expected error, got nil")
					return
				}
				if ttsErr, ok := err.(*TTSError); ok {
					if ttsErr.Message != tt.errMsg {
						t.Errorf("Validate() error message = %v, want %v", ttsErr.Message, tt.errMsg)
					}
				}
			} else {
				if err != nil {
					t.Errorf("Validate() unexpected error: %v", err)
				}
			}
		})
	}
}

func TestConfigDefaultRegion(t *testing.T) {
	config := Config{
		SecretID:  "test-secret-id",
		SecretKey: "test-secret-key",
		SdkAppID:  1400000000,
	}

	err := config.Validate()
	if err != nil {
		t.Fatalf("Validate() unexpected error: %v", err)
	}

	if config.Region != "ap-beijing" {
		t.Errorf("Region = %v, want ap-beijing", config.Region)
	}
}
