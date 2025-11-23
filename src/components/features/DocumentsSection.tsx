import React, { useState } from 'react';
import { Folder, FileText } from 'lucide-react';
import { Document, LOBCategory, Notification } from '../../types';
import { apiService } from '../../services/apiService';

interface DocumentsSectionProps {
  documents: Document[];
  selectedDocument: Document | null;
  setSelectedDocument: (doc: Document | null) => void;
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  setNotification: (notification: Notification) => void;
  selectedLOB: string;
  projectTags: string[];
  lobCategories: LOBCategory[];
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  documents,
  selectedDocument,
  setSelectedDocument,
  setDocuments,
  setNotification,
  selectedLOB,
  projectTags,
  lobCategories
}) => {
  const [uploading, setUploading] = useState<boolean>(false);

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await apiService.uploadDocument({
        file,
        lob: selectedLOB !== 'all' ? selectedLOB : undefined,
        tags: projectTags.length > 0 ? projectTags : undefined
      });
      
      if (response.success && response.document) {
        setDocuments(prev => [...prev, response.document!]);
        setNotification({ show: true, message: 'Document uploaded successfully!', type: 'success' });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setNotification({ show: true, message: 'Failed to upload document', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Documents Library</h2>
          <div className="flex items-center gap-2 mt-1">
            {selectedLOB !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {lobCategories.find(lob => lob.id === selectedLOB)?.icon} {lobCategories.find(lob => lob.id === selectedLOB)?.name}
              </span>
            )}
            {projectTags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                {tag}
              </span>
            ))}
            <span className="text-sm text-gray-500">
              Showing {documents.length} of {documents.length} documents
            </span>
          </div>
        </div>
        <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-all">
          {uploading ? 'Uploading...' : 'Upload Document'}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx"
            onChange={handleDocumentUpload}
            disabled={uploading}
          />
        </label>
      </div>
      
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No documents yet</h3>
          <p className="text-gray-500">Upload your first document to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDocument(doc)}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedDocument?.id === doc.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 truncate">{doc.name || doc.filename}</h4>
                    <p className="text-sm text-gray-500">{doc.uploadDate || doc.date}</p>
                  </div>
                </div>
              </div>
              
              {/* LOB and Tags */}
              <div className="space-y-2">
                {doc.lob && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">LOB:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {lobCategories.find(lob => lob.id === doc.lob)?.icon || '📊'} {doc.lob}
                    </span>
                  </div>
                )}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                    {doc.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{doc.tags.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsSection;

