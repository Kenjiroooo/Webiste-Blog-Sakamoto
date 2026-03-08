import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0JCeUA3If9mlTJvjtu8udoQQdky6QRzE",
  authDomain: "udd-cpe-blog-sakamoto.firebaseapp.com",
  databaseURL: "https://udd-cpe-blog-sakamoto-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "udd-cpe-blog-sakamoto",
  storageBucket: "udd-cpe-blog-sakamoto.firebasestorage.app",
  messagingSenderId: "479484817482",
  appId: "1:479484817482:web:42dfa74a4f12ea63d536b3",
  measurementId: "G-0SYDTS2V0Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const database = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;

