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
          Iniciar sesión en Vocali
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          ¿No tienes cuenta?
          <NuxtLink
            to="/auth/register"
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            Regístrate aquí
          </NuxtLink>
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div
        class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10"
      >
        <LoginForm @submit="handleLogin" ref="loginFormRef" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
  layout: false,
  title: 'Iniciar sesión - Vocali',
});

const loginFormRef = ref();
const { login } = useAuth();

const handleLogin = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    loginFormRef.value?.setLoading(true);

    const success = await login(credentials);

    if (success) {
      await navigateTo('/dashboard');
    } else {
      loginFormRef.value?.setError('general', 'Credenciales incorrectas');
    }
  } catch (error) {
    console.error('Login error:', error);
    loginFormRef.value?.setError(
      'general',
      'Error del servidor. Inténtalo de nuevo más tarde.'
    );
  } finally {
    loginFormRef.value?.setLoading(false);
  }
};
</script>
