package com.flowtts.model;

/**
 * A chunk of audio data from a streaming TTS response.
 */
public class StreamChunk {
    private final byte[] audio;
    private final String requestId;
    private final String sessionId;
    private final boolean isFinal;
    private final int subtitleSeq;

    public StreamChunk(byte[] audio, String requestId, String sessionId, boolean isFinal, int subtitleSeq) {
        this.audio = audio;
        this.requestId = requestId;
        this.sessionId = sessionId;
        this.isFinal = isFinal;
        this.subtitleSeq = subtitleSeq;
    }

    /**
     * Get the audio data for this chunk.
     *
     * @return the audio bytes, may be empty for the final chunk
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
     * Get the session ID for this stream.
     *
     * @return the session ID
     */
    public String getSessionId() {
        return sessionId;
    }

    /**
     * Check if this is the final chunk in the stream.
     *
     * @return true if this is the last chunk
     */
    public boolean isFinal() {
        return isFinal;
    }

    /**
     * Get the subtitle sequence number.
     *
     * @return the sequence number
     */
    public int getSubtitleSeq() {
        return subtitleSeq;
    }

    /**
     * Check if this chunk contains audio data.
     *
     * @return true if audio data is present
     */
    public boolean hasAudio() {
        return audio != null && audio.length > 0;
    }
}
