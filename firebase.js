// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, setLogLevel } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCioW3_SieVs5F9tIrhkz_oFQRu-5PwsW4",
  authDomain: "esc-superapp-50ff4.firebaseapp.com",
  projectId: "esc-superapp-50ff4",
  storageBucket: "esc-superapp-50ff4.firebasestorage.app",
  messagingSenderId: "648506002971",
  appId: "1:648506002971:web:dbd1b67a205ca3b4fb32be",
  measurementId: "G-E79M9VST48",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
