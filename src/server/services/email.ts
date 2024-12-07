import nodemailer from 'nodemailer';
import { env } from '~/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

export class EmailService {
  sendMail(options: Exclude<nodemailer.SendMailOptions, 'from'>) {
    return transporter.sendMail({
      from: `${env.EVENT_NAME} <${env.SMTP_USER}>`,
      ...options,
    });
  }
}
