const db = require('./config/db');

db.query('DESCRIBE tickets', (err, rows) => {
  if (err) {
    console.error('Error describing tickets:', err.message);
    process.exit(1);
  }
  console.log('Tickets table structure:', rows);
  process.exit(0);
});
