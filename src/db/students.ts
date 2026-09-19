export interface Student {
  sid: string;              // "S001"
  name: string;
  course: string;
  secret: string;           // shared HMAC key material (demo-only; base64)
  validFrom: string;        // ISO date (YYYY-MM-DD)
  validUntil: string;       // ISO date (YYYY-MM-DD)
  usedDates: string[];      // ISO dates, for the calendar view
  approvalStatus: "pending" | "approved";  // gates access to the dashboard (§5.2.0)
  documentBlob?: Blob;      // uploaded file, stored locally only, never transmitted
  documentName?: string;    // original filename, for the Profile tab display
  institution?: string;     // e.g. "State Institute of Technology"
  route?: string;           // e.g. "Route 104 Express (Central ⇄ North Gate)"
  passId?: string;          // e.g. "#GP-7749-KL"
  avatarUrl?: string;       // optional avatar picture/placeholder
}
