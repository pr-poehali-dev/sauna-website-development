import json
import os
import smtplib
import urllib.request
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def handler(event: dict, context) -> dict:
    """Отправка заявки с сайта на email и в Telegram"""

    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400",
            },
            "body": "",
        }

    body = json.loads(event.get("body", "{}"))
    name = body.get("name", "").strip()
    phone = body.get("phone", "").strip()
    message = body.get("message", "").strip()

    if not name or not phone:
        return {
            "statusCode": 400,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "Имя и телефон обязательны"}),
        }

    send_email(name, phone, message)
    send_telegram(name, phone, message)

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"ok": True}),
    }


def send_email(name: str, phone: str, message: str):
    smtp_user = "SaunaNovosib@yandex.ru"
    smtp_password = os.environ["SMTP_PASSWORD"]
    recipient = "SaunaNovosib@yandex.ru"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Новая заявка с сайта — {name}"
    msg["From"] = smtp_user
    msg["To"] = recipient

    text = f"Новая заявка с сайта Сауна&Sauna\n\nИмя: {name}\nТелефон: {phone}\nСообщение: {message or '—'}"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <div style="background: #1A1208; padding: 24px; border-radius: 12px;">
        <h2 style="color: #C9933A; margin: 0 0 16px;">🔥 Новая заявка с сайта</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #999; padding: 8px 0; width: 120px;">Имя:</td>
            <td style="color: #fff; padding: 8px 0;"><strong>{name}</strong></td>
          </tr>
          <tr>
            <td style="color: #999; padding: 8px 0;">Телефон:</td>
            <td style="color: #fff; padding: 8px 0;"><strong>{phone}</strong></td>
          </tr>
          <tr>
            <td style="color: #999; padding: 8px 0; vertical-align: top;">Сообщение:</td>
            <td style="color: #fff; padding: 8px 0;">{message or '—'}</td>
          </tr>
        </table>
        <a href="tel:{phone}" style="display: inline-block; margin-top: 20px; background: #C9933A; color: #1A1208; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Позвонить {phone}
        </a>
      </div>
    </div>
    """

    msg.attach(MIMEText(text, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    with smtplib.SMTP_SSL("smtp.yandex.ru", 465) as server:
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, recipient, msg.as_string())


def send_telegram(name: str, phone: str, message: str):
    token = os.environ["TELEGRAM_BOT_TOKEN"]
    chat_id = os.environ["TELEGRAM_CHAT_ID"]

    text = (
        f"🔥 *Новая заявка с сайта*\n\n"
        f"👤 *Имя:* {name}\n"
        f"📞 *Телефон:* {phone}\n"
        f"💬 *Сообщение:* {message or '—'}"
    )

    data = json.dumps({
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown",
    }).encode("utf-8")

    req = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/sendMessage",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    urllib.request.urlopen(req)
