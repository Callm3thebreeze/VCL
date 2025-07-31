/**
 * Definiciones de tipos TypeScript para Vocali
 */

// === TIPOS DE USUARIO ===
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  language: 'es' | 'en';
  theme: 'light' | 'dark' | 'auto';
  autoSave: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    transcriptionComplete: boolean;
  };
  transcription: {
    autoplay: boolean;
    playbackSpeed: number;
    showTimestamps: boolean;
    confidenceThreshold: number;
  };
}

export interface UserStats {
  totalTranscriptions: number;
  totalDuration: number; // en segundos
  totalFiles: number;
  averageAccuracy: number;
  lastActivity: string;
}

// === TIPOS DE AUTENTICACIÓN ===
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface SessionToken {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: string;
}

// === TIPOS DE ARCHIVO ===
export interface AudioFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  duration?: number;
  url: string;
  userId: string;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface FileUploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  message?: string;
}

// === TIPOS DE TRANSCRIPCIÓN ===
export interface Transcription {
  id: string;
  audioFileId: string;
  content: string;
  confidence: number;
  language: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  segments?: TranscriptionSegment[];
  metadata?: TranscriptionMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptionSegment {
  id: string;
  transcriptionId: string;
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
  speaker?: string;
}

export interface TranscriptionMetadata {
  engine: string;
  model: string;
  processingTime: number;
  detectedLanguage?: string;
  speakers?: Speaker[];
  keywords?: Keyword[];
}

export interface Speaker {
  id: string;
  name: string;
  confidence: number;
}

export interface Keyword {
  text: string;
  confidence: number;
  startTime: number;
  endTime: number;
}

// === TIPOS DE API ===
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiError[];
  pagination?: PaginationMeta;
}

export interface ApiError {
  field?: string;
  code: string;
  message: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// === TIPOS DE FORMULARIOS ===
export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  required?: boolean;
  validators?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

// === TIPOS DE UI ===
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: ToastAction[];
}

export interface ToastAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary';
}

export interface Modal {
  id: string;
  component: string;
  props?: Record<string, any>;
  options?: ModalOptions;
}

export interface ModalOptions {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  persistent?: boolean;
  backdrop?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  to?: string;
  disabled?: boolean;
  icon?: string;
}

// === TIPOS DE NAVEGACIÓN ===
export interface NavigationItem {
  label: string;
  to?: string;
  icon?: string;
  children?: NavigationItem[];
  roles?: string[];
  active?: boolean;
  disabled?: boolean;
}

// === TIPOS DE TEMA ===
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animations: boolean;
  reducedMotion: boolean;
}

// === TIPOS DE CONFIGURACIÓN ===
export interface AppConfig {
  name: string;
  version: string;
  api: {
    baseUrl: string;
    timeout: number;
  };
  upload: {
    maxFileSize: number;
    allowedTypes: string[];
    maxFiles: number;
  };
  transcription: {
    engines: TranscriptionEngine[];
    defaultEngine: string;
    supportedLanguages: Language[];
  };
  features: {
    registration: boolean;
    socialLogin: boolean;
    fileSharing: boolean;
    realTimeTranscription: boolean;
  };
}

export interface TranscriptionEngine {
  id: string;
  name: string;
  description: string;
  languages: string[];
  accuracy: number;
  speed: number;
  cost: number;
  features: string[];
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  region?: string;
  supported: boolean;
}

// === TIPOS DE EVENTOS ===
export interface AudioEvent {
  type: 'play' | 'pause' | 'seek' | 'ended' | 'error' | 'loadstart' | 'loadend';
  currentTime: number;
  duration: number;
  data?: any;
}

export interface TranscriptionEvent {
  type: 'start' | 'progress' | 'complete' | 'error' | 'cancel';
  transcriptionId: string;
  progress?: number;
  data?: any;
}

// === TIPOS DE UTILIDADES ===
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

// === TIPOS DE ESTADO GLOBAL ===
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  theme: ThemeConfig;
  locale: string;
  uploads: FileUploadProgress[];
  transcriptions: Transcription[];
  audioFiles: AudioFile[];
}

// === TIPOS DE RUTAS ===
export interface RouteMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  requiresAuth?: boolean;
  roles?: string[];
  layout?: string;
  breadcrumbs?: BreadcrumbItem[];
}

// === TIPOS ESPECÍFICOS DEL DOMINIO ===
export interface TranscriptionProject {
  id: string;
  name: string;
  description?: string;
  audioFiles: AudioFile[];
  transcriptions: Transcription[];
  collaborators: User[];
  settings: ProjectSettings;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSettings {
  language: string;
  engine: string;
  autoTranscribe: boolean;
  shareSettings: {
    isPublic: boolean;
    allowComments: boolean;
    allowDownload: boolean;
  };
}

// === TIPOS DE NOTIFICACIONES TOAST ===
export interface ToastOptions {
  description?: string;
  duration?: number;
}

export interface ToastService {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
}

// === EXTENSIÓN DE NUXT APP ===
declare module '#app' {
  interface NuxtApp {
    $toast: ToastService;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $toast: ToastService;
  }
}

// === EXPORT POR DEFECTO ===
export default {};
