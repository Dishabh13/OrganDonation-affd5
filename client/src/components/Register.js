import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { createUserProfile } from "../services/firestore";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!role) {
      alert("Please select a role!");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      // Create user profile document
      await createUserProfile(uid, {
        email,
        role,
        linkedDonorId: null,
        linkedRecipientId: null,
        linkedHospitalId: null
      });

      // Redirect to the correct registration form
      if (role === "donor") navigate("/register/donor");
      if (role === "recipient") navigate("/register/recipient");
      if (role === "hospital") navigate("/register/hospital");

    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  };

  return (
    <div className="container">
      <h2>Create an Account</h2>

      <form onSubmit={handleRegister}>
        <input 
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input 
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <label>Select Role:</label>
        <select value={role} onChange={e => setRole(e.target.value)} required>
          <option value="">-- Choose --</option>
          <option value="donor">Donor</option>
          <option value="recipient">Recipient</option>
          <option value="hospital">Hospital</option>
        </select>

        <button className="btn" type="submit">Next</button>
      </form>

      <p>
        Already registered? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}
