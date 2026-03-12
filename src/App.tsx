import React, { useState, useEffect } from 'react';
import { CONFIG, TournamentId, FormType, PROGRAM_TYPES } from './constants';
import { TournamentForm } from './components/TournamentForm';
import { cn } from './utils';
import { Trophy, Flower2, User, Users, UsersRound, Activity } from 'lucide-react';

export default function App() {
  const [activeTournament, setActiveTournament] = useState<TournamentId>('spring');
  const [activeTab, setActiveTab] = useState<FormType>('individual');

  // Load last active tournament from localStorage
  useEffect(() => {
    const lastTournament = localStorage.getItem('lastTournament') as TournamentId;
    if (lastTournament && (lastTournament === 'spring' || lastTournament === 'lada')) {
      setActiveTournament(lastTournament);
    }
  }, []);

  const handleTournamentChange = (id: TournamentId) => {
    setActiveTournament(id);
    localStorage.setItem('lastTournament', id);
  };

  const tabs: { id: FormType; label: string; icon: React.ReactNode }[] = [
    { id: 'individual', label: 'Индивидуальная', icon: <User className="w-4 h-4" /> },
    { id: 'group', label: 'Групповое', icon: <Users className="w-4 h-4" /> },
    { id: 'pairs', label: 'Двойки/Тройки', icon: <UsersRound className="w-4 h-4" /> },
    { id: 'ofp', label: 'ОФП', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="bg-indigo-600 text-white p-2 rounded-xl shadow-sm">
                <Trophy className="w-5 h-5" />
              </span>
              Художественная гимнастика
            </h1>
            
            {/* Tournament Selector */}
            <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner w-full sm:w-auto">
              {(Object.keys(CONFIG.tournaments) as TournamentId[]).map((key) => {
                const t = CONFIG.tournaments[key];
                const isActive = activeTournament === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleTournamentChange(key)}
                    className={cn(
                      "flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2",
                      isActive
                        ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/50"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                    )}
                  >
                    <span className="text-lg">{t.emoji}</span>
                    <span className="hidden sm:inline">{t.name}</span>
                    <span className="sm:hidden">{key === 'spring' ? 'Весна' : 'Лада'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            {CONFIG.tournaments[activeTournament].name}
          </h2>
          <p className="text-slate-500 mt-2 flex items-center justify-center sm:justify-start gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            Даты проведения: {CONFIG.tournaments[activeTournament].dates}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-5 py-3 rounded-xl font-medium text-sm transition-all flex items-center gap-2 border",
                    isActive
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="relative min-h-[500px]">
          {/* We use key to force re-render when tournament or tab changes so state is fresh per tab */}
          <TournamentForm 
            key={`${activeTournament}-${activeTab}`}
            tournament={activeTournament} 
            formType={activeTab} 
          />
        </div>
      </main>
    </div>
  );
}
