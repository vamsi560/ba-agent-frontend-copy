import React from 'react';
import { BarChart3, Link, Activity, FileText, Clock } from 'lucide-react';
import { Document, Analysis, LOBCategory } from '../../types';

interface AnalyticsDashboardProps {
  documents: Document[];
  analyses: Analysis[];
  selectedLOB: string;
  projectTags: string[];
  lobCategories: LOBCategory[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  documents, 
  analyses, 
  selectedLOB, 
  projectTags, 
  lobCategories 
}) => {
  // Calculate analytics
  const totalDocuments = documents.length;
  const totalAnalyses = analyses.length;
  const lobDistribution = lobCategories.reduce((acc, lob) => {
    if (lob.id === 'all') return acc;
    const count = documents.filter(doc => doc.lob === lob.id).length;
    return { ...acc, [lob.name]: count };
  }, {} as Record<string, number>);
  
  const tagUsage = projectTags.reduce((acc, tag) => {
    const count = documents.filter(doc => doc.tags && doc.tags.includes(tag)).length;
    return { ...acc, [tag]: count };
  }, {} as Record<string, number>);
  
  // Helper function to get date from Document or Analysis
  const getDate = (item: Document | Analysis): string => {
    if ('uploadDate' in item && item.uploadDate) {
      return item.uploadDate;
    }
    if ('date' in item && item.date) {
      return item.date;
    }
    return '';
  };

  // Helper function to get name/title from Document or Analysis
  const getName = (item: Document | Analysis): string => {
    if ('name' in item && item.name) {
      return item.name;
    }
    if ('title' in item && item.title) {
      return item.title;
    }
    if ('filename' in item && item.filename) {
      return item.filename;
    }
    return 'Untitled';
  };

  const recentActivity = [...documents, ...analyses]
    .sort((a, b) => {
      const dateA = new Date(getDate(a) || '0').getTime();
      const dateB = new Date(getDate(b) || '0').getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LOB Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Line of Business Distribution
        </h3>
        <div className="space-y-3">
          {Object.entries(lobDistribution).map(([lob, count]) => (
            <div key={lob} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{lob}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${totalDocuments > 0 ? (count / totalDocuments) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tag Usage Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Link className="w-5 h-5 text-green-600" />
          Tag Usage Analytics
        </h3>
        <div className="space-y-3">
          {Object.entries(tagUsage).map(([tag, count]) => (
            <div key={tag} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{tag}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${totalDocuments > 0 ? (count / totalDocuments) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivity.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                {'uploadDate' in item ? (
                  <FileText className="w-4 h-4 text-blue-600" />
                ) : (
                  <Clock className="w-4 h-4 text-green-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {getName(item)}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(getDate(item) || '').toLocaleDateString()}
                </p>
              </div>
              {item.lob && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {lobCategories.find(lob => lob.id === item.lob)?.icon} {item.lob}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

