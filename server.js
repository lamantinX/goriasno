import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}


const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10kb' }));

// Security headers — keep in sync with nginx.conf.
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src https://yandex.ru; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
  );
  next();
});

const leadLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Слишком много запросов. Попробуйте позже.' },
});

app.post('/api/leads', leadLimiter, async (req, res) => {
  try {
    const { name, phone, productName, message, sourceForm } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
      return res.status(400).json({ success: false, error: 'Invalid name' });
    }
    if (!phone || typeof phone !== 'string' || phone.length < 7 || phone.length > 20) {
      return res.status(400).json({ success: false, error: 'Invalid phone' });
    }
    if (productName && (typeof productName !== 'string' || productName.length > 200)) {
      return res.status(400).json({ success: false, error: 'Invalid product name' });
    }
    if (message && (typeof message !== 'string' || message.length > 1000)) {
      return res.status(400).json({ success: false, error: 'Message too long' });
    }
    if (sourceForm && (typeof sourceForm !== 'string' || sourceForm.length > 100)) {
      return res.status(400).json({ success: false, error: 'Invalid source form' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Missing Telegram credentials in .env');
      return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    const escName = escapeHTML(name);
    const escPhone = escapeHTML(phone);
    const escProductName = escapeHTML(productName);
    const escMessage = escapeHTML(message);
    const escSourceForm = escapeHTML(sourceForm);

    const text = `
🆕 <b>Новая заявка с сайта</b>

👤 <b>Имя:</b> ${escName || 'Не указано'}
📞 <b>Телефон:</b> ${escPhone}
${escProductName ? `📦 <b>Товар:</b> ${escProductName}\n` : ''}
${escMessage ? `💬 <b>Сообщение:</b> ${escMessage}\n` : ''}
📍 <b>Форма:</b> ${escSourceForm || 'Неизвестно'}
    `.trim();

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Telegram API error:', data);
      return res.status(500).json({ success: false, error: 'Failed to send message to Telegram' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing lead:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Serve static files in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
