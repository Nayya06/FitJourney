import React, { useState, useEffect } from 'react';
import { AppState, Plan, Video, DayRecord } from '../types';
import PlanBuilder from './PlanBuilder';
import { CheckCircle, Circle, PlayCircle, Calendar as CalendarIcon, Plus, ChevronDown, Check, X, Edit2 } from 'lucide-react';

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
  
  // 日记相关的状态
  const [noteText, setNoteText] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);

  const activePlan = state.plans.find(p => p.id === state.activePlanId) || null;
  const planRecords = activePlan ? (state.records[activePlan.id] || {}) : {};

  // 核心逻辑修改：计算当前的 Day。如果今天完成了，停留在今天；直到第二天再跳到下一天。
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
        // 如果是在今天完成的，就停留在这一天（除非已经是最后一天了）
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
  
  // 切换天数时，同步日记的草稿状态
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

  // 核心逻辑修改：自动打卡功能
  const handleToggleTaskWrapper = (videoId: string) => {
    if (!activePlan) return;
    
    // 预判点击后的新状态
    const isCurrentlyDone = !!dayRecord.taskStatus[videoId];
    const newTaskStatus = { ...dayRecord.taskStatus, [videoId]: !isCurrentlyDone };
    
    // 检查是否所有的视频都勾选了
    const allDoneNow = todayVideos.length > 0 && todayVideos.every(v => newTaskStatus[v.id]);

    // 如果全部勾选了，就自动生成完成时间；如果有取消勾选的，就撤销完成状态
    const newCompletedAt = allDoneNow ? new Date().toISOString() : undefined;

    // 一次性更新任务状态和完成时间
    onUpdateDayRecord(activePlan.id, displayDayNum, {
      taskStatus: newTaskStatus,
      completedAt: newCompletedAt
    });
  };

  const handleSaveNote = () => {
    if (!activePlan) return;
    onUpdateDayRecord(activePlan.id, displayDayNum, { notes: noteText });
    setIsEditingNote(false); // 保存后退出编辑模式
  };

  if (!activePlan && state.plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-theme-100 rounded-full flex items-center justify-center mb-6">
          <CalendarIcon className="w-10 h-10 text-theme-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">No Active Plan</h2>
        <p className="text-gray-500 max-w-md mb-8">
          You haven't set up a fitness plan yet. Create your first plan to start tracking your journey.
        </p>
        <button
          onClick={() => setEditingPlan(null)}
          className="px-8 py-3 bg-theme-500 text-white rounded-xl hover:bg-theme-600 transition-colors font-medium shadow-sm"
        >
          Create Plan
        </button>
        {editingPlan !== undefined && (
          <PlanBuilder 
            plan={editingPlan || undefined}
            videos={state.videos} 
            onSavePlan={onSavePlan} 
            onClose={() => setEditingPlan(undefined)} 
          />
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
    <div className="space-y-8 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <select
              value={state.activePlanId || ''}
              onChange={(e) => onSetActivePlan(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-500 shadow-sm font-medium"
            >
              {state.plans.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          
          {activePlan && (
            <button
              onClick={() => setEditingPlan(activePlan)} 
              className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              title="Edit Current Plan"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setEditingPlan(null)}
            className="p-2 bg-theme-50 text-theme-600 rounded-xl hover:bg-theme-100 transition-colors"
            title="Create New Plan"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {activePlan && (
        <>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-2">{activePlan.name}</h2>
                <p className="text-gray-500">
                  Current Day <span className="font-medium text-gray-900">{currentDayNum}</span> of {activePlan.totalDays}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-light text-gray-900 mb-1">{progressPercent}%</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider font-medium">Completed</div>
              </div>
            </div>
            
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-theme-500 transition-all duration-1000 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedDayNum && selectedDayNum !== currentDayNum ? `Viewing Day ${selectedDayNum}` : "Today's Action"}
                </h2>
                {selectedDayNum && selectedDayNum !== currentDayNum && (
                  <button 
                    onClick={() => setSelectedDayNum(null)}
                    className="text-sm text-theme-600 hover:text-theme-700 font-medium"
                  >
                    Return to Current Day
                  </button>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                {/* 恭喜横幅：全部任务完成时出现 */}
                {isDayCompleted && todayVideos.length > 0 && (
                  <div className="mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center text-emerald-800 animate-in fade-in slide-in-from-top-4 duration-500">
                    <span className="text-3xl mr-4">🎉</span>
                    <div>
                      <h4 className="text-base font-semibold text-emerald-900">Congratulations!</h4>
                      <p className="text-sm opacity-90">You have completed all tasks for today. Awesome job!</p>
                    </div>
                  </div>
                )}

                <div className="mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">Day {displayDayNum}</h3>
                    {isDayCompleted && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-theme-100 text-theme-800">
                        Completed
                      </span>
                    )}
                  </div>
                  {currentPhase ? (
                    <p className="text-theme-600 font-medium">{currentPhase.name}</p>
                  ) : (
                    <p className="text-gray-500">Rest Day / No Phase Assigned</p>
                  )}
                </div>

                {todayVideos.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-6">No specific videos assigned for this day. Enjoy your rest!</p>
                    {/* 如果是休息日，没有圆圈可以打卡，保留手动完成按钮 */}
                    {!isDayCompleted ? (
                      <button
                        onClick={() => onUpdateDayRecord(activePlan.id, displayDayNum, { completedAt: new Date().toISOString() })}
                        className="px-6 py-2 bg-theme-500 text-white rounded-xl hover:bg-theme-600 transition-colors font-medium"
                      >
                        Mark Rest Day as Complete
                      </button>
                    ) : (
                      <div className="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-medium">
                        <span className="text-xl mr-2">🎉</span> Rest Day Completed!
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayVideos.map(video => {
                      const isTaskDone = !!dayRecord.taskStatus[video.id];
                      return (
                        <div key={video.id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors bg-gray-50/50">
                          <button
                            onClick={() => handleToggleTaskWrapper(video.id)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                              isTaskDone ? 'bg-theme-500 text-white' : 'bg-white border-2 border-gray-300 text-transparent hover:border-theme-400'
                            }`}
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          
                          <div className={`flex-1 min-w-0 transition-all ${isTaskDone ? 'opacity-50 line-through' : ''}`}>
                            <h4 className="font-medium text-gray-900 truncate">{video.title}</h4>
                            <span className="text-xs text-gray-500 uppercase tracking-wider">{video.category}</span>
                          </div>

                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-theme-600 hover:bg-theme-50 rounded-xl transition-colors flex-shrink-0"
                          >
                            <PlayCircle className="w-6 h-6" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 日记功能 (Notes Section) */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Day Notes</h4>
                  
                  {dayRecord.notes && !isEditingNote ? (
                    // 已经发布的日记视图
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">{dayRecord.notes}</p>
                      <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs text-gray-500">
                        <span>Published</span>
                        <button 
                          onClick={() => setIsEditingNote(true)}
                          className="text-theme-600 hover:text-theme-700 font-medium"
                        >
                          Edit Note
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 草稿/编辑视图
                    <div className="space-y-3">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="How did you feel today? Any thoughts?"
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-theme-500 bg-gray-50 focus:bg-white transition-colors min-h-[120px] text-sm resize-none"
                      />
                      <div className="flex justify-end">
                        {dayRecord.notes && (
                          <button 
                            onClick={() => { setNoteText(dayRecord.notes || ''); setIsEditingNote(false); }}
                            className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl mr-2 text-sm font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={handleSaveNote}
                          disabled={!noteText.trim()} // 如果没写字就不能点发布
                          className={`px-6 py-2 rounded-xl text-sm font-medium transition-colors ${
                            noteText.trim() 
                              ? 'bg-theme-500 text-white hover:bg-theme-600' 
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

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Journey Map</h2>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-7 gap-2">
                  {heatmapDays.map((day) => (
                    <button
                      key={day.dayNum}
                      onClick={() => setSelectedDayNum(day.dayNum)}
                      title={`Day ${day.dayNum}`}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                        day.isCompleted
                          ? 'bg-theme-500 text-white hover:bg-theme-600 shadow-sm'
                          : day.isCurrent
                          ? 'bg-theme-50 text-theme-700 ring-2 ring-theme-500 ring-offset-2'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      } ${selectedDayNum === day.dayNum ? 'ring-2 ring-gray-900 ring-offset-2' : ''}`}
                    >
                      {day.dayNum}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-gray-50 mr-1"></div> Pending</div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-theme-50 mr-1 ring-1 ring-theme-500"></div> Current</div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-theme-500 mr-1"></div> Done</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {editingPlan !== undefined && (
        <PlanBuilder 
          plan={editingPlan || undefined}
          videos={state.videos} 
          onSavePlan={onSavePlan} 
          onClose={() => setEditingPlan(undefined)} 
        />
      )}
    </div>
  );
}