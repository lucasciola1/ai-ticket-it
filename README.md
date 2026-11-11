# AI Ticket It

Plataforma de venta de entradas para eventos — TP Individual de Desarrollo con IA (DDS UTN, 2C 2026).

## Estructura

```
backend/   API REST en Node + Express (JavaScript, persistencia en memoria)
mobile/    App React Native CLI (JavaScript)
docs/      Modelo de dominio y decisiones
```

## Backend

```bash
cd backend
npm install
cp .env.example .env   # y poné un JWT_SECRET propio
npm run dev
```

Levanta en `http://localhost:3000` (`GET /health` para probar). Tests: `npm test`.

Arquitectura y endpoints: [docs/arquitectura-backend.md](docs/arquitectura-backend.md).

### Usuarios de prueba (seed)

Todos con la contraseña definida en `SEED_PASSWORD` (`backend/src/seed/seed.js`).

| Email | Rol en el seed |
|---|---|
| ana@aiticketit.test | Organizadora (recitales, festival, stand-up) |
| martin@aiticketit.test | Organizador (teatro, conferencia, deportes) y comprador |
| sofia@aiticketit.test | Compradora (una compra en cada estado) |
| juan@aiticketit.test | Comprador |

Los datos viven en memoria: se reinician cada vez que se reinicia el server.

## Mobile

Requiere Android Studio (SDK + emulador o celular por USB) o Xcode para iOS.

```bash
cd mobile
npm install
npm start          # Metro
npm run android    # en otra terminal
```
