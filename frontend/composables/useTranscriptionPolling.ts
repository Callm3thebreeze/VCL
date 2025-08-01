export const useTranscriptionPolling = () => {
  const pollingInterval = ref<NodeJS.Timeout | null>(null);
  const isPolling = ref(false);
  const pollingDelay = 4000;

  const startPolling = (callback: () => Promise<void>) => {
    if (isPolling.value) {
      return;
    }

    console.log('🔄 Iniciando polling de transcripciones...');
    isPolling.value = true;

    pollingInterval.value = setInterval(async () => {
      try {
        await callback();
      } catch (error) {
        console.error('❌ Error en polling:', error);
      }
    }, pollingDelay);
  };

  const stopPolling = () => {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value);
      pollingInterval.value = null;
      isPolling.value = false;
      console.log('⏹️ Polling detenido');
    }
  };

  const hasTranscriptionsInProgress = (transcriptions: any[]) => {
    return transcriptions.some(
      (t) => t.status === 'processing' || t.status === 'pending'
    );
  };

  const handleIntelligentPolling = (
    transcriptions: any[],
    callback: () => Promise<void>
  ) => {
    const hasInProgress = hasTranscriptionsInProgress(transcriptions);

    if (hasInProgress && !isPolling.value) {
      startPolling(callback);
    } else if (!hasInProgress && isPolling.value) {
      stopPolling();
    }
  };
  onUnmounted(() => {
    stopPolling();
  });

  return {
    isPolling: readonly(isPolling),
    startPolling,
    stopPolling,
    hasTranscriptionsInProgress,
    handleIntelligentPolling,
  };
};
