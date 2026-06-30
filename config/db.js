import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '',
  database: process.env.PG_DATABASE || 'car_booking',
  port: Number(process.env.PG_PORT || 5432)
});

function toPostgresParams(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

export const execute = async (sql, params = []) => {
  const processedSql = toPostgresParams(sql);
  console.log('Executing query:', processedSql);
  console.log('With params:', params);
  const result = await pool.query(processedSql, params);
  return [result.rows, result];
};

export const query = pool.query.bind(pool);