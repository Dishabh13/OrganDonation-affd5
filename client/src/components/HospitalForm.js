import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { createHospital } from "../services/firestore";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function HospitalForm() {
  const [form, setForm] = useState({
    name: "",
    city: "",
    state: "",
    lat: "",
    lng: "",
    contact: "",
    doctorInCharge: "",
    email: ""
  });

  const navigate = useNavigate();

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveHospital = async (e) => {
    e.preventDefault();

    try {
      const hospitalData = {
        name: form.name,
        address: {
          city: form.city,
          state: form.state,
          lat: Number(form.lat),
          lng: Number(form.lng)
        },
        contact: form.contact,
        doctorInCharge: form.doctorInCharge,
        email: form.email
      };

      // 1. Create hospital document
      const ref = await createHospital(hospitalData);

      // 2. Link to user
      const uid = auth.currentUser.uid;

      const q = query(collection(db, "users"), where("userId", "==", uid));
      const snap = await getDocs(q);
      const userDoc = snap.docs[0];

      await updateDoc(doc(db, "users", userDoc.id), {
        linkedHospitalId: ref.id
      });

      alert("Hospital registered successfully!");
      navigate("/dashboard/hospital");

    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="container">
      <h2>Hospital Registration</h2>

      <form onSubmit={saveHospital}>
        <input name="name" placeholder="Hospital Name" value={form.name} onChange={update} required />
        <h4>Address</h4>
        <input name="city" placeholder="City" value={form.city} onChange={update} required />
        <input name="state" placeholder="State" value={form.state} onChange={update} required />
        <input name="lat" type="number" step="any" placeholder="Latitude" value={form.lat} onChange={update} required />
        <input name="lng" type="number" step="any" placeholder="Longitude" value={form.lng} onChange={update} required />

        <input name="contact" placeholder="Contact Number" value={form.contact} onChange={update} required />
        <input name="doctorInCharge" placeholder="Doctor In Charge" value={form.doctorInCharge} onChange={update} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={update} required />

        <button className="btn" type="submit">Submit</button>
      </form>
    </div>
  );
}
