import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { db } from '../../db/db';
import { validateQRToken, ValidationResult } from '../../qr/validateToken';
import { generateStudentQRToken } from '../../qr/generateToken';
import { getLocalDateString } from '../../crypto/hmac';
import ScanResultCard from './ScanResultCard';
import { ScanRecord } from '../../db/scans';

export default function ScanQR() {
  const [scanResult, setScanResult] = useState<ValidationResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string>('');
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [showDemoPresets, setShowDemoPresets] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [stats, setStats] = useState({ valid: 0, invalid: 0, total: 0 });
  const [lastScan, setLastScan] = useState<ScanRecord | null>(null);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Load today's scan stats
  const refreshStats = useCallback(async () => {
    const todayStr = getLocalDateString();
    const todayScans = await db.scans.where('date').equals(todayStr).toArray();
    const validCount = todayScans.filter((s) => s.result === 'accepted').length;
    const invalidCount = todayScans.filter((s) => s.result === 'rejected').length;
    setStats({
      valid: validCount,
      invalid: invalidCount,
      total: todayScans.length
    });

    if (todayScans.length > 0) {
      setLastScan(todayScans[todayScans.length - 1]);
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // Process decoded QR code through validation pipeline
  const handleProcessQR = useCallback(async (rawText: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    console.log('[GoPass Scanner] QR Code detected:', rawText);

    // Pause scanning while dialog is open
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        html5QrCodeRef.current.pause(true);
      } catch (e) {
        console.warn('Could not pause scanner:', e);
      }
    }

    try {
      const res = await validateQRToken(rawText);
      console.log('[GoPass Scanner] Validation result:', res);
      setScanResult(res);
      await refreshStats();
    } catch (err) {
      console.error('[GoPass Scanner] Validation error:', err);
    } finally {
      isProcessingRef.current = false;
    }
  }, [refreshStats]);

  // Initialize camera scanner
  useEffect(() => {
    let isMounted = true;
    const scannerId = 'qr-reader-view';

    const startScanner = async () => {
      // Small timeout to ensure DOM container is laid out with valid dimensions
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (!isMounted) return;

      try {
        // Enumerate devices to get rear camera or default
        try {
          const devices = await Html5Qrcode.getCameras();
          if (isMounted && devices && devices.length > 0) {
            setAvailableCameras(devices);
            if (!selectedCameraId) {
              const backCam = devices.find(
                (d) =>
                  d.label.toLowerCase().includes('back') ||
                  d.label.toLowerCase().includes('rear') ||
                  d.label.toLowerCase().includes('environment')
              );
              setSelectedCameraId(backCam ? backCam.id : devices[0].id);
            }
          }
        } catch (e) {
          console.warn('Camera enumeration note:', e);
        }

        const html5QrCode = new Html5Qrcode(scannerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false
        });
        html5QrCodeRef.current = html5QrCode;

        // Config without restrictive qrbox so the entire frame is analyzed!
        const config = {
          fps: 15, // Smooth responsive frame capture
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            // Dynamic scan box taking 85% of visible dimension
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edge = Math.max(Math.floor(minEdge * 0.85), 200);
            return { width: edge, height: edge };
          },
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true // Native hardware acceleration
          }
        };

        const cameraSource = selectedCameraId
          ? { deviceId: { exact: selectedCameraId } }
          : { facingMode: 'environment' };

        await html5QrCode.start(
          cameraSource,
          config,
          (decodedText) => {
            if (isMounted) {
              handleProcessQR(decodedText);
            }
          },
          () => {
            // Frame drops / non-QR frames
          }
        );

        if (isMounted) {
          setCameraError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.warn('Camera initiation note:', err);
          // Fallback to generic user-facing or first available camera if environment failed
          try {
            if (html5QrCodeRef.current && !html5QrCodeRef.current.isScanning) {
              await html5QrCodeRef.current.start(
                { facingMode: 'user' },
                { fps: 15 },
                (decodedText) => {
                  if (isMounted) handleProcessQR(decodedText);
                },
                () => {}
              );
              setCameraError(null);
              return;
            }
          } catch (fallbackErr) {
            console.warn('Fallback camera error:', fallbackErr);
          }

          setCameraError(
            err instanceof Error
              ? err.message
              : 'Camera access unavailable. You can use the Demo QR Simulators or Manual Entry below.'
          );
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(() => {}).finally(() => {
            try {
              html5QrCodeRef.current?.clear();
            } catch {
              // Ignore
            }
          });
        }
      }
    };
  }, [selectedCameraId, handleProcessQR]);

  // Close Result Card & Resume Scanner
  const handleCloseResult = () => {
    setScanResult(null);
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.resume();
      } catch {
        // Safe ignore
      }
    }
  };

  // Toggle Torch if supported
  const handleToggleTorch = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        const nextState = !torchOn;
        await html5QrCodeRef.current.applyVideoConstraints({
          // @ts-expect-error Torch is experimental in standard MediaTrackConstraints
          advanced: [{ torch: nextState }]
        });
        setTorchOn(nextState);
      } catch (err) {
        console.warn('Torch constraint not supported on this device:', err);
        setTorchOn(!torchOn);
      }
    } else {
      setTorchOn(!torchOn);
    }
  };

  // Manual Direct Code Verification
  const handleVerifyManual = async () => {
    if (!manualCode.trim()) return;
    const targetSid = manualCode.trim().toUpperCase();
    const todayStr = getLocalDateString();
    const student = await db.students.get(targetSid);
    if (!student) {
      await handleProcessQR(JSON.stringify({ sid: targetSid, date: todayStr, nonce: 'MANUAL', mac: 'INVALID' }));
    } else {
      const { jsonString } = await generateStudentQRToken(student);
      await handleProcessQR(jsonString);
    }
    setManualCode('');
    setShowManualModal(false);
  };

  // Preset Demo Simulators
  const handleSimulatePreset = async (type: 'valid_s001' | 'valid_s002' | 'tampered' | 'expired_date' | 'expired_concession' | 'unknown') => {
    const todayStr = getLocalDateString();

    if (type === 'valid_s001') {
      const s = await db.students.get('S001');
      if (s) {
        const { jsonString } = await generateStudentQRToken(s);
        await handleProcessQR(jsonString);
      }
    } else if (type === 'valid_s002') {
      const s = await db.students.get('S002');
      if (s) {
        const { jsonString } = await generateStudentQRToken(s);
        await handleProcessQR(jsonString);
      }
    } else if (type === 'tampered') {
      const s = await db.students.get('S001');
      if (s) {
        const token = await generateStudentQRToken(s);
        token.payload.mac = 'TAMPERED_HASH_INVALID_12345';
        await handleProcessQR(JSON.stringify(token.payload));
      }
    } else if (type === 'expired_date') {
      const s = await db.students.get('S001');
      if (s) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const token = await generateStudentQRToken(s, getLocalDateString(yesterday));
        await handleProcessQR(JSON.stringify(token.payload));
      }
    } else if (type === 'expired_concession') {
      const s = await db.students.get('S003');
      if (s) {
        const token = await generateStudentQRToken(s, todayStr);
        await handleProcessQR(JSON.stringify(token.payload));
      }
    } else if (type === 'unknown') {
      await handleProcessQR(JSON.stringify({
        sid: 'S999_UNKNOWN',
        date: todayStr,
        nonce: '9999AAAA',
        mac: 'UNKNOWN_MAC'
      }));
    }
  };

  return (
    <div className="flex flex-col w-full pb-6">
      {/* Conductor Status Banner */}
      <div className="w-full bg-inverse-surface text-inverse-on-surface px-gutter py-space-sm flex items-center justify-between shadow-md">
        <div className="flex items-center gap-space-sm min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 text-white">
            <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-xs font-bold text-white tracking-wide uppercase">
                GoPass INSPECTOR
              </span>
              <span className="bg-primary-container text-white px-1.5 py-0.2 rounded text-[10px] font-mono font-bold">
                BUS #104
              </span>
            </div>
            <span className="text-[11px] text-surface-variant/80 truncate">
              Shift Active • Offline Sensor Ready
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-container text-on-tertiary-container flex-shrink-0 shadow-sm text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-ping"></span>
          <span className="material-symbols-outlined text-[14px]">cloud_done</span>
          <span>DEPOT SYNCED</span>
        </div>
      </div>

      {/* Route Info Strip */}
      <div className="w-full bg-surface-container-highest px-gutter py-space-xs flex items-center justify-between text-on-surface border-b border-surface-container">
        <div className="flex items-center gap-space-xs text-xs font-semibold">
          <span className="material-symbols-outlined text-primary text-[18px]">directions_bus</span>
          <span className="font-bold text-primary">ROUTE 104 EXPRESS</span>
          <span className="text-secondary">•</span>
          <span className="font-mono text-secondary">#KL-15-A-9821</span>
        </div>
        <div className="flex items-center gap-1 text-tertiary text-xs font-bold bg-tertiary-fixed/30 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
          <span>ON SCHEDULE</span>
        </div>
      </div>

      {/* Optical Camera Viewfinder Container */}
      <div className="relative w-full overflow-hidden bg-slate-950 flex flex-col items-center justify-center min-h-[380px] p-4">
        {/* Camera Video Stream Container with explicit minimum dimensions */}
        <div
          id="qr-reader-view"
          className="w-full max-w-[320px] min-h-[280px] rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/40 bg-black"
        ></div>

        {/* Camera Switcher if multiple lenses exist */}
        {availableCameras.length > 1 && (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-300">
            <span>Camera:</span>
            <select
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              className="bg-slate-800 text-white text-xs px-2 py-1 rounded border border-slate-700"
            >
              {availableCameras.map((cam) => (
                <option key={cam.id} value={cam.id}>
                  {cam.label || `Camera ${cam.id.substring(0, 5)}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Camera Notice if hardware stream blocked */}
        {cameraError && (
          <div className="mt-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-center max-w-xs text-xs text-slate-300">
            <span className="material-symbols-outlined text-primary text-xl mb-1">photo_camera_front</span>
            <p className="font-semibold text-white">Camera Notice</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {cameraError}
            </p>
          </div>
        )}

        {/* Viewfinder Guide Overlay */}
        <div className="mt-3 flex flex-col items-center gap-1 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-lg text-on-surface text-xs font-bold">
            <span className="material-symbols-outlined text-primary text-[18px]">qr_code_scanner</span>
            <span>Point camera at student's QR pass</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            100% Offline • Instant 100ms verification
          </p>
        </div>
      </div>

      {/* Quick Conductor Controls */}
      <div className="w-full px-gutter py-space-sm bg-surface-container-low flex items-center justify-center gap-2 border-y border-surface-container">
        <button
          type="button"
          onClick={handleToggleTorch}
          className={`flex-1 h-11 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm border transition-all ${
            torchOn
              ? 'bg-primary-fixed text-on-primary-fixed border-primary'
              : 'bg-surface-container-lowest text-on-surface border-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-primary text-[20px]">
            {torchOn ? 'flashlight_off' : 'flashlight_on'}
          </span>
          <span>{torchOn ? 'Torch ON' : 'Torch Light'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowManualModal(!showManualModal)}
          className="flex-1 h-11 rounded-xl bg-surface-container-lowest text-on-surface font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm border border-surface-container active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-secondary text-[20px]">keyboard</span>
          <span>Manual Entry</span>
        </button>

        <button
          type="button"
          onClick={() => setShowDemoPresets(!showDemoPresets)}
          className="flex-1 h-11 rounded-xl bg-primary text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-white text-[20px]">play_circle</span>
          <span>Test Presets</span>
        </button>
      </div>

      {/* Manual Entry Drawer */}
      {showManualModal && (
        <div className="p-4 bg-surface-container border-b border-surface-container-high flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface">Enter Student ID / Roll Code:</span>
            <button
              onClick={() => setShowManualModal(false)}
              className="text-secondary hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. S001 or S002"
              className="flex-1 h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-mono text-xs border border-surface-container-high focus:outline-none"
            />
            <button
              onClick={handleVerifyManual}
              className="h-10 px-4 rounded-lg bg-primary text-white font-bold text-xs shadow"
            >
              Verify
            </button>
          </div>
        </div>
      )}

      {/* Preset Demo Simulator Bar */}
      {showDemoPresets && (
        <div className="p-4 bg-surface-container-low border-b border-surface-container flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">science</span>
              <span>1-Click Test Scenarios (PRD §6.3 Rejections):</span>
            </span>
            <button
              onClick={() => setShowDemoPresets(false)}
              className="text-secondary hover:text-on-surface text-xs"
            >
              Hide
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleSimulatePreset('valid_s001')}
              className="p-2 rounded-lg bg-green-50 text-green-800 border border-green-200 font-semibold text-left flex items-center justify-between"
            >
              <span>1. Valid Pass (Sarah S001)</span>
              <span className="text-[10px] bg-green-200 px-1 rounded">✅ Pass</span>
            </button>
            <button
              onClick={() => handleSimulatePreset('valid_s001')}
              className="p-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-left flex items-center justify-between"
            >
              <span>2. Scan Same QR Again</span>
              <span className="text-[10px] bg-amber-200 px-1 rounded">❌ Duplicate</span>
            </button>
            <button
              onClick={() => handleSimulatePreset('tampered')}
              className="p-2 rounded-lg bg-red-50 text-red-800 border border-red-200 font-semibold text-left flex items-center justify-between"
            >
              <span>3. Tampered MAC</span>
              <span className="text-[10px] bg-red-200 px-1 rounded">❌ Invalid</span>
            </button>
            <button
              onClick={() => handleSimulatePreset('expired_date')}
              className="p-2 rounded-lg bg-red-50 text-red-800 border border-red-200 font-semibold text-left flex items-center justify-between"
            >
              <span>4. Yesterday's Date</span>
              <span className="text-[10px] bg-red-200 px-1 rounded">❌ Expired</span>
            </button>
            <button
              onClick={() => handleSimulatePreset('expired_concession')}
              className="p-2 rounded-lg bg-red-50 text-red-800 border border-red-200 font-semibold text-left flex items-center justify-between"
            >
              <span>5. Expired Concession (S003)</span>
              <span className="text-[10px] bg-red-200 px-1 rounded">❌ Window</span>
            </button>
            <button
              onClick={() => handleSimulatePreset('unknown')}
              className="p-2 rounded-lg bg-red-50 text-red-800 border border-red-200 font-semibold text-left flex items-center justify-between"
            >
              <span>6. Unknown Student ID</span>
              <span className="text-[10px] bg-red-200 px-1 rounded">❌ Unknown</span>
            </button>
          </div>
        </div>
      )}

      {/* Conductor Shift Stats */}
      <div className="w-full px-gutter py-space-md flex flex-col gap-space-sm bg-surface">
        <div className="flex items-center justify-between">
          <span className="font-headline-sm text-xs font-bold text-on-surface uppercase tracking-wider">
            Trip Scan Summary
          </span>
          <span className="font-label-md text-[10px] text-secondary uppercase tracking-wider font-bold">
            Trip #3 • Route 104
          </span>
        </div>

        {/* 3 Metric Tiles */}
        <div className="grid grid-cols-3 gap-2 w-full">
          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex flex-col items-start shadow-sm">
            <div className="flex items-center gap-1 text-tertiary text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>VALID</span>
            </div>
            <span className="text-xl font-extrabold text-on-surface mt-1">{stats.valid}</span>
            <span className="text-[10px] text-secondary truncate">Accepted passes</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex flex-col items-start shadow-sm">
            <div className="flex items-center gap-1 text-error text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>INVALID</span>
            </div>
            <span className="text-xl font-extrabold text-on-surface mt-1">{stats.invalid}</span>
            <span className="text-[10px] text-secondary truncate">Rejected passes</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex flex-col items-start shadow-sm">
            <div className="flex items-center gap-1 text-secondary text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
              <span>TOTAL</span>
            </div>
            <span className="text-xl font-extrabold text-on-surface mt-1">{stats.total}</span>
            <span className="text-[10px] text-secondary truncate">Offline logs</span>
          </div>
        </div>

        {/* Last Scanned Receipt Banner */}
        {lastScan && (
          <div className="w-full p-3 rounded-xl bg-surface-container flex items-center justify-between shadow-sm border border-surface-container-high mt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm ${
                  lastScan.result === 'accepted' ? 'bg-tertiary' : 'bg-error'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {lastScan.result === 'accepted' ? 'check' : 'close'}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-on-surface truncate">
                  {lastScan.studentName || `ID: ${lastScan.sid}`}
                </span>
                <span className="text-[10px] text-secondary truncate">
                  {lastScan.result === 'accepted' ? 'Pass Validated' : lastScan.reason}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              <span className="font-mono text-[10px] text-secondary">
                {new Date(lastScan.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span
                className={`text-[10px] font-bold ${
                  lastScan.result === 'accepted' ? 'text-tertiary' : 'text-error'
                }`}
              >
                {lastScan.result === 'accepted' ? 'ACCEPTED' : 'REJECTED'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Result Card Modal */}
      {scanResult && (
        <ScanResultCard
          result={scanResult}
          onClose={handleCloseResult}
        />
      )}
    </div>
  );
}
