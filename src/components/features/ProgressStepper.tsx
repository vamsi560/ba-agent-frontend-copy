import React, { useState } from 'react';
import { 
  UploadCloud, Search, Target, FileText, BarChart3, 
  ListCollapse, CheckCircle, Activity, ChevronUp, ChevronDown 
} from 'lucide-react';

interface ProgressStepperProps {
  currentStep: number;
  stepNames: string[];
}

const ProgressStepper: React.FC<ProgressStepperProps> = ({ currentStep, stepNames }) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);
  
  const getStepIcon = (stepIndex: number) => {
    const icons = [
      <UploadCloud key="upload" className="w-5 h-5" />,
      <Search key="extract" className="w-5 h-5" />,
      <Target key="planning" className="w-5 h-5" />,
      <FileText key="tech" className="w-5 h-5" />,
      <BarChart3 key="diagram" className="w-5 h-5" />,
      <ListCollapse key="backlog" className="w-5 h-5" />,
      <CheckCircle key="final" className="w-5 h-5" />
    ];
    return icons[stepIndex] || <Activity key="default" className="w-5 h-5" />;
  };

  const getStepDescription = (stepIndex: number): string => {
    const descriptions = [
      "Uploading and validating your document...",
      "Extracting text content and key information...",
      "Analyzing requirements and creating project plan...",
      "Generating technical requirements documentation...",
      "Creating system architecture diagrams...",
      "Building comprehensive project backlog...",
      "Finalizing and assembling all deliverables..."
    ];
    return descriptions[stepIndex] || "Processing...";
  };

  return (
    <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Analysis in Progress</h3>
            <p className="text-sm text-gray-600">Step {currentStep} of {stepNames.length}</p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${(currentStep / stepNames.length) * 100}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>{Math.round((currentStep / stepNames.length) * 100)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Current Step Details */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep > 0 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
          }`}>
            {getStepIcon(currentStep - 1)}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-800">
              {currentStep > 0 ? stepNames[currentStep - 1] : 'Initializing...'}
            </h4>
            <p className="text-sm text-gray-600">
              {currentStep > 0 ? getStepDescription(currentStep - 1) : 'Preparing analysis environment...'}
            </p>
          </div>
          {currentStep > 0 && (
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>
      </div>

      {/* Detailed Steps */}
      {showDetails && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-gray-700 mb-3">All Steps:</h4>
          {stepNames.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                index < currentStep
                  ? 'bg-green-50 border border-green-200 animate-step-complete'
                  : index === currentStep - 1
                  ? 'bg-blue-50 border border-blue-200 animate-pulse'
                  : 'bg-gray-50 border border-gray-200'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                index < currentStep
                  ? 'bg-green-500 text-white'
                  : index === currentStep - 1
                  ? 'bg-blue-600 text-white animate-pulse'
                  : 'bg-gray-300 text-gray-500'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  getStepIcon(index)
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  index < currentStep
                    ? 'text-green-800'
                    : index === currentStep - 1
                    ? 'text-blue-800'
                    : 'text-gray-600'
                }`}>
                  {step}
                </p>
                <p className={`text-xs ${
                  index < currentStep
                    ? 'text-green-600'
                    : index === currentStep - 1
                    ? 'text-blue-600'
                    : 'text-gray-500'
                }`}>
                  {index < currentStep
                    ? 'Completed'
                    : index === currentStep - 1
                    ? getStepDescription(index)
                    : 'Pending'
                  }
                </p>
              </div>
              {index < currentStep && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressStepper;

