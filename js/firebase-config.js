// ============================================================================
// Firebase Configuration for จานเด็ด SPU (jandet-spu)
// ============================================================================
// นำค่า firebaseConfig ที่ได้จาก Firebase Console (Project Settings > General > Your apps)
// มาวางแทนที่ค่าด้านล่างนี้ได้เลยครับ

const firebaseConfig = {
  apiKey: "AIzaSyCUXmhgnPH90IdoU4PMU2czyXMbSUaGJzw",
  authDomain: "jandetspu.firebaseapp.com",
  projectId: "jandetspu",
  storageBucket: "jandetspu.firebasestorage.app",
  messagingSenderId: "1017763697877",
  appId: "1:1017763697877:web:f5b0ec7dd781e70340fe5c",
  measurementId: "G-29Y6DFYV3B"
};

// ตรวจสอบความถูกต้องว่าใส่ Config จริงแล้วหรือไม่
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "REPLACE_WITH_YOUR_API_KEY" &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "REPLACE_WITH_YOUR_PROJECT_ID"
);

window.FIREBASE_CONFIG = firebaseConfig;
window.IS_FIREBASE_CONFIGURED = isFirebaseConfigured;
