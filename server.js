require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json({ limit: '15mb' })); // las fotos van en base64, necesitan un límite generoso
app.use(express.static(path.join(__dirname, 'public')));

// --- Límite básico de solicitudes por IP, para evitar abuso y gastos inesperados ---
const hits = new Map();
const LIMIT = 30;                 // solicitudes permitidas...
const WINDOW_MS = 60 * 60 * 1000; // ...por hora

function rateLimit(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = hits.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW_MS) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  hits.set(ip, entry);
  if (entry.count > LIMIT) {
    return res.status(429).json({ error: 'Demasiadas solicitudes desde esta conexión. Intenta de nuevo más tarde.' });
  }
  next();
}

// --- Contraseña de acceso opcional (recomendada si vas a compartir el enlace públicamente) ---
function checkPassword(req, res, next) {
  if (process.env.APP_PASSWORD) {
    const provided = req.headers['x-app-password'];
    if (provided !== process.env.APP_PASSWORD) {
      return res.status(401).json({ error: 'Contraseña incorrecta o faltante.' });
    }
  }
  next();
}

app.post('/api/messages', rateLimit, checkPassword, async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'El servidor no tiene configurada la variable ANTHROPIC_API_KEY.' });
  }
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Error al contactar la API de Anthropic:', err);
    res.status(500).json({ error: 'Error al contactar la API de Anthropic.' });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor del escáner 606/607 escuchando en el puerto ${PORT}`));
