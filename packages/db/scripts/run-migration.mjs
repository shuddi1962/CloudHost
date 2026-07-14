import postgres from 'postgres';
import fs from 'fs';

const url = process.env.DATABASE_URL;
const sql = postgres(url, { max: 1 });

try {
  const raw = fs.readFileSync(process.argv[2], 'utf8');
  await sql.unsafe(raw);
  console.log('Migration applied successfully');
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
} finally {
  await sql.end();
}
