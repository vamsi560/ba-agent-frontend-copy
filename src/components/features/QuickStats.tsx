import React from 'react';
import { Folder, Clock, ArrowRight, Link } from 'lucide-react';
import { Document, Analysis, LOBCategory } from '../../types';

interface QuickStatsProps {
  documents: Document[];
  analyses: Analysis[];
  selectedLOB: string;
  projectTags: string[];
  lobCategories: LOBCategory[];
  setActiveSection: (section: string) => void;
}

const QuickStats: React.FC<QuickStatsProps> = ({ 
  documents, 
  analyses, 
  selectedLOB, 
  projectTags, 
  lobCategories, 
  setActiveSection 
}) => {
  const currentLOB = lobCategories.find(lob => lob.id === selectedLOB);
  
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Documents Card - Clickable */}
      <div 
        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
        onClick={() => setActiveSection('documents')}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <Folder className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Documents</p>
            <p className="text-xl font-bold text-gray-800">{documents.length}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Click to view documents</span>
          <ArrowRight className="w-3 h-3 ml-1" />
        </div>
      </div>
      
      {/* Analyses Card - Clickable */}
      <div 
        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-green-300 transition-all duration-200 group"
        onClick={() => setActiveSection('analyses')}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Analyses</p>
            <p className="text-xl font-bold text-gray-800">{analyses.length}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Click to view analyses</span>
          <ArrowRight className="w-3 h-3 ml-1" />
        </div>
      </div>
      
      {/* Current LOB Card - Not clickable */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-lg">{currentLOB?.icon || '📊'}</span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current LOB</p>
            <p className="text-sm font-bold text-gray-800">{currentLOB?.name || 'All Lines'}</p>
          </div>
        </div>
      </div>
      
      {/* Active Tags Card - Not clickable */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Link className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Active Tags</p>
            <p className="text-xl font-bold text-gray-800">{projectTags.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;

