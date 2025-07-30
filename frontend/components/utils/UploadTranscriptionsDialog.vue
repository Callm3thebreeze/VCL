<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
    >
      <!-- Overlay -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="closeDialog"
      ></div>

      <!-- This element is to trick the browser into centering the modal contents. -->
      <span
        class="hidden sm:inline-block sm:align-middle sm:h-screen"
        aria-hidden="true"
        >&#8203;</span
      >

      <!-- Modal panel -->
      <div
        class="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
      >
        <div>
          <div
            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100"
          >
            <Icon
              name="heroicons:cloud-arrow-up"
              class="h-6 w-6 text-blue-600"
            />
          </div>
          <div class="mt-3 text-center sm:mt-5">
            <h3
              class="text-lg leading-6 font-medium text-gray-900 dark:text-white"
              id="modal-title"
            >
              Subir nueva transcripción
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Selecciona un archivo de audio para transcribir. Formatos
                soportados: MP3, WAV, M4A, FLAC.
              </p>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleUpload" class="mt-5 space-y-4">
          <!-- File upload area -->
          <div
            class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors"
          >
            <div class="space-y-1 text-center">
              <Icon
                name="heroicons:musical-note"
                class="mx-auto h-12 w-12 text-gray-400"
              />
              <div class="flex text-sm text-gray-600">
                <label
                  for="file-upload"
                  class="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                >
                  <span>Seleccionar archivo</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    class="sr-only"
                    accept="audio/*,.mp3,.wav,.m4a,.flac"
                    @change="handleFileSelect"
                  />
                </label>
                <p class="pl-1">o arrastra y suelta</p>
              </div>
              <p class="text-xs text-gray-500">
                MP3, WAV, M4A, FLAC hasta 100MB
              </p>
            </div>
          </div>

          <!-- Selected file info -->
          <div
            v-if="selectedFile"
            class="bg-gray-50 dark:bg-gray-700 rounded-md p-4"
          >
            <div class="flex items-center">
              <Icon
                name="heroicons:document"
                class="h-5 w-5 text-gray-400 mr-3"
              />
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-medium text-gray-900 dark:text-white truncate"
                >
                  {{ selectedFile.name }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatFileSize(selectedFile.size) }}
                </p>
              </div>
              <button
                type="button"
                @click="removeFile"
                class="ml-3 text-gray-400 hover:text-gray-500"
              >
                <Icon name="heroicons:x-mark" class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- Upload options -->
          <div class="space-y-4">
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Título de la transcripción (opcional)
              </label>
              <input
                v-model="transcriptionTitle"
                type="text"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ej: Reunión de equipo - 30 Enero"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Idioma del audio
              </label>
              <select
                v-model="selectedLanguage"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="auto">Detección automática</option>
                <option value="es">Español</option>
                <option value="en">Inglés</option>
                <option value="fr">Francés</option>
                <option value="de">Alemán</option>
                <option value="it">Italiano</option>
                <option value="pt">Portugués</option>
              </select>
            </div>

            <div class="flex items-center">
              <input
                id="include-timestamps"
                v-model="includeTimestamps"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                for="include-timestamps"
                class="ml-2 block text-sm text-gray-900 dark:text-gray-300"
              >
                Incluir marcas de tiempo en la transcripción
              </label>
            </div>
          </div>

          <!-- Progress bar -->
          <div
            v-if="uploadProgress > 0"
            class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700"
          >
            <div
              class="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
              :style="{ width: uploadProgress + '%' }"
            ></div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {{ uploadProgress }}% completado
            </p>
          </div>

          <!-- Error message -->
          <div v-if="error" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <Icon name="heroicons:x-circle" class="h-5 w-5 text-red-400" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Error</h3>
                <div class="mt-2 text-sm text-red-700">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>
        </form>

        <!-- Actions -->
        <div
          class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense"
        >
          <button
            type="button"
            @click="handleUpload"
            :disabled="!selectedFile || loading"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon
              v-if="loading"
              name="heroicons:arrow-path"
              class="h-4 w-4 mr-2 animate-spin"
            />
            {{ loading ? 'Subiendo...' : 'Subir y transcribir' }}
          </button>
          <button
            type="button"
            @click="closeDialog"
            :disabled="loading"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  isOpen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
});

