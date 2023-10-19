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
        html: `<html>
        <head>
            <title>Verify Your Email Address</title>
        </head>
            <body>
                <p>Thank you for creating an account on CTF-Citadel. To complete the registration process, please click the link below to verify your email address:</p>
                <a href="${URL}" style="text-decoration: none; padding: 10px 20px; background-color: #007BFF; color: #fff; border-radius: 4px; display: inline-block;">Verify Email</a>
                <p>By verifying your email, you will gain full access to our services and stay updated with the latest updates and notifications.</p>
                <p>If you did not sign up for an account, please disregard this email.</p>
                <p>Sincerely, <br>The CTF-Citadel Admin Team</p>
            </body>
        </html>`
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
        html: `<html>
        <head>
            <title>Reset Your Password</title>
        </head>
            <body>
                <p>You are receiving this email because you have requested to reset your password for your account on CTF-Citadel. To proceed with the password reset, please click the link below:</p>
                <a href="${URL}" style="text-decoration: none; padding: 10px 20px; background-color: #007BFF; color: #fff; border-radius: 4px; display: inline-block;">Reset Password</a>
                <p>If you did not request this password reset, please ignore this email. Your password will remain unchanged.</p>
                <p>Sincerely, <br>The CTF-Citadel Admin Team</p>
            </body>
        </html>`
    }, (err: any) => {
        if (err != null) {
            console.log(err);
        }
    });
};

export const isValidEmail = (maybeEmail: unknown): maybeEmail is string => {
    if (typeof maybeEmail !== "string") return false;
    if (maybeEmail.length > 255) return false;
    const emailRegexp = /^.+@.+$/;
    return emailRegexp.test(maybeEmail);
};