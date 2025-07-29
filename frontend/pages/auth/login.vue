<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          Iniciar sesión en Vocali
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          ¿No tienes cuenta?
          <NuxtLink
            to="/auth/register"
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            Crear cuenta
          </NuxtLink>
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div
        class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10"
      >
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Contraseña
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="form.password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isLoading">Iniciar sesión</span>
              <span v-else>Iniciando sesión...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Meta de la página
definePageMeta({
  title: 'Login - Vocali',
  description: 'Inicia sesión en tu cuenta de Vocali',
  layout: 'auth',
});

// Estado del formulario
const form = ref({
  email: '',
  password: '',
});

const isLoading = ref(false);

// Manejar login
const handleLogin = async () => {
  isLoading.value = true;

  try {
    // TODO: Implementar lógica de login
    console.log('Iniciando sesión:', form.value);

    // Simular delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Redirigir a dashboard
    await navigateTo('/dashboard');
  } catch (error) {
    console.error('Error en login:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>
