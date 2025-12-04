// client/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Register from "./components/Register";
import DonorForm from "./components/DonorForm";
import RecipientForm from "./components/RecipientForm";
import HospitalForm from "./components/HospitalForm";
import DonorDashboard from "./components/DonorDashboard";
import RecipientDashboard from "./components/RecipientDashboard";
import HospitalDashboard from "./components/HospitalDashboard";
import MatchResults from "./components/MatchResults";

import "./styles.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Registration Forms */}
        <Route path="/register/donor" element={<DonorForm />} />
        <Route path="/register/recipient" element={<RecipientForm />} />
        <Route path="/register/hospital" element={<HospitalForm />} />

        {/* Dashboards */}
        <Route path="/dashboard/donor" element={<DonorDashboard />} />
        <Route path="/dashboard/recipient" element={<RecipientDashboard />} />
        <Route path="/dashboard/hospital" element={<HospitalDashboard />} />

        {/* Matching */}
        <Route path="/matches" element={<MatchResults />} />
      </Routes>
    </Router>
  );
}

export default App;
