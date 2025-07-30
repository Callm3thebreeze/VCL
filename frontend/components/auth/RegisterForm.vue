<template>
  <form @submit.prevent="handleRegister" class="space-y-6">
    <div>
      <label
        for="name"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Nombre completo
      </label>
      <div class="mt-1">
        <input
          id="name"
          v-model="form.name"
          type="text"
          autocomplete="name"
          required
          class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          :class="{ 'border-red-300': errors.name }"
        />
        <p v-if="errors.name" class="mt-2 text-sm text-red-600">
          {{ errors.name }}
        </p>
      </div>
    </div>

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
          autocomplete="new-password"
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

    <div>
      <label
        for="confirmPassword"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Confirmar contraseña
      </label>
      <div class="mt-1 relative">
        <input
          id="confirmPassword"
          v-model="form.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          autocomplete="new-password"
          required
          class="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          :class="{ 'border-red-300': errors.confirmPassword }"
        />
        <button
          type="button"
          @click="showConfirmPassword = !showConfirmPassword"
          class="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <Icon
            :name="
              showConfirmPassword ? 'heroicons:eye-slash' : 'heroicons:eye'
            "
            class="h-5 w-5 text-gray-400"
          />
        </button>
        <p v-if="errors.confirmPassword" class="mt-2 text-sm text-red-600">
          {{ errors.confirmPassword }}
        </p>
      </div>
    </div>

    <div class="flex items-center">
      <input
        id="terms"
        v-model="form.acceptTerms"
        type="checkbox"
        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        :class="{ 'border-red-300': errors.acceptTerms }"
      />
      <label
        for="terms"
        class="ml-2 block text-sm text-gray-900 dark:text-gray-300"
      >
        Acepto los
        <a href="#" class="text-primary-600 hover:text-primary-500"
          >términos y condiciones</a
        >
        y la
        <a href="#" class="text-primary-600 hover:text-primary-500"
          >política de privacidad</a
        >
      </label>
    </div>
    <p v-if="errors.acceptTerms" class="text-sm text-red-600">
      {{ errors.acceptTerms }}
    </p>

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
            class="h-5 w-5 text-primary-500 animate-spin"
          />
        </span>
        {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
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
              Error al crear la cuenta
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
  submit: [
    data: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      acceptTerms: boolean;
    }
  ];
}>();

// Estado del formulario
const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const errors = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: '',
  general: '',
});

// Métodos de validación
const validateName = (name: string) => {
  if (!name.trim()) {
    return 'El nombre es requerido';
  }
  if (name.trim().length < 2) {
    return 'El nombre debe tener al menos 2 caracteres';
  }
  return '';
};

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
  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'La contraseña debe tener al menos una mayúscula, una minúscula y un número';
  }
  return '';
};

const validateConfirmPassword = (password: string, confirmPassword: string) => {
  if (!confirmPassword) {
    return 'Confirma tu contraseña';
  }
  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden';
  }
  return '';
};

const validateAcceptTerms = (acceptTerms: boolean) => {
  if (!acceptTerms) {
    return 'Debes aceptar los términos y condiciones';
  }
  return '';
};

const validateForm = () => {
  errors.value.name = validateName(form.value.name);
  errors.value.email = validateEmail(form.value.email);
  errors.value.password = validatePassword(form.value.password);
  errors.value.confirmPassword = validateConfirmPassword(
    form.value.password,
    form.value.confirmPassword
  );
  errors.value.acceptTerms = validateAcceptTerms(form.value.acceptTerms);
  errors.value.general = '';

  return (
    !errors.value.name &&
    !errors.value.email &&
    !errors.value.password &&
    !errors.value.confirmPassword &&
    !errors.value.acceptTerms
  );
};

const handleRegister = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;

  try {
    emit('submit', {
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      confirmPassword: form.value.confirmPassword,
      acceptTerms: form.value.acceptTerms,
    });
  } catch (error) {
    errors.value.general = 'Error interno del sistema. Inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
};

// Limpiar errores cuando el usuario comience a escribir
const watchForm = () => {
  errors.value.name = '';
  errors.value.email = '';
  errors.value.password = '';
  errors.value.confirmPassword = '';
  errors.value.acceptTerms = '';
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
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: '',
      general: '',
    };
  },
});
</script>
