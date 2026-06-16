const db = require('../config/db');

db.query("SELECT TIMESTAMPDIFF(HOUR, NOW() - INTERVAL '1 day', NOW()) as test", (err, rows) => {
  if (err) {
    console.error('❌ Query failed:', err.message);
  } else {
    console.log('✅ Query succeeded:', rows);
  }
  process.exit(0);
});
