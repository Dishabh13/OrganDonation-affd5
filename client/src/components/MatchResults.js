import React, { useEffect, useState } from "react";

export default function MatchResults() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const data = localStorage.getItem("matchResults");
    if (data) setMatches(JSON.parse(data));
  }, []);

  if (matches.length === 0) return <p>No matches found.</p>;

  return (
    <div className="container">
      <h2>Match Results</h2>
      {matches.map((m, idx) => (
        <div className="card" key={idx}>
          <p><strong>Organ:</strong> {m.organ}</p>
          <p><strong>Donor Name:</strong> {m.donorName}</p>
          <p><strong>Blood Group:</strong> {m.donorBloodGroup}</p>
          <p><strong>Location:</strong> {m.location.city}, {m.location.state}</p>
          <p><strong>Match Score:</strong> {m.matchScore}</p>
          <p><strong>Status:</strong> {m.status}</p>
        </div>
      ))}
    </div>
  );
}
