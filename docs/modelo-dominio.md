# Modelo de dominio — AI Ticket It

Basado en el diagrama tentativo de la consigna, con ajustes para cubrir los casos de uso.

## Clases

### Usuario
| Atributo | Tipo |
|---|---|
| id | string |
| nombre | string |
| apellido | string |
| email | string (único) |
| passwordHash | string (bcrypt, nunca se expone) |
| favoritos | eventoId[] |

No tiene rol: un usuario es **organizador** de los eventos que creó y **comprador** de sus compras.

### Categoria
`id`, `nombre`, `descripcion`. Precargadas (Recitales, Teatro, Deportes, Conferencias…).

### Evento
| Atributo | Tipo |
|---|---|
| id | string |
| nombre | string |
| descripcion | string |
| categoriaId | string |
| fecha | Date |
| lugar | string |
| multimedia | string[] (URLs) |
| organizadorId | string |
| tiposEntrada | TipoEntrada[] |

Métodos:
- `tuPrecioEstaEntre(min, max)` — filtro por precio.
- `precioMinimo()` — ordenamiento por precio.
- `yaOcurrio()` — reglas de cancelación y reseñas.

### TipoEntrada (parte de Evento)
| Atributo | Tipo |
|---|---|
| id | string |
| nombre | string |
| descripcion | string |
| precio | number |
| cupo | number |
| vendidas | number |

Métodos: `hayCupoPara(n)`, `disponibles()` (= cupo − vendidas), `reservar(n)`, `liberar(n)`.

### Compra
| Atributo | Tipo |
|---|---|
| id | string |
| compradorId | string |
| eventoId | string |
| tipoEntradaId | string |
| cantidad | number |
| precioUnitario | number (foto del precio al comprar) |
| fechaCompra | Date |
| estado | EstadoCompra |
| mensajes | Mensaje[] |
| historial | CambioEstadoCompra[] |

`total` se calcula: `cantidad * precioUnitario`.

Métodos: `actualizarEstado(nuevo, quienId)` (valida transición y registra historial), `puedeCancelarse(evento)`, `diasParaEvento(evento)`.

### CambioEstadoCompra (parte de Compra)
`estado`, `quienId`, `fechaHora`.

### Mensaje (parte de Compra)
`id`, `autorId`, `texto`, `enviado`. Solo pueden escribir el comprador y el organizador del evento.

### Resenia
| Atributo | Tipo |
|---|---|
| id | string |
| compraId | string |
| compradorId | string |
| eventoId | string |
| puntuacion | entero 1–5 |
| detalle | string |
| fecha | Date |

Reglas: solo sobre compras **UTILIZADA**; una reseña por compra.
El **puntaje del organizador** se calcula como el promedio de las reseñas de todos sus eventos.

### EstadoCompra (enum)
`PENDIENTE`, `CONFIRMADA`, `UTILIZADA`, `CANCELADA`, `REEMBOLSADA`.

## Decisiones

1. **Transiciones de estado**

   | Desde | Hacia | Quién | Acción |
   |---|---|---|---|
   | PENDIENTE | CONFIRMADA | comprador | Pagar (simulado) |
   | PENDIENTE | CANCELADA | comprador | Cancelar (libera cupo) |
   | CONFIRMADA | REEMBOLSADA | comprador | Cancelar (libera cupo) |
   | CONFIRMADA | UTILIZADA | organizador | Validar entrada |

   No se puede cancelar si la compra está UTILIZADA o si el evento ya ocurrió.
2. **Cupo**: se descuenta al crear la compra (aunque quede PENDIENTE).
3. **Relaciones por id**: evita referencias circulares al serializar a JSON; las validaciones entre entidades las orquestan los services.
4. **Autenticación con JWT**: registro y login con email y contraseña (hash con bcrypt). Ver [arquitectura-backend.md](arquitectura-backend.md).

## Repositorios (en memoria, uno por agregado)
- `UsuarioRepository`
- `CategoriaRepository`
- `EventoRepository` (incluye tipos de entrada)
- `CompraRepository` (incluye mensajes e historial)
- `ReseniaRepository`
