const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

class Database {
  constructor() {
    this.supabase = null;
  }

  async initialize() {
    try {
      // Verificar que tenemos las credenciales de Supabase
      if (!config.supabase.url || !config.supabase.serviceKey) {
        throw new Error('Supabase URL and Service Key are required');
      }

      // Crear cliente de Supabase con la service key para acceso admin
      this.supabase = createClient(
        config.supabase.url,
        config.supabase.serviceKey
      );

      console.log('Supabase client initialized successfully');

      // Crear tablas si no existen
      await this.createTables();
    } catch (error) {
      console.error('Supabase connection failed:', error);
      throw error;
    }
  }

  async createTables() {
    try {
      // En Supabase, las tablas se crean directamente en la interfaz web
      // Pero podemos verificar que existan
      console.log('Verificando tablas en Supabase...');

      // Verificar tabla users
      const { error: usersError } = await this.supabase
        .from('users')
        .select('count', { count: 'exact', head: true });

      if (usersError && usersError.code === 'PGRST116') {
        console.log(
          'Tabla users no existe. Créala en la interfaz de Supabase.'
        );
      } else {
        console.log('Tabla users verificada');
      }

      // Verificar tabla session_tokens
      const { error: tokensError } = await this.supabase
        .from('session_tokens')
        .select('count', { count: 'exact', head: true });

      if (tokensError && tokensError.code === 'PGRST116') {
        console.log(
          'Tabla session_tokens no existe. Créala en la interfaz de Supabase.'
        );
      } else {
        console.log('Tabla session_tokens verificada');
      }

      // Verificar tabla audio_files
      const { error: audioError } = await this.supabase
        .from('audio_files')
        .select('count', { count: 'exact', head: true });

      if (audioError && audioError.code === 'PGRST116') {
        console.log(
          'Tabla audio_files no existe. Créala en la interfaz de Supabase.'
        );
      } else {
        console.log('Tabla audio_files verificada');
      }

      // Verificar tabla transcriptions
      const { error: transcriptionsError } = await this.supabase
        .from('transcriptions')
        .select('count', { count: 'exact', head: true });

      if (transcriptionsError && transcriptionsError.code === 'PGRST116') {
        console.log(
          'Tabla transcriptions no existe. Créala en la interfaz de Supabase.'
        );
      } else {
        console.log('Tabla transcriptions verificada');
      }

      console.log('Verificación de tablas completada');
    } catch (error) {
      console.error('Error verificando tablas:', error);
    }
  }

  async query(sql, _params = []) {
    try {
      // Para consultas SQL directas con Supabase usamos el método rpc o directamente PostgREST
      console.warn(
        'Método query() deprecado para Supabase. Usa los métodos de Supabase directamente.'
      );
      throw new Error('Use Supabase client methods instead of raw SQL queries');
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async transaction(callback) {
    // Supabase maneja las transacciones de forma diferente
    // Por ahora, ejecutamos el callback directamente
    try {
      return await callback(this.supabase);
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  }

  async close() {
    // Supabase no requiere cerrar conexiones explícitamente
    console.log('Supabase client - no connection to close');
  }

  // Getter para acceder al cliente de Supabase
  get client() {
    return this.supabase;
  }
}

module.exports = new Database();
