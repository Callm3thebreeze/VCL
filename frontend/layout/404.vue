<template>
  <div class="min-h-screen bg-red-50 flex items-center justify-center">
    <div class="max-w-md w-full mx-auto">
      <div class="text-center">
        <div class="mx-auto h-32 w-32 text-red-500 mb-6">
          <Icon name="heroicons:exclamation-triangle" class="w-full h-full" />
        </div>
        <h1 class="text-4xl font-bold text-red-600 mb-4">404</h1>
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Página no encontrada
        </h2>
        <p class="text-gray-600 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <NuxtLink
          to="/"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Icon name="heroicons:home" class="w-5 h-5 mr-2" />
          Volver al inicio
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '404 - Página no encontrada',
  meta: [{ name: 'description', content: 'La página que buscas no existe.' }],
});
</script>
