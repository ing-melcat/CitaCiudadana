import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA32ca5fpNqfmuqpsat5KWRlEnHhvSs48I",
  authDomain: "cita-ciudadana.firebaseapp.com",
  projectId: "cita-ciudadana",
  storageBucket: "cita-ciudadana.firebasestorage.app",
  messagingSenderId: "478435404426",
  appId: "1:478435404426:web:250cbc2b7c1d2261fc1b73",
  measurementId: "G-6YKQBLZB5C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
