export class CategoriaController {
  constructor({ categoriaService }) {
    this.categoriaService = categoriaService;
  }

  listar = (req, res) => {
    res.json(this.categoriaService.listar());
  };
}

export class EventoController {
  constructor({ eventoService }) {
    this.eventoService = eventoService;
  }

  buscar = (req, res) => {
    res.json(this.eventoService.buscar(req.validated.query, req.usuario));
  };

  obtener = (req, res) => {
    res.json(this.eventoService.obtener(req.params.id, req.usuario));
  };

  crear = (req, res) => {
    res.status(201).json(this.eventoService.crear(req.usuario, req.validated.body));
  };

  misEventos = (req, res) => {
    res.json(this.eventoService.deOrganizador(req.usuario));
  };

  favoritos = (req, res) => {
    res.json(this.eventoService.favoritosDe(req.usuario));
  };

  marcarFavorito = (req, res) => {
    res.json(this.eventoService.marcarFavorito(req.usuario, req.params.eventoId));
  };

  desmarcarFavorito = (req, res) => {
    res.json(this.eventoService.desmarcarFavorito(req.usuario, req.params.eventoId));
  };
}

export class ReseniaController {
  constructor({ reseniaService }) {
    this.reseniaService = reseniaService;
  }

  deOrganizador = (req, res) => {
    res.json(this.reseniaService.deOrganizador(req.params.id));
  };

  crear = (req, res) => {
    res.status(201).json(this.reseniaService.crear(req.params.id, req.usuario, req.validated.body));
  };
}
