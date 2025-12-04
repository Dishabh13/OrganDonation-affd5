import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function DonorForm() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [organsAvailable, setOrgansAvailable] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "Donors"), {
        name,
        age: parseInt(age),
        bloodGroup,
        organsAvailable: organsAvailable.split(",").map((o) => o.trim()),
        timestamp: serverTimestamp(),
      });
      alert("Donor added successfully!");
      setName(""); setAge(""); setBloodGroup(""); setOrgansAvailable("");
    } catch (err) {
      console.error("Error adding donor:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Donor Form</h2>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} required type="number"/>
      <input placeholder="Blood Group" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} required />
      <input placeholder="Organs (comma separated)" value={organsAvailable} onChange={(e) => setOrgansAvailable(e.target.value)} required />
      <button type="submit">Submit</button>
    </form>
  );
}

export default DonorForm;
