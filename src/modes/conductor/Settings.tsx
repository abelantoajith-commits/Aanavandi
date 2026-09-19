import { useState, useEffect } from 'react';
import { db } from '../../db/db';
import { ConductorSettings } from '../../db/settings';
import { seedDatabase } from '../../db/seed';

interface SettingsProps {
  onSwitchRole: () => void;
}

export default function Settings({ onSwitchRole }: SettingsProps) {
  const [settings, setSettings] = useState<ConductorSettings>({
    id: 'active_settings',
    conductorName: 'Rajesh K. (Badge #4092)',
    route: 'Route 104 Express (Central ⇄ North Gate)',
    lastSyncedAt: Date.now() - 3600000 * 2
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>('');
  const [routeInput, setRouteInput] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState<number>(0);

  const loadSettings = async () => {
    const s = await db.settings.get('active_settings');
    if (s) {
      setSettings(s);
      setNameInput(s.conductorName);
      setRouteInput(s.route);
    }
    const count = await db.scans.count();
    setScanCount(count);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    const updated: ConductorSettings = {
      ...settings,
      conductorName: nameInput.trim() || settings.conductorName,
      route: routeInput.trim() || settings.route
    };
    await db.settings.put(updated);
    setSettings(updated);
    setIsEditing(false);
  };

  // Sync Button (§6.8 demo version):
  // Shows 1-2s simulated spinner and toasts real local scan numbers
  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncToast(null);

    const totalScans = await db.scans.count();
    const acceptedScans = await db.scans.where('result').equals('accepted').count();

    setTimeout(async () => {
      const now = Date.now();
      const updated: ConductorSettings = {
        ...settings,
        lastSyncedAt: now
      };
      await db.settings.put(updated);
      setSettings(updated);
      setIsSyncing(false);
      setSyncToast(`Synced ${totalScans} scan(s) (${acceptedScans} accepted), 0 conflicts. Local buffer clear.`);
      await loadSettings();
    }, 1200);
  };

  // Re-seed demo student roster
  const handleReloadRoster = async () => {
    const confirmed = window.confirm('Reset student roster to default seed data?');
    if (confirmed) {
      await seedDatabase(true);
      alert('Student roster re-seeded successfully!');
      await loadSettings();
    }
  };

  // Clear scans only (never touches roster)
  const handleClearScansOnly = async () => {
    const confirmed = window.confirm('Are you sure you want to clear all offline scan logs? (Student roster will remain safe)');
    if (confirmed) {
      await db.scans.clear();
      alert('All local scan logs cleared.');
      await loadSettings();
    }
  };

  const syncTimeFormatted = settings.lastSyncedAt
    ? new Date(settings.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Not synced yet';

  return (
    <div className="flex flex-col w-full pb-6">
      <div className="px-gutter pt-space-sm pb-space-lg flex flex-col gap-space-md">
        {/* Terminal Identity Banner */}
        <div className="bg-surface-container-high rounded-2xl p-space-md shadow-sm relative overflow-hidden border border-surface-container-high">
          <div className="flex items-center gap-space-sm relative z-10">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[28px]">tune</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-primary text-on-primary px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  GoPass INSPECTOR
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-tertiary text-on-tertiary text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  POS v1.0
                </span>
              </div>
              <h1 className="font-headline-sm text-base font-bold text-on-surface truncate mt-0.5">
                Conductor Settings
              </h1>
            </div>
          </div>
          <div className="mt-space-sm pt-space-xs flex items-center justify-between text-secondary text-xs">
            <span className="truncate">Terminal: KSRTC-HANDHELD-784</span>
            <span className="font-mono font-bold text-primary">BATTERY: 94% ⚡</span>
          </div>
        </div>

        {/* Section 1: Conductor Profile */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-on-surface">
              <span className="material-symbols-outlined text-[18px] text-primary">badge</span>
              <h2 className="font-bold text-xs text-on-surface">Conductor Profile</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                if (isEditing) handleSaveSettings();
                else setIsEditing(true);
              }}
              className="text-xs font-bold text-primary hover:underline"
            >
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <label className="text-[10px] uppercase font-bold text-secondary">Conductor Name & ID</label>
            {isEditing ? (
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="px-3 h-10 bg-surface-container-low rounded-xl text-xs text-on-surface border border-surface-container focus:outline-none"
              />
            ) : (
              <div className="flex items-center px-3 h-10 bg-surface-container-low rounded-xl text-xs text-on-surface font-semibold">
                <span className="material-symbols-outlined text-base text-secondary mr-2">person_pin</span>
                <span>{settings.conductorName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Route & Vehicle Assignment */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-on-surface">
              <span className="material-symbols-outlined text-[18px] text-primary">directions_bus</span>
              <h2 className="font-bold text-xs text-on-surface">Route & Service Assignment</h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-primary-fixed text-on-primary-fixed rounded-full uppercase font-bold">
              In-Service
            </span>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <label className="text-[10px] uppercase font-bold text-secondary">Authorized Corridor / Route</label>
            {isEditing ? (
              <input
                type="text"
                value={routeInput}
                onChange={(e) => setRouteInput(e.target.value)}
                className="px-3 h-10 bg-surface-container-low rounded-xl text-xs text-on-surface border border-surface-container focus:outline-none"
              />
            ) : (
              <div className="flex items-center px-3 h-10 bg-surface-container-low rounded-xl text-xs text-on-surface font-semibold">
                <span className="material-symbols-outlined text-base text-secondary mr-2">alt_route</span>
                <span className="truncate">{settings.route}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Data Synchronization Card (§6.8) */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container flex flex-col gap-space-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
              <span className="text-xs font-bold text-tertiary">Offline Verification Engine</span>
            </div>
            <span className="material-symbols-outlined text-tertiary text-[18px]">security</span>
          </div>
          <p className="text-[11px] text-secondary leading-relaxed">
            Cryptographic student validation keys are loaded locally. Concession passes are validated with 0ms network latency.
          </p>

          {/* Sync Button (§6.8) */}
          <button
            type="button"
            id="syncNowBtn"
            disabled={isSyncing}
            onClick={handleSyncNow}
            className={`w-full min-h-[48px] bg-primary text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
              isSyncing ? 'opacity-70 cursor-wait' : 'hover:opacity-95'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${isSyncing ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isSyncing ? 'Syncing Local Validation Logs…' : 'Sync Now'}</span>
          </button>

          {/* Toast / Sync Info */}
          {syncToast && (
            <div className="p-2.5 bg-green-50 border border-green-200 rounded-xl text-green-900 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-tertiary">check_circle</span>
              <span className="font-semibold">{syncToast}</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-center text-xs text-secondary">
            <span className="material-symbols-outlined text-[16px] text-tertiary">cloud_done</span>
            <span className="text-[11px]">
              Last synced: {syncTimeFormatted} • {scanCount} scan record(s) on device
            </span>
          </div>
        </div>

        {/* Section 4: Maintenance & Data Controls */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-on-surface mb-1">
            <span className="material-symbols-outlined text-[18px] text-primary">build</span>
            <h2 className="font-bold text-xs">Roster & Database Maintenance</h2>
          </div>

          <button
            type="button"
            onClick={handleReloadRoster}
            className="w-full h-11 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">restore</span>
            <span>Reload Demo Student Roster (5 Students)</span>
          </button>

          <button
            type="button"
            onClick={onSwitchRole}
            className="w-full h-11 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">school</span>
            <span>Switch to Student Role</span>
          </button>
        </div>

        {/* Section 5: Danger Zone */}
        <div className="bg-red-50/80 rounded-2xl p-space-md shadow-sm border border-red-200 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-red-900">
            <span className="material-symbols-outlined text-[18px] text-error">warning</span>
            <h2 className="font-bold text-xs">Danger Zone</h2>
          </div>
          <p className="text-[11px] text-red-700 leading-snug">
            Clears all today and past scan logs from IndexedDB. Student roster is preserved.
          </p>
          <button
            type="button"
            onClick={handleClearScansOnly}
            className="w-full h-11 bg-white text-error rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-red-200 shadow-sm active:scale-95 transition-all hover:bg-red-50"
          >
            <span className="material-symbols-outlined text-[18px]">delete_forever</span>
            <span>Clear Local Scan Logs Only</span>
          </button>
        </div>
      </div>
    </div>
  );
}
