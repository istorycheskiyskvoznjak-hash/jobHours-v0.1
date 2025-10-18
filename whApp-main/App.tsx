
import React, { useState, useEffect, useCallback } from 'react';
import type { WorkLog, User } from './types';
import { Auth } from './components/Auth';
import { ClockIcon, IdentificationIcon, LogoutIcon } from './components/IconComponents';
import { LogForm } from './components/LogForm';
import { Settings } from './components/Settings';
import { StatsSummary } from './components/StatsSummary';
import { HoursChart } from './components/HoursChart';
import { CalendarView } from './components/CalendarView';
import { SupervisorDashboard } from './components/SupervisorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { BottomNav, View } from './components/BottomNav';
import { Toast, type ToastType } from './components/Toast';
import { LandingPage } from './components/LandingPage';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, isVisible: boolean, type: ToastType }>({ message: '', isVisible: false, type: 'success' });
  const [activeView, setActiveView] = useState<View>('panel');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, isVisible: true, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  }, []);

  const fetchUserData = useCallback(async () => {
    if (!session?.user.id) return;
    try {
      setLoading(true);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.error("User profile not found for authenticated user, signing out.", { userId: session.user.id, error: profileError });
          showToast('Профиль пользователя не найден. Выход из системы.', 'error');
          await supabase.auth.signOut();
          return;
        }
        throw profileError;
      }
      
      const mappedUser: User = {
          id: profileData.id,
          username: profileData.username,
          firstName: profileData.first_name,
          lastName: profileData.last_name,
          hourlyRate: profileData.hourly_rate,
          companyName: profileData.company_name,
          monthlyGoal: profileData.monthly_goal,
          role: profileData.role,
      };
      setUser(mappedUser);

      const { data: logsData, error: logsError } = await supabase
        .from('work_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });
        
      if (logsError) throw logsError;
      
      setLogs(logsData as WorkLog[]);
    } catch (error: any) {
        console.error("Error fetching user data:", error);
        showToast(error.message ? `Ошибка: ${error.message}` : 'Произошла неизвестная ошибка', 'error');
    } finally {
        setLoading(false);
    }
  }, [session, showToast]);

  useEffect(() => {
    if (session) {
      fetchUserData();
    } else {
      setUser(null);
      setLogs([]);
    }
  }, [session, fetchUserData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleAddLog = useCallback(async (newLog: Omit<WorkLog, 'id' | 'user_id'> & { id?: string }) => {
    if (!user) {
        throw new Error("User not authenticated");
    }

    const logData = {
        date: newLog.date,
        hours: newLog.hours,
        comment: newLog.comment,
        user_id: user.id
    };

    let resultLog: WorkLog | null = null;
    let dbError: any = null;

    if (newLog.id) {
        // Explicit edit of an existing log.
        const { data, error } = await supabase
            .from('work_logs')
            .update(logData)
            .eq('id', newLog.id)
            .select()
            .single();
        resultLog = data;
        dbError = error;
    } else {
        // New submission. Check if a log for this date already exists.
        const { data: existingLog, error: checkError } = await supabase
            .from('work_logs')
            .select('id')
            .eq('user_id', user.id)
            .eq('date', newLog.date)
            .maybeSingle();

        if (checkError) {
            dbError = checkError;
        } else if (existingLog) {
            // Entry for date exists, so UPDATE it.
            const { data, error } = await supabase
                .from('work_logs')
                .update(logData)
                .eq('id', existingLog.id)
                .select()
                .single();
            resultLog = data;
            dbError = error;
        } else {
            // No entry for this date, so INSERT a new one.
            const { data, error } = await supabase
                .from('work_logs')
                .insert(logData)
                .select()
                .single();
            resultLog = data;
            dbError = error;
        }
    }

    if (dbError) {
        showToast(`Ошибка: ${dbError.message}`, 'error');
        throw new Error(dbError.message);
    }

    if (resultLog) {
        setLogs(prevLogs => {
            const index = prevLogs.findIndex(l => l.id === (resultLog as WorkLog).id);
            const newLogs = [...prevLogs];
            if (index > -1) {
                // Update
                newLogs[index] = resultLog as WorkLog;
            } else {
                // Insert
                newLogs.push(resultLog as WorkLog);
            }
            return newLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
    }
  }, [user, showToast]);


  const handleDeleteLog = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('work_logs').delete().eq('id', id);
    if (error) {
        showToast(`Ошибка: ${error.message}`, 'error');
    } else {
        setLogs(prev => prev.filter(log => log.id !== id));
    }
  }, [user, showToast]);
  
  const handleSettingsUpdate = useCallback(async ({ rate, companyName, monthlyGoal, firstName, lastName }: { rate: number, companyName: string, monthlyGoal: number, firstName: string, lastName: string }) => {
    if (!user) return;
    const updates = {
        hourly_rate: rate,
        company_name: companyName,
        monthly_goal: monthlyGoal,
        first_name: firstName,
        last_name: lastName,
    };
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) {
        showToast(`Ошибка: ${error.message}`, 'error');
    } else {
        showToast('Настройки успешно сохранены', 'success');
        fetchUserData();
        setIsSettingsOpen(false);
    }
  }, [user, fetchUserData, showToast]);
  
  const userDisplayName = (user: User) => {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return name || user.username;
  };
  
  const userAbbreviatedName = (user: User) => {
    if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName.charAt(0)}.`;
    }
    return userDisplayName(user);
  };

  const viewTitles: Record<View, string> = {
    panel: 'Часы',
    calendar: 'Календарь',
    stats: 'Статистика',
    team: 'Команда',
    admin: 'Управление'
  };
  
  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <ClockIcon className="h-12 w-12 text-primary animate-spin"/>
        </div>
    )
  }

  if (!session || !user) {
    if (showAuth) {
      return <Auth onBack={() => setShowAuth(false)} />;
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }
  
  const renderContent = () => {
    if (user.role === 'Supervisor' && activeView === 'team') {
        return <SupervisorDashboard 
            currentUser={user} 
            showToast={showToast}
          />;
    }
    
    if (user.role === 'Administrator' && (activeView === 'team' || activeView === 'admin')) {
        return <AdminDashboard 
            currentUser={user}
            showToast={showToast}
          />;
    }
    
    switch (activeView) {
      case 'panel':
        return (
          <div className="max-w-md mx-auto">
            <LogForm 
              onAddLog={handleAddLog}
              existingDates={logs.map(log => log.date)}
            />
          </div>
        );
      case 'calendar':
        return <CalendarView logs={logs} onDelete={handleDeleteLog} onAddLog={handleAddLog} />;
      case 'stats':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-1 flex flex-col gap-6">
                 <StatsSummary logs={logs} user={user} />
              </div>
              <div className="lg:col-span-2 flex flex-col gap-6">
                <HoursChart logs={logs} />
              </div>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen bg-background font-sans pb-24">
      <header className="bg-surface/80 backdrop-blur-lg border-b border-line sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <img src="https://iili.io/KWZ2RyJ.png" alt="jobHours Logo" className="h-8 w-8" />
                <h1 className="text-xl font-bold text-text-heading tracking-tight">{viewTitles[activeView]}</h1>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 text-text-muted bg-card hover:bg-line rounded-full transition-colors border border-line"
                    aria-label="Настройки профиля"
                >
                     <div className="text-right">
                        <div className="hidden sm:block">
                            <span className="font-semibold text-text-heading text-sm leading-tight" title={user.username}>
                                {userDisplayName(user)}
                            </span>
                            {user.companyName && <span className="block text-text-muted text-xs leading-tight">[{user.companyName}]</span>}
                        </div>
                         <div className="block sm:hidden">
                            <span className="font-semibold text-text-heading text-sm leading-tight" title={user.username}>
                                {userAbbreviatedName(user)}
                            </span>
                        </div>
                    </div>
                   <IdentificationIcon className="h-5 w-5 text-text-muted" />
                </button>
                <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center h-10 w-10 text-text-muted bg-card hover:bg-line rounded-full transition-colors border border-line"
                    aria-label="Logout"
                >
                   <LogoutIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
      
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" onClick={() => setIsSettingsOpen(false)}>
            <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <Settings 
                  user={user} 
                  onUpdate={handleSettingsUpdate} 
                  showToast={showToast}
                  onClose={() => setIsSettingsOpen(false)}
                />
            </div>
        </div>
      )}

      <Toast message={toast.message} isVisible={toast.isVisible} type={toast.type} />
      
      <BottomNav 
        activeView={activeView}
        setActiveView={setActiveView}
        userRole={user.role}
      />
      
    </div>
  );
};

export default App;
