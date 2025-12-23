package com.flowtts.model;

/**
 * Options for text-to-speech synthesis.
 */
public class SynthesizeOptions {
    private String text;
    private String voice;
    private String model;
    private String codec;
    private int sampleRate;
    private double speed;
    private double volume;
    private int pitch;

    private SynthesizeOptions(Builder builder) {
        this.text = builder.text;
        this.voice = builder.voice;
        this.model = builder.model;
        this.codec = builder.codec;
        this.sampleRate = builder.sampleRate;
        this.speed = builder.speed;
        this.volume = builder.volume;
        this.pitch = builder.pitch;
    }

    public String getText() {
        return text;
    }

    public String getVoice() {
        return voice;
    }

    public String getModel() {
        return model;
    }

    public String getCodec() {
        return codec;
    }

    public int getSampleRate() {
        return sampleRate;
    }

    public double getSpeed() {
        return speed;
    }

    public double getVolume() {
        return volume;
    }

    public int getPitch() {
        return pitch;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String text;
        private String voice = "alloy";
        private String model = "flow-01-turbo";
        private String codec = "wav";
        private int sampleRate = 24000;
        private double speed = 1.0;
        private double volume = 1.0;
        private int pitch = 0;

        /**
         * Set the text to synthesize (required).
         *
         * @param text the text to convert to speech
         * @return this builder
         */
        public Builder text(String text) {
            this.text = text;
            return this;
        }

        /**
         * Set the voice ID (default: alloy).
         * Can be an OpenAI voice name or a Tencent voice ID.
         *
         * @param voice the voice identifier
         * @return this builder
         */
        public Builder voice(String voice) {
            this.voice = voice;
            return this;
        }

        /**
         * Set the model (default: flow-01-turbo).
         * Options: flow-01-turbo, flow-01-ex
         *
         * @param model the model name
         * @return this builder
         */
        public Builder model(String model) {
            this.model = model;
            return this;
        }

        /**
         * Set the audio codec (default: mp3).
         * Options: mp3, wav, pcm, ogg_opus, flac
         *
         * @param codec the audio codec
         * @return this builder
         */
        public Builder codec(String codec) {
            this.codec = codec;
            return this;
        }

        /**
         * Set the sample rate (default: 24000).
         * Common values: 8000, 16000, 22050, 24000, 44100, 48000
         *
         * @param sampleRate the sample rate in Hz
         * @return this builder
         */
        public Builder sampleRate(int sampleRate) {
            this.sampleRate = sampleRate;
            return this;
        }

        /**
         * Set the speech speed (default: 1.0).
         * Range: 0.25 to 4.0
         *
         * @param speed the speed multiplier
         * @return this builder
         */
        public Builder speed(double speed) {
            this.speed = speed;
            return this;
        }

        /**
         * Set the volume (default: 1.0).
         * Range: 0.5 to 2.0
         *
         * @param volume the volume multiplier
         * @return this builder
         */
        public Builder volume(double volume) {
            this.volume = volume;
            return this;
        }

        /**
         * Set the pitch adjustment in semitones (default: 0).
         * Range: -12 to 12
         *
         * @param pitch the pitch adjustment in semitones
         * @return this builder
         */
        public Builder pitch(int pitch) {
            this.pitch = pitch;
            return this;
        }

        /**
         * Build the SynthesizeOptions instance.
         *
         * @return a new SynthesizeOptions
         * @throws IllegalArgumentException if text is not provided
         */
        public SynthesizeOptions build() {
            if (text == null || text.isEmpty()) {
                throw new IllegalArgumentException("text is required");
            }
            return new SynthesizeOptions(this);
        }
    }
}
