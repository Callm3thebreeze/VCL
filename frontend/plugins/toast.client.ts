/**
 * Plugin de notificaciones Toast para Vocali
 * Utiliza Element Plus ElMessage para mostrar notificaciones
 */

import { ElMessage } from 'element-plus';

interface ToastOptions {
  description?: string;
  duration?: number;
}

interface ToastService {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
}

export default defineNuxtPlugin(() => {
  const toast: ToastService = {
    success: (message: string, options?: ToastOptions) => {
      ElMessage({
        message: options?.description || message,
        type: 'success',
        duration: options?.duration || 3000,
        showClose: true,
        center: false,
      });
    },

    error: (message: string, options?: ToastOptions) => {
      ElMessage({
        message: options?.description || message,
        type: 'error',
        duration: options?.duration || 4000,
        showClose: true,
        center: false,
      });
    },

    warning: (message: string, options?: ToastOptions) => {
      ElMessage({
        message: options?.description || message,
        type: 'warning',
        duration: options?.duration || 3500,
        showClose: true,
        center: false,
      });
    },

    info: (message: string, options?: ToastOptions) => {
      ElMessage({
        message: options?.description || message,
        type: 'info',
        duration: options?.duration || 3000,
        showClose: true,
        center: false,
      });
    },
  };

  return {
    provide: {
      toast,
    },
  };
});
