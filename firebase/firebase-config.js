import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCSBZvHPn8_KSM5FpkO6cNWia0ueogeAhQ",
  authDomain: "fixora-ddbba.firebaseapp.com",
  projectId: "fixora-ddbba",
  storageBucket: "fixora-ddbba.firebasestorage.app",
  messagingSenderId: "47110268813",
  appId: "1:47110268813:web:4415a4f5b62f6f30dcffc4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);