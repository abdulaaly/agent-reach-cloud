import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBcL_aRYm2RJsvAFAvS39_xA7-4fYaPkFE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "promising-env-470506-p9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "promising-env-470506-p9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "promising-env-470506-p9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "46000911784",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:46000911784:web:4705b3d492756bcbf3999d",
};

let app: FirebaseApp;
let auth: Auth | null = null;

export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null;

  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    if (!auth) {
      auth = getAuth(app);
    }
    return auth;
  } catch (err) {
    console.error("Firebase client initialization error:", err);
    return null;
  }
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const githubProvider = new GithubAuthProvider();

export async function loginWithGoogle() {
  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    throw new Error("Firebase authentication service is not initialized.");
  }
  return await signInWithPopup(authInstance, googleProvider);
}

export async function loginWithGithub() {
  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    throw new Error("Firebase authentication service is not initialized.");
  }
  return await signInWithPopup(authInstance, githubProvider);
}

export async function loginWithEmail(email: string, pass: string) {
  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    throw new Error("Firebase authentication service is not initialized.");
  }
  return await signInWithEmailAndPassword(authInstance, email.trim(), pass);
}

export async function signupWithEmail(email: string, pass: string, name?: string) {
  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    throw new Error("Firebase authentication service is not initialized.");
  }
  const userCredential = await createUserWithEmailAndPassword(authInstance, email.trim(), pass);
  if (name && userCredential.user) {
    try {
      await updateProfile(userCredential.user, { displayName: name });
    } catch (e) {
      console.warn("Failed to update profile name:", e);
    }
  }
  return userCredential;
}

export async function logoutUser() {
  const authInstance = getFirebaseAuth();
  if (authInstance) {
    try {
      await signOut(authInstance);
    } catch (e) {
      console.warn("Error signing out from Firebase:", e);
    }
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem("agent_reach_session");
  }
}

export { onAuthStateChanged };
export type { FirebaseUser };
