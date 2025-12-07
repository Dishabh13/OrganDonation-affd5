import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { assignHospital } from "../services/firestore"; // adjust the path
import { getUserProfile } from "../services/userService";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";

import { db } from "../firebaseConfig";

import {
  getAllDonors,
  updateDonor
} from "../services/firestore";

import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function DonorDashboard() {
  const [setUserProfile] = useState(null);//userProfile
  const [donorInfo, setDonorInfo] = useState({});
  const [matchInfo, setMatchInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInfo = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        navigate("/login"); // redirect if not logged in
        return;
      }

      try {
        const profile = await getUserProfile(uid);
        setUserProfile(profile);

        const donors = await getAllDonors();
        const d = donors.find((x) => x.id === profile?.linkedDonorId);
        setDonorInfo(d);

       
if (d?.incomingMatchRequest) {
  setMatchInfo(d.incomingMatchRequest);
}


      } catch (err) {
        console.error("Error fetching donor info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [navigate]);

  const updateOrgans = async () => {
    const organs = prompt(
      "Enter updated organs (comma-separated):",
      donorInfo?.organsAvailable?.join(", ") || ""
    );

    if (!organs) return;

    try {
      const organsArray = organs.split(",").map((s) => s.trim());
      await updateDonor(donorInfo.id, { organsAvailable: organsArray });
      alert("Organs updated successfully!");
      setDonorInfo({ ...donorInfo, organsAvailable: organsArray });
    } catch (err) {
      console.error("Error updating organs:", err);
      alert("Failed to update organs.");
    }
  };

  const acceptMatch = async () => {
  if (!matchInfo) return;

  try {
    // Assign hospital
    const hospital = await assignHospital(matchInfo);

    // Create the actual Matches document
   // const matchRef = await addDoc(collection(db, "Matches"), {
      // donorId: donorInfo.id,
      // donorName: donorInfo.name,
    //   recipientId: matchInfo.recipientId,
    //   recipientName: matchInfo.recipientName,
    //   organ: matchInfo.organ,
    //   matchScore: matchInfo.matchScore,
    //   hospitalId: hospital.id,
    //   hospitalName: hospital.name,
    //   status: "Accepted",
    //   timestamp: serverTimestamp(),
    // });

    // Update donor & recipient status
    await updateDoc(doc(db, "donors", donorInfo.id), {
      status: "Matched",
      incomingMatchRequest: null,
    });

    await updateDoc(doc(db, "recipients", matchInfo.recipientId), {
      status: "Matched",
    });

    alert("Match accepted and recorded successfully!");
    setMatchInfo(null);
  } catch (err) {
    console.error("Error accepting match:", err);
    alert("Failed to accept match.");
  }
};


  const rejectMatch = async () => {
  if (!matchInfo) return;

  try {
    // Reset donor status and remove incoming request
    await updateDoc(doc(db, "donors", donorInfo.id), {
      status: "Available",
      incomingMatchRequest: null,
    });

    alert("Match rejected.");
    setMatchInfo(null);
  } catch (err) {
    console.error("Error rejecting match:", err);
    alert("Failed to reject match.");
  }
};


  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed, please try again.");
    }
  };

  if (loading) return <p>Loading...</p>;

  if (!donorInfo) return <p>No donor info found.</p>;

  return (
    <>
      {matchInfo && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <h3>Incoming Match Request</h3>

          <p><strong>Recipient:</strong> {matchInfo.recipientName}</p>
          <p><strong>Organ Needed:</strong> {matchInfo.organ}</p>
          <p><strong>Match Score:</strong> {matchInfo.matchScore}</p>
          <p><strong>Hospital Assigned:</strong> {matchInfo.hospitalName}</p>

          <button className="btn" onClick={acceptMatch} style={{ marginRight: "10px" }}>
            Accept Match
          </button>

          <button className="btn btn-danger" onClick={rejectMatch}>
            Reject
          </button>
        </div>
      )}

      <div className="container">
        <h2>Hello, {donorInfo?.name} (Donor)</h2>

        <p><strong>Blood Group:</strong> {donorInfo?.bloodGroup}</p>
        <p><strong>Health Status:</strong> {donorInfo?.healthStatus}</p>
        <p><strong>Organs Available:</strong> {donorInfo?.organsAvailable?.join(", ")}</p>
        <p><strong>Status:</strong> {donorInfo?.status || "Available"}</p>

        <button className="btn" onClick={updateOrgans}>
          Update Organ List
        </button>

        <button className="btn btn-danger" onClick={handleLogout} style={{ marginLeft: "10px" }}>
          Logout
        </button>
      </div>
    </>
  );
}
