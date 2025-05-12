const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const { jwtSecret } = require('../config');

// Middleware: authenticate JWT
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Get decrypted user details (self)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({username: req.user.username});
    console.log(req.user);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const personal = user.decryptData();
    res.json({ id: user._id, username: user.username, personal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/data', async (req, res) => {
  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const payload = await User.findOne({username});
    if (!payload) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(payload); // returns ciphertext, random, authTag, wrappedKeys
  } catch (err) {
    console.error('Error fetching data:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;