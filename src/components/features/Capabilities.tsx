import React from 'react';
import { UploadCloud, Search, ListCollapse, Send as SendIcon } from 'lucide-react';

const Capabilities: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
      <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
      <div className="font-bold text-gray-800 mb-1">Easy Input</div>
      <div className="text-gray-500 text-sm text-center">Upload BRD documents or paste text directly.</div>
    </div>
    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
      <Search className="w-8 h-8 text-blue-500 mb-2" />
      <div className="font-bold text-gray-800 mb-1">Intelligent Extraction</div>
      <div className="text-gray-500 text-sm text-center">Extracts key text from your documents.</div>
    </div>
    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
      <ListCollapse className="w-8 h-8 text-blue-500 mb-2" />
      <div className="font-bold text-gray-800 mb-1">Automated TRD</div>
      <div className="text-gray-500 text-sm text-center">Generates Technical Requirements Document.</div>
    </div>
    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
      <SendIcon className="w-8 h-8 text-blue-500 mb-2" />
      <div className="font-bold text-gray-800 mb-1">Seamless Integration</div>
      <div className="text-gray-500 text-sm text-center">Streamlines TRD approval and DevOps sync.</div>
    </div>
  </div>
);

export default Capabilities;

