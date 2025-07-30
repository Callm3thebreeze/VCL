<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <Icon
          name="heroicons:microphone"
          class="mx-auto h-12 w-12 text-primary-600"
        />
        <h2 class="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          Crear cuenta en Vocali
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          ¿Ya tienes cuenta?
          <NuxtLink
            to="/auth/login"
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            Iniciar sesión
          </NuxtLink>
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div
        class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10"
      >
        <RegisterForm @submit="handleRegister" ref="registerFormRef" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Configurar middleware para invitados
definePageMeta({
  middleware: 'guest',
  layout: false,
  title: 'Registro - Vocali',
});

const registerFormRef = ref();

const handleRegister = async (data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}) => {
  try {
    registerFormRef.value?.setLoading(true);

    // Aquí iría la lógica de registro real
    console.log('Register attempt:', data);

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simular éxito/error
    const success = Math.random() > 0.2; // 80% de probabilidad de éxito

    if (success) {
      // Redirigir a página de confirmación o login
      await navigateTo('/auth/login?registered=true');
    } else {
      // Simular diferentes tipos de errores
      const errorType = Math.random();
      if (errorType < 0.5) {
        registerFormRef.value?.setError(
          'email',
          'Este correo electrónico ya está registrado.'
        );
      } else {
        registerFormRef.value?.setError(
          'general',
          'Error al crear la cuenta. Inténtalo de nuevo.'
        );
      }
    }
  } catch (error) {
    console.error('Registration error:', error);
    registerFormRef.value?.setError(
      'general',
      'Error del servidor. Inténtalo de nuevo más tarde.'
    );
  } finally {
    registerFormRef.value?.setLoading(false);
  }
};
</script>
