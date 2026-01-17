import { useState, useEffect, useMemo, useCallback } from 'react';
import { FaSearch, FaBook } from 'react-icons/fa';
import CourseCard from '../components/Courses/CourseCard';
import { courseAPI } from '../services/api';
import { CourseContentSkeleton } from '../components/Loaders/Skeleton';

// Custom debounce hook for search optimization
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const CourseContent = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce search query by 300ms to reduce filtering on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await courseAPI.getAll();
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Memoize filtered courses to prevent unnecessary recalculations
  const filteredCourses = useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase();
    if (!query) return courses;

    return courses.filter((course) => {
      return course.name.toLowerCase().includes(query) ||
             (course.description && course.description.toLowerCase().includes(query));
    });
  }, [courses, debouncedSearchQuery]);

  if (loading) {
    return <CourseContentSkeleton />;
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Course Content</h1>
          <p className="text-dark-muted">Explore all available courses and start learning</p>
        </div>

        {/* Stats Pills */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 bg-dark-card rounded-full text-sm border border-dark-secondary">
            <span className="text-dark-accent font-medium">{courses.length}</span> Total Courses
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" />
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-dark-card border border-dark-secondary rounded-xl focus:outline-none focus:border-dark-accent transition-colors text-dark-text placeholder-dark-muted"
        />
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 bg-dark-card rounded-xl border border-dark-secondary">
          <FaBook className="text-6xl text-dark-muted mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No courses available yet</h3>
          <p className="text-dark-muted">Courses will appear here once added by the admin.</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-dark-muted text-lg">No courses found matching "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-4 text-dark-accent hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Learning Path */}
      {courses.length > 0 && (
        <div className="bg-gradient-to-r from-dark-accent/10 via-purple-600/10 to-blue-600/10 rounded-2xl p-6 border border-dark-accent/20">
          <h2 className="text-xl font-bold mb-2">Recommended Learning Path</h2>
          <p className="text-dark-muted mb-4">Follow this path to become a Full Stack Developer</p>
          <div className="flex flex-wrap items-center gap-2">
            {courses.map((course, index) => (
              <div key={course._id} className="flex items-center">
                <span
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: `${course.color}20`, color: course.color }}
                >
                  {course.name}
                </span>
                {index < courses.length - 1 && (
                  <span className="mx-2 text-dark-muted">→</span>
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
