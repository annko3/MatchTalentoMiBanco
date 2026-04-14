// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB6b1CNHfNqAwwBVI1ot5Za_rvXnz1smvE",
  authDomain: "matchtalento-95ee4.firebaseapp.com",
  projectId: "matchtalento-95ee4",
  storageBucket: "matchtalento-95ee4.firebasestorage.app",
  messagingSenderId: "837478403276",
  appId: "1:837478403276:web:9e49058723778fced28669",
  measurementId: "G-0LF7R6MK7W",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
