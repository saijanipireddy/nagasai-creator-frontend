import { FaBars, FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 z-50 shadow-lg shadow-slate-900/30">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2.5 rounded-xl hover:bg-white/10 transition-all duration-200 lg:hidden text-slate-400 hover:text-white"
            aria-label="Toggle sidebar"
          >
            <FaBars className="text-lg" />
          </button>

          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <span className="text-white font-extrabold text-lg">L</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-lg leading-tight tracking-tight">LearnFast</h1>
              <p className="text-indigo-400 text-[10px] font-semibold tracking-widest uppercase">Learning Platform</p>
            </div>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <button className="relative p-3 rounded-xl hover:bg-white/10 transition-all duration-200 text-slate-400 hover:text-white">
            <FaBell className="text-lg" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-slate-900" />
          </button>

          <div className="w-px h-9 bg-white/10 mx-1 hidden sm:block" />

          <button className="flex items-center gap-3 pl-1.5 pr-3.5 py-1.5 rounded-xl hover:bg-white/10 transition-all duration-200">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <span className="text-slate-300 text-sm font-medium hidden sm:block">Student</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
