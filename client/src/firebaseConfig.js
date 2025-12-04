// client/src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Replace these values from your Firebase Web App
const firebaseConfig = {
  apiKey: "AIzaSyCW5-R3CjZ0JOGpSx5Rt6rJqYD4TVFugi0",
  authDomain: "organdonationprojectdbms.firebaseapp.com",
  projectId: "organdonationprojectdbms",
  storageBucket: "organdonationprojectdbms.firebasestorage.app",
  messagingSenderId: "932123808144",
  appId: "1:932123808144:web:70c435c166f5f5d15fa315"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
