<template>
  <form @submit.prevent="handleLogin" class="space-y-6">
    <div>
      <label
        for="email"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Correo electrónico
      </label>
      <div class="mt-1">
        <input
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          required
          class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          :class="{ 'border-red-300': errors.email }"
        />
        <p v-if="errors.email" class="mt-2 text-sm text-red-600">
          {{ errors.email }}
        </p>
      </div>
    </div>

    <div>
      <label
        for="password"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Contraseña
      </label>
      <div class="mt-1 relative">
        <input
          id="password"
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          required
          class="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          :class="{ 'border-red-300': errors.password }"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <Icon
            :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'"
            class="h-5 w-5 text-gray-400"
          />
        </button>
        <p v-if="errors.password" class="mt-2 text-sm text-red-600">
          {{ errors.password }}
        </p>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <input
          id="remember"
          v-model="form.remember"
          type="checkbox"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label
          for="remember"
          class="ml-2 block text-sm text-gray-900 dark:text-gray-300"
        >
          Recordarme
        </label>
      </div>

      <div class="text-sm">
        <NuxtLink
          to="/auth/forgot-password"
          class="font-medium text-blue-600 hover:text-blue-500"
        >
          ¿Olvidaste tu contraseña?
        </NuxtLink>
      </div>
    </div>

    <div>
      <button
        type="submit"
        :disabled="loading"
        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span
          v-if="loading"
          class="absolute left-0 inset-y-0 flex items-center pl-3"
        >
          <Icon
            name="heroicons:arrow-path"
            class="h-5 w-5 text-blue-500 animate-spin"
          />
        </span>
        {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
      </button>
    </div>

    <div v-if="errors.general" class="mt-3">
      <div class="rounded-md bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <Icon name="heroicons:x-circle" class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Error al iniciar sesión
            </h3>
            <div class="mt-2 text-sm text-red-700">
              {{ errors.general }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Props para manejar el estado desde el componente padre
const emit = defineEmits<{
  submit: [credentials: { email: string; password: string; remember: boolean }];
}>();

// Estado del formulario
const form = ref({
  email: '',
  password: '',
  remember: false,
});

const showPassword = ref(false);
const loading = ref(false);
const errors = ref({
  email: '',
  password: '',
  general: '',
});

// Métodos de validación
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return 'El correo electrónico es requerido';
  }
  if (!emailRegex.test(email)) {
    return 'Ingresa un correo electrónico válido';
  }
  return '';
};

const validatePassword = (password: string) => {
  if (!password) {
    return 'La contraseña es requerida';
  }
  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }
  return '';
};

const validateForm = () => {
  errors.value.email = validateEmail(form.value.email);
  errors.value.password = validatePassword(form.value.password);
  errors.value.general = '';

  return !errors.value.email && !errors.value.password;
};

const handleLogin = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;

  try {
    emit('submit', {
      email: form.value.email,
      password: form.value.password,
      remember: form.value.remember,
    });
  } catch (error) {
    errors.value.general = 'Error interno del sistema. Inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
};

// Limpiar errores cuando el usuario comience a escribir
const watchForm = () => {
  errors.value.email = '';
  errors.value.password = '';
  errors.value.general = '';
};

// Exponer métodos para uso del componente padre
defineExpose({
  setError: (field: string, message: string) => {
    if (field in errors.value) {
      errors.value[field as keyof typeof errors.value] = message;
    }
  },
  setLoading: (state: boolean) => {
    loading.value = state;
  },
  clearErrors: () => {
    errors.value = {
      email: '',
      password: '',
      general: '',
    };
  },
});
</script>
