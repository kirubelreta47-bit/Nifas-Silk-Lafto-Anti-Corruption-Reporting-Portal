import { initDatabase } from './index.js';

async function main() {
  console.log('Running Neon PostgreSQL database migration...');
  const success = await initDatabase();
  if (success) {
    console.log('Migration completed successfully.');
  } else {
    console.log('Migration completed (in-memory mode or DATABASE_URL not set).');
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

