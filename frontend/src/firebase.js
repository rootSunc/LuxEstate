// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "lux-estate-5643b.firebaseapp.com",
  projectId: "lux-estate-5643b",
  storageBucket: "lux-estate-5643b.appspot.com",
  messagingSenderId: "593536596285",
  appId: "1:593536596285:web:c5f400c3cf7f76c96cad54",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
