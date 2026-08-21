'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Event as CrowdEvent } from '@/types/event';
import { videosApi, VideoRecord } from '@/lib/services';
import { UploadCloud, Video, AlertCircle, Loader2, PlayCircle, Clock, Trash2, Camera } from 'lucide-react';

interface EventCamerasTabProps {
  event: CrowdEvent;
}

export const EventCamerasTab: React.FC<EventCamerasTabProps> = ({ event }) => {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Track ongoing uploads locally to show status immediately
  const [uploadingFiles, setUploadingFiles] = useState<{name: string, status: string}[]>([]);

  const fetchVideos = useCallback(async () => {
    try {
      const data = await videosApi.getEventVideos(event.id);
      setVideos(data);
    } catch (error) {
      console.error('Failed to fetch videos', error);
    } finally {
      setIsLoading(false);
    }
  }, [event.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVideos();
    
    // Poll for status updates if any videos are processing
    const interval = setInterval(() => {
      setVideos(current => {
        const needsPolling = current.some(v => v.status === 'processing');
        if (needsPolling) {
          fetchVideos();
        }
        return current;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [fetchVideos]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setUploadError(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Process only the first file for MVP
    const file = files[0];
    
    try {
      videosApi.validateFile(file);
      
      setUploadingFiles(prev => [...prev, { name: file.name, status: 'uploading' }]);
      
      await videosApi.uploadVideo({
        file,
        eventId: event.id,
        cameraLabel: 'Manual Upload',
      });
      
      setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
      fetchVideos(); // Refresh list to show newly processing video
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUploadError(err.message);
      } else {
        setUploadError('An unknown error occurred during upload.');
      }
      setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
    }
  };

  const handleDelete = async (videoId: string) => {
    try {
      await videosApi.deleteVideo(videoId);
      setVideos(prev => prev.filter(v => v.id !== videoId));
    } catch (error) {
      console.error('Failed to delete video', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">READY</span>;
      case 'processing':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1"><Loader2 size={10} className="animate-spin"/> PROCESSING</span>;
      case 'failed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">FAILED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20 uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Context Bar */}
      <div className="flex items-center justify-between bg-[#111622] border border-[#1a2334] rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <Camera size={16} className="text-blue-400" />
            Camera Feeds & Video Processing
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          <span>Event: {event.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Drag and Drop Upload */}
        <div className="col-span-1 space-y-4">
          <div className="bg-[#111622] border border-[#1a2334] rounded-xl p-5 h-full">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <UploadCloud size={16} className="text-slate-400" />
              Upload Demo Video
            </h3>
            
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center transition-all duration-200
                ${isDragging 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-[#2a3441] hover:border-slate-500 bg-[#0a0d14]/50'
                }
              `}
            >
              <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                <UploadCloud size={24} className={isDragging ? 'text-blue-400' : 'text-slate-400'} />
              </div>
              <h4 className="text-sm font-bold text-slate-200 mb-2">Drag and drop video</h4>
              <p className="text-xs text-slate-500 max-w-[200px] mb-4">
                Supports MP4, MOV, AVI up to 500MB for AI processing.
              </p>
              
              <div className="relative">
                <input 
                  type="file" 
                  accept=".mp4,.mov,.avi"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Trigger synthetic drop
                      const fakeEvent = {
                        preventDefault: () => {},
                        stopPropagation: () => {},
                        dataTransfer: { files: [file] }
                      } as unknown as React.DragEvent;
                      handleDrop(fakeEvent);
                    }
                  }}
                />
                <button className="px-4 py-2 bg-[#1a2334] hover:bg-[#212b3e] text-xs font-semibold text-slate-200 rounded-lg transition-colors border border-[#2a3441]">
                  Browse Files
                </button>
              </div>
            </div>
            
            {uploadError && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-400">{uploadError}</p>
              </div>
            )}

            {/* Active Uploads */}
            {uploadingFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Uploads</h4>
                {uploadingFiles.map(f => (
                  <div key={f.name} className="bg-[#0a0d14] border border-[#1a2334] rounded-lg p-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 truncate pr-4">{f.name}</span>
                      <span className="text-blue-400 font-semibold text-[10px] animate-pulse">UPLOADING...</span>
                    </div>
                    <div className="w-full bg-[#1a2334] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-500 h-1.5 rounded-full w-2/3 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Video Gallery */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <div className="bg-[#111622] border border-[#1a2334] rounded-xl p-5 min-h-[400px]">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Video size={16} className="text-slate-400" />
                Video Processing Queue
              </span>
              <span className="px-2 py-1 bg-[#0a0d14] border border-[#1a2334] rounded text-xs text-slate-400 font-mono">
                {videos.length} feeds
              </span>
            </h3>

            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 size={24} className="animate-spin text-slate-500" />
              </div>
            ) : videos.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-48 border border-dashed border-[#1a2334] rounded-xl bg-[#0a0d14]/50 text-slate-500">
                <Video size={32} className="mb-3 opacity-50" />
                <p className="text-sm">No videos uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.map(video => (
                  <div key={video.id} className="bg-[#0a0d14] border border-[#1a2334] rounded-xl overflow-hidden group">
                    <div className="relative aspect-video bg-[#05080f] flex items-center justify-center border-b border-[#1a2334]">
                      {video.status === 'ready' && video.url ? (
                        <div className="relative w-full h-full">
                           <video 
                              src={video.url} 
                              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                              muted loop playsInline
                           />
                           <div className="absolute inset-0 flex items-center justify-center">
                             <PlayCircle size={32} className="text-white opacity-80" />
                           </div>
                        </div>
                      ) : video.status === 'processing' ? (
                        <div className="flex flex-col items-center text-slate-500">
                          <Loader2 size={24} className="animate-spin mb-2" />
                          <span className="text-xs uppercase tracking-widest font-bold">AI Processing</span>
                        </div>
                      ) : (
                        <Video size={24} className="text-slate-600" />
                      )}
                      
                      <div className="absolute top-2 left-2">
                        {getStatusBadge(video.status)}
                      </div>
                      <button 
                        onClick={() => handleDelete(video.id)}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-slate-300 hover:text-red-400 hover:bg-red-500/20 rounded-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete video"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-slate-200 truncate" title={video.filename}>
                        {video.filename}
                      </h4>
                      <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1"><Clock size={10} /> {new Date(video.createdAt).toLocaleTimeString()}</span>
                        <span>{(video.sizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
