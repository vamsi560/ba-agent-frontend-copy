import React from 'react';
import { UploadCloud, Cloud, X, Send as SendIcon, Download, CheckCircle } from 'lucide-react';
import { AnalysisResults } from '../../types';
import OneDriveStatusIndicator from '../common/OneDriveStatusIndicator';
import ProgressStepper from './ProgressStepper';
import ResultsTabs from './ResultsTabs';

interface UploadSectionProps {
  results: AnalysisResults | null;
  showUploadContainer: boolean;
  setShowUploadContainer: (show: boolean) => void;
  isProcessing: boolean;
  dragActive: boolean;
  onedriveLoading: boolean;
  currentStep: number;
  stepNames: string[];
  approvalReady: boolean;
  selectedDocument: any;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onConnectOneDrive: () => void;
  onOpenOneDrivePicker: () => void;
  onDownloadAll: () => void;
  onSendForApproval: () => void;
  onCopy: (text: string, label: string) => Promise<void>;
  onDownloadDocx: (markdownContent: string, filename: string) => Promise<void>;
  onSetNotification: (notification: any) => void;
  onSetResults: React.Dispatch<React.SetStateAction<AnalysisResults | null>>;
  apiBaseUrl: string;
}

const UploadSection: React.FC<UploadSectionProps> = ({
  results,
  showUploadContainer,
  setShowUploadContainer,
  isProcessing,
  dragActive,
  onedriveLoading,
  currentStep,
  stepNames,
  approvalReady,
  selectedDocument,
  onFileChange,
  onDrop,
  onDragOver,
  onDragLeave,
  onSubmit,
  onConnectOneDrive,
  onOpenOneDrivePicker,
  onDownloadAll,
  onSendForApproval,
  onCopy,
  onDownloadDocx,
  onSetNotification,
  onSetResults,
  apiBaseUrl
}) => {
  return (
    <div className="space-y-4">
      {/* Upload Container - Hidden after analysis completion */}
      {(!results || showUploadContainer) && (
        <div className="glass-card rounded-lg shadow-lg border p-4 animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <UploadCloud className="w-5 h-5" />
              Upload Requirements Document
            </h2>
            {results && (
              <button
                onClick={() => setShowUploadContainer(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Hide upload section"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            Upload your business requirements document (PDF or DOCX) to generate comprehensive analysis including technical requirements, diagrams, and project backlog.
          </p>

          {/* OneDrive Integration */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">OneDrive Integration</span>
                <OneDriveStatusIndicator />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onConnectOneDrive}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Cloud className="w-4 h-4" />
                  Connect OneDrive
                </button>
                <button
                  type="button"
                  onClick={onOpenOneDrivePicker}
                  disabled={isProcessing || onedriveLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {onedriveLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4" />
                      Select from OneDrive
                    </>
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Connect your OneDrive account to access and import documents directly for analysis.
            </p>
          </div>

          {isProcessing && (
            <ProgressStepper currentStep={currentStep} stepNames={stepNames} />
          )}

          <form onSubmit={onSubmit} className="space-y-3">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-blue-400 bg-blue-50 scale-105 shadow-lg'
                  : 'border-gray-300 hover:border-gray-400 hover:scale-102'
              }`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
            >
              <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
              <div className="mt-3">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Drop your file here, or{' '}
                    <span className="text-blue-600 hover:text-blue-500">browse</span>
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    PDF or DOCX up to 10MB
                  </span>
                </label>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.docx"
                  onChange={onFileChange}
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isProcessing}
                className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <SendIcon className="w-5 h-5" />
                    Analyze Document
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Show Upload Again Button - Only visible when upload is hidden and results exist */}
      {results && !showUploadContainer && (
        <div className="text-center">
          <button
            onClick={() => setShowUploadContainer(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-300 hover:border-blue-400 rounded-lg transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            Show Upload Section
          </button>
        </div>
      )}

      {results && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span>Completion:</span>
                <span className="font-medium">
                  {[
                    results?.trd ? 1 : 0,
                    (results?.hld || results?.lld) ? 1 : 0,
                    results?.backlog ? 1 : 0,
                    results?.approval_status ? 1 : 0
                  ].reduce((a, b) => a + b, 0)}/4
                </span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onDownloadAll}
                className="btn-primary flex items-center gap-2 px-3 py-1 rounded-lg text-sm"
              >
                <Download className="w-4 h-4" />
                Download All
              </button>
              <button
                onClick={onSendForApproval}
                disabled={!approvalReady}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all text-sm ${
                  approvalReady 
                    ? 'btn-primary' 
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                <SendIcon className="w-4 h-4" />
                {approvalReady ? 'Send for Approval' : 'Approval Pending'}
              </button>
            </div>
          </div>
          <ResultsTabs
            key={`results-${results?.analysis_id || 'default'}`}
            results={results}
            selectedDocument={selectedDocument}
            onCopy={onCopy}
            onDownloadDocx={onDownloadDocx}
            onSetNotification={onSetNotification}
            onSetResults={onSetResults}
            apiBaseUrl={apiBaseUrl}
          />
        </div>
      )}
    </div>
  );
};

export default UploadSection;

