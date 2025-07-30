<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800"
  >
    <header class="relative z-10">
      <nav class="container mx-auto px-4 py-6">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <Icon
              name="heroicons:microphone"
              class="w-8 h-8 text-primary-600"
            />
            <span class="text-2xl font-bold text-gray-900 dark:text-white"
              >Vocali</span
            >
          </div>

          <div class="flex items-center space-x-4">
            <NuxtLink
              v-if="!isAuthenticated"
              to="/auth/login"
              class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors"
            >
              Iniciar sesión
            </NuxtLink>
            <NuxtLink
              v-if="!isAuthenticated"
              to="/auth/register"
              class="btn btn-primary px-6 py-2"
            >
              Registrarse
            </NuxtLink>
            <button
              v-else
              @click="logout"
              class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>
    </header>

    <section class="relative overflow-hidden flex-1">
      <div class="container mx-auto px-4 py-16 lg:py-24">
        <div class="text-center max-w-4xl mx-auto">
          <h1
            class="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Transcripción de Audio con
            <span class="text-primary-600">Inteligencia Artificial</span>
          </h1>

          <p
            class="text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Convierte tus archivos de audio a texto de forma rápida y precisa.
          </p>
          <div
            class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <NuxtLink
              v-if="!isAuthenticated"
              to="/auth/register"
              class="btn btn-primary px-8 py-3 text-lg"
            >
              <Icon name="heroicons:rocket-launch" class="w-5 h-5 mr-2" />
              Comenzar transcripción
            </NuxtLink>

            <NuxtLink
              v-else
              to="/dashboard"
              class="btn btn-primary px-8 py-3 text-lg"
            >
              <Icon name="heroicons:arrow-right" class="w-5 h-5 mr-2" />
              Ir a transcripción
            </NuxtLink>

            <NuxtLink
              v-if="!isAuthenticated"
              to="/auth/login"
              class="btn btn-secondary px-8 py-3 text-lg"
            >
              Iniciar sesión
            </NuxtLink>
          </div>

          <!-- Demo visual simplificado -->
          <div
            class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg max-w-2xl mx-auto"
          >
            <div class="flex items-center justify-center space-x-4 mb-6">
              <div
                class="flex items-center space-x-2 text-gray-600 dark:text-gray-300"
              >
                <Icon name="heroicons:document-arrow-up" class="w-6 h-6" />
                <span>Sube audio</span>
              </div>
              <Icon
                name="heroicons:arrow-right"
                class="w-5 h-5 text-gray-400"
              />
              <div
                class="flex items-center space-x-2 text-gray-600 dark:text-gray-300"
              >
                <Icon name="heroicons:cpu-chip" class="w-6 h-6" />
                <span>IA procesa</span>
              </div>
              <Icon
                name="heroicons:arrow-right"
                class="w-5 h-5 text-gray-400"
              />
              <div
                class="flex items-center space-x-2 text-gray-600 dark:text-gray-300"
              >
                <Icon name="heroicons:document-text" class="w-6 h-6" />
                <span>Obtén texto</span>
              </div>
            </div>

            <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
              Formatos soportados: MP3, WAV, M4A, FLAC
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Composables para autenticación
const isAuthenticated = ref(false); // Simplificado para la prueba técnica

// Función de logout simulada
const logout = () => {
  isAuthenticated.value = false;
  // Aquí iría la lógica real de logout
};
</script>

<style scoped>
.btn {
  @apply inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg font-medium transition-colors duration-200;
}

.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600;
}
</style>
