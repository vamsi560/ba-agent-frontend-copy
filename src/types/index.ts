// Main type definitions for the application

export interface Document {
  id?: string;
  name?: string;
  filename?: string;
  content?: string;
  type?: string;
  file_type?: string;
  size?: number;
  uploadDate?: string;
  date?: string;
  createdAt?: string;
  url?: string;
  lob?: string;
  line_of_business?: string;
  tags?: string[];
  user_email?: string;
  status?: string;
  original_text?: string;
  description?: string;
}

export interface Analysis {
  id: string;
  title: string;
  date: string;
  status: 'completed' | 'in-progress' | 'pending';
  results?: {
    trd?: string;
    hld?: string;
    lld?: string;
    backlog?: BacklogItem[];
  };
  lob?: string;
  line_of_business?: string;
  tags?: string[];
  user_email?: string;
}

export interface BacklogItem {
  id?: string;
  title: string;
  name?: string;
  description?: string;
  priority?: string;
  status?: string;
  type?: string;
  assignee?: string;
  storyPoints?: number;
  effort?: number | string;
  acceptanceCriteria?: string[];
  acceptance_criteria?: string[];
  dependencies?: string[];
  tags?: string[];
  children?: BacklogItem[];
  trd_sections?: string[];
  requirements_covered?: string[];
}

export interface AnalysisResults {
  trd?: string;
  hld?: string;
  lld?: string;
  backlog?: BacklogItem[];
  approval_id?: string;
  approval_url?: string;
  analysis_id?: string;
  system_architecture?: string;
  database_diagram?: string;
  user_flow?: string;
  sentiment_analysis?: string;
  risk_assessment?: string;
  cost_estimation?: string;
  approval_status?: {
    status: 'pending' | 'approved' | 'rejected';
    approver?: string;
    comments?: string;
    timestamp?: string;
    ado_result?: {
      success: boolean;
      message: string;
      items?: Array<{
        id: string;
        type: string;
        title: string;
      }>;
    };
  };
}

export interface Notification {
  show: boolean;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export interface ImageModal {
  open: boolean;
  src: string;
  alt: string;
}

export interface LOBCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface FilterState {
  searchQuery: string;
  sortBy: 'date' | 'name' | 'lob' | 'tags';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list' | 'compact';
  dateRange: {
    start: string | null;
    end: string | null;
  };
  statusFilter: 'all' | 'completed' | 'in-progress' | 'pending';
}

export interface ApprovalStatus {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  approver?: string;
  comments?: string;
  timestamp?: string;
}

export interface AzureDevOpsStatus {
  connected: boolean;
  organization?: string;
  project?: string;
  message?: string;
}

