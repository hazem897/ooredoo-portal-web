const db = require('../config/db');

db.query("SELECT * FROM tickets LIMIT 1", (err, rows) => {
  if (err) {
    console.error('❌ Query failed:', err.message);
  } else {
    console.log('✅ Columns in tickets:', Object.keys(rows[0] || {}));
  }
  process.exit(0);
});
