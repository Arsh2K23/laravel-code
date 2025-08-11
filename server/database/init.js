import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const config = {
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../../database.sqlite')
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, 'migrations')
  },
  seeds: {
    directory: path.join(__dirname, 'seeds')
  }
};

const db = knex(config);

export async function initializeDatabase() {
  try {
    // Run migrations
    await db.migrate.latest();
    console.log('Migrations completed');

    // Check if we need to seed
    const userCount = await db('users').count('id as count').first();
    if (userCount.count === 0) {
      await db.seed.run();
      console.log('Database seeded');
    }

    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

export { db };