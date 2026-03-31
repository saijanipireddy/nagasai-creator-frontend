import { useState, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'bg-emerald-500';
    case 'missed': return 'bg-slate-200';
    case 'holiday': return 'bg-blue-100';
    case 'future': return 'bg-transparent border border-slate-200';
    default: return 'bg-transparent';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'completed': return 'Completed';
    case 'missed': return 'Missed';
    case 'holiday': return 'Holiday';
    case 'future': return 'Upcoming';
    default: return '';
  }
};

const getOrdinal = (d) => {
  if (d > 3 && d < 21) return 'th';
  switch (d % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

const ConsistencyCalendar = ({
  days,
  month,
  year,
  onPreviousMonth,
  onNextMonth,
  isLoading,
  canGoPrevious = true,
  canGoNext = true,
}) => {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [popoverPos, setPopoverPos] = useState(null);
  const calendarRef = useRef(null);

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const emptyCells = Array(firstDayOfMonth).fill(null);

  const handleHover = (day, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const calRect = calendarRef.current?.getBoundingClientRect();
    if (calRect) {
      const popWidth = 120;
      let left = rect.left - calRect.left + rect.width / 2;
      if (left < popWidth / 2) left = popWidth / 2 + 4;
      if (left > calRect.width - popWidth / 2) left = calRect.width - popWidth / 2 - 4;
      setPopoverPos({ top: rect.bottom - calRect.top + 4, left });
    }
    setHoveredDay(day);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/60 ring-1 ring-slate-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-slate-100 rounded animate-pulse w-24" />
          <div className="flex gap-2">
            <div className="w-6 h-6 bg-slate-100 rounded animate-pulse" />
            <div className="w-6 h-6 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(35).fill(null).map((_, i) => (
            <div key={i} className="w-6 h-6 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md shadow-slate-200/60 ring-1 ring-slate-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">
          {MONTH_NAMES[month - 1]} {year}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={onPreviousMonth}
            disabled={!canGoPrevious}
            className={`p-1 rounded transition-colors ${canGoPrevious ? 'hover:bg-slate-100 cursor-pointer' : 'cursor-not-allowed opacity-30'}`}
          >
            <FaChevronLeft className={`text-xs ${canGoPrevious ? 'text-slate-500' : 'text-slate-300'}`} />
          </button>
          <button
            onClick={onNextMonth}
            disabled={!canGoNext}
            className={`p-1 rounded transition-colors ${canGoNext ? 'hover:bg-slate-100 cursor-pointer' : 'cursor-not-allowed opacity-30'}`}
          >
            <FaChevronRight className={`text-xs ${canGoNext ? 'text-slate-500' : 'text-slate-300'}`} />
          </button>
        </div>
      </div>

      <div ref={calendarRef} className="relative">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_NAMES.map((d, i) => (
            <div key={i} className="w-6 h-5 flex items-center justify-center text-[10px] text-slate-400 font-medium">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {emptyCells.map((_, i) => (
            <div key={`e-${i}`} className="w-6 h-6" />
          ))}
          {(days || []).map((day) => (
            <div
              key={day.date}
              onMouseEnter={(e) => handleHover(day, e)}
              onMouseLeave={() => { setHoveredDay(null); setPopoverPos(null); }}
              className={`w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-all ${getStatusColor(day.status)}`}
            />
          ))}
        </div>

        {/* Popover */}
        {hoveredDay && popoverPos && (
          <div
            className="absolute z-10 bg-white border border-slate-200 rounded-lg shadow-lg p-2 text-center min-w-[120px]"
            style={{ top: popoverPos.top, left: popoverPos.left, transform: 'translateX(-50%)' }}
          >
            <p className="text-sm font-medium text-slate-900">
              {hoveredDay.day}{getOrdinal(hoveredDay.day)} {MONTH_SHORT[month - 1]} {year}
            </p>
            <p className={`text-xs mt-1 ${
              hoveredDay.status === 'completed' ? 'text-emerald-600' :
              hoveredDay.status === 'missed' ? 'text-slate-400' :
              hoveredDay.status === 'holiday' ? 'text-blue-500' :
              'text-slate-400'
            }`}>
              {getStatusLabel(hoveredDay.status)}
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-[10px] text-slate-400">Done</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-slate-200" />
          <span className="text-[10px] text-slate-400">Missed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-100" />
          <span className="text-[10px] text-slate-400">Holiday</span>
        </div>
      </div>
    </div>
  );
};

export default ConsistencyCalendar;
