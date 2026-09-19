/**
 * Web Crypto API HMAC-SHA256 helpers (works 100% offline in browser)
 */

/**
 * Converts a base64 string to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converts ArrayBuffer / Uint8Array to base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Returns the local date formatted as YYYY-MM-DD
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates a random alphanumeric hexadecimal nonce
 */
export function generateNonce(length = 8): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, length)
    .toUpperCase();
}

/**
 * Computes HMAC-SHA256 over message string using base64-encoded secret key
 */
export async function computeHmacSha256(message: string, secretBase64: string): Promise<string> {
  const enc = new TextEncoder();
  const keyData = base64ToUint8Array(secretBase64);
  const messageData = enc.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return arrayBufferToBase64(signature);
}

/**
 * Constant-time comparison for MAC verification to prevent timing attacks
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Verifies HMAC-SHA256 signature
 */
export async function verifyHmacSha256(
  message: string,
  secretBase64: string,
  macBase64: string
): Promise<boolean> {
  try {
    const computedMac = await computeHmacSha256(message, secretBase64);
    return constantTimeCompare(computedMac, macBase64);
  } catch (err) {
    console.error('HMAC verification error:', err);
    return false;
  }
}
