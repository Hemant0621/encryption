const crypto = require("crypto");
const {
  recipient,
  privateKey,
  publicKey,
} = require("./config");

function encryptHybrid(plaintext) {
  // Generate AES key & IV
  const aesKey = crypto.randomBytes(32);
  const random = crypto.randomBytes(12);

  // AES-GCM encrypt
  const cipher = crypto.createCipheriv("aes-256-gcm", aesKey, random);
  const data = Buffer.concat([
    cipher.update(JSON.stringify(plaintext), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();


  const wrappedKeys = publicKey.map((pubObj) => {
    const [recipient, pubPem] = Object.entries(pubObj)[0]; // extract key and value
    const wrapped = crypto.publicEncrypt(pubPem, aesKey);
    return {
      recipient,
      wrappedKey: wrapped.toString("base64"),
    };
  });

  return {
    random: random.toString("base64"),
    authTag: authTag.toString("base64"),
    ciphertext: data.toString("base64"),
    wrappedKeys,
  };
}

function decryptHybrid(payload) {
  const { random, authTag, ciphertext, wrappedKeys } = payload;
  // find entry for this recipient
  const entry = wrappedKeys.find((w) => w.recipient === recipient);
  if (!entry) throw new Error("No wrapped key for this recipient");

  // unwrap AES key
  const aesKey = crypto.privateDecrypt(
    privateKey,
    Buffer.from(entry.wrappedKey, "base64")
  );

  // decrypt AES-GCM
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    aesKey,
    Buffer.from(random, "base64")
  );
  decipher.setAuthTag(Buffer.from(authTag, "base64"));
  const plain = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final(),
  ]);
  return JSON.parse(plain.toString("utf8"));
}

module.exports = { encryptHybrid, decryptHybrid };
