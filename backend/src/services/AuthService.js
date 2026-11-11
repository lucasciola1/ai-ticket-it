import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../domain/Usuario.js';
import { ConflictError, UnauthorizedError } from '../domain/errors.js';

export class AuthService {
  constructor({ usuarioRepository, jwtSecret, jwtExpiresIn = '7d', saltRounds = 10 }) {
    this.usuarioRepository = usuarioRepository;
    this.jwtSecret = jwtSecret;
    this.jwtExpiresIn = jwtExpiresIn;
    this.saltRounds = saltRounds;
    // Hash de relleno: si el email no existe igual comparamos, así la respuesta
    // tarda lo mismo y no se puede adivinar qué emails están registrados.
    this.hashDeRelleno = bcrypt.hashSync('relleno-para-timing', saltRounds);
  }

  async registrar({ nombre, apellido, email, password }) {
    if (this.usuarioRepository.findByEmail(email)) {
      throw new ConflictError('EMAIL_EN_USO', 'Ya existe un usuario registrado con ese email');
    }
    const passwordHash = await bcrypt.hash(password, this.saltRounds);
    const usuario = this.usuarioRepository.save(
      new Usuario({ nombre, apellido, email, passwordHash }),
    );
    return { token: this.generarToken(usuario), usuario };
  }

  async login({ email, password }) {
    const usuario = this.usuarioRepository.findByEmail(email);
    const passwordOk = await bcrypt.compare(password, usuario?.passwordHash ?? this.hashDeRelleno);
    if (!usuario || !passwordOk) {
      throw new UnauthorizedError('CREDENCIALES_INVALIDAS', 'Email o contraseña incorrectos');
    }
    return { token: this.generarToken(usuario), usuario };
  }

  generarToken(usuario) {
    return jwt.sign({}, this.jwtSecret, { subject: usuario.id, expiresIn: this.jwtExpiresIn });
  }

  verificarToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('TOKEN_EXPIRADO', 'La sesión expiró, volvé a iniciar sesión');
      }
      throw new UnauthorizedError('TOKEN_INVALIDO', 'La sesión no es válida');
    }
  }
}
