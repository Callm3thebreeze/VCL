<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Transcripción de Audio
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Sube tu archivo de audio y obtendrás la transcripción automáticamente
        </p>
      </div>

      <!-- Área de carga de archivos -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
        <div
          v-if="!selectedFile"
          @drop="handleDrop"
          @dragover.prevent
          @dragenter.prevent
          class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-primary-500 transition-colors cursor-pointer"
          @click="$refs.fileInput?.click()"
        >
          <Icon
            name="heroicons:cloud-arrow-up"
            class="w-16 h-16 text-gray-400 mx-auto mb-4"
          />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Arrastra tu archivo aquí o haz clic para seleccionar
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            Formatos soportados: MP3, WAV, M4A, FLAC (máx. 100MB)
          </p>
        </div>

        <!-- Archivo seleccionado -->
        <div
          v-else
          class="border border-gray-200 dark:border-gray-600 rounded-lg p-6"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <Icon
                name="heroicons:musical-note"
                class="w-8 h-8 text-primary-600"
              />
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ selectedFile.name }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatFileSize(selectedFile.size) }}
                </p>
              </div>
            </div>
            <button
              @click="removeFile"
              class="text-red-500 hover:text-red-700 transition-colors"
            >
              <Icon name="heroicons:x-mark" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept="audio/*"
          @change="handleFileSelect"
          class="hidden"
        />

        <!-- Botón de transcripción -->
        <div class="text-center mt-6">
          <button
            v-if="selectedFile && !isTranscribing"
            @click="startTranscription"
            class="btn btn-primary px-8 py-3 text-lg"
          >
            <Icon name="heroicons:play" class="w-5 h-5 mr-2" />
            Iniciar Transcripción
          </button>

          <div
            v-if="isTranscribing"
            class="flex items-center justify-center space-x-3"
          >
            <div
              class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"
            ></div>
            <span class="text-gray-600 dark:text-gray-400">
              Transcribiendo... {{ transcriptionProgress }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Resultado de la transcripción -->
      <div
        v-if="transcriptionResult"
        class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
      >
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            Resultado de la Transcripción
          </h2>
          <div class="flex space-x-2">
            <button
              @click="copyToClipboard"
              class="btn btn-secondary px-4 py-2"
            >
              <Icon name="heroicons:clipboard" class="w-4 h-4 mr-2" />
              Copiar
            </button>
            <button
              @click="downloadTranscription"
              class="btn btn-primary px-4 py-2"
            >
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-2" />
              Descargar
            </button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <textarea
            v-model="transcriptionResult"
            class="w-full h-64 bg-transparent border-none resize-none focus:outline-none text-gray-900 dark:text-white"
            placeholder="El resultado de la transcripción aparecerá aquí..."
          ></textarea>
        </div>

        <!-- Información adicional -->
        <div
          class="mt-4 flex justify-between text-sm text-gray-500 dark:text-gray-400"
        >
          <span>Duración: {{ audioDuration || 'N/A' }}</span>
          <span>Palabras: {{ wordCount }}</span>
          <span>Caracteres: {{ transcriptionResult.length }}</span>
        </div>
      </div>

      <!-- Historial simplificado -->
      <div v-if="transcriptionHistory.length > 0" class="mt-8">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Transcripciones Recientes
        </h3>
        <div class="space-y-3">
          <div
            v-for="item in transcriptionHistory"
            :key="item.id"
            class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex justify-between items-center"
          >
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ item.fileName }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ item.date }}
              </p>
            </div>
            <button
              @click="loadTranscription(item)"
              class="text-primary-600 hover:text-primary-700 transition-colors"
            >
              Ver
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Configurar layout limpio para dashboard
definePageMeta({
  layout: 'clean',
});
// Estado de la aplicación
const selectedFile = ref<File | null>(null);
const isTranscribing = ref(false);
const transcriptionProgress = ref(0);
const transcriptionResult = ref('');
const audioDuration = ref<string | null>(null);
const fileInput = ref<HTMLInputElement>();

// Historial de transcripciones (simulado)
const transcriptionHistory = ref([
  {
    id: 1,
    fileName: 'reunión-proyecto.mp3',
    date: '29 Jul 2025',
    result:
      'Esta es una transcripción de ejemplo de una reunión de proyecto...',
  },
]);

// Computed
const wordCount = computed(() => {
  return transcriptionResult.value
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
});

// Funciones de manejo de archivos
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    selectedFile.value = event.dataTransfer.files[0];
  }
};

const removeFile = () => {
  selectedFile.value = null;
  transcriptionResult.value = '';
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Función de transcripción simulada
const startTranscription = async () => {
  if (!selectedFile.value) return;

  isTranscribing.value = true;
  transcriptionProgress.value = 0;

  // Simular progreso de transcripción
  const interval = setInterval(() => {
    transcriptionProgress.value += 10;
    if (transcriptionProgress.value >= 100) {
      clearInterval(interval);
      completeTranscription();
    }
  }, 500);
};

const completeTranscription = () => {
  // Simular resultado de transcripción
  transcriptionResult.value = `Esta es una transcripción de ejemplo del archivo "${selectedFile.value?.name}". 

En una implementación real, aquí aparecería el texto transcrito del archivo de audio usando servicios como OpenAI Whisper, Google Speech-to-Text, o similar.

La transcripción incluiría todo el contenido hablado del archivo de audio con alta precisión y formato apropiado.

Este es un ejemplo para la prueba técnica que demuestra la interfaz y funcionalidad básica del sistema de transcripción.`;

  isTranscribing.value = false;
  transcriptionProgress.value = 0;
  audioDuration.value = '2:45';

  // Agregar al historial
  transcriptionHistory.value.unshift({
    id: Date.now(),
    fileName: selectedFile.value?.name || 'archivo.mp3',
    date: new Date().toLocaleDateString('es-ES'),
    result: transcriptionResult.value,
  });
};

// Funciones de utilidad
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(transcriptionResult.value);
    // Aquí podrías mostrar una notificación de éxito
  } catch (err) {
    console.error('Error al copiar al portapapeles:', err);
  }
};

const downloadTranscription = () => {
  const blob = new Blob([transcriptionResult.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transcripcion-${selectedFile.value?.name || 'audio'}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const loadTranscription = (item: any) => {
  transcriptionResult.value = item.result;
};
</script>

<style scoped>
.btn {
  @apply inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg font-medium transition-colors duration-200;
}

.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600;
}
</style>
