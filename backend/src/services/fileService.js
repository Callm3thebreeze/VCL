const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const config = require('../config/config');
const AudioFile = require('../models/AudioFile');

class FileService {
  constructor() {
    // Configure AWS S3 Client (v3)
    this.s3Client = new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });
  }

  async uploadToS3(filePath, originalFilename, mimeType) {
    const fileBuffer = await fs.readFile(filePath);
    const s3Key = `audio-files/${uuidv4()}_${originalFilename}`;

    const uploadParams = {
      Bucket: config.aws.s3Bucket,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: mimeType,
      // Note: ACL is deprecated in AWS SDK v3, use bucket policies instead
    };

    const command = new PutObjectCommand(uploadParams);
    await this.s3Client.send(command);

    // Construct the public URL (adjust based on your bucket configuration)
    const s3Url = `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${s3Key}`;

    return {
      s3Key: s3Key,
      s3Url: s3Url,
    };
  }

  async deleteFromS3(s3Key) {
    const deleteParams = {
      Bucket: config.aws.s3Bucket,
      Key: s3Key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await this.s3Client.send(command);
  }

  async createAudioFile(userId, fileData, s3Data) {
    const query = `
      INSERT INTO audio_files 
      (user_id, original_filename, stored_filename, file_size, mime_type, s3_key, s3_url, upload_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')
    `;

    const values = [
      userId,
      fileData.originalname,
      fileData.filename,
      fileData.size,
      fileData.mimetype,
      s3Data.s3Key,
      s3Data.s3Url,
    ];

    const result = await database.query(query, values);

    return await this.getAudioFileById(result.insertId);
  }

  async getAudioFileById(id) {
    const query = 'SELECT * FROM audio_files WHERE id = ?';
    const rows = await database.query(query, [id]);

    if (rows.length === 0) {
      return null;
    }

    return AudioFile.fromDatabase(rows[0]);
  }

  async getUserAudioFiles(userId, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM audio_files 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;

    const rows = await database.query(query, [userId, limit, offset]);

    return rows.map((row) => AudioFile.fromDatabase(row));
  }

  async getAudioFileByUserAndId(userId, fileId) {
    const query = 'SELECT * FROM audio_files WHERE id = ? AND user_id = ?';
    const rows = await database.query(query, [fileId, userId]);

    if (rows.length === 0) {
      return null;
    }

    return AudioFile.fromDatabase(rows[0]);
  }

  async deleteAudioFile(userId, fileId) {
    // Get file info first
    const audioFile = await this.getAudioFileByUserAndId(userId, fileId);

    if (!audioFile) {
      throw new Error('Audio file not found or access denied');
    }

    // Delete from S3
    try {
      await this.deleteFromS3(audioFile.s3Key);
    } catch (error) {
      console.error('Error deleting from S3:', error);
      // Continue with database deletion even if S3 deletion fails
    }

    // Delete from database (this will cascade delete transcriptions)
    const query = 'DELETE FROM audio_files WHERE id = ? AND user_id = ?';
    const result = await database.query(query, [fileId, userId]);

    return result.affectedRows > 0;
  }

  async getUserFileStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as totalFiles,
        SUM(file_size) as totalSize,
        AVG(file_size) as averageSize
      FROM audio_files 
      WHERE user_id = ?
    `;

    const rows = await database.query(query, [userId]);

    return {
      totalFiles: rows[0].totalFiles || 0,
      totalSize: rows[0].totalSize || 0,
      averageSize: rows[0].averageSize || 0,
    };
  }

  async cleanupLocalFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error cleaning up local file:', error);
    }
  }

  async processFileUpload(userId, file) {
    let s3Data = null;

    try {
      // Upload to S3
      s3Data = await this.uploadToS3(
        file.path,
        file.originalname,
        file.mimetype
      );

      // Create database record
      const audioFile = await this.createAudioFile(userId, file, s3Data);

      // Clean up local file
      await this.cleanupLocalFile(file.path);

      return audioFile;
    } catch (error) {
      // Clean up on error
      if (s3Data && s3Data.s3Key) {
        try {
          await this.deleteFromS3(s3Data.s3Key);
        } catch (s3Error) {
          console.error('Error cleaning up S3 file:', s3Error);
        }
      }

      await this.cleanupLocalFile(file.path);

      throw error;
    }
  }

  async generatePresignedUrl(s3Key, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: s3Key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }
}

module.exports = new FileService();
