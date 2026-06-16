const db = require('../config/db');

db.query("SELECT * FROM access_logs WHERE DATE(cree_le) = CURDATE()", (err, rows) => {
  if (err) {
    console.error('❌ CURDATE Query failed:', err.message);
  } else {
    console.log('✅ CURDATE Query succeeded:', rows);
  }

  db.query("SELECT * FROM access_logs WHERE cree_le::date = CURRENT_DATE", (err, rows) => {
    if (err) {
      console.error('❌ PG DATE Query failed:', err.message);
    } else {
      console.log('✅ PG DATE Query succeeded:', rows.length, 'logs found.');
    }
    process.exit(0);
  });
});
