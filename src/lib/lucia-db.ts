import { DB_ADAPTER } from './db';
import { lucia } from './lucia';
import { Argon2id } from 'oslo/password';
import { users, resetTokens, verificationTokens } from './schema';
import { isWithinExpiration, generateRandomString } from './helpers';
import { eq } from 'drizzle-orm';

// read from env
const DISABLE_EMAIL_VERIFY = Boolean(process.env.DISABLE_EMAIL_VERIFY || false);

// expire time (15 minutes)
const EXPIRES_IN = 1000 * 60 * 15;

/**
 * Create a new user from signup request
 * @returns ID and Session Cookie if successful
 * @throws 'AUTH_NAME_EXISTS' if non unique
 * @throws 'AUTH_EMAIL_EXISTS' if non unique
 */
export const safeCreateUser = async (userName: string, userEmail: string, userPassword: string) => {
    const IS_INITIAL = (await DB_ADAPTER.select().from(users)).length === 0;
    const NAME_EXISTS = (await DB_ADAPTER.select().from(users).where(eq(users.username, userName))).length > 0;
    const EMAIL_EXISTS = (await DB_ADAPTER.select().from(users).where(eq(users.email, userEmail))).length > 0;
    if (NAME_EXISTS === true) {
        throw Error('AUTH_NAME_EXISTS');
    } else if (EMAIL_EXISTS === true) {
        throw Error('AUTH_EMAIL_EXISTS');
    } else {
        const PASSWORD_HASH = await new Argon2id().hash(userPassword);
        const USER_ID = crypto.randomUUID().toString();
        await DB_ADAPTER.insert(users).values({
            id: USER_ID,
            hashed_password: PASSWORD_HASH,
            email: userEmail,
            username: userName,
            user_role: String(IS_INITIAL ? 'admin' : 'user'),
            user_team_id: '',
            user_avatar: 'wolf',
            user_affiliation: '',
            user_firstname: '',
            user_lastname: '',
            is_verified: DISABLE_EMAIL_VERIFY,
            is_blocked: false
        });
        const SESSION = await lucia.createSession(USER_ID, {});
        return { ID: USER_ID, COOKIE: lucia.createSessionCookie(SESSION.id) };
    }
}

/**
 * Verify a user by login request
 * @returns ID and Session Cookie if successful
 * @throws 'AUTH_INVALID' if non match or non exist
 */
export const safeVerifyUser = async (userEmail: string, userPassword: string) => {
    const USER = (await DB_ADAPTER.select().from(users).where(eq(users.email, userEmail))).at(0);
    if (USER === undefined) {
        throw Error('AUTH_INVALID');
    } else {
        const PASSWORD_MATCH = await new Argon2id().verify(USER.hashed_password, userPassword);
        if (PASSWORD_MATCH === false) {
            throw Error('AUTH_INVALID');
        } else {
            const SESSION = await lucia.createSession(USER.id, {});
            return { ID: USER.id, COOKIE: lucia.createSessionCookie(SESSION.id) };
        }
    }
}

export const generateEmailverificationTokens = async (userId: string) => {
    const storedUserTokens = await DB_ADAPTER.select()
        .from(verificationTokens)
        .where(eq(verificationTokens.user_id, userId));
    if (storedUserTokens.length > 0) {
        const reusableStoredToken = storedUserTokens.find((token: any) => {
            return isWithinExpiration(Number(token.expires));
        });
        if (reusableStoredToken) return reusableStoredToken.id;
    }
    const token = generateRandomString(24);
    await DB_ADAPTER.insert(verificationTokens).values({
        id: token,
        expires: new Date().getTime() + EXPIRES_IN,
        user_id: userId
    });
    return token;
};

export const generatePasswordresetTokens = async (email: string) => {
    const targetUser = await DB_ADAPTER.select().from(users).where(eq(users.email, email));
    if (targetUser.length === 0) return false;
    const storedUserTokens = await DB_ADAPTER.select().from(resetTokens).where(eq(resetTokens.user_id, targetUser[0].id));
    if (storedUserTokens.length > 0) {
        const reusableStoredToken = storedUserTokens.find((token) => {
            return isWithinExpiration(Number(token.expires));
        });
        if (reusableStoredToken) return reusableStoredToken.id;
    }
    const token = generateRandomString(24);
    await DB_ADAPTER.insert(resetTokens).values({
        id: token,
        expires: Date.now() + EXPIRES_IN,
        user_id: targetUser[0].id
    });
    return token;
};

export const validateEmailverificationTokens = async (token: string) => {
    const storedTokens = await DB_ADAPTER.select().from(verificationTokens).where(eq(verificationTokens.id, token));
    if (storedTokens.length === 0) return false;
    await DB_ADAPTER.delete(verificationTokens).where(eq(verificationTokens.id, token));
    if (!isWithinExpiration(Number(storedTokens[0].expires))) {
        return false;
    }
    return storedTokens[0].user_id;
};

export const validatePasswordresetTokens = async (token: string) => {
    const storedTokens = await DB_ADAPTER.select().from(resetTokens).where(eq(resetTokens.id, token));
    if (storedTokens.length = 0) return false;
    await DB_ADAPTER.delete(resetTokens).where(eq(resetTokens.id, token));
    const tokenExpires = Number(storedTokens[0].expires);
    if (!isWithinExpiration(tokenExpires)) {
        return false;
    }
    return storedTokens[0].user_id;
};

export const isValidPasswordresetTokens = async (token: string) => {
    const storedTokens = await DB_ADAPTER.select().from(resetTokens).where(eq(resetTokens.id, token));
    if (storedTokens.length === 0) return false;
    const tokenExpires = Number(storedTokens[0].expires);
    if (!isWithinExpiration(tokenExpires)) {
        await DB_ADAPTER.delete(resetTokens).where(eq(resetTokens.id, token));
        return false;
    }
    return true;
};

export const isRegisteredEmail = async (email: string) => {
    const storedUsers = await DB_ADAPTER.select().from(users).where(eq(users.email, email));
    if (storedUsers.length === 0) return false;
    return true;
};
