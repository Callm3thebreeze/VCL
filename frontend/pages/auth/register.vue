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
          Crear cuenta en iVocal
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          ¿Ya tienes cuenta?
          <NuxtLink
            to="/"
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
const { register } = useAuth();

const handleRegister = async (data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}) => {
  try {
    console.log('🚀 Iniciando registro con:', data.email);
    registerFormRef.value?.setLoading(true);

    // Validar que las contraseñas coincidan
    if (data.password !== data.confirmPassword) {
      registerFormRef.value?.setError(
        'confirmPassword',
        'Las contraseñas no coinciden.'
      );
      return;
    }

    // Llamar al servicio de registro
    // Separar el nombre completo en firstName y lastName
    const nameParts = data.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName; // Si no hay apellido, usar el nombre

    const success = await register({
      firstName,
      lastName,
      email: data.email,
      password: data.password,
    });

    console.log('✅ Registro resultado:', success);

    if (success) {
      console.log('🎉 Registro exitoso, redirigiendo al dashboard...');
      // Usar setTimeout para asegurar que las cookies se establezcan antes de navegar
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    } else {
      console.log('❌ Registro falló');
      registerFormRef.value?.setError('general', 'Error al crear la cuenta');
    }
  } catch (error: any) {
    console.error('💥 Error en registro:', error);

    // Manejar errores específicos del backend
    if (
      error?.data?.message?.includes('already exists') ||
      error?.data?.message?.includes('ya existe')
    ) {
      registerFormRef.value?.setError(
        'email',
        'Este correo electrónico ya está registrado.'
      );
    } else {
      registerFormRef.value?.setError(
        'general',
        error?.data?.message ||
          'Error del servidor. Inténtalo de nuevo más tarde.'
      );
    }
  } finally {
    registerFormRef.value?.setLoading(false);
  }
};
</script>
