import React from 'react';
import { UploadCloud, Folder, Clock, Settings, Activity, Target, ChevronRight } from 'lucide-react';
import { LOBCategory } from '../../types';

interface BreadcrumbNavigationProps {
  activeSection: string;
  selectedLOB: string;
  projectTags: string[];
  lobCategories: LOBCategory[];
}

const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({ 
  activeSection, 
  selectedLOB, 
  projectTags, 
  lobCategories 
}) => {
  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'upload': return <UploadCloud className="w-4 h-4" />;
      case 'documents': return <Folder className="w-4 h-4" />;
      case 'analyses': return <Clock className="w-4 h-4" />;
      case 'capabilities': return <Settings className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getSectionName = (section: string) => {
    switch (section) {
      case 'upload': return 'New Analysis';
      case 'documents': return 'Documents';
      case 'analyses': return 'Past Analyses';
      case 'capabilities': return 'Admin Portal';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <Target className="w-4 h-4 text-blue-600" />
          <span className="font-medium">BA Agent Pro</span>
        </span>
        <ChevronRight className="w-4 h-4" />
        <span className="flex items-center gap-1">
          {getSectionIcon(activeSection)}
          <span className="font-medium">{getSectionName(activeSection)}</span>
        </span>
        
        {selectedLOB !== 'all' && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="flex items-center gap-1">
              <span className="text-lg">
                {lobCategories.find(lob => lob.id === selectedLOB)?.icon}
              </span>
              <span className="font-medium">
                {lobCategories.find(lob => lob.id === selectedLOB)?.name}
              </span>
            </span>
          </>
        )}
        
        {projectTags.length > 0 && (
          <>
            <ChevronRight className="w-4 h-4" />
            <div className="flex items-center gap-1">
              <span className="font-medium">Tags:</span>
              <div className="flex gap-1">
                {projectTags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {projectTags.length > 2 && (
                  <span className="text-xs text-gray-500">+{projectTags.length - 2} more</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BreadcrumbNavigation;

