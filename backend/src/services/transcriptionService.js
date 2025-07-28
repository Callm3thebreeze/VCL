const database = require('../config/database');
const Transcription = require('../models/Transcription');

class TranscriptionService {
  async createTranscription(audioFileId, userId) {
    const query = `
      INSERT INTO transcriptions (audio_file_id, user_id, status)
      VALUES (?, ?, 'pending')
    `;

    const result = await database.query(query, [audioFileId, userId]);

    return await this.getTranscriptionById(result.insertId);
  }

  async getTranscriptionById(id) {
    const query = 'SELECT * FROM transcriptions WHERE id = ?';
    const rows = await database.query(query, [id]);

    if (rows.length === 0) {
      return null;
    }

    return Transcription.fromDatabase(rows[0]);
  }

  async getTranscriptionByAudioFile(audioFileId, userId) {
    const query = `
      SELECT * FROM transcriptions 
      WHERE audio_file_id = ? AND user_id = ?
    `;

    const rows = await database.query(query, [audioFileId, userId]);

    if (rows.length === 0) {
      return null;
    }

    return Transcription.fromDatabase(rows[0]);
  }

  async getUserTranscriptions(userId, limit = 50, offset = 0) {
    const query = `
      SELECT t.*, af.original_filename, af.s3_url
      FROM transcriptions t
      JOIN audio_files af ON t.audio_file_id = af.id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const rows = await database.query(query, [userId, limit, offset]);

    return rows.map((row) => {
      const transcription = Transcription.fromDatabase(row);
      transcription.audioFile = {
        originalFilename: row.original_filename,
        s3Url: row.s3_url,
      };
      return transcription;
    });
  }

  async updateTranscriptionStatus(
    transcriptionId,
    status,
    additionalData = {}
  ) {
    const allowedStatuses = ['pending', 'processing', 'completed', 'failed'];

    if (!allowedStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const fields = ['status = ?'];
    const values = [status];

    // Handle status-specific updates
    if (status === 'processing') {
      fields.push('processing_started_at = CURRENT_TIMESTAMP');
    }

    if (status === 'completed') {
      fields.push('processing_completed_at = CURRENT_TIMESTAMP');
      if (additionalData.transcriptionText) {
        fields.push('transcription_text = ?');
        values.push(additionalData.transcriptionText);
      }
      if (additionalData.confidenceScore) {
        fields.push('confidence_score = ?');
        values.push(additionalData.confidenceScore);
      }
      if (additionalData.language) {
        fields.push('language = ?');
        values.push(additionalData.language);
      }
    }

    if (status === 'failed' && additionalData.errorMessage) {
      fields.push('error_message = ?');
      values.push(additionalData.errorMessage);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(transcriptionId);

    const query = `
      UPDATE transcriptions 
      SET ${fields.join(', ')}
      WHERE id = ?
    `;

    await database.query(query, values);

    return await this.getTranscriptionById(transcriptionId);
  }

  async deleteTranscription(transcriptionId, userId) {
    const query = `
      DELETE FROM transcriptions 
      WHERE id = ? AND user_id = ?
    `;

    const result = await database.query(query, [transcriptionId, userId]);

    return result.affectedRows > 0;
  }

  async getUserTranscriptionStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as totalTranscriptions,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTranscriptions,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failedTranscriptions,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingTranscriptions,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processingTranscriptions,
        AVG(CASE WHEN confidence_score IS NOT NULL THEN confidence_score ELSE NULL END) as averageConfidence
      FROM transcriptions 
      WHERE user_id = ?
    `;

    const rows = await database.query(query, [userId]);

    return {
      totalTranscriptions: rows[0].totalTranscriptions || 0,
      completedTranscriptions: rows[0].completedTranscriptions || 0,
      failedTranscriptions: rows[0].failedTranscriptions || 0,
      pendingTranscriptions: rows[0].pendingTranscriptions || 0,
      processingTranscriptions: rows[0].processingTranscriptions || 0,
      averageConfidence: rows[0].averageConfidence || 0,
    };
  }

  // Placeholder for actual transcription processing
  // In a real implementation, this would integrate with a speech-to-text service
  async processTranscription(transcriptionId) {
    try {
      // Update status to processing
      await this.updateTranscriptionStatus(transcriptionId, 'processing');

      // Simulate transcription processing (replace with actual service call)
      // This is where you would integrate with AWS Transcribe, Google Speech-to-Text, etc.
      await this.simulateTranscriptionProcessing(transcriptionId);
    } catch (error) {
      console.error('Transcription processing failed:', error);

      await this.updateTranscriptionStatus(transcriptionId, 'failed', {
        errorMessage: error.message,
      });

      throw error;
    }
  }

  // Simulate transcription processing (for development/testing)
  async simulateTranscriptionProcessing(transcriptionId) {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate transcription result
    const mockTranscriptionText =
      'Esta es una transcripción de ejemplo generada por el sistema de prueba.';
    const mockConfidenceScore = 0.95;
    const mockLanguage = 'es';

    await this.updateTranscriptionStatus(transcriptionId, 'completed', {
      transcriptionText: mockTranscriptionText,
      confidenceScore: mockConfidenceScore,
      language: mockLanguage,
    });
  }

  async getPendingTranscriptions() {
    const query = `
      SELECT t.*, af.s3_url, af.s3_key
      FROM transcriptions t
      JOIN audio_files af ON t.audio_file_id = af.id
      WHERE t.status = 'pending'
      ORDER BY t.created_at ASC
    `;

    const rows = await database.query(query);

    return rows.map((row) => {
      const transcription = Transcription.fromDatabase(row);
      transcription.audioFile = {
        s3Url: row.s3_url,
        s3Key: row.s3_key,
      };
      return transcription;
    });
  }
}

module.exports = new TranscriptionService();
