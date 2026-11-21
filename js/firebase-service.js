/**
 * จานเด็ด SPU (jandet-spu) - Firebase Modular SDK Service (CDN v10)
 * ทำงานแบบ Real-time ผ่าน Cloud Firestore & Firebase Authentication
 * รองรับ GitHub Pages และ Localhost โดยไม่ต้องใช้ Build Tool
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const config = window.FIREBASE_CONFIG || {};
let app = null;
let auth = null;
let db = null;
let isInitialized = false;

if (window.IS_FIREBASE_CONFIGURED) {
  try {
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    isInitialized = true;
    console.log("🔥 Firebase Modular SDK initialized successfully for project:", config.projectId);
  } catch (err) {
    console.error("🔥 Firebase initialization failed:", err);
  }
} else {
  console.warn("⚠️ Firebase Config ยังเป็นค่าเริ่มต้น กรุณาใส่ firebaseConfig ในไฟล์ js/firebase-config.js");
}

function generateAutoMemberId(seedStr = "") {
  const clean = String(seedStr || Date.now());
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) - hash + clean.charCodeAt(i)) | 0;
  }
  const num = (Math.abs(hash) % 900000) + 100000;
  return `SPU-${num}`;
}

function buildDefaultUserProfile(firebaseUser, extra = {}) {
  const email = (extra.email || firebaseUser.email || "").trim().toLowerCase();
  const isSpuEmail = email.endsWith("@spu.ac.th") || email.endsWith("@spumail.net");
  const nowDisplay = new Date().toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
  const rawStudentId = (extra.studentId || "").trim();
  const finalStudentId = (rawStudentId && rawStudentId !== "-")
    ? rawStudentId
    : generateAutoMemberId(firebaseUser.uid || email);

  return {
    uid: firebaseUser.uid,
    name: (extra.name || firebaseUser.displayName || email.split("@")[0] || "สมาชิกจานเด็ด SPU").trim(),
    studentId: finalStudentId,
    phone: (extra.phone || "-").trim(),
    email: email,
    userType: extra.userType || (isSpuEmail ? "นักศึกษา" : "บุคคลทั่วไป"),
    status: "อนุมัติแล้ว",
    faculty: extra.faculty || (isSpuEmail ? "คณะเทคโนโลยีสารสนเทศ" : "อื่นๆ / บุคลากรภายนอก"),
    role: "user", // สิทธิ์เริ่มต้นเป็น user เสมอ (ป้องกัน Privilege Escalation)
    streak: 0,
    lastCheckInDate: null,
    weeklyCheckInWeekKey: null,
    weeklyCheckInDates: [],
    customTitle: "นักชิมมือใหม่",
    unlockedTitles: ["นักชิมมือใหม่"],
    equippedFrame: "frame-none",
    unlockedFrames: ["frame-none"],
    badges: ["newbie"],
    favorites: [],
    avatar: extra.avatar || firebaseUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAtDisplay: nowDisplay,
    createdAt: serverTimestamp()
  };
}

// ============================================================================
// Firebase Authentication Service (ห้ามเก็บรหัสผ่านไว้ใน Firestore เด็ดขาด)
// ============================================================================
export const AuthService = {
  isConfigured: () => isInitialized,

  onAuthChange: (callback) => {
    if (!isInitialized) {
      callback(null);
      return () => {};
    }

    let unsubscribeUserDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

      if (!firebaseUser) {
        callback(null);
        return;
      }

      const userRef = doc(db, "users", firebaseUser.uid);
      try {
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          // กรณีบัญชีถูกสร้างจาก Console หรือพึ่งล็อกอินครั้งแรก ให้สร้างโปรไฟล์เริ่มต้น role = 'user'
          const initialProfile = buildDefaultUserProfile(firebaseUser);
          await setDoc(userRef, initialProfile);
        }

        // Subscribe โปรไฟล์ผู้ใช้แบบ Real-time
        unsubscribeUserDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            callback({
              id: docSnap.id,
              uid: docSnap.id,
              ...data,
              checkInStreak: data.streak ?? data.checkInStreak ?? 0
            });
          } else {
            callback(null);
          }
        }, (err) => {
          console.error("Error subscribing user profile:", err);
        });
      } catch (err) {
        console.error("Error loading authenticated user profile:", err);
        callback(null);
      }
    });

    return () => {
      if (unsubscribeUserDoc) unsubscribeUserDoc();
      unsubscribeAuth();
    };
  },

  registerWithEmail: async ({ email, password, name, studentId, faculty, phone, userType }) => {
    if (!isInitialized) throw new Error("ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js");

    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const firebaseUser = credential.user;

    const profile = buildDefaultUserProfile(firebaseUser, {
      email,
      name,
      studentId,
      faculty,
      phone,
      userType
    });

    await setDoc(doc(db, "users", firebaseUser.uid), profile);
    return { id: firebaseUser.uid, ...profile, checkInStreak: 0 };
  },

  loginWithEmail: async (email, password) => {
    if (!isInitialized) throw new Error("ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js");

    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const firebaseUser = credential.user;
    const userRef = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        id: snap.id,
        uid: snap.id,
        ...data,
        checkInStreak: data.streak ?? data.checkInStreak ?? 0
      };
    }

    const fallbackProfile = buildDefaultUserProfile(firebaseUser);
    await setDoc(userRef, fallbackProfile);
    return { id: firebaseUser.uid, ...fallbackProfile, checkInStreak: 0 };
  },

  loginWithGoogle: async () => {
    if (!isInitialized) throw new Error("ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js");

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    const userRef = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      const newProfile = buildDefaultUserProfile(firebaseUser, {
        name: firebaseUser.displayName,
        avatar: firebaseUser.photoURL
      });
      await setDoc(userRef, newProfile);
      return { id: firebaseUser.uid, ...newProfile, checkInStreak: 0 };
    }

    const data = snap.data();
    return {
      id: snap.id,
      uid: snap.id,
      ...data,
      checkInStreak: data.streak ?? data.checkInStreak ?? 0
    };
  },

  logout: async () => {
    if (!isInitialized) return;
    await signOut(auth);
  },

  sendPasswordReset: async (email) => {
    if (!isInitialized) throw new Error("ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js");
    await sendPasswordResetEmail(auth, email.trim());
  },

  updateOwnProfile: async (uid, data) => {
    if (!isInitialized) throw new Error("ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js");
    const safeData = { ...data };
    // ป้องกันการเขียนทับฟิลด์ต้องห้ามจากฝั่ง client
    delete safeData.role;
    delete safeData.uid;
    delete safeData.email;
    delete safeData.password;
    delete safeData.id;

    await updateDoc(doc(db, "users", uid), safeData);
  }
};

// ============================================================================
// Cloud Firestore Data Service (Real-time Subscriptions & CRUD)
// ============================================================================
export const FirestoreService = {
  isConfigured: () => isInitialized,

  // 1. Restaurants
  subscribeRestaurants: (callback, onError) => {
    if (!isInitialized) {
      callback([]);
      return () => {};
    }
    return onSnapshot(collection(db, "restaurants"), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => {
        const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return tb - ta;
      });
      callback(list);
    }, (err) => {
      console.error("Firestore restaurants subscription error:", err);
      if (onError) onError(err);
    });
  },

  addRestaurant: async (data) => {
    if (!isInitialized) throw new Error("ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js");
    const payload = {
      ...data,
      rating: 0,
      reviewCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, "restaurants"), payload);
    return docRef.id;
  },

  updateRestaurant: async (id, data) => {
    if (!isInitialized) throw new Error("ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js");
    const payload = { ...data, updatedAt: serverTimestamp() };
    delete payload.id;
    await setDoc(doc(db, "restaurants", id), payload, { merge: true });
  },

  upsertRestaurant: async (id, data) => {
    if (!isInitialized) throw new Error("ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js");
    const payload = {
      rating: 0,
      reviewCount: 0,
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    delete payload.id;
    await setDoc(doc(db, "restaurants", id), payload, { merge: true });
    return id;
  },

  deleteRestaurant: async (id) => {
    if (!isInitialized) throw new Error("ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js");
    await deleteDoc(doc(db, "restaurants", id));
  },

  // 2. Reviews (Doc ID: restaurantId_userId -> 1 รีวิวต่อร้านต่อผู้ใช้)
  subscribeReviews: (callback, onError) => {
    if (!isInitialized) {
      callback([]);
      return () => {};
    }
    return onSnapshot(collection(db, "reviews"), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => {
        const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return tb - ta;
      });
      callback(list);
    }, (err) => {
      console.error("Firestore reviews subscription error:", err);
      if (onError) onError(err);
    });
  },

  saveReview: async ({ restaurantId, userId, userName, userAvatar, userFrame, userTitle, rating, comment, image }) => {
    if (!isInitialized) throw new Error("ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js");
    const reviewDocId = `${restaurantId}_${userId}`;
    const reviewRef = doc(db, "reviews", reviewDocId);
    const existingSnap = await getDoc(reviewRef);
    const nowDisplay = new Date().toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" });

    if (existingSnap.exists()) {
      await updateDoc(reviewRef, {
        userName,
        userAvatar: userAvatar || "",
        userFrame: userFrame || "frame-none",
        userTitle: userTitle || "นักชิมมือใหม่",
        rating: Number(rating) || 5,
        comment: (comment || "").trim(),
        image: image || null,
        date: nowDisplay + " (แก้ไขแล้ว)",
        updatedAt: serverTimestamp()
      });
      return { updated: true, id: reviewDocId };
    } else {
      await setDoc(reviewRef, {
        id: reviewDocId,
        restaurantId,
        userId,
        userName,
        userAvatar: userAvatar || "",
        userFrame: userFrame || "frame-none",
        userTitle: userTitle || "นักชิมมือใหม่",
        rating: Number(rating) || 5,
        comment: (comment || "").trim(),
        image: image || null,
        date: nowDisplay,
        helpfulCount: 0,
        helpfulBy: [],
        reported: false,
        createdAt: serverTimestamp()
      });
      return { updated: false, id: reviewDocId };
    }
  },

  toggleHelpfulReview: async (reviewId, uid, currentHelpfulBy = []) => {
    if (!isInitialized) throw new Error("ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js");
    const alreadyVoted = currentHelpfulBy.includes(uid);
    const nextHelpfulBy = alreadyVoted
      ? currentHelpfulBy.filter(id => id !== uid)
      : [...currentHelpfulBy, uid];

    await updateDoc(doc(db, "reviews", reviewId), {
      helpfulBy: nextHelpfulBy,
      helpfulCount: nextHelpfulBy.length
    });
    return { voted: !alreadyVoted, count: nextHelpfulBy.length };
  },

  reportReview: async (reviewId) => {
    if (!isInitialized) throw new Error("ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js");
    await updateDoc(doc(db, "reviews", reviewId), {
      reported: true
    });
  },

  adminDismissReport: async (reviewId) => {
    if (!isInitialized) throw new Error("ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js");
    await updateDoc(doc(db, "reviews", reviewId), {
      reported: false
    });
  },

  deleteReview: async (reviewId) => {
    if (!isInitialized) throw new Error("ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js");
    await deleteDoc(doc(db, "reviews", reviewId));
  },

  // 3. Daily Check-in & Streak (checkins + users)
  hasCheckedInToday: async (uid, dateStr) => {
    if (!isInitialized) return false;
    const checkinRef = doc(db, "checkins", `${uid}_${dateStr}`);
    const snap = await getDoc(checkinRef);
    return snap.exists();
  },

  recordDailyCheckin: async ({ uid, dateStr, checkinPayload, userUpdatePayload }) => {
    if (!isInitialized) throw new Error("ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js");
    const checkinDocId = `${uid}_${dateStr}`;
    const checkinRef = doc(db, "checkins", checkinDocId);

    // 1. สร้างบันทึกเช็กอินใน collection 'checkins'
    await setDoc(checkinRef, {
      ...checkinPayload,
      userId: uid,
      date: dateStr,
      timestamp: serverTimestamp()
    });

    // 2. อัปเดต streak และรางวัลใน collection 'users'
    const safeUserUpdate = { ...userUpdatePayload };
    if (safeUserUpdate.checkInStreak !== undefined && safeUserUpdate.streak === undefined) {
      safeUserUpdate.streak = safeUserUpdate.checkInStreak;
    }
    delete safeUserUpdate.role;
    delete safeUserUpdate.uid;
    delete safeUserUpdate.password;

    await updateDoc(doc(db, "users", uid), safeUserUpdate);
  },

  // 4. News
  subscribeNews: (callback) => {
    if (!isInitialized) {
      callback([]);
      return () => {};
    }
    return onSnapshot(collection(db, "news"), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => {
        const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return tb - ta;
      });
      callback(list);
    }, (err) => {
      console.error("Firestore news subscription error:", err);
      callback([]);
    });
  },

  addNews: async (data) => {
    if (!isInitialized) throw new Error("ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js");
    await addDoc(collection(db, "news"), {
      ...data,
      active: true,
      createdAt: serverTimestamp()
    });
  },

  deleteNews: async (id) => {
    if (!isInitialized) throw new Error("ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js");
    await deleteDoc(doc(db, "news", id));
  },

  // 5. Users (สำหรับ Leaderboard และแผงควบคุมแอดมิน)
  subscribeUsers: (callback) => {
    if (!isInitialized) {
      callback([]);
      return () => {};
    }
    return onSnapshot(collection(db, "users"), (snapshot) => {
      const list = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          uid: d.id,
          ...data,
          checkInStreak: data.streak ?? data.checkInStreak ?? 0
        };
      });
      callback(list);
    }, (err) => {
      console.error("Firestore users subscription error:", err);
      callback([]);
    });
  },

  adminUpdateUser: async (uid, data) => {
    if (!isInitialized) throw new Error("ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js");
    const payload = { ...data };
    delete payload.password;
    await updateDoc(doc(db, "users", uid), payload);
  },

  adminDeleteUserDoc: async (uid) => {
    if (!isInitialized) throw new Error("ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js");
    await deleteDoc(doc(db, "users", uid));
  },

  // 6. Site Settings (ธีมเทศกาล, ข้อความเว็บ)
  subscribeSiteSettings: (callback) => {
    if (!isInitialized) return () => {};
    return onSnapshot(doc(db, "siteSettings", "config"), (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      }
    }, (err) => {
      console.error("Firestore siteSettings subscription error:", err);
    });
  },

  updateSiteSettings: async (settingsData) => {
    if (!isInitialized) throw new Error("ยังไม่ได้ตั้งค่า firebaseConfig ใน js/firebase-config.js");
    const payload = { ...settingsData, updatedAt: serverTimestamp() };
    delete payload.googleClientId;
    await setDoc(doc(db, "siteSettings", "config"), payload, { merge: true });
  },

  // 7. Stats (ยอดเข้าชมเว็บจริง)
  incrementVisitorHit: async (todayStr, isNewVisitor) => {
    if (!isInitialized) return;
    try {
      const statsRef = doc(db, "stats", "analytics");
      const updatePayload = {
        pageViews: increment(1),
        dailyVisits: {
          [todayStr]: increment(1)
        },
        lastVisit: serverTimestamp()
      };
      if (isNewVisitor) {
        updatePayload.uniqueVisitors = increment(1);
      }
      await setDoc(statsRef, updatePayload, { merge: true });
    } catch (err) {
      console.warn("Firestore analytics update skipped:", err.message);
    }
  },

  subscribeStats: (callback) => {
    if (!isInitialized) return () => {};
    return onSnapshot(doc(db, "stats", "analytics"), (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      } else {
        callback({ pageViews: 0, uniqueVisitors: 0, dailyVisits: {} });
      }
    }, (err) => {
      console.error("Firestore stats subscription error:", err);
    });
  }
};

window.AuthService = AuthService;
window.FirestoreService = FirestoreService;
window.FIREBASE_BRIDGE_LOADED = true;
window.dispatchEvent(new CustomEvent("firebase-bridge-ready"));
