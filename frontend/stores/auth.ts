/**
 * Store de autenticación con Pinia
 * Maneja el estado global de autenticación
 */
import { defineStore } from 'pinia';
import type { User, LoginCredentials, RegisterData } from '~/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!token.value);
  const userName = computed(() => user.value?.username || '');
  const userEmail = computed(() => user.value?.email || '');

  // Actions
  const initAuth = async () => {
    if (process.client) {
      const savedToken = localStorage.getItem('vocali_token');
      const savedUser = localStorage.getItem('vocali_user');

      if (savedToken && savedUser) {
        try {
          token.value = savedToken;
          user.value = JSON.parse(savedUser);

          // Verificar token con el servidor en una implementación real
          // await validateToken();
        } catch (err) {
          console.error('Error initializing auth:', err);
          logout();
        }
      }
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      // Simulación para prueba técnica
      // En implementación real usar: const { $api } = useNuxtApp();

      // Simulamos una respuesta exitosa
      const mockUser: User = {
        id: '1',
        username: credentials.email.split('@')[0] || 'usuario',
        email: credentials.email,
        firstName: 'Usuario',
        lastName: 'Demo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockToken = 'mock-jwt-token-' + Date.now();

      user.value = mockUser;
      token.value = mockToken;
      refreshToken.value = 'mock-refresh-token';

      // Persistir en localStorage
      if (process.client) {
        localStorage.setItem('vocali_token', mockToken);
        localStorage.setItem('vocali_user', JSON.stringify(mockUser));
        localStorage.setItem('vocali_refresh_token', 'mock-refresh-token');
      }

      return true;
    } catch (err: any) {
      error.value = err.message || 'Error de conexión';
      console.error('Login error:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      // Simulación para prueba técnica
      const mockUser: User = {
        id: '1',
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockToken = 'mock-jwt-token-' + Date.now();

      user.value = mockUser;
      token.value = mockToken;
      refreshToken.value = 'mock-refresh-token';

      // Persistir en localStorage
      if (process.client) {
        localStorage.setItem('vocali_token', mockToken);
        localStorage.setItem('vocali_user', JSON.stringify(mockUser));
        localStorage.setItem('vocali_refresh_token', 'mock-refresh-token');
      }

      return true;
    } catch (err: any) {
      error.value = err.message || 'Error de conexión';
      console.error('Register error:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    // Limpiar estado local
    user.value = null;
    token.value = null;
    refreshToken.value = null;
    error.value = null;

    // Limpiar localStorage
    if (process.client) {
      localStorage.removeItem('vocali_token');
      localStorage.removeItem('vocali_user');
      localStorage.removeItem('vocali_refresh_token');
    }

    // Redirigir al home
    await navigateTo('/');
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // Estado
    user: readonly(user),
    token: readonly(token),
    refreshToken: readonly(refreshToken),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Getters
    isAuthenticated,
    userName,
    userEmail,

    // Actions
    initAuth,
    login,
    register,
    logout,
    clearError,
  };
});
