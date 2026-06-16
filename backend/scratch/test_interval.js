const db = require('../config/db');

db.query("SELECT NOW() - INTERVAL 48 HOUR as test", (err, rows) => {
  if (err) {
    console.error('❌ Query failed:', err.message);
  } else {
    console.log('✅ Query succeeded:', rows);
  }
  process.exit(0);
});
