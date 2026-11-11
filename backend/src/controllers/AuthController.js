import { toUsuarioDTO } from '../mappers/usuarioMapper.js';

export class AuthController {
  constructor({ authService }) {
    this.authService = authService;
  }

  registrar = async (req, res) => {
    const { token, usuario } = await this.authService.registrar(req.validated.body);
    res.status(201).json({ token, usuario: toUsuarioDTO(usuario) });
  };

  login = async (req, res) => {
    const { token, usuario } = await this.authService.login(req.validated.body);
    res.json({ token, usuario: toUsuarioDTO(usuario) });
  };
}
