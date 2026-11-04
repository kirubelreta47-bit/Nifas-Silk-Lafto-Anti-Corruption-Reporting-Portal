import { initDatabase } from './index.js';

async function main() {
  console.log('Seeding initial sub-city reports and admin user...');
  await initDatabase();
  console.log('Seeding process completed.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

