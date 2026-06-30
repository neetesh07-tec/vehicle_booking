import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: Number(process.env.PG_PORT)
});

async function main() {
  const schemaPath = path.join(__dirname, '..', 'postgres_schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schema);
  console.log('PostgreSQL tables and demo data are ready.');
}

main()
  .catch((error) => {
    console.error('Database setup failed:', error.code || error.name);
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());