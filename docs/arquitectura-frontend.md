# Arquitectura del frontend — AI Ticket It

React Native CLI, JavaScript. Basado en las clases de integración con API REST (Axios, `services/`, adapters, cargando/error/datos) y de Context + custom hooks + CSS-in-JS (Emotion).

## Navegación (React Navigation)

Se puede **explorar sin sesión**; todo lo que compra, guarda o modifica pide iniciar sesión.

```
RootStack (native-stack)
├─ Tabs (barra inferior)
│   ├─ Explorar          público: búsqueda, categorías, orden, filtro de precio
│   ├─ Mis compras       🔒 sin sesión muestra "Iniciá sesión para ver tus compras"
│   ├─ Mis eventos       🔒 los que organizo + botón "Crear evento"
│   └─ Perfil            sin sesión: "Iniciar sesión" / "Registrarme"; con sesión: datos, favoritos, salir
├─ DetalleEvento         público: fotos, tipos de entrada con disponibles, reseñas del organizador
│                        "Comprar" y ♥ piden sesión
├─ Login · Registro      modales: al terminar vuelven a la pantalla donde estabas
├─ Comprar        🔒     modal: tipo + cantidad (tope = disponibles), total, confirmar
├─ DetalleCompra  🔒     estado, días que faltan, historial, botones según `acciones`
├─ Chat           🔒     mensajes de la compra (polling)
├─ Reseniar       🔒     modal: estrellas 1–5 + comentario
├─ CrearEvento    🔒     formulario con tipos de entrada dinámicos y fecha con calendario
└─ ComprasDelEvento 🔒   organizador: disponibles por tipo, resumen por estado, filtro, "marcar utilizada"
```

**Guarda de sesión:** hook `useRequiereSesion()` que devuelve `conSesion(accion)`: si hay sesión ejecuta la acción; si no, abre Login y, al loguearse, vuelve a la pantalla anterior.

### Casos de uso → pantallas
| Caso de uso | Pantalla |
|---|---|
| Ver mis compras con estado y días faltantes | Mis compras, DetalleCompra |
| Ver compras de un evento y disponibles por tipo | ComprasDelEvento |
| Buscar por texto o explorar por categoría | Explorar |
| Crear evento con tipos de entrada (precio, cupo) | CrearEvento |
| Chat comprador ↔ organizador | Chat |
| Cancelar compra (reembolso) | DetalleCompra (botón según `acciones.cancelar`) |
| Puntuar y comentar tras usar la entrada | Reseniar |
| Ver reseñas del organizador antes de comprar | DetalleEvento |
| Ordenar por precio, fecha y puntaje | Explorar |
| Comprar tipo + cantidad sin superar cupo | Comprar |

## Estructura

```
mobile/src/
  config.js        API_URL (sin secretos: todo lo del front es visible en el bundle)
  services/        api.js · authService · eventoService · compraService · categoriaService
  context/         AuthContext (+ useAuth) · FavoritosContext (+ useFavoritos)
  hooks/           useCarga · usePolling · useRequiereSesion · useDebounce
  navigation/      RootNavigator · AppTabs
  screens/         auth/ · eventos/ · compras/ · organizador/ · perfil/
  components/      EventoCard · ChipEstado · Estrellas · EstadoCarga · Boton · Campo · RequiereSesion
  theme/           theme.js (colores, colores por estado de compra, espaciados, tipografía)
  utils/           formato.js (precio $ es-AR, fechas)
```

## Piezas clave

- **`services/api.js`**: instancia única de Axios (`axios.create`).
  - Interceptor de request: agrega `Authorization: Bearer <token>`.
  - Interceptor de response: ante 401 cierra la sesión.
  - `mensajeError(err)`: devuelve `error.mensaje` del back o "No pudimos conectarnos al servidor".
  - `erroresPorCampo(err)`: convierte `error.detalles [{ campo, mensaje }]` en `{ campo: mensaje }` para los formularios.
- **Adapters** en cada service: fechas string → `Date`, imagen por defecto si no hay. Si el back cambia, se arregla en un solo lugar.
- **`AuthContext` / `useAuth()`**: `usuario`, `token`, `login`, `registrar`, `logout`, `restaurando`. Guarda el token en AsyncStorage y lo recupera al abrir la app.
- **`FavoritosContext` / `useFavoritos()`**: el ♥ aparece en Explorar, DetalleEvento y Perfil (estado compartido entre pantallas lejanas → Context, sin prop drilling).
- **`useCarga(fn, deps)`**: patrón cargando / error / datos con `try/catch/finally` y `recargar()`.
- **`<EstadoCarga>`**: spinner, error con "Reintentar", o mensaje de lista vacía.
- **`usePolling(fn, ms)`**: el chat consulta cada 4 s solo mientras la pantalla está enfocada.
- Los componentes nunca llaman a Axios: llaman a funciones de `services/`.

## Decisiones

| Tema | Decisión |
|---|---|
| Estilos | **Emotion** (`@emotion/native` + `ThemeProvider` de `@emotion/react`). Componentes estilizados, sin estilos inline; colores de estado desde el theme. |
| Sesión | Explorar y ver detalle sin sesión; comprar, favoritos, chat, reseñas y organizar requieren sesión. |
| Listados | **Scroll infinito** (`FlatList` + `onEndReached`) con **arrastrar para recargar**. Si falla la carga de la página siguiente, botón "Cargar más" para reintentar. Paginación y filtros siempre en el servidor. |
| Búsqueda | Texto con debounce de 400 ms → query param `q`. |
| Validación de formularios | Se muestran los **errores del back campo por campo** (`detalles`). Una sola fuente de verdad: los schemas Zod del back. |
| Fecha del evento | `@react-native-community/datetimepicker`: **calendario** para elegir el día y luego reloj para la hora. |
| Conexión al back | Celular por USB con `adb reverse tcp:3000 tcp:3000` → `http://localhost:3000`. En emulador: `http://10.0.2.2:3000`. |

## Librerías

| Para qué | Librería |
|---|---|
| Navegación | `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `react-native-screens` |
| HTTP | `axios` |
| Token | `@react-native-async-storage/async-storage` |
| Estilos | `@emotion/native`, `@emotion/react` |
| Íconos | `@react-native-vector-icons/material-design-icons` |
| Fecha | `@react-native-community/datetimepicker` |

## Orden de implementación

1. Base: theme, `api.js`, navegación, `AuthContext`, Login/Registro.
2. Explorar + DetalleEvento (público) + favoritos.
3. Comprar.
4. Mis compras + DetalleCompra (pagar, cancelar).
5. Chat.
6. Reseñas.
7. Organizador: Mis eventos, CrearEvento, ComprasDelEvento.
