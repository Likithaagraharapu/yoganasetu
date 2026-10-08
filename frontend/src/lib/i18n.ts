// ─── Language Registry ────────────────────────────────────────────────────────
export const LANGUAGES = [
  { code: 'en', name: 'English',   nativeName: 'English' },
  { code: 'hi', name: 'Hindi',     nativeName: 'हिन्दी'   },
  { code: 'te', name: 'Telugu',    nativeName: 'తెలుగు'  },
  { code: 'ta', name: 'Tamil',     nativeName: 'தமிழ்'   },
  { code: 'kn', name: 'Kannada',   nativeName: 'ಕನ್ನಡ'   },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം'  },
  { code: 'bn', name: 'Bengali',   nativeName: 'বাংলা'   },
  { code: 'mr', name: 'Marathi',   nativeName: 'मराठी'   },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

export const DEFAULT_LANG: LanguageCode = 'en';

// ─── Translation Key Registry ─────────────────────────────────────────────────
// Add new keys here as the app grows; English is the source of truth.
type TranslationMap = {
  // Nav
  'nav.home': string;
  'nav.schemes': string;
  'nav.eligibility': string;
  'nav.assistant': string;
  'nav.analytics': string;
  'nav.signIn': string;
  'nav.getStarted': string;
  // Hero
  'hero.badge': string;
  'hero.headline1': string;
  'hero.headline2': string;
  'hero.subtext': string;
  'hero.searchPlaceholder': string;
  'hero.search': string;
  'hero.ctaEligibility': string;
  'hero.ctaAssistant': string;
  'hero.popular': string;
  // Common
  'common.viewDetails': string;
  'common.askAI': string;
  'common.exploreAll': string;
  'common.chatWithAssistant': string;
  'common.startEligibilityCheck': string;
  'common.schemes': string;
  'common.loading': string;
  'common.skipIntro': string;
};

// ─── English — complete source ────────────────────────────────────────────────
const en: TranslationMap = {
  'nav.home':           'Home',
  'nav.schemes':        'Schemes',
  'nav.eligibility':    'Eligibility Wizard',
  'nav.assistant':      'AI Assistant',
  'nav.analytics':      'Analytics',
  'nav.signIn':         'Sign In',
  'nav.getStarted':     'Get Started',

  'hero.badge':              'AI-First National Scheme Discovery',
  'hero.headline1':          'Discover Government Schemes',
  'hero.headline2':          'Made For You',
  'hero.subtext':            'YojanaSetu combines FAISS semantic retrieval and grounded AI assistance to help Indian citizens find eligible benefits and apply directly.',
  'hero.searchPlaceholder':  "Search by occupation or situation (e.g. 'I am a student needing scholarship')…",
  'hero.search':             'Search',
  'hero.ctaEligibility':     'Take Eligibility Wizard',
  'hero.ctaAssistant':       'Ask AI Assistant',
  'hero.popular':            'Popular Searches:',

  'common.viewDetails':          'View Details',
  'common.askAI':                'Ask AI',
  'common.exploreAll':           'Explore All 24+ Schemes',
  'common.chatWithAssistant':    'Chat With Assistant',
  'common.startEligibilityCheck':'Start Eligibility Check',
  'common.schemes':              'Schemes',
  'common.loading':              'Loading…',
  'common.skipIntro':            'Skip ›',
};

// ─── Hindi ────────────────────────────────────────────────────────────────────
const hi: Partial<TranslationMap> = {
  'nav.home':           'होम',
  'nav.schemes':        'योजनाएं',
  'nav.eligibility':    'पात्रता जांचें',
  'nav.assistant':      'AI सहायक',
  'nav.analytics':      'विश्लेषण',
  'nav.signIn':         'साइन इन',
  'nav.getStarted':     'शुरू करें',

  'hero.badge':              'AI-प्रथम राष्ट्रीय योजना खोज',
  'hero.headline1':          'सरकारी योजनाएं खोजें',
  'hero.headline2':          'आपके लिए बनाई गईं',
  'hero.search':             'खोजें',
  'hero.ctaEligibility':     'पात्रता जांचें',
  'hero.ctaAssistant':       'AI से पूछें',

  'common.viewDetails':       'विवरण देखें',
  'common.askAI':             'AI से पूछें',
  'common.exploreAll':        'सभी 24+ योजनाएं देखें',
  'common.chatWithAssistant': 'सहायक से बात करें',
  'common.skipIntro':         'छोड़ें ›',
};

// ─── Telugu ───────────────────────────────────────────────────────────────────
const te: Partial<TranslationMap> = {
  'nav.home':        'హోమ్',
  'nav.schemes':     'పథకాలు',
  'nav.eligibility': 'అర్హత పరీక్ష',
  'nav.assistant':   'AI సహాయకుడు',
  'nav.analytics':   'విశ్లేషణలు',
  'nav.signIn':      'లాగిన్',
  'nav.getStarted':  'ప్రారంభించండి',
  'hero.headline1':  'ప్రభుత్వ పథకాలు కనుగొనండి',
  'hero.headline2':  'మీ కోసం రూపొందించబడినవి',
  'hero.search':     'వెతుకు',
  'common.skipIntro':'దాటవేయి ›',
};

// ─── Tamil ────────────────────────────────────────────────────────────────────
const ta: Partial<TranslationMap> = {
  'nav.home':        'முகப்பு',
  'nav.schemes':     'திட்டங்கள்',
  'nav.eligibility': 'தகுதி சரிபார்',
  'nav.assistant':   'AI உதவியாளர்',
  'nav.analytics':   'பகுப்பாய்வு',
  'nav.signIn':      'உள்நுழை',
  'nav.getStarted':  'தொடங்கு',
  'hero.headline1':  'அரசு திட்டங்களை கண்டறியுங்கள்',
  'hero.headline2':  'உங்களுக்காக',
  'hero.search':     'தேடு',
  'common.skipIntro':'தவிர் ›',
};

// ─── Kannada ──────────────────────────────────────────────────────────────────
const kn: Partial<TranslationMap> = {
  'nav.home':        'ಮನೆ',
  'nav.schemes':     'ಯೋಜನೆಗಳು',
  'nav.eligibility': 'ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ',
  'nav.assistant':   'AI ಸಹಾಯಕ',
  'nav.analytics':   'ವಿಶ್ಲೇಷಣೆ',
  'nav.signIn':      'ಸೈನ್ ಇನ್',
  'nav.getStarted':  'ಪ್ರಾರಂಭಿಸಿ',
  'hero.headline1':  'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
  'hero.headline2':  'ನಿಮಗಾಗಿ',
  'hero.search':     'ಹುಡುಕಿ',
  'common.skipIntro':'ಬಿಟ್ಟುಬಿಡಿ ›',
};

// ─── Malayalam ───────────────────────────────────────────────────────────────
const ml: Partial<TranslationMap> = {
  'nav.home':        'ഹോം',
  'nav.schemes':     'പദ്ധതികൾ',
  'nav.eligibility': 'യോഗ്യത പരിശോധന',
  'nav.assistant':   'AI സഹായി',
  'nav.analytics':   'വിശകലനം',
  'nav.signIn':      'സൈൻ ഇൻ',
  'nav.getStarted':  'ആരംഭിക്കുക',
  'hero.headline1':  'സർക്കാർ പദ്ധതികൾ കണ്ടെത്തുക',
  'hero.headline2':  'നിങ്ങൾക്കായി',
  'hero.search':     'തിരയുക',
  'common.skipIntro':'ഒഴിവാക്കുക ›',
};

// ─── Bengali ──────────────────────────────────────────────────────────────────
const bn: Partial<TranslationMap> = {
  'nav.home':        'হোম',
  'nav.schemes':     'প্রকল্পসমূহ',
  'nav.eligibility': 'যোগ্যতা পরীক্ষা',
  'nav.assistant':   'AI সহকারী',
  'nav.analytics':   'বিশ্লেষণ',
  'nav.signIn':      'সাইন ইন',
  'nav.getStarted':  'শুরু করুন',
  'hero.headline1':  'সরকারি প্রকল্প আবিষ্কার করুন',
  'hero.headline2':  'আপনার জন্য',
  'hero.search':     'খুঁজুন',
  'common.skipIntro':'এড়িয়ে যান ›',
};

// ─── Marathi ──────────────────────────────────────────────────────────────────
const mr: Partial<TranslationMap> = {
  'nav.home':        'मुख्यपृष्ठ',
  'nav.schemes':     'योजना',
  'nav.eligibility': 'पात्रता तपासा',
  'nav.assistant':   'AI सहाय्यक',
  'nav.analytics':   'विश्लेषण',
  'nav.signIn':      'साइन इन',
  'nav.getStarted':  'सुरू करा',
  'hero.headline1':  'सरकारी योजना शोधा',
  'hero.headline2':  'तुमच्यासाठी',
  'hero.search':     'शोधा',
  'common.skipIntro':'वगळा ›',
};

// ─── Translation table ────────────────────────────────────────────────────────
const translations: Record<LanguageCode, Partial<TranslationMap>> = {
  en, hi, te, ta, kn, ml, bn, mr,
};

/**
 * Returns the translation for `key` in `lang`.
 * Falls back to English if the key is not translated for that language.
 */
export function t(key: keyof TranslationMap, lang: LanguageCode): string {
  return (translations[lang] as TranslationMap)[key] ?? en[key] ?? key;
}