const emit = defineEmits<{
  close: [];
  uploaded: [transcription: any];
}>();

// Estado del componente
const selectedFile = ref<File | null>(null);
const transcriptionTitle = ref('');
const selectedLanguage = ref('auto');
const includeTimestamps = ref(true);
const loading = ref(false);
const uploadProgress = ref(0);
const error = ref('');

// Función simple para testing
const uploadAndTranscribe = async (audioFile: File, language = 'es') => {
  const formData = new FormData();
  formData.append('audio', audioFile);
  formData.append('language', language);

  const token = localStorage.getItem('vocali_token');

  const response = await fetch(
    'http://localhost:3000/api/transcriptions/upload',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Upload failed');
  }

  return await response.json();
};

// Métodos
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];

    // Validar tipo de archivo
    const allowedTypes = [
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/flac',
      'audio/x-flac',
    ];
    const allowedExtensions = ['.mp3', '.wav', '.m4a', '.flac'];

    const isValidType =
      allowedTypes.includes(file.type) ||
      allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isValidType) {
      error.value =
        'Formato de archivo no soportado. Use MP3, WAV, M4A o FLAC.';
      return;
    }

    // Validar tamaño (100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      error.value =
        'El archivo es demasiado grande. El tamaño máximo es 100MB.';
      return;
    }

    selectedFile.value = file;
    error.value = '';

    // Auto-generar título si no existe
    if (!transcriptionTitle.value) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      transcriptionTitle.value = nameWithoutExt;
    }
  }
};

const removeFile = () => {
  selectedFile.value = null;
  transcriptionTitle.value = '';
  uploadProgress.value = 0;
  error.value = '';
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const handleUpload = async () => {
  if (!selectedFile.value) {
    error.value = 'Selecciona un archivo para subir.';
    return;
  }

  loading.value = true;
  uploadProgress.value = 0;
  error.value = '';

  try {
    console.log('🚀 Iniciando subida de archivo:', selectedFile.value.name);

    // Simular progreso inicial
    uploadProgress.value = 20;

    // Llamar a la API real
    const result = await uploadAndTranscribe(
      selectedFile.value,
      selectedLanguage.value === 'auto' ? 'es' : selectedLanguage.value
    );

    console.log('✅ Resultado de API:', result);
    uploadProgress.value = 100;

    // Emitir el resultado con el formato esperado por el dashboard
    const transcriptionData = {
      id: result.data.transcriptionId,
      fileName: result.data.fileName,
      status: result.data.status,
      result: 'Transcripción en proceso...', // Se actualizará cuando complete
      date: new Date().toLocaleDateString('es-ES'),
    };

    emit('uploaded', transcriptionData);

    // Mostrar notificación de éxito
    console.log('✅ Archivo subido exitosamente!');

    resetForm();
  } catch (err: any) {
    console.error('❌ Error en upload:', err);
    error.value =
      err.message || 'Error al subir el archivo. Inténtalo de nuevo.';
    uploadProgress.value = 0;

    // Mostrar notificación de error
    console.error(
      '❌ Error al subir archivo:',
      err.message || 'Inténtalo de nuevo.'
    );
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  selectedFile.value = null;
  transcriptionTitle.value = '';
  selectedLanguage.value = 'auto';
  includeTimestamps.value = true;
  uploadProgress.value = 0;
  error.value = '';
  loading.value = false;
};

const closeDialog = () => {
  if (!loading.value) {
    resetForm();
    emit('close');
  }
};

// Computed
const isOpen = computed(() => props.isOpen);
</script>
