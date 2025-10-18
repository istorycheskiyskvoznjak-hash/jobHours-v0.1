import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { WorkLog } from '../types';
import { ChartBarIcon } from './IconComponents';

interface HoursChartProps {
  logs: WorkLog[];
}

export const HoursChart: React.FC<HoursChartProps> = ({ logs }) => {
  const chartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Use last 16 entries for better readability
    const recentLogs = sortedLogs.slice(-16);

    return recentLogs.map(log => {
      const date = new Date(log.date);
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
      return {
        name: adjustedDate.toLocaleString('ru-RU', { month: 'short', day: 'numeric' }),
        hours: log.hours,
      };
    });
  }, [logs]);

  if (chartData.length === 0) {
    return (
       <div className="bg-card shadow-lg p-6 rounded-3xl flex flex-col items-center justify-center text-center h-full min-h-[400px]">
        <ChartBarIcon className="h-12 w-12 text-text-muted mb-4" />
        <h3 className="text-lg font-semibold text-text-heading">График недоступен</h3>
        <p className="mt-2 text-sm text-text-muted">
          Запишите несколько часов, чтобы увидеть здесь визуализацию вашей работы.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card shadow-lg p-2 sm:p-6 rounded-3xl">
      <h3 className="flex items-center gap-3 text-xl font-semibold mb-4 text-text-heading px-2 pt-2 sm:px-0 sm:pt-0">
        <ChartBarIcon className="h-7 w-7 text-primary" />
        <span>Тренд рабочих часов</span>
      </h3>
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 5,
              left: -30,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(var(--accent-darker))" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} stroke="hsl(var(--border-line))"/>
            <XAxis dataKey="name" tick={{ fill: 'hsl(var(--text-muted))' }} className="text-xs" stroke="hsl(var(--border-line))"/>
            <YAxis tick={{ fill: 'hsl(var(--text-muted))' }} className="text-xs" stroke="hsl(var(--border-line))"/>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--surface))',
                borderColor: 'hsl(var(--border-line))',
                borderRadius: '0.5rem',
                color: 'hsl(var(--text-body))',
              }}
              cursor={{fill: 'hsla(var(--accent), 0.1)'}}
            />
            <Legend wrapperStyle={{color: 'hsl(var(--text-body))', fontSize: '0.875rem'}}/>
            <Bar dataKey="hours" fill="url(#colorHours)" name="Отработанные часы" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};