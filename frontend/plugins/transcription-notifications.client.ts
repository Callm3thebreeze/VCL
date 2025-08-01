export default defineNuxtPlugin(() => {
  if (process.client) {
    const showTranscriptionNotification = (
      fileName: string,
      status: string
    ) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        const title =
          status === 'completed'
            ? '✅ Transcripción completada'
            : '❌ Error en transcripción';

        const body = `${fileName} ${
          status === 'completed'
            ? 'se ha procesado correctamente'
            : 'falló al procesarse'
        }`;

        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'transcription-' + Date.now(),
        });
      }
    };

    const requestNotificationPermission = () => {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    };

    requestNotificationPermission();

    (globalThis as any).$transcriptionNotification =
      showTranscriptionNotification;
  }
});
