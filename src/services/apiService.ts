// Centralized API service for all backend calls
import {
  API_BASE_URL,
  GenerateRequest,
  GenerateResponse,
  UploadDocumentRequest,
  UploadDocumentResponse,
  DocumentsResponse,
  AnalysesResponse,
  ApproveRequest,
  ApproveResponse,
  ApprovalStatusResponse,
  ConvertToDocxRequest,
  ConvertToDocxResponse,
  RenderMermaidRequest,
  RenderMermaidResponse,
  ConvertMermaidToDrawioRequest,
  ConvertMermaidToDrawioResponse,
  AzureDevOpsStatusResponse,
  AzureDevOpsTestResponse,
  TRDSection,
  TRDSectionsResponse,
} from '../types/api';
import { Document, Analysis } from '../types';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Document and Analysis APIs
  async generateAnalysis(request: GenerateRequest): Promise<GenerateResponse> {
    const formData = new FormData();
    if (request.file) {
      formData.append('file', request.file);
    }
    if (request.text) {
      formData.append('text', request.text);
    }
    if (request.document_id) {
      formData.append('document_id', request.document_id);
    }

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate analysis');
    }

    return response.json();
  }

  async uploadDocument(request: UploadDocumentRequest): Promise<UploadDocumentResponse> {
    const formData = new FormData();
    formData.append('file', request.file);
    if (request.lob) {
      formData.append('lob', request.lob);
    }
    if (request.tags) {
      formData.append('tags', JSON.stringify(request.tags));
    }

    const response = await fetch(`${this.baseUrl}/api/upload_document`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload document');
    }

    return response.json();
  }

  async getDocuments(): Promise<Document[]> {
    const response = await fetch(`${this.baseUrl}/api/documents`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    const data: DocumentsResponse = await response.json();
    return Array.isArray(data) ? data : data.documents || [];
  }

  async getAnalyses(): Promise<Analysis[]> {
    const response = await fetch(`${this.baseUrl}/api/analyses`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch analyses');
    }

    const data: AnalysesResponse = await response.json();
    return Array.isArray(data) ? data : data.analyses || [];
  }

  // Approval APIs
  async approveAnalysis(request: ApproveRequest): Promise<ApproveResponse> {
    const response = await fetch(`${this.baseUrl}/api/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to approve analysis');
    }

    return response.json();
  }

  async getApprovalStatus(approvalId: string): Promise<ApprovalStatusResponse> {
    const response = await fetch(`${this.baseUrl}/api/approval_status/${approvalId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch approval status');
    }

    return response.json();
  }

  // Document Conversion APIs
  async convertToDocx(request: ConvertToDocxRequest): Promise<ConvertToDocxResponse> {
    const response = await fetch(`${this.baseUrl}/api/convert_to_docx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to convert to DOCX');
    }

    return response.json();
  }

  // Mermaid Diagram APIs
  async renderMermaid(request: RenderMermaidRequest): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/render_mermaid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: request.code }),
    });

    if (!response.ok) {
      throw new Error('Failed to render Mermaid diagram');
    }

    return response.blob();
  }

  async convertMermaidToDrawio(request: ConvertMermaidToDrawioRequest): Promise<ConvertMermaidToDrawioResponse> {
    const response = await fetch(`${this.baseUrl}/api/convert_mermaid_to_drawio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: request.code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to convert Mermaid to Draw.io');
    }

    return response.json();
  }

  // Azure DevOps APIs
  async getAzureDevOpsStatus(): Promise<AzureDevOpsStatusResponse> {
    const response = await fetch(`${this.baseUrl}/api/ado/status`);
    
    if (!response.ok) {
      throw new Error('Failed to get Azure DevOps status');
    }

    return response.json();
  }

  async testAzureDevOpsConnection(): Promise<AzureDevOpsTestResponse> {
    const response = await fetch(`${this.baseUrl}/api/ado/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to test Azure DevOps connection');
    }

    return response.json();
  }

  // TRD Section APIs
  async getTRDSections(): Promise<TRDSection[]> {
    const response = await fetch(`${this.baseUrl}/api/trd/sections`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch TRD sections');
    }

    const data: TRDSectionsResponse = await response.json();
    return data.sections || [];
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

