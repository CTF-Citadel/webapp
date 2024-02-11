import pg from "pg";
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

// read from env
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;

// connection for normal interaction
export const DB_CONN = new pg.Pool({
    host: DB_HOST,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASS
});
export const DB_ADAPTER = drizzle(DB_CONN);

// run migrate
await migrate(DB_ADAPTER, { migrationsFolder: './drizzle' });
