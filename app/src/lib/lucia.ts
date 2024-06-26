import { Lucia, TimeSpan } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { DB_ADAPTER } from './db';
import { sessions, users } from './schema';

// init drizzle
const LUCIA_ADAPTER = new DrizzlePostgreSQLAdapter(DB_ADAPTER, sessions, users);

export const lucia = new Lucia(LUCIA_ADAPTER, {
    sessionExpiresIn: new TimeSpan(30, 'd'),
    sessionCookie: {
        expires: false,
        attributes: {
            secure: import.meta.env.PROD,
            sameSite: 'strict'
        }
    },
    getUserAttributes: (attributes) => {
        return {
            username: attributes.username,
            email: attributes.email,
            role: attributes.role,
            team_id: attributes.team_id,
            avatar: attributes.avatar,
            affiliation: attributes.affiliation,
            firstname: attributes.firstname,
            lastname: attributes.lastname,
            is_blocked: attributes.is_blocked,
            is_verified: attributes.is_verified
        };
    }
});

declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: {
            username: string;
            email: string;
            role: string;
            team_id: string;
            avatar: string;
            affiliation: string;
            firstname: string;
            lastname: string;
            is_blocked: boolean;
            is_verified: boolean;
        };
    }
}
