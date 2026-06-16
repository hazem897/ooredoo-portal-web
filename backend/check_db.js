const db = require('./config/db');

db.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'", (err, rows) => {
  if (err) {
    console.error('Error fetching tables:', err.message);
    process.exit(1);
  }
  console.log('Tables in database:', rows.map((row) => row.tablename));
  
  db.query('SELECT COUNT(*) as count FROM tickets', (err, rows) => {
    if (err) {
      console.error('Error fetching tickets count:', err.message);
    } else {
      console.log('Tickets count:', rows[0].count);
    }
    process.exit(0);
  });
});
