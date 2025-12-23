/**
 * HTTP Request Handler for Tencent Cloud API
 * Handles both regular JSON requests and SSE streaming
 */

import https from 'https';
import type { TTSError } from '../types.js';

const TTS_HOST = 'trtc.ai.tencentcloudapi.com';

/**
 * Make a regular HTTP POST request to Tencent Cloud API
 *
 * @param headers - Request headers (including Authorization)
 * @param payload - Request payload as JSON string
 * @returns Parsed JSON response
 * @throws TTSError if request fails
 */
export async function makeRequest<T>(
  headers: Record<string, string>,
  payload: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname: TTS_HOST,
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        ...headers,
        'Content-Length': Buffer.byteLength(payload, 'utf8')
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          // Check for Tencent Cloud API errors
          if (response.Response?.Error) {
            const error = response.Response.Error;
            const ttsError: TTSError = new Error(
              error.Message || 'Unknown API error'
            ) as TTSError;
            ttsError.code = error.Code;
            ttsError.requestId = response.Response.RequestId;
            ttsError.statusCode = res.statusCode;
            reject(ttsError);
            return;
          }

          // Return the Response object
          resolve(response.Response as T);
        } catch (err) {
          const parseError: TTSError = new Error(
            `Failed to parse API response: ${(err as Error).message}`
          ) as TTSError;
          parseError.statusCode = res.statusCode;
          reject(parseError);
        }
      });
    });

    req.on('error', (err) => {
      const requestError: TTSError = new Error(
        `Request failed: ${err.message}`
      ) as TTSError;
      reject(requestError);
    });

    req.on('timeout', () => {
      req.destroy();
      const timeoutError: TTSError = new Error(
        'Request timeout'
      ) as TTSError;
      reject(timeoutError);
    });

    // Set timeout to 30 seconds
    req.setTimeout(30000);

    // Send request
    req.write(payload);
    req.end();
  });
}

/**
 * SSE Chunk data structure from Tencent Cloud
 */
export interface SSEChunk {
  Type?: string;
  Audio?: string;
  ChunkId?: string;
  RequestId?: string;
  [key: string]: unknown;
}

/**
 * Chunk callback for SSE streaming
 */
export type SSEChunkCallback = (chunk: SSEChunk) => void;

/**
 * Make an SSE streaming request to Tencent Cloud API
 *
 * @param headers - Request headers (including Authorization)
 * @param payload - Request payload as JSON string
 * @param onChunk - Callback function for each SSE chunk
 * @throws TTSError if request fails
 */
export async function makeStreamRequest(
  headers: Record<string, string>,
  payload: string,
  onChunk: SSEChunkCallback
): Promise<void> {
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname: TTS_HOST,
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        ...headers,
        'Content-Length': Buffer.byteLength(payload, 'utf8'),
        'Accept': 'text/event-stream'
      }
    };

    const req = https.request(options, (res) => {
      // Check for HTTP errors
      if (res.statusCode && res.statusCode >= 400) {
        let errorData = '';
        res.on('data', (chunk) => {
          errorData += chunk;
        });
        res.on('end', () => {
          const error: TTSError = new Error(
            `HTTP ${res.statusCode}: ${errorData}`
          ) as TTSError;
          error.statusCode = res.statusCode;
          reject(error);
        });
        return;
      }

      let buffer = '';

      res.on('data', (chunk) => {
        buffer += chunk.toString('utf8');

        // Process complete SSE messages (split by \n, not \n\n)
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;

          // Parse SSE format: "data: {...}"
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6); // Remove "data: " prefix
            // Debug: log the actual data string
            if (process.env.DEBUG_SSE) {
              console.log('[DEBUG SSE] Raw line:', line);
              console.log('[DEBUG SSE] Data string:', dataStr);
            }
            try {
              const data = JSON.parse(dataStr);

              // Check for error in SSE chunk
              if (data.Error) {
                const error: TTSError = new Error(
                  data.Error.Message || 'SSE stream error'
                ) as TTSError;
                error.code = data.Error.Code;
                reject(error);
                return;
              }

              // Call chunk callback
              onChunk(data);
            } catch (err) {
              // Skip malformed JSON chunks (don't log data to avoid exposing sensitive info)
              console.warn('Failed to parse SSE chunk - malformed JSON');
            }
          }
        }
      });

      res.on('end', () => {
        resolve();
      });

      res.on('error', (err) => {
        const streamError: TTSError = new Error(
          `Stream error: ${err.message}`
        ) as TTSError;
        reject(streamError);
      });
    });

    req.on('error', (err) => {
      const requestError: TTSError = new Error(
        `Request failed: ${err.message}`
      ) as TTSError;
      reject(requestError);
    });

    req.on('timeout', () => {
      req.destroy();
      const timeoutError: TTSError = new Error(
        'Stream request timeout'
      ) as TTSError;
      reject(timeoutError);
    });

    // Set timeout to 60 seconds for streaming
    req.setTimeout(60000);

    // Send request
    req.write(payload);
    req.end();
  });
}
