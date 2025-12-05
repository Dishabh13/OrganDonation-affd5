// client/src/components/RecipientDashboard.js

import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { getUserProfile } from "../services/userService";
import { getAllRecipients, findBestMatches } from "../services/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getAllDonors } from "../services/firestore";

export default function RecipientDashboard() {
  const [recipientInfo, setRecipientInfo] = useState({});
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

        const recipients = await getAllRecipients();
        const r = recipients.find(
          (x) => x.id === profile?.linkedRecipientId
        );

        setRecipientInfo(r);
      } catch (err) {
        console.error("Error fetching recipient info:", err);
        alert("Failed to load recipient info.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

//   const findMatch = async () => {
//     try {
//       const best = await findBestMatches(recipientInfo.id);

//       if (!best || best.length === 0) {
//         return alert("No matches available.");
//       }

//       localStorage.setItem("matchResults", JSON.stringify(best));
//       navigate("/matches");
//     } catch (err) {
//       console.error("Error finding matches:", err);
//       alert("Failed to find matches.");
//     }
//   };
function calculateScore(donor, recipient) {
  let score = 0;

  if (donor.bloodGroup === recipient.bloodGroup) score += 40;

  if (donor.location?.city === recipient.location?.city) score += 30;
  if (donor.location?.state === recipient.location?.state) score += 20;

  if (recipient.urgencyLevel === "High") score += 30;
  if (recipient.urgencyLevel === "Medium") score += 15;

  return score;
}

const findMatch = async () => {
  const donors = await getAllDonors(); // fetch all donors from Firestore

  // filter donors who match this recipient
  const best = donors
    .filter(donor =>
      donor.bloodGroup === recipientInfo.bloodGroup &&
      donor.organsAvailable.includes(recipientInfo.organNeeded)
    )
    .map(donor => ({
      organ: recipientInfo.organNeeded,
      donorId: donor.id,
      donorName: donor.name,             // <-- add this
      donorBloodGroup: donor.bloodGroup, // <-- add this
      location: donor.location,
      matchScore: calculateScore(donor, recipientInfo), // optional function
      status: "Pending"                  // or existing status if you have one
    }));

  if (best.length === 0) return alert("No matches available.");

  localStorage.setItem("matchResults", JSON.stringify(best));
  navigate("/matches");
};

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
      <h2>Hello, {recipientInfo?.name} (Recipient)</h2>

      <p><strong>Organ Needed:</strong> {recipientInfo?.organNeeded}</p>
      <p><strong>Blood Group:</strong> {recipientInfo?.bloodGroup}</p>
      <p><strong>Urgency:</strong> {recipientInfo?.urgencyLevel}</p>

      <button className="btn" onClick={findMatch} style={{ marginRight: "10px" }}>
        Find Matches
      </button>

      <button className="btn btn-danger" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
