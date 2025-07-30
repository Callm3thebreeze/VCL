<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header simple con logout -->
    <header
      class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">
              Vocali
            </h1>
          </div>
          <div class="flex items-center">
            <button
              @click="handleLogout"
              class="text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <!-- Título principal -->
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Transcripción de Audio
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Sube tu archivo de audio y gestiona todas tus transcripciones
          </p>
        </div>

        <div class="grid lg:grid-cols-2 gap-8">
          <!-- Columna izquierda: Nueva transcripción -->
          <div class="space-y-6">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              Nueva Transcripción
            </h3>

            <!-- Área de carga de archivos -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div
                v-if="!selectedFile"
                @drop="handleDrop"
                @dragover.prevent
                @dragenter.prevent
                class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                @click="$refs.fileInput?.click()"
              >
                <Icon
                  name="heroicons:cloud-arrow-up"
                  class="w-12 h-12 text-gray-400 mx-auto mb-4"
                />
                <h4
                  class="text-lg font-medium text-gray-900 dark:text-white mb-2"
                >
                  Arrastra tu archivo aquí o haz clic para seleccionar
                </h4>
                <p class="text-gray-500 dark:text-gray-400">
                  Formatos soportados: MP3, WAV, M4A, FLAC (máx. 100MB)
                </p>
              </div>

              <!-- Archivo seleccionado -->
              <div
                v-else
                class="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <Icon
                      name="heroicons:musical-note"
                      class="w-6 h-6 text-blue-600"
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
                  class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Icon name="heroicons:play" class="w-5 h-5 mr-2 inline" />
                  Iniciar Transcripción
                </button>

                <div
                  v-if="isTranscribing"
                  class="flex items-center justify-center space-x-3"
                >
                  <div
                    class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
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
              class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div class="flex justify-between items-center mb-4">
                <h4 class="text-lg font-medium text-gray-900 dark:text-white">
                  Resultado de la Transcripción
                </h4>
                <div class="flex space-x-2">
                  <button
                    @click="copyToClipboard"
                    class="bg-gray-200 text-gray-900 px-3 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors"
                  >
                    <Icon
                      name="heroicons:clipboard"
                      class="w-4 h-4 mr-1 inline"
                    />
                    Copiar
                  </button>
                  <button
                    @click="downloadTranscription"
                    class="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    <Icon
                      name="heroicons:arrow-down-tray"
                      class="w-4 h-4 mr-1 inline"
                    />
                    Descargar
                  </button>
                </div>
              </div>

              <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <textarea
                  v-model="transcriptionResult"
                  class="w-full h-48 bg-transparent border-none resize-none focus:outline-none text-gray-900 dark:text-white"
                  placeholder="El resultado de la transcripción aparecerá aquí..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Columna derecha: Lista de transcripciones -->
          <div class="space-y-6">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              Mis Transcripciones
            </h3>

            <div
              class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <div
                v-if="transcriptionHistory.length === 0"
                class="p-8 text-center"
              >
                <Icon
                  name="heroicons:document-text"
                  class="w-12 h-12 text-gray-400 mx-auto mb-4"
                />
                <p class="text-gray-500 dark:text-gray-400">
                  Aún no tienes transcripciones. ¡Crea tu primera transcripción!
                </p>
              </div>

              <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
                <div
                  v-for="item in transcriptionHistory"
                  :key="item.id"
                  class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h4
                        class="font-medium text-gray-900 dark:text-white mb-1"
                      >
                        {{ item.fileName }}
                      </h4>
                      <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {{ item.date }} •
                        {{ getWordCount(item.result) }} palabras
                      </p>
                      <p
                        class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2"
                      >
                        {{ item.result.substring(0, 100) }}...
                      </p>
                    </div>
                    <div class="flex space-x-2 ml-4">
                      <button
                        @click="loadTranscription(item)"
                        class="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Ver
                      </button>
                      <button
                        @click="deleteTranscription(item.id)"
                        class="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Estado de la aplicación
const selectedFile = ref<File | null>(null);
const isTranscribing = ref(false);
const transcriptionProgress = ref(0);
const transcriptionResult = ref('');
const fileInput = ref<HTMLInputElement>();

// Historial de transcripciones
const transcriptionHistory = ref([
  {
    id: 1,
    fileName: 'reunión-proyecto.mp3',
    date: '29 Jul 2025',
    result:
      'Esta es una transcripción de ejemplo de una reunión de proyecto donde se discutieron los objetivos del primer trimestre y las estrategias de implementación.',
  },
  {
    id: 2,
    fileName: 'entrevista-cliente.wav',
    date: '28 Jul 2025',
    result:
      'Transcripción de entrevista con cliente donde se recopiló feedback sobre el producto actual y sugerencias de mejora para futuras versiones.',
  },
]);

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
    // Mostrar notificación de éxito
    alert('Texto copiado al portapapeles');
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

const deleteTranscription = (id: number) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta transcripción?')) {
    transcriptionHistory.value = transcriptionHistory.value.filter(
      (t) => t.id !== id
    );
  }
};

const getWordCount = (text: string) => {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
};

const handleLogout = () => {
  window.location.href = '/';
};
</script>
