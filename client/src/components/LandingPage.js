import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="container">
      <h1>Organ Donation Matching System</h1>
      <p>A fast and efficient way to connect donors, recipients, and hospitals.</p>

      <div className="button-group">
        <Link to="/login" className="btn">Login</Link>
        <Link to="/register" className="btn">Register</Link>
      </div>
    </div>
  );
}
