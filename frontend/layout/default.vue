<template>
  <div id="app" class="min-h-screen flex flex-col">
    <main id="main-content" class="flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// Layout por defecto de Vocali
const isLoading = ref(false);

// Para evitar errores mientras no existe useAuth, creamos un stub temporal
const isAuthenticated = ref(false);
const initAuth = async () => {
  // Implementar inicialización de auth
  console.log('Initializing auth...');
};

// Inicializar autenticación al cargar la app
onMounted(async () => {
  await initAuth();
});

// Meta tags globales
useHead({
  htmlAttrs: {
    lang: 'es',
  },
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: '/favicon.svg',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/apple-touch-icon.png',
    },
  ],
});
</script>

<style>
/* Estilos globales para el layout */
#app {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
    sans-serif;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Focus visible para mejor accesibilidad */
*:focus-visible {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
}
</style>
