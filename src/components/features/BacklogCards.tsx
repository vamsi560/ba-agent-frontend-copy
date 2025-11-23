import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { BacklogItem } from '../../types';

interface BacklogCardsProps {
  backlog: BacklogItem[];
}

const BacklogCards: React.FC<BacklogCardsProps> = ({ backlog }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  
  if (!Array.isArray(backlog) || backlog.length === 0) {
    return <div className="p-4 text-gray-500 text-center">No backlog items were generated.</div>;
  }

  const toggle = (id: string | undefined) => {
    if (!id) return;
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderLinkingInfo = (item: BacklogItem) => {
    const hasLinkingInfo = item.trd_sections || item.requirements_covered;
    
    if (!hasLinkingInfo) return null;

    return (
      <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
        <div className="text-xs font-medium text-blue-700 mb-1">Links to:</div>
        {item.trd_sections && item.trd_sections.length > 0 && (
          <div className="mb-1">
            <span className="text-xs text-blue-600 font-medium">TRD Sections: </span>
            <span className="text-xs text-blue-800">{item.trd_sections.join(', ')}</span>
          </div>
        )}
        {item.requirements_covered && item.requirements_covered.length > 0 && (
          <div>
            <span className="text-xs text-blue-600 font-medium">Requirements: </span>
            <span className="text-xs text-blue-800">{item.requirements_covered.join(', ')}</span>
          </div>
        )}
      </div>
    );
  };

  const renderTree = (items: BacklogItem[], level = 0): React.ReactNode => (
    <ul className={level > 0 ? "ml-4 pl-4 border-l-2 border-blue-200" : ""}>
      {items.map(item => (
        <li key={item.id || Math.random()} className="mb-3">
          <div className="bg-white rounded-md border border-gray-200 p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              {item.children && item.children.length > 0 ? (
                <button onClick={() => toggle(item.id)} className="focus:outline-none">
                  {expanded[item.id || ''] ? <ChevronDown className="w-4 h-4 text-blue-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                </button>
              ) : <span className="w-4 h-4" />}
              <span className={`font-semibold w-20 text-center text-xs py-1 rounded-full ${
                  item.type === 'Epic' ? 'bg-purple-100 text-purple-700' :
                  item.type === 'Feature' ? 'bg-sky-100 text-sky-700' :
                  'bg-emerald-100 text-emerald-700'
              }`}>{item.type || 'Item'}</span>
              <span className="text-gray-800 flex-1 font-medium">{item.title}</span>
              {item.priority && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.priority === 'High' ? 'bg-red-100 text-red-700' :
                  item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>{item.priority}</span>
              )}
              {item.effort && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  {item.effort} SP
                </span>
              )}
            </div>
            
            {item.description && (
              <div className="text-sm text-gray-600 mb-2 ml-6">{item.description}</div>
            )}
            
            {renderLinkingInfo(item)}
            
            {(item.acceptance_criteria || item.acceptanceCriteria) && (item.acceptance_criteria || item.acceptanceCriteria || []).length > 0 && (
              <div className="mt-2 ml-6">
                <div className="text-xs font-medium text-gray-700 mb-1">Acceptance Criteria:</div>
                <ul className="text-xs text-gray-600 space-y-1">
                  {(item.acceptance_criteria || item.acceptanceCriteria || []).map((criterion, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {item.children && item.children.length > 0 && expanded[item.id || ''] && renderTree(item.children, level + 1)}
        </li>
      ))}
    </ul>
  );
  
  return <div className="bg-blue-50 rounded-lg p-4 shadow-inner">{renderTree(backlog)}</div>;
};

export default BacklogCards;

