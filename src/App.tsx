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
  ArrowRight,
  ArrowLeftRight,
  ChevronRight,
  Smartphone,
  ExternalLink,
  Target,
  Maximize2,
  Minimize2
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

// --- CLASS TATKAL FARE RULES ---
const CLASS_RULES: Record<string, ClassRule> = {
  '3A': { name: 'AC 3 Tier (3A)', slot: 'AC', minTatkal: 300, maxTatkal: 400, clerkage: 40 },
  '2A': { name: 'AC 2 Tier (2A)', slot: 'AC', minTatkal: 400, maxTatkal: 500, clerkage: 50 },
  '3E': { name: 'AC 3 Economy (3E)', slot: 'AC', minTatkal: 300, maxTatkal: 400, clerkage: 40 },
  'CC': { name: 'AC Chair Car (CC)', slot: 'AC', minTatkal: 125, maxTatkal: 225, clerkage: 40 },
  'EC': { name: 'Exec. Chair Car (EC)', slot: 'AC', minTatkal: 400, maxTatkal: 500, clerkage: 60 },
  'SL': { name: 'Sleeper Class (SL)', slot: 'NON_AC', minTatkal: 100, maxTatkal: 200, clerkage: 20 },
  '2S': { name: 'Second Sitting (2S)', slot: 'NON_AC', minTatkal: 10, maxTatkal: 15, clerkage: 15 }
};

// --- INITIAL DEMO PASSENGERS ---
const DEMO_PASSENGERS: Passenger[] = [
  { id: '1', name: 'Rahul Sharma', age: '29', gender: 'M', berth: 'LB', idType: 'Aadhaar' },
  { id: '2', name: 'Priya Sharma', age: '27', gender: 'F', berth: 'UB', idType: 'Aadhaar' }
];

