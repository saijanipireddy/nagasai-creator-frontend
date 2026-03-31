import { NavLink } from 'react-router-dom';
import { FaHome, FaBook, FaCode, FaBriefcase, FaTimes, FaChevronLeft, FaQuestionCircle, FaUser, FaTrophy } from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const navItems = [
    { path: '/', icon: FaHome, label: 'Dashboard', color: 'from-amber-500 to-orange-500' },
    { path: '/courses', icon: FaBook, label: 'Courses', color: 'from-amber-400 to-amber-500' },
    { path: '/leaderboard', icon: FaTrophy, label: 'Leaderboard', color: 'from-yellow-500 to-amber-500' },
    { path: '/jobs', icon: FaBriefcase, label: 'Jobs Board', color: 'from-emerald-500 to-emerald-600' },
    { path: '/playground', icon: FaCode, label: 'Playground', color: 'from-orange-500 to-orange-600' },
    { path: '/profile', icon: FaUser, label: 'My Profile', color: 'from-gray-500 to-gray-600' }
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-[72px] left-0 h-[calc(100vh-72px)] bg-gray-800 z-40 transition-all duration-300 flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-[80px]' : 'w-60'}`}
      >
        {/* Close for mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-lg hover:bg-white/10 transition-colors lg:hidden text-gray-400 hover:text-white"
        >
          <FaTimes className="text-base" />
        </button>

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3.5 top-8 w-7 h-7 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-amber-500 hover:border-amber-500 transition-all duration-200 group shadow-sm"
        >
          <FaChevronLeft className={`text-[10px] text-gray-500 group-hover:text-white transition-all duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Navigation */}
        <nav className="px-3 pt-8 flex-1 overflow-y-auto scrollbar-hidden" aria-label="Main navigation">
          {!isCollapsed && (
            <p className="px-3 mb-4 text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Menu</p>
          )}
          <ul className="space-y-1.5">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => `
                    relative flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group
                    ${isActive
                      ? 'bg-amber-500/15 text-white'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}
                    ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}
                  `}
                  onClick={onClose}
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-amber-500 rounded-r-full" />
                      )}

                      {/* Icon with background */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                        isActive
                          ? `bg-gradient-to-br ${item.color} shadow-lg shadow-amber-500/15`
                          : 'bg-gray-700/60 group-hover:bg-gray-700'
                      }`}>
                        <item.icon className={`text-base ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`} />
                      </div>

                      {/* Label */}
                      <div className={`${isCollapsed ? 'lg:hidden' : ''}`}>
                        <span className="text-sm font-semibold">{item.label}</span>
                      </div>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className={`px-3 pb-6 ${isCollapsed ? 'lg:px-3' : ''}`}>
          <div className={`border-t border-gray-700/50 pt-5 ${isCollapsed ? 'lg:flex lg:justify-center' : ''}`}>
            <button className={`flex items-center gap-4 px-3 py-3 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all duration-200 w-full ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}`}>
              <FaQuestionCircle className="text-base flex-shrink-0" />
              <span className={`text-sm font-medium ${isCollapsed ? 'lg:hidden' : ''}`}>Help & Support</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
