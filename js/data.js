/**
 * จานเด็ด SPU - ข้อมูลเริ่มต้นของระบบ (Initial Configurations)
 * รองรับการทำงานแบบ Standalone เปิด index.html ผ่านบราวเซอร์ได้ทันที
 */

const DEFAULT_HERO_SHOWCASE = {
  mainImg: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=640&auto=format&fit=crop&q=80",
  priceStamp: "🔥 ~45-60฿",
  dishCat: "🍳 จานด่วนยอดฮิตเด็ก SPU",
  dishTitle: "กะเพราหมูกรอบไข่ดาวเยิ้ม & อาหารตามสั่ง",
  dishMeta: "★ 4.9 · รีวิวแน่น · โรงร้อน & โรงเย็น",
  float1Img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=240&auto=format&fit=crop&q=80",
  float1Title: "🍜 ก๋วยเตี๋ยว & เส้น",
  float1Sub: "น้ำซุปเข้มข้น เครื่องแน่น",
  float2Img: "https://images.unsplash.com/photo-1558857563-b371033873b8?w=240&auto=format&fit=crop&q=80",
  float2Title: "🧋 ชาไทย & คาเฟ่",
  float2Sub: "หวานกำลังดี ชื่นใจหลังเรียน",
  mascotBubble: "วันนี้กินเมนูไหนดีครับ? 🍽️",
  customized: false
};

const DEFAULT_SETTINGS = {
  siteName: "จานเด็ด SPU",
  tagline: "รวมร้านเด็ด รีวิวโดนใจ แก้ปัญหาเที่ยงนี้กินอะไรดี ณ มหาวิทยาลัยศรีปทุม",
  heroSubtitle: "ระบบค้นหา แนะนำร้านอาหาร รีวิวจากเด็ก SPU ตัวจริง พร้อมวงล้อสุ่มเมนูและระบบล็อกอินรายสัปดาห์สะสมฉายาและกรอบโปรไฟล์",
  announcementTicker: "📢 ยินดีต้อนรับสู่ 'จานเด็ด SPU' เพื่อนคู่คิดมื้อเที่ยงของเด็กศรีปทุม! ล็อกอินต่อเนื่องครบ 7 วัน รับรางวัลใหญ่ประจำสัปดาห์ 🍗✨",
  activeTheme: "spu-classic", // spu-classic, loy-krathong, halloween, christmas, songkran, chinese-new-year
  festivalBannerText: "🎓 ยินดีต้อนรับสู่ จานเด็ด SPU: แหล่งรวมรีวิวร้านอาหารและสุ่มมื้อเที่ยงของชาวศรีปทุม ทั้งโรงเย็น อาคาร 10 และโรงร้อนหลังอาคาร 5!",
  festivalBannerActive: true,
  heroShowcase: { ...DEFAULT_HERO_SHOWCASE }
};

