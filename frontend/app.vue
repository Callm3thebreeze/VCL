<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Configuración global de la aplicación
useHead({
  titleTemplate: (title) => {
    return title ? `${title} - Vocali` : 'Vocali - Transcripción Inteligente';
  },
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'format-detection', content: 'telephone=no' },
  ],
});
</script>

<style>
@import 'assets/styles/main.scss';
</style>
