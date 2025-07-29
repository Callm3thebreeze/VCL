<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click="handleOverlayClick"
    >
      <!-- Overlay -->
      <div
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        :class="isVisible ? 'opacity-100' : 'opacity-0'"
      ></div>

      <!-- Modal -->
      <div class="flex min-h-screen items-center justify-center p-4">
        <div
          ref="modalRef"
          class="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-auto transform transition-all"
          :class="isVisible ? 'scale-100' : 'scale-95'"
          @click.stop
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between p-4 border-b border-gray-200"
          >
            <h3 class="text-lg font-semibold text-gray-900">
              {{ title || 'Modal' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md"
            >
              <Icon name="heroicons:x" class="w-6 h-6" />
            </button>
          </div>

          <!-- Content -->
          <div class="p-4">
            <slot></slot>
          </div>

          <!-- Footer (opcional) -->
          <div
            v-if="$slots.footer"
            class="flex justify-end space-x-2 p-4 border-t border-gray-200"
          >
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  closable: {
    type: Boolean,
    default: true,
  },
});

// Emits
const emit = defineEmits(['update:modelValue', 'close']);

// Estado local
const isVisible = ref(props.modelValue);
const modalRef = ref(null);

// Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
  }
);

watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
  if (!newValue) {
    emit('close');
  }
});

// Funciones
const closeModal = () => {
  if (props.closable) {
    isVisible.value = false;
  }
};

const handleOverlayClick = (event) => {
  if (event.target === event.currentTarget && props.closable) {
    closeModal();
  }
};

// Manejar tecla Escape
const handleEscape = (event) => {
  if (event.key === 'Escape' && props.closable && isVisible.value) {
    closeModal();
  }
};

// Agregar listener para escape
if (typeof window !== 'undefined') {
  document.addEventListener('keydown', handleEscape);
}
</script>
