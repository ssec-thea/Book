import { getPool } from '../src/db/database';

async function main() {
  const db = getPool();
  try {
    await db.query("ALTER TABLE books ADD COLUMN file_url VARCHAR(500) DEFAULT '' AFTER file_path");
    console.log('file_url column added');
  } catch (e: any) {
    if (e.message.includes('Duplicate')) console.log('file_url already exists');
    else console.log('Error:', e.message);
  }

  const [rows] = await db.query('SHOW COLUMNS FROM books');
  console.log((rows as any[]).map((r: any) => r.Field).join(', '));
  process.exit(0);
}
main();
