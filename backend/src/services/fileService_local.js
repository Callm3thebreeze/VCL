const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const config = require('../config/config');
const AudioFile = require('../models/AudioFile');

class FileService {
  constructor() {
    // Asegurar que el directorio de uploads existe
    this.uploadDir = path.resolve(config.upload.uploadDir);
    fs.ensureDirSync(this.uploadDir);
  }

  /**
   * Save uploaded file to local storage
   */
  async saveToLocal(tempFilePath, originalFilename, _mimeType, _userId) {
    try {
      // Generar nombre único para el archivo
      const fileExtension = path.extname(originalFilename);
      const uniqueFilename = `${uuidv4()}${fileExtension}`;
      const finalPath = path.join(this.uploadDir, uniqueFilename);

      // Mover archivo temporal a ubicación permanente
      await fs.move(tempFilePath, finalPath);

      // Obtener información del archivo
      const fileStats = await fs.stat(finalPath);

      console.log(
        `📁 Archivo guardado: ${finalPath} (${fileStats.size} bytes)`
      );

      return {
        storedFilename: uniqueFilename,
        filePath: finalPath,
        fileSize: fileStats.size,
      };
    } catch (error) {
      console.error('Error saving file to local storage:', error);
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  /**
   * Create audio file record in database
   */
  async createAudioFile(fileData, userId) {
    const audioFileData = {
      user_id: userId,
      original_filename: fileData.originalFilename,
      stored_filename: fileData.storedFilename,
      file_path: fileData.filePath,
      file_size: fileData.fileSize,
      mime_type: fileData.mimeType,
      duration_seconds: fileData.durationSeconds || null,
      upload_status: 'completed',
    };

    const { data, error } = await database.client
      .from('audio_files')
      .insert([audioFileData])
      .select()
      .single();

    if (error) {
      // Si falla la DB, limpiar archivo
      await this.deleteLocalFile(fileData.filePath);
      throw new Error(`Error creating audio file record: ${error.message}`);
    }

    return AudioFile.fromDatabase(data);
  }

  /**
   * Delete file from local storage
   */
  async deleteLocalFile(filePath) {
    try {
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
        console.log(`🗑️ Archivo eliminado: ${filePath}`);
      }
    } catch (error) {
      console.error('Error deleting local file:', error);
    }
  }

  /**
   * Get audio file by ID
   */
  async getAudioFileById(id) {
    const { data, error } = await database.client
      .from('audio_files')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return AudioFile.fromDatabase(data);
  }

  /**
   * Get user's audio files
   */
  async getUserAudioFiles(userId, options = {}) {
    const { limit = 50, offset = 0 } = options;

    const { data, error } = await database.client
      .from('audio_files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error fetching audio files: ${error.message}`);
    }

    return data.map((item) => AudioFile.fromDatabase(item));
  }

  /**
   * Delete audio file (from DB and storage)
   */
  async deleteAudioFile(audioFileId, userId) {
    // Obtener información del archivo
    const audioFile = await this.getAudioFileById(audioFileId);
    if (!audioFile || audioFile.userId !== userId) {
      throw new Error('Audio file not found or access denied');
    }

    // Eliminar archivo físico
    await this.deleteLocalFile(audioFile.filePath);

    // Eliminar registro de DB
    const { error } = await database.client
      .from('audio_files')
      .delete()
      .eq('id', audioFileId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error deleting audio file record: ${error.message}`);
    }

    return true;
  }

  /**
   * Check if file exists in storage
   */
  async fileExists(filePath) {
    return await fs.pathExists(filePath);
  }

  /**
   * Get file stream for download
   */
  async getFileStream(filePath) {
    if (!(await this.fileExists(filePath))) {
      throw new Error('File not found');
    }
    return fs.createReadStream(filePath);
  }

  /**
   * Validate audio file format
   */
  isValidAudioFile(mimeType) {
    return config.upload.allowedTypes.includes(mimeType);
  }

  /**
   * Get upload directory info
   */
  getUploadInfo() {
    return {
      uploadDir: this.uploadDir,
      maxFileSize: config.upload.maxFileSize,
      allowedTypes: config.upload.allowedTypes,
    };
  }

  /**
   * Clean up old temporary files (optional maintenance method)
   */
  async cleanupTempFiles(maxAgeHours = 24) {
    try {
      const tempDir = path.join(this.uploadDir, 'temp');
      if (!(await fs.pathExists(tempDir))) return;

      const files = await fs.readdir(tempDir);
      const maxAge = maxAgeHours * 60 * 60 * 1000; // hours to milliseconds
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          await fs.remove(filePath);
          console.log(`🧹 Cleaned up temp file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error during temp file cleanup:', error);
    }
  }
}

module.exports = FileService;
