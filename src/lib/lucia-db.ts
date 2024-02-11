import { DB_ADAPTER } from './db';
import { users, resetTokens, verificationTokens } from './schema';
import { isWithinExpiration, generateRandomString } from './helpers';
import { eq } from 'drizzle-orm';

// expire time (15 minutes)
const EXPIRES_IN = 1000 * 60 * 15;

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
    if (targetUser.length == 0) return false;
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
    if (storedTokens.length == 0) return false;
    await DB_ADAPTER.delete(verificationTokens).where(eq(verificationTokens.id, token));
    if (!isWithinExpiration(Number(storedTokens[0].expires))) {
        return false;
    }
    return storedTokens[0].user_id;
};

export const validatePasswordresetTokens = async (token: string) => {
    const storedTokens = await DB_ADAPTER.select().from(resetTokens).where(eq(resetTokens.id, token));
    if (storedTokens.length == 0) return false;
    await DB_ADAPTER.delete(resetTokens).where(eq(resetTokens.id, token));
    const tokenExpires = Number(storedTokens[0].expires);
    if (!isWithinExpiration(tokenExpires)) {
        return false;
    }
    return storedTokens[0].user_id;
};

export const isValidPasswordresetTokens = async (token: string) => {
    const storedTokens = await DB_ADAPTER.select().from(resetTokens).where(eq(resetTokens.id, token));
    if (storedTokens.length == 0) return false;
    const tokenExpires = Number(storedTokens[0].expires);
    if (!isWithinExpiration(tokenExpires)) {
        await DB_ADAPTER.delete(resetTokens).where(eq(resetTokens.id, token));
        return false;
    }
    return true;
};

export const isRegisteredEmail = async (email: string) => {
    const storedUsers = await DB_ADAPTER.select().from(users).where(eq(users.email, email));
    if (storedUsers.length == 0) return false;
    return true;
};

export const isInitialUser = async () => {
    const USERS = await DB_ADAPTER.select().from(users);
    if (USERS.length > 0) return false;
    return true;
};
