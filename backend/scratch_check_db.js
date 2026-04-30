const db = require('./config/db');
db.query('SELECT id, email, photo_url FROM users', (err, rows) => {
  if (err) console.error(err);
  else console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
});
