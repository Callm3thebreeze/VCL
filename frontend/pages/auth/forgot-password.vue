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
          Recuperar contraseña
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Ingresa tu correo electrónico y te enviaremos un enlace para
          restablecer tu contraseña.
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div
        class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10"
      >
        <ForgotPasswordForm
          @submit="handleForgotPassword"
          @resend="handleResend"
          ref="forgotPasswordFormRef"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const forgotPasswordFormRef = ref();

const handleForgotPassword = async (email: string) => {
  try {
    console.log('Forgot password attempt:', email);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const success = Math.random() > 0.1;

    if (success) {
      forgotPasswordFormRef.value?.setSuccess(
        `Se ha enviado un enlace de recuperación a ${email}. Revisa tu bandeja de entrada y carpeta de spam.`
      );
    } else {
      forgotPasswordFormRef.value?.setError(
        'email',
        'No encontramos una cuenta con este correo electrónico.'
      );
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    forgotPasswordFormRef.value?.setError(
      'general',
      'Error del servidor. Inténtalo de nuevo más tarde.'
    );
  } finally {
    forgotPasswordFormRef.value?.setLoading(false);
  }
};

const handleResend = async (email: string) => {
  try {
    console.log('Resend password reset:', email);
    await new Promise((resolve) => setTimeout(resolve, 500));
    forgotPasswordFormRef.value?.setSuccess(
      `Se ha reenviado el enlace de recuperación a ${email}.`
    );
  } catch (error) {
    console.error('Resend error:', error);
    forgotPasswordFormRef.value?.setError(
      'general',
      'Error al reenviar el enlace.'
    );
  }
};
</script>
