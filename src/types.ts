export interface Video {
  id: string;
  title: string;
  url: string;
  category: string;
}

export interface Phase {
  id: string;
  name: string;
  startDay: number;
  endDay: number;
  videoIds: string[];
}

export interface Plan {
  id: string;
  name: string;
  totalDays: number;
  phases: Phase[];
}

export interface DayRecord {
  completedAt?: string; // ISO string of when it was completed
  notes?: string;
  taskStatus: Record<string, boolean>; // videoId -> true
}

export interface AppState {
  themeColor: string;
  videos: Video[];
  plans: Plan[];
  activePlanId: string | null;
  records: Record<string, Record<number, DayRecord>>; // planId -> dayNumber -> record
}

