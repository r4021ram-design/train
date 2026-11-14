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
  Sliders,
  Award,
  Info,
  Trash2,
  UserPlus,
  BookOpen,
  X,
  ArrowLeftRight,
  ChevronRight,
  Smartphone,
  Maximize2,
  Minimize2,
  Sun,
  Moon
} from 'lucide-react';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export interface Passenger {
  id: string;
  name: string;
  age: string;
  gender: string;
  berth: string;
  idType: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  desc: string;
  checked: boolean;
}

export interface ClassRule {
  name: string;
  slot: 'AC' | 'NON_AC';
  minTatkal: number;
  maxTatkal: number;
  clerkage: number;
}

// Popular Station Presets
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

export interface RoutePreset {
  label: string;
  from: string;
  to: string;
  train: string;
  defaultClass?: string;
}

const ROUTE_PRESETS: RoutePreset[] = [
  { label: 'CSMT ⇄ NDLS', from: 'CSMT', to: 'NDLS', train: '12951 - Tejas Rajdhani Express', defaultClass: '3A' },
  { label: 'MMCT ⇄ ADI', from: 'BCT', to: 'ADI', train: '12009 - Shatabdi Express', defaultClass: 'CC' },
  { label: 'CSMT ⇄ PUNE', from: 'CSMT', to: 'PUNE', train: '12123 - Deccan Queen', defaultClass: 'CC' },
  { label: 'NDLS ⇄ HWH', from: 'NDLS', to: 'HWH', train: '12302 - Howrah Rajdhani', defaultClass: '3A' }
];

// Class Tatkal Fare Rules
const CLASS_RULES: Record<string, ClassRule> = {
  '3A': { name: 'AC 3 Tier (3A)', slot: 'AC', minTatkal: 300, maxTatkal: 400, clerkage: 40 },
  '2A': { name: 'AC 2 Tier (2A)', slot: 'AC', minTatkal: 400, maxTatkal: 500, clerkage: 50 },
  '3E': { name: 'AC 3 Economy (3E)', slot: 'AC', minTatkal: 300, maxTatkal: 400, clerkage: 40 },
  'CC': { name: 'AC Chair Car (CC)', slot: 'AC', minTatkal: 125, maxTatkal: 225, clerkage: 40 },
  'EC': { name: 'Exec. Chair Car (EC)', slot: 'AC', minTatkal: 400, maxTatkal: 500, clerkage: 60 },
  'SL': { name: 'Sleeper Class (SL)', slot: 'NON_AC', minTatkal: 100, maxTatkal: 200, clerkage: 20 },
  '2S': { name: 'Second Sitting (2S)', slot: 'NON_AC', minTatkal: 10, maxTatkal: 15, clerkage: 15 }
};

// Initial Demo Passengers
const DEMO_PASSENGERS: Passenger[] = [
  { id: '1', name: 'Rahul Sharma', age: '29', gender: 'M', berth: 'LB', idType: 'Aadhaar' },
  { id: '2', name: 'Priya Sharma', age: '27', gender: 'F', berth: 'UB', idType: 'Aadhaar' }
];

// Initial Checklist
const INITIAL_CHECKLIST: ChecklistItem[] = [
  {
    id: 'master_list',
    title: 'Master List pre-saved before 09:45 AM',
    desc: 'Passengers pre-added in RailOne profile to save 22 critical seconds at booking time.',
    checked: true
  },
  {
    id: 'payment_ready',
    title: 'Secondary phone unlocked on UPI app',
    desc: 'Keep GPay/PhonePe ready on a second phone so the booking app never reloads.',
    checked: true
  },
  {
    id: 'confirm_berths',
    title: 'Check "Book only if confirm berths are allotted"',
    desc: 'Prevents unwanted Tatkal waiting list tickets if seats run out during payment.',
    checked: true
  },
  {
    id: 'auto_upgrade',
    title: 'Check "Consider for Auto-Upgradation"',
    desc: 'Higher class vacant seats can grant free upgrades if available.',
    checked: false
  },
  {
    id: 'network_lock',
    title: 'Stable 5G or Fiber network locked',
    desc: 'Avoid switching networks or using VPNs after 09:58 AM.',
    checked: false
  }
];

// Guide Book Chapters (Hindi & English Support)
interface GuideChapter {
  id: string;
  badge: { hi: string; en: string };
  title: { hi: string; en: string };
  subtitle: { hi: string; en: string };
  content: { hi: React.ReactNode; en: React.ReactNode };
}

