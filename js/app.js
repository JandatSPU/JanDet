/**
 * จานเด็ด SPU - แอปพลิเคชันหลัก (Main Application Engine)
 * เชื่อมต่อ Firebase Authentication และ Cloud Firestore แบบเรียลไทม์ (พร้อมใช้งานบน GitHub Pages)
 */

// ============================================================================
// 1. Live Application State (Synced Real-time via Cloud Firestore)
// ============================================================================

const LOCAL_PREF_KEYS = {
  DARK_MODE: 'spu_food_dark_mode',
  VISITOR_UUID: 'spu_visitor_uuid'
};

const AppState = {
  restaurants: [],
  firestoreRestaurants: [],
  curatedSyncAttempted: false,
  reviews: [],
  news: [],
  users: [],
  siteSettings: { ...DEFAULT_SETTINGS },
  stats: {
    pageViews: 0,
    uniqueVisitors: 0,
    dailyVisits: {}
  },
  currentUser: null,
  firebaseReady: false,
  restaurantsLoaded: false,
  reviewsLoaded: false,
  newsLoaded: false,
  statsLoaded: false,
  visitorTracked: false,
  unsubscribers: []
};

function mergeRestaurantsWithCurated(firestoreList = []) {
  const remote = Array.isArray(firestoreList) ? firestoreList : [];
  const curated = typeof SPU_CURATED_RESTAURANTS !== 'undefined' && Array.isArray(SPU_CURATED_RESTAURANTS)
    ? SPU_CURATED_RESTAURANTS
    : [];
  if (AppState.siteSettings?.seededRealShopsV5) {
    return remote;
  }
  const curatedById = new Map(curated.map(s => [s.id, s]));
  const updatedRemote = remote.map(r => curatedById.has(r.id) ? { ...r, ...curatedById.get(r.id) } : r);
  const existingIds = new Set(updatedRemote.map(r => r.id));
  const existingNames = new Set(updatedRemote.map(r => (r.name || '').trim().toLowerCase()));
  const missingCurated = curated.filter(shop =>
    !existingIds.has(shop.id) && !existingNames.has((shop.name || '').trim().toLowerCase())
  );
  return [...updatedRemote, ...missingCurated];
}

async function maybeSeedCuratedRestaurantsToFirestore() {
  if (AppState.curatedSyncAttempted) return;
  if (!isAdmin() || !AppState.restaurantsLoaded || !window.FirestoreService?.isConfigured()) return;
  if (AppState.siteSettings?.seededRealShopsV5) return;

  const curated = typeof SPU_CURATED_RESTAURANTS !== 'undefined' && Array.isArray(SPU_CURATED_RESTAURANTS)
    ? SPU_CURATED_RESTAURANTS
    : [];
  if (curated.length === 0) return;

  AppState.curatedSyncAttempted = true;
  try {
    let syncedCount = 0;

    for (const shop of curated) {
      await window.FirestoreService.upsertRestaurant(shop.id, shop);
      syncedCount++;
    }

    await window.FirestoreService.updateSiteSettings({ seededRealShopsV5: true });
    if (syncedCount > 0) {
      showToast(`อัปเดตร้านอาหารจริง ${syncedCount} ร้านลง Cloud Firestore เรียบร้อย! 🍽️`, 'success');
    }
  } catch (err) {
    AppState.curatedSyncAttempted = false;
    console.warn('Auto-seed curated restaurants skipped:', err);
  }
}

