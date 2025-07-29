/**
 * Plugin de Pinia para persistir estado en localStorage
 *
 * @description Configura la persistencia de datos en stores usando
 * pinia-plugin-persistedstate para mantener el estado entre sesiones.
 */
import { createPersistedState } from 'pinia-plugin-persistedstate';

export default defineNuxtPlugin((nuxtApp) => {
  const { $pinia } = nuxtApp;

  // Configurar el plugin de persistencia
  $pinia.use(
    createPersistedState({
      // Configuración global por defecto
      storage: localStorage,
      serializer: {
        serialize: JSON.stringify,
        deserialize: JSON.parse,
      },
      // Prefijo para las claves en localStorage
      key: (id: string) => `vocali-${id}`,
      // Función de debug (solo en desarrollo)
      debug: process.env.NODE_ENV === 'development',
    })
  );
});
