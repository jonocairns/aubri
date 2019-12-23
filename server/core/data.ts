import dotenv from 'dotenv';
import {Pool, PoolClient} from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true',
});

export const query = async (text: string, params: Array<string>) => {
  const client = await pool.connect();
  try {
    return pool.query(text, params);
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    client.release();
  }
};

export const trans = async (fnc: (client: PoolClient) => void) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await fnc(client);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};
