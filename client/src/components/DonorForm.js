import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { createDonor } from "../services/firestore";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function DonorForm() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    bloodGroup: "",
    organsAvailable: "",
    healthStatus: "",
    city: "",
    state: "",
    lat: "",
    lng: ""
  });

  const navigate = useNavigate();

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveDonor = async (e) => {
    e.preventDefault();

    try {
      const organs = form.organsAvailable.split(",").map(s => s.trim());

      const donorData = {
        name: form.name,
        age: Number(form.age),
        bloodGroup: form.bloodGroup,
        organsAvailable: organs,
        healthStatus: form.healthStatus,
        location: {
          city: form.city,
          state: form.state,
          lat: Number(form.lat),
          lng: Number(form.lng)
        }
      };

      // 1. Create donor document
      const donorRef = await createDonor(donorData);

      // 2. Find current user profile
      const uid = auth.currentUser.uid;

      const q = query(collection(db, "users"), where("userId", "==", uid));
      const snap = await getDocs(q);
      const userDoc = snap.docs[0];

      // 3. Link donor to user
      await updateDoc(doc(db, "users", userDoc.id), {
        linkedDonorId: donorRef.id
      });

      alert("Donor registered successfully!");
      navigate("/dashboard/donor");

    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="container">
      <h2>Donor Registration</h2>

      <form onSubmit={saveDonor}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={update}
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={form.age}
          onChange={update}
          required
        />
        <input
          type="text"
          name="bloodGroup"
          placeholder="Blood Group (A+, O-, etc)"
          value={form.bloodGroup}
          onChange={update}
          required
        />
        <input
          type="text"
          name="organsAvailable"
          placeholder="Organs Available (comma separated)"
          value={form.organsAvailable}
          onChange={update}
          required
        />
        <input
          type="text"
          name="healthStatus"
          placeholder="Health Status (good/average/poor)"
          value={form.healthStatus}
          onChange={update}
          required
        />

        <h4>Location</h4>
        <input
          type="text"
          name="city"
          placeholder="City"
          value={form.city}
          onChange={update}
          required
        />
        <input
          type="text"
          name="state"
          placeholder="State"
          value={form.state}
          onChange={update}
          required
        />
        <input
          type="number"
          step="any"
          name="lat"
          placeholder="Latitude"
          value={form.lat}
          onChange={update}
          required
        />
        <input
          type="number"
          step="any"
          name="lng"
          placeholder="Longitude"
          value={form.lng}
          onChange={update}
          required
        />

        <button className="btn" type="submit">Submit</button>
      </form>
    </div>
  );
}
