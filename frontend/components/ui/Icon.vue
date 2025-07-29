<template>
  <svg
    :class="props.class || 'w-6 h-6'"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      v-if="props.name === 'heroicons:microphone'"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
    />
    <path
      v-else-if="props.name === 'heroicons:user'"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
    <path
      v-else-if="
        props.name === 'heroicons:menu' || props.name === 'heroicons:bars-3'
      "
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M4 6h16M4 12h16M4 18h16"
    />
    <path
      v-else-if="
        props.name === 'heroicons:x' || props.name === 'heroicons:x-mark'
      "
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M6 18L18 6M6 6l12 12"
    />
    <!-- Icono por defecto -->
    <circle v-else cx="12" cy="12" r="10" stroke-width="2" />
  </svg>
</template>

<script setup>
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    default: 'w-6 h-6',
  },
});
</script>
