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

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000',
      appName: 'iVocal',
      appVersion: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },
  },

  devServer: {
    port: 3001,
    host: 'localhost',
  },

  app: {
    head: {
      title: 'iVocal - Transcripción de Audio',
      titleTemplate: '%s | iVocal',
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
        { property: 'og:title', content: 'iVocal - Transcripción de Audio' },
        {
          property: 'og:description',
          content: 'Plataforma de transcripción de audio profesional',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'es_ES' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'iVocal - Transcripción de Audio' },
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

  pinia: {
    storesDirs: ['./stores/**'],
  },

  nitro: {
    compressPublicAssets: true,
    experimental: {
      wasm: true,
    },
    prerender: {
      routes: ['/'],
    },
  },

  routeRules: {
    '/api/**': {
      proxy:
        process.env.NODE_ENV === 'production'
          ? `${
              process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000'
            }/api/**`
          : 'http://localhost:3000/api/**',
    },
  },

  ssr: true,

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

  imports: {
    dirs: ['composables/**'],
  },

  hooks: {
    'build:before': () => {
      console.log('🚀 Iniciando build de iVocal Frontend...');
    },
  },
});
