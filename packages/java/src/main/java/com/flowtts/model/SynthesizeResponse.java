package com.flowtts.model;

/**
 * Response from a synchronous TTS synthesis request.
 */
public class SynthesizeResponse {
    private final byte[] audio;
    private final String requestId;
    private final String sessionId;
    private final String codec;

    public SynthesizeResponse(byte[] audio, String requestId, String sessionId, String codec) {
        this.audio = audio;
        this.requestId = requestId;
        this.sessionId = sessionId;
        this.codec = codec;
    }

    /**
     * Get the audio data as a byte array.
     *
     * @return the audio bytes
     */
    public byte[] getAudio() {
        return audio;
    }

    /**
     * Get the request ID from Tencent Cloud.
     *
     * @return the request ID
     */
    public String getRequestId() {
        return requestId;
    }

    /**
     * Get the session ID for this synthesis.
     *
     * @return the session ID
     */
    public String getSessionId() {
        return sessionId;
    }

    /**
     * Get the audio codec used.
     *
     * @return the codec name
     */
    public String getCodec() {
        return codec;
    }

    /**
     * Get the content type for the audio data.
     *
     * @return the MIME content type
     */
    public String getContentType() {
        switch (codec) {
            case "mp3":
                return "audio/mpeg";
            case "wav":
                return "audio/wav";
            case "pcm":
                return "audio/pcm";
            case "ogg_opus":
                return "audio/ogg";
            case "flac":
                return "audio/flac";
            default:
                return "application/octet-stream";
        }
    }
}
