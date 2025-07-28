module.exports = {
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
  },

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'vocali_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-this',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
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
