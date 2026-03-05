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

  // 页面加载时从云端拉取数据
  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. 获取主题色
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      // 2. 获取计划
      const { data: plans } = await supabase.from('fitness_plans').select('*').eq('user_id', user.id);
      // 3. 获取记录
      const { data: records } = await supabase.from('daily_records').select('*').eq('user_id', user.id);

      const formattedRecords: Record<string, Record<number, DayRecord>> = {};
      records?.forEach(r => {
        if (!formattedRecords[r.plan_id]) formattedRecords[r.plan_id] = {};
        formattedRecords[r.plan_id][r.day_num] = {
          completedAt: r.completed_at,
          notes: r.notes,
          taskStatus: r.task_status
        };
      });

      setState(s => ({
        ...s,
        themeColor: profile?.theme_color || '#10b981',
        plans: plans || [],
        activePlanId: plans?.[0]?.id || null,
        records: formattedRecords
      }));
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
      total_days: plan.total_days,
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

    setState(s => ({
      ...s,
      records: { ...s.records, [planId]: { ...s.records[planId], [dayNum]: merged } }
    }));
  };

  return {
    state,
    savePlan,
    updateDayRecord,
    setThemeColor: (color: string) => setState(s => ({ ...s, themeColor: color })),
    setActivePlan: (id: string) => setState(s => ({ ...s, activePlanId: id })),
    addVideo: () => {}, // 之后可扩展
    deleteVideo: () => {},
    toggleTask: (planId: string, dayNum: number, videoId: string) => {} // 逻辑已在 Dashboard 整合
  };
}
