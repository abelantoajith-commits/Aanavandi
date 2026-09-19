import { db } from './db';
import { Student } from './students';
import { ConductorSettings } from './settings';
import { getLocalDateString } from '../crypto/hmac';

const currentYear = new Date().getFullYear();

export const DEMO_STUDENTS: Student[] = [
  {
    sid: "S001",
    name: "Abel Anto",
    course: "B.Tech Computer Science (Sem 1)",
    institution: "Christ COllege Of Engineering, Irinjalakuda",
    route: "Route 104 Express (Central ⇄ North Gate)",
    passId: "#GP-7749-KL",
    secret: "c3R1ZGVudF9zZWNyZXRfczAwMQ==", // base64 of 'student_secret_s001'
    validFrom: `${currentYear - 1}-01-01`,
    validUntil: `${currentYear + 1}-12-31`,
    usedDates: [],
    approvalStatus: "pending", // Starts as pending to demonstrate onboarding gate (§5.2.0)
    documentName: undefined,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
  },
  {
    sid: "S002",
    name: "Priya Nair",
    course: "B.Sc Physics (Sem 3)",
    institution: "Govt Science College, East Campus",
    route: "Route 88 Metro Feeder (Town Hall ⇄ Science Block)",
    passId: "#GP-8832-KL",
    secret: "c3R1ZGVudF9zZWNyZXRfczAwMg==", // base64 of 'student_secret_s002'
    validFrom: `${currentYear - 1}-01-01`,
    validUntil: `${currentYear + 1}-12-31`,
    usedDates: [],
    approvalStatus: "approved",
    documentName: "priya_nair_id_card.pdf",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80"
  },
  {
    sid: "S003",
    name: "Arun Kumar",
    course: "B.Com Finance (Sem 6)",
    institution: "St. Thomas College of Commerce",
    route: "Route 12 City Circular (Depot ⇄ Station)",
    passId: "#GP-4410-KL",
    secret: "c3R1ZGVudF9zZWNyZXRfczAwMw==", // base64 of 'student_secret_s003'
    validFrom: `${currentYear - 2}-01-01`,
    validUntil: `${currentYear - 1}-08-31`, // Expired validity for rejection testing (§6.3 check 6)
    usedDates: [],
    approvalStatus: "approved",
    documentName: "arun_commerce_pass.pdf",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80"
  },
  {
    sid: "S004",
    name: "Deepak Mohan",
    course: "Diploma Mechanical (Sem 4)",
    institution: "Govt Polytechnic College",
    route: "Route 104 Express (Central ⇄ North Gate)",
    passId: "#GP-9122-KL",
    secret: "c3R1ZGVudF9zZWNyZXRfczAwNA==", // base64 of 'student_secret_s004'
    validFrom: `${currentYear - 1}-01-01`,
    validUntil: `${currentYear + 1}-12-31`,
    usedDates: [],
    approvalStatus: "pending",
    documentName: undefined,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
  },
  {
    sid: "S005",
    name: "Ananya Rao",
    course: "BA English Literature (Sem 2)",
    institution: "National Arts & Science Academy",
    route: "Route 45 Suburban Fast (Junction ⇄ University)",
    passId: "#GP-6204-KL",
    secret: "c3R1ZGVudF9zZWNyZXRfczAwNQ==", // base64 of 'student_secret_s005'
    validFrom: `${currentYear - 1}-01-01`,
    validUntil: `${currentYear + 1}-12-31`,
    usedDates: [],
    approvalStatus: "approved",
    documentName: "ananya_college_cert.jpg",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80"
  }
];

export const DEFAULT_SETTINGS: ConductorSettings = {
  id: "active_settings",
  conductorName: "Rajesh K. (Badge #4092)",
  route: "Route 104 Express (Central ⇄ North Gate)",
  lastSyncedAt: Date.now() - 3600000 * 3 // 3 hours ago
};

export async function seedDatabase(force = false): Promise<void> {
  const studentCount = await db.students.count();
  if (studentCount === 0 || force) {
    if (force) {
      await db.students.clear();
    }
    await db.students.bulkPut(DEMO_STUDENTS);
  } else {
    // Migration: ensure existing student records in IndexedDB have valid date ranges for current year
    const existing = await db.students.toArray();
    const today = getLocalDateString();
    for (const st of existing) {
      if (st.sid !== 'S003') {
        if (today < st.validFrom || today > st.validUntil) {
          await db.students.update(st.sid, {
            validFrom: `${currentYear - 1}-01-01`,
            validUntil: `${currentYear + 1}-12-31`
          });
        }
      }
    }
  }

  const existingSettings = await db.settings.get("active_settings");
  if (!existingSettings || force) {
    await db.settings.put(DEFAULT_SETTINGS);
  }
}
