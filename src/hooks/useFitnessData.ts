import { useState, useEffect } from 'react';
import { AppState, Video, Plan, DayRecord } from '../types';

const STORAGE_KEY = 'fitjourney_data_v2';

const defaultState: AppState = {
  themeColor: '#10b981', // Default emerald
  videos: [],
  plans: [],
  activePlanId: null,
  records: {},
};

export function useFitnessData() {
  const [state, setState] = useState<AppState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { ...defaultState, ...parsed };
      } catch (e) {
        return defaultState;
      }
    }
    
    // Attempt to migrate v1 data
    const oldStored = localStorage.getItem('fitjourney_data');
    if (oldStored) {
      try {
        const oldState = JSON.parse(oldStored);
        const migratedState = { ...defaultState, videos: oldState.videos || [] };
        if (oldState.plan) {
          const planId = oldState.plan.id || crypto.randomUUID();
          migratedState.plans = [{ ...oldState.plan, id: planId }];
          migratedState.activePlanId = planId;
          migratedState.records[planId] = {};
        }
        return migratedState;
      } catch (e) {
        // ignore
      }
    }
    
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setThemeColor = (color: string) => {
    setState(s => ({ ...s, themeColor: color }));
  };

  const addVideo = (video: Omit<Video, 'id'>) => {
    const newVideo = { ...video, id: crypto.randomUUID() };
    setState(s => ({ ...s, videos: [...s.videos, newVideo] }));
  };

  const deleteVideo = (id: string) => {
    setState(s => ({ ...s, videos: s.videos.filter(v => v.id !== id) }));
  };

  const savePlan = (plan: Plan) => {
    setState(s => {
      const existingIndex = s.plans.findIndex(p => p.id === plan.id);
      let newPlans = [...s.plans];
      if (existingIndex >= 0) {
        newPlans[existingIndex] = plan;
      } else {
        newPlans.push(plan);
      }
      
      const newRecords = { ...s.records };
      if (!newRecords[plan.id]) {
        newRecords[plan.id] = {};
      }
      
      return { 
        ...s, 
        plans: newPlans,
        activePlanId: s.activePlanId || plan.id,
        records: newRecords
      };
    });
  };

  const setActivePlan = (planId: string) => {
    setState(s => ({ ...s, activePlanId: planId }));
  };

  const updateDayRecord = (planId: string, dayNum: number, update: Partial<DayRecord>) => {
    setState(s => {
      const planRecords = s.records[planId] || {};
      const dayRecord = planRecords[dayNum] || { taskStatus: {} };
      
      return {
        ...s,
        records: {
          ...s.records,
          [planId]: {
            ...planRecords,
            [dayNum]: { ...dayRecord, ...update }
          }
        }
      };
    });
  };

  const toggleTask = (planId: string, dayNum: number, videoId: string) => {
    setState(s => {
      const planRecords = s.records[planId] || {};
      const dayRecord = planRecords[dayNum] || { taskStatus: {} };
      const currentStatus = !!dayRecord.taskStatus[videoId];
      
      return {
        ...s,
        records: {
          ...s.records,
          [planId]: {
            ...planRecords,
            [dayNum]: {
              ...dayRecord,
              taskStatus: {
                ...dayRecord.taskStatus,
                [videoId]: !currentStatus
              }
            }
          }
        }
      };
    });
  };

  return {
    state,
    setThemeColor,
    addVideo,
    deleteVideo,
    savePlan,
    setActivePlan,
    updateDayRecord,
    toggleTask,
  };
}
