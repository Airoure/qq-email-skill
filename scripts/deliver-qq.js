#!/usr/bin/env node

// ============================================================================
// QQ Email SMTP Delivery Script
// ============================================================================
// Sends email via QQ邮箱 SMTP (SSL, port 465).
//
// Usage:
//   node deliver-qq.js --file /path/to/digest.txt
//   node deliver-qq.js --message "text"
//   echo "text" | node deliver-qq.js
//
// Required env vars in ~/.follow-builders/.env:
//   QQ_SMTP_USER=your-qq-email@qq.com
//   QQ_SMTP_PASS=authorization-code
//   QQ_TO_EMAIL=recipient@example.com
// ============================================================================

import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import nodemailer from 'nodemailer';

// -- Constants ---------------------------------------------------------------

const ENV_PATH = join(homedir(), '.follow-builders', '.env');

// -- Load .env manually (no dotenv dependency required) --------------------

function loadEnv() {
  try {
    const { existsSync } = require('fs');
    if (!existsSync(ENV_PATH)) return;
    const { readFileSync } = require('fs');
    const content = readFileSync(ENV_PATH, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {}
}

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

// -- QQ SMTP Delivery --------------------------------------------------------

async function sendQQEmail(text, smtpUser, smtpPass, toEmail) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  const date = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  await transporter.sendMail({
    from: `"AI Builders Digest" <${smtpUser}>`,
    to: toEmail,
    subject: `AI Builders Digest — ${date}`,
    text
  });
}

// -- Main --------------------------------------------------------------------

async function main() {
  loadEnv();

  const digestText = await getDigestText();

  if (!digestText || digestText.trim().length === 0) {
    console.log(JSON.stringify({ status: 'skipped', reason: 'Empty digest text' }));
    return;
  }

  const smtpUser = process.env.QQ_SMTP_USER;
  const smtpPass = process.env.QQ_SMTP_PASS;
  const toEmail = process.env.QQ_TO_EMAIL;

  if (!smtpUser || !smtpPass || !toEmail) {
    throw new Error(
      'Missing QQ SMTP config. Set in ~/.follow-builders/.env:\n' +
      '  QQ_SMTP_USER=your-qq-email@qq.com\n' +
      '  QQ_SMTP_PASS=authorization-code\n' +
      '  QQ_TO_EMAIL=recipient@example.com'
    );
  }

  await sendQQEmail(digestText, smtpUser, smtpPass, toEmail);
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
