import json
import os
import smtplib
import urllib.request
import urllib.parse
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def handler(event: dict, context) -> dict:
    """Отправка заявки с конструктора парилки на email, Telegram и мастеру в WhatsApp/Telegram"""

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
    channel = body.get("channel", "").strip()  # whatsapp/telegram/viber/email/call
    master = body.get("master", "").strip()

    if not name or not phone:
        return {
            "statusCode": 400,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "Имя и телефон обязательны"}),
        }

    # Уведомление мастеру через email и Telegram
    send_email(name, phone, message, channel, master)
    send_telegram(name, phone, message, channel, master)

    # Ссылка для мастера — написать клиенту в WhatsApp
    master_phone = os.environ.get("MASTER_PHONE", "").replace("+", "").replace(" ", "")
    master_wa_url = None
    if master_phone:
        client_phone = phone.replace("+", "").replace(" ", "").replace("-", "")
        reply_text = f"Здравствуйте, {name}! Получили вашу конфигурацию парилки. Готов обсудить детали."
        master_wa_url = f"https://wa.me/{client_phone}?text={urllib.parse.quote(reply_text)}"

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"ok": True, "master_wa_url": master_wa_url}),
    }


CHANNEL_LABELS = {
    "whatsapp": "WhatsApp",
    "telegram": "Telegram",
    "viber": "Viber",
    "email": "Email",
    "call": "Звонок",
}


def send_email(name: str, phone: str, message: str, channel: str, master: str = ""):
    smtp_user = "SaunaNovosib@yandex.ru"
    smtp_password = os.environ["SMTP_PASSWORD"]
    recipient = "SaunaNovosib@yandex.ru"

    channel_label = CHANNEL_LABELS.get(channel, channel)
    client_phone_clean = phone.replace("+", "").replace(" ", "").replace("-", "")
    wa_url = f"https://wa.me/{client_phone_clean}"
    tg_url = f"https://t.me/+{client_phone_clean}"
    master_label = master if master else "не выбран"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"🔥 Новая заявка с конструктора — {name}"
    msg["From"] = smtp_user
    msg["To"] = recipient

    text = (
        f"Новая заявка с конструктора парилки\n\n"
        f"Имя: {name}\n"
        f"Телефон: {phone}\n"
        f"Канал: {channel_label}\n"
        f"Мастер: {master_label}\n\n"
        f"{message or '—'}"
    )

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f5f0e8; padding: 20px; border-radius: 12px;">
      <div style="background: #1A1208; padding: 28px; border-radius: 12px;">
        <h2 style="color: #C9933A; margin: 0 0 4px; font-size: 20px;">🔥 Новая заявка</h2>
        <p style="color: #888; margin: 0 0 20px; font-size: 13px;">Конструктор парилки</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="color: #888; padding: 7px 0; width: 130px; font-size: 14px;">Имя:</td>
            <td style="color: #fff; padding: 7px 0; font-size: 14px;"><strong>{name}</strong></td>
          </tr>
          <tr>
            <td style="color: #888; padding: 7px 0; font-size: 14px;">Телефон:</td>
            <td style="color: #fff; padding: 7px 0; font-size: 14px;"><strong>{phone}</strong></td>
          </tr>
          <tr>
            <td style="color: #888; padding: 7px 0; font-size: 14px;">Выбрал связь:</td>
            <td style="color: #C9933A; padding: 7px 0; font-size: 14px;"><strong>{channel_label}</strong></td>
          </tr>
          <tr>
            <td style="color: #888; padding: 7px 0; font-size: 14px;">Мастер:</td>
            <td style="color: #FFD060; padding: 7px 0; font-size: 14px;"><strong>{master_label}</strong></td>
          </tr>
          <tr>
            <td style="color: #888; padding: 7px 0; vertical-align: top; font-size: 14px;">Конфигурация:</td>
            <td style="color: #ccc; padding: 7px 0; font-size: 13px; white-space: pre-line;">{message or '—'}</td>
          </tr>
        </table>
        <p style="color: #666; font-size: 13px; margin: 0 0 12px;">Быстрый ответ клиенту:</p>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <a href="tel:{phone}" style="background: #C9933A; color: #1A1208; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">📞 Позвонить</a>
          <a href="{wa_url}" style="background: #25D366; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">WhatsApp</a>
          <a href="{tg_url}" style="background: #2AABEE; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">Telegram</a>
        </div>
      </div>
    </div>
    """

    msg.attach(MIMEText(text, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    with smtplib.SMTP_SSL("smtp.yandex.ru", 465) as server:
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, recipient, msg.as_string())


def send_telegram(name: str, phone: str, message: str, channel: str, master: str = ""):
    token = os.environ["TELEGRAM_BOT_TOKEN"]
    chat_id = os.environ["TELEGRAM_CHAT_ID"]

    channel_label = CHANNEL_LABELS.get(channel, channel)
    client_phone_clean = phone.replace("+", "").replace(" ", "").replace("-", "")
    wa_url = f"https://wa.me/{client_phone_clean}"
    master_label = master if master else "не выбран"

    # Полная конфигурация в Telegram
    config_lines = message.split("\n") if message else []
    config_preview = "\n".join(config_lines[:12]) if config_lines else "—"

    text = (
        f"🔥 *Новая заявка с конструктора*\n\n"
        f"👤 *Имя:* {name}\n"
        f"📞 *Телефон:* `{phone}`\n"
        f"💬 *Связь:* {channel_label}\n"
        f"👷 *Мастер:* *{master_label}*\n\n"
        f"```\n{config_preview}\n```\n\n"
        f"[✉️ Написать в WhatsApp]({wa_url})"
    )

    data = json.dumps({
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown",
        "disable_web_page_preview": True,
    }).encode("utf-8")

    req = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/sendMessage",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    urllib.request.urlopen(req)
