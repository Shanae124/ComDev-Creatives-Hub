const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function rotateSecurity() {
  if (!fs.existsSync(DB_PATH)) {
    console.log('No db.json found. Nothing to rotate.');
    return;
  }

  const raw = fs.readFileSync(DB_PATH, 'utf8');
  const db = JSON.parse(raw);

  if (!db.security) {
    db.security = { tokenVersion: 1 };
  }

  db.security.tokenVersion = (Number(db.security.tokenVersion) || 1) + 1;

  const forceReset = process.argv.includes('--force-reset');
  if (forceReset && Array.isArray(db.users)) {
    db.users = db.users.map((user) => ({
      ...user,
      force_password_reset: true,
    }));
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

  console.log(`Security rotation complete. tokenVersion=${db.security.tokenVersion}`);
  if (forceReset) {
    console.log('All users flagged for password reset.');
  }
}

rotateSecurity();
