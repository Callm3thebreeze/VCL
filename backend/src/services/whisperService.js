const OpenAI = require('openai');
const fs = require('fs-extra');
const config = require('../config/config');

class WhisperService {
  constructor() {
    if (!config.openai.apiKey) {
      throw new Error(`
❌ ERROR CRÍTICO: OpenAI API key is required for Whisper service

Para solucionar este error:
1. Obtén una API key de OpenAI en: https://platform.openai.com/api-keys
2. Crea un archivo .env en la raíz del proyecto
3. Agrega la línea: OPENAI_API_KEY=tu_clave_aqui
4. Reinicia el servidor

Sin esta clave, las transcripciones NO funcionarán.
      `);
    }

    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  /**
   * Transcribe audio file using OpenAI Whisper
   * @param {string} audioFilePath - Path to the audio file
   * @param {Object} options - Transcription options
   * @returns {Promise<Object>} Transcription result
   */
  async transcribeAudio(audioFilePath, options = {}) {
    try {
      console.log(`🎤 Iniciando transcripción de: ${audioFilePath}`);

      // Verificar que el archivo existe
      if (!(await fs.pathExists(audioFilePath))) {
        throw new Error(`Audio file not found: ${audioFilePath}`);
      }

      // Obtener información del archivo
      const fileStats = await fs.stat(audioFilePath);
      console.log(`📁 Tamaño del archivo: ${fileStats.size} bytes`);

      // Verificar límite de tamaño (25MB para Whisper API)
      const maxSize = 25 * 1024 * 1024; // 25MB
      if (fileStats.size > maxSize) {
        throw new Error('File size exceeds OpenAI Whisper limit (25MB)');
      }

      // Crear stream del archivo
      const audioStream = fs.createReadStream(audioFilePath);

      // Configurar parámetros de transcripción
      const transcriptionParams = {
        file: audioStream,
        model: config.openai.whisperModel,
        language: options.language || config.openai.whisperLanguage,
        response_format: 'verbose_json', // Incluye timestamps y metadata
      };

      // Solo agregar timestamp_granularities si el response_format lo soporta
      if (transcriptionParams.response_format === 'verbose_json') {
        transcriptionParams.timestamp_granularities = ['word'];
      }

      console.log(`🚀 Enviando a OpenAI Whisper...`);
      const startTime = Date.now();

      // Llamar a la API de Whisper
      const transcription = await this.openai.audio.transcriptions.create(
        transcriptionParams
      );

      const processingTime = Date.now() - startTime;
      console.log(`✅ Transcripción completada en ${processingTime}ms`);

      // Procesar resultado
      const result = {
        text: transcription.text,
        language: transcription.language,
        duration: transcription.duration,
        words: transcription.words || [],
        segments: transcription.segments || [],
        processingTimeMs: processingTime,
        confidence: this.calculateAverageConfidence(transcription.words || []),
      };

      console.log(`📝 Texto transcrito: ${result.text.substring(0, 100)}...`);
      return result;
    } catch (error) {
      console.error('❌ Error en transcripción:', error);
      throw new Error(`Whisper transcription failed: ${error.message}`);
    }
  }

  /**
   * Calculate average confidence score from word-level timestamps
   * @param {Array} words - Array of word objects with confidence scores
   * @returns {number} Average confidence (0-1)
   */
  calculateAverageConfidence(words) {
    if (!words || words.length === 0) return 0.8; // Default confidence when no word data

    const wordsWithConfidence = words.filter(
      (word) => word.confidence !== undefined && word.confidence !== null
    );

    if (wordsWithConfidence.length === 0) return 0.8; // Default when no confidence data

    const confidenceSum = wordsWithConfidence.reduce((sum, word) => {
      return sum + word.confidence;
    }, 0);

    return confidenceSum / wordsWithConfidence.length;
  }

  /**
   * Get supported audio formats
   * @returns {Array} Array of supported MIME types
   */
  getSupportedFormats() {
    return [
      'audio/mpeg', // mp3
      'audio/wav', // wav
      'audio/mp4', // mp4, m4a
      'audio/aac', // aac
      'audio/ogg', // ogg
      'audio/webm', // webm
      'audio/flac', // flac
    ];
  }

  /**
   * Validate audio file format
   * @param {string} mimeType - MIME type of the file
   * @returns {boolean} True if format is supported
   */
  isFormatSupported(mimeType) {
    return this.getSupportedFormats().includes(mimeType);
  }

  /**
   * Estimate transcription cost (approximate)
   * @param {number} durationMinutes - Audio duration in minutes
   * @returns {number} Estimated cost in USD
   */
  estimateCost(durationMinutes) {
    // OpenAI Whisper pricing: $0.006 per minute
    const pricePerMinute = 0.006;
    return durationMinutes * pricePerMinute;
  }
}

module.exports = WhisperService;
