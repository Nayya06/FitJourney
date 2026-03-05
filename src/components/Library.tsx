import React, { useState } from 'react';
import { Video } from '../types';
import { Plus, Trash2, ExternalLink, PlayCircle } from 'lucide-react';

interface LibraryProps {
  videos: Video[];
  onAddVideo: (video: Omit<Video, 'id'>) => void;
  onDeleteVideo: (id: string) => void;
}

export default function Library({ videos, onAddVideo, onDeleteVideo }: LibraryProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;
    onAddVideo({ title, url, category: category || 'Uncategorized' });
    setTitle('');
    setUrl('');
    setCategory('');
  };

  const categories = Array.from(new Set(videos.map(v => v.category)));

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Resource Library</h2>
        <p className="text-gray-500 mb-6">Manage your follow-along videos from YouTube, Bilibili, etc.</p>
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-theme-500 bg-gray-50 focus:bg-white transition-colors"
                placeholder="e.g., 10 Min Core Workout"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-theme-500 bg-gray-50 focus:bg-white transition-colors"
                placeholder="https://..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-theme-500 bg-gray-50 focus:bg-white transition-colors"
                placeholder="e.g., Core, Yoga, HIIT"
              />
            </div>
          </div>
          <button
            type="submit"
            className="flex items-center justify-center w-full md:w-auto px-6 py-2.5 bg-theme-500 text-white rounded-xl hover:bg-theme-600 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Video
          </button>
        </form>
      </div>

      <div className="space-y-10">
        {categories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlayCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No videos added yet.</p>
            <p className="text-gray-400 text-sm mt-1">Start building your library by adding your first video above.</p>
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat} className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-800">{cat}</h3>
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  {videos.filter(v => v.category === cat).length}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {videos.filter(v => v.category === cat).map(video => (
                  <div key={video.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md hover:border-theme-200 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-theme-50 flex items-center justify-center flex-shrink-0 text-theme-500 group-hover:bg-theme-500 group-hover:text-white transition-colors">
                        <PlayCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 line-clamp-2 mb-1 leading-snug">{video.title}</h4>
                        <a 
                          href={video.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-theme-600 text-sm flex items-center hover:underline w-fit"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          Watch
                        </a>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                      <button
                        onClick={() => onDeleteVideo(video.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                        title="Delete video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
