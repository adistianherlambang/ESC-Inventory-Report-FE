// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCi9MgM9y5LxAU1nt2_KYY-5LGjvLatIJE",
  authDomain: "esc-superapp.firebaseapp.com",
  projectId: "esc-superapp",
  storageBucket: "esc-superapp.firebasestorage.app",
  messagingSenderId: "483955977989",
  appId: "1:483955977989:web:6800fe52c95f5386c2916c",
  measurementId: "G-CK3NSPWQDH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app)