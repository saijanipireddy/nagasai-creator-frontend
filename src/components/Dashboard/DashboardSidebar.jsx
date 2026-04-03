import { useState, useEffect, useCallback, useMemo } from 'react';
import ScoreCard from './ScoreCard';
import StreakCard from './StreakCard';
import ConsistencyCalendar from './ConsistencyCalendar';
import RankWidget from './RankWidget';
import { dashboardWidgetAPI } from '../../services/api';

const DashboardSidebar = () => {
  const now = new Date();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarDays, setCalendarDays] = useState([]);

  // Initial load - fetch current month data
  useEffect(() => {
    const controller = new AbortController();
    dashboardWidgetAPI.get(null, null, controller.signal)
      .then((res) => {
        setData(res.data);
        setCalendarDays(res.data?.calendar?.days || []);
      })
      .catch((err) => {
        // silently ignore non-cancel errors
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  // Fetch calendar data when month changes (only if different from initial)
  useEffect(() => {
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    if (calendarMonth === currentMonth && calendarYear === currentYear) {
      // Use initial data
      if (data?.calendar?.days) setCalendarDays(data.calendar.days);
      return;
    }

    const controller = new AbortController();
    setCalendarLoading(true);
    dashboardWidgetAPI.get(calendarMonth, calendarYear, controller.signal)
      .then((res) => {
        setCalendarDays(res.data?.calendar?.days || []);
      })
      .catch(() => {
        // silently ignore calendar fetch errors
      })
      .finally(() => setCalendarLoading(false));
    return () => controller.abort();
  }, [calendarMonth, calendarYear]);

  // Enrollment date for navigation bounds
  const enrollmentDate = useMemo(() => {
    if (data?.calendar?.enrollmentDate) return new Date(data.calendar.enrollmentDate);
    return null;
  }, [data?.calendar?.enrollmentDate]);

  const canGoPrevious = useMemo(() => {
    if (!enrollmentDate) return false;
    const eMonth = enrollmentDate.getMonth() + 1;
    const eYear = enrollmentDate.getFullYear();
    if (calendarYear > eYear) return true;
    if (calendarYear === eYear && calendarMonth > eMonth) return true;
    return false;
  }, [enrollmentDate, calendarMonth, calendarYear]);

  const canGoNext = useMemo(() => {
    const cMonth = now.getMonth() + 1;
    const cYear = now.getFullYear();
    if (calendarYear < cYear) return true;
    if (calendarYear === cYear && calendarMonth < cMonth) return true;
    return false;
  }, [calendarMonth, calendarYear]);

  const handlePrevMonth = useCallback(() => {
    if (!canGoPrevious) return;
    if (calendarMonth === 1) {
      setCalendarMonth(12);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  }, [calendarMonth, canGoPrevious]);

  const handleNextMonth = useCallback(() => {
    if (!canGoNext) return;
    if (calendarMonth === 12) {
      setCalendarMonth(1);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  }, [calendarMonth, canGoNext]);

  return (
    <div className="space-y-3">
      <ScoreCard stats={data?.stats} isLoading={loading} />
      <StreakCard streak={data?.streak} isLoading={loading} />
      <ConsistencyCalendar
        days={calendarDays}
        month={calendarMonth}
        year={calendarYear}
        onPreviousMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        isLoading={loading || calendarLoading}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
      />
      <RankWidget rankData={data?.rank} isLoading={loading} />
    </div>
  );
};

export default DashboardSidebar;
