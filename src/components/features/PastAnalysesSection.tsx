import React from 'react';
import { Clock, FileText, BarChart3, ListCollapse, Eye } from 'lucide-react';
import { Analysis, LOBCategory } from '../../types';

interface PastAnalysesSectionProps {
  pastAnalyses: Analysis[];
  selectedAnalysis: Analysis | null;
  setSelectedAnalysis: (analysis: Analysis | null) => void;
  selectedLOB: string;
  projectTags: string[];
  lobCategories: LOBCategory[];
}

const PastAnalysesSection: React.FC<PastAnalysesSectionProps> = ({
  pastAnalyses,
  selectedAnalysis,
  setSelectedAnalysis,
  selectedLOB,
  projectTags,
  lobCategories
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Past Analyses</h2>
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
              Showing {pastAnalyses.length} of {pastAnalyses.length} analyses
            </span>
          </div>
        </div>
      </div>
      
      {pastAnalyses.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No past analyses</h3>
          <p className="text-gray-500">Your completed analyses will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Analysis List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Analysis History</h3>
            {pastAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                onClick={() => setSelectedAnalysis(analysis)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedAnalysis?.id === analysis.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">{analysis.title}</h4>
                    <p className="text-sm text-gray-500">{analysis.date}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      analysis.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {analysis.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Analysis Details */}
          {selectedAnalysis && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Analysis Details</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">{selectedAnalysis.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">Created: {selectedAnalysis.date}</p>
                  <p className="text-sm text-gray-600 mb-4">Status: {selectedAnalysis.status}</p>
                </div>
                
                {selectedAnalysis.results && (
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700">Generated Content:</h5>
                    <div className="space-y-2">
                      {selectedAnalysis.results.trd && (
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span>Technical Requirements Document</span>
                        </div>
                      )}
                      {selectedAnalysis.results.hld && (
                        <div className="flex items-center gap-2 text-sm">
                          <BarChart3 className="w-4 h-4 text-green-500" />
                          <span>High Level Design</span>
                        </div>
                      )}
                      {selectedAnalysis.results.lld && (
                        <div className="flex items-center gap-2 text-sm">
                          <BarChart3 className="w-4 h-4 text-green-500" />
                          <span>Low Level Design</span>
                        </div>
                      )}
                      {selectedAnalysis.results.backlog && (
                        <div className="flex items-center gap-2 text-sm">
                          <ListCollapse className="w-4 h-4 text-purple-500" />
                          <span>Project Backlog</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <button
                    onClick={() => {
                      console.log('Loading full analysis:', selectedAnalysis.id);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Eye className="w-4 h-4" />
                    View Full Analysis
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PastAnalysesSection;

