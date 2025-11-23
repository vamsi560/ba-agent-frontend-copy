import React, { useState } from 'react';
import { 
  FileText, Folder, Clock, Settings, LogOut, Plus, 
  ChevronUp, ChevronDown 
} from 'lucide-react';
import { Document, Analysis, LOBCategory } from '../../types';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  documents: Document[];
  pastAnalyses: Analysis[];
  selectedDocument: Document | null;
  setSelectedDocument: (doc: Document | null) => void;
  selectedAnalysis: Analysis | null;
  setSelectedAnalysis: (analysis: Analysis | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
  selectedLOB: string;
  setSelectedLOB: (lob: string) => void;
  projectTags: string[];
  setProjectTags: React.Dispatch<React.SetStateAction<string[]>>;
  availableTags: string[];
  setAvailableTags: React.Dispatch<React.SetStateAction<string[]>>;
  showTagInput: boolean;
  setShowTagInput: (show: boolean) => void;
  newTag: string;
  setNewTag: (tag: string) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  addNewTag: () => void;
  lobCategories: LOBCategory[];
  filteredDocuments: Document[];
  filteredAnalyses: Analysis[];
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  documents,
  pastAnalyses,
  selectedDocument,
  setSelectedDocument,
  selectedAnalysis,
  setSelectedAnalysis,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
  selectedLOB,
  setSelectedLOB,
  projectTags,
  setProjectTags,
  availableTags,
  setAvailableTags,
  showTagInput,
  setShowTagInput,
  newTag,
  setNewTag,
  addTag,
  removeTag,
  addNewTag,
  lobCategories,
  filteredDocuments,
  filteredAnalyses
}) => {
  const [showLOBSelector, setShowLOBSelector] = useState<boolean>(false);
  const [showTagSelector, setShowTagSelector] = useState<boolean>(false);

  return (
    <aside className={`sidebar fixed lg:relative left-4 lg:left-8 top-20 lg:top-8 h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] w-64 z-40 transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:flex-shrink-0 rounded-2xl lg:rounded-3xl overflow-hidden bg-white shadow-xl border border-gray-200`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">BA Agent Pro</h1>
          </div>
          <p className="text-xs text-gray-600 mt-1">P&C Insurance Solutions</p>
        </div>
        
        {/* LOB Selector */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Line of Business</h3>
            <button
              onClick={() => setShowLOBSelector(!showLOBSelector)}
              className="text-blue-600 hover:text-blue-700"
            >
              {showLOBSelector ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          
          {showLOBSelector && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {lobCategories.map((lob) => (
                <button
                  key={lob.id}
                  onClick={() => setSelectedLOB(lob.id)}
                  className={`w-full p-2 rounded-lg flex items-center gap-2 text-sm transition-all ${
                    selectedLOB === lob.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{lob.icon}</span>
                  <span className="font-medium">{lob.name}</span>
                </button>
              ))}
            </div>
          )}
          
          {/* Current LOB Display */}
          {!showLOBSelector && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <span className="text-lg">
                {lobCategories.find(lob => lob.id === selectedLOB)?.icon || '📊'}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {lobCategories.find(lob => lob.id === selectedLOB)?.name || 'All Lines'}
              </span>
            </div>
          )}
        </div>

        {/* Project Tags */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Project Tags</h3>
            <button
              onClick={() => setShowTagSelector(!showTagSelector)}
              className="text-blue-600 hover:text-blue-700"
            >
              {showTagSelector ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          
          {showTagSelector && (
            <div className="space-y-2">
              {/* Selected Tags */}
              {projectTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {projectTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* Available Tags */}
              <div className="max-h-32 overflow-y-auto">
                <div className="text-xs text-gray-500 mb-1">Available Tags:</div>
                <div className="flex flex-wrap gap-1">
                  {availableTags
                    .filter(tag => !projectTags.includes(tag))
                    .map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                </div>
              </div>
              
              {/* Add New Tag */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => setShowTagInput(!showTagInput)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  + Add Custom Tag
                </button>
                {showTagInput && (
                  <div className="mt-2 flex gap-1">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="New tag..."
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                      onKeyPress={(e) => e.key === 'Enter' && addNewTag()}
                    />
                    <button
                      onClick={addNewTag}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Current Tags Display */}
          {!showTagSelector && projectTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {projectTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {projectTags.length > 3 && (
                <span className="text-xs text-gray-500">+{projectTags.length - 3} more</span>
              )}
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <div className="flex-1 p-3 space-y-2">
          <button
            onClick={() => setActiveSection('upload')}
            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
              activeSection === 'upload' 
                ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm' 
                : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium text-sm">New Analysis</span>
          </button>
          
          <button
            onClick={() => setActiveSection('documents')}
            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
              activeSection === 'documents' 
                ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm' 
                : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span className="font-medium text-sm">
              Documents ({filteredDocuments.length})
            </span>
          </button>
          
          <button
            onClick={() => setActiveSection('analyses')}
            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
              activeSection === 'analyses' 
                ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm' 
                : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="font-medium text-sm">
              Past Analyses ({filteredAnalyses.length})
            </span>
          </button>
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t border-gray-200 space-y-2">
          <button
            onClick={() => setActiveSection('capabilities')}
            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
              activeSection === 'capabilities' 
                ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm' 
                : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="font-medium text-sm">Admin Portal</span>
          </button>
          
          <button
            onClick={onLogout}
            className="w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-200 text-red-600 hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

