import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText } from 'lucide-react';

interface MarkdownRendererProps {
  markdown?: string;
  title?: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown, title, className = "" }) => {
  const sanitizedMarkdown = markdown || 'No content generated.';
  
  return (
    <div className={`prose prose-slate max-w-none p-6 bg-white rounded-lg shadow-lg border ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          {title}
        </h2>
      )}
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        components={{
          table: ({node, ...props}: any) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border border-gray-300 rounded-lg shadow-sm" {...props} />
            </div>
          ),
          th: ({node, ...props}: any) => (
            <th className="px-4 py-3 border border-gray-300 bg-blue-50 text-left font-semibold text-gray-800 text-sm" {...props} />
          ),
          td: ({node, ...props}: any) => (
            <td className="px-4 py-3 border border-gray-300 align-top text-gray-700 text-sm leading-relaxed" {...props} />
          ),
          thead: ({node, ...props}: any) => (
            <thead className="bg-blue-50" {...props} />
          ),
          tbody: ({node, ...props}: any) => (
            <tbody className="bg-white" {...props} />
          ),
          tr: ({node, ...props}: any) => (
            <tr className="hover:bg-gray-50 transition-colors" {...props} />
          )
        }}
      >
        {sanitizedMarkdown}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;