function formatFirebaseDate(val, fallbackStr) {
  if (!val) return fallbackStr || '-';
  if (typeof val === 'string') return val;
  if (val && typeof val.toDate === 'function') {
    return val.toDate().toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return fallbackStr || '-';
}

// ============================================================================
// 1.1 Visitor Analytics & Real-Time Firestore Stats Engine
// ============================================================================

function getAnalytics() {
  return AppState.stats || {
    pageViews: 0,
    uniqueVisitors: 0,
    dailyVisits: {}
  };
}

function updatePublicVisitorUI(analytics) {
  const stats = analytics || getAnalytics();
  const publicCountEl = document.getElementById('publicVisitorCount');
  if (publicCountEl) {
    publicCountEl.textContent = Number(stats.pageViews || 0).toLocaleString();
  }
  const publicUniqueEl = document.getElementById('publicUniqueVisitorCount');
  if (publicUniqueEl) {
    publicUniqueEl.textContent = Number(stats.uniqueVisitors || 0).toLocaleString();
  }
}

async function trackVisitorHit() {
  if (AppState.visitorTracked) return;
  if (!window.FirestoreService || !window.FirestoreService.isConfigured()) {
    updatePublicVisitorUI(AppState.stats);
    return;
  }

  AppState.visitorTracked = true;
  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  let visitorUuid = null;
  let isNewVisitor = false;
  try {
    visitorUuid = localStorage.getItem(LOCAL_PREF_KEYS.VISITOR_UUID);
    if (!visitorUuid) {
      visitorUuid = 'vis_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      localStorage.setItem(LOCAL_PREF_KEYS.VISITOR_UUID, visitorUuid);
      isNewVisitor = true;
    }
  } catch (e) {
    isNewVisitor = false;
  }

  try {
    await window.FirestoreService.incrementVisitorHit(todayStr, isNewVisitor);
  } catch (err) {
    console.warn('Firestore visitor stats update notice:', err?.code || err?.message);
  }
}

// ============================================================================
// 2. Sound Effects Engine (Web Audio API Synthesizer - Zero External Files!)
// ============================================================================

class SoundFX {
  static ctx = null;

  static init() {
    if (!SoundFX.ctx && (window.AudioContext || window.webkitAudioContext)) {
      SoundFX.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  static playTick() {
    try {
      SoundFX.init();
      if (!SoundFX.ctx) return;
      const osc = SoundFX.ctx.createOscillator();
      const gain = SoundFX.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, SoundFX.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, SoundFX.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, SoundFX.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(SoundFX.ctx.destination);
      osc.start();
      osc.stop(SoundFX.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  static playWin() {
    try {
      SoundFX.init();
      if (!SoundFX.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = SoundFX.ctx.createOscillator();
        const gain = SoundFX.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, SoundFX.ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.12, SoundFX.ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, SoundFX.ctx.currentTime + idx * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(SoundFX.ctx.destination);
        osc.start(SoundFX.ctx.currentTime + idx * 0.1);
        osc.stop(SoundFX.ctx.currentTime + idx * 0.1 + 0.3);
      });
    } catch (e) {}
  }

  static playMatch() {
    try {
      SoundFX.init();
      if (!SoundFX.ctx) return;
      const osc = SoundFX.ctx.createOscillator();
      const gain = SoundFX.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, SoundFX.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, SoundFX.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, SoundFX.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, SoundFX.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(SoundFX.ctx.destination);
      osc.start();
      osc.stop(SoundFX.ctx.currentTime + 0.2);
    } catch (e) {}
  }
}

// ============================================================================
// 3. UI Helpers & Toast Notification System
// ============================================================================

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '✅';
  if (type === 'error') icon = '❌';
  if (type === 'info') icon = 'ℹ️';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function closeModalOnBackdrop(event, backdropElement) {
  if (event.target === backdropElement) {
    backdropElement.classList.remove('active');
  }
}

// ============================================================================
// 4. State Management
// ============================================================================

let currentFilterTag = 'all';
let currentDetailRestaurantId = null;
let currentReviewRating = 5;
let currentAppView = 'restaurants';
let currentCheckinSubTab = 'calendar';

function switchAppView(viewId = 'restaurants') {
  const validViews = ['restaurants', 'roulette', 'checkin', 'news', 'leaderboard'];
  const targetView = validViews.includes(viewId) ? viewId : 'restaurants';
  currentAppView = targetView;

  document.querySelectorAll('.app-view-section').forEach(sec => {
    if (sec.getAttribute('data-view-group') === targetView) {
      sec.classList.add('active-view');
    } else {
      sec.classList.remove('active-view');
    }
  });

  document.querySelectorAll('.nav-link[data-view], .mob-nav-btn[data-view]').forEach(btn => {
    if (btn.getAttribute('data-view') === targetView) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (targetView === 'roulette' && typeof drawWheel === 'function') {
    setTimeout(() => {
      drawWheel();
      const resEl = document.getElementById('budgetComboResult');
      if (typeof renderBudgetComboIdleState === 'function' && resEl && !resEl.innerHTML.trim()) {
        renderBudgetComboIdleState();
      }
    }, 40);
  }

  SoundFX.playTick();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleSearchFiltersDrawer() {
  const grid = document.getElementById('advancedFilterGrid');
  const btn = document.getElementById('toggleFilterDrawerBtn');
  if (!grid) return;
  const isOpen = grid.classList.toggle('open');
  if (btn) {
    btn.classList.toggle('active', isOpen);
    btn.innerHTML = isOpen ? '🔼 ซ่อนตัวกรอง' : '🎛️ ตัวกรองเพิ่มเติม';
  }
  SoundFX.playTick();
}

function switchCheckinSubTab(subTab = 'calendar') {
  currentCheckinSubTab = subTab === 'closet' ? 'closet' : 'calendar';
  renderDailyCheckIn();
  scheduleMidnightCheckInRefresh();
  SoundFX.playTick();
}

// Current User Helpers
function getCurrentUser() {
  return AppState.currentUser;
}

function grantAdminFullRewards(user) {
  if (!user || user.role !== 'admin') return;

  const allFrameIds = PROFILE_FRAMES.map(f => f.id);
  const allTitles = [
    "นักชิมมือใหม่",
    "SPU Food Master",
    ...WEEKLY_REWARDS_CALENDAR.map(w => w.title),
    "เซียนรีวิวอาหาร",
    "ฮีโร่โรงอาหาร"
  ];
  const allBadgeIds = BADGES_LIST.map(b => b.id);

  const prevFrames = user.unlockedFrames || [];
  const prevTitles = user.unlockedTitles || [];
  const prevBadges = user.badges || [];

  const nextFrames = Array.from(new Set([...prevFrames, ...allFrameIds]));
  const nextTitles = Array.from(new Set([...prevTitles, ...allTitles]));
  const nextBadges = Array.from(new Set([...prevBadges, ...allBadgeIds]));

  const changed =
    nextFrames.length !== prevFrames.length ||
    nextTitles.length !== prevTitles.length ||
    nextBadges.length !== prevBadges.length;

  user.unlockedFrames = nextFrames;
  user.unlockedTitles = nextTitles;
  user.badges = nextBadges;

  if (changed && window.FirestoreService?.isConfigured() && (user.uid || user.id)) {
    window.FirestoreService.adminUpdateUser(user.uid || user.id, {
      unlockedFrames: nextFrames,
      unlockedTitles: nextTitles,
      badges: nextBadges
    }).catch(() => {});
  }
}

function setCurrentUser(user) {
  if (user && user.role === 'admin') {
    grantAdminFullRewards(user);
  }
  AppState.currentUser = user || null;
  renderNavUser();
  if (typeof renderDailyCheckIn === 'function') renderDailyCheckIn();
  if (typeof renderLeaderboard === 'function') renderLeaderboard();
  if (typeof renderAdminOnlyButtons === 'function') renderAdminOnlyButtons();
}

function isAdmin() {
  const user = getCurrentUser();
  return Boolean(user && user.role === 'admin');
}

function requireAuth(actionName = "ทำรายการนี้") {
  const user = getCurrentUser();
  if (!user) {
    showToast(`กรุณาเข้าสู่ระบบก่อนเพื่อ${actionName}`, 'info');
    openAuthModal();
    return false;
  }
  return true;
}

// ============================================================================
// 5. Theme & Festival System
// ============================================================================

function applyTheme(themeId) {
  const normalizedId = themeId === 'classic' ? 'spu-classic' : themeId;
  const safeThemeId = THEMES[normalizedId] ? normalizedId : 'spu-classic';
  AppState.siteSettings.activeTheme = safeThemeId;

  const themeConfig = THEMES[safeThemeId] || THEMES['spu-classic'];
  document.documentElement.setAttribute('data-festival', safeThemeId);
  if (document.body) {
    document.body.setAttribute('data-festival', safeThemeId);
  }

  // Apply explicit CSS custom properties for the active theme + current light/dark mode
  const isDark = document.body?.classList.contains('dark-mode') || document.documentElement.getAttribute('data-theme-mode') === 'dark';
  const varsToApply = isDark ? (themeConfig.darkVars || themeConfig.lightVars) : themeConfig.lightVars;
  if (varsToApply) {
    Object.entries(varsToApply).forEach(([prop, val]) => {
      document.documentElement.style.setProperty(prop, val);
    });
  }

  // 1. Update Ticker Pill
  const pillIcon = document.getElementById('themePillIcon');
  const pillName = document.getElementById('themePillName');
  if (pillIcon && pillName) {
    pillIcon.textContent = themeConfig.icon;
    pillName.textContent = themeConfig.name;
  }

  // 2. Update Brand Logo Icon
  const brandIcon = document.getElementById('brandLogoIcon');
  if (brandIcon) {
    brandIcon.textContent = themeConfig.particleEmoji;
  }

  // 3. Update Hero Tasting Board Showcase (respects Admin Custom Showcase if set)
  if (typeof applyHeroShowcase === 'function') {
    applyHeroShowcase(themeConfig);
  }

  // 4. Render Festival Floating Emojis (Hero + Bottom Floating Lane)
  renderFestivalParticles(themeConfig.particleEmoji, safeThemeId);

  // 5. Refresh Roulette Wheel Colors
  if (typeof drawWheel === 'function') {
    setTimeout(() => drawWheel(), 30);
  }
}

function renderFestivalParticles(emoji = '🍽️', themeId = 'spu-classic') {
  const themeConfig = THEMES[themeId] || THEMES['spu-classic'];
  const emojiPool = Array.isArray(themeConfig?.floatingEmojis) && themeConfig.floatingEmojis.length > 0
    ? themeConfig.floatingEmojis
    : [emoji];

  // 1. Hero Background Left-Right Floating Emojis
  const container = document.getElementById('festivalParticles');
  if (container) {
    container.innerHTML = '';
    const count = 10;
    for (let i = 0; i < count; i++) {
      const span = document.createElement('span');
      span.className = `festival-particle ${i % 2 === 0 ? 'sway-right' : 'sway-left'}`;
      span.textContent = emojiPool[i % emojiPool.length];
      span.style.top = `${8 + ((i * 9) % 80)}%`;
      span.style.animationDuration = `${16 + (i % 5) * 3.5}s`;
      span.style.animationDelay = `-${(i * 2.3).toFixed(1)}s`;
      span.style.fontSize = `${2.6 + (i % 3) * 0.55}rem`;
      container.appendChild(span);
    }
  }

  // 2. Full-Page Ambient Background Left-Right Floating Emojis
  const bottomLane = document.getElementById('bottomFestivalFloatLane');
  if (bottomLane) {
    bottomLane.innerHTML = '';
    const bgCount = 14;
    for (let i = 0; i < bgCount; i++) {
      const item = document.createElement('span');
      item.className = `bottom-float-emoji ${i % 2 === 0 ? 'sway-right' : 'sway-left'}`;
      item.textContent = emojiPool[i % emojiPool.length];
      item.style.top = `${6 + ((i * 6.8) % 86)}%`;
      item.style.fontSize = `${2.75 + (i % 4) * 0.5}rem`;
      item.style.animationDuration = `${18 + (i % 5) * 4}s`;
      item.style.animationDelay = `-${(i * 2.1).toFixed(1)}s`;
      bottomLane.appendChild(item);
    }
  }
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  document.documentElement.setAttribute('data-theme-mode', isDark ? 'dark' : 'light');
  try {
    localStorage.setItem(LOCAL_PREF_KEYS.DARK_MODE, JSON.stringify(isDark));
  } catch (e) {}

  const toggleBtn = document.getElementById('themeToggleBtn');
  if (toggleBtn) {
    toggleBtn.textContent = isDark ? '☀️' : '🌙';
  }

  applyTheme(AppState.siteSettings.activeTheme || 'spu-classic');
}

function initDarkMode() {
  let savedDark = false;
  try {
    savedDark = JSON.parse(localStorage.getItem(LOCAL_PREF_KEYS.DARK_MODE) || 'false');
  } catch (e) {
    savedDark = false;
  }
  if (savedDark) {
    document.body.classList.add('dark-mode');
    document.documentElement.setAttribute('data-theme-mode', 'dark');
    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn) toggleBtn.textContent = '☀️';
  }
  applyTheme(AppState.siteSettings.activeTheme || 'spu-classic');
}

// ============================================================================
// 6. Navigation, User Header & Firebase Authentication
// ============================================================================

function ensureFirebaseAuthReady() {
  if (window.location.protocol === 'file:' && !window.FIREBASE_BRIDGE_LOADED) {
    showToast('⚠️ ระบบ Firebase ต้องรันผ่าน Web Server (เช่น GitHub Pages หรือ start-server.bat / localhost:3000)', 'warning');
    return false;
  }
  if (!window.AuthService || !window.AuthService.isConfigured()) {
    showToast('⚠️ ยังไม่ได้ตั้งค่า firebaseConfig ในไฟล์ js/firebase-config.js กรุณานำค่าจาก Firebase Console มาใส่ก่อนใช้งาน', 'warning');
    return false;
  }
  return true;
}

function translateFirebaseAuthError(err) {
  const code = err?.code || '';
  if (err?.message === 'FIREBASE_NOT_CONFIGURED') {
    return 'ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js';
  }
  if (code.startsWith('auth/api-key-not-valid') || code === 'auth/invalid-api-key') {
    return 'API Key ของ Firebase ไม่ถูกต้อง (กรุณาคัดลอก firebaseConfig ของจริงจากหน้า Project settings > Your apps ใน Firebase Console มาใส่ใหม่)';
  }
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
    case 'auth/email-already-in-use':
      return 'อีเมลนี้ถูกสมัครใช้งานไว้แล้ว กรุณาเข้าสู่ระบบหรือใช้ปุ่มลืมรหัสผ่าน';
    case 'auth/invalid-email':
      return 'รูปแบบอีเมลไม่ถูกต้อง';
    case 'auth/weak-password':
      return 'รหัสผ่านต้องมีความยาวอย่างน้อย 6-8 ตัวอักษรและคาดเดาได้ยาก';
    case 'auth/too-many-requests':
      return 'มีการลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'ปิดหน้าต่างเลือกบัญชี Google ก่อนเข้าสู่ระบบเสร็จสิ้น';
    case 'auth/popup-blocked':
      return 'เบราว์เซอร์บล็อกป๊อปอัป Google กรุณาอนุญาตป๊อปอัปแล้วลองใหม่';
    case 'auth/unauthorized-domain':
      return 'โดเมนนี้ยังไม่ได้รับอนุญาตใน Firebase Authentication > Settings > Authorized domains';
    case 'auth/operation-not-allowed':
      return 'กรุณาเปิดใช้งาน Sign-in method นี้ใน Firebase Console ก่อน';
    case 'auth/network-request-failed':
      return 'เชื่อมต่ออินเทอร์เน็ตหรือ Firebase ไม่สำเร็จ กรุณาลองใหม่';
    default:
      return err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อระบบยืนยันตัวตน';
  }
}

function renderFramedAvatar(avatarSrc, frameId = 'frame-none', sizePx = 44, extraImgClass = '', altText = 'Avatar') {
  const validFrame = frameId && typeof PROFILE_FRAMES !== 'undefined' && PROFILE_FRAMES.some(f => f.id === frameId)
    ? frameId
    : 'frame-none';
  const safeSrc = avatarSrc || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  const safeAlt = String(altText || 'Avatar').replace(/"/g, '&quot;');
  return `<span class="avatar-frame-wrap ${validFrame}" style="--av-size: ${sizePx}px;"><img src="${safeSrc}" class="user-avatar ${extraImgClass} ${validFrame}" alt="${safeAlt}" style="width: ${sizePx}px; height: ${sizePx}px; border-radius: 50%; object-fit: cover;"><img src="assets/frames/${validFrame}.svg?v=20261118_6" class="avatar-frame-overlay" alt="" aria-hidden="true"></span>`;
}

function renderNavUser() {
  const container = document.getElementById('navUserContainer');
  if (!container) return;

  const user = getCurrentUser();
  if (user) {
    const adminPill = user.role === 'admin'
      ? `<button type="button" class="btn btn-sm btn-admin" onclick="openAdminModal()" title="แผงควบคุมระบบ (เข้าถึงได้เฉพาะแอดมิน)" style="font-size: 0.8rem; padding: 0.35rem 0.65rem;">
           แผงแอดมิน
         </button>`
      : '';

    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
        ${adminPill}
        <button type="button" class="user-menu-btn" onclick="openProfileModal()" title="ดูโปรไฟล์และตู้เสื้อผ้ากรอบรูป">
          ${renderFramedAvatar(user.avatar, user.equippedFrame || 'frame-none', 32, '', user.name)}
          <span class="user-menu-name">${user.name}</span>
          <span class="user-title-badge">${user.customTitle || 'นักชิมมือใหม่'}</span>
        </button>
        <button type="button" class="btn btn-sm btn-outline" onclick="handleLogout()" title="ออกจากระบบ" style="padding: 0.35rem 0.65rem; font-size: 0.8rem;">
          ออกจากระบบ
        </button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button type="button" class="btn btn-sm btn-primary" onclick="openAuthModal()">
        เข้าสู่ระบบ
      </button>
    `;
  }

  // Update dynamic admin-only buttons on the page
  renderAdminOnlyButtons();
}

function renderAdminOnlyButtons() {
  const rstSlot = document.getElementById('adminAddRestaurantSlot');
  const newsSlot = document.getElementById('adminAddNewsSlot');
  const resetSlot = document.getElementById('footerAdminResetSlot');

  if (resetSlot) {
    resetSlot.style.display = isAdmin() ? 'list-item' : 'none';
  }

  if (isAdmin()) {
    if (rstSlot) {
      rstSlot.innerHTML = `
        <button type="button" class="btn btn-outline btn-sm" onclick="openAddRestaurantModal()">
          เพิ่มร้านอาหารใหม่
        </button>
      `;
    }
    if (newsSlot) {
      newsSlot.innerHTML = `
        <button type="button" class="btn btn-outline btn-sm" onclick="openAddNewsModal()">
          เพิ่มข่าวสารใหม่
        </button>
      `;
    }
  } else {
    if (rstSlot) rstSlot.innerHTML = '';
    if (newsSlot) newsSlot.innerHTML = '';
  }

  // Refresh empty state when auth status changes
  if (AppState.restaurants.length === 0) {
    if (typeof filterRestaurants === 'function') filterRestaurants();
    if (typeof drawWheel === 'function') drawWheel();
  }
}

function openAdminAccessModal() {
  const errBox = document.getElementById('adminLoginError');
  if (errBox) errBox.style.display = 'none';
  const pwdInput = document.getElementById('adminLoginPassword');
  if (pwdInput) pwdInput.value = '';
  openModal('adminAccessModal');
}

async function handleAdminLoginSubmit(event) {
  event.preventDefault();
  const emailInput = (document.getElementById('adminLoginEmail')?.value || '').trim();
  const passwordInput = document.getElementById('adminLoginPassword')?.value || '';

  // Local test mode fallback when Firebase is not configured yet
  if (!window.AuthService || !window.AuthService.isConfigured()) {
    const localAdminProfile = {
      id: 'local_admin_test',
      uid: 'local_admin_test',
      name: 'ผู้ดูแลระบบ SPU (โหมดทดสอบ Local)',
      email: emailInput || 'local-admin',
      role: 'admin',
      userType: 'บุคลากร',
      faculty: 'ส่วนกลาง ม.ศรีปทุม',
      checkInStreak: 60,
      equippedFrame: 'frame-grand-emperor',
      customTitle: 'SPU Food Master'
    };
    setCurrentUser(localAdminProfile);
    closeModal('adminAccessModal');
    SoundFX.playWin();
    showToast('🔓 เข้าสู่โหมดทดสอบผู้ดูแลระบบ (Local Admin Preview) สำเร็จ!', 'success');
    setTimeout(() => openAdminModal(), 200);
    return;
  }

  if (!ensureFirebaseAuthReady()) return;

  const errBox = document.getElementById('adminLoginError');
  const submitBtn = event.target?.querySelector('button[type="submit"]');

  if (submitBtn) submitBtn.disabled = true;
  if (errBox) errBox.style.display = 'none';

  try {
    const profile = await window.AuthService.loginWithEmail(emailInput, passwordInput);
    if (!profile || profile.role !== 'admin') {
      await window.AuthService.logout();
      if (errBox) {
        errBox.textContent = '❌ บัญชีนี้ไม่มีสิทธิ์แอดมิน (ต้องตั้งค่า role เป็น "admin" ใน Firestore Console ก่อน)';
        errBox.style.display = 'block';
      }
      SoundFX.playTick();
      return;
    }

    setCurrentUser(profile);
    closeModal('adminAccessModal');
    SoundFX.playWin();
    showToast(`🔓 เข้าสู่ระบบผู้ดูแลเรียบร้อย ยินดีต้อนรับคุณ ${profile.name}!`, 'success');
    setTimeout(() => openAdminModal(), 200);
  } catch (err) {
    if (errBox) {
      errBox.textContent = `❌ ${translateFirebaseAuthError(err)}`;
      errBox.style.display = 'block';
    }
    SoundFX.playTick();
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

function openAuthModal() {
  initGoogleSignIn();
  openModal('authModal');
}

function switchAuthTab(tabId, btn) {
  document.querySelectorAll('#authModal .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#authModal .tab-pane').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  if (!ensureFirebaseAuthReady()) return;

  const email = (document.getElementById('loginEmail')?.value || '').trim();
  const password = document.getElementById('loginPassword')?.value || '';
  const submitBtn = event.target?.querySelector('button[type="submit"]');

  if (submitBtn) submitBtn.disabled = true;

  try {
    const profile = await window.AuthService.loginWithEmail(email, password);
    setCurrentUser(profile);
    closeModal('authModal');

    const elEmail = document.getElementById('loginEmail');
    const elPass = document.getElementById('loginPassword');
    if (elEmail) elEmail.value = '';
    if (elPass) elPass.value = '';

    SoundFX.playWin();
    showToast(`ยินดีต้อนรับคุณ ${profile.name}! เข้าสู่ระบบสำเร็จ`, 'success');
  } catch (err) {
    SoundFX.playTick();
    showToast(translateFirebaseAuthError(err), 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

async function handleForgotPassword() {
  if (!ensureFirebaseAuthReady()) return;

  const emailInput = document.getElementById('loginEmail');
  const email = (emailInput?.value || '').trim();
  if (!email) {
    showToast('กรุณากรอกอีเมลในช่องด้านบนก่อน แล้วกดปุ่มลืมรหัสผ่านอีกครั้ง', 'warning');
    emailInput?.focus();
    return;
  }

  try {
    await window.AuthService.sendPasswordReset(email);
    showToast(`ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ ${email} แล้ว (กรุณาเช็กกล่องจดหมายหรือ Junk Mail)`, 'success');
  } catch (err) {
    showToast(translateFirebaseAuthError(err), 'error');
  }
}

function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  if (btnEl) {
    btnEl.innerHTML = isPassword ? '🙈 ซ่อนรหัส' : '👁️ ดูรหัส';
    btnEl.classList.toggle('showing', isPassword);
  }
}

function getEffectiveMemberId(user) {
  if (!user) return 'SPU-100000';
  const raw = String(user.studentId || '').trim();
  if (raw && raw !== '-') return raw;
  const seed = String(user.uid || user.id || user.email || user.name || 'spu');
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const num = (Math.abs(hash) % 900000) + 100000;
  return `SPU-${num}`;
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  if (!ensureFirebaseAuthReady()) return;

  const email = (document.getElementById('regEmail')?.value || '').trim();
  const name = (document.getElementById('regName')?.value || '').trim() || (email ? email.split('@')[0] : 'สมาชิกจานเด็ด SPU');
  const userType = document.getElementById('regUserType')?.value || 'นักศึกษา';
  const rawStudentId = (document.getElementById('regStudentId')?.value || '').trim();
  const studentId = (rawStudentId && rawStudentId !== '-')
    ? rawStudentId
    : getEffectiveMemberId({ email, name });
  const faculty = (document.getElementById('regFaculty')?.value || '').trim() || 'ม.ศรีปทุม';
  const phone = (document.getElementById('regPhone')?.value || '').trim() || '-';
  const password = document.getElementById('regPassword')?.value || '';

  if (password.length < 8) {
    showToast('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร', 'error');
    return;
  }

  const submitBtn = event.target?.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const profile = await window.AuthService.registerWithEmail({
      email,
      password,
      name,
      studentId,
      faculty,
      phone,
      userType
    });

    setCurrentUser(profile);
    closeModal('authModal');
    event.target?.reset?.();
    SoundFX.playWin();
    showToast(`สมัครสมาชิกสำเร็จ! ยินดีต้อนรับคุณ ${profile.name} สู่จานเด็ด SPU 🎉`, 'success');
  } catch (err) {
    SoundFX.playTick();
    showToast(translateFirebaseAuthError(err), 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

// ----------------------------------------------------------------------------
// Firebase Google Sign-In
// ----------------------------------------------------------------------------

function initGoogleSignIn() {
  const customBtn = document.getElementById('googleCustomSignInBtn');
  if (customBtn) customBtn.style.display = 'flex';
}

async function triggerGoogleSignIn() {
  if (!ensureFirebaseAuthReady()) return;

  const btn = document.getElementById('googleCustomSignInBtn');
  if (btn) btn.disabled = true;

  try {
    const profile = await window.AuthService.loginWithGoogle();
    setCurrentUser(profile);
    closeModal('authModal');
    SoundFX.playWin();
    showToast(`เข้าสู่ระบบด้วย Google สำเร็จ! ยินดีต้อนรับคุณ ${profile.name} 🎉`, 'success');
  } catch (err) {
    SoundFX.playTick();
    showToast(translateFirebaseAuthError(err), 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

// Fallback stubs for backward compatibility
function demoLogin(role) {
  if (role === 'admin') {
    openAdminAccessModal();
  } else {
    openAuthModal();
  }
}

function mockGoogleLogin() {
  triggerGoogleSignIn();
}

async function handleLogout() {
  try {
    if (window.AuthService && window.AuthService.isConfigured()) {
      await window.AuthService.logout();
    }
  } catch (err) {
    console.warn('Logout notice:', err);
  }
  setCurrentUser(null);
  closeModal('profileModal');
  closeModal('adminModal');
  showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
}

// ============================================================================
// 7. Restaurant Directory & Search / Filter Engine
// ============================================================================

function populateFilterDropdowns() {
  const locationSelect = document.getElementById('locationFilter');
  const wheelLocationSelect = document.getElementById('wheelLocationSelect');
  const rstLocation = document.getElementById('rstLocation');
  
  const categorySelect = document.getElementById('categoryFilter');
  const rstCategory = document.getElementById('rstCategory');

  if (locationSelect) {
    locationSelect.innerHTML = '<option value="all">📍 ทุกพิกัดใน ม.ศรีปทุม</option>';
    SPU_LOCATIONS.forEach(loc => {
      locationSelect.innerHTML += `<option value="${loc}">${loc}</option>`;
    });
  }

  if (wheelLocationSelect) {
    wheelLocationSelect.innerHTML = '<option value="all">🎲 ทุกร้านในและรอบ ม.ศรีปทุม</option>';
    SPU_LOCATIONS.forEach(loc => {
      wheelLocationSelect.innerHTML += `<option value="${loc}">${loc}</option>`;
    });
  }

  if (rstLocation) {
    rstLocation.innerHTML = '';
    SPU_LOCATIONS.forEach(loc => {
      rstLocation.innerHTML += `<option value="${loc}">${loc}</option>`;
    });
  }

  if (categorySelect) {
    categorySelect.innerHTML = '<option value="all">🍛 ทุกหมวดหมู่อาหาร</option>';
    FOOD_CATEGORIES.forEach(cat => {
      categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
  }

  if (rstCategory) {
    rstCategory.innerHTML = '';
    FOOD_CATEGORIES.forEach(cat => {
      rstCategory.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
  }
}

function calculateRestaurantRating(restaurantId) {
  const reviews = AppState.reviews;
  const restReviews = reviews.filter(r => r.restaurantId === restaurantId);
  if (restReviews.length === 0) return { avg: 0, count: 0 };
  const sum = restReviews.reduce((acc, r) => acc + Number(r.rating), 0);
  const avg = (sum / restReviews.length).toFixed(1);
  return { avg: parseFloat(avg), count: restReviews.length };
}

function filterRestaurants() {
  const search = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  const location = document.getElementById('locationFilter')?.value || 'all';
  const category = document.getElementById('categoryFilter')?.value || 'all';
  const price = document.getElementById('priceFilter')?.value || 'all';
  const sort = document.getElementById('sortBy')?.value || 'rating';

  const restaurants = AppState.restaurants;

  const filtered = restaurants.filter(r => {
    const matchSearch = !search ||
      (r.name && r.name.toLowerCase().includes(search)) ||
      (r.description && r.description.toLowerCase().includes(search)) ||
      (r.tags && r.tags.some(t => t.toLowerCase().includes(search))) ||
      (r.menus && r.menus.some(m => m.name && m.name.toLowerCase().includes(search)));

    const matchLoc = location === 'all' || r.location === location;
    const matchCat = category === 'all' || r.category === category;

    let matchPrice = true;
    const avgP = Number(r.avgPrice) || 0;
    if (price === 'under40') matchPrice = avgP < 40;
    else if (price === '40-60') matchPrice = avgP >= 40 && avgP <= 60;
    else if (price === '60-100') matchPrice = avgP > 60 && avgP <= 100;
    else if (price === 'over100') matchPrice = avgP > 100;

    return matchSearch && matchLoc && matchCat && matchPrice;
  });

  // Calculate live ratings from Firestore reviews
  filtered.forEach(r => {
    const stats = calculateRestaurantRating(r.id);
    r.computedRating = stats.count > 0 ? stats.avg : 0;
    r.computedCount = stats.count;
  });

  if (sort === 'rating') {
    filtered.sort((a, b) => (b.computedRating - a.computedRating) || (b.computedCount - a.computedCount));
  } else if (sort === 'reviews') {
    filtered.sort((a, b) => b.computedCount - a.computedCount);
  } else if (sort === 'priceAsc') {
    filtered.sort((a, b) => (Number(a.avgPrice) || 0) - (Number(b.avgPrice) || 0));
  } else if (sort === 'priceDesc') {
    filtered.sort((a, b) => (Number(b.avgPrice) || 0) - (Number(a.avgPrice) || 0));
  }

  renderRestaurantGrid(filtered);

  const countText = document.getElementById('restaurantCountText');
  if (countText) {
    countText.textContent = `พบร้านอาหาร ${filtered.length} ร้าน (จากทั้งหมด ${restaurants.length} ร้านในระบบ SPU)`;
  }
}

function applyQuickFilter(tag, element) {
  currentFilterTag = tag;
  document.querySelectorAll('.quick-filter-chip').forEach(c => c.classList.remove('active'));
  if (element) element.classList.add('active');
  filterRestaurants();
}

function selectDishCategory(catVal, btnEl) {
  const catSelect = document.getElementById('categoryFilter');
  if (catSelect) {
    catSelect.value = catVal || 'all';
  }
  document.querySelectorAll('.dish-cat-card').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  SoundFX.playTick();
  filterRestaurants();
}

function quickSelectCanteenLocation(locVal, btnEl) {
  const locSelect = document.getElementById('locationFilter');
  if (locSelect) {
    locSelect.value = locVal || 'all';
  }
  document.querySelectorAll('.canteen-pill').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  SoundFX.playTick();
  filterRestaurants();
}

function renderRestaurantGrid(list) {
  const grid = document.getElementById('restaurantGrid');
  if (!grid) return;

  const allRestaurants = AppState.restaurants;

  if (window.FirestoreService?.isConfigured() && !AppState.restaurantsLoaded && allRestaurants.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 3rem 1.5rem; text-align: center; background: var(--bg-surface); grid-column: 1 / -1;">
        <div class="empty-icon" style="font-size: 3rem; margin-bottom: 0.75rem;">🔥</div>
        <div class="empty-title" style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.35rem;">กำลังโหลดข้อมูลร้านอาหารจาก Cloud Firestore...</div>
        <div class="empty-desc" style="font-size: 0.9rem; color: var(--text-muted);">กรุณารอสักครู่</div>
      </div>
    `;
    return;
  }

  if (allRestaurants.length === 0) {
    if (isAdmin()) {
      grid.innerHTML = `
        <div class="empty-state" style="border: 2px dashed var(--border-color); border-radius: var(--radius-lg); padding: 3.5rem 1.5rem; text-align: center; background: var(--bg-surface); grid-column: 1 / -1; box-shadow: var(--shadow-sm);">
          <div class="empty-icon" style="font-size: 3.8rem; margin-bottom: 0.85rem;">🍽️</div>
          <div class="empty-title" style="font-size: 1.4rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-main);">ยังไม่มีร้านอาหารในระบบ (กล่องว่างพร้อมให้ใส่ข้อมูล)</div>
          <div class="empty-desc" style="font-size: 0.95rem; color: var(--text-muted); max-width: 540px; margin: 0 auto 1.5rem auto; line-height: 1.6;">
            ฐานข้อมูล Cloud Firestore พร้อมใช้งานแล้ว คุณสามารถเริ่มเพิ่มร้านอาหารจริงใน ม.ศรีปทุม (SPU) เช่น โรงเย็น (อาคาร 10) หรือโรงร้อน (หลังอาคาร 5) ได้ทันที!
          </div>
          <button type="button" class="btn btn-primary btn-lg" onclick="openAddRestaurantModal()">
            ➕ เพิ่มร้านอาหารแรกของคุณเลย!
          </button>
        </div>
      `;
    } else {
      grid.innerHTML = `
        <div class="empty-state" style="border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 3.5rem 1.5rem; text-align: center; background: var(--bg-surface); grid-column: 1 / -1; box-shadow: var(--shadow-sm);">
          <div class="empty-icon" style="font-size: 3.8rem; margin-bottom: 0.85rem;">🍽️</div>
          <div class="empty-title" style="font-size: 1.4rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-main);">ตอนนี้ยังไม่มีร้านแนะนำ ลองมาใหม่ในรอบหน้านะครับ</div>
          <div class="empty-desc" style="font-size: 0.95rem; color: var(--text-muted); max-width: 480px; margin: 0 auto; line-height: 1.6;">
            ผู้ดูแลระบบกำลังเตรียมข้อมูลร้านอาหารอร่อยๆ ในโรงอาหาร SPU ไว้ให้คุณ กรุณากลับมาติดตามชมในรอบถัดไปนะครับ 😋
          </div>
        </div>
      `;
    }
    return;
  }

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">ไม่พบร้านอาหารที่ตรงกับเงื่อนไขการค้นหา</div>
        <div class="empty-desc">ลองปรับตัวกรอง หรือค้นหาด้วยชื่อเมนูอื่น เช่น กะเพรา, ก๋วยเตี๋ยวเรือ, ชาไทย</div>
        <button type="button" class="btn btn-outline" onclick="resetFilters()">ล้างตัวกรองทั้งหมด</button>
      </div>
    `;
    return;
  }

  const currentUser = getCurrentUser();
  const userFavs = currentUser?.favorites || [];

  grid.innerHTML = list.map(rst => {
    const isFav = userFavs.includes(rst.id);
    const tagsHtml = (rst.tags || []).slice(0, 3).map(t => `<span class="card-tag">#${t}</span>`).join('');
    const recMenus = (rst.menus || []).slice(0, 2);
    const menusPreviewHtml = recMenus.length > 0
      ? `<div class="card-dishes-preview">
           <div class="card-dishes-label">🍽️ เมนูแนะนำประจำร้าน:</div>
           <div class="card-dishes-list">
             ${recMenus.map(m => `<span class="card-dish-pill">🍳 ${m.name} <strong>${m.price}฿</strong></span>`).join('')}
           </div>
         </div>`
      : '';

    return `
      <div class="restaurant-card" data-id="${rst.id}">
        <div class="card-img-wrapper" onclick="openRestaurantDetail('${rst.id}')" style="cursor: pointer;">
          <img src="${rst.image}" alt="${rst.name}" class="card-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'">
          <div class="card-badge-rating">
            ★ ${rst.computedRating.toFixed(1)} <span style="font-size: 0.75rem; opacity: 0.9;">(${rst.computedCount} รีวิว)</span>
          </div>
          <button type="button" class="card-fav-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite('${rst.id}', event)" title="${isFav ? 'นำออกจากร้านโปรด' : 'บันทึกเป็นร้านโปรด'}">
            ${isFav ? '❤️' : '🤍'}
          </button>
          <div class="card-img-bottom-bar">
            <span class="card-cat-chip">🍛 ${rst.category || 'จานเด็ด SPU'}</span>
            ${rst.openHours ? `<span class="card-hours-chip">⏰ ${rst.openHours}</span>` : ''}
          </div>
        </div>

        <div class="card-body">
          <div class="card-location">📍 ${rst.location}</div>
          <h3 class="card-title" onclick="openRestaurantDetail('${rst.id}')" style="cursor: pointer;">${rst.name}</h3>
          <p class="card-desc">${rst.description}</p>
          ${menusPreviewHtml}
          <div class="card-tags">${tagsHtml}</div>

          <div class="card-footer">
            <div class="card-price">
              <span>💰 ราคาต่อจาน:</span> ${rst.priceRange}
            </div>
            <div style="display: flex; gap: 0.4rem; align-items: center;">
              ${isAdmin() ? `
                <button type="button" class="btn btn-outline btn-sm" onclick="openEditRestaurantModal('${rst.id}')" title="แก้ไขข้อมูลร้านอาหาร">
                  แก้ไข
                </button>
              ` : ''}
              <button type="button" class="btn btn-primary btn-sm" onclick="openRestaurantDetail('${rst.id}')">
                🍽️ ดูเมนู & รีวิว
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('locationFilter').value = 'all';
  document.getElementById('categoryFilter').value = 'all';
  document.getElementById('priceFilter').value = 'all';
  currentFilterTag = 'all';
  document.querySelectorAll('.quick-filter-chip, .dish-cat-card, .canteen-pill').forEach((c) => {
    c.classList.remove('active');
  });
  const firstDishCard = document.querySelector('.dish-cat-card[data-cat="all"]');
  if (firstDishCard) firstDishCard.classList.add('active');
  const firstCanteenPill = document.querySelector('.canteen-pill');
  if (firstCanteenPill) firstCanteenPill.classList.add('active');
  filterRestaurants();
}

async function toggleFavorite(restaurantId, event) {
  if (event) event.stopPropagation();
  if (!requireAuth("บันทึกร้านอาหารโปรด")) return;

  const currentUser = getCurrentUser();
  if (!currentUser) return;
  const favs = [...(currentUser.favorites || [])];

  const idx = favs.indexOf(restaurantId);
  if (idx > -1) {
    favs.splice(idx, 1);
    showToast('นำออกจากร้านโปรดแล้ว', 'info');
  } else {
    favs.push(restaurantId);
    showToast('บันทึกลงในร้านโปรดเรียบร้อย ❤️', 'success');
  }

  currentUser.favorites = favs;
  setCurrentUser(currentUser);
  filterRestaurants();

  if (window.AuthService?.isConfigured()) {
    try {
      await window.AuthService.updateOwnProfile(currentUser.uid || currentUser.id, { favorites: favs });
    } catch (err) {
      console.warn('Favorite Firestore update error:', err);
    }
  }
}

// ============================================================================
// 8. Restaurant Detail Modal & User Review Engine & Photo Lightbox
// ============================================================================

let activeLightboxImages = [];
let activeLightboxIndex = 0;
let currentDetailGalleryIdx = 0;

function openPhotoLightbox(index = 0) {
  if (!activeLightboxImages || activeLightboxImages.length === 0) return;
  activeLightboxIndex = Math.max(0, Math.min(index, activeLightboxImages.length - 1));
  renderLightboxContent();
  openModal('imageLightboxModal');
}

function openPhotoLightboxWithSrc(src, caption = 'ภาพรีวิว') {
  if (!src) return;
  activeLightboxImages = [src];
  activeLightboxIndex = 0;
  const capEl = document.getElementById('lightboxCaption');
  if (capEl) capEl.textContent = caption;
  renderLightboxContent();
  openModal('imageLightboxModal');
}

function renderLightboxContent() {
  const imgEl = document.getElementById('lightboxImage');
  const prevBtn = document.getElementById('lightboxPrevBtn');
  const nextBtn = document.getElementById('lightboxNextBtn');
  const thumbsRow = document.getElementById('lightboxThumbsRow');
  const capEl = document.getElementById('lightboxCaption');

  if (imgEl && activeLightboxImages[activeLightboxIndex]) {
    imgEl.src = activeLightboxImages[activeLightboxIndex];
  }
  if (capEl && activeLightboxImages.length > 1) {
    capEl.textContent = `📷 ภาพที่ ${activeLightboxIndex + 1} จาก ${activeLightboxImages.length}`;
  }

  if (prevBtn) prevBtn.style.display = activeLightboxImages.length > 1 ? 'flex' : 'none';
  if (nextBtn) nextBtn.style.display = activeLightboxImages.length > 1 ? 'flex' : 'none';

  if (thumbsRow) {
    if (activeLightboxImages.length > 1) {
      thumbsRow.innerHTML = activeLightboxImages.map((img, idx) => `
        <img src="${img}" onclick="activeLightboxIndex = ${idx}; renderLightboxContent();" 
             style="width: 52px; height: 38px; object-fit: cover; border-radius: 4px; cursor: pointer; border: 2px solid ${idx === activeLightboxIndex ? 'var(--primary)' : 'rgba(255,255,255,0.3)'}; opacity: ${idx === activeLightboxIndex ? '1' : '0.6'}; transition: all var(--transition-fast);">
      `).join('');
    } else {
      thumbsRow.innerHTML = '';
    }
  }
}

function navigateLightbox(direction) {
  if (!activeLightboxImages || activeLightboxImages.length <= 1) return;
  activeLightboxIndex = (activeLightboxIndex + direction + activeLightboxImages.length) % activeLightboxImages.length;
  renderLightboxContent();
}

function switchDetailMainPhoto(index, btn) {
  currentDetailGalleryIdx = index;
  activeLightboxIndex = index;
  const banner = document.getElementById('detailMainBanner');
  const counter = document.getElementById('detailGalleryCounter');
  if (banner && activeLightboxImages[index]) {
    banner.style.backgroundImage = `url('${activeLightboxImages[index]}')`;
  }
  if (counter) {
    counter.textContent = index + 1;
  }
  document.querySelectorAll('.gallery-thumb-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function openRestaurantDetail(restaurantId) {
  currentDetailRestaurantId = restaurantId;
  const restaurants = AppState.restaurants;
  const rst = restaurants.find(r => r.id === restaurantId);
  if (!rst) return;

  const modal = document.getElementById('restaurantDetailModal');
  const modalTitle = document.getElementById('detailModalTitle');
  const body = document.getElementById('restaurantDetailBody');

  if (modalTitle) modalTitle.textContent = rst.name;

  const stats = calculateRestaurantRating(rst.id);
  const reviews = AppState.reviews.filter(r => r.restaurantId === rst.id);
  const currentUser = getCurrentUser();
  const currentUid = currentUser ? (currentUser.uid || currentUser.id) : null;
  const userExistingReview = currentUid ? reviews.find(r => r.userId === currentUid) : null;

  // Initialize review rating state to user existing review rating or default 5
  currentReviewRating = userExistingReview ? (userExistingReview.rating || 5) : 5;
  reviewFormUploadedImage = '';

  // Setup Gallery Images (up to 5 images)
  const galleryImages = (rst.images && rst.images.length > 0)
    ? rst.images
    : (rst.image ? [rst.image] : ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600']);
  activeLightboxImages = galleryImages;
  activeLightboxIndex = 0;
  currentDetailGalleryIdx = 0;

  // Render Tabs
  body.innerHTML = `
    <!-- Cover Banner & Interactive Photo Gallery -->
    <div style="position: relative; margin-bottom: 0.75rem;">
      <div id="detailMainBanner" class="detail-banner" style="background-image: url('${galleryImages[0]}'); cursor: pointer;" onclick="openPhotoLightbox(currentDetailGalleryIdx)" title="🔍 คลิกเพื่อเปิดดูภาพขนาดเต็ม">
        <div class="detail-banner-overlay">
          <div style="margin-top: auto;">
            <h2 class="detail-title">${rst.name}</h2>
            <div class="detail-meta-row">
              <span>📍 ${rst.location}</span>
              <span>🍛 ${rst.category}</span>
              <span>⏰ ${rst.openHours}</span>
              <span>💰 ${rst.priceRange}</span>
            </div>
          </div>
        </div>
        <div style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.68); color: #fff; padding: 0.25rem 0.65rem; border-radius: var(--radius-full); font-size: 0.775rem; font-weight: 700; display: flex; align-items: center; gap: 0.35rem; backdrop-filter: blur(4px);">
          🔍 คลิกดูรูปเต็ม (<span id="detailGalleryCounter">1</span>/${galleryImages.length})
        </div>
      </div>

      <!-- Thumbnails row if multiple images exist -->
      ${galleryImages.length > 1 ? `
        <div class="gallery-thumbs-row">
          ${galleryImages.map((img, idx) => `
            <button type="button" class="gallery-thumb-btn ${idx === 0 ? 'active' : ''}" onclick="switchDetailMainPhoto(${idx}, this)" title="ดูรูปที่ ${idx + 1}">
              <img src="${img}" alt="รูปที่ ${idx + 1}">
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>

    <!-- Inner Tab Navigation -->
    <div class="tab-nav">
      <button type="button" class="tab-btn active" onclick="switchDetailTab('detailMenuTab', this)">📋 เมนูในร้าน (${(rst.menuSections ? rst.menuSections.reduce((sum, s) => sum + (s.items?.length || 0), 0) : 0) || (rst.menus ? rst.menus.length : 0)})</button>
      <button type="button" class="tab-btn" onclick="switchDetailTab('detailReviewTab', this)">⭐ รีวิวจากเพื่อน SPU (${stats.count})</button>
    </div>

    <!-- TAB 1: Menu Items -->
    <div class="tab-pane active" id="detailMenuTab">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.15rem; flex-wrap: wrap; gap: 0.5rem;">
        <div style="color: var(--text-muted); font-size: 0.9rem; max-width: 650px;">
          ${rst.description}
        </div>
        ${isAdmin() ? `
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button type="button" class="btn btn-sm btn-outline" onclick="closeModal('restaurantDetailModal'); openEditRestaurantModal('${rst.id}')">
              ✏️ แก้ไขข้อมูลร้าน (Admin)
            </button>
            <button type="button" class="btn btn-sm btn-outline" onclick="openAddMenuPrompt('${rst.id}')">
              ➕ เพิ่มเมนูอาหาร (Admin)
            </button>
          </div>
        ` : ''}
      </div>

      ${(() => {
        const allMenus = Array.isArray(rst.menus) ? rst.menus : [];
        const recommendedMenus = allMenus
          .map((m, idx) => ({ m, idx }))
          .filter(x => x.m && x.m.isRecommended === true);
        const regularMenus = allMenus
          .map((m, idx) => ({ m, idx }))
          .filter(x => x.m && x.m.isRecommended !== true);
        const menuSections = Array.isArray(rst.menuSections) ? rst.menuSections : [];
        const totalCatalogItems = menuSections.reduce((sum, s) => sum + (Array.isArray(s.items) ? s.items.length : 0), 0);

        let html = '';

        // 1. Recommended Menus Section (shown ONLY when the shop actually has recommended menus)
        if (recommendedMenus.length > 0) {
          html += `
            <div class="detail-menu-section-head">
              <span>⭐ เมนูแนะนำประจำร้าน</span>
              <span class="detail-menu-count-pill">${recommendedMenus.length} เมนู</span>
            </div>
            <div class="menu-items-grid" style="margin-bottom: 1.5rem;">
              ${recommendedMenus.map(({ m, idx }) => `
                <div class="menu-card">
                  <img src="${m.image || rst.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}" class="menu-thumb" alt="${escapeHtml(m.name)}" style="cursor: pointer;" onclick="openPhotoLightboxWithSrc(this.src, 'เมนู ${escapeHtml(m.name)}')" title="🔍 คลิกดูรูปเมนู" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'">
                  <div class="menu-info">
                    <span class="menu-badge">⭐ เมนูแนะนำ</span>
                    <div class="menu-name">${escapeHtml(m.name)}</div>
                    <div class="menu-price">${m.price} บาท</div>
                  </div>
                  ${isAdmin() ? `
                    <button type="button" style="color: #ef4444; font-size: 1rem; padding: 0.25rem 0.5rem;" onclick="adminDeleteMenu('${rst.id}', ${idx})" title="ลบเมนูนี้">✕</button>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `;
        }

        // 2. Store Menu List Section (รายการเมนูในร้าน — แยกหัวข้อชัดเจน)
        html += `
          <div class="detail-menu-section-head">
            <span>📋 รายการเมนูในร้าน</span>
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <span class="detail-menu-count-pill">${totalCatalogItems > 0 ? `${totalCatalogItems} รายการ` : `${regularMenus.length} รายการ`}</span>
              ${isAdmin() ? `
                <button type="button" class="btn btn-outline btn-sm" style="padding: 0.2rem 0.6rem; font-size: 0.75rem;" onclick="closeModal('restaurantDetailModal'); openEditRestaurantModal('${rst.id}', 'menuSections')">
                  ✏️ แก้ไขรายการเมนูในร้าน
                </button>
              ` : ''}
            </div>
          </div>
        `;

        if (menuSections.length > 0) {
          html += `
            <div class="store-menu-sections-grid">
              ${menuSections.map(sec => `
                <div class="store-menu-group-card">
                  <div class="store-menu-group-title">
                    <span>${escapeHtml(sec.title || '')}</span>
                    ${sec.subtitle ? `<span class="store-menu-group-sub">${escapeHtml(sec.subtitle)}</span>` : ''}
                  </div>
                  <div>
                    ${(sec.items || []).map(item => `
                      <div class="store-menu-row">
                        <span class="store-menu-row-name">${escapeHtml(item.name || '')}</span>
                        <span class="store-menu-row-price">${escapeHtml(item.price || '')}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        } else if (regularMenus.length > 0) {
          html += `
            <div class="menu-items-grid">
              ${regularMenus.map(({ m, idx }) => `
                <div class="menu-card">
                  <img src="${m.image || rst.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}" class="menu-thumb" alt="${escapeHtml(m.name)}" style="cursor: pointer;" onclick="openPhotoLightboxWithSrc(this.src, 'เมนู ${escapeHtml(m.name)}')" title="🔍 คลิกดูรูปเมนู" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'">
                  <div class="menu-info">
                    <div class="menu-name">${escapeHtml(m.name)}</div>
                    <div class="menu-price">${m.price} บาท</div>
                  </div>
                  ${isAdmin() ? `
                    <button type="button" style="color: #ef4444; font-size: 1rem; padding: 0.25rem 0.5rem;" onclick="adminDeleteMenu('${rst.id}', ${idx})" title="ลบเมนูนี้">✕</button>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `;
        } else if (recommendedMenus.length === 0) {
          html += '<div style="text-align: center; color: var(--text-muted); padding: 1.5rem;">ยังไม่มีรายการเมนูในขณะนี้</div>';
        }

        return html;
      })()}
    </div>

    <!-- TAB 2: Reviews & Write Review -->
    <div class="tab-pane" id="detailReviewTab">
      <!-- Ratings Summary -->
      <div class="reviews-summary">
        <div>
          <div class="rating-big-num">${stats.count > 0 ? stats.avg.toFixed(1) : '0.0'}</div>
          <div style="color: #f59e0b; font-size: 1.25rem;">
            ${getStarSymbols(Math.round(stats.avg || 0))}
          </div>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
            ${stats.count > 0 ? `จากทั้งหมด ${stats.count} รีวิว` : 'ยังไม่มีรีวิว'}
          </div>
        </div>
        <div style="flex-grow: 1; border-left: 1px solid var(--border-color); padding-left: 1.5rem; font-size: 0.875rem;">
          <div style="margin-bottom: 0.25rem;">✨ <strong>เงื่อนไขของระบบ:</strong> สมาชิก 1 คน สามารถเขียนรีวิวได้ 1 ครั้งต่อร้าน โดยสามารถแก้ไขหรือลบรีวิวของตนเองได้ตลอดเวลา</div>
          <div style="color: var(--primary); font-weight: 700;">🎁 เขียนรีวิววันนี้ ช่วยเพื่อนๆ เลือกร้านอร่อยและรับบัดจ์นักรีวิว!</div>
        </div>
      </div>

      <!-- Write / Edit Review Box -->
      <div style="background: var(--bg-surface-alt); padding: 1.25rem; border-radius: var(--radius-lg); margin-bottom: 2rem; border: 1.5px solid var(--border-color);">
        <h4 style="margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
          <span>✍️ ${userExistingReview ? 'แก้ไขรีวิวของคุณ' : 'เขียนรีวิวร้านนี้'}</span>
          ${userExistingReview ? `
            <button type="button" class="btn btn-sm btn-outline btn-danger" onclick="deleteMyReview('${userExistingReview.id}')">
              🗑️ ลบรีวิวของฉัน
            </button>
          ` : ''}
        </h4>

        <div style="margin-bottom: 1rem;">
          <label class="form-label required">ให้คะแนนความพึงพอใจ:</label>
          <div class="star-picker" id="reviewStarPicker">
            ${[1, 2, 3, 4, 5].map(star => `
              <span class="star ${(userExistingReview?.rating || 5) >= star ? 'active' : ''}" onclick="setReviewRating(${star})">★</span>
            `).join('')}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label required" for="reviewCommentInput">บอกต่อเพื่อน SPU (รสชาติ, ปริมาณ, ความคุ้มค่า):</label>
          <textarea id="reviewCommentInput" class="form-control" rows="3" placeholder="เขียนรีวิวอย่างน้อย 10 ตัวอักษร เช่น ป้าพรผัดกะเพราเด็ดมาก ให้เยอะ คุ้มค่าเงิน 50 บาท...">${userExistingReview ? userExistingReview.comment : ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="reviewImageUrlInput">แนบรูปภาพอาหาร (อัปโหลดจากเครื่อง หรือวางลิงก์รูป):</label>
          <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap;">
            <input type="file" id="reviewImageFileInput" accept="image/*" style="display: none;" onchange="handleReviewImageUpload(event)">
            <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('reviewImageFileInput').click()">
              📷 เลือกรูปจากเครื่อง
            </button>
            <span id="reviewImageFileName" style="font-size: 0.8rem; color: var(--text-muted);"></span>
          </div>
          <input type="url" id="reviewImageUrlInput" class="form-control" placeholder="หรือวางลิงก์รูปภาพ https://..." value="${userExistingReview?.image || ''}" oninput="handleReviewImageUrlInput(this.value)">
          <div id="reviewImagePreviewWrap" style="margin-top: 0.5rem; display: ${userExistingReview?.image ? 'block' : 'none'};">
            <img id="reviewImagePreview" src="${userExistingReview?.image || ''}" alt="ตัวอย่างรูปอาหาร" style="max-height: 120px; border-radius: var(--radius-sm); border: 1.5px solid var(--border-color); object-fit: cover;">
          </div>
        </div>

        <button type="button" class="btn btn-primary" onclick="submitReview('${rst.id}')">
          🚀 ${userExistingReview ? 'อัปเดตรีวิว' : 'โพสต์รีวิว'}
        </button>
      </div>

      <!-- Reviews Feed -->
      <h4 style="margin-bottom: 1rem;">ความคิดเห็นทั้งหมด (${reviews.length})</h4>
      <div class="reviews-list">
        ${reviews.length === 0 ? '<div style="color: var(--text-muted); text-align: center; padding: 2rem;">ยังไม่มีรีวิวสำหรับร้านนี้ เป็นคนแรกที่รีวิวเลย!</div>' : ''}
        ${reviews.map(rev => {
          const isMyReview = currentUid && rev.userId === currentUid;
          const dateLabel = rev.date || formatFirebaseDate(rev.createdAt);
          return `
            <div class="review-item">
              <div class="review-header">
                <div class="reviewer-meta">
                  ${renderFramedAvatar(rev.userAvatar, rev.userFrame || 'frame-none', 42, 'reviewer-avatar', rev.userName)}
                  <div>
                    <div class="reviewer-name">${rev.userName} ${isMyReview ? '<span style="font-size: 0.7rem; background: var(--primary-light); color: var(--primary); padding: 0.1rem 0.4rem; border-radius: 4px;">คุณ</span>' : ''}</div>
                    <div class="review-date">${dateLabel}</div>
                  </div>
                </div>
                <div class="review-stars">${getStarSymbols(rev.rating)}</div>
              </div>

              <div class="review-content">${rev.comment}</div>
              ${rev.image ? `
                <div style="margin-top: 0.5rem;">
                  <img src="${rev.image}" class="review-img" alt="ภาพรีวิว" style="cursor: pointer; max-height: 160px; border-radius: var(--radius-md); border: 2px solid var(--border-color); object-fit: cover; transition: transform var(--transition-fast);" onclick="openPhotoLightboxWithSrc('${rev.image}', 'ภาพรีวิวโดย ${rev.userName}')" title="🔍 คลิกดูรูปขนาดเต็ม" onerror="this.style.display='none'">
                  <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">🔍 คลิกที่ภาพเพื่อดูขนาดเต็ม</div>
                </div>
              ` : ''}

              <div class="review-actions-row">
                <button type="button" class="btn btn-outline btn-sm" onclick="voteHelpful('${rev.id}')">
                  👍 มีประโยชน์ (${rev.helpfulCount || 0})
                </button>
                <button type="button" class="btn btn-outline btn-sm" onclick="reportReview('${rev.id}')" title="รายงานรีวิวที่ไม่เหมาะสม">
                  🚩 รายงาน
                </button>
                ${isAdmin() ? `
                  <button type="button" class="btn btn-danger btn-sm" onclick="adminDeleteReview('${rev.id}', '${rst.id}')">
                    🗑️ ประหารคอมเมนต์ (Admin)
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  openModal('restaurantDetailModal');
}

function switchDetailTab(tabId, btn) {
  document.querySelectorAll('#restaurantDetailBody .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#restaurantDetailBody .tab-pane').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');
}

function openAddMenuPrompt(restaurantId) {
  if (!isAdmin()) {
    showToast("เฉพาะแอดมินเท่านั้นที่สามารถเพิ่มหรือจัดการเมนูได้", "error");
    return;
  }
  closeModal('restaurantDetailModal');
  openEditRestaurantModal(restaurantId);
}

async function adminDeleteMenu(restaurantId, menuIndex) {
  if (!isAdmin()) return;
  if (!confirm("คุณต้องการลบเมนูนี้ออกจากร้านใช่หรือไม่?")) return;

  const rst = AppState.restaurants.find(r => r.id === restaurantId);
  if (!rst || !rst.menus || !rst.menus[menuIndex]) return;

  const deletedName = rst.menus[menuIndex].name;
  const updatedMenus = rst.menus.filter((_, idx) => idx !== menuIndex);

  try {
    await window.FirestoreService.updateRestaurant(restaurantId, { menus: updatedMenus });
    rst.menus = updatedMenus;
    showToast(`ลบเมนู "${deletedName}" เรียบร้อยแล้ว`, "info");
    openRestaurantDetail(restaurantId);
    renderAdminRestaurantsTable();
  } catch (err) {
    console.error('Error deleting menu:', err);
    showToast('ลบเมนูไม่สำเร็จ: ' + (err?.message || 'ไม่มีสิทธิ์หรือเชื่อมต่อ Firebase ไม่ได้'), 'error');
  }
}

function setReviewRating(star) {
  currentReviewRating = star;
  SoundFX.playTick();
  const stars = document.querySelectorAll('#reviewStarPicker .star');
  stars.forEach((s, idx) => {
    if (idx < star) s.classList.add('active');
    else s.classList.remove('active');
  });
}

function getStarSymbols(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += i <= rating ? '★' : '☆';
  }
  return stars;
}

let reviewFormUploadedImage = '';

async function handleReviewImageUpload(event) {
  const file = event.target?.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น (PNG, JPG, WebP, GIF)', 'error');
    return;
  }
  try {
    const compressed = await compressImageFile(file, 800, 600, 0.78);
    if (compressed) {
      reviewFormUploadedImage = compressed;
      const fileNameEl = document.getElementById('reviewImageFileName');
      if (fileNameEl) fileNameEl.textContent = `✅ แนบรูปแล้ว (${file.name})`;
      const previewImg = document.getElementById('reviewImagePreview');
      const previewWrap = document.getElementById('reviewImagePreviewWrap');
      if (previewImg && previewWrap) {
        previewImg.src = compressed;
        previewWrap.style.display = 'block';
      }
      showToast('แนบรูปภาพอาหารเรียบร้อยแล้ว 📷', 'success');
    }
  } catch (err) {
    console.error('Review image upload error:', err);
    showToast('อ่านไฟล์รูปภาพไม่สำเร็จ', 'error');
  } finally {
    if (event.target) event.target.value = '';
  }
}

function handleReviewImageUrlInput(val) {
  const trimmed = (val || '').trim();
  const previewImg = document.getElementById('reviewImagePreview');
  const previewWrap = document.getElementById('reviewImagePreviewWrap');
  if (trimmed) {
    reviewFormUploadedImage = '';
    const fileNameEl = document.getElementById('reviewImageFileName');
    if (fileNameEl) fileNameEl.textContent = '';
    if (previewImg && previewWrap) {
      previewImg.src = trimmed;
      previewWrap.style.display = 'block';
    }
  } else if (!reviewFormUploadedImage) {
    if (previewWrap) previewWrap.style.display = 'none';
  }
}

async function submitReview(restaurantId) {
  if (!requireAuth("เขียนรีวิวร้านอาหาร")) return;
  if (!window.FirestoreService?.isConfigured()) {
    showToast('⚠️ กรุณาเชื่อมต่อ firebaseConfig ใน js/firebase-config.js ก่อนบันทึกรีวิว', 'warning');
    return;
  }

  const comment = document.getElementById('reviewCommentInput')?.value.trim();
  const imageUrl = document.getElementById('reviewImageUrlInput')?.value.trim();
  const finalImage = reviewFormUploadedImage || imageUrl || '';

  if (!comment || comment.length < 10) {
    showToast('กรุณาเขียนรีวิวอย่างน้อย 10 ตัวอักษร เพื่อให้ข้อมูลเป็นประโยชน์แก่เพื่อนๆ', 'error');
    return;
  }

  const currentUser = getCurrentUser();
  const uid = currentUser.uid || currentUser.id;
  const existing = AppState.reviews.find(r => r.restaurantId === restaurantId && r.userId === uid);

  try {
    await window.FirestoreService.saveReview({
      restaurantId,
      userId: uid,
      userName: currentUser.name,
      userAvatar: currentUser.avatar || '',
      userFrame: currentUser.equippedFrame || 'frame-none',
      userTitle: currentUser.customTitle || 'นักชิมมือใหม่',
      rating: currentReviewRating,
      comment,
      image: finalImage
    });

    if (existing) {
      showToast('แก้ไขรีวิวสำเร็จแล้ว!', 'success');
    } else {
      await checkAndAwardBadges(uid, 1);
      SoundFX.playWin();
      showToast('โพสต์รีวิวสำเร็จ! ขอบคุณที่ช่วยเพื่อนๆ เลือกร้านอร่อย 🎉', 'success');
    }

    setTimeout(() => {
      if (currentDetailRestaurantId === restaurantId) openRestaurantDetail(restaurantId);
      filterRestaurants();
      renderLeaderboard();
    }, 150);
  } catch (err) {
    console.error('Submit review error:', err);
    showToast('บันทึกรีวิวไม่สำเร็จ: ' + (err?.message || 'กรุณาตรวจสอบ Security Rules'), 'error');
  }
}

async function deleteMyReview(reviewId) {
  if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรีวิวนี้?')) return;
  try {
    await window.FirestoreService.deleteReview(reviewId);
    AppState.reviews = AppState.reviews.filter(r => r.id !== reviewId);
    showToast('ลบรีวิวเรียบร้อยแล้ว', 'info');
    if (currentDetailRestaurantId) {
      openRestaurantDetail(currentDetailRestaurantId);
    }
    filterRestaurants();
    renderLeaderboard();
  } catch (err) {
    console.error('Delete review error:', err);
    showToast('ลบรีวิวไม่สำเร็จ: ' + (err?.message || ''), 'error');
  }
}

async function voteHelpful(reviewId) {
  if (!requireAuth("โหวตรีวิวมีประโยชน์")) return;
  const rev = AppState.reviews.find(r => r.id === reviewId);
  if (!rev) return;

  const currentUser = getCurrentUser();
  const uid = currentUser.uid || currentUser.id;
  try {
    await window.FirestoreService.toggleHelpfulReview(reviewId, uid, rev.helpfulBy || []);
    SoundFX.playMatch();
    showToast('บันทึกคะแนนโหวตรีวิวแล้ว 👍', 'success');
    setTimeout(() => {
      if (currentDetailRestaurantId) openRestaurantDetail(currentDetailRestaurantId);
    }, 150);
  } catch (err) {
    console.error('Vote helpful error:', err);
    showToast('โหวตรีวิวไม่สำเร็จ', 'error');
  }
}

async function reportReview(reviewId) {
  if (!requireAuth("รายงานรีวิว")) return;
  try {
    await window.FirestoreService.reportReview(reviewId);
    showToast('รายงานรีวิวไปยังทีมแอดมินเรียบร้อยแล้ว ขอบคุณที่ช่วยดูแลระบบ', 'info');
  } catch (err) {
    console.error('Report review error:', err);
    showToast('ส่งรายงานไม่สำเร็จ', 'error');
  }
}

async function adminDeleteReview(reviewId, restaurantId) {
  if (!isAdmin()) {
    showToast('เฉพาะแอดมินเท่านั้นที่มีสิทธิประหารคอมเมนต์', 'error');
    return;
  }
  if (!confirm('⚠️ แอดมินยืนยันที่จะ "ประหารคอมเมนต์" (ลบรีวิวนี้ออกจากระบบถาวร)?')) return;

  try {
    await window.FirestoreService.deleteReview(reviewId);
    AppState.reviews = AppState.reviews.filter(r => r.id !== reviewId);
    showToast('ประหารคอมเมนต์เรียบร้อยแล้ว (ลบสำเร็จ)', 'success');

    if (currentDetailRestaurantId) {
      openRestaurantDetail(currentDetailRestaurantId);
    }
    renderAdminReviews();
    filterRestaurants();
    renderLeaderboard();
  } catch (err) {
    console.error('Admin delete review error:', err);
    showToast('ลบรีวิวไม่สำเร็จ: ' + (err?.message || ''), 'error');
  }
}

// ============================================================================
// 9. Badges & Leaderboard Engine (based on streaks & reviews, no points)
// ============================================================================

async function checkAndAwardBadges(userId, extraReviewCount = 0) {
  const currentUser = getCurrentUser();
  const user = (currentUser && (currentUser.uid === userId || currentUser.id === userId))
    ? currentUser
    : AppState.users.find(u => u.id === userId || u.uid === userId);
  if (!user) return;

  const nextBadges = [...(user.badges || ["newbie"])];
  const nextFrames = [...(user.unlockedFrames || ["frame-none"])];
  const userReviewCount = AppState.reviews.filter(r => r.userId === userId).length + extraReviewCount;
  const userStreak = user.checkInStreak || 0;

  let changed = false;

  BADGES_LIST.forEach(b => {
    if (nextBadges.includes(b.id)) return;
    let earned = false;
    if (b.reqType === 'register') earned = true;
    else if (b.reqType === 'streak' && userStreak >= (b.minStreak || 0)) earned = true;
    else if (b.reqType === 'reviews' && userReviewCount >= (b.minReviews || 0)) earned = true;

    if (earned) {
      nextBadges.push(b.id);
      showToast(`🏆 ยินดีด้วย! ปลดล็อกบัดจ์ใหม่: "${b.name}" ${b.icon}`, 'success');
      changed = true;
    }
  });

  if (userReviewCount >= 1 && !nextFrames.includes("frame-spu-pink")) {
    nextFrames.push("frame-spu-pink");
    showToast('🖼️ ปลดล็อกกรอบ "SPU Pink Ribbon" จากการเขียนรีวิวร้านแรก!', 'success');
    changed = true;
  }
  if (userReviewCount >= 1 && !nextFrames.includes("frame-ramen-master")) {
    nextFrames.push("frame-ramen-master");
    showToast('🍜 ปลดล็อกกรอบ "Ramen Narutomaki" จากการเขียนรีวิวร้านแรก!', 'success');
    changed = true;
  }
  if (userReviewCount >= 2 && !nextFrames.includes("frame-flame")) {
    nextFrames.push("frame-flame");
    showToast('🖼️ ปลดล็อกกรอบ "Flame Food Master" จากการรีวิวครบ 2 ร้าน!', 'success');
    changed = true;
  }
  if (userReviewCount >= 3 && !nextFrames.includes("frame-gold")) {
    nextFrames.push("frame-gold");
    showToast('⭐ ปลดล็อกกรอบ "Golden Foodie" จากการรีวิวครบ 3 ร้าน!', 'success');
    changed = true;
  }

  if (changed) {
    user.badges = nextBadges;
    user.unlockedFrames = nextFrames;
    if (window.AuthService?.isConfigured()) {
      try {
        await window.AuthService.updateOwnProfile(user.uid || user.id, {
          badges: nextBadges,
          unlockedFrames: nextFrames
        });
      } catch (e) {}
    }
    if (currentUser && (currentUser.uid === userId || currentUser.id === userId)) {
      AppState.currentUser = user;
      renderBadgesShowcase();
    }
  }
}

function renderLeaderboard() {
  const listEl = document.getElementById('leaderboardList');
  if (!listEl) return;

  const users = AppState.users;
  const reviews = AppState.reviews;

  if (!users || users.length === 0) {
    listEl.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted); border: 1px dashed var(--border-color); border-radius: var(--radius-md); background: var(--bg-surface-alt);">
        🏆 ยังไม่มีข้อมูลสมาชิกบนตารางอันดับ — สมัครสมาชิกและเช็กอินเพื่อขึ้นอันดับหนึ่งได้เลย!
      </div>
    `;
    return;
  }

  // Sort by streak first, then by review count
  const sorted = [...users].sort((a, b) => {
    const streakDiff = (b.checkInStreak || 0) - (a.checkInStreak || 0);
    if (streakDiff !== 0) return streakDiff;
    const aReviews = reviews.filter(r => r.userId === (a.uid || a.id)).length;
    const bReviews = reviews.filter(r => r.userId === (b.uid || b.id)).length;
    return bReviews - aReviews;
  });

  listEl.innerHTML = sorted.slice(0, 5).map((user, idx) => {
    let rankBadge = `${idx + 1}`;
    let rankClass = '';
    if (idx === 0) { rankBadge = '🥇'; rankClass = 'rank-1'; }
    else if (idx === 1) { rankBadge = '🥈'; rankClass = 'rank-2'; }
    else if (idx === 2) { rankBadge = '🥉'; rankClass = 'rank-3'; }

    const userReviewCount = reviews.filter(r => r.userId === (user.uid || user.id)).length;

    return `
      <div class="leader-item">
        <div class="leader-rank ${rankClass}">${rankBadge}</div>
        ${renderFramedAvatar(user.avatar, user.equippedFrame || 'frame-none', 46, 'leader-avatar', user.name)}
        <div class="leader-info">
          <div class="leader-name">${user.name}</div>
          <div class="leader-role">${user.customTitle || user.userType || 'สมาชิกจานเด็ด SPU'}</div>
        </div>
        <div class="leader-points">🔥 ${user.checkInStreak || 0} วัน | 💬 ${userReviewCount} รีวิว</div>
      </div>
    `;
  }).join('');
}

function renderBadgesShowcase() {
  const grid = document.getElementById('badgesGrid');
  if (!grid) return;

  const currentUser = getCurrentUser();
  const myBadges = currentUser?.badges || ["newbie"];

  grid.innerHTML = BADGES_LIST.map(badge => {
    const isUnlocked = myBadges.includes(badge.id);
    return `
      <div class="badge-item ${isUnlocked ? 'unlocked' : 'locked'}">
        <div class="badge-icon">${badge.icon}</div>
        <div class="badge-name">${badge.name}</div>
        <div class="badge-desc">${badge.desc}</div>
      </div>
    `;
  }).join('');
}

// ============================================================================
// 10. Mini-Game 1: Food Roulette Wheel Canvas Engine
// ============================================================================

let wheelRestaurants = [];
let wheelAngle = 0;
let isSpinning = false;

// Redraw the wheel once the cute web fonts (Mali / Itim) are loaded
if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    if (typeof drawWheel === 'function' && !isSpinning) drawWheel();
  });
}

function initWheel() {
  const canvas = document.getElementById('wheelCanvas');
  if (!canvas) return;

  const locSelect = document.getElementById('wheelLocationSelect');
  const selectedLoc = locSelect ? locSelect.value : 'all';

  const allRestaurants = AppState.restaurants;
  wheelRestaurants = allRestaurants.filter(r => selectedLoc === 'all' || r.location === selectedLoc);

  if (wheelRestaurants.length === 0) {
    wheelRestaurants = allRestaurants;
  }

  drawWheel();
}

function drawWheel() {
  const canvas = document.getElementById('wheelCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const center = width / 2;
  const radius = center - 10;

  ctx.clearRect(0, 0, width, height);

  const numSlices = wheelRestaurants.length;
  if (numSlices === 0) {
    ctx.save();
    ctx.translate(center, center);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(150, 150, 150, 0.08)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = 'rgba(150, 150, 150, 0.4)';
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#5c4338';
    if (isAdmin()) {
      ctx.font = '600 16px Mitr, Prompt, sans-serif';
      ctx.fillText('🍽️ ยังไม่มีร้านอาหารในระบบ', 0, -8);
      ctx.font = '13px Prompt, sans-serif';
      ctx.fillText('➕ เพิ่มร้านอาหารเพื่อเริ่มหมุนจานสุ่มเมนู', 0, 16);
    } else {
      ctx.font = '600 15px Mitr, Prompt, sans-serif';
      ctx.fillText('🍽️ ตอนนี้ยังไม่มีร้านแนะนำ', 0, -8);
      ctx.font = '13px Prompt, sans-serif';
      ctx.fillText('ลองมาใหม่ในรอบหน้านะครับ 🎲', 0, 16);
    }
    ctx.restore();
    return;
  }
  const sliceAngle = (2 * Math.PI) / numSlices;

  // Appetizing Thai Street-Food & Bistro Palette
  const colors = [
    '#e03e1a', '#f59e0b', '#2b7a4b', '#d97706',
    '#c2410c', '#eab308', '#15803d', '#b45309'
  ];

  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(wheelAngle);

  for (let i = 0; i < numSlices; i++) {
    const startAngle = i * sliceAngle;
    const endAngle = startAngle + sliceAngle;

    // Draw slice
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#fff8ee';
    ctx.stroke();

    // Draw restaurant name on plate slice
    ctx.save();
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = 'right';
    ctx.font = '500 14px Mitr, Prompt, sans-serif';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = 'rgba(44, 29, 22, 0.75)';

    let text = wheelRestaurants[i].name;
    if (text.length > 14) text = text.substring(0, 13) + '...';
    ctx.strokeText(text, radius - 20, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, radius - 20, 5);
    ctx.restore();
  }

  // Ceramic & Wood Bistro Plate Rim
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#3b2419';
  ctx.stroke();

  ctx.restore();
}

function spinWheel() {
  if (isSpinning) return;
  if (wheelRestaurants.length === 0) {
    if (isAdmin()) {
      showToast('ยังไม่มีร้านอาหารในระบบ กรุณาเพิ่มร้านอาหารก่อนเริ่มหมุนวงล้อ!', 'info');
      openAddRestaurantModal();
    } else {
      showToast('ตอนนี้ยังไม่มีร้านแนะนำ ลองมาใหม่ในรอบหน้านะครับ 🎲', 'info');
    }
    return;
  }

  isSpinning = true;
  const spinBtn = document.getElementById('spinBtn');
  if (spinBtn) spinBtn.disabled = true;

  const resultBox = document.getElementById('rouletteResultBox');
  if (resultBox) resultBox.style.display = 'none';

  const startAngle = wheelAngle;
  // 6 to 9 full spins + random slice target offset
  const fullRotations = 6 + Math.floor(Math.random() * 4);
  const randomOffset = Math.random() * (2 * Math.PI);
  const totalRotation = (fullRotations * 2 * Math.PI) + randomOffset;
  const targetAngle = startAngle + totalRotation;

  const duration = 4500; // 4.5 seconds for a realistic cinematic spin
  const startTime = performance.now();

  const numSlices = wheelRestaurants.length;
  const sliceAngle = (2 * Math.PI) / numSlices;
  let lastSliceTracked = Math.floor(startAngle / sliceAngle);

  function animateSpin(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Quintic ease-out: smooth deceleration matching physical wheel inertia
    const easeOut = 1 - Math.pow(1 - progress, 5);
    wheelAngle = startAngle + (totalRotation * easeOut);

    // Audio tick sound: physically synchronized with slice crossings
    const currentSlice = Math.floor(wheelAngle / sliceAngle);
    if (currentSlice !== lastSliceTracked) {
      SoundFX.playTick();
      lastSliceTracked = currentSlice;
    }

    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      wheelAngle = targetAngle % (2 * Math.PI);
      drawWheel();
      isSpinning = false;
      if (spinBtn) spinBtn.disabled = false;
      finalizeWheelResult();
    }
  }

  requestAnimationFrame(animateSpin);
}

function finalizeWheelResult() {
  const numSlices = wheelRestaurants.length;
  if (numSlices === 0) return;
  const sliceAngle = (2 * Math.PI) / numSlices;
  
  // Normalize angle
  const normalizedAngle = (wheelAngle % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI);
  // Pointer is at 270 deg (1.5 * PI)
  const pointerAngle = (1.5 * Math.PI - normalizedAngle + (2 * Math.PI)) % (2 * Math.PI);
  const winningIndex = Math.floor(pointerAngle / sliceAngle) % numSlices;

  const winner = wheelRestaurants[winningIndex];
  if (!winner) return;

  SoundFX.playWin();

  const resultBox = document.getElementById('rouletteResultBox');
  if (resultBox) {
    const winnerImg = winner.image || (winner.images && winner.images[0]) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
    const recMenus = (winner.menus || []).filter(m => m.isRecommended);
    const displayMenus = recMenus.length > 0 ? recMenus : (winner.menus || []).slice(0, 3);
    const winnerStats = calculateRestaurantRating(winner.id);
    const winnerRatingLabel = winnerStats.count > 0 ? `⭐ ${winnerStats.avg.toFixed(1)} (${winnerStats.count})` : '⭐ ยังไม่มีรีวิว';

    resultBox.innerHTML = `
      <div class="result-badge" style="display: inline-flex; align-items: center; gap: 0.35rem; margin-bottom: 0.85rem;">
        <span>🎉</span> <span>ผลการสุ่มมื้อนี้สำเร็จแล้ว!</span>
      </div>
      
      <div style="background: var(--bg-surface); border: 1.5px solid var(--primary-light); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-md); margin-bottom: 1rem; text-align: left;">
        <div style="position: relative; height: 160px; overflow: hidden; background: #0f172a; cursor: pointer;" onclick="openRestaurantDetail('${winner.id}')" title="คลิกดูรายละเอียดร้าน">
          <img src="${winnerImg}" alt="${winner.name}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
          <div style="position: absolute; top: 0.75rem; right: 0.75rem; background: rgba(0,0,0,0.65); backdrop-filter: blur(4px); color: #fff; padding: 0.25rem 0.65rem; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 700;">
            📍 ${winner.location}
          </div>
          <div style="position: absolute; bottom: 0.75rem; left: 0.75rem; background: var(--primary); color: #fff; padding: 0.25rem 0.65rem; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 700;">
            💵 ${winner.priceRange || 'ราคาประหยัด'}
          </div>
        </div>

        <div style="padding: 1.15rem;">
          <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <span>🍽️ ${winner.name}</span>
            <span style="font-size: 0.85rem; color: #f59e0b; font-weight: 700;">${winnerRatingLabel}</span>
          </h3>

          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.85rem; line-height: 1.5;">
            ${winner.description || 'ร้านอาหารยอดนิยมใน SPU เมนูหลากหลาย รสชาติจัดจ้าน ถูกใจนักศึกษา'}
          </p>

          <!-- Recommended Menus Section -->
          <div style="background: var(--bg-surface-alt); padding: 0.85rem; border-radius: var(--radius-md); border: 1px dashed var(--border-color); margin-bottom: 1rem;">
            <div style="font-size: 0.825rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.35rem;">
              <span>⭐</span> <span>เมนูแนะนำห้ามพลาดของร้านนี้:</span>
            </div>
            ${displayMenus.length > 0 ? `
              <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                ${displayMenus.map(m => `
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; background: var(--bg-surface); padding: 0.4rem 0.65rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                    <span style="font-weight: 700; color: var(--text-main);">✨ ${m.name}</span>
                    <span style="color: var(--primary); font-weight: 800; white-space: nowrap;">${m.price} บาท</span>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="font-size: 0.825rem; color: var(--text-muted);">มีเมนูหลากหลายให้เลือกสั่งหน้าร้าน</div>
            `}
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
            <button type="button" class="btn btn-primary btn-sm" onclick="openRestaurantDetail('${winner.id}')" style="flex: 1 1 180px; justify-content: center;">
              👉 ดูเมนูและรีวิวทั้งหมด
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="spinWheel()" style="justify-content: center;">
              🎲 สุ่มอีกรอบ
            </button>
          </div>
        </div>
      </div>
    `;
    resultBox.style.display = 'block';
  }

  showToast(`🎉 ได้ร้านแล้ว: "${winner.name}" พร้อมเมนูแนะนำ!`, 'success');
}

// ============================================================================
// 10.5 Smart Budget Combo Planner (ระบบจัดเซตมื้อเที่ยงตามงบ - ซิงค์ข้อมูลจริง 100%)
// ============================================================================

function isDrinkOrDessertItem(category = '', menuName = '') {
  const cleaned = `${category} ${menuName}`
    .toLowerCase()
    .replace(/ชาบู|สุกี้น้ำ|ต้มยำน้ำ|น้ำซุป|น้ำตก|น้ำมันหอย|น้ำจิ้ม/g, '');
  const keywords = ['เครื่องดื่ม', 'ของหวาน', 'เบเกอรี่', 'วาฟเฟิล', 'คาเฟ่', 'ชา', 'กาแฟ', 'โกโก้', 'นมสด', 'น้ำ', 'โซดา', 'ปั่น', 'ไอศกรีม', 'บิงซู', 'เค้ก', 'เครป', 'เฉาก๊วย', 'ขนม', 'โยเกิร์ต', 'สมูทตี้', 'บราวนี่', 'yogurt', 'smoothie', 'waffle', 'cafe', 'tea', 'coffee'];
  return keywords.some(k => cleaned.includes(k));
}

function getBudgetComboPools(locationFilter = 'all', priceRangeFilter = 'all') {
  const mains = [];
  const sides = [];

  const restaurants = Array.isArray(AppState.restaurants) ? AppState.restaurants : [];
  restaurants.forEach(r => {
    if (locationFilter !== 'all' && r.location !== locationFilter) return;
    const rImg = r.image || (Array.isArray(r.images) && r.images[0]) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=320';
    const menuList = Array.isArray(r.menus) && r.menus.length > 0
      ? r.menus.filter(m => m && (m.name || r.name))
      : [{ name: r.name, price: Number(r.avgPrice) || 45, image: rImg }];

    menuList.forEach(m => {
      const itemPrice = Number(m.price) || Number(r.avgPrice) || 0;
      if (itemPrice <= 0) return;

      if (priceRangeFilter === 'under40' && !(itemPrice < 40)) return;
      if (priceRangeFilter === '40-60' && !(itemPrice >= 40 && itemPrice <= 60)) return;
      if (priceRangeFilter === '60-100' && !(itemPrice > 60 && itemPrice <= 100)) return;
      if (priceRangeFilter === 'over100' && !(itemPrice > 100)) return;

      const entry = {
        name: m.name || r.name,
        price: itemPrice,
        shopName: r.name,
        location: r.location || 'ม.ศรีปทุม',
        image: m.image || rImg,
        restaurantId: r.id || ''
      };
      if (isDrinkOrDessertItem(r.category, m.name)) {
        sides.push(entry);
      } else {
        mains.push(entry);
      }
    });
  });

  return { mains, sides };
}

function renderBudgetComboIdleState() {
  const resultEl = document.getElementById('budgetComboResult');
  if (!resultEl) return;
  const totalRestaurants = Array.isArray(AppState.restaurants) ? AppState.restaurants.length : 0;
  if (totalRestaurants === 0) {
    resultEl.innerHTML = `
      <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); background: var(--bg-surface-alt); border-radius: var(--radius-lg); border: 1.5px dashed var(--border-color);">
        <div style="font-size: 2rem; margin-bottom: 0.4rem;">🍽️</div>
        <div style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem;">
          ยังไม่มีเมนูในขณะนี้ รอเพิ่มเติม
        </div>
        <div style="font-size: 0.85rem;">
          ระบบซิงค์จากข้อมูลร้านอาหารจริงในระบบ เมื่อแอดมินเพิ่มร้านและเมนูแล้วจะสามารถสุ่มจัดเซตได้ทันทีครับ
        </div>
      </div>
    `;
    return;
  }

  resultEl.innerHTML = `
    <div style="text-align: center; padding: 1.35rem; color: var(--text-muted); background: var(--bg-surface-alt); border-radius: var(--radius-lg); border: 1.5px dashed var(--border-color);">
      <div style="font-size: 1.65rem; margin-bottom: 0.35rem;">🍱</div>
      <div style="font-family: var(--font-heading); font-size: 1rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.2rem;">
        เลือกงบประมาณหรือตัวกรองด้านบน แล้วกดปุ่ม "🎲 สุ่มจัดเซตตามงบเลย!"
      </div>
      <div style="font-size: 0.84rem;">
        ระบบจะจับคู่เมนูจากร้านที่มีอยู่จริงในระบบให้คุณเมื่อกดปุ่มสุ่มครับ
      </div>
    </div>
  `;
}

function selectBudgetPreset(amount, btnEl) {
  const input = document.getElementById('budgetComboInput');
  if (input) input.value = amount;
  document.querySelectorAll('.budget-preset-pill').forEach(p => {
    p.classList.toggle('active', Number(p.getAttribute('data-budget')) === Number(amount));
  });
  if (typeof SoundFX !== 'undefined' && SoundFX.playTick) {
    SoundFX.playTick();
  }
}

function openBudgetComboPlanner() {
  switchAppView('roulette');
  setTimeout(() => {
    const card = document.getElementById('budgetComboSectionCard');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const resEl = document.getElementById('budgetComboResult');
    if (resEl && !resEl.innerHTML.trim()) {
      renderBudgetComboIdleState();
    }
  }, 80);
}

let lastComboSignature = '';

function generateBudgetCombo(silent = false) {
  const inputEl = document.getElementById('budgetComboInput');
  const locEl = document.getElementById('budgetComboLocation');
  const priceRangeEl = document.getElementById('budgetComboPriceFilter');
  const resultEl = document.getElementById('budgetComboResult');
  if (!resultEl) return;

  const budget = Math.max(1, Number(inputEl?.value) || 65);
  const locationFilter = locEl?.value || 'all';
  const priceRangeFilter = priceRangeEl?.value || 'all';

  document.querySelectorAll('.budget-preset-pill').forEach(p => {
    p.classList.toggle('active', Number(p.getAttribute('data-budget')) === budget);
  });

  if (!silent && typeof SoundFX !== 'undefined' && SoundFX.playTick) {
    SoundFX.playTick();
  }

  const { mains, sides } = getBudgetComboPools(locationFilter, priceRangeFilter);

  // Case 1: No menus exist in database at all (or none in selected filter)
  if (mains.length === 0 && sides.length === 0) {
    resultEl.innerHTML = `
      <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); background: var(--bg-surface-alt); border-radius: var(--radius-lg); border: 1.5px dashed var(--border-color);">
        <div style="font-size: 2rem; margin-bottom: 0.4rem;">🍽️</div>
        <div style="font-family: var(--font-heading); font-size: 1.08rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem;">
          ยังไม่มีเมนูในขณะนี้ รอเพิ่มเติม
        </div>
        <div style="font-size: 0.85rem;">
          ขณะนี้ยังไม่มีรายการเมนูในพิกัดหรือช่วงราคาที่เลือก รออัปเดตเมนูเพิ่มเติมเร็วๆ นี้ครับ
        </div>
      </div>
    `;
    if (!silent) {
      showToast('ยังไม่มีเมนูในขณะนี้ รอเพิ่มเติมครับ', 'info');
    }
    return;
  }

  // Case 2: Both Main Dishes and Drinks/Desserts exist — find pairs within budget
  const validPairs = [];
  mains.forEach(m => {
    sides.forEach(s => {
      const total = m.price + s.price;
      if (total <= budget) {
        validPairs.push({ main: m, side: s, total });
      }
    });
  });

  if (validPairs.length > 0) {
    validPairs.sort((a, b) => b.total - a.total);
    const candidatePool = validPairs.slice(0, Math.min(validPairs.length, 10));
    let chosen = candidatePool[Math.floor(Math.random() * candidatePool.length)];
    if (candidatePool.length > 1) {
      const sig = `${chosen.main.name}|${chosen.side.name}`;
      if (sig === lastComboSignature) {
        const alt = candidatePool.find(c => `${c.main.name}|${c.side.name}` !== lastComboSignature);
        if (alt) chosen = alt;
      }
    }
    lastComboSignature = `${chosen.main.name}|${chosen.side.name}`;

    const change = budget - chosen.total;
    const usedPercent = Math.min(100, Math.round((chosen.total / budget) * 100));

    resultEl.innerHTML = `
      <div class="combo-items-grid">
        <!-- Main Dish Card -->
        <div class="combo-item-card">
          <img src="${escapeHtml(chosen.main.image)}" alt="${escapeHtml(chosen.main.name)}" class="combo-item-thumb" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=240'">
          <div class="combo-item-body">
            <span class="combo-item-role">🍛 จานหลักอิ่มท้อง</span>
            <div class="combo-item-name">${escapeHtml(chosen.main.name)}</div>
            <div class="combo-item-shop">🏪 ${escapeHtml(chosen.main.shopName)} · 📍 ${escapeHtml(chosen.main.location)}</div>
            <div class="combo-item-footer">
              <span class="combo-item-price">💵 ${chosen.main.price} บาท</span>
              ${chosen.main.restaurantId ? `<button type="button" class="btn btn-outline btn-sm" style="padding: 0.2rem 0.6rem; font-size: 0.75rem;" onclick="openRestaurantDetail('${chosen.main.restaurantId}')">ดูร้านนี้</button>` : ''}
            </div>
          </div>
        </div>

        <div class="combo-plus-divider" aria-hidden="true">+</div>

        <!-- Drink / Dessert Card -->
        <div class="combo-item-card">
          <img src="${escapeHtml(chosen.side.image)}" alt="${escapeHtml(chosen.side.name)}" class="combo-item-thumb" onerror="this.src='https://images.unsplash.com/photo-1558857563-b371033873b8?w=240'">
          <div class="combo-item-body">
            <span class="combo-item-role">🧋 เครื่องดื่ม / ของหวาน</span>
            <div class="combo-item-name">${escapeHtml(chosen.side.name)}</div>
            <div class="combo-item-shop">🏪 ${escapeHtml(chosen.side.shopName)} · 📍 ${escapeHtml(chosen.side.location)}</div>
            <div class="combo-item-footer">
              <span class="combo-item-price">💵 ${chosen.side.price} บาท</span>
              ${chosen.side.restaurantId ? `<button type="button" class="btn btn-outline btn-sm" style="padding: 0.2rem 0.6rem; font-size: 0.75rem;" onclick="openRestaurantDetail('${chosen.side.restaurantId}')">ดูร้านนี้</button>` : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- Budget Breakdown Summary Bar -->
      <div class="combo-summary-bar">
        <div style="flex: 1; min-width: 220px;">
          <div style="display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap; margin-bottom: 0.35rem;">
            <span style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 600; color: var(--text-main);">
              🧾 ราคารวมทั้งเซต: <strong style="color: var(--primary); font-size: 1.25rem;">${chosen.total} บาท</strong>
            </span>
            <span style="font-size: 0.85rem; color: var(--text-muted);">(จากงบ ${budget} บาท · ใช้ไป ${usedPercent}%)</span>
          </div>
          <div style="font-size: 0.88rem; font-weight: 600; color: #10b981;">
            ${change > 0 ? `🎉 ประหยัดงบ! มีเงินทอนเหลือเก็บ ${change} บาท` : `✨ พอดีเป๊ะกับงบ ${budget} บาท คุ้มสุดๆ!`}
          </div>
        </div>
        <button type="button" class="btn btn-outline btn-sm" onclick="generateBudgetCombo(false)">
          🔄 สุ่มเซตใหม่อีกครั้ง
        </button>
      </div>
    `;

    if (!silent) {
      showToast(`🍱 จัดเซตสำเร็จ! "${chosen.main.name} + ${chosen.side.name}" รวม ${chosen.total}฿ (เหลือเงินทอน ${change}฿)`, 'success');
    }
    return;
  }

  // Case 3: Only one category exists within budget (e.g. only Drink/Dessert or only Main Dish exists in DB)
  const affordableMains = mains.filter(m => m.price <= budget);
  const affordableSides = sides.filter(s => s.price <= budget);

  if (affordableMains.length > 0 || affordableSides.length > 0) {
    const pickMain = affordableMains.length > 0 ? affordableMains[Math.floor(Math.random() * affordableMains.length)] : null;
    const pickSide = affordableSides.length > 0 ? affordableSides[Math.floor(Math.random() * affordableSides.length)] : null;
    const total = (pickMain ? pickMain.price : 0) + (pickSide ? pickSide.price : 0);
    const change = budget - total;

    resultEl.innerHTML = `
      <div class="combo-items-grid">
        <!-- Main Dish Slot -->
        ${pickMain ? `
          <div class="combo-item-card">
            <img src="${escapeHtml(pickMain.image)}" alt="${escapeHtml(pickMain.name)}" class="combo-item-thumb" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=240'">
            <div class="combo-item-body">
              <span class="combo-item-role">🍛 จานหลักอิ่มท้อง</span>
              <div class="combo-item-name">${escapeHtml(pickMain.name)}</div>
              <div class="combo-item-shop">🏪 ${escapeHtml(pickMain.shopName)} · 📍 ${escapeHtml(pickMain.location)}</div>
              <div class="combo-item-footer">
                <span class="combo-item-price">💵 ${pickMain.price} บาท</span>
                ${pickMain.restaurantId ? `<button type="button" class="btn btn-outline btn-sm" style="padding: 0.2rem 0.6rem; font-size: 0.75rem;" onclick="openRestaurantDetail('${pickMain.restaurantId}')">ดูร้านนี้</button>` : ''}
              </div>
            </div>
          </div>
        ` : `
          <div class="combo-item-card" style="justify-content: center; text-align: center; border-style: dashed; opacity: 0.88;">
            <div class="combo-item-body">
              <span class="combo-item-role">🍛 จานหลักอิ่มท้อง</span>
              <div class="combo-item-name" style="margin-top: 0.25rem;">⏳ ยังไม่มีเมนูอาหารจานหลักในขณะนี้</div>
              <div class="combo-item-shop" style="margin-bottom: 0;">รออัปเดตเมนูเพิ่มเติมในระบบ</div>
            </div>
          </div>
        `}

        <div class="combo-plus-divider" aria-hidden="true">+</div>

        <!-- Drink / Dessert Slot -->
        ${pickSide ? `
          <div class="combo-item-card">
            <img src="${escapeHtml(pickSide.image)}" alt="${escapeHtml(pickSide.name)}" class="combo-item-thumb" onerror="this.src='https://images.unsplash.com/photo-1558857563-b371033873b8?w=240'">
            <div class="combo-item-body">
              <span class="combo-item-role">🧋 เครื่องดื่ม / ของหวาน</span>
              <div class="combo-item-name">${escapeHtml(pickSide.name)}</div>
              <div class="combo-item-shop">🏪 ${escapeHtml(pickSide.shopName)} · 📍 ${escapeHtml(pickSide.location)}</div>
              <div class="combo-item-footer">
                <span class="combo-item-price">💵 ${pickSide.price} บาท</span>
                ${pickSide.restaurantId ? `<button type="button" class="btn btn-outline btn-sm" style="padding: 0.2rem 0.6rem; font-size: 0.75rem;" onclick="openRestaurantDetail('${pickSide.restaurantId}')">ดูร้านนี้</button>` : ''}
              </div>
            </div>
          </div>
        ` : `
          <div class="combo-item-card" style="justify-content: center; text-align: center; border-style: dashed; opacity: 0.88;">
            <div class="combo-item-body">
              <span class="combo-item-role">🧋 เครื่องดื่ม / ของหวาน</span>
              <div class="combo-item-name" style="margin-top: 0.25rem;">⏳ ยังไม่มีเมนูน้ำ/ของหวานในขณะนี้</div>
              <div class="combo-item-shop" style="margin-bottom: 0;">รออัปเดตเมนูเพิ่มเติมในระบบ</div>
            </div>
          </div>
        `}
      </div>

      <div class="combo-summary-bar">
        <div style="flex: 1; min-width: 220px;">
          <div style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.2rem;">
            🧾 ราคาเมนูที่มีในระบบตอนนี้: <strong style="color: var(--primary); font-size: 1.2rem;">${total} บาท</strong> (เหลือเงินทอน ${change} บาท)
          </div>
          <div style="font-size: 0.82rem; color: var(--text-muted);">
            * อีกหมวดหมู่ยังไม่มีเมนูในขณะนี้ รออัปเดตเมนูเพิ่มเติมครับ
          </div>
        </div>
        <button type="button" class="btn btn-outline btn-sm" onclick="generateBudgetCombo(false)">
          🔄 สุ่มใหม่อีกครั้ง
        </button>
      </div>
    `;
    return;
  }

  // Case 4: Menus exist in DB, but none fit within the entered budget
  resultEl.innerHTML = `
    <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); background: var(--bg-surface-alt); border-radius: var(--radius-lg); border: 1.5px dashed var(--border-color);">
      <div style="font-size: 1.8rem; margin-bottom: 0.35rem;">💡</div>
      <div style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem;">
        ยังไม่มีเมนูที่อยู่ในงบ ${budget} บาทในขณะนี้ รอเพิ่มเติม
      </div>
      <div style="font-size: 0.85rem;">
        ลองปรับเพิ่มงบประมาณ หรือเปลี่ยนตัวกรองช่วงราคา/พิกัดดูนะครับ
      </div>
    </div>
  `;
}

// ============================================================================
// 11. Daily Check-In & Profile Frames Engine (ระบบเช็กอินรายวันสะสมฉายาและกรอบ)
// ============================================================================

function formatYmdFromDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getTodayDateString() {
  return formatYmdFromDate(new Date());
}

const THAI_SHORT_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const THAI_WEEKDAYS_SUN_START = [
  { dow: 0, shortName: 'อา.', fullName: 'วันอาทิตย์' },
  { dow: 1, shortName: 'จ.', fullName: 'วันจันทร์' },
  { dow: 2, shortName: 'อ.', fullName: 'วันอังคาร' },
  { dow: 3, shortName: 'พ.', fullName: 'วันพุธ' },
  { dow: 4, shortName: 'พฤ.', fullName: 'วันพฤหัสบดี' },
  { dow: 5, shortName: 'ศ.', fullName: 'วันศุกร์' },
  { dow: 6, shortName: 'ส.', fullName: 'วันเสาร์' }
];

function formatThaiShortDate(d) {
  return `${d.getDate()} ${THAI_SHORT_MONTHS[d.getMonth()]}`;
}

/**
 * คำนวณรอบสัปดาห์เช็กอิน (วันอาทิตย์ – วันเสาร์)
 * รีเซ็ตตารางอัตโนมัติทุกคืนวันเสาร์เวลา 00:00 น. (เที่ยงคืนขึ้นวันอาทิตย์ = เริ่มสัปดาห์ใหม่ทันที)
 */
function getCurrentCheckInWeekInfo(refDate = new Date()) {
  const today = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  const todayDow = today.getDay(); // 0 = อาทิตย์ ... 6 = เสาร์
  const sundayDate = new Date(today);
  sundayDate.setDate(today.getDate() - todayDow);
  const saturdayDate = new Date(sundayDate);
  saturdayDate.setDate(sundayDate.getDate() + 6);

  const days = THAI_WEEKDAYS_SUN_START.map((w, idx) => {
    const dayDate = new Date(sundayDate);
    dayDate.setDate(sundayDate.getDate() + idx);
    return {
      ...w,
      dayNum: idx + 1,
      dateStr: formatYmdFromDate(dayDate),
      shortDate: formatThaiShortDate(dayDate)
    };
  });

  return {
    weekKey: formatYmdFromDate(sundayDate),
    sundayDate,
    saturdayDate,
    todayStr: formatYmdFromDate(today),
    todayDow,
    rangeLabel: `อา. ${formatThaiShortDate(sundayDate)} – ส. ${formatThaiShortDate(saturdayDate)}`,
    days
  };
}

function getCurrentWeekCheckedDates(user, weekInfo = getCurrentCheckInWeekInfo()) {
  if (!user) return [];
  const validSet = new Set(weekInfo.days.map(d => d.dateStr));
  const collected = new Set();

  if (Array.isArray(user.weeklyCheckInDates)) {
    user.weeklyCheckInDates.forEach(ds => {
      if (validSet.has(ds)) collected.add(ds);
    });
  }
  if (user.lastCheckInDate && validSet.has(user.lastCheckInDate)) {
    collected.add(user.lastCheckInDate);
  }
  if (AppState.checkedInTodayDate && validSet.has(AppState.checkedInTodayDate)) {
    collected.add(AppState.checkedInTodayDate);
  }
  return Array.from(collected).sort();
}

let midnightCheckInTimerId = null;
function scheduleMidnightCheckInRefresh() {
  if (midnightCheckInTimerId) clearTimeout(midnightCheckInTimerId);
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  const msUntilMidnight = Math.max(1000, nextMidnight.getTime() - now.getTime());
  midnightCheckInTimerId = setTimeout(() => {
    AppState.checkedInTodayDate = null;
    if (typeof renderDailyCheckIn === 'function') renderDailyCheckIn();
    scheduleMidnightCheckInRefresh();
  }, msUntilMidnight);
}

function calcDateDiffDays(fromYmd, toYmd) {
  if (!fromYmd || !toYmd) return null;
  const p1 = String(fromYmd).split('-').map(Number);
  const p2 = String(toYmd).split('-').map(Number);
  if (p1.length !== 3 || p2.length !== 3) return null;
  const utc1 = Date.UTC(p1[0], p1[1] - 1, p1[2]);
  const utc2 = Date.UTC(p2[0], p2[1] - 1, p2[2]);
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

function hasUserCheckedInToday(user) {
  if (!user) return false;
  const todayStr = getTodayDateString();
  const weekDates = Array.isArray(user.weeklyCheckInDates) ? user.weeklyCheckInDates : [];
  return user.lastCheckInDate === todayStr || AppState.checkedInTodayDate === todayStr || weekDates.includes(todayStr);
}

function renderDailyCheckIn() {
  const container = document.getElementById('checkinContainer');
  if (!container) return;

  const user = getCurrentUser();
  const weekInfo = getCurrentCheckInWeekInfo();
  const checkedDatesThisWeek = getCurrentWeekCheckedDates(user, weekInfo);
  const checkedSet = new Set(checkedDatesThisWeek);
  const checkedInToday = user ? hasUserCheckedInToday(user) : false;
  const currentStreak = user ? (user.checkInStreak || 0) : 0;
  const isAdminUser = user && user.role === 'admin';

  // Milestone reward progression follows the continuous cumulative flame streak (never reset on Saturday midnight)
  const targetStreak = checkedInToday ? Math.max(1, currentStreak) : (currentStreak + 1);
  const rewardWeekNum = Math.max(1, Math.floor((targetStreak - 1) / 7) + 1);
  const weekRewardIndex = Math.min(rewardWeekNum - 1, WEEKLY_REWARDS_CALENDAR.length - 1);
  const currentWeekReward = WEEKLY_REWARDS_CALENDAR[weekRewardIndex];
  const nextMilestoneDay = rewardWeekNum * 7;
  const daysRemainingForReward = Math.max(0, nextMilestoneDay - currentStreak);

  // Generate 7-day Sun–Sat cards (resets every Saturday at 00:00 midnight -> Sunday starts fresh week)
  const icons = ["☀️", "🌱", "🥢", "🍱", "🍜", "🍛", currentWeekReward.frameIcon];
  const daysHtml = weekInfo.days.map((dayObj, idx) => {
    const isCompleted = checkedSet.has(dayObj.dateStr);
    const isToday = dayObj.dateStr === weekInfo.todayStr;
    const isPastMissed = !isCompleted && dayObj.dateStr < weekInfo.todayStr;
    const isSaturday = dayObj.dow === 6;

    if (isSaturday) {
      return `
        <div class="checkin-day-card ${isCompleted ? 'completed' : ''} ${isToday && !isCompleted ? 'active-today' : ''} ${isPastMissed ? 'past-missed' : ''}" style="border-color: ${isCompleted ? '#10b981' : currentWeekReward.color};">
          <div class="checkin-day-number">${dayObj.fullName} (${dayObj.shortDate})</div>
          <div class="checkin-day-icon">${isCompleted ? '✅' : icons[idx]}</div>
          <div class="checkin-day-reward" style="color: ${isCompleted ? '#10b981' : currentWeekReward.color}; font-size: 0.78rem; font-weight: 800;">
            ${isCompleted ? 'เช็กอินแล้ว 🔥' : (isToday ? 'วันนี้ (วันสุดท้ายของสัปดาห์)' : 'สิ้นสัปดาห์ · รีเซ็ต 00:00 น.')}
          </div>
          <div class="checkin-day-bonus">🎁 รางวัลครบ ${nextMilestoneDay} วัน: ${currentWeekReward.frameName}</div>
        </div>
      `;
    }

    return `
      <div class="checkin-day-card ${isCompleted ? 'completed' : ''} ${isToday && !isCompleted ? 'active-today' : ''} ${isPastMissed ? 'past-missed' : ''}">
        <div class="checkin-day-number">${dayObj.fullName} (${dayObj.shortDate})</div>
        <div class="checkin-day-icon">${isCompleted ? '✅' : (isPastMissed ? '⏳' : icons[idx])}</div>
        <div class="checkin-day-reward">${isCompleted ? 'เช็กอินแล้ว 🔥' : (isToday ? 'กดเช็กอินวันนี้ 🔥' : (isPastMissed ? 'ผ่านไปแล้ว' : 'รอเช็กอิน 🔥'))}</div>
        <div class="checkin-day-bonus">${dayObj.dow === 0 ? 'เริ่มสัปดาห์ใหม่' : `วันที่ ${dayObj.dayNum}/7 ของสัปดาห์นี้`}</div>
      </div>
    `;
  }).join('');

  const isCalendarTab = currentCheckinSubTab !== 'closet';

  container.innerHTML = `
    <div class="checkin-header">
      <div>
        <h3 style="font-size: 1.35rem; margin-bottom: 0.25rem;">🗓️ ตารางล็อกอินสะสมรายวัน</h3>
        <p style="font-size: 0.875rem; color: var(--text-muted);">
          ${user ? `ผู้ใช้งาน: <strong>${user.name}</strong> ${isAdminUser ? '<span style="color: #eab308; font-weight: 800;">(👑 ผู้ดูแลระบบ - เข้าถึงของรางวัลทั้งหมดได้ทันที)</span>' : ''} | สัปดาห์นี้ (${weekInfo.rangeLabel}): <strong>${checkedDatesThisWeek.length}/7 วัน</strong> | ไฟสะสมต่อเนื่อง: <strong>🔥 ${currentStreak} วัน</strong>` : 'กรุณาเข้าสู่ระบบเพื่อเริ่มล็อกอินสะสมสตรีคและรับของรางวัล'}
        </p>
        <div class="checkin-reset-note">
          🔄 รีเซ็ตตารางสัปดาห์ใหม่ทุกคืนวันเสาร์ 00:00 น. (เริ่มวันอาทิตย์) • 🔥 ไฟสะสมต่อเนื่องไม่ถูกรีเซ็ต
        </div>
      </div>
      <div>
        <div class="checkin-streak-badge">
          🔥 ไฟสะสมต่อเนื่อง: ${currentStreak} วัน
        </div>
      </div>
    </div>

    <!-- Inner Sub-Tab Switcher (Calendar vs Frames Closet) -->
    <div class="checkin-subtab-bar">
      <button type="button" class="tab-btn ${isCalendarTab ? 'active' : ''}" onclick="switchCheckinSubTab('calendar')">
        📅 ตารางสัปดาห์นี้ (${weekInfo.rangeLabel})
      </button>
      <button type="button" class="tab-btn ${!isCalendarTab ? 'active' : ''}" onclick="switchCheckinSubTab('closet')">
        🖼️ ตู้เสื้อผ้ากรอบรูปโปรไฟล์ (${PROFILE_FRAMES.length} แบบ)
      </button>
    </div>

    <!-- SUB-TAB 1: Current Week Sun-Sat Grid -->
    <div class="checkin-subpane" style="display: ${isCalendarTab ? 'block' : 'none'};">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
        <div style="font-weight: 800; font-size: 1.02rem;">
          📅 รอบสัปดาห์นี้: <span style="color: var(--primary);">${weekInfo.rangeLabel}</span> (เช็กอินแล้ว ${checkedDatesThisWeek.length}/7 วัน)
        </div>
        <div style="font-size: 0.825rem; color: var(--text-muted);">
          เป้าหมายรางวัลถัดไป (ครบ ${nextMilestoneDay} วัน${daysRemainingForReward > 0 ? ` · อีก ${daysRemainingForReward} วัน` : ' · ครบแล้ว!'}): <strong style="color: ${currentWeekReward.color};">${currentWeekReward.frameName}</strong> + ฉายา <strong>"${currentWeekReward.title}"</strong>
        </div>
      </div>

      <div class="checkin-days-grid">
        ${daysHtml}
      </div>

      <div style="text-align: center; margin-top: 1.25rem; display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap;">
        <button type="button" class="btn ${checkedInToday ? 'btn-outline' : 'btn-primary'} btn-lg" 
                onclick="handleDailyCheckIn()" ${checkedInToday ? 'disabled' : ''}>
          ${checkedInToday 
            ? `✅ วันนี้คุณจุดไฟสตรีคแล้ว 🔥 ${currentStreak} วัน (กลับมาเช็กอินใหม่พรุ่งนี้นะครับ!)` 
            : `🎁 กดเช็กอินวันนี้ (${THAI_WEEKDAYS_SUN_START[weekInfo.todayDow].fullName}) — ต่อไฟสู่ 🔥 ${currentStreak + 1} วัน`}
        </button>
        <button type="button" class="btn btn-outline btn-lg" onclick="switchCheckinSubTab('closet')">
          🖼️ เปิดตู้เสื้อผ้าเลือกกรอบรูป (${PROFILE_FRAMES.length} แบบ)
        </button>
      </div>
    </div>

    <!-- SUB-TAB 2: Profile Frames Closet Showcase -->
    <div class="frames-closet-container" style="display: ${!isCalendarTab ? 'block' : 'none'}; border-top: none; padding-top: 0; margin-top: 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <h4 style="font-size: 1.15rem;">🖼️ ตู้เสื้อผ้ากรอบรูปโปรไฟล์และฉายา (Profile Frames & Titles)</h4>
          <p style="font-size: 0.85rem; color: var(--text-muted);">สมาชิกใหม่มีกรอบต้นอ่อนและเหมียวชานมไข่มุกให้ใช้ทันที และปลดล็อกกรอบพรีเมียมเพิ่มได้จากการเช็กอินและเขียนรีวิว ${isAdminUser ? '<strong style="color: #eab308;">(👑 คุณเป็นแอดมิน: สามารถสวมใส่ได้ทุกกรอบทันที)</strong>' : ''}</p>
        </div>
        <button type="button" class="btn btn-sm btn-outline" onclick="openProfileModal()">
          👤 ไปที่โปรไฟล์เพื่อเลือกฉายา
        </button>
      </div>

      <div class="frames-closet-grid">
        ${PROFILE_FRAMES.map(f => {
          const isUnlocked = isUserFrameUnlocked(user, f.id);
          const isEquipped = user && (user.equippedFrame || "frame-none") === f.id;
          return `
            <div class="frame-closet-card ${isEquipped ? 'equipped' : ''}">
              <div style="margin: 0.35rem 0 0.45rem 0;">
                ${renderFramedAvatar(user?.avatar, f.id, 66, '', f.name)}
              </div>
              <div style="font-weight: 700; font-size: 0.92rem;">${f.icon || '🖼️'} ${f.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.4;">${f.desc}</div>
              <div style="margin-top: 0.35rem;">
                ${isEquipped 
                  ? '<span style="font-size: 0.75rem; color: #10b981; font-weight: 700;">✅ กำลังสวมใส่</span>' 
                  : (isUnlocked 
                      ? `<button type="button" class="btn btn-sm btn-outline" onclick="equipProfileFrame('${f.id}')">สวมใส่กรอบนี้ ${isAdminUser ? '👑' : ''}</button>`
                      : `<span style="font-size: 0.75rem; color: var(--text-muted);">🔒 ${f.unlockDesc || 'ยังไม่ปลดล็อก'}</span>`
                    )}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function isUserFrameUnlocked(user, frameId) {
  if (!user) return frameId === 'frame-none' || frameId === 'frame-boba-cat';
  if (user.role === 'admin') return true;
  if (frameId === 'frame-none' || frameId === 'frame-boba-cat') return true;
  const streak = Number(user.checkInStreak || user.streak || 0);
  if (frameId === 'frame-strawberry-cake' && streak >= 3) return true;
  if (frameId === 'frame-shiba-chef' && streak >= 5) return true;
  return Array.isArray(user.unlockedFrames) && user.unlockedFrames.includes(frameId);
}

async function handleDailyCheckIn() {
  if (!requireAuth("เช็กอินรายวัน")) return;
  if (!window.FirestoreService?.isConfigured()) {
    showToast('⚠️ กรุณาเชื่อมต่อ firebaseConfig ใน js/firebase-config.js ก่อนเช็กอิน', 'warning');
    return;
  }

  const user = getCurrentUser();
  if (!user) return;
  const uid = user.uid || user.id;
  const weekInfo = getCurrentCheckInWeekInfo();
  const todayStr = weekInfo.todayStr;

  if (hasUserCheckedInToday(user)) {
    showToast("วันนี้คุณได้ทำการล็อกอิน/เช็กอินประจำวันเรียบร้อยแล้ว! กลับมาใหม่ในวันพรุ่งนี้นะครับ 🎉", "info");
    return;
  }

  try {
    const alreadyInCloud = await window.FirestoreService.hasCheckedInToday(uid, todayStr);
    if (alreadyInCloud) {
      const updatedWeekDates = Array.from(new Set([...getCurrentWeekCheckedDates(user, weekInfo), todayStr])).sort();
      user.lastCheckInDate = todayStr;
      user.weeklyCheckInWeekKey = weekInfo.weekKey;
      user.weeklyCheckInDates = updatedWeekDates;
      AppState.checkedInTodayDate = todayStr;
      renderDailyCheckIn();
  scheduleMidnightCheckInRefresh();
      showToast("วันนี้คุณได้เช็กอินลง Cloud Firestore เรียบร้อยแล้ว 🎉", "info");
      return;
    }

    // เก็บเลขไฟสะสมต่อเนื่องไปเรื่อย ๆ ไม่รีเซ็ตเมื่อขึ้นสัปดาห์ใหม่คืนวันเสาร์ 00:00 น.
    const diffDays = calcDateDiffDays(user.lastCheckInDate, todayStr);
    const currentCount = Number(user.checkInStreak ?? user.streak ?? 0);
    const newStreak = diffDays === 0 ? Math.max(1, currentCount) : (currentCount + 1);
    const updatedWeekDates = Array.from(new Set([...getCurrentWeekCheckedDates(user, weekInfo), todayStr])).sort();

    const unlockedFrames = Array.from(new Set([...(user.unlockedFrames || ["frame-none"]), "frame-none", "frame-boba-cat"]));
    if (newStreak >= 3 && !unlockedFrames.includes("frame-strawberry-cake")) {
      unlockedFrames.push("frame-strawberry-cake");
    }
    if (newStreak >= 5 && !unlockedFrames.includes("frame-shiba-chef")) {
      unlockedFrames.push("frame-shiba-chef");
    }
    const unlockedTitles = [...(user.unlockedTitles || ["นักชิมมือใหม่"])];
    const badges = [...(user.badges || ["newbie"])];
    let equippedFrame = user.equippedFrame || "frame-none";
    let customTitle = user.customTitle || "นักชิมมือใหม่";

    const currentWeek = Math.floor((newStreak - 1) / 7) + 1;
    let rewardMsg = "";

    if (newStreak % 7 === 0) {
      const weekNum = Math.floor(newStreak / 7);
      const rewardIndex = Math.min(weekNum - 1, WEEKLY_REWARDS_CALENDAR.length - 1);
      const calendarReward = WEEKLY_REWARDS_CALENDAR[rewardIndex];

      if (calendarReward) {
        if (!unlockedFrames.includes(calendarReward.frameId)) {
          unlockedFrames.push(calendarReward.frameId);
        }
        equippedFrame = calendarReward.frameId;
        customTitle = calendarReward.title;
        if (!unlockedTitles.includes(calendarReward.title)) {
          unlockedTitles.push(calendarReward.title);
        }
        rewardMsg = ` 👑 ยินดีด้วยอย่างยิ่ง! ไฟสะสมต่อเนื่องครบ ${newStreak} วัน ได้รับรางวัลใหญ่ [${calendarReward.frameName}] และฉายาสุดเท่ [${calendarReward.title}]!`;
      }
    } else {
      rewardMsg = ` สัปดาห์นี้เช็กอินแล้ว ${updatedWeekDates.length}/7 วัน · ไฟสะสมต่อเนื่อง ${newStreak} วัน!`;
    }

    // Check streak badges
    BADGES_LIST.forEach(b => {
      if (!badges.includes(b.id) && b.reqType === 'streak' && newStreak >= (b.minStreak || 0)) {
        badges.push(b.id);
        showToast(`🏆 ยินดีด้วย! ปลดล็อกบัดจ์ใหม่: "${b.name}" ${b.icon}`, 'success');
      }
    });

    const userUpdatePayload = {
      lastCheckInDate: todayStr,
      weeklyCheckInWeekKey: weekInfo.weekKey,
      weeklyCheckInDates: updatedWeekDates,
      streak: newStreak,
      checkInStreak: newStreak,
      unlockedFrames,
      equippedFrame,
      customTitle,
      unlockedTitles,
      badges
    };

    await window.FirestoreService.recordDailyCheckin({
      uid,
      dateStr: todayStr,
      checkinPayload: {
        uid,
        date: todayStr,
        weekKey: weekInfo.weekKey,
        dayOfWeek: weekInfo.todayDow,
        streakCount: newStreak,
        weekNum: currentWeek
      },
      userUpdatePayload
    });

    Object.assign(user, userUpdatePayload);
    AppState.checkedInTodayDate = todayStr;
    setCurrentUser(user);

    SoundFX.playWin();
    showToast(`🎉 เช็กอินสะสมสตรีคสำเร็จ! 🔥 เลขไฟสะสม: ${newStreak} วัน${rewardMsg}`, 'success');
    renderBadgesShowcase();
  } catch (err) {
    console.error('Check-in error:', err);
    showToast('บันทึกการเช็กอินลง Firestore ไม่สำเร็จ: ' + (err?.message || ''), 'error');
  }
}

async function equipProfileFrame(frameId) {
  if (!requireAuth("สวมใส่กรอบโปรไฟล์")) return;

  const user = getCurrentUser();
  if (!user) return;
  const uid = user.uid || user.id;
  const isAdminUser = user.role === 'admin';

  if (!isUserFrameUnlocked(user, frameId)) {
    showToast("กรอบนี้ยังไม่ได้ปลดล็อก กรุณาเช็กอินสะสมหรือเขียนรีวิวเพื่อปลดล็อกก่อน", "error");
    return;
  }

  const nextFrames = Array.from(new Set([...(user.unlockedFrames || ["frame-none"]), "frame-none", "frame-boba-cat", frameId]));

  try {
    if (window.AuthService?.isConfigured()) {
      await window.AuthService.updateOwnProfile(uid, {
        equippedFrame: frameId,
        unlockedFrames: nextFrames
      });
    }
    user.equippedFrame = frameId;
    user.unlockedFrames = nextFrames;
    setCurrentUser(user);

    SoundFX.playMatch();
    showToast(isAdminUser ? "👑 สวมใส่กรอบรูปโปรไฟล์สำเร็จด้วยสิทธิ์ผู้ดูแลระบบ (Admin)!" : "เปลี่ยนกรอบรูปโปรไฟล์เรียบร้อยแล้ว!", "success");

    const profileModal = document.getElementById('profileModal');
    if (profileModal && profileModal.classList.contains('active')) {
      openProfileModal();
    }
  } catch (err) {
    console.error('Equip frame error:', err);
    showToast('เปลี่ยนกรอบรูปโปรไฟล์ไม่สำเร็จ', 'error');
  }
}

// ============================================================================
// 12. News & Campus Promotions Section
// ============================================================================

function renderNewsGrid() {
  const grid = document.getElementById('newsGrid');
  if (!grid) return;

  const newsList = AppState.news;

  if (window.FirestoreService?.isConfigured() && !AppState.newsLoaded && newsList.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-muted); border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-surface);">
        🔄 กำลังโหลดข่าวสารจาก Cloud Firestore...
      </div>
    `;
    return;
  }

  if (!newsList || newsList.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: 2.5rem 1.5rem; text-align: center; color: var(--text-muted); border: 1px dashed var(--border-color); border-radius: var(--radius-lg); background: var(--bg-surface);">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📢</div>
        <div style="font-weight: 700; font-size: 1.1rem; color: var(--text-main); margin-bottom: 0.35rem;">ยังไม่มีข่าวสารหรือโปรโมชั่นในขณะนี้</div>
        <div style="font-size: 0.9rem;">รอติดตามโปรโมชั่นและข่าวประกาศอร่อยๆ จากชมรมและโรงอาหาร SPU เร็วๆ นี้</div>
        ${isAdmin() ? `
          <button type="button" class="btn btn-primary btn-sm" style="margin-top: 1rem;" onclick="openAddNewsModal()">
            ➕ เพิ่มข่าวสารแรก
          </button>
        ` : ''}
      </div>
    `;
    return;
  }

  grid.innerHTML = newsList.map(item => `
    <div class="news-card">
      <img src="${item.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500'}" alt="${item.title}" class="news-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500'">
      <div class="news-body">
        <span class="news-tag">${item.tag}</span>
        <h3 class="news-title">${item.title}</h3>
        <p class="news-desc">${item.content}</p>
        <div class="news-date">📅 ${formatFirebaseDate(item.createdAt, item.date)}</div>
      </div>
    </div>
  `).join('');
}

let newsFormUploadedImage = '';

function updateNewsImagePreview(src) {
  const previewContainer = document.getElementById('newsImagePreviewContainer');
  const previewImg = document.getElementById('newsImagePreviewImg');
  if (!previewContainer || !previewImg) return;
  if (src) {
    previewImg.src = src;
    previewContainer.style.display = 'block';
  } else {
    previewImg.src = '';
    previewContainer.style.display = 'none';
  }
}

async function handleNewsImageFileUpload(event) {
  const file = event.target?.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น (PNG, JPG, WebP, GIF)', 'error');
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    showToast('ไฟล์รูปภาพมีขนาดใหญ่เกินไป (กรุณาเลือกรูปไม่เกิน 8MB)', 'error');
    return;
  }
  try {
    const compressedDataUrl = await compressImageFile(file, 900, 650, 0.80);
    if (compressedDataUrl) {
      newsFormUploadedImage = compressedDataUrl;
      const urlInput = document.getElementById('newsImage');
      if (urlInput) urlInput.value = '';
      updateNewsImagePreview(compressedDataUrl);
      showToast('แนบรูปภาพข่าวจากเครื่องเรียบร้อยแล้ว 📷', 'success');
    }
  } catch (err) {
    console.error('Compress news image error:', err);
    showToast('ไม่สามารถอ่านไฟล์รูปภาพได้', 'error');
  } finally {
    if (event.target) event.target.value = '';
  }
}

function handleNewsImageUrlInput(val) {
  const trimmed = (val || '').trim();
  if (trimmed) {
    newsFormUploadedImage = '';
    updateNewsImagePreview(trimmed);
  } else if (!newsFormUploadedImage) {
    updateNewsImagePreview('');
  }
}

function clearNewsFormImage() {
  newsFormUploadedImage = '';
  const fileInput = document.getElementById('newsImageFileInput');
  if (fileInput) fileInput.value = '';
  const urlInput = document.getElementById('newsImage');
  if (urlInput) urlInput.value = '';
  updateNewsImagePreview('');
}

function openAddNewsModal() {
  if (!isAdmin()) {
    showToast('ฟีเจอร์นี้สงวนไว้สำหรับผู้ดูแลระบบ (Admin) เท่านั้น', 'error');
    openAdminAccessModal();
    return;
  }
  const title = document.getElementById('newsTitle');
  const tag = document.getElementById('newsTag');
  const content = document.getElementById('newsContent');
  if (title) title.value = '';
  if (tag) tag.value = '';
  if (content) content.value = '';
  clearNewsFormImage();
  openModal('newsFormModal');
}

async function handleNewsSubmit(event) {
  event.preventDefault();
  if (!isAdmin()) return;

  const title = (document.getElementById('newsTitle')?.value || '').trim() || 'ข่าวประชาสัมพันธ์ SPU';
  const tag = (document.getElementById('newsTag')?.value || '').trim() || 'ข่าวสาร';
  const content = (document.getElementById('newsContent')?.value || '').trim() || '';
  const urlImage = (document.getElementById('newsImage')?.value || '').trim();
  const image = newsFormUploadedImage || urlImage;
  const nowStr = new Date().toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });

  const newNewsItem = {
    title,
    tag,
    content,
    image: image || '',
    date: nowStr,
    active: true
  };

  try {
    if (window.FirestoreService?.isConfigured()) {
      await window.FirestoreService.addNews(newNewsItem);
    } else {
      AppState.news.unshift({ id: 'news_' + Date.now(), ...newNewsItem });
      renderNewsGrid();
      renderAdminNews();
    }
    event.target?.reset?.();
    clearNewsFormImage();
    closeModal('newsFormModal');
    showToast('เผยแพร่ข่าวสารเรียบร้อยแล้ว!', 'success');
  } catch (err) {
    console.error('Add news error:', err);
    showToast('เผยแพร่ข่าวสารไม่สำเร็จ: ' + (err?.message || ''), 'error');
  }
}

// ============================================================================
// 13. User Profile Modal & Avatar Upload
// ============================================================================

function triggerProfilePhotoUpload() {
  const fileInput = document.getElementById('profilePhotoFileInput');
  if (fileInput) fileInput.click();
}

async function handleProfilePhotoUpload(event) {
  const file = event.target?.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast("กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)", "error");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showToast("ไฟล์รูปภาพมีขนาดใหญ่เกินไป (กรุณาเลือกรูปขนาดไม่เกิน 5MB)", "error");
    return;
  }

  showToast('กำลังย่อขนาดและบันทึกรูปโปรไฟล์...', 'info');
  try {
    const compressed = await compressImageFile(file, 300, 300, 0.75);
    if (compressed) {
      await saveUserProfileAvatar(compressed);
    }
  } catch (err) {
    console.error('Avatar upload error:', err);
    showToast('อัปโหลดรูปโปรไฟล์ไม่สำเร็จ', 'error');
  } finally {
    event.target.value = '';
  }
}

function promptProfilePhotoUrl() {
  const currentUser = getCurrentUser();
  const url = prompt("กรุณาระบุลิงก์รูปภาพโปรไฟล์ของคุณ (Image URL):", currentUser?.avatar || "");
  if (url && url.trim()) {
    saveUserProfileAvatar(url.trim());
  }
}

async function saveUserProfileAvatar(imageUrl) {
  const user = getCurrentUser();
  if (!user) return;
  const uid = user.uid || user.id;

  try {
    if (window.AuthService?.isConfigured()) {
      await window.AuthService.updateOwnProfile(uid, { avatar: imageUrl });
    }
    user.avatar = imageUrl;
    setCurrentUser(user);

    SoundFX.playMatch();
    showToast("อัปเดตรูปโปรไฟล์ของคุณเรียบร้อยแล้ว! 📸", "success");
    openProfileModal();
  } catch (err) {
    console.error('Save avatar error:', err);
    showToast('อัปเดตรูปโปรไฟล์ไม่สำเร็จ: ' + (err?.message || ''), 'error');
  }
}

function openProfileModal() {
  const user = getCurrentUser();
  if (!user) {
    openAuthModal();
    return;
  }

  const body = document.getElementById('profileModalBody');
  if (!body) return;

  const uid = user.uid || user.id;
  const restaurants = AppState.restaurants;
  const userFavs = restaurants.filter(r => (user.favorites || []).includes(r.id));
  const reviews = AppState.reviews.filter(r => r.userId === uid);
  const isAdminUser = user.role === 'admin';
  const userUnlockedFrames = isAdminUser ? PROFILE_FRAMES.map(f => f.id) : (user.unlockedFrames || ["frame-none"]);
  const allAvailableTitles = isAdminUser
    ? Array.from(new Set([
        ...(user.unlockedTitles || []),
        "นักชิมมือใหม่",
        "SPU Food Master",
        ...WEEKLY_REWARDS_CALENDAR.map(w => w.title),
        "เซียนรีวิวอาหาร",
        "ฮีโร่โรงอาหาร"
      ]))
    : (user.unlockedTitles || ["นักชิมมือใหม่"]);

  body.innerHTML = `
    <div style="display: flex; align-items: center; gap: 1.5rem; padding-bottom: 1.5rem; border-bottom: 2px solid var(--border-color); margin-bottom: 1.5rem; flex-wrap: wrap;">
      <div style="position: relative; display: inline-block; margin: 0.4rem;">
        ${renderFramedAvatar(user.avatar, user.equippedFrame || 'frame-none', 86, '', user.name)}
      </div>
      <div style="flex-grow: 1;">
        <h3 style="font-size: 1.4rem; margin-bottom: 0.25rem;">${user.name}</h3>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.35rem;">
          📧 ${user.email} | สถานะ: <span style="color: var(--primary); font-weight: 700;">${user.userType || 'นักศึกษา'}</span> (${user.role === 'admin' ? '👑 ผู้ดูแลระบบ (Admin)' : '🎓 สมาชิกจานเด็ด SPU'})
        </div>
        <div style="font-size: 0.85rem; color: var(--primary); font-weight: 700; margin-bottom: 0.5rem;">
          🎖️ ฉายาปัจจุบัน: ${user.customTitle || 'นักชิมมือใหม่'} | 🔥 สตรีคเช็กอิน: ${user.checkInStreak || 0} วัน
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
          <span style="background: var(--primary-light); color: var(--primary); font-weight: 700; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-size: 0.85rem;">
            🔥 สตรีค: ${user.checkInStreak || 0} วัน
          </span>
          <span style="background: var(--bg-surface-alt); border: 1.5px solid var(--border-color); color: var(--text-main); font-weight: 700; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-size: 0.85rem;">
            💬 รีวิวแล้ว: ${reviews.length} ร้าน
          </span>
          <span style="background: var(--bg-surface-alt); border: 1.5px solid var(--border-color); color: var(--text-main); font-weight: 700; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-size: 0.85rem;">
            🎖️ ปลดล็อกแล้ว ${(user.badges || []).length} บัดจ์
          </span>
        </div>

        <!-- Custom Title Selector -->
        <div style="margin-bottom: 0.65rem; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">เลือกสวมใส่ฉายา:</span>
          <select class="form-control" style="width: auto; padding: 0.25rem 0.65rem; font-size: 0.85rem;" onchange="setUserActiveTitle(this.value)">
            ${allAvailableTitles.map(t => `
              <option value="${t}" ${user.customTitle === t ? 'selected' : ''}>🎖️ ${t} ${isAdminUser ? '👑' : ''}</option>
            `).join('')}
          </select>
        </div>

        <!-- Inline Faculty Text Input -->
        <div style="margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap;">
          <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">🏛️ คณะ / สำนักวิชา:</span>
          <input type="text" id="profileEditFacultyInput" class="form-control" value="${(user.faculty || '').replace(/"/g, '&quot;')}" placeholder="พิมพ์ชื่อคณะหรือสำนักวิชา..." style="width: 220px; padding: 0.25rem 0.65rem; font-size: 0.85rem;">
          <button type="button" class="btn btn-sm btn-outline" onclick="saveUserOwnFaculty()">💾 บันทึกคณะ</button>
        </div>

        <!-- Photo Upload Controls -->
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button type="button" class="btn btn-sm btn-outline" onclick="triggerProfilePhotoUpload()">
            📷 อัปโหลดรูปภาพตัวเอง (จากเครื่อง)
          </button>
          <input type="file" id="profilePhotoFileInput" accept="image/*" style="display: none;" onchange="handleProfilePhotoUpload(event)">
          <button type="button" class="btn btn-sm btn-outline" onclick="promptProfilePhotoUrl()">
            🌐 ใส่ลิงก์รูป (URL)
          </button>
        </div>
      </div>
    </div>

    <!-- Tabs inside Profile -->
    <div class="tab-nav">
      <button type="button" class="tab-btn active" onclick="switchProfileTab('profFavsTab', this)">❤️ ร้านโปรดของฉัน (${userFavs.length})</button>
      <button type="button" class="tab-btn" onclick="switchProfileTab('profReviewsTab', this)">💬 รีวิวของฉัน (${reviews.length})</button>
      <button type="button" class="tab-btn" onclick="switchProfileTab('profFramesTab', this)">🖼️ กรอบรูปโปรไฟล์ (${userUnlockedFrames.length})</button>
    </div>

    <div class="tab-pane active" id="profFavsTab">
      ${userFavs.length === 0 ? '<div style="color: var(--text-muted); padding: 1.5rem; text-align: center;">คุณยังไม่มีร้านโปรด กดไอคอนหัวใจที่หน้าร้านอาหารเพื่อบันทึกร้านโปรดได้เลย</div>' : ''}
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem;">
        ${userFavs.map(rst => `
          <div style="display: flex; gap: 0.75rem; background: var(--bg-surface-alt); padding: 0.75rem; border-radius: var(--radius-md); border: 2px solid var(--border-color); align-items: center;">
            <img src="${rst.image}" style="width: 50px; height: 50px; border-radius: var(--radius-sm); object-fit: cover;">
            <div style="flex-grow: 1;">
              <div style="font-weight: 700; font-size: 0.9rem;">${rst.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${rst.location}</div>
            </div>
            <button type="button" class="btn btn-sm btn-outline" onclick="closeModal('profileModal'); openRestaurantDetail('${rst.id}')">ดู</button>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="tab-pane" id="profReviewsTab">
      ${reviews.length === 0 ? '<div style="color: var(--text-muted); padding: 1.5rem; text-align: center;">คุณยังไม่เคยเขียนรีวิว ร่วมรีวิวร้านโปรดเพื่อช่วยเพื่อนๆ เลือกร้านอร่อยและรับบัดจ์นักรีวิวกันเถอะ!</div>' : ''}
      ${reviews.map(rev => {
        const targetRst = restaurants.find(r => r.id === rev.restaurantId);
        return `
          <div style="padding: 1rem; border-bottom: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
              <strong>${targetRst ? targetRst.name : 'ร้านอาหารใน SPU'}</strong>
              <span style="color: #f59e0b;">${getStarSymbols(rev.rating)}</span>
            </div>
            <div style="font-size: 0.875rem; color: var(--text-main); margin-bottom: 0.5rem;">${rev.comment}</div>
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
              <span>📅 ${rev.date}</span>
              <button type="button" style="color: #ef4444; font-weight: 600;" onclick="deleteMyReview('${rev.id}'); openProfileModal();">🗑️ ลบรีวิวนี้</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- TAB 3: Profile Frames Closet -->
    <div class="tab-pane" id="profFramesTab">
      <div style="margin-bottom: 1rem; font-size: 0.875rem; color: var(--text-muted);">
        เลือกกรอบรูปโปรไฟล์ที่คุณต้องการสวมใส่ กรอบที่สวมใส่จะแสดงบนรูปโปรไฟล์ของคุณทั่วทั้งเว็บไซต์ ${isAdminUser ? '<strong style="color: #eab308;">(👑 ยศแอดมิน: คุณมีสิทธิ์เข้าถึงและสวมใส่ได้ทุกกรอบทันที)</strong>' : ''}
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
        ${PROFILE_FRAMES.map(f => {
          const isUnlocked = isUserFrameUnlocked(user, f.id);
          const isEquipped = (user.equippedFrame || 'frame-none') === f.id;
          return `
            <div style="background: var(--bg-surface-alt); border: 2px solid ${isEquipped ? 'var(--primary)' : 'var(--border-color)'}; padding: 1rem; border-radius: var(--radius-lg); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.45rem;">
              <div style="margin: 0.3rem 0;">
                ${renderFramedAvatar(user.avatar, f.id, 66, '', f.name)}
              </div>
              <div style="font-weight: 700; font-size: 0.875rem;">${f.icon || '🖼️'} ${f.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.4;">${f.desc}</div>
              <div style="margin-top: 0.5rem;">
                ${isEquipped 
                  ? '<span style="font-size: 0.8rem; color: #10b981; font-weight: 800;">✅ กำลังสวมใส่</span>' 
                  : (isUnlocked 
                      ? `<button type="button" class="btn btn-sm btn-primary" onclick="equipProfileFrame('${f.id}')">สวมใส่กรอบนี้ ${isAdminUser ? '👑' : ''}</button>` 
                      : `<span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">🔒 ${f.unlockDesc || 'ยังไม่ปลดล็อก'}</span>`
                    )}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  openModal('profileModal');
}

async function setUserActiveTitle(title) {
  const user = getCurrentUser();
  if (!user) return;
  const uid = user.uid || user.id;

  try {
    if (window.AuthService?.isConfigured()) {
      await window.AuthService.updateOwnProfile(uid, { customTitle: title });
    }
    user.customTitle = title;
    setCurrentUser(user);
    showToast(`เปลี่ยนฉายาเป็น "${title}" เรียบร้อยแล้ว! ✨`, "success");
    openProfileModal();
  } catch (err) {
    console.error('Update title error:', err);
    showToast('เปลี่ยนฉายาไม่สำเร็จ', 'error');
  }
}

async function saveUserOwnFaculty() {
  const user = getCurrentUser();
  if (!user) return;
  const uid = user.uid || user.id;
  const facultyVal = (document.getElementById('profileEditFacultyInput')?.value || '').trim();
  if (!facultyVal) {
    showToast('กรุณาพิมพ์ชื่อคณะหรือสำนักวิชาก่อนบันทึก', 'error');
    return;
  }

  try {
    if (window.AuthService?.isConfigured()) {
      await window.AuthService.updateOwnProfile(uid, { faculty: facultyVal });
    }
    user.faculty = facultyVal;
    setCurrentUser(user);
    showToast(`บันทึกคณะ/สำนักวิชา "${facultyVal}" เรียบร้อยแล้ว! 🏛️`, 'success');
    openProfileModal();
  } catch (err) {
    console.error('Update faculty error:', err);
    showToast('บันทึกคณะไม่สำเร็จ', 'error');
  }
}

function switchProfileTab(tabId, btn) {
  document.querySelectorAll('#profileModalBody .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#profileModalBody .tab-pane').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');
}

// ============================================================================
// 14. Comprehensive Admin Dashboard Engine
// ============================================================================

function renderFirebaseStatusBox() {
  const box = document.getElementById('firebaseStatusBox');
  if (!box) return;

  const isConfigured = window.AuthService?.isConfigured();
  const projectId = window.FIREBASE_CONFIG?.projectId || '-';

  if (isConfigured) {
    box.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <div style="font-weight: 800; color: #047857; font-size: 1rem;">🟢 เชื่อมต่อ Firebase สำเร็จแล้ว!</div>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
            Project ID: <code>${projectId}</code> | Cloud Firestore Real-time Sync Active
          </div>
        </div>
        <span style="background: #d1fae5; color: #065f46; font-size: 0.78rem; font-weight: 700; padding: 0.35rem 0.75rem; border-radius: var(--radius-full);">
          GitHub Pages Ready
        </span>
      </div>
    `;
  } else {
    box.innerHTML = `
      <div style="font-weight: 800; color: #b45309; font-size: 1rem;">⚠️ ยังไม่ได้ตั้งค่า firebaseConfig ในไฟล์ js/firebase-config.js</div>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0.35rem 0 0 0;">
        กรุณานำค่า <code>firebaseConfig</code> จาก Firebase Console มาใส่ใน <code>js/firebase-config.js</code> เพื่อเปิดใช้งานระบบฐานข้อมูลและล็อกอิน
      </p>
    `;
  }
}

function openAdminModal() {
  if (!isAdmin()) {
    openAdminAccessModal();
    return;
  }

  renderAdminStats();
  renderAdminUsers();
  renderAdminRestaurantsTable();
  renderAdminReviews();
  renderAdminNews();
  renderAdminThemePicker();
  populateAdminSiteTexts();
  renderFirebaseStatusBox();
  openModal('adminModal');
}

function switchAdminTab(tabId, btn) {
  document.querySelectorAll('#adminModal .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#adminModal .tab-pane').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');
}

function renderAdminStats() {
  const container = document.getElementById('adminStatsGrid');
  if (!container) return;

  const restaurants = AppState.restaurants;
  const reviews = AppState.reviews;
  const users = AppState.users;
  const analytics = getAnalytics();
  const reportedReviews = reviews.filter(r => r.reported);

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon" style="color: #0284c7; background: #e0f2fe;">👀</div>
      <div>
        <div class="stat-val" style="color: #0369a1;">${Number(analytics.pageViews || 0).toLocaleString()}</div>
        <div class="stat-label">ยอดเข้าชมเว็บทั้งหมด (Page Views)</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="color: #059669; background: #d1fae5;">👥</div>
      <div>
        <div class="stat-val" style="color: #047857;">${Number(analytics.uniqueVisitors || 0).toLocaleString()}</div>
        <div class="stat-label">ผู้เข้าชมไม่ซ้ำ (Unique Visitors)</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">🏬</div>
      <div>
        <div class="stat-val">${restaurants.length}</div>
        <div class="stat-label">ร้านอาหารใน SPU</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">💬</div>
      <div>
        <div class="stat-val">${reviews.length}</div>
        <div class="stat-label">รีวิวทั้งหมด</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="color: #ef4444; background: #fee2e2;">⚠️</div>
      <div>
        <div class="stat-val" style="color: #dc2626;">${reportedReviews.length}</div>
        <div class="stat-label">รีวิวที่ถูกรายงาน</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">🎓</div>
      <div>
        <div class="stat-val">${users.length}</div>
        <div class="stat-label">สมาชิกและผู้สมัคร</div>
      </div>
    </div>
  `;
}

function renderAdminUsers() {
  const tbody = document.getElementById('adminUsersTableBody');
  const statsRow = document.getElementById('adminUserStatsRow');
  if (!tbody) return;

  const users = AppState.users;
  const roleFilter = document.getElementById('adminUserRoleFilter')?.value || 'all';
  const facultyFilter = (document.getElementById('adminUserFacultyFilter')?.value || '').toLowerCase().trim();
  const searchQuery = (document.getElementById('adminUserSearch')?.value || '').toLowerCase().trim();

  // Filter
  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || 
      (roleFilter === 'admin' ? u.role === 'admin' : u.role !== 'admin');
    const matchFaculty = !facultyFilter || facultyFilter === 'all' || (u.faculty && u.faculty.toLowerCase().includes(facultyFilter));
    const matchSearch = !searchQuery || 
      (u.name && u.name.toLowerCase().includes(searchQuery)) ||
      (u.studentId && u.studentId.toLowerCase().includes(searchQuery)) ||
      (u.faculty && u.faculty.toLowerCase().includes(searchQuery)) ||
      (u.email && u.email.toLowerCase().includes(searchQuery)) ||
      (u.userType && u.userType.toLowerCase().includes(searchQuery));
    return matchRole && matchFaculty && matchSearch;
  });

  // Calculate user stats
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const memberCount = users.filter(u => u.role !== 'admin').length;
  const totalStreaks = users.reduce((sum, u) => sum + (Number(u.checkInStreak) || 0), 0);

  if (statsRow) {
    statsRow.innerHTML = `
      <div style="background: var(--bg-surface-alt); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">ผู้สมัครและสมาชิกทั้งหมด</div>
        <div style="font-size: 1.3rem; font-weight: 800; color: var(--text-main);">${totalUsers} คน</div>
      </div>
      <div style="background: var(--bg-surface-alt); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">ผู้ดูแล (Admins)</div>
        <div style="font-size: 1.3rem; font-weight: 800; color: #7c3aed;">${adminCount} คน</div>
      </div>
      <div style="background: var(--bg-surface-alt); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">สมาชิกทั่วไป / นักศึกษา</div>
        <div style="font-size: 1.3rem; font-weight: 800; color: var(--primary);">${memberCount} คน</div>
      </div>
      <div style="background: var(--bg-surface-alt); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">สตรีคล็อกอินสะสมรวม</div>
        <div style="font-size: 1.3rem; font-weight: 800; color: var(--primary);">🔥 ${totalStreaks} วัน</div>
      </div>
    `;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          ไม่พบสมาชิกหรือผู้สมัครที่ตรงกับเงื่อนไขการค้นหา
        </td>
      </tr>
    `;
    return;
  }

  const currentUser = getCurrentUser();
  const currentUid = currentUser ? (currentUser.uid || currentUser.id) : null;

  tbody.innerHTML = filtered.map(u => {
    const uid = u.uid || u.id;
    const isSelf = currentUid && currentUid === uid;
    const isAdminUser = u.role === 'admin';
    const roleBadge = isAdminUser
      ? `<span style="display: inline-flex; align-items: center; gap: 0.28rem; white-space: nowrap; background: #ede9fe; color: #6d28d9; padding: 0.25rem 0.65rem; border-radius: var(--radius-full); font-size: 0.78rem; font-weight: 700;">👑 Admin</span>`
      : `<span style="display: inline-flex; align-items: center; gap: 0.28rem; white-space: nowrap; background: var(--bg-surface-alt); border: 1px solid var(--border-color); color: var(--text-main); padding: 0.25rem 0.65rem; border-radius: var(--radius-full); font-size: 0.78rem; font-weight: 600;">🎓 Member</span>`;

    const registerDate = u.createdAtDisplay || formatFirebaseDate(u.createdAt, '-');
    const studentId = getEffectiveMemberId(u);
    const faculty = u.faculty || 'ม.ศรีปทุม';
    const phone = u.phone || '-';

    return `
      <tr>
        <td style="width: 52px;">
          ${renderFramedAvatar(u.avatar, u.equippedFrame || 'frame-none', 38, '', u.name)}
        </td>
        <td>
          <div style="font-weight: 700; line-height: 1.3;">${u.name} ${isSelf ? '<span style="font-size: 0.72rem; color: var(--primary); font-weight: 700; white-space: nowrap;">(คุณ)</span>' : ''}</div>
          <div style="font-size: 0.75rem; color: var(--primary); font-family: monospace; white-space: nowrap;">🆔 ${studentId}</div>
        </td>
        <td>
          <div style="font-size: 0.84rem; font-weight: 600; line-height: 1.3;">${faculty}</div>
          <div style="font-size: 0.74rem; color: var(--text-muted); white-space: nowrap;">${u.status || 'อนุมัติแล้ว'}</div>
        </td>
        <td>
          <div style="font-family: monospace; font-size: 0.8rem; word-break: break-all;">✉️ ${u.email}</div>
          <div style="font-size: 0.74rem; color: var(--text-muted); white-space: nowrap;">📞 ${phone}</div>
        </td>
        <td style="white-space: nowrap;">
          <span style="display: inline-block; white-space: nowrap; font-size: 0.76rem; background: var(--bg-surface-alt); border: 1px solid var(--border-color); padding: 0.22rem 0.55rem; border-radius: 999px;">${u.userType || 'นักศึกษา'}</span>
        </td>
        <td style="white-space: nowrap;">${roleBadge}</td>
        <td style="white-space: nowrap;">
          <div style="font-weight: 700; color: var(--primary); white-space: nowrap;">🔥 ${u.checkInStreak || 0} วัน</div>
          <div style="font-size: 0.74rem; color: var(--text-muted); white-space: nowrap;">🏷️ ${u.customTitle || 'นักชิมมือใหม่'}</div>
        </td>
        <td style="font-size: 0.78rem; color: var(--text-muted); white-space: nowrap;">${registerDate}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.3rem; flex-wrap: wrap;">
            <button type="button" class="btn btn-sm btn-primary" style="padding: 0.25rem 0.55rem; font-size: 0.76rem;" onclick="openApplicantDetailModal('${uid}')" title="ดูข้อมูลใบสมัครและโปรไฟล์">
              👁️ ใบสมัคร
            </button>
            <button type="button" class="btn btn-sm btn-outline" style="padding: 0.25rem 0.55rem; font-size: 0.76rem;" onclick="adminToggleUserRole('${uid}')" title="สลับสิทธิ์ Admin / User">
              ${isAdminUser ? 'ปลดแอดมิน' : 'แต่งตั้งแอดมิน'}
            </button>
            <button type="button" class="btn btn-sm btn-outline" style="padding: 0.25rem 0.55rem; font-size: 0.76rem;" onclick="adminResetUserPassword('${uid}')" title="ส่งอีเมลรีเซ็ตรหัสผ่าน">
              🔑 รีเซ็ต
            </button>
            ${!isSelf ? `
              <button type="button" class="btn btn-sm btn-outline btn-danger" style="padding: 0.25rem 0.55rem; font-size: 0.76rem;" onclick="adminDeleteUser('${uid}')" title="ลบข้อมูลโปรไฟล์ผู้ใช้นี้">
                🗑️ ลบ
              </button>
            ` : '<span style="font-size: 0.74rem; color: var(--text-muted); padding: 0.2rem 0.35rem;">คุณ</span>'}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openApplicantDetailModal(userId) {
  const users = AppState.users;
  const u = users.find(user => (user.uid || user.id) === userId);
  if (!u) return;

  const reviews = AppState.reviews;
  const userReviews = reviews.filter(r => r.userId === userId);
  const registerDate = u.createdAtDisplay || formatFirebaseDate(u.createdAt, '-');
  const effectiveStudentId = getEffectiveMemberId(u);
  const body = document.getElementById('applicantDetailBody');
  if (!body) return;

  body.innerHTML = `
    <div style="display: flex; gap: 1.5rem; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
      ${renderFramedAvatar(u.avatar, u.equippedFrame || 'frame-none', 80, '', u.name)}
      <div>
        <div style="font-size: 1.35rem; font-weight: 800; color: var(--text-main);">${u.name}</div>
        <div style="color: var(--primary); font-weight: 700; font-size: 0.95rem; margin-top: 2px;">🆔 รหัสนักศึกษา/สมาชิก: ${effectiveStudentId}</div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">🏛️ สังกัด: ${u.faculty || 'ม.ศรีปทุม'} | ประเภท: ${u.userType || 'นักศึกษา'}</div>
        <div style="margin-top: 0.5rem; display: flex; gap: 0.4rem; flex-wrap: wrap;">
          <span style="background: ${u.role === 'admin' ? '#ede9fe' : 'var(--primary-light)'}; color: ${u.role === 'admin' ? '#6d28d9' : 'var(--primary)'}; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700;">
            ${u.role === 'admin' ? '👑 ผู้ดูแลระบบ (Admin)' : '🎓 สมาชิกจานเด็ด SPU'}
          </span>
          <span style="background: #ecfdf5; color: #047857; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700;">
            ✅ ${u.status || 'อนุมัติแล้ว'}
          </span>
          <span style="background: var(--bg-surface-alt); color: var(--text-main); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">
            🏷️ ${u.customTitle || 'นักชิมมือใหม่'}
          </span>
        </div>
      </div>
    </div>

    <div class="mobile-stack-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
      <div style="background: var(--bg-surface-alt); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.35rem;">ข้อมูลการติดต่อ (Contact Info)</div>
        <div style="font-size: 0.9rem; margin-bottom: 0.25rem;"><strong>อีเมล:</strong> ${u.email}</div>
        <div style="font-size: 0.9rem;"><strong>เบอร์โทรศัพท์:</strong> ${u.phone || '-'}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;"><strong>วันที่สมัคร:</strong> ${registerDate}</div>
      </div>

      <div style="background: var(--bg-surface-alt); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.35rem;">สถิติการใช้งาน (Engagement Stats)</div>
        <div style="font-size: 0.9rem; margin-bottom: 0.25rem;"><strong>สตรีคเช็กอินสะสม:</strong> 🔥 ${u.checkInStreak || 0} วัน</div>
        <div style="font-size: 0.9rem; margin-bottom: 0.25rem;"><strong>รีวิวที่เขียน:</strong> 💬 ${userReviews.length} รีวิว</div>
        <div style="font-size: 0.9rem;"><strong>ร้านโปรดที่บันทึก:</strong> ❤️ ${(u.favorites || []).length} ร้าน</div>
      </div>
    </div>

    <div style="background: var(--bg-surface-alt); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 1.5rem;">
      <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem;">🎖️ บัดจ์เกียรติยศและกรอบรูปที่ครอบครอง</div>
      <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">
        บัดจ์: ${(u.badges || []).map(bId => {
          const b = BADGES_LIST.find(x => x.id === bId);
          return `<span style="display: inline-block; background: var(--bg-surface); padding: 0.2rem 0.5rem; border-radius: 4px; margin: 2px; border: 1px solid var(--border-color); font-weight: 600;">${b ? b.icon + ' ' + b.name : bId}</span>`;
        }).join(' ')}
      </div>
      <div style="font-size: 0.85rem; color: var(--text-muted);">
        กรอบที่ปลดล็อก: ${(u.unlockedFrames || ['frame-none']).map(fId => {
          const f = PROFILE_FRAMES.find(x => x.id === fId);
          return `<span style="display: inline-block; background: var(--bg-surface); padding: 0.2rem 0.5rem; border-radius: 4px; margin: 2px; border: 1px solid var(--border-color);">${f ? f.name : fId}</span>`;
        }).join(' ')}
      </div>
    </div>

    <div style="text-align: right;">
      <button type="button" class="btn btn-outline btn-sm" onclick="closeModal('applicantDetailModal')">ปิดหน้าต่าง</button>
    </div>
  `;

  openModal('applicantDetailModal');
}

async function adminToggleUserRole(userId) {
  if (!isAdmin()) return;
  const target = AppState.users.find(u => (u.uid || u.id) === userId);
  if (!target) return;

  const currentUser = getCurrentUser();
  const currentUid = currentUser ? (currentUser.uid || currentUser.id) : null;
  const newRole = target.role === 'admin' ? 'user' : 'admin';

  if (currentUid && currentUid === userId && newRole !== 'admin') {
    showToast('ไม่สามารถปลดสิทธิ์แอดมินของบัญชีที่กำลังใช้งานอยู่ได้', 'error');
    return;
  }

  const roleName = newRole === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'สมาชิกทั่วไป (User)';
  if (!confirm(`คุณต้องการเปลี่ยนสิทธิ์ของ "${target.name}" เป็น "${roleName}" ใช่หรือไม่?`)) return;

  try {
    await window.FirestoreService.adminUpdateUser(userId, { role: newRole });
    target.role = newRole;
    showToast(`อัปเดตสิทธิ์ของ "${target.name}" เป็น ${roleName} เรียบร้อยแล้ว`, 'success');
    renderAdminUsers();
    renderAdminStats();
  } catch (err) {
    console.error('Toggle user role error:', err);
    showToast('เปลี่ยนสิทธิ์สมาชิกไม่สำเร็จ: ' + (err?.message || ''), 'error');
  }
}

async function adminEditUserTitle(userId) {
  if (!isAdmin()) return;
  const target = AppState.users.find(u => (u.uid || u.id) === userId);
  if (!target) return;

  const current = target.customTitle || "นักชิมมือใหม่";
  const input = prompt(`แก้ไขฉายาของ "${target.name}":`, current);
  if (input === null || !input.trim()) return;

  const newTitle = input.trim();
  const unlockedTitles = [...(target.unlockedTitles || ["นักชิมมือใหม่"])];
  if (!unlockedTitles.includes(newTitle)) {
    unlockedTitles.push(newTitle);
  }

  try {
    await window.FirestoreService.adminUpdateUser(userId, { customTitle: newTitle, unlockedTitles });
    target.customTitle = newTitle;
    target.unlockedTitles = unlockedTitles;
    showToast(`อัปเดตฉายาของ "${target.name}" เป็น "${newTitle}" สำเร็จ`, 'success');
    renderAdminUsers();
    renderLeaderboard();
  } catch (err) {
    console.error('Edit user title error:', err);
    showToast('อัปเดตฉายาไม่สำเร็จ', 'error');
  }
}

async function adminResetUserPassword(userId) {
  if (!isAdmin()) return;
  const target = AppState.users.find(u => (u.uid || u.id) === userId);
  if (!target || !target.email) return;

  if (!confirm(`ส่งอีเมลรีเซ็ตรหัสผ่านผ่าน Firebase Authentication ไปที่ ${target.email} ใช่หรือไม่?`)) return;

  try {
    await window.AuthService.sendPasswordReset(target.email);
    showToast(`ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ "${target.email}" เรียบร้อยแล้ว 📧`, 'success');
  } catch (err) {
    console.error('Reset password email error:', err);
    showToast('ส่งอีเมลรีเซ็ตรหัสผ่านไม่สำเร็จ: ' + translateFirebaseAuthError(err), 'error');
  }
}

async function adminDeleteUser(userId) {
  if (!isAdmin()) return;
  const currentUser = getCurrentUser();
  const currentUid = currentUser ? (currentUser.uid || currentUser.id) : null;
  if (currentUid && currentUid === userId) {
    showToast('ไม่สามารถลบบัญชีแอดมินที่กำลังใช้งานอยู่ในขณะนี้ได้', 'error');
    return;
  }

  const target = AppState.users.find(u => (u.uid || u.id) === userId);
  if (!target) return;

  if (!confirm(`⚠️ ยืนยันการลบข้อมูลสมาชิก "${target.name}" (${target.email}) ออกจาก Cloud Firestore?\n(หมายเหตุ: หากต้องการลบบัญชีเข้าสู่ระบบถาวร ให้ลบในหน้า Firebase Authentication เพิ่มเติมด้วย)`)) return;

  try {
    await window.FirestoreService.adminDeleteUserDoc(userId);
    showToast(`ลบข้อมูลโปรไฟล์ของ "${target.name}" ออกจาก Firestore เรียบร้อยแล้ว`, 'info');
  } catch (err) {
    console.error('Delete user error:', err);
    showToast('ลบข้อมูลสมาชิกไม่สำเร็จ: ' + (err?.message || ''), 'error');
  }
}

function renderAdminRestaurantsTable() {
  const tbody = document.getElementById('adminRestaurantTableBody');
  if (!tbody) return;

  const restaurants = AppState.restaurants;

  if (!restaurants || restaurants.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          ยังไม่มีร้านอาหารใน Cloud Firestore — กดปุ่ม "+ เพิ่มร้านอาหารใหม่" ด้านบนเพื่อเริ่มต้น
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = restaurants.map(rst => {
    const stats = calculateRestaurantRating(rst.id);
    const ratingLabel = stats.count > 0 ? `⭐ ${stats.avg.toFixed(1)} (${stats.count})` : '⭐ 0.0 (ยังไม่มีรีวิว)';
    return `
      <tr>
        <td>
          <img src="${rst.image}" style="width: 44px; height: 44px; border-radius: var(--radius-sm); object-fit: cover;">
        </td>
        <td><strong>${rst.name}</strong></td>
        <td>${rst.location}</td>
        <td><span style="font-size: 0.8rem; background: var(--bg-surface-alt); padding: 0.2rem 0.5rem; border-radius: 4px;">${rst.category}</span></td>
        <td>${ratingLabel}</td>
        <td>${(rst.menus || []).length} เมนู</td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button type="button" class="btn btn-sm btn-outline" onclick="openEditRestaurantModal('${rst.id}')">✏️ แก้ไข</button>
            <button type="button" class="btn btn-sm btn-outline btn-danger" onclick="adminDeleteRestaurant('${rst.id}')">🗑️ ลบ</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

let rstFormCurrentImages = [];

function renderRestaurantFormImages() {
  const grid = document.getElementById('rstFormImagesGrid');
  const countBadge = document.getElementById('rstImageCountBadge');
  const hiddenInput = document.getElementById('rstImage');

  if (countBadge) {
    countBadge.textContent = `${rstFormCurrentImages.length}/5 รูป`;
  }
  if (hiddenInput) {
    hiddenInput.value = rstFormCurrentImages[0] || '';
  }

  if (!grid) return;

  if (rstFormCurrentImages.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.825rem; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
        ยังไม่มีรูปภาพที่เลือก กรุณาอัปโหลดไฟล์รูปภาพหรือใส่ลิงก์รูปภาพ (เพิ่มได้สูงสุด 5 รูป)
      </div>
    `;
    return;
  }

  grid.innerHTML = rstFormCurrentImages.map((img, idx) => `
    <div style="position: relative; border-radius: var(--radius-md); overflow: hidden; border: 2px solid ${idx === 0 ? 'var(--primary)' : 'var(--border-color)'}; background: #000; aspect-ratio: 4/3; box-shadow: var(--shadow-sm);">
      <img src="${img}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'">
      
      <!-- Cover Badge for 1st image -->
      ${idx === 0 ? `
        <span style="position: absolute; top: 4px; left: 4px; background: var(--primary); color: #fff; font-size: 0.65rem; font-weight: 800; padding: 0.15rem 0.45rem; border-radius: var(--radius-full); box-shadow: 0 1px 3px rgba(0,0,0,0.4);">
          ⭐ หน้าปก
        </span>
      ` : `
        <button type="button" onclick="setRestaurantPrimaryImage(${idx})" style="position: absolute; top: 4px; left: 4px; background: rgba(0,0,0,0.65); color: #fff; border: none; font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.4rem; border-radius: var(--radius-full); cursor: pointer;" title="ตั้งรูปนี้เป็นรูปหน้าปก">
          ตั้งเป็นปก
        </button>
      `}

      <!-- Delete Button -->
      <button type="button" onclick="removeRestaurantFormImage(${idx})" style="position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; border-radius: 50%; background: rgba(239, 68, 68, 0.85); color: #fff; border: none; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; cursor: pointer; line-height: 1;" title="ลบรูปนี้">
        ✕
      </button>

      <!-- Image number -->
      <span style="position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.6); color: #fff; font-size: 0.65rem; padding: 0.1rem 0.35rem; border-radius: 3px;">
        #${idx + 1}
      </span>
    </div>
  `).join('');
}

function compressImageFile(file, maxWidth = 800, maxHeight = 800, quality = 0.78) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = function() {
        resolve(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.onerror = function() {
      resolve(null);
    };
    reader.readAsDataURL(file);
  });
}

function handleRestaurantMultiFileUpload(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const remainingSlots = 5 - rstFormCurrentImages.length;
  if (remainingSlots <= 0) {
    showToast('คุณเพิ่มรูปภาพครบจำนวนสูงสุด 5 รูปแล้ว หากต้องการเพิ่มรูปใหม่ กรุณาลบรูปเดิมออกก่อน', 'warning');
    return;
  }

  const filesToRead = Array.from(files).slice(0, remainingSlots);
  let processedCount = 0;

  showToast(`กำลังบีบอัดและอัปโหลดรูปภาพ ${filesToRead.length} รูป...`, 'info');

  filesToRead.forEach(async (file) => {
    if (!file.type.startsWith('image/')) {
      showToast(`ข้ามไฟล์ "${file.name}" เนื่องจากไม่ใช่รูปภาพ`, 'warning');
      processedCount++;
      return;
    }

    try {
      const compressedDataUrl = await compressImageFile(file, 720, 720, 0.72);
      if (compressedDataUrl && rstFormCurrentImages.length < 5) {
        rstFormCurrentImages.push(compressedDataUrl);
      }
    } catch (err) {
      console.warn("Image compression error:", err);
    }

    processedCount++;
    if (processedCount === filesToRead.length) {
      renderRestaurantFormImages();
      SoundFX.playMatch();
      showToast(`อัปโหลดรูปภาพร้านเรียบร้อยแล้ว (${rstFormCurrentImages.length}/5 รูป)`, 'success');
    }
  });

  // Reset file inputs
  event.target.value = '';
}

// Backward compatibility alias
function handleRestaurantImageFileUpload(event) {
  return handleRestaurantMultiFileUpload(event);
}

function addRestaurantImageFromUrl() {
  const input = document.getElementById('rstImageUrlInput');
  if (!input) return;
  const url = input.value.trim();

  if (!url) {
    showToast('กรุณากรอกลิงก์รูปภาพ (Image URL)', 'warning');
    return;
  }
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:image')) {
    showToast('ลิงก์รูปภาพต้องขึ้นต้นด้วย http:// หรือ https://', 'error');
    return;
  }
  if (rstFormCurrentImages.length >= 5) {
    showToast('สามารถเพิ่มรูปภาพได้สูงสุด 5 รูปเท่านั้น', 'warning');
    return;
  }

  rstFormCurrentImages.push(url);
  input.value = '';
  renderRestaurantFormImages();
  SoundFX.playTick();
  showToast(`เพิ่มลิงก์รูปภาพสำเร็จ (${rstFormCurrentImages.length}/5 รูป)`, 'success');
}

function removeRestaurantFormImage(index) {
  if (index >= 0 && index < rstFormCurrentImages.length) {
    rstFormCurrentImages.splice(index, 1);
    renderRestaurantFormImages();
    SoundFX.playTick();
    showToast('ลบรูปภาพเรียบร้อยแล้ว', 'info');
  }
}

function setRestaurantPrimaryImage(index) {
  if (index > 0 && index < rstFormCurrentImages.length) {
    const chosen = rstFormCurrentImages.splice(index, 1)[0];
    rstFormCurrentImages.unshift(chosen);
    renderRestaurantFormImages();
    SoundFX.playMatch();
    showToast('ตั้งเป็นรูปหน้าปกหลักเรียบร้อย ⭐', 'success');
  }
}

function clearRestaurantImageUpload() {
  rstFormCurrentImages = [];
  const fileInput1 = document.getElementById('rstImageFilesInput');
  const fileInput2 = document.getElementById('rstImageFile');
  const rstImageInput = document.getElementById('rstImage');
  const urlInput = document.getElementById('rstImageUrlInput');

  if (fileInput1) fileInput1.value = '';
  if (fileInput2) fileInput2.value = '';
  if (rstImageInput) rstImageInput.value = '';
  if (urlInput) urlInput.value = '';
  renderRestaurantFormImages();
}

function previewRestaurantImageUrl(url) {
  if (url && url.trim().length > 5) {
    if (!rstFormCurrentImages.includes(url.trim())) {
      rstFormCurrentImages.push(url.trim());
    }
    renderRestaurantFormImages();
  }
}

// ==========================================
// Recommended Menus Manager & Store Menu Sections Manager
// ==========================================
let rstFormCurrentMenus = [];
let rstFormCurrentMenuSections = [];

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderRestaurantFormMenus() {
  const container = document.getElementById('rstFormMenusContainer');
  const addBtn = document.getElementById('rstFormAddMenuBtn');
  if (!container) return;

  if (addBtn) {
    addBtn.disabled = rstFormCurrentMenus.length >= 12;
    addBtn.style.opacity = rstFormCurrentMenus.length >= 12 ? '0.5' : '1';
    addBtn.textContent = rstFormCurrentMenus.length >= 12 ? 'ครบ 12 เมนูแล้ว' : '➕ เพิ่มเมนูแนะนำ';
  }

  if (rstFormCurrentMenus.length === 0) {
    container.innerHTML = `
      <div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
        ไม่มีเมนูแนะนำ (หากเป็นร้านเลือกหยิบเองสามารถเว้นว่างได้ หรือคลิก "➕ เพิ่มเมนูแนะนำ" ด้านบน)
      </div>
    `;
    return;
  }

  container.innerHTML = rstFormCurrentMenus.map((m, idx) => `
    <div class="rst-form-menu-item" style="display: flex; gap: 0.75rem; align-items: center; background: var(--bg-surface); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); flex-wrap: wrap;">
      <!-- Menu Thumbnail / Photo Upload -->
      <div style="position: relative; width: 68px; height: 68px; border-radius: var(--radius-md); overflow: hidden; background: #1e293b; flex-shrink: 0; border: 1.5px solid var(--border-color);">
        <img src="${m.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150'}" id="rstMenuThumb_${idx}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150'">
        <label for="rstMenuFileInput_${idx}" style="position: absolute; inset: 0; background: rgba(0,0,0,0.55); color: #fff; font-size: 0.65rem; font-weight: 700; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; cursor: pointer;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'" title="คลิกเพื่อแนบรูปภาพเมนูนี้">
          <span>📷 แนบรูป</span>
        </label>
        <input type="file" id="rstMenuFileInput_${idx}" accept="image/*" style="display: none;" onchange="handleMenuPhotoFileChange(event, ${idx})">
      </div>

      <!-- Menu Name & Price Inputs -->
      <div style="flex: 1; min-width: 220px; display: flex; gap: 0.5rem; flex-direction: column;">
        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <span style="font-size: 0.75rem; font-weight: 800; background: var(--bg-surface-alt); padding: 0.2rem 0.5rem; border-radius: 4px; color: var(--primary); white-space: nowrap;">⭐ เมนูที่ ${idx + 1}</span>
          <input type="text" class="form-control" style="flex: 1; min-width: 150px; padding: 0.35rem 0.65rem; font-size: 0.875rem;" placeholder="ชื่อเมนู เช่น ข้าวกะเพราหมูกรอบไข่ดาว" value="${escapeHtml(m.name || '')}" oninput="updateMenuField(${idx}, 'name', this.value)">
          <label style="display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; color: var(--text-muted); cursor: pointer; white-space: nowrap;">
            <input type="checkbox" ${m.isRecommended !== false ? 'checked' : ''} onchange="updateMenuField(${idx}, 'isRecommended', this.checked)">
            แสดงเป็นเมนูแนะนำ
          </label>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 0.35rem; width: 130px;">
            <input type="number" min="0" max="9999" class="form-control" style="padding: 0.35rem 0.5rem; font-size: 0.85rem;" placeholder="ราคา" value="${m.price || 50}" oninput="updateMenuField(${idx}, 'price', this.value)">
            <span style="font-size: 0.8rem; color: var(--text-muted);">บาท</span>
          </div>
          <button type="button" class="btn btn-outline btn-sm" style="font-size: 0.75rem; padding: 0.35rem 0.55rem; white-space: nowrap;" onclick="document.getElementById('rstMenuFileInput_${idx}').click()">
            📁 แนบรูปเมนู
          </button>
          <input type="text" class="form-control" style="flex: 1; min-width: 140px; padding: 0.35rem 0.55rem; font-size: 0.75rem;" placeholder="หรือวางลิงก์รูป (Image URL)" value="${m.image ? (m.image.startsWith('data:') ? '[รูปภาพที่อัปโหลด]' : m.image) : ''}" oninput="updateMenuField(${idx}, 'imageUrl', this.value)">
        </div>
      </div>

      <!-- Delete Button -->
      <button type="button" class="btn btn-outline btn-danger btn-sm" onclick="removeRestaurantFormMenuSlot(${idx})" style="padding: 0.35rem 0.6rem; font-size: 0.8rem;" title="ลบเมนูนี้">
        🗑️
      </button>
    </div>
  `).join('');
}

function addRestaurantFormMenuSlot() {
  if (rstFormCurrentMenus.length >= 12) {
    showToast('สามารถเพิ่มเมนูแนะนำได้สูงสุด 12 รายการครับ', 'info');
    return;
  }
  rstFormCurrentMenus.push({
    id: `m_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: '',
    price: 50,
    image: '',
    isRecommended: true
  });
  renderRestaurantFormMenus();
  SoundFX.playTick();
}

function removeRestaurantFormMenuSlot(idx) {
  rstFormCurrentMenus.splice(idx, 1);
  renderRestaurantFormMenus();
  SoundFX.playTick();
}

function updateMenuField(idx, field, value) {
  if (!rstFormCurrentMenus[idx]) return;
  if (field === 'name') {
    rstFormCurrentMenus[idx].name = value;
  } else if (field === 'price') {
    rstFormCurrentMenus[idx].price = Number(value) || 0;
  } else if (field === 'isRecommended') {
    rstFormCurrentMenus[idx].isRecommended = Boolean(value);
  } else if (field === 'imageUrl') {
    if (!value.startsWith('data:')) {
      rstFormCurrentMenus[idx].image = value.trim();
      const thumb = document.getElementById(`rstMenuThumb_${idx}`);
      if (thumb && value.trim()) thumb.src = value.trim();
    }
  }
}

// ==========================================
// Store Menu Sections Manager (📋 รายการเมนูในร้าน)
// ==========================================
function renderRestaurantFormMenuSections() {
  const container = document.getElementById('rstFormMenuSectionsContainer');
  if (!container) return;

  if (!Array.isArray(rstFormCurrentMenuSections) || rstFormCurrentMenuSections.length === 0) {
    container.innerHTML = `
      <div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
        ยังไม่มีหมวดหมู่รายการเมนูในร้าน คลิกปุ่ม "➕ เพิ่มหมวดหมู่เมนู" ด้านบนเพื่อเพิ่มรายการอาหารและราคา
      </div>
    `;
    return;
  }

  container.innerHTML = rstFormCurrentMenuSections.map((sec, sIdx) => `
    <div class="rst-form-section-card" style="background: var(--bg-surface); border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 0.9rem;">
      <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.7rem; padding-bottom: 0.6rem; border-bottom: 1px dashed var(--border-color);">
        <span style="font-size: 0.75rem; font-weight: 800; background: var(--primary-light); color: var(--primary); padding: 0.2rem 0.55rem; border-radius: 4px; white-space: nowrap;">หมวด ${sIdx + 1}</span>
        <input type="text" class="form-control" style="flex: 2; min-width: 180px; padding: 0.35rem 0.6rem; font-size: 0.875rem; font-weight: 700;" placeholder="ชื่อหมวด เช่น เมนูจานพิเศษ / น้ำซุป / เมนูหมู" value="${escapeHtml(sec.title || '')}" oninput="updateMenuSectionField(${sIdx}, 'title', this.value)">
        <input type="text" class="form-control" style="flex: 1; min-width: 140px; padding: 0.35rem 0.6rem; font-size: 0.8rem;" placeholder="คำอธิบายย่อย (ไม่บังคับ) เช่น โปร 10 แถม 1" value="${escapeHtml(sec.subtitle || '')}" oninput="updateMenuSectionField(${sIdx}, 'subtitle', this.value)">
        <button type="button" class="btn btn-outline btn-danger btn-sm" style="padding: 0.35rem 0.6rem; font-size: 0.78rem; white-space: nowrap;" onclick="removeRestaurantMenuSectionSlot(${sIdx})" title="ลบหมวดหมู่นี้">
          🗑️ ลบหมวด
        </button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.45rem;">
        ${(sec.items || []).map((item, iIdx) => `
          <div style="display: flex; gap: 0.45rem; align-items: center; flex-wrap: wrap;">
            <input type="text" class="form-control" style="flex: 1; min-width: 190px; padding: 0.32rem 0.6rem; font-size: 0.84rem;" placeholder="ชื่อรายการอาหาร เช่น ไข่ 1 ฟอง (เลือกเครื่องได้ 4 อย่าง)" value="${escapeHtml(item.name || '')}" oninput="updateMenuSectionItemField(${sIdx}, ${iIdx}, 'name', this.value)">
            <input type="text" class="form-control" style="width: 130px; padding: 0.32rem 0.6rem; font-size: 0.84rem;" placeholder="ราคา เช่น 40.-" value="${escapeHtml(item.price || '')}" oninput="updateMenuSectionItemField(${sIdx}, ${iIdx}, 'price', this.value)">
            <button type="button" class="btn btn-outline btn-danger btn-sm" style="padding: 0.28rem 0.55rem; font-size: 0.78rem;" onclick="removeRestaurantMenuSectionItem(${sIdx}, ${iIdx})" title="ลบรายการนี้">✕</button>
          </div>
        `).join('')}
      </div>

      <div style="margin-top: 0.6rem;">
        <button type="button" class="btn btn-outline btn-sm" style="font-size: 0.78rem; padding: 0.3rem 0.7rem;" onclick="addRestaurantMenuSectionItem(${sIdx})">
          ➕ เพิ่มรายการในหมวดนี้
        </button>
      </div>
    </div>
  `).join('');
}

function addRestaurantMenuSectionSlot() {
  rstFormCurrentMenuSections.push({
    title: '',
    subtitle: '',
    items: [{ name: '', price: '' }]
  });
  renderRestaurantFormMenuSections();
  SoundFX.playTick();
}

function removeRestaurantMenuSectionSlot(secIdx) {
  rstFormCurrentMenuSections.splice(secIdx, 1);
  renderRestaurantFormMenuSections();
  SoundFX.playTick();
}

function updateMenuSectionField(secIdx, field, value) {
  if (!rstFormCurrentMenuSections[secIdx]) return;
  rstFormCurrentMenuSections[secIdx][field] = value;
}

function addRestaurantMenuSectionItem(secIdx) {
  if (!rstFormCurrentMenuSections[secIdx]) return;
  if (!Array.isArray(rstFormCurrentMenuSections[secIdx].items)) {
    rstFormCurrentMenuSections[secIdx].items = [];
  }
  rstFormCurrentMenuSections[secIdx].items.push({ name: '', price: '' });
  renderRestaurantFormMenuSections();
  SoundFX.playTick();
}

function removeRestaurantMenuSectionItem(secIdx, itemIdx) {
  if (!rstFormCurrentMenuSections[secIdx] || !Array.isArray(rstFormCurrentMenuSections[secIdx].items)) return;
  rstFormCurrentMenuSections[secIdx].items.splice(itemIdx, 1);
  renderRestaurantFormMenuSections();
  SoundFX.playTick();
}

function updateMenuSectionItemField(secIdx, itemIdx, field, value) {
  if (!rstFormCurrentMenuSections[secIdx]?.items?.[itemIdx]) return;
  rstFormCurrentMenuSections[secIdx].items[itemIdx][field] = value;
}

async function handleMenuPhotoFileChange(event, idx) {
  const file = event.target?.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)', 'error');
    return;
  }

  showToast('กำลังประมวลผลรูปภาพเมนู...', 'info');
  try {
    const compressed = await compressImageFile(file, 480, 480, 0.70);
    if (compressed && rstFormCurrentMenus[idx]) {
      rstFormCurrentMenus[idx].image = compressed;
      renderRestaurantFormMenus();
      SoundFX.playMatch();
      showToast('แนบรูปภาพเมนูเรียบร้อยแล้ว! 🍽️', 'success');
    }
  } catch (err) {
    console.error('Error compressing menu photo:', err);
    showToast('เกิดข้อผิดพลาดในการแนบรูปเมนู', 'error');
  } finally {
    event.target.value = '';
  }
}

function ensureRestaurantDropdownOptions() {
  const rstLocation = document.getElementById('rstLocation');
  const rstCategory = document.getElementById('rstCategory');

  if (rstLocation && rstLocation.options.length === 0) {
    SPU_LOCATIONS.forEach(loc => {
      const opt = document.createElement('option');
      opt.value = loc;
      opt.textContent = loc;
      rstLocation.appendChild(opt);
    });
  }

  if (rstCategory && rstCategory.options.length === 0) {
    FOOD_CATEGORIES.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      rstCategory.appendChild(opt);
    });
  }
}

function openAddRestaurantModal() {
  if (!isAdmin()) {
    showToast('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเพิ่มร้านอาหารได้ กรุณาเข้าสู่ระบบด้วยบัญชีแอดมิน', 'info');
    openAdminAccessModal();
    return;
  }

  ensureRestaurantDropdownOptions();

  const form = document.getElementById('restaurantForm');
  if (form) form.reset();

  document.getElementById('editRestaurantId').value = '';
  document.getElementById('rstName').value = '';
  document.getElementById('rstPriceRange').value = '40 - 60 บาท';
  document.getElementById('rstAvgPrice').value = '50';
  document.getElementById('rstOpenHours').value = '08:30 - 17:00 น. (จันทร์ - เสาร์)';
  document.getElementById('rstDesc').value = '';
  document.getElementById('rstTags').value = '';

  const locSelect = document.getElementById('rstLocation');
  if (locSelect && locSelect.options.length > 0) locSelect.selectedIndex = 0;

  const catSelect = document.getElementById('rstCategory');
  if (catSelect && catSelect.options.length > 0) catSelect.selectedIndex = 0;

  rstFormCurrentImages = [];
  renderRestaurantFormImages();

  // Initialize with 3 recommended menu slots by default (optional)
  rstFormCurrentMenus = [
    { id: `m_${Date.now()}_1`, name: '', price: 50, image: '', isRecommended: true },
    { id: `m_${Date.now()}_2`, name: '', price: 55, image: '', isRecommended: true },
    { id: `m_${Date.now()}_3`, name: '', price: 60, image: '', isRecommended: true }
  ];
  renderRestaurantFormMenus();

  rstFormCurrentMenuSections = [];
  renderRestaurantFormMenuSections();

  document.getElementById('restaurantFormModalTitle').textContent = '➕ เพิ่มร้านอาหารใหม่ใน SPU';
  openModal('restaurantFormModal');
}

function openEditRestaurantModal(restaurantId, focusSection = '') {
  if (!isAdmin()) {
    showToast('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถแก้ไขร้านอาหารได้ กรุณาเข้าสู่ระบบด้วยบัญชีแอดมิน', 'info');
    openAdminAccessModal();
    return;
  }

  const restaurants = AppState.restaurants;
  const rst = restaurants.find(r => r.id === restaurantId);
  if (!rst) {
    showToast('ไม่พบข้อมูลร้านอาหารที่ต้องการแก้ไข', 'error');
    return;
  }

  ensureRestaurantDropdownOptions();

  document.getElementById('editRestaurantId').value = rst.id;
  document.getElementById('rstName').value = rst.name || '';
  
  // Safe location selection
  const locSelect = document.getElementById('rstLocation');
  if (locSelect) {
    const locVal = rst.location || SPU_LOCATIONS[0];
    const hasOpt = Array.from(locSelect.options).some(o => o.value === locVal);
    if (!hasOpt) {
      const newOpt = document.createElement('option');
      newOpt.value = locVal;
      newOpt.textContent = locVal;
      locSelect.appendChild(newOpt);
    }
    locSelect.value = locVal;
  }

  // Safe category selection
  const catSelect = document.getElementById('rstCategory');
  if (catSelect) {
    const catVal = rst.category || FOOD_CATEGORIES[0];
    const hasOpt = Array.from(catSelect.options).some(o => o.value === catVal);
    if (!hasOpt) {
      const newOpt = document.createElement('option');
      newOpt.value = catVal;
      newOpt.textContent = catVal;
      catSelect.appendChild(newOpt);
    }
    catSelect.value = catVal;
  }

  document.getElementById('rstPriceRange').value = rst.priceRange || '40 - 60 บาท';
  document.getElementById('rstAvgPrice').value = rst.avgPrice || 50;
  document.getElementById('rstOpenHours').value = rst.openHours || '08:30 - 17:00 น.';
  document.getElementById('rstDesc').value = rst.description || '';
  document.getElementById('rstTags').value = Array.isArray(rst.tags) ? rst.tags.join(', ') : (rst.tags || '');

  // Load existing images (up to 5)
  if (Array.isArray(rst.images) && rst.images.length > 0) {
    rstFormCurrentImages = [...rst.images];
  } else if (rst.image) {
    rstFormCurrentImages = [rst.image];
  } else {
    rstFormCurrentImages = [];
  }
  renderRestaurantFormImages();

  // Load existing recommended menus (up to 12)
  if (Array.isArray(rst.menus) && rst.menus.length > 0) {
    rstFormCurrentMenus = rst.menus.slice(0, 12).map((m, idx) => ({
      id: m.id || `m_${Date.now()}_${idx}`,
      name: m.name || '',
      price: m.price || 50,
      image: m.image || '',
      isRecommended: m.isRecommended !== false
    }));
  } else {
    rstFormCurrentMenus = [
      { id: `m_${Date.now()}_1`, name: 'เมนูเด็ด ' + (rst.name || ''), price: rst.avgPrice || 50, image: rst.image || '', isRecommended: true },
      { id: `m_${Date.now()}_2`, name: '', price: (rst.avgPrice || 50) + 5, image: '', isRecommended: true },
      { id: `m_${Date.now()}_3`, name: '', price: (rst.avgPrice || 50) + 10, image: '', isRecommended: true }
    ];
  }
  renderRestaurantFormMenus();

  // Load existing store menu sections (📋 รายการเมนูในร้าน)
  if (Array.isArray(rst.menuSections) && rst.menuSections.length > 0) {
    rstFormCurrentMenuSections = rst.menuSections.map(sec => ({
      title: sec.title || '',
      subtitle: sec.subtitle || '',
      items: Array.isArray(sec.items) && sec.items.length > 0
        ? sec.items.map(it => ({ name: it.name || '', price: it.price || '' }))
        : [{ name: '', price: '' }]
    }));
  } else {
    rstFormCurrentMenuSections = [];
  }
  renderRestaurantFormMenuSections();

  document.getElementById('restaurantFormModalTitle').textContent = `✏️ แก้ไขข้อมูลร้าน: ${rst.name}`;
  openModal('restaurantFormModal');

  if (focusSection === 'menuSections') {
    setTimeout(() => {
      document.getElementById('rstFormMenuSectionsBox')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }
}

async function handleRestaurantFormSubmit(event) {
  event.preventDefault();

  if (!isAdmin()) {
    showToast('⚠️ เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเพิ่มหรือแก้ไขร้านอาหารได้ กรุณาเข้าสู่ระบบด้วยบัญชีแอดมิน', 'error');
    openAdminAccessModal();
    return;
  }

  if (!window.FirestoreService?.isConfigured()) {
    showToast('⚠️ กรุณาตั้งค่า firebaseConfig ใน js/firebase-config.js ก่อนบันทึกข้อมูล', 'warning');
    return;
  }

  const id = document.getElementById('editRestaurantId').value;
  const name = (document.getElementById('rstName')?.value || '').trim() || 'ร้านอร่อย SPU';
  const location = document.getElementById('rstLocation')?.value || SPU_LOCATIONS[0];
  const category = document.getElementById('rstCategory')?.value || FOOD_CATEGORIES[0];
  const priceRange = document.getElementById('rstPriceRange')?.value || '40 - 60 บาท';
  const avgPrice = Number(document.getElementById('rstAvgPrice')?.value) || 50;
  const openHours = (document.getElementById('rstOpenHours')?.value || '').trim() || '08:30 - 17:00 น.';
  const description = (document.getElementById('rstDesc')?.value || '').trim() || 'ร้านอาหารยอดนิยมใน SPU เมนูหลากหลาย รสชาติจัดจ้าน ถูกใจนักศึกษา';
  const tagsStr = document.getElementById('rstTags')?.value || '';
  const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

  // Take images from gallery manager (up to 5)
  const images = [...rstFormCurrentImages];
  let primaryImage = images[0];
  if (!primaryImage) {
    primaryImage = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80';
    images.push(primaryImage);
  }

  // Collect cleaned recommended/photo menus
  const cleanedMenus = rstFormCurrentMenus
    .map(m => ({
      id: m.id || `menu_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: (m.name || '').trim(),
      price: Number(m.price) || avgPrice || 50,
      image: m.image || primaryImage || '',
      isRecommended: m.isRecommended !== false
    }))
    .filter(m => m.name.length > 0);

  // Collect cleaned store menu sections (📋 รายการเมนูในร้าน)
  const cleanedMenuSections = (rstFormCurrentMenuSections || [])
    .map(sec => {
      const cleanedItems = (sec.items || [])
        .map(it => ({
          name: (it.name || '').trim(),
          price: (it.price || '').trim()
        }))
        .filter(it => it.name.length > 0 || it.price.length > 0);
      const sectionObj = {
        title: (sec.title || '').trim() || 'รายการเมนู',
        items: cleanedItems
      };
      const sub = (sec.subtitle || '').trim();
      if (sub) sectionObj.subtitle = sub;
      return sectionObj;
    })
    .filter(sec => sec.items.length > 0 || (sec.title && sec.title !== 'รายการเมนู'));

  if (cleanedMenus.length === 0 && cleanedMenuSections.length === 0) {
    cleanedMenus.push({
      id: `menu_${Date.now()}`,
      name: `เมนูจานเด็ด ${name}`,
      price: avgPrice || 50,
      image: primaryImage || '',
      isRecommended: true
    });
  }

  const payload = {
    name,
    location,
    category,
    priceRange,
    avgPrice,
    openHours,
    image: primaryImage,
    images,
    description,
    tags,
    menus: cleanedMenus,
    menuSections: cleanedMenuSections
  };

  // Validate against Firestore 1 MiB document size ceiling
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload)).length;
  if (payloadBytes > 900000) {
    showToast('⚠️ ขนาดรูปภาพรวมใหญ่เกินขีดจำกัดของ Firestore (1MB) กรุณาลดจำนวนรูปหรือใช้รูปที่ขนาดเล็กลง', 'error');
    return;
  }

  const submitBtn = event.target?.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    if (id) {
      await window.FirestoreService.updateRestaurant(id, payload);
      showToast(`อัปเดตข้อมูลร้าน "${name}" ลง Cloud Firestore สำเร็จ! 🎉`, 'success');
    } else {
      await window.FirestoreService.addRestaurant({
        ...payload,
        rating: 0,
        reviewCount: 0
      });
      showToast(`เพิ่มร้านอาหาร "${name}" ลง Cloud Firestore เรียบร้อย! 🍽️`, 'success');
    }

    SoundFX.playWin();
    closeModal('restaurantFormModal');

    if (currentDetailRestaurantId && id && currentDetailRestaurantId === id) {
      setTimeout(() => openRestaurantDetail(id), 150);
    }
  } catch (err) {
    console.error('Save restaurant error:', err);
    showToast('บันทึกข้อมูลร้านอาหารไม่สำเร็จ: ' + (err?.message || 'กรุณาตรวจสอบสิทธิ์แอดมินใน Firestore'), 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

async function adminDeleteRestaurant(restaurantId) {
  if (!isAdmin()) return;
  if (!confirm('⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบร้านอาหารนี้ออกจาก Cloud Firestore?')) return;

  try {
    await window.FirestoreService.deleteRestaurant(restaurantId);
    showToast('ลบร้านอาหารออกจากฐานข้อมูลเรียบร้อยแล้ว', 'info');
  } catch (err) {
    console.error('Delete restaurant error:', err);
    showToast('ลบร้านอาหารไม่สำเร็จ: ' + (err?.message || ''), 'error');
  }
}

function renderAdminReviews() {
  const container = document.getElementById('adminReviewsContainer');
  if (!container) return;

  const status = document.getElementById('reviewFilterStatus')?.value || 'all';
  const reviews = AppState.reviews;
  const restaurants = AppState.restaurants;

  let filtered = reviews;
  if (status === 'reported') {
    filtered = reviews.filter(r => r.reported);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: var(--text-muted); background: var(--bg-surface-alt); border-radius: var(--radius-lg);">
        🎉 ยังไม่มีรีวิว${status === 'reported' ? 'ที่ถูกรายงาน' : 'ในระบบ'}ในขณะนี้
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(rev => {
    const rst = restaurants.find(r => r.id === rev.restaurantId);
    const dateLabel = rev.date || formatFirebaseDate(rev.createdAt);
    return `
      <div style="padding: 1.25rem; border: 1.5px solid ${rev.reported ? '#fca5a5' : 'var(--border-color)'}; background: ${rev.reported ? '#fff5f5' : 'var(--bg-surface-alt)'}; border-radius: var(--radius-lg); margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <div>
            ${rev.reported ? '<span style="background: #ef4444; color: #fff; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; margin-right: 0.5rem;">⚠️ ถูกรายงาน</span>' : ''}
            <strong>ร้าน: ${rst ? rst.name : 'ร้านในระบบ'}</strong> 
            <span style="font-size: 0.85rem; color: var(--text-muted);">โดย ${rev.userName} (${dateLabel})</span>
          </div>
          <div style="color: #f59e0b;">${getStarSymbols(rev.rating)}</div>
        </div>

        <div style="font-size: 0.95rem; margin-bottom: 0.75rem; line-height: 1.5;">${rev.comment}</div>

        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <button type="button" class="btn btn-sm btn-danger" onclick="adminDeleteReview('${rev.id}')">
            🗡️ ประหารคอมเมนต์ (ลบรีวิวนี้)
          </button>
          ${rev.reported ? `
            <button type="button" class="btn btn-sm btn-outline" onclick="adminDismissReport('${rev.id}')">
              ✅ รีวิวนี้เหมาะสมแล้ว (ยกเลิกรายงาน)
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

async function adminDismissReport(reviewId) {
  if (!isAdmin()) return;
  try {
    await window.FirestoreService.adminDismissReport(reviewId);
    showToast('ยกเลิกสถานะรายงานของรีวิวนี้แล้ว', 'success');
  } catch (err) {
    console.error('Dismiss report error:', err);
    showToast('ดำเนินการไม่สำเร็จ', 'error');
  }
}

function renderAdminNews() {
  const container = document.getElementById('adminNewsListContainer');
  if (!container) return;

  const newsList = AppState.news;

  if (!newsList || newsList.length === 0) {
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: var(--text-muted); background: var(--bg-surface-alt); border-radius: var(--radius-md);">
        📢 ยังไม่มีข่าวสารหรือโปรโมชั่นใน Cloud Firestore
      </div>
    `;
    return;
  }

  container.innerHTML = newsList.map(item => `
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.85rem; padding: 0.75rem 1rem; background: var(--bg-surface-alt); border-radius: var(--radius-md); margin-bottom: 0.5rem; border: 1px solid var(--border-color);">
      <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 0;">
        ${item.image ? `<img src="${item.image}" alt="" style="width: 52px; height: 42px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color); flex-shrink: 0;">` : ''}
        <div style="min-width: 0;">
          <span style="font-size: 0.75rem; background: var(--primary-light); color: var(--primary); font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 4px; margin-right: 0.35rem;">${item.tag}</span>
          <strong>${item.title}</strong>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 0.5rem;">(${formatFirebaseDate(item.createdAt, item.date)})</span>
        </div>
      </div>
      <div style="flex-shrink: 0;">
        <button type="button" class="btn btn-sm btn-outline btn-danger" onclick="adminDeleteNews('${item.id}')">🗑️ ลบข่าว</button>
      </div>
    </div>
  `).join('');
}

async function adminDeleteNews(newsId) {
  if (!isAdmin()) return;
  if (!confirm('ยืนยันลบข่าวนี้ออกจากระบบ?')) return;
  try {
    await window.FirestoreService.deleteNews(newsId);
    showToast('ลบข่าวสารเรียบร้อยแล้ว', 'info');
  } catch (err) {
    console.error('Delete news error:', err);
    showToast('ลบข่าวสารไม่สำเร็จ: ' + (err?.message || ''), 'error');
  }
}

function renderAdminThemePicker() {
  const grid = document.getElementById('themePickerGrid');
  if (!grid) return;

  const currentTheme = AppState.siteSettings.activeTheme || 'spu-classic';

  grid.innerHTML = Object.values(THEMES).map(t => {
    const isActive = t.id === currentTheme;
    return `
      <div class="theme-card-option ${isActive ? 'active' : ''}" onclick="changeThemeFromAdmin('${t.id}')">
        ${t.bannerImage ? `
          <div style="width: 100%; height: 92px; border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 0.65rem; border: 1.5px solid var(--border-color); background: #1e1b4b;">
            <img src="${t.bannerImage}" alt="${t.name}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
          </div>
        ` : `<div class="theme-card-icon">${t.icon}</div>`}
        <div class="theme-card-name">${t.icon} ${t.name}</div>
        <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.25rem; line-height: 1.35;">
          ${t.festivalSubtitle || ''}
        </div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.35rem; flex-wrap: wrap;">
          <span>โทนสี:</span>
          <span style="display: inline-block; width: 13px; height: 13px; border-radius: 50%; background: ${t.primary}; border: 1px solid rgba(0,0,0,0.18);"></span>
          <span style="display: inline-block; width: 13px; height: 13px; border-radius: 50%; background: ${t.secondary}; border: 1px solid rgba(0,0,0,0.18);"></span>
          <span style="display: inline-block; width: 13px; height: 13px; border-radius: 50%; background: ${t.accent}; border: 1px solid rgba(0,0,0,0.18);"></span>
          ${isActive ? '<span style="margin-left: 0.25rem; color: var(--primary); font-weight: 700;">✅ ใช้งานอยู่</span>' : ''}
        </div>
      </div>
    `;
  }).join('');
}

async function changeThemeFromAdmin(themeId) {
  if (!isAdmin()) return;
  applyTheme(themeId);
  renderAdminThemePicker();

  try {
    if (window.FirestoreService?.isConfigured()) {
      await window.FirestoreService.updateSiteSettings({ activeTheme: themeId });
    }
    showToast(`บันทึกธีม "${THEMES[themeId]?.name || themeId}" ลง Cloud Firestore เรียบร้อย 🎉`, 'success');
  } catch (err) {
    console.error('Update theme error:', err);
    showToast('เปลี่ยนธีมไม่สำเร็จ: ' + (err?.message || ''), 'error');
  }
}

let showcaseUploadedImages = {
  main: '',
  float1: '',
  float2: ''
};

function getEffectiveHeroShowcase(themeConfig) {
  const activeTheme = themeConfig || THEMES[AppState.siteSettings?.activeTheme || 'spu-classic'] || THEMES['spu-classic'];
  const saved = AppState.siteSettings?.heroShowcase || {};
  const isCustom = Boolean(saved.customized);

  return {
    mainImg: (isCustom && saved.mainImg) ? saved.mainImg : (activeTheme.heroDishImg || DEFAULT_HERO_SHOWCASE.mainImg),
    priceStamp: (isCustom && saved.priceStamp) ? saved.priceStamp : (activeTheme.heroPriceStamp || DEFAULT_HERO_SHOWCASE.priceStamp),
    dishCat: (isCustom && saved.dishCat) ? saved.dishCat : (activeTheme.heroDishCat || DEFAULT_HERO_SHOWCASE.dishCat),
    dishTitle: (isCustom && saved.dishTitle) ? saved.dishTitle : (activeTheme.heroDishTitle || DEFAULT_HERO_SHOWCASE.dishTitle),
    dishMeta: (isCustom && saved.dishMeta) ? saved.dishMeta : (activeTheme.heroDishMeta || DEFAULT_HERO_SHOWCASE.dishMeta),
    float1Img: saved.float1Img || DEFAULT_HERO_SHOWCASE.float1Img,
    float1Title: saved.float1Title || DEFAULT_HERO_SHOWCASE.float1Title,
    float1Sub: saved.float1Sub || DEFAULT_HERO_SHOWCASE.float1Sub,
    float2Img: saved.float2Img || DEFAULT_HERO_SHOWCASE.float2Img,
    float2Title: saved.float2Title || DEFAULT_HERO_SHOWCASE.float2Title,
    float2Sub: saved.float2Sub || DEFAULT_HERO_SHOWCASE.float2Sub,
    mascotBubble: (isCustom && saved.mascotBubble) ? saved.mascotBubble : (activeTheme.mascotSpeech || DEFAULT_HERO_SHOWCASE.mascotBubble),
    customized: isCustom
  };
}

function applyHeroShowcase(themeConfig) {
  const sc = getEffectiveHeroShowcase(themeConfig);

  const mainImgEl = document.getElementById('heroTastingMainImg');
  if (mainImgEl && sc.mainImg) mainImgEl.src = sc.mainImg;

  const priceStampEl = document.getElementById('heroTastingPriceStamp');
  if (priceStampEl) priceStampEl.textContent = sc.priceStamp;

  const dishCatEl = document.getElementById('heroTastingDishCat');
  if (dishCatEl) dishCatEl.textContent = sc.dishCat;

  const dishTitleEl = document.getElementById('heroTastingDishTitle');
  if (dishTitleEl) dishTitleEl.textContent = sc.dishTitle;

  const dishMetaEl = document.getElementById('heroTastingDishMeta');
  if (dishMetaEl) dishMetaEl.textContent = sc.dishMeta;

  const float1ImgEl = document.getElementById('heroFloat1Img');
  if (float1ImgEl && sc.float1Img) float1ImgEl.src = sc.float1Img;

  const float1TitleEl = document.getElementById('heroFloat1Title');
  if (float1TitleEl) float1TitleEl.textContent = sc.float1Title;

  const float1SubEl = document.getElementById('heroFloat1Sub');
  if (float1SubEl) float1SubEl.textContent = sc.float1Sub;

  const float2ImgEl = document.getElementById('heroFloat2Img');
  if (float2ImgEl && sc.float2Img) float2ImgEl.src = sc.float2Img;

  const float2TitleEl = document.getElementById('heroFloat2Title');
  if (float2TitleEl) float2TitleEl.textContent = sc.float2Title;

  const float2SubEl = document.getElementById('heroFloat2Sub');
  if (float2SubEl) float2SubEl.textContent = sc.float2Sub;

  const mascotBubbleEl = document.getElementById('heroMascotBubble');
  if (mascotBubbleEl) mascotBubbleEl.textContent = sc.mascotBubble;
}

async function handleShowcaseImageUpload(event, slot = 'main') {
  const file = event.target?.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น (PNG, JPG, WebP, GIF)', 'error');
    return;
  }
  const maxW = slot === 'main' ? 900 : 320;
  const maxH = slot === 'main' ? 650 : 320;
  try {
    const compressed = await compressImageFile(file, maxW, maxH, 0.82);
    if (compressed) {
      showcaseUploadedImages[slot] = compressed;
      if (slot === 'main') {
        const prev = document.getElementById('editShowcaseMainPreview');
        const urlIn = document.getElementById('editShowcaseMainImg');
        if (prev) prev.src = compressed;
        if (urlIn) urlIn.value = '';
      } else if (slot === 'float1') {
        const prev = document.getElementById('editShowcaseFloat1Preview');
        const urlIn = document.getElementById('editShowcaseFloat1Img');
        if (prev) prev.src = compressed;
        if (urlIn) urlIn.value = '';
      } else if (slot === 'float2') {
        const prev = document.getElementById('editShowcaseFloat2Preview');
        const urlIn = document.getElementById('editShowcaseFloat2Img');
        if (prev) prev.src = compressed;
        if (urlIn) urlIn.value = '';
      }
      showToast('แนบรูปภาพตัวอย่างเรียบร้อยแล้ว (กดบันทึกด้านล่างเพื่อใช้งานจริง)', 'info');
    }
  } catch (err) {
    console.error('Upload showcase image error:', err);
    showToast('อ่านไฟล์รูปภาพไม่สำเร็จ', 'error');
  } finally {
    if (event.target) event.target.value = '';
  }
}

function previewShowcaseUrlInput(slot, val) {
  const trimmed = (val || '').trim();
  if (!trimmed) return;
  showcaseUploadedImages[slot] = '';
  if (slot === 'main') {
    const prev = document.getElementById('editShowcaseMainPreview');
    if (prev) prev.src = trimmed;
  } else if (slot === 'float1') {
    const prev = document.getElementById('editShowcaseFloat1Preview');
    if (prev) prev.src = trimmed;
  } else if (slot === 'float2') {
    const prev = document.getElementById('editShowcaseFloat2Preview');
    if (prev) prev.src = trimmed;
  }
}

async function handleHeroShowcaseSave(event) {
  event.preventDefault();
  if (!isAdmin()) return;

  const current = getEffectiveHeroShowcase();
  const mainUrl = (document.getElementById('editShowcaseMainImg')?.value || '').trim();
  const float1Url = (document.getElementById('editShowcaseFloat1Img')?.value || '').trim();
  const float2Url = (document.getElementById('editShowcaseFloat2Img')?.value || '').trim();

  const heroShowcase = {
    mainImg: showcaseUploadedImages.main || mainUrl || current.mainImg,
    priceStamp: (document.getElementById('editShowcasePriceStamp')?.value || '').trim() || DEFAULT_HERO_SHOWCASE.priceStamp,
    dishCat: (document.getElementById('editShowcaseDishCat')?.value || '').trim() || DEFAULT_HERO_SHOWCASE.dishCat,
    dishTitle: (document.getElementById('editShowcaseDishTitle')?.value || '').trim() || DEFAULT_HERO_SHOWCASE.dishTitle,
    dishMeta: (document.getElementById('editShowcaseDishMeta')?.value || '').trim() || DEFAULT_HERO_SHOWCASE.dishMeta,
    float1Img: showcaseUploadedImages.float1 || float1Url || current.float1Img,
    float1Title: (document.getElementById('editShowcaseFloat1Title')?.value || '').trim() || DEFAULT_HERO_SHOWCASE.float1Title,
    float1Sub: (document.getElementById('editShowcaseFloat1Sub')?.value || '').trim() || DEFAULT_HERO_SHOWCASE.float1Sub,
    float2Img: showcaseUploadedImages.float2 || float2Url || current.float2Img,
    float2Title: (document.getElementById('editShowcaseFloat2Title')?.value || '').trim() || DEFAULT_HERO_SHOWCASE.float2Title,
    float2Sub: (document.getElementById('editShowcaseFloat2Sub')?.value || '').trim() || DEFAULT_HERO_SHOWCASE.float2Sub,
    mascotBubble: (document.getElementById('editShowcaseMascotBubble')?.value || '').trim() || DEFAULT_HERO_SHOWCASE.mascotBubble,
    customized: true
  };

  try {
    if (window.FirestoreService?.isConfigured()) {
      await window.FirestoreService.updateSiteSettings({ heroShowcase });
    }
    AppState.siteSettings = {
      ...AppState.siteSettings,
      heroShowcase
    };
    applyHeroShowcase();
    populateAdminSiteTexts();
    SoundFX.playWin();
    showToast('บันทึกภาพและคำบรรยายโชว์เคสหน้าแรกเรียบร้อยแล้ว! 🖼️✨', 'success');
  } catch (err) {
    console.error('Save hero showcase error:', err);
    showToast('บันทึกโชว์เคสไม่สำเร็จ: ' + (err?.message || ''), 'error');
  }
}

async function resetHeroShowcaseToDefault() {
  if (!isAdmin()) return;
  if (!confirm('ต้องการคืนค่ารูปภาพและคำบรรยายโชว์เคสหน้าแรกกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) return;

  const heroShowcase = { ...DEFAULT_HERO_SHOWCASE, customized: false };
  showcaseUploadedImages = { main: '', float1: '', float2: '' };

  try {
    if (window.FirestoreService?.isConfigured()) {
      await window.FirestoreService.updateSiteSettings({ heroShowcase });
    }
    AppState.siteSettings = {
      ...AppState.siteSettings,
      heroShowcase
    };
    applyHeroShowcase();
    populateAdminSiteTexts();
    showToast('คืนค่าเริ่มต้นให้การ์ดโชว์เคสหน้าแรกเรียบร้อยแล้ว 🔄', 'info');
  } catch (err) {
    console.error('Reset hero showcase error:', err);
    showToast('คืนค่าไม่สำเร็จ: ' + (err?.message || ''), 'error');
  }
}

function populateAdminSiteTexts() {
  const settings = AppState.siteSettings || DEFAULT_SETTINGS;
  const tagline = document.getElementById('editTagline');
  const ticker = document.getElementById('editTicker');
  const banner = document.getElementById('editBannerText');

  if (tagline) tagline.value = settings.tagline || '';
  if (ticker) ticker.value = settings.announcementTicker || '';
  if (banner) banner.value = settings.festivalBannerText || '';

  // Populate Hero Showcase Customizer in News Tab
  const sc = getEffectiveHeroShowcase();
  showcaseUploadedImages = {
    main: sc.mainImg && sc.mainImg.startsWith('data:') ? sc.mainImg : '',
    float1: sc.float1Img && sc.float1Img.startsWith('data:') ? sc.float1Img : '',
    float2: sc.float2Img && sc.float2Img.startsWith('data:') ? sc.float2Img : ''
  };

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };
  const setSrc = (id, src) => {
    const el = document.getElementById(id);
    if (el && src) el.src = src;
  };

  setSrc('editShowcaseMainPreview', sc.mainImg);
  setVal('editShowcaseMainImg', sc.mainImg && !sc.mainImg.startsWith('data:') ? sc.mainImg : '');
  setVal('editShowcasePriceStamp', sc.priceStamp);
  setVal('editShowcaseDishCat', sc.dishCat);
  setVal('editShowcaseDishTitle', sc.dishTitle);
  setVal('editShowcaseDishMeta', sc.dishMeta);

  setSrc('editShowcaseFloat1Preview', sc.float1Img);
  setVal('editShowcaseFloat1Img', sc.float1Img && !sc.float1Img.startsWith('data:') ? sc.float1Img : '');
  setVal('editShowcaseFloat1Title', sc.float1Title);
  setVal('editShowcaseFloat1Sub', sc.float1Sub);

  setSrc('editShowcaseFloat2Preview', sc.float2Img);
  setVal('editShowcaseFloat2Img', sc.float2Img && !sc.float2Img.startsWith('data:') ? sc.float2Img : '');
  setVal('editShowcaseFloat2Title', sc.float2Title);
  setVal('editShowcaseFloat2Sub', sc.float2Sub);

  setVal('editShowcaseMascotBubble', sc.mascotBubble);
}

async function handleSiteTextSave(event) {
  event.preventDefault();
  if (!isAdmin()) return;

  const tagline = document.getElementById('editTagline').value.trim();
  const announcementTicker = document.getElementById('editTicker').value.trim();
  const festivalBannerText = document.getElementById('editBannerText').value.trim();

  try {
    if (window.FirestoreService?.isConfigured()) {
      await window.FirestoreService.updateSiteSettings({
        tagline,
        announcementTicker,
        festivalBannerText
      });
    }
    AppState.siteSettings = {
      ...AppState.siteSettings,
      tagline,
      announcementTicker,
      festivalBannerText
    };
    applySiteSettings();
    showToast('บันทึกข้อความหน้าเว็บไซต์ลง Cloud Firestore เรียบร้อยแล้ว!', 'success');
  } catch (err) {
    console.error('Save site texts error:', err);
    showToast('บันทึกข้อความหน้าเว็บไม่สำเร็จ: ' + (err?.message || ''), 'error');
  }
}

function applySiteSettings() {
  const settings = AppState.siteSettings || DEFAULT_SETTINGS;

  const tickerText = document.getElementById('tickerText');
  if (tickerText) tickerText.textContent = settings.announcementTicker || '';

  const heroDescText = document.getElementById('heroDescText');
  if (heroDescText && settings.tagline) heroDescText.textContent = settings.tagline;

  const heroFestivalBadge = document.getElementById('heroFestivalBadge');
  if (heroFestivalBadge && settings.festivalBannerText) {
    heroFestivalBadge.textContent = settings.festivalBannerText;
  }

  applyHeroShowcase();
}

// ============================================================================
// 15. Secret Admin Access Listeners (ซ่อนปุ่ม ไม่แสดงให้คนทั่วไปเห็น)
// ============================================================================

let secretLogoClicks = 0;
let secretLogoTimer = null;

function setupSecretAdminTriggers() {
  // 1. Keyboard Shortcut: Ctrl + Shift + A (or Cmd + Shift + A on Mac)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      SoundFX.playTick();
      if (isAdmin()) {
        openAdminModal();
      } else {
        openAdminAccessModal();
      }
    }
  });

  // 2. Secret Easter Egg: Click Logo 5 times quickly within 2.5 seconds
  const logo = document.querySelector('.brand-logo');
  if (logo) {
    logo.addEventListener('click', () => {
      secretLogoClicks++;
      clearTimeout(secretLogoTimer);
      secretLogoTimer = setTimeout(() => {
        secretLogoClicks = 0;
      }, 2500);

      if (secretLogoClicks >= 5) {
        secretLogoClicks = 0;
        SoundFX.playMatch();
        showToast('🔐 ช่องทางเข้าสู่ระบบผู้ดูแลระบบ (Secret Admin Portal)', 'info');
        if (isAdmin()) {
          openAdminModal();
        } else {
          openAdminAccessModal();
        }
      }
    });
  }

  // 3. URL Hash Trigger: opening with or navigating to #admin
  function checkAdminHash() {
    if (window.location.hash === '#admin') {
      if (isAdmin()) {
        openAdminModal();
      } else {
        openAdminAccessModal();
      }
    }
  }

  checkAdminHash();
  window.addEventListener('hashchange', checkAdminHash);
}

// ============================================================================
// 16. App Initialization & Real-Time Firestore Subscriptions
// ============================================================================

let firebaseSyncStarted = false;

function startFirebaseAppSync() {
  if (firebaseSyncStarted) return;
  if (!window.FIREBASE_BRIDGE_LOADED || !window.AuthService || !window.FirestoreService) return;

  firebaseSyncStarted = true;

  if (!window.FirestoreService.isConfigured()) {
    AppState.restaurants = mergeRestaurantsWithCurated([]);
    AppState.restaurantsLoaded = true;
    AppState.reviewsLoaded = true;
    AppState.newsLoaded = true;
    filterRestaurants();
    initWheel();
    if (typeof renderBudgetComboIdleState === 'function') renderBudgetComboIdleState();
    renderNewsGrid();
    renderLeaderboard();
    renderAdminStats();
    renderFirebaseStatusBox();
    console.warn('⚠️ Firebase config placeholders detected. Please update js/firebase-config.js.');
    return;
  }

  // 1. Track real visitor analytics in Firestore
  trackVisitorHit();

  // 2. Real-time Firebase Authentication & user profile state
  const unsubAuth = window.AuthService.onAuthChange((profile) => {
    setCurrentUser(profile);
    renderBadgesShowcase();
    maybeSeedCuratedRestaurantsToFirestore();
    if (document.getElementById('adminModal')?.classList.contains('active')) {
      renderAdminStats();
      renderAdminUsers();
    }
  });
  AppState.unsubscribers.push(unsubAuth);

  // 3. Real-time Restaurants listener
  const unsubRestaurants = window.FirestoreService.subscribeRestaurants(
    (list) => {
      AppState.firestoreRestaurants = list;
      AppState.restaurants = mergeRestaurantsWithCurated(list);
      AppState.restaurantsLoaded = true;
      filterRestaurants();
      initWheel();
      if (typeof renderBudgetComboIdleState === 'function') renderBudgetComboIdleState();
      renderAdminRestaurantsTable();
      renderAdminStats();
      maybeSeedCuratedRestaurantsToFirestore();
    },
    (err) => {
      console.warn('Firestore restaurants listener error:', err);
      AppState.restaurants = mergeRestaurantsWithCurated([]);
      AppState.restaurantsLoaded = true;
      filterRestaurants();
      initWheel();
    }
  );
  AppState.unsubscribers.push(unsubRestaurants);

  // 4. Real-time Reviews listener
  const unsubReviews = window.FirestoreService.subscribeReviews(
    (list) => {
      AppState.reviews = list;
      AppState.reviewsLoaded = true;
      filterRestaurants();
      renderLeaderboard();
      renderAdminReviews();
      renderAdminStats();
    },
    (err) => {
      console.warn('Firestore reviews listener error:', err);
      AppState.reviewsLoaded = true;
    }
  );
  AppState.unsubscribers.push(unsubReviews);

  // 5. Real-time News listener
  const unsubNews = window.FirestoreService.subscribeNews((list) => {
    AppState.news = list;
    AppState.newsLoaded = true;
    renderNewsGrid();
    renderAdminNews();
    renderAdminStats();
  });
  AppState.unsubscribers.push(unsubNews);

  // 6. Real-time Users & Leaderboard listener
  const unsubUsers = window.FirestoreService.subscribeUsers((list) => {
    AppState.users = list;
    renderLeaderboard();
    renderAdminUsers();
    renderAdminStats();
  });
  AppState.unsubscribers.push(unsubUsers);

  // 7. Real-time Site Settings & Festival Theme listener
  const unsubSettings = window.FirestoreService.subscribeSiteSettings((settings) => {
    if (settings) {
      AppState.siteSettings = { ...DEFAULT_SETTINGS, ...settings };
      applyTheme(AppState.siteSettings.activeTheme || 'spu-classic');
      applySiteSettings();
      populateAdminSiteTexts();
      renderAdminThemePicker();
      if (AppState.restaurantsLoaded) {
        AppState.restaurants = mergeRestaurantsWithCurated(AppState.firestoreRestaurants);
        filterRestaurants();
        initWheel();
        renderAdminRestaurantsTable();
        renderAdminStats();
      }
      maybeSeedCuratedRestaurantsToFirestore();
    }
  });
  AppState.unsubscribers.push(unsubSettings);

  // 8. Real-time Visitor Stats listener
  const unsubStats = window.FirestoreService.subscribeStats((stats) => {
    if (stats) {
      AppState.stats = stats;
      AppState.statsLoaded = true;
      updatePublicVisitorUI(stats);
      renderAdminStats();
    }
  });
  AppState.unsubscribers.push(unsubStats);
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Init Theme & Dark mode defaults
  applyTheme(AppState.siteSettings.activeTheme || 'spu-classic');
  initDarkMode();
  applySiteSettings();

  // 2. Populate Dropdowns & Initial UI states
  AppState.restaurants = mergeRestaurantsWithCurated([]);
  populateFilterDropdowns();
  filterRestaurants();
  renderNavUser();
  initGoogleSignIn();
  initWheel();
  if (typeof renderBudgetComboIdleState === 'function') renderBudgetComboIdleState();
  renderDailyCheckIn();
  scheduleMidnightCheckInRefresh();
  renderNewsGrid();
  renderLeaderboard();
  renderBadgesShowcase();
  updatePublicVisitorUI(AppState.stats);

  // 3. Setup Secret Admin Access Triggers
  setupSecretAdminTriggers();

  // 4. Connect to Firebase Bridge when loaded
  if (window.FIREBASE_BRIDGE_LOADED) {
    startFirebaseAppSync();
  } else {
    window.addEventListener('firebase-bridge-ready', startFirebaseAppSync, { once: true });
    if (window.location.protocol === 'file:') {
      setTimeout(() => {
        if (!window.FIREBASE_BRIDGE_LOADED) {
          showToast('⚠️ เปิดไฟล์ผ่าน file:/// ไม่สามารถโหลด Firebase ES Module ได้ กรุณาเปิดผ่าน start-server.bat (localhost:3000) หรือ GitHub Pages', 'warning');
        }
      }, 1500);
    }
  }

  console.log("จานเด็ด SPU พร้อมเชื่อมต่อ Cloud Firestore & Firebase Auth 🚀");
});
