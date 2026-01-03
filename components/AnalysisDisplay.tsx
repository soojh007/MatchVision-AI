import React from 'react';
import { BrainIcon } from './Icons';

interface AnalysisDisplayProps {
  content: string;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ content }) => {
  // Simple custom renderer for the markdown content to avoid heavy dependencies
  // We split by lines and look for headers/bullet points
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Bold headers (e.g., **Title**)
      if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
        return (
          <h3 key={index} className="text-xl font-bold text-emerald-400 mt-6 mb-3">
            {line.replace(/\*\*/g, '')}
          </h3>
        );
      }
      // Numbered headers (e.g., 1. Title)
      if (/^\d+\.\s\*\*.+\*\*$/.test(line.trim())) {
         const cleanLine = line.replace(/^\d+\.\s/, '').replace(/\*\*/g, '');
         return (
            <h3 key={index} className="text-lg font-bold text-emerald-300 mt-6 mb-2 border-b border-emerald-900/50 pb-2">
              {cleanLine}
            </h3>
         )
      }
      // Bullet points
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return (
          <li key={index} className="ml-4 mb-2 text-slate-300 list-disc pl-1">
            {line.replace(/^[\*\-]\s/, '')}
          </li>
        );
      }
      // Normal paragraphs
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }
      return (
        <p key={index} className="mb-2 text-slate-300 leading-relaxed">
          {line.replace(/\*\*/g, '')} {/* Strip bold markers from paragraphs for cleaner look */}
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
        <h2 className="text-xl font-semibold text-white">Tactical Analysis</h2>
      </div>
      <div className="prose prose-invert max-w-none">
        {renderContent(content)}
      </div>
    </div>
  );
};

export default AnalysisDisplay;