const pool = require('./db');

async function migrateNotifications() {
  const client = await pool.connect();
  try {
    console.log('Creating notifications table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
        link VARCHAR(500),
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
    `);

    console.log('✅ Notifications table created successfully');

    // Create sample notifications for testing
    console.log('Creating sample notifications...');
    
    const usersResult = await client.query('SELECT id FROM users LIMIT 5');
    
    for (const user of usersResult.rows) {
      await client.query(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES 
          ($1, 'Welcome to ProtexxaLearn', 'Start your learning journey today!', 'success', '/courses'),
          ($1, 'New Assignment Available', 'Check out the latest assignment in your course', 'info', '/assignments')
        ON CONFLICT DO NOTHING
      `, [user.id]);
    }

    console.log('✅ Sample notifications created');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

migrateNotifications()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
