import { Student } from '../../db/students';

interface ProfileProps {
  student: Student;
  onSwitchRole: () => void;
  onResetApproval: () => void;
}

export default function Profile({ student, onSwitchRole, onResetApproval }: ProfileProps) {
  return (
    <div className="flex flex-col w-full px-margin pb-space-xl space-y-space-md pt-space-xs">
      {/* Profile Hero Bento Card */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest shadow-md p-space-md flex flex-col items-center text-center border border-surface-container">
        {/* Decorative Watermark */}
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-primary-fixed/30 pointer-events-none flex items-center justify-center">
          <span className="material-symbols-outlined text-primary/20 text-[64px]">verified</span>
        </div>

        {/* Student Portrait */}
        <div className="relative mt-space-xs mb-space-sm">
          <div className="w-24 h-24 rounded-full p-1 bg-tertiary-fixed flex items-center justify-center shadow-sm">
            {student.avatarUrl ? (
              <img alt={student.name} className="w-full h-full rounded-full object-cover" src={student.avatarUrl} />
            ) : (
              <div className="w-full h-full rounded-full bg-primary-container text-white font-bold text-3xl flex items-center justify-center">
                {student.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-tertiary text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[18px] fill">verified</span>
          </div>
        </div>

        {/* Student Identity */}
        <div className="flex flex-col items-center space-y-1 w-full max-w-sm">
          <div className="flex items-center gap-1.5">
            <h2 className="font-headline-md text-lg font-bold text-on-surface tracking-tight">{student.name}</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-[10px] font-bold">
              ACTIVE
            </span>
          </div>
          <p className="font-mono text-xs text-secondary font-bold tracking-wide">ID: {student.sid}</p>

          <div className="mt-space-xs px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface-variant flex items-center gap-1.5 max-w-full">
            <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0">school</span>
            <span className="font-label-lg text-xs text-left truncate font-semibold">
              {student.course}
            </span>
          </div>
        </div>

        {/* Micro Stats Row */}
        <div className="grid grid-cols-2 gap-space-sm w-full mt-space-md pt-space-sm">
          <div className="rounded-xl bg-surface-container-low p-2.5 flex flex-col items-start text-left border border-surface-container">
            <span className="font-label-md text-[10px] text-secondary uppercase tracking-wider font-bold">Pass Status</span>
            <span className="font-title-md text-xs text-on-surface mt-0.5 font-bold">Approved & Valid</span>
          </div>
          <div className="rounded-xl bg-surface-container-low p-2.5 flex flex-col items-start text-left border border-surface-container">
            <span className="font-label-md text-[10px] text-secondary uppercase tracking-wider font-bold">Transit Tier</span>
            <span className="font-title-md text-xs text-primary mt-0.5 font-bold">Subsidized 100%</span>
          </div>
        </div>
      </div>

      {/* Transit Specification List Card */}
      <div className="relative rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container overflow-hidden flex flex-col">
        <div className="h-11 px-space-md bg-primary text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">badge</span>
            <span className="font-label-lg text-xs tracking-wide uppercase font-bold">Transit Specification</span>
          </div>
          <span className="font-mono text-xs opacity-90">{student.passId || '#GP-7749-KL'}</span>
        </div>

        <div className="p-space-md flex flex-col space-y-3 text-xs">
          {/* Institution */}
          <div className="flex flex-col space-y-0.5">
            <span className="text-[10px] text-secondary uppercase tracking-wider font-bold">Educational Institution</span>
            <div className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-secondary text-[18px] flex-shrink-0">account_balance</span>
              <span className="font-semibold">{student.institution || 'State Institute of Technology, Campus North'}</span>
            </div>
          </div>

          <div className="w-full h-px bg-surface-container"></div>

          {/* Corridor */}
          <div className="flex flex-col space-y-0.5">
            <span className="text-[10px] text-secondary uppercase tracking-wider font-bold">Authorized Transit Corridor</span>
            <div className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0">alt_route</span>
              <span className="font-semibold">{student.route || 'Route 104 Express (Central ⇄ North Gate)'}</span>
            </div>
          </div>

          <div className="w-full h-px bg-surface-container"></div>

          {/* Validity Window */}
          <div className="flex flex-col space-y-0.5">
            <span className="text-[10px] text-secondary uppercase tracking-wider font-bold">Concession Validity Window</span>
            <div className="flex items-center justify-between text-on-surface">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px] flex-shrink-0">calendar_month</span>
                <span className="font-medium">{student.validFrom} – {student.validUntil}</span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-bold">
                TERM '26
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification & Records Section */}
      <div className="rounded-2xl bg-surface-container-lowest shadow-sm p-space-md flex flex-col space-y-space-sm border border-surface-container">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">folder_managed</span>
            <h3 className="font-headline-sm text-sm font-bold text-on-surface">Verification & Records</h3>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            Govt Verified
          </span>
        </div>

        {/* Document Row */}
        <div className="rounded-xl bg-surface-container-low p-space-sm flex items-center justify-between gap-space-sm border border-surface-container">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0 text-primary">
              <span className="material-symbols-outlined text-[24px]">description</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-title-md text-xs font-bold text-on-surface truncate">
                {student.documentName || 'student_credential_doc.pdf'}
              </span>
              <div className="flex items-center gap-1 text-tertiary text-[11px]">
                <span className="material-symbols-outlined text-[14px] fill">check_circle</span>
                <span className="text-secondary">On-device document blob</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded bg-surface-container text-secondary">
            Verified
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-2 pt-space-xs">
        <button
          type="button"
          onClick={onResetApproval}
          className="w-full h-11 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-semibold text-xs flex items-center justify-center gap-2 border border-surface-container-highest transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">replay</span>
          <span>Re-test Onboarding Upload Gate</span>
        </button>

        <button
          type="button"
          onClick={onSwitchRole}
          className="w-full h-11 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs flex items-center justify-center gap-2 border border-surface-container transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">badge</span>
          <span>Switch to Conductor Mode</span>
        </button>
      </div>

      {/* Micro Offline Proof Timestamp */}
      <div className="rounded-xl bg-surface-container-low p-2.5 flex items-center justify-between text-secondary border border-surface-container text-xs">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-tertiary text-[18px]">offline_pin</span>
          <span className="text-[11px]">Local cryptographic token valid offline</span>
        </div>
        <span className="font-mono text-[10px] text-on-surface font-bold">HMAC OK</span>
      </div>
    </div>
  );
}
