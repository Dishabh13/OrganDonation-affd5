import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { createRecipient } from "../services/firestore";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function RecipientForm() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    bloodGroup: "",
    organNeeded: "",
    urgencyLevel: "",
    city: "",
    state: "",
    lat: "",
    lng: ""
  });

  const navigate = useNavigate();

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveRecipient = async (e) => {
    e.preventDefault();

    try {
      const recipientData = {
        name: form.name,
        age: Number(form.age),
        bloodGroup: form.bloodGroup,
        organNeeded: form.organNeeded,
        urgencyLevel: Number(form.urgencyLevel),
        location: {
          city: form.city,
          state: form.state,
          lat: Number(form.lat),
          lng: Number(form.lng)
        }
      };

      // 1. Create recipient document
      const ref = await createRecipient(recipientData);

      // 2. Link to user document
      const uid = auth.currentUser.uid;

      const q = query(collection(db, "users"), where("userId", "==", uid));
      const snap = await getDocs(q);
      const userDoc = snap.docs[0];

      await updateDoc(doc(db, "users", userDoc.id), {
        linkedRecipientId: ref.id
      });

      alert("Recipient registered successfully!");
      navigate("/dashboard/recipient");

    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="container">
      <h2>Recipient Registration</h2>

      <form onSubmit={saveRecipient}>
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={update}
          required
        />
        <input
          name="age"
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={update}
          required
        />
        <input
          name="bloodGroup"
          placeholder="Blood Group (A+, O-, etc)"
          value={form.bloodGroup}
          onChange={update}
          required
        />
        <input
          name="organNeeded"
          placeholder="Organ Needed"
          value={form.organNeeded}
          onChange={update}
          required
        />
        <input
          name="urgencyLevel"
          type="number"
          placeholder="Urgency Level (1-5)"
          value={form.urgencyLevel}
          onChange={update}
          required
        />

        <h4>Location</h4>
        <input
          name="city"
          placeholder="City"
          value={form.city}
          onChange={update}
          required
        />
        <input
          name="state"
          placeholder="State"
          value={form.state}
          onChange={update}
          required
        />
        <input
          name="lat"
          type="number"
          step="any"
          placeholder="Latitude"
          value={form.lat}
          onChange={update}
          required
        />
        <input
          name="lng"
          type="number"
          step="any"
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
