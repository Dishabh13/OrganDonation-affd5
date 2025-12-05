// client/src/services/firestore.js

import { 
  collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, 
  serverTimestamp, query, where 
} from "firebase/firestore";

import { db } from "../firebaseConfig";

export async function getAllDonors() {
  const snapshot = await getDocs(collection(db, "donors"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}


///////////////////////////////////////////////////////////////////////////////
// 1. USERS
///////////////////////////////////////////////////////////////////////////////

export const createUserProfile = async (uid, userData) => {
  return await addDoc(collection(db, "users"), {
    userId: uid,
    ...userData,
    timestamp: serverTimestamp()
  });
};

export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

///////////////////////////////////////////////////////////////////////////////
// 2. DONORS
///////////////////////////////////////////////////////////////////////////////

export const createDonor = async (donorData) => {
  return await addDoc(collection(db, "donors"), {
    ...donorData,
    timestamp: serverTimestamp()
  });
};

// export const getAllDonors = async () => {
//   const snapshot = await getDocs(collection(db, "donors"));
//   return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
// };

export const updateDonor = async (donorId, data) => {
  const ref = doc(db, "donors", donorId);
  return await updateDoc(ref, data);
};

export const deleteDonor = async (donorId) => {
  return await deleteDoc(doc(db, "donors", donorId));
};

///////////////////////////////////////////////////////////////////////////////
// 3. RECIPIENTS
///////////////////////////////////////////////////////////////////////////////

export const createRecipient = async (recipientData) => {
  return await addDoc(collection(db, "recipients"), {
    ...recipientData,
    timestamp: serverTimestamp()
  });
};

export const getAllRecipients = async () => {
  const snapshot = await getDocs(collection(db, "recipients"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateRecipient = async (id, data) => {
  return await updateDoc(doc(db, "recipients", id), data);
};

export const deleteRecipient = async (id) => {
  return await deleteDoc(doc(db, "recipients", id));
};

///////////////////////////////////////////////////////////////////////////////
// 4. HOSPITALS
///////////////////////////////////////////////////////////////////////////////

export const createHospital = async (hospitalData) => {
  return await addDoc(collection(db, "hospitals"), {
    ...hospitalData,
    timestamp: serverTimestamp()
  });
};

export const getAllHospitals = async () => {
  const snapshot = await getDocs(collection(db, "hospitals"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

///////////////////////////////////////////////////////////////////////////////
// 5. MATCHING SYSTEM
///////////////////////////////////////////////////////////////////////////////

// Blood group compatibility
const bloodGroupCompatibility = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]
};

// Simple distance formula
const calcDistance = (loc1, loc2) => {
  if (!loc1 || !loc2) return 999999; // fallback
  const dx = loc1.lat - loc2.lat;
  const dy = loc1.lng - loc2.lng;
  return Math.sqrt(dx * dx + dy * dy);
};

// MATCH LOGIC
export const findBestMatches = async (recipientId) => {
  const recipRef = doc(db, "recipients", recipientId);
  const recipSnap = await getDoc(recipRef);

  if (!recipSnap.exists()) return [];

  const recipient = { id: recipSnap.id, ...recipSnap.data() };

  // 1. Get donors who have the required organ
  const donorsSnap = await getDocs(
    query(
      collection(db, "donors"),
      where("organsAvailable", "array-contains", recipient.organNeeded)
    )
  );

  let donors = donorsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // 2. Filter by blood compatibility
  donors = donors.filter(d =>
    bloodGroupCompatibility[recipient.bloodGroup]?.includes(d.bloodGroup)
  );

  // 3. Score calculation
  donors = donors.map(d => {
    const distance = calcDistance(d.location, recipient.location);
    const score =
      recipient.urgencyLevel * 10 -
      distance +
      (d.healthStatus === "good" ? 10 : 0);

    return { ...d, matchScore: score };
  });

  // 4. Sort best first
  donors.sort((a, b) => b.matchScore - a.matchScore);

  return donors;
};

///////////////////////////////////////////////////////////////////////////////
// 6. SAVE MATCH RESULT INTO FIRESTORE
///////////////////////////////////////////////////////////////////////////////

export const saveMatch = async (matchData) => {
  return await addDoc(collection(db, "matches"), {
    ...matchData,
    status: "pending",
    timestamp: serverTimestamp()
  });
};

export const getAllMatches = async () => {
  const snap = await getDocs(collection(db, "matches"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
