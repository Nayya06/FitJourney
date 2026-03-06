import React, { useState } from 'react';
import { Video } from '../types';
import { Plus, Trash2, Play, ExternalLink, ListVideo } from 'lucide-react';

interface LibraryProps {
  videos: Video[];
  onAddVideo: (video: Video) => void;
  onDeleteVideo: (id: string) => void;
}

export default function Library({ videos, onAddVideo, onDeleteVideo }: LibraryProps) {
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    onAddVideo({
      id: Date.now().toString(), // 生成唯一ID
      title: newTitle || '未命名视频', // 如果没填标题，给个默认值
      url: newUrl,
      thumbnail: '', // 这里可以扩展自动抓取封面的功能
      duration: '',
    });

    // 清空输入框
    setNewUrl('');
    setNewTitle('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Video Library</h2>
        <p className="text-gray-500">管理你的跟练视频库，点击卡片即可直接跳转播放。</p>
      </div>

      {/* 添加视频的表单 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-theme-500" />
          Add New Video
        </h3>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="视频标题 (例如: 帕梅拉15分钟燃脂)"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-500 outline-none"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <input
            type="url"
            required
            placeholder="粘贴视频网址 (URL)"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-500 outline-none"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-theme-500 text-white font-medium rounded-xl hover:bg-theme-600 transition-colors whitespace-nowrap shadow-md"
          >
            Save Video
          </button>
        </form>
      </div>

      {/* 视频列表展示区 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div 
            key={video.id} 
            className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* 核心修复：用 a 标签包裹整个卡片主体，并设置 target="_blank" 在新标签页打开 */}
            <a 
              href={video.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block cursor-pointer"
            >
              {/* 封面区域 (如果没有封面，显示一个漂亮的渐变底色和播放图标) */}
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative flex items-center justify-center">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <Play className="w-12 h-12 text-gray-300" />
                )}
                
                {/* 悬浮时的播放遮罩效果 */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-6 h-6 text-theme-500 ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>

              {/* 文本信息区 */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 pr-8">{video.title}</h3>
                <div className="flex items-center gap-1 mt-2 text-xs text-theme-600 font-medium">
                  <span>Watch now</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </a>

            {/* 删除按钮 (独立于 a 标签外，防止点击删除时跳转网页) */}
            <button
              onClick={(e) => {
                e.preventDefault(); // 阻止默认行为
                e.stopPropagation(); // 阻止事件冒泡到父级的 a 标签
                if (window.confirm('确定要删除这个视频吗？')) {
                  onDeleteVideo(video.id);
                }
              }}
              className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all shadow-sm"
              title="Delete video"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {videos.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <ListVideo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Your library is empty. Add some videos above!</p>
          </div>
        )}
      </div>
    </div>
  );
}
