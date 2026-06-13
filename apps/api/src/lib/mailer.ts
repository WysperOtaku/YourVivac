import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let transport: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter | null {
  if (transport) return transport;
  if (!env.SMTP_HOST) {
    logger.warn('SMTP no configurado: los emails se registrarán pero no se enviarán');
    return null;
  }
  transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
  return transport;
}

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/** Envía un email transaccional (verificación, invitación, reset). */
export async function sendMail(msg: MailMessage): Promise<void> {
  const t = getTransport();
  if (!t) {
    logger.info({ to: msg.to, subject: msg.subject }, '[mailer:dev] email simulado');
    return;
  }
  await t.sendMail({ from: env.MAIL_FROM, ...msg });
}
