class Transcription {
  constructor(data) {
    this.id = data.id;
    this.audioFileId = data.audio_file_id;
    this.userId = data.user_id;
    this.transcriptionText = data.transcription_text;
    this.confidenceScore = data.confidence_score;
    this.language = data.language;
    this.status = data.status;
    this.processingStartedAt = data.processing_started_at;
    this.processingCompletedAt = data.processing_completed_at;
    this.errorMessage = data.error_message;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      audioFileId: this.audioFileId,
      userId: this.userId,
      transcriptionText: this.transcriptionText,
      confidenceScore: this.confidenceScore,
      language: this.language,
      status: this.status,
      processingStartedAt: this.processingStartedAt,
      processingCompletedAt: this.processingCompletedAt,
      errorMessage: this.errorMessage,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Get processing duration in milliseconds
  getProcessingDuration() {
    if (this.processingStartedAt && this.processingCompletedAt) {
      return (
        new Date(this.processingCompletedAt) -
        new Date(this.processingStartedAt)
      );
    }
    return null;
  }

  // Check if transcription is completed
  isCompleted() {
    return this.status === 'completed';
  }

  // Check if transcription failed
  isFailed() {
    return this.status === 'failed';
  }

  // Check if transcription is in progress
  isProcessing() {
    return this.status === 'processing';
  }

  // Static method to create Transcription from database row
  static fromDatabase(row) {
    return new Transcription(row);
  }
}

module.exports = Transcription;
