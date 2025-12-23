/**
 * TC3-HMAC-SHA256 Signature Generation
 * Implements Tencent Cloud API v3 authentication
 */

import { createHash, createHmac } from 'crypto';
import type { TC3Signature } from '../types.js';

/**
 * Constants for Tencent Cloud TRTC TTS API
 */
const TTS_SERVICE = 'trtc';
const TTS_HOST = 'trtc.ai.tencentcloudapi.com';
const TTS_VERSION = '2019-07-22';

/**
 * Get current Unix timestamp in seconds
 */
function getTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Get date string in YYYY-MM-DD format
 */
function getDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * SHA256 hash function
 */
function sha256(data: string): string {
  return createHash('sha256').update(data, 'utf8').digest('hex');
}

/**
 * HMAC-SHA256 function
 * @param data - Data to hash
 * @param key - Secret key (string or Buffer)
 * @param encoding - Output encoding ('hex' or null for Buffer)
 * @returns Hex string or raw Buffer
 */
function hmacSha256(
  data: string,
  key: string | Buffer,
  encoding: 'hex' | null
): string | Buffer {
  const hmac = createHmac('sha256', key).update(data, 'utf8');
  return encoding === 'hex' ? hmac.digest('hex') : hmac.digest();
}

/**
 * Build TC3-HMAC-SHA256 signature for Tencent Cloud API
 *
 * @param action - API action name (e.g., 'TextToSpeech')
 * @param region - Tencent Cloud region (e.g., 'ap-beijing')
 * @param payload - Request payload as JSON string
 * @param secretId - Tencent Cloud Secret ID
 * @param secretKey - Tencent Cloud Secret Key
 * @returns Signature object with authorization header and all headers
 */
export function buildTC3Signature(
  action: string,
  region: string,
  payload: string,
  secretId: string,
  secretKey: string
): TC3Signature {
  // Get timestamp and date
  const timestamp = getTimestamp();
  const date = getDate(timestamp);

  // Step 1: Build canonical request
  // Format: HTTPMethod\nURI\nQueryString\nCanonicalHeaders\nSignedHeaders\nHashedPayload
  const hashedPayload = sha256(payload);
  const canonicalHeaders = [
    `content-type:application/json; charset=utf-8`,
    `host:${TTS_HOST}`,
    `x-tc-action:${action.toLowerCase()}`
  ].join('\n') + '\n'; // Must end with \n

  const signedHeaders = 'content-type;host;x-tc-action';

  const canonicalRequest = [
    'POST',
    '/',
    '', // Empty query string
    canonicalHeaders,
    signedHeaders,
    hashedPayload
  ].join('\n');

  // Step 2: Build string to sign
  // Format: Algorithm\nTimestamp\nCredentialScope\nHashedCanonicalRequest
  const credentialScope = `${date}/${TTS_SERVICE}/tc3_request`;
  const hashedCanonicalRequest = sha256(canonicalRequest);

  const stringToSign = [
    'TC3-HMAC-SHA256',
    timestamp.toString(),
    credentialScope,
    hashedCanonicalRequest
  ].join('\n');

  // Step 3: Calculate signature
  // CRITICAL: Intermediate keys MUST be raw Buffers, not hex strings
  // kDate = HMAC-SHA256("TC3" + secretKey, date)
  // kService = HMAC-SHA256(kDate, service)
  // kSigning = HMAC-SHA256(kService, "tc3_request")
  // signature = HMAC-SHA256(kSigning, stringToSign) -> hex
  const kDate = hmacSha256(date, `TC3${secretKey}`, null) as Buffer;
  const kService = hmacSha256(TTS_SERVICE, kDate, null) as Buffer;
  const kSigning = hmacSha256('tc3_request', kService, null) as Buffer;
  const signature = hmacSha256(stringToSign, kSigning, 'hex') as string;

  // Step 4: Build Authorization header
  const authorization = `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  // Return all headers required for API request
  return {
    authorization,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Host': TTS_HOST,
      'X-TC-Action': action,
      'X-TC-Timestamp': timestamp.toString(),
      'X-TC-Version': TTS_VERSION,
      'X-TC-Region': region,
      'Authorization': authorization
    }
  };
}

/**
 * Build TC3 signature specifically for SSE streaming requests
 * (Same as regular signature, but may need special handling for streaming)
 */
export function buildTC3SignatureSSE(
  action: string,
  region: string,
  payload: string,
  secretId: string,
  secretKey: string
): TC3Signature {
  // SSE uses the same signature algorithm
  return buildTC3Signature(action, region, payload, secretId, secretKey);
}
