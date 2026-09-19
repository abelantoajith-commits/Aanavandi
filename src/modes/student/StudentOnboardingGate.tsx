import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../db/db';
import { Student } from '../../db/students';

interface StudentOnboardingGateProps {
  student: Student;
  onApproved: () => void;
}

type GateState = 'upload' | 'waiting' | 'approved';

export default function StudentOnboardingGate({ student, onApproved }: StudentOnboardingGateProps) {
  const [gateState, setGateState] = useState<GateState>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verificationProgress, setVerificationProgress] = useState<number>(0);
  const [verificationStepText, setVerificationStepText] = useState<string>('Uploading documents...');
  const [countdown, setCountdown] = useState<number>(3);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Default demo file pre-selected if user wants quick 1-click test
  useEffect(() => {
    // Generate a default mock file if none selected
    const mockFile = new File(['mock content'], 'student_id_sarah_2026.pdf', { type: 'application/pdf' });
    setSelectedFile(mockFile);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
  };

  const handleStartApproval = async () => {
    if (!selectedFile) return;
    setGateState('waiting');
    setVerificationProgress(10);
    setVerificationStepText('Uploading document to local encrypted vault...');

    // 5-second simulated verification sequence per PRD §5.2.0 / §6.6
    const t1 = setTimeout(() => {
      setVerificationProgress(35);
      setVerificationStepText('Analyzing student credentials & enrollment...');
    }, 1200);

    const t2 = setTimeout(() => {
      setVerificationProgress(70);
      setVerificationStepText('Generating HMAC-SHA256 concession token keys...');
    }, 2800);

    const t3 = setTimeout(() => {
      setVerificationProgress(95);
      setVerificationStepText('Securing offline bus transit pass credentials...');
    }, 4200);

    const t4 = setTimeout(async () => {
      // Save approval to IndexedDB
      await db.students.update(student.sid, {
        approvalStatus: 'approved',
        documentName: selectedFile.name,
        documentBlob: selectedFile
      });

      setVerificationProgress(100);
      setGateState('approved');
    }, 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  };

  // Celebration Confetti and auto-redirect for 'approved' state
  useEffect(() => {
    if (gateState !== 'approved') return;

    // Confetti animation
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = canvas.parentElement?.clientWidth || 360;
        canvas.height = canvas.parentElement?.clientHeight || 600;
        const colors = ['#cb4a00', '#006b2c', '#ffb598', '#7ffc97', '#d5e0f8', '#131b2e'];
        const particles = Array.from({ length: 45 }, () => ({
          x: canvas.width / 2,
          y: 120,
          radius: Math.random() * 4 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 1.2) * 8,
          gravity: 0.18,
          rotation: Math.random() * 360,
          vr: (Math.random() - 0.5) * 10,
          opacity: 1
        }));

        let animationFrameId: number;
        const render = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          let active = false;
          particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.rotation += p.vr;
            p.opacity -= 0.008;

            if (p.opacity > 0) {
              active = true;
              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate((p.rotation * Math.PI) / 180);
              ctx.fillStyle = p.color;
              ctx.globalAlpha = Math.max(p.opacity, 0);
              ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 1.5);
              ctx.restore();
            }
          });

          if (active) {
            animationFrameId = requestAnimationFrame(render);
          }
        };
        render();

        return () => {
          cancelAnimationFrame(animationFrameId);
        };
      }
    }
  }, [gateState]);

  // Countdown timer for approved state
  useEffect(() => {
    if (gateState !== 'approved' || isPaused) return;

    if (countdown <= 0) {
      onApproved();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gateState, countdown, isPaused, onApproved]);

  // RENDER: Approved State
  if (gateState === 'approved') {
    return (
      <main className="flex flex-col relative w-full pt-safe pb-safe bg-surface min-h-screen">
        <div className="flex flex-col w-full relative px-4 pb-12 pt-4 max-w-md mx-auto overflow-hidden">
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-30 w-full h-full" />
          
          {/* Ambient Glows */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-tertiary-fixed/30 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-48 -right-16 w-48 h-48 bg-primary-fixed/40 rounded-full blur-2xl pointer-events-none"></div>

          {/* Celebration Header */}
          <div className="relative z-10 flex flex-col items-center text-center mt-2 mb-6">
            <div className="relative flex items-center justify-center mb-5">
              <div className="absolute w-28 h-28 rounded-full bg-tertiary/20 animate-ping opacity-75"></div>
              <div className="absolute w-24 h-24 rounded-full bg-tertiary-container/30 blur-md"></div>
              <div className="relative w-20 h-20 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shadow-lg shadow-tertiary/30">
                <span className="material-symbols-outlined text-4xl font-bold fill">
                  check_circle
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-tertiary mb-2">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span className="font-label-md text-label-md uppercase tracking-wider font-semibold">
                Instant Verification Complete
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-2 font-extrabold">
              Approved ✅
            </h1>
            <p className="font-body-md text-body-md text-secondary max-w-xs px-2 leading-relaxed">
              Your GoPass is ready! Cryptographic concession pass generated and secured on-device.
            </p>
          </div>

          {/* Ticket Summary Card */}
          <div className="relative z-10 bg-surface-container-lowest rounded-2xl shadow-md border border-surface-container overflow-hidden mb-6">
            <div className="bg-primary px-5 py-3 flex items-center justify-between text-on-primary">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">directions_bus</span>
                <span className="font-label-code text-label-code tracking-wider text-primary-fixed font-bold">KSRTC • GOPASS</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-full text-white text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed animate-ping"></span>
                <span>Active Key</span>
              </div>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-surface-container flex-shrink-0 shadow-sm border border-surface-container-high">
                  {student.avatarUrl ? (
                    <img className="w-full h-full object-cover" src={student.avatarUrl} alt={student.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-fixed text-primary font-bold text-lg">
                      {student.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md uppercase text-secondary tracking-wider">Pass Holder</span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface truncate font-bold">{student.name}</h2>
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">ID: {student.sid}</span>
                </div>
              </div>

              {/* Perforation Cutout */}
              <div className="relative -mx-5 my-1 flex items-center justify-between">
                <div className="w-4 h-8 bg-surface rounded-r-full -ml-0.5 border-r border-surface-container"></div>
                <div className="flex-1 border-b-2 border-dashed border-surface-container-highest mx-2"></div>
                <div className="w-4 h-8 bg-surface rounded-l-full -mr-0.5 border-l border-surface-container"></div>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-1">
                <div>
                  <span className="font-label-md text-label-md uppercase text-secondary tracking-wider">Pass Category</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="material-symbols-outlined text-primary text-lg">school</span>
                    <p className="font-title-md text-title-md text-on-surface font-semibold">{student.course}</p>
                  </div>
                </div>

                <div className="bg-surface-container-low p-3 rounded-xl flex flex-col gap-1.5 border border-surface-container">
                  <span className="font-label-md text-label-md uppercase text-secondary tracking-wider">Authorized Corridor</span>
                  <div className="flex items-center gap-2 text-on-surface font-title-md text-title-md font-semibold">
                    <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-mono text-xs font-bold">104</span>
                    <span className="truncate">{student.route || 'Route 104 Express'}</span>
                  </div>
                  <p className="text-xs text-secondary flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-xs text-tertiary">check</span> All Intermediate Stages Included
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md uppercase text-secondary tracking-wider">Validity Period</span>
                    <p className="font-title-md text-title-md text-on-surface font-medium">Through {student.validUntil}</p>
                  </div>
                  <div className="flex items-center gap-1 text-tertiary bg-surface-container-high px-2.5 py-1 rounded-full text-xs font-semibold">
                    <span className="material-symbols-outlined text-sm fill">verified</span>
                    <span className="font-mono">HMAC-SHA256</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-1.5 w-full bg-gradient-to-r from-tertiary via-primary to-surface-variant"></div>
          </div>

          {/* Countdown & Redirect Card */}
          <div className="relative z-10 bg-surface-container-low rounded-2xl p-4 mb-5 flex flex-col gap-2.5 shadow-sm border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl animate-spin">sync</span>
                <span className="font-body-md text-body-md text-on-surface font-semibold">
                  {isPaused ? 'Auto-redirect paused' : `Redirecting to your Pass in ${countdown}s…`}
                </span>
              </div>
              {!isPaused && (
                <button
                  type="button"
                  onClick={() => setIsPaused(true)}
                  className="font-label-md text-label-md text-secondary hover:text-on-surface uppercase tracking-wider font-semibold"
                >
                  Stay Here
                </button>
              )}
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${isPaused ? 'bg-tertiary w-full' : 'bg-primary'}`}
                style={{ width: isPaused ? '100%' : `${((3 - countdown) / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="relative z-10 flex flex-col gap-3">
            <button
              id="primary-open-btn"
              type="button"
              onClick={onApproved}
              className="w-full min-h-[52px] bg-primary text-on-primary rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-[0.98] transition-all font-bold"
            >
              <span>Open My GoPass Now</span>
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
            <div className="flex items-center justify-center gap-2 py-1">
              <span className="material-symbols-outlined text-tertiary text-base">offline_bolt</span>
              <span className="font-body-sm text-body-sm text-secondary">Cached locally for offline conductor scans</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // RENDER: Waiting / In-Verification State (~5s)
  if (gateState === 'waiting') {
    return (
      <main className="flex flex-col relative w-full pt-safe pb-safe bg-surface min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md bg-surface-container-lowest p-6 rounded-2xl shadow-lg border border-surface-container text-center flex flex-col items-center">
          <div className="relative flex items-center justify-center w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-primary-fixed border-t-primary animate-spin"></div>
            <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
            Simulated Review Pipeline
          </div>

          <h2 className="text-xl font-bold text-on-surface mb-1">
            Waiting for approval…
          </h2>
          <p className="text-sm text-secondary mb-6 max-w-xs">
            {verificationStepText}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden mb-3">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${verificationProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between w-full text-xs text-secondary font-mono">
            <span>Progress</span>
            <span>{verificationProgress}%</span>
          </div>

          <div className="mt-6 p-3 bg-surface-container-low rounded-xl text-left w-full border border-surface-container">
            <div className="text-xs font-semibold text-on-surface mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs text-primary">info</span>
              <span>Prototype Demo Note (§6.6):</span>
            </div>
            <p className="text-[11px] text-secondary leading-relaxed">
              In this offline build, review is simulated with a 5-second delay. File is stored securely in IndexedDB only.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // RENDER: Upload Gate Screen (Step 1)
  return (
    <main className="flex flex-col relative w-full pt-safe pb-safe bg-surface min-h-screen">
      <div className="flex flex-col w-full px-margin pb-space-xl max-w-md mx-auto">
        {/* Progress Header */}
        <div className="flex items-center justify-between pt-space-md pb-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-title-md">directions_bus</span>
            <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">GoPass Verification</span>
          </div>
          <div className="flex items-center gap-space-xs bg-surface-container-high px-3 py-1 rounded-full">
            <span className="font-label-md text-label-md text-on-surface-variant font-bold">Step 1 of 2: Pass Activation</span>
          </div>
        </div>

        {/* Micro Stepper Bar */}
        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mb-space-lg">
          <div className="bg-primary h-full w-1/2 rounded-full transition-all duration-500 ease-out"></div>
        </div>

        {/* Verification Alert Pill */}
        <div className="flex items-center gap-space-sm bg-surface-container-low p-space-sm rounded-2xl mb-space-md shadow-sm border border-surface-container">
          <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0 text-on-primary-fixed">
            <span className="material-symbols-outlined text-headline-sm fill">lock</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-space-xs">
              <span className="font-title-md text-title-md text-on-surface font-bold">Verification Required</span>
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
              Pass locked for {student.name} ({student.sid})
            </p>
          </div>
        </div>

        {/* Visual Hero Strip */}
        <div className="relative w-full rounded-2xl overflow-hidden mb-space-lg bg-surface-container shadow-sm border border-surface-container">
          <div className="p-space-md flex flex-col gap-space-xs">
            <h1 className="font-headline-md text-headline-md text-on-surface font-extrabold tracking-tight">
              Upload documents to activate your GoPass
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Submit your college ID card or bonafide certificate to generate your dynamic offline bus concession pass.
            </p>
          </div>
        </div>

        {/* Interactive Upload Zone */}
        <div
          id="dropzone"
          className="relative group cursor-pointer bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center text-center mb-space-md border-2 border-dashed border-outline-variant hover:border-primary"
        >
          <input
            id="fileInput"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />
          <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-space-sm transition-transform group-hover:scale-105">
            <span className="material-symbols-outlined text-display-lg-mobile">cloud_upload</span>
          </div>
          <span className="font-title-lg text-title-lg text-on-surface mb-space-xs font-bold">
            Tap to upload Photo or PDF
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
            Client-side only • Stored locally in IndexedDB
          </p>
          <div className="flex items-center gap-space-xs">
            <span className="bg-surface-container px-2 py-0.5 rounded text-secondary font-mono text-xs font-semibold">JPG</span>
            <span className="bg-surface-container px-2 py-0.5 rounded text-secondary font-mono text-xs font-semibold">PNG</span>
            <span className="bg-surface-container px-2 py-0.5 rounded text-secondary font-mono text-xs font-semibold">PDF</span>
          </div>
        </div>

        {/* Attached File Chip */}
        {selectedFile && (
          <div
            id="fileChip"
            className="flex items-center justify-between bg-surface-container-lowest p-space-sm rounded-2xl shadow-sm mb-space-lg border border-surface-container"
          >
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-title-lg">description</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-title-md text-title-md text-on-surface truncate font-semibold">
                    {selectedFile.name}
                  </span>
                  <span className="material-symbols-outlined text-tertiary text-title-md flex-shrink-0 fill">
                    check_circle
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-secondary font-mono text-xs">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready to verify
                </span>
              </div>
            </div>
            <button
              id="removeFileBtn"
              type="button"
              onClick={handleRemoveFile}
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors ml-space-xs"
            >
              <span className="material-symbols-outlined text-headline-sm">close</span>
            </button>
          </div>
        )}

        {/* Verification Checklist */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm mb-space-lg border border-surface-container">
          <div className="flex items-center gap-space-xs mb-space-sm">
            <span className="material-symbols-outlined text-primary text-title-md">checklist</span>
            <span className="font-title-md text-title-md text-on-surface font-bold">Verification Checklist</span>
          </div>
          <div className="space-y-space-sm text-sm">
            <div className="flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-tertiary text-title-md mt-0.5 fill">check_small</span>
              <span className="text-on-surface">Valid student registration code ({student.sid})</span>
            </div>
            <div className="flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-tertiary text-title-md mt-0.5 fill">check_small</span>
              <span className="text-on-surface">Institution: {student.institution || 'State Institute of Technology'}</span>
            </div>
            <div className="flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-tertiary text-title-md mt-0.5 fill">check_small</span>
              <span className="text-on-surface">Corridor: {student.route || 'Route 104 Express'}</span>
            </div>
          </div>
        </div>

        {/* Action Group */}
        <div className="flex flex-col gap-space-md">
          <button
            id="submitBtn"
            type="button"
            disabled={!selectedFile}
            onClick={handleStartApproval}
            className={`w-full py-4 px-6 rounded-xl font-headline-sm text-headline-sm shadow-md transition-all flex items-center justify-center gap-space-xs min-h-[52px] font-bold ${
              selectedFile
                ? 'bg-primary text-on-primary hover:opacity-95 active:scale-[0.99] cursor-pointer'
                : 'bg-surface-container-highest text-secondary opacity-60 cursor-not-allowed'
            }`}
          >
            <span>Submit for Instant Approval</span>
            <span className="material-symbols-outlined text-title-lg">arrow_forward</span>
          </button>
        </div>

        {/* Offline Trust */}
        <div className="mt-space-lg flex items-center justify-center gap-space-xs text-secondary py-space-xs">
          <span className="material-symbols-outlined text-body-md text-tertiary">lock_open</span>
          <span className="font-label-md text-label-md">256-bit encrypted offline concession pipeline</span>
        </div>
      </div>
    </main>
  );
}
