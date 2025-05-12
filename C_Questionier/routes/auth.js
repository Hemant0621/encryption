const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const { jwtSecret } = require('../config');

// Register: username, password, plus personal data fields
router.post('/register', async (req, res) => {
  try {
    const { username, password, ...personal } = req.body;
    const user = await User.register(username, password, personal);
    res.status(201).json({ id: user._id, username: user.username });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login: returns JWT
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ sub: user._id, username: user.username }, jwtSecret);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;