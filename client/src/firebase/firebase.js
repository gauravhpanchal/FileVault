import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD1ODutyri6dw8vsEjw8KpdD9s_rreZnBM",
  authDomain: "gaurav-f2969.firebaseapp.com",
  projectId: "gaurav-f2969",
  storageBucket: "gaurav-f2969.firebasestorage.app",
  messagingSenderId: "897511270557",
  appId: "1:897511270557:web:5c5a788c08688ac4bf0c74",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const storage = getStorage(app);

export { app, auth, storage };
