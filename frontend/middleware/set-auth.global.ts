/**
 * Middleware global para configurar el estado de autenticación
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // Inicializar estado de autenticación si es necesario
  if (process.client) {
    const token = localStorage.getItem('vocali_token');
    if (token) {
      // Configurar estado global de autenticación
      const authCookie = useCookie('vocali_token');
      authCookie.value = token;
    }
  }
});
