const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const { jwtSecret } = require('../config');
const { default: axios } = require('axios');
const { decryptHybrid } = require('../encryption');

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
    const user = await User.findOne({"username":req.user.username});
    if (!user) return res.status(404).json({ error: 'User not found' });
    const personal = user.decryptData();
    res.json({ id: user._id, username: user.username, personal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/data', async (req, res) => {
  try {
    const { username } = req.query;

    const response = await axios.get(`http://localhost:3001/users/data`, {
      params: { username }
    });
    res.json(decryptHybrid(response.data.encrypted)); 
  } catch (error) {
    console.error('Failed to fetch encrypted data from App A:', error);
    throw error;
  }
});


module.exports = router;