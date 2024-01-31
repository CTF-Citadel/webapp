import { DrizzleMySQLAdapter } from '@lucia-auth/adapter-drizzle';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { userTable, sessionTable } from './schema.ts';
import * as schema from './schema';

// read from env
const DB_USER = 'root';
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;

// init drizzle
const LUCIA_CONN = await mysql.createConnection({
    host: DB_HOST,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASS
});
const LUCIA_DB = drizzle(LUCIA_CONN);
export const LUCIA_ADAPTER = new DrizzleMySQLAdapter(LUCIA_DB, sessionTable, userTable);

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
const MIGRATE_DB = drizzle(LUCIA_CONN);

// run migrate
await migrate(MIGRATE_DB, { migrationsFolder: './drizzle' });
await MIGRATE_CONN.end();
