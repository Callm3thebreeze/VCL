<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'max-w-sm w-full rounded-lg shadow-lg p-4 transition-all duration-300',
          getToastClasses(toast.type),
          toast.show ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        ]"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <component :is="getIcon(toast.type)" class="w-5 h-5" />
          </div>
          <div class="ml-3 w-0 flex-1">
            <p class="text-sm font-medium">
              {{ toast.message }}
            </p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click="removeToast(toast.id)"
              class="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span class="sr-only">Cerrar</span>
              <Icon name="heroicons:x" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';

// Estado de las notificaciones
const toasts = ref([]);

// Función para agregar toast
const addToast = (message, type = 'info', duration = 4000) => {
  const id = Date.now() + Math.random();
  const toast = {
    id,
    message,
    type,
    show: true,
  };

  toasts.value.push(toast);

  // Auto-remover después del tiempo especificado
  setTimeout(() => {
    removeToast(id);
  }, duration);
};

// Función para remover toast
const removeToast = (id) => {
  const index = toasts.value.findIndex((toast) => toast.id === id);
  if (index > -1) {
    toasts.value[index].show = false;
    setTimeout(() => {
      toasts.value.splice(index, 1);
    }, 300);
  }
};

// Obtener clases CSS para el tipo de toast
const getToastClasses = (type) => {
  const classes = {
    success: 'bg-green-50 text-green-800 border border-green-200',
    error: 'bg-red-50 text-red-800 border border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200',
  };
  return classes[type] || classes.info;
};

// Obtener icono para el tipo de toast
const getIcon = (type) => {
  return 'div'; // Placeholder - podríamos usar Icon component aquí
};

// Exponer funciones para uso global
defineExpose({
  addToast,
  removeToast,
});
</script>
