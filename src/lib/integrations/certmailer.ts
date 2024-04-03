import { promises as fs } from 'fs';
import { PDFDocument } from 'pdf-lib';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const INSTANCE_NAME = process.env.INSTANCE_NAME || '';
const ATTENDANCE_TEMPLATE: string = `<html>
<head>
    <title>Certificate of Attendance</title>
</head>
    <body>
        <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center">
                    <h1 style="text-align: center;">Certificate of Attendance</h1>
                </td>
            </tr>
        </table>
        <p>Thank you for participating at the recent ${INSTANCE_NAME} event. Your can find your certificate of attendance attached to this email.</p>
        <p>If you have any further questions regarding this email or the attachment sent, please contact a platform administrator.</p>
        <p>Sincerely, <br>The ${INSTANCE_NAME} Team</p>
    </body>
</html>`;
const WINNERS_TEMPLATE: string = `<html>
<head>
    <title>Winners Certificate</title>
</head>
    <body>
        <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center">
                    <h1 style="text-align: center;">Winners Certificate</h1>
                </td>
            </tr>
        </table>
        <p>Thank you for participating at the recent ${INSTANCE_NAME} event and congratulations for making it under the top players.</p>
        <p>Your can find your winners certificate attached to this email.</p>
        <p>If you have any further questions regarding this email or the attachment sent, please contact a platform administrator.</p>
        <p>Sincerely, <br>The ${INSTANCE_NAME} Team</p>
    </body>
</html>`;

class CertMailer {
    #SENDER: string;
    #TRANSPORTER: Transporter;
    #CERTPATH: string;
    constructor() {
        this.#TRANSPORTER = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || '',
            auth: {
                user: process.env.EMAIL_NAME || '',
                pass: process.env.EMAIL_PASS || ''
            }
        });
        this.#SENDER = process.env.EMAIL_NAME || '';
        this.#CERTPATH = process.env.CERTIFICATE_FOLDER || '';
    }

    /**
     * Prepare a new PDF certificate for user data
     * @returns save path if success
     */
    private async preparePDF(
        data: { email: string; fullName: string; placement?: string;  },
        attendance: boolean = false
    ): Promise<{ PATH: string; FILENAME: string }> {
        const pdfBytes = await fs.readFile(`${this.#CERTPATH.replace(/\/$/, '')}/attendance.pdf`);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();
        for (const [key, value] of Object.entries(data)) {
            const field = form.getTextField(key);
            if (field) {
                field.setText(value);
            }
        }
        const MODDED = await pdfDoc.save();
        const FILENAME = `${INSTANCE_NAME}_${data.fullName}_${
            attendance ? 'Attendance' : 'Certificate'
        }.pdf`;
        const PATH = `/tmp/${FILENAME}`;
        await fs.writeFile(PATH, MODDED);
        return { PATH: PATH, FILENAME: FILENAME };
    }

    /**
     * Send attendance certs to a list of user emails
     * @returns true if success, false if not
     */
    async batchSendAttendance(
        userList: { email: string; fullName: string }[]
    ): Promise<boolean> {
        try {
            for (let user of userList) {
                // prep the PDF
                const { PATH, FILENAME } = await this.preparePDF(user, true);
                // send it
                await this.#TRANSPORTER.sendMail({
                    from: this.#SENDER,
                    to: user.email,
                    subject: 'Certificate of Attendance',
                    html: ATTENDANCE_TEMPLATE,
                    attachments: [
                        {
                            filename: FILENAME,
                            path: PATH
                        }
                    ]
                });
            }
            return true;
        } catch (e: any) {
            console.error(e);
            return false;
        }
    }

    /**
     * Send winners certs to a list of user emails
     * @returns true if success, false if not
     */
    async batchSendWinners(
        userList: { email: string; fullName: string; placement: string; }[]
    ): Promise<boolean> {
        try {
            for (let user of userList) {
                // prep the PDF
                const { PATH, FILENAME } = await this.preparePDF(user, true);
                // send it
                await this.#TRANSPORTER.sendMail({
                    from: this.#SENDER,
                    to: user.email,
                    subject: 'Winners Certificate',
                    html: WINNERS_TEMPLATE,
                    attachments: [
                        {
                            filename: FILENAME,
                            path: PATH
                        }
                    ]
                });
            }
            return true;
        } catch (e: any) {
            console.error(e);
            return false;
        }
    }
}

export default CertMailer;
