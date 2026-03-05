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
  
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsDataLoading(false);
        return;
      }

      // 并发获取所有云端数据
      const [profile, plans, records, videos] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('fitness_plans').select('*').eq('user_id', user.id),
        supabase.from('daily_records').select('*').eq('user_id', user.id),
        supabase.from('videos').select('*').eq('user_id', user.id)
      ]);

      const formattedRecords: Record<string, Record<number, DayRecord>> = {};
      records.data?.forEach(r => {
        if (!formattedRecords[r.plan_id]) formattedRecords[r.plan_id] = {};
        formattedRecords[r.plan_id][r.day_num] = {
          completedAt: r.completed_at,
          notes: r.notes,
          taskStatus: r.task_status || {}
        };
      });

      const formattedPlans = plans.data?.map(p => ({
        id: p.id,
        name: p.name,
        totalDays: p.total_days, 
        phases: p.phases || []
      })) || [];

      setState({
        themeColor: profile.data?.theme_color || '#10b981',
        plans: formattedPlans,
        activePlanId: formattedPlans[0]?.id || null,
        records: formattedRecords,
        videos: videos.data || [] 
      });
      
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
      total_days: plan.totalDays,
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

  return { state, isDataLoading, savePlan, updateDayRecord, setThemeColor, setActivePlan: (id: string) => setState(s => ({ ...s, activePlanId: id })), addVideo, deleteVideo, toggleTask };
}
