export function loadConfig(env = process.env) {
  if (!env.JWT_SECRET) {
    throw new Error('Falta JWT_SECRET. Copiá backend/.env.example a backend/.env y completalo.');
  }
  return {
    port: Number(env.PORT ?? 3000),
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN ?? '7d',
    bcryptSaltRounds: Number(env.BCRYPT_SALT_ROUNDS ?? 10),
    cargarSeed: env.SEED !== 'false',
  };
}
