const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const database = require('../config/database');
const config = require('../config/config');
const User = require('../models/User');
const SessionToken = require('../models/SessionToken');

class UserService {
  async createUser(userData) {
    const { email, password, firstName, lastName } = userData;

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name)
      VALUES (?, ?, ?, ?)
    `;

    const result = await database.query(query, [
      email,
      passwordHash,
      firstName,
      lastName,
    ]);

    // Fetch the created user
    return await this.getUserById(result.insertId);
  }

  async getUserById(id) {
    const query = 'SELECT * FROM users WHERE id = ? AND is_active = true';
    const rows = await database.query(query, [id]);

    if (rows.length === 0) {
      return null;
    }

    return User.fromDatabase(rows[0]);
  }

  async getUserByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ? AND is_active = true';
    const rows = await database.query(query, [email]);

    if (rows.length === 0) {
      return null;
    }

    return User.fromDatabase(rows[0]);
  }

  async authenticateUser(email, password) {
    // Get user with password hash
    const query = 'SELECT * FROM users WHERE email = ? AND is_active = true';
    const rows = await database.query(query, [email]);

    if (rows.length === 0) {
      return null;
    }

    const user = rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return null;
    }

    return User.fromDatabase(user);
  }

  async generateToken(userId) {
    // Create JWT token
    const token = jwt.sign({ userId: userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    // Hash token for database storage
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Store token in database
    const query = `
      INSERT INTO session_tokens (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `;

    await database.query(query, [userId, tokenHash, expiresAt]);

    return token;
  }

  async validateToken(token, userId) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const query = `
      SELECT * FROM session_tokens 
      WHERE token_hash = ? AND user_id = ? AND is_revoked = false AND expires_at > NOW()
    `;

    const rows = await database.query(query, [tokenHash, userId]);

    return rows.length > 0;
  }

  async revokeToken(token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const query = `
      UPDATE session_tokens 
      SET is_revoked = true 
      WHERE token_hash = ?
    `;

    await database.query(query, [tokenHash]);
  }

  async revokeAllUserTokens(userId) {
    const query = `
      UPDATE session_tokens 
      SET is_revoked = true 
      WHERE user_id = ? AND is_revoked = false
    `;

    await database.query(query, [userId]);
  }

  async updateUser(userId, updateData) {
    const allowedFields = ['first_name', 'last_name'];
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(userId);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await database.query(query, values);

    return await this.getUserById(userId);
  }

  async changePassword(userId, currentPassword, newPassword) {
    // Get user with current password hash
    const query = 'SELECT password_hash FROM users WHERE id = ?';
    const rows = await database.query(query, [userId]);

    if (rows.length === 0) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      rows[0].password_hash
    );
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const updateQuery = `
      UPDATE users 
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await database.query(updateQuery, [newPasswordHash, userId]);

    // Revoke all existing tokens to force re-login
    await this.revokeAllUserTokens(userId);
  }

  async deactivateUser(userId) {
    const query = `
      UPDATE users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await database.query(query, [userId]);

    // Revoke all tokens
    await this.revokeAllUserTokens(userId);
  }

  async cleanupExpiredTokens() {
    const query = 'DELETE FROM session_tokens WHERE expires_at < NOW()';
    const result = await database.query(query);
    return result.affectedRows;
  }
}

module.exports = new UserService();
