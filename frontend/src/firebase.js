import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "lux-estate-5643b.firebaseapp.com",
  projectId: "lux-estate-5643b",
  storageBucket: "lux-estate-5643b.appspot.com",
  messagingSenderId: "593536596285",
  appId: "1:593536596285:web:c5f400c3cf7f76c96cad54",
};

export const app = initializeApp(firebaseConfig);
