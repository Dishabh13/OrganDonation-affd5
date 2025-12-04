// Always at the top
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";

// Get user profile by UID
export const getUserProfile = async (uid) => {
  const q = query(collection(db, "users"), where("userId", "==", uid));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data();
};

// Update user profile
export const updateUserProfile = async (userId, data) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, data);
};
