import type {
  EnergyOption,
  FocusSlot,
  HabitTemplate,
  MicroQuote,
  MoodOption,
  Preset,
  PrayerSlot,
  QuranStudyPage,
  VerseCard,
} from "../types";

export const ACCENT_SWATCHS = [
  "#2f8a67",
  "#4d819f",
  "#d3a74d",
  "#cb745e",
  "#b6556b",
  "#556e9e",
  "#7d7a42",
  "#3f7d72",
];

export const EMOJI_OPTIONS = [
  "🕌",
  "📖",
  "🤲",
  "💻",
  "🧠",
  "🏃",
  "🏋️",
  "💧",
  "🍎",
  "🌙",
  "📓",
  "🎯",
  "🧹",
  "☕",
  "📚",
  "🛌",
  "🫀",
  "🪴",
  "💬",
  "🧘",
  "🚶",
  "🛠️",
  "🧪",
  "✨",
];

export const BEDTIME_PRESETS: Preset[] = [
  { value: "21:30", label: "9:30 PM" },
  { value: "22:30", label: "10:30 PM" },
  { value: "23:30", label: "11:30 PM" },
  { value: "00:30", label: "12:30 AM" },
];

export const WAKE_PRESETS: Preset[] = [
  { value: "05:00", label: "5:00 AM" },
  { value: "06:00", label: "6:00 AM" },
  { value: "07:00", label: "7:00 AM" },
  { value: "08:00", label: "8:00 AM" },
];

export const WATER_GOAL = 8;

export const DHIKR_GOAL = 100;

export const DHIKR_QUICK_STEPS = [10, 33, 100];

export const ENERGY_OPTIONS: EnergyOption[] = [
  {
    value: "drained",
    emoji: "🪫",
    label: "Drained",
    cue: "Protect your output",
  },
  {
    value: "steady",
    emoji: "⚖️",
    label: "Steady",
    cue: "Hold your cadence",
  },
  {
    value: "sharp",
    emoji: "🚀",
    label: "Sharp",
    cue: "Push the best block",
  },
];

export const FOCUS_SLOTS: FocusSlot[] = [
  {
    id: "focus-1",
    label: "Deen",
    placeholder: "One faith anchor to protect today",
  },
  {
    id: "focus-2",
    label: "Build",
    placeholder: "The next technical win to ship",
  },
  {
    id: "focus-3",
    label: "Life",
    placeholder: "One life or family responsibility to close",
  },
];

export const PRAYER_SLOTS: PrayerSlot[] = [
  {
    id: "fajr",
    label: "Fajr",
    cue: "Start protected",
  },
  {
    id: "dhuhr",
    label: "Dhuhr",
    cue: "Guard the middle",
  },
  {
    id: "asr",
    label: "Asr",
    cue: "Hold the afternoon",
  },
  {
    id: "maghrib",
    label: "Maghrib",
    cue: "Close before night",
  },
  {
    id: "isha",
    label: "Isha",
    cue: "End with sakinah",
  },
];

export const MOOD_OPTIONS: MoodOption[] = [
  { value: "awful", emoji: "😵", label: "Awful", score: 1, tone: "#b6556b" },
  { value: "bad", emoji: "😕", label: "Bad", score: 2, tone: "#cb745e" },
  { value: "meh", emoji: "😐", label: "Meh", score: 3, tone: "#7d7a42" },
  { value: "good", emoji: "🙂", label: "Good", score: 4, tone: "#4d819f" },
  { value: "great", emoji: "😄", label: "Great", score: 5, tone: "#2f8a67" },
];

export const DEV_QUOTES: MicroQuote[] = [
  { text: "Small commits beat heroic mood swings.", author: "LifeStack" },
  {
    text: "Ship the next clean step, not the imaginary perfect one.",
    author: "LifeStack",
  },
  {
    text: "Consistency writes cleaner code than motivation ever will.",
    author: "LifeStack",
  },
  { text: "Your streak is a compiler for discipline.", author: "LifeStack" },
  { text: "Protect your focus like prod credentials.", author: "LifeStack" },
  {
    text: "Slow systems create bugs in the soul and the sprint.",
    author: "LifeStack",
  },
  { text: "A calm engineer debugs deeper.", author: "LifeStack" },
  {
    text: "You do not need a reset, only the next honest tap.",
    author: "LifeStack",
  },
];

export const QURAN_VERSES: VerseCard[] = [
  {
    reference: "Ash-Sharh 94:5-6",
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation:
      "Hardship never arrives alone. Allah places openings and ease beside it.",
    reflection:
      "When your workload spikes, shrink the target to one faithful next action and move.",
  },
  {
    reference: "Ar-Ra’d 13:28",
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    translation:
      "Hearts settle when they stay connected to the remembrance of Allah.",
    reflection:
      "If the day feels noisy, pause before the next task and reset your inner pace.",
  },
  {
    reference: "At-Talaq 65:3",
    arabic: "وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    translation: "Whoever relies on Allah will find Him sufficient.",
    reflection:
      "Do the engineering rigor, but do not carry tomorrow as if you are alone.",
  },
  {
    reference: "Al-Baqarah 2:286",
    arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    translation: "Allah does not burden a soul beyond its real capacity.",
    reflection:
      "A heavy day still fits inside what you can handle, especially when you break it down.",
  },
  {
    reference: "Taha 20:114",
    arabic: "وَقُلْ رَبِّ زِدْنِي عِلْمًا",
    translation: "Ask your Lord to increase you in knowledge.",
    reflection:
      "Every lecture, bug, and build can become ibadah when your intention is clean.",
  },
  {
    reference: "Al-Ankabut 29:69",
    arabic: "وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا",
    translation:
      "Those who strive sincerely are guided to the paths that open next.",
    reflection:
      "Effort precedes clarity. Keep moving and let guidance meet motion.",
  },
];

