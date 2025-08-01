<template>
  <form @submit.prevent="handleForgotPassword" class="space-y-6">
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
          placeholder="Ingresa tu correo electrónico"
        />
        <p v-if="errors.email" class="mt-2 text-sm text-red-600">
          {{ errors.email }}
        </p>
      </div>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Te enviaremos un enlace para restablecer tu contraseña.
      </p>
    </div>

    <div>
      <button
        type="submit"
        :disabled="loading"
        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
        {{ loading ? 'Enviando...' : 'Enviar enlace de recuperación' }}
      </button>
    </div>

    <!-- Mensaje de éxito -->
    <div v-if="success" class="mt-3">
      <div class="rounded-md bg-green-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <Icon
              name="heroicons:check-circle"
              class="h-5 w-5 text-green-400"
            />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800">Enlace enviado</h3>
            <div class="mt-2 text-sm text-green-700">
              {{ successMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje de error -->
    <div v-if="errors.general" class="mt-3">
      <div class="rounded-md bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <Icon name="heroicons:x-circle" class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Error al enviar el enlace
            </h3>
            <div class="mt-2 text-sm text-red-700">
              {{ errors.general }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reenviar enlace -->
    <div v-if="success && !loading" class="mt-4">
      <button
        type="button"
        @click="resendLink"
        :disabled="resendCooldown > 0"
        class="text-sm text-primary-600 hover:text-primary-500 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        <span v-if="resendCooldown > 0">
          Reenviar enlace en {{ resendCooldown }}s
        </span>
        <span v-else> ¿No recibiste el correo? Reenviar enlace </span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

// Props para manejar el estado desde el componente padre
const emit = defineEmits<{
  submit: [email: string];
  resend: [email: string];
}>();

// Estado del formulario
const form = ref({
  email: '',
});

const loading = ref(false);
const success = ref(false);
const successMessage = ref('');
const resendCooldown = ref(0);
const errors = ref({
  email: '',
  general: '',
});

let cooldownInterval: ReturnType<typeof setInterval> | null = null;

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

const validateForm = () => {
  errors.value.email = validateEmail(form.value.email);
  errors.value.general = '';

  return !errors.value.email;
};

const handleForgotPassword = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;

  try {
    emit('submit', form.value.email);
  } catch (error) {
    errors.value.general = 'Error interno del sistema. Inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
};

const resendLink = () => {
  if (resendCooldown.value > 0) return;

  emit('resend', form.value.email);
  startResendCooldown();
};

const startResendCooldown = () => {
  resendCooldown.value = 60; // 60 segundos de cooldown

  cooldownInterval = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownInterval!);
      cooldownInterval = null;
    }
  }, 1000);
};

// Limpiar el intervalo al desmontar el componente
onUnmounted(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval);
  }
});

// Limpiar errores cuando el usuario comience a escribir
const watchForm = () => {
  errors.value.email = '';
  errors.value.general = '';
  success.value = false;
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
  setSuccess: (message: string) => {
    success.value = true;
    successMessage.value = message;
    startResendCooldown();
  },
  clearErrors: () => {
    errors.value = {
      email: '',
      general: '',
    };
  },
  clearSuccess: () => {
    success.value = false;
    successMessage.value = '';
  },
});
</script>
