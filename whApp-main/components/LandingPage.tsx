import React from 'react';
import { ClockIcon, ChartBarIcon, CalendarDaysIcon } from './IconComponents';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-background text-text-body font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
                <img src="https://iili.io/KWZ2RyJ.png" alt="jobHours Logo" className="h-10 w-10" />
                <span className="text-2xl font-bold text-text-heading tracking-tight">jobHours</span>
            </div>
            <button
                onClick={onGetStarted}
                className="font-semibold py-2 px-5 border border-transparent rounded-xl text-background bg-primary hover:bg-primary-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-colors"
            >
                Начать
            </button>
        </header>

        <main className="py-24 sm:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-heading tracking-tighter">
              Простой и мощный<br /> учет рабочего времени
            </h1>
            
            <div className="mt-12 flex justify-center">
               <img
                src="https://i.ibb.co/4nMqk493/stat-right2.png"
                alt="Интерфейс приложения jobHours на мобильном телефоне"
                className="max-w-xs sm:max-w-sm md:max-w-md rounded-3xl transform transition-transform duration-500 hover:scale-105"
              />
            </div>

            <p className="mt-12 max-w-2xl mx-auto text-lg text-text-muted">
              jobHours помогает просто записывать и отслеживать ваши отработанные часы. Одно действие. Регистрация без почты, без подтверждений. Ввёл логин и пароль и сразу же пользуешься приложением.
            </p>
            
            <div className="mt-10">
              <button
                onClick={onGetStarted}
                className="font-semibold py-3 px-8 border border-transparent rounded-xl text-lg text-background bg-primary hover:bg-primary-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-colors transform hover:scale-105"
              >
                Начать бесплатно
              </button>
            </div>
          </div>
        </main>

        <section className="pb-24 sm:pb-32">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                <div className="flex flex-col items-center text-center p-6 bg-card rounded-3xl">
                    <div className="p-3 bg-primary/10 rounded-xl mb-4">
                        <ClockIcon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-text-heading">Быстрый ввод</h3>
                    <p className="mt-2 text-text-muted">
                        Записывайте часы за пару кликов. Ежедневные записи еще никогда не были такими простыми.
                    </p>
                </div>
                <div className="flex flex-col items-center text-center p-6 bg-card rounded-3xl">
                    <div className="p-3 bg-primary/10 rounded-xl mb-4">
                        <ChartBarIcon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-text-heading">Наглядная статистика</h3>
                    <p className="mt-2 text-text-muted">
                        Визуализируйте свою продуктивность с помощью интуитивно понятных графиков и отчетов.
                    </p>
                </div>
                 <div className="flex flex-col items-center text-center p-6 bg-card rounded-3xl">
                    <div className="p-3 bg-primary/10 rounded-xl mb-4">
                        <CalendarDaysIcon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-text-heading">Интерактивный календарь</h3>
                    <p className="mt-2 text-text-muted">
                        Просматривайте и управляйте записями в наглядном календаре, легко редактируя и добавляя часы.
                    </p>
                </div>
            </div>
        </section>

        <footer className="text-center py-10 border-t border-line">
            <p className="text-sm text-text-muted">&copy; {new Date().getFullYear()} jobHours. Все права защищены.</p>
        </footer>
      </div>
    </div>
  );
};