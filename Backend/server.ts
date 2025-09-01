import express from "express";
import fs from "fs";
import path from "path";

// User type definition
type User = {
    id: string;
    spins: number;
    history: { prize: number; date: string}[];
};

// User data (mock database)

const data_base = path.join(__dirname, "User.json")

// Load users from User.json or start empty
let users: Record<string, User> = {};
if (fs.existsSync(data_base)) {
    const fileContent = fs.readFileSync(data_base, "utf-8");
    users = JSON.parse(fileContent);
}

// saves users to User.json

function SaveUsers() {
    fs.writeFileSync(data_base, JSON.stringify(users, null, 2), "utf-8");
}

// the prize setup

const prizes = [
    { amount: 15, weight: 40 }, // 40% chance
    { amount: 50, weight: 30 }, // 30% chance
    { amount: 100, weight: 15 }, // 15% chance
    { amount: 150, weight: 9 }, // 9% chance
    { amount: 200, weight: 4 }, // 4% chance
    { amount: 300, weight: 2 }, // 2% chance
];

// random prize selection

function GetRandomPrize(): number {
   const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
   const rnd = Math.random() * totalWeight;
   let running = 0;
   for (const prize of prizes) {
       running += prize.weight;
       if (rnd < running) return prize.amount;
   }
    return prizes[0].amount; // Fallback
}

// Express setup
const app = express();
app.use(express.json());

// Endpoints
app.post("/order/:user_id", (req, res) => {
    const { order_id, user_id } = req.body;
    if (!user_id) return res.status(400).send("User ID is missing");

    if(!users[user_id]) {
        users[user_id] = { id: user_id, spins: 0, history: [] };
    }

    users[user_id].spins += 1;
    SaveUsers();

    res.send({ message: "Spin awarded", spins: users[user_id].spins, order_id});
});

app.post("/spin/:user_id", (req, res) => {
    const {user_id} = req.body;
    const user = users[user_id];
    if (!user) return res.status(404).send("User not found");
    if (user.spins <= 0) return res.status(400).send("No spins left");

    user.spins -= 1;
    const prize = GetRandomPrize();
    user.history.push({ prize, date: new Date().toISOString() });
});

app.get("/history/:user_id", (req, res) => {
    const user = users[req.params.user_id];
    if (!user) return res.status(404).send("User not found");

    res.send({ spins_left: user.spins, history: user.history });
});

// Server starter

app.listen(8080, () => console.log("Server is running on http://localhost:8080"));