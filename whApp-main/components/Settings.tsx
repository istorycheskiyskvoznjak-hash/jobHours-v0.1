import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { EuroIcon, BuildingOfficeIcon, ClockIcon, UserIcon, CheckCircleIcon, XIcon, IdentificationIcon } from './IconComponents';

interface SettingsProps {
  user: User;
  onUpdate: (data: { rate: number, companyName: string, monthlyGoal: number, firstName: string, lastName: string }) => void;
  showToast: (message: string) => void;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onUpdate, showToast, onClose }) => {
  const [rate, setRate] = useState<string>((user.hourlyRate || 0).toString());
  const [companyName, setCompanyName] = useState<string>(user.companyName || '');
  const [monthlyGoal, setMonthlyGoal] = useState<string>(user.monthlyGoal?.toString() || '0');
  const [firstName, setFirstName] = useState<string>(user.firstName || '');
  const [lastName, setLastName] = useState<string>(user.lastName || '');


  useEffect(() => {
    setRate((user.hourlyRate || 0).toString());
    setCompanyName(user.companyName || '');
    setMonthlyGoal(user.monthlyGoal?.toString() || '0');
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numericRate = parseFloat(rate);
    const numericGoal = parseInt(monthlyGoal, 10);
    if (isNaN(numericRate) || numericRate < 0) {
      alert('Пожалуйста, введите действительное, неотрицательное число для почасовой ставки.');
      return;
    }
    if (isNaN(numericGoal) || numericGoal < 0) {
      alert('Пожалуйста, введите действительное, неотрицательное число для цели на месяц.');
      return;
    }
    onUpdate({ rate: numericRate, companyName, monthlyGoal: numericGoal, firstName, lastName });
  };

  return (
    <div className="bg-card shadow-lg p-6 rounded-3xl w-full">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <IdentificationIcon className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-text-heading">Мой профиль</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-text-muted hover:bg-line transition-colors"
          aria-label="Закрыть"
        >
          <XIcon className="h-6 w-6" />
        </button>
      </div>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first-name" className="flex items-center gap-2 text-sm font-medium text-text-muted mb-1.5">
                <UserIcon className="h-5 w-5" />
                <span>Имя</span>
              </label>
              <input
                type="text"
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Иван"
                className="w-full px-3 py-2 border border-line rounded-xl focus:ring-1 focus:ring-primary focus:border-primary bg-surface text-text-body"
              />
            </div>
            <div>
              <label htmlFor="last-name" className="flex items-center gap-2 text-sm font-medium text-text-muted mb-1.5">
                <UserIcon className="h-5 w-5" />
                <span>Фамилия</span>
              </label>
              <input
                type="text"
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Иванов"
                className="w-full px-3 py-2 border border-line rounded-xl focus:ring-1 focus:ring-primary focus:border-primary bg-surface text-text-body"
              />
            </div>
        </div>
        <div>
          <label htmlFor="company-name" className="flex items-center gap-2 text-sm font-medium text-text-muted mb-1.5">
            <BuildingOfficeIcon className="h-5 w-5" />
            <span>Название компании</span>
          </label>
          <input
            type="text"
            id="company-name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="например, Acme Inc."
            className="w-full px-3 py-2 border border-line rounded-xl focus:ring-1 focus:ring-primary focus:border-primary bg-surface text-text-body"
          />
        </div>
        <div>
          <label htmlFor="hourly-rate" className="flex items-center gap-2 text-sm font-medium text-text-muted mb-1.5">
            <EuroIcon className="h-5 w-5" />
            <span>Почасовая ставка (€)</span>
          </label>
          <input
            type="number"
            id="hourly-rate"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="например, 25.50"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-line rounded-xl focus:ring-1 focus:ring-primary focus:border-primary bg-surface text-text-body"
            required
          />
        </div>
         <div>
          <label htmlFor="monthly-goal" className="flex items-center gap-2 text-sm font-medium text-text-muted mb-1.5">
            <ClockIcon className="h-5 w-5" />
            <span>Цель: часы в месяц</span>
          </label>
          <input
            type="number"
            id="monthly-goal"
            value={monthlyGoal}
            onChange={(e) => setMonthlyGoal(e.target.value)}
            placeholder="например, 160"
            step="1"
            min="0"
            className="w-full px-3 py-2 border border-line rounded-xl focus:ring-1 focus:ring-primary focus:border-primary bg-surface text-text-body"
          />
        </div>
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 font-semibold py-2.5 px-4 border border-transparent rounded-xl text-white bg-primary hover:bg-primary-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card focus:ring-primary transition-colors"
        >
          <CheckCircleIcon className="h-5 w-5" />
          <span>Сохранить настройки</span>
        </button>
      </form>
    </div>
  );
};