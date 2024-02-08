import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import * as schema from './schema';

// read from env
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;

// connection for normal interaction
const DB_CONN = await mysql.createPool({
    host: DB_HOST,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASS
});
export const DB_ADAPTER = drizzle(DB_CONN, { schema: schema, mode: 'default' });

// connection for migrations
const MIGRATE_CONN = await mysql.createConnection({
    host: DB_HOST,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASS
});
const MIGRATE_DB = drizzle(MIGRATE_CONN);

// check run migrate

MIGRATE_DB.select().from(schema.users)
await migrate(MIGRATE_DB, { migrationsFolder: './drizzle' });
await MIGRATE_CONN.end();
