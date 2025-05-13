require("dotenv").config();
const mongoose = require("mongoose");

function loadKey(base64) {
  return Buffer.from(base64, "base64").toString("utf-8");
}

module.exports = {
  appName: process.env.APP_NAME,
  port: process.env.PORT,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,

  recipient: process.env.recipient,
  privateKey: loadKey(process.env.forum_PRIVATE_KEY_BASE64),
  publicKey:  [
    { telemed: loadKey(process.env.telemed_PUBLIC_KEY_BASE64) },
    { forum: loadKey(process.env.forum_PUBLIC_KEY_BASE64)},
    { questionier: loadKey(process.env.questionier_PUBLIC_KEY_BASE64)},
  ]
};
