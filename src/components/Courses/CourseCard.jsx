import { Link } from 'react-router-dom';
import { FaHtml5, FaCss3Alt, FaJs, FaNodeJs, FaReact, FaPlay, FaBook, FaPython, FaJava, FaDatabase, FaGitAlt, FaDocker, FaAws, FaLinux } from 'react-icons/fa';
import { SiExpress, SiMongodb } from 'react-icons/si';

const iconMap = {
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaNodeJs,
  FaReact,
  SiExpress,
  SiMongodb,
  FaPython,
  FaJava,
  FaDatabase,
  FaGitAlt,
  FaDocker,
  FaAws,
  FaLinux,
  FaBook
};

const CourseCard = ({ course }) => {
  const Icon = iconMap[course.icon] || FaBook;
  const courseId = course._id || course.id;

  return (
    <Link
      to={`/course/${courseId}`}
      className="bg-dark-card rounded-xl border border-dark-secondary hover:border-dark-accent/50 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-dark-accent/10 group"
    >
      {/* Icon Header */}
      <div
        className="h-32 flex items-center justify-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${course.color}15, ${course.color}30)` }}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `radial-gradient(circle at center, ${course.color}20, transparent 70%)` }}
        />
        <Icon
          className="text-6xl group-hover:scale-110 transition-transform duration-300 relative z-10"
          style={{ color: course.color }}
        />

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-dark-accent/90 flex items-center justify-center shadow-lg">
            <FaPlay className="text-white text-sm ml-0.5" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 group-hover:text-dark-accent transition-colors">{course.name}</h3>
        <p className="text-dark-muted text-sm mb-4 line-clamp-2">{course.description}</p>

        {/* Topic Count */}
        <div className="flex items-center justify-between">
          <span className="text-xs px-3 py-1 rounded-full bg-dark-secondary text-dark-muted">
            {course.totalTopics || 0} topics
          </span>
          {course.isPublished ? (
            <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-500">
              Available
            </span>
          ) : (
            <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500">
              Coming Soon
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
