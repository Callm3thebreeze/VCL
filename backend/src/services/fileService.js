const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const config = require('../config/config');
const AudioFile = require('../models/AudioFile');
const S3Service = require('./s3Service');

class FileService {
  constructor() {
    // Asegurar que el directorio de uploads existe (para archivos temporales)
    this.uploadDir = path.resolve(config.upload.uploadDir);
    fs.ensureDirSync(this.uploadDir);

    // Inicializar S3 Service
    this.s3Service = new S3Service();

    // Flag para determinar si usar S3 o almacenamiento local
    this.useS3 = !!(config.aws.accessKeyId && config.aws.secretAccessKey);

    console.log(
      `💾 FileService inicializado - Usando: ${
        this.useS3 ? 'AWS S3' : 'Almacenamiento Local'
      }`
    );
  }

  /**
   * Save uploaded file to storage (S3 o local)
   */
  async saveFile(tempFilePath, originalFilename, mimeType, userId) {
    if (this.useS3) {
      return await this.saveToS3(
        tempFilePath,
        originalFilename,
        mimeType,
        userId
      );
    } else {
      return await this.saveToLocal(
        tempFilePath,
        originalFilename,
        mimeType,
        userId
      );
    }
  }

  /**
   * Save uploaded file to AWS S3
   */
  async saveToS3(tempFilePath, originalFilename, mimeType, userId) {
    try {
      // Generar nombre único para el archivo
      const fileExtension = path.extname(originalFilename);
      const uniqueFilename = `audio/${userId}/${uuidv4()}${fileExtension}`;

      // Obtener información del archivo antes de subirlo
      const fileStats = await fs.stat(tempFilePath);

      // Subir archivo a S3
      const s3Result = await this.s3Service.uploadFile(
        tempFilePath,
        uniqueFilename,
        mimeType
      );

      // Limpiar archivo temporal
      await fs.remove(tempFilePath);

      console.log(
        `☁️ Archivo guardado en S3: ${s3Result.url} (${fileStats.size} bytes)`
      );

      return {
        storedFilename: uniqueFilename,
        filePath: s3Result.url, // URL de S3
        fileSize: fileStats.size,
        s3Key: s3Result.key,
        s3Bucket: s3Result.bucket,
      };
    } catch (error) {
      console.error('Error saving file to S3:', error);
      // Limpiar archivo temporal en caso de error
      await fs.remove(tempFilePath).catch(() => {});
      throw new Error(`Failed to save file to S3: ${error.message}`);
    }
  }

  /**
   * Save uploaded file to local storage (fallback)
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
        `📁 Archivo guardado localmente: ${finalPath} (${fileStats.size} bytes)`
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
      storage_type: this.useS3 ? 's3' : 'local',
      s3_key: fileData.s3Key || null,
      s3_bucket: fileData.s3Bucket || null,
    };

    const { data, error } = await database.client
      .from('audio_files')
      .insert([audioFileData])
      .select()
      .single();

    if (error) {
      // Si falla la DB, limpiar archivo
      if (this.useS3 && fileData.s3Key) {
        await this.deleteFromS3(fileData.s3Key);
      } else {
        await this.deleteLocalFile(fileData.filePath);
      }
      throw new Error(`Error creating audio file record: ${error.message}`);
    }

    return AudioFile.fromDatabase(data);
  }

  /**
   * Delete file from storage (S3 o local)
   */
  async deleteFile(audioFile) {
    if (audioFile.storageType === 's3' && audioFile.s3Key) {
      return await this.deleteFromS3(audioFile.s3Key);
    } else {
      return await this.deleteLocalFile(audioFile.filePath);
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFromS3(s3Key) {
    try {
      await this.s3Service.deleteFile(s3Key);
      console.log(`☁️ Archivo eliminado de S3: ${s3Key}`);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
    }
  }

  /**
   * Delete file from local storage
   */
  async deleteLocalFile(filePath) {
    try {
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
        console.log(`🗑️ Archivo eliminado localmente: ${filePath}`);
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

    // Eliminar archivo físico (S3 o local)
    await this.deleteFile(audioFile);

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
   * Process complete file upload (save to storage + create DB record)
   */
  async processFileUpload(userId, file) {
    console.log(
      `🚀 processFileUpload iniciado - Usuario: ${userId}, Archivo: ${file.originalname}`
    );
    let fileData = null;

    try {
      // Save file to storage (S3 or local)
      fileData = await this.saveFile(
        file.path,
        file.originalname,
        file.mimetype,
        userId
      );

      console.log(`💾 saveFile resultado:`, {
        storedFilename: fileData.storedFilename,
        s3Key: fileData.s3Key,
        s3Bucket: fileData.s3Bucket,
        fileSize: fileData.fileSize,
      });

      // Create database record with complete data including S3 metadata
      const completeFileData = {
        originalFilename: file.originalname,
        storedFilename: fileData.storedFilename,
        filePath: fileData.filePath,
        fileSize: fileData.fileSize,
        mimeType: file.mimetype,
        s3Key: fileData.s3Key,
        s3Bucket: fileData.s3Bucket,
      };

      const audioFile = await this.createAudioFile(completeFileData, userId);

      console.log(
        `📝 AudioFile creado - ID: ${audioFile.id}, S3Key: ${audioFile.s3Key}, StorageType: ${audioFile.storageType}`
      );

      return audioFile;
    } catch (error) {
      // Clean up on error
      if (fileData) {
        if (this.useS3 && fileData.s3Key) {
          try {
            await this.deleteFromS3(fileData.s3Key);
          } catch (s3Error) {
            console.error('Error cleaning up S3 file:', s3Error);
          }
        } else if (fileData.filePath) {
          await this.deleteLocalFile(fileData.filePath);
        }
      }

      // Clean up uploaded temporary file
      try {
        await fs.remove(file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }

      throw error;
    }
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
