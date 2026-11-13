import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Clock,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  Volume2,
  VolumeX,
  AlertTriangle,
  Train,
  Calendar,
  Users,
  CreditCard,
  Play,
  RotateCcw,
  CheckSquare,
  Square,
  Sparkles,
  Terminal,
  Sliders,
  Award,
  Info,
  Trash2,
  Plus,
  UserPlus,
  Smartphone,
  Wifi,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

// --- POPULAR STATION PRESETS ---
const POPULAR_STATIONS = [
  { code: 'CSMT', name: 'Mumbai CSMT' },
  { code: 'BCT', name: 'Mumbai Central (MMCT)' },
  { code: 'LTT', name: 'Lokmanya Tilak T' },
  { code: 'NDLS', name: 'New Delhi' },
  { code: 'PUNE', name: 'Pune Jn' },
  { code: 'ADI', name: 'Ahmedabad Jn' },
  { code: 'HWH', name: 'Howrah Jn' },
  { code: 'SBC', name: 'KSR Bengaluru' },
  { code: 'MAS', name: 'MGR Chennai Central' },
  { code: 'PNBE', name: 'Patna Jn' },
  { code: 'BSB', name: 'Varanasi Jn' },
  { code: 'JP', name: 'Jaipur Jn' }
];

// --- CLASS TATKAL FARE RULES (OFFICIAL IRCTC APPROX BREAKDOWN) ---
const CLASS_RULES = {
  '3A': { name: 'AC 3 Tier (3A)', slot: 'AC', minTatkal: 300, maxTatkal: 400, clerkage: 40 },
  '2A': { name: 'AC 2 Tier (2A)', slot: 'AC', minTatkal: 400, maxTatkal: 500, clerkage: 50 },
  '3E': { name: 'AC 3 Economy (3E)', slot: 'AC', minTatkal: 300, maxTatkal: 400, clerkage: 40 },
  'CC': { name: 'AC Chair Car (CC)', slot: 'AC', minTatkal: 125, maxTatkal: 225, clerkage: 40 },
  'EC': { name: 'Exec. Chair Car (EC)', slot: 'AC', minTatkal: 400, maxTatkal: 500, clerkage: 60 },
  'SL': { name: 'Sleeper Class (SL)', slot: 'NON_AC', minTatkal: 100, maxTatkal: 200, clerkage: 20 },
  '2S': { name: 'Second Sitting (2S)', slot: 'NON_AC', minTatkal: 10, maxTatkal: 15, clerkage: 15 }
};

// --- INITIAL DEMO PASSENGERS ---
const DEMO_PASSENGERS = [
  { id: '1', name: 'Rahul Sharma', age: '29', gender: 'M', berth: 'LB', idType: 'Aadhaar' },
  { id: '2', name: 'Priya Sharma', age: '27', gender: 'F', berth: 'UB', idType: 'Aadhaar' }
];

// --- INITIAL CHECKLIST ---
const INITIAL_CHECKLIST = [
  {
    id: 'master_list',
    title: 'Master List Pre-Saved before 09:45 AM',
    desc: 'RailOne > Profile > Master List mein passengers pehle se add karein (Saves 22s).',
    checked: true
  },
  {
    id: 'payment_ready',
    title: 'R-Wallet Funded OR Secondary Phone Unlocked',
    desc: 'Doosre phone par GPay/PhonePe khol kar rakhein ya UPI ID niche Vault se copy rakhein.',
    checked: true
  },
  {
    id: 'confirm_berths',
    title: 'Tick "Book only if confirm berths are allotted"',
    desc: 'Isse agar seats khatam ho gayi to Waiting List ticket nahi banega aur paise safe rahenge.',
    checked: true
  },
  {
    id: 'auto_upgrade',
    title: 'Tick "Consider for Auto-Upgradation"',
    desc: 'Upper class mein khali seat hone par free upgrade aur confirm seat ke chances badhte hain.',
    checked: false
  },
  {
    id: 'network_lock',
    title: '5G / High-Speed Fiber Checked (No VPN)',
    desc: 'Background downloads band karein aur 09:58 AM ke baad network switch bilkul na karein.',
    checked: false
  }
];