// --- INITIAL CHECKLIST ---
const INITIAL_CHECKLIST: ChecklistItem[] = [
  {
    id: 'master_list',
    title: 'Master List Pre-Saved before 09:45 AM',
    desc: 'RailOne > Profile > Master List mein passengers pehle se add karein (Saves 22s).',
    checked: true
  },
  {
    id: 'payment_ready',
    title: 'Secondary Phone Unlocked on GPay/PhonePe',
    desc: 'Doosre phone par UPI khol kar rakhein taaki primary phone par app switch na karna pade.',
    checked: true
  },
  {
    id: 'confirm_berths',
    title: 'Tick "Book only if confirm berths are allotted"',
    desc: 'Isse seats khatam hone par Tatkal Waiting List ticket nahi banega aur paise safe rahenge.',
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

// --- GUIDE BOOK CHAPTERS (HINDI & ENGLISH SUPPORT) ---
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
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          <p className="text-slate-200">
            भारतीय रेल (IRCTC) में तत्काल टिकट बुकिंग प्रतिदिन सुबह दो अलग-अलग समय पर खुलती है:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1.5">
              <div className="font-bold text-white flex items-center justify-between">
                <span>❄️ वातानुकूलित (AC) तत्काल</span>
                <span className="font-mono text-emerald-400 text-xs">सुबह 10:00:00 AM IST</span>
              </div>
              <p className="text-xs text-slate-300">
                <strong>श्रेणियां:</strong> 2A, 3A, 3E, CC, EC, 1A.<br />
                सुबह <strong className="text-emerald-300 font-mono">09:57:00 AM</strong> पर रेलवन (RailOne) ऐप में लॉगिन करें।
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-1.5">
              <div className="font-bold text-white flex items-center justify-between">
                <span>🚂 गैर-वातानुकूलित (Non-AC) तत्काल</span>
                <span className="font-mono text-amber-400 text-xs">सुबह 11:00:00 AM IST</span>
              </div>
              <p className="text-xs text-slate-300">
                <strong>श्रेणियां:</strong> स्लीपर (SL) एवं सेकंड सीटिंग (2S).<br />
                सुबह <strong className="text-amber-300 font-mono">10:57:00 AM</strong> पर रेलवन ऐप में लॉगिन करें।
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 space-y-1">
            <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
              <span>⚠️ कन्फर्म तत्काल रद्दीकरण (Cancellation) नियम:</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              कन्फर्म तत्काल टिकट रद्द करने पर रेलवे द्वारा <strong>₹0.00 रिफंड (शून्य रिफंड)</strong> दिया जाता है।
              केवल यदि टिकट चार्ट बनने तक वेटिंग लिस्ट या आरएसी रह जाए, तभी आईआरसीटीसी क्लर्केज शुल्क (₹20-₹60) काटकर बाकी राशि बैंक खाते में वापस भेजता है।
            </p>
          </div>
        </div>
      ),
      en: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>Indian Railways Tatkal booking opens in two separate daily windows:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
              <div className="font-bold text-white flex items-center justify-between">
                <span>❄️ AC Tatkal Window</span>
                <span className="font-mono text-emerald-400 text-xs">10:00:00 AM IST</span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5">
                Classes: <strong>2A, 3A, 3E, CC, EC, 1A</strong>.<br />
                Log in to RailOne at <strong>09:57:00 AM</strong>.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40">
              <div className="font-bold text-white flex items-center justify-between">
                <span>🚂 Non-AC Tatkal Window</span>
                <span className="font-mono text-amber-400 text-xs">11:00:00 AM IST</span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5">
                Classes: <strong>Sleeper (SL) & 2S</strong>.<br />
                Log in to RailOne at <strong>10:57:00 AM</strong>.
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
            <h4 className="font-bold text-slate-200 mb-1">⚠️ Confirmed Tatkal Cancellation Rule:</h4>
            <p className="text-xs text-slate-400">
              Confirmed Tatkal tickets yield <strong>₹0.00 refund (Zero Refund)</strong>.
              Only RAC or Waiting List Tatkal tickets that remain unconfirmed after chart preparation receive an automatic refund minus clerkage fee.
            </p>
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
      en: 'The biggest mistake that 35% of passengers make!'
    },
    content: {
      hi: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-200 space-y-1">
            <h4 className="font-bold text-white">🚨 आधिकारिक रेलवे नियम: बोर्डिंग नहीं, ओरिजिन तारीख मान्य है</h4>
            <p className="text-xs leading-relaxed">
              तत्काल कोटा आपके स्टेशन से नहीं, बल्कि <strong>ट्रेन जहां से अपनी यात्रा शुरू करती है (Origin Station)</strong>, उस तारीख से <strong>१ दिन पहले</strong> खुलता है!
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-100">वास्तविक उदाहरण (लंबी दूरी की ट्रेनें):</h4>
            <p className="text-xs text-slate-300">
              मान लीजिए आपको <strong>शुक्रवार २० तारीख</strong> को अपने शहर से ट्रेन पकड़नी है। लेकिन वह ट्रेन <strong>बुधवार १८ तारीख</strong> को अपने मूल स्टेशन (Origin) से रवाना हुई थी:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
              <li>ट्रेन शुरू होने की तारीख: <strong>बुधवार १८ तारीख</strong></li>
              <li>तत्काल खुलने की वास्तविक तारीख: <strong className="text-emerald-400">मंगलवार १७ तारीख सुबह १०:०० AM!</strong></li>
              <li>यदि आप गुरुवार १९ तारीख को ऐप खोलेंगे, तो सारी सीटें ४८ घंटे पहले ही बुक हो चुकी होंगी!</li>
            </ul>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-cyan-300">
            💡 <strong>समाधान:</strong> कमांड सेंटर के <em>"Train Origin Day Check (Day 1 / Day 2 / Day 3)"</em> बटन का उपयोग करें—यह सटीक बुकिंग तारीख स्वतः प्रदर्शित करेगा।
          </div>
        </div>
      ),
      en: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-200">
            <h4 className="font-bold text-white mb-1">🚨 Railway Rule: Origin Date vs Boarding Date</h4>
            <p className="text-xs leading-relaxed">
              Tatkal opens 1 day before the date of journey from the <strong>train originating station</strong>, NOT from your boarding station.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200">Real-World Case Study:</h4>
            <p className="text-xs text-slate-300">
              If your train arrives at your boarding station on Friday 20th, but originated in Assam/Bengal on Wednesday 18th:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
              <li>Origin Date: <strong>Wednesday 18th</strong></li>
              <li>Tatkal Booking Date: <strong>Tuesday 17th at 10:00 AM IST!</strong></li>
              <li>If you wait until Thursday, all quota seats will be completely sold out.</li>
            </ul>
          </div>
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
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          <p className="text-slate-200">
            तत्काल की आपाधापी में हाथ से यात्री का नाम, आयु, लिंग और सीट चयन टाइप करने में <strong>२० से ३० सेकंड</strong> लग जाते हैं। इतने समय में कोटा समाप्त हो जाता है।
          </p>
          <div className="space-y-2">
            <h4 className="font-bold text-emerald-300">मास्टर लिस्ट कैसे उपयोग करें:</h4>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-300">
              <li>रेलवन (RailOne) या आईआरसीटीसी ऐप खोलें $\rightarrow$ <strong>Account / Profile</strong> $\rightarrow$ <strong>Master List</strong> में जाएं।</li>
              <li>सुबह <strong>०९:४५ AM से पहले</strong> अपने सभी यात्रियों के नाम जोड़ लें।</li>
              <li>१०:०० AM पर केवल <em>"Add from Master List"</em> चुनें और चेकबॉक्स टिक करें—<strong>मात्र १.५ सेकंड</strong> में सभी यात्री जुड़ जाएंगे!</li>
            </ol>
          </div>
          <div className="rounded-lg bg-amber-950/30 border border-amber-500/40 p-3 text-xs text-amber-200">
            ⚠️ <strong>मास्टर लिस्ट फ्रीज नियम:</strong> आईआरसीटीसी सुबह ०९:४५ से १०:१५ AM (AC) और १०:४५ से ११:१५ AM (Non-AC) के बीच मास्टर लिस्ट में नए नाम जोड़ने की अनुमति नहीं देता। अतः सुबह ०९:४५ AM से पहले ही तैयारी पूरी कर लें!
          </div>
        </div>
      ),
      en: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            Manually typing passenger name, age, gender, and berth preference takes 20 to 30 seconds. By then, Tatkal seats are exhausted.
          </p>
          <div className="space-y-2">
            <h4 className="font-bold text-emerald-300">How to use Master List:</h4>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-300">
              <li>Open RailOne/IRCTC App ➔ Profile ➔ Master List.</li>
              <li>Add all passengers before 09:45 AM.</li>
              <li>At 10:00 AM, select "Add from Master List" ➔ takes under 2 seconds!</li>
            </ol>
          </div>
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
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          <p className="text-slate-200">तत्काल में सफलता केवल सही सेकंड पर सही बटन दबाने से मिलती है:</p>
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2.5">
              <span className="font-mono font-bold text-cyan-400 shrink-0 text-xs">09:57:00 AM</span>
              <div className="text-xs">
                <strong className="text-white">फेज़ २: ऐप लॉगिन एवं ट्रेन खोज</strong>
                <p className="text-slate-400 mt-0.5">बायोमेट्रिक या पिन से लॉगिन करें। स्टेशन और तारीख चुनें, कोटा में <strong>TATKAL</strong> चुनें और ट्रेन सूची स्क्रीन पर पहुंचें।</p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-amber-500/30 flex items-start gap-2.5">
              <span className="font-mono font-bold text-amber-400 shrink-0 text-xs">09:59:30 AM</span>
              <div className="text-xs">
                <strong className="text-white">फेज़ ३: स्थिति संभालें (T-30s)</strong>
                <p className="text-slate-400 mt-0.5">स्क्रीन को कतई रीफ्रेश न करें! अपना अंगूठा ट्रेन के 3A/2A/SL बटन पर रखें। दूसरे फोन पर यूपीआई ऐप खोलकर रखें।</p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/50 flex items-start gap-2.5">
              <span className="font-mono font-bold text-emerald-400 shrink-0 text-xs">09:59:58 AM</span>
              <div className="text-xs">
                <strong className="text-white">फेज़ ४: स्ट्राइक ज़ोन (T-2s)</strong>
                <p className="text-slate-200 mt-0.5"><strong>क्लास बटन (3A/SL) पर तुरंत टैप करें!</strong> इंटरनेट लेटेंसी के कारण आपका अनुरोध ठीक 10:00:00 पर सर्वर पहुंचेगा।</p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2.5">
              <span className="font-mono font-bold text-slate-200 shrink-0 text-xs">10:00:05 AM</span>
              <div className="text-xs">
                <strong className="text-white">फेज़ ५: यात्री चयन एवं चेकबॉक्स</strong>
                <p className="text-slate-400 mt-0.5">मास्टर लिस्ट से यात्रियों को चुनें और <em>"Book only if confirm berths are allotted"</em> पर अनिवार्य टिक करें।</p>
              </div>
            </div>
          </div>
        </div>
      ),
      en: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>Timing is everything in Tatkal. Follow the critical second markers:</p>
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2.5">
              <span className="font-mono font-bold text-cyan-400 shrink-0 text-xs">09:57:00 AM</span>
              <div className="text-xs">
                <strong className="text-white">Phase 2: App Login & Train Search</strong>
                <p className="text-slate-400 mt-0.5">Log in via Biometrics/PIN. Search route with Quota: TATKAL.</p>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/50 flex items-start gap-2.5">
              <span className="font-mono font-bold text-emerald-400 shrink-0 text-xs">09:59:58 AM</span>
              <div className="text-xs">
                <strong className="text-white">Phase 4: Strike Zone (T-2s)</strong>
                <p className="text-slate-200 mt-0.5">Tap class refresh button so your request lands at 10:00:00 sharp.</p>
              </div>
            </div>
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
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              दो फोन (Dual-Phone) का वैज्ञानिक फॉर्मूला:
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              फोन १ पर टिकट बुक करते समय जब यात्री GPay या PhonePe खोलने के लिए ऐप स्विच करते हैं, तो फोन की रैम रेलवन ऐप को बैकग्राउंड में बंद कर देती है, जिससे बुकिंग रद्द हो जाती है!
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-mono font-bold text-cyan-300">पहला फोन (बुकिंग फोन)</span>
              <p className="text-slate-400">इस पर रेलवन ऐप खुला रखें। भुगतान स्क्रीन पर दूसरे फोन की यूपीआई आईडी (उदा. 9876543210@ybl) पेस्ट करें।</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-mono font-bold text-emerald-300">दूसरा फोन (भुगतान फोन)</span>
              <p className="text-slate-400">इस पर GPay/PhonePe खोलकर तैयार रखें। रिक्वेस्ट आते ही पिन डालें। पहले फोन पर टिकट तुरंत डाउनलोड हो जाएगा!</p>
            </div>
          </div>
        </div>
      ),
      en: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            Switching apps to approve payments on the booking phone often triggers mobile OS memory cleanups, crashing your session.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-mono font-bold text-cyan-300">Device 1 (Booking)</span>
              <p className="text-slate-400">Keep RailOne open. Enter Device 2's UPI ID at payment screen.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-mono font-bold text-emerald-300">Device 2 (Payment)</span>
              <p className="text-slate-400">Unlock GPay/PhonePe. Approve payment request instantly without touching Device 1.</p>
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
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          <p className="text-slate-200">
            भारी ट्रैफिक के समय कभी-कभी आईआरसीटीसी एरर देता है: <em>"Unable to fetch Master List"</em>. ऐसी स्थिति में:
          </p>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
              <strong className="text-white">१. स्पीड वॉल्ट से १-क्लिक कॉपी:</strong>
              <p className="text-slate-400">कमांड सेंटर के स्पीड वॉल्ट में हर यात्री के नाम के आगे <strong>"Copy Name"</strong> बटन है। एक क्लिक में नाम कॉपी करके रेलवन में तुरंत पेस्ट करें।</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
              <strong className="text-white">२. सीट विकल्प में हमेशा 'No Choice / Any' रखें:</strong>
              <p className="text-slate-400">तत्काल में लोअर बर्थ मांगने से बचने की सलाह दी जाती है क्योंकि एल्गोरिदम सीट तलाशने में अतिरिक्त समय लेता है।</p>
            </div>
          </div>
        </div>
      ),
      en: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>If IRCTC servers fail to populate your Master List due to peak rush load:</p>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
              <strong className="text-white">1. Instant Copy from Speed Vault:</strong>
              <p className="text-slate-400">Use the 1-Tap copy button for each passenger to paste names rapidly into RailOne.</p>
            </div>
          </div>
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
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          <div className="space-y-2">
            {[
              {
                rule: '१. कभी भी एक ही आईआरसीटीसी खाते को दो अलग-अलग टैब या फोन पर एक साथ लॉगिन न करें।',
                desc: 'आईआरसीटीसी का फ्रॉड डिटेक्शन सिस्टम डुप्लीकेट लॉगिन मिलते ही दोनों सत्र तत्काल समाप्त कर देता है।'
              },
              {
                rule: '२. सुबह ०९:५५ AM से पहले लॉगिन न करें।',
                desc: 'सत्र निष्क्रियता (Idle timeout) केवल ३ मिनट की होती है। ०९:५० पर लॉगिन करने से ०९:५८ पर अपने आप लॉगआउट हो जाएंगे।'
              },
              {
                rule: '३. किसी भी अवैध बॉट या ऑटो-फिल एक्सटेंशन का प्रयोग न करें।',
                desc: 'रेलवे एक्ट की धारा १४३ के तहत बॉट अवैध हैं। हमारा कमांड सेंटर पूर्णतः कानूनी, सुरक्षित व मैनुअल साथी है।'
              },
              {
                rule: '४. "Book only if confirm berths are allotted" अनिवार्य रूप से टिक करें।',
                desc: 'ताकि सीटें समाप्त होने पर वेटिंग लिस्ट तत्काल टिकट न बने और आपकी पूरी राशि सुरक्षित रहे।'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <strong className="text-slate-100">{item.rule}</strong>
                <p className="text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
      en: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="space-y-2">
            {[
              { rule: '1. Never login to the same IRCTC account across multiple tabs.', desc: 'Anti-fraud triggers session terminations.' },
              { rule: '2. Do not login earlier than 09:56 AM.', desc: 'Session timeout is 3 minutes.' },
              { rule: '3. Never use illegal auto-fill bot scripts.', desc: 'RailOne Tatkal Pro is 100% manual and compliant.' },
              { rule: '4. Always tick "Book only if confirm berths are allotted".', desc: 'Avoids non-refundable Tatkal waiting list tickets.' }
            ].map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <strong className="text-slate-100">{item.rule}</strong>
                <p className="text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    }
  }
];

export default function App() {
  // ==========================================
  // 1. ATOMIC CLOCK & SIMULATION ENGINE STATE
  // ==========================================
  const [tatkalMode, setTatkalMode] = useState<'AC' | 'NON_AC'>('AC'); // 'AC' (10:00) or 'NON_AC' (11:00)
  const [offsetMs, setOffsetMs] = useState<number>(0); // -2000 to +2000ms server sync calibration
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStartRealMs, setSimStartRealMs] = useState<number>(0);
  const [nowMs, setNowMs] = useState<number>(Date.now());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const lastBeepSecRef = useRef<number | null>(null);

  // Mobile Active Tab View ('all' | 'clock' | 'date' | 'vault' | 'drill')
  const [mobileTab, setMobileTab] = useState<'all' | 'clock' | 'date' | 'vault' | 'drill'>('all');
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
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Audio synthesis helper (Web Audio API - zero external files needed)
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

  // Compute current effective IST Date object
  const clockData = useMemo(() => {
    const targetHour = tatkalMode === 'AC' ? 10 : 11;

    if (isSimulating) {
      const elapsed = nowMs - simStartRealMs;
      // Simulate from 09:59:00.000 for 70 seconds
      if (elapsed > 70000) {
        setIsSimulating(false);
      }
      const baseDate = new Date();
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

  // Trigger audio cues at critical seconds
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

  // Tactical phase message & styling
  const tacticalPhase = useMemo(() => {
    const s = clockData.diffSec;
    if (s <= 0 && s >= -300) {
      return {
        code: 'PHASE 5: LIVE EXECUTION',
        color: 'emerald',
        pulse: true,
        headline: 'BOOKING OPEN! TAP CLASS & SELECT MASTER LIST NOW!',
        instruction: 'Do NOT hit Back or Refresh. Select passengers from Master List -> Tick Confirm Berth -> Pay via UPI/R-Wallet.'
      };
    }
    if (s <= 3 && s > 0) {
      return {
        code: 'PHASE 4: STRIKE ZONE (T-3s)',
        color: 'emerald',
        pulse: true,
        headline: 'TAP TRAIN CLASS NOW! SERVER GATE OPENING...',
        instruction: 'Keep finger on 3A/2A/SL refresh button. Tap right now so request reaches IRCTC server at 00.01s!'
      };
    }
    if (s <= 30 && s > 3) {
      return {
        code: 'PHASE 3: HOLD POSITION (T-30s)',
        color: 'amber',
        pulse: true,
        headline: 'HOLD ON TRAIN LIST SCREEN — DO NOT REFRESH TOO EARLY!',
        instruction: 'Keep UPI ID copied in clipboard. Keep finger hovered over train class button. Wait for T-2 seconds.'
      };
    }
    if (s <= 180 && s > 30) {
      return {
        code: 'PHASE 2: LOGIN & SEARCH (T-3m)',
        color: 'cyan',
        pulse: false,
        headline: 'LOGIN TO RAILONE / IRCTC NOW & SELECT TATKAL QUOTA',
        instruction: 'Complete MPIN/Biometric login now. Enter From -> To -> Date -> Quota: TATKAL and reach Train List screen.'
      };
    }
    if (s <= 300 && s > 180) {
      return {
        code: 'PHASE 1: NETWORK & UPI PREP (T-5m)',
        color: 'amber',
        pulse: false,
        headline: 'PREPARE DEVICES: LOCK 5G/FIBER & COPY UPI ID',
        instruction: 'Close background apps. Open GPay/PhonePe on secondary phone. Copy UPI ID from Speed Vault below.'
      };
    }
    return {
      code: 'STANDBY / PREP MODE',
      color: 'slate',
      pulse: false,
      headline: `NEXT ${tatkalMode === 'AC' ? 'AC (10:00 AM)' : 'NON-AC (11:00 AM)'} TATKAL WINDOW ARMED`,
      instruction: 'Save passengers & UPI in Vault below, check your exact Booking Date, or click "Simulate Final 60s Rush" to practice.'
    };
  }, [clockData.diffSec, tatkalMode]);

  // Format Clock strings
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

  // ==========================================
  // 2. TATKAL DATE & MULTI-DAY TRAP CALCULATOR
  // ==========================================
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }, []);

  const [fromStn, setFromStn] = useState<string>('CSMT');
  const [toStn, setToStn] = useState<string>('NDLS');
  const [trainInfo, setTrainInfo] = useState<string>('12951 - Tejas Rajdhani / Exp');
  const [boardingDate, setBoardingDate] = useState<string>(tomorrowStr);
  const [travelClass, setTravelClass] = useState<string>('3A');
  const [trainDayOffset, setTrainDayOffset] = useState<number>(1); // 1 = Same day origin, 2 = Started yesterday, 3 = Started 2 days ago

  const swapStations = () => {
    const temp = fromStn;
    setFromStn(toStn);
    setToStn(temp);
    playBeep(700, 0.05, 'sine');
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

    // Train origin date = Boarding Date minus (trainDayOffset - 1) days
    const originObj = new Date(boardObj);
    originObj.setDate(originObj.getDate() - (trainDayOffset - 1));

    // Tatkal opens 1 day before Train Origin Date!
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

  // ==========================================
  // 3. 1-TAP SPEED VAULT (LOCALSTORAGE)
  // ==========================================
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
    playBeep(1046, 0.08, 'sine');
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
    playBeep(880, 0.1, 'sine');
  };

  const advanceDrillStep = (expectedStep: number) => {
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

  // Copy booking plan
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 pb-16">
      {/* ============================================================
          TOP STATUS & TELEMETRY BAR (FULLY RESPONSIVE & EDGE-TO-EDGE)
      ============================================================ */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/90 px-3 sm:px-6 lg:px-8 xl:px-10 py-2.5 shadow-md">
        <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Brand & Subtitle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shadow-inner shadow-emerald-500/20 shrink-0">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                    RailOne Tatkal Pro
                  </h1>
                  <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Pro Hub
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden md:block">
                  Atomic IST Synchronizer • Multi-Day Origin Engine • 1-Tap Speed Vault
                </p>
              </div>
            </div>

            {/* Guide Book Trigger (Mobile Header View) */}
            <button
              onClick={() => setShowGuideBook(true)}
              className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold cursor-pointer active:scale-95 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guide Book</span>
            </button>
          </div>

          {/* Action Controls */}
          <div className="flex items-center justify-between sm:justify-end flex-wrap gap-2">
            {/* Slot Mode Switcher */}
            <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 shrink-0">
              <button
                onClick={() => setTatkalMode('AC')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                  tatkalMode === 'AC'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                AC (10 AM)
              </button>
              <button
                onClick={() => setTatkalMode('NON_AC')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                  tatkalMode === 'NON_AC'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SL/2S (11 AM)
              </button>
            </div>

            {/* Fullscreen Edge-To-Edge Toggle Button */}
            <button
              onClick={toggleFullscreen}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isFullscreen
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white'
              }`}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (Edge-to-Edge)'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Fullscreen</span>
                </>
              )}
            </button>

            {/* Desktop Guide Book Button */}
            <button
              onClick={() => setShowGuideBook(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition-all cursor-pointer"
              title="Open the complete Tatkal tactics manual"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>📖 Master Guide Book</span>
            </button>

            {/* Simulation Button */}
            {!isSimulating ? (
              <button
                onClick={start60sSimulation}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 transition-all cursor-pointer shrink-0"
                title="Practice the final 60 seconds before 10:00 AM anytime"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden xs:inline">Simulate 60s Rush</span>
                <span className="xs:hidden">Simulate</span>
              </button>
            ) : (
              <button
                onClick={() => setIsSimulating(false)}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Exit Sim</span>
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border text-xs transition-all cursor-pointer shrink-0 ${
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

        {/* MOBILE NAVIGATION BAR (Allows 1-tap view switching on phones) */}
        <div className="sm:hidden mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All-In-One' },
            { id: 'clock', label: '⏱️ Radar' },
            { id: 'date', label: '📅 Date Calc' },
            { id: 'vault', label: '⚡ Vault' },
            { id: 'drill', label: '🎯 Drill' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id as any)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer ${
                mobileTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* ============================================================
          MAIN WORKSTATION GRID (EDGE-TO-EDGE WIDESCREEN)
      ============================================================ */}
      <main className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 pt-3 sm:pt-4 space-y-4">
        {/* ============================================================
            HERO MODULE 1: PRECISION IST ATOMIC CLOCK & TACTICAL RADAR
        ============================================================ */}
        {(mobileTab === 'all' || mobileTab === 'clock') && (
          <section className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 shadow-xl relative overflow-hidden">
            <div
              className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20 ${tacticalPhase.color === 'emerald'
                  ? 'bg-emerald-500'
                  : tacticalPhase.color === 'amber'
                    ? 'bg-amber-500'
                    : tacticalPhase.color === 'cyan'
                      ? 'bg-cyan-500'
                      : 'bg-slate-600'
                }`}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
              {/* Left 4 Cols: Live Millisecond Atomic Clock */}
              <div className="lg:col-span-4 bg-slate-950/90 border border-slate-800/90 rounded-xl p-3 sm:p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="inline-flex items-center gap-1.5 font-mono uppercase tracking-wider text-slate-300 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    {isSimulating ? 'SIMULATED IST CLOCK' : 'LIVE IST SERVER TIME'}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    Sync: {offsetMs >= 0 ? `+${offsetMs}` : offsetMs}ms
                  </span>
                </div>

                <div className="my-2 flex items-baseline justify-center sm:justify-start font-mono tabular-nums tracking-tight">
                  <span className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-white">
                    {timeParts.hh}:{timeParts.mm}:{timeParts.ss}
                  </span>
                  <span className="text-xl sm:text-2xl lg:text-3xl 2xl:text-4xl font-bold text-emerald-400 ml-1">
                    .{timeParts.ms}
                  </span>
                  <span className="ml-2 text-xs font-mono text-slate-400 uppercase">IST</span>
                </div>

                {/* Manual Latency Calibration Bar */}
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-cyan-400" />
                    IRCTC Ping Latency:
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setOffsetMs((m) => Math.max(-2000, m - 250))}
                      className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono cursor-pointer active:scale-95"
                    >
                      -0.25s
                    </button>
                    <button
                      onClick={() => setOffsetMs(0)}
                      className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 text-xs font-mono cursor-pointer active:scale-95"
                    >
                      0
                    </button>
                    <button
                      onClick={() => setOffsetMs((m) => Math.min(2000, m + 250))}
                      className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono cursor-pointer active:scale-95"
                    >
                      +0.25s
                    </button>
                  </div>
                </div>
              </div>

              {/* Middle 3 Cols: T-Minus Countdown Box */}
              <div className="lg:col-span-3 bg-slate-950/90 border border-slate-800/90 rounded-xl p-3 sm:p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono uppercase tracking-wider text-[11px]">
                    {tatkalMode === 'AC' ? '10:00 AM AC GATE' : '11:00 AM SL GATE'}
                  </span>
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                </div>

                <div className="my-2 text-center sm:text-left">
                  <div
                    className={`text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-mono tabular-nums font-bold tracking-tight ${clockData.diffSec <= 10
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
                  <span>Target Login Time:</span>
                  <span className="font-mono text-emerald-300 font-semibold">
                    {tatkalMode === 'AC' ? '09:57:00 AM' : '10:57:00 AM'}
                  </span>
                </div>
              </div>

              {/* Right 5 Cols: Live Tactical Phase Command Display */}
              <div
                className={`lg:col-span-5 rounded-xl p-3.5 sm:p-4 border transition-all flex flex-col justify-between ${tacticalPhase.color === 'emerald'
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                    : tacticalPhase.color === 'amber'
                      ? 'bg-amber-950/30 border-amber-500/50'
                      : tacticalPhase.color === 'cyan'
                        ? 'bg-cyan-950/30 border-cyan-500/50'
                        : 'bg-slate-950/80 border-slate-800'
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${tacticalPhase.color === 'emerald'
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
                      <span className="text-[10px] sm:text-[11px] font-mono text-cyan-300 animate-pulse font-bold">
                        ● 60S SIMULATION
                      </span>
                    )}
                  </div>

                  <h2
                    className={`text-sm sm:text-base font-bold tracking-tight mb-1 ${tacticalPhase.pulse ? 'text-white animate-pulse' : 'text-white'
                      }`}
                  >
                    {tacticalPhase.headline}
                  </h2>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {tacticalPhase.instruction}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================
            THREE-COLUMN CORE COMMAND MODULES (RESPONSIVE GRID)
        ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* ------------------------------------------------------------
              COLUMN 1 (4 Cols): TATKAL DATE & MULTI-DAY TRAP CALCULATOR
          ------------------------------------------------------------ */}
          {(mobileTab === 'all' || mobileTab === 'date') && (
            <section className="lg:col-span-4 rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    1. Booking Date & Origin
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Anti-Trap Engine
                </span>
              </div>

              {/* Station Presets with Swap Button */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">ROUTE (FROM ➔ TO)</span>
                  <button
                    type="button"
                    onClick={swapStations}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    title="Swap From and To stations"
                  >
                    <ArrowLeftRight className="w-3 h-3" /> Swap
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      list="stations-from"
                      value={fromStn}
                      onChange={(e) => setFromStn(e.target.value.toUpperCase())}
                      placeholder="e.g. CSMT"
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3 py-2 text-xs font-mono text-white outline-none"
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
                      placeholder="e.g. NDLS"
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3 py-2 text-xs font-mono text-white outline-none"
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
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    QUOTA CLASS
                  </label>
                  <select
                    value={travelClass}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 px-2.5 py-2 text-xs font-mono text-emerald-300 outline-none"
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
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-amber-300 mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    TRAIN ORIGIN DAY CHECK (Multi-Day Trap):
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
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${trainDayOffset === item.day
                            ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                      >
                        <div className="text-xs font-mono font-bold">{item.label}</div>
                        <div className="text-[10px] opacity-80 leading-tight">{item.sub}</div>
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
                        <span className="font-bold text-amber-300">MULTI-DAY ALERT!</span> Train source se{' '}
                        <span className="font-mono underline font-bold text-white">
                          {bookingCalculation.originFormatted}
                        </span>{' '}
                        ko niklegi. Tatkal Boarding Date se nahi, balki{' '}
                        <span className="font-bold text-white">Origin Date se 1 din pehle</span> khulega!
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Exact Tatkal Date:</span>
                    <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      {bookingCalculation.tatkalOpenFormatted}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">RailOne Login Time:</span>
                    <span className="font-mono font-semibold text-cyan-300">
                      {bookingCalculation.loginTimeStr}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Window Opens:</span>
                    <span className="font-mono font-bold text-white">
                      {bookingCalculation.openTimeStr}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Est. Tatkal Fare ({travelClass}):</span>
                    <span className="font-mono text-slate-200">
                      ₹{bookingCalculation.rule.minTatkal} – ₹{bookingCalculation.rule.maxTatkal} / pax
                    </span>
                  </div>

                  <button
                    onClick={copyBookingPlanSummary}
                    className="w-full mt-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                  >
                    {copiedKey === 'PLAN_SUMMARY' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Plan Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Copy Full Booking Schedule</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </section>
          )}

          {/* ------------------------------------------------------------
              COLUMN 2 (4 Cols): 1-TAP SPEED VAULT (UPI & PASSENGERS)
          ------------------------------------------------------------ */}
          {(mobileTab === 'all' || mobileTab === 'vault') && (
            <section className="lg:col-span-4 rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    2. 1-Tap Speed Vault
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Local Storage
                </span>
              </div>

              {/* Instant UPI VPA Launcher */}
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Instant UPI ID (Saves ~10s)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">1-Tap Paste</span>
                </div>

                {/* Primary UPI */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={primaryUpi}
                    onChange={(e) => setPrimaryUpi(e.target.value)}
                    placeholder="yourname@okaxis"
                    className="flex-1 rounded-lg bg-slate-900 border border-slate-800 focus:border-emerald-500 px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(primaryUpi, 'UPI_PRIMARY')}
                    className={`px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95 ${copiedKey === 'UPI_PRIMARY'
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
                    placeholder="Backup UPI (e.g. 9876543210@ybl)"
                    className="flex-1 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-500 px-3 py-2 text-xs font-mono text-slate-300 outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(backupUpi, 'UPI_BACKUP')}
                    className={`px-3 py-2 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 transition-all cursor-pointer shrink-0 active:scale-95 ${copiedKey === 'UPI_BACKUP'
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

              {/* Emergency Passenger Quick-Copy List (Mobile Optimized) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    Emergency Pax Vault (Max 4)
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

                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {passengers.map((p, idx) => (
                    <div
                      key={p.id}
                      className="rounded-lg bg-slate-950 border border-slate-800/90 p-2.5 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono font-bold text-slate-400">
                          PAX #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => copyToClipboard(p.name, `PAX_NAME_${p.id}`)}
                            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-300 flex items-center gap-1 cursor-pointer active:scale-95"
                            title="Copy passenger name if Master List fails to load"
                          >
                            {copiedKey === `PAX_NAME_${p.id}` ? (
                              <>
                                <Check className="w-3 h-3" /> Copied
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

                      {/* Responsive Inputs: Mobile-native two-tier layout */}
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => updatePassenger(p.id, 'name', e.target.value)}
                          placeholder="Full Name (as per ID)"
                          className="w-full rounded bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
                        />
                        <div className="grid grid-cols-3 gap-1.5">
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-0.5">Age</label>
                            <input
                              type="number"
                              value={p.age}
                              onChange={(e) => updatePassenger(p.id, 'age', e.target.value)}
                              placeholder="Age"
                              className="w-full rounded bg-slate-900 border border-slate-800 px-2 py-1 text-xs font-mono text-white outline-none focus:border-cyan-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-0.5">Gender</label>
                            <select
                              value={p.gender}
                              onChange={(e) => updatePassenger(p.id, 'gender', e.target.value)}
                              className="w-full rounded bg-slate-900 border border-slate-800 px-1.5 py-1 text-xs font-mono text-slate-200 outline-none"
                            >
                              <option value="M">M</option>
                              <option value="F">F</option>
                              <option value="T">O</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-0.5">Berth</label>
                            <select
                              value={p.berth}
                              onChange={(e) => updatePassenger(p.id, 'berth', e.target.value)}
                              className="w-full rounded bg-slate-900 border border-slate-800 px-1 py-1 text-xs font-mono text-amber-300 outline-none"
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
                      </div>
                    </div>
                  ))}
                </div>

                {passengers.length < 4 && (
                  <button
                    onClick={addPassenger}
                    className="w-full py-2 rounded-lg border border-dashed border-slate-700 hover:border-cyan-500/50 text-xs font-mono text-slate-300 hover:text-cyan-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Add Passenger ({passengers.length}/4)
                  </button>
                )}
              </div>
            </section>
          )}

          {/* ------------------------------------------------------------
              COLUMN 3 (4 Cols): 35s PROTOCOL CHECKLIST & SPEED DRILL
          ------------------------------------------------------------ */}
          {(mobileTab === 'all' || mobileTab === 'drill') && (
            <section className="lg:col-span-4 rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    3. 35-Sec Protocol & Drill
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
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${item.checked
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
                      <Sparkles className="w-3.5 h-3.5" /> 4-Tap Speed Drill
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Practice critical booking taps against clock:
                    </p>
                  </div>
                  {bestDrillMs && (
                    <span className="text-[11px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                      PB: {(bestDrillMs / 1000).toFixed(2)}s
                    </span>
                  )}
                </div>

                {drillState === 'IDLE' && (
                  <button
                    onClick={startSpeedDrill}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-98"
                  >
                    Start 4-Tap Reflex Drill
                  </button>
                )}

                {drillState === 'RUNNING' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-amber-300 animate-pulse font-bold">
                        STEP {drillStep} OF 4 — TAP NOW!
                      </span>
                      <span className="text-lg font-bold text-white tabular-nums">
                        {(drillElapsedMs / 1000).toFixed(2)}s
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => advanceDrillStep(1)}
                        disabled={drillStep !== 1}
                        className={`p-3 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${drillStep === 1
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300 animate-bounce shadow-lg shadow-emerald-500/20'
                            : drillStep > 1
                              ? 'bg-slate-900 border-emerald-500/30 text-emerald-400 opacity-60'
                              : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}
                      >
                        1. Refresh Class
                      </button>

                      <button
                        onClick={() => advanceDrillStep(2)}
                        disabled={drillStep !== 2}
                        className={`p-3 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${drillStep === 2
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300 animate-bounce shadow-lg shadow-emerald-500/20'
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
                        className={`p-3 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${drillStep === 3
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300 animate-bounce shadow-lg shadow-emerald-500/20'
                            : drillStep > 3
                              ? 'bg-slate-900 border-emerald-500/30 text-emerald-400 opacity-60'
                              : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}
                      >
                        3. Confirm Berth
                      </button>

                      <button
                        onClick={() => advanceDrillStep(4)}
                        disabled={drillStep !== 4}
                        className={`p-3 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${drillStep === 4
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300 animate-bounce shadow-lg shadow-emerald-500/20'
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
                      COMPLETED IN{' '}
                      <span className="text-base font-bold text-white tabular-nums">
                        {(drillElapsedMs / 1000).toFixed(2)}s!
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {drillElapsedMs < 3500
                        ? '🔥 PRO REFLEXES! Aapki finger speed Tatkal rush ke liye 100% ready hai.'
                        : '⚡ Good effort! Ek baar aur try karein aur 3.50 seconds se kam mein complete karein.'}
                    </p>
                    <button
                      onClick={startSpeedDrill}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-mono text-cyan-300 border border-slate-700 cursor-pointer active:scale-95"
                    >
                      Practice Again
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* ============================================================
            BOTTOM BAR: 100% FREE HOSTING & USAGE GUIDE
        ============================================================ */}
        <footer className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-3.5 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-start gap-2.5">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200">
                How to use during real Tatkal booking:
              </span>{' '}
              Is web app ko samne laptop ya doosre phone par khol kar rakhein aur haath mein Mobile par{' '}
              <span className="text-emerald-300 font-semibold">RailOne App</span> rakhein. Subah{' '}
              <span className="font-mono text-slate-200">09:57:00 AM</span> (AC) ya{' '}
              <span className="font-mono text-slate-200">10:57:00 AM</span> (SL) par iske Atomic Clock
              audio cues ke saath follow karein.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-slate-400">
            <button
              onClick={() => setShowGuideBook(true)}
              className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" /> Open Guide Book
            </button>
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-emerald-400">
              IRCTC Compliant
            </span>
          </div>
        </footer>
      </main>

      {/* ============================================================
          INTERACTIVE IN-APP MASTER GUIDE BOOK MODAL
      ============================================================ */}
      {showGuideBook && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl xl:max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                    {guideLang === 'hi'
                      ? 'रेलवन तत्काल प्रो — संपूर्ण मार्गदर्शिका एवं रणनीतिक हैंडबुक'
                      : 'RailOne Tatkal Pro — Master Guide & Tactical Handbook'}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {guideLang === 'hi'
                      ? 'आधिकारिक संदर्भ, टाइमिंग गणित एवं 100% कानूनी मैन्युअल साथी'
                      : 'Official Reference, Timing Mathematics & 100% Legal Companion'}
                  </p>
                </div>
              </div>

              {/* Language Switcher & Close */}
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 shrink-0">
                  <button
                    onClick={() => setGuideLang('hi')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      guideLang === 'hi'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🇮🇳 हिंदी
                  </button>
                  <button
                    onClick={() => setGuideLang('en')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      guideLang === 'en'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🌐 English
                  </button>
                </div>

                <button
                  onClick={() => setShowGuideBook(false)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Chapter Selector + Content */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
              {/* Left Column: Chapter List */}
              <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/60 p-2 sm:p-3 overflow-y-auto max-h-[160px] md:max-h-none space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-2 block mb-1">
                  {guideLang === 'hi' ? 'अध्याय सूची' : 'Chapters'}
                </span>
                {GUIDE_BOOK_CHAPTERS.map((chap, idx) => (
                  <button
                    key={chap.id}
                    onClick={() => setActiveGuideChapter(idx)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between ${activeGuideChapter === idx
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">{chap.title[guideLang]}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                        {chap.subtitle[guideLang]}
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 ${activeGuideChapter === idx ? 'text-amber-400' : 'text-slate-600'
                        }`}
                    />
                  </button>
                ))}
              </div>

              {/* Right Column: Chapter Content Reader */}
              <div className="md:col-span-8 p-4 sm:p-6 overflow-y-auto max-h-[60vh] md:max-h-none space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {GUIDE_BOOK_CHAPTERS[activeGuideChapter].badge[guideLang]}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {guideLang === 'hi'
                        ? `अध्याय ${activeGuideChapter + 1} / ${GUIDE_BOOK_CHAPTERS.length}`
                        : `Chapter ${activeGuideChapter + 1} of ${GUIDE_BOOK_CHAPTERS.length}`}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {GUIDE_BOOK_CHAPTERS[activeGuideChapter].title[guideLang]}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {GUIDE_BOOK_CHAPTERS[activeGuideChapter].subtitle[guideLang]}
                  </p>
                </div>

                <div className="pt-1">
                  {GUIDE_BOOK_CHAPTERS[activeGuideChapter].content[guideLang]}
                </div>

                {/* Chapter Navigation Buttons */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    disabled={activeGuideChapter === 0}
                    onClick={() => setActiveGuideChapter((c) => Math.max(0, c - 1))}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-mono text-slate-300 border border-slate-700 cursor-pointer"
                  >
                    {guideLang === 'hi' ? '← पिछला अध्याय' : '← Previous'}
                  </button>
                  <button
                    disabled={activeGuideChapter === GUIDE_BOOK_CHAPTERS.length - 1}
                    onClick={() =>
                      setActiveGuideChapter((c) =>
                        Math.min(GUIDE_BOOK_CHAPTERS.length - 1, c + 1)
                      )
                    }
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-xs font-mono font-bold text-slate-950 cursor-pointer"
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
