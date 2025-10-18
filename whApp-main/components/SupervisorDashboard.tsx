import React, { useState, useMemo, useEffect } from 'react';
import type { WorkLog, User } from '../types';
import { StatsSummary } from './StatsSummary';
import { HoursChart } from './HoursChart';
import { CalendarView } from './CalendarView';
import { UserIcon, TeamIconDetailed, ClockIcon, ChartBarIcon, TeamIconWithHelmets } from './IconComponents';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../supabaseClient';

interface SupervisorDashboardProps {
    currentUser: User;
    showToast: (message: string) => void;
}

const userDisplayName = (user: User) => {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return name || user.username;
};

const TeamOverview: React.FC<{ teamMembers: User[], allLogs: Record<string, WorkLog[]> }> = ({ teamMembers, allLogs }) => {
    
    const teamStats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
        const relevantLogs7Days = teamMembers.flatMap(member => (allLogs[member.username] || []).filter(log => log.date >= sevenDaysAgoStr));
        const totalHoursLast7Days = relevantLogs7Days.reduce((sum, log) => sum + log.hours, 0);

        const pieChartData = teamMembers.map(member => {
            const memberLogs = (allLogs[member.username] || []).filter(log => log.date >= sevenDaysAgoStr);
            const memberTotalHours = memberLogs.reduce((sum, log) => sum + log.hours, 0);
            return { name: userDisplayName(member), value: memberTotalHours };
        }).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setHours(0, 0, 0, 0);
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
        
        const lineChartLogs = teamMembers.flatMap(member => (allLogs[member.username] || []).filter(log => new Date(log.date) >= fourteenDaysAgo));

        const dailyTotals = new Map<string, { dateObj: Date, hours: number }>();
        for (let i = 0; i < 14; i++) {
            const date = new Date(fourteenDaysAgo);
            date.setDate(fourteenDaysAgo.getDate() + i);
            const formattedDate = date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
            dailyTotals.set(formattedDate, { dateObj: date, hours: 0 });
        }

        lineChartLogs.forEach(log => {
            const date = new Date(log.date);
            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
            const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
            const formattedDate = adjustedDate.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
            if (dailyTotals.has(formattedDate)) {
                 const current = dailyTotals.get(formattedDate)!;
                 dailyTotals.set(formattedDate, { ...current, hours: current.hours + log.hours });
            }
        });
        
        const lineChartData = Array.from(dailyTotals.values())
            .sort((a,b) => a.dateObj.getTime() - b.dateObj.getTime())
            .map(entry => ({ name: entry.dateObj.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }), 'Всего часов': parseFloat(entry.hours.toFixed(1)) }));

        return {
            totalHoursLast7Days: totalHoursLast7Days.toFixed(1),
            totalMembers: teamMembers.length,
            avgHoursPerMember: teamMembers.length > 0 ? (totalHoursLast7Days / teamMembers.length).toFixed(1) : '0',
            pieChartData,
            lineChartData
        };
    }, [teamMembers, allLogs]);
    
    const PIE_COLORS = ['#EF4343', '#D32F2F', '#B71C1C', '#F87171', '#991B1B', '#7F1D1D'];

    if (teamMembers.length === 0) {
        return (
             <div className="bg-card shadow-lg p-10 rounded-3xl text-center h-full flex flex-col justify-center">
                <h3 className="text-lg font-semibold text-text-heading">Команда пуста</h3>
                <p className="mt-2 text-sm text-text-muted">
                    В вашей компании не найдено других членов команды.
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 lg:gap-8">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-text-heading">
                <TeamIconWithHelmets className="h-7 w-7 text-primary"/>
                <span>Обзор команды</span>
            </h2>
            <div className="flex flex-col gap-6">
                <div className="bg-gradient-to-br from-card to-surface border border-line p-6 rounded-3xl flex items-center justify-between gap-4 shadow-lg">
                    <div>
                        <p className="text-lg font-medium text-text-muted">Часы за 7 дней</p>
                        <p className="text-5xl font-bold text-text-heading mt-2">{teamStats.totalHoursLast7Days}</p>
                    </div>
                    <div className="bg-primary/10 p-4 rounded-2xl text-primary">
                        <ClockIcon className="h-10 w-10"/>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-card to-surface border border-line p-6 rounded-3xl flex items-center justify-between gap-4 shadow-lg">
                    <div>
                        <p className="text-lg font-medium text-text-muted">Всего в команде</p>
                        <p className="text-5xl font-bold text-text-heading mt-2">{teamStats.totalMembers.toString()}</p>
                    </div>
                    <div className="bg-primary/10 p-4 rounded-2xl text-primary">
                        <TeamIconDetailed className="h-10 w-10"/>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-card to-surface border border-line p-6 rounded-3xl flex items-center justify-between gap-4 shadow-lg">
                    <div>
                        <p className="text-lg font-medium text-text-muted">В среднем на сотрудника</p>
                        <p className="text-5xl font-bold text-text-heading mt-2">{teamStats.avgHoursPerMember}</p>
                    </div>
                    <div className="bg-primary/10 p-4 rounded-2xl text-primary">
                        <ChartBarIcon className="h-10 w-10"/>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 lg:gap-8">
                <div className="xl:col-span-3 bg-card shadow-lg p-6 rounded-3xl">
                    <h3 className="text-xl font-semibold mb-4 text-text-heading">Активность за 14 дней</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={teamStats.lineChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} stroke="hsl(var(--border-line))"/>
                            <XAxis dataKey="name" tick={{ fill: 'hsl(var(--text-muted))' }} className="text-xs" stroke="hsl(var(--border-line))"/>
                            <YAxis tick={{ fill: 'hsl(var(--text-muted))' }} className="text-xs" stroke="hsl(var(--border-line))"/>
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border-line))', color: 'hsl(var(--text-body))', borderRadius: '1rem' }}/>
                            <Legend wrapperStyle={{fontSize: '0.875rem', color: 'hsl(var(--text-body))'}}/>
                            <Line type="monotone" dataKey="Всего часов" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="xl:col-span-2 bg-card shadow-lg p-6 rounded-3xl">
                    <h3 className="text-xl font-semibold mb-4 text-text-heading">Распределение часов (7 д.)</h3>
                     {teamStats.pieChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                           <PieChart>
                              <Pie
                                data={teamStats.pieChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${((Number(percent) || 0) * 100).toFixed(0)}%`}
                               >
                                {teamStats.pieChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border-line))', color: 'hsl(var(--text-body))', borderRadius: '1rem' }}/>
                              <Legend wrapperStyle={{fontSize: '0.875rem', color: 'hsl(var(--text-body))'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                     ) : (
                        <div className="flex items-center justify-center h-full text-center text-text-muted">
                            <p>Нет данных за последние 7 дней.</p>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({ 
    currentUser, showToast
}) => {
    const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
    const [teamMembers, setTeamMembers] = useState<User[]>([]);
    const [allLogs, setAllLogs] = useState<Record<string, WorkLog[]>>({});
    const [isLoadingTeam, setIsLoadingTeam] = useState(false);

    useEffect(() => {
        const fetchTeamData = async () => {
            if (!currentUser.companyName) return;
            setIsLoadingTeam(true);

            const { data, error } = await supabase
                .from('profiles')
                .select('*, work_logs(*)')
                .eq('company_name', currentUser.companyName);

            if (error) {
                console.error("Error fetching team data", error);
                showToast("Не удалось загрузить данные команды");
                setIsLoadingTeam(false);
                return;
            }

            const logsByUsername: Record<string, WorkLog[]> = {};
            const users: User[] = data.map((profile: any) => {
                logsByUsername[profile.username] = profile.work_logs;
                return {
                    id: profile.id,
                    username: profile.username,
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                    hourlyRate: profile.hourly_rate,
                    companyName: profile.company_name,
                    monthlyGoal: profile.monthly_goal,
                    role: profile.role,
                };
            });
            
            setTeamMembers(users.filter(u => u.id !== currentUser.id).sort((a, b) => a.username.localeCompare(b.username)));
            setAllLogs(logsByUsername);
            setIsLoadingTeam(false);
        };

        fetchTeamData();
    }, [currentUser.companyName, currentUser.id, showToast]);

    const allTeamUsers = useMemo(() => [currentUser, ...teamMembers], [currentUser, teamMembers]);
    
    const selectedUserData = useMemo(() => {
        if (!selectedWorker) return null;
        const user = allTeamUsers.find(u => u.username === selectedWorker);
        if (!user) return null;
        return {
            user,
            logs: allLogs[selectedWorker] || []
        };
    }, [selectedWorker, allTeamUsers, allLogs]);

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-card shadow-lg p-6 rounded-3xl w-full">
                        <h3 className="text-xl font-semibold mb-4 text-text-heading">Члены команды</h3>
                        {isLoadingTeam ? <p className="text-sm text-text-muted">Загрузка...</p> : 
                        allTeamUsers.length > 1 ? (
                            <ul className="space-y-2">
                                {allTeamUsers.map(member => (
                                    <li key={member.username}>
                                        <button 
                                            onClick={() => setSelectedWorker(member.username)}
                                            className={`w-full text-left flex items-center gap-3 p-3 rounded-2xl transition-colors ${
                                                selectedWorker === member.username ? 'bg-primary text-white' : 'hover:bg-line'
                                            }`}
                                        >
                                            <UserIcon className="h-5 w-5" />
                                            <span className="font-medium">{userDisplayName(member)}{member.username === currentUser.username && " (Вы)"}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-text-muted">В вашей компании не найдено других членов команды.</p>
                        )}
                    </div>
                </div>
                <div className="lg:col-span-3">
                     {isLoadingTeam ? <div className="flex items-center justify-center h-full"><ClockIcon className="h-10 w-10 text-primary animate-spin"/></div> :
                     selectedUserData ? (
                        <div className="flex flex-col gap-6 lg:gap-8">
                            <h2 className="text-2xl font-bold text-text-heading">
                                Статистика: <span className="text-primary">{userDisplayName(selectedUserData.user)}</span>
                            </h2>
                            <StatsSummary logs={selectedUserData.logs} user={selectedUserData.user} />
                            <HoursChart logs={selectedUserData.logs} />
                            {/* FIX: Add onAddLog prop to satisfy CalendarViewProps requirement. As this view is read-only, a no-op function is sufficient. */}
                            <CalendarView logs={selectedUserData.logs} onDelete={() => {}} onAddLog={async () => {}} isReadOnly />
                        </div>
                    ) : (
                       <TeamOverview teamMembers={teamMembers} allLogs={allLogs} />
                    )}
                </div>
            </div>
        </div>
    );
};
