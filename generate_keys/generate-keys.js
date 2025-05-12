// generate-keys.js
const { generateKeyPairSync, createPublicKey } = require('crypto');
const fs = require('fs');
const path = require('path');

function genOne() {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki',  format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return {
    privB64: Buffer.from(privateKey).toString('base64'),
    pubB64:  Buffer.from(publicKey).toString('base64'),
  };
}

// Generate for each app
const apps = { AppA: genOne(), AppB: genOne(), AppC: genOne() };

// Helper to build .env text for one app
function buildEnv(appName) {
  const me = apps[appName];
  const others = Object.keys(apps).filter(a => a!==appName);
  let lines = [
    `APP_NAME=${appName}`,
    `PORT=${appName==='AppA'?3001:appName==='AppB'?3002:3003}`,
    `MONGODB_URI=mongodb://localhost:27017/${appName.toLowerCase()}_db`,
    '',
    `PRIVATE_KEY_BASE64=${me.privB64}`,
    `PUBLIC_KEY_BASE64=${me.pubB64}`,
    ''
  ];
  for (let o of others) {
    lines.push(`${o.toUpperCase()}_PUBLIC_KEY_BASE64=${apps[o].pubB64}`);
  }
  return lines.join('\n');
}

// Write files
for (let app of Object.keys(apps)) {
  const fname = path.join(__dirname, `${app.toLowerCase()}.env`);
  fs.writeFileSync(fname, buildEnv(app), 'utf8');
  console.log(`Wrote ${fname}`);
}
