import React, { useState, useEffect } from "react";
import './App.css';
function App() {
  const [spins, setSpins] = useState<number>(0);
  const [history, setHistory] = useState<{ prize: number; date: string }[]>([]);
  const [result, setResult] = useState<string>("");

  const fetchUserData = () => {
    fetch("http://localhost:8080/user/1")
      .then(res => res.json())
      .then(data => {
        setSpins(data.spins);
        setHistory(data.history || []);
      });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Spin handler
  const handleSpin = async () => {
    const res = await fetch("http://localhost:8080/spin/1", { method: "POST" });
    const data = await res.json();

    setResult(`You won ${data.prize} Kr!`);
    setSpins(data.spins);
    setHistory(data.history);
  };

  // Simulate order → adds a spin
  const handleAddSpin = async () => {
    const res = await fetch("http://localhost:8080/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "1", order_id: Date.now().toString() }),
    });
    const data = await res.json();
    setSpins(data.spins);
  };

  return (
    <div className="container">
      <h1>Spin the Wheel!</h1>
      <p>Spins left: {spins}</p>

      <button onClick={handleSpin} disabled={spins <= 0}>Spin!</button>
      <button onClick={handleAddSpin} style={{ marginLeft: "10px" }}>
        Simulate Order (Add Spin)
      </button>

      {result && <h2>{result}</h2>}

      <h3>History:</h3>
      <ul>
        {history.map((h, i) => (
          <li key={i}>{h.prize} Kr - {new Date(h.date).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;