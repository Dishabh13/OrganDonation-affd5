// client/src/services/userService.js

import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export const getUserProfile = async (uid) => {
  const q = query(collection(db, "users"), where("userId", "==", uid));
  const snap = await getDocs(q);

  if (snap.empty) return null;

  return { id: snap.docs[0].id, ...snap.docs[0].data() };
};
