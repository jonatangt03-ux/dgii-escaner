# Escáner de Facturas 606/607 — versión propia (fuera de Claude)

Esta es la versión de la herramienta que puedes alojar tú mismo, para que cualquier
persona la use desde un enlace propio (no depende de Claude ni de este chat).

## Qué contiene

- `public/index.html` — la aplicación que ven tus usuarios (captura de foto, formulario,
  tabla y exportación a Excel).
- `server.js` — un pequeño servidor que sirve esa página **y** actúa de intermediario
  seguro con la API de Anthropic (para que tu clave de API nunca quede expuesta en el
  navegador de cada usuario).
- `package.json`, `.env.example`.

## Antes de empezar

1. Crea una cuenta en [console.anthropic.com](https://console.anthropic.com) y genera
   una **API key**. El uso de la API tiene costo por cada foto analizada (cobra por
   Anthropic, no por el hosting).
2. Necesitas Node.js 18 o superior para correr el servidor.

## Configuración local

```bash
cd dgii-standalone
npm install
cp .env.example .env
# Edita .env y coloca tu ANTHROPIC_API_KEY (y opcionalmente APP_PASSWORD)
npm start
```

Abre `http://localhost:3000` en tu navegador — ya funciona igual que dentro de Claude,
incluyendo el análisis de fotos.

## Publicarla para que otros la usen

Necesitas un servicio de hosting que corra Node.js de forma continua (no sirve un
hosting solo de archivos estáticos, porque el servidor guarda tu clave de API).
Opciones sencillas y con capa gratuita:

- **Render.com** (recomendado por su simplicidad):
  1. Sube esta carpeta a un repositorio de GitHub.
  2. En Render, "New" → "Web Service" → conecta el repositorio.
  3. Build command: `npm install` — Start command: `npm start`.
  4. En "Environment", agrega `ANTHROPIC_API_KEY` (y `APP_PASSWORD` si quieres
     contraseña) como variables de entorno.
  5. Al desplegar obtienes una URL pública (algo como `https://tu-app.onrender.com`)
     — esa es la que compartes.

- **Railway.app** o **Fly.io**: el proceso es equivalente (variables de entorno +
  build/start command).

> Evita Vercel/Netlify tal cual para este proyecto: están pensados para funciones
> "serverless" y necesitarían adaptar `server.js` a ese formato. Render/Railway/Fly
> corren el servidor Express directamente, sin cambios.

## Seguridad y costos — importante

- **Protege el enlace con contraseña** (`APP_PASSWORD` en el `.env`) si lo vas a
  compartir ampliamente. Sin esto, cualquiera con el enlace puede generar llamadas a
  la API a tu costo.
- El servidor incluye un límite básico de 30 solicitudes por hora por IP — es una
  protección mínima, no un sistema de seguridad robusto. Si esperas mucho tráfico,
  considera agregar autenticación real (usuarios/login) y revisar el uso/gasto
  regularmente en la consola de Anthropic.
- Nunca subas tu archivo `.env` real (con la clave) a un repositorio público.

## Limitaciones que siguen aplicando

Las mismas que en la versión de Claude: esto no sustituye el validador oficial de la
DGII, la lectura por foto puede equivocarse (revisa siempre antes de exportar), los
campos resaltados en amarillo son sugerencias de la IA que debes confirmar, y las
columnas/códigos exactos de los formatos 606 y 607 pueden cambiar — verifica siempre
la normativa vigente antes de enviar. Esta herramienta tampoco guarda tus facturas en
ningún servidor: los datos viven solo en el navegador de cada usuario mientras la
pestaña está abierta.
