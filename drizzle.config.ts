import type { Config } from 'drizzle-kit';

export default {
    schema: './src/lib/schema.ts',
    out: './drizzle',
    driver: 'mysql2',
    dbCredentials: {
        host: process.env.DB_HOST || '',
        user: process.env.DB_USER || '',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || ''
    }
} satisfies Config;
