import { PRISMA_CONNECTION } from "./lucia";
import { generateRandomString, isWithinExpiration } from "lucia/utils";

// expire time (15 minutes)
const EXPIRES_IN = 1000 * 60 * 15;

export const generateEmailVerificationToken = async (userId: string) => {
    const storedUserTokens = await PRISMA_CONNECTION.email_verification_token.findMany({
        where: {
            user_id: userId,
        },
    });
    if (storedUserTokens.length > 0) {
        const reusableStoredToken = storedUserTokens.find((token) => {
            return isWithinExpiration(Number(token.expires) - EXPIRES_IN / 2);
        });
        if (reusableStoredToken) return reusableStoredToken.id;
    }
    const token = generateRandomString(64);
    await PRISMA_CONNECTION.email_verification_token.create({
        data: {
            id: token,
            expires: new Date().getTime() + EXPIRES_IN,
            user_id: userId
        },
    })
    return token;
};

export const generatePasswordResetToken = async (email: string) => {
    const targetUser = await PRISMA_CONNECTION.user.findUnique({
        where: {
            email: email,
        },
    });
    if (targetUser == null) return false;
    const storedUserTokens = await PRISMA_CONNECTION.password_reset_token.findMany({
        where: {
            user_id: targetUser.id,
        },
    });
    if (storedUserTokens.length > 0) {
        const reusableStoredToken = storedUserTokens.find((token) => {
            return isWithinExpiration(Number(token.expires) - EXPIRES_IN / 2);
        });
        if (reusableStoredToken) return reusableStoredToken.id;
    }
    const token = generateRandomString(64);
    await PRISMA_CONNECTION.password_reset_token.create({
        data: {
            id: token,
            expires: new Date().getTime() + EXPIRES_IN,
            user_id: targetUser.id
        },
    })
    return token;
};

export const validateEmailVerificationToken = async (token: string) => {
    const storedToken = await PRISMA_CONNECTION.email_verification_token.findUnique({
        where: {
            id: token,
        },
    });
    if (storedToken == null) return false;
    await PRISMA_CONNECTION.email_verification_token.deleteMany({
        where: {
            id: token,
        },
    })
    const tokenExpires = Number(storedToken.expires);
    if (!isWithinExpiration(tokenExpires)) {
        return false;
    }
    return storedToken.user_id;
};

export const validatePasswordResetToken = async (token: string) => {
    const storedToken = await PRISMA_CONNECTION.password_reset_token.findUnique({
        where: {
            id: token,
        },
    });
    if (storedToken == null) return false;
    await PRISMA_CONNECTION.password_reset_token.deleteMany({
        where: {
            id: token,
        },
    })
    const tokenExpires = Number(storedToken.expires);
    if (!isWithinExpiration(tokenExpires)) {
        return false;
    }
    return storedToken.user_id;
};

export const isValidPasswordResetToken = async (token: string) => {
    const storedToken = await PRISMA_CONNECTION.password_reset_token.findUnique({
        where: {
            id: token,
        },
    });
    if (storedToken == null) return false;
    const tokenExpires = Number(storedToken.expires);
    if (!isWithinExpiration(tokenExpires)) {
        await PRISMA_CONNECTION.password_reset_token.deleteMany({
            where: {
                id: token,
            },
        })
        return false;
    }
    return true;
};

export const isRegisteredEmail = async (email: string) => {
    const storedUser = await PRISMA_CONNECTION.user.findUnique({
        where: {
            email: email,
        },
    });
    if (!storedUser) return false;
    return true;
};

export const isInitialUser = async () => {
    const USERS = await PRISMA_CONNECTION.user.findMany();
    if (USERS.length > 0) return false;
    return true;
};