import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Copy, Trash2 } from 'lucide-react';
import { CONFIG, Gymnast, TournamentId, FormType } from '../constants';
import { cn } from '../utils';

interface GymnastCardProps {
  gymnast: Gymnast;
  index: number;
  tournament: TournamentId;
  formType: FormType;
  onChange: (id: string, field: keyof Gymnast, value: string) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  canRemove: boolean;
}

export function GymnastCard({
  gymnast,
  index,
  tournament,
  formType,
  onChange,
  onRemove,
  onDuplicate,
  canRemove,
}: GymnastCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: gymnast.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isSpring = tournament === 'spring';

  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onChange(gymnast.id, 'program', value);
    
    // Auto-adjust categories logic for Lada
    if (!isSpring && formType === 'individual') {
      if (value === 'МС' || value === 'КМС') {
        if (gymnast.category === 'Категория C') {
          onChange(gymnast.id, 'category', '');
        }
      }
    }
  };

  const availableCategories = (!isSpring && formType === 'individual' && (gymnast.program === 'МС' || gymnast.program === 'КМС'))
    ? CONFIG.categories.filter(c => c !== 'Категория C')
    : CONFIG.categories;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all",
        isDragging && "opacity-50 scale-[1.02] shadow-md z-10"
      )}
    >
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
              {index + 1}
            </span>
            <h4 className="font-medium text-slate-700">Гимнастка {index + 1}</h4>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDuplicate(gymnast.id)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            title="Дублировать"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(gymnast.id)}
            disabled={!canRemove}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400"
            title="Удалить"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Фамилия и имя</label>
          <input
            type="text"
            required
            placeholder="Иванова Анна"
            value={gymnast.fio}
            onChange={(e) => onChange(gymnast.id, 'fio', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Год рождения</label>
          <input
            type="number"
            required
            min="2000"
            max="2026"
            placeholder="2015"
            value={gymnast.birth_year}
            onChange={(e) => onChange(gymnast.id, 'birth_year', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
          />
        </div>

        {formType === 'individual' && isSpring && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Дивизион</label>
            <select
              required
              value={gymnast.division || ''}
              onChange={(e) => onChange(gymnast.id, 'division', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            >
              <option value="">Выберите дивизион</option>
              {CONFIG.divisions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}

        {formType === 'individual' && !isSpring && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Программа</label>
            <select
              required
              value={gymnast.program || ''}
              onChange={handleProgramChange}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            >
              <option value="">Выберите программу</option>
              {CONFIG.programs.lada.individual.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        )}

        {((formType === 'individual' && !isSpring) || formType === 'group' || formType === 'pairs' || (formType === 'ofp' && isSpring) || (formType === 'individual' && isSpring)) && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Разряд</label>
            <select
              required
              value={gymnast.rank || ''}
              onChange={(e) => onChange(gymnast.id, 'rank', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            >
              <option value="">Выберите разряд</option>
              {CONFIG.ranks.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        )}

        {formType === 'individual' && !isSpring && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Категория</label>
            <select
              required
              value={gymnast.category || ''}
              onChange={(e) => onChange(gymnast.id, 'category', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            >
              <option value="">Выберите категорию</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {formType === 'ofp' && !isSpring && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Программа ОФП</label>
            <select
              required
              value={gymnast.program || ''}
              onChange={(e) => onChange(gymnast.id, 'program', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            >
              <option value="">Выберите программу</option>
              {CONFIG.programs.lada.ofp.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
