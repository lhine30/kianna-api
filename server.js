const express = require("express");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());

// Temporary storage (resets when the server restarts)
const users = [];

app.get("/", (req, res) => {
  res.send("Kianna API is running");
});

// SIGN UP
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Please fill in all fields" });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (users.find((u) => u.email === cleanEmail)) {
    return res.status(409).json({ success: false, message: "This email is already registered" });
  }

  const hashed = await bcrypt.hash(password, 10);
  users.push({ name: name.trim(), email: cleanEmail, password: hashed });

  res.status(201).json({ success: true, message: "Account created" });
});

// LOG IN
app.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please fill in all fields" });
  }

  const user = users.find((u) => u.email === email.trim().toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: "Wrong email or password" });
  }

  res.json({ success: true, message: "Login successful", name: user.name });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
