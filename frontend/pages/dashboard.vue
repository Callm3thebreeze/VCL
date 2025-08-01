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
              iVocal
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
      <div class="max-w-4xl mx-auto">
        <!-- Título principal -->
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Transcripción de Audio
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Sube tu archivo de audio y gestiona todas tus transcripciones
          </p>
        </div>

        <!-- Botón centrado para nueva transcripción -->
        <div class="text-center mb-8">
          <button
            @click="showUploadDialog = true"
            class="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Icon name="heroicons:plus" class="w-6 h-6 mr-3" />
            Nueva Transcripción
          </button>
        </div>

        <!-- Historial de transcripciones -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Mis Transcripciones
              </h3>
              <!-- Indicador de polling -->
              <div
                v-if="isPolling"
                class="flex items-center text-blue-600 text-sm"
              >
                <div
                  class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"
                ></div>
                Actualizando...
              </div>
            </div>
          </div>

          <div v-if="transcriptionHistory.length === 0" class="p-8 text-center">
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
              class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h4 class="font-medium text-gray-900 dark:text-white">
                      {{ item.fileName }}
                    </h4>
                    <!-- Indicador de estado -->
                    <span
                      v-if="item.status === 'processing'"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      <div
                        class="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-1"
                      ></div>
                      Procesando
                    </span>
                    <span
                      v-else-if="item.status === 'pending'"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                    >
                      Pendiente
                    </span>
                    <span
                      v-else-if="item.status === 'completed'"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      ✓ Completado
                    </span>
                    <span
                      v-else-if="item.status === 'failed'"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                    >
                      ✗ Error
                    </span>
                  </div>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {{ item.date }} • {{ getWordCount(item.result) }} palabras
                  </p>
                  <p
                    class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2"
                  >
                    {{ item.result.substring(0, 150) }}...
                  </p>
                </div>
                <div class="flex space-x-2 ml-4 gap-2">
                  <button
                    @click="loadTranscription(item)"
                    class="bg-blue-600 text-white hover:bg:text-blue-700 text-sm font-medium px-4 py-2 rounded-lg"
                  >
                    Ver
                  </button>
                  <button
                    @click="deleteTranscription(item.id)"
                    class="bg-red-600 text-white hover:bg-red-700 text-sm font-medium px-4 py-2 rounded-lg"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resultado de transcripción seleccionada -->
        <div
          v-if="selectedTranscription"
          class="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ selectedTranscription.fileName }}
            </h4>
            <div class="flex space-x-2">
              <button
                @click="copyToClipboard"
                class="bg-gray-200 text-gray-900 px-3 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors"
              >
                <Icon name="heroicons:clipboard" class="w-4 h-4 mr-1 inline" />
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
              <button
                @click="selectedTranscription = null"
                class="text-gray-500 hover:text-gray-700"
              >
                <Icon name="heroicons:x-mark" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div
              class="w-full h-48 bg-transparent border-none resize-none focus:outline-none text-gray-900 dark:text-white whitespace-pre-wrap overflow-y-auto"
            >
              {{ selectedTranscription.result }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog de upload -->
    <UploadTranscriptionsDialog
      :isOpen="showUploadDialog"
      @close="showUploadDialog = false"
      @uploaded="handleAdvancedUpload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

// Composables
const { logout } = useAuth();
const { isPolling, handleIntelligentPolling, stopPolling } =
  useTranscriptionPolling();

// Limpiar polling al desmontar el componente
onUnmounted(() => {
  stopPolling();
});

// Funciones de API locales
const getTranscriptions = async () => {
  const config = useRuntimeConfig();
  const token = localStorage.getItem('vocali_token');

  const response = await fetch(`${config.public.apiBase}/api/transcriptions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch transcriptions');
  }

  return await response.json();
};

const deleteTranscriptionApi = async (id: number) => {
  const config = useRuntimeConfig();
  const token = localStorage.getItem('vocali_token');

  const response = await fetch(
    `${config.public.apiBase}/api/transcriptions/${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete transcription');
  }

  return await response.json();
}; // Estado de la aplicación
const showUploadDialog = ref(false);
const selectedTranscription = ref<any>(null);

// Historial de transcripciones (ahora se carga desde la API)
const transcriptionHistory = ref<any[]>([]);
const isLoadingTranscriptions = ref(false);

// Cargar transcripciones al montar el componente
onMounted(async () => {
  await loadTranscriptions();
});

// Funciones
const loadTranscriptions = async () => {
  try {
    isLoadingTranscriptions.value = true;
    const response = await getTranscriptions();

    if (response.success && response.data) {
      // Guardar estado anterior para detectar cambios
      const previousTranscriptions = [...transcriptionHistory.value];

      // Convertir formato de API al formato esperado por el componente
      const newTranscriptions = response.data.map((item: any) => ({
        id: item.id,
        fileName: item.audioFile?.originalFilename || 'archivo.mp3',
        date: new Date(item.createdAt).toLocaleDateString('es-ES'),
        result:
          item.transcriptionText ||
          (item.status === 'completed'
            ? 'Transcripción completada'
            : item.status === 'processing'
            ? 'Transcripción en proceso...'
            : item.status === 'failed'
            ? 'Error en transcripción'
            : 'Pendiente de procesar'),
        status: item.status,
      }));

      // Detectar transcripciones que cambiaron de estado
      if (previousTranscriptions.length > 0) {
        newTranscriptions.forEach((newItem) => {
          const oldItem = previousTranscriptions.find(
            (old) => old.id === newItem.id
          );
          if (oldItem && oldItem.status !== newItem.status) {
            // Estado cambió, mostrar notificación si se completó o falló
            if (newItem.status === 'completed' || newItem.status === 'failed') {
              console.log(
                `🔔 Transcripción ${newItem.fileName} cambió a: ${newItem.status}`
              );

              // Mostrar notificación si está disponible
              if (
                typeof (globalThis as any).$transcriptionNotification ===
                'function'
              ) {
                (globalThis as any).$transcriptionNotification(
                  newItem.fileName,
                  newItem.status
                );
              }
            }
          }
        });
      }

      transcriptionHistory.value = newTranscriptions;

      // Manejar polling inteligente basado en el estado de las transcripciones
      handleIntelligentPolling(transcriptionHistory.value, loadTranscriptions);
    }
  } catch (error) {
    console.error('Error cargando transcripciones:', error);
  } finally {
    isLoadingTranscriptions.value = false;
  }
};

const handleLogout = async () => {
  console.log('🚪 Iniciando logout...');
  await logout();
};

const handleAdvancedUpload = async (transcription: any) => {
  try {
    console.log('🚀 Upload completado:', transcription);

    // Cerrar dialog
    showUploadDialog.value = false;

    // Recargar transcripciones para mostrar la nueva
    await loadTranscriptions();

    // Mostrar la nueva transcripción si está disponible
    const newTranscription = transcriptionHistory.value.find(
      (t) => t.id === transcription.id
    );
    if (newTranscription) {
      selectedTranscription.value = newTranscription;
    }

    console.log('✅ Dashboard actualizado');
  } catch (error) {
    console.error('❌ Error al procesar transcripción:', error);
  }
};

const loadTranscription = (item: any) => {
  selectedTranscription.value = item;
};

const deleteTranscription = async (id: number) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta transcripción?')) {
    try {
      await deleteTranscriptionApi(id);

      // Actualizar lista local
      transcriptionHistory.value = transcriptionHistory.value.filter(
        (t) => t.id !== id
      );

      // Si la transcripción eliminada era la seleccionada, limpiar selección
      if (selectedTranscription.value?.id === id) {
        selectedTranscription.value = null;
      }

      console.log('✅ Transcripción eliminada exitosamente');
    } catch (error) {
      console.error('❌ Error eliminando transcripción:', error);
      alert('Error al eliminar la transcripción. Inténtalo de nuevo.');
    }
  }
};

const getWordCount = (text: string) => {
  // Solo contar palabras si el texto no es un mensaje de estado
  const statusMessages = [
    'Transcripción completada',
    'Transcripción en proceso...',
    'Error en transcripción',
    'Pendiente de procesar',
  ];

  if (statusMessages.includes(text)) {
    return 0;
  }

  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
};

const copyToClipboard = async () => {
  if (!selectedTranscription.value) return;

  try {
    await navigator.clipboard.writeText(selectedTranscription.value.result);
    // Aquí podrías mostrar una notificación de éxito
    alert('Texto copiado al portapapeles');
  } catch (err) {
    console.error('Error al copiar al portapapeles:', err);
  }
};

const downloadTranscription = () => {
  if (!selectedTranscription.value) return;

  const blob = new Blob([selectedTranscription.value.result], {
    type: 'text/plain',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transcripcion-${selectedTranscription.value.fileName}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>
