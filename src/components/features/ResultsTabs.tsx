import React, { useState } from 'react';
import { 
  FileText, BarChart3, ListCollapse, Settings, CheckCircle, 
  Copy, Download, Activity 
} from 'lucide-react';
import { AnalysisResults, Document, Notification } from '../../types';
import FormattedTextRenderer from '../common/FormattedTextRenderer';
import MermaidDiagram from '../common/MermaidDiagram';
import { BacklogStats, BacklogBoard } from './index';
import SmartSuggestions from '../SmartSuggestions';
import RealTimeComments from '../RealTimeComments';
import MultiLanguageSupport from '../MultiLanguageSupport';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  suggestion?: string;
  priority?: string;
  category?: string;
  icon?: React.ComponentType<{ className?: string }>;
  bgColor?: string;
  borderColor?: string;
  color?: string;
  applied?: boolean;
  appliedAt?: string;
  [key: string]: any; // Allow additional properties
}

interface ResultsTabsProps {
  results: AnalysisResults | null;
  selectedDocument: Document | null;
  onCopy: (text: string, label: string) => Promise<void>;
  onDownloadDocx: (markdownContent: string, filename: string) => Promise<void>;
  onSetNotification: (notification: Notification) => void;
  onSetResults: React.Dispatch<React.SetStateAction<AnalysisResults | null>>;
  apiBaseUrl: string;
}

