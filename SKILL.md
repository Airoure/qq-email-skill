---
name: qq-email
description: Send emails via QQ邮箱 SMTP (SSL). Use when the user wants to send email through QQ's SMTP server, or when a delivery skill for QQ邮箱 is needed.
---

# QQ Email SMTP Skill

Sends email via QQ邮箱's SMTP server using nodemailer with SSL (port 465).

## Configuration

Before using, the user must provide their QQ SMTP credentials.

### Step 1: Generate QQ SMTP Authorization Code

1. Open QQ邮箱网页版: https://mail.qq.com
2. 进入 **设置 → 账户**
3. 找到 **POP3/SMTP/IMAP** 服务
4. 开启 **SMTP 服务**
5. 点击 **生成授权码**（会发短信验证）
6. 复制得到的 16 位授权码

### Step 2: Provide Credentials

Tell the user to provide:
- **QQ 邮箱地址**（如 `123456@qq.com`）
- **SMTP 授权码**（不是登录密码）
- **收件人邮箱**（可以同 QQ 邮箱，也可以是其他邮箱）

### Step 3: Configure Environment

Create `~/.follow-builders/.env` with:
```
QQ_SMTP_USER=你的QQ邮箱@qq.com
QQ_SMTP_PASS=授权码
QQ_TO_EMAIL=收件人邮箱
```

Or run the setup conversation to configure interactively.

## Usage

### Send a file as email body:
```bash
node /path/to/scripts/deliver-qq.js --file /tmp/digest.txt
```

### Send piped input:
```bash
echo "Hello world" | node /path/to/scripts/deliver-qq.js
```

### Send with explicit message:
```bash
node /path/to/scripts/deliver-qq.js --message "Digest content here"
```

## Script Options

| Flag | Description |
|------|-------------|
| `--file <path>` | Read email body from file |
| `--message <text>` | Use argument as email body |
| `--to <email>` | Override recipient email at runtime (falls back to `QQ_TO_EMAIL` env var) |
| (stdin) | Read email body from standard input |

## Output

On success:
```json
{"status":"ok","method":"qq-smtp","message":"Digest sent to xxx@qq.com"}
```

On failure:
```json
{"status":"error","method":"qq-smtp","message":"Error description"}
```

## Dependencies

Requires `nodemailer`. Install with:
```bash
cd /path/to/scripts && npm install
```