export default function App() {
  // ==========================================
  // 1. ATOMIC CLOCK & SIMULATION ENGINE STATE
  // ==========================================
  const [tatkalMode, setTatkalMode] = useState('AC'); // 'AC' (10:00) or 'NON_AC' (11:00)
  const [offsetMs, setOffsetMs] = useState(0); // -2000 to +2000ms server sync calibration
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStartRealMs, setSimStartRealMs] = useState(0);
  const [nowMs, setNowMs] = useState(Date.now());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastBeepSecRef = useRef(null);

  // Audio synthesis helper (Web Audio API - zero external files needed)
  const playBeep = (freq = 880, duration = 0.12, type = 'sine') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio unlock restrictions until user interacts
    }
  };

  // High-precision 40ms ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Compute current effective IST Date object (either real + offset or simulated final 60s rush)
  const clockData = useMemo(() => {
    const targetHour = tatkalMode === 'AC' ? 10 : 11;

    if (isSimulating) {
      const elapsed = nowMs - simStartRealMs;
      // Simulate from 09:59:00.000 (or 10:59:00.000) for 70 seconds up to 10:00:10
      if (elapsed > 70000) {
        setIsSimulating(false);
      }
      const baseDate = new Date();
      // Convert to IST components
      const utcMs = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000;
      const istDate = new Date(utcMs + 5.5 * 3600000);
      istDate.setHours(targetHour - 1, 59, 0, 0);
      const simCurrent = new Date(istDate.getTime() + elapsed);

      const targetDate = new Date(istDate.getTime() + 60000); // Exact 10:00:00 or 11:00:00
      const diffSec = (targetDate.getTime() - simCurrent.getTime()) / 1000;

      return {
        istDate: simCurrent,
        diffSec,
        targetHour
      };
    } else {
      const syncedUtc = nowMs + offsetMs;
      const d = new Date(syncedUtc);
      const utcMs = d.getTime() + d.getTimezoneOffset() * 60000;
      const istDate = new Date(utcMs + 5.5 * 3600000);

      const targetDate = new Date(istDate);
      targetDate.setHours(targetHour, 0, 0, 0);

      // If already past 10:05 AM / 11:05 AM today, target tomorrow's slot
      if (istDate.getTime() - targetDate.getTime() > 300000) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      const diffSec = (targetDate.getTime() - istDate.getTime()) / 1000;
      return {
        istDate,
        diffSec,
        targetHour
      };
    }
  }, [nowMs, offsetMs, tatkalMode, isSimulating, simStartRealMs]);

  // Trigger audio cues at critical seconds during final countdown
  useEffect(() => {
    const secRemaining = Math.ceil(clockData.diffSec);
    if (secRemaining !== lastBeepSecRef.current) {
      lastBeepSecRef.current = secRemaining;
      if (secRemaining === 180) playBeep(520, 0.25, 'triangle'); // T-3m Login cue
      if (secRemaining === 30) playBeep(660, 0.2, 'sine'); // T-30s Hold cue
      if (secRemaining <= 5 && secRemaining > 0) playBeep(880, 0.1, 'sine'); // Last 5s ticks
      if (secRemaining === 0) playBeep(1320, 0.45, 'square'); // GO cue!
    }
  }, [clockData.diffSec]);

  const start60sSimulation = () => {
    lastBeepSecRef.current = null;
    setSimStartRealMs(Date.now());
    setIsSimulating(true);
    playBeep(660, 0.15, 'sine');
  };

  // Determine tactical phase message & styling
  const tacticalPhase = useMemo(() => {
    const s = clockData.diffSec;
    if (s <= 0 && s >= -300) {
      return {
        code: 'PHASE 5: LIVE EXECUTION',
        color: 'emerald',
        pulse: true,
        headline: 'BOOKING WINDOW OPEN! TAP CLASS & SELECT MASTER LIST NOW!',
        instruction: 'Do NOT hit Back or Refresh while loading. Select passengers from Master List -> Tick Confirm Berth -> Pay via UPI/R-Wallet.'
      };
    }
    if (s <= 3 && s > 0) {
      return {
        code: 'PHASE 4: STRIKE ZONE (T-3s)',
        color: 'emerald',
        pulse: true,
        headline: 'TAP TRAIN CLASS NOW! SERVER GATE OPENING...',
        instruction: 'Keep finger on 3A/2A/SL refresh button. Tap right now so your request reaches IRCTC server at 00.01s!'
      };
    }
    if (s <= 30 && s > 3) {
      return {
        code: 'PHASE 3: HOLD POSITION (T-30s)',
        color: 'amber',
        pulse: true,
        headline: 'HOLD ON TRAIN LIST SCREEN — DO NOT REFRESH TOO EARLY!',
        instruction: 'Keep UPI ID copied in clipboard below. Keep finger hovered over your train class button. Wait for T-2 seconds.'
      };
    }
    if (s <= 180 && s > 30) {
      return {
        code: 'PHASE 2: LOGIN & SEARCH (T-3m)',
        color: 'cyan',
        pulse: false,
        headline: 'LOGIN TO RAILONE / IRCTC NOW & SELECT TATKAL QUOTA',
        instruction: 'Complete MPIN/Biometric login now. Enter From -> To -> Date -> Quota: TATKAL and reach the Train List screen.'
      };
    }
    if (s <= 300 && s > 180) {
      return {
        code: 'PHASE 1: NETWORK & UPI PREP (T-5m)',
        color: 'amber',
        pulse: false,
        headline: 'PREPARE DEVICES: LOCK 5G/FIBER & COPY UPI ID',
        instruction: 'Close all background apps. Open GPay/PhonePe on your secondary phone. Copy your UPI ID from the Speed Vault below.'
      };
    }
    return {
      code: 'STANDBY / PREP MODE',
      color: 'slate',
      pulse: false,
      headline: `NEXT ${tatkalMode === 'AC' ? 'AC (10:00 AM)' : 'NON-AC (11:00 AM)'} TATKAL WINDOW ARMED`,
      instruction: 'Save your passengers & UPI ID in the Vault below, verify your exact Booking Date, or click "Simulate Final 60s Rush" to practice.'
    };
  }, [clockData.diffSec, tatkalMode]);

  // Format Clock strings
  const formatIST = (d) => {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    const ms = String(Math.floor(d.getMilliseconds() / 10)).padStart(2, '0');
    return { hh, mm, ss, ms };
  };

  const formatCountdown = (diffSec) => {
    if (diffSec <= 0 && diffSec >= -300) {
      return `LIVE +${Math.abs(diffSec).toFixed(1)}s`;
    }
    const totalSec = Math.max(0, Math.floor(diffSec));
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const tenths = Math.floor((Math.max(0, diffSec) % 1) * 10);
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
  };

  const timeParts = formatIST(clockData.istDate);

  // ==========================================
  // 2. TATKAL DATE & MULTI-DAY TRAP CALCULATOR
  // ==========================================
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }, []);

  const [fromStn, setFromStn] = useState('CSMT');
  const [toStn, setToStn] = useState('NDLS');
  const [trainInfo, setTrainInfo] = useState('12951 - Tejas Rajdhani / Exp');
  const [boardingDate, setBoardingDate] = useState(tomorrowStr);
  const [travelClass, setTravelClass] = useState('3A');
  const [trainDayOffset, setTrainDayOffset] = useState(1); // 1 = Same day origin, 2 = Started yesterday, 3 = Started 2 days ago

  const handleClassChange = (cls) => {
    setTravelClass(cls);
    const rule = CLASS_RULES[cls];
    if (rule) {
      setTatkalMode(rule.slot);
    }
  };

  const bookingCalculation = useMemo(() => {
    if (!boardingDate) return null;
    const [y, m, d] = boardingDate.split('-').map(Number);
    const boardObj = new Date(y, m - 1, d);

    // Train origin date = Boarding Date minus (trainDayOffset - 1) days
    const originObj = new Date(boardObj);
    originObj.setDate(originObj.getDate() - (trainDayOffset - 1));

    // Tatkal opens 1 day before Train Origin Date!
    const tatkalOpenObj = new Date(originObj);
    tatkalOpenObj.setDate(tatkalOpenObj.getDate() - 1);

    const rule = CLASS_RULES[travelClass] || CLASS_RULES['3A'];
    const openTimeStr = rule.slot === 'AC' ? '10:00:00 AM IST' : '11:00:00 AM IST';
    const loginTimeStr = rule.slot === 'AC' ? '09:57:00 AM IST' : '10:57:00 AM IST';

    const fmt = (dt) =>
      dt.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

    return {
      boardingFormatted: fmt(boardObj),
      originFormatted: fmt(originObj),
      tatkalOpenFormatted: fmt(tatkalOpenObj),
      openTimeStr,
      loginTimeStr,
      isMultiDayTrap: trainDayOffset > 1,
      rule
    };
  }, [boardingDate, travelClass, trainDayOffset]);

  // ==========================================
  // 3. 1-TAP SPEED VAULT (LOCALSTORAGE)
  // ==========================================
  const [primaryUpi, setPrimaryUpi] = useState(() => {
    return localStorage.getItem('tatkal_primary_upi') || 'rahulsharma@okaxis';
  });
  const [backupUpi, setBackupUpi] = useState(() => {
    return localStorage.getItem('tatkal_backup_upi') || '9876543210@ybl';
  });
  const [passengers, setPassengers] = useState(() => {
    const saved = localStorage.getItem('tatkal_passengers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEMO_PASSENGERS;
      }
    }
    return DEMO_PASSENGERS;
  });
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    localStorage.setItem('tatkal_primary_upi', primaryUpi);
  }, [primaryUpi]);

  useEffect(() => {
    localStorage.setItem('tatkal_backup_upi', backupUpi);
  }, [backupUpi]);

  useEffect(() => {
    localStorage.setItem('tatkal_passengers', JSON.stringify(passengers));
  }, [passengers]);

  const copyToClipboard = (text, keyLabel) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(keyLabel);
    playBeep(1046, 0.08, 'sine');
    setTimeout(() => {
      setCopiedKey((prev) => (prev === keyLabel ? null : prev));
    }, 1800);
  };

  const updatePassenger = (id, field, value) => {
    setPassengers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const addPassenger = () => {
    if (passengers.length >= 4) return;
    setPassengers((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: '',
        age: '',
        gender: 'M',
        berth: 'No Choice',
        idType: 'Aadhaar'
      }
    ]);
  };

  const removePassenger = (id) => {
    setPassengers((prev) => prev.filter((p) => p.id !== id));
  };

  const loadDemoVault = () => {
    setPrimaryUpi('rahulsharma@okaxis');
    setBackupUpi('9876543210@ybl');
    setPassengers(DEMO_PASSENGERS);
    playBeep(784, 0.1, 'sine');
  };

  const clearVault = () => {
    setPrimaryUpi('');
    setBackupUpi('');
    setPassengers([
      { id: '1', name: '', age: '', gender: 'M', berth: 'LB', idType: 'Aadhaar' }
    ]);
  };

  // ==========================================
  // 4. CHECKLIST & 15-SECOND SPEED DRILL GAME
  // ==========================================
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const toggleChecklist = (id) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };
  const checklistProgress = Math.round(
    (checklist.filter((i) => i.checked).length / checklist.length) * 100
  );

  // Speed Drill Simulator State
  const [drillState, setDrillState] = useState('IDLE'); // IDLE, RUNNING, DONE
  const [drillStep, setDrillStep] = useState(0);
  const [drillStartMs, setDrillStartMs] = useState(0);
  const [drillElapsedMs, setDrillElapsedMs] = useState(0);
  const [bestDrillMs, setBestDrillMs] = useState(() => {
    const saved = localStorage.getItem('tatkal_best_drill_ms');
    return saved ? Number(saved) : null;
  });

  useEffect(() => {
    if (drillState !== 'RUNNING') return;
    const timer = setInterval(() => {
      setDrillElapsedMs(Date.now() - drillStartMs);
    }, 30);
    return () => clearInterval(timer);
  }, [drillState, drillStartMs]);

  const startSpeedDrill = () => {
    setDrillState('RUNNING');
    setDrillStep(1);
    setDrillStartMs(Date.now());
    setDrillElapsedMs(0);
    playBeep(880, 0.1, 'sine');
  };

  const advanceDrillStep = (expectedStep) => {
    if (drillState !== 'RUNNING' || drillStep !== expectedStep) return;
    playBeep(980 + expectedStep * 120, 0.08, 'sine');
    if (expectedStep === 4) {
      const finalTime = Date.now() - drillStartMs;
      setDrillElapsedMs(finalTime);
      setDrillState('DONE');
      if (!bestDrillMs || finalTime < bestDrillMs) {
        setBestDrillMs(finalTime);
        localStorage.setItem('tatkal_best_drill_ms', String(finalTime));
      }
    } else {
      setDrillStep(expectedStep + 1);
    }
  };

  // Copy prompt / summary of booking plan
  const copyBookingPlanSummary = () => {
    if (!bookingCalculation) return;
    const summary = `🚆 RAILONE TATKAL PRO — EXECUTION PLAN
• Route: ${fromStn} ➔ ${toStn} (${trainInfo})
• Class: ${bookingCalculation.rule.name}
• Boarding Date: ${bookingCalculation.boardingFormatted} (Day ${trainDayOffset} of train run)
• EXACT TATKAL BOOKING DATE: ${bookingCalculation.tatkalOpenFormatted}
• Login Time: ${bookingCalculation.loginTimeStr}
• Booking Opens: ${bookingCalculation.openTimeStr}
• Passengers Ready: ${passengers.filter((p) => p.name).length}
• Primary UPI: ${primaryUpi}`;
    copyToClipboard(summary, 'PLAN_SUMMARY');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 pb-10">
      {/* TOP STATUS & TELEMETRY BAR */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shadow-inner shadow-emerald-500/20">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  RailOne Tatkal Pro
                </h1>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  100% Legal Companion
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Atomic IST Synchronizer • Multi-Day Origin Calculator • 1-Tap UPI & Master Vault
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Slot Mode Switcher */}
            <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800">
              <button
                onClick={() => setTatkalMode('AC')}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                  tatkalMode === 'AC'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                AC (10:00 AM)
              </button>
              <button
                onClick={() => setTatkalMode('NON_AC')}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                  tatkalMode === 'NON_AC'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SL/2S (11:00 AM)
              </button>
            </div>

            {/* Simulate 60s Rush Button */}
            {!isSimulating ? (
              <button
                onClick={start60sSimulation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 transition-all cursor-pointer"
                title="Practice the final 60 seconds before 10:00 AM anytime"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate Final 60s Rush</span>
              </button>
            ) : (
              <button
                onClick={() => setIsSimulating(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Exit Simulation</span>
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-slate-900 border-slate-700 text-emerald-400 hover:border-emerald-500/40'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={soundEnabled ? 'Audio Cues ON' : 'Audio Cues Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN WORKSTATION GRID */}
      <main className="max-w-[1440px] mx-auto px-4 pt-4 space-y-4">
        {/* ============================================================
            HERO MODULE 1: PRECISION IST ATOMIC CLOCK & TACTICAL RADAR
        ============================================================ */}
        <section className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl relative overflow-hidden">
          {/* Subtle ambient glow based on phase */}
          <div
            className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20 ${
              tacticalPhase.color === 'emerald'
                ? 'bg-emerald-500'
                : tacticalPhase.color === 'amber'
                ? 'bg-amber-500'
                : tacticalPhase.color === 'cyan'
                ? 'bg-cyan-500'
                : 'bg-slate-600'
            }`}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Left 4 Cols: Live Millisecond Atomic Clock */}
            <div className="lg:col-span-4 bg-slate-950/90 border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="inline-flex items-center gap-1.5 font-mono uppercase tracking-wider text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {isSimulating ? 'SIMULATED IST CLOCK' : 'LIVE IST SERVER TIME'}
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  Offset: {offsetMs >= 0 ? `+${offsetMs}` : offsetMs}ms
                </span>
              </div>

              <div className="my-1 flex items-baseline justify-center sm:justify-start font-mono tracking-tight">
                <span className="text-3xl sm:text-4xl xl:text-5xl font-bold text-white">
                  {timeParts.hh}:{timeParts.mm}:{timeParts.ss}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-400 ml-1">
                  .{timeParts.ms}
                </span>
                <span className="ml-2 text-xs font-mono text-slate-400 uppercase">IST</span>
              </div>

              {/* Manual Latency Calibration Bar */}
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-cyan-400" />
                  Sync IRCTC Tick:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setOffsetMs((m) => Math.max(-2000, m - 250))}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono cursor-pointer"
                  >
                    -0.25s
                  </button>
                  <button
                    onClick={() => setOffsetMs(0)}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 text-[11px] font-mono cursor-pointer"
                  >
                    0
                  </button>
                  <button
                    onClick={() => setOffsetMs((m) => Math.min(2000, m + 250))}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono cursor-pointer"
                  >
                    +0.25s
                  </button>
                </div>
              </div>
            </div>

            {/* Middle 3 Cols: T-Minus Countdown Box */}
            <div className="lg:col-span-3 bg-slate-950/90 border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono uppercase tracking-wider">
                  {tatkalMode === 'AC' ? '10:00 AM AC GATE' : '11:00 AM SL GATE'}
                </span>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </div>

              <div className="my-2 text-center sm:text-left">
                <div
                  className={`text-2xl sm:text-3xl xl:text-4xl font-mono font-bold tracking-tight ${
                    clockData.diffSec <= 10
                      ? 'text-emerald-400 animate-pulse'
                      : clockData.diffSec <= 60
                      ? 'text-amber-400'
                      : 'text-cyan-300'
                  }`}
                >
                  T - {formatCountdown(clockData.diffSec)}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span>Login Window:</span>
                <span className="font-mono text-emerald-300 font-semibold">
                  {tatkalMode === 'AC' ? '09:57:00 AM' : '10:57:00 AM'}
                </span>
              </div>
            </div>

            {/* Right 5 Cols: Live Tactical Phase Command Display */}
            <div
              className={`lg:col-span-5 rounded-xl p-4 border transition-all ${
                tacticalPhase.color === 'emerald'
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                  : tacticalPhase.color === 'amber'
                  ? 'bg-amber-950/30 border-amber-500/50'
                  : tacticalPhase.color === 'cyan'
                  ? 'bg-cyan-950/30 border-cyan-500/50'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className={`text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                    tacticalPhase.color === 'emerald'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : tacticalPhase.color === 'amber'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : tacticalPhase.color === 'cyan'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {tacticalPhase.code}
                </span>
                {isSimulating && (
                  <span className="text-[11px] font-mono text-cyan-300 animate-pulse">
                    ● DRILL ACTIVE
                  </span>
                )}
              </div>

              <h2
                className={`text-sm sm:text-base font-bold tracking-tight mb-1 ${
                  tacticalPhase.pulse ? 'text-white animate-pulse' : 'text-white'
                }`}
              >
                {tacticalPhase.headline}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {tacticalPhase.instruction}
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================
            THREE-COLUMN CORE COMMAND MODULES
        ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* ------------------------------------------------------------
              COLUMN 1 (4 Cols): TATKAL DATE & MULTI-DAY TRAP CALCULATOR
          ------------------------------------------------------------ */}
          <section className="lg:col-span-4 rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  1. Booking Date & Origin Calculator
                </h2>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Anti-Trap Engine
              </span>
            </div>

            {/* Station Presets & Inputs */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  FROM STATION
                </label>
                <input
                  list="stations-from"
                  value={fromStn}
                  onChange={(e) => setFromStn(e.target.value.toUpperCase())}
                  placeholder="e.g. CSMT / NDLS"
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3 py-1.5 text-xs font-mono text-white outline-none"
                />
                <datalist id="stations-from">
                  {POPULAR_STATIONS.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  TO STATION
                </label>
                <input
                  list="stations-to"
                  value={toStn}
                  onChange={(e) => setToStn(e.target.value.toUpperCase())}
                  placeholder="e.g. PUNE / BCT"
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3 py-1.5 text-xs font-mono text-white outline-none"
                />
                <datalist id="stations-to">
                  {POPULAR_STATIONS.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </datalist>
              </div>
            </div>

            {/* Train Name & Class Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-7">
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  TRAIN NO / NAME
                </label>
                <input
                  type="text"
                  value={trainInfo}
                  onChange={(e) => setTrainInfo(e.target.value)}
                  placeholder="12951 Rajdhani"
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  QUOTA CLASS
                </label>
                <select
                  value={travelClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 px-2.5 py-1.5 text-xs font-mono text-emerald-300 outline-none"
                >
                  {Object.entries(CLASS_RULES).map(([code, info]) => (
                    <option key={code} value={code}>
                      {info.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Boarding Date & Train Day Run Selector */}
            <div className="space-y-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  YOUR BOARDING DATE (Jis din aapko baithna hai)
                </label>
                <input
                  type="date"
                  value={boardingDate}
                  onChange={(e) => setBoardingDate(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3 py-1.5 text-xs font-mono text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-amber-300 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  TRAIN ORIGIN DAY CHECK (Multi-Day Train Trap):
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { day: 1, label: 'Day 1', sub: 'Starts same day' },
                    { day: 2, label: 'Day 2', sub: 'Started yesterday' },
                    { day: 3, label: 'Day 3', sub: 'Started 2d ago' }
                  ].map((item) => (
                    <button
                      key={item.day}
                      type="button"
                      onClick={() => setTrainDayOffset(item.day)}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        trainDayOffset === item.day
                          ? 'bg-amber-500/20 border-amber-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-mono font-bold">{item.label}</div>
                      <div className="text-[10px] opacity-80">{item.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Exact Tatkal Date Output */}
            {bookingCalculation && (
              <div className="rounded-xl bg-slate-950 border border-emerald-500/40 p-3.5 space-y-2.5">
                {bookingCalculation.isMultiDayTrap && (
                  <div className="rounded-lg bg-amber-500/15 border border-amber-500/40 p-2.5 text-xs text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300">MULTI-DAY TRAIN ALERT!</span>{' '}
                      Aapki train starting station se{' '}
                      <span className="font-mono underline">{bookingCalculation.originFormatted}</span>{' '}
                      ko niklegi. Isliye Tatkal aapki boarding date se 1 din pehle nahi, balki{' '}
                      <span className="font-bold text-white">Origin Date se 1 din pehle</span> khulega!
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Exact Tatkal Booking Date:</span>
                  <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    {bookingCalculation.tatkalOpenFormatted}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">RailOne App Login Time:</span>
                  <span className="font-mono font-semibold text-cyan-300">
                    {bookingCalculation.loginTimeStr}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Quota Window Opens:</span>
                  <span className="font-mono font-bold text-white">
                    {bookingCalculation.openTimeStr}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Est. Tatkal Surcharge ({travelClass}):</span>
                  <span className="font-mono text-slate-200">
                    ₹{bookingCalculation.rule.minTatkal} – ₹{bookingCalculation.rule.maxTatkal} / pax
                  </span>
                </div>

                <button
                  onClick={copyBookingPlanSummary}
                  className="w-full mt-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedKey === 'PLAN_SUMMARY' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Booking Plan Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Copy Full Booking Schedule & Plan</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </section>

          {/* ------------------------------------------------------------
              COLUMN 2 (4 Cols): 1-TAP SPEED VAULT (UPI & PASSENGERS)
          ------------------------------------------------------------ */}
          <section className="lg:col-span-4 rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  2. 1-Tap Speed Vault (UPI & Pax)
                </h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> LocalStorage Only
              </span>
            </div>

            {/* Instant UPI VPA Launcher */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Instant UPI ID Clipboard (Saves ~10s)
                </span>
                <span className="text-[10px] font-mono text-slate-400">Paste at Payment</span>
              </div>

              {/* Primary UPI */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={primaryUpi}
                  onChange={(e) => setPrimaryUpi(e.target.value)}
                  placeholder="yourname@okaxis / @ybl"
                  className="flex-1 rounded-lg bg-slate-900 border border-slate-800 focus:border-emerald-500 px-3 py-1.5 text-xs font-mono text-white outline-none"
                />
                <button
                  onClick={() => copyToClipboard(primaryUpi, 'UPI_PRIMARY')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    copiedKey === 'UPI_PRIMARY'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {copiedKey === 'UPI_PRIMARY' ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> COPIED!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> 1-TAP COPY
                    </>
                  )}
                </button>
              </div>

              {/* Backup UPI */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={backupUpi}
                  onChange={(e) => setBackupUpi(e.target.value)}
                  placeholder="Backup UPI ID (e.g. 9876543210@paytm)"
                  className="flex-1 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-500 px-3 py-1.5 text-xs font-mono text-slate-300 outline-none"
                />
                <button
                  onClick={() => copyToClipboard(backupUpi, 'UPI_BACKUP')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                    copiedKey === 'UPI_BACKUP'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {copiedKey === 'UPI_BACKUP' ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> COPIED
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> BACKUP
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Emergency Passenger Quick-Copy List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  Emergency Master List (Max 4 Tatkal Pax)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={loadDemoVault}
                    className="text-[11px] font-mono text-cyan-400 hover:underline cursor-pointer"
                  >
                    Demo
                  </button>
                  <span className="text-slate-700">|</span>
                  <button
                    onClick={clearVault}
                    className="text-[11px] font-mono text-rose-400 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                {passengers.map((p, idx) => (
                  <div
                    key={p.id}
                    className="rounded-lg bg-slate-950 border border-slate-800/90 p-2.5 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        PAX #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyToClipboard(p.name, `PAX_NAME_${p.id}`)}
                          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-emerald-300 flex items-center gap-1 cursor-pointer"
                          title="Copy passenger name if Master List fails to load"
                        >
                          {copiedKey === `PAX_NAME_${p.id}` ? (
                            <>
                              <Check className="w-3 h-3" /> Name Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy Name
                            </>
                          )}
                        </button>
                        {passengers.length > 1 && (
                          <button
                            onClick={() => removePassenger(p.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                            title="Remove passenger"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-1.5">
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => updatePassenger(p.id, 'name', e.target.value)}
                        placeholder="Full Name (as per ID)"
                        className="col-span-6 rounded bg-slate-900 border border-slate-800 px-2 py-1 text-xs text-white outline-none focus:border-cyan-500"
                      />
                      <input
                        type="number"
                        value={p.age}
                        onChange={(e) => updatePassenger(p.id, 'age', e.target.value)}
                        placeholder="Age"
                        className="col-span-2 rounded bg-slate-900 border border-slate-800 px-1.5 py-1 text-xs font-mono text-white outline-none focus:border-cyan-500"
                      />
                      <select
                        value={p.gender}
                        onChange={(e) => updatePassenger(p.id, 'gender', e.target.value)}
                        className="col-span-2 rounded bg-slate-900 border border-slate-800 px-1 py-1 text-xs font-mono text-slate-200 outline-none"
                      >
                        <option value="M">M</option>
                        <option value="F">F</option>
                        <option value="T">O</option>
                      </select>
                      <select
                        value={p.berth}
                        onChange={(e) => updatePassenger(p.id, 'berth', e.target.value)}
                        className="col-span-2 rounded bg-slate-900 border border-slate-800 px-1 py-1 text-xs font-mono text-amber-300 outline-none"
                      >
                        <option value="No Choice">Any</option>
                        <option value="LB">LB</option>
                        <option value="UB">UB</option>
                        <option value="MB">MB</option>
                        <option value="SL">SL</option>
                        <option value="SU">SU</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {passengers.length < 4 && (
                <button
                  onClick={addPassenger}
                  className="w-full py-1.5 rounded-lg border border-dashed border-slate-700 hover:border-cyan-500/50 text-xs font-mono text-slate-300 hover:text-cyan-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Add Passenger ({passengers.length}/4)
                </button>
              )}
            </div>
          </section>

          {/* ------------------------------------------------------------
              COLUMN 3 (4 Cols): 35s PROTOCOL CHECKLIST & SPEED DRILL
          ------------------------------------------------------------ */}
          <section className="lg:col-span-4 rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  3. 35-Sec Protocol & Speed Drill
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {checklistProgress}% Ready
              </span>
            </div>

            {/* Readiness Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${checklistProgress}%` }}
              />
            </div>

            {/* Interactive Tactical Checklist */}
            <div className="space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                    item.checked
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-100'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <button className="mt-0.5 text-emerald-400 shrink-0">
                    {item.checked ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                  <div>
                    <div className="text-xs font-semibold leading-snug">{item.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive 15-Second Muscle-Memory Speed Drill */}
            <div className="rounded-xl bg-slate-950 border border-cyan-500/30 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Interactive Checkout Speed Drill
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Practice the 4 critical RailOne booking taps against the clock:
                  </p>
                </div>
                {bestDrillMs && (
                  <span className="text-[11px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                    Best: {(bestDrillMs / 1000).toFixed(2)}s
                  </span>
                )}
              </div>

              {drillState === 'IDLE' && (
                <button
                  onClick={startSpeedDrill}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all"
                >
                  Start 4-Tap Muscle Memory Drill
                </button>
              )}

              {drillState === 'RUNNING' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-300 animate-pulse">
                      STEP {drillStep} OF 4 — TAP FAST!
                    </span>
                    <span className="text-lg font-bold text-white">
                      {(drillElapsedMs / 1000).toFixed(2)}s
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => advanceDrillStep(1)}
                      disabled={drillStep !== 1}
                      className={`p-2.5 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                        drillStep === 1
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300 animate-bounce'
                          : drillStep > 1
                          ? 'bg-slate-900 border-emerald-500/30 text-emerald-400 opacity-60'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      1. Tap "{travelClass}" Class
                    </button>

                    <button
                      onClick={() => advanceDrillStep(2)}
                      disabled={drillStep !== 2}
                      className={`p-2.5 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                        drillStep === 2
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300 animate-bounce'
                          : drillStep > 2
                          ? 'bg-slate-900 border-emerald-500/30 text-emerald-400 opacity-60'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      2. Select Master List
                    </button>

                    <button
                      onClick={() => advanceDrillStep(3)}
                      disabled={drillStep !== 3}
                      className={`p-2.5 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                        drillStep === 3
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300 animate-bounce'
                          : drillStep > 3
                          ? 'bg-slate-900 border-emerald-500/30 text-emerald-400 opacity-60'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      3. Tick "Confirm Berth"
                    </button>

                    <button
                      onClick={() => advanceDrillStep(4)}
                      disabled={drillStep !== 4}
                      className={`p-2.5 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                        drillStep === 4
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300 animate-bounce'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      4. Paste UPI & Pay
                    </button>
                  </div>
                </div>
              )}

              {drillState === 'DONE' && (
                <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-center space-y-2">
                  <div className="text-xs font-mono text-emerald-300">
                    DRILL COMPLETED IN{' '}
                    <span className="text-base font-bold text-white">
                      {(drillElapsedMs / 1000).toFixed(2)} seconds!
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {drillElapsedMs < 3500
                      ? '🔥 PRO REFLEXES! Aapki finger speed Tatkal rush ke liye 100% ready hai.'
                      : '⚡ Good effort! Ek baar aur try karein aur 3.5 seconds se kam mein complete karein.'}
                  </p>
                  <button
                    onClick={startSpeedDrill}
                    className="px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-xs font-mono text-cyan-300 border border-slate-700 cursor-pointer"
                  >
                    Practice Again
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ============================================================
            BOTTOM BAR: 100% FREE HOSTING & USAGE GUIDE FOR THE USER
        ============================================================ */}
        <footer className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200">
                How to use this app during real Tatkal booking:
              </span>{' '}
              Is web app ko apne Laptop ya Tablet par khol kar rakhein aur haath mein Mobile par{' '}
              <span className="text-emerald-300 font-semibold">RailOne App</span> rakhein. Subah{' '}
              <span className="font-mono text-slate-200">09:57:00 AM</span> (AC) ya{' '}
              <span className="font-mono text-slate-200">10:57:00 AM</span> (SL) par iske Atomic Clock
              ke alarm ke saath chaliye.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-slate-400">
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
              Zero Server Fees
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-emerald-400">
              IRCTC Safe & Compliant
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}