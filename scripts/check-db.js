import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: Number(process.env.PG_PORT)
});

async function main() {
  const connection = await pool.query('select current_database(), current_user');
  console.log('Connected:', connection.rows[0]);

  const tables = await pool.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
    order by table_name
  `);
  console.log('Tables:', tables.rows);

  const users = await pool.query('select id, email, role from users order by id');
  console.log('Users:', users.rows);
}

main()
  .catch((error) => {
    console.error('Database check failed:', error.code || error.name);
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());