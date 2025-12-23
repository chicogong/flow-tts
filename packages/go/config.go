package flowtts

// Config holds the configuration for FlowTTS client.
type Config struct {
	// SecretID is the Tencent Cloud Secret ID
	SecretID string

	// SecretKey is the Tencent Cloud Secret Key
	SecretKey string

	// SdkAppID is the TRTC SDK App ID
	SdkAppID int64

	// Region is the Tencent Cloud region (default: "ap-beijing")
	Region string
}

// Validate validates the configuration.
func (c *Config) Validate() error {
	if c.SecretID == "" {
		return ErrInvalidConfig("secret_id is required")
	}
	if c.SecretKey == "" {
		return ErrInvalidConfig("secret_key is required")
	}
	if c.SdkAppID <= 0 {
		return ErrInvalidConfig("sdk_app_id must be positive")
	}
	if c.Region == "" {
		c.Region = "ap-beijing"
	}
	return nil
}
