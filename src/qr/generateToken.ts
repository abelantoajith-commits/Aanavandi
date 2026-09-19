import { computeHmacSha256, generateNonce, getLocalDateString } from '../crypto/hmac';
import { Student } from '../db/students';

export interface QRPayload {
  sid: string;
  date: string;  // ISO YYYY-MM-DD
  nonce: string; // Random hex
  mac: string;   // HMAC-SHA256 signature
}

/**
 * Generates the offline HMAC-SHA256 dynamic QR token for a student
 * Payload format per PRD §6.3:
 * data = `${sid}|${date}|${nonce}`
 * mac = HMAC-SHA256(data, student.secret)
 */
export async function generateStudentQRToken(
  student: Student,
  customDate?: string,
  customNonce?: string
): Promise<{ payload: QRPayload; jsonString: string }> {
  // Use today's local date in YYYY-MM-DD format if not overridden
  const date = customDate || getLocalDateString();
  const nonce = customNonce || generateNonce(8);

  const message = `${student.sid}|${date}|${nonce}`;
  const mac = await computeHmacSha256(message, student.secret);

  const payload: QRPayload = {
    sid: student.sid,
    date,
    nonce,
    mac
  };

  return {
    payload,
    jsonString: JSON.stringify(payload)
  };
}
