import nodemailer from 'nodemailer';

export const trnEmailConfig = {
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
};

export const transporter = nodemailer.createTransport(trnEmailConfig);

export const sendEmail = async ({
    to,
    subject,
    text,
    html,
}: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️ SMTP credentials not configured. Skipping email send to:', to);
        console.warn(`Content: ${html || text}`);
        return;
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"PRD Generator" <noreply@prdgenerator.com>',
            to,
            subject,
            text,
            html,
        });
        console.log(`Email successfully sent to ${to}`);
    } catch (error) {
        console.error('Email sending failed:', error);
    }
};
