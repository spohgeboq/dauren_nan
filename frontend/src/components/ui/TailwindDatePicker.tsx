import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react';

interface TailwindDatePickerProps {
  modelValue: string | null;
  alignRight?: boolean;
  'onUpdate:modelValue'?: (value: string) => void;
  onChange?: (value: string) => void; // for ease of use in React
}

export default function TailwindDatePicker({
  modelValue,
  alignRight = false,
  'onUpdate:modelValue': onUpdateModelValue,
  onChange,
}: TailwindDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [internalDate, setInternalDate] = useState<Date | null>(modelValue ? new Date(modelValue) : new Date());
  const [currentViewDate, setCurrentViewDate] = useState(new Date());

  useEffect(() => {
    if (modelValue) {
      setInternalDate(new Date(modelValue));
      setCurrentViewDate(new Date(modelValue));
    }
  }, [modelValue]);

  const toggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && internalDate) {
      setCurrentViewDate(new Date(internalDate));
    }
  };

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const prevMonth = () => {
    setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 1));
  };

  const getDays = () => {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();

    const date = new Date(year, month, 1);
    const result = [];

    let firstDay = date.getDay() - 1;
    if (firstDay === -1) firstDay = 6;

    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      result.push({
        dayNum: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i),
      });
    }

    const numDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= numDays; i++) {
      result.push({
        dayNum: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    const remain = 42 - result.length;
    for (let i = 1; i <= remain; i++) {
      result.push({
        dayNum: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }
    return result;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };

  const selectDate = (date: Date) => {
    setInternalDate(date);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const isoDate = new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
    if (onUpdateModelValue) onUpdateModelValue(isoDate);
    if (onChange) onChange(isoDate);
    setIsOpen(false);
  };

  const getDayClass = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return 'text-gray-300 cursor-default';

    if (internalDate && isSameDay(date, internalDate)) {
      return 'bg-bakery-600 text-white font-bold hover:bg-bakery-700 shadow-sm';
    }

    const today = new Date();
    if (isSameDay(date, today)) {
      return 'text-bakery-600 font-bold hover:bg-gray-100 ring-1 ring-inset ring-bakery-500';
    }

    return 'text-gray-700 hover:bg-gray-100';
  };

  const pad = (n: number) => (n < 10 ? '0' + n : n);
  const formatDateStr = (date: Date) => `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;

  const formattedRange = internalDate ? formatDateStr(internalDate) : 'Выберите дату';

  const monthsRu = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];
  const formatMonthYear = (date: Date) => {
    return `${monthsRu[date.getMonth()]} ${date.getFullYear()}`;
  };

  const presets = [
    { label: 'Сегодня', getDate: () => new Date() },
    {
      label: 'Вчера',
      getDate: () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d;
      },
    },
  ];

  const applyPreset = (preset: any) => {
    const date = preset.getDate();
    selectDate(date);
  };

  const isPresetActive = (preset: any) => {
    if (!internalDate) return false;
    return isSameDay(internalDate, preset.getDate());
  };

  const days = getDays();

  return (
    <div className="relative text-left" ref={containerRef}>
      <button
        onClick={toggle}
        type="button"
        className="flex w-full items-center gap-2 bg-white px-3 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 transition-all"
      >
        <CalendarIcon className="w-4 h-4 text-gray-500" />
        <span>{formattedRange}</span>
      </button>

      {isOpen && (
        <div
          className={`absolute mt-2 p-4 bg-white rounded-xl shadow-2xl border border-gray-200 z-[60] flex flex-col md:flex-row gap-4 md:gap-6 w-[300px] md:w-max transition-all ${
            alignRight
              ? 'left-0 sm:left-auto sm:right-0 origin-top-left sm:origin-top-right'
              : 'left-0 origin-top-left'
          }`}
        >
          {/* Presets */}
          <div className="flex flex-col gap-1 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6 min-w-[140px]">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isPresetActive(preset)
                    ? 'bg-bakery-50 text-bakery-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Calendar */}
          <div className="w-full sm:w-64">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                type="button"
                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <div className="font-bold text-gray-900 text-sm">{formatMonthYear(currentViewDate)}</div>
              <button
                onClick={nextMonth}
                type="button"
                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 mb-2">
              <div>Пн</div>
              <div>Вт</div>
              <div>Ср</div>
              <div>Чт</div>
              <div>Пт</div>
              <div>Сб</div>
              <div>Вс</div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {days.map((day, idx) => (
                <div key={idx} className="relative flex justify-center py-0.5">
                  <button
                    onClick={() => selectDate(day.date)}
                    type="button"
                    disabled={!day.isCurrentMonth}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all focus:outline-none ${getDayClass(
                      day.date,
                      day.isCurrentMonth
                    )}`}
                  >
                    {day.dayNum}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