const GUIDE_BOOK_CHAPTERS: GuideChapter[] = [
  {
    id: 'windows',
    badge: { hi: 'समय नियम', en: 'Timing Rule' },
    title: { hi: '१. तत्काल समय एवं कोटा नियम', en: '1. Tatkal Timings & Quotas' },
    subtitle: {
      hi: 'एसी बनाम नॉन-एसी नियम, खुलने का सही समय और किराया गणित',
      en: 'AC vs Non-AC Rules, Opening Minutes & Fare Math'
    },
    content: {
      hi: (
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            भारतीय रेल (IRCTC) में तत्काल टिकट बुकिंग प्रतिदिन सुबह दो अलग-अलग स्लॉट में खुलती है:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-1">
              <div className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                <span>वातानुकूलित (AC) तत्काल</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 text-xs">10:00:00 AM IST</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                श्रेणियां: <strong>2A, 3A, 3E, CC, EC, 1A</strong>.<br />
                सुबह <strong className="font-mono text-zinc-900 dark:text-zinc-200">09:57:00 AM</strong> पर रेलवन (RailOne) ऐप में लॉगिन करें।
              </p>
            </div>
            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-1">
              <div className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                <span>गैर-वातानुकूलित (Non-AC) तत्काल</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 text-xs">11:00:00 AM IST</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                श्रेणियां: <strong>स्लीपर (SL) एवं सेकंड सीटिंग (2S)</strong>.<br />
                सुबह <strong className="font-mono text-zinc-900 dark:text-zinc-200">10:57:00 AM</strong> पर लॉगिन करें।
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs text-zinc-600 dark:text-zinc-400">
            <strong className="text-zinc-900 dark:text-zinc-200">कन्फर्म तत्काल रद्दीकरण नियम:</strong> कन्फर्म तत्काल टिकट रद्द करने पर शून्य रिफंड (₹0.00) मिलता है। केवल चार्ट बनने के बाद भी वेटिंग लिस्ट रहने पर ही क्लर्केज काटकर रिफंड आता है।
          </div>
        </div>
      ),
      en: (
        <div className="space-y-4 text-sm leading-relaxed">
          <p>Indian Railways Tatkal booking opens in two distinct windows every morning:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-1">
              <div className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                <span>AC Tatkal Window</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 text-xs">10:00:00 AM IST</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Classes: 2A, 3A, 3E, CC, EC, 1A.<br />
                Log in to RailOne at 09:57:00 AM.
              </p>
            </div>
            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-1">
              <div className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                <span>Non-AC Tatkal Window</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 text-xs">11:00:00 AM IST</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Classes: Sleeper (SL) & Second Sitting (2S).<br />
                Log in to RailOne at 10:57:00 AM.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs text-zinc-600 dark:text-zinc-400">
            <strong className="text-zinc-900 dark:text-zinc-200">Cancellation Rule:</strong> Confirmed Tatkal tickets yield zero refund (₹0.00). Only RAC or Waiting List Tatkal tickets that remain unconfirmed after chart preparation receive an automated refund minus clerkage fee.
          </div>
        </div>
      )
    }
  },
  {
    id: 'origin-trap',
    badge: { hi: 'महत्वपूर्ण गणित', en: 'Critical Math' },
    title: { hi: '२. मल्टी-डे ट्रेन ओरिजिन जाल', en: '2. Multi-Day Train Origin Trap' },
    subtitle: {
      hi: 'वह सबसे बड़ी भूल जो ३५% यात्री करते हैं!',
      en: 'The common pitfall that trips up 35% of passengers'
    },
    content: {
      hi: (
        <div className="space-y-4 text-sm leading-relaxed">
          <div className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200">
            <strong>रेलवे नियम:</strong> तत्काल कोटा आपके बैठने वाले स्टेशन से नहीं, बल्कि <strong>ट्रेन जहां से शुरू होती है (Origin Station)</strong>, उस तारीख से <strong>१ दिन पहले</strong> खुलता है।
          </div>
          <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
            <p className="font-medium text-zinc-900 dark:text-zinc-200">उदाहरण (लंबी दूरी की ट्रेनें):</p>
            <p>
              यदि ट्रेन शुक्रवार २० तारीख को आपके शहर आती है, लेकिन वह असम या बंगाल से बुधवार १८ तारीख को चली थी, तो उसका तत्काल <strong>मंगलवार १७ तारीख सुबह १०:०० AM</strong> पर खुलेगा। यदि आप गुरुवार को देखेंगे, तो सीटें पहले ही बुक हो चुकी होंगी।
            </p>
          </div>
        </div>
      ),
      en: (
        <div className="space-y-4 text-sm leading-relaxed">
          <div className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200">
            <strong>Railway Rule:</strong> Tatkal opens 1 day before the date of journey from the <strong>train originating station</strong>, not your boarding station.
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            If your train reaches your station on Friday, but originated from its starting hub on Wednesday, Tatkal booking opens on Tuesday morning. Waiting until Thursday guarantees missed seats.
          </p>
        </div>
      )
    }
  },
  {
    id: 'master-list',
    badge: { hi: 'समय बचत', en: 'Speed Weapon' },
    title: { hi: '३. मास्टर लिस्ट प्रोटोकॉल (२२ सेकंड की बचत)', en: '3. Master List Protocol (Saves 22s)' },
    subtitle: {
      hi: 'सुबह ०९:४५ AM से पहले यात्री विवरण सुरक्षित करने का नियम',
      en: 'Pre-save passenger details before 09:45 AM'
    },
    content: {
      hi: (
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            10:00 AM पर हाथ से नाम, उम्र और लिंग टाइप करने में 20 से 30 सेकंड लग जाते हैं। मास्टर लिस्ट के साथ यात्री 1.5 सेकंड में सिलेक्ट हो जाते हैं।
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <li>रेलवन या आईआरसीटीसी ऐप खोलें ➔ Profile ➔ Master List.</li>
            <li>सुबह <strong>09:45 AM से पहले</strong> सभी यात्रियों के नाम जोड़ लें।</li>
            <li>10:00 AM पर केवल "Add from Master List" टिक करें।</li>
            <li><strong>फ्रीज विंडो:</strong> 09:45 से 10:15 AM (AC) और 10:45 से 11:15 AM (Non-AC) के बीच मास्टर लिस्ट में नए नाम नहीं जोड़े जा सकते।</li>
          </ol>
        </div>
      ),
      en: (
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Manually typing passenger details takes 20 to 30 seconds during peak rush. Master List allows 1-click bulk selection in 1.5 seconds.
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <li>Open RailOne/IRCTC ➔ Profile ➔ Master List.</li>
            <li>Save all passengers before 09:45 AM.</li>
            <li>At 10:00 AM, select "Add from Master List" with checkboxes.</li>
            <li><strong>Freeze Window:</strong> Edits are locked between 09:45-10:15 AM and 10:45-11:15 AM.</li>
          </ol>
        </div>
      )
    }
  },
  {
    id: 'strike-radar',
    badge: { hi: 'रणनीतिक समय', en: 'Tactical Timing' },
    title: { hi: '४. ३५-सेकंड स्ट्राइक प्रोटोकॉल', en: '4. The 35-Second Strike Protocol' },
    subtitle: {
      hi: 'T-3m से T-0s तक सेकंड-दर-सेकंड एक्शन योजना',
      en: 'Second-by-second action roadmap from T-3m to T-0s'
    },
    content: {
      hi: (
        <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
            <strong className="text-zinc-900 dark:text-zinc-200 font-mono">09:57:00 AM (T-3m):</strong> लॉगिन करें, स्टेशन और तारीख डालें, कोटा में TATKAL चुनें और ट्रेन लिस्ट पर रुकें।
          </div>
          <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
            <strong className="text-zinc-900 dark:text-zinc-200 font-mono">09:59:30 AM (T-30s):</strong> स्क्रीन रीफ्रेश न करें। अंगूठा क्लास बटन के ऊपर रखें।
          </div>
          <div className="p-2.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200">
            <strong className="font-mono">09:59:58 AM (Strike):</strong> क्लास बटन (3A/SL) पर टैप करें। लेटेंसी के साथ रिक्वेस्ट ठीक 10:00:00 पर पहुंचेगी।
          </div>
          <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
            <strong className="text-zinc-900 dark:text-zinc-200 font-mono">10:00:05 AM:</strong> मास्टर लिस्ट से नाम चुनें, "Book only if confirm" टिक करें और UPI से भुगतान करें।
          </div>
        </div>
      ),
      en: (
        <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
            <strong className="text-zinc-900 dark:text-zinc-200 font-mono">09:57:00 AM (T-3m):</strong> Log in via Biometrics/PIN. Search route with Quota: TATKAL.
          </div>
          <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
            <strong className="text-zinc-900 dark:text-zinc-200 font-mono">09:59:30 AM (T-30s):</strong> Hold position. Do NOT refresh early. Hover thumb over class.
          </div>
          <div className="p-2.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200">
            <strong className="font-mono">09:59:58 AM (Strike):</strong> Tap class refresh button so your request lands at 10:00:00 sharp.
          </div>
          <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
            <strong className="text-zinc-900 dark:text-zinc-200 font-mono">10:00:05 AM:</strong> Select Master List, check "Confirm berths only", and approve UPI.
          </div>
        </div>
      )
    }
  },
  {
    id: 'payment-tactics',
    badge: { hi: 'भुगतान तकनीक', en: 'Payment Hack' },
    title: { hi: '५. दो फोन (Dual-Device) भुगतान विधि', en: '5. Dual-Phone Payment Setup' },
    subtitle: {
      hi: 'ऐप क्रैश और ओटीपी देरी से बचने का अचूक उपाय',
      en: 'Eliminate app reload crashes and OTP delays'
    },
    content: {
      hi: (
        <div className="space-y-3 text-sm leading-relaxed">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            फोन १ पर बुकिंग करते समय जब यात्री GPay/PhonePe खोलने के लिए ऐप स्विच करते हैं, तो मोबाइल की रैम रेलवन ऐप को बैकग्राउंड में बंद कर देती है।
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <span className="font-medium text-zinc-900 dark:text-zinc-100 block mb-1">पहला फोन (बुकिंग फोन)</span>
              <p className="text-zinc-600 dark:text-zinc-400">इस पर रेलवन ऐप खुला रखें। भुगतान के समय दूसरे फोन की यूपीआई आईडी डालें।</p>
            </div>
            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <span className="font-medium text-zinc-900 dark:text-zinc-100 block mb-1">दूसरा फोन (भुगतान फोन)</span>
              <p className="text-zinc-600 dark:text-zinc-400">इस पर पहले से GPay/PhonePe खोलकर रखें। रिक्वेस्ट आते ही तुरंत पिन डालकर भुगतान अप्रूव करें।</p>
            </div>
          </div>
        </div>
      ),
      en: (
        <div className="space-y-3 text-sm leading-relaxed">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Switching apps on the booking phone to approve UPI often causes operating systems to kill background apps, aborting your reservation.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <span className="font-medium text-zinc-900 dark:text-zinc-100 block mb-1">Device 1 (Booking Phone)</span>
              <p className="text-zinc-600 dark:text-zinc-400">Keep RailOne open. Enter Device 2's UPI ID at payment checkout.</p>
            </div>
            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <span className="font-medium text-zinc-900 dark:text-zinc-100 block mb-1">Device 2 (Payment Phone)</span>
              <p className="text-zinc-600 dark:text-zinc-400">Unlock UPI app in advance. Approve collect request with PIN immediately.</p>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: 'emergency-vault',
    badge: { hi: 'आपातकालीन बैकअप', en: 'Backup Plan' },
    title: { hi: '६. १-टैप स्पीड वॉल्ट और बैकअप', en: '6. 1-Tap Speed Vault & Fallback' },
    subtitle: {
      hi: 'यदि मास्टर लिस्ट लोड न हो तो क्या करें?',
      en: 'What to do if Master List fails to load?'
    },
    content: {
      hi: (
        <div className="space-y-3 text-sm leading-relaxed">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            यदि आईआरसीटीसी सर्वर लोड के कारण मास्टर लिस्ट लोड न करे:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
            <li>कमांड सेंटर के स्पीड वॉल्ट से हर यात्री का नाम <strong>1-Tap Copy</strong> करके तुरंत पेस्ट करें।</li>
            <li>सीट विकल्प में हमेशा <strong>'No Choice / Any'</strong> रखें ताकि सीट खोजने में एल्गोरिदम समय न गंवाए।</li>
          </ul>
        </div>
      ),
      en: (
        <div className="space-y-3 text-sm leading-relaxed">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            If peak server loads prevent Master List retrieval:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
            <li>Use the 1-Tap copy button for each passenger to paste details directly.</li>
            <li>Select berth preference as 'No Choice' to prevent search delays.</li>
          </ul>
        </div>
      )
    }
  },
  {
    id: 'golden-rules',
    badge: { hi: 'कानूनी व सुरक्षित', en: 'Legal & Safe' },
    title: { hi: '७. आईआरसीटीसी के सुनहरे नियम व सुरक्षा', en: '7. Golden Rules & IRCTC Compliance' },
    subtitle: {
      hi: 'अकाउंट सुरक्षित रखने और १००% कानूनी रहने के ४ नियम',
      en: 'Stay 100% legal, avoid bot bans and security locks'
    },
    content: {
      hi: (
        <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
          <p>१. कभी भी एक ही आईआरसीटीसी खाते को दो अलग-अलग टैब या फोन पर एक साथ लॉगिन न करें।</p>
          <p>२. सुबह 09:55 AM से पहले लॉगिन न करें (3 मिनट बाद सत्र अपने आप समाप्त हो जाता है)।</p>
          <p>३. किसी भी अवैध बॉट या ऑटो-फिल एक्सटेंशन का उपयोग न करें। हमारा साथी पूर्णतः 100% मैनुअल है।</p>
          <p>४. "Book only if confirm berths are allotted" अनिवार्य रूप से टिक करें ताकि वेटिंग टिकट न बने।</p>
        </div>
      ),
      en: (
        <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
          <p>1. Never login to the same IRCTC account across multiple tabs simultaneously.</p>
          <p>2. Do not login earlier than 09:56 AM to prevent session idle timeout.</p>
          <p>3. Never use unauthorized bot extensions. RailOne Tatkal Pro is 100% manual.</p>
          <p>4. Always check "Book only if confirm berths are allotted" to prevent unwanted WL tickets.</p>
        </div>
      )
    }
  }
];

export default function App() {
  // Theme State: 'dark' (Matte Charcoal #0E0F12) or 'light' (Clean Daylight #F7F7F5)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('tatkal_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('tatkal_theme', theme);
  }, [theme]);

  // Atomic Clock & Simulation State
  const [tatkalMode, setTatkalMode] = useState<'AC' | 'NON_AC'>('AC'); // 'AC' (10:00) or 'NON_AC' (11:00)
  const [offsetMs, setOffsetMs] = useState<number>(0); // -2000 to +2000ms server sync calibration
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStartRealMs, setSimStartRealMs] = useState<number>(0);
  const [nowMs, setNowMs] = useState<number>(Date.now());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const lastBeepSecRef = useRef<number | null>(null);

  // Guide Book & Fullscreen State
  const [showGuideBook, setShowGuideBook] = useState<boolean>(false);
  const [activeGuideChapter, setActiveGuideChapter] = useState<number>(0);
  const [guideLang, setGuideLang] = useState<'hi' | 'en'>('hi');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
      }
    }
  };

  // Audio synthesis helper (Web Audio API)
  const playBeep = (freq: number = 880, duration: number = 0.12, type: OscillatorType = 'sine') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio unlock restriction catch
    }
  };

  // High-precision 40ms ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Compute effective IST Date object
  const clockData = useMemo(() => {
    const targetHour = tatkalMode === 'AC' ? 10 : 11;

    if (isSimulating) {
      const elapsed = nowMs - simStartRealMs;
      if (elapsed > 70000) {
        setIsSimulating(false);
      }
      const baseDate = new Date();
      const utcMs = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000;
      const istDate = new Date(utcMs + 5.5 * 3600000);
      istDate.setHours(targetHour - 1, 59, 0, 0);
      const simCurrent = new Date(istDate.getTime() + elapsed);

      const targetDate = new Date(istDate.getTime() + 60000);
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

  // Audio cues at critical seconds
  useEffect(() => {
    const secRemaining = Math.ceil(clockData.diffSec);
    if (secRemaining !== lastBeepSecRef.current) {
      lastBeepSecRef.current = secRemaining;
      if (secRemaining === 180) playBeep(520, 0.25, 'triangle');
      if (secRemaining === 30) playBeep(660, 0.2, 'sine');
      if (secRemaining <= 5 && secRemaining > 0) playBeep(880, 0.1, 'sine');
      if (secRemaining === 0) playBeep(1200, 0.4, 'sine');
    }
  }, [clockData.diffSec]);

  const start60sSimulation = () => {
    lastBeepSecRef.current = null;
    setSimStartRealMs(Date.now());
    setIsSimulating(true);
    playBeep(660, 0.15, 'sine');
  };

  // Tactical Phase Message
  const tacticalPhase = useMemo(() => {
    const s = clockData.diffSec;
    if (s <= 0 && s >= -300) {
      return {
        status: 'live',
        badge: 'Window Open',
        headline: 'Quota is live. Select passengers from Master List and pay now.',
        instruction: 'Do not hit back or refresh. Select pre-saved passengers, check "Confirm Berth", and complete UPI approval.'
      };
    }
    if (s <= 3 && s > 0) {
      return {
        status: 'strike',
        badge: 'Strike Zone (T-3s)',
        headline: 'Tap class button now. Server gate opens in moments.',
        instruction: 'Tap refresh right now so network latency places your packet at exactly 10:00:00.05 on the IRCTC server.'
      };
    }
    if (s <= 30 && s > 3) {
      return {
        status: 'hold',
        badge: 'Hold Position (T-30s)',
        headline: 'Stay on train list. Do not refresh early.',
        instruction: 'Keep UPI ID copied in clipboard. Hover thumb over your train class button.'
      };
    }
    if (s <= 180 && s > 30) {
      return {
        status: 'prep',
        badge: 'Login Phase (T-3m)',
        headline: 'Log in to RailOne and search route under TATKAL quota.',
        instruction: 'Complete biometric/PIN login. Enter From ➔ To ➔ Date ➔ Quota: TATKAL and wait on train list.'
      };
    }
    if (s <= 300 && s > 180) {
      return {
        status: 'standby',
        badge: 'Prep Phase (T-5m)',
        headline: 'Lock 5G/Fiber connection and prepare secondary phone.',
        instruction: 'Close background downloads. Open UPI app on second device.'
      };
    }
    return {
      status: 'standby',
      badge: 'Standby',
      headline: `Armed for next ${tatkalMode === 'AC' ? 'AC (10:00 AM)' : 'Non-AC (11:00 AM)'} window.`,
      instruction: 'Verify passenger list, check exact Tatkal date, or run the 4-step reflex drill to warm up.'
    };
  }, [clockData.diffSec, tatkalMode]);

  // Formatted Clock
  const formatIST = (d: Date) => {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    const ms = String(Math.floor(d.getMilliseconds() / 10)).padStart(2, '0');
    return { hh, mm, ss, ms };
  };

  const formatCountdown = (diffSec: number) => {
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

  // Date Calculator State
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }, []);

  const [fromStn, setFromStn] = useState<string>('CSMT');
  const [toStn, setToStn] = useState<string>('NDLS');
  const [trainInfo, setTrainInfo] = useState<string>('12951 - Tejas Rajdhani Express');
  const [boardingDate, setBoardingDate] = useState<string>(tomorrowStr);
  const [travelClass, setTravelClass] = useState<string>('3A');
  const [trainDayOffset, setTrainDayOffset] = useState<number>(1);

  const swapStations = () => {
    const temp = fromStn;
    setFromStn(toStn);
    setToStn(temp);
    playBeep(700, 0.05, 'sine');
  };

  const applyRoutePreset = (preset: RoutePreset) => {
    setFromStn(preset.from);
    setToStn(preset.to);
    setTrainInfo(preset.train);
    if (preset.defaultClass && CLASS_RULES[preset.defaultClass]) {
      handleClassChange(preset.defaultClass);
    }
    playBeep(750, 0.05, 'sine');
  };

  const handleClassChange = (cls: string) => {
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

    const originObj = new Date(boardObj);
    originObj.setDate(originObj.getDate() - (trainDayOffset - 1));

    const tatkalOpenObj = new Date(originObj);
    tatkalOpenObj.setDate(tatkalOpenObj.getDate() - 1);

    const rule = CLASS_RULES[travelClass] || CLASS_RULES['3A'];
    const openTimeStr = rule.slot === 'AC' ? '10:00:00 AM IST' : '11:00:00 AM IST';
    const loginTimeStr = rule.slot === 'AC' ? '09:57:00 AM IST' : '10:57:00 AM IST';

    const fmt = (dt: Date) =>
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

  // Speed Vault State (LocalStorage)
  const [primaryUpi, setPrimaryUpi] = useState<string>(() => {
    return localStorage.getItem('tatkal_primary_upi') || 'rahulsharma@okaxis';
  });
  const [backupUpi, setBackupUpi] = useState<string>(() => {
    return localStorage.getItem('tatkal_backup_upi') || '9876543210@ybl';
  });
  const [passengers, setPassengers] = useState<Passenger[]>(() => {
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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('tatkal_primary_upi', primaryUpi);
  }, [primaryUpi]);

  useEffect(() => {
    localStorage.setItem('tatkal_backup_upi', backupUpi);
  }, [backupUpi]);

  useEffect(() => {
    localStorage.setItem('tatkal_passengers', JSON.stringify(passengers));
  }, [passengers]);

  const copyToClipboard = (text: string, keyLabel: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(keyLabel);
    playBeep(980, 0.06, 'sine');
    setTimeout(() => {
      setCopiedKey((prev) => (prev === keyLabel ? null : prev));
    }, 1800);
  };

  const updatePassenger = (id: string, field: keyof Passenger, value: string) => {
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

  const removePassenger = (id: string) => {
    setPassengers((prev) => prev.filter((p) => p.id !== id));
  };

  const loadDemoVault = () => {
    setPrimaryUpi('rahulsharma@okaxis');
    setBackupUpi('9876543210@ybl');
    setPassengers(DEMO_PASSENGERS);
    playBeep(784, 0.08, 'sine');
  };

  const clearVault = () => {
    setPrimaryUpi('');
    setBackupUpi('');
    setPassengers([
      { id: '1', name: '', age: '', gender: 'M', berth: 'LB', idType: 'Aadhaar' }
    ]);
  };

  // Checklist State
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const toggleChecklist = (id: string) => {
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
  const [drillState, setDrillState] = useState<'IDLE' | 'RUNNING' | 'DONE'>('IDLE');
  const [drillStep, setDrillStep] = useState<number>(0);
  const [drillStartMs, setDrillStartMs] = useState<number>(0);
  const [drillElapsedMs, setDrillElapsedMs] = useState<number>(0);
  const [bestDrillMs, setBestDrillMs] = useState<number | null>(() => {
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
    playBeep(880, 0.08, 'sine');
  };

  const advanceDrillStep = (expectedStep: number) => {
    if (drillState !== 'RUNNING' || drillStep !== expectedStep) return;
    playBeep(880 + expectedStep * 100, 0.06, 'sine');
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

  const copyBookingPlanSummary = () => {
    if (!bookingCalculation) return;
    const summary = `🚆 RailOne Tatkal Pro — Execution Plan
• Route: ${fromStn} ➔ ${toStn} (${trainInfo})
• Class: ${bookingCalculation.rule.name}
• Boarding Date: ${bookingCalculation.boardingFormatted} (Day ${trainDayOffset} of train run)
• Exact Booking Date: ${bookingCalculation.tatkalOpenFormatted}
• Login Time: ${bookingCalculation.loginTimeStr}
• Window Opens: ${bookingCalculation.openTimeStr}
• Passengers: ${passengers.filter((p) => p.name).length}
• Primary UPI: ${primaryUpi}`;
    copyToClipboard(summary, 'PLAN_SUMMARY');
  };

  // Helper booleans for clean conditional styling
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen transition-colors duration-150 ${isDark ? 'bg-[#0E0F12] text-zinc-100' : 'bg-[#F7F7F5] text-zinc-900'
        }`}
    >
      {/* ============================================================
          COMMAND BAR HEADER (UNIFIED, SLIM & HORIZONTAL)
      ============================================================ */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md px-4 sm:px-6 py-2.5 transition-colors ${isDark
            ? 'bg-[#121316]/90 border-zinc-800/80 text-zinc-100'
            : 'bg-white/90 border-zinc-200/90 text-zinc-900 shadow-xs'
          }`}
      >
        <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Brand & Quota Switch */}
          <div className="flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white shrink-0">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight">RailOne Tatkal Pro</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active" />
              </div>
            </div>

            {/* Segmented Mode Switch */}
            <div
              className={`inline-flex rounded-md p-0.5 border text-xs ${isDark ? 'bg-[#1E2026] border-zinc-800' : 'bg-zinc-100 border-zinc-200'
                }`}
            >
              <button
                onClick={() => setTatkalMode('AC')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${tatkalMode === 'AC'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDark
                      ? 'text-zinc-400 hover:text-zinc-200'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
              >
                AC (10 AM)
              </button>
              <button
                onClick={() => setTatkalMode('NON_AC')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${tatkalMode === 'NON_AC'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDark
                      ? 'text-zinc-400 hover:text-zinc-200'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
              >
                SL / 2S (11 AM)
              </button>
            </div>
          </div>

          {/* Center: Live IST Clock & Target Countdown (High-Readability Pill) */}
          <div className={`flex items-center justify-between md:justify-center gap-3 sm:gap-5 px-3.5 py-1.5 rounded-lg border transition-colors ${
            isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-100/90 border-zinc-200'
          }`}>
            {/* Clock + Latency Tweak */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-zinc-500 font-sans tracking-wide hidden xs:inline">IST</span>
              <div className="font-mono tabular-nums text-base sm:text-lg lg:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {timeParts.hh}:{timeParts.mm}:{timeParts.ss}
                <span className="text-zinc-500 text-xs sm:text-sm font-normal">.{timeParts.ms}</span>
              </div>
              <div className="flex items-center gap-0.5 ml-1">
                <button
                  onClick={() => setOffsetMs((m) => Math.max(-2000, m - 250))}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${isDark
                      ? 'bg-zinc-800/80 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
                      : 'bg-zinc-200 border-zinc-300 text-zinc-600 hover:text-zinc-900'
                    }`}
                  title="Calibrate latency -0.25s"
                >
                  -0.25
                </button>
                <button
                  onClick={() => setOffsetMs(0)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${offsetMs === 0
                      ? isDark
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-300'
                        : 'bg-zinc-300 border-zinc-400 text-zinc-800'
                      : isDark
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                        : 'bg-zinc-100 border-zinc-200 text-zinc-400 hover:text-zinc-700'
                    }`}
                  title="Reset latency sync"
                >
                  {offsetMs === 0 ? '0' : `${offsetMs > 0 ? '+' : ''}${offsetMs}ms`}
                </button>
                <button
                  onClick={() => setOffsetMs((m) => Math.min(2000, m + 250))}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${isDark
                      ? 'bg-zinc-800/80 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
                      : 'bg-zinc-200 border-zinc-300 text-zinc-600 hover:text-zinc-900'
                    }`}
                  title="Calibrate latency +0.25s"
                >
                  +0.25
                </button>
              </div>
            </div>

            <div className="h-5 w-px bg-zinc-300 dark:bg-zinc-800 hidden sm:block" />

            {/* Countdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-zinc-500 font-sans tracking-wide hidden xs:inline">Target</span>
              <span
                className={`font-mono tabular-nums text-base sm:text-lg lg:text-xl font-semibold tracking-tight ${clockData.diffSec <= 10
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : clockData.diffSec <= 60
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-zinc-800 dark:text-zinc-200'
                  }`}
              >
                T - {formatCountdown(clockData.diffSec)}
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center justify-end gap-1.5">
            {/* 60s Simulation Toggle */}
            {!isSimulating ? (
              <button
                onClick={start60sSimulation}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${isDark
                    ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                    : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-700'
                  }`}
                title="Simulate the final 60 seconds before quota opening"
              >
                <Play className="w-3 h-3 text-blue-600 dark:text-blue-400 fill-current" />
                <span>Simulate 60s</span>
              </button>
            ) : (
              <button
                onClick={() => setIsSimulating(false)}
                className="px-2.5 py-1 rounded-md text-xs font-medium border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Exit Simulation</span>
              </button>
            )}

            {/* Handbook / Guide Book */}
            <button
              onClick={() => setShowGuideBook(true)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${isDark
                  ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                  : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-700'
                }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Handbook</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer ${isDark
                  ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400'
                  : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-600'
                }`}
              title={soundEnabled ? 'Audio alerts active' : 'Audio alerts muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-zinc-300 dark:text-zinc-200" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
            </button>

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer ${isDark
                  ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-amber-400'
                  : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-700'
                }`}
              title={isDark ? 'Switch to daylight theme' : 'Switch to dark theme'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer ${isDark
                  ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400'
                  : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-600'
                }`}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================
          SLIM TACTICAL PHASE BANNER (LINEAR / GITHUB CALLOUT)
      ============================================================ */}
      <div className="w-full px-4 sm:px-6 pt-3">
        <div
          className={`w-full rounded-lg px-4 py-2.5 border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${tacticalPhase.status === 'strike' || tacticalPhase.status === 'live'
              ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300'
              : tacticalPhase.status === 'hold'
                ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300'
                : isDark
                  ? 'border-zinc-800 bg-[#16181D] text-zinc-300'
                  : 'border-zinc-200 bg-white text-zinc-700 shadow-xs'
            }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-medium tracking-wide uppercase ${tacticalPhase.status === 'strike' || tacticalPhase.status === 'live'
                  ? 'bg-emerald-600 text-white'
                  : tacticalPhase.status === 'hold'
                    ? 'bg-amber-600 text-white'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                }`}
            >
              {tacticalPhase.badge}
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{tacticalPhase.headline}</span>
          </div>
          <span className="text-zinc-500 dark:text-zinc-400 text-xs">{tacticalPhase.instruction}</span>
        </div>
      </div>

      {/* ============================================================
          MAIN ASYMMETRIC 12-COLUMN WORKSPACE (8 COLS + 4 COLS)
      ============================================================ */}
      <main className="w-full px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ==========================================================
              LEFT / CENTER WORKSPACE (8 COLS): JOURNEY CALC + SPEED VAULT
          ========================================================== */}
          <div className="lg:col-span-8 space-y-5">
            {/* Card 1: Journey & Tatkal Date Calculator */}
            <section
              className={`rounded-xl border p-5 sm:p-6 transition-colors ${isDark ? 'bg-[#16181D] border-zinc-800/80 shadow-none' : 'bg-white border-zinc-200/90 shadow-xs'
                }`}
            >
              <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-3 mb-4">
                <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Journey & Tatkal Date Calculator
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Calculates exact booking date and alerts for trains starting 1 to 2 days prior.
                </p>
              </div>

              <div className="space-y-4">
                {/* Station Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Route</label>
                    <button
                      type="button"
                      onClick={swapStations}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeftRight className="w-3 h-3" /> Swap Stations
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <input
                        list="stations-from"
                        value={fromStn}
                        onChange={(e) => setFromStn(e.target.value.toUpperCase())}
                        placeholder="From Station (e.g. CSMT)"
                        className={`w-full rounded-lg border px-3 py-2 text-xs font-sans outline-none transition-colors ${isDark
                            ? 'bg-[#1E2026] border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-blue-500'
                            : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-blue-600'
                          }`}
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
                      <input
                        list="stations-to"
                        value={toStn}
                        onChange={(e) => setToStn(e.target.value.toUpperCase())}
                        placeholder="To Station (e.g. NDLS)"
                        className={`w-full rounded-lg border px-3 py-2 text-xs font-sans outline-none transition-colors ${isDark
                            ? 'bg-[#1E2026] border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-blue-500'
                            : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-blue-600'
                          }`}
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

                  {/* 1-Click Route & Train Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[11px] text-zinc-500 font-medium">Quick Presets:</span>
                    {ROUTE_PRESETS.map((p) => {
                      const isSelected = fromStn === p.from && toStn === p.to;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => applyRoutePreset(p)}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600/15 border-blue-500/50 text-blue-600 dark:text-blue-400 font-medium'
                              : isDark
                                ? 'bg-[#1E2026] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                                : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
                          }`}
                          title={`Click to fill ${p.label} (${p.train})`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Train Details & Class */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-7">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Train number or name
                    </label>
                    <input
                      type="text"
                      value={trainInfo}
                      onChange={(e) => setTrainInfo(e.target.value)}
                      placeholder="12951 - Rajdhani Express"
                      className={`w-full rounded-lg border px-3 py-2 text-xs font-sans outline-none transition-colors ${isDark
                          ? 'bg-[#1E2026] border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-blue-500'
                          : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-blue-600'
                        }`}
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Quota class
                    </label>
                    <select
                      value={travelClass}
                      onChange={(e) => handleClassChange(e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-xs font-sans outline-none transition-colors ${isDark
                          ? 'bg-[#1E2026] border-zinc-800 text-zinc-100 focus:border-blue-500'
                          : 'bg-white border-zinc-200 text-zinc-900 focus:border-blue-600'
                        }`}
                    >
                      {Object.entries(CLASS_RULES).map(([code, info]) => (
                        <option key={code} value={code}>
                          {info.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Boarding Date & Origin Day Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Boarding date
                    </label>
                    <input
                      type="date"
                      value={boardingDate}
                      onChange={(e) => setBoardingDate(e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-xs font-sans outline-none transition-colors ${isDark
                          ? 'bg-[#1E2026] border-zinc-800 text-zinc-100 focus:border-blue-500'
                          : 'bg-white border-zinc-200 text-zinc-900 focus:border-blue-600'
                        }`}
                    />
                  </div>

                  <div className="sm:col-span-7">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Train origin schedule
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { day: 1, label: 'Day 1', desc: 'Starts today' },
                        { day: 2, label: 'Day 2', desc: 'Started yesterday' },
                        { day: 3, label: 'Day 3', desc: 'Started 2d ago' }
                      ].map((item) => (
                        <button
                          key={item.day}
                          type="button"
                          onClick={() => setTrainDayOffset(item.day)}
                          className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${trainDayOffset === item.day
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 font-medium'
                              : isDark
                                ? 'border-zinc-800 bg-[#1E2026] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300'
                            }`}
                        >
                          <div className="text-xs font-medium">{item.label}</div>
                          <div className="text-[10px] text-zinc-500 leading-tight">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Calculation Output Box */}
                {bookingCalculation && (
                  <div
                    className={`rounded-lg border p-4 space-y-3 ${isDark ? 'bg-[#1B1D23] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                      }`}
                  >
                    {bookingCalculation.isMultiDayTrap && (
                      <div className="rounded-md border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 p-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Multi-Day Train Notice:</strong> Train departs from source station on{' '}
                          <span className="font-semibold underline">{bookingCalculation.originFormatted}</span>.
                          Tatkal opens 1 day before origin date, not your boarding date.
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800/80 text-xs">
                      <div className="py-2 sm:py-0 sm:px-3.5 first:pl-0">
                        <span className="text-zinc-500 block mb-0.5 text-[11px] font-medium">Exact Booking Date</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm sm:text-base tracking-tight">
                          {bookingCalculation.tatkalOpenFormatted}
                        </span>
                      </div>
                      <div className="py-2 sm:py-0 sm:px-3.5">
                        <span className="text-zinc-500 block mb-0.5 text-[11px] font-medium">Booking Window</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base tracking-tight">
                          {bookingCalculation.openTimeStr}
                        </span>
                      </div>
                      <div className="py-2 sm:py-0 sm:px-3.5">
                        <span className="text-zinc-500 block mb-0.5 text-[11px] font-medium">Login Window</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm sm:text-base tracking-tight">
                          {bookingCalculation.loginTimeStr}
                        </span>
                      </div>
                      <div className="py-2 sm:py-0 sm:px-3.5 last:pr-0">
                        <span className="text-zinc-500 block mb-0.5 text-[11px] font-medium">Tatkal Surcharge</span>
                        <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base tracking-tight">
                          ₹{bookingCalculation.rule.minTatkal} – ₹{bookingCalculation.rule.maxTatkal}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Boarding: {bookingCalculation.boardingFormatted}</span>
                      <button
                        onClick={copyBookingPlanSummary}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition-colors ${copiedKey === 'PLAN_SUMMARY'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : isDark
                              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                              : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                          }`}
                      >
                        {copiedKey === 'PLAN_SUMMARY' ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Schedule Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-400" /> Copy Booking Schedule
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Card 2: Quick-Copy Passenger & UPI Vault */}
            <section
              className={`rounded-xl border p-5 sm:p-6 transition-colors ${isDark ? 'bg-[#16181D] border-zinc-800/80 shadow-none' : 'bg-white border-zinc-200/90 shadow-xs'
                }`}
            >
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-3 mb-4">
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Quick-Copy Passenger & UPI Vault
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    One-click clipboard triggers to bypass IRCTC lag and Master List failures.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadDemoVault}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Demo
                  </button>
                  <span className="text-zinc-400">|</span>
                  <button
                    onClick={clearVault}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* UPI Launchers */}
                <div
                  className={`p-3.5 rounded-lg border space-y-2.5 ${isDark ? 'bg-[#1B1D23] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                    }`}
                >
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                    Instant UPI VPA Clipboard
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Primary UPI */}
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={primaryUpi}
                        onChange={(e) => setPrimaryUpi(e.target.value)}
                        placeholder="Primary UPI (e.g. name@okaxis)"
                        className={`flex-1 rounded-md border px-3 py-1.5 text-xs font-mono outline-none ${isDark
                            ? 'bg-[#1E2026] border-zinc-800 text-zinc-100 focus:border-blue-500'
                            : 'bg-white border-zinc-200 text-zinc-900 focus:border-blue-600'
                          }`}
                      />
                      <button
                        onClick={() => copyToClipboard(primaryUpi, 'UPI_PRIMARY')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors shrink-0 ${copiedKey === 'UPI_PRIMARY'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                      >
                        {copiedKey === 'UPI_PRIMARY' ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    {/* Backup UPI */}
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={backupUpi}
                        onChange={(e) => setBackupUpi(e.target.value)}
                        placeholder="Backup UPI (e.g. 9876543210@ybl)"
                        className={`flex-1 rounded-md border px-3 py-1.5 text-xs font-mono outline-none ${isDark
                            ? 'bg-[#1E2026] border-zinc-800 text-zinc-100 focus:border-blue-500'
                            : 'bg-white border-zinc-200 text-zinc-900 focus:border-blue-600'
                          }`}
                      />
                      <button
                        onClick={() => copyToClipboard(backupUpi, 'UPI_BACKUP')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium border cursor-pointer transition-colors shrink-0 ${copiedKey === 'UPI_BACKUP'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : isDark
                              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                              : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                          }`}
                      >
                        {copiedKey === 'UPI_BACKUP' ? 'Copied' : 'Backup'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Passenger Table / List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Passenger Details (Max 4 per Tatkal PNR)
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      {passengers.length} of 4 configured
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {passengers.map((p, idx) => (
                      <div
                        key={p.id}
                        className={`flex flex-wrap sm:flex-nowrap items-center gap-2 p-1.5 sm:p-2 rounded-lg border transition-colors ${
                          isDark ? 'bg-[#181A20] border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'
                        }`}
                      >
                        {/* #1 Badge */}
                        <span
                          className={`text-[11px] font-mono px-2 py-1 rounded font-semibold shrink-0 ${
                            isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-700'
                          }`}
                        >
                          #{idx + 1}
                        </span>

                        {/* Full Name Input (flex-1) */}
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => updatePassenger(p.id, 'name', e.target.value)}
                          placeholder="Full Name (as per Govt ID)"
                          className={`flex-1 min-w-[140px] rounded-md border px-2.5 py-1.5 text-xs font-sans outline-none ${
                            isDark
                              ? 'bg-[#1E2026] border-zinc-800 text-zinc-100 focus:border-blue-500'
                              : 'bg-white border-zinc-200 text-zinc-900 focus:border-blue-600'
                          }`}
                        />

                        {/* Age (w-16 sm:w-20) */}
                        <input
                          type="number"
                          value={p.age}
                          onChange={(e) => updatePassenger(p.id, 'age', e.target.value)}
                          placeholder="Age"
                          className={`w-16 sm:w-20 font-mono rounded-md border px-2 py-1.5 text-xs outline-none ${
                            isDark
                              ? 'bg-[#1E2026] border-zinc-800 text-zinc-100 focus:border-blue-500'
                              : 'bg-white border-zinc-200 text-zinc-900 focus:border-blue-600'
                          }`}
                        />

                        {/* Gender Select (w-24 sm:w-28) */}
                        <select
                          value={p.gender}
                          onChange={(e) => updatePassenger(p.id, 'gender', e.target.value)}
                          className={`w-24 sm:w-28 rounded-md border px-2 py-1.5 text-xs font-sans outline-none cursor-pointer ${
                            isDark
                              ? 'bg-[#1E2026] border-zinc-800 text-zinc-100 focus:border-blue-500'
                              : 'bg-white border-zinc-200 text-zinc-900 focus:border-blue-600'
                          }`}
                        >
                          <option value="M">Male (M)</option>
                          <option value="F">Female (F)</option>
                          <option value="T">Other (O)</option>
                        </select>

                        {/* Berth Select (w-24 sm:w-32) */}
                        <select
                          value={p.berth}
                          onChange={(e) => updatePassenger(p.id, 'berth', e.target.value)}
                          className={`w-24 sm:w-32 rounded-md border px-2 py-1.5 text-xs font-sans outline-none cursor-pointer ${
                            isDark
                              ? 'bg-[#1E2026] border-zinc-800 text-zinc-100 focus:border-blue-500'
                              : 'bg-white border-zinc-200 text-zinc-900 focus:border-blue-600'
                          }`}
                        >
                          <option value="No Choice">No Choice</option>
                          <option value="LB">Lower</option>
                          <option value="UB">Upper</option>
                          <option value="MB">Middle</option>
                          <option value="SL">Side Lower</option>
                          <option value="SU">Side Upper</option>
                        </select>

                        {/* Copy Name Button */}
                        <button
                          type="button"
                          onClick={() => copyToClipboard(p.name, `PAX_NAME_${p.id}`)}
                          className={`px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors shrink-0 ${
                            copiedKey === `PAX_NAME_${p.id}`
                              ? 'bg-emerald-600 text-white'
                              : isDark
                                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700'
                          }`}
                          title="Copy passenger name"
                        >
                          {copiedKey === `PAX_NAME_${p.id}` ? 'Copied' : 'Copy Name'}
                        </button>

                        {/* Trash Icon */}
                        {passengers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePassenger(p.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-500 cursor-pointer shrink-0 transition-colors"
                            title="Remove passenger"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {passengers.length < 4 && (
                    <button
                      type="button"
                      onClick={addPassenger}
                      className={`w-full py-1.5 rounded-lg border border-dashed text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                        isDark
                          ? 'border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          : 'border-zinc-300 hover:border-zinc-400 text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Add Passenger ({passengers.length} of 4)
                    </button>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* ==========================================================
              RIGHT SIDEBAR (4 COLS): CHECKLIST & REFLEX DRILL
          ========================================================== */}
          <div className="lg:col-span-4 space-y-5">
            {/* Card 3: Pre-Booking Checklist */}
            <section
              className={`rounded-xl border p-5 sm:p-6 transition-colors ${isDark ? 'bg-[#16181D] border-zinc-800/80 shadow-none' : 'bg-white border-zinc-200/90 shadow-xs'
                }`}
            >
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-3 mb-3">
                <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Pre-Booking Checklist
                </h2>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {checklistProgress}% ready
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mb-4">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-200"
                  style={{ width: `${checklistProgress}%` }}
                />
              </div>

              {/* Checklist items */}
              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer flex items-start gap-2.5 ${item.checked
                        ? isDark
                          ? 'bg-[#1B1D23] border-zinc-800 text-zinc-200'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        : isDark
                          ? 'bg-transparent border-zinc-800/50 text-zinc-400 hover:border-zinc-700'
                          : 'bg-transparent border-zinc-200/60 text-zinc-500 hover:border-zinc-300'
                      }`}
                  >
                    <button className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400">
                      {item.checked ? (
                        <CheckSquare className="w-4 h-4 fill-current" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                    <div>
                      <div className="text-xs font-medium leading-snug">{item.title}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Card 4: 15-Second Reflex Drill Simulator */}
            <section
              className={`rounded-xl border p-5 sm:p-6 transition-colors ${isDark ? 'bg-[#16181D] border-zinc-800/80 shadow-none' : 'bg-white border-zinc-200/90 shadow-xs'
                }`}
            >
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-3 mb-3">
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Checkout Reflex Drill
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Practice the 4 critical clicks to build muscle memory.
                  </p>
                </div>
                {bestDrillMs && (
                  <span className="text-xs font-mono text-zinc-500">
                    PB: {(bestDrillMs / 1000).toFixed(2)}s
                  </span>
                )}
              </div>

              {drillState === 'IDLE' && (
                <button
                  onClick={startSpeedDrill}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  Start 4-Step Reflex Drill
                </button>
              )}

              {drillState === 'RUNNING' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      Step {drillStep} of 4 — Tap Active Action!
                    </span>
                    <span className="font-mono text-sm font-semibold tabular-nums">
                      {(drillElapsedMs / 1000).toFixed(2)}s
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { step: 1, label: '1. Refresh Class' },
                      { step: 2, label: '2. Select Master List' },
                      { step: 3, label: '3. Confirm Berth' },
                      { step: 4, label: '4. Paste UPI & Pay' }
                    ].map((btn) => (
                      <button
                        key={btn.step}
                        onClick={() => advanceDrillStep(btn.step)}
                        disabled={drillStep !== btn.step}
                        className={`p-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${drillStep === btn.step
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : drillStep > btn.step
                              ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                              : isDark
                                ? 'border-zinc-800 bg-[#1E2026] text-zinc-500'
                                : 'border-zinc-200 bg-zinc-100 text-zinc-400'
                          }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {drillState === 'DONE' && (
                <div
                  className={`p-4 rounded-lg border text-center space-y-2 ${isDark ? 'bg-[#1B1D23] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                    }`}
                >
                  <div className="text-xs text-zinc-500">
                    Completed in{' '}
                    <span className="text-sm font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                      {(drillElapsedMs / 1000).toFixed(2)}s
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {drillElapsedMs < 3500
                      ? 'Fast execution speed. Ready for Tatkal booking rush.'
                      : 'Good attempt. Try again to finish in under 3.50 seconds.'}
                  </p>
                  <button
                    onClick={startSpeedDrill}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${isDark
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                        : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                      }`}
                  >
                    Practice Again
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer
          className={`mt-6 rounded-xl border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-colors ${isDark ? 'bg-[#16181D] border-zinc-800/80 text-zinc-400' : 'bg-white border-zinc-200/90 text-zinc-500 shadow-xs'
            }`}
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              Best practice: Keep this companion open on a laptop or secondary screen while booking in the RailOne app on your mobile device.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowGuideBook(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Open Handbook
            </button>
            <span className="text-zinc-400">|</span>
            <span>100% Legal & Compliant Companion</span>
          </div>
        </footer>
      </main>

      {/* ============================================================
          INTERACTIVE GUIDE BOOK MODAL (LINEAR / RAYCAST PALETTE STYLE)
      ============================================================ */}
      {showGuideBook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-100">
          <div
            className={`w-full max-w-4xl max-h-[88vh] rounded-xl border flex flex-col shadow-xl overflow-hidden transition-colors ${isDark ? 'bg-[#16181D] border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
              }`}
          >
            {/* Modal Header */}
            <div
              className={`px-5 py-3.5 border-b flex items-center justify-between gap-3 ${isDark ? 'border-zinc-800 bg-[#121316]' : 'border-zinc-200 bg-zinc-50'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-sm font-semibold leading-tight">
                    {guideLang === 'hi'
                      ? 'रेलवन तत्काल प्रो — संपूर्ण मार्गदर्शिका एवं हैंडबुक'
                      : 'RailOne Tatkal Pro — Master Guide & Tactical Handbook'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {guideLang === 'hi'
                      ? 'आधिकारिक संदर्भ, टाइमिंग गणित एवं 100% कानूनी मैन्युअल साथी'
                      : 'Official Reference, Timing Mathematics & 100% Legal Companion'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Switcher */}
                <div
                  className={`inline-flex rounded-md p-0.5 border text-xs ${isDark ? 'bg-[#1E2026] border-zinc-800' : 'bg-white border-zinc-200'
                    }`}
                >
                  <button
                    onClick={() => setGuideLang('hi')}
                    className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${guideLang === 'hi'
                        ? 'bg-blue-600 text-white'
                        : isDark
                          ? 'text-zinc-400 hover:text-zinc-200'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                  >
                    🇮🇳 हिंदी
                  </button>
                  <button
                    onClick={() => setGuideLang('en')}
                    className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${guideLang === 'en'
                        ? 'bg-blue-600 text-white'
                        : isDark
                          ? 'text-zinc-400 hover:text-zinc-200'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                  >
                    🌐 English
                  </button>
                </div>

                <button
                  onClick={() => setShowGuideBook(false)}
                  className={`p-1.5 rounded-md border text-xs cursor-pointer transition-colors ${isDark
                      ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400'
                      : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600'
                    }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Chapter Selector + Reader */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
              {/* Left Column: Chapters */}
              <div
                className={`md:col-span-4 border-b md:border-b-0 md:border-r p-3 overflow-y-auto max-h-[160px] md:max-h-none space-y-1 ${isDark ? 'border-zinc-800 bg-[#121316]/50' : 'border-zinc-200 bg-zinc-50/50'
                  }`}
              >
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider px-2 block mb-1">
                  {guideLang === 'hi' ? 'अध्याय सूची' : 'Chapters'}
                </span>
                {GUIDE_BOOK_CHAPTERS.map((chap, idx) => (
                  <button
                    key={chap.id}
                    onClick={() => setActiveGuideChapter(idx)}
                    className={`w-full text-left p-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between text-xs ${activeGuideChapter === idx
                        ? isDark
                          ? 'bg-zinc-800 text-white font-medium'
                          : 'bg-zinc-200/80 text-zinc-900 font-medium'
                        : isDark
                          ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                      }`}
                  >
                    <div>
                      <div>{chap.title[guideLang]}</div>
                      <div className="text-[11px] text-zinc-500 truncate max-w-[190px]">
                        {chap.subtitle[guideLang]}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  </button>
                ))}
              </div>

              {/* Right Column: Reading Content */}
              <div className="md:col-span-8 p-5 sm:p-6 overflow-y-auto max-h-[60vh] md:max-h-[580px] space-y-4">
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
                      {GUIDE_BOOK_CHAPTERS[activeGuideChapter].badge[guideLang]}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {guideLang === 'hi'
                        ? `अध्याय ${activeGuideChapter + 1} / ${GUIDE_BOOK_CHAPTERS.length}`
                        : `Chapter ${activeGuideChapter + 1} of ${GUIDE_BOOK_CHAPTERS.length}`}
                    </span>
                  </div>
                  <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {GUIDE_BOOK_CHAPTERS[activeGuideChapter].title[guideLang]}
                  </h4>
                  <p className="text-xs text-zinc-500">
                    {GUIDE_BOOK_CHAPTERS[activeGuideChapter].subtitle[guideLang]}
                  </p>
                </div>

                <div>{GUIDE_BOOK_CHAPTERS[activeGuideChapter].content[guideLang]}</div>

                {/* Chapter Navigation Buttons */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <button
                    disabled={activeGuideChapter === 0}
                    onClick={() => setActiveGuideChapter((c) => Math.max(0, c - 1))}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border cursor-pointer disabled:opacity-40 transition-colors ${isDark
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200'
                      }`}
                  >
                    {guideLang === 'hi' ? '← पिछला अध्याय' : '← Previous'}
                  </button>
                  <button
                    disabled={activeGuideChapter === GUIDE_BOOK_CHAPTERS.length - 1}
                    onClick={() =>
                      setActiveGuideChapter((c) => Math.min(GUIDE_BOOK_CHAPTERS.length - 1, c + 1))
                    }
                    className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white cursor-pointer transition-colors"
                  >
                    {guideLang === 'hi' ? 'अगला अध्याय →' : 'Next Chapter →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
