import { toUsuarioDTO } from '../mappers/usuarioMapper.js';

export class UsuarioController {
  me = (req, res) => {
    res.json(toUsuarioDTO(req.usuario));
  };
}
