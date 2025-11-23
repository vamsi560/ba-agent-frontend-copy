import React, { useRef, useState, useEffect } from 'react';
import { BarChart3, Download, AlertTriangle } from 'lucide-react';
import { apiService } from '../../services/apiService';

// Extend Window interface for mermaid
declare global {
  interface Window {
    mermaid?: any;
  }
}

interface MermaidDiagramProps {
  code?: string;
  id: string;
  showDownloadPng?: boolean;
  showPngInline?: boolean;
  title?: string;
}

interface NodeInfo {
  id: string;
  label: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ 
  code, 
  id, 
  showDownloadPng = false, 
  showPngInline = false, 
  title 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [loadingPng, setLoadingPng] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState<boolean>(false);
  const [svgContent, setSvgContent] = useState<string>('');
  const [isRendering, setIsRendering] = useState<boolean>(false);

  // Function to clean and validate Mermaid code
  const cleanMermaidCode = (code: string): string => {
    if (!code) return '';
    
    let cleaned = code;
    
    // Step 1: Handle <br> tags properly - replace with spaces instead of newlines
    cleaned = cleaned.replace(/<br\s*\/?>/gi, ' ');
    
    // Step 2: Handle specific problematic patterns in node labels
    cleaned = cleaned.replace(/([A-Z])\[([^\]]*?)(?:<br>|\([^)]*\))[^\]]*?\]/g, (match, nodeId, content) => {
      const cleanedContent = content.trim();
      return `${nodeId}[${cleanedContent}]`;
    });
    
    // Step 3: Handle patterns like Q[/policies (GET)] -> Q[policies]
    cleaned = cleaned.replace(/([A-Z])\[([^\]]*?)\/\([^)]*\)([^\]]*?)\]/g, (match, nodeId, before, after) => {
      const cleanedContent = (before + after).trim();
      return `${nodeId}[${cleanedContent}]`;
    });
    
    // Step 4: Fix subgraph syntax
    if (cleaned.includes('subgraph')) {
      let fixedSubgraph = cleaned
        .replace(/subgraph\s+([^\n]+)/g, 'subgraph $1')
        .replace(/subgraph\s*([A-Za-z0-9_\s]+)\s*\n/g, 'subgraph $1\n')
        .replace(/end\s*\n/g, 'end\n')
        .replace(/subgraph\s*([^\n]+)\s*{/g, 'subgraph $1\n')
        .replace(/}\s*end/g, '\nend');
      
      if (fixedSubgraph.includes('subgraph')) {
        const nodeMatches = cleaned.match(/([A-Z])\[([^\]]+)\]/g) || [];
        const nodes = nodeMatches.map(match => {
          const matchResult = match.match(/([A-Z])\[([^\]]+)\]/);
          if (!matchResult) return null;
          const [, id, label] = matchResult;
          return { id, label: label.replace(/[<>]/g, '').trim() };
        }).filter((node): node is NodeInfo => node !== null);
        
        if (nodes.length > 0) {
          let simpleFlowchart = 'flowchart TD\n';
          nodes.forEach(node => {
            simpleFlowchart += `  ${node.id}[${node.label}]\n`;
          });
          for (let i = 0; i < nodes.length - 1; i++) {
            simpleFlowchart += `  ${nodes[i].id} --> ${nodes[i + 1].id}\n`;
          }
          return simpleFlowchart;
        }
      }
      
      return `flowchart TD
    UI[User Interface Layer] --> BL[Business Logic Layer]
    BL --> DAL[Data Access Layer]
    DAL --> DB[Database]
    BL --> API[External APIs]
    BL --> SEC[Security Layer]
    UI --> AUTH[Authentication]
    AUTH --> SEC
    style UI fill:#e1f5fe
    style BL fill:#f3e5f5
    style DAL fill:#e8f5e8
    style DB fill:#fff3e0
    style API fill:#fce4ec
    style SEC fill:#ffebee
    style AUTH fill:#f1f8e9`;
    }
    
    // Step 5-9: Additional cleaning steps
    cleaned = cleaned.replace(/flowchart\s*([A-Z]+)/g, 'flowchart $1');
    cleaned = cleaned.replace(/\b([A-Za-z][\w]*)\s*\(([^)]+)\)/g, (m, id, label) => `${id}[${label}]`);
    cleaned = cleaned.replace(/([A-Za-z])\[([^\]]*?\([^)]*\)[^\]]*?)\]/g, (match, nodeId, content) => {
      const cleanedContent = content.replace(/[()]/g, '').trim();
      return `${nodeId}[${cleanedContent}]`;
    });
    cleaned = cleaned.replace(/--\s*"[^\"]*"\s*-->/g, ' --> ');
    cleaned = cleaned.replace(/--\s*\|[^|]*\|\s*-->/g, ' --> ');
    cleaned = cleaned.replace(/([A-Z])\s*-->\s*([A-Z])/g, '$1 --> $2');
    cleaned = cleaned.replace(/([A-Z])\s*---\s*([A-Z])/g, '$1 --- $2');
    cleaned = cleaned.replace(/\s*-->\s*/g, ' --> ');
    cleaned = cleaned.replace(/\s*---\s*/g, ' --- ');
    cleaned = cleaned.replace(/\n\s*\n/g, '\n');
    cleaned = cleaned.trim();
    
    // Step 9: Expand single-letter IDs
    try {
      const lines = cleaned.split(/\r?\n/);
      const idMap = new Map<string, string>();
      const getHint = (ln: string): string | null => {
        const m = ln.match(/:::(\w+)/);
        return m ? m[1].toUpperCase() : null;
      };
      const choose = (hint: string | null): string => {
        const known = ['UI','APP','BIZ','DATA','SEC','INFRA','API','CTRL','SVC','REPO','DB','UTIL','EXT'];
        return (hint && known.includes(hint)) ? hint : 'NODE';
      };
      
      lines.forEach((ln) => {
        const m = ln.match(/^\s*([A-Za-z])\s*\[/);
        if (m) {
          const nodeId = m[1];
          if (!idMap.has(nodeId)) {
            idMap.set(nodeId, `${choose(getHint(ln))}_${nodeId}`);
          }
        }
      });
      
      if (idMap.size) {
        let updated = cleaned;
        idMap.forEach((newId, oldId) => {
          const reNode = new RegExp(`(^|\\n)(\\s*)${oldId}(?=\\s*\\[)`, 'g');
          updated = updated.replace(reNode, ($0, p1, p2) => `${p1}${p2}${newId}`);
        });
        updated = updated.replace(/class\s+([A-Za-z0-9_,\s]+)\s+([A-Za-z_][\w]*)\s*;/g, (full, ids, cls) => {
          const mapped = ids.split(',').map((s: string) => {
            const v = s.trim();
            return idMap.get(v) || v;
          }).join(',');
          return `class ${mapped} ${cls};`;
        });
        idMap.forEach((newId, oldId) => {
          const reEdge = new RegExp(`\\b${oldId}\\b`, 'g');
          updated = updated.replace(reEdge, (match, offset, str) => {
            const before = str.slice(Math.max(0, offset - 5), offset);
            if (before.includes('[')) return match;
            return newId;
          });
        });
        cleaned = updated;
      }
    } catch (e) {
      console.warn('ID expansion failed:', e);
    }
    
    return cleaned;
  };

  // Create a completely safe fallback diagram
  const createSafeDiagram = (originalCode: string): string => {
    const nodeMatches = originalCode.match(/([A-Z])\[([^\]]+)\]/g) || [];
    const nodes = nodeMatches.map(match => {
      const matchResult = match.match(/([A-Z])\[([^\]]+)\]/);
      if (!matchResult) return null;
      const [, id, label] = matchResult;
      return { id, label: label.replace(/[<>]/g, '').trim() };
    }).filter((node): node is NodeInfo => node !== null);
    
    if (nodes.length > 0) {
      let fallbackCode = 'graph TD\n';
      nodes.forEach(node => {
        fallbackCode += `  ${node.id}[${node.label}]\n`;
      });
      return fallbackCode;
    }
    
    return `flowchart TD
    START[System Architecture] --> FE[Frontend Layer]
    START --> BE[Backend Layer]
    FE --> AUTH[Authentication Service]
    BE --> BL[Business Logic]
    BL --> DB[Database Layer]
    BE --> API[External APIs]
    style START fill:#e3f2fd
    style FE fill:#f3e5f5
    style BE fill:#e8f5e8
    style AUTH fill:#fff3e0
    style BL fill:#fce4ec
    style DB fill:#ffebee
    style API fill:#f1f8e9`;
  };

  useEffect(() => {
    let isMounted = true;
    let renderTimeout: NodeJS.Timeout;
    
    async function renderMermaid() {
      if (!code) {
        setError('No diagram code provided.');
        return;
      }
      
      try {
        setError(null);
        setFallbackMode(false);
        setIsRendering(true);
        
        if (!window.mermaid) {
          const mermaidModule = await import('mermaid');
          window.mermaid = mermaidModule.default || mermaidModule;
        }
        
        window.mermaid.initialize({ 
          startOnLoad: false,
          theme: 'default',
          fontFamily: 'Inter, Arial, sans-serif',
          flowchart: { 
            useMaxWidth: true,
            htmlLabels: false,
            curve: 'linear',
            nodeSpacing: 50,
            rankSpacing: 60
          },
          securityLevel: 'loose'
        });
        
        if (isMounted) {
          const cleanedCode = cleanMermaidCode(code);
          
          try {
            const uniqueId = `${id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            let svg: string;
            try {
              const result = await window.mermaid.render(uniqueId, cleanedCode);
              svg = result.svg;
            } catch (primaryErr) {
              const prefixed = cleanedCode.replace(/\n\s*([A-Z])\s*\[/g, (m, p1) => `\n ${p1}${p1} [`)
                                          .replace(/class\s+([A-Z])(\s|;)/g, (m, p1, p2) => `class ${p1}${p1}${p2}`)
                                          .replace(/\b([A-Z])\b(?![\w\[])/g, '$1');
              const result = await window.mermaid.render(uniqueId, prefixed);
              svg = result.svg;
            }
            
            if (isMounted) {
              setSvgContent(svg);
              setError(null);
            }
          } catch (renderError: any) {
            console.warn('Primary render failed, trying fallback:', renderError);
            
            if (isMounted) {
              try {
                window.mermaid.initialize({ 
                  startOnLoad: false,
                  theme: 'default',
                  flowchart: { 
                    useMaxWidth: true,
                    htmlLabels: true,
                    curve: 'basis'
                  },
                  securityLevel: 'loose',
                  logLevel: 0
                });
                
                const fallbackCode = createSafeDiagram(code);
                const uniqueId = `${id}-fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const result = await window.mermaid.render(uniqueId, fallbackCode);
                setSvgContent(result.svg);
                setFallbackMode(true);
                setError('Diagram rendered with simplified syntax due to parsing issues.');
              } catch (fallbackError: any) {
                console.warn('Fallback render also failed:', fallbackError);
                const textRepresentation = `
                  <div style="padding: 20px; text-align: center; color: #666; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9;">
                    <h4 style="margin: 0 0 10px 0; color: #333;">Diagram could not be rendered</h4>
                    <p style="margin: 0 0 15px 0;">The original diagram contained syntax that could not be parsed.</p>
                    <details style="margin-top: 10px; text-align: left;">
                      <summary style="cursor: pointer; color: #0066cc;">View Original Code</summary>
                      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-top: 10px; font-size: 12px; overflow-x: auto;">${code}</pre>
                    </details>
                  </div>
                `;
                setSvgContent(textRepresentation);
                setError('Diagram could not be rendered. Check the original code for syntax issues.');
                setFallbackMode(true);
              }
            }
          }
        }
      } catch (error: any) {
        console.error('Error in renderMermaid:', error);
        if (isMounted) {
          setError(`Failed to render diagram: ${error.message}`);
        }
      } finally {
        if (isMounted) {
          setIsRendering(false);
        }
      }
    }
    
    renderTimeout = setTimeout(() => {
      renderMermaid();
    }, 100);
    
    return () => { 
      isMounted = false; 
      if (renderTimeout) {
        clearTimeout(renderTimeout);
      }
    };
  }, [code, id]);

  const downloadPng = async () => {
    try {
      setLoadingPng(true);
      const blob = await apiService.renderMermaid({ code: code || '' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${id}.png`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download diagram');
    } finally {
      setLoadingPng(false);
    }
  };

  const openInDrawio = async () => {
    try {
      const mermaid = typeof code === 'string' ? code : '';
      if (!mermaid) return;
      
      const data = await apiService.convertMermaidToDrawio({ code: mermaid });
      if (!data.success || !data.drawio_xml) {
        alert('Failed to convert to draw.io');
        return;
      }
      
      const xml = data.drawio_xml;
      const url = 'https://embed.diagrams.net/?embed=1&ui=min&proto=json&spin=1&libraries=1&configure=1';
      const win = window.open(url, '_blank');
      if (!win) {
        alert('Popup blocked. Please allow popups to open diagrams.net.');
        return;
      }
      
      const onMessage = (evt: MessageEvent) => {
        if (!evt.data) return;
        const msg = evt.data;
        if (msg === 'ready' || (typeof msg === 'object' && msg.event === 'ready')) {
          win.postMessage(JSON.stringify({ action: 'load', xml }), '*');
        }
      };
      window.addEventListener('message', onMessage, { once: true });
    } catch (e) {
      console.error('Open in draw.io failed', e);
      alert('Could not open in draw.io');
    }
  };

  const fetchPng = async () => {
    setLoadingPng(true);
    setPngUrl(null);
    try {
      if (code && typeof code === 'string' && code.startsWith('LUCID_EMBED::')) {
        setLoadingPng(false);
        setPngUrl(null);
        return;
      }
      const blob = await apiService.renderMermaid({ code: code || '' });
      const url = window.URL.createObjectURL(blob);
      setPngUrl(url);
    } catch (error) {
      console.error('PNG fetch error:', error);
      setPngUrl(null);
    }
    setLoadingPng(false);
  };

  useEffect(() => {
    if (showPngInline && code) {
      fetchPng();
    }
    return () => {
      if (pngUrl) window.URL.revokeObjectURL(pngUrl);
    };
  }, [showPngInline, code]);

  if (error && fallbackMode) {
    return (
      <div className="glass-card rounded-lg shadow-lg border p-6">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {title}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={openInDrawio}
                className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Edit in draw.io
              </button>
            </div>
          </div>
        )}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-700 mb-3">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Diagram Rendering Issue</span>
          </div>
          <p className="text-yellow-700 mb-3">{error}</p>
          {showPngInline && pngUrl && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">PNG Fallback Preview:</h4>
              <img src={pngUrl} alt="Diagram PNG" className="max-w-full border rounded" />
            </div>
          )}
          <div className="bg-white rounded border p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Raw Diagram Code:</h4>
            <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
              {code}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  if (fallbackMode && !error) {
    return (
      <div className="glass-card rounded-lg shadow-lg border p-6">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {title}
            </h3>
            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Simplified Version
            </div>
          </div>
        )}
        <div className="border rounded-lg overflow-hidden bg-gray-50">
          <div ref={containerRef} className="p-4 min-h-[200px] flex items-center justify-center">
            {!code && (
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No diagram code available</p>
              </div>
            )}
            {code && !containerRef.current?.innerHTML && !error && (
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600">Rendering diagram...</p>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Simplified Diagram</span>
          </div>
          <p className="text-blue-600 text-xs">The original diagram contained complex syntax. This is a simplified version.</p>
        </div>
      </div>
    );
  }

  const isLucid = code && typeof code === 'string' && code.startsWith('LUCID_EMBED::');

  return (
    <div className="glass-card rounded-lg shadow-lg border p-6">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {title}
          </h3>
          {showDownloadPng && (
            <button
              onClick={downloadPng}
              disabled={loadingPng}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingPng ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download PNG
            </button>
          )}
        </div>
      )}
      <div className="border rounded-lg overflow-hidden bg-gray-50">
        <div ref={containerRef} className="p-4 min-h-[200px] flex items-center justify-center">
          {!code && (
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No diagram code available</p>
            </div>
          )}
          {code && !isLucid && isRendering && (
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600">Rendering diagram...</p>
            </div>
          )}
          {code && !isLucid && error && !fallbackMode && (
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600">Attempting to fix diagram syntax...</p>
            </div>
          )}
          {!isLucid && svgContent && (
            <div 
              className="w-full h-full flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          )}
          {isLucid && (
            <iframe
              title={`Lucid ${id}`}
              src={code.replace('LUCID_EMBED::','')}
              className="w-full h-[600px] border-0 rounded"
              allowFullScreen
            />
          )}
        </div>
      </div>
      {showPngInline && pngUrl && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">PNG Preview:</h4>
          <img src={pngUrl} alt="Diagram PNG" className="max-w-full border rounded" />
        </div>
      )}
    </div>
  );
};

export default MermaidDiagram;

