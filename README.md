# QQ Email SMTP Skill

Send emails via QQ邮箱 SMTP server (SSL, port 465) from Claude Code or any Node.js environment.

## Install

```bash
git clone https://github.com/Airoure/qq-email-skill.git ~/.claude/skills/qq-email
cd ~/.claude/skills/qq-email/scripts && npm install
```

## Configure

Create `~/.follow-builders/.env` with your QQ SMTP credentials:

```bash
QQ_SMTP_USER=your-qq-email@qq.com
QQ_SMTP_PASS=authorization-code
QQ_TO_EMAIL=recipient@example.com
QQ_FROM_NAME=Display Name          # optional, sender display name
QQ_SUBJECT_PREFIX=Subject Prefix    # optional, subject prefix (appends date)
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
node ~/.claude/skills/qq-email/scripts/deliver-qq.js --file /tmp/body.txt

# Send piped content
cat /tmp/body.txt | node ~/.claude/skills/qq-email/scripts/deliver-qq.js

# Specify recipient at runtime
node ~/.claude/skills/qq-email/scripts/deliver-qq.js --file /tmp/body.txt --to someone@example.com

# Specify subject at runtime (overrides QQ_SUBJECT_PREFIX + date)
node ~/.claude/skills/qq-email/scripts/deliver-qq.js --file /tmp/body.txt --subject "Custom Subject"

# Combine all options
node ~/.claude/skills/qq-email/scripts/deliver-qq.js --file /tmp/body.txt --to someone@example.com --subject "Hello"

# Test
npm test
```

## As a Claude Code Skill

When installed in `~/.claude/skills/qq-email/`, Claude Code will recognize it as a delivery skill. Say things like "send this to my QQ email" or configure it as part of other skill setups.
