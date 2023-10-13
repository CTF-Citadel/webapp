import nodemailer from "nodemailer";

// read from env
const EMAIL_SRVC = process.env.EMAIL_SERVICE;
const EMAIL_USER = process.env.EMAIL_NAME;
const EMAIL_PASS = process.env.EMAIL_PASS;

let transporter = nodemailer.createTransport({
    service: EMAIL_SRVC,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

export const sendVerificationLink = async (origin: string, email: string, token: string) => {
    const URL = `${origin}/verify/${token}`;
    transporter.sendMail({
        from: EMAIL_USER,
        to: email,
        subject: 'Email Verification',
        text: `Your email verification link: ${URL}`
    }, (err: any) => {
        if (err != null) {
            console.log(err);
        }
    });
};

export const sendPasswordResetLink = async (origin: string, email: string, token: string) => {
    const URL = `${origin}/reset/${token}`;
    transporter.sendMail({
        from: EMAIL_USER,
        to: email,
        subject: 'Password Reset',
        text: `Your password reset link: ${URL}`
    }, (err: any) => {
        if (err != null) {
            console.log(err);
        }
    });
};

export const isValidEmail = (maybeEmail: unknown): maybeEmail is string => {
    if (typeof maybeEmail !== "string") return false;
    if (maybeEmail.length > 255) return false;
    // @TODO: Regex to allow only specific subdomains
    const emailRegexp = /^.+@.+$/;
    return emailRegexp.test(maybeEmail);
};