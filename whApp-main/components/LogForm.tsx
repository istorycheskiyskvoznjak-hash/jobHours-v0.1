
import React, { useState, useEffect } from 'react';
import type { WorkLog } from '../types';
import { PencilIcon, CheckCircleIcon, CalendarIcon, ClockIcon, DocumentTextIcon, ChevronLeftIcon } from './IconComponents';

interface LogFormProps {
  onAddLog: (log: Omit<WorkLog, 'id' | 'user_id'> & {id?: string}) => Promise<void>;
  existingDates: string[];
  logToEdit?: WorkLog | null;
  prefillDate?: string | null;
  onSubmission?: () => void;
  onCancel?: () => void;
}

const getTodayString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getYesterdayString = (): string => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const LogForm: React.FC<LogFormProps> = ({ onAddLog, existingDates, logToEdit, prefillDate, onSubmission, onCancel }) => {
  const [date, setDate] = useState<string>(getTodayString());
  const [hours, setHours] = useState<string>('8');
  const [comment, setComment] = useState<string>('');
  const [submissionState, setSubmissionState] = useState<'idle' | 'submitting' | 'success'>('idle');

  useEffect(() => {
    if (logToEdit) {
      setDate(logToEdit.date);
      setHours(logToEdit.hours?.toString() || '');
      setComment(logToEdit.comment || '');
    } else if (prefillDate) {
      setDate(prefillDate);
      setHours('8');
      setComment('');
    }
    else {
      setDate(getTodayString());
      setHours('8');
      setComment('');
    }
  }, [logToEdit, prefillDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submissionState !== 'idle') return;

    const numericHours = parseFloat(hours);
    if (!date || isNaN(numericHours) || numericHours <= 0 || numericHours > 24) {
      alert('Пожалуйста, введите действительную дату и положительное количество часов (1-24).');
      return;
    }

    setSubmissionState('submitting');
    try {
      await onAddLog({ date, hours: numericHours, comment, id: logToEdit?.id });
      setSubmissionState('success');

      setTimeout(() => {
        setSubmissionState('idle');
        if (onSubmission) {
          onSubmission();
        }
        // Если это была новая запись (не редактирование), сбрасываем поля формы.
        if (!logToEdit) {
            setDate(getTodayString());
            setHours('8');
            setComment('');
        }
      }, 2000);

    } catch (error) {
      console.error("Submission failed:", error);
      setSubmissionState('idle');
    }
  };
  
  const isUpdating = existingDates.includes(date) || !!logToEdit;

  const renderButtonContent = () => {
    switch (submissionState) {
        case 'submitting':
            return (
                <>
                    <ClockIcon className="h-5 w-5 animate-spin" />
                    <span>Сохранение...</span>
                </>
            );
        case 'success':
            return (
                <>
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>{isUpdating ? 'Часы обновлены' : 'Часы записаны'}</span>
                </>
            );
        case 'idle':
        default:
            return (
                <>
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>{isUpdating ? 'Обновить запись' : 'Записать часы'}</span>
                </>
            );
    }
  };
  
  const getButtonClass = () => {
    switch (submissionState) {
        case 'submitting':
            return "bg-gray-500 cursor-not-allowed";
        case 'success':
            return "bg-success";
        case 'idle':
        default:
            return "bg-primary hover:bg-primary-darker";
    }
  };

  return (
    <div className="bg-card shadow-lg p-6 rounded-3xl w-full">
      <div className="flex items-center gap-2 mb-4">
        {onCancel && (
          <button type="button" onClick={onCancel} className="-ml-2 p-2 rounded-full text-text-muted hover:bg-line">
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
        )}
        <h2 className="flex items-center gap-3 text-xl font-semibold text-text-heading">
            <PencilIcon className="h-6 w-6 text-primary" />
            <span>{logToEdit ? 'Редактировать запись' : 'Добавить запись'}</span>
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset disabled={submissionState === 'submitting'}>
            <div>
              <label htmlFor="date" className="flex items-center gap-2 text-sm font-medium text-text-muted mb-1.5">
                <CalendarIcon className="h-5 w-5" />
                <span>Дата</span>
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-line rounded-xl focus:ring-1 focus:ring-primary focus:border-primary bg-surface text-text-body disabled:opacity-50"
                max={getTodayString()}
                required
                disabled={!!logToEdit || submissionState === 'submitting'}
              />
               {!logToEdit && (
                  <div className="flex items-center justify-end gap-2 mt-2">
                      <button
                          type="button"
                          onClick={() => setDate(getTodayString())}
                          className={`text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                              date === getTodayString() 
                              ? 'bg-primary/20 text-primary' 
                              : 'text-text-muted hover:bg-line'
                          }`}
                      >
                          Сегодня
                      </button>
                      <button
                          type="button"
                          onClick={() => setDate(getYesterdayString())}
                          className={`text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                              date === getYesterdayString() 
                              ? 'bg-primary/20 text-primary' 
                              : 'text-text-muted hover:bg-line'
                          }`}
                      >
                          Вчера
                      </button>
                  </div>
              )}
            </div>

            <div>
              <label htmlFor="hours" className="flex items-center gap-2 text-sm font-medium text-text-muted mb-1.5">
                <ClockIcon className="h-5 w-5" />
                <span>Отработанные часы</span>
              </label>
               <div className="flex space-x-2 mb-2">
                {[8, 10, 12].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHours(h.toString())}
                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors border ${
                        hours === h.toString()
                        ? 'bg-primary text-white font-bold border-primary'
                        : 'bg-transparent text-primary border-primary/60 hover:bg-primary hover:text-white hover:border-primary'
                    }`}
                  >
                    {h} ч
                  </button>
                ))}
              </div>
              <input
                type="number"
                id="hours"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="Например, 7.5"
                step="0.1"
                min="0.1"
                max="24"
                className="w-full px-3 py-2 border border-line rounded-xl focus:ring-1 focus:ring-primary focus:border-primary bg-surface text-text-body"
                required
              />
            </div>
            <div>
              <label htmlFor="comment" className="flex items-center gap-2 text-sm font-medium text-text-muted mb-1.5">
                <DocumentTextIcon className="h-5 w-5" />
                <span>Комментарий <span className="opacity-70">(необязательно)</span></span>
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Опишите выполненную работу..."
                rows={3}
                className="w-full px-3 py-2 border border-line rounded-xl focus:ring-1 focus:ring-primary focus:border-primary bg-surface text-text-body"
              />
            </div>
        </fieldset>
        <button
          type="submit"
          disabled={submissionState !== 'idle'}
          className={`w-full flex items-center justify-center gap-2 font-semibold py-2.5 px-4 border border-transparent rounded-xl text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card focus:ring-primary ${getButtonClass()}`}
        >
          {renderButtonContent()}
        </button>
      </form>
    </div>
  );
};
