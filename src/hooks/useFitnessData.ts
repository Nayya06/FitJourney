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

  // 页面加载时从云端拉取所有数据
  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. 获取主题色
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      // 2. 获取计划
      const { data: plans } = await supabase.from('fitness_plans').select('*').eq('user_id', user.id);
      // 3. 获取打卡记录
      const { data: records } = await supabase.from('daily_records').select('*').eq('user_id', user.id);
      // 4. 获取视频 (修复：之前这里漏掉了)
      const { data: videos } = await supabase.from('videos').select('*').eq('user_id', user.id);

      // 整理记录数据
      const formattedRecords: Record<string, Record<number, DayRecord>> = {};
      records?.forEach(r => {
        if (!formattedRecords[r.plan_id]) formattedRecords[r.plan_id] = {};
        formattedRecords[r.plan_id][r.day_num] = {
          completedAt: r.completed_at,
          notes: r.notes,
          taskStatus: r.task_status || {}
        };
      });

      // 修复：处理 plans 的字段映射 (数据库的 total_days 映射回前端的 totalDays)
      const formattedPlans = plans?.map(p => ({
        id: p.id,
        name: p.name,
        totalDays: p.total_days || p.totalDays, 
        phases: p.phases || []
      })) || [];

      setState(s => ({
        ...s,
        themeColor: profile?.theme_color || '#10b981',
        plans: formattedPlans,
        activePlanId: formattedPlans[0]?.id || null,
        records: formattedRecords,
        // 修复：把获取到的视频装进状态。如果没有，就用空数组。
        videos: videos || [] 
      }));
    }
    fetchData();
  }, []);

  // 保存计划
  const savePlan = async (plan: Plan) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // 同步到 Supabase
    await supabase.from('fitness_plans').upsert({
      id: plan.id,
      user_id: user.id,
      name: plan.name,
      total_days: plan.totalDays || (plan as any).total_days, // 兼容处理字段名
      phases: plan.phases
    });
    
    // 更新本地状态
    setState(s => ({ 
      ...s, 
      plans: [...s.plans.filter(p => p.id !== plan.id), plan], 
      activePlanId: plan.id 
    }));
  };

  // 更新每日记录
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

    setState(s => ({
      ...s,
      records: { ...s.records, [planId]: { ...s.records[planId], [dayNum]: merged } }
    }));
  };

  // 修复 1：完成“添加视频”逻辑
  const addVideo = async (video: Video) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from('videos').upsert({
      id: video.id,
      user_id: user.id,
      ...video // 将视频的具体内容推入数据库
    });
    
    setState(s => ({ ...s, videos: [...s.videos, video] }));
  };

  // 修复 2：完成“删除视频”逻辑
  const deleteVideo = async (videoId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from('videos').delete().eq('id', videoId).eq('user_id', user.id);
    
    setState(s => ({ ...s, videos: s.videos.filter(v => v.id !== videoId) }));
  };

  // 修复 3：修改颜色时也保存到 Supabase，刷新不再丢失
  const setThemeColor = async (color: string) => {
    setState(s => ({ ...s, themeColor: color }));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({ id: user.id, theme_color: color });
    }
  };

  // 提供给 Dashboard 的打卡切换功能
  const toggleTask = async (planId: string, dayNum: number, videoId: string) => {
    const currentRecord = state.records[planId]?.[dayNum] || { taskStatus: {} };
    const isCompleted = currentRecord.taskStatus[videoId];
    const update = { taskStatus: { ...currentRecord.taskStatus, [videoId]: !isCompleted } };
    await updateDayRecord(planId, dayNum, update);
  };

  return {
    state,
    savePlan,
    updateDayRecord,
    setThemeColor,
    setActivePlan: (id: string) => setState(s => ({ ...s, activePlanId: id })),
    addVideo,
    deleteVideo,
    toggleTask
  };
}
