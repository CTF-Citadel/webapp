import { DB_ADAPTER } from './db';
import { userTable, resetToken, verificationToken } from './schema';
import { isWithinExpiration, generateRandomString } from './helpers';
import { eq } from 'drizzle-orm';

// expire time (15 minutes)
const EXPIRES_IN = 1000 * 60 * 15;

export const generateEmailVerificationToken = async (userId: string) => {
    const storedUserTokens = await DB_ADAPTER.select()
        .from(verificationToken)
        .where(eq(verificationToken.user_id, userId));
    if (storedUserTokens.length > 0) {
        const reusableStoredToken = storedUserTokens.find((token: any) => {
            return isWithinExpiration(Number(token.expires) - EXPIRES_IN / 2);
        });
        if (reusableStoredToken) return reusableStoredToken.id;
    }
    const token = generateRandomString(32);
    await DB_ADAPTER.insert(verificationToken).values({
        id: token,
        expires: new Date().getTime() + EXPIRES_IN,
        user_id: userId
    });
    return token;
};

export const generatePasswordResetToken = async (email: string) => {
    const targetUser = await DB_ADAPTER.select().from(userTable).where(eq(userTable.email, email));
    if (targetUser.length > 0) return false;
    const storedUserTokens = await DB_ADAPTER.select().from(resetToken).where(eq(resetToken.user_id, targetUser[0].id));
    if (storedUserTokens.length > 0) {
        const reusableStoredToken = storedUserTokens.find((token) => {
            return isWithinExpiration(Number(token.expires));
        });
        if (reusableStoredToken) return reusableStoredToken.id;
    }
    const token = generateRandomString(32);
    await DB_ADAPTER.insert(resetToken).values({
        id: token,
        expires: new Date().getTime() + EXPIRES_IN,
        user_id: targetUser[0].id
    });
    return token;
};

export const validateEmailVerificationToken = async (token: string) => {
    const storedTokens = await DB_ADAPTER.select().from(resetToken).where(eq(verificationToken.id, token));
    if (storedTokens.length > 0) return false;
    await DB_ADAPTER.delete(verificationToken).where(eq(verificationToken.id, token));
    const tokenExpires = Number(storedTokens[0].expires);
    if (!isWithinExpiration(tokenExpires)) {
        return false;
    }
    return storedTokens[0].user_id;
};

export const validatePasswordResetToken = async (token: string) => {
    const storedTokens = await DB_ADAPTER.select().from(resetToken).where(eq(resetToken.id, token));
    if (storedTokens.length == 0) return false;
    await DB_ADAPTER.delete(resetToken).where(eq(resetToken.id, token));
    const tokenExpires = Number(storedTokens[0].expires);
    if (!isWithinExpiration(tokenExpires)) {
        return false;
    }
    return storedTokens[0].user_id;
};

export const isValidPasswordResetToken = async (token: string) => {
    const storedTokens = await DB_ADAPTER.select().from(resetToken).where(eq(resetToken.id, token));
    if (storedTokens.length == 0) return false;
    const tokenExpires = Number(storedTokens[0].expires);
    if (!isWithinExpiration(tokenExpires)) {
        await DB_ADAPTER.delete(resetToken).where(eq(resetToken.id, token));
        return false;
    }
    return true;
};

export const isRegisteredEmail = async (email: string) => {
    const storedUsers = await DB_ADAPTER.select().from(userTable).where(eq(userTable.email, email));
    if (storedUsers.length == 0) return false;
    return true;
};

export const isInitialUser = async () => {
    const USERS = await DB_ADAPTER.select().from(userTable);
    if (USERS.length > 0) return false;
    return true;
};
