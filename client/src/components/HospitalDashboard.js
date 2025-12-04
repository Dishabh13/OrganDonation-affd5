// client/src/components/HospitalDashboard.js

import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { getUserProfile } from "../services/userService";
import { getAllHospitals, getAllMatches } from "../services/firestore";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function HospitalDashboard() {
  const [hospital, setHospital] = useState({});
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        navigate("/login"); // redirect if not logged in
        return;
      }

      try {
        const profile = await getUserProfile(uid);

        const hospitals = await getAllHospitals();
        const myHospital = hospitals.find(
          (x) => x.id === profile?.linkedHospitalId
        );
        setHospital(myHospital);

        const allMatches = await getAllMatches();
        const enrichedMatches = [];

        for (let m of allMatches) {
          // Fetch donor info
          const donorSnap = await getDoc(doc(db, "donors", m.donorId));
          const donor = donorSnap.exists() ? donorSnap.data() : {};

          // Fetch recipient info
          const recipientSnap = await getDoc(doc(db, "recipients", m.recipientId));
          const recipient = recipientSnap.exists() ? recipientSnap.data() : {};

          enrichedMatches.push({
            ...m,
            donor,
            recipient
          });
        }

        setMatches(enrichedMatches);
      } catch (err) {
        console.error("Error loading hospital dashboard:", err);
        alert("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear(); // optional
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed, please try again.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>{hospital?.name} (Hospital Dashboard)</h2>

      <h3>Recent Matches:</h3>
      {matches.length === 0 && <p>No matches yet.</p>}

      {matches.map((m, idx) => (
        <div className="card" key={idx}>
          <p><strong>Organ:</strong> {m.organ}</p>
          <p><strong>Status:</strong> {m.status}</p>

          <p><strong>Donor Name:</strong> {m.donor?.name}</p>
          <p><strong>Donor Blood Group:</strong> {m.donor?.bloodGroup}</p>
          <p><strong>Donor Location:</strong> {m.donor?.location?.city}, {m.donor?.location?.state}</p>

          <p><strong>Recipient Name:</strong> {m.recipient?.name}</p>
          <p><strong>Organ Needed:</strong> {m.recipient?.organNeeded}</p>
          <p><strong>Recipient Blood Group:</strong> {m.recipient?.bloodGroup}</p>
          <p><strong>Urgency Level:</strong> {m.recipient?.urgencyLevel}</p>
        </div>
      ))}

      <button className="btn btn-danger" onClick={handleLogout} style={{ marginTop: "10px" }}>
        Logout
      </button>
    </div>
  );
}
