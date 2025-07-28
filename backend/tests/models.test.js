const User = require('../src/models/User');
const AudioFile = require('../src/models/AudioFile');
const Transcription = require('../src/models/Transcription');
const SessionToken = require('../src/models/SessionToken');

describe('User Model', () => {
  test('Should create User instance from database row', () => {
    const userData = {
      id: 1,
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const user = User.fromDatabase(userData);

    expect(user.id).toBe(1);
    expect(user.email).toBe('test@example.com');
    expect(user.firstName).toBe('John');
    expect(user.lastName).toBe('Doe');
    expect(user.getFullName()).toBe('John Doe');
  });

  test('toJSON should not include sensitive data', () => {
    const userData = {
      id: 1,
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const user = User.fromDatabase(userData);
    const json = user.toJSON();

    expect(json).not.toHaveProperty('password');
    expect(json).not.toHaveProperty('password_hash');
    expect(json).toHaveProperty('email');
    expect(json).toHaveProperty('firstName');
    expect(json).toHaveProperty('lastName');
  });
});

describe('AudioFile Model', () => {
  test('Should create AudioFile instance from database row', () => {
    const fileData = {
      id: 1,
      user_id: 1,
      original_filename: 'test.mp3',
      stored_filename: 'uuid_test.mp3',
      file_size: 1024000,
      mime_type: 'audio/mpeg',
      s3_key: 'audio-files/uuid_test.mp3',
      s3_url: 'https://s3.amazonaws.com/bucket/audio-files/uuid_test.mp3',
      upload_status: 'completed',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const audioFile = AudioFile.fromDatabase(fileData);

    expect(audioFile.id).toBe(1);
    expect(audioFile.userId).toBe(1);
    expect(audioFile.originalFilename).toBe('test.mp3');
    expect(audioFile.isUploaded()).toBe(true);
    expect(audioFile.getFormattedSize()).toContain('MB');
  });
});

describe('Transcription Model', () => {
  test('Should create Transcription instance from database row', () => {
    const transcriptionData = {
      id: 1,
      audio_file_id: 1,
      user_id: 1,
      transcription_text: 'Test transcription',
      confidence_score: 0.95,
      language: 'es',
      status: 'completed',
      processing_started_at: new Date(Date.now() - 5000),
      processing_completed_at: new Date(),
      error_message: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const transcription = Transcription.fromDatabase(transcriptionData);

    expect(transcription.id).toBe(1);
    expect(transcription.audioFileId).toBe(1);
    expect(transcription.isCompleted()).toBe(true);
    expect(transcription.isFailed()).toBe(false);
    expect(transcription.getProcessingDuration()).toBeGreaterThan(0);
  });
});

describe('SessionToken Model', () => {
  test('Should validate token expiration', () => {
    const futureDate = new Date(Date.now() + 3600000); // 1 hour from now
    const pastDate = new Date(Date.now() - 3600000); // 1 hour ago

    const validTokenData = {
      id: 1,
      user_id: 1,
      token_hash: 'hash123',
      expires_at: futureDate,
      created_at: new Date(),
      is_revoked: false,
    };

    const expiredTokenData = {
      ...validTokenData,
      expires_at: pastDate,
    };

    const validToken = SessionToken.fromDatabase(validTokenData);
    const expiredToken = SessionToken.fromDatabase(expiredTokenData);

    expect(validToken.isValid()).toBe(true);
    expect(validToken.isExpired()).toBe(false);
    expect(expiredToken.isValid()).toBe(false);
    expect(expiredToken.isExpired()).toBe(true);
  });
});
