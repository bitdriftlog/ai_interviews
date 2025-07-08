// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCyok2ssUFPRwXJGiU9tCQhYKV5HrQgfzQ",
  authDomain: "interviewer-ai-8c6f2.firebaseapp.com",
  projectId: "interviewer-ai-8c6f2",
  storageBucket: "interviewer-ai-8c6f2.firebasestorage.app",
  messagingSenderId: "236012103462",
  appId: "1:236012103462:web:3946e6606f22406c5b83e7",
  measurementId: "G-PEGF0XRT0S"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
