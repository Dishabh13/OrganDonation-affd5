import React, { useState } from "react";
import DonorForm from "./components/DonorForm";
import RecipientForm from "./components/RecipientForm";

function App() {
  const [view, setView] = useState("home");

  return (
    <div className="container">
      <h1>Organ Donation System</h1>
      <nav>
        <button onClick={() => setView("donor")}>Donor Form</button>
        <button onClick={() => setView("recipient")}>Recipient Form</button>
        <button onClick={() => setView("home")}>Home</button>
      </nav>

      {view === "donor" && <DonorForm />}
      {view === "recipient" && <RecipientForm />}
      {view === "home" && <p>Welcome! Choose a form to get started.</p>}
    </div>
  );
}

export default App;
