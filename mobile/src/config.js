/**
 * URL del backend. Esto NO es un secreto: todo lo que está en el front
 * queda visible en la app. Solo parametriza a dónde apuntar.
 *
 * - Celular por USB: correr `adb reverse tcp:3000 tcp:3000` y usar localhost.
 * - Emulador de Android: la Mac se ve como 10.0.2.2 → 'http://10.0.2.2:3000'.
 */
export const API_URL = 'http://localhost:3000';
