import { useState } from 'react';
import { Student } from '../../db/students';
import { getLocalDateString } from '../../crypto/hmac';

interface CalendarProps {
  student: Student;
}

export default function Calendar({ student }: CalendarProps) {
  // Current view date (defaults to today)
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(now);
  const [selectedDayStr, setSelectedDayStr] = useState<string>(getLocalDateString(now));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // First day offset (0 = Sunday, 1 = Monday, etc.)
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Prev month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Used dates set
  const usedDatesSet = new Set(student.usedDates || []);

  // Format date helper: YYYY-MM-DD
  const formatIsoDate = (d: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Calculate validity metrics
  const validUntilDate = new Date(student.validUntil);
  const diffTime = Math.max(0, validUntilDate.getTime() - now.getTime());
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const tripsCount = student.usedDates?.length || 0;
  const estimatedSavings = tripsCount * 30; // ₹30 saved per verified ride

  const isSelectedDayUsed = usedDatesSet.has(selectedDayStr);
  const isSelectedDayToday = selectedDayStr === getLocalDateString(now);

  return (
    <div className="flex flex-col w-full pb-space-lg">
      {/* Active Commute Status Banner */}
      <div className="px-gutter pt-space-md pb-space-xs">
        <div className="bg-primary text-on-primary rounded-2xl p-space-md shadow-md flex items-start gap-space-sm relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[24px] text-on-primary fill">directions_bus</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-label-md text-[10px] uppercase tracking-wider text-primary-fixed font-bold">
                Active Pass Tier
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary mr-1 animate-ping"></span>
                ACTIVE
              </span>
            </div>
            <p className="font-headline-sm text-sm text-on-primary mt-0.5 leading-snug font-bold">
              Current Semester Concession
            </p>
            <p className="font-body-sm text-xs text-primary-fixed mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">event_repeat</span>
              Unlimited Daily Commutes (Mon–Sat)
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Interactive Card */}
      <div className="px-gutter py-space-sm">
        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-md border border-surface-container">
          {/* Month Header & Controls */}
          <div className="flex items-center justify-between pb-space-sm">
            <div className="flex flex-col">
              <span className="font-label-md text-[11px] uppercase tracking-wider text-secondary font-bold">
                Commute Timeline
              </span>
              <h2 className="font-headline-md text-base text-on-surface tracking-tight flex items-center gap-1.5 font-bold">
                {monthNames[month]} {year}
                <span className="material-symbols-outlined text-primary text-[18px] fill">verified</span>
              </h2>
            </div>
            <div className="flex items-center gap-1 bg-surface-container-low rounded-xl p-1 border border-surface-container">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous Month"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <span className="w-px h-4 bg-outline-variant"></span>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next Month"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center py-2 bg-surface-container-low rounded-xl mb-2 text-xs font-bold">
            <span className="text-error">Su</span>
            <span className="text-secondary">Mo</span>
            <span className="text-secondary">Tu</span>
            <span className="text-secondary">We</span>
            <span className="text-secondary">Th</span>
            <span className="text-secondary">Fr</span>
            <span className="text-secondary">Sa</span>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {/* Empty slots for start of month */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10 rounded-xl flex items-center justify-center text-secondary/30 select-none text-xs">
                -
              </div>
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = formatIsoDate(dayNum);
              const dayOfWeek = (firstDayIndex + i) % 7;
              const isSunday = dayOfWeek === 0;
              const isUsed = usedDatesSet.has(dateStr);
              const isToday = dateStr === '2026-09-18';
              const isSelected = dateStr === selectedDayStr;

              if (isSunday) {
                return (
                  <div
                    key={dateStr}
                    className="h-10 rounded-xl flex flex-col items-center justify-center bg-surface-container-highest/30 text-secondary select-none text-xs"
                    title="Sunday - Holiday"
                  >
                    <span className="line-through opacity-50">{dayNum}</span>
                    <span className="text-[9px] text-outline leading-none">–</span>
                  </div>
                );
              }

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDayStr(dateStr)}
                  className={`h-10 rounded-xl flex flex-col items-center justify-center relative transition-all text-xs font-semibold ${
                    isToday
                      ? 'bg-primary text-white shadow-md ring-2 ring-primary ring-offset-2'
                      : isSelected
                      ? 'bg-primary-fixed text-on-primary-fixed ring-2 ring-primary'
                      : isUsed
                      ? 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                      : 'bg-surface-container-low/50 hover:bg-surface-container text-secondary'
                  }`}
                >
                  <span>{dayNum}</span>
                  {isUsed && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-tertiary'}`}></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="mt-space-md pt-space-sm bg-surface-container-low rounded-xl px-3 py-2 flex items-center justify-between flex-wrap gap-2 text-xs border border-surface-container">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
              <span className="text-secondary font-medium">Verified Commute</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
              <span className="text-secondary font-medium">Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-outline">–</span>
              <span className="text-secondary font-medium">Sunday</span>
            </div>
          </div>

          {/* Selected Day Inspection Drawer */}
          <div className="mt-space-sm p-3 bg-surface-container rounded-xl flex items-center justify-between border border-surface-container-high">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0 text-primary">
                <span className="material-symbols-outlined text-[18px]">
                  {isSelectedDayToday ? 'today' : isSelectedDayUsed ? 'verified_user' : 'calendar_today'}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-title-md text-xs text-on-surface font-bold truncate">
                  {selectedDayStr} {isSelectedDayToday ? '(Today)' : ''}
                </span>
                <span className="font-body-sm text-[11px] text-secondary truncate">
                  {isSelectedDayUsed
                    ? '1 concession trip validated by conductor'
                    : isSelectedDayToday
                    ? 'Active QR pass ready for inspection'
                    : 'Scheduled travel day • Mon–Sat'}
                </span>
              </div>
            </div>
            <span className="font-mono text-[11px] text-primary bg-primary-fixed/50 px-2 py-0.5 rounded font-bold">
              {isSelectedDayUsed ? 'LOGGED' : 'ELIGIBLE'}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Metrics Card */}
      <div className="px-gutter pt-space-xs pb-space-lg">
        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-md border border-surface-container flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
              <h3 className="font-headline-sm text-sm font-bold text-on-surface">Concession Summary</h3>
            </div>
            <span className="font-label-md text-[10px] px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
              TERM 2026-B
            </span>
          </div>

          {/* Bento 2x2 Grid */}
          <div className="grid grid-cols-2 gap-space-sm">
            <div className="bg-surface-container-low rounded-xl p-3 flex flex-col justify-between border border-surface-container">
              <span className="font-label-md text-[10px] text-secondary uppercase tracking-wider font-bold">Pass Validity</span>
              <div className="mt-1">
                <p className="font-title-lg text-sm text-on-surface font-bold">{student.validUntil}</p>
                <p className="text-[10px] text-secondary">Expiry Date</p>
              </div>
            </div>

            <div className="bg-secondary-container/60 rounded-xl p-3 flex flex-col justify-between text-on-secondary-container border border-secondary-container">
              <span className="font-label-md text-[10px] text-on-secondary-container uppercase tracking-wider font-bold">Remaining</span>
              <div className="mt-1">
                <p className="font-headline-md text-lg font-bold text-on-secondary-container">{daysRemaining} days</p>
                <p className="text-[10px] text-on-secondary-container/80">Semester active</p>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-3 flex flex-col justify-between border border-surface-container">
              <span className="font-label-md text-[10px] text-secondary uppercase tracking-wider font-bold">Trips Logged</span>
              <div className="mt-1">
                <p className="font-headline-md text-lg font-bold text-on-surface">{tripsCount} rides</p>
                <p className="text-[10px] text-secondary">Verified by scans</p>
              </div>
            </div>

            <div className="bg-primary-fixed rounded-xl p-3 flex flex-col justify-between text-on-primary-fixed border border-primary-fixed-dim">
              <span className="font-label-md text-[10px] text-on-primary-fixed-variant uppercase tracking-wider font-bold">Est. Savings</span>
              <div className="mt-1">
                <p className="font-headline-md text-lg font-bold text-on-primary-fixed tracking-tight">₹{estimatedSavings}</p>
                <p className="text-[10px] text-on-primary-fixed-variant">Student subsidy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
