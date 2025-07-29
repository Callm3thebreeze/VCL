<template>
  <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">
      Demo de Transcripción
    </h3>

    <!-- Reproductor simulado -->
    <div class="bg-white rounded-md p-4 border border-gray-200 mb-4">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-2">
          <button
            @click="toggleDemo"
            class="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
          >
            <Icon v-if="!isPlaying" name="heroicons:play" class="w-4 h-4" />
            <Icon v-else name="heroicons:pause" class="w-4 h-4" />
          </button>
          <button
            @click="resetDemo"
            class="text-gray-500 hover:text-gray-700 transition-colors"
          >
            Reiniciar
          </button>
        </div>
        <div class="text-sm text-gray-500">
          Demo de audio: "muestra_audio.mp3"
        </div>
      </div>

      <!-- Barra de progreso -->
      <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>

      <div class="flex justify-between text-xs text-gray-500">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(8000) }}</span>
      </div>
    </div>

    <!-- Transcripción simulada -->
    <div class="bg-white rounded-md p-4 border border-gray-200 mb-4">
      <h4 class="font-medium text-gray-900 mb-2 flex items-center">
        <span
          class="w-2 h-2 bg-green-400 rounded-full mr-2"
          :class="{ 'animate-pulse': isPlaying }"
        ></span>
        Transcripción en tiempo real
      </h4>
      <div class="text-sm text-gray-700 leading-relaxed min-h-[60px]">
        <span v-for="(word, index) in displayedWords" :key="index" class="mr-1">
          <span
            :class="[
              'transition-colors duration-200',
              index < currentWordIndex
                ? 'text-gray-900 font-medium'
                : 'text-gray-400',
            ]"
          >
            {{ word }}
          </span>
        </span>
        <span v-if="isPlaying" class="animate-pulse text-blue-600">|</span>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="grid grid-cols-3 gap-4 text-center">
      <div class="bg-white rounded-md p-3 border border-gray-200">
        <div class="text-xl font-bold text-blue-600">
          {{ Math.round(accuracy) }}%
        </div>
        <div class="text-xs text-gray-500">Precisión</div>
      </div>
      <div class="bg-white rounded-md p-3 border border-gray-200">
        <div class="text-xl font-bold text-green-600">{{ wordsPerMinute }}</div>
        <div class="text-xs text-gray-500">Palabras/min</div>
      </div>
      <div class="bg-white rounded-md p-3 border border-gray-200">
        <div class="text-xl font-bold text-purple-600">50+</div>
        <div class="text-xs text-gray-500">Idiomas</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Estado del componente
const isPlaying = ref(false);
const currentTime = ref(0);
const progress = ref(0);
const accuracy = ref(85);
const wordsPerMinute = ref(0);
const currentWordIndex = ref(0);

// Texto de demo
const fullText =
  'Bienvenido a Vocali, la herramienta más avanzada para transcripción de audio. Con nuestra tecnología de inteligencia artificial, puedes convertir cualquier archivo de audio en texto de alta calidad en cuestión de segundos.';
const displayedWords = fullText.split(' ');

let demoInterval = null;

// Función para alternar demo
const toggleDemo = () => {
  if (isPlaying.value) {
    pauseDemo();
  } else {
    startDemo();
  }
};

const startDemo = () => {
  isPlaying.value = true;

  const totalWords = displayedWords.length;
  const totalDuration = 8000; // 8 segundos
  const wordInterval = totalDuration / totalWords;

  demoInterval = setInterval(() => {
    if (currentWordIndex.value < totalWords) {
      currentWordIndex.value++;
      currentTime.value = (currentWordIndex.value / totalWords) * totalDuration;
      progress.value = (currentWordIndex.value / totalWords) * 100;
      wordsPerMinute.value = Math.round(
        currentWordIndex.value / (currentTime.value / 60000) || 0
      );
      accuracy.value = Math.min(
        99,
        85 + (currentWordIndex.value / totalWords) * 14
      );
    } else {
      pauseDemo();
    }
  }, wordInterval);
};

const pauseDemo = () => {
  isPlaying.value = false;
  if (demoInterval) {
    clearInterval(demoInterval);
    demoInterval = null;
  }
};

const resetDemo = () => {
  pauseDemo();
  currentTime.value = 0;
  progress.value = 0;
  accuracy.value = 85;
  wordsPerMinute.value = 0;
  currentWordIndex.value = 0;
};

// Formatear tiempo
const formatTime = (ms) => {
  const seconds = Math.floor(ms / 1000);
  return `0:${seconds.toString().padStart(2, '0')}`;
};
</script>
