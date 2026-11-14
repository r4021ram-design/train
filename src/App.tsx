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

// Popular Station Presets (Primary: Mumbai Hubs, Abu Road, Ahmedabad + Pan-India Hubs)
const POPULAR_STATIONS = [
  // Primary Mumbai Hubs
  { code: 'BDTS', name: 'Bandra Terminus (BDTS)' },
  { code: 'MMCT', name: 'Mumbai Central (MMCT / BCT)' },
  { code: 'CSMT', name: 'Mumbai CSMT' },
  { code: 'BVI', name: 'Borivali (BVI)' },
  { code: 'DDR', name: 'Dadar Western (DDR)' },
  { code: 'LTT', name: 'Lokmanya Tilak T (LTT)' },

  // Key Destination Hubs (Abu Road, Ahmedabad & Rajasthan/Gujarat Corridors)
  { code: 'ABR', name: 'Abu Road (ABR)' },
  { code: 'ADI', name: 'Ahmedabad Jn (ADI)' },
  { code: 'ST', name: 'Surat (ST)' },
  { code: 'BRC', name: 'Vadodara Jn (BRC)' },
  { code: 'FA', name: 'Falna (FA)' },
  { code: 'MJ', name: 'Marwar Jn (MJ)' },
  { code: 'JU', name: 'Jodhpur Jn (JU)' },
  { code: 'JP', name: 'Jaipur Jn (JP)' },
  { code: 'AII', name: 'Ajmer Jn (AII)' },

  // Pan-India Major Junctions
  { code: 'NDLS', name: 'New Delhi (NDLS)' },
  { code: 'PUNE', name: 'Pune Jn (PUNE)' },
  { code: 'HWH', name: 'Howrah Jn (HWH)' },
  { code: 'SBC', name: 'KSR Bengaluru (SBC)' },
  { code: 'MAS', name: 'MGR Chennai Central (MAS)' },
  { code: 'PNBE', name: 'Patna Jn (PNBE)' },
  { code: 'BSB', name: 'Varanasi Jn (BSB)' },
  { code: 'GKP', name: 'Gorakhpur Jn (GKP)' }
];

export interface TrainDirectoryItem {
  number: string;
  name: string;
  from: string;
  to: string;
  defaultClass: string;
}

// Master Train Directory (Primary Mumbai ➔ Abu Road / Ahmedabad + Pan-India)
const POPULAR_TRAINS: TrainDirectoryItem[] = [
  // Mumbai ➔ Abu Road (ABR)
  { number: '12480', name: '12480 - Suryanagari Superfast Express (BDTS ➔ ABR ➔ JU)', from: 'BDTS', to: 'ABR', defaultClass: '3A' },
  { number: '14702', name: '14702 - Amrapur Aravali Express (BDTS ➔ ABR ➔ SGNR)', from: 'BDTS', to: 'ABR', defaultClass: '3A' },
  { number: '12979', name: '12979 - Bandra Jaipur Superfast Express (BDTS ➔ ABR ➔ JP)', from: 'BDTS', to: 'ABR', defaultClass: '3A' },
  { number: '12216', name: '12216 - Bandra DEE Garib Rath Express (BDTS ➔ ABR)', from: 'BDTS', to: 'ABR', defaultClass: '3A' },
  { number: '22915', name: '22915 - Bandra Terminus Hisar SF Express (BDTS ➔ ABR)', from: 'BDTS', to: 'ABR', defaultClass: '3A' },
  { number: '20943', name: '20943 - Bandra Bhagat Ki Kothi Humsafar (BDTS ➔ ABR)', from: 'BDTS', to: 'ABR', defaultClass: '3A' },
  { number: '12957', name: '12957 - Swarna Jayanti Rajdhani Express (MMCT ➔ ABR)', from: 'MMCT', to: 'ABR', defaultClass: '3A' },
  { number: '19031', name: '19031 - Yoga Express (ADI / BDTS ➔ ABR)', from: 'BDTS', to: 'ABR', defaultClass: 'SL' },

  // Mumbai ➔ Ahmedabad (ADI)
  { number: '20901', name: '20901 - Mumbai Central Vande Bharat Express (MMCT ➔ ADI)', from: 'MMCT', to: 'ADI', defaultClass: 'CC' },
  { number: '12009', name: '12009 - Mumbai Central Ahmedabad Shatabdi Express (MMCT ➔ ADI)', from: 'MMCT', to: 'ADI', defaultClass: 'CC' },
  { number: '12933', name: '12933 - Karnavati Express (MMCT ➔ ADI)', from: 'MMCT', to: 'ADI', defaultClass: 'CC' },
  { number: '12901', name: '12901 - Gujarat Mail (MMCT ➔ ADI)', from: 'MMCT', to: 'ADI', defaultClass: '3A' },
  { number: '22953', name: '22953 - Gujarat Superfast Express (MMCT ➔ ADI)', from: 'MMCT', to: 'ADI', defaultClass: 'CC' },
  { number: '12971', name: '12971 - Bandra Bhavnagar Superfast (BDTS ➔ ADI)', from: 'BDTS', to: 'ADI', defaultClass: '3A' },
  { number: '22927', name: '22927 - Lokshakti Express (BDTS ➔ ADI)', from: 'BDTS', to: 'ADI', defaultClass: 'SL' },

  // Pan-India Major Routes
  { number: '12951', name: '12951 - Tejas Rajdhani Express (MMCT ➔ NDLS)', from: 'MMCT', to: 'NDLS', defaultClass: '3A' },
  { number: '12953', name: '12953 - August Kranti Tejas Rajdhani (MMCT ➔ NZM)', from: 'MMCT', to: 'NDLS', defaultClass: '3A' },
  { number: '12302', name: '12302 - Howrah Rajdhani Express (NDLS ➔ HWH)', from: 'NDLS', to: 'HWH', defaultClass: '3A' },
  { number: '12123', name: '12123 - Deccan Queen Express (CSMT ➔ PUNE)', from: 'CSMT', to: 'PUNE', defaultClass: 'CC' },
  { number: '12008', name: '12008 - Mysuru Chennai Shatabdi (SBC ➔ MAS)', from: 'SBC', to: 'MAS', defaultClass: 'CC' }
];

export interface RoutePreset {
  label: string;
  category: 'abu' | 'adi' | 'other';
  from: string;
  to: string;
  train: string;
  defaultClass?: string;
}

const ROUTE_PRESETS: RoutePreset[] = [
  // Primary: Mumbai -> Abu Road (Default)
  { label: 'BDTS ⇄ ABR (Suryanagari)', category: 'abu', from: 'BDTS', to: 'ABR', train: '12480 - Suryanagari Superfast Express', defaultClass: '3A' },
  { label: 'BDTS ⇄ ABR (Aravali)', category: 'abu', from: 'BDTS', to: 'ABR', train: '14702 - Amrapur Aravali Express', defaultClass: '3A' },
  { label: 'BDTS ⇄ ABR (Garib Rath)', category: 'abu', from: 'BDTS', to: 'ABR', train: '12216 - Bandra DEE Garib Rath Express', defaultClass: '3A' },

  // Primary: Mumbai -> Ahmedabad
  { label: 'MMCT ⇄ ADI (Vande Bharat)', category: 'adi', from: 'MMCT', to: 'ADI', train: '20901 - Mumbai Central Vande Bharat Express', defaultClass: 'CC' },
  { label: 'MMCT ⇄ ADI (Shatabdi)', category: 'adi', from: 'MMCT', to: 'ADI', train: '12009 - Mumbai Central Ahmedabad Shatabdi Express', defaultClass: 'CC' },
  { label: 'MMCT ⇄ ADI (Karnavati)', category: 'adi', from: 'MMCT', to: 'ADI', train: '12933 - Karnavati Express', defaultClass: 'CC' },

  // Other Major Routes (Pan-India)
  { label: 'CSMT ⇄ NDLS (Rajdhani)', category: 'other', from: 'CSMT', to: 'NDLS', train: '12951 - Tejas Rajdhani Express', defaultClass: '3A' },
  { label: 'NDLS ⇄ HWH (Rajdhani)', category: 'other', from: 'NDLS', to: 'HWH', train: '12302 - Howrah Rajdhani', defaultClass: '3A' },
  { label: 'CSMT ⇄ PUNE (Deccan Queen)', category: 'other', from: 'CSMT', to: 'PUNE', train: '12123 - Deccan Queen', defaultClass: 'CC' }
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
    id: 'overview-purpose',
    badge: { hi: 'ऐप परिचय व ज़रूरत', en: 'Core Purpose & Vision' },
    title: { hi: '१. यह ऐप क्यों ज़रूरी है और क्या काम करती है?', en: '1. Why This App Exists & What It Solves' },
    subtitle: {
      hi: 'समस्याएं, 4 बड़े फायदे, कानूनी सुरक्षा और फॉर्मूला-1 कोच सिद्धांत',
      en: 'The 4 Real Tatkal Traps, Key Benefits, Legal Safety & F1 Co-Pilot Role'
    },
    content: {
      hi: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {/* Section 1: Problem Kya Hoti Hai */}
          <div className="p-3.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
            <h4 className="font-semibold text-rose-900 dark:text-rose-200 flex items-center gap-1.5 text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              यह ऐप क्यों ज़रूरी है? (बुकिंग में असल समस्या क्या होती है?)
            </h4>
            <p className="text-xs text-rose-900/90 dark:text-rose-300/90">
              तत्काल टिकट <strong>30 से 60 सेकंड</strong> के अंदर समाप्त हो जाती हैं। आम यात्री इन 4 गलतियों के कारण सीटें गंवा बैठते हैं:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-rose-900/90 dark:text-rose-300/90">
              <li><strong>घड़ी का टाइम मिसमैच:</strong> मोबाइल की सामान्य घड़ी 2-3 सेकंड आगे-पीछे होती है। गलत समय पर क्लिक करने से या तो एरर आ जाता है या 5000 लोग आगे निकल जाते हैं।</li>
              <li><strong>हाथ से टाइपिंग में बर्बादी:</strong> यात्री का नाम, उम्र और लिंग टाइप करने में 20-25 सेकंड निकल जाते हैं।</li>
              <li><strong>ऐप क्रैश और रीलोड:</strong> उसी फोन में UPI या बैंकिंग ऐप खोलते ही बैकग्राउंड में बुकिंग ऐप रीफ्रेश हो जाती है और सत्र समाप्त हो जाता है।</li>
              <li><strong>मल्टी-डे तारीख भ्रम:</strong> अगर ट्रेन 1 या 2 दिन पहले किसी दूर के स्टेशन से चली हो, तो गलत तारीख पर तत्काल का इंतज़ार करने से सीट पहले ही बुक हो जाती है।</li>
            </ul>
          </div>

          {/* Section 2: Main 4 Fayde */}
          <div className="space-y-2">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              यह ऐप कैसे मदद करती है? (मुख्य ४ बड़े फायदे)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <span className="font-medium text-blue-600 dark:text-blue-400 block mb-1">१. सटीक रेलवे घड़ी (IST Clock)</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">आईआरसीटीसी सर्वर के साथ मिलीसेकंड तक सिंक्रनाइज़्ड घड़ी और ठीक सेकंड पर ऑडियो बीप अलर्ट।</p>
              </div>
              <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <span className="font-medium text-blue-600 dark:text-blue-400 block mb-1">२. १-क्लिक स्पीड वॉल्ट (क्लिपबोर्ड)</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">एक क्लिक में नाम और यूपीआई आईडी कॉपी। टाइपिंग का झंझट और स्पेलिंग की गलती हमेशा के लिए खत्म।</p>
              </div>
              <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <span className="font-medium text-blue-600 dark:text-blue-400 block mb-1">३. मल्टी-डे तत्काल कैलकुलेटर</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">मुंबई, आबूरोड, अहमदाबाद या अन्य रूट डालते ही सही बुकिंग दिन और खुलने का समय सेकंडों में निकालता है।</p>
              </div>
              <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <span className="font-medium text-blue-600 dark:text-blue-400 block mb-1">४. चेकआउट रिफ्लेक्स ड्रिल (अभ्यास)</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">१० बजे तत्काल खुलने से पहले ४-क्लिक बुकिंग की उंगली स्पीड टेस्ट करने का सिम्युलेटर।</p>
              </div>
            </div>
          </div>

          {/* Section 3: Direct Booking Kyu Nahi & F1 Coach */}
          <div className="p-3.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 text-sm">
              सीधे बुकिंग क्यों नहीं होती? और फिर इस ऐप का क्या काम है?
            </h4>
            <p className="text-xs text-blue-900/90 dark:text-blue-300/90">
              <strong>कानूनी सच्चाई (रेलवे अधिनियम धारा 143):</strong> किसी भी बाहरी ऐप या बॉट द्वारा आईआरसीटीसी में अनधिकृत तरीके से ऑटो-बुकिंग करना गैर-जमानती अपराध है जिससे खाता हमेशा के लिए ब्लॉक हो जाता है। इसके अलावा बैंक OTP और Captcha सुरक्षा के लिए आधिकारिक ऐप में ही डाले जाने चाहिए।
            </p>
            <div className="p-2.5 rounded-md bg-white dark:bg-zinc-900/80 border border-blue-200/80 dark:border-blue-800/80 text-xs">
              <strong>फॉर्मूला-1 कार और कोच का उदाहरण:</strong> जैसे रेस में कार ड्राइवर खुद चलाता है लेकिन रेडियो पर बैठा कोच बताता है कि कब टर्न लेना है और कब एक्सीलरेटर दबाना है — ठीक वैसे ही <strong>बुकिंग आप अपने आधिकारिक ऐप पर ही करते हैं</strong>, और यह ऐप आपका डिजिटल कोच बनकर सटीक सेकंड पर आपसे सही बटन दबवाती है!
            </div>
          </div>
        </div>
      ),
      en: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <div className="p-3.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
            <h4 className="font-semibold text-rose-900 dark:text-rose-200 text-sm">
              Why This App Exists (The Real Ground Problems)
            </h4>
            <p className="text-xs">Tatkal quotas evaporate in 30-60 seconds. Passengers fail due to 4 critical pitfalls:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Clock Skew:</strong> Phone clocks drift by 2-3 seconds, causing premature lockouts or landing behind 5,000 queue entrants.</li>
              <li><strong>Typing Lag:</strong> Manually typing passenger details burns 20-25 vital seconds.</li>
              <li><strong>RAM Crash on Payment:</strong> Switching to a banking app on the same phone kills the booking app session.</li>
              <li><strong>Multi-Day Trap:</strong> Booking dates are miscalculated when trains originate 1-2 days earlier from distant terminals.</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <span className="font-medium text-blue-600 dark:text-blue-400 block mb-1">1. Atomic IST Clock</span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">IRCTC server-aligned millisecond clock with tactical audio chimes.</p>
            </div>
            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <span className="font-medium text-blue-600 dark:text-blue-400 block mb-1">2. 1-Tap Speed Vault</span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Instant clipboard triggers for passengers and UPI ID without typing.</p>
            </div>
            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <span className="font-medium text-blue-600 dark:text-blue-400 block mb-1">3. Multi-Day Calculator</span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Accurate opening calendar for Mumbai, Abu Road, Ahmedabad & all routes.</p>
            </div>
            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <span className="font-medium text-blue-600 dark:text-blue-400 block mb-1">4. Reflex Muscle Drill</span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Pre-game practice simulator to train finger reaction time under pressure.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 text-xs">
            <strong>Why Not Direct Booking?</strong> Section 143 of the Railways Act strictly prohibits unauthorized automated bots (punishable by up to 3 years imprisonment). RailOne Tatkal Pro is a 100% legal, side-by-side co-pilot that keeps your account safe while giving you elite timing and speed advantages.
          </div>
        </div>
      )
    }
  },
  {
    id: 'master-list-glitch',
    badge: { hi: 'मास्टर लिस्ट व फॉलबैक', en: 'Master List & Fallback' },
    title: { hi: '२. मास्टर लिस्ट का "ग्लिच ट्रैप" एवं स्पीड वॉल्ट', en: '2. Master List Glitch Trap & Speed Vault' },
    subtitle: {
      hi: 'सर्वर लोड के समय मास्टर लिस्ट अटकने पर 1-टैप वॉल्ट कैसे टिकट बचाता है',
      en: 'How the 1-Tap Vault rescues your reservation when IRCTC master list freezes'
    },
    content: {
      hi: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <div className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 space-y-1.5">
            <h4 className="font-semibold text-sm">मास्टर लिस्ट का "ग्लिच ट्रैप" क्या है?</h4>
            <p className="text-xs">
              सुबह ठीक <strong>10:00:00 AM</strong> पर लाखों लोग एक साथ लॉग इन करते हैं। अत्यधिक ट्रैफिक के कारण कई बार आईआरसीटीसी / रेलवन ऐप में <strong>मास्टर लिस्ट लोड ही नहीं होती</strong> और गोल-गोल चक्का घूमता रहता है।
            </p>
            <p className="text-xs">
              ऐसे समय यात्री घबरा जाते हैं और हाथ से नाम-उम्र टाइप करने लगते हैं, जिसमें 25 सेकंड चले जाते हैं और सारी तत्काल सीटें खत्म हो जाती हैं।
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              कमांड सेंटर का स्पीड वॉल्ट (Speed Vault) क्यों दिया गया है?
            </h4>
            <p className="text-xs">
              यह वॉल्ट आपका <strong>प्लान-बी (Emergency Insurance)</strong> है। यदि रेलवन में मास्टर लिस्ट लोड नहीं हुई, तो आपको घबराना नहीं है:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <li>स्क्रीन पर सामने दिए गए <strong>"Copy Name"</strong> बटन पर 1 टैप करें।</li>
              <li>मोबाइल ऐप में नाम बॉक्स में पेस्ट करें, उम्र डालें और जेंडर चुनें (सिर्फ 3 सेकंड!)।</li>
              <li>बर्थ प्राथमिकता हमेशा <strong>'No Choice / Any'</strong> रखें ताकि सिस्टम बिना देरी के सीट लॉक कर दे।</li>
            </ol>
          </div>
        </div>
      ),
      en: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <div className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 space-y-1">
            <h4 className="font-semibold text-sm">The Master List "Glitch Trap"</h4>
            <p className="text-xs">
              At 10:00:00 AM, server traffic surges cause frequent timeouts when fetching the saved profile master list. Frantically typing names manually costs 20+ seconds and forfeits confirm berths.
            </p>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            The Speed Vault is your bulletproof fallback. 1-click clipboard triggers deliver passenger names in under 2 seconds directly to your input fields.
          </p>
        </div>
      )
    }
  },
  {
    id: 'wallet-vs-upi',
    badge: { hi: 'भुगतान तुलना', en: 'Payment Showdown' },
    title: { hi: '३. वॉलेट बनाम यूपीआई — कौन सा सबसे तेज़ है?', en: '3. Wallet vs UPI: Which is Truly Faster?' },
    subtitle: {
      hi: 'एसएमएस ओटीपी की रुकावट बनाम दो-फोन यूपीआई की 3-सेकंड जीत',
      en: 'SMS OTP latency bottleneck vs Dual-Phone Instant Push Approval'
    },
    content: {
      hi: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <p>
            तत्काल में 70% यात्री केवल भुगतान (Payment) पेज पर समय गंवाने के कारण वेटिंग लिस्ट में चले जाते हैं। आइए दोनों विकल्पों की जमीनी सच्चाई समझें:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-2">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                विकल्प १: आईआरसीटीसी ई-वॉलेट (eWallet)
              </span>
              <p className="text-zinc-600 dark:text-zinc-400">
                वॉलेट तेज़ तो है, लेकिन भुगतान करते समय यह <strong>SMS OTP</strong> मांगता है। 10:00 AM पर टेलीकॉम कंपनियों पर भारी लोड होने के कारण ओटीपी आने में कभी-कभी 30 से 50 सेकंड की देरी हो जाती है।
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
              <span className="font-semibold text-blue-900 dark:text-blue-200 block">
                विकल्प २: दो-फोन यूपीआई (Dual-Phone UPI) — प्रो विजेता
              </span>
              <p className="text-blue-900/90 dark:text-blue-300/90">
                दूसरे फोन में GPay / PhonePe खोलकर रखें। हमारे वॉल्ट से 1-क्लिक में UPI ID पेस्ट करें। दूसरे फोन पर <strong>तुरंत पुश नोटिफिकेशन</strong> आता है और बिना किसी SMS OTP के पिन डालते ही 3 सेकंड में पेमेंट पास हो जाता है!
              </p>
            </div>
          </div>
        </div>
      ),
      en: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">IRCTC eWallet</span>
              <p className="text-zinc-600 dark:text-zinc-400">Requires SMS OTP. Carrier congestion at 10:00 AM often delays SMS delivery by 30-45 seconds.</p>
            </div>
            <div className="p-3.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-1">
              <span className="font-semibold text-blue-900 dark:text-blue-200 block">Dual-Phone UPI (Winning Method)</span>
              <p className="text-blue-900/90 dark:text-blue-300/90">Bypasses SMS entirely. Instant app push notification on the secondary device allows 3-second instant PIN authorization.</p>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: 'strike-timing',
    badge: { hi: 'सबसे बड़ा रहस्य', en: 'Timing Secret' },
    title: { hi: '४. "T-3s स्ट्राइक टाइमिंग" — ठीक १०:००:०० का राज', en: '4. The T-3s Strike Secret: Winning at 10:00:00' },
    subtitle: {
      hi: '१ सेकंड पहले क्लिक करने की गलती और नेटवर्क लेटेंसी का गणित',
      en: 'The 1-second early lockout penalty and network packet travel physics'
    },
    content: {
      hi: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <p>
            भले ही आपके पास मास्टर लिस्ट और वॉलेट दोनों तैयार हों, अगर आपकी टाइमिंग गलत है तो सीट कभी नहीं मिलेगी:
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200">
              <strong>१ सेकंड पहले क्लिक करने का नुकसान (09:59:59 AM):</strong> रेलवन ऐप स्क्रीन पर लाल रंग में एरर देगा: <em>"Tatkal booking not started yet"</em>. आपको पीछे जाकर दोबारा ट्रेन खोजनी पड़ेगी और 12 सेकंड बर्बाद हो जाएंगे।
            </div>
            <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200">
              <strong>२ सेकंड लेट क्लिक करने का नुकसान (10:00:02 AM):</strong> देश भर के 5,000 लोग आपसे आगे निकल जाएंगे और आपका नंबर वेटिंग लिस्ट में चला जाएगा।
            </div>
            <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200">
              <strong>T-3s स्ट्राइक फॉर्मूला (09:59:58 AM):</strong> मोबाइल से रेलवे सर्वर तक सिग्नल पहुंचने में 0.5 से 1.5 सेकंड की नेटवर्क लेटेंसी लगती है। जब हमारा टाइमर <strong>T - 00:03s</strong> पर बीप बजाता है, तभी आपको क्लिक करना है — आपकी रिक्वेस्ट ठीक <strong>10:00:00.05 AM</strong> पर सर्वर गेट खुलते ही सबसे पहले अंदर घुसेगी!
            </div>
          </div>
        </div>
      ),
      en: (
        <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <p>Timing precision separates confirmed tickets from waiting list rejections:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li><strong>1s Early (09:59:59 AM):</strong> Triggers "Tatkal not started" rejection, forcing an agonizing 10-second re-search.</li>
            <li><strong>2s Late (10:00:02 AM):</strong> Lands behind 5,000 concurrent queue requests.</li>
            <li><strong>The T-3s Rule (09:59:58 AM):</strong> Tap on the Strike audio chime. Network transit time guarantees your packet hits the server at 10:00:00.05 sharp.</li>
          </ul>
        </div>
      )
    }
  },
  {
    id: 'live-day-protocol',
    badge: { hi: 'एक्शन प्लान', en: 'Action Plan' },
    title: { hi: '५. रियल बुकिंग के दिन कैसे इस्तेमाल करें? (४ आसान स्टेप)', en: '5. Real Booking Day Operational Protocol' },
    subtitle: {
      hi: 'सुबह ०९:४५ से १०:००:१५ AM तक मिनट-दर-मिनट गाइड',
      en: 'Minute-by-minute execution roadmap from 09:45 AM to 10:00:15 AM'
    },
    content: {
      hi: (
        <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
            <strong className="text-zinc-900 dark:text-zinc-200 font-mono block mb-0.5">स्टेप १ — सुबह ०९:४५ AM (तैयारी):</strong>
            लैपटॉप या टैबलेट पर यह ऐप खोलकर सामने रख लें। स्पीड वॉल्ट में अपना UPI ID और यात्रियों के नाम सेव कर लें। दूसरा फोन अनलॉक करके रखें।
          </div>
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
            <strong className="text-zinc-900 dark:text-zinc-200 font-mono block mb-0.5">स्टेप २ — सुबह ०९:५७ AM (लॉगिन):</strong>
            हाथ वाले मुख्य फोन में रेलवन ऐप में बायोमेट्रिक / पिन से लॉगिन करें। From-To स्टेशन, तारीख और कोटा में <strong>TATKAL</strong> चुनकर ट्रेन लिस्ट पर रुकें।
          </div>
          <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200">
            <strong className="font-mono block mb-0.5">स्टेप ३ — सुबह ०९:५९:५७ AM (T-3s स्ट्राइक):</strong>
            सामने लैपटॉप स्क्रीन देखें। जैसे ही T-Minus टाइमर <strong>"T - 00:03s"</strong> पर आकर बीप करे, मोबाइल में अपनी ट्रेन क्लास (3A / SL) पर तुरंत टैप कर दें!
          </div>
          <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200">
            <strong className="font-mono block mb-0.5">स्टेप ४ — सुबह १०:००:१५ AM (फास्ट चेकआउट):</strong>
            मास्टर लिस्ट से यात्री चुनें (अटकने पर वॉल्ट से पेस्ट करें)। UPI में 1-क्लिक कॉपी आईडी पेस्ट करें और दूसरे फोन पर पिन डालकर अप्रूव करें — <strong>कन्फर्म टिकट डन!</strong>
          </div>
        </div>
      ),
      en: (
        <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
            <strong className="text-zinc-900 dark:text-zinc-200 font-mono block mb-0.5">Step 1 — 09:45 AM (Setup):</strong> Open this web app on laptop. Fill Speed Vault with UPI and passenger data. Keep Phone 2 unlocked.
          </div>
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
            <strong className="text-zinc-900 dark:text-zinc-200 font-mono block mb-0.5">Step 2 — 09:57 AM (Login):</strong> Login to RailOne on primary phone. Search route with Quota: TATKAL and hold on train list.
          </div>
          <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200">
            <strong className="font-mono block mb-0.5">Step 3 — 09:59:58 AM (Strike):</strong> Watch laptop T-Minus. When Strike chime fires at T-3s, tap train class instantly.
          </div>
          <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200">
            <strong className="font-mono block mb-0.5">Step 4 — 10:00:15 AM (Instant Checkout):</strong> Pick Master List, paste 1-tap UPI ID, and approve collect request on Phone 2 — Confirmed ticket booked!
          </div>
        </div>
      )
    }
  },
  {
    id: 'origin-trap-rules',
    badge: { hi: 'महत्वपूर्ण गणित', en: 'Critical Math' },
    title: { hi: '६. तत्काल समय, कोटा एवं मल्टी-डे ट्रेन जाल', en: '6. Tatkal Timings, Quotas & Multi-Day Trap' },
    subtitle: {
      hi: 'एसी बनाम नॉन-एसी नियम एवं लंबी दूरी की ट्रेनों का तारीख गणित',
      en: 'AC vs Non-AC Rules and Multi-Day originating station calendars'
    },
    content: {
      hi: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <span className="font-medium text-blue-600 dark:text-blue-400 block mb-1">एसी (AC) तत्काल</span>
              <p className="text-zinc-600 dark:text-zinc-400">खुलने का समय: <strong>सुबह १०:००:०० AM</strong> (क्लास: 2A, 3A, 3E, CC, EC, 1A)</p>
            </div>
            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <span className="font-medium text-amber-600 dark:text-amber-400 block mb-1">नॉन-एसी (Non-AC) तत्काल</span>
              <p className="text-zinc-600 dark:text-zinc-400">खुलने का समय: <strong>सुबह ११:००:०० AM</strong> (क्लास: Sleeper एवं 2S)</p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 text-xs space-y-1">
            <strong>मल्टी-डे ओरिजिन नियम:</strong> तत्काल कोटा यात्रा के प्रारंभिक स्टेशन (Origin) से 1 दिन पहले खुलता है। यदि ट्रेन आपके स्टेशन पहुंचने से 1 दिन पहले किसी दूसरे शहर से चली है, तो तत्काल उसी अनुपात में 1 या 2 दिन पहले खुलेगा। ऊपर कैलकुलेटर में 'Day 2' या 'Day 3' चुनकर इसकी सही तारीख जांचें।
          </div>
        </div>
      ),
      en: (
        <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <p className="text-xs">AC opens at 10:00:00 AM IST; Non-AC (SL/2S) opens at 11:00:00 AM IST.</p>
          <div className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 text-xs">
            <strong>Multi-Day Trap:</strong> Tatkal always opens 1 day prior to the train departure from its Origin station, regardless of where you board along the route.
          </div>
        </div>
      )
    }
  },
  {
    id: 'winning-formula-summary',
    badge: { hi: 'जीतने का फॉर्मूला', en: 'Winning Formula' },
    title: { hi: '७. सारांश — तत्काल जीतने का अचूक फॉर्मूला', en: '7. Summary: The Tatkal Winning Formula' },
    subtitle: {
      hi: 'आपका काम बनाम इस ऐप का काम और १००% सुरक्षित रहने का नियम',
      en: 'Your Role vs App Role & 100% Account Safety Rules'
    },
    content: {
      hi: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
                <tr>
                  <th className="p-2.5">ज़िम्मेदारी</th>
                  <th className="p-2.5">कहाँ होगी?</th>
                  <th className="p-2.5">कौन करेगा?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-400">
                <tr>
                  <td className="p-2.5 font-medium text-zinc-900 dark:text-zinc-200">टिकट बुकिंग, कैप्चा व पेमेंट</td>
                  <td className="p-2.5">आधिकारिक RailOne / IRCTC ऐप</td>
                  <td className="p-2.5 text-blue-600 dark:text-blue-400 font-medium">आप खुद (100% कानूनी)</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-zinc-900 dark:text-zinc-200">सटीक रेलवे सर्वर टाइमिंग</td>
                  <td className="p-2.5">Tatkal Pro स्क्रीन (लैपटॉप)</td>
                  <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-medium">Atomic Clock Engine</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-zinc-900 dark:text-zinc-200">T-3s स्ट्राइक बीप (क्लिक का सही क्षण)</td>
                  <td className="p-2.5">Tatkal Pro ऑडियो इंजन</td>
                  <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-medium">Tactical Chime</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-zinc-900 dark:text-zinc-200">इमरजेंसी 1-क्लिक नाम व UPI कॉपी</td>
                  <td className="p-2.5">Tatkal Pro स्पीड वॉल्ट</td>
                  <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-medium">Speed Vault</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 text-xs space-y-1">
            <strong className="text-zinc-900 dark:text-zinc-100">३ सुनहरे सुरक्षा नियम:</strong>
            <p>१. कभी भी किसी एजेंट को अपना पासवर्ड न दें और न ही कोई अवैध ऑटो-बुकिंग एक्सटेंशन लगाएं।</p>
            <p>२. हमेशा "Book only if confirm berths are allotted" टिक रखें ताकि वेटिंग लिस्ट टिकट न बने।</p>
            <p>३. इस साथी ऐप के साथ आप बिना ₹1000 दलाली दिए खुद 40 सेकंड में कन्फर्म तत्काल निकाल सकते हैं!</p>
          </div>
        </div>
      ),
      en: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <tr>
                  <th className="p-2">Task</th>
                  <th className="p-2">Where?</th>
                  <th className="p-2">Executor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-400">
                <tr>
                  <td className="p-2 font-medium">Real Booking & OTP</td>
                  <td className="p-2">Official RailOne App</td>
                  <td className="p-2 text-blue-500 font-medium">You (100% Legal)</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Atomic Microsecond Clock</td>
                  <td className="p-2">Tatkal Pro Screen</td>
                  <td className="p-2 text-emerald-500 font-medium">Atomic Engine</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">T-3s Strike Audio Cues</td>
                  <td className="p-2">Tatkal Pro Sound</td>
                  <td className="p-2 text-emerald-500 font-medium">Tactical Audio</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">1-Click Fallback Vault</td>
                  <td className="p-2">Tatkal Pro Vault</td>
                  <td className="p-2 text-emerald-500 font-medium">Speed Vault</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500">
            Follow the 4-step protocol and bypass agent fees permanently with 100% account compliance.
          </p>
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

  const [fromStn, setFromStn] = useState<string>('BDTS');
  const [toStn, setToStn] = useState<string>('ABR');
  const [trainInfo, setTrainInfo] = useState<string>('12480 - Suryanagari Superfast Express');
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

  const handleTrainInputChange = (val: string) => {
    setTrainInfo(val);
    const trimmed = val.trim();
    const matched = POPULAR_TRAINS.find(
      (t) => t.name.toLowerCase() === val.toLowerCase() || t.number === trimmed
    );
    if (matched) {
      setFromStn(matched.from);
      setToStn(matched.to);
      if (matched.defaultClass && CLASS_RULES[matched.defaultClass]) {
        handleClassChange(matched.defaultClass);
      }
    }
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
          <div className={`flex items-center justify-between md:justify-center gap-3 sm:gap-5 px-3.5 py-1.5 rounded-lg border transition-colors ${isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-100/90 border-zinc-200'
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

                  {/* Categorized Route Presets (Mumbai ➔ Abu Road & Ahmedabad Default + All Others) */}
                  <div className="space-y-1.5 mt-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-zinc-500 font-medium">Quick Route Presets:</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        Focus: Mumbai ➔ Abu Road & Ahmedabad
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Group 1: Mumbai -> Abu Road */}
                      <div className="flex flex-wrap items-center gap-1 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-md p-1">
                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 px-1">
                          ABR:
                        </span>
                        {ROUTE_PRESETS.filter((p) => p.category === 'abu').map((p) => {
                          const isSelected = fromStn === p.from && toStn === p.to && (trainInfo.includes(p.label.split('(')[1]?.replace(')', '') || '') || trainInfo.startsWith(p.train.split(' ')[0]));
                          return (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => applyRoutePreset(p)}
                              className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors cursor-pointer ${isSelected
                                  ? 'bg-amber-600 text-white border-amber-600 font-medium shadow-xs'
                                  : isDark
                                    ? 'bg-[#1E2026] border-zinc-800 text-zinc-300 hover:text-white hover:border-amber-500/60'
                                    : 'bg-white border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:border-amber-500/60'
                                }`}
                              title={`Click to fill ${p.label} (${p.train})`}
                            >
                              {p.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Group 2: Mumbai -> Ahmedabad */}
                      <div className="flex flex-wrap items-center gap-1 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/30 rounded-md p-1">
                        <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 px-1">
                          ADI:
                        </span>
                        {ROUTE_PRESETS.filter((p) => p.category === 'adi').map((p) => {
                          const isSelected = fromStn === p.from && toStn === p.to && (trainInfo.includes(p.label.split('(')[1]?.replace(')', '') || '') || trainInfo.startsWith(p.train.split(' ')[0]));
                          return (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => applyRoutePreset(p)}
                              className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors cursor-pointer ${isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 font-medium shadow-xs'
                                  : isDark
                                    ? 'bg-[#1E2026] border-zinc-800 text-zinc-300 hover:text-white hover:border-blue-500/60'
                                    : 'bg-white border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:border-blue-500/60'
                                }`}
                              title={`Click to fill ${p.label} (${p.train})`}
                            >
                              {p.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Group 3: Other Pan-India Corridors */}
                      <div className="flex flex-wrap items-center gap-1">
                        {ROUTE_PRESETS.filter((p) => p.category === 'other').map((p) => {
                          const isSelected = fromStn === p.from && toStn === p.to;
                          return (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => applyRoutePreset(p)}
                              className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors cursor-pointer ${isSelected
                                  ? 'bg-zinc-800 text-white border-zinc-700 dark:bg-zinc-700 font-medium'
                                  : isDark
                                    ? 'bg-[#181A20] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
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
                      list="trains-directory"
                      value={trainInfo}
                      onChange={(e) => handleTrainInputChange(e.target.value)}
                      placeholder="e.g. 12480 - Suryanagari or 20901 - Vande Bharat"
                      className={`w-full rounded-lg border px-3 py-2 text-xs font-sans outline-none transition-colors ${isDark
                        ? 'bg-[#1E2026] border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-blue-500'
                        : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-blue-600'
                        }`}
                    />
                    <datalist id="trains-directory">
                      {POPULAR_TRAINS.map((t) => (
                        <option key={t.number} value={t.name}>
                          {t.from} ➔ {t.to} ({CLASS_RULES[t.defaultClass]?.name || t.defaultClass})
                        </option>
                      ))}
                    </datalist>
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
                        className={`flex flex-wrap sm:flex-nowrap items-center gap-2 p-1.5 sm:p-2 rounded-lg border transition-colors ${isDark ? 'bg-[#181A20] border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'
                          }`}
                      >
                        {/* #1 Badge */}
                        <span
                          className={`text-[11px] font-mono px-2 py-1 rounded font-semibold shrink-0 ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-700'
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
                          className={`flex-1 min-w-[140px] rounded-md border px-2.5 py-1.5 text-xs font-sans outline-none ${isDark
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
                          className={`w-16 sm:w-20 font-mono rounded-md border px-2 py-1.5 text-xs outline-none ${isDark
                              ? 'bg-[#1E2026] border-zinc-800 text-zinc-100 focus:border-blue-500'
                              : 'bg-white border-zinc-200 text-zinc-900 focus:border-blue-600'
                            }`}
                        />

                        {/* Gender Select (w-24 sm:w-28) */}
                        <select
                          value={p.gender}
                          onChange={(e) => updatePassenger(p.id, 'gender', e.target.value)}
                          className={`w-24 sm:w-28 rounded-md border px-2 py-1.5 text-xs font-sans outline-none cursor-pointer ${isDark
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
                          className={`w-24 sm:w-32 rounded-md border px-2 py-1.5 text-xs font-sans outline-none cursor-pointer ${isDark
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
                          className={`px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors shrink-0 ${copiedKey === `PAX_NAME_${p.id}`
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
                      className={`w-full py-1.5 rounded-lg border border-dashed text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${isDark
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
