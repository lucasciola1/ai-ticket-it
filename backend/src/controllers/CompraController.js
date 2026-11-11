export class CompraController {
  constructor({ compraService }) {
    this.compraService = compraService;
  }

  crear = (req, res) => {
    res.status(201).json(this.compraService.crear(req.usuario, req.validated.body));
  };

  misCompras = (req, res) => {
    res.json(this.compraService.deComprador(req.usuario));
  };

  delEvento = (req, res) => {
    res.json(this.compraService.delEvento(req.params.id, req.usuario, req.validated.query));
  };

  obtener = (req, res) => {
    res.json(this.compraService.obtener(req.params.id, req.usuario));
  };

  pagar = (req, res) => {
    res.json(this.compraService.pagar(req.params.id, req.usuario));
  };

  cancelar = (req, res) => {
    res.json(this.compraService.cancelar(req.params.id, req.usuario));
  };

  utilizar = (req, res) => {
    res.json(this.compraService.utilizar(req.params.id, req.usuario));
  };

  mensajes = (req, res) => {
    res.json(this.compraService.mensajes(req.params.id, req.usuario));
  };

  enviarMensaje = (req, res) => {
    res
      .status(201)
      .json(this.compraService.enviarMensaje(req.params.id, req.usuario, req.validated.body.texto));
  };
}
