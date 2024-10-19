import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDpY_8gbPNH6oHzohWgCcKFG_iTixgMg0Y",

  authDomain: "library---auth.firebaseapp.com",

  projectId: "library---auth",

  storageBucket: "library---auth.appspot.com",

  messagingSenderId: "40540143025",

  appId: "1:40540143025:web:14a75041091eff56861190",

  measurementId: "G-HXSN8CGNM8",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
