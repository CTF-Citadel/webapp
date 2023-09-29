import nodemailer from "nodemailer";

let transporter = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/bin/sendmail'
});

export const sendVerificationLink = async (email: string, token: string) => {
	const url = `https://some.url/verify/${token}`;
    // @TODO: Implement Actual SMTP MailSender
    transporter.sendMail({
        from: 'no-reply@example.com',
        to: email,
        subject: 'Email Verification',
        text: `Your email verification link: ${url}`
    }, (err: any) => {
        console.log(err);
    });
};

export const sendPasswordResetLink = async (email: string, token: string) => {
	const url = `https://some.url/reset/${token}`;
    // @TODO: Implement Actual SMTP MailSender
    transporter.sendMail({
        from: 'no-reply@example.com',
        to: email,
        subject: 'Password Reset',
        text: `Your password reset link: ${url}`
    }, (err: any) => {
        console.log(err);
    });
};

export const isValidEmail = (maybeEmail: unknown): maybeEmail is string => {
	if (typeof maybeEmail !== "string") return false;
	if (maybeEmail.length > 255) return false;
    // @TODO: Regex to allow only specific subdomains
	const emailRegexp = /^.+@.+$/;
	return emailRegexp.test(maybeEmail);
};