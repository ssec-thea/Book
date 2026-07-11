import { getPool } from '../src/db/database';

async function main() {
  const db = getPool();
  await db.query("ALTER TABLE books MODIFY COLUMN cover TEXT");
  console.log('cover column changed to TEXT');
  process.exit(0);
}
main();
