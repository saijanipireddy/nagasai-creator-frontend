import { memo } from 'react';
import { Link } from 'react-router-dom';
import { FaHtml5, FaCss3Alt, FaJs, FaNodeJs, FaReact, FaArrowRight, FaBook, FaPython, FaJava, FaDatabase, FaGitAlt, FaDocker, FaAws, FaLinux, FaCheckCircle } from 'react-icons/fa';
import { SiExpress, SiMongodb } from 'react-icons/si';

const iconMap = {
  FaHtml5, FaCss3Alt, FaJs, FaNodeJs, FaReact, SiExpress, SiMongodb,
  FaPython, FaJava, FaDatabase, FaGitAlt, FaDocker, FaAws, FaLinux, FaBook
};

const CourseCard = ({ course, index = 0 }) => {
  const Icon = iconMap[course.icon] || FaBook;
  const courseId = course._id || course.id;
  const progress = course.progress || 0;
  const completedTopics = course.completedTopics || 0;
  const totalTopics = course.totalTopics || 0;
  const isComplete = progress === 100 && totalTopics > 0;

  return (
    <Link
      to={`/course/${courseId}`}
      className="group bg-white rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 ring-1 ring-slate-100"
    >
      {/* Top section */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-all duration-300 shrink-0">
          <Icon className="text-lg text-indigo-500 group-hover:text-indigo-600 transition-colors duration-300" />
        </div>
        {isComplete ? (
          <FaCheckCircle className="text-sm text-emerald-500" />
        ) : progress > 0 ? (
          <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
            {progress}%
          </span>
        ) : null}
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <p className="text-[9px] font-semibold text-indigo-500 uppercase tracking-wider mb-1">COURSE</p>
        <h3 className="font-bold text-slate-900 text-sm mb-1.5 group-hover:text-indigo-600 transition-colors leading-tight">
          {course.name}
        </h3>
        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-3">
          {course.description}
        </p>

        {/* Progress bar */}
        {totalTopics > 0 && (
          <div className="mb-3">
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isComplete ? 'bg-emerald-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[10px] font-semibold text-slate-500">
            {completedTopics}/{totalTopics} topics
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-500 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            {progress > 0 ? 'Continue' : 'Start Learning'}
            <FaArrowRight className="text-[8px]" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default memo(CourseCard);
