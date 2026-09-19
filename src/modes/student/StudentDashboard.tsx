import { useState, useEffect, useCallback } from 'react';
import { db } from '../../db/db';
import { Student } from '../../db/students';
import { generateStudentQRToken, QRPayload } from '../../qr/generateToken';
import StudentOnboardingGate from './StudentOnboardingGate';
import MyQR from './MyQR';
import Calendar from './Calendar';
import Profile from './Profile';

interface StudentDashboardProps {
  studentId: string;
  onSwitchRole: () => void;
}

type StudentTab = 'pass' | 'calendar' | 'profile';

export default function StudentDashboard({
  studentId,
  onSwitchRole
}: StudentDashboardProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<StudentTab>('pass');
  const [loading, setLoading] = useState(true);
  const [qrTokenString, setQrTokenString] = useState<string>('');
  const [currentPayload, setCurrentPayload] = useState<QRPayload | null>(null);

  // Load student data from Dexie
  const loadStudent = useCallback(async () => {
    const s = await db.students.get(studentId);
    if (s) {
      setStudent(s);
      if (s.approvalStatus === 'approved') {
        const { jsonString, payload } = await generateStudentQRToken(s);
        setQrTokenString(jsonString);
        setCurrentPayload(payload);
      }
    }
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  // Handle regenerating QR code with a fresh nonce and HMAC signature
  const handleRegenerateQR = async () => {
    if (!student) return;
    const { jsonString, payload } = await generateStudentQRToken(student);
    setQrTokenString(jsonString);
    setCurrentPayload(payload);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="text-sm font-semibold text-primary animate-pulse">Loading Student Pass...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 text-center">
        <p className="text-secondary text-sm mb-4">Student record not found for {studentId}.</p>
        <button
          onClick={onSwitchRole}
          className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
        >
          Return to Role Selection
        </button>
      </div>
    );
  }

  // If student is still pending approval, display Onboarding Gate
  if (student.approvalStatus === 'pending') {
    return (
      <StudentOnboardingGate
        student={student}
        onApproved={async () => {
          await loadStudent();
          setActiveTab('pass');
        }}
      />
    );
  }

  const handleResetApproval = async () => {
    await db.students.update(student.sid, { approvalStatus: 'pending' });
    await loadStudent();
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col relative text-on-surface">
      {/* Fixed Top Header */}
      <header className="fixed top-0 w-full z-40 pt-safe bg-surface/85 backdrop-blur-xl border-b border-surface-container shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
        <div className="h-14 px-gutter flex items-center justify-between gap-space-sm max-w-md mx-auto">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary-container flex items-center justify-center text-white flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-lg">directions_bus</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-sm text-on-surface tracking-tight font-bold">GoPass</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[9px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                  OFFLINE
                </span>
              </div>
              <span className="font-mono text-[10px] text-secondary truncate">
                {student.name} • {student.sid}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onSwitchRole}
              title="Switch to Conductor mode or select another student"
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary flex items-center gap-1 border border-surface-container"
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              <span className="hidden sm:inline">Role</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-16 pb-24 max-w-md mx-auto w-full">
        {activeTab === 'pass' && (
          <MyQR
            student={student}
            qrPayload={qrTokenString}
            tokenPayload={currentPayload}
            onRegenerate={handleRegenerateQR}
          />
        )}
        {activeTab === 'calendar' && (
          <Calendar student={student} />
        )}
        {activeTab === 'profile' && (
          <Profile
            student={student}
            onSwitchRole={onSwitchRole}
            onResetApproval={handleResetApproval}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full z-40 pb-safe bg-surface/90 backdrop-blur-xl border-t border-surface-container shadow-[0_-1px_12px_rgba(0,0,0,0.04)]">
        <div className="flex justify-around items-center h-16 px-space-xs max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('pass')}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] transition-colors ${
              activeTab === 'pass' ? 'text-primary font-bold' : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className={`material-symbols-outlined text-[24px] ${activeTab === 'pass' ? 'fill' : ''}`}>
              qr_code_2
            </span>
            <span className="text-[11px] mt-0.5">My Pass</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] transition-colors ${
              activeTab === 'calendar' ? 'text-primary font-bold' : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className={`material-symbols-outlined text-[24px] ${activeTab === 'calendar' ? 'fill' : ''}`}>
              calendar_month
            </span>
            <span className="text-[11px] mt-0.5">Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] transition-colors ${
              activeTab === 'profile' ? 'text-primary font-bold' : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className={`material-symbols-outlined text-[24px] ${activeTab === 'profile' ? 'fill' : ''}`}>
              badge
            </span>
            <span className="text-[11px] mt-0.5">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
