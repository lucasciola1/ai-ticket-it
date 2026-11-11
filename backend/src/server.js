import app from './app.js';

const PORT = process.env.PORT || 3000;

// 0.0.0.0 para que el celular/emulador pueda llegar por la IP de la máquina
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AI Ticket It API escuchando en http://localhost:${PORT}`);
});
