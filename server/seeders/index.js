import { initializeDatabase } from '../database/init.js';

async function runSeeds() {
  try {
    console.log('Starting database seeding...');
    
    // Initialize database and run seeds
    const db = await initializeDatabase();
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
}

runSeeds();