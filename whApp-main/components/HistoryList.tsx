import React from 'react';
import type { WorkLog } from '../types';
import { TrashIcon, PencilIcon, DocumentTextIcon } from './IconComponents';

interface HistoryListProps {
  logs: WorkLog[];
  onDelete: (id: string) => void;
  onEdit?: (log: WorkLog) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  // Adjust for timezone offset to prevent showing previous day
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};


export const HistoryList: React.FC<HistoryListProps> = ({ logs, onDelete, onEdit }) => {
  if (logs.length === 0) {
    return (
      <div className="bg-surface/70 backdrop-blur-lg border border-border/20 shadow-lg p-6 rounded-xl text-center">
        <h3 className="text-lg font-semibold text-text-heading">Пока нет записей</h3>
        <p className="mt-2 text-sm text-text-muted">
          Используйте форму для записи ваших рабочих часов, и они появятся здесь.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface/70 backdrop-blur-lg border border-border/20 shadow-lg p-6 rounded-xl">
      <h3 className="flex items-center gap-3 text-xl font-semibold mb-4 text-text-heading">
        <DocumentTextIcon className="h-6 w-6 text-primary" />
        <span>Последние записи</span>
      </h3>
      <div className="space-y-0">
        {logs.map((log, index) => (
          <div
            key={log.id}
            className={`flex justify-between items-start py-4 ${index < logs.length - 1 ? 'border-b border-border' : ''}`}
          >
            <div className="flex-grow">
              <p className="font-medium text-text-heading">{formatDate(log.date)}</p>
              <p className="text-sm text-primary font-semibold"><span className="font-bold">{log.hours}</span> часов</p>
              {log.comment && (
                <div className="mt-2 pl-3 border-l-2 border-border">
                    <p className="text-sm text-text-body whitespace-pre-wrap">
                        {log.comment}
                    </p>
                </div>
              )}
            </div>
            <div className="flex items-center ml-4 flex-shrink-0">
              {onEdit && (
                <button
                  onClick={() => onEdit(log)}
                  className="p-2 rounded-full text-text-muted hover:bg-blue-900/50 hover:text-blue-400 transition-colors"
                  aria-label={`Редактировать запись для ${formatDate(log.date)}`}
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => onDelete(log.id)}
                className="p-2 rounded-full text-text-muted hover:bg-red-900/50 hover:text-red-400 transition-colors"
                aria-label={`Удалить запись для ${formatDate(log.date)}`}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};