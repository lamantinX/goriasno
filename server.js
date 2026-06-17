import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

app.use(express.json());

app.post('/api/leads', async (req, res) => {
  try {
    const name = escapeHTML(req.body.name);
    const phone = escapeHTML(req.body.phone);
    const productName = escapeHTML(req.body.productName);
    const message = escapeHTML(req.body.message);
    const sourceForm = escapeHTML(req.body.sourceForm);
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Missing Telegram credentials in .env');
      return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    const text = `
🆕 <b>Новая заявка с сайта</b>

👤 <b>Имя:</b> ${name || 'Не указано'}
📞 <b>Телефон:</b> ${phone}
${productName ? `📦 <b>Товар:</b> ${productName}\n` : ''}
${message ? `💬 <b>Сообщение:</b> ${message}\n` : ''}
📍 <b>Форма:</b> ${sourceForm || 'Неизвестно'}
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
