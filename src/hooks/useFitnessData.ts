import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { AppState, Video, Plan, DayRecord } from '../types';

export function useFitnessData() {
  const [state, setState] = useState<AppState>({
    themeColor: '#10b981',
    videos: [],
    plans: [],
    activePlanId: null,
    records: {},
  });
  
  // 新增：专门跟踪“云端数据是否正在下载”的状态
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsDataLoading(false);
        return;
      }

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { data: plans } = await supabase.from('fitness_plans').select('*').eq('user_id', user.id);
      const { data: records } = await supabase.from('daily_records').select('*').eq('user_id', user.id);
      const { data: videos } = await supabase.from('videos').select('*').eq('user_id', user.id);

      const formattedRecords: Record<string, Record<number, DayRecord>> = {};
      records?.forEach(r => {
        if (!formattedRecords[r.plan_id]) formattedRecords[r.plan_id] = {};
        formattedRecords[r.plan_id][r.day_num] = {
          completedAt: r.completed_at,
          notes: r.notes,
          taskStatus: r.task_status || {}
        };
      });

      const formattedPlans = plans?.map(p => ({
        id: p.id,
        name: p.name,
        totalDays: p.total_days || p.totalDays, 
        phases: p.phases || []
      })) || [];

      // 确保从数据库拿到的视频格式正确
      const formattedVideos = videos?.map(v => ({
        id: v.id,
        title: v.title,
        url: v.url,
        thumbnail: v.thumbnail,
        duration: v.duration
      })) || [];

      setState(s => ({
        ...s,
        themeColor: profile?.theme_color || '#10b981',
        plans: formattedPlans,
        activePlanId: formattedPlans[0]?.id || null,
        records: formattedRecords,
        videos: formattedVideos 
      }));
      
      // 数据全部装载完毕，关闭 Loading
      setIsDataLoading(false);
    }
    
    fetchData();
  }, []);

  const savePlan = async (plan: Plan) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('fitness_plans').upsert({
      id: plan.id,
      user_id: user.id,
      name: plan.name,
      total_days: plan.totalDays || (plan as any).total_days,
      phases: plan.phases
    });
    setState(s => ({ ...s, plans: [...s.plans.filter(p => p.id !== plan.id), plan], activePlanId: plan.id }));
  };

  const updateDayRecord = async (planId: string, dayNum: number, update: Partial<DayRecord>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const current = state.records[planId]?.[dayNum] || { taskStatus: {} };
    const merged = { ...current, ...update };
    await supabase.from('daily_records').upsert({
      user_id: user.id,
      plan_id: planId,
      day_num: dayNum,
      task_status: merged.taskStatus,
      notes: merged.notes,
      completed_at: merged.completedAt
    });
    setState(s => ({ ...s, records: { ...s.records, [planId]: { ...s.records[planId], [dayNum]: merged } } }));
  };

  const addVideo = async (video: Video) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // 修复点：精准映射字段，防止因为多了奇怪的属性被数据库拒收
    await supabase.from('videos').upsert({
      id: video.id,
      user_id: user.id,
      title: video.title,
      url: video.url,
      thumbnail: video.thumbnail,
      duration: video.duration
    });
    
    setState(s => ({ ...s, videos: [...s.videos, video] }));
  };

  const deleteVideo = async (videoId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('videos').delete().eq('id', videoId).eq('user_id', user.id);
    setState(s => ({ ...s, videos: s.videos.filter(v => v.id !== videoId) }));
  };

  const setThemeColor = async (color: string) => {
    setState(s => ({ ...s, themeColor: color }));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({ id: user.id, theme_color: color });
    }
  };

  const toggleTask = async (planId: string, dayNum: number, videoId: string) => {
    const currentRecord = state.records[planId]?.[dayNum] || { taskStatus: {} };
    const isCompleted = currentRecord.taskStatus[videoId];
    const update = { taskStatus: { ...currentRecord.taskStatus, [videoId]: !isCompleted } };
    await updateDayRecord(planId, dayNum, update);
  };

  return {
    state,
    isDataLoading, // 暴露给 App.tsx 使用
    savePlan,
    updateDayRecord,
    setThemeColor,
    setActivePlan: (id: string) => setState(s => ({ ...s, activePlanId: id })),
    addVideo,
    deleteVideo,
    toggleTask
  };
}
