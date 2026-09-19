import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

export default function LoadingScreen({ onComplete, durationMs = 2000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Initializing Secure Offline Vault...');
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    const startTime = performance.now();
    const interval = 25; // 40fps progress tick

    const timer = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      if (pct < 35) {
        setStatusText('Initializing Secure Offline Vault...');
      } else if (pct < 70) {
        setStatusText('Loading HMAC-SHA256 Concession Tokens...');
      } else if (pct < 95) {
        setStatusText('Verifying Route & Bus Infrastructure...');
      } else {
        setStatusText('Ready! Starting GoPass...');
      }

      if (elapsed >= durationMs) {
        clearInterval(timer);
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete();
        }, 300); // Allow fade-out animation to complete
      }
    }, interval);

    return () => clearInterval(timer);
  }, [durationMs, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#faf8ff] via-[#f0f2ff] to-[#e4e8ff] transition-opacity duration-300 ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
    >
      {/* Background Subtle Radial Glow */}
      <div className="absolute w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none animate-pulse"></div>

      <div className="relative flex flex-col items-center max-w-xs w-full px-6 text-center">
        {/* Animated Icon Avatar */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Pulsing Outer Rings */}
          <div className="absolute w-28 h-28 rounded-3xl bg-primary/15 animate-ping opacity-75"></div>
          <div className="absolute w-24 h-24 rounded-3xl bg-primary/20 animate-pulse"></div>

          {/* Main Transit Logo Card */}
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-[#ff6b2b] flex items-center justify-center text-white shadow-xl shadow-primary/25 border border-white/40 transform hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[42px] animate-bounce">
              directions_bus
            </span>
          </div>

          {/* Offline Security Badge Badge */}
          <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-tertiary text-white flex items-center justify-center shadow-md border-2 border-white">
            <span className="material-symbols-outlined text-[16px] font-bold">
              offline_bolt
            </span>
          </div>
        </div>

        {/* Brand Titles */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/50 text-on-primary-fixed-variant text-xs font-bold tracking-wider uppercase mb-2">
          <span>Aanavandi • GoPass</span>
        </div>
        <h1 className="text-2xl font-extrabold text-on-surface tracking-tight font-heading">
          Bus Concession
        </h1>
        <p className="text-xs text-secondary mt-1 font-medium">
          Offline Dynamic QR Transit Pass
        </p>

        {/* Progress Container */}
        <div className="w-full mt-8 flex flex-col gap-2">
          {/* Linear Progress Bar */}
          <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden p-0.5 border border-surface-container">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-[#ff6b2b] transition-all duration-75 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Status and Percentage */}
          <div className="flex items-center justify-between text-[11px] text-secondary font-medium px-1">
            <span className="truncate max-w-[180px] text-left">{statusText}</span>
            <span className="font-mono font-bold text-primary">{progress}%</span>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="mt-8 flex items-center gap-1.5 text-[11px] text-on-surface-variant font-semibold bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-surface-container shadow-xs">
          <span className="material-symbols-outlined text-[14px] text-tertiary">
            verified_user
          </span>
          <span>Zero-network Cryptographic Auth</span>
        </div>
      </div>
    </div>
  );
}
