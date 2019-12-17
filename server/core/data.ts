import { Pool, PoolClient } from 'pg';

export interface Query<T> {
    text: string;
    values: Array<T>;
    rowMode: string;
}

export default class Data {
    public pool: Pool;

    constructor() {
        this.pool = new Pool({
            user: 'user',
            host: 'localhost',
            database: 'audi',
            password: 'example',
            port: 5432,
        });
    }

    public async read(text: string, params: any) {
        const client = await this.pool.connect();
        try {
            return await client.query(text, params);
        } 
        catch (e) {
            console.log(e);
        } finally {
            client.release();
        }
    }

    public async transaction(action: (client: PoolClient) => void) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            action(client);
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
}