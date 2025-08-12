import { useQuery } from '@tanstack/react-query';
import { TrendingUp, AlertTriangle, Flame } from 'lucide-react';

interface StatsPanelProps {
  userId: string;
}

interface Stats {
  goodPostureTime: string;
  warningCount: number;
  streak: number;
}

export function StatsPanel({ userId }: StatsPanelProps) {
  const { data: sessions } = useQuery({
    queryKey: ['/api/sessions', userId],
    enabled: !!userId,
  });

  // Calculate stats from sessions
  const stats: Stats = {
    goodPostureTime: sessions ? 
      `${Math.floor((sessions.reduce((acc: number, session: any) => acc + (session.goodPostureTime || 0), 0)) / 3600)}시간 ${Math.floor(((sessions.reduce((acc: number, session: any) => acc + (session.goodPostureTime || 0), 0)) % 3600) / 60)}분` :
      '0시간 0분',
    warningCount: sessions ? 
      sessions.reduce((acc: number, session: any) => acc + (session.totalWarnings || 0), 0) : 
      0,
    streak: 7 // Mock streak data
  };

  return (
    <div className="glassmorphism dark:glassmorphism-dark rounded-3xl p-6 shadow-xl">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
        <TrendingUp className="text-primary mr-2 h-5 w-5" />
        오늘의 기록
      </h3>
      
      <div className="space-y-4">
        {/* Good Posture Time */}
        <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-4" data-testid="stat-good-posture-time">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-300">올바른 자세</span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-success">{stats.goodPostureTime}</span>
              <div className="text-xl">✅</div>
            </div>
          </div>
        </div>
        
        {/* Warning Count */}
        <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-4" data-testid="stat-warning-count">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-300">경고 횟수</span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-warning">{stats.warningCount}회</span>
              <div className="text-xl">⚠️</div>
            </div>
          </div>
        </div>
        
        {/* Streak */}
        <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-4" data-testid="stat-streak">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-300">연속 기록</span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">{stats.streak}일</span>
              <div className="text-xl">🔥</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
