import React, { useState, useRef, useEffect } from 'react';
import { UploadIcon, ActivityIcon, AlertCircleIcon, PlayIcon, BrainIcon } from './components/Icons';
import { AppState, VideoFile } from './types';
import { fileToBase64, formatFileSize } from './utils/fileUtils';
import { analyzeVideoSegment } from './services/geminiService';
import AnalysisDisplay from './components/AnalysisDisplay';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [video, setVideo] = useState<VideoFile | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setErrorMsg('');
    setAnalysis('');

    if (!file.type.startsWith('video/')) {
      setErrorMsg('Please upload a valid video file.');
      setAppState(AppState.ERROR);
      return;
    }

    // Limit file size to ~25MB for client-side base64 safety
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('Video is too large (Max 25MB). Please upload a shorter segment.');
      setAppState(AppState.ERROR);
      return;
    }

    setAppState(AppState.UPLOADING);

    try {
      const base64Data = await fileToBase64(file);
      const previewUrl = URL.createObjectURL(file);

      setVideo({
        file,
        previewUrl,
        base64Data,
        mimeType: file.type
      });
      setAppState(AppState.IDLE);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to process video file.');
      setAppState(AppState.ERROR);
    }
  };

  const startAnalysis = async () => {
    if (!video) return;

    setAppState(AppState.ANALYZING);
    try {
      const result = await analyzeVideoSegment(video.base64Data, video.mimeType);
      setAnalysis(result);
      setAppState(AppState.SUCCESS);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to analyze video. Please try again.');
      setAppState(AppState.ERROR);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-[#0f172a]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <ActivityIcon className="text-[#0f172a] w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                MatchVision AI
              </span>
            </div>
            <div className="text-xs font-medium px-3 py-1 bg-slate-800 rounded-full text-slate-400 border border-slate-700">
              Powered by Gemini 3 Pro
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
          
          {/* Left Column: Video Input & Player */}
          <div className="flex flex-col gap-6">
            
            {/* Header Area */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Analyze The Play</h1>
              <p className="text-slate-400">Upload a match segment to get professional tactical insights instantly.</p>
            </div>

            {/* Video Container */}
            <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden relative shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
              {video ? (
                <div className="relative w-full h-full bg-black flex flex-col">
                   <video 
                    src={video.previewUrl} 
                    controls 
                    className="w-full h-full object-contain flex-1"
                  />
                  <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
                    <div>
                        <p className="text-sm font-medium text-white truncate max-w-[200px]">{video.file.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(video.file.size)}</p>
                    </div>
                    <button 
                        onClick={() => {
                            setVideo(null);
                            setAnalysis('');
                            setAppState(AppState.IDLE);
                            setErrorMsg('');
                        }}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                        Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                    onClick={triggerFileUpload}
                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800/50 transition-all group p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                    <UploadIcon className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">Upload Match Segment</h3>
                  <p className="text-sm text-slate-500 max-w-xs">Drag and drop or click to browse. MP4, MOV, WebM supported (Max 25MB).</p>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="video/*"
                onChange={handleFileChange}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
               {appState === AppState.ERROR && (
                   <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-3 rounded-lg flex-1 border border-red-400/20">
                       <AlertCircleIcon className="w-5 h-5" />
                       <span className="text-sm font-medium">{errorMsg || "An error occurred."}</span>
                   </div>
               )}
               
               <button
                onClick={startAnalysis}
                disabled={!video || appState === AppState.ANALYZING || appState === AppState.UPLOADING || appState === AppState.ERROR}
                className={`flex-1 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]
                    ${!video || appState === AppState.ANALYZING || appState === AppState.ERROR
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:shadow-emerald-500/25'
                    }`}
               >
                   {appState === AppState.ANALYZING ? (
                       <>
                        <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                        Analyzing Tactics...
                       </>
                   ) : (
                       <>
                        <PlayIcon className="w-5 h-5 fill-current" />
                        Start Analysis
                       </>
                   )}
               </button>
            </div>
          </div>

          {/* Right Column: Analysis Output */}
          <div className="h-full flex flex-col">
            {analysis ? (
                <AnalysisDisplay content={analysis} />
            ) : (
                <div className="h-full bg-slate-900/50 border border-slate-800 border-dashed rounded-xl flex items-center justify-center p-8 text-center">
                    <div className="max-w-md">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                            <BrainIcon className="w-8 h-8 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-300 mb-2">AI Tactical Insights</h3>
                        <p className="text-slate-500">Upload a video and start analysis to see a breakdown of formations, key moments, and player performance here.</p>
                    </div>
                </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;