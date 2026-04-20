const db = require('./config/db');

db.query('SHOW TABLES', (err, rows) => {
  if (err) {
    console.error('Error fetching tables:', err.message);
    process.exit(1);
  }
  console.log('Tables in database:', rows);
  
  db.query('SELECT COUNT(*) as count FROM tickets', (err, rows) => {
    if (err) {
      console.error('Error fetching tickets count:', err.message);
    } else {
      console.log('Tickets count:', rows[0].count);
    }
    process.exit(0);
  });
});
