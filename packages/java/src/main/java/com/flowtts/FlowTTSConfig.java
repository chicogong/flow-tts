package com.flowtts;

/**
 * Configuration for Flow TTS client.
 */
public class FlowTTSConfig {
    private final String secretId;
    private final String secretKey;
    private final long sdkAppId;
    private final String region;
    private final String endpoint;

    private FlowTTSConfig(Builder builder) {
        this.secretId = builder.secretId;
        this.secretKey = builder.secretKey;
        this.sdkAppId = builder.sdkAppId;
        this.region = builder.region;
        this.endpoint = builder.endpoint;
    }

    public String getSecretId() {
        return secretId;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public long getSdkAppId() {
        return sdkAppId;
    }

    public String getRegion() {
        return region;
    }

    public String getEndpoint() {
        return endpoint;
    }

    /**
     * Create a new builder for FlowTTSConfig.
     *
     * @return a new Builder instance
     */
    public static Builder builder() {
        return new Builder();
    }

    /**
     * Builder for FlowTTSConfig.
     */
    public static class Builder {
        private String secretId;
        private String secretKey;
        private long sdkAppId;
        private String region = "ap-beijing";
        private String endpoint = "trtc.ai.tencentcloudapi.com";

        /**
         * Set the Tencent Cloud Secret ID.
         *
         * @param secretId the Secret ID
         * @return this builder
         */
        public Builder secretId(String secretId) {
            this.secretId = secretId;
            return this;
        }

        /**
         * Set the Tencent Cloud Secret Key.
         *
         * @param secretKey the Secret Key
         * @return this builder
         */
        public Builder secretKey(String secretKey) {
            this.secretKey = secretKey;
            return this;
        }

        /**
         * Set the SDK App ID.
         *
         * @param sdkAppId the SDK App ID
         * @return this builder
         */
        public Builder sdkAppId(long sdkAppId) {
            this.sdkAppId = sdkAppId;
            return this;
        }

        /**
         * Set the region (default: ap-beijing).
         *
         * @param region the region
         * @return this builder
         */
        public Builder region(String region) {
            this.region = region;
            return this;
        }

        /**
         * Set the API endpoint (default: trtc.ai.tencentcloudapi.com).
         *
         * @param endpoint the endpoint
         * @return this builder
         */
        public Builder endpoint(String endpoint) {
            this.endpoint = endpoint;
            return this;
        }

        /**
         * Build the FlowTTSConfig instance.
         *
         * @return a new FlowTTSConfig
         * @throws IllegalArgumentException if required fields are missing
         */
        public FlowTTSConfig build() {
            if (secretId == null || secretId.isEmpty()) {
                throw new IllegalArgumentException("secretId is required");
            }
            if (secretKey == null || secretKey.isEmpty()) {
                throw new IllegalArgumentException("secretKey is required");
            }
            if (sdkAppId <= 0) {
                throw new IllegalArgumentException("sdkAppId must be positive");
            }
            return new FlowTTSConfig(this);
        }
    }
}
