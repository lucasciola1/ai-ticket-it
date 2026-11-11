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
npm run dev
```

Levanta en `http://localhost:3000` (`GET /health` para probar).

## Mobile

Requiere Android Studio (SDK + emulador o celular por USB) o Xcode para iOS.

```bash
cd mobile
npm install
npm start          # Metro
npm run android    # en otra terminal
```
