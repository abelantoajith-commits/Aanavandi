import { verifyHmacSha256, getLocalDateString } from '../crypto/hmac';
import { db } from '../db/db';
import { Student } from '../db/students';
import { ScanRecord } from '../db/scans';
import { QRPayload } from './generateToken';

export type RejectionReason =
  | 'Invalid QR'
  | 'Unknown student'
  | 'Expired (wrong date)'
  | 'Already used today'
  | 'Concession expired';

export interface ValidationResult {
  valid: boolean;
  reason?: RejectionReason;
  student?: Student;
  scanRecord: ScanRecord;
  payload?: QRPayload;
}

/**
 * Validates a decoded QR code string against the PRD §6.3 validation pipeline
 * Short-circuits on first failure in exact specified order.
 */
export async function validateQRToken(
  rawQRText: string,
  conductorName = 'Abel Simon. (Badge #4092)',
  route = 'Route 104 Express (Central ⇄ North Gate)'
): Promise<ValidationResult> {
  const ts = Date.now();
  const todayStr = getLocalDateString();
  const recordId = 'scan_' + ts + '_' + Math.random().toString(36).substring(2, 7);

  // 1. QR decodes to valid JSON matching the schema -> else "Invalid QR"
  let payload: QRPayload;
  try {
    const parsed = JSON.parse(rawQRText);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      typeof parsed.sid !== 'string' ||
      typeof parsed.date !== 'string' ||
      typeof parsed.nonce !== 'string' ||
      typeof parsed.mac !== 'string'
    ) {
      const scanRecord: ScanRecord = {
        id: recordId,
        sid: 'UNKNOWN',
        date: todayStr,
        nonce: 'N/A',
        ts,
        result: 'rejected',
        reason: 'Invalid QR',
        conductorName,
        route
      };
      await db.scans.put(scanRecord);
      return { valid: false, reason: 'Invalid QR', scanRecord };
    }
    payload = parsed as QRPayload;
  } catch {
    const scanRecord: ScanRecord = {
      id: recordId,
      sid: 'UNKNOWN',
      date: todayStr,
      nonce: 'N/A',
      ts,
      result: 'rejected',
      reason: 'Invalid QR',
      conductorName,
      route
    };
    await db.scans.put(scanRecord);
    return { valid: false, reason: 'Invalid QR', scanRecord };
  }

  // 2. sid exists in the local roster -> else "Unknown student"
  let student = await db.students.get(payload.sid);
  if (!student) {
    student = await db.students.get(payload.sid.trim().toUpperCase());
  }
  if (!student) {
    const scanRecord: ScanRecord = {
      id: recordId,
      sid: payload.sid,
      date: payload.date,
      nonce: payload.nonce,
      ts,
      result: 'rejected',
      reason: 'Unknown student',
      conductorName,
      route
    };
    await db.scans.put(scanRecord);
    return { valid: false, reason: 'Unknown student', scanRecord, payload };
  }

  // 3. Recompute HMAC over sid|date|nonce and compare to mac -> else "Invalid QR" (tampered)
  const message = `${payload.sid}|${payload.date}|${payload.nonce}`;
  const isMacValid = await verifyHmacSha256(message, student.secret, payload.mac);
  if (!isMacValid) {
    const scanRecord: ScanRecord = {
      id: recordId,
      sid: payload.sid,
      date: payload.date,
      nonce: payload.nonce,
      ts,
      result: 'rejected',
      reason: 'Invalid QR',
      conductorName,
      route,
      studentName: student.name,
      course: student.course
    };
    await db.scans.put(scanRecord);
    return { valid: false, reason: 'Invalid QR', student, scanRecord, payload };
  }

  // 4. date === conductor device's local today -> else "Expired (wrong date)"
  if (payload.date !== todayStr) {
    const scanRecord: ScanRecord = {
      id: recordId,
      sid: payload.sid,
      date: payload.date,
      nonce: payload.nonce,
      ts,
      result: 'rejected',
      reason: 'Expired (wrong date)',
      conductorName,
      route,
      studentName: student.name,
      course: student.course
    };
    await db.scans.put(scanRecord);
    return { valid: false, reason: 'Expired (wrong date)', student, scanRecord, payload };
  }

  // 5. Anti-Replay: check if this exact token nonce was already scanned & accepted today
  const existingAcceptedScans = await db.scans
    .where('sid')
    .equals(payload.sid)
    .filter((s) => s.date === payload.date && s.result === 'accepted')
    .toArray();

  const isDuplicateNonce = existingAcceptedScans.some((s) => s.nonce === payload.nonce);

  if (isDuplicateNonce) {
    const scanRecord: ScanRecord = {
      id: recordId,
      sid: payload.sid,
      date: payload.date,
      nonce: payload.nonce,
      ts,
      result: 'rejected',
      reason: 'Already used today',
      conductorName,
      route,
      studentName: student.name,
      course: student.course
    };
    await db.scans.put(scanRecord);
    return { valid: false, reason: 'Already used today', student, scanRecord, payload };
  }

  // 6. Student's concession window (validFrom–validUntil) contains today -> else "Concession expired"
  if (todayStr < student.validFrom || todayStr > student.validUntil) {
    const scanRecord: ScanRecord = {
      id: recordId,
      sid: payload.sid,
      date: payload.date,
      nonce: payload.nonce,
      ts,
      result: 'rejected',
      reason: 'Concession expired',
      conductorName,
      route,
      studentName: student.name,
      course: student.course
    };
    await db.scans.put(scanRecord);
    return { valid: false, reason: 'Concession expired', student, scanRecord, payload };
  }

  // 7. All pass -> Accepted
  const scanRecord: ScanRecord = {
    id: recordId,
    sid: payload.sid,
    date: payload.date,
    nonce: payload.nonce,
    ts,
    result: 'accepted',
    conductorName,
    route,
    studentName: student.name,
    course: student.course
  };
  await db.scans.put(scanRecord);

  // Update student's local usedDates calendar record
  const currentUsedDates = student.usedDates || [];
  if (!currentUsedDates.includes(todayStr)) {
    const updatedDates = [...currentUsedDates, todayStr];
    await db.students.update(student.sid, { usedDates: updatedDates });
  }

  return {
    valid: true,
    student,
    scanRecord,
    payload
  };
}
