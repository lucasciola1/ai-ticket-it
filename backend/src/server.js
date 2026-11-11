import { loadConfig } from './config.js';
import { createContainer } from './container.js';
import { createApp } from './app.js';
import { cargarSeed } from './seed/seed.js';

const config = loadConfig();
const container = createContainer(config);

if (config.cargarSeed) {
  cargarSeed(container.repositories, { saltRounds: config.bcryptSaltRounds });
}

const app = createApp(container);

// 0.0.0.0 para que el celular/emulador pueda llegar por la IP de la máquina
app.listen(config.port, '0.0.0.0', () => {
  console.log(`AI Ticket It API escuchando en http://localhost:${config.port}`);
});
