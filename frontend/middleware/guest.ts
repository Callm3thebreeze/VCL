/**
 * Middleware para invitados
 * Redirige usuarios autenticados lejos de páginas de auth
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // Verificar si el usuario está autenticado con una verificación más robusta
  const tokenCookie = useCookie('vocali_token').value;

  // También verificar localStorage para asegurar consistencia
  if (process.client) {
    const localToken = localStorage.getItem('vocali_token');

    console.log('🔍 Guest middleware debug:');
    console.log('- Token cookie:', !!tokenCookie);
    console.log('- Local token:', !!localToken);
    console.log('- Route to:', to.path);

    const isAuthenticated = tokenCookie && localToken;

    if (isAuthenticated) {
      console.log('✅ Usuario autenticado, redirigiendo al dashboard');
      // Redirigir al dashboard si ya está autenticado
      return navigateTo('/dashboard');
    } else {
      console.log('❌ Usuario no autenticado, permitiendo acceso a', to.path);
    }
  }
});
