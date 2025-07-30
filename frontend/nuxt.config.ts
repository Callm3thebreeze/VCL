/**
 * Configuración principal de Nuxt 3 para Vocali
 *
 * @description Configuración para una SPA/SSR híbrida con TypeScript,
 * TailwindCSS, Element Plus, i18n y Pinia para gestión de estado.
 */
export default defineNuxtConfig({
  // Fecha de compatibilidad para Nitro
  compatibilityDate: '2025-07-29',

  // Directorio de desarrollo
  devtools: { enabled: true },

  // Configuración TypeScript
  typescript: {
    strict: true,
    typeCheck: false, // Desactivado temporalmente para desarrollo
  },

  // Módulos de Nuxt
  modules: [
    '@nuxtjs/tailwindcss',
    '@element-plus/nuxt',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon',
  ],

  // Configuración de componentes
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  // Configuración de CSS
  css: ['~/assets/styles/_tailwind.scss'],

  // Configuración de Element Plus
  elementPlus: {
    icon: 'ElIcon',
    importStyle: 'scss',
    themes: ['dark'],
  },

  // Variables de entorno runtime
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000',
      appName: 'Vocali',
      appVersion: process.env.npm_package_version || '1.0.0',
    },
  },

  // Configuración del servidor de desarrollo
  devServer: {
    port: 3001,
    host: 'localhost',
  },

  // Configuración del head de la aplicación
  app: {
    head: {
      title: 'Vocali - Transcripción de Audio',
      titleTemplate: '%s | Vocali',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Plataforma de transcripción de audio profesional. Convierte tus archivos de audio a texto de forma rápida y precisa.',
        },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#3b82f6' },
        // Open Graph
        { property: 'og:title', content: 'Vocali - Transcripción de Audio' },
        {
          property: 'og:description',
          content: 'Plataforma de transcripción de audio profesional',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'es_ES' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Vocali - Transcripción de Audio' },
        {
          name: 'twitter:description',
          content: 'Plataforma de transcripción de audio profesional',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32x32.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon-16x16.png',
        },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },

  // Configuración de Pinia
  pinia: {
    storesDirs: ['./stores/**'],
  },

  // Configuración de build
  nitro: {
    compressPublicAssets: true,
    experimental: {
      wasm: true,
    },
  },

  // Configuración de SSR
  ssr: true,

  // Configuración de Vite
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/styles/_variables.scss" as *;',
        },
      },
    },
    optimizeDeps: {
      include: ['axios', 'dayjs'],
    },
  },

  // Configuración de auto-importación
  imports: {
    dirs: ['composables/**'],
  },

  // Hooks del ciclo de vida
  hooks: {
    'build:before': () => {
      console.log('🚀 Iniciando build de Vocali Frontend...');
    },
  },
});
