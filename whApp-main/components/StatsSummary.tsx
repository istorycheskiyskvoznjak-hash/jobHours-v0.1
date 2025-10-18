import React, { useState, useMemo } from 'react';
import type { WorkLog, User } from '../types';
import { CalculatorIcon, CalendarIcon } from './IconComponents';

interface StatsSummaryProps {
  logs: WorkLog[];
  user: User;
}

const toYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

type ViewType = 'last3' | 'last7' | 'thisMonth' | 'lastMonth' | 'range';

const GoalProgress: React.FC<{ logs: WorkLog[]; goal: number }> = ({ logs, goal }) => {
    const currentMonthHours = useMemo(() => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfMonthStr = toYYYYMMDD(startOfMonth);
        return logs
            .filter(log => log.date >= startOfMonthStr)
            .reduce((sum, log) => sum + log.hours, 0);
    }, [logs]);

    const progress = goal > 0 ? (currentMonthHours / goal) * 100 : 0;
    const hoursRemaining = Math.max(0, goal - currentMonthHours);

    return (
        <div className="mt-6">
            <h4 className="text-lg font-semibold text-text-heading mb-2">Цель на месяц</h4>
            <div className="space-y-2 text-text-body">
                <div className="flex justify-between items-baseline text-sm">
                    <span className="font-medium"><span className="font-bold">{currentMonthHours.toFixed(1)}</span> / <span className="font-bold">{goal}</span> ч</span>
                    <span className="text-text-muted"><span className="font-bold">{hoursRemaining.toFixed(1)}</span> ч осталось</span>
                </div>
                <div className="w-full bg-line rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                </div>
            </div>
        </div>
    )
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ logs, user }) => {
  const [view, setView] = useState<ViewType>('last7');
  const [range, setRange] = useState({ 
    from: toYYYYMMDD(new Date(new Date().setDate(new Date().getDate() - 6))), 
    to: toYYYYMMDD(new Date()) 
  });

  const { totalHours, avgHours, daysLogged, periodLabel, totalEarnings } = useMemo(() => {
    let filtered: WorkLog[] = [];
    let label = '';
    const today = new Date();
    
    today.setHours(0, 0, 0, 0);

    if (view === 'last3') {
        const startOfPeriod = new Date(today);
        startOfPeriod.setDate(today.getDate() - 2);
        label = `Последние 3 дня`;
        const startStr = toYYYYMMDD(startOfPeriod);
        const endStr = toYYYYMMDD(today);
        filtered = logs.filter(log => log.date >= startStr && log.date <= endStr);
    } else if (view === 'last7') {
        const startOfPeriod = new Date(today);
        startOfPeriod.setDate(today.getDate() - 6);
        label = `Последние 7 дней`;
        const startStr = toYYYYMMDD(startOfPeriod);
        const endStr = toYYYYMMDD(today);
        filtered = logs.filter(log => log.date >= startStr && log.date <= endStr);
    } else if (view === 'thisMonth') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      label = `Этот месяц (${today.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })})`;
      const startStr = toYYYYMMDD(startOfMonth);
      const endStr = toYYYYMMDD(endOfMonth);
      filtered = logs.filter(log => log.date >= startStr && log.date <= endStr);
    } else if (view === 'lastMonth') {
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        label = `Прошлый месяц (${startOfLastMonth.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })})`;
        const startStr = toYYYYMMDD(startOfLastMonth);
        const endStr = toYYYYMMDD(endOfLastMonth);
        filtered = logs.filter(log => log.date >= startStr && log.date <= endStr);
    } else if (view === 'range' && range.from && range.to) {
        if (range.from > range.to) {
            return { totalHours: 0, avgHours: 0, daysLogged: 0, periodLabel: 'Неверный диапазон дат (С > По)', totalEarnings: 0 };
        }
        label = `С ${range.from} по ${range.to}`;
        filtered = logs.filter(log => log.date >= range.from && log.date <= range.to);
    }

    const daysLoggedCount = filtered.length;
    const totalHoursSum = filtered.reduce((sum, log) => sum + log.hours, 0);
    const avgHoursCalc = daysLoggedCount > 0 ? totalHoursSum / daysLoggedCount : 0;
    const totalEarningsCalc = totalHoursSum * user.hourlyRate;

    return { 
      totalHours: parseFloat(totalHoursSum.toFixed(2)), 
      avgHours: parseFloat(avgHoursCalc.toFixed(2)), 
      daysLogged: daysLoggedCount,
      periodLabel: label,
      totalEarnings: parseFloat(totalEarningsCalc.toFixed(2))
    };

  }, [logs, view, range, user.hourlyRate]);
  

  const TabButton = ({ tabView, label }: { tabView: ViewType, label: string }) => (
    <button
        onClick={() => setView(tabView)}
        className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-colors ${
            view === tabView 
            ? 'bg-primary text-white' 
            : 'text-text-muted hover:bg-line'
        }`}
    >
        {label}
    </button>
  );

  return (
    <div className="bg-card shadow-lg p-6 rounded-3xl">
      <div className="flex items-center gap-3">
        <CalculatorIcon className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-semibold text-text-heading">
          Отчеты
        </h3>
      </div>
      
      <div className="mt-4 border-b border-line pb-4">
        <div className="flex flex-wrap gap-2">
            <TabButton tabView="last3" label="3 дня" />
            <TabButton tabView="last7" label="7 дней" />
            <TabButton tabView="thisMonth" label="Этот месяц" />
            <TabButton tabView="lastMonth" label="Прошлый" />
            <TabButton tabView="range" label="Диапазон" />
        </div>
      </div>

      {view === 'range' && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
          <div>
            <label htmlFor="from-date" className="block text-sm font-medium text-text-muted mb-1.5">С</label>
            <input 
                type="date" id="from-date"
                value={range.from}
                onChange={(e) => setRange(prev => ({ ...prev, from: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-xl focus:ring-1 focus:ring-primary focus:border-primary bg-surface text-text-body"
            />
          </div>
          <div>
            <label htmlFor="to-date" className="block text-sm font-medium text-text-muted mb-1.5">По</label>
            <input
                type="date" id="to-date"
                value={range.to}
                onChange={(e) => setRange(prev => ({ ...prev, to: e.target.value }))}
                min={range.from}
                className="w-full px-3 py-2 border border-line rounded-xl focus:ring-1 focus:ring-primary focus:border-primary bg-surface text-text-body"
            />
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="text-sm text-text-muted font-medium mb-4">{periodLabel}</p>
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface p-4 rounded-2xl">
                <p className="text-sm font-medium text-text-muted">Всего часов</p>
                <p className="text-3xl font-bold text-primary mt-1">{totalHours}<span className="text-lg font-medium"> ч</span></p>
            </div>
             <div className="bg-surface p-4 rounded-2xl">
                <p className="text-sm font-medium text-text-muted">Общий заработок</p>
                <p className="text-3xl font-bold text-primary mt-1">€{totalEarnings.toFixed(2)}</p>
            </div>
            <div className="bg-surface p-4 rounded-2xl">
                <p className="text-sm font-medium text-text-muted">Записано дней</p>
                <p className="text-3xl font-bold text-text-heading mt-1">{daysLogged}</p>
            </div>
            <div className="bg-surface p-4 rounded-2xl">
                <p className="text-sm font-medium text-text-muted">В среднем в день</p>
                <p className="text-3xl font-bold text-text-heading mt-1">{avgHours}<span className="text-lg font-medium"> ч</span></p>
            </div>
        </div>
      </div>
      {user.monthlyGoal > 0 && <GoalProgress logs={logs} goal={user.monthlyGoal}/>}
    </div>
  );
};