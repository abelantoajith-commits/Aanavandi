import { useState } from 'react';
import ScanQR from './ScanQR';
import Logs from './Logs';
import Settings from './Settings';

interface ConductorDashboardProps {
  onSwitchRole: () => void;
}

type ConductorTab = 'scan' | 'logs' | 'settings';

export default function ConductorDashboard({ onSwitchRole }: ConductorDashboardProps) {
  const [activeTab, setActiveTab] = useState<ConductorTab>('scan');

  return (
    <div className="min-h-screen bg-surface flex flex-col relative text-on-surface">
      {/* Fixed Top Header */}
      <header className="fixed top-0 w-full z-40 pt-safe bg-surface/85 backdrop-blur-xl border-b border-surface-container shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
        <div className="h-14 px-gutter flex items-center justify-between gap-space-sm max-w-md mx-auto">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-8 h-8 rounded-xl bg-inverse-surface text-inverse-on-surface flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-sm text-on-surface tracking-tight font-bold">GoPass</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-tertiary-container text-on-tertiary-container text-[9px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed animate-pulse"></span>
                  CONDUCTOR
                </span>
              </div>
              <span className="font-mono text-[10px] text-secondary truncate">
                Shift #104 • Offline Validator
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onSwitchRole}
              title="Switch to Student mode"
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary flex items-center gap-1 border border-surface-container"
            >
              <span className="material-symbols-outlined text-[16px]">school</span>
              <span className="hidden sm:inline">Student</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab View */}
      <main className="flex-1 pt-14 pb-20 max-w-md mx-auto w-full">
        {activeTab === 'scan' && <ScanQR />}
        {activeTab === 'logs' && <Logs />}
        {activeTab === 'settings' && <Settings onSwitchRole={onSwitchRole} />}
      </main>

      {/* Fixed Bottom Navigation Dock */}
      <nav className="fixed bottom-0 w-full z-40 pb-safe bg-surface/90 backdrop-blur-xl border-t border-surface-container shadow-[0_-1px_12px_rgba(0,0,0,0.04)]">
        <div className="flex justify-around items-center h-16 px-space-xs max-w-md mx-auto">
          <button
            type="button"
            id="tab-scan"
            onClick={() => setActiveTab('scan')}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] transition-colors ${
              activeTab === 'scan' ? 'text-primary font-bold' : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className={`material-symbols-outlined text-[24px] ${activeTab === 'scan' ? 'fill' : ''}`}>
              qr_code_scanner
            </span>
            <span className="text-[11px] mt-0.5">Scan</span>
          </button>

          <button
            type="button"
            id="tab-logs"
            onClick={() => setActiveTab('logs')}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] transition-colors ${
              activeTab === 'logs' ? 'text-primary font-bold' : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className={`material-symbols-outlined text-[24px] ${activeTab === 'logs' ? 'fill' : ''}`}>
              receipt_long
            </span>
            <span className="text-[11px] mt-0.5">Logs</span>
          </button>

          <button
            type="button"
            id="tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] transition-colors ${
              activeTab === 'settings' ? 'text-primary font-bold' : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className={`material-symbols-outlined text-[24px] ${activeTab === 'settings' ? 'fill' : ''}`}>
              tune
            </span>
            <span className="text-[11px] mt-0.5">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
