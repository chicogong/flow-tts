package com.flowtts.exception;

/**
 * Exception thrown when a Flow TTS operation fails.
 */
public class FlowTTSException extends RuntimeException {
    private final String code;
    private final String requestId;

    public FlowTTSException(String message) {
        super(message);
        this.code = null;
        this.requestId = null;
    }

    public FlowTTSException(String message, Throwable cause) {
        super(message, cause);
        this.code = null;
        this.requestId = null;
    }

    public FlowTTSException(String code, String message, String requestId) {
        super(message);
        this.code = code;
        this.requestId = requestId;
    }

    public FlowTTSException(String code, String message, String requestId, Throwable cause) {
        super(message, cause);
        this.code = code;
        this.requestId = requestId;
    }

    /**
     * Get the error code from Tencent Cloud.
     *
     * @return the error code, or null if not available
     */
    public String getCode() {
        return code;
    }

    /**
     * Get the request ID associated with the error.
     *
     * @return the request ID, or null if not available
     */
    public String getRequestId() {
        return requestId;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder("FlowTTSException: ");
        if (code != null) {
            sb.append("[").append(code).append("] ");
        }
        sb.append(getMessage());
        if (requestId != null) {
            sb.append(" (RequestId: ").append(requestId).append(")");
        }
        return sb.toString();
    }
}
