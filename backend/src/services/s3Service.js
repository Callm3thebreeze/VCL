const AWS = require('aws-sdk');
const fs = require('fs-extra');
const config = require('../config/config');

class S3Service {
  constructor() {
    // Configurar AWS S3
    this.s3 = new AWS.S3({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region,
    });

    this.bucketName = config.aws.s3Bucket;

    console.log(`🪣 S3 Service inicializado con bucket: ${this.bucketName}`);
  }

  /**
   * Subir archivo a S3
   */
  async uploadFile(filePath, fileName, mimeType) {
    try {
      console.log(`📤 Subiendo archivo a S3: ${fileName}`);

      // Leer el archivo desde el sistema local
      const fileContent = await fs.readFile(filePath);

      // Configurar parámetros de S3
      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileName, // Nombre del archivo en S3
        Body: fileContent,
        ContentType: mimeType,
        ServerSideEncryption: 'AES256', // Encriptar el archivo
      };

      // Subir archivo
      const result = await this.s3.upload(uploadParams).promise();

      console.log(`✅ Archivo subido exitosamente a S3: ${result.Location}`);

      return {
        url: result.Location,
        key: result.Key,
        bucket: result.Bucket,
        etag: result.ETag,
      };
    } catch (error) {
      console.error('❌ Error subiendo archivo a S3:', error);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Eliminar archivo de S3
   */
  async deleteFile(fileName) {
    try {
      console.log(`🗑️ Eliminando archivo de S3: ${fileName}`);

      const deleteParams = {
        Bucket: this.bucketName,
        Key: fileName,
      };

      await this.s3.deleteObject(deleteParams).promise();

      console.log(`✅ Archivo eliminado de S3: ${fileName}`);
    } catch (error) {
      console.error('❌ Error eliminando archivo de S3:', error);
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  /**
   * Generar URL temporal (signed) para descargar archivo
   */
  async getSignedUrl(fileName, expiresIn = 3600) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: fileName,
        Expires: expiresIn, // Tiempo en segundos (1 hora por defecto)
      };

      console.log(`🔧 Generando URL firmada con parámetros:`, {
        bucket: params.Bucket,
        key: params.Key,
        expires: params.Expires,
        region: this.s3.config.region,
      });

      const url = await this.s3.getSignedUrlPromise('getObject', params);

      console.log(`🔗 URL temporal generada para: ${fileName}`);
      console.log(`📋 URL completa: ${url.substring(0, 100)}...`);
      return url;
    } catch (error) {
      console.error('❌ Error generando URL temporal:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Verificar si el bucket existe y es accesible
   */
  async testConnection() {
    try {
      console.log(`🧪 Probando conexión con bucket: ${this.bucketName}`);

      await this.s3.headBucket({ Bucket: this.bucketName }).promise();

      console.log(`✅ Conexión con S3 exitosa`);
      return true;
    } catch (error) {
      console.error('❌ Error conectando con S3:', error);
      return false;
    }
  }

  /**
   * Listar archivos en el bucket
   */
  async listFiles(prefix = '') {
    try {
      const params = {
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: 100,
      };

      const result = await this.s3.listObjectsV2(params).promise();

      return result.Contents || [];
    } catch (error) {
      console.error('❌ Error listando archivos de S3:', error);
      throw new Error(`Failed to list files from S3: ${error.message}`);
    }
  }
}

module.exports = S3Service;
