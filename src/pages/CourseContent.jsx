import { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaBook, FaLock } from 'react-icons/fa';
import CourseCard from '../components/Courses/CourseCard';
import { enrollmentAPI } from '../services/api';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const CourseContent = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const fetchCourses = async () => {
      try {
        const { data } = await enrollmentAPI.getMyCourses(controller.signal);
        if (!cancelled) {
          setCourses(data);
          setLoading(false);
        }
      } catch (error) {
        if (cancelled || error.name === 'CanceledError' || error.name === 'AbortError') return;
        setLoading(false);
      }
    };
    fetchCourses();
    return () => { cancelled = true; controller.abort(); };
  }, []);

  const filteredCourses = useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase();
    if (!query) return courses;
    return courses.filter((course) =>
      course.name.toLowerCase().includes(query) ||
      (course.description && course.description.toLowerCase().includes(query))
    );
  }, [courses, debouncedSearchQuery]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-shimmer h-32 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => <div key={i} className="animate-shimmer h-[300px] rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Courses</h1>
          <p className="text-slate-500 text-base mt-1">
            {courses.length > 0
              ? `${courses.length} course${courses.length > 1 ? 's' : ''} enrolled`
              : 'No courses enrolled yet'}
          </p>
        </div>
        {courses.length > 0 && (
          <div className="relative w-full sm:w-80">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all placeholder-slate-400 shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course, index) => (
            <CourseCard key={course._id} course={course} index={index} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl">
          <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center mx-auto mb-4">
            <FaLock className="text-xl text-indigo-400" />
          </div>
          <p className="text-slate-900 text-lg font-bold">No courses available</p>
          <p className="text-slate-500 text-sm mt-1">You haven't been enrolled in any courses yet. Contact your admin for access.</p>
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-500 text-lg">No courses found for "<span className="font-semibold text-slate-700">{searchQuery}</span>"</p>
          <button onClick={() => setSearchQuery('')} className="mt-4 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
            Clear search
          </button>
        </div>
      )}

      {/* Learning Path */}
      {courses.length > 0 && (
        <div className="bg-white rounded-2xl p-7 md:p-8 shadow-md shadow-slate-200/60 ring-1 ring-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Learning Path</h2>
              <p className="text-slate-500 text-sm mt-1">Follow this recommended order to become a Full Stack Developer</p>
            </div>
            <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full shrink-0">
              {courses.length} steps
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {courses.map((course, index) => (
              <div key={course._id} className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-colors duration-200 cursor-default">
                  <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-slate-700">{course.name}</span>
                </div>
                {index < courses.length - 1 && (
                  <div className="w-6 h-[2px] bg-indigo-200 rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseContent;
