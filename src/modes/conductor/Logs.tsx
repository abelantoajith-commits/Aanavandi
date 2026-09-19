import { useState, useEffect } from 'react';
import { db } from '../../db/db';
import { ScanRecord } from '../../db/scans';
import { getLocalDateString } from '../../crypto/hmac';

export default function Logs() {
  const [logs, setLogs] = useState<ScanRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'today' | 'all'>('today');
  const [loading, setLoading] = useState<boolean>(true);

  const loadLogs = async () => {
    setLoading(true);
    const allScans = await db.scans.orderBy('ts').reverse().toArray();
    setLogs(allScans);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const todayStr = getLocalDateString();

  const filteredLogs = logs.filter((log) => {
    // Today / All filter
    if (filterMode === 'today' && log.date !== todayStr) {
      return false;
    }
    // Search query
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchSid = log.sid.toLowerCase().includes(q);
      const matchName = (log.studentName || '').toLowerCase().includes(q);
      const matchReason = (log.reason || '').toLowerCase().includes(q);
      const matchRoute = (log.route || '').toLowerCase().includes(q);
      return matchSid || matchName || matchReason || matchRoute;
    }
    return true;
  });

  const todayScans = logs.filter((l) => l.date === todayStr);
  const validatedTodayCount = todayScans.filter((l) => l.result === 'accepted').length;
  const rejectedTodayCount = todayScans.filter((l) => l.result === 'rejected').length;

  // Export logs as client-side JSON/CSV blob download (offline)
  const handleExportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gopass_scan_logs_${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col w-full pb-6">
      <div className="px-gutter pt-space-md pb-space-sm flex flex-col gap-space-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-xl">receipt_long</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-xs text-primary uppercase font-bold tracking-tight">
                  GoPass Inspector
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold">
                  TERMINAL #4
                </span>
              </div>
              <h1 className="font-headline-md text-lg font-bold text-on-surface">Inspection Logs</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportLogs}
            title="Export offline logs to JSON"
            className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-variant transition-colors shadow-sm border border-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student name, ID or reason..."
            className="w-full h-11 pl-11 pr-10 rounded-xl bg-surface-container-lowest shadow-sm text-on-surface placeholder:text-secondary text-xs border border-surface-container focus:outline-none focus:border-primary"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </button>
          )}
        </div>

        {/* Toggle: Today vs All */}
        <div className="p-1 rounded-xl bg-surface-container flex items-center justify-between shadow-inner border border-surface-container-high text-xs">
          <button
            type="button"
            onClick={() => setFilterMode('today')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-center transition-all ${
              filterMode === 'today'
                ? 'bg-primary text-white shadow-sm'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            Today ({todayScans.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-center transition-all ${
              filterMode === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            All Logs ({logs.length})
          </button>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 gap-space-sm">
          <div className="p-3 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between border border-surface-container">
            <div className="flex flex-col">
              <span className="text-[10px] text-secondary uppercase tracking-wider font-bold">
                Validated Today
              </span>
              <span className="text-base font-extrabold text-tertiary">
                {validatedTodayCount} Validated
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
              <span className="material-symbols-outlined text-[20px] fill">check_circle</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between border border-surface-container">
            <div className="flex flex-col">
              <span className="text-[10px] text-secondary uppercase tracking-wider font-bold">
                Issues Flagged
              </span>
              <span className="text-base font-extrabold text-error">
                {rejectedTodayCount} Rejected
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-error-container flex items-center justify-center text-on-error-container">
              <span className="material-symbols-outlined text-[20px] fill">warning</span>
            </div>
          </div>
        </div>
      </div>

      {/* Logs List Section */}
      <div className="px-gutter pt-space-xs pb-space-lg flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="font-title-md text-xs font-bold text-on-surface">Inspection History</span>
          <span className="text-[10px] text-secondary font-mono">Route 104 Express</span>
        </div>

        {loading ? (
          <div className="p-6 text-center text-secondary text-xs">Loading logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface-container-lowest text-center flex flex-col items-center justify-center gap-2 border border-surface-container shadow-sm">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-2xl">search_off</span>
            </div>
            <span className="font-bold text-xs text-on-surface">No scan logs match your filter</span>
            <span className="text-[11px] text-secondary">
              Try searching a different keyword or toggle between Today and All.
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredLogs.map((log) => {
              const isAccepted = log.result === 'accepted';
              const timeStr = new Date(log.ts).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });

              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl shadow-sm flex flex-col gap-2 transition-all border ${
                    isAccepted
                      ? 'bg-surface-container-lowest border-surface-container hover:bg-surface-container-low'
                      : 'bg-red-50/70 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isAccepted
                            ? 'bg-primary-fixed text-primary'
                            : 'bg-error text-white'
                        }`}
                      >
                        {isAccepted ? (
                          log.studentName ? log.studentName.charAt(0) : 'S'
                        ) : (
                          <span className="material-symbols-outlined text-[18px]">warning</span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs text-on-surface truncate">
                          {log.studentName || `Student ID: ${log.sid}`}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-secondary">
                          <span className="font-mono">{log.sid}</span>
                          <span>•</span>
                          <span className="truncate">{log.route || 'Route 104'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isAccepted
                            ? 'bg-tertiary text-white'
                            : 'bg-error text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[12px]">
                          {isAccepted ? 'check' : 'close'}
                        </span>
                        <span>{isAccepted ? 'Accepted' : log.reason || 'Rejected'}</span>
                      </span>
                      <span className="font-mono text-[10px] text-secondary">{timeStr}</span>
                    </div>
                  </div>

                  {!isAccepted && log.reason && (
                    <div className="p-2 rounded-lg bg-red-100 text-red-900 text-[11px] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs text-error">info</span>
                      <span>Rejection reason: {log.reason}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-2 p-2 rounded-full bg-surface-container-low text-on-surface text-center flex items-center justify-center gap-2 border border-surface-container">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
          <span className="text-[11px] text-secondary font-medium">
            Showing {filteredLogs.length} logs cached locally • Client-side only
          </span>
        </div>
      </div>
    </div>
  );
}
