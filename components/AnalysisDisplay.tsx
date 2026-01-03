import React from 'react';
import { BrainIcon } from './Icons';

interface AnalysisDisplayProps {
  content: string;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ content }) => {
  
  // Helper to parse inline bold markdown (e.g., **text**)
  const parseText = (text: string) => {
    // Split by the bold syntax, keeping the delimiters to identify parts
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="text-emerald-200 font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const trimmed = line.trim();
      
      if (!trimmed) return <div key={index} className="h-3" />;

      // Standard Markdown Headers (### Title)
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={index} className="text-lg font-bold text-emerald-400 mt-6 mb-3 border-b border-emerald-900/30 pb-2">
            {trimmed.replace(/^###\s/, '')}
          </h3>
        );
      }

      // Legacy/Alternative Bold Headers (e.g., **Title**)
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 60) {
        return (
          <h4 key={index} className="text-md font-bold text-emerald-300 mt-4 mb-2">
             {trimmed.replace(/\*\*/g, '')}
          </h4>
        );
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={index} className="ml-4 mb-2 text-slate-300 list-disc pl-1 marker:text-emerald-500">
            {parseText(trimmed.replace(/^[\*\-]\s/, ''))}
          </li>
        );
      }

      // Numbered lists (simple detection)
      if (/^\d+\.\s/.test(trimmed)) {
          return (
            <div key={index} className="ml-4 mb-2 text-slate-300 flex gap-2">
                <span className="font-semibold text-emerald-500/80">{trimmed.match(/^\d+\./)?.[0]}</span>
                <span>{parseText(trimmed.replace(/^\d+\.\s/, ''))}</span>
            </div>
          )
      }

      // Normal paragraphs
      return (
        <p key={index} className="mb-2 text-slate-300 leading-relaxed">
          {parseText(trimmed)}
        </p>
      );
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl h-full overflow-auto">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="p-2 bg-emerald-500/10 rounded-lg">
          <BrainIcon className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Coach's Analysis</h2>
      </div>
      <div className="prose prose-invert max-w-none">
        {renderContent(content)}
      </div>
    </div>
  );
};

export default AnalysisDisplay;