const THEMES = {
  "spu-classic": {
    id: "spu-classic",
    name: "Classic",
    icon: "🍽️",
    primary: "#e11d48",
    primaryDark: "#be123c",
    secondary: "#0f172a",
    accent: "#f43f5e",
    bgGradient: "linear-gradient(135deg, #fff1f2 0%, #fdf2f8 50%, #f8fafc 100%)",
    headerBg: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
    cardBg: "#ffffff",
    cardBorder: "#fda4af",
    badgeBg: "#ffe4e6",
    badgeColor: "#be123c",
    particleEmoji: "🍗",
    floatingEmojis: ["🍗", "🍜", "🍛", "🍰", "🍳", "🧋", "🍔", "🍤", "🥗", "🍩", "🍕", "🥐"],
    bannerBg: "linear-gradient(90deg, #0f172a 0%, #831843 45%, #e11d48 100%)",
    bannerImage: "assets/themes/theme-classic.svg?v=20261117_2",
    festivalSubtitle: "บรรยากาศชมพู-ดำ มหาวิทยาลัยศรีปทุม หอมกรุ่นทุกมื้ออร่อยรอบรั้วแคมปัส",
    heroDishImg: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=640&auto=format&fit=crop&q=80",
    heroDishCat: "🍳 จานด่วนยอดฮิตเด็ก SPU",
    heroDishTitle: "กะเพราหมูกรอบไข่ดาวเยิ้ม & อาหารตามสั่ง",
    heroDishMeta: "★ 4.9 · รีวิวแน่น · โรงร้อน & โรงเย็น",
    heroPriceStamp: "🔥 ~45-60฿",
    mascotSpeech: "วันนี้กินเมนูไหนดีครับ? 🍽️",
    lightVars: {
      "--primary": "#e11d48",
      "--primary-hover": "#be123c",
      "--primary-light": "#fff1f2",
      "--primary-glow": "rgba(225, 29, 72, 0.22)",
      "--secondary": "#0f172a",
      "--accent": "#f43f5e",
      "--bg-page": "#fff5f7",
      "--bg-surface": "#ffffff",
      "--bg-surface-alt": "#fff1f2",
      "--bg-card": "#ffffff",
      "--text-main": "#0f172a",
      "--text-color": "#0f172a",
      "--text-muted": "#64748b",
      "--border-color": "#fecdd3",
      "--card-border": "#fda4af",
      "--awning-alt": "#0f172a",
      "--bg-banner": "linear-gradient(90deg, #0f172a 0%, #9f1239 50%, #e11d48 100%)",
      "--hero-bg": "radial-gradient(circle at 82% 28%, rgba(225, 29, 72, 0.24) 0%, rgba(251, 113, 133, 0.12) 32%, transparent 58%), radial-gradient(circle at 14% 78%, rgba(244, 63, 94, 0.16) 0%, transparent 48%), linear-gradient(180deg, #ffe4e6 0%, #fff1f2 55%, #fff5f7 100%)"
    },
    darkVars: {
      "--primary": "#fb7185",
      "--primary-hover": "#f43f5e",
      "--primary-light": "rgba(225, 29, 72, 0.24)",
      "--primary-glow": "rgba(244, 63, 94, 0.42)",
      "--secondary": "#0f172a",
      "--accent": "#f43f5e",
      "--bg-page": "#090d16",
      "--bg-surface": "#0f172a",
      "--bg-surface-alt": "#1e293b",
      "--bg-card": "#0f172a",
      "--text-main": "#f8fafc",
      "--text-color": "#f8fafc",
      "--text-muted": "#94a3b8",
      "--border-color": "rgba(244, 63, 94, 0.26)",
      "--card-border": "rgba(244, 63, 94, 0.45)",
      "--awning-alt": "#e11d48",
      "--bg-banner": "linear-gradient(90deg, #0f172a 0%, #881337 50%, #e11d48 100%)",
      "--hero-bg": "radial-gradient(circle at 80% 35%, rgba(244, 63, 94, 0.36) 0%, rgba(225, 29, 72, 0.14) 34%, transparent 62%), radial-gradient(circle at 18% 72%, rgba(251, 113, 133, 0.22) 0%, transparent 50%), linear-gradient(135deg, #090d16 0%, #0f172a 55%, #1e1024 100%)"
    }
  },
  "loy-krathong": {
    id: "loy-krathong",
    name: "เทศกาลลอยกระทง (Loy Krathong)",
    icon: "🪷",
    primary: "#6366f1",
    primaryDark: "#4338ca",
    secondary: "#fbbf24",
    accent: "#38bdf8",
    bgGradient: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
    headerBg: "linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)",
    cardBg: "#ffffff",
    cardBorder: "#6366f1",
    badgeBg: "#e0e7ff",
    badgeColor: "#3730a3",
    particleEmoji: "🪷",
    floatingEmojis: ["🪷", "🌕", "🏮", "✨", "🪷", "🕯️", "🌙", "🪷", "🎇", "🌟", "🪷", "🏮"],
    bannerBg: "linear-gradient(90deg, #1e1b4b 0%, #3730a3 50%, #6366f1 100%)",
    bannerImage: "assets/themes/theme-loy-krathong.svg",
    festivalSubtitle: "อิ่มอร่อยตลาดนัดคืนเพ็ญ ชมจันทร์เต็มดวงและแสงเทียนริมสายน้ำ",
    heroDishImg: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=640&auto=format&fit=crop&q=80",
    heroDishCat: "🪷 ตลาดนัดอาหารคืนวันเพ็ญ",
    heroDishTitle: "รวมของกินงานลอยกระทง & เมนูยามค่ำคืน SPU",
    heroDishMeta: "🌕 บรรยากาศคืนเดือนเพ็ญ · อิ่มอร่อยทั่วแคมปัส",
    heroPriceStamp: "🪷 เทศกาลลอยกระทง",
    mascotSpeech: "ไปลอยกระทงและหาของอร่อยกินกันครับ! 🪷",
    lightVars: {
      "--primary": "#4f46e5",
      "--primary-hover": "#3730a3",
      "--primary-light": "#e0e7ff",
      "--primary-glow": "rgba(79, 70, 229, 0.25)",
      "--secondary": "#1e1b4b",
      "--accent": "#f59e0b",
      "--bg-page": "#eef2ff",
      "--bg-surface": "#ffffff",
      "--bg-surface-alt": "#e0e7ff",
      "--text-main": "#1e1b4b",
      "--text-muted": "#3730a3",
      "--border-color": "#c7d2fe",
      "--card-border": "#818cf8",
      "--awning-alt": "#fef08a",
      "--bg-banner": "linear-gradient(90deg, #1e1b4b 0%, #3730a3 50%, #6366f1 100%)",
      "--hero-bg": "radial-gradient(circle at 85% 20%, rgba(251, 191, 36, 0.24) 0%, transparent 45%), radial-gradient(circle at 15% 80%, rgba(79, 70, 229, 0.20) 0%, transparent 45%), linear-gradient(180deg, #c7d2fe 0%, #eef2ff 100%)"
    },
    darkVars: {
      "--primary": "#6366f1",
      "--primary-hover": "#4f46e5",
      "--primary-light": "rgba(99, 102, 241, 0.25)",
      "--primary-glow": "rgba(99, 102, 241, 0.35)",
      "--secondary": "#fbbf24",
      "--accent": "#38bdf8",
      "--bg-page": "#0b1026",
      "--bg-surface": "#151e42",
      "--bg-surface-alt": "#1f2b5e",
      "--text-main": "#eef2ff",
      "--text-muted": "#a5b4fc",
      "--border-color": "#312e81",
      "--card-border": "#6366f1",
      "--awning-alt": "#1e1b4b",
      "--bg-banner": "linear-gradient(90deg, #0f172a 0%, #312e81 50%, #4f46e5 100%)",
      "--hero-bg": "radial-gradient(circle at 85% 20%, rgba(251, 191, 36, 0.22) 0%, transparent 45%), radial-gradient(circle at 15% 80%, rgba(99, 102, 241, 0.26) 0%, transparent 45%), linear-gradient(180deg, #1e1b4b 0%, #0b1026 100%)"
    }
  },
  "halloween": {
    id: "halloween",
    name: "เทศกาลฮาโลวีน (Halloween Party)",
    icon: "🎃",
    primary: "#ea580c",
    primaryDark: "#c2410c",
    secondary: "#581c87",
    accent: "#84cc16",
    bgGradient: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
    headerBg: "linear-gradient(135deg, #7c2d12 0%, #3b0764 100%)",
    cardBg: "#ffffff",
    cardBorder: "#ea580c",
    badgeBg: "#ffedd5",
    badgeColor: "#9a3412",
    particleEmoji: "🎃",
    floatingEmojis: ["🎃", "👻", "🦇", "🍬", "🕸️", "🎃", "💀", "🍭", "🧙‍♀️", "🕷️", "🎃", "🌙"],
    bannerBg: "linear-gradient(90deg, #3b0764 0%, #6b21a8 50%, #ea580c 100%)",
    bannerImage: "assets/themes/theme-halloween.svg",
    festivalSubtitle: "ปาร์ตี้กุ๊กกู๋รวมเมนูเด็ดสุดจี๊ด หลอกหรือเลี้ยงก็อิ่มฟินทั้งโรงอาหาร",
    heroDishImg: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=640&auto=format&fit=crop&q=80",
    heroDishCat: "🎃 Trick or Treat Special",
    heroDishTitle: "ปาร์ตี้ฮาโลวีนสุดหลอน & เมนูเผ็ดเดือดทะลุพิกัด",
    heroDishMeta: "🦇 ธีมพิเศษฮาโลวีน · อร่อยเด็ดไม่ต้องกลัวผี",
    heroPriceStamp: "🎃 Halloween Fest",
    mascotSpeech: "Trick or Treat! รับเมนูไหนดีครับ? 🎃",
    lightVars: {
      "--primary": "#ea580c",
      "--primary-hover": "#c2410c",
      "--primary-light": "#ffedd5",
      "--primary-glow": "rgba(234, 88, 12, 0.26)",
      "--secondary": "#4c1d95",
      "--accent": "#84cc16",
      "--bg-page": "#fff7ed",
      "--bg-surface": "#ffffff",
      "--bg-surface-alt": "#f3e8ff",
      "--text-main": "#2e1065",
      "--text-muted": "#6b21a8",
      "--border-color": "#fdba74",
      "--card-border": "#f97316",
      "--awning-alt": "#3b0764",
      "--bg-banner": "linear-gradient(90deg, #2e1065 0%, #6b21a8 50%, #ea580c 100%)",
      "--hero-bg": "radial-gradient(circle at 85% 20%, rgba(234, 88, 12, 0.24) 0%, transparent 45%), radial-gradient(circle at 15% 80%, rgba(126, 34, 206, 0.18) 0%, transparent 45%), linear-gradient(180deg, #fed7aa 0%, #f3e8ff 55%, #fff7ed 100%)"
    },
    darkVars: {
      "--primary": "#f97316",
      "--primary-hover": "#ea580c",
      "--primary-light": "rgba(249, 115, 22, 0.24)",
      "--primary-glow": "rgba(249, 115, 22, 0.35)",
      "--secondary": "#7e22ce",
      "--accent": "#84cc16",
      "--bg-page": "#140921",
      "--bg-surface": "#221038",
      "--bg-surface-alt": "#311750",
      "--text-main": "#fff7ed",
      "--text-muted": "#fdba74",
      "--border-color": "#581c87",
      "--card-border": "#f97316",
      "--awning-alt": "#2e1065",
      "--bg-banner": "linear-gradient(90deg, #2e1065 0%, #7e22ce 50%, #ea580c 100%)",
      "--hero-bg": "radial-gradient(circle at 85% 20%, rgba(249, 115, 22, 0.25) 0%, transparent 45%), radial-gradient(circle at 15% 80%, rgba(147, 51, 234, 0.25) 0%, transparent 45%), linear-gradient(180deg, #3b0764 0%, #140921 100%)"
    }
  },
  "christmas": {
    id: "christmas",
    name: "เทศกาลคริสต์มาส & ปีใหม่ (Christmas)",
    icon: "🎄",
    primary: "#dc2626",
    primaryDark: "#991b1b",
    secondary: "#15803d",
    accent: "#eab308",
    bgGradient: "linear-gradient(135deg, #f0fdf4 0%, #fef2f2 100%)",
    headerBg: "linear-gradient(135deg, #991b1b 0%, #166534 100%)",
    cardBg: "#ffffff",
    cardBorder: "#dc2626",
    badgeBg: "#fee2e2",
    badgeColor: "#b91c1c",
    particleEmoji: "❄️",
    floatingEmojis: ["🎄", "❄️", "🎅", "🎁", "⛄", "🔔", "🦌", "⭐", "🍪", "🎄", "❄️", "🧣"],
    bannerBg: "linear-gradient(90deg, #14532d 0%, #15803d 45%, #dc2626 100%)",
    bannerImage: "assets/themes/theme-christmas.svg",
    festivalSubtitle: "ฉลองเทศกาลแห่งความสุข อิ่มอร่อยเมนูพิเศษต้อนรับลมหนาวและปีใหม่",
    heroDishImg: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=640&auto=format&fit=crop&q=80",
    heroDishCat: "🎄 Merry Christmas & Happy New Year",
    heroDishTitle: "ฉลองเทศกาลคริสต์มาส & มื้อพิเศษส่งท้ายปีเก่าต้อนรับปีใหม่",
    heroDishMeta: "❄️ บรรยากาศลมหนาว · ขนมและมื้ออร่อยอบอุ่นใจ",
    heroPriceStamp: "🎄 Festive Season",
    mascotSpeech: "Merry Christmas! ฉลองมื้ออร่อยกันครับ 🎄❄️",
    lightVars: {
      "--primary": "#dc2626",
      "--primary-hover": "#991b1b",
      "--primary-light": "#fee2e2",
      "--primary-glow": "rgba(220, 38, 38, 0.25)",
      "--secondary": "#14532d",
      "--accent": "#eab308",
      "--bg-page": "#f0fdf4",
      "--bg-surface": "#ffffff",
      "--bg-surface-alt": "#dcfce7",
      "--text-main": "#14532d",
      "--text-muted": "#166534",
      "--border-color": "#86efac",
      "--card-border": "#22c55e",
      "--awning-alt": "#15803d",
      "--bg-banner": "linear-gradient(90deg, #14532d 0%, #15803d 45%, #dc2626 100%)",
      "--hero-bg": "radial-gradient(circle at 85% 20%, rgba(220, 38, 38, 0.18) 0%, transparent 45%), radial-gradient(circle at 15% 80%, rgba(22, 163, 74, 0.20) 0%, transparent 45%), linear-gradient(180deg, #bbf7d0 0%, #fef2f2 50%, #f0fdf4 100%)"
    },
    darkVars: {
      "--primary": "#ef4444",
      "--primary-hover": "#dc2626",
      "--primary-light": "rgba(239, 68, 68, 0.24)",
      "--primary-glow": "rgba(239, 68, 68, 0.35)",
      "--secondary": "#15803d",
      "--accent": "#facc15",
      "--bg-page": "#071a10",
      "--bg-surface": "#0f2b1c",
      "--bg-surface-alt": "#163d28",
      "--text-main": "#f0fdf4",
      "--text-muted": "#86efac",
      "--border-color": "#166534",
      "--card-border": "#ef4444",
      "--awning-alt": "#14532d",
      "--bg-banner": "linear-gradient(90deg, #14532d 0%, #15803d 45%, #dc2626 100%)",
      "--hero-bg": "radial-gradient(circle at 85% 20%, rgba(239, 68, 68, 0.24) 0%, transparent 45%), radial-gradient(circle at 15% 80%, rgba(34, 197, 94, 0.22) 0%, transparent 45%), linear-gradient(180deg, #14532d 0%, #071a10 100%)"
    }
  },
  "songkran": {
    id: "songkran",
    name: "เทศกาลสงกรานต์ (Songkran Festival)",
    icon: "💦",
    primary: "#0284c7",
    primaryDark: "#0369a1",
    secondary: "#f59e0b",
    accent: "#06b6d4",
    bgGradient: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
    headerBg: "linear-gradient(135deg, #0369a1 0%, #0e7490 100%)",
    cardBg: "#ffffff",
    cardBorder: "#0284c7",
    badgeBg: "#e0f2fe",
    badgeColor: "#0369a1",
    particleEmoji: "💦",
    floatingEmojis: ["💦", "🔫", "🌼", "🌊", "🪣", "🌺", "🍉", "🥥", "☀️", "💦", "🌼", "🍧"],
    bannerBg: "linear-gradient(90deg, #0369a1 0%, #0284c7 50%, #06b6d4 100%)",
    bannerImage: "assets/themes/theme-songkran.svg",
    festivalSubtitle: "สาดความสดชื่นรับซัมเมอร์ รวมเมนูคลายร้อนและเครื่องดื่มเย็นฉ่ำ",
    heroDishImg: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=640&auto=format&fit=crop&q=80",
    heroDishCat: "💦 สงกรานต์สาดความสดชื่น",
    heroDishTitle: "รวมเมนูคลายร้อน ข้าวเหนียวมะม่วง & เครื่องดื่มเย็นฉ่ำ",
    heroDishMeta: "🌼 สวัสดีปีใหม่ไทย · สดชื่นทั่วโรงอาหาร SPU",
    heroPriceStamp: "💦 Songkran Splash",
    mascotSpeech: "สวัสดีวันสงกรานต์! หาอะไรเย็นๆ ดื่มกันครับ 💦",
    lightVars: {
      "--primary": "#0284c7",
      "--primary-hover": "#0369a1",
      "--primary-light": "#e0f2fe",
      "--primary-glow": "rgba(2, 132, 199, 0.25)",
      "--secondary": "#0c4a6e",
      "--accent": "#f59e0b",
      "--bg-page": "#f0f9ff",
      "--bg-surface": "#ffffff",
      "--bg-surface-alt": "#e0f2fe",
      "--text-main": "#0c4a6e",
      "--text-muted": "#0369a1",
      "--border-color": "#7dd3fc",
      "--card-border": "#38bdf8",
      "--awning-alt": "#fef08a",
      "--bg-banner": "linear-gradient(90deg, #0369a1 0%, #0284c7 50%, #06b6d4 100%)",
      "--hero-bg": "radial-gradient(circle at 85% 20%, rgba(56, 189, 248, 0.26) 0%, transparent 45%), radial-gradient(circle at 15% 80%, rgba(250, 204, 21, 0.20) 0%, transparent 45%), linear-gradient(180deg, #bae6fd 0%, #f0f9ff 100%)"
    },
    darkVars: {
      "--primary": "#0ea5e9",
      "--primary-hover": "#0284c7",
      "--primary-light": "rgba(14, 165, 233, 0.24)",
      "--primary-glow": "rgba(14, 165, 233, 0.35)",
      "--secondary": "#f59e0b",
      "--accent": "#06b6d4",
      "--bg-page": "#061826",
      "--bg-surface": "#0d2940",
      "--bg-surface-alt": "#143a59",
      "--text-main": "#f0f9ff",
      "--text-muted": "#7dd3fc",
      "--border-color": "#0369a1",
      "--card-border": "#38bdf8",
      "--awning-alt": "#075985",
      "--bg-banner": "linear-gradient(90deg, #075985 0%, #0284c7 50%, #06b6d4 100%)",
      "--hero-bg": "radial-gradient(circle at 85% 20%, rgba(56, 189, 248, 0.26) 0%, transparent 45%), radial-gradient(circle at 15% 80%, rgba(250, 204, 21, 0.18) 0%, transparent 45%), linear-gradient(180deg, #075985 0%, #061826 100%)"
    }
  },
  "chinese-new-year": {
    id: "chinese-new-year",
    name: "เทศกาลตรุษจีน (Chinese New Year)",
    icon: "🧧",
    primary: "#b91c1c",
    primaryDark: "#7f1d1d",
    secondary: "#d97706",
    accent: "#f59e0b",
    bgGradient: "linear-gradient(135deg, #fff1f2 0%, #fef3c7 100%)",
    headerBg: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)",
    cardBg: "#ffffff",
    cardBorder: "#b91c1c",
    badgeBg: "#fee2e2",
    badgeColor: "#991b1b",
    particleEmoji: "🧧",
    floatingEmojis: ["🧧", "🏮", "🐉", "🦁", "🍊", "🥟", "🪙", "🧨", "✨", "🧧", "🏮", "🍜"],
    bannerBg: "linear-gradient(90deg, #7f1d1d 0%, #b91c1c 55%, #d97706 100%)",
    bannerImage: "assets/themes/theme-chinese-new-year.svg",
    festivalSubtitle: "ซินเจียยู่อี่ ซินนี้ฮวดไช้ อิ่มอร่อยเมนูมงคลรับโชคลาภและความเฮง",
    heroDishImg: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=640&auto=format&fit=crop&q=80",
    heroDishCat: "🧧 ซินเจียยู่อี่ ซินนี้ฮวดไช้",
    heroDishTitle: "ฉลองเทศกาลตรุษจีน รวมเมนูมงคล ติ่มซำ & บะหมี่อายุยืน",
    heroDishMeta: "🐉 เฮงๆ รวยๆ · อิ่มอร่อยรับอั่งเปาโชคลาภ",
    heroPriceStamp: "🧧 ตรุษจีนมหามงคล",
    mascotSpeech: "ซินเจียยู่อี่ ซินนี้ฮวดไช้! กินของมงคลกันครับ 🧧",
    lightVars: {
      "--primary": "#b91c1c",
      "--primary-hover": "#7f1d1d",
      "--primary-light": "#fee2e2",
      "--primary-glow": "rgba(185, 28, 28, 0.28)",
      "--secondary": "#7f1d1d",
      "--accent": "#f59e0b",
      "--bg-page": "#fff5f5",
      "--bg-surface": "#ffffff",
      "--bg-surface-alt": "#fef3c7",
      "--text-main": "#450a0a",
      "--text-muted": "#7f1d1d",
      "--border-color": "#fca5a5",
      "--card-border": "#f59e0b",
      "--awning-alt": "#fde047",
      "--bg-banner": "linear-gradient(90deg, #7f1d1d 0%, #b91c1c 55%, #d97706 100%)",
      "--hero-bg": "radial-gradient(circle at 85% 20%, rgba(250, 204, 21, 0.26) 0%, transparent 45%), radial-gradient(circle at 15% 80%, rgba(185, 28, 28, 0.20) 0%, transparent 45%), linear-gradient(180deg, #fecaca 0%, #fef3c7 55%, #fff5f5 100%)"
    },
    darkVars: {
      "--primary": "#dc2626",
      "--primary-hover": "#b91c1c",
      "--primary-light": "rgba(220, 38, 38, 0.26)",
      "--primary-glow": "rgba(250, 204, 21, 0.32)",
      "--secondary": "#d97706",
      "--accent": "#facc15",
      "--bg-page": "#220707",
      "--bg-surface": "#360c0c",
      "--bg-surface-alt": "#4c1111",
      "--text-main": "#fef3c7",
      "--text-muted": "#fca5a5",
      "--border-color": "#7f1d1d",
      "--card-border": "#facc15",
      "--awning-alt": "#7f1d1d",
      "--bg-banner": "linear-gradient(90deg, #450a0a 0%, #b91c1c 55%, #d97706 100%)",
      "--hero-bg": "radial-gradient(circle at 85% 20%, rgba(250, 204, 21, 0.24) 0%, transparent 45%), radial-gradient(circle at 15% 80%, rgba(220, 38, 38, 0.26) 0%, transparent 45%), linear-gradient(180deg, #450a0a 0%, #220707 100%)"
    }
  }
};

/**
 * โรงอาหารในมหาวิทยาลัยศรีปทุม (SPU):
 * 1. โรงเย็น อาคาร 10 มี 3 ชั้น
 * 2. โรงร้อน มีชั้นเดียว หลังอาคาร 5
 */
const SPU_LOCATIONS = [
  "โรงเย็น อาคาร 10 (ชั้น 1)",
  "โรงเย็น อาคาร 10 (ชั้น 2)",
  "โรงเย็น อาคาร 10 (ชั้น 3)",
  "โรงร้อน (หลังอาคาร 5)"
];

const FOOD_CATEGORIES = [
  "ข้าวราดแกง / อาหารตามสั่ง",
  "ก๋วยเตี๋ยว / บะหมี่ / ราเมน",
  "เครื่องดื่ม / กาแฟสด / ชานมไข่มุก",
  "ของทอด / ของทานเล่น",
  "ของหวาน / เบเกอรี่ / วาฟเฟิล",
  "ชาบู / หมาล่า"
];

