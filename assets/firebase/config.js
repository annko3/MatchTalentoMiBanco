import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  signOut, 
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6b1CNHfNqAwwBVI1ot5Za_rvXnz1smvE",
  authDomain: "matchtalento-95ee4.firebaseapp.com",
  projectId: "matchtalento-95ee4",
  storageBucket: "matchtalento-95ee4.firebasestorage.app",
  messagingSenderId: "837478403276",
  appId: "1:837478403276:web:9e49058723778fced28669",
  measurementId: "G-0LF7R6MK7W"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export {
  auth,
  googleProvider,
  db,
  storage,
  // Auth 
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  // Firestore
  doc,
  setDoc,
  getDoc,
  updateDoc,
  // Storage 
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
};
