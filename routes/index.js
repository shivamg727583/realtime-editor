const express = require("express");
const router = express.Router();
const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Render the index page
router.get("/", (req, res) => {
  res.render("index");
});


// Login route with JWT
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Generalize error message
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, "jwtSecret");

    // Store the JWT in cookies
    res.cookie("token", token);
    console.log("login")
    
    // Redirect to documents page after successful login
    res.redirect("/documents");
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "An error occurred during login" });
  }
});

// Register route with JWT
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the email already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate JWT upon successful registration
  

    // Redirect to documents page after registration
    res.redirect("/documents");
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "An error occurred during registration" });
  }
});


module.exports =  router;
