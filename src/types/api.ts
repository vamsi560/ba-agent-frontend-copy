// API request and response types

import { Document, Analysis, AnalysisResults, BacklogItem, ApprovalStatus, AzureDevOpsStatus } from './index';

// API Base URL
export const API_BASE_URL = 'https://backend-new-bagaent1.vercel.app';

// Request Types
export interface GenerateRequest {
  file?: File;
  text?: string;
  document_id?: string;
  selected_sections?: string[];
}

export interface UploadDocumentRequest {
  file: File;
  lob?: string;
  tags?: string[];
}

export interface ApproveRequest {
  approval_id: string;
  comments?: string;
}

export interface ConvertToDocxRequest {
  content: string;
  filename?: string;
}

export interface RenderMermaidRequest {
  code: string;
}

export interface ConvertMermaidToDrawioRequest {
  code: string;
}

// Response Types
export interface GenerateResponse extends AnalysisResults {
  success: boolean;
  message?: string;
  error?: string;
}

export interface UploadDocumentResponse {
  success: boolean;
  document?: Document;
  error?: string;
}

export interface DocumentsResponse {
  documents: Document[];
}

export interface AnalysesResponse {
  analyses: Analysis[];
}

export interface ApproveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ApprovalStatusResponse extends ApprovalStatus {
  success: boolean;
  error?: string;
}

export interface ConvertToDocxResponse {
  success: boolean;
  download_url?: string;
  error?: string;
}

export interface RenderMermaidResponse {
  success: boolean;
  image_url?: string;
  error?: string;
}

export interface ConvertMermaidToDrawioResponse {
  success: boolean;
  drawio_xml?: string;
  error?: string;
}

export interface AzureDevOpsStatusResponse extends AzureDevOpsStatus {
  success: boolean;
  error?: string;
}

export interface AzureDevOpsTestResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface TRDSection {
  key: string;
  title: string;
  description: string;
}

export interface TRDSectionsResponse {
  sections: TRDSection[];
  success?: boolean;
  error?: string;
}

