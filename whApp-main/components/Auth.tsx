
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { ChevronLeftIcon } from './IconComponents';

// Helper function to translate common Supabase auth errors into Russian.
const translateSupabaseError = (message: string): string => {
  if (message.includes('Invalid login credentials')) {
    return 'Неверные данные для входа. Пожалуйста, проверьте имя пользователя и пароль.';
  }
  if (message.includes('User already registered')) {
    return 'Пользователь с таким именем уже зарегистрирован.';
  }
  if (message.includes('Password should be at least 6 characters')) {
    return 'Пароль должен содержать не менее 6 символов.';
  }
  if (message.includes('sign up disabled')) {
    return 'Регистрация в данный момент отключена.';
  }
  // A generic fallback for other unexpected errors.
  return 'Произошла непредвиденная ошибка. Пожалуйста, попробуйте снова.';
};


export const Auth: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const email = `${username.trim()}@example.com`; // Dummy email for Supabase auth

    if (!username.trim() || !password.trim()) {
      setError('Имя пользователя и пароль не могут быть пустыми.');
      setLoading(false);
      return;
    }

    if (isLoginView) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(translateSupabaseError(error.message));
    } else { // Register
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username: username.trim(),
          }
        }
      });
      if (error) {
        setError(translateSupabaseError(error.message));
      }
      // App will automatically log in due to onAuthStateChange in App.tsx
      // The profile is created by a trigger in the Supabase database.
    }
    setLoading(false);
  };

  const switchView = () => {
    setIsLoginView(!isLoginView);
    setError('');
    setUsername('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="flex items-center gap-4 mb-6">
            <img src="https://iili.io/KWZ2RyJ.png" alt="jobHours Logo" className="h-24 w-24" />
            <h1 className="text-6xl sm:text-7xl font-bold text-text-heading tracking-tighter">jobHours</h1>
        </div>
      <div className="w-full max-w-md bg-card shadow-lg p-8 rounded-3xl relative">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 left-4 p-2 rounded-full text-text-muted hover:bg-line transition-colors"
            aria-label="Назад"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
        )}
        <h2 className="text-2xl font-bold text-center text-text-heading mb-6">
          {isLoginView ? 'Вход в аккаунт' : 'Создайте свой аккаунт'}
        </h2>
        <form onSubmit={handleAuthAction} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-text-muted"
            >
              Имя пользователя
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-line rounded-md focus:ring-1 focus:ring-primary focus:border-primary bg-background text-text-body"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-muted"
            >
              Пароль
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-line rounded-md focus:ring-1 focus:ring-primary focus:border-primary bg-background text-text-body"
              required
              disabled={loading}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full font-semibold py-3 px-4 border border-transparent rounded-lg text-background bg-primary hover:bg-primary-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (isLoginView ? 'Вход...' : 'Регистрация...') : (isLoginView ? 'Войти' : 'Регистрация')}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-text-muted">
          {isLoginView ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
          <button onClick={switchView} className="ml-1 font-semibold text-primary hover:text-primary-darker" disabled={loading}>
            {isLoginView ? 'Регистрация' : 'Войти'}
          </button>
        </p>
      </div>
      <p className="mt-8 text-xs text-text-muted text-center max-w-md">
        Все данные надежно хранятся в облачной базе данных с использованием Supabase.
      </p>
    </div>
  );
};
