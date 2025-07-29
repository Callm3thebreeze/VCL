<template>
  <div id="app" class="min-h-screen flex flex-col">
    <!-- Header/Navigation -->
    <AppHeader />

    <!-- Main Content -->
    <main id="main-content" class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <AppFooter />

    <!-- Toast Notifications -->
    <ToastContainer />

    <!-- Modal Container -->
    <ModalContainer />

    <!-- Loading Overlay -->
    <LoadingOverlay v-if="isLoading" />
  </div>
</template>

<script setup lang="ts">
// Layout por defecto de Vocali
const { isAuthenticated, initAuth, isLoading } = useAuth();

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
