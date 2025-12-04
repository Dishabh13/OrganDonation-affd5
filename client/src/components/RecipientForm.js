import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function RecipientForm() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [organNeeded, setOrganNeeded] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "Recipients"), {
        name,
        age: parseInt(age),
        bloodGroup,
        organNeeded,
        timestamp: serverTimestamp(),
      });
      alert("Recipient added successfully!");
      setName(""); setAge(""); setBloodGroup(""); setOrganNeeded("");
    } catch (err) {
      console.error("Error adding recipient:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Recipient Form</h2>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} required type="number"/>
      <input placeholder="Blood Group" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} required />
      <input placeholder="Organ Needed" value={organNeeded} onChange={(e) => setOrganNeeded(e.target.value)} required />
      <button type="submit">Submit</button>
    </form>
  );
}

export default RecipientForm;
