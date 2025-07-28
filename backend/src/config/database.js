const mysql = require('mysql2/promise');
const config = require('./config');

class Database {
  constructor() {
    this.pool = null;
  }

  async initialize() {
    try {
      this.pool = mysql.createPool({
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        database: config.database.name,
        connectionLimit: config.database.connectionLimit,
        acquireTimeout: config.database.acquireTimeout,
        timeout: config.database.timeout,
        reconnect: true,
        timezone: 'Z',
      });

      // Test the connection
      const connection = await this.pool.getConnection();
      console.log('Database connected successfully');
      connection.release();

      // Create tables if they don't exist
      await this.createTables();
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  async createTables() {
    const queries = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Session tokens table
      `CREATE TABLE IF NOT EXISTS session_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_revoked BOOLEAN DEFAULT false,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_token_hash (token_hash),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Audio files table
      `CREATE TABLE IF NOT EXISTS audio_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        stored_filename VARCHAR(255) NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        s3_key VARCHAR(500) NOT NULL,
        s3_url VARCHAR(1000) NOT NULL,
        upload_status ENUM('uploading', 'completed', 'failed') DEFAULT 'uploading',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_upload_status (upload_status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Transcriptions table
      `CREATE TABLE IF NOT EXISTS transcriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        audio_file_id INT NOT NULL,
        user_id INT NOT NULL,
        transcription_text TEXT,
        confidence_score DECIMAL(3,2),
        language VARCHAR(10) DEFAULT 'es',
        status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
        processing_started_at TIMESTAMP NULL,
        processing_completed_at TIMESTAMP NULL,
        error_message TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (audio_file_id) REFERENCES audio_files(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_audio_file_id (audio_file_id),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    ];

    for (const query of queries) {
      try {
        await this.pool.execute(query);
      } catch (error) {
        console.error('Error creating table:', error);
        throw error;
      }
    }

    console.log('Database tables created successfully');
  }

  async query(sql, params = []) {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async transaction(callback) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('Database connection closed');
    }
  }
}

module.exports = new Database();