export const QURAN_STUDY_PAGES: QuranStudyPage[] = [
  {
    page: 1,
    surah: "Al-Fatihah and the opening of Al-Baqarah",
    arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    translation:
      "Ask Allah to keep you on the straight path before anything else.",
    tafsir:
      "The opening pages teach that guidance comes before productivity. A believer asks for direction first, then walks with discipline.",
    practice:
      "Before your first task, make a short dua for useful knowledge and steady action.",
  },
  {
    page: 21,
    surah: "Al-Baqarah: trust, worship, and warning",
    arabic: "يَا أَيُّهَا النَّاسُ اعْبُدُوا رَبَّكُمُ",
    translation:
      "People are called back to worship the Lord who made and sustains them.",
    tafsir:
      "This page ties worship to gratitude and clarity. Your routines are strongest when they grow from remembrance, not from ego alone.",
    practice:
      "Start one study block with clear intention: this effort is for Allah before it is for performance.",
  },
  {
    page: 42,
    surah: "Al-Baqarah: patience and prayer",
    arabic: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",
    translation: "Seek help through patient endurance and prayer.",
    tafsir:
      "Relief is not only emotional. Allah teaches a method: stay patient, keep praying, and let worship stabilize pressure.",
    practice:
      "When work feels noisy, pause for one minute instead of spiraling and reset with dhikr or salah.",
  },
  {
    page: 87,
    surah: "Aal Imran: firmness after truth becomes clear",
    arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا",
    translation: "Our Lord, do not let our hearts drift after You guided us.",
    tafsir:
      "Knowledge is not enough by itself. The page trains you to ask for inner steadiness so clarity becomes lived obedience.",
    practice:
      "Ask Allah for firmness before making one decision you have been delaying.",
  },
  {
    page: 128,
    surah: "An-Nisa: justice, trust, and responsibility",
    arabic: "إِنَّ اللَّهَ يَأْمُرُكُمْ أَنْ تُؤَدُّوا الْأَمَانَاتِ",
    translation: "Allah commands you to return trusts to whom they belong.",
    tafsir:
      "This page widens worship into responsibility. Time, family duties, promises, and code quality all sit inside amanah.",
    practice:
      "Choose one neglected trust today and close it properly instead of carrying it unfinished.",
  },
  {
    page: 215,
    surah: "Al-Araf: remembrance versus heedlessness",
    arabic: "وَاذْكُرْ رَبَّكَ فِي نَفْسِكَ",
    translation: "Remember your Lord within yourself with humility and calm.",
    tafsir:
      "The page teaches quiet remembrance, not only public expression. Hearts stay alive when dhikr continues between visible acts.",
    practice:
      "Use one walking moment today for silent dhikr instead of default scrolling.",
  },
  {
    page: 293,
    surah: "Hud: stay upright",
    arabic: "فَاسْتَقِمْ كَمَا أُمِرْتَ",
    translation: "Stand upright as you were commanded.",
    tafsir:
      "Steadiness is demanding because it has no applause attached to it. This page calls you to consistency when no one is watching.",
    practice:
      "Choose the honest next action, even if it feels small and unglamorous.",
  },
  {
    page: 343,
    surah: "Yusuf: hidden wisdom in delay",
    arabic: "إِنَّهُ مَنْ يَتَّقِ وَيَصْبِرْ",
    translation:
      "Whoever holds taqwa and patience will not lose the reward of doing good.",
    tafsir:
      "Surah Yusuf trains the heart to trust Allah through long timelines. Delay does not mean abandonment when taqwa remains intact.",
    practice:
      "Name one long-term hope and answer it today with one patient, disciplined step.",
  },
  {
    page: 511,
    surah: "Taha: Musa and the burden of mission",
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي",
    translation: "My Lord, expand my chest and make this task easier for me.",
    tafsir:
      "This page teaches that even prophets ask for help before difficult work. Strength includes admitting need to Allah.",
    practice:
      "Make this dua before your hardest conversation, assignment, or debug session today.",
  },
  {
    page: 580,
    surah: "Al-Mulk and the final pages rhythm",
    arabic: "فَارْجِعِ الْبَصَرَ هَلْ تَرَى مِنْ فُطُورٍ",
    translation: "Look again and again: do you see any flaw in creation?",
    tafsir:
      "The page trains reflective vision. Repeated looking is a Quranic habit, and it sharpens both faith and careful engineering.",
    practice:
      "Review one piece of work twice today: once for completion, once for ihsan.",
  },
];

export const STARTER_HABIT_TEMPLATES: HabitTemplate[] = [
  { label: "Fajr on time", icon: "🕌", frequency: "daily", accent: "#2f8a67" },
  { label: "Quran page", icon: "📖", frequency: "daily", accent: "#4d819f" },
  {
    label: "Deep work sprint",
    icon: "💻",
    frequency: "weekdays",
    accent: "#d3a74d",
  },
  { label: "Workout", icon: "🏋️", frequency: "weekdays", accent: "#cb745e" },
  { label: "Dhikr break", icon: "🤲", frequency: "daily", accent: "#556e9e" },
  {
    label: "Family check-in",
    icon: "💬",
    frequency: "daily",
    accent: "#b6556b",
  },
];
