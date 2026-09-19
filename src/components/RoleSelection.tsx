import { useState, useEffect } from 'react';
import { db } from '../db/db';
import { Student } from '../db/students';

interface RoleSelectionProps {
  onSelectRole: (role: 'student' | 'conductor', studentId?: string) => void;
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('S001');
  const [showStudentPicker, setShowStudentPicker] = useState<boolean>(false);

  useEffect(() => {
    db.students.toArray().then((allStudents) => {
      if (allStudents.length > 0) {
        setStudents(allStudents);
        setSelectedStudentId(allStudents[0].sid);
      }
    });
  }, []);

  const handleStudentSelect = () => {
    onSelectRole('student', selectedStudentId);
  };

  const handleConductorSelect = () => {
    onSelectRole('conductor');
  };

  const currentStudent = students.find((s) => s.sid === selectedStudentId);

  return (
    <main className="flex flex-col relative w-full pt-safe pb-safe bg-surface min-h-screen">
      <div className="flex flex-col w-full px-margin pb-space-lg max-w-md mx-auto">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mt-space-md mb-space-lg">
          <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-surface-container-lowest shadow-md mb-space-md p-space-xs border border-surface-container">
            <div className="w-16 h-16 rounded-xl bg-primary-container flex items-center justify-center text-white shadow-inner">
              <span className="material-symbols-outlined text-[36px]">directions_bus</span>
            </div>
            <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-tertiary-container shadow-sm">
              <span className="material-symbols-outlined text-on-tertiary-container text-[14px]">offline_bolt</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md uppercase tracking-wider mb-space-xs font-semibold">
            GO PASS • TRANSIT
          </div>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface font-extrabold tracking-tight">
            Bus Concession
          </h1>
          <p className="font-body-md text-body-md text-secondary mt-1 max-w-xs px-space-xs">
            Fast, offline-verified student bus travel pass
          </p>
        </div>

        {/* Role Cards */}
        <div className="flex flex-col gap-space-md w-full">
          {/* Student Role Card */}
          <div className="rounded-2xl bg-surface-container-lowest shadow-md border border-surface-container overflow-hidden">
            <button
              id="btn-student"
              type="button"
              onClick={handleStudentSelect}
              className="group relative text-left w-full p-space-md active:scale-[0.98] transition-all duration-150 overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-primary-fixed/20 pointer-events-none group-hover:scale-110 transition-transform"></div>
              
              <div className="flex items-start justify-between gap-space-sm mb-space-sm">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-container text-on-primary shadow-sm">
                  <span className="material-symbols-outlined text-[28px] fill">school</span>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-md text-label-md font-medium ${
                  currentStudent?.approvalStatus === 'approved' 
                    ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    currentStudent?.approvalStatus === 'approved' ? 'bg-tertiary' : 'bg-amber-600'
                  }`}></span>
                  {currentStudent?.approvalStatus === 'approved' ? 'Active Pass' : 'Pending Approval'}
                </span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    I'm a Student
                  </h2>
                  <span className="material-symbols-outlined text-primary-container text-[22px] transform group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary mt-1">
                  Access your dynamic QR pass, concession calendar & profile
                </p>
              </div>

              <div className="mt-space-sm pt-space-xs flex items-center gap-space-sm">
                <div className="flex items-center gap-1 text-on-surface-variant font-label-lg text-label-lg">
                  <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                  <span>Instant Display</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-outline-variant"></div>
                <div className="flex items-center gap-1 text-on-surface-variant font-label-lg text-label-lg">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span className="font-semibold text-primary">{currentStudent?.name || 'Sarah Jenkins'}</span>
                </div>
              </div>
            </button>

            {/* Quick Demo Student Selector Dropdown Toggle */}
            <div className="bg-surface-container-low px-4 py-2 border-t border-surface-container flex items-center justify-between">
              <span className="text-xs text-secondary font-medium">Demo Student:</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStudentPicker(!showStudentPicker);
                }}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>{currentStudent?.name} ({currentStudent?.sid})</span>
                <span className="material-symbols-outlined text-[16px]">
                  {showStudentPicker ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            </div>

            {showStudentPicker && (
              <div className="p-2 bg-surface border-t border-surface-container flex flex-col gap-1">
                {students.map((stu) => (
                  <button
                    key={stu.sid}
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(stu.sid);
                      setShowStudentPicker(false);
                    }}
                    className={`text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      stu.sid === selectedStudentId
                        ? 'bg-primary-container text-white font-semibold'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    <div>
                      <div>{stu.name} <span className="opacity-80 font-mono text-[10px]">({stu.sid})</span></div>
                      <div className="text-[10px] opacity-75 truncate">{stu.course}</div>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                      stu.approvalStatus === 'approved' 
                        ? (stu.sid === selectedStudentId ? 'bg-white/20 text-white' : 'bg-green-100 text-green-800')
                        : (stu.sid === selectedStudentId ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800')
                    }`}>
                      {stu.approvalStatus}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Conductor Role Card */}
          <button
            id="btn-conductor"
            type="button"
            onClick={handleConductorSelect}
            className="group relative text-left w-full p-space-md rounded-2xl bg-surface-container-lowest shadow-md border border-surface-container active:scale-[0.98] transition-all duration-150 overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-secondary-container/40 pointer-events-none group-hover:scale-110 transition-transform"></div>
            
            <div className="flex items-start justify-between gap-space-sm mb-space-sm">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-inverse-surface text-inverse-on-surface shadow-sm">
                <span className="material-symbols-outlined text-[28px] fill">qr_code_scanner</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-medium">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                Inspection Tool
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  I'm a Conductor
                </h2>
                <span className="material-symbols-outlined text-inverse-surface text-[22px] transform group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary mt-1">
                Scan QR tickets, verify passes & check inspection logs
              </p>
            </div>

            <div className="mt-space-sm pt-space-xs flex items-center gap-space-sm">
              <div className="flex items-center gap-1 text-on-surface-variant font-label-lg text-label-lg">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>100ms Optical Auth</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-outline-variant"></div>
              <div className="flex items-center gap-1 text-on-surface-variant font-label-lg text-label-lg">
                <span className="material-symbols-outlined text-[16px]">history</span>
                <span>Offline Logbook</span>
              </div>
            </div>
          </button>
        </div>

        {/* Footer Notice */}
        <div className="flex flex-col items-center justify-center text-center mt-space-lg pt-space-xs">
          <div className="inline-flex items-center gap-1.5 text-on-surface-variant font-label-lg text-label-lg">
            <span className="material-symbols-outlined text-tertiary text-[18px]">shield</span>
            <span>State Public Transit Corporation</span>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <span className="font-bold text-tertiary">100% Offline Capable</span>
          </div>
        </div>
      </div>
    </main>
  );
}
