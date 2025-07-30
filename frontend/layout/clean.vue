<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Navbar simple -->
    <nav
      class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/dashboard" class="flex items-center">
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                Vocali
              </h1>
            </NuxtLink>
          </div>

          <!-- Navigation Menu -->
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <NuxtLink
              to="/dashboard"
              class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 transition-colors"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/transcriptions"
              class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors"
            >
              Transcripciones
            </NuxtLink>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <button
              @click="handleLogout"
              class="text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const handleLogout = () => {
  // Función simple de logout temporal
  localStorage.removeItem('vocali_token');
  window.location.href = '/auth/login';
};
</script>
