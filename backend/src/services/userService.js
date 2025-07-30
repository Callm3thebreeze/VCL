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

    // Insertar usuario en Supabase
    const { data, error } = await database.client
      .from('users')
      .insert([
        {
          email,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }

    return User.fromDatabase(data);
  }

  async getUserById(id) {
    const { data, error } = await database.client
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return User.fromDatabase(data);
  }

  async getUserByEmail(email) {
    const { data, error } = await database.client
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return User.fromDatabase(data);
  }

  async authenticateUser(email, password) {
    // Obtener usuario con hash de contraseña
    const { data, error } = await database.client
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, data.password_hash);
    if (!isValidPassword) {
      return null;
    }

    return User.fromDatabase(data);
  }

  async generateToken(userId) {
    // Crear JWT token
    const token = jwt.sign({ userId: userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    // Hash token para almacenamiento en base de datos
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Calcular fecha de expiración
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

    // Almacenar token en Supabase
    const { error } = await database.client.from('session_tokens').insert([
      {
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
      },
    ]);

    if (error) {
      console.error('Error storing session token:', error);
      // No lanzamos error aquí porque el token JWT ya está creado
    }

    return token;
  }

  async validateToken(token, userId) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const { data, error } = await database.client
      .from('session_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .eq('user_id', userId)
      .eq('is_revoked', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    return !error && data;
  }

  async revokeToken(token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const { error } = await database.client
      .from('session_tokens')
      .update({ is_revoked: true })
      .eq('token_hash', tokenHash);

    if (error) {
      console.error('Error revoking token:', error);
    }
  }

  async revokeAllUserTokens(userId) {
    const { error } = await database.client
      .from('session_tokens')
      .update({ is_revoked: true })
      .eq('user_id', userId)
      .eq('is_revoked', false);

    if (error) {
      console.error('Error revoking all user tokens:', error);
    }
  }

  async updateUser(userId, updateData) {
    const fieldMapping = {
      firstName: 'first_name',
      lastName: 'last_name',
      first_name: 'first_name',
      last_name: 'last_name',
    };

    const updateFields = {};

    for (const [key, value] of Object.entries(updateData)) {
      if (fieldMapping[key]) {
        updateFields[fieldMapping[key]] = value;
      }
    }

    if (Object.keys(updateFields).length === 0) {
      throw new Error('No valid fields to update');
    }

    // Agregar timestamp de actualización
    updateFields.updated_at = new Date().toISOString();

    const { error } = await database.client
      .from('users')
      .update(updateFields)
      .eq('id', userId);

    if (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }

    return await this.getUserById(userId);
  }

  async changePassword(userId, currentPassword, newPassword) {
    // Obtener usuario con hash de contraseña actual
    const { data: user, error } = await database.client
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash nueva contraseña
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    const { error: updateError } = await database.client
      .from('users')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Error updating password: ${updateError.message}`);
    }

    // Revocar todos los tokens existentes para forzar re-login
    await this.revokeAllUserTokens(userId);
  }

  async deactivateUser(userId) {
    const { error } = await database.client
      .from('users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Error deactivating user: ${error.message}`);
    }

    // Revocar todos los tokens
    await this.revokeAllUserTokens(userId);
  }

  async cleanupExpiredTokens() {
    const { error } = await database.client
      .from('session_tokens')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Error cleaning up expired tokens:', error);
      return 0;
    }

    // Supabase no devuelve affectedRows directamente
    return 1; // Indicar que la operación fue exitosa
  }
}

module.exports = new UserService();
