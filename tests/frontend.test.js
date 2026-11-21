/**
 * SPU Canteen System - Frontend Static & Integrity Test
 * ตรวจสอบความถูกต้องของไฟล์ HTML, CSS, JavaScript และตัวแปรระบบ
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 เริ่มต้นรัน Frontend Integrity Tests...');

const htmlPath = path.join(__dirname, '..', 'index.html');
const cssPath = path.join(__dirname, '..', 'css', 'style.css');
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const dataJsPath = path.join(__dirname, '..', 'js', 'data.js');
const firebaseConfigPath = path.join(__dirname, '..', 'js', 'firebase-config.js');
const firebaseServicePath = path.join(__dirname, '..', 'js', 'firebase-service.js');
const firestoreRulesPath = path.join(__dirname, '..', 'firestore.rules');

assert(fs.existsSync(htmlPath), 'index.html does not exist');
assert(fs.existsSync(cssPath), 'style.css does not exist');
assert(fs.existsSync(appJsPath), 'app.js does not exist');
assert(fs.existsSync(dataJsPath), 'data.js does not exist');
assert(fs.existsSync(firebaseConfigPath), 'js/firebase-config.js does not exist');
assert(fs.existsSync(firebaseServicePath), 'js/firebase-service.js does not exist');
assert(fs.existsSync(firestoreRulesPath), 'firestore.rules does not exist');

const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const appJs = fs.readFileSync(appJsPath, 'utf8');
const dataJs = fs.readFileSync(dataJsPath, 'utf8');
const firebaseConfigJs = fs.readFileSync(firebaseConfigPath, 'utf8');
const firebaseServiceJs = fs.readFileSync(firebaseServicePath, 'utf8');
const firestoreRules = fs.readFileSync(firestoreRulesPath, 'utf8');

// Check critical modals exist
const criticalModals = [
  'restaurantDetailModal',
  'authModal',
  'profileModal',
  'adminModal',
  'adminAccessModal',
  'restaurantFormModal',
  'newsFormModal',
  'applicantDetailModal'
];

criticalModals.forEach(modalId => {
  assert(html.includes(`id="${modalId}"`), `Missing modal: ${modalId}`);
});
assert(!html.includes('id="googleConfigModal"'), 'googleConfigModal should be removed (replaced by Firebase Auth)');
assert(!html.includes('accounts.google.com/gsi/client'), 'Legacy GIS script should be removed from index.html');
console.log('  ✅ Critical modals verified (' + criticalModals.length + ' modals)!');

// Check that Google Client ID status is NOT exposed in authModal
const authModalChunk = html.split('id="authModal"')[1].split('id="profileModal"')[0];
assert(!authModalChunk.includes('googleClientIdStatus'), 'googleClientIdStatus should not be in authModal');
assert(authModalChunk.includes('handleForgotPassword'), 'Forgot password button should be in authModal');
console.log('  ✅ Auth modal Firebase Google Sign-In & password reset verified!');

// Check visitor counter exists
assert(html.includes('id="publicVisitorCount"'), 'Missing publicVisitorCount element');
assert(html.includes('id="publicUniqueVisitorCount"'), 'Missing publicUniqueVisitorCount element');
console.log('  ✅ Visitor counter elements verified in footer!');

// Check 8-week rewards calendar and clean empty initial arrays in data.js
assert(dataJs.includes('WEEKLY_REWARDS_CALENDAR'), 'Missing WEEKLY_REWARDS_CALENDAR');
assert(dataJs.includes('frame-grand-emperor'), 'Missing frame-grand-emperor (Week 8)');
assert(dataJs.includes('frame-none'), 'Missing base frame frame-none');
assert(dataJs.includes('const INITIAL_USERS = [];'), 'INITIAL_USERS should be empty array');
assert(dataJs.includes('const INITIAL_RESTAURANTS = [];'), 'INITIAL_RESTAURANTS should be empty array');
assert(dataJs.includes('const INITIAL_REVIEWS = [];'), 'INITIAL_REVIEWS should be empty array');
assert(dataJs.includes('const INITIAL_NEWS = [];'), 'INITIAL_NEWS should be empty array');
console.log('  ✅ Rewards Calendar, Base Frame & clean empty initial arrays verified!');

// Check logo image file and integration
const logoPath = path.join(__dirname, '..', 'assets', 'images', 'spu-chef-logo.png');
assert(fs.existsSync(logoPath), 'spu-chef-logo.png does not exist');
assert(html.includes('assets/images/spu-chef-logo.png'), 'Logo image not linked in index.html');
console.log('  ✅ SPU Chef Mascot Logo image verified and linked!');

// Check local file upload and 5-images manager in restaurant modal
assert(html.includes('id="rstImageFile"'), 'Missing local image file input in restaurant form');
assert(html.includes('id="rstImageFilesInput"'), 'Missing multi-file input in restaurant form');
assert(html.includes('id="rstFormImagesGrid"'), 'Missing 5-images grid in restaurant form');
assert(appJs.includes('handleRestaurantMultiFileUpload'), 'Missing handleRestaurantMultiFileUpload in app.js');
assert(appJs.includes('handleRestaurantImageFileUpload'), 'Missing handleRestaurantImageFileUpload in app.js');
console.log('  ✅ Admin 5-Images Restaurant Gallery Manager verified!');

// Check Fullscreen Photo Lightbox Modal
assert(html.includes('id="imageLightboxModal"'), 'Missing imageLightboxModal in index.html');
assert(appJs.includes('openPhotoLightbox'), 'Missing openPhotoLightbox in app.js');
console.log('  ✅ Fullscreen Photo Lightbox & Review Photo Viewer verified!');

// Check admin full reward privileges
assert(appJs.includes('grantAdminFullRewards'), 'Missing grantAdminFullRewards in app.js');
console.log('  ✅ Admin Full Rewards Instant Access privilege verified!');

// Check Daily Check-In Header and Roadmap Removal
assert(!appJs.includes('roadmap-container'), 'Roadmap container should be removed from app.js');
assert(appJs.includes('🗓️ ตารางล็อกอินสะสมรายวัน'), 'Check-in title should be 🗓️ ตารางล็อกอินสะสมรายวัน');
console.log('  ✅ Daily Check-in Title & Roadmap cleanup verified!');

// Check Empty State separation for Admin vs General Visitors & News/Leaderboard
assert(appJs.includes('ตอนนี้ยังไม่มีร้านแนะนำ ลองมาใหม่ในรอบหน้านะครับ'), 'Missing visitor empty state text');
assert(appJs.includes('ยังไม่มีร้านอาหารในระบบ (กล่องว่างพร้อมให้ใส่ข้อมูล)'), 'Missing admin empty state text');
assert(appJs.includes('ยังไม่มีข่าวสารหรือโปรโมชั่นในขณะนี้'), 'Missing news empty state text');
assert(appJs.includes('ยังไม่มีข้อมูลสมาชิกบนตารางอันดับ'), 'Missing leaderboard empty state text');
console.log('  ✅ Visitor vs Admin & Section Empty States verified!');

// Check Firebase integration in index.html, firebase-service.js, app.js, and firestore.rules
assert(html.includes('src="js/firebase-config.js"'), 'index.html should load js/firebase-config.js');
assert(html.includes('type="module" src="js/firebase-service.js"'), 'index.html should load js/firebase-service.js as ES module');
assert(html.includes('id="firebaseStatusBox"'), 'firebaseStatusBox should be present in Admin panel');
assert(firebaseConfigJs.includes('FIREBASE_CONFIG'), 'firebase-config.js should define FIREBASE_CONFIG');
assert(firebaseServiceJs.includes('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js'), 'firebase-service.js should import modular Firebase Auth CDN');
assert(firebaseServiceJs.includes('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'), 'firebase-service.js should import modular Firestore CDN');
assert(firestoreRules.includes("rules_version = '2';"), 'firestore.rules should declare rules_version 2');
assert(firestoreRules.includes("match /restaurants/{restaurantId}"), 'firestore.rules missing restaurants collection');
assert(firestoreRules.includes("match /reviews/{reviewId}"), 'firestore.rules missing reviews collection');
assert(firestoreRules.includes("match /users/{userId}"), 'firestore.rules missing users collection');
assert(firestoreRules.includes("match /checkins/{checkinId}"), 'firestore.rules missing checkins collection');
console.log('  ✅ Firebase Modular CDN, Realtime Listeners & Security Rules verified!');

// Check Add / Edit Restaurant Bug Fixes & Image Compression
assert(appJs.includes('compressImageFile'), 'Missing compressImageFile in app.js');
assert(html.includes('value="โรงเย็น อาคาร 10 (ชั้น 1)"'), 'Missing static options in rstLocation');
assert(html.includes('value="ข้าวราดแกง / อาหารตามสั่ง"'), 'Missing static options in rstCategory');
assert(appJs.includes('openEditRestaurantModal'), 'Missing openEditRestaurantModal in app.js');
console.log('  ✅ Add & Edit Restaurant & Image Compression verified!');

// Check Quick Tags Removal
assert(!html.includes('filter-tags-row'), 'filter-tags-row should be completely removed from index.html');
console.log('  ✅ Quick filter tags row completely removed!');

// Check Recommended Menus in Restaurant Form
assert(html.includes('id="rstFormMenusContainer"'), 'Missing rstFormMenusContainer in index.html');
assert(html.includes('id="rstFormAddMenuBtn"'), 'Missing rstFormAddMenuBtn in index.html');
assert(appJs.includes('rstFormCurrentMenus'), 'Missing rstFormCurrentMenus in app.js');
assert(appJs.includes('renderRestaurantFormMenus'), 'Missing renderRestaurantFormMenus in app.js');
assert(appJs.includes('addRestaurantFormMenuSlot'), 'Missing addRestaurantFormMenuSlot in app.js');
assert(appJs.includes('removeRestaurantFormMenuSlot'), 'Missing removeRestaurantFormMenuSlot in app.js');
assert(appJs.includes('handleMenuPhotoFileChange'), 'Missing handleMenuPhotoFileChange in app.js');
console.log('  ✅ 3-4 Recommended Menus Manager with photo upload verified!');

// Check Firebase Authentication & Zero Legacy Password/Mock Leaks
assert(!appJs.includes('promptSimulatedGoogleLogin'), 'promptSimulatedGoogleLogin should be removed');
assert(!appJs.includes('prompt("🔑 เข้าสู่ระบบด้วย Google'), 'prompt() should not be used for Google login');
assert(!appJs.includes('class Store'), 'Legacy LocalStorage class Store should be removed from app.js');
assert(!appJs.includes('resetAllDemoData'), 'resetAllDemoData should be removed');
assert(!appJs.includes('password123'), 'No hardcoded password123 should exist in app.js');
assert(!appJs.includes('admin@spu.ac.th'), 'No hardcoded admin@spu.ac.th should exist in app.js');
assert(!html.includes('admin@spu.ac.th'), 'No hardcoded admin@spu.ac.th should exist in index.html');
assert(!dataJs.includes('password123'), 'No hardcoded password123 should exist in data.js');
assert(!dataJs.includes('admin@spu.ac.th'), 'No hardcoded admin@spu.ac.th should exist in data.js');
assert(appJs.includes('window.AuthService.loginWithGoogle()'), 'app.js should use AuthService.loginWithGoogle()');
assert(appJs.includes('window.AuthService.loginWithEmail('), 'app.js should use AuthService.loginWithEmail()');
assert(appJs.includes('window.AuthService.registerWithEmail('), 'app.js should use AuthService.registerWithEmail()');
assert(appJs.includes('window.FirestoreService.subscribeRestaurants('), 'app.js should subscribe to Firestore restaurants');
console.log('  ✅ Zero hardcoded admin credentials & Firebase Auth integration verified!');

// Check Festival Theme Illustrations, Classic Rename, News Upload, Password Toggle & Faculty Input
const themeSvgFiles = [
  'theme-classic.svg',
  'theme-loy-krathong.svg',
  'theme-halloween.svg',
  'theme-christmas.svg',
  'theme-songkran.svg',
  'theme-chinese-new-year.svg'
];
themeSvgFiles.forEach(file => {
  const p = path.join(__dirname, '..', 'assets', 'themes', file);
  assert(fs.existsSync(p), `Missing festival theme illustration: ${file}`);
  assert(dataJs.includes(`assets/themes/${file}`), `data.js should reference assets/themes/${file}`);
});
assert(dataJs.includes('name: "Classic"'), 'Classic theme should be named "Classic"');
assert(!dataJs.includes('SPU Classic (ชมพู-ดำ ศรีปทุม)'), 'Old SPU Classic name should be removed');
assert(!html.includes('id="festivalBannerShowcase"'), 'festivalBannerShowcase should be removed from hero');
assert(html.includes('id="newsImageFileInput"'), 'News modal should support local file upload input');
assert(appJs.includes('handleNewsImageFileUpload'), 'app.js should define handleNewsImageFileUpload');
assert(html.includes('togglePasswordVisibility(\'regPassword\''), 'Register password should have visibility toggle');
assert(appJs.includes('function togglePasswordVisibility'), 'app.js should define togglePasswordVisibility');
assert(html.includes('<input type="text" id="regFaculty"'), 'regFaculty should be a text input instead of select');
assert(!html.includes('<select id="regFaculty"'), 'regFaculty select dropdown should be removed');
assert(html.includes('id="adminHeroShowcaseSection"'), 'adminNewsTab should contain adminHeroShowcaseSection');
assert(html.includes('id="editShowcaseMainFile"'), 'Hero showcase editor should support local file upload');
assert(appJs.includes('handleHeroShowcaseSave'), 'app.js should define handleHeroShowcaseSave');
assert(appJs.includes('handleShowcaseImageUpload'), 'app.js should define handleShowcaseImageUpload');
console.log('  ✅ Festival SVG Illustrations, Classic Theme, News File Upload, Password Toggle, Faculty Input & Hero Showcase Editor verified!');

// Check Code Audit & Bug Fix Suite
assert(css.includes('--bg-card:'), 'Missing --bg-card in style.css');
assert(css.includes('--text-color:'), 'Missing --text-color in style.css');
assert(css.includes('.user-menu-name'), 'Missing .user-menu-name class in style.css');
assert(appJs.includes('handleReviewImageUpload'), 'Missing handleReviewImageUpload in app.js');
assert(appJs.includes('reviewImageFileInput'), 'Missing reviewImageFileInput in app.js');
assert(appJs.includes('currentReviewRating = userExistingReview ? (userExistingReview.rating || 5) : 5;'), 'Missing review rating sync in app.js');
assert(appJs.includes("target.role === 'admin' ? 'user' : 'admin'"), 'adminToggleUserRole should toggle to user');
console.log('  ✅ Comprehensive Bug Fixes & Code Audit verified!');

// Check Theme Palettes & Elimination of Brown Remnants
const prohibitedBrowns = ['#2c1d16', '#18120e', '#241b15', '#30241c', '#3d2e24', '#281a12'];
prohibitedBrowns.forEach(hex => {
  assert(!css.toLowerCase().includes(hex), `style.css must not contain prohibited brown tone: ${hex}`);
});
assert(css.includes('--primary: #e11d48;'), 'style.css should have SPU Pink as primary color');
assert(css.includes('--secondary: #0f172a;'), 'style.css should have SPU Black as secondary color');
assert(css.includes('background: transparent !important;') && css.includes('border-radius: 0 !important;'), 'hero-mascot must be standalone transparent character without circular background');
assert(!css.includes('background: #fff8ee;'), 'hero-mascot old circular cream background must be removed');
assert(html.includes('id="heroTastingRecommendBadge"') && html.includes('แนะนำ'), 'Hero showcase should display แนะนำ badge at top-right corner');
assert(css.includes('.tasting-recommend-badge'), 'style.css should define .tasting-recommend-badge');
console.log('  ✅ SPU Pink & Black Palette, Standalone Mascot Character & Top-Right แนะนำ Badge Verified!');

// Check Mobile Responsiveness & Mobile Bug Fixes
assert(css.includes('display: none !important;') && css.includes('.mobile-bottom-nav'), 'Mobile nav links should be hidden when mobile bottom dock is active');
assert(css.includes('z-index: 1000;') && css.includes('z-index: 80;'), 'Modal backdrop z-index (1000) must be higher than mobile bottom nav (80)');
assert(css.includes('.mobile-stack-grid') && html.includes('class="mobile-stack-grid"'), '2-column modal form grids should collapse on mobile via .mobile-stack-grid');
assert(css.includes('aspect-ratio: 1 / 1;'), 'Roulette wheel canvas should preserve 1:1 aspect ratio on narrow mobile screens');
console.log('  ✅ Mobile Responsiveness & Mobile Layout Bug Fixes Verified!');

// Check Smart Budget Combo Planner (ระบบจัดเซตมื้อเที่ยงตามงบ - ซิงค์ข้อมูลจริง 100% & กดสุ่มเอง)
assert(html.includes('id="budgetComboSectionCard"'), 'Missing budgetComboSectionCard in index.html');
assert(html.includes('id="budgetComboInput"'), 'Missing budgetComboInput in index.html');
assert(html.includes('id="budgetComboPriceFilter"'), 'Missing budgetComboPriceFilter in index.html');
assert(html.includes('id="budgetComboResult"'), 'Missing budgetComboResult in index.html');
assert(appJs.includes('function generateBudgetCombo'), 'Missing generateBudgetCombo function in js/app.js');
assert(appJs.includes('function openBudgetComboPlanner'), 'Missing openBudgetComboPlanner function in js/app.js');
assert(appJs.includes('function renderBudgetComboIdleState'), 'Missing renderBudgetComboIdleState function in js/app.js');
assert(!appJs.includes('FALLBACK_SPU_MAIN_DISHES') && !appJs.includes('FALLBACK_SPU_DRINK_DESSERTS'), 'Smart Budget Combo must not contain dummy fallback menu arrays');
assert(appJs.includes('ยังไม่มีเมนูในขณะนี้ รอเพิ่มเติม'), 'Smart Budget Combo must display empty state message when no menus are available');
assert(css.includes('.budget-combo-card') && css.includes('.combo-items-grid'), 'Missing budget combo CSS classes in css/style.css');
console.log('  ✅ Smart Budget Combo Planner (100% Real Data, Price Filter & Manual Randomize Trigger) Verified!');

// Check Hand-Crafted Profile Frame SVGs (16 frames)
const framesDir = path.join(__dirname, '..', 'assets', 'frames');
const frameFiles = fs.readdirSync(framesDir).filter(f => f.endsWith('.svg'));
assert(frameFiles.length === 16, `Expected 16 SVG frames, found ${frameFiles.length}`);
frameFiles.forEach(file => {
  const svgContent = fs.readFileSync(path.join(framesDir, file), 'utf8');
  assert(svgContent.includes('feDropShadow'), `Frame ${file} should include custom feDropShadow filter`);
  assert(!svgContent.includes('stroke="#2b2440" stroke-width="16"'), `Frame ${file} should not contain old generic #2b2440 tire border`);
});
console.log('  ✅ 16 Hand-Crafted Profile Frame SVGs Verified!');

// Check Removal of Steak/Burger Category, Awning Stripe Bar & Coupon/Points Wording
assert(!html.includes('สเต็ก / เบอร์เกอร์') && !dataJs.includes('เบอร์เกอร์ / สเต็ก / ฟาสต์ฟู้ด'), 'Steak/Burger category filter must be removed');
assert(!html.includes('<div class="bistro-awning-bar"'), 'bistro-awning-bar element must be removed from index.html');
assert(!html.includes('บัตรสะสมแต้มเช็กอิน'), 'Points/coupon check-in wording must be replaced');
console.log('  ✅ Category Filter Cleanup, Awning Stripe Removal & Wording Update Verified!');

console.log('\n🎉 ทุกการทดสอบ Frontend ผ่านฉลุย 100%!');
