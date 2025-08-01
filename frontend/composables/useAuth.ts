/**
 * Composable de autenticación para Vocali
 * Maneja el estado de autenticación, login, registro y logout
 */

import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ApiResponse,
} from '~/types';

export const useAuth = () => {
  // Helper para construir URLs completas del API
  const buildApiUrl = (endpoint: string) => {
    const config = useRuntimeConfig();
    return `${config.public.apiBase}${endpoint}`;
  };

  // Estado reactivo
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => !!user.value);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Token management
  const tokenKey = 'vocali_token';
  const refreshTokenKey = 'vocali_refresh_token';

  /**
   * Inicializar autenticación al cargar la aplicación
   */
  const initAuth = async () => {
    const token = localStorage.getItem(tokenKey);
    if (!token) {
      return false;
    }

    try {
      isLoading.value = true;
      const response = await $fetch<ApiResponse<User>>(
        buildApiUrl('/api/auth/me'),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.success && response.data) {
        user.value = response.data;
        return true;
      } else {
        await logout();
        return false;
      }
    } catch (err) {
      console.error('Error initializing auth:', err);
      await logout();
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Iniciar sesión con credenciales
   */
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      const config = useRuntimeConfig();
      const apiUrl = `${config.public.apiBase}/api/auth/login`;
      console.log('Attempting login to:', apiUrl);

      const response = await $fetch<ApiResponse<AuthResponse>>(apiUrl, {
        method: 'POST',
        body: credentials,
      });

      console.log('Login response:', response);

      if (response && response.success && response.data) {
        console.log('Response validation passed, processing login...');
        const { user: userData, token } = response.data;

        // Guardar token en localStorage
        localStorage.setItem(tokenKey, token);
        if (response.data.refreshToken) {
          localStorage.setItem(refreshTokenKey, response.data.refreshToken);
        }

        // Guardar token en cookies de Nuxt para middleware
        const tokenCookie = useCookie('vocali_token');
        const refreshTokenCookie = useCookie('vocali_refresh_token');
        tokenCookie.value = token;
        if (response.data.refreshToken) {
          refreshTokenCookie.value = response.data.refreshToken;
        }

        // Establecer usuario
        user.value = userData;
        console.log('User set successfully:', userData);

        // Notificación de éxito
        const { $toast } = useNuxtApp();
        $toast.success('¡Bienvenido de vuelta!', {
          description: `Hola ${userData.firstName}, has iniciado sesión correctamente.`,
        });
        console.log('Login successful!');

        return true;
      } else {
        console.log('Response validation failed:', response);
        error.value = response?.message || 'Error al iniciar sesión';
        return false;
      }
    } catch (err: any) {
      console.error('Login error details:', err);

      // Manejar errores de fetch que incluyen respuestas del servidor
      if (err.data) {
        console.error('Server error response:', err.data);
        error.value = err.data.message || 'Error del servidor';
      } else {
        error.value = err?.message || 'Error de conexión';
      }

      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Registrar nuevo usuario
   */
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<ApiResponse<AuthResponse>>(
        buildApiUrl('/api/auth/register'),
        {
          method: 'POST',
          body: userData,
        }
      );

      if (response.success && response.data) {
        const { user: newUser, token } = response.data;

        // Guardar token en localStorage
        localStorage.setItem(tokenKey, token);
        if (response.data.refreshToken) {
          localStorage.setItem(refreshTokenKey, response.data.refreshToken);
        }

        // Guardar token en cookies de Nuxt para middleware
        const tokenCookie = useCookie('vocali_token');
        const refreshTokenCookie = useCookie('vocali_refresh_token');
        tokenCookie.value = token;
        if (response.data.refreshToken) {
          refreshTokenCookie.value = response.data.refreshToken;
        }

        // Establecer usuario
        user.value = newUser;

        // Notificación de éxito
        const { $toast } = useNuxtApp();
        $toast.success('¡Cuenta creada exitosamente!', {
          description: `Bienvenido ${newUser.firstName}, tu cuenta ha sido creada.`,
        });

        return true;
      } else {
        error.value = response.message || 'Error al crear la cuenta';
        return false;
      }
    } catch (err: any) {
      error.value = err.data?.message || 'Error de conexión';
      console.error('Register error:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async (): Promise<void> => {
    try {
      const token = localStorage.getItem(tokenKey);

      if (token) {
        // Llamar al endpoint de logout para invalidar el token
        await $fetch(buildApiUrl('/api/auth/logout'), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {
          // Ignorar errores del logout remoto
        });
      }
    } finally {
      // Limpiar estado local
      user.value = null;
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(refreshTokenKey);

      // Limpiar cookies de Nuxt más agresivamente
      if (process.client) {
        const tokenCookie = useCookie('vocali_token');
        const refreshTokenCookie = useCookie('vocali_refresh_token');
        tokenCookie.value = null;
        refreshTokenCookie.value = null;

        // También limpiar cookies del navegador directamente
        document.cookie =
          'vocali_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie =
          'vocali_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }

      // Redireccionar a la página de inicio
      await navigateTo('/');

      // Notificación
      const { $toast } = useNuxtApp();
      $toast.info('Sesión cerrada', {
        description: 'Has cerrado sesión correctamente.',
      });
    }
  };

  /**
   * Renovar token de acceso
   */
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refresh = localStorage.getItem(refreshTokenKey);
      if (!refresh) {
        await logout();
        return false;
      }

      const response = await $fetch<ApiResponse<AuthResponse>>(
        buildApiUrl('/api/auth/refresh'),
        {
          method: 'POST',
          body: { refreshToken: refresh },
        }
      );

      if (response.success && response.data) {
        const { token, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem(tokenKey, token);
        localStorage.setItem(refreshTokenKey, newRefreshToken);

        return true;
      } else {
        await logout();
        return false;
      }
    } catch (err) {
      console.error('Token refresh error:', err);
      await logout();
      return false;
    }
  };

  /**
   * Actualizar perfil de usuario
   */
  const updateProfile = async (
    profileData: Partial<User>
  ): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<ApiResponse<User>>(
        buildApiUrl('/api/auth/profile'),
        {
          method: 'PUT',
          body: profileData,
        }
      );

      if (response.success && response.data) {
        user.value = response.data;

        const { $toast } = useNuxtApp();
        $toast.success('Perfil actualizado', {
          description: 'Tus datos han sido actualizados correctamente.',
        });

        return true;
      } else {
        error.value = response.message || 'Error al actualizar el perfil';
        return false;
      }
    } catch (err: any) {
      error.value = err.data?.message || 'Error de conexión';
      console.error('Update profile error:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Cambiar contraseña
   */
  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<ApiResponse>(
        buildApiUrl('/api/auth/change-password'),
        {
          method: 'POST',
          body: {
            currentPassword,
            newPassword,
          },
        }
      );

      if (response.success) {
        const { $toast } = useNuxtApp();
        $toast.success('Contraseña cambiada', {
          description: 'Tu contraseña ha sido actualizada correctamente.',
        });

        return true;
      } else {
        error.value = response.message || 'Error al cambiar la contraseña';
        return false;
      }
    } catch (err: any) {
      error.value = err.data?.message || 'Error de conexión';
      console.error('Change password error:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Solicitar restablecimiento de contraseña
   */
  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<ApiResponse>(
        buildApiUrl('/api/auth/forgot-password'),
        {
          method: 'POST',
          body: { email },
        }
      );

      if (response.success) {
        const { $toast } = useNuxtApp();
        $toast.success('Email enviado', {
          description:
            'Te hemos enviado un enlace para restablecer tu contraseña.',
        });

        return true;
      } else {
        error.value = response.message || 'Error al enviar el email';
        return false;
      }
    } catch (err: any) {
      error.value = err.data?.message || 'Error de conexión';
      console.error('Password reset request error:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Restablecer contraseña con token
   */
  const resetPassword = async (
    token: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<ApiResponse>(
        buildApiUrl('/api/auth/reset-password'),
        {
          method: 'POST',
          body: {
            token,
            newPassword,
          },
        }
      );

      if (response.success) {
        const { $toast } = useNuxtApp();
        $toast.success('Contraseña restablecida', {
          description: 'Tu contraseña ha sido restablecida correctamente.',
        });

        return true;
      } else {
        error.value = response.message || 'Error al restablecer la contraseña';
        return false;
      }
    } catch (err: any) {
      error.value = err.data?.message || 'Error de conexión';
      console.error('Password reset error:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Obtener token actual
   */
  const getToken = (): string | null => {
    return localStorage.getItem(tokenKey);
  };

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const hasRole = (role: string): boolean => {
    return user.value?.roles?.includes(role) ?? false;
  };

  /**
   * Verificar si el usuario tiene permisos para acceder a una ruta
   */
  const canAccess = (requiredRoles?: string[]): boolean => {
    if (!requiredRoles || requiredRoles.length === 0) {
      return isAuthenticated.value;
    }

    return requiredRoles.some((role) => hasRole(role));
  };

  return {
    // Estado
    user: readonly(user),
    isAuthenticated,
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Métodos
    initAuth,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    getToken,
    hasRole,
    canAccess,
  };
};
