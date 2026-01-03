export interface AnalysisResult {
  markdown: string;
  timestamp: string;
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING', // Processing file locally
  ANALYZING = 'ANALYZING', // Sending to Gemini
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface VideoFile {
  file: File;
  previewUrl: string;
  base64Data: string;
  mimeType: string;
}