const BADGES_LIST = [
  { id: "newbie", name: "นักชิมมือใหม่", icon: "🌱", desc: "เริ่มต้นเป็นสมาชิกชุมชนจานเด็ด SPU", reqType: "register" },
  { id: "canteen_hero", name: "ฮีโร่โรงอาหาร", icon: "🏆", desc: "ล็อกอินต่อเนื่องสะสมครบ 7 วัน", reqType: "streak", minStreak: 7 },
  { id: "street_master", name: "เซียนรีวิวอาหาร", icon: "🔥", desc: "เขียนรีวิวร้านอาหารในมอครบ 2 ร้าน", reqType: "reviews", minReviews: 2 },
  { id: "spu_gourmet", name: "SPU Food Master", icon: "👑", desc: "กูรูอาหารระดับตำนาน เขียนรีวิวครบ 4 ร้าน", reqType: "reviews", minReviews: 4 }
];

const PROFILE_FRAMES = [
  { id: "frame-none", name: "ธรรมดา (กรอบต้นอ่อน)", icon: "🌱", svg: "assets/frames/frame-none.svg", desc: "กรอบสติกเกอร์ลายจุดพร้อมต้นอ่อนน้อยสำหรับสมาชิกใหม่", unlockDesc: "มีทันทีเมื่อสมัคร" },
  { id: "frame-boba-cat", name: "Boba Neko Kawaii", icon: "🧋", svg: "assets/frames/frame-boba-cat.svg", desc: "กรอบหูแมวเหมียวชานมไข่มุกและอุ้งเท้าแมวสุดคิ้วท์", unlockDesc: "มีทันทีเมื่อสมัคร" },
  { id: "frame-strawberry-cake", name: "Berry Shortcake", icon: "🍓", svg: "assets/frames/frame-strawberry-cake.svg", desc: "กรอบวิปครีมสตรอว์เบอร์รีชอร์ตเค้กหวานฉ่ำ", unlockDesc: "เช็กอินสะสมครบ 3 วัน" },
  { id: "frame-shiba-chef", name: "Shiba Canteen Boss", icon: "🐕", svg: "assets/frames/frame-shiba-chef.svg", desc: "กรอบน้องหมาชิบะผ้าพันคอเชฟกับกระดูกคู่ใจ", unlockDesc: "เช็กอินสะสมครบ 5 วัน" },
  { id: "frame-cyberpunk", name: "Cyberpunk Pink-Black", icon: "⚡", svg: "assets/frames/frame-cyberpunk.svg", desc: "กรอบหูแมวไซเบอร์นีออนชมพู-ฟ้าพร้อมสายฟ้า SPU", unlockDesc: "รางวัลสตรีค สัปดาห์ที่ 1 (ครบ 7 วัน)" },
  { id: "frame-crystal-blue", name: "Crystal Blue Canteen", icon: "❄️", svg: "assets/frames/frame-crystal-blue.svg", desc: "กรอบมงกุฎคริสตัลน้ำแข็งและเกล็ดหิมะ โรงเย็น อาคาร 10", unlockDesc: "รางวัลสตรีค สัปดาห์ที่ 2 (ครบ 14 วัน)" },
  { id: "frame-volcano-fire", name: "Volcano Fire Canteen", icon: "🔥", svg: "assets/frames/frame-volcano-fire.svg", desc: "กรอบเขาเปลวเพลิงภูเขาไฟสุดเดือด โรงร้อนหลังตึก 5", unlockDesc: "รางวัลสตรีค สัปดาห์ที่ 3 (ครบ 21 วัน)" },
  { id: "frame-emerald-legend", name: "Emerald SPU Legend", icon: "💎", svg: "assets/frames/frame-emerald-legend.svg", desc: "กรอบมงกุฎมรกตหยกเขียวและใบไม้ทอง ฉลองครบ 1 เดือน", unlockDesc: "รางวัลสตรีค สัปดาห์ที่ 4 (ครบ 28 วัน / 1 เดือน)" },
  { id: "frame-cosmic-galaxy", name: "Cosmic Galaxy Violet", icon: "🌌", svg: "assets/frames/frame-cosmic-galaxy.svg", desc: "กรอบพระจันทร์เสี้ยวและวงแหวนดาวเสาร์ม่วงกาแล็กซี", unlockDesc: "รางวัลสตรีค สัปดาห์ที่ 5 (ครบ 35 วัน)" },
  { id: "frame-pastel-rainbow", name: "Sweet Pastel Rainbow", icon: "🌈", svg: "assets/frames/frame-pastel-rainbow.svg", desc: "กรอบสายรุ้งพาสเทลปุยเมฆและหัวใจลูกกวาด", unlockDesc: "รางวัลสตรีค สัปดาห์ที่ 6 (ครบ 42 วัน)" },
  { id: "frame-platinum-knight", name: "Platinum Diamond Knight", icon: "⚔️", svg: "assets/frames/frame-platinum-knight.svg", desc: "กรอบปีกอัศวินแพลตตินัมและโล่เพชรศักดิ์สิทธิ์", unlockDesc: "รางวัลสตรีค สัปดาห์ที่ 7 (ครบ 49 วัน)" },
  { id: "frame-grand-emperor", name: "Grand Golden Emperor", icon: "👑", svg: "assets/frames/frame-grand-emperor.svg", desc: "กรอบมงกุฎราชาจักรพรรดิปีกทองคำฝังทับทิม ฉลองครบ 2 เดือน!", unlockDesc: "รางวัลสตรีค สัปดาห์ที่ 8 (ครบ 56 วัน / 2 เดือน)" },
  { id: "frame-spu-pink", name: "SPU Pink Ribbon", icon: "💖", svg: "assets/frames/frame-spu-pink.svg", desc: "กรอบโบว์ชมพู SPU และหัวใจพาสเทลสุดน่ารัก", unlockDesc: "เขียนรีวิวร้านแรก" },
  { id: "frame-ramen-master", name: "Ramen Narutomaki", icon: "🍜", svg: "assets/frames/frame-ramen-master.svg", desc: "กรอบราเมนตะเกียบคู่ ไข่ยางมะตูม และลูกชิ้นนารูโตะ", unlockDesc: "เขียนรีวิวร้านแรก" },
  { id: "frame-flame", name: "Flame Food Master", icon: "🍖", svg: "assets/frames/frame-flame.svg", desc: "กรอบหมวกเชฟปุยเมฆและดาวนักชิมไฟลุก", unlockDesc: "เขียนรีวิวครบ 2 ร้าน" },
  { id: "frame-gold", name: "Golden Foodie", icon: "⭐", svg: "assets/frames/frame-gold.svg", desc: "กรอบหมู่ดาวทองคำและเหรียญเกียรติยศนักชิม", unlockDesc: "เขียนรีวิวครบ 3 ร้าน" }
];

/**
 * ปฏิทินของรางวัลล็อกอินสะสม 8 สัปดาห์ (ครอบคลุมระยะเวลา 2 เดือนเต็ม)
 * แต่ละสัปดาห์วันที่ 7 จะได้รับกรอบโปรไฟล์และฉายาที่ไม่ซ้ำกันเลย!
 */
const WEEKLY_REWARDS_CALENDAR = [
  {
    week: 1,
    dayTarget: 7,
    weekName: "สัปดาห์ที่ 1: ก้าวแรกสู่วงการจานเด็ด",
    frameId: "frame-cyberpunk",
    frameName: "กรอบ Cyberpunk Pink-Black",
    frameIcon: "⚡",
    title: "สุดยอดนักชิม 7 วัน SPU",
    badgeId: "canteen_hero",
    desc: "กรอบนีออนชมพู-ฟ้าไซเบอร์พังก์ SPU พร้อมฉายานักชิม 7 วัน",
    color: "#06b6d4"
  },
  {
    week: 2,
    dayTarget: 14,
    weekName: "สัปดาห์ที่ 2: จอมยุทธ์โรงเย็น อาคาร 10",
    frameId: "frame-crystal-blue",
    frameName: "กรอบ Crystal Blue Canteen",
    frameIcon: "❄️",
    title: "จอมยุทธ์โรงเย็น อาคาร 10",
    badgeId: "canteen_hero_w2",
    desc: "กรอบคริสตัลนีออนบลูเปล่งประกายความสดชื่นแห่งโรงเย็น อาคาร 10",
    color: "#0284c7"
  },
  {
    week: 3,
    dayTarget: 21,
    weekName: "สัปดาห์ที่ 3: ขุนพลกระทะร้อนหลังตึก 5",
    frameId: "frame-volcano-fire",
    frameName: "กรอบ Volcano Fire Canteen",
    frameIcon: "🔥",
    title: "ราชันย์กระทะร้อนหลังอาคาร 5",
    badgeId: "canteen_hero_w3",
    desc: "กรอบเปลวเพลิงภูเขาไฟสุดดุดันแห่งโรงร้อนหลังอาคาร 5",
    color: "#dc2626"
  },
  {
    week: 4,
    dayTarget: 28,
    weekName: "สัปดาห์ที่ 4: ฉลองครบ 1 เดือนเต็ม!",
    frameId: "frame-emerald-legend",
    frameName: "กรอบ Emerald SPU Legend",
    frameIcon: "💎",
    title: "เซียนจานเด็ดศรีปทุม 1 เดือน",
    badgeId: "canteen_hero_w4",
    desc: "กรอบมรกตหยกเขียวประกายเพชร ฉลองความภักดีครบ 1 เดือน",
    color: "#059669"
  },
  {
    week: 5,
    dayTarget: 35,
    weekName: "สัปดาห์ที่ 5: ท่องอวกาศสายกิน",
    frameId: "frame-cosmic-galaxy",
    frameName: "กรอบ Cosmic Galaxy Violet",
    frameIcon: "🌌",
    title: "นักชิมทะลุมิติจักรวาล SPU",
    badgeId: "canteen_hero_w5",
    desc: "กรอบม่วงกาแล็กซีแสงออโรร่าล้ำอนาคต",
    color: "#8b5cf6"
  },
  {
    week: 6,
    dayTarget: 42,
    weekName: "สัปดาห์ที่ 6: กูรูของหวานและคาเฟ่",
    frameId: "frame-pastel-rainbow",
    frameName: "กรอบ Sweet Pastel Rainbow",
    frameIcon: "🌈",
    title: "กูรูคาเฟ่ & ของหวานตัวแม่ SPU",
    badgeId: "canteen_hero_w6",
    desc: "กรอบสายรุ้งพาสเทลหวานละมุนสำหรับสายคาเฟ่ขนมหวาน",
    color: "#f472b6"
  },
  {
    week: 7,
    dayTarget: 49,
    weekName: "สัปดาห์ที่ 7: อัศวินนักล่าจานเด็ด",
    frameId: "frame-platinum-knight",
    frameName: "กรอบ Platinum Diamond Knight",
    frameIcon: "⚔️",
    title: "อัศวินนักล่าจานเด็ดระดับพรีเมียม",
    badgeId: "canteen_hero_w7",
    desc: "กรอบแพลตตินัมเงินบริสุทธิ์ประกายเพชรอัศวิน",
    color: "#94a3b8"
  },
  {
    week: 8,
    dayTarget: 56,
    weekName: "สัปดาห์ที่ 8: มหาเทพจานเด็ด ครบ 2 เดือนเต็ม!",
    frameId: "frame-grand-emperor",
    frameName: "กรอบ Grand Golden Emperor",
    frameIcon: "👑",
    title: "มหาเทพจานเด็ด SPU 60 วัน",
    badgeId: "canteen_hero_w8",
    desc: "กรอบทองคำจักรพรรดิออร่าสุริยะ สูงสุดในปฐพี SPU ครบ 60 วัน",
    color: "#eab308"
  }
];

/**
 * ข้อมูลเริ่มต้นว่างเปล่าทั้งหมด ระบบจะดึงข้อมูลจริงแบบ Real-time จาก Cloud Firestore
 * (ไม่ฝังอีเมล/รหัสผ่านแอดมิน และไม่ใช้ข้อมูลปลอมบนหน้าเว็บ)
 */
const INITIAL_USERS = [];

const INITIAL_RESTAURANTS = [];

/**
 * ร้านอาหารจริงในรั้ว SPU ที่คัดกรองข้อมูลสำคัญจากหน้าร้านจริง (ตัดรายละเอียดส่วนเกินออกแล้ว)
 * ใช้แสดงผลเริ่มต้นและซิงค์ขึ้น Cloud Firestore อัตโนมัติเมื่อแอดมินเข้าสู่ระบบครั้งแรก
 */
