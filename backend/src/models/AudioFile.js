class AudioFile {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.originalFilename = data.original_filename;
    this.storedFilename = data.stored_filename;
    this.fileSize = data.file_size;
    this.mimeType = data.mime_type;
    this.s3Key = data.s3_key;
    this.s3Url = data.s3_url;
    this.uploadStatus = data.upload_status;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      originalFilename: this.originalFilename,
      storedFilename: this.storedFilename,
      fileSize: this.fileSize,
      mimeType: this.mimeType,
      s3Key: this.s3Key,
      s3Url: this.s3Url,
      uploadStatus: this.uploadStatus,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Get formatted file size
  getFormattedSize() {
    const bytes = this.fileSize;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // Check if upload is completed
  isUploaded() {
    return this.uploadStatus === 'completed';
  }

  // Static method to create AudioFile from database row
  static fromDatabase(row) {
    return new AudioFile(row);
  }
}

module.exports = AudioFile;
