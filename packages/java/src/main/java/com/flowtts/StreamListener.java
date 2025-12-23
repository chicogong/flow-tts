package com.flowtts;

import com.flowtts.model.StreamChunk;

/**
 * Listener interface for streaming TTS responses.
 */
public interface StreamListener {
    /**
     * Called when a new audio chunk is received.
     *
     * @param chunk the audio chunk
     */
    void onChunk(StreamChunk chunk);

    /**
     * Called when the stream is complete.
     */
    void onComplete();

    /**
     * Called when an error occurs during streaming.
     *
     * @param error the exception that occurred
     */
    void onError(Exception error);
}
