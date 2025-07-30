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

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            ¿Recordaste tu contraseña?
            <NuxtLink
              to="/"
              class="font-medium text-primary-600 hover:text-primary-500"
            >
              Volver al login
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const forgotPasswordFormRef = ref();
const { requestPasswordReset } = useAuth();

const handleForgotPassword = async (email: string) => {
  try {
    console.log('🚀 Solicitando recuperación de contraseña para:', email);
    forgotPasswordFormRef.value?.setLoading(true);

    const success = await requestPasswordReset(email);
    console.log('✅ Resultado de recuperación:', success);

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
  } catch (error: any) {
    console.error('💥 Error en recuperación de contraseña:', error);
    forgotPasswordFormRef.value?.setError(
      'general',
      error?.data?.message ||
        'Error del servidor. Inténtalo de nuevo más tarde.'
    );
  } finally {
    forgotPasswordFormRef.value?.setLoading(false);
  }
};

const handleResend = async (email: string) => {
  try {
    console.log('🔄 Reenviando enlace de recuperación a:', email);
    await handleForgotPassword(email); // Reutilizar la misma lógica
  } catch (error) {
    console.error('Error reenviando:', error);
  }
};
</script>
