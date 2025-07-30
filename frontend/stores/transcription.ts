/**
 * Store de transcripciones con Pinia
 * Maneja el estado de transcripciones de audio
 */
import { defineStore } from 'pinia';
import type { AudioFile, Transcription, TranscriptionJob } from '~/types';

interface TranscriptionState {
  currentFile: AudioFile | null;
  transcriptions: Transcription[];
  isTranscribing: boolean;
  progress: number;
  error: string | null;
  history: Transcription[];
}

export const useTranscriptionStore = defineStore('transcription', () => {
  // Estado
  const currentFile = ref<AudioFile | null>(null);
  const transcriptions = ref<Transcription[]>([]);
  const isTranscribing = ref(false);
  const progress = ref(0);
  const error = ref<string | null>(null);
  const history = ref<Transcription[]>([]);

  // Getters
  const hasCurrentFile = computed(() => !!currentFile.value);
  const latestTranscription = computed(() =>
    transcriptions.value.length > 0 ? transcriptions.value[0] : null
  );
  const transcriptionCount = computed(() => transcriptions.value.length);

  // Actions
  const setCurrentFile = (file: File) => {
    const audioFile: AudioFile = {
      id: 'file-' + Date.now(),
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      file: file,
      duration: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    currentFile.value = audioFile;
    error.value = null;
  };

  const removeCurrentFile = () => {
    currentFile.value = null;
    progress.value = 0;
    error.value = null;
  };

  const startTranscription = async (): Promise<boolean> => {
    if (!currentFile.value) {
      error.value = 'No hay archivo seleccionado';
      return false;
    }

    isTranscribing.value = true;
    progress.value = 0;
    error.value = null;

    try {
      // Simulación de progreso de transcripción
      const progressInterval = setInterval(() => {
        progress.value += 10;
        if (progress.value >= 100) {
          clearInterval(progressInterval);
          completeTranscription();
        }
      }, 500);

      return true;
    } catch (err: any) {
      error.value = err.message || 'Error durante la transcripción';
      isTranscribing.value = false;
      progress.value = 0;
      return false;
    }
  };

  const completeTranscription = () => {
    if (!currentFile.value) return;

    // Crear transcripción mock
    const transcription: Transcription = {
      id: 'trans-' + Date.now(),
      audioFileId: currentFile.value.id,
      fileName: currentFile.value.fileName,
      text: `Esta es una transcripción de ejemplo del archivo "${currentFile.value.fileName}".

En una implementación real, aquí aparecería el texto transcrito del archivo de audio usando servicios como OpenAI Whisper, Google Speech-to-Text, o Azure Speech Services.

La transcripción incluiría todo el contenido hablado del archivo de audio con alta precisión y formato apropiado, incluyendo:

- Reconocimiento de múltiples hablantes
- Puntuación automática
- Identificación de pausas y silencios
- Marcas de tiempo opcionales
- Corrección automática de errores comunes

Este es un ejemplo para la prueba técnica que demuestra la interfaz y funcionalidad básica del sistema de transcripción de Vocali.`,
      confidence: 0.95,
      duration: 165, // 2:45 minutos
      language: 'es',
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      segments: [
        {
          start: 0,
          end: 15,
          text: 'Esta es una transcripción de ejemplo del archivo.',
          confidence: 0.98,
        },
        {
          start: 15,
          end: 30,
          text: 'En una implementación real, aquí aparecería el texto transcrito.',
          confidence: 0.96,
        },
        // Más segmentos...
      ],
    };

    // Añadir a las transcripciones
    transcriptions.value.unshift(transcription);
    history.value.unshift(transcription);

    // Limpiar estado
    isTranscribing.value = false;
    progress.value = 0;

    // Persistir en localStorage
    if (process.client) {
      localStorage.setItem(
        'vocali_transcriptions',
        JSON.stringify(history.value)
      );
    }
  };

  const loadTranscription = (transcription: Transcription) => {
    // Cargar transcripción seleccionada
    transcriptions.value = [transcription];
  };

  const deleteTranscription = (id: string) => {
    history.value = history.value.filter((t) => t.id !== id);
    transcriptions.value = transcriptions.value.filter((t) => t.id !== id);

    // Actualizar localStorage
    if (process.client) {
      localStorage.setItem(
        'vocali_transcriptions',
        JSON.stringify(history.value)
      );
    }
  };

  const downloadTranscription = (
    transcription: Transcription,
    format: 'txt' | 'json' = 'txt'
  ) => {
    let content: string;
    let fileName: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(transcription, null, 2);
      fileName = `transcripcion-${transcription.fileName}.json`;
      mimeType = 'application/json';
    } else {
      content = transcription.text;
      fileName = `transcripcion-${transcription.fileName}.txt`;
      mimeType = 'text/plain';
    }

    // Crear y descargar archivo
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      return false;
    }
  };

  const loadHistory = () => {
    if (process.client) {
      const saved = localStorage.getItem('vocali_transcriptions');
      if (saved) {
        try {
          history.value = JSON.parse(saved);
        } catch (err) {
          console.error('Error loading transcription history:', err);
        }
      }
    }
  };

  const clearError = () => {
    error.value = null;
  };

  // Cargar historial al inicializar
  if (process.client) {
    loadHistory();
  }

  return {
    // Estado
    currentFile: readonly(currentFile),
    transcriptions: readonly(transcriptions),
    isTranscribing: readonly(isTranscribing),
    progress: readonly(progress),
    error: readonly(error),
    history: readonly(history),

    // Getters
    hasCurrentFile,
    latestTranscription,
    transcriptionCount,

    // Actions
    setCurrentFile,
    removeCurrentFile,
    startTranscription,
    loadTranscription,
    deleteTranscription,
    downloadTranscription,
    copyToClipboard,
    loadHistory,
    clearError,
  };
});
