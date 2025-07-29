/**
 * Composable para manejar peticiones API con autenticación automática
 */

import type { ApiResponse, PaginationParams } from '~/types';

export const useApi = () => {
  const { getToken, refreshToken, logout } = useAuth();
  const config = useRuntimeConfig();

  // Base URL de la API
  const baseURL = config.public.apiBase || 'http://localhost:3001';

  /**
   * Función helper para hacer peticiones autenticadas
   */
  const apiRequest = async <T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    const token = getToken();

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${baseURL}${endpoint}`, requestOptions);

      // Si el token ha expirado, intentar renovarlo
      if (response.status === 401 && token) {
        const refreshed = await refreshToken();
        if (refreshed) {
          // Reintentar la petición con el nuevo token
          const newToken = getToken();
          if (newToken) {
            requestOptions.headers = {
              ...requestOptions.headers,
              Authorization: `Bearer ${newToken}`,
            };
            const retryResponse = await fetch(
              `${baseURL}${endpoint}`,
              requestOptions
            );
            return await retryResponse.json();
          }
        } else {
          // No se pudo renovar el token, cerrar sesión
          await logout();
          throw new Error('Session expired');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  };

  /**
   * GET request
   */
  const get = async <T = any>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> => {
    const url = new URL(`${baseURL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return apiRequest<T>(url.pathname + url.search, {
      method: 'GET',
    });
  };

  /**
   * POST request
   */
  const post = async <T = any>(
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  /**
   * PUT request
   */
  const put = async <T = any>(
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  /**
   * PATCH request
   */
  const patch = async <T = any>(
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  /**
   * DELETE request
   */
  const del = async <T = any>(endpoint: string): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, {
      method: 'DELETE',
    });
  };

  /**
   * Upload de archivos
   */
  const upload = async <T = any>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> => {
    const token = getToken();
    const formData = new FormData();

    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response);
          } else {
            reject(
              new Error(response.message || `HTTP error! status: ${xhr.status}`)
            );
          }
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${baseURL}${endpoint}`);

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  };

  /**
   * Petición con paginación
   */
  const paginated = async <T = any>(
    endpoint: string,
    params: PaginationParams = {}
  ): Promise<ApiResponse<T[]>> => {
    const {
      page = 1,
      limit = 10,
      sortBy,
      sortOrder,
      search,
      ...otherParams
    } = params;

    const queryParams: Record<string, any> = {
      page,
      limit,
      ...otherParams,
    };

    if (sortBy) {
      queryParams.sortBy = sortBy;
      queryParams.sortOrder = sortOrder || 'asc';
    }

    if (search) {
      queryParams.search = search;
    }

    return get<T[]>(endpoint, queryParams);
  };

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    upload,
    paginated,
    apiRequest,
  };
};
