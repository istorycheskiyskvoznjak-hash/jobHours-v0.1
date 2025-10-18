

import React, { useState, useMemo, useEffect } from 'react';
import type { WorkLog } from '../types';
import {
  TrashIcon,
  PencilIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ListBulletIcon,
  PlusIcon,
  CheckCircleIcon,
  XIcon
} from './IconComponents';
import { LogForm } from './LogForm';

interface CalendarViewProps {
  logs: WorkLog[];
  onDelete: (id: string) => void;
  onAddLog: (log: Omit<WorkLog, 'id' | 'user_id'> & { id?: string }) => Promise<void>;
  isReadOnly?: boolean;
}

const formatDate = (dateString: string, options: Intl.DateTimeFormatOptions) => {
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('ru-RU', options);
};

const toYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

type SheetState = 'details' | 'editing' | 'adding' | 'confirmingDelete' | 'deleteSuccess';

export const CalendarView: React.FC<CalendarViewProps> = ({ logs, onDelete, onAddLog, isReadOnly = false }) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const [sheetState, setSheetState] = useState<SheetState>('details');
  const [logInSheet, setLogInSheet] = useState<WorkLog | null>(null);
  
  const isBottomSheetOpen = !!selectedDate;

  useEffect(() => {
    if (!isBottomSheetOpen) {
      // Reset state when sheet closes
      const timer = setTimeout(() => {
        setSheetState('details');
        setLogInSheet(null);
      }, 300); // Wait for closing animation
      return () => clearTimeout(timer);
    }
  }, [isBottomSheetOpen]);

  useEffect(() => {
      if (sheetState === 'deleteSuccess') {
          const timer = setTimeout(() => {
              setSelectedDate(null);
          }, 2000);
          return () => clearTimeout(timer);
      }
  }, [sheetState]);


  const logsByDate = useMemo(() => {
    return logs.reduce((acc, log) => {
      const date = log.date;
      if (!acc[date]) {
        acc[date] = { totalHours: 0, entries: [] };
      }
      acc[date].totalHours += log.hours;
      acc[date].entries.push(log);
      return acc;
    }, {} as Record<string, { totalHours: number; entries: WorkLog[] }>);
  }, [logs]);

  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const todayString = toYYYYMMDD(new Date());
    
    const days = [];
    const startDate = new Date(firstDayOfMonth);
    let startDayOfWeek = startDate.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    startDate.setDate(startDate.getDate() - startDayOfWeek);

    for (let i = 0; i < 42; i++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        const dateString = toYYYYMMDD(day);
        days.push({
            date: day,
            dateString: dateString,
            isCurrentMonth: day.getMonth() === month,
            isToday: dateString === todayString
        });
    }
    return days;
  }, [currentDate]);

  const handleDayClick = (dateString: string) => {
    const dayData = logsByDate[dateString];
    if (dayData && dayData.entries.length > 0) {
        // For simplicity, we'll edit the first log of the day. 
        // A multi-entry UI could be added later if needed.
        setLogInSheet(dayData.entries[0]);
    } else {
        setLogInSheet(null);
    }
    setSheetState('details');
    setSelectedDate(dateString);
  };
  
  const handleFormSubmissionInSheet = () => {
    // The LogForm's internal timer will show success, then this closes the sheet.
    setTimeout(() => {
        setSelectedDate(null);
    }, 500); // Give a little time for the user to see the success state
  };
  
  const handleDeleteConfirm = () => {
      if (logInSheet) {
          onDelete(logInSheet.id);
          setSheetState('deleteSuccess');
      }
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const renderListView = () => {
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sortedLogs.length === 0) {
      return (
        <div className="text-center py-10">
          <h3 className="text-lg font-semibold text-text-heading">Пока нет записей</h3>
          <p className="mt-2 text-sm text-text-muted">
            Используйте форму для записи ваших рабочих часов.
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-0">
        {sortedLogs.map((log, index) => (
          <div
            key={log.id}
            className={`flex justify-between items-start py-4 ${index < sortedLogs.length - 1 ? 'border-b border-line' : ''}`}
          >
            <div className="flex-grow">
              <p className="font-medium text-text-heading">{formatDate(log.date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="text-sm text-primary font-semibold"><span className="font-bold">{log.hours}</span> часов</p>
              {log.comment && (
                <div className="mt-2 pl-3 border-l-2 border-line">
                    <p className="text-sm text-text-body whitespace-pre-wrap">{log.comment}</p>
                </div>
              )}
            </div>
            {!isReadOnly && (
              <div className="flex items-center ml-4 flex-shrink-0">
                <button onClick={() => handleDayClick(log.date)} className="p-2 rounded-full text-text-muted hover:bg-blue-900/50 hover:text-blue-400 transition-colors" aria-label="Редактировать"><PencilIcon className="h-5 w-5" /></button>
                <button onClick={() => onDelete(log.id)} className="p-2 rounded-full text-text-muted hover:bg-red-900/50 hover:text-red-400 transition-colors" aria-label="Удалить"><TrashIcon className="h-5 w-5" /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  const renderSheetContent = () => {
    switch (sheetState) {
        case 'adding':
            return (
                <div className="p-4">
                    <LogForm
                        onAddLog={onAddLog}
                        existingDates={logs.map(l => l.date)}
                        prefillDate={selectedDate}
                        onSubmission={handleFormSubmissionInSheet}
                        onCancel={() => setSheetState('details')}
                        key={'adding-in-sheet'}
                    />
                </div>
            );

        case 'editing':
            return (
                <div className="p-4">
                    <LogForm
                        logToEdit={logInSheet}
                        onAddLog={onAddLog}
                        onSubmission={handleFormSubmissionInSheet}
                        existingDates={logs.map(l => l.date)}
                        onCancel={() => setSheetState('details')}
                        key={logInSheet?.id || 'editing-in-sheet'}
                    />
                </div>
            );

        case 'confirmingDelete':
            return (
                <div className="p-4 space-y-4 text-center">
                    <p className="font-semibold text-text-heading">Вы уверены, что хотите удалить эту запись?</p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setSheetState('details')}
                            className="w-full font-semibold py-2.5 px-4 rounded-xl bg-line hover:bg-line/70 text-text-body transition-colors"
                        >
                            Нет
                        </button>
                        <button
                            onClick={handleDeleteConfirm}
                            className="w-full font-semibold py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-darker text-white transition-colors"
                        >
                            Да, удалить
                        </button>
                    </div>
                </div>
            );
            
        case 'deleteSuccess':
            return (
                 <div className="p-6 flex flex-col items-center justify-center gap-3 text-center">
                    <TrashIcon className="h-8 w-8 text-primary" />
                    <p className="font-semibold text-text-heading">Запись<br/>удалена</p>
                </div>
            )

        case 'details':
        default:
             if (logInSheet) {
                 return (
                     <div className="p-4 space-y-3">
                         <div className="bg-card p-3 rounded-2xl flex justify-between items-start">
                             <div>
                                <p className="text-sm text-primary font-semibold">{logInSheet.hours} часов</p>
                                {logInSheet.comment && <p className="text-sm text-text-body mt-1 whitespace-pre-wrap">{logInSheet.comment}</p>}
                            </div>
                            {!isReadOnly && (
                            <div className="flex items-center -mr-2">
                                <button onClick={() => setSheetState('editing')} className="p-2 rounded-full text-text-muted hover:text-blue-400"><PencilIcon className="h-5 w-5"/></button>
                                <button onClick={() => setSheetState('confirmingDelete')} className="p-2 rounded-full text-text-muted hover:text-red-400"><TrashIcon className="h-5 w-5"/></button>
                            </div>
                            )}
                        </div>
                     </div>
                 );
             }
             return (
                 <div className="p-4">
                    <div className="flex justify-between items-center py-2">
                        <p className="text-sm text-text-muted">Нет записей за этот день.</p>
                         {!isReadOnly && (
                            <button
                                onClick={() => setSheetState('adding')}
                                className="p-2 rounded-full bg-primary text-white hover:bg-primary-darker transition-colors"
                                aria-label="Добавить новую запись"
                            >
                                <PlusIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                 </div>
             );
    }
  };

  return (
    <>
      <div className="bg-card shadow-lg p-4 sm:p-6 rounded-3xl max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm text-text-muted">
                {currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="bg-surface p-1 rounded-full border border-line">
                <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-card text-text-body shadow-sm' : 'text-text-muted'}`}
                ><ListBulletIcon className="h-5 w-5"/></button>
                <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-card text-text-body shadow-sm' : 'text-text-muted'}`}
                ><CalendarIcon className="h-5 w-5"/></button>
            </div>
        </div>

        {viewMode === 'calendar' ? (
        <>
            <div className="flex justify-between items-center mb-3">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-line transition-colors"><ChevronLeftIcon className="h-5 w-5 text-text-muted" /></button>
                <div className="grid grid-cols-7 gap-1 w-full text-center text-xs font-bold text-text-muted">
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => <div key={day}>{day}</div>)}
                </div>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-line transition-colors"><ChevronRightIcon className="h-5 w-5 text-text-muted" /></button>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {calendarGrid.map(({ date, dateString, isCurrentMonth, isToday }) => {
                    const dayData = logsByDate[dateString];
                    const hours = dayData?.totalHours || 0;
                    const isSelected = selectedDate === dateString;

                    return (
                        <div key={dateString} className="aspect-square p-0.5">
                            <button
                                onClick={() => handleDayClick(dateString)}
                                className={`w-full h-full rounded-2xl relative transition-all duration-200 active:scale-95 border
                                    ${!isCurrentMonth ? 'text-text-muted/30' : 'text-text-body'}
                                    ${isSelected ? 'border-primary' : (isToday ? 'border-primary/30' : 'border-transparent hover:border-line')}
                                    ${isToday ? 'bg-primary/10' : 'bg-background'}
                                `}
                            >
                                <span className={`font-semibold ${isToday ? 'text-primary' : ''}`}>{date.getDate()}</span>
                                {hours > 0 && (
                                  <span className="absolute bottom-0 right-0 translate-x-1 translate-y-1 text-xs bg-primary text-white rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-md">{hours}</span>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </>
        ) : (
            renderListView()
        )}
      </div>

      <div 
        className={`fixed inset-0 z-30 transition-opacity duration-300 ${isBottomSheetOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div 
          className="absolute inset-0 bg-black/60"
          onClick={() => setSelectedDate(null)}
        />
        
        <div className={`absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 ease-in-out ${isBottomSheetOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="bg-surface/80 backdrop-blur-xl border border-line/50 rounded-3xl shadow-2xl max-h-[80vh] flex flex-col mx-auto max-w-3xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-line flex justify-between items-center flex-shrink-0">
                    <h4 className="font-bold text-text-heading">{selectedDate ? formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}</h4>
                    <button
                        type="button"
                        onClick={() => setSelectedDate(null)}
                        className="p-1 rounded-full text-text-muted hover:bg-line transition-colors"
                        aria-label="Закрыть"
                    >
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                 <div className="overflow-y-auto">
                    {renderSheetContent()}
                </div>
            </div>
        </div>
      </div>
    </>
  );
};
