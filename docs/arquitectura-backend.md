# Arquitectura del backend — AI Ticket It

Node + Express 5, JavaScript (ES modules), persistencia en memoria.

## Capas

```
request → routes → middlewares (autenticar, validar) → controllers → services → repositories → domain
```

| Capa | Responsabilidad |
|---|---|
| `domain/` | Clases del modelo y sus reglas (`hayCupoPara`, `actualizarEstado`, `cancelar`…). No conoce Express ni HTTP. |
| `repositories/` | Persistencia en memoria (`Map`). Base `InMemoryRepository` + consultas propias de cada agregado. |
| `services/` | Casos de uso: orquestan agregados y chequean permisos. |
| `controllers/` | Leen `req`, llaman al service y responden. Sin lógica. |
| `schemas/` | Schemas **Zod** de body / query / params de cada endpoint. |
| `mappers/` | Arman las respuestas para el front (nunca exponen `passwordHash`). |
| `middlewares/` | `autenticar` (JWT), `validar` (Zod), `notFoundHandler`, `errorHandler`. |
| `seed/` | Datos precargados al arrancar. |
| `container.js` | Inyección de dependencias manual: crea repos → services → controllers. |

## Autenticación

- **Registro** (`POST /auth/register`) y **login** (`POST /auth/login`) devuelven `{ token, usuario }`.
- Contraseñas hasheadas con **bcryptjs** (nunca se guardan ni se devuelven en texto plano).
- **JWT** firmado con `JWT_SECRET` (en `backend/.env`), `sub` = id del usuario, vencimiento `JWT_EXPIRES_IN` (default `7d`).
- El middleware `autenticar` lee `Authorization: Bearer <token>`, lo verifica y deja el usuario en `req.usuario`. Si falta o es inválido → 401.
- En el front, el token se guarda en AsyncStorage y un interceptor de Axios lo agrega a cada request.

## Validación (Zod)

- Un schema por endpoint en `schemas/`.
- Middleware `validar({ body, query, params })`: parsea y deja los datos limpios en `req.validated` (en Express 5 `req.query` es de solo lectura).
- Query params con `z.coerce.number()` (llegan como string).

## Errores

Todas las respuestas de error tienen la misma forma:

```json
{ "error": { "codigo": "SIN_CUPO", "mensaje": "No hay cupo suficiente…", "detalles": [] } }
```

| Origen | Status |
|---|---|
| `ZodError` | 400 `VALIDACION`, `detalles: [{ campo, mensaje }]` |
| JSON mal formado | 400 `JSON_INVALIDO` |
| `ValidationError` | 400 |
| `UnauthorizedError` (token inválido/vencido, credenciales) | 401 |
| `ForbiddenError` | 403 |
| `NotFoundError` / ruta inexistente | 404 |
| `ConflictError` (sin cupo, transición inválida, email en uso…) | 409 |
| Cualquier otro | 500 `ERROR_INTERNO` (stack solo en consola) |

Los errores de dominio heredan de `AppError` (`statusCode`, `codigo`, `mensaje`, `detalles`). Express 5 propaga solo los errores de handlers async.

## Endpoints

🔒 = requiere token.

### Auth y usuario
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/register` | `{ nombre, apellido, email, password }` → 201 `{ token, usuario }` · 409 email en uso |
| POST | `/auth/login` | `{ email, password }` → `{ token, usuario }` · 401 credenciales inválidas |
| GET 🔒 | `/usuarios/me` | Usuario actual |
| GET 🔒 | `/usuarios/me/favoritos` | Mis favoritos |
| PUT / DELETE 🔒 | `/usuarios/me/favoritos/:eventoId` | Marcar / desmarcar favorito |

### Catálogo
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/categorias` | Categorías |
| GET 🔓 | `/eventos?q=&categoriaId=&precioMin=&precioMax=&orden=precio\|fecha\|puntaje&dir=asc\|desc&page=&limit=` | Búsqueda, filtros, orden, paginación → `{ items, total, page, totalPages }`. Oculta eventos pasados. |
| GET 🔓 | `/eventos/:id` | Detalle con tipos de entrada (disponibles) y organizador con puntaje |
| GET | `/organizadores/:id/resenias` | Reseñas de eventos del organizador + promedio |

