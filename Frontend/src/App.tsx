import React, { useState, useEffect } from "react";

function App() {
  const [spins, setSpins] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);
  const [result, setResult] = useState<string>("");

  // fetch data from backend when page loads
  
  useEffect(() => {
    fetch("http://localhost:8080/user/1")
    .then(res => res.json())
    .then(data => {
      setSpins(data.spins);
      setHistory(data.history || []);
    });
  }, []);

  // Spin handler

  const handleSpin = async () => {
    const res = await fetch("http://localhost:8080/spin/1", { method: "POST",});
    const data = await res.json();

    setResult (`You won ${data.prize} Kr!`);
    setSpins(data.spins);
    setHistory(data.history);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Spin the Wheel!</h1>
      <p>Spins left: {spins}</p>

      <button onClick={handleSpin} disabled={spins <= 0}>Spin!</button>

      {result && <h2>{result}</h2>}

      <h3>History:</h3>
      <ul>
        {history.map((h, i) => (
          <li key={i}>{h}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;