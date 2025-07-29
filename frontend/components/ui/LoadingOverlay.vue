<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-sm mx-4 text-center shadow-xl">
        <!-- Spinner -->
        <div class="flex justify-center mb-4">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          ></div>
        </div>

        <!-- Mensaje -->
        <p class="text-gray-700 font-medium">
          {{ message || 'Cargando...' }}
        </p>

        <!-- Mensaje secundario -->
        <p v-if="description" class="text-sm text-gray-500 mt-2">
          {{ description }}
        </p>
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
  message: {
    type: String,
    default: 'Cargando...',
  },
  description: {
    type: String,
    default: '',
  },
});

// Emits
const emit = defineEmits(['update:modelValue']);

// Estado local
const isVisible = ref(props.modelValue);

// Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
  }
);

watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

// Funciones públicas
const show = (msg, desc) => {
  if (msg) message.value = msg;
  if (desc) description.value = desc;
  isVisible.value = true;
};

const hide = () => {
  isVisible.value = false;
};

// Exponer funciones
defineExpose({
  show,
  hide,
});
</script>
