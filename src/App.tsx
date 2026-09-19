import { useState, useEffect } from 'react';
import { seedDatabase } from './db/seed';
import RoleSelection from './components/RoleSelection';
import StudentDashboard from './modes/student/StudentDashboard';
import ConductorDashboard from './modes/conductor/ConductorDashboard';

export type AppRole = 'student' | 'conductor' | null;

export default function App() {
  const [role, setRole] = useState<AppRole>(null);
  const [studentId, setStudentId] = useState<string>('S001');
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // Seed DB on launch if empty
    seedDatabase().then(() => {
      setDbReady(true);
      // Check URL hash if user explicitly navigated to #student or #conductor
      const hash = window.location.hash.toLowerCase();
      if (hash === '#student') {
        setRole('student');
      } else if (hash === '#conductor') {
        setRole('conductor');
      } else {
        // Default to home page (Role Selection) on website load
        setRole(null);
      }
    });

    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#student') {
        setRole('student');
      } else if (hash === '#conductor') {
        setRole('conductor');
      } else {
        setRole(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectRole = (newRole: 'student' | 'conductor', sid = 'S001') => {
    setRole(newRole);
    setStudentId(sid);
    window.location.hash = newRole;
  };

  const handleSwitchRole = () => {
    setRole(null);
    window.location.hash = '';
  };

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-white shadow-md animate-bounce mb-3">
          <span className="material-symbols-outlined text-[28px]">directions_bus</span>
        </div>
        <div className="text-sm font-semibold text-primary font-bold">Loading GoPass Transit...</div>
      </div>
    );
  }

  // Home Page: Role Selection (I'm a Student / I'm a Conductor)
  if (role === null) {
    return <RoleSelection onSelectRole={handleSelectRole} />;
  }

  if (role === 'student') {
    return (
      <StudentDashboard
        studentId={studentId}
        onSwitchRole={handleSwitchRole}
      />
    );
  }

  return (
    <ConductorDashboard
      onSwitchRole={handleSwitchRole}
    />
  );
}
