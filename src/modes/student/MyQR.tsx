import { useState, useEffect, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Student } from '../../db/students';
import { generateStudentQRToken, QRPayload } from '../../qr/generateToken';

interface MyQRProps {
  student: Student;
  qrPayload?: string;
  tokenPayload?: QRPayload | null;
  onRegenerate?: () => void;
}

export default function MyQR({ student, onRegenerate }: MyQRProps) {
  const [timeLeft, setTimeLeft] = useState(258);
  const totalDuration = 300;
  const [isSpinning, setIsSpinning] = useState(false);
  const [isMaxLight, setIsMaxLight] = useState(false);
  const [activePayload, setActivePayload] = useState<string>('');
  const [tokenPayload, setTokenPayload] = useState<QRPayload | null>(null);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const generateToken = useCallback(async () => {
    try {
      const { jsonString, payload } = await generateStudentQRToken(student);
      setActivePayload(jsonString);
      setTokenPayload(payload);
    } catch (err) {
      console.error('Failed to generate token:', err);
    }
  }, [student]);

  useEffect(() => {
    generateToken();
  }, [generateToken]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : totalDuration));
    }, 1000);
    return () => clearInterval(interval);
  }, [totalDuration]);

  const handleRegenerate = async () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 500);
    setTimeLeft(totalDuration);
    await generateToken();
    if (onRegenerate) {
      onRegenerate();
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const circumference = 2 * Math.PI * 9;
  const fraction = timeLeft / totalDuration;
  const strokeDashoffset = circumference * (1 - fraction);

  return (
    <div className={`flex flex-col w-full px-gutter pb-space-lg transition-colors ${isMaxLight ? 'brightness-110' : ''}`}>
      {/* Live Offline Status Banner Strip */}
      <div className="w-full mb-space-md mt-space-sm bg-surface-container-low rounded-2xl p-space-sm shadow-sm flex items-center justify-between border border-surface-container">
        <div className="flex items-center gap-space-sm min-w-0">
          <div className="w-8 h-8 rounded-xl bg-tertiary-fixed flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-tertiary text-[18px]">cloud_done</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
              <span className="font-title-md text-title-md text-on-surface truncate font-bold">Offline Active</span>
            </div>
            <span className="font-body-sm text-body-sm text-secondary truncate text-xs">
              Zero network required • HMAC signed
            </span>
          </div>
        </div>
        <span className="font-mono text-xs text-tertiary bg-emerald-100 px-2.5 py-1 rounded-full font-bold">
          HMAC-SHA256
        </span>
      </div>

      {/* Primary Civic Transit Pass Card (Centerpiece) */}
      <div className="relative w-full bg-surface-container-lowest rounded-2xl shadow-lg border border-surface-container overflow-hidden flex flex-col">
        {/* Physical Card Header Ribbon */}
        <div className="bg-primary text-on-primary px-space-md py-3 flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-4 -bottom-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none flex items-center justify-center">
            <span className="material-symbols-outlined text-white/20 text-[64px]">local_police</span>
          </div>
          <div className="flex items-center gap-2 min-w-0 z-10">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white text-xl">directions_bus</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold tracking-wider uppercase text-primary-fixed truncate">
                State Transit Authority
              </span>
              <span className="font-headline-sm text-sm text-on-primary tracking-tight font-bold truncate">
                STUDENT CONCESSION PASS
              </span>
            </div>
          </div>
          <div className="z-10 bg-white text-primary px-2.5 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0 shadow-sm text-xs font-bold">
            <span className="material-symbols-outlined text-[14px] fill">verified</span>
            <span>VERIFIED</span>
          </div>
        </div>

        {/* Student Identity & Metadata Section */}
        <div className="p-space-md bg-surface-container-low flex items-center gap-space-md border-b border-surface-container">
          <div className="relative flex-shrink-0">
            <div className="w-[72px] h-[86px] rounded-xl overflow-hidden shadow-sm bg-surface-container-highest border border-surface-container-high">
              {student.avatarUrl ? (
                <img alt={student.name} className="w-full h-full object-cover" src={student.avatarUrl} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-fixed text-primary font-bold text-2xl">
                  {student.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shadow">
              <span className="material-symbols-outlined text-[12px] font-bold">check</span>
            </div>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="font-label-md text-label-md uppercase text-primary tracking-wider font-bold">
                ID: {student.sid}
              </span>
              <span className="font-mono text-[10px] text-secondary bg-surface-container px-1.5 py-0.5 rounded font-bold">
                {student.passId || '#GP-7749-KL'}
              </span>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface truncate mt-0.5 font-bold">
              {student.name}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5 text-secondary">
              <span className="material-symbols-outlined text-[15px] flex-shrink-0 text-on-surface-variant">school</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate text-xs">
                {student.course}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-fixed font-label-md text-[11px] font-semibold">
                Daily Concession
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed font-label-md text-[11px] font-semibold">
                100% Subsidized
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Perforation with Inward Punch Notches */}
        <div className="relative w-full h-6 bg-surface-container-lowest flex items-center justify-between px-space-xs overflow-hidden">
          <div className="w-5 h-5 rounded-full bg-surface -ml-3 shadow-inner border-r border-surface-container"></div>
          <div className="flex-1 border-b-2 border-dashed border-secondary-container mx-2"></div>
          <div className="w-5 h-5 rounded-full bg-surface -mr-3 shadow-inner border-l border-surface-container"></div>
        </div>

        {/* QR Validation Arena */}
        <div className="px-space-md pt-space-xs pb-space-md flex flex-col items-center relative bg-surface-container-lowest">
          {/* Dynamic QR Box with alignment corner markers and crisp white quiet zone */}
          <div className="relative p-3 rounded-2xl bg-white shadow-md mb-space-sm border border-slate-200">
            <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-primary rounded-tl-sm"></div>
            <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-primary rounded-tr-sm"></div>
            <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-primary rounded-bl-sm"></div>
            <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-primary rounded-br-sm"></div>
            
            {/* QR Code Canvas with margin for optical reader edge contrast */}
            <div className="w-52 h-52 bg-white rounded-xl flex items-center justify-center relative p-1">
              {activePayload ? (
                <QRCodeCanvas
                  value={activePayload}
                  size={200}
                  level="M"
                  marginSize={2}
                  className="max-w-full max-h-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
                  <span className="text-xs font-semibold">Generating Offline Token...</span>
                </div>
              )}
            </div>
          </div>

          {/* Prominent Validity Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary"></span>
            </span>
            <span className="font-title-md text-sm font-bold tracking-tight">
              Valid for {dateStr}
            </span>
          </div>

          {/* Token Nonce & Telemetry */}
          {tokenPayload && (
            <div className="mt-2 text-[10px] font-mono text-secondary flex items-center gap-2">
              <span>Nonce: <strong className="text-primary">{tokenPayload.nonce}</strong></span>
              <span>•</span>
              <span className="truncate max-w-[120px]">MAC: {tokenPayload.mac.substring(0, 10)}...</span>
            </div>
          )}

          {/* Token Countdown Ring */}
          <div className="flex items-center gap-2.5 mt-space-sm text-secondary">
            <div className="relative w-5 h-5 flex items-center justify-center">
              <svg className="w-5 h-5 -rotate-90" viewBox="0 0 24 24">
                <circle className="text-surface-container-high" cx="12" cy="12" fill="none" r="9" stroke="currentColor" strokeWidth="2.5" />
                <circle
                  className="text-primary transition-all duration-1000 ease-linear"
                  cx="12"
                  cy="12"
                  fill="none"
                  r="9"
                  stroke="currentColor"
                  strokeDasharray="56.5"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
            <span className="font-mono text-xs text-on-surface">
              Daily code active • Next sync: <span className="font-bold text-primary">{timerFormatted}</span>
            </span>
          </div>
        </div>

        {/* Corridor Authority Footer */}
        <div className="px-space-md py-space-sm bg-surface-container flex items-center justify-between border-t border-surface-container-high">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-primary text-[20px]">alt_route</span>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-[10px] uppercase text-secondary font-bold">Authorized Corridor</span>
              <span className="font-title-md text-xs text-on-surface font-semibold truncate">
                {student.route || 'Route 104 Express (Central ⇄ North Gate)'}
              </span>
            </div>
          </div>
          <span className="font-mono text-xs bg-surface-container-lowest text-on-surface px-2.5 py-1 rounded-lg shadow-sm font-bold border border-surface-container">
            104-EXP
          </span>
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="w-full flex flex-col gap-space-sm mt-space-md">
        {/* Regenerate Offline Token Button */}
        <button
          id="regenTokenBtn"
          type="button"
          onClick={handleRegenerate}
          className="w-full h-12 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-title-md text-sm rounded-xl shadow-sm border border-surface-container flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-semibold"
        >
          <span className={`material-symbols-outlined text-primary text-[20px] transition-transform duration-500 ${isSpinning ? 'rotate-180' : ''}`}>
            sync
          </span>
          <span>Regenerate Offline Token</span>
        </button>

        {/* Service Eligibility Notice */}
        <div className="w-full bg-secondary-container/40 rounded-xl p-space-sm flex items-start gap-space-sm border border-secondary-container">
          <span className="material-symbols-outlined text-secondary text-[20px] flex-shrink-0 mt-0.5">
            directions_bus
          </span>
          <div className="flex flex-col min-w-0">
            <span className="font-title-md text-xs text-on-secondary-fixed font-bold">Service Eligibility</span>
            <span className="font-body-sm text-[11px] text-secondary mt-0.5 leading-snug">
              Valid on all Ordinary, City Fast & Shuttle buses. Hold screen flat towards conductor scanner.
            </span>
          </div>
        </div>

        {/* Screen Inspection Helper */}
        <div className="flex items-center justify-between px-space-xs pt-1">
          <div className="flex items-center gap-1.5 text-secondary">
            <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
            <span className="font-body-sm text-xs">Present QR on boarding bus</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMaxLight(!isMaxLight)}
            className={`flex items-center gap-1 font-label-md text-xs uppercase hover:underline font-bold ${
              isMaxLight ? 'text-tertiary' : 'text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">brightness_high</span>
            <span>{isMaxLight ? 'Normal Light' : 'Max Light'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
