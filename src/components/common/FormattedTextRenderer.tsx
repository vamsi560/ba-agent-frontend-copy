import React from 'react';
import { FileText } from 'lucide-react';

interface FormattedLine {
  type: 'header' | 'bullet' | 'numbered' | 'paragraph' | 'spacing';
  content: string;
  className: string;
  level?: number;
}

interface FormattedTextRendererProps {
  content?: string;
  title?: string;
  className?: string;
}

const FormattedTextRenderer: React.FC<FormattedTextRendererProps> = ({ content, title, className = "" }) => {
  const sanitizedContent = content || 'No content generated.';
  
  // Function to remove compliance section and clean up content
  const removeComplianceSection = (text: string): string => {
    const compliancePatterns = [
      /## Compliance[\s\S]*?(?=##|$)/gi,
      /# Compliance[\s\S]*?(?=#|$)/gi,
      /### Compliance[\s\S]*?(?=###|##|#|$)/gi,
      /\*\*Compliance\*\*[\s\S]*?(?=\*\*|\n\n|$)/gi,
      /Compliance Requirements[\s\S]*?(?=\n\n|$)/gi
    ];
    
    let cleanedText = text;
    compliancePatterns.forEach(pattern => {
      cleanedText = cleanedText.replace(pattern, '');
    });
    
    return cleanedText;
  };
  
  // Function to aggressively strip ALL markdown symbols and convert to formatted text
  const formatText = (text: string): FormattedLine[] => {
    // First remove compliance section
    let cleanedText = removeComplianceSection(text);
    
    const lines = cleanedText.split('\n');
    const formattedLines: FormattedLine[] = [];
    let skipEmpty = false;
    
    for (let line of lines) {
      // Skip empty lines after headers for better spacing
      if (!line.trim() && skipEmpty) {
        skipEmpty = false;
        continue;
      }
      skipEmpty = false;
      
      // Handle headers (# ## ### etc.) - convert to styled headings
      const headerMatch = line.match(/^#{1,6}\s+/);
      if (headerMatch) {
        const level = headerMatch[0].length;
        let headerText = line.replace(/^#+\s*/, '').replace(/#+\s*$/, '').trim();
        
        // Remove all remaining markdown symbols from header
        headerText = headerText
          .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold
          .replace(/\*(.*?)\*/g, '$1')      // Italic/Bold
          .replace(/__(.*?)__/g, '$1')      // Bold
          .replace(/_(.*?)_/g, '$1')        // Italic
          .replace(/`(.*?)`/g, '$1')        // Code
          .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Links
          .replace(/[*#`_~]/g, '')          // Any remaining symbols
          .trim();
        
        if (headerText) {
          let headerClass = '';
          
          switch (level) {
            case 1: 
              headerClass = 'text-3xl font-bold text-blue-900 mt-8 mb-6 pb-3 border-b-2 border-blue-200'; 
              break;
            case 2: 
              headerClass = 'text-2xl font-bold text-gray-800 mt-6 mb-4 pb-2 border-b border-gray-200'; 
              break;
            case 3: 
              headerClass = 'text-xl font-semibold text-gray-800 mt-5 mb-3 text-blue-800'; 
              break;
            case 4: 
              headerClass = 'text-lg font-semibold text-gray-700 mt-4 mb-2'; 
              break;
            case 5: 
              headerClass = 'text-base font-semibold text-gray-700 mt-3 mb-2'; 
              break;
            default: 
              headerClass = 'text-sm font-medium text-gray-600 mt-2 mb-1'; 
              break;
          }
          
          formattedLines.push({
            type: 'header',
            content: headerText,
            className: headerClass,
            level: level
          });
          skipEmpty = true;
        }
        continue;
      }
      
      // Handle bullet points (- or * at start)
      if (line.match(/^\s*[-*+]\s+/)) {
        let bulletText = line.replace(/^\s*[-*+]\s*/, '').trim();
        
        // Clean up markdown symbols from bullet text
        bulletText = bulletText
          .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold
          .replace(/\*(.*?)\*/g, '$1')      // Italic/Bold
          .replace(/__(.*?)__/g, '$1')      // Bold
          .replace(/_(.*?)_/g, '$1')        // Italic
          .replace(/`(.*?)`/g, '$1')        // Code
          .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Links
          .replace(/[*#`_~]/g, '')          // Any remaining symbols
          .trim();
        
        if (bulletText) {
          formattedLines.push({
            type: 'bullet',
            content: bulletText,
            className: 'text-gray-700 ml-6 mb-2'
          });
        }
        continue;
      }
      
      // Handle numbered lists
      if (line.match(/^\s*\d+\.\s+/)) {
        let numberedText = line.trim();
        
        // Clean up markdown symbols from numbered text
        numberedText = numberedText
          .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold
          .replace(/\*(.*?)\*/g, '$1')      // Italic/Bold
          .replace(/__(.*?)__/g, '$1')      // Bold
          .replace(/_(.*?)_/g, '$1')        // Italic
          .replace(/`(.*?)`/g, '$1')        // Code
          .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Links
          .replace(/[*#`_~]/g, '')          // Any remaining symbols
          .trim();
        
        if (numberedText) {
          formattedLines.push({
            type: 'numbered',
            content: numberedText,
            className: 'text-gray-700 ml-6 mb-2'
          });
        }
        continue;
      }
      
      // Handle regular paragraphs - aggressively clean all markdown
      let processedLine = line.trim();
      
      if (processedLine) {
        // Remove ALL markdown symbols
        processedLine = processedLine
          .replace(/\*\*(.*?)\*\*/g, '$1')      // Bold **text**
          .replace(/\*(.*?)\*/g, '$1')          // Italic/Bold *text*
          .replace(/__(.*?)__/g, '$1')          // Bold __text__
          .replace(/_(.*?)_/g, '$1')            // Italic _text_
          .replace(/`(.*?)`/g, '$1')            // Inline code `text`
          .replace(/```[\s\S]*?```/g, '')       // Code blocks
          .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Links [text](url)
          .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // Images ![alt](url)
          .replace(/>\s*/g, '')                 // Blockquotes
          .replace(/^\s*[-*+]\s*/g, '')         // List markers at start
          .replace(/^\s*\d+\.\s*/g, '')         // Numbered list markers
          .replace(/#{1,6}\s*/g, '')            // Header symbols
          .replace(/[*#`_~]/g, '')              // Any remaining symbols
          .replace(/\s+/g, ' ')                 // Multiple spaces to single
          .trim();
        
        if (processedLine) {
          formattedLines.push({
            type: 'paragraph',
            content: processedLine,
            className: 'text-gray-700 mb-3 leading-relaxed text-justify'
          });
        }
      } else {
        // Add spacing for empty lines
        formattedLines.push({
          type: 'spacing',
          content: '',
          className: 'mb-4'
        });
      }
    }
    
    return formattedLines;
  };
  
  const formattedLines = formatText(sanitizedContent);
  
  return (
    <div className={`max-w-none bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${className}`}>
      {title && (
        <div className="p-8 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FileText className="w-8 h-8 text-gray-600" />
            {title}
          </h2>
        </div>
      )}
      <div className="p-8">
        <div className="prose prose-lg max-w-none">
          {formattedLines.map((line, index) => {
            if (line.type === 'header') {
              return (
                <div key={index} className={`relative ${line.className}`}>
                  {line.level && line.level <= 2 && (
                    <div className="absolute -left-6 top-0 w-1 h-full bg-gradient-to-b from-gray-600 to-gray-700 rounded-full"></div>
                  )}
                  <div className="flex items-center gap-3">
                    {line.level === 1 && <div className="w-3 h-3 bg-gray-600 rounded-full"></div>}
                    {line.level === 2 && <div className="w-2 h-2 bg-gray-700 rounded-full"></div>}
                    <span>{line.content}</span>
                  </div>
                </div>
              );
            } else if (line.type === 'bullet') {
              return (
                <div key={index} className={`flex items-start ${line.className}`}>
                  <div className="w-3 h-3 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full mt-2 mr-4 flex-shrink-0 shadow-sm"></div>
                  <span className="flex-1 leading-relaxed">{line.content}</span>
                </div>
              );
            } else if (line.type === 'numbered') {
              const numberMatch = line.content.match(/^\d+/);
              return (
                <div key={index} className={`${line.className} pl-6 relative`}>
                  <div className="absolute left-0 top-0 w-6 h-6 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {numberMatch ? numberMatch[0] : '•'}
                  </div>
                  <span className="font-medium text-gray-800">{line.content.replace(/^\d+\.\s*/, '')}</span>
                </div>
              );
            } else if (line.type === 'spacing') {
              return <div key={index} className={line.className}></div>;
            } else {
              return (
                <div key={index} className={`${line.className} p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300 my-3`}>
                  <div className="text-gray-800 leading-relaxed">{line.content}</div>
                </div>
              );
            }
          })}
        </div>
        
        {/* Professional Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Document generated by BA Agent Pro</span>
            </div>
            <div className="text-right">
              <div>Generated: {new Date().toLocaleDateString()}</div>
              <div className="text-xs">Version 1.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormattedTextRenderer;

