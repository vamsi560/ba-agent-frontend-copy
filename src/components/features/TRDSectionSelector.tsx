import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { apiService } from '../../services/apiService';

export interface TRDSection {
  key: string;
  title: string;
  description: string;
}

interface TRDSectionSelectorProps {
  selectedSections: string[];
  onChange: (sections: string[]) => void;
}

const TRDSectionSelector: React.FC<TRDSectionSelectorProps> = ({
  selectedSections,
  onChange
}) => {
  const [sections, setSections] = useState<TRDSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTRDSections();
  }, []);

  const fetchTRDSections = async () => {
    try {
      setLoading(true);
      setError(null);
      const sections = await apiService.getTRDSections();
      setSections(sections);
    } catch (error: any) {
      console.error('Failed to fetch TRD sections:', error);
      setError(error.message || 'Failed to load TRD sections');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (sectionKey: string) => {
    if (selectedSections.includes(sectionKey)) {
      onChange(selectedSections.filter(k => k !== sectionKey));
    } else {
      onChange([...selectedSections, sectionKey]);
    }
  };

  const handleSelectAll = () => {
    onChange(sections.map(s => s.key));
  };

  const handleDeselectAll = () => {
    onChange([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading sections...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Error loading sections</span>
        </div>
        <p className="text-sm text-red-600 mt-1">{error}</p>
        <button
          onClick={fetchTRDSections}
          className="mt-3 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="trd-section-selector bg-white border border-gray-200 rounded-lg p-4">
      <div className="section-selector-header mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Select TRD Sections to Generate</h3>
          </div>
          <div className="selector-actions flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-3 py-1 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Choose which sections of the Technical Requirements Document you want to generate.
        </p>
      </div>
      
      <div className="sections-list space-y-2 max-h-96 overflow-y-auto">
        {sections.map((section) => (
          <div
            key={section.key}
            className={`section-item p-3 border rounded-lg cursor-pointer transition-all ${
              selectedSections.includes(section.key)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleToggle(section.key)}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedSections.includes(section.key)}
                onChange={() => handleToggle(section.key)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="section-info flex-1">
                <h4 className="font-medium text-gray-900">{section.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{section.description}</p>
              </div>
              {selectedSections.includes(section.key) && (
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>
      
      {selectedSections.length === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            ⚠️ Please select at least one section to generate
          </span>
        </div>
      )}

      {selectedSections.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-800 font-medium">
              {selectedSections.length} section{selectedSections.length !== 1 ? 's' : ''} selected
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TRDSectionSelector;

