import React, { useState, useEffect } from 'react';
import { AppState, Plan, Video, DayRecord } from '../types';
import PlanBuilder from './PlanBuilder';
import { CheckCircle, Circle, PlayCircle, Calendar as CalendarIcon, Plus, ChevronDown, Check, X, Edit2, TrendingUp } from 'lucide-react';

interface DashboardProps {
  state: AppState;
  onSavePlan: (plan: Plan) => void;
  onSetActivePlan: (planId: string) => void;
  onUpdateDayRecord: (planId: string, dayNum: number, update: Partial<DayRecord>) => void;
  onToggleTask: (planId: string, dayNum: number, videoId: string) => void;
}

export default function Dashboard({ state, onSavePlan, onSetActivePlan, onUpdateDayRecord, onToggleTask }: DashboardProps) {
  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null | undefined>(undefined);
  
  const [noteText, setNoteText] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);

  const activePlan = state.plans.find(p => p.id === state.activePlanId) || null;
  const planRecords = activePlan ? (state.records[activePlan.id] || {}) : {};

  let currentDayNum = 1;
  if (activePlan) {
    const todayStr = new Date().toDateString();
    for (let i = 1; i <= activePlan.totalDays; i++) {
      const record = planRecords[i];
      if (!record?.completedAt) {
        currentDayNum = i;
        break;
      } else {
        const completedDateStr = new Date(record.completedAt).toDateString();
        if (completedDateStr === todayStr && i !== activePlan.totalDays) {
          currentDayNum = i;
          break;
        }
      }
      if (i === activePlan.totalDays) {
        currentDayNum = activePlan.totalDays;
      }
    }
  }

  const displayDayNum = selectedDayNum || currentDayNum;
  const dayRecord = planRecords[displayDayNum] || { taskStatus: {} };
  
  useEffect(() => {
    setNoteText(dayRecord.notes || '');
    setIsEditingNote(false);
  }, [displayDayNum, dayRecord.notes]);

  const currentPhase = activePlan?.phases.find(p => displayDayNum >= p.startDay && displayDayNum <= p.endDay);
  
  const todayVideos = currentPhase 
    ? currentPhase.videoIds.map(id => state.videos.find(v => v.id === id)).filter((v): v is Video => !!v)
    : [];

  const isDayCompleted = !!dayRecord.completedAt;
  const allTasksCompleted = todayVideos.length > 0 && todayVideos.every(v => dayRecord.taskStatus[v.id]);

  const handleToggleTaskWrapper = (videoId: string) => {
    if (!activePlan) return;
    const isCurrentlyDone = !!dayRecord.taskStatus[videoId];
    const newTaskStatus = { ...dayRecord.taskStatus, [videoId]: !isCurrentlyDone };
    const allDoneNow = todayVideos.length > 0 && todayVideos.every(v => newTaskStatus[v.id]);
    const newCompletedAt = allDoneNow ? new Date().toISOString() : undefined;

    onUpdateDayRecord(activePlan.id, displayDayNum, {
      taskStatus: newTaskStatus,
      completedAt: newCompletedAt
    });
  };

  const handleSaveNote = () => {
    if (!activePlan) return;
    onUpdateDayRecord(activePlan.id, displayDayNum, { notes: noteText });
    setIsEditingNote(false);
  };

  if (!activePlan && state.plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-20 h-20 bg-theme-50 rounded-full flex items-center justify-center mb-6">
          <CalendarIcon className="w-10 h-10 text-theme-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">No Active Plan</h2>
        <p className="text-gray-500 max-w-sm mb-8 text-sm">
          You haven't set up a fitness plan yet. Create your first plan to start tracking your journey.
        </p>
        <button
          onClick={() => setEditingPlan(null)}
          className="px-8 py-3.5 bg-theme-500 text-white rounded-2xl hover:bg-theme-600 transition-colors font-semibold shadow-lg shadow-theme-200"
        >
          Create New Plan
        </button>
        {editingPlan !== undefined && (
          <PlanBuilder plan={editingPlan || undefined} videos={state.videos} onSavePlan={onSavePlan} onClose={() => setEditingPlan(undefined)} />
        )}
      </div>
    );
  }

  const completedDaysCount = Object.values(planRecords).filter(r => r.completedAt).length;
  const progressPercent = activePlan ? Math.min(100, Math.round((completedDaysCount / activePlan.totalDays) * 100)) : 0;

  const heatmapDays = activePlan ? Array.from({ length: activePlan.totalDays }, (_, i) => {
    const dayNum = i + 1;
    const isCompleted = !!planRecords[dayNum]?.completedAt;
    const isCurrent = dayNum === currentDayNum && !isCompleted;
    return { dayNum, isCompleted, isCurrent };
  }) : [];

  return (
    <div className="space-y-6 relative">
      
      {/* 顶部导航控制区：优化了手机端排版，选择器靠右 */}
      <div className="flex flex-row items-center justify-between gap-4 mb-2">
        <h1 className="text-2xl font-bold text-gray-900 hidden sm:block">Dashboard</h1>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end ml-auto">
          <div className="relative group flex-1 sm:flex-none">
            <select
              value={state.activePlanId || ''}
              onChange={(e) => onSetActivePlan(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-500 shadow-sm font-semibold text-sm transition-all"
            >
              {state.plans.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          
          {activePlan && (
            <button onClick={() => setEditingPlan(activePlan)} className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors shadow-sm" title="Edit Plan">
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => setEditingPlan(null)} className="p-2.5 bg-theme-500 text-white rounded-xl hover:bg-theme-600 transition-colors shadow-sm" title="Create Plan">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activePlan && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          
          {/* 左侧区域：今日任务 + 日记 */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedDayNum && selectedDayNum !== currentDayNum ? `Viewing Day ${selectedDayNum}` : "Today's Action"}
              </h2>
              {selectedDayNum && selectedDayNum !== currentDayNum && (
                <button 
                  onClick={() => setSelectedDayNum(null)}
                  className="text-sm px-3 py-1.5 bg-theme-50 text-theme-600 rounded-lg hover:bg-theme-100 font-semibold transition-colors"
                >
                  Return to Today
                </button>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
              {isDayCompleted && todayVideos.length > 0 && (
                <div className="mb-6 p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex items-center text-emerald-800 animate-in fade-in slide-in-from-top-4 duration-500">
                  <span className="text-3xl mr-4">🎉</span>
                  <div>
                    <h4 className="text-base font-bold text-emerald-900">Congratulations!</h4>
                    <p className="text-sm opacity-90 font-medium">You have completed all tasks for today.</p>
                  </div>
                </div>
              )}

              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">Day {displayDayNum}</h3>
                  {isDayCompleted && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-theme-50 text-theme-600 border border-theme-100">
                      <Check className="w-3 h-3 mr-1" /> Completed
                    </span>
                  )}
                </div>
                {currentPhase ? (
                  <p className="text-theme-500 font-semibold text-sm flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" /> {currentPhase.name}
                  </p>
                ) : (
                  <p className="text-gray-400 font-medium text-sm">Rest Day / No Phase Assigned</p>
                )}
              </div>

              {todayVideos.length === 0 ? (
                <div className="text-center py-10 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                  <p className="text-gray-500 mb-5 font-medium text-sm">No specific videos assigned. Enjoy your rest!</p>
                  {!isDayCompleted ? (
                    <button
                      onClick={() => onUpdateDayRecord(activePlan.id, displayDayNum, { completedAt: new Date().toISOString() })}
                      className="px-6 py-2.5 bg-theme-500 text-white rounded-xl hover:bg-theme-600 transition-colors font-semibold shadow-sm text-sm"
                    >
                      Mark Rest Day as Complete
                    </button>
                  ) : (
                    <div className="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm">
                      <span className="text-lg mr-2">🎉</span> Rest Day Completed!
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {todayVideos.map(video => {
                    const isTaskDone = !!dayRecord.taskStatus[video.id];
                    return (
                      <div key={video.id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-theme-100 hover:bg-theme-50/30 transition-all bg-white shadow-sm">
                        <button
                          onClick={() => handleToggleTaskWrapper(video.id)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                            isTaskDone ? 'bg-theme-500 text-white scale-110 shadow-sm shadow-theme-200' : 'bg-white border-2 border-gray-300 text-transparent hover:border-theme-400'
                          }`}
                        >
                          <Check className="w-4 h-4" strokeWidth={3} />
                        </button>
                        
                        <div className={`flex-1 min-w-0 transition-all duration-300 ${isTaskDone ? 'opacity-40' : ''}`}>
                          <h4 className={`font-semibold text-gray-900 truncate text-sm sm:text-base ${isTaskDone ? 'line-through' : ''}`}>{video.title}</h4>
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{video.category}</span>
                        </div>

                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 rounded-xl transition-colors flex-shrink-0 ${isTaskDone ? 'text-gray-400 hover:bg-gray-100' : 'text-theme-500 hover:bg-theme-50'}`}
                        >
                          <PlayCircle className="w-6 h-6" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 日记功能 */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-theme-500" /> Day Notes
                </h4>
                
                {dayRecord.notes && !isEditingNote ? (
                  <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100 relative group transition-colors hover:bg-gray-50">
                    <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{dayRecord.notes}</p>
                    <button 
                      onClick={() => setIsEditingNote(true)}
                      className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-theme-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="How did you feel today? Any thoughts?"
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent bg-gray-50/50 focus:bg-white transition-all min-h-[120px] text-sm resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      {dayRecord.notes && (
                        <button 
                          onClick={() => { setNoteText(dayRecord.notes || ''); setIsEditingNote(false); }}
                          className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={handleSaveNote}
                        disabled={!noteText.trim()}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          noteText.trim() 
                            ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-md' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Publish Note
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧区域：进度概览 + 完美融合的 Journey Map */}
          <div className="xl:col-span-1 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 hidden xl:block">Overview</h2>
            
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 sticky top-24">
              
              {/* 融合版：计划进度概览 */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{activePlan.name}</h3>
                <p className="text-sm text-gray-500 font-medium">
                  Day <span className="font-bold text-gray-900">{currentDayNum}</span> of {activePlan.totalDays}
                </p>
                
                <div className="mt-6 flex items-end justify-between mb-2">
                  <div className="text-3xl font-light text-gray-900 tracking-tighter">{progressPercent}%</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Progress</div>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-theme-500 transition-all duration-1000 ease-out rounded-full relative"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* 原汁原味的 Journey Map */}
              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-theme-500" />
                  Journey Map
                </h4>
                
                <div className="grid grid-cols-7 gap-2">
                  {heatmapDays.map((day) => (
                    <button
                      key={day.dayNum}
                      onClick={() => setSelectedDayNum(day.dayNum)}
                      title={`Day ${day.dayNum}`}
                      className={`aspect-square rounded-[10px] flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                        day.isCompleted
                          ? 'bg-theme-500 text-white hover:bg-theme-600 shadow-sm shadow-theme-200/50 scale-[1.02]'
                          : day.isCurrent
                          ? 'bg-theme-50 text-theme-700 ring-2 ring-theme-500 ring-offset-2 scale-[1.05] z-10'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                      } ${selectedDayNum === day.dayNum ? 'ring-2 ring-gray-900 ring-offset-2 scale-[1.05] z-10' : ''}`}
                    >
                      {day.dayNum}
                    </button>
                  ))}
                </div>
                
                <div className="mt-6 flex items-center justify-between px-2 text-[11px] uppercase tracking-wider font-bold text-gray-400">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-gray-100"></div> Pending</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-theme-50 ring-1 ring-theme-400"></div> Current</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-theme-500"></div> Done</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {editingPlan !== undefined && (
        <PlanBuilder plan={editingPlan || undefined} videos={state.videos} onSavePlan={onSavePlan} onClose={() => setEditingPlan(undefined)} />
      )}
    </div>
  );
}
