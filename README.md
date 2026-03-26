# QQ Email SMTP Skill

Send emails via QQ邮箱 SMTP server (SSL, port 465) from Claude Code.

## Install

```bash
git clone https://github.com/YOUR_USERNAME/qq-email.git ~/.claude/skills/qq-email
cd ~/.claude/skills/qq-email/scripts && npm install
```

## Configure

Create `~/.follow-builders/.env` with your QQ SMTP credentials:

```bash
QQ_SMTP_USER=your-qq-email@qq.com
QQ_SMTP_PASS=your-authorization-code   # 不是登录密码！
QQ_TO_EMAIL=recipient@example.com
```

### How to get authorization code

1. Open https://mail.qq.com
2. **Settings → Account**
3. Find **POP3/SMTP/IMAP** section
4. Enable **SMTP service**
5. Click **Generate authorization code** (requires SMS verification)
6. Copy the 16-character code

## Usage

```bash
# Send file content as email
node ~/.claude/skills/qq-email/scripts/deliver-qq.js --file /tmp/digest.txt

# Send piped content
cat /tmp/digest.txt | node ~/.claude/skills/qq-email/scripts/deliver-qq.js

# Specify recipient at runtime (overrides QQ_TO_EMAIL in .env)
node ~/.claude/skills/qq-email/scripts/deliver-qq.js --file /tmp/digest.txt --to someone@example.com

# Test
npm test
```

## As a Claude Code Skill

When installed in `~/.claude/skills/qq-email/`, Claude Code will
recognize it as a delivery skill. Users can say "send this to my QQ email"
or configure it as part of other skill setups.
