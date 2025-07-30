/**
 * Middleware de autenticación
 * Protege rutas que requieren autenticación
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // Verificar si el usuario está autenticado
  const isAuthenticated = useCookie('vocali_token').value;

  if (!isAuthenticated) {
    // Redirigir a login si no está autenticado
    return navigateTo('/login');
  }
});
