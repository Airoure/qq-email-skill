#!/usr/bin/env node

// ============================================================================
// QQ Email SMTP Delivery Script
// ============================================================================
// Sends email via QQ邮箱 SMTP (SSL, port 465).
//
// Usage:
//   node deliver-qq.js --file /path/body.txt [--to email] [--subject "title"]
//   node deliver-qq.js --message "body text" [--to email] [--subject "title"]
//   echo "body text" | node deliver-qq.js [--to email] [--subject "title"]
//
// Required env vars in ~/.follow-builders/.env:
//   QQ_SMTP_USER=your-qq-email@qq.com
//   QQ_SMTP_PASS=authorization-code
//   QQ_TO_EMAIL=recipient@example.com   (default, can override with --to)
//   QQ_FROM_NAME=Display Name          (optional, shown as sender name)
//   QQ_SUBJECT_PREFIX=Subject Prefix   (optional, auto-adds date suffix)
// ============================================================================

import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import nodemailer from 'nodemailer';
import { config as loadEnv } from 'dotenv';

// -- Constants ---------------------------------------------------------------

const ENV_PATH = join(homedir(), '.follow-builders', '.env');

// -- Read input --------------------------------------------------------------

async function getDigestText() {
  const args = process.argv.slice(2);

  const msgIdx = args.indexOf('--message');
  if (msgIdx !== -1 && args[msgIdx + 1]) {
    return args[msgIdx + 1];
  }

  const fileIdx = args.indexOf('--file');
  if (fileIdx !== -1 && args[fileIdx + 1]) {
    return await readFile(args[fileIdx + 1], 'utf-8');
  }

  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

function getArg(args, flag) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return null;
}

function getToEmail() {
  return getArg(process.argv.slice(2), '--to');
}

function getSubject() {
  const subject = getArg(process.argv.slice(2), '--subject');
  if (subject) return subject;
  const prefix = process.env.QQ_SUBJECT_PREFIX || 'QQ Email';
  const date = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  return `${prefix} — ${date}`;
}

// -- QQ SMTP Delivery --------------------------------------------------------

async function sendQQEmail(text, smtpUser, smtpPass, toEmail, subject, fromName) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  await transporter.sendMail({
    from: `"${fromName}" <${smtpUser}>`,
    to: toEmail,
    subject,
    text
  });
}

// -- Main --------------------------------------------------------------------

async function main() {
  loadEnv({ path: ENV_PATH });

  const digestText = await getDigestText();

  if (!digestText || digestText.trim().length === 0) {
    console.log(JSON.stringify({ status: 'skipped', reason: 'Empty digest text' }));
    return;
  }

  const smtpUser = process.env.QQ_SMTP_USER;
  const smtpPass = process.env.QQ_SMTP_PASS;
  const toEmail = getToEmail() || process.env.QQ_TO_EMAIL;
  const subject = getSubject();
  const fromName = process.env.QQ_FROM_NAME || smtpUser;

  if (!smtpUser || !smtpPass || !toEmail) {
    throw new Error(
      'Missing QQ SMTP config. Set in ~/.follow-builders/.env:\n' +
      '  QQ_SMTP_USER=your-qq-email@qq.com\n' +
      '  QQ_SMTP_PASS=authorization-code\n' +
      '  QQ_TO_EMAIL=recipient@example.com\n' +
      'Or pass --to recipient@example.com at runtime.'
    );
  }

  await sendQQEmail(digestText, smtpUser, smtpPass, toEmail, subject, fromName);
  console.log(JSON.stringify({
    status: 'ok',
    method: 'qq-smtp',
    message: `Digest sent to ${toEmail}`
  }));
}

main().catch(err => {
  console.log(JSON.stringify({
    status: 'error',
    method: 'qq-smtp',
    message: err.message
  }));
  process.exit(1);
});
