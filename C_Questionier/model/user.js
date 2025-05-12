const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { encryptHybrid, decryptHybrid } = require('../encryption');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  encrypted: {
    random: String,
    authTag: String,
    ciphertext: String,
    wrappedKeys: [ { recipient: String, wrappedKey: String } ]
  }
});

// Register with hybrid encryption for self+others
userSchema.statics.register = async function(username, password, personalData) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const payload = encryptHybrid(personalData);
  return this.create({ username, passwordHash: hash, encrypted: payload });
};

// Authenticate returns user doc
userSchema.statics.authenticate = async function(username, password) {
  const user = await this.findOne({ username });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
};

userSchema.methods.decryptData = function() {
  // 'self' corresponds to recipientIndex 0 in encryptHybrid ordering
  return decryptHybrid(this.encrypted);
};

module.exports = mongoose.model('User', userSchema);