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

  return (
    <Link
      to={`/course/${courseId}`}
      className="group bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-md shadow-slate-200/60 hover:shadow-xl hover:shadow-slate-300/50 ring-1 ring-slate-100"
    >
      {/* Top section - icon left, decorative pattern right */}
      <div className="flex items-start justify-between p-6 pb-4">
        <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-all duration-300 shrink-0">
          <Icon className="text-2xl text-indigo-500 group-hover:text-indigo-600 transition-colors duration-300" />
        </div>
        <FaCheckCircle className="text-xl text-emerald-500" />
      </div>

      {/* Content */}
      <div className="px-6 pb-6">
        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1.5">COURSE</p>
        <h3 className="font-bold text-slate-900 text-xl mb-2 group-hover:text-indigo-600 transition-colors leading-tight">
          {course.name}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-5">
          {course.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500">
            {course.totalTopics || 0} topics
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-500 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            Start Learning
            <FaArrowRight className="text-[10px]" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default memo(CourseCard);
