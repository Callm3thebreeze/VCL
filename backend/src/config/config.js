module.exports = {
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },

  database: {
    // Supabase PostgreSQL connection (fallback para conexiones directas si es necesario)
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-this',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    whisperModel: process.env.WHISPER_MODEL || 'whisper-1',
    whisperLanguage: process.env.WHISPER_LANGUAGE || 'es',
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 20971520, // 20MB
    allowedTypes: process.env.ALLOWED_AUDIO_TYPES?.split(',') || [
      'audio/mpeg',
      'audio/wav',
      'audio/mp3',
      'audio/mp4',
      'audio/aac',
      'audio/ogg',
    ],
    uploadDir: './uploads',
  },

  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || 'vocali-audio-files',
  },

  fileUpload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 20971520, // 20MB
    allowedTypes: process.env.ALLOWED_AUDIO_TYPES?.split(',') || [
      'audio/mpeg',
      'audio/wav',
      'audio/mp3',
      'audio/mp4',
      'audio/aac',
      'audio/ogg',
    ],
    destination: 'uploads/',
  },

  rateLimiting: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
};