### Organizador
| Método | Ruta | Descripción |
|---|---|---|
| POST 🔒 | `/eventos` | Crear evento con tipos de entrada |
| GET 🔒 | `/usuarios/me/eventos` | Mis eventos como organizador |
| GET 🔒 | `/eventos/:id/compras` | Compras del evento + disponibles por tipo (solo el organizador, si no 403) |

### Compras
| Método | Ruta | Descripción |
|---|---|---|
| POST 🔒 | `/compras` | `{ eventoId, tipoEntradaId, cantidad }` → PENDIENTE · 409 sin cupo · 400 evento pasado |
| GET 🔒 | `/usuarios/me/compras` | Mis compras con estado y días faltantes |
| GET 🔒 | `/compras/:id` | Detalle + historial (comprador u organizador) |
| POST 🔒 | `/compras/:id/pagar` | PENDIENTE → CONFIRMADA |
| POST 🔒 | `/compras/:id/cancelar` | → CANCELADA / REEMBOLSADA, libera cupo |
| POST 🔒 | `/compras/:id/utilizar` | CONFIRMADA → UTILIZADA (solo organizador) |
| GET / POST 🔒 | `/compras/:id/mensajes` | Chat de la compra (comprador u organizador) |
| POST 🔒 | `/compras/:id/resenia` | `{ puntuacion, detalle }` (compra UTILIZADA, una vez) |

🔓 = token opcional: `GET /eventos` y `GET /eventos/:id` funcionan sin sesión; si viene el token, marcan `esFavorito` / `esOrganizador`.

## Respuestas para el front

- **Evento (resumen)**: `id, nombre, fecha, lugar, imagen, categoria, precioMinimo, organizador { id, nombre, apellido, puntaje, cantidadResenias }, finalizado, agotado, esFavorito`. El detalle suma `descripcion, multimedia, tiposEntrada [{ precio, cupo, vendidas, disponibles, agotado }], esOrganizador`.
- **Compra**: `id, rol, estado, cantidad, precioUnitario, total, fechaCompra, diasParaEvento` (solo si CONFIRMADA, si no `null`), `evento, tipoEntrada, comprador, cantidadMensajes, resenia` y **`acciones { pagar, cancelar, utilizar, reseniar }`**, que dice qué botones mostrar según el rol del usuario. El detalle suma `historial [{ estado, fechaHora, quien }]`.
- **Compras del evento (organizador)**: `{ evento, tiposEntrada, resumenPorEstado { PENDIENTE: n, … }, compras }`, filtrable con `?estado=`.

## Reglas de negocio implementadas

| Regla | Error |
|---|---|
| No superar el cupo del tipo de entrada | 409 `SIN_CUPO` |
| Máximo 10 entradas por compra | 400 `VALIDACION` |
| No comprar entradas de un evento pasado | 400 `EVENTO_FINALIZADO` |
| El organizador no compra entradas de su propio evento | 403 `PROPIO_EVENTO` |
| Solo el comprador paga y cancela; solo el organizador marca UTILIZADA | 403 `SOLO_COMPRADOR` / `SOLO_ORGANIZADOR` |
| No cancelar si está UTILIZADA, ya cancelada/reembolsada, o el evento ya ocurrió | 409 `COMPRA_NO_CANCELABLE` |
| Transiciones de estado inválidas | 409 `TRANSICION_INVALIDA` |
| Chat y detalle: solo comprador u organizador | 403 `SIN_ACCESO` |
| Reseña solo con la compra UTILIZADA, una por compra, puntuación entera 1–5 | 409 `COMPRA_NO_UTILIZADA` / `RESENIA_EXISTENTE` |
| Evento: fecha futura, ≥ 1 tipo de entrada, sin nombres de tipo repetidos, categoría existente | 400 |

El organizador puede marcar una entrada como UTILIZADA en cualquier momento (no solo el día del evento), para poder demostrar el flujo de reseñas.

## Decisiones

- Un endpoint por acción de estado (permisos y reglas distintas en cada una).
- La búsqueda oculta eventos pasados; siguen accesibles por id.
- Chat por polling desde el front (cada 3–5 s con la pantalla abierta), sin WebSockets.
- Paginación simple con `page` y `limit`.
- Tests con `node --test` (dominio) + `supertest` (endpoints).
