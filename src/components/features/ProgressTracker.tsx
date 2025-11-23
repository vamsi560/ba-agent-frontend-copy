import React from 'react';
import { Activity } from 'lucide-react';

interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ currentStep, totalSteps, stepNames }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Analysis Progress
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">{currentStep}/{totalSteps}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {stepNames.map((step, index) => (
            <div 
              key={index}
              className={`p-2 rounded text-xs font-medium ${
                index < currentStep 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : index === currentStep 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;