const SPU_CURATED_RESTAURANTS = [
  {
    id: "spu_shop_kruabanrao",
    name: "อาหารตามสั่ง By ครัวบ้านเรา",
    location: "โรงเย็น อาคาร 10 (ชั้น 3)",
    category: "ข้าวราดแกง / อาหารตามสั่ง",
    priceRange: "40 - 70 บาท",
    avgPrice: 55,
    openHours: "08:30 - 17:00 น. (จันทร์ - เสาร์)",
    image: "assets/images/shops/kruabanrao-front.jpg",
    images: [
      "assets/images/shops/kruabanrao-front.jpg",
      "assets/images/shops/kruabanrao-menu-1.jpg",
      "assets/images/shops/kruabanrao-menu-2.jpg"
    ],
    description: "อาหารตามสั่งหลากหลาย ทั้งผัดกะเพรา ข้าวผัด หมูกรอบ ทะเล สุกี้ ต้มยำ ยำ สปาเก็ตตี้ และเมนูไข่ รับทำข้าวกล่อง โทร 087-925-9419 รองรับ QR และคนละครึ่ง",
    tags: ["อาหารตามสั่ง", "หมูกรอบ", "ทะเล", "รับทำข้าวกล่อง", "คนละครึ่ง"],
    rating: 0,
    reviewCount: 0,
    menus: [
      { id: "m_kbr_1", name: "กะเพราหมูกรอบไข่ดาว", price: 60, image: "assets/images/menus/kbr-kaprao-mookrob.jpg", isRecommended: true },
      { id: "m_kbr_2", name: "ข้าวผัดต้มยำทะเล", price: 60, image: "assets/images/menus/kbr-tomyum-seafood-rice.jpg", isRecommended: true },
      { id: "m_kbr_3", name: "สปาเก็ตตี้ขี้เมาทะเล", price: 70, image: "assets/images/menus/kbr-spaghetti-kheemao.jpg", isRecommended: true },
      { id: "m_kbr_4", name: "ข้าวไข่ข้นหมูสับ", price: 50, image: "https://images.unsplash.com/photo-1640267825526-e1f620195173?w=600&auto=format&fit=crop&q=80", isRecommended: true }
    ],
    menuSections: [
      {
        title: "เมนูหมู / หมูสับ / สามชั้น / ตับ",
        subtitle: "ทุกเมนู 50 บาท",
        items: [
          { name: "ข้าวผัด / ผัดกระเพรา / ผัดพริกแกง / ผัดพริกหยวก", price: "50.-" },
          { name: "ราดหน้า / ผัดซีอิ๊ว / ผัดฉ่า / ทอดกระเทียม", price: "50.-" }
        ]
      },
      {
        title: "เมนูไก่ / ไก่สับ / เครื่องใน",
        subtitle: "ทุกเมนู 50 บาท",
        items: [
          { name: "ข้าวผัด / ผัดกระเพรา / ผัดพริกแกง / ผัดพริกหยวก", price: "50.-" },
          { name: "ราดหน้า / ผัดซีอิ๊ว / ผัดฉ่า / ทอดกระเทียม", price: "50.-" }
        ]
      },
      {
        title: "เมนูหมูกรอบ & เนื้อ / เนื้อสับ",
        subtitle: "ทุกเมนู 60 บาท",
        items: [
          { name: "หมูกรอบ: ข้าวผัด / ผัดพริกเกลือ / กระเพรา / พริกแกง / ผัดคะน้า / พริกหยวก / ผัดฉ่า", price: "60.-" },
          { name: "เนื้อ/เนื้อสับ: ข้าวผัด / กระเพรา / พริกแกง / พริกหยวก / น้ำมันหอย / ผัดฉ่า / ทอดกระเทียม", price: "60.-" }
        ]
      },
      {
        title: "เมนูทะเล",
        subtitle: "ทุกเมนู 60 บาท",
        items: [
          { name: "ข้าวผัด / กระเพรา / พริกแกง / พริกหยวก / ราดหน้า / ผัดซีอิ๊ว / ผัดฉ่า / ทอดกระเทียม", price: "60.-" },
          { name: "ผัดพริกเผา / หอยลายผัดพริกเผา / ผัดผงกระหรี่ / หมึกผัดไข่เค็ม / ข้าวผัดต้มยำทะเล", price: "60.-" }
        ]
      },
      {
        title: "สุกี้น้ำ-แห้ง & ต้มจืด",
        items: [
          { name: "สุกี้หมู / สุกี้ไก่ / สุกี้ไก่+หมู", price: "50.-" },
          { name: "สุกี้เนื้อ / สุกี้ทะเล / สุกี้รวมทะเล", price: "60.-" },
          { name: "ต้มจืดเต้าหู้หมูสับ / ต้มจืดเต้าหู้ไก่สับ", price: "60.-" }
        ]
      },
      {
        title: "ต้มยำน้ำใส-น้ำข้น & ยำ",
        items: [
          { name: "ต้มยำไก่ / ต้มยำหมู / ต้มยำหมู+ไก่", price: "60.-" },
          { name: "ต้มยำทะเล / ต้มยำทะเลรวม", price: "70.-" },
          { name: "ยำวุ้นเส้นหมูสับ / ยำวุ้นเส้นไก่สับ / ยำหมูยอ", price: "60.-" },
          { name: "ยำทะเล / ยำทะเลรวม / ยำหมูกรอบ / ยำเนื้อ", price: "70.-" }
        ]
      },
      {
        title: "สปาเก็ตตี้ / มักกะโรนี",
        items: [
          { name: "ขี้เมาหมู / ขี้เมาไก่ / คาโบนารา", price: "60.-" },
          { name: "ซอสเนื้อ / ซอสหมู / ซอสไก่ / หอยลาย", price: "60.-" },
          { name: "ขี้เมาทะเล", price: "70.-" }
        ]
      },
      {
        title: "เมนูไข่",
        items: [
          { name: "ข้าวผัดไข่ / ไข่ข้น / ไข่เจียว", price: "40.-" },
          { name: "ไข่เจียวหมูสับ / ไข่ดาวยำ / ไข่ข้นหมูสับ / ไข่ข้นไก่สับ", price: "50.-" },
          { name: "ไข่ข้นทะเล-แฮม-เบคอน / ไข่เจียวกุ้ง-ทะเล / ไข่เยี่ยวม้ากระเพรากรอบ", price: "60.-" }
        ]
      }
    ]
  },
  {
    id: "spu_shop_shabu_suki",
    name: "ชาบู สุกี้ & ยำแซ่บ",
    location: "โรงเย็น อาคาร 10 (ชั้น 3)",
    category: "ชาบู / หมาล่า",
    priceRange: "10 - 70 บาท",
    avgPrice: 50,
    openHours: "08:30 - 17:00 น. (จันทร์ - เสาร์)",
    image: "assets/images/shops/shabu-suki-front.jpg",
    images: [
      "assets/images/shops/shabu-suki-front.jpg",
      "assets/images/shops/shabu-suki-suki-menu.jpg",
      "assets/images/shops/shabu-suki-mama.jpg",
      "assets/images/shops/shabu-suki-skewers.jpg"
    ],
    description: "ชาบูและยำเสียบไม้ให้เลือกหยิบเองเริ่มต้นไม้ละ 10 บาท (โปร 10 แถม 1) น้ำซุปน้ำดำและหมาล่าฟรี พร้อมเมนูสุกี้ไข่ข้น มาม่าต้มยำ มาม่าไข่เยิ้มคลุกซอส และราเม็ง รองรับ QR และคนละครึ่ง",
    tags: ["ชาบูเสียบไม้", "โปร 10 แถม 1", "สุกี้ไข่ข้น", "มาม่าต้มยำ", "คนละครึ่ง"],
    rating: 0,
    reviewCount: 0,
    menus: [
      { id: "m_shb_1", name: "ชาบู / หมาล่าเสียบไม้ (โปร 10 แถม 1)", price: 10, image: "assets/images/shops/shabu-suki-front.jpg", isRecommended: false },
      { id: "m_shb_2", name: "สุกี้แห้ง / สุกี้น้ำ (ไก่-หมู)", price: 45, image: "assets/images/shops/shabu-suki-suki-menu.jpg", isRecommended: false },
      { id: "m_shb_3", name: "สุกี้ไข่ข้นไก่ / หมู", price: 50, image: "assets/images/shops/shabu-suki-suki-menu.jpg", isRecommended: false },
      { id: "m_shb_4", name: "มาม่าต้มยำ / มาม่าไข่เยิ้มคลุกซอส", price: 50, image: "assets/images/shops/shabu-suki-mama.jpg", isRecommended: false },
      { id: "m_shb_5", name: "ยำเสียบไม้", price: 50, image: "assets/images/shops/shabu-suki-mama.jpg", isRecommended: false },
      { id: "m_shb_6", name: "ราเม็งหมูสี่เหลี่ยม", price: 60, image: "assets/images/shops/shabu-suki-suki-menu.jpg", isRecommended: false }
    ],
    menuSections: [
      {
        title: "น้ำซุป",
        items: [
          { name: "ชาบูน้ำดำ / หมาล่า", price: "ฟรี" },
          { name: "หมาล่าน้ำข้น / ต้มยำน้ำใส", price: "+10.-" },
          { name: "ต้มยำน้ำข้น", price: "+15.-" }
        ]
      },
      {
        title: "ชาบู / หมาล่าเสียบไม้",
        subtitle: "โปร 10 แถม 1",
        items: [
          { name: "หมู-ไก่-เบคอน / ไส้กรอก / ลูกชิ้น / เต้าหู้ / ปูอัด / เห็ด / ผักทุกชนิด", price: "10.- / ไม้" },
          { name: "ฟองเต้าหู้ทอด / กุ้ง / หมึกสด", price: "15.- / ไม้" },
          { name: "สันคอพรีเมียม / สามชั้นพรีเมียม", price: "25.- / 30.-" },
          { name: "เนื้อออสเตรเลีย (วงใหญ่)", price: "50.-" }
        ]
      },
      {
        title: "เส้น & บะหมี่ห่อ",
        items: [
          { name: "วุ้นเส้น / มาม่าไทย / เส้นแก้ว / เส้นหนึบมันเทศ", price: "10.-" },
          { name: "บะหมี่ไข่ญี่ปุ่น / บะหมี่สาหร่าย / เส้นดำหมาล่า", price: "15.-" },
          { name: "มาม่า (15.-) / นิชชิน (20.-) / มาม่า OK (30.-)", price: "15-30.-" },
          { name: "ซัมยัง ห่อดำ (60.-) / ซัมยังรสอื่น (70.-)", price: "60-70.-" }
        ]
      },
      {
        title: "สุกี้ (ธรรมดา / พิเศษ)",
        items: [
          { name: "สุกี้แห้ง-น้ำ ไก่ / หมู", price: "45/50.- (พิเศษ 55/60.-)" },
          { name: "สุกี้ไข่ข้นไก่ / สุกี้น้ำข้นไก่", price: "50.- (พิเศษ 60.-)" },
          { name: "สุกี้ไข่ข้นหมู / สุกี้น้ำข้นหมู", price: "55.- (พิเศษ 65.-)" },
          { name: "สุกี้ไข่ข้นทะเล / รวมมิตร", price: "60.- (พิเศษ 70.-)" }
        ]
      },
      {
        title: "ยำ มาม่า & เมนูพิเศษ",
        items: [
          { name: "ยำเสียบไม้", price: "50.-+" },
          { name: "มาม่าต้มยำ (เลือกเส้นได้)", price: "50.-" },
          { name: "มาม่าไข่เยิ้มคลุกซอส (เกาหลี / ญี่ปุ่น / หมาล่า)", price: "50.-" },
          { name: "ราเม็งหมูสี่เหลี่ยม", price: "60.-" },
          { name: "เพิ่มชีสยืด (มาม่าต้มยำ / สุกี้แห้ง)", price: "+20.-" }
        ]
      }
    ]
  },
  {
    id: "spu_shop_pawan_fried",
    name: "ป้าวรรณ ของทอด",
    location: "โรงเย็น อาคาร 10 (ชั้น 3)",
    category: "ของทอด / ของทานเล่น",
    priceRange: "10 - 40 บาท",
    avgPrice: 30,
    openHours: "08:30 - 17:00 น. (จันทร์ - เสาร์)",
    image: "assets/images/shops/pawan-fried-front.jpg",
    images: [
      "assets/images/shops/pawan-fried-front.jpg",
      "assets/images/shops/pawan-fried-tray.jpg",
      "assets/images/shops/pawan-fried-menu.jpg"
    ],
    description: "ของทอดร้อน ๆ และลูกชิ้นทอดเลือกหยิบได้เองหน้าร้าน น้ำจิ้มรสเด็ดเริ่มต้น 10 บาท มีมันฝรั่งเขย่าคลุกผง 6 รสชาติ ไก่ป๊อปวิงซ์แซ่บ ชีสบอล เกี๊ยวต้ม และทอดผักรวมมิตร รองรับ QR และคนละครึ่ง",
    tags: ["ของทอด", "ลูกชิ้นทอด", "มันฝรั่งเขย่า", "เกี๊ยวต้ม", "คนละครึ่ง"],
    rating: 0,
    reviewCount: 0,
    menus: [
      { id: "m_pwn_1", name: "ลูกชิ้นทอด / ชีสบอล", price: 10, image: "assets/images/shops/pawan-fried-front.jpg", isRecommended: false },
      { id: "m_pwn_2", name: "ชีสสติ๊ก / โดนัทกุ้ง / เกี๊ยวต้มทุกไส้", price: 15, image: "assets/images/shops/pawan-fried-menu.jpg", isRecommended: false },
      { id: "m_pwn_3", name: "ไก่ป๊อปวิงซ์แซ่บเขย่า / ไก่สไปรซี่", price: 30, image: "assets/images/shops/pawan-fried-menu.jpg", isRecommended: false },
      { id: "m_pwn_4", name: "มันฝรั่งเขย่า ทอดสด", price: 30, image: "assets/images/shops/pawan-fried-tray.jpg", isRecommended: false },
      { id: "m_pwn_5", name: "ทอดผักรวมมิตร / กุยช่ายทอด", price: 30, image: "assets/images/shops/pawan-fried-tray.jpg", isRecommended: false },
      { id: "m_pwn_6", name: "สเต็กไก่ชีส / ซูชิทอด", price: 35, image: "assets/images/shops/pawan-fried-menu.jpg", isRecommended: false }
    ],
    menuSections: [
      {
        title: "ลูกชิ้น & ของทอดชิ้นเล็ก",
        items: [
          { name: "ลูกชิ้นทอด น้ำจิ้มอร่อย", price: "เริ่มต้น 10.-" },
          { name: "ชีสบอล", price: "10.- / ลูก" },
          { name: "ชีสสติ๊ก / ไส้กุ้งทอด / โดนัทกุ้ง", price: "15.- / ชิ้น" },
          { name: "เกี๊ยวต้มทุกไส้ (ปูอัด / หมูเด้ง / ไข่เค็ม / กุ้ง)", price: "15.- / ชิ้น" },
          { name: "นักเก็ตไก่ (4 ชิ้น) / ไส้กรอกปลา", price: "20.-" },
          { name: "ปลาม้วนสอดไส้ชีส (2 ชิ้น)", price: "25.-" }
        ]
      },
      {
        title: "ไก่ทอด & มันฝรั่งเขย่า",
        items: [
          { name: "ไก่ป๊อปวิงซ์แซ่บเขย่า", price: "30.- / ถ้วย" },
          { name: "ไก่สไปรซี่ / ไก่แซ่บ / ไก่บาร์บีคิว", price: "30.- / ชิ้น" },
          { name: "มันฝรั่งเขย่า ทอดสด (สไปซี่/ชีส/ปาปริก้า/บาร์บีคิว/วิงซ์แซ่บ/ต้มยำ)", price: "เล็ก 30.- / ใหญ่ 40.-" }
        ]
      },
      {
        title: "ทอดผัก & เมนูพิเศษ",
        items: [
          { name: "ทอดผักรวมมิตร / กุยช่ายทอด", price: "30.- / ชุด" },
          { name: "สเต็กไก่ชีส", price: "35.- / ชิ้น" },
          { name: "ซูชิทอด", price: "40.- / ชิ้น" }
        ]
      }
    ]
  },
  {
    id: "spu_shop_patcha",
    name: "Patcha (Patcha fruit story)",
    location: "โรงเย็น อาคาร 10 (ชั้น 3)",
    category: "เครื่องดื่ม / กาแฟสด / ชานมไข่มุก",
    priceRange: "15 - 55 บาท",
    avgPrice: 40,
    openHours: "08:30 - 17:00 น. (จันทร์ - เสาร์)",
    image: "assets/images/shops/patcha-front.jpg",
    images: [
      "assets/images/shops/patcha-front.jpg",
      "assets/images/shops/patcha-smoothie.jpg",
      "assets/images/shops/patcha-yogurt.jpg"
    ],
    description: "สมูทตี้ผลไม้ปั่นสด 15 รสชาติ เมนูปั่นพริกเกลือ และกรีกโยเกิร์ตเสิร์ฟพร้อมผลไม้ 3 อย่างราดน้ำผึ้ง เพิ่มท็อปปิ้งขนมและซอสได้ พร้อมบราวนี่ดาร์กช็อกโกแลต",
    tags: ["สมูทตี้ผลไม้", "กรีกโยเกิร์ต", "ปั่นพริกเกลือ", "อะโวคาโดปั่น", "บราวนี่"],
    rating: 0,
    reviewCount: 0,
    menus: [
      { id: "m_ptc_1", name: "สมูทตี้ผลไม้ปั่นสด (15 รสชาติ)", price: 35, image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&auto=format&fit=crop&q=80", isRecommended: true },
      { id: "m_ptc_2", name: "ผลไม้ปั่นพริกเกลือ (สับปะรด/มะนาว/เสาวรส)", price: 35, image: "https://images.unsplash.com/photo-1621878974675-91a5f1809ace?w=600&auto=format&fit=crop&q=80", isRecommended: true },
      { id: "m_ptc_3", name: "Greek Yogurt (+ผลไม้ 3 อย่าง +น้ำผึ้ง)", price: 40, image: "https://images.unsplash.com/photo-1722607571891-7ab5396a1b83?w=600&auto=format&fit=crop&q=80", isRecommended: true },
      { id: "m_ptc_4", name: "อะโวคาโดปั่นนมสด", price: 50, image: "https://images.unsplash.com/photo-1557753478-d111aef068be?w=600&auto=format&fit=crop&q=80", isRecommended: true }
    ],
    menuSections: [
      {
        title: "Smoothie ผลไม้ปั่นสด (15 รสชาติ)",
        items: [
          { name: "มิกซ์เบอรี่ / สตรอเบอรี่ / บลูเบอรี่ / ลิ้นจี่ / แอปเปิ้ล / ฝรั่ง / มะม่วง / สับปะรด / ส้ม / เสาวรส / มะนาว / แตงโม / แคนตาลูป / พีช / กีวี", price: "35 / 40 / 45.-" },
          { name: "ระดับความอร่อย: ธรรมดา 35.- / ใส่นม 40.- / ใส่นม+โยเกิร์ต 45.-", price: "เพิ่มผลไม้ +5.-" }
        ]
      },
      {
        title: "Special Menu (นม / โยเกิร์ต / ช็อกโกแลต)",
        items: [
          { name: "อะโวคาโด", price: "50 / 55 / 55.-" },
          { name: "กล้วย / มะพร้าว / นมสดคาราเมล", price: "40 / 45 / 45.-" }
        ]
      },
      {
        title: "ปั่นพริกเกลือ & ท็อปปิ้งสมูทตี้",
        items: [
          { name: "สับปะรด / มะนาว / เสาวรส ปั่นพริกเกลือ", price: "35.-" },
          { name: "Topping: Honey jelly / Caramel / Brown sugar jelly", price: "+10.-" }
        ]
      },
      {
        title: "Greek Yogurt (+ผลไม้ 3 อย่าง +น้ำผึ้ง)",
        items: [
          { name: "Normal Scoop (Original / Strawberry / Blueberry / Mix Berry / Melon / Blue Spirulina)", price: "40.-" },
          { name: "Premium Scoop (Strawberry Jam / Blueberry Jam / Oreo / Biscoff)", price: "50.-" },
          { name: "สตอเบอรี่ล้วน / บลูเบอรี่ล้วน / ผสม", price: "50.-" },
          { name: "เพิ่มผลไม้ตามฤดูกาล", price: "+5-10.-" }
        ]
      },
      {
        title: "ท็อปปิ้งกรีกโยเกิร์ต & ขนม",
        items: [
          { name: "Topping Snacks (แครกเกอร์ / โอรีโอ้ / ครันเบิ้ล / บิสคอฟ / กราโนล่า / คอนเฟลก)", price: "+15.-" },
          { name: "Topping Sauces (ช็อกโกแลต / คาราเมล / แยมสตรอเบอรี่-บลูเบอรี่ / Biscoff)", price: "+10.-" },
          { name: "บราวนี่ดาร์กช็อกโกแลต", price: "15.- / ชิ้น" }
        ]
      }
    ]
  },
  {
    id: "spu_shop_mewaffle",
    name: "Me Waffle",
    location: "โรงร้อน (หลังอาคาร 5)",
    category: "ของหวาน / เบเกอรี่ / วาฟเฟิล",
    priceRange: "15 - 40 บาท",
    avgPrice: 20,
    openHours: "08:30 - 17:00 น. (จันทร์ - เสาร์)",
    image: "assets/images/shops/mewaffle-front.jpg",
    images: [
      "assets/images/shops/mewaffle-front.jpg",
      "assets/images/shops/mewaffle-display.jpg",
      "assets/images/shops/mewaffle-menu.jpg"
    ],
    description: "วาฟเฟิลอบสดชิ้นละ 15 บาท มีให้เลือกถึง 12 รสชาติ พร้อมปาท่องโก๋สเปน (Churros) กรอบนอกนุ่มในเลือกดิปซอสได้ ซื้อดิปปิ้งเพิ่มกระปุกละ 5 บาท รองรับ QR Payment",
    tags: ["วาฟเฟิล", "15 บาท", "ปาท่องโก๋สเปน", "ของหวาน", "โรงร้อน"],
    rating: 0,
    reviewCount: 0,
    menus: [
      { id: "m_mwf_1", name: "วาฟเฟิลอบสด (12 รสชาติ)", price: 15, image: "assets/images/shops/mewaffle-display.jpg", isRecommended: true },
      { id: "m_mwf_2", name: "ปาท่องโก๋สเปน (Churros + ซอสดิป)", price: 40, image: "https://images.unsplash.com/photo-1786420194794-095d83393326?w=600&auto=format&fit=crop&q=80", isRecommended: true }
    ],
    menuSections: [
      {
        title: "วาฟเฟิลอบสด (12 รสชาติ)",
        subtitle: "ชิ้นละ 15 บาท",
        items: [
          { name: "เนยน้ำตาล (Original) / ครีม / สังขยา", price: "15.-" },
          { name: "ฝอยทอง / เผือก / ข้าวโพด / ผลไม้รวม", price: "15.-" },
          { name: "ลูกเกด / อัลมอนด์ / ชีส", price: "15.-" },
          { name: "ช็อกโกแลต / สตรอว์เบอร์รี", price: "15.-" }
        ]
      },
      {
        title: "ปาท่องโก๋สเปน (Churros) & ดิปปิ้ง",
        items: [
          { name: "ปาท่องโก๋สเปน (เลือกรสแป้งและซอสดิปได้ เช่น ช็อกโกแลต / สตรอว์เบอร์รี / นมข้นหวาน)", price: "40.-" },
          { name: "ซื้อดิปปิ้งเพิ่ม", price: "5.- / กระปุก" }
        ]
      }
    ]
  },
  {
    id: "spu_shop_rotnom",
    name: "รถนม น้ำชง-ผลไม้ปั่น",
    location: "โรงเย็น อาคาร 10 (ชั้น 2)",
    category: "เครื่องดื่ม / กาแฟสด / ชานมไข่มุก",
    priceRange: "20 - 45 บาท",
    avgPrice: 30,
    openHours: "08:30 - 17:00 น. (จันทร์ - เสาร์)",
    image: "assets/images/shops/rotnom-front.jpg",
    images: [
      "assets/images/shops/rotnom-front.jpg",
      "assets/images/shops/rotnom-herbal.jpg",
      "assets/images/shops/rotnom-counter.jpg",
      "assets/images/shops/rotnom-pillar.jpg"
    ],
    description: "ร้านเครื่องดื่มครบครันทั้งน้ำสมุนไพร น้ำผลไม้ น้ำชงเย็น และเมนูน้ำปั่นราคานักศึกษา เริ่มต้น 20 บาท มีเฉาก๊วยนมสด รองรับ QR Payment",
    tags: ["น้ำชง", "ผลไม้ปั่น", "นมสด", "น้ำสมุนไพร", "โรงเย็นชั้น 2"],
    rating: 0,
    reviewCount: 0,
    menus: [
      { id: "m_rtn_1", name: "ชาเย็น / ชาเขียวเย็น", price: 30, image: "https://images.unsplash.com/photo-1558857563-b371033873b8?w=600&auto=format&fit=crop&q=80", isRecommended: true },
      { id: "m_rtn_2", name: "โกโก้เย็น / โกโก้ปั่น", price: 30, image: "https://images.unsplash.com/photo-1641665271888-575e46923776?w=600&auto=format&fit=crop&q=80", isRecommended: true },
      { id: "m_rtn_3", name: "นมสดโอรีโอ้ปั่น / นมสดคาราเมลปั่น", price: 45, image: "https://images.unsplash.com/photo-1551782450-40537687757d?w=600&auto=format&fit=crop&q=80", isRecommended: true }
    ],
    menuSections: [
      {
        title: "น้ำสมุนไพร & น้ำผลไม้",
        items: [
          { name: "เก๊กฮวย / ใบเตย / น้ำแดง", price: "20.-" },
          { name: "ลำไย / ส้ม / ฝรั่ง", price: "25.-" },
          { name: "น้ำมะพร้าว / น้ำส้มสด", price: "30.-" }
        ]
      },
      {
        title: "น้ำชงเย็น",
        items: [
          { name: "ชาดำ / ชามะนาว / น้ำเขียวโซดา", price: "25.-" },
          { name: "ชาเขียว / ชาเย็น / ชาแดง / โกโก้ / โอวัลติน / ไวต์มอลต์ / ช็อกโกแลต / ไมโล", price: "30.-" },
          { name: "นมสด / นมสดวนิลา / นมสดมิล / นมสดคาราเมล / นมชมพู / นมเขียว", price: "30.-" },
          { name: "ชาน้ำผึ้งมะนาว / น้ำผึ้งมะนาว / ชาน้ำผึ้งมะนาวโซดา", price: "35.-" }
        ]
      },
      {
        title: "เมนูน้ำปั่น",
        items: [
          { name: "บีทาเก้นปั่น", price: "35.-" },
          { name: "ชาเขียว / ชาแดง / โกโก้ / โอวัลติน / ช็อกโกแลต / ไมโล / นมสด / คาราเมล (ปั่น)", price: "40.-" },
          { name: "ส้มสดปั่น / สตรอว์เบอร์รีปั่น / มะพร้าวปั่น / ยาคูลท์-ปีโป้ปั่น / นมน้ำผึ้ง", price: "40.-" },
          { name: "นมสดโอรีโอ้ปั่น", price: "45.-" }
        ]
      }
    ]
  },
  {
    id: "spu_shop_yentafo",
    name: "ก๋วยเตี๋ยว เย็นตาโฟ (ข้าวต้มปลา & โจ๊ก)",
    location: "โรงเย็น อาคาร 10 (ชั้น 2)",
    category: "ก๋วยเตี๋ยว / บะหมี่ / ราเมน",
    priceRange: "45 - 60 บาท",
    avgPrice: 50,
    openHours: "08:30 - 17:00 น. (จันทร์ - เสาร์)",
    image: "assets/images/shops/yentafo-front.jpg",
    images: [
      "assets/images/shops/yentafo-front.jpg",
      "assets/images/shops/yentafo-counter.jpg",
      "assets/images/shops/yentafo-menu.jpg"
    ],
    description: "ก๋วยเตี๋ยวเย็นตาโฟ ลูกชิ้นปลา กวยจั๊บ เกาเหลาเลือดหมู เกาเหลาปลา ข้าวต้มปลา และโจ๊กข้าวไรซ์เบอร์รี่ (ล็อก 2/8–2/9) รองรับ QR และคนละครึ่ง",
    tags: ["เย็นตาโฟ", "ก๋วยเตี๋ยวลูกชิ้นปลา", "ข้าวต้มปลา", "โจ๊กข้าวไรซ์เบอร์รี่", "คนละครึ่ง"],
    rating: 0,
    reviewCount: 0,
    menus: [
      { id: "m_ytf_1", name: "ก๋วยเตี๋ยวเย็นตาโฟ / ก๋วยเตี๋ยวลูกชิ้นปลา", price: 50, image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&auto=format&fit=crop&q=80", isRecommended: true },
      { id: "m_ytf_2", name: "เกาเหลาเลือดหมู / เกาเหลาปลา", price: 50, image: "https://images.unsplash.com/photo-1701480253822-1842236c9a97?w=600&auto=format&fit=crop&q=80", isRecommended: true },
      { id: "m_ytf_3", name: "โจ๊กหมูใส่ไข่ / ข้าวต้มปลา", price: 55, image: "https://images.unsplash.com/photo-1575841004965-bca4f2a31c1c?w=600&auto=format&fit=crop&q=80", isRecommended: true }
    ],
    menuSections: [
      {
        title: "ก๋วยเตี๋ยว & กวยจั๊บ",
        subtitle: "ชามละ 50 บาท",
        items: [
          { name: "ก๋วยเตี๋ยวเย็นตาโฟ / เย็นตาโฟต้มยำ", price: "50.-" },
          { name: "ก๋วยเตี๋ยวลูกชิ้นปลา / น้ำใส / ต้มยำ", price: "50.-" },
          { name: "มาม่าต้มยำ / เย็นตาโฟ / น้ำใส", price: "50.-" },
          { name: "กวยจั๊บหมูน้ำใส / ต้มยำ", price: "50.-" }
        ]
      },
      {
        title: "เกาเหลา",
        items: [
          { name: "เกาเหลาเลือดหมู", price: "50.-" },
          { name: "เกาเหลาปลา", price: "60.-" }
        ]
      },
      {
        title: "ข้าวต้ม & โจ๊กข้าวไรซ์เบอร์รี่",
        items: [
          { name: "ข้าวต้มหมู / โจ๊กหมู (+ตับ)", price: "45.- (ใส่ไข่ 55.-)" },
          { name: "ข้าวต้มปลา / โจ๊กปลา", price: "50.- (ใส่ไข่ 60.-)" },
          { name: "ข้าวเปล่า / ไข่เยี่ยวม้า", price: "10.-" }
        ]
      }
    ]
  },
  {
    id: "spu_shop_honeyb_shabu",
    name: "ชาบู & หม่าล่า by Honey-B",
    location: "โรงเย็น อาคาร 10 (ชั้น 2)",
    category: "ชาบู / หมาล่า",
    priceRange: "10 - 60 บาท",
    avgPrice: 50,
    openHours: "08:30 - 17:00 น. (จันทร์ - เสาร์)",
    image: "assets/images/shops/honeyb-front.jpg",
    images: [
      "assets/images/shops/honeyb-front.jpg",
      "assets/images/shops/honeyb-soup.jpg"
    ],
    description: "ชาบูและหม่าล่าเสียบไม้เลือกหยิบเองหน้าร้าน ไม้ละ 10 บาท (โปร 10 ไม้ ฟรี 1 ไม้) น้ำซุปน้ำดำและหม่าล่าฟรี พร้อมน้ำซุปเข้มข้นให้เลือกถึง 6 แบบ รองรับ QR และคนละครึ่ง",
    tags: ["ชาบูหม่าล่า", "ไม้ละ 10 บาท", "โปร 10 ฟรี 1", "โรงเย็นชั้น 2", "คนละครึ่ง"],
    rating: 0,
    reviewCount: 0,
    menus: [
      { id: "m_hnb_1", name: "ชาบู / หม่าล่าเสียบไม้ (โปร 10 ไม้ ฟรี 1)", price: 10, image: "assets/images/shops/honeyb-front.jpg", isRecommended: false },
      { id: "m_hnb_2", name: "เซตชาบูหม่าล่า 5 ไม้ + น้ำซุป", price: 50, image: "assets/images/shops/honeyb-soup.jpg", isRecommended: false }
    ],
    menuSections: [
      {
        title: "ชาบู / หม่าล่าเสียบไม้",
        subtitle: "โปร 10 ไม้ ฟรี 1 ไม้",
        items: [
          { name: "ของเสียบไม้เลือกหยิบเอง (เนื้อสัตว์ / ลูกชิ้น / ไส้กรอก / เต้าหู้ / ผัก / เส้น)", price: "10.- / ไม้" }
        ]
      },
      {
        title: "น้ำซุป (6 แบบ)",
        items: [
          { name: "ซุปน้ำดำ / ซุปหม่าล่า", price: "ฟรี" },
          { name: "ซุปกระดูกหมู / ซุปหม่าล่าน้ำข้น", price: "+10.-" },
          { name: "ซุปหม่าล่ากระดูกหมู / ซุปต้มยำ", price: "+10.-" }
        ]
      }
    ]
  },
  {
    id: "spu_shop_sushi_f1",
    name: "ซูชิ & ซาชิมิ (โรงเย็นชั้น 1)",
    location: "โรงเย็น อาคาร 10 (ชั้น 1)",
    category: "ข้าวราดแกง / อาหารตามสั่ง",
    priceRange: "10 - 150 บาท",
    avgPrice: 50,
    openHours: "08:30 - 17:00 น. (จันทร์ - เสาร์)",
    image: "assets/images/shops/sushi1-front.jpg",
    images: [
      "assets/images/shops/sushi1-front.jpg",
      "assets/images/shops/sushi1-pieces.jpg",
      "assets/images/shops/sushi1-menu-main.jpg",
      "assets/images/shops/sushi1-menu-set.jpg"
    ],
    description: "ซูชิคำสดใหม่เลือกหยิบได้เองหน้าตู้เริ่มต้นคำละ 10 บาท พร้อมแซลมอนโรล มากิ โอนิกิริ ซาชิมิ และข้าวหน้าญี่ปุ่น รองรับ QR Payment",
    tags: ["ซูชิ", "คำละ 10 บาท", "แซลมอนซาชิมิ", "ข้าวหน้าญี่ปุ่น", "โรงเย็นชั้น 1"],
    rating: 0,
    reviewCount: 0,
    menus: [
      { id: "m_ssh_1", name: "ซูชิคำ (เลือกหยิบหน้าตู้)", price: 10, image: "assets/images/shops/sushi1-pieces.jpg", isRecommended: false },
      { id: "m_ssh_2", name: "แคลิฟอร์เนียมากิ / ข้าวห่อสาหร่ายรวม (5 ชิ้น)", price: 50, image: "assets/images/shops/sushi1-menu-main.jpg", isRecommended: false },
      { id: "m_ssh_3", name: "ข้าวหน้าสามอย่าง / ข้าวหน้าซาบะย่าง", price: 60, image: "assets/images/shops/sushi1-menu-set.jpg", isRecommended: false },
      { id: "m_ssh_4", name: "แซลมอนโรล / แซลมอนเบิร์น", price: 85, image: "assets/images/shops/sushi1-front.jpg", isRecommended: false }
    ],
    menuSections: [
      {
        title: "ซูชิคำ (เลือกหยิบหน้าตู้)",
        items: [
          { name: "กุ้ง / ไข่กุ้ง / ซาบะดอง / ไข่หวาน / ปูอัด / ปลาหมึก / ยำสาหร่าย / แมงกะพรุน / ทูน่ามาโย / แคลิฟอร์เนียโรล", price: "10.- / คำ" },
          { name: "แซลมอน / แซลมอนเบิร์น / แซลมอนไข่กุ้ง / ทูน่าสด", price: "15.- / คำ" },
          { name: "ปลาไหล (Unagi)", price: "20.- / คำ" }
        ]
      },
      {
        title: "โรล มากิ & ข้าวปั้น",
        items: [
          { name: "เทมากิ / โอนิกิริ / มากิเซ็ต 6 ชิ้น", price: "35.-" },
          { name: "แคลิฟอร์เนียมากิ / ข้าวห่อสาหร่ายรวม / เอบิโกะ (5 ชิ้น)", price: "50.-" },
          { name: "แซลมอนเบิร์น / แซลมอนโรล (5 ชิ้น)", price: "85.- / 95.-" }
        ]
      },
      {
        title: "ซาชิมิ & ข้าวหน้าญี่ปุ่น",
        items: [
          { name: "ปูอัดซาชิมิ / ข้าวหน้าสามอย่าง", price: "60.-" },
          { name: "ข้าวหน้าซาบะย่าง", price: "85.-" },
          { name: "ทาโกะซาชิมิ (120.-) / ทูน่าซาชิมิ (140.-) / แซลมอนซาชิมิ (150.-)", price: "120-150.-" },
          { name: "ท็อปปิ้ง: วาซาบิ-มายองเนส-สาหร่าย (+10.-) / ไข่กุ้ง (+20.-)", price: "+10-20.-" }
        ]
      }
    ]
  },
  {
    id: "spu_shop_waffle_hk",
    name: "วาฟเฟิลฮ่องกง & ขนมโตเกียว (K1/4)",
    location: "โรงเย็น อาคาร 10 (ชั้น 1)",
    category: "ของหวาน / เบเกอรี่ / วาฟเฟิล",
    priceRange: "15 - 70 บาท",
    avgPrice: 40,
    openHours: "08:30 - 17:00 น. (จันทร์ - เสาร์)",
    image: "assets/images/shops/waffle-hk-front.jpg",
    images: [
      "assets/images/shops/waffle-hk-front.jpg",
      "assets/images/shops/waffle-hk-tokyo.jpg",
      "assets/images/shops/waffle-hk-menu.jpg",
      "assets/images/shops/waffle-hk-tokyo-menu.jpg"
    ],
    description: "วาฟเฟิลฮ่องกงเลือกแป้งและไส้ได้ตามใจ พร้อมขนมโตเกียว 3 ชิ้น 35 บาทคละไส้ได้ ขนมปังสังขยาใบเตย ชีสโทส และแพนเค้กมินิ รองรับ QR และคนละครึ่ง",
    tags: ["วาฟเฟิลฮ่องกง", "ขนมโตเกียว", "สังขยาใบเตย", "ชีสโทส", "คนละครึ่ง"],
    rating: 0,
    reviewCount: 0,
    menus: [
      { id: "m_whk_1", name: "วาฟเฟิลฮ่องกง (แป้งธรรมดา / ทูโทน / OREO)", price: 40, image: "https://images.unsplash.com/photo-1754444217183-40cb409ad3d8?w=600&auto=format&fit=crop&q=80", isRecommended: true },
      { id: "m_whk_2", name: "ขนมโตเกียว 3 ชิ้น (คละไส้คาว-หวาน)", price: 35, image: "assets/images/shops/waffle-hk-tokyo.jpg", isRecommended: true },
      { id: "m_whk_3", name: "ขนมปังสังขยาใบเตย / ชีสโทส", price: 40, image: "https://images.unsplash.com/photo-1513456753721-b3f94be66822?w=600&auto=format&fit=crop&q=80", isRecommended: true }
    ],
    menuSections: [
      {
        title: "วาฟเฟิลฮ่องกง (เลือกแป้ง & ไส้)",
        items: [
          { name: "แป้งธรรมดา (40.-) / ช็อกโกแลต-ชาร์โคล (45.-) / แป้งทูโทน (50.-) / มัทฉะ-มันม่วง (55.-)", price: "40-55.-" },
          { name: "ใส่ไส้เพิ่ม: 1 อย่าง (+10.-) / 2 อย่าง (+15.-) / 3 อย่าง (+20.-)", price: "+10-20.-" },
          { name: "OREO Egg Waffle (50.-) / M&M Waffle (55.-) / วิปครีม+ฝอยทอง (70.-)", price: "50-70.-" },
          { name: "ซอส (+5-15.-) / มาชเมลโล่-เยลลี่ (+10.-) / วิปครีม (+20.-)", price: "+5-20.-" }
        ]
      },
      {
        title: "ขนมโตเกียว",
        subtitle: "3 ชิ้น 35.- คละไส้ได้",
        items: [
          { name: "ไส้คาว: ไข่+หมูสับ / ไส้กรอก / แฮม+ชีส / ไข่+ชีส / ชีสล้วน", price: "3 ชิ้น 35.-" },
          { name: "ไส้หวาน: ครีม / นูเทล่า / เนย+นม / นูเทล่า+ฝอยทอง / กล้วย+นูเทล่า / โอรีโอ้ / มาชเมลโล่", price: "3 ชิ้น 35.-" },
          { name: "ขนมโตเกียวไส้ผักโขมอบชีส", price: "15.- / ชิ้น" }
        ]
      },
      {
        title: "ขนมปัง แพนเค้ก & ขนมทานเล่น",
        items: [
          { name: "เนยกรอบ", price: "30.- / กล่อง" },
          { name: "แพนเค้กมินิ / ขนมปังชีสโทส", price: "35.-" },
          { name: "ขนมปังสังขยาใบเตย", price: "40.- / ชุด" }
        ]
      }
    ]
  },
  {
    id: "spu_shop_sweet_lemon",
    name: "SWEET LEMON (ร้านมะนาวหวาน)",
    location: "โรงเย็น อาคาร 10 (ชั้น 1)",
    category: "ของหวาน / เบเกอรี่ / วาฟเฟิล",
    priceRange: "35 - 100 บาท",
    avgPrice: 49,
    openHours: "08:30 - 17:00 น. (จันทร์ - เสาร์)",
    image: "assets/images/shops/sweetlemon-front.jpg",
    images: [
      "assets/images/shops/sweetlemon-front.jpg",
      "assets/images/shops/sweetlemon-menu.jpg",
      "assets/images/shops/sweetlemon-poster.jpg"
    ],
    description: "โมจิผลไม้ครีมชีสแป้งนุ่มหนึบเลือกผลไม้และครีมชีสได้เอง พร้อมสตรอว์เบอร์รีโยเกิร์ตเกล็ดหิมะ ผลไม้สดตามฤดูกาล และยำผลไม้ รองรับ QR Payment",
    tags: ["โมจิผลไม้ครีมชีส", "สตรอว์เบอร์รีโยเกิร์ต", "ผลไม้สด", "โรงเย็นชั้น 1"],
    rating: 0,
    reviewCount: 0,
    menus: [
      { id: "m_swl_1", name: "สตรอว์เบอร์รีโยเกิร์ต (Size S / M)", price: 35, image: "https://images.unsplash.com/photo-1722607571891-7ab5396a1b83?w=600&auto=format&fit=crop&q=80", isRecommended: true },
      { id: "m_swl_2", name: "โมจิผลไม้ครีมชีส (Mini S / M / L)", price: 49, image: "assets/images/shops/sweetlemon-poster.jpg", isRecommended: true }
    ],
    menuSections: [
      {
        title: "โมจิผลไม้ ครีมชีส",
        items: [
          { name: "ไซส์ Mini S (ผลไม้ 1 อย่าง + ครีมชีส 1 อย่าง)", price: "49.-" },
          { name: "ไซส์ M (ผลไม้ 2 อย่าง + ครีมชีส 1 อย่าง)", price: "69.-" },
          { name: "ไซส์ L (ผลไม้ 3 อย่าง + ครีมชีส 2 อย่าง)", price: "100.-" },
          { name: "เลือกผลไม้: สตรอว์เบอร์รี / องุ่นไชน์มัสคัส / กล้วย / กีวี่ / บลูเบอร์รี · ขนมคลุก: โอรีโอ้ / แครกเกอร์ / คอร์นเฟลก", price: "เลือกได้" }
        ]
      },
      {
        title: "โยเกิร์ต & ผลไม้สด",
        items: [
          { name: "สตรอว์เบอร์รีโยเกิร์ต (Size S / Size M)", price: "35.- / 45.-" },
          { name: "ผลไม้สดตามฤดูกาล / ผลไม้โยเกิร์ตเกล็ดหิมะ / ยำผลไม้", price: "ตามหน้าร้าน" }
        ]
      }
    ]
  },
  {
    id: "spu_shop_tcoffee",
    name: "ที - คอฟฟี่ / T-COFFEE (K1/2)",
    location: "โรงเย็น อาคาร 10 (ชั้น 1)",
    category: "เครื่องดื่ม / กาแฟสด / ชานมไข่มุก",
    priceRange: "25 - 50 บาท",
    avgPrice: 35,
    openHours: "08:30 - 17:00 น. (จันทร์ - เสาร์)",
    image: "assets/images/shops/tcoffee-front.jpg",
    images: [
      "assets/images/shops/tcoffee-front.jpg",
      "assets/images/shops/tcoffee-menu-1.jpg",
      "assets/images/shops/tcoffee-menu-2.jpg"
    ],
    description: "น้ำชงเย็น-ปั่น นมสด ผลไม้สมูทตี้ สมูทตี้โยเกิร์ต และอิตาเลียนโซดากว่า 50 เมนู ท็อปปิ้งแน่น พร้อมไอศกรีมตัก Wall's รองรับ QR Payment",
    tags: ["น้ำชง", "ผลไม้ปั่น", "สมูทตี้โยเกิร์ต", "อิตาเลียนโซดา", "โรงเย็นชั้น 1"],
    rating: 0,
    reviewCount: 0,
    menus: [
      { id: "m_tcf_1", name: "ชาไทย / ชาเขียว / โกโก้ (เย็น 25 / ปั่น 35)", price: 25, image: "https://images.unsplash.com/photo-1558857563-b371033873b8?w=600&auto=format&fit=crop&q=80", isRecommended: true },
      { id: "m_tcf_2", name: "สมูทตี้ผลไม้ปั่น / มะพร้าวนมสดปั่น", price: 35, image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&auto=format&fit=crop&q=80", isRecommended: true },
      { id: "m_tcf_3", name: "อะโวคาโดปั่น", price: 50, image: "https://images.unsplash.com/photo-1557753478-d111aef068be?w=600&auto=format&fit=crop&q=80", isRecommended: true }
    ],
    menuSections: [
      {
        title: "น้ำผลไม้สมูทตี้ & สมูทตี้โยเกิร์ต",
        items: [
          { name: "เอ็มร้อยปั่น / น้ำอัดลมปั่น", price: "30.-" },
          { name: "มะพร้าวนมสด / ส้ม / เสาวรส / กล้วยหอม / มะนาว / สับปะรด / มะม่วง / สตอเบอรี่ / บลูเบอรี่ / แอปเปิ้ล / ลิ้นจี่ (ปั่น)", price: "35.-" },
          { name: "สมูทตี้โยเกิร์ต (สตอเบอรี่ / บลูเบอรี่ / มะม่วง / เสาวรส / สับปะรด / ลิ้นจี่)", price: "40.-" },
          { name: "อะโวคาโดปั่น", price: "50.-" }
        ]
      },
      {
        title: "เมนูโซดา",
        subtitle: "ทุกเมนู 25 บาท",
        items: [
          { name: "น้ำแดง / บลูฮาวาย / น้ำเขียว / บลูเบอรี่ / ส้ม / สตอเบอรี่ / องุ่น / แอปเปิ้ล / ลิ้นจี่ / เสาวรส โซดา", price: "25.-" }
        ]
      },
      {
        title: "เมนูนมสด & น้ำชง (เย็น / ปั่น)",
        items: [
          { name: "นมชมพู / ชาเขียว / ชาไทย / กาแฟ / โกโก้", price: "เย็น 25.- / ปั่น 35.-" },
          { name: "นมสด (30/35.-) · นมสดคาราเมล / ไวท์มอลต์ (30/40.-) · เนสวีต้า (35/40.-)", price: "30-40.-" },
          { name: "นมเปรี้ยวปีโป้ / ยาคูลท์ปีโป้ / กล้วยนมสด / ไมโล / โอวัลติน ปั่น", price: "35.-" },
          { name: "เฉาก๊วยนมสดคาราเมลปั่น / โกโก้ปั่น+กล้วยหอม หรือ สตอเบอรี่", price: "40.-" }
        ]
      }
    ]
  },
  {
    id: "spu_shop_freshy_crepe",
    name: "FRESHY CREPE (เฟรชชี่ เครป — K1/1)",
    location: "โรงเย็น อาคาร 10 (ชั้น 1)",
    category: "ของหวาน / เบเกอรี่ / วาฟเฟิล",
    priceRange: "30 - 50 บาท",
    avgPrice: 40,
    openHours: "08:30 - 17:00 น. (จันทร์ - เสาร์)",
    image: "assets/images/shops/freshycrepe-front.jpg",
    images: [
      "assets/images/shops/freshycrepe-front.jpg",
      "assets/images/shops/freshycrepe-recommend.jpg",
      "assets/images/shops/freshycrepe-menu-1.jpg",
      "assets/images/shops/freshycrepe-menu-2.jpg"
    ],
    description: "เครปกรอบหอมเลือกแป้งออริจินัลหรือชาร์โคล (1–2 ไส้เริ่มต้น 35 บาท) ไส้คาว-หวาน-แยมกว่า 50 รายการ เลือกม้วนหรือตัดใส่จานได้ รองรับ QR และคนละครึ่ง",
    tags: ["เครปกรอบ", "แป้งชาร์โคล", "นูเทลล่าฝอยทอง", "คนละครึ่ง", "โรงเย็นชั้น 1"],
    rating: 0,
    reviewCount: 0,
    menus: [
      { id: "m_fcr_1", name: "เครปพริกเผา + หมูหยอง", price: 35, image: "assets/images/shops/freshycrepe-recommend.jpg", isRecommended: true },
      { id: "m_fcr_2", name: "เครปแฮม + ไส้กรอก + ชีส", price: 45, image: "assets/images/shops/freshycrepe-front.jpg", isRecommended: true },
      { id: "m_fcr_3", name: "เครปนูเทลล่า + ฝอยทอง + กล้วยหอม", price: 50, image: "assets/images/shops/freshycrepe-recommend.jpg", isRecommended: true }
    ],
    menuSections: [
      {
        title: "ราคาเริ่มต้น & เลือกแป้ง",
        items: [
          { name: "แป้ง Original / ชาร์โคล (เลือก 1–2 ไส้ปกติ)", price: "35.-" },
          { name: "เพิ่มไส้ปกติ (+5.-) / ไส้พิเศษ: นูเทลล่า, เนยถั่ว, ฝอยทอง, ชีส, ทูน่า, ไข่, หมูสับ, วิปครีม (+10.-)", price: "+5 / +10.-" }
        ]
      },
      {
        title: "เมนูคาวแนะนำ",
        items: [
          { name: "พริกเผา+หมูหยอง / ไส้กรอก+แฮม / แฮม+ปูอัด", price: "35.-" },
          { name: "ไข่+แฮม / ปูอัด+ยำสาหร่าย / ทูน่า+แฮม", price: "40.-" },
          { name: "แฮม+ไส้กรอก+ชีส / พิซซ่า+แฮม+ชีส / แฮม+ไส้กรอก+ปูอัด+พริกเผา / พริกเผา+ไข่+หมูหยอง", price: "45.-" },
          { name: "ไข่+แฮม+ชีส / ไข่+หมูสับ+พริกเผา / ทูน่า+ไข่+พริกเผา / พิซซ่า+ทูน่า+ชีส", price: "50.-" }
        ]
      },
      {
        title: "เมนูหวานแนะนำ",
        items: [
          { name: "หมูหยอง+นมข้น (30.-) · นูเทลล่า / เนยถั่ว / กล้วย+ช็อกโกแลต / กล้วย+สตรอว์เบอร์รี (35.-)", price: "30-35.-" },
          { name: "นูเทลล่า+มาร์ชเมลโลว์ / นูเทลล่า+เยลลี่ / วนิลา+กล้วย+ช็อคชิพ", price: "40.-" },
          { name: "นูเทลล่า+ฝอยทอง / นูเทลล่า+ชีส / เนยถั่ว+ไวท์ช็อค+ช็อคชิพ / ซุปข้าวโพด+ชีส", price: "45.-" },
          { name: "นูเทลล่า+ฝอยทอง+กล้วยหอม / เนยถั่ว+ฝอยทอง+กล้วยหอม", price: "50.-" }
        ]
      }
    ]
  },
  {
    id: "spu_shop_bangkaew",
    name: "บางแก้ว ชาไข่มุก กาแฟสด",
    location: "โรงเย็น อาคาร 10 (ชั้น 1)",
    category: "เครื่องดื่ม / กาแฟสด / ชานมไข่มุก",
    priceRange: "25 - 40 บาท",
    avgPrice: 30,
    openHours: "08:30 - 17:00 น. (จันทร์ - เสาร์)",
    image: "assets/images/shops/bangkaew-front.jpg",
    images: [
      "assets/images/shops/bangkaew-front.jpg",
      "assets/images/shops/bangkaew-best.jpg",
      "assets/images/shops/bangkaew-menu-1.jpg",
      "assets/images/shops/bangkaew-menu-2.jpg"
    ],
    description: "ชานมไต้หวัน กาแฟสด บราวน์ชูการ์ มัทฉะ นมหมี และปังเย็น 40 บาท ทุกเมนูสั่งปั่นเพิ่ม 10 บาท (โทร 083-620-1061) รองรับ QR และคนละครึ่ง",
    tags: ["ชานมไข่มุก", "บราวน์ชูการ์", "ปังเย็น", "นมหมี", "คนละครึ่ง"],
    rating: 0,
    reviewCount: 0,
    menus: [
      { id: "m_bgk_1", name: "ชาไต้หวันบราวน์ชูการ์ / โกโก้บราวน์ชูการ์", price: 30, image: "https://images.unsplash.com/photo-1641665271888-575e46923776?w=600&auto=format&fit=crop&q=80", isRecommended: true },
      { id: "m_bgk_2", name: "มัทฉะนมสด / นมหมีมัทฉะ", price: 30, image: "https://images.unsplash.com/photo-1751563721808-3b81940b88f7?w=600&auto=format&fit=crop&q=80", isRecommended: true },
      { id: "m_bgk_3", name: "ปังเย็น (ชาไทย / ชาเขียว / โอรีโอ้ / นมชมพู)", price: 40, image: "assets/images/shops/bangkaew-front.jpg", isRecommended: true }
    ],
    menuSections: [
      {
        title: "Best Seller & บราวน์ชูการ์",
        items: [
          { name: "มันม่วงนมสด / มัทฉะนมสด", price: "30.-" },
          { name: "ชาไต้หวันบราวน์ชูการ์ / นมสดบราวน์ชูการ์ / โกโก้บราวน์ชูการ์", price: "30.-" }
        ]
      },
      {
        title: "ชานมไต้หวัน ชาไทย ชาเขียว โกโก้ & กาแฟ",
        subtitle: "ปั่นเพิ่ม +10.-",
        items: [
          { name: "ชานมไต้หวัน / น้ำผึ้ง / คาราเมล / วนิลา / ลิ้นจี่ / สตอเบอรี่ / เมล่อน / โกโก้ / กาแฟ", price: "25.-" },
          { name: "ชาไทย / ชาเขียวนม / ชามะนาว / โกโก้ / โอเลี้ยง / กาแฟโบราณ / เนสกาแฟ", price: "25.-" },
          { name: "นมชมพู / นมสด / นมสดคาราเมล (25.-) · นมสดมะพร้าว / ชาพีช-กุหลาบ-มะลิ / โยเกิร์ตผลไม้ (30.-)", price: "25-30.-" },
          { name: "ชาน้ำผลไม้ & โซดา (เมล่อน / สตอเบอรี่ / ลิ้นจี่ / แอปเปิ้ล / แดงโซดา)", price: "25.-" }
        ]
      },
      {
        title: "นมหมี ปังเย็น & ท็อปปิ้ง",
        items: [
          { name: "นมหมีปั่น (35.-) / นมหมีมัทฉะ / นมหมีบราวน์ (40.-)", price: "35-40.-" },
          { name: "ปังเย็น (ชาไทย / ชาเขียว / โอรีโอ้ / นมชมพู)", price: "40.-" },
          { name: "ท็อปปิ้ง: ไข่มุกสีดำ / เยลลี่ฟรุ๊ตสลัด (+5.-) · มุกป๊อป / มุกบราวน์ชูการ์ (+10.-)", price: "+5 / +10.-" }
        ]
      }
    ]
  },
  {
    id: "spu_shop_thanyarachada",
    name: "ข้าวมันไก่ ธัญรัชดา (1/12)",
    location: "โรงเย็น อาคาร 10 (ชั้น 1)",
    category: "ข้าวราดแกง / อาหารตามสั่ง",
    priceRange: "50 - 55 บาท",
    avgPrice: 50,
    openHours: "08:30 - 17:00 น. (จันทร์ - เสาร์)",
    image: "assets/images/shops/thanyarachada-front.jpg",
    images: [
      "assets/images/shops/thanyarachada-front.jpg",
      "assets/images/shops/thanyarachada-menu.jpg"
    ],
    description: "ข้าวมันไก่เจ้าประจำโรงเย็นชั้น 1 (Since 2006 ล็อก 1/12) มีทั้งไก่ต้ม ไก่ทอด ไก่ย่าง ไก่ผสม และซุปเปอร์ขาไก่แซ่บ โทรสั่ง 085-159-2506 รองรับ QR และคนละครึ่ง",
    tags: ["ข้าวมันไก่", "ไก่ทอด", "ซุปเปอร์ขาไก่", "คนละครึ่ง", "โรงเย็นชั้น 1"],
    rating: 0,
    reviewCount: 0,
    menus: [
      { id: "m_tyr_1", name: "ข้าวมันไก่ต้ม / ข้าวมันไก่ทอด", price: 50, image: "https://images.unsplash.com/photo-1788227382148-cb8501f2591c?w=600&auto=format&fit=crop&q=80", isRecommended: true },
      { id: "m_tyr_2", name: "ข้าวมันไก่ผสม (ต้ม+ทอด)", price: 55, image: "assets/images/shops/thanyarachada-menu.jpg", isRecommended: true },
      { id: "m_tyr_3", name: "ซุปเปอร์ขาไก่", price: 55, image: "assets/images/shops/thanyarachada-front.jpg", isRecommended: true }
    ],
    menuSections: [
      {
        title: "เมนูข้าวมันไก่ & ซุปเปอร์",
        items: [
          { name: "ข้าวมันไก่ต้ม", price: "50.-" },
          { name: "ข้าวมันไก่ทอด", price: "50.-" },
          { name: "ข้าวมันไก่ย่าง", price: "50.-" },
          { name: "ข้าวมันไก่ผสม", price: "55.-" },
          { name: "ซุปเปอร์ขาไก่ / ตีนไก่", price: "55.-" }
        ]
      }
    ]
  },
  {
    id: "spu_shop_chimkonterm",
    name: "ชิมก่อนเติม Halal Food (1/11)",
    location: "โรงเย็น อาคาร 10 (ชั้น 1)",
    category: "ข้าวราดแกง / อาหารตามสั่ง",
    priceRange: "45 - 60 บาท",
    avgPrice: 50,
    openHours: "08:30 - 17:00 น. (จันทร์ - เสาร์)",
    image: "assets/images/shops/chimkonterm-front.jpg",
    images: [
      "assets/images/shops/chimkonterm-front.jpg",
      "assets/images/shops/chimkonterm-recommend.jpg",
      "assets/images/shops/chimkonterm-menu-1.jpg",
      "assets/images/shops/chimkonterm-menu-2.jpg"
    ],
    description: "ร้านอาหารฮาลาล (Halal) ล็อก 1/11 เด่นเรื่องข้าวหมกไก่ แกงกะหรี่ไก่ ยำไก่แซ่บ และเมนูกะเพรา-กระเทียมเนื้อโคขุนสับ รับทำข้าวกล่อง โทร 091-770-1888 รองรับ QR และคนละครึ่ง",
    tags: ["ฮาลาล", "ข้าวหมกไก่", "เนื้อโคขุน", "ยำไก่แซ่บ", "คนละครึ่ง"],
    rating: 0,
    reviewCount: 0,
    menus: [
      { id: "m_ckt_1", name: "ข้าวหมกไก่ / ข้าวหมกไก่ทอด", price: 50, image: "https://images.unsplash.com/photo-1630409346824-4f0e7b080087?w=600&auto=format&fit=crop&q=80", isRecommended: true },
      { id: "m_ckt_2", name: "ข้าวแกงกะหรี่ไก่ / ไก่ทอด", price: 50, image: "https://images.unsplash.com/photo-1768179669433-bd9d52949c20?w=600&auto=format&fit=crop&q=80", isRecommended: true },
      { id: "m_ckt_3", name: "ข้าวกะเพราเนื้อโคขุนสับ / กระเทียมเนื้อสับ", price: 60, image: "assets/images/menus/kbr-kaprao-mookrob.jpg", isRecommended: true }
    ],
    menuSections: [
      {
        title: "เมนูข้าวหมก & แกง",
        items: [
          { name: "ข้าวหมกไก่ / ข้าวหมกไก่ทอด", price: "50.-" },
          { name: "ข้าวแกงกะหรี่ไก่ / ข้าวแกงกะหรี่ไก่ทอด", price: "50.-" },
          { name: "ข้าวแกงพะแนงไก่กรอบ (50.-) / ข้าวแกงเขียวหวานไก่กรอบ (60.-)", price: "50-60.-" },
          { name: "เมนูแนะนำข้าวหมกพิเศษ (ข้าวหมกไก่แซ่บ / กะเพราไก่กรอบ / แกงกะหรี่)", price: "60.-" }
        ]
      },
      {
        title: "เมนูไก่ทอด ไก่กรอบ & เนื้อโคขุน",
        items: [
          { name: "ข้าวไก่ทอดซอสมะขาม / ซอสน้ำปลา / จิ้มแจ่ว / ยำไก่แซ่บ", price: "50.-" },
          { name: "ข้าวกะเพราไก่กรอบ / ข้าวไก่กรอบคั่วพริกเกลือ", price: "50.-" },
          { name: "ข้าวกะเพราเนื้อโคขุนสับ / ข้าวกระเทียมเนื้อโคขุนสับ", price: "60.-" },
          { name: "เพิ่มไข่ดาว / ข้าวหอมมะลิ / ไก่ (+10.-) · เพิ่มเนื้อ (+20.-)", price: "+10 / +20.-" }
        ]
      }
    ]
  },
  {
    id: "spu_shop_ohmmy_egg",
    name: "โอมมี่ ไข่ใส่เครื่อง (ข้าวไข่เจียว-ไข่ข้น)",
    location: "โรงเย็น อาคาร 10 (ชั้น 1)",
    category: "ข้าวราดแกง / อาหารตามสั่ง",
    priceRange: "40 - 60 บาท",
    avgPrice: 50,
    openHours: "08:30 - 17:00 น. (จันทร์ - เสาร์)",
    image: "assets/images/shops/ohmmy-front.jpg",
    images: [
      "assets/images/shops/ohmmy-front.jpg",
      "assets/images/shops/ohmmy-menu.jpg"
    ],
    description: "ข้าวไข่เจียว ไข่ข้น ไข่ดาว เลือกเครื่องใส่ไข่ได้เองกว่า 17 อย่าง น้ำพริกกะปิและพริกน้ำปลาตักฟรี พร้อมห่อหมกปลากราย 15 บาท รองรับ QR, คนละครึ่ง และ WeChat Pay",
    tags: ["ข้าวไข่เจียว", "ข้าวไข่ข้น", "เลือกเครื่องเอง", "น้ำพริกกะปิฟรี", "คนละครึ่ง"],
    rating: 0,
    reviewCount: 0,
    menus: [
      { id: "m_ohm_1", name: "ข้าวไข่เจียว / ไข่ข้น 1 ฟอง (เลือกเครื่อง 4 อย่าง)", price: 40, image: "https://images.unsplash.com/photo-1640267825526-e1f620195173?w=600&auto=format&fit=crop&q=80", isRecommended: true },
      { id: "m_ohm_2", name: "ข้าวไข่ข้นหมูหวาน / ไก่เทอริยากิ", price: 50, image: "assets/images/shops/ohmmy-front.jpg", isRecommended: true },
      { id: "m_ohm_3", name: "ข้าวไข่ข้นห่อหมกทะเล / โหระพายำปลากระป๋อง", price: 50, image: "assets/images/shops/ohmmy-front.jpg", isRecommended: true }
    ],
    menuSections: [
      {
        title: "สั่งแบบเลือกเครื่องเอง (ไข่เจียว / ไข่ข้น / ไข่ดาว)",
        subtitle: "น้ำพริกกะปิ-พริกน้ำปลา ตักฟรี!",
        items: [
          { name: "ไข่ 1 ฟอง (เลือกเครื่องได้ 4 อย่าง)", price: "40.-" },
          { name: "ไข่ 2 ฟอง (เลือกเครื่องได้ 5 อย่าง)", price: "50.-" },
          { name: "ไข่ 3 ฟอง (เลือกเครื่องได้ 6 อย่าง)", price: "60.-" },
          { name: "เครื่อง 17 อย่าง: หมูสับ/ไส้กรอก/แฮม/ปูอัด/แหนม/หมูยอ/เต้าหู้ไข่/ชะอม/พริก/ต้นหอม/แครอท/ข้าวโพด/ผักสามสี/หอมใหญ่/หอมแดง/สาหร่าย/โหระพา", price: "รวมในชุด" },
          { name: "ท็อปปิ้งเพิ่ม: ชีส / ไข่กุ้ง", price: "+10.-" }
        ]
      },
      {
        title: "เมนูจานพิเศษหน้าเคาน์เตอร์",
        items: [
          { name: "ข้าวไข่ข้นหมูหวาน / ไก่ผัดซอสเทอริยากิ", price: "50 / 60.-" },
          { name: "ข้าวไข่ข้นโหระพายำปลากระป๋อง / ห่อหมกทะเล", price: "50 / 60.-" },
          { name: "ห่อหมกปลากราย", price: "15.-" }
        ]
      }
    ]
  },
  {
    id: "spu_shop_drinks_f1",
    name: "บริการเครื่องดื่ม & ขนม (โรงเย็นชั้น 1)",
    location: "โรงเย็น อาคาร 10 (ชั้น 1)",
    category: "เครื่องดื่ม / กาแฟสด / ชานมไข่มุก",
    priceRange: "10 - 35 บาท",
    avgPrice: 15,
    openHours: "08:30 - 17:00 น. (จันทร์ - เสาร์)",
    image: "assets/images/shops/drinks1-front.jpg",
    images: [
      "assets/images/shops/drinks1-front.jpg",
      "assets/images/shops/drinks1-counter.jpg"
    ],
    description: "จุดบริการน้ำดื่มขวดละ 10 บาท เครื่องดื่มแช่เย็น น้ำอัดลม ชาเขียว น้ำผลไม้ พร้อมขนมขบเคี้ยว แซนด์วิช และของใช้สะดวกซื้อเลือกหยิบได้เอง รองรับ QR และ WeChat Pay",
    tags: ["น้ำดื่ม 10 บาท", "น้ำอัดลม", "ขนมขบเคี้ยว", "แซนด์วิช", "โรงเย็นชั้น 1"],
    rating: 0,
    reviewCount: 0,
    menus: [
      { id: "m_dr1_1", name: "น้ำดื่มแช่เย็น (ออร่า / น้ำเปล่า)", price: 10, image: "assets/images/shops/drinks1-counter.jpg", isRecommended: false },
      { id: "m_dr1_2", name: "น้ำอัดลม / ชาพร้อมดื่ม / เครื่องดื่มแช่เย็น", price: 20, image: "assets/images/shops/drinks1-front.jpg", isRecommended: false }
    ],
    menuSections: [
      {
        title: "เครื่องดื่มแช่เย็น",
        items: [
          { name: "น้ำดื่ม (ออร่า / น้ำเปล่า)", price: "10.-" },
          { name: "น้ำอัดลม / ชาเขียว / น้ำผลไม้ / เครื่องดื่มชูกำลัง (แช่เย็น / ใส่น้ำแข็ง)", price: "ตามราคาหน้าตู้" }
        ]
      },
      {
        title: "ขนมขบเคี้ยว แซนด์วิช & ของสะดวกซื้อ",
        items: [
          { name: "โอรีโอ้ / คิทแคท / ไมโล / เมนทอส / เวเฟอร์ / ถั่วอบ / ขนมซอง", price: "เลือกหยิบหน้าร้าน" },
          { name: "แซนด์วิชกล่อง / ขนมถ้วย / ทิชชู / ยาดมโป๊ยเซียน", price: "เลือกหยิบหน้าร้าน" }
        ]
      }
    ]
  }
];

const INITIAL_REVIEWS = [];

const INITIAL_NEWS = [];
