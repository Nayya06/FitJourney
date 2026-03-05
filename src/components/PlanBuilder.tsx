import React, { useState } from 'react';
import { Plan, Phase, Video } from '../types';
import { Plus, Trash2, Save, X } from 'lucide-react';

interface PlanBuilderProps {
  plan?: Plan;
  videos: Video[];
  onSavePlan: (plan: Plan) => void;
  onClose: () => void;
}

export default function PlanBuilder({ plan, videos, onSavePlan, onClose }: PlanBuilderProps) {
  const [name, setName] = useState(plan?.name || 'New Plan');
  const [totalDays, setTotalDays] = useState(plan?.totalDays || 30);
  const [phases, setPhases] = useState<Phase[]>(plan?.phases || []);

  const handleAddPhase = () => {
    const lastDay = phases.length > 0 ? phases[phases.length - 1].endDay : 0;
    const newPhase: Phase = {
      id: crypto.randomUUID(),
      name: `Phase ${phases.length + 1}`,
      startDay: lastDay + 1,
      endDay: Math.min(lastDay + 5, totalDays),
      videoIds: [],
    };
    setPhases([...phases, newPhase]);
  };

  const handleRemovePhase = (id: string) => {
    setPhases(phases.filter(p => p.id !== id));
  };

  const handleUpdatePhase = (id: string, updates: Partial<Phase>) => {
    setPhases(phases.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleToggleVideo = (phaseId: string, videoId: string) => {
    setPhases(phases.map(p => {
      if (p.id !== phaseId) return p;
      const hasVideo = p.videoIds.includes(videoId);
      return {
        ...p,
        videoIds: hasVideo ? p.videoIds.filter(id => id !== videoId) : [...p.videoIds, videoId]
      };
    }));
  };

  const handleSave = () => {
    onSavePlan({
      id: plan?.id || crypto.randomUUID(),
      name,
      totalDays,
      phases,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{plan ? 'Edit Plan' : 'Create New Plan'}</h2>
            <p className="text-gray-500 text-sm">Design your custom fitness journey.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
            <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">Global Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-theme-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Days</label>
                <input
                  type="number"
                  min="1"
                  value={totalDays}
                  onChange={e => setTotalDays(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-theme-500 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">Phases (Building Blocks)</h3>
              <button
                onClick={handleAddPhase}
                className="flex items-center px-4 py-2 text-sm bg-theme-50 text-theme-700 rounded-xl hover:bg-theme-100 transition-colors font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Phase
              </button>
            </div>

            {phases.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500">No phases added yet. Break your plan into manageable chunks.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {phases.map((phase, index) => (
                  <div key={phase.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative group">
                    <button
                      onClick={() => handleRemovePhase(phase.id)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      <div className="flex-1 space-y-4">
                        <input
                          type="text"
                          value={phase.name}
                          onChange={e => handleUpdatePhase(phase.id, { name: e.target.value })}
                          className="text-lg font-medium text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-theme-500 focus:outline-none px-1 py-0.5 w-3/4"
                          placeholder="Phase Name"
                        />
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-500">Day</label>
                            <input
                              type="number"
                              min="1"
                              value={phase.startDay}
                              onChange={e => handleUpdatePhase(phase.id, { startDay: parseInt(e.target.value) || 1 })}
                              className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-theme-500"
                            />
                          </div>
                          <span className="text-gray-400">to</span>
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-500">Day</label>
                            <input
                              type="number"
                              min="1"
                              value={phase.endDay}
                              onChange={e => handleUpdatePhase(phase.id, { endDay: parseInt(e.target.value) || 1 })}
                              className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-theme-500"
                            />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Assigned Videos for this Phase</h4>
                          {videos.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No videos in library. Add some first!</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {videos.map(video => {
                                const isSelected = phase.videoIds.includes(video.id);
                                return (
                                  <button
                                    key={video.id}
                                    onClick={() => handleToggleVideo(phase.id, video.id)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
                                      isSelected 
                                        ? 'bg-theme-50 border-theme-200 text-theme-700' 
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                  >
                                    {video.title}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center px-6 py-2 bg-theme-500 text-white rounded-xl hover:bg-theme-600 transition-colors font-medium shadow-sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Plan
          </button>
        </div>
      </div>
    </div>
  );
}
