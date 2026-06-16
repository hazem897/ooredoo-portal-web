import { query } from './config/db';

query("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'tickets' ORDER BY ordinal_position", (err, rows) => {
  if (err) {
    console.error('Error describing tickets:', err.message);
    process.exit(1);
  }
  console.log('Tickets table structure:', rows);
  process.exit(0);
});
