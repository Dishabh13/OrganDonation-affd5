import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { getDocs, collection, where, query } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const q = query(collection(db, "users"), where("userId", "==", uid));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const data = snap.docs[0].data();

        if (data.role === "donor") navigate("/dashboard/donor");
        if (data.role === "recipient") navigate("/dashboard/recipient");
        if (data.role === "hospital") navigate("/dashboard/hospital");
      }
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>

      <form onSubmit={loginUser}>
        <input 
          type="email" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)}
          required
        />
        <input 
          type="password" placeholder="Password"
          value={password} onChange={e => setPassword(e.target.value)}
          required
        />

        <button className="btn" type="submit">Login</button>
      </form>
    </div>
  );
}
