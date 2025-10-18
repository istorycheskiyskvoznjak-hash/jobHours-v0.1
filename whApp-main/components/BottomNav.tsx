import React from 'react';
import type { UserRole } from '../types';
import { ClockIcon, CalendarDaysIcon, ChartPieIcon, TeamIconWithHelmets, IdentificationIcon } from './IconComponents';

export type View = 'panel' | 'calendar' | 'stats' | 'team' | 'admin';

interface BottomNavProps {
    activeView: View;
    setActiveView: (view: View) => void;
    userRole: UserRole;
}

const NavButton: React.FC<{
    label: string;
    view: View;
    activeView: View;
    onClick: (view: View) => void;
    icon: React.ReactNode;
}> = ({ label, view, activeView, onClick, icon }) => (
    <button 
        onClick={() => onClick(view)}
        className={`flex flex-col items-center justify-center flex-1 pt-2 pb-1 transition-colors duration-200 ${
            activeView === view ? 'text-primary' : 'text-text-muted hover:text-text-heading'
        }`}
    >
        {icon}
        <span className="text-xs font-medium mt-1">{label}</span>
    </button>
);


export const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView, userRole }) => {
    
    const navItems = [
        { label: 'Часы', view: 'panel', icon: <ClockIcon className="w-6 h-6"/>, roles: ['Worker', 'Supervisor', 'Administrator'] },
        { label: 'Календарь', view: 'calendar', icon: <CalendarDaysIcon className="w-6 h-6"/>, roles: ['Worker', 'Supervisor', 'Administrator'] },
        { label: 'Статистика', view: 'stats', icon: <ChartPieIcon className="w-6 h-6"/>, roles: ['Worker', 'Supervisor', 'Administrator'] },
        { label: 'Команда', view: 'team', icon: <TeamIconWithHelmets className="w-6 h-6"/>, roles: ['Supervisor', 'Administrator'] },
        { label: 'Управление', view: 'admin', icon: <IdentificationIcon className="w-6 h-6"/>, roles: ['Administrator'] }
    ];

    const availableItems = navItems.filter(item => item.roles.includes(userRole));

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-lg border-t border-line z-20 flex justify-around">
            {availableItems.map(item => (
                <NavButton 
                    key={item.view}
                    label={item.label}
                    view={item.view as View}
                    activeView={activeView}
                    onClick={setActiveView}
                    icon={item.icon}
                />
            ))}
        </nav>
    );
};