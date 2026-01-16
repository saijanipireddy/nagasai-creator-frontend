import { useState, useEffect } from 'react';
import { FaBook, FaPlay, FaCode, FaYoutube, FaArrowRight, FaRocket, FaLaptopCode, FaGraduationCap } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { courseAPI } from '../services/api';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCards, setVisibleCards] = useState([false, false, false]);

  useEffect(() => {
    fetchCourses();

    // Staggered animation for feature cards
    const timers = [
      setTimeout(() => setVisibleCards(prev => [true, prev[1], prev[2]]), 200),
      setTimeout(() => setVisibleCards(prev => [prev[0], true, prev[2]]), 400),
      setTimeout(() => setVisibleCards(prev => [prev[0], prev[1], true]), 600),
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-dark-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-card via-dark-sidebar to-dark-card border border-dark-secondary">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-dark-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative p-8 md:p-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-dark-accent rounded-lg flex items-center justify-center">
                <FaRocket className="text-white" />
              </div>
              <span className="text-dark-accent font-medium">Learn Full Stack Development</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Master Web Development
              <span className="text-dark-accent"> Step by Step</span>
            </h1>

            <p className="text-dark-muted text-lg mb-6 max-w-xl">
              Daily videos, presentations, practice questions, and coding challenges to help you become a full-stack developer.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-dark-accent px-6 py-3 rounded-xl hover:bg-dark-accent/80 transition-all font-medium shadow-lg shadow-dark-accent/25"
              >
                <FaPlay className="text-sm" />
                Start Learning
              </Link>
              <Link
                to="/playground"
                className="inline-flex items-center gap-2 bg-dark-secondary px-6 py-3 rounded-xl hover:bg-dark-secondary/80 transition-all font-medium"
              >
                <FaCode />
                Code Playground
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`bg-dark-card rounded-xl border border-dark-secondary p-6 hover:border-dark-accent/50 hover:scale-105 hover:-translate-y-1 transition-all duration-500 ease-out ${visibleCards[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
            <FaYoutube className={`text-red-500 text-xl ${visibleCards[0] ? 'animate-bounce' : ''}`} style={{ animationDuration: '1s', animationIterationCount: '2' }} />
          </div>
          <h3 className="font-bold text-lg mb-2">Video Tutorials</h3>
          <p className="text-dark-muted text-sm">Learn with detailed video explanations for every topic</p>
        </div>

        <div className={`bg-dark-card rounded-xl border border-dark-secondary p-6 hover:border-dark-accent/50 hover:scale-105 hover:-translate-y-1 transition-all duration-500 ease-out ${visibleCards[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
            <FaLaptopCode className={`text-blue-500 text-xl ${visibleCards[1] ? 'animate-bounce' : ''}`} style={{ animationDuration: '1s', animationIterationCount: '2' }} />
          </div>
          <h3 className="font-bold text-lg mb-2">Practice & Code</h3>
          <p className="text-dark-muted text-sm">Hands-on practice questions and coding challenges</p>
        </div>

        <div className={`bg-dark-card rounded-xl border border-dark-secondary p-6 hover:border-dark-accent/50 hover:scale-105 hover:-translate-y-1 transition-all duration-500 ease-out ${visibleCards[2] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
            <FaGraduationCap className={`text-purple-500 text-xl ${visibleCards[2] ? 'animate-bounce' : ''}`} style={{ animationDuration: '1s', animationIterationCount: '2' }} />
          </div>
          <h3 className="font-bold text-lg mb-2">Structured Learning</h3>
          <p className="text-dark-muted text-sm">Follow a clear path from beginner to advanced</p>
        </div>
      </div>

      {/* Learning Path / Courses */}
      <div className="bg-dark-card rounded-xl border border-dark-secondary p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Learning Path</h2>
            <p className="text-dark-muted text-sm">Follow the recommended order for best results</p>
          </div>
          <Link to="/courses" className="text-dark-accent text-sm hover:underline flex items-center gap-1">
            View All <FaArrowRight className="text-xs" />
          </Link>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {courses.map((course, index) => (
              <Link
                key={course._id}
                to={`/course/${course._id}`}
                className="group relative bg-dark-bg rounded-xl p-5 hover:bg-dark-secondary/50 transition-all border border-transparent hover:border-dark-accent/30"
              >
                {/* Order Badge */}
                <div
                  className="absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg"
                  style={{ backgroundColor: course.color }}
                >
                  {index + 1}
                </div>

                <div className="flex flex-col items-center text-center pt-2">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${course.color}20` }}
                  >
                    <FaBook className="text-2xl" style={{ color: course.color }} />
                  </div>
                  <h3 className="font-semibold mb-1">{course.name}</h3>
                  <p className="text-dark-muted text-xs">{course.totalTopics || 0} Topics</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-dark-muted">
            <FaBook className="text-5xl mx-auto mb-3 opacity-30" />
            <p className="font-medium">No courses available yet</p>
            <p className="text-sm">Courses will appear here once added</p>
          </div>
        )}
      </div>

      {/* Code Playground CTA */}
      <div className="bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-teal-600/20 rounded-xl border border-green-500/30 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center">
              <FaCode className="text-green-500 text-2xl" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Code Playground</h3>
              <p className="text-dark-muted text-sm">Practice HTML, CSS, JavaScript, Python & SQL in your browser</p>
            </div>
          </div>
          <Link
            to="/playground"
            className="inline-flex items-center gap-2 bg-green-500 px-5 py-2.5 rounded-lg hover:bg-green-600 transition-colors font-medium whitespace-nowrap"
          >
            <FaCode />
            Open Playground
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
