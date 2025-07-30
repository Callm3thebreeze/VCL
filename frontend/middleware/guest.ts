/**
 * Middleware para invitados
 * Redirige usuarios autenticados lejos de páginas de auth
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // Verificar si el usuario está autenticado
  const isAuthenticated = useCookie('vocali_token').value;

  if (isAuthenticated) {
    // Redirigir a transcripciones si ya está autenticado
    return navigateTo('/transcriptions');
  }
});
