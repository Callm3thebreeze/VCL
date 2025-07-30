<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Transcripciones
          </h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Gestiona tus transcripciones de audio
          </p>
        </div>
        <div class="mt-4 sm:mt-0">
          <button
            @click="showUploadDialog = true"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
            Nueva transcripción
          </button>
        </div>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Buscar
            </label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar transcripciones..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Estado
            </label>
            <select
              v-model="statusFilter"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos</option>
              <option value="completed">Completado</option>
              <option value="processing">Procesando</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Fecha
            </label>
            <select
              v-model="dateFilter"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Lista de transcripciones -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Mis transcripciones
          </h3>
        </div>

        <div class="overflow-x-auto">
          <table
            class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
          >
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Archivo
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Duración
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody
              class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
            >
              <tr
                v-for="transcription in filteredTranscriptions"
                :key="transcription.id"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <Icon
                      name="heroicons:document-text"
                      class="w-5 h-5 text-gray-400 mr-3"
                    />
                    <div>
                      <div
                        class="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {{ transcription.fileName }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ formatFileSize(transcription.fileSize) }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getStatusBadgeClass(transcription.status)"
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ getStatusText(transcription.status) }}
                  </span>
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                >
                  {{ transcription.duration }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                >
                  {{ formatDate(transcription.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      @click="viewTranscription(transcription)"
                      class="text-primary-600 hover:text-primary-900"
                    >
                      Ver
                    </button>
                    <button
                      @click="downloadTranscription(transcription)"
                      class="text-green-600 hover:text-green-900"
                    >
                      Descargar
                    </button>
                    <button
                      @click="deleteTranscription(transcription.id)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Dialog de subida -->
      <UploadTranscriptionsDialog
        :is-open="showUploadDialog"
        @close="showUploadDialog = false"
        @uploaded="onTranscriptionUploaded"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Configurar middleware de autenticación y layout
definePageMeta({
  middleware: 'auth',
  layout: 'clean',
});

// Estado
const showUploadDialog = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const dateFilter = ref('');

// Datos simulados de transcripciones
const transcriptions = ref([
  {
    id: '1',
    fileName: 'reunión-proyecto.mp3',
    fileSize: 5242880, // 5MB
    status: 'completed',
    duration: '02:45',
    createdAt: '2025-07-30T10:00:00Z',
  },
  {
    id: '2',
    fileName: 'entrevista-cliente.wav',
    fileSize: 8388608, // 8MB
    status: 'processing',
    duration: '04:32',
    createdAt: '2025-07-30T09:30:00Z',
  },
  {
    id: '3',
    fileName: 'conferencia.m4a',
    fileSize: 12582912, // 12MB
    status: 'completed',
    duration: '08:15',
    createdAt: '2025-07-29T15:20:00Z',
  },
]);

// Computed
const filteredTranscriptions = computed(() => {
  let filtered = transcriptions.value;

  // Filtrar por búsqueda
  if (searchQuery.value) {
    filtered = filtered.filter((t) =>
      t.fileName.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  // Filtrar por estado
  if (statusFilter.value) {
    filtered = filtered.filter((t) => t.status === statusFilter.value);
  }

  // Filtrar por fecha (implementación básica)
  if (dateFilter.value) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    filtered = filtered.filter((t) => {
      const date = new Date(t.createdAt);
      switch (dateFilter.value) {
        case 'today':
          return date >= today;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return date >= weekAgo;
        case 'month':
          const monthAgo = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            today.getDate()
          );
          return date >= monthAgo;
        default:
          return true;
      }
    });
  }

  return filtered;
});

// Métodos
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Completado';
    case 'processing':
      return 'Procesando';
    case 'error':
      return 'Error';
    default:
      return 'Desconocido';
  }
};

const viewTranscription = (transcription: any) => {
  // Implementar visualización de transcripción
  console.log('Ver transcripción:', transcription);
};

const downloadTranscription = (transcription: any) => {
  // Implementar descarga de transcripción
  console.log('Descargar transcripción:', transcription);
};

const deleteTranscription = (id: string) => {
  // Implementar eliminación de transcripción
  if (confirm('¿Estás seguro de que quieres eliminar esta transcripción?')) {
    transcriptions.value = transcriptions.value.filter((t) => t.id !== id);
  }
};

const onTranscriptionUploaded = (newTranscription: any) => {
  transcriptions.value.unshift(newTranscription);
  showUploadDialog.value = false;
};
</script>
