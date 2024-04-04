import nodemailer from "nodemailer";

// read from env
const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
const EMAIL_USER = process.env.EMAIL_NAME;
const EMAIL_PASS = process.env.EMAIL_PASS;
const INSTANCE_NAME = process.env.INSTANCE_NAME;

let transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
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
                <table width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                        <td align="center">
                            <h1 style="text-align: center;">Verify Your Email</h1>
                        </td>
                    </tr>
                </table>
                <p>Thank you for creating an account on ${INSTANCE_NAME}. To complete the registration process, please click the link below to verify your email address:</p>
                <table width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                        <td align="center">
                            <a href="${URL}" style="text-decoration: none; padding: 10px 20px; background-color: #007BFF; color: #fff; border-radius: 4px; display: inline-block;">Verify Email</a>
                        </td>
                    </tr>
                </table>
                <p>By verifying your email, you will gain full access to our services and stay updated with the latest updates and notifications.</p>
                <p>If you did not sign up for an account, please disregard this email.</p>
                <p>Sincerely, <br>The ${INSTANCE_NAME} Team</p>
            </body>
        </html>`
    }, (e: any) => {
        if (e !== null) {
            console.error(e);
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
                <table width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                        <td align="center">
                            <h1 style="text-align: center;">Reset Your Password</h1>
                        </td>
                    </tr>
                </table>
                <p>You are receiving this email because you have requested to reset your password for your account on ${INSTANCE_NAME}. To proceed with the password reset, please click the link below:</p>
                <table width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                        <td align="center">
                            <a href="${URL}" style="text-decoration: none; padding: 10px 20px; background-color: #007BFF; color: #fff; border-radius: 4px; display: inline-block;">Reset Password</a>
                        </td>
                    </tr>
                </table>
                <p>If you did not request this password reset, please ignore this email. Your password will remain unchanged.</p>
                <p>Sincerely, <br>The ${INSTANCE_NAME} Admin Team</p>
            </body>
        </html>`
    }, (e: any) => {
        if (e !== null) {
            console.error(e);
        }
    });
};
