import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

type User = {
  id: string;
  spins: number;
  history: { prize: number; date: string }[];
};

const data_base = path.join(__dirname, "User.json");

let users: Record<string, User> = {};
if (fs.existsSync(data_base)) {
  const fileContent = fs.readFileSync(data_base, "utf-8");
  users = JSON.parse(fileContent || "{}");
}

function SaveUsers() {
  fs.writeFileSync(data_base, JSON.stringify(users, null, 2), "utf-8");
}

const prizes = [
  { amount: 15, weight: 40 },
  { amount: 50, weight: 30 },
  { amount: 100, weight: 15 },
  { amount: 150, weight: 9 },
  { amount: 200, weight: 4 },
  { amount: 300, weight: 2 },
];

function GetRandomPrize(): number {
  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
  let rnd = Math.random() * totalWeight;
  let running = 0;
  for (const prize of prizes) {
    running += prize.weight;
    if (rnd < running) return prize.amount;
  }
  return prizes[0].amount;
}

const app = express();
app.use(cors());
app.use(express.json());

// GET user info
app.get("/user/:user_id", (req, res) => {
  const user = users[req.params.user_id];
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ spins: user.spins, history: user.history });
});

// POST spin
app.post("/spin/:user_id", (req, res) => {
  const user = users[req.params.user_id];
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.spins <= 0) return res.status(400).json({ error: "No spins left" });

  user.spins -= 1;
  const prize = GetRandomPrize();
  user.history.push({ prize, date: new Date().toISOString() });
  SaveUsers();

  res.json({ prize, spins: user.spins, history: user.history });
});

// POST order → add a spin
app.post("/order", (req, res) => {
  const { user_id, order_id } = req.body;
  if (!user_id) return res.status(400).json({ error: "user_id required" });

  if (!users[user_id]) users[user_id] = { id: user_id, spins: 0, history: [] };
  users[user_id].spins += 1;
  SaveUsers();

  res.json({ message: "Spin awarded", spins: users[user_id].spins, order_id });
});

app.listen(8080, () => console.log("Server running on http://localhost:8080"));