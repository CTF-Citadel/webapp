import { promises as fs } from 'fs';
import { PDFDocument } from 'pdf-lib';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { getConfig } from '../config';
import { Logger } from '../logger';

const CONFIG = await getConfig();
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
        <p>Thank you for participating at the recent ${String(
            CONFIG.webapp.name
        )} event. Your can find your certificate of attendance attached to this email.</p>
        <p>If you have any further questions regarding this email or the attachment sent, please contact a platform administrator.</p>
        <p>Sincerely, <br>The ${String(CONFIG.webapp.name)} Team</p>
    </body>
</html>`;

class CertMailer {
    #SENDER: string;
    #TRANSPORTER: Transporter;
    #CERTPATH: string;
    constructor() {
        this.#TRANSPORTER = nodemailer.createTransport({
            service: String(CONFIG.email.service),
            auth: {
                user: String(CONFIG.email.username),
                pass: String(CONFIG.email.password)
            }
        });
        this.#SENDER = String(CONFIG.webapp.username);
        this.#CERTPATH = String(CONFIG.webapp.data);
    }

    /**
     * Prepare a new PDF certificate for user data
     * @returns save path if success
     */
    private async preparePDF(
        data: { email: string; fullName: string; placement?: string },
        attendance: boolean = false
    ): Promise<{ PATH: string; FILENAME: string }> {
        const pdfBytes = await fs.readFile(`${this.#CERTPATH.replace(/\/$/, '')}/attendance.pdf`);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();
        const field = form.getTextField('fullName');
        if (field) {
            field.setText(data.fullName);
        }
        form.flatten();
        const MODDED = await pdfDoc.save({ useObjectStreams: false });
        const FILENAME = `${String(CONFIG.webapp.name)}_${data.fullName}_${
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
    async batchSendAttendance(userList: { email: string; fullName: string }[]): Promise<boolean> {
        for (let user of userList) {
            try {
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
            } catch (e: any) {
                Logger.error('Cert-Mail: ' + e);
                continue;
            }
        }
        return true;
    }
}

export default CertMailer;