const ResultsTabs: React.FC<ResultsTabsProps> = ({
  results,
  selectedDocument,
  onCopy,
  onDownloadDocx,
  onSetNotification,
  onSetResults,
  apiBaseUrl
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const extractMermaid = (str: string | undefined): string => {
    return (str || '').replace(/```mermaid\n|```/g, '');
  };

  const download = (data: string, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadJson = (obj: any, filename: string) => {
    download(JSON.stringify(obj, null, 2), filename, 'application/json');
  };

  const isSectionCompleted = (sectionId: string): boolean => {
    if (!results) return false;
    switch (sectionId) {
      case 'trd':
        return !!results.trd;
      case 'diagrams':
        return !!(results.hld || results.lld);
      case 'backlog':
        return !!results.backlog;
      case 'azure-devops':
        return !!results.approval_status;
      default:
        return false;
    }
  };

  const tabs = [
    { id: 'trd', label: 'Technical Requirements', icon: FileText },
    { id: 'diagrams', label: 'Diagrams', icon: BarChart3 },
    { id: 'backlog', label: 'Project Backlog', icon: ListCollapse },
    { id: 'azure-devops', label: 'Azure DevOps', icon: Settings }
  ];

  const handleCheckApprovalStatus = async () => {
    try {
      if (results?.approval_id) {
        const response = await fetch(`${apiBaseUrl}/api/approval_status/${results.approval_id}`);
        if (response.ok) {
          const approvalStatus = await response.json();
          onSetResults(prev => ({
            ...prev!,
            approval_status: approvalStatus
          }));
          onSetNotification({ 
            show: true, 
            message: `Approval status: ${approvalStatus.status}`, 
            type: approvalStatus.status === 'approve' ? 'success' : 'info' 
          });
        } else {
          onSetNotification({ 
            show: true, 
            message: 'Failed to get approval status', 
            type: 'error' 
          });
        }
      } else {
        onSetNotification({ 
          show: true, 
          message: 'No approval ID available. Send for approval first.', 
          type: 'info' 
        });
      }
    } catch (error) {
      onSetNotification({ 
        show: true, 
        message: 'Failed to check approval status', 
        type: 'error' 
      });
    }
  };

  const handleCheckADOStatus = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/ado/status`);
      const status = await response.json();
      onSetNotification({ 
        show: true, 
        message: `Azure DevOps Status: ${status.message}`, 
        type: status.connected ? 'success' : 'error' 
      });
    } catch (error) {
      onSetNotification({ 
        show: true, 
        message: 'Failed to check Azure DevOps status', 
        type: 'error' 
      });
    }
  };

  const handleTestADOConnection = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/ado/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      onSetNotification({ 
        show: true, 
        message: result.message, 
        type: result.success ? 'success' : 'error' 
      });
    } catch (error) {
      onSetNotification({ 
        show: true, 
        message: 'Failed to test Azure DevOps', 
        type: 'error' 
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isCompleted = isSectionCompleted(tab.id);
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isCompleted && (
                  <CheckCircle className="w-4 h-4 text-green-500 ml-1" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'trd' && results?.trd && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Technical Requirements Document</h3>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onCopy(results.trd!, 'TRD')}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                <button
                  onClick={() => onDownloadDocx(results.trd!, 'Technical_Requirements_Document.docx')}
                  className="flex items-center gap-2 px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
                >
                  <Download className="w-4 h-4" />
                  Download DOCX
                </button>
              </div>
            </div>
            <FormattedTextRenderer content={results.trd} title="Technical Requirements Document" />
            
            <SmartSuggestions 
              document={selectedDocument}
              analysis={results}
              onApplySuggestion={(suggestion: Suggestion) => {
                console.log('Applying suggestion:', suggestion);
              }}
              onDismissSuggestion={(suggestion: Suggestion) => {
                console.log('Dismissing suggestion:', suggestion);
              }}
              showSuggestions={true}
              maxSuggestions={5}
            />

            <RealTimeComments 
              documentId={selectedDocument?.id || 'current-document'}
              documentTitle={selectedDocument?.filename || 'Current Document'}
              currentUser={{ id: 'user1', name: 'Current User', avatar: null }}
              onCommentAdd={(comment: any) => {
                console.log('New comment added:', comment);
              }}
              onCommentUpdate={(commentId: string, content: string) => {
                console.log('Comment updated:', commentId, content);
              }}
              onCommentDelete={(commentId: string) => {
                console.log('Comment deleted:', commentId);
              }}
              onCommentReply={(parentId: string, reply: any) => {
                console.log('Reply added:', parentId, reply);
              }}
              showComments={true}
              allowAnonymous={false}
              moderationEnabled={false}
            />

            <MultiLanguageSupport 
              document={selectedDocument}
              onLanguageChange={(languageCode: string) => {
                console.log('Language changed to:', languageCode);
              }}
              onTranslationRequest={(content: string, targetLanguage: string) => {
                console.log('Translation requested:', targetLanguage);
              }}
              supportedLanguages={[
                { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
                { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
                { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
                { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
                { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
                { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
                { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
                { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
                { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
                { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
                { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
                { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' }
              ]}
              showLanguageSelector={true}
              enableTranslation={true}
              enableAutoDetection={true}
            />
          </div>
        )}

        {activeTab === 'diagrams' && (
          <div className="space-y-6">
            {results?.hld && (
              <div className="glass-card rounded-lg shadow-lg border p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-800">High Level Design</h3>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onCopy(results.hld!, 'High Level Design')}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                    <button
                      onClick={() => onDownloadDocx(results.hld!, 'High_Level_Design.docx')}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      Download DOCX
                    </button>
                  </div>
                </div>
                
                <MermaidDiagram 
                  key={`hld-${results?.analysis_id || 'default'}`}
                  code={extractMermaid(results.hld)} 
                  id="hld" 
                  showDownloadPng={true} 
                  showPngInline={true}
                  title="High Level Design"
                />
              </div>
            )}
            
            {results?.lld && (
              <div className="glass-card rounded-lg shadow-lg border p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-800">Low Level Design</h3>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onCopy(results.lld!, 'Low Level Design')}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                    <button
                      onClick={() => onDownloadDocx(results.lld!, 'Low_Level_Design.docx')}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      Download DOCX
                    </button>
                  </div>
                </div>
                
                <MermaidDiagram 
                  key={`lld-${results?.analysis_id || 'default'}`}
                  code={extractMermaid(results.lld)} 
                  id="lld" 
                  showDownloadPng={true} 
                  showPngInline={true}
                  title="Low Level Design"
                />
              </div>
            )}
            
            {!results?.hld && !results?.lld && (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No diagrams generated</h3>
                <p className="text-gray-500">Diagrams will appear here after analysis is complete</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'backlog' && results?.backlog && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Project Backlog</h3>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onCopy(JSON.stringify(results.backlog, null, 2), 'Project Backlog')}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                <button
                  onClick={() => downloadJson(results.backlog, 'Project_Backlog.json')}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" />
                  Download JSON
                </button>
              </div>
            </div>
            
            <BacklogStats backlog={results.backlog} />
            
            <div className="glass-card rounded-lg shadow-lg border p-4">
              <BacklogBoard backlog={results.backlog} />
            </div>
          </div>
        )}

        {activeTab === 'azure-devops' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Azure DevOps Integration</h3>
                {results?.approval_status && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCheckADOStatus}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Activity className="w-4 h-4" />
                  Check Status
                </button>
                <button
                  onClick={handleTestADOConnection}
                  className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <Settings className="w-4 h-4" />
                  Test Connection
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg border p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Configuration Status</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Azure DevOps Integration</span>
                  </div>
                  <span className="text-sm text-gray-600">Ready for approval workflow</span>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-800 mb-2">How it works:</h5>
                  <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. Generate analysis with backlog items</li>
                    <li>2. Send for approval via email</li>
                    <li>3. When approved, work items are automatically created in Azure DevOps</li>
                    <li>4. Epics, Features, and User Stories are created with proper hierarchy</li>
                  </ol>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-semibold text-yellow-800 mb-2">Required Configuration:</h5>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• ADO_PERSONAL_ACCESS_TOKEN - Your Azure DevOps PAT</li>
                    <li>• ADO_ORGANIZATION_URL - Your Azure DevOps organization URL</li>
                    <li>• ADO_PROJECT_NAME - Your Azure DevOps project name</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {results?.approval_status && (
              <div className="bg-white rounded-lg shadow-lg border p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Approval Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      results.approval_status.status === 'approved' 
                        ? 'bg-green-100 text-green-700' 
                        : results.approval_status.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {results.approval_status.status}
                    </span>
                  </div>
                  
                  {results.approval_status.ado_result && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-semibold text-gray-700 mb-2">Azure DevOps Creation Result:</h5>
                      <div className="text-sm text-gray-600">
                        <p><strong>Success:</strong> {results.approval_status.ado_result.success ? 'Yes' : 'No'}</p>
                        <p><strong>Message:</strong> {results.approval_status.ado_result.message}</p>
                        {results.approval_status.ado_result.items && (
                          <div className="mt-2">
                            <p><strong>Items Created:</strong> {results.approval_status.ado_result.items.length}</p>
                            <ul className="mt-1 space-y-1">
                              {results.approval_status.ado_result.items.slice(0, 5).map((item: any, index: number) => (
                                <li key={index} className="text-xs">
                                  {item.type}: {item.title} (ID: {item.id})
                                </li>
                              ))}
                              {results.approval_status.ado_result.items.length > 5 && (
                                <li className="text-xs text-gray-500">... and {results.approval_status.ado_result.items.length - 5} more</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {results?.analysis_id && (
              <div className="bg-white rounded-lg shadow-lg border p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Check Approval Status</h4>
                <button
                  onClick={handleCheckApprovalStatus}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Activity className="w-4 h-4" />
                  Check Approval Status
                </button>
                <p className="text-sm text-gray-600 mt-2">
                  After sending for approval, you can check the status here to see if Azure DevOps work items were created.
                </p>
                {results.approval_id && (
                  <p className="text-xs text-gray-500 mt-1">
                    Approval ID: {results.approval_id}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsTabs;

