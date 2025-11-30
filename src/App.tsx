import React, { useState, useEffect } from 'react';
import { 
  Target, Bell, User, Menu, X, CheckCircle, Download, Send as SendIcon
} from 'lucide-react';
import JSZip from 'jszip';
import LoginPage from './LoginPage';
import EnhancedDocumentViewer from './components/EnhancedDocumentViewer';
import AdvancedSearch from './components/AdvancedSearch';
import { ErrorBoundary } from './components/common';
import Notification from './components/common/Notification';
import {
  Sidebar,
  BreadcrumbNavigation,
  QuickStats,
  DocumentsSection,
  PastAnalysesSection,
  Capabilities,
  CollaborationPanel,
  UploadSection
} from './components/features';
import { 
  Document, 
  Analysis, 
  AnalysisResults, 
  Notification as NotificationType,
  ImageModal,
  LOBCategory 
} from './types';

// API base URL - hardcoded for Vercel backend
const API_BASE_URL = 'https://backend-new-bagaent1.vercel.app';

function MainApp() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Global error handler for DOM manipulation issues
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.error && event.error.message && event.error.message.includes('removeChild')) {
        console.warn('DOM manipulation error caught:', event.error.message);
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      if (event.reason && event.reason.message && event.reason.message.includes('removeChild')) {
        console.warn('Unhandled DOM manipulation error:', event.reason.message);
        event.preventDefault();
      }
    });

    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  const [activeSection, setActiveSection] = useState<string>('upload');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pastAnalyses, setPastAnalyses] = useState<Analysis[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [notification, setNotification] = useState<NotificationType>({ show: false, message: '', type: 'info' });
  const [imageModal, setImageModal] = useState<ImageModal>({ open: false, src: '', alt: '' });
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [approvalReady, setApprovalReady] = useState<boolean>(false);

  // Enhanced LOB and Project Tagging State
  const [selectedLOB, setSelectedLOB] = useState<string>('all');
  const [projectTags, setProjectTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([
    'P&C Insurance', 'Personal Auto', 'Commercial Auto', 'Homeowners', 
    'General Liability', 'Workers Comp', 'Cyber Insurance', 'Property',
    'US Market', 'Europe Market', 'High Priority', 'In Progress', 'Completed'
  ]);
  const [showTagInput, setShowTagInput] = useState<boolean>(false);
  const [newTag, setNewTag] = useState<string>('');
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<Analysis[]>([]);

  // Enhanced Search and Filtering State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'lob' | 'tags'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in-progress' | 'pending'>('all');

  const [showUploadContainer, setShowUploadContainer] = useState<boolean>(true);
  
  // TRD Section Selection State
  const [selectedTRDSections, setSelectedTRDSections] = useState<string[]>([]);

  // Full Analysis Modal State
  const [fullAnalysisModal, setFullAnalysisModal] = useState<{ open: boolean; data: any; loading: boolean; error: string | null }>({ 
    open: false, 
    data: null, 
    loading: false, 
    error: null 
  });

  // LOB Categories for P&C Insurance
  const lobCategories: LOBCategory[] = [
    { id: 'all', name: 'All Lines', icon: '📊', color: 'gray' },
    { id: 'personal_auto', name: 'Personal Auto', icon: '🚗', color: 'blue' },
    { id: 'commercial_auto', name: 'Commercial Auto', icon: '🚛', color: 'green' },
    { id: 'homeowners', name: 'Homeowners', icon: '🏠', color: 'purple' },
    { id: 'property', name: 'Property', icon: '🏢', color: 'orange' },
    { id: 'general_liability', name: 'General Liability', icon: '🛡️', color: 'red' },
    { id: 'workers_comp', name: 'Workers Comp', icon: '👷', color: 'yellow' },
    { id: 'cyber', name: 'Cyber Insurance', icon: '💻', color: 'indigo' },
    { id: 'professional_liability', name: 'Professional Liability', icon: '⚖️', color: 'pink' },
    { id: 'umbrella', name: 'Umbrella', icon: '☂️', color: 'teal' },
    { id: 'marine', name: 'Marine', icon: '🚢', color: 'cyan' },
    { id: 'aviation', name: 'Aviation', icon: '✈️', color: 'amber' }
  ];

  // Enhanced progress tracking
  const stepNames = [
    'Document Upload',
    'Content Extraction', 
    'Planning Analysis',
    'Technical Documentation',
    'Diagram Generation',
    'Backlog Creation',
    'Final Assembly'
  ];

  // Filtering functions
  const filterByLOB = (items: (Document | Analysis)[], lob: string): (Document | Analysis)[] => {
    if (lob === 'all') return items;
    return items.filter(item => {
      const itemLOB = item.lob || (item as Document).line_of_business || 'unknown';
      return itemLOB.toLowerCase().includes(lob.replace('_', ' '));
    });
  };

  const filterByTags = (items: (Document | Analysis)[], tags: string[]): (Document | Analysis)[] => {
    if (!tags || tags.length === 0) return items;
    return items.filter(item => {
      const itemTags = item.tags || [];
      return tags.some(tag => itemTags.includes(tag));
    });
  };

  // Enhanced filtering functions
  const filterBySearch = (items: (Document | Analysis)[], query: string): (Document | Analysis)[] => {
    if (!query) return items;
    const lowerQuery = query.toLowerCase().trim();
    
    return items.filter(item => {
      const name = ((item as Document).name || (item as Analysis).title || (item as Document).filename || '').toLowerCase();
      const nameMatch = name.includes(lowerQuery);
      
      const content = ((item as Document).content || (item as Document).description || (item as Document).original_text || '').toLowerCase();
      const contentMatch = content.includes(lowerQuery);
      
      const tags = (item.tags || []).join(' ').toLowerCase();
      const tagsMatch = tags.includes(lowerQuery);
      
      const lob = (item.lob || (item as Document).line_of_business || '').toLowerCase();
      const lobMatch = lob.includes(lowerQuery);
      
      const userEmail = ((item as Document).user_email || '').toLowerCase();
      const emailMatch = userEmail.includes(lowerQuery);
      
      const fileType = (((item as Document).file_type || (item as Document).type) || '').toLowerCase();
      const fileTypeMatch = fileType.includes(lowerQuery);
      
      const status = (((item as Document).status || (item as Analysis).status) || '').toLowerCase();
      const statusMatch = status.includes(lowerQuery);
      
      const date = ((item as Document).date || (item as Analysis).date || (item as Document).uploadDate || '').toString().toLowerCase();
      const dateMatch = date.includes(lowerQuery);
      
      const searchTerms = lowerQuery.split(/\s+/);
      const allTermsMatch = searchTerms.every(term => 
        name.includes(term) || 
        content.includes(term) || 
        tags.includes(term) || 
        lob.includes(term) ||
        userEmail.includes(term) ||
        fileType.includes(term) ||
        status.includes(term) ||
        date.includes(term)
      );
      
      return nameMatch || contentMatch || tagsMatch || lobMatch || 
             emailMatch || fileTypeMatch || statusMatch || dateMatch || allTermsMatch;
    });
  };

  const filterByDateRange = (items: (Document | Analysis)[], range: { start: string | null; end: string | null }): (Document | Analysis)[] => {
    if (!range.start && !range.end) return items;
    return items.filter(item => {
      const itemDate = new Date((item as Document).uploadDate || (item as Analysis).date || (item as Document).date || '');
      const startDate = range.start ? new Date(range.start) : null;
      const endDate = range.end ? new Date(range.end) : null;
      
      if (startDate && endDate) {
        return itemDate >= startDate && itemDate <= endDate;
      } else if (startDate) {
        return itemDate >= startDate;
      } else if (endDate) {
        return itemDate <= endDate;
      }
      return true;
    });
  };

  const filterByStatus = (items: (Document | Analysis)[], status: string): (Document | Analysis)[] => {
    if (status === 'all') return items;
    return items.filter(item => {
      const itemStatus = ((item as Document).status || (item as Analysis).status || 'completed');
      return itemStatus.toLowerCase() === status.toLowerCase();
    });
  };

  const sortItems = (items: (Document | Analysis)[], sortBy: string, sortOrder: string): (Document | Analysis)[] => {
    return [...items].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = ((a as Document).name || (a as Analysis).title || (a as Document).filename || '').toLowerCase();
          bValue = ((b as Document).name || (b as Analysis).title || (b as Document).filename || '').toLowerCase();
          break;
        case 'date':
          aValue = new Date((a as Document).uploadDate || (a as Analysis).date || (a as Document).date || '');
          bValue = new Date((b as Document).uploadDate || (b as Analysis).date || (b as Document).date || '');
          break;
        case 'lob':
          aValue = (a.lob || (a as Document).line_of_business || '').toLowerCase();
          bValue = (b.lob || (b as Document).line_of_business || '').toLowerCase();
          break;
        case 'tags':
          aValue = (a.tags || []).length;
          bValue = (b.tags || []).length;
          break;
        default:
          aValue = aValue || '';
          bValue = bValue || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Update filtered data when selections change
  useEffect(() => {
    let filteredDocs = filterByTags(filterByLOB(documents, selectedLOB), projectTags) as Document[];
    let filteredAnalyses = filterByTags(filterByLOB(pastAnalyses, selectedLOB), projectTags) as Analysis[];
    
    // Apply additional filters
    filteredDocs = filterBySearch(filteredDocs, searchQuery) as Document[];
    filteredAnalyses = filterBySearch(filteredAnalyses, searchQuery) as Analysis[];
    
    filteredDocs = filterByDateRange(filteredDocs, dateRange) as Document[];
    filteredAnalyses = filterByDateRange(filteredAnalyses, dateRange) as Analysis[];
    
    filteredDocs = filterByStatus(filteredDocs, statusFilter) as Document[];
    filteredAnalyses = filterByStatus(filteredAnalyses, statusFilter) as Analysis[];
    
    // Apply sorting
    filteredDocs = sortItems(filteredDocs, sortBy, sortOrder) as Document[];
    filteredAnalyses = sortItems(filteredAnalyses, sortBy, sortOrder) as Analysis[];
    
    setFilteredDocuments(filteredDocs);
    setFilteredAnalyses(filteredAnalyses);
  }, [documents, pastAnalyses, selectedLOB, projectTags, searchQuery, dateRange, statusFilter, sortBy, sortOrder]);

  // Tag management functions
  const addTag = (tag: string) => {
    if (tag && !projectTags.includes(tag)) {
      setProjectTags([...projectTags, tag]);
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setProjectTags(projectTags.filter(tag => tag !== tagToRemove));
  };

  const addNewTag = () => {
    if (newTag && !availableTags.includes(newTag)) {
      setAvailableTags([...availableTags, newTag]);
    }
    addTag(newTag);
  };

  // Authentication handlers
  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setResults(null);
    setCurrentStep(0);
    setIsProcessing(false);
    setShowUploadContainer(true);
    setNotification({ show: false, message: '', type: 'info' });
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { 
      if (e.key === 'Escape') {
        setImageModal({ open: false, src: '', alt: '' }); 
      }
    };
    
    try {
      document.addEventListener('keydown', onKeyDown);
    } catch (e: any) {
      console.warn('Event listener setup warning:', e.message);
    }
    
    return () => {
      try {
        document.removeEventListener('keydown', onKeyDown);
      } catch (e: any) {
        console.warn('Event listener cleanup warning:', e.message);
      }
    };
  }, []);

  useEffect(() => {
    const handleTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const sections = ['upload', 'documents', 'analyses'];
        const currentIndex = sections.indexOf(activeSection);
        const nextIndex = (currentIndex + 1) % sections.length;
        setActiveSection(sections[nextIndex]);
      }
    };
    
    try {
      document.addEventListener('keydown', handleTab);
    } catch (e: any) {
      console.warn('Event listener setup warning:', e.message);
    }
    
    return () => {
      try {
        document.removeEventListener('keydown', handleTab);
      } catch (e: any) {
        console.warn('Event listener cleanup warning:', e.message);
      }
    };
  }, [activeSection]);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        const [docsResponse, analysesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/documents`),
          fetch(`${API_BASE_URL}/api/analyses`)
        ]);
        
        if (isMounted) {
          if (docsResponse.ok) {
            const docsData = await docsResponse.json();
            setDocuments(docsData);
          }
          
          if (analysesResponse.ok) {
            const analysesData = await analysesResponse.json();
            setPastAnalyses(analysesData);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { 
    e.preventDefault(); 
    setDragActive(true); 
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { 
    e.preventDefault(); 
    setDragActive(false); 
  };

  const handleFileUpload = async (file: File, selectedSections?: string[]) => {
    if (!file) return;
    
    setIsProcessing(true);
    setCurrentStep(1);
    setResults(null);
    setApprovalReady(false);
    setShowUploadContainer(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Add selected sections if provided
    if (selectedSections && selectedSections.length > 0) {
      formData.append('selected_sections', JSON.stringify(selectedSections));
    }

    try {
      setNotification({ show: true, message: 'Uploading document...', type: 'info' });
      setCurrentStep(2);
      
      // Simulate incremental progress updates
      const progressInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < stepNames.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2000);
      
      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        clearInterval(progressInterval);
        setCurrentStep(stepNames.length);
        
        console.log('Received data from backend:', data);
        console.log('Backlog data:', data.backlog);
        console.log('Backlog type:', typeof data.backlog);
        console.log('Backlog length:', Array.isArray(data.backlog) ? data.backlog.length : 'Not an array');
        
        setResults(data);
        setApprovalReady(true);
        setShowUploadContainer(false);
        setNotification({ show: true, message: 'Analysis completed successfully! Upload section hidden for better visibility.', type: 'success' });
        
        setNotifications(prev => [...prev, `New analysis completed for ${file.name}`]);
        
        // Reload data
        const [docsResponse, analysesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/documents`),
          fetch(`${API_BASE_URL}/api/analyses`)
        ]);
        
        if (docsResponse.ok) {
          const docsData = await docsResponse.json();
          setDocuments(docsData);
        }
        
        if (analysesResponse.ok) {
          const analysesData = await analysesResponse.json();
          setPastAnalyses(analysesData);
        }
      } else {
        clearInterval(progressInterval);
        const errorData = await response.json();
        setNotification({ show: true, message: `Error: ${errorData.error}`, type: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setNotification({ show: true, message: 'Network error occurred', type: 'error' });
    } finally {
      setIsProcessing(false);
      setCurrentStep(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      // Validate that at least one section is selected
      if (selectedTRDSections.length === 0) {
        setNotification({ 
          show: true, 
          message: 'Please select at least one TRD section to generate', 
          type: 'warning' 
        });
        return;
      }
      await handleFileUpload(fileInput.files[0], selectedTRDSections);
    }
  };


  const handleDownloadAll = () => {
    if (!results) return;
    
    const zip = new JSZip();
    
    if (results.trd) {
      zip.file('Technical_Requirements_Document.md', results.trd);
    }
    
    if (results.hld) {
      zip.file('High_Level_Design.md', results.hld);
    }
    if (results.lld) {
      zip.file('Low_Level_Design.md', results.lld);
    }
    
    if (results.backlog) {
      zip.file('Project_Backlog.json', JSON.stringify(results.backlog, null, 2));
    }
    
    zip.generateAsync({ type: 'blob' }).then(content => {
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'BA_Agent_Analysis.zip';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const handleSendForApproval = async () => {
    if (!results) return;
    
    try {
      setNotification({ show: true, message: 'Sending for approval...', type: 'info' });
      
      const response = await fetch(`${API_BASE_URL}/api/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: results.analysis_id,
          results: results
        }),
      });
      
      if (response.ok) {
        const approvalData = await response.json();
        setNotification({ 
          show: true, 
          message: `Analysis sent for approval! Approval ID: ${approvalData.approval_id}`, 
          type: 'success' 
        });
        
        setResults(prev => ({
          ...prev!,
          approval_id: approvalData.approval_id,
          approval_url: approvalData.approval_url
        }));
      } else {
        const errorData = await response.json();
        setNotification({ show: true, message: `Failed to send for approval: ${errorData.error}`, type: 'error' });
      }
    } catch (error) {
      setNotification({ show: true, message: 'Error sending for approval', type: 'error' });
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotification({ show: true, message: `${label} copied to clipboard!`, type: 'success' });
    } catch (error) {
      setNotification({ show: true, message: 'Failed to copy to clipboard', type: 'error' });
    }
  };

  const downloadAsDocx = async (markdownContent: string, filename: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/convert_to_docx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: markdownContent }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        setNotification({ show: true, message: 'Failed to convert to DOCX', type: 'error' });
      }
    } catch (error) {
      setNotification({ show: true, message: 'Error converting to DOCX', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen">
      <Notification notification={notification} onClose={() => setNotification({ show: false, message: '', type: 'info' })} />
      
      {/* Enhanced Header */}
      <header className="header">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">BA Agent Pro</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-2 py-1 text-gray-600 hover:text-gray-900">
                <Bell className="w-4 h-4" />
                <span className="text-xs">Notifications</span>
              </button>
              <button className="flex items-center gap-2 px-2 py-1 text-gray-600 hover:text-gray-900">
                <User className="w-4 h-4" />
                <span className="text-xs">Profile</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative pt-6">
        {/* Mobile overlay for sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Enhanced Sidebar */}
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          documents={documents}
          pastAnalyses={pastAnalyses}
          selectedDocument={selectedDocument}
          setSelectedDocument={setSelectedDocument}
          selectedAnalysis={selectedAnalysis}
          setSelectedAnalysis={setSelectedAnalysis}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onLogout={handleLogout}
          selectedLOB={selectedLOB}
          setSelectedLOB={setSelectedLOB}
          projectTags={projectTags}
          setProjectTags={setProjectTags}
          availableTags={availableTags}
          setAvailableTags={setAvailableTags}
          showTagInput={showTagInput}
          setShowTagInput={setShowTagInput}
          newTag={newTag}
          setNewTag={setNewTag}
          addTag={addTag}
          removeTag={removeTag}
          addNewTag={addNewTag}
          lobCategories={lobCategories}
          filteredDocuments={filteredDocuments}
          filteredAnalyses={filteredAnalyses}
        />

        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-6' : 'lg:ml-6'}`}>
          <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
            {/* Breadcrumb Navigation */}
            <BreadcrumbNavigation 
              activeSection={activeSection}
              selectedLOB={selectedLOB}
              projectTags={projectTags}
              lobCategories={lobCategories}
            />
            
            {/* Quick Stats */}
            <QuickStats 
              documents={filteredDocuments}
              analyses={filteredAnalyses}
              selectedLOB={selectedLOB}
              projectTags={projectTags}
              lobCategories={lobCategories}
              setActiveSection={setActiveSection}
            />

            {/* Enhanced Search and Filter Bar */}
            <AdvancedSearch 
              documents={documents}
              analyses={pastAnalyses}
              onSearchResults={(results: Array<(Document | Analysis) & { type: 'document' | 'analysis' }>) => {
                const docResults = results.filter((r) => r.type === 'document') as Document[];
                const analysisResults = results.filter((r) => r.type === 'analysis') as Analysis[];
                setFilteredDocuments(docResults);
                setFilteredAnalyses(analysisResults);
              }}
              placeholder="Search documents, analyses, and content..."
              showFilters={true}
              showSorting={true}
              enableSavedSearches={true}
            />
            
            {activeSection === 'upload' && (
              <UploadSection
                results={results}
                showUploadContainer={showUploadContainer}
                setShowUploadContainer={setShowUploadContainer}
                isProcessing={isProcessing}
                dragActive={dragActive}
                currentStep={currentStep}
                stepNames={stepNames}
                approvalReady={approvalReady}
                selectedDocument={selectedDocument}
                onFileChange={handleFileChange}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onSubmit={handleSubmit}
                onDownloadAll={handleDownloadAll}
                onSendForApproval={handleSendForApproval}
                onCopy={handleCopy}
                onDownloadDocx={downloadAsDocx}
                onSetNotification={setNotification}
                onSetResults={setResults}
                apiBaseUrl={API_BASE_URL}
                selectedTRDSections={selectedTRDSections}
                onTRDSectionsChange={setSelectedTRDSections}
              />
            )}

            {activeSection === 'documents' && (
              <div className="space-y-4">
                <DocumentsSection
                  documents={filteredDocuments}
                  selectedDocument={selectedDocument}
                  setSelectedDocument={setSelectedDocument}
                  setDocuments={setDocuments}
                  setNotification={setNotification}
                  selectedLOB={selectedLOB}
                  projectTags={projectTags}
                  lobCategories={lobCategories}
                />
              </div>
            )}

            {activeSection === 'analyses' && (
              <div className="space-y-4">
                <PastAnalysesSection 
                  pastAnalyses={filteredAnalyses} 
                  selectedAnalysis={selectedAnalysis}
                  setSelectedAnalysis={setSelectedAnalysis}
                  selectedLOB={selectedLOB}
                  projectTags={projectTags}
                  lobCategories={lobCategories}
                />
              </div>
            )}

            {activeSection === 'capabilities' && (
              <div className="space-y-4">
                <Capabilities />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Collaboration Panel */}
      <CollaborationPanel notifications={notifications} />

      {/* Enhanced Image Modal */}
      {imageModal.open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setImageModal({ open: false, src: '', alt: '' });
            }
          }}
        >
          <div className="max-w-4xl max-h-full overflow-auto bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{imageModal.alt}</h3>
              <button
                onClick={() => setImageModal({ open: false, src: '', alt: '' })}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <img 
              src={imageModal.src} 
              alt={imageModal.alt} 
              className="max-w-full" 
              onError={(e) => {
                console.warn('Image failed to load:', imageModal.src);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}

// Wrap the App component with ErrorBoundary
function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

export default AppWithErrorBoundary;

