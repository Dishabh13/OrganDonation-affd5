// client/src/components/DonorDashboard.js

import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { getUserProfile } from "../services/userService";
import { getAllDonors, updateDonor } from "../services/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function DonorDashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [donorInfo, setDonorInfo] = useState({});
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
      await updateDonor(donorInfo.id, {
        organsAvailable: organs.split(",").map((s) => s.trim()),
      });
      alert("Organs updated successfully!");
      setDonorInfo({ ...donorInfo, organsAvailable: organs.split(",").map((s) => s.trim()) });
    } catch (err) {
      console.error("Error updating organs:", err);
      alert("Failed to update organs.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear(); // optional
      navigate("/login"); // redirect to login page
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed, please try again.");
    }
  };

  if (loading) return <p>Loading...</p>;

  if (!donorInfo) return <p>No donor info found.</p>;

  return (
    <div className="container">
      <h2>Hello, {donorInfo?.name} (Donor)</h2>

      <p><strong>Blood Group:</strong> {donorInfo?.bloodGroup}</p>
      <p><strong>Health Status:</strong> {donorInfo?.healthStatus}</p>
      <p><strong>Organs Available:</strong> {donorInfo?.organsAvailable?.join(", ")}</p>

      <button className="btn" onClick={updateOrgans}>
        Update Organ List
      </button>

      <button className="btn btn-danger" onClick={handleLogout} style={{ marginLeft: "10px" }}>
        Logout
      </button>
    </div>
  );
}
