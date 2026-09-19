export interface ScanRecord {
  id: string;               // uuid
  sid: string;
  date: string;             // ISO date on the token (YYYY-MM-DD)
  nonce: string;
  ts: number;               // epoch ms of the scan
  result: "accepted" | "rejected";
  reason?: string;          // populated when rejected ('Invalid QR', 'Expired (wrong date)', 'Already used today', 'Unknown student', 'Concession expired')
  conductorName?: string;
  route?: string;
  studentName?: string;     // cached helper for instant log rendering
  course?: string;          // cached helper for instant log rendering
}
