import { useEffect } from 'react';
import { ValidationResult } from '../../qr/validateToken';

interface ScanResultCardProps {
  result: ValidationResult;
  onClose: () => void;
}

export default function ScanResultCard({ result, onClose }: ScanResultCardProps) {
  const { valid, reason, student, scanRecord, payload } = result;

  // Spacebar hotkey to dismiss / next scan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const scanTimeStr = new Date(scanRecord.ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-center items-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-2xl overflow-hidden border border-surface-container my-auto flex flex-col">
        {/* Status Header Banner */}
        <div
          className={`p-space-md text-white relative overflow-hidden flex items-center justify-between ${
            valid ? 'bg-tertiary' : 'bg-error'
          }`}
        >
          <div className="flex items-center gap-space-sm z-10">
            <div className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[32px] font-bold fill">
                {valid ? 'check_circle' : 'cancel'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-lg font-extrabold tracking-tight uppercase">
                {valid ? 'PASS ACCEPTED' : 'PASS REJECTED'}
              </span>
              <span className="font-label-md text-xs opacity-90 uppercase tracking-wider font-semibold">
                {valid ? 'CRYPTOGRAPHIC SIG • VALID' : reason || 'VERIFICATION FAILED'}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end z-10">
            <div className="px-2 py-1 rounded bg-black/20 backdrop-blur-md flex items-center gap-1">
              <span className="material-symbols-outlined text-white text-[14px]">
                {valid ? 'verified_user' : 'gpp_bad'}
              </span>
              <span className="font-mono text-[10px] tracking-widest uppercase font-bold">
                {valid ? 'HMAC OK' : 'REJECTED'}
              </span>
            </div>
            <span className="font-mono text-[10px] opacity-80 mt-1">{scanTimeStr}</span>
          </div>
        </div>

        {/* Live Inspection Pulse Edge */}
        <div className={`h-1.5 w-full ${valid ? 'bg-tertiary-fixed' : 'bg-error-container'}`}></div>

        {/* Card Core Details */}
        <div className="p-space-md flex flex-col gap-3">
          {/* Student Profile Snapshot */}
          <div className="flex items-start gap-space-md bg-surface-container-low p-3 rounded-xl border border-surface-container">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-20 rounded-xl overflow-hidden shadow-sm bg-surface-container-highest border border-surface-container-high">
                {student?.avatarUrl ? (
                  <img alt={student.name} className="w-full h-full object-cover" src={student.avatarUrl} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-fixed text-primary font-bold text-2xl">
                    {student?.name ? student.name.charAt(0) : '?'}
                  </div>
                )}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-white flex items-center justify-center shadow ${
                  valid ? 'bg-tertiary' : 'bg-error'
                }`}
              >
                <span className="material-symbols-outlined text-[12px] font-bold">
                  {valid ? 'check' : 'close'}
                </span>
              </div>
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h3 className="font-headline-sm text-base font-bold text-on-surface truncate">
                  {student?.name || (payload?.sid ? `Student ID: ${payload.sid}` : 'Unknown Student')}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    valid
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                      : 'bg-error-container text-on-error-container'
                  }`}
                >
                  {valid ? 'ACTIVE PASS' : 'FLAGGED'}
                </span>
              </div>
              <span className="font-mono text-xs text-primary font-bold mt-0.5">
                {student?.sid || payload?.sid || 'N/A'}
              </span>
              <span className="text-xs text-secondary truncate mt-1">
                {student?.course || 'No course records on device'}
              </span>
              <span className="text-[11px] text-secondary/80 truncate">
                {student?.institution || 'Unregistered Institution'}
              </span>
            </div>
          </div>

          {/* Rejection Detail Box (if rejected) */}
          {!valid && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-red-600 text-[20px] flex-shrink-0 mt-0.5">
                error
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-red-900 uppercase tracking-wider">
                  Rejection Reason: {reason}
                </span>
                <span className="text-[11px] text-red-700 mt-0.5">
                  {reason === 'Invalid QR' && 'QR payload structure is corrupted or HMAC signature was tampered.'}
                  {reason === 'Unknown student' && 'Student ID is not present in the offline depot roster database.'}
                  {reason === 'Expired (wrong date)' && `QR date (${payload?.date || 'N/A'}) does not match today's date.`}
                  {reason === 'Already used today' && 'This student pass was already accepted today on this route.'}
                  {reason === 'Concession expired' && `Concession validity ended on ${student?.validUntil || 'past date'}.`}
                </span>
              </div>
            </div>
          )}

          {/* Route & Validity Details */}
          <div className="flex flex-col gap-2">
            <div className="bg-surface-container p-2.5 rounded-xl flex items-center justify-between border border-surface-container-high text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">alt_route</span>
                <span className="font-semibold text-on-surface truncate">
                  {student?.route || scanRecord.route || 'Route 104 Express'}
                </span>
              </div>
              <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded font-bold">104-EXP</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-surface-container-low p-2.5 rounded-xl flex flex-col border border-surface-container">
                <span className="text-[10px] text-secondary uppercase font-bold">Pass Expiry</span>
                <span className="font-semibold text-on-surface mt-0.5">
                  {student?.validUntil || 'N/A'}
                </span>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-xl flex flex-col border border-surface-container">
                <span className="text-[10px] text-secondary uppercase font-bold">Token Nonce</span>
                <span className="font-mono text-[11px] text-primary mt-0.5 font-bold">
                  {scanRecord.nonce}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="p-4 bg-surface-container-lowest border-t border-surface-container flex flex-col gap-2">
          <button
            type="button"
            onClick={onClose}
            className={`w-full min-h-[50px] py-3 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
              valid
                ? 'bg-tertiary hover:opacity-95'
                : 'bg-on-surface hover:opacity-95'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
            <span>{valid ? 'Accept & Next Student' : 'Dismiss & Next Student'}</span>
            <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-mono hidden sm:inline">
              SPACE
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
