import {
  collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc,
  serverTimestamp, query, where
} from "firebase/firestore";
import { db } from "../firebaseConfig";

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

export const getUserById = async (uid) => {
  const docRef = doc(db, "users", uid);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
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

export const getAllDonors = async () => {
  const snapshot = await getDocs(collection(db, "donors"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

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

export const getHospitals = getAllHospitals;

export const assignHospital = async (match) => {
  const hospitals = await getHospitals();
  const byCity = hospitals.find(h => h.city === match.location?.city);
  const byState = hospitals.find(h => h.state === match.location?.state);
  return byCity || byState || hospitals[0];
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

// Find best matches for a recipient
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
      (recipient.urgencyLevel === "High" ? 30 : recipient.urgencyLevel === "Medium" ? 15 : 0)
      - distance
      + (d.healthStatus === "good" ? 10 : 0);
    return { ...d, matchScore: score };
  });

  // 4. Sort best first
  donors.sort((a, b) => b.matchScore - a.matchScore);

  return donors;
};

///////////////////////////////////////////////////////////////////////////////
// 6. MATCHES
///////////////////////////////////////////////////////////////////////////////

export const saveMatch = async (matchData) => {
  return await addDoc(collection(db, "Matches"), {
    ...matchData,
    status: "Pending",
    timestamp: serverTimestamp()
  });
};

// Get all matches
export const getAllMatches = async () => {
  const snap = await getDocs(collection(db, "Matches"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// Get single match by ID
export const getMatchById = async (id) => {
  const docRef = doc(db, "Matches", id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

// Send a match request (do NOT create Matches document yet)
export const sendMatchRequest = async (match) => {
  await updateDoc(doc(db, "donors", match.donorId), {
    incomingMatchRequest: {
      recipientId: match.recipientId,
      recipientName: match.recipientName,
      organ: match.organ,
      matchScore: match.matchScore,
      location: match.location || {},
    },
    status: "Pending",
  });
};


// Donor accepts a match
export const donorAcceptMatch = async (matchId) => {
  await updateDoc(doc(db, "Matches", matchId), { status: "Accepted by Donor" });
  const match = await getMatchById(matchId);
  if (match) {
    await updateDoc(doc(db, "donors", match.donorId), { status: "Matched" });
    await updateDoc(doc(db, "recipients", match.recipientId), { status: "Matched" });
  }
};

// Donor rejects a match
export const donorRejectMatch = async (matchId) => {
  await updateDoc(doc(db, "Matches", matchId), { status: "Rejected by Donor" });
  const match = await getMatchById(matchId);
  if (match) {
    await updateDoc(doc(db, "donors", match.donorId), { status: "Available" });
    await updateDoc(doc(db, "recipients", match.recipientId), { status: "Available" });
  }
};
