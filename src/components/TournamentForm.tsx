import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Send, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { CONFIG, FormData, FormType, Gymnast, PROGRAM_TYPES, TournamentId } from '../constants';
import { generateId } from '../utils';
import { GymnastCard } from './GymnastCard';

interface TournamentFormProps {
  tournament: TournamentId;
  formType: FormType;
}

const INITIAL_GYMNAST: Omit<Gymnast, 'id'> = {
  fio: '',
  birth_year: '',
  division: '',
  program: '',
  rank: '',
  category: '',
};

export function TournamentForm({ tournament, formType }: TournamentFormProps) {
  const isSpring = tournament === 'spring';
  const config = CONFIG.tournaments[tournament];
  const storageKey = `gymnastics_${tournament}_${formType}_autosave`;

  const [formData, setFormData] = useState<FormData>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    
    // Default initial state
    const initialCount = formType === 'group' || formType === 'pairs' ? 2 : 1;
    return {
      city: '',
      organization: '',
      coaches: '',
      team_name: '',
      program: '',
      program_subtype: '',
      category: '',
      gymnasts: Array.from({ length: initialCount }).map(() => ({
        id: generateId(),
        ...INITIAL_GYMNAST,
      })),
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Autosave
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(formData));
  }, [formData, storageKey]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.gymnasts.findIndex((g) => g.id === active.id);
        const newIndex = prev.gymnasts.findIndex((g) => g.id === over.id);
        return {
          ...prev,
          gymnasts: arrayMove(prev.gymnasts, oldIndex, newIndex),
        };
      });
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Handle pairs max limit
      if (formType === 'pairs' && field === 'program_subtype') {
        const max = value === 'двойки' ? 2 : value === 'тройки' ? 3 : Infinity;
        if (newData.gymnasts.length > max) {
          newData.gymnasts = newData.gymnasts.slice(0, max);
        }
      }
      
      return newData;
    });
  };

  const handleGymnastChange = (id: string, field: keyof Gymnast, value: string) => {
    setFormData((prev) => ({
      ...prev,
      gymnasts: prev.gymnasts.map((g) => (g.id === id ? { ...g, [field]: value } : g)),
    }));
  };

  const addGymnast = () => {
    setFormData((prev) => ({
      ...prev,
      gymnasts: [...prev.gymnasts, { id: generateId(), ...INITIAL_GYMNAST }],
    }));
  };

  const removeGymnast = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      gymnasts: prev.gymnasts.filter((g) => g.id !== id),
    }));
  };

  const duplicateGymnast = (id: string) => {
    setFormData((prev) => {
      const gymnastToCopy = prev.gymnasts.find((g) => g.id === id);
      if (!gymnastToCopy) return prev;
      
      const newGymnast = { ...gymnastToCopy, id: generateId() };
      const index = prev.gymnasts.findIndex((g) => g.id === id);
      
      const newGymnasts = [...prev.gymnasts];
      newGymnasts.splice(index + 1, 0, newGymnast);
      
      return { ...prev, gymnasts: newGymnasts };
    });
  };

  const clearForm = () => {
    if (window.confirm('Вы уверены, что хотите очистить форму? Все данные будут удалены.')) {
      const initialCount = formType === 'group' || formType === 'pairs' ? 2 : 1;
      setFormData({
        city: '',
        organization: '',
        coaches: '',
        team_name: '',
        program: '',
        program_subtype: '',
        category: '',
        gymnasts: Array.from({ length: initialCount }).map(() => ({
          id: generateId(),
          ...INITIAL_GYMNAST,
        })),
      });
      localStorage.removeItem(storageKey);
    }
  };

  // Limits logic
  let maxGymnasts = Infinity;
  if (formType === 'group') maxGymnasts = CONFIG.maxGymnasts.group;
  if (formType === 'pairs' && formData.program_subtype) {
    maxGymnasts = CONFIG.maxGymnasts.pairs[formData.program_subtype as 'двойки' | 'тройки'] || Infinity;
  }
  const canAdd = formData.gymnasts.length < maxGymnasts;
  const canRemove = formData.gymnasts.length > 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formType === 'pairs' && !formData.program_subtype) {
      alert('Пожалуйста, выберите тип программы (двойки или тройки)');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const payload = new URLSearchParams();
      
      // Required fields for the Google Script
      payload.append('program_type', PROGRAM_TYPES[formType]);
      payload.append('city', formData.city);
      payload.append('organization', formData.organization);
      payload.append('coaches', formData.coaches);
      
      if (formData.team_name) payload.append('team_name', formData.team_name);
      if (formData.program) payload.append('program', formData.program);
      if (formData.program_subtype) payload.append('program_subtype', formData.program_subtype);
      if (formData.category) payload.append('category', formData.category);

      // Format gymnasts array exactly as expected
      const formattedGymnasts = formData.gymnasts.map((g, idx) => ({
        number: idx + 1,
        fio: g.fio,
        birth_year: g.birth_year,
        division: g.division || '',
        program: g.program || '',
        rank: g.rank || '',
        category: g.category || '',
      }));
      
      payload.append('gymnasts', JSON.stringify(formattedGymnasts));

      // Use no-cors as requested, though it hides the actual response status.
      // We assume success if fetch doesn't throw a network error.
      await fetch(config.url, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload,
      });

      setSubmitStatus('success');
      
      // Reset form after success
      setTimeout(() => {
        const initialCount = formType === 'group' || formType === 'pairs' ? 2 : 1;
        setFormData({
          city: '', organization: '', coaches: '', team_name: '', program: '', program_subtype: '', category: '',
          gymnasts: Array.from({ length: initialCount }).map(() => ({ id: generateId(), ...INITIAL_GYMNAST })),
        });
        localStorage.removeItem(storageKey);
        setSubmitStatus('idle');
      }, 3000);

    } catch (error) {
      console.error('Submit error:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* General Info Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg">📋</span>
          Общая информация
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Город</label>
            <input
              type="text"
              required
              placeholder="Москва"
              value={formData.city}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Спортивная организация</label>
            <input
              type="text"
              required
              placeholder="СШОР №1"
              value={formData.organization}
              onChange={(e) => handleFieldChange('organization', e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">ФИО тренеров</label>
            <input
              type="text"
              required
              placeholder="Иванова А.А., Петрова В.В."
              value={formData.coaches}
              onChange={(e) => handleFieldChange('coaches', e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Conditional Fields based on formType */}
          {(formType === 'group' || formType === 'pairs') && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Название команды</label>
              <input
                type="text"
                required
                placeholder='Команда "Звезда"'
                value={formData.team_name}
                onChange={(e) => handleFieldChange('team_name', e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          )}

          {formType === 'group' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Программа команды</label>
              <select
                required
                value={formData.program}
                onChange={(e) => handleFieldChange('program', e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                <option value="">Выберите программу</option>
                {CONFIG.ranks.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}

          {formType === 'pairs' && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Тип программы</label>
                <select
                  required
                  value={formData.program_subtype}
                  onChange={(e) => handleFieldChange('program_subtype', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  <option value="">Выберите тип</option>
                  <option value="двойки">Двойки (макс. 2 гимнастки)</option>
                  <option value="тройки">Тройки (макс. 3 гимнастки)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Программа команды</label>
                <select
                  required
                  value={formData.program}
                  onChange={(e) => handleFieldChange('program', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  <option value="">Выберите программу</option>
                  {CONFIG.ranks.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Gymnasts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg">👧</span>
            Список гимнасток
            <span className="text-sm font-normal text-slate-500 ml-2">
              (Добавлено: {formData.gymnasts.length})
            </span>
          </h3>
          <button
            type="button"
            onClick={clearForm}
            className="text-sm text-slate-500 hover:text-red-600 transition-colors"
          >
            Очистить форму
          </button>
        </div>

        {formType === 'pairs' && formData.gymnasts.length >= maxGymnasts && (
          <div className="bg-amber-50 text-amber-800 px-4 py-3 rounded-xl flex items-center gap-3 text-sm border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            Достигнут максимум для типа "{formData.program_subtype}" ({maxGymnasts} гимнастки)
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={formData.gymnasts.map(g => g.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {formData.gymnasts.map((gymnast, index) => (
                <GymnastCard
                  key={gymnast.id}
                  gymnast={gymnast}
                  index={index}
                  tournament={tournament}
                  formType={formType}
                  onChange={handleGymnastChange}
                  onRemove={removeGymnast}
                  onDuplicate={duplicateGymnast}
                  canRemove={canRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button
          type="button"
          onClick={addGymnast}
          disabled={!canAdd}
          className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Добавить гимнастку
        </button>
      </div>

      {/* Submit Section */}
      <div className="pt-6 border-t border-slate-200">
        {submitStatus === 'success' ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-2 animate-in zoom-in-95 duration-300">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <h3 className="text-xl font-semibold">Заявка успешно отправлена!</h3>
            <p className="text-emerald-600">Данные сохранены в таблицу турнира.</p>
          </div>
        ) : submitStatus === 'error' ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-2 animate-in zoom-in-95 duration-300">
            <AlertTriangle className="w-12 h-12 text-red-500" />
            <h3 className="text-xl font-semibold">Ошибка отправки</h3>
            <p className="text-red-600">Пожалуйста, проверьте подключение и попробуйте снова.</p>
            <button
              type="button"
              onClick={() => setSubmitStatus('idle')}
              className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold text-lg shadow-sm hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Отправка заявки...
              </>
            ) : (
              <>
                <Send className="w-6 h-6" />
                Отправить заявку
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}
