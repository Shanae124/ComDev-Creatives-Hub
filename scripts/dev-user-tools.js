const pool = require('../db');

async function main() {
  const [action, email] = process.argv.slice(2);

  if (!action || !email) {
    console.log('\nUsage:');
    console.log('  node scripts/dev-user-tools.js verify <email>   # mark email as verified');
    console.log('  node scripts/dev-user-tools.js delete <email>   # delete user by email');
    process.exit(1);
  }

  try {
    if (action === 'verify') {
      const res = await pool.query(
        `UPDATE users
         SET email_verified = TRUE,
             verification_token = NULL,
             verification_token_expires = NULL
         WHERE email = $1
         RETURNING id, name, email, email_verified`,
        [email]
      );
      if (res.rowCount === 0) {
        console.log(`No user found for email: ${email}`);
      } else {
        console.log('✅ User verified:', res.rows[0]);
      }
    } else if (action === 'delete') {
      const res = await pool.query(
        `DELETE FROM users WHERE email = $1 RETURNING id, name, email`,
        [email]
      );
      if (res.rowCount === 0) {
        console.log(`No user found for email: ${email}`);
      } else {
        console.log('🗑️  User deleted:', res.rows[0]);
      }
    } else {
      console.log(`Unknown action: ${action}`);
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Operation failed:', err.message);
    process.exit(1);
  } finally {
    try { pool.end(); } catch {}
  }
}

main();
