const db = require('../config/db');

db.query("SELECT EXTRACT(EPOCH FROM (NOW() - (NOW() - INTERVAL '1 day')))::integer / 3600 as test", (err, rows) => {
  if (err) {
    console.error('❌ Query failed:', err.message);
  } else {
    console.log('✅ Query succeeded:', rows);
  }
  process.exit(0);
});
