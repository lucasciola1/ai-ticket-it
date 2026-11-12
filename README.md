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

Arquitectura, pantallas y librerías: [docs/arquitectura-frontend.md](docs/arquitectura-frontend.md).

```bash
cd mobile
npm install
npm start          # Metro
npm run android    # en otra terminal
```

### Correrla en el emulador (Mac, Android 37)

1. Levantar el emulador con render por software (la imagen de Android 37 se cuelga con la GPU):
   ```bash
   ~/Library/Android/sdk/emulator/emulator -avd Medium_Phone_API_37.0 -gpu swiftshader_indirect
   ```
2. Redirigir los puertos del back y de Metro al emulador:
   ```bash
   adb reverse tcp:3000 tcp:3000 && adb reverse tcp:8081 tcp:8081
   ```
3. Si aparece **"Unable to load script"**: en el emulador, `Cmd + M` → *Settings* → *Debug server host & port* → `localhost:8081`, y recargar (`R R`). Por defecto el emulador busca Metro en `10.0.2.2`, que en Android 17 requiere el permiso de red local (lo sacamos del manifest porque no hace falta con `adb reverse`).
