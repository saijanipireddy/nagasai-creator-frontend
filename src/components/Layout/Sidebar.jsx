import { NavLink } from 'react-router-dom';
import { FaHome, FaBook, FaCode, FaTimes, FaChevronLeft, FaQuestionCircle } from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const navItems = [
    { path: '/', icon: FaHome, label: 'Dashboard', color: 'from-indigo-500 to-indigo-600' },
    { path: '/courses', icon: FaBook, label: 'Courses', color: 'from-indigo-400 to-indigo-500' },
    { path: '/playground', icon: FaCode, label: 'Playground', color: 'from-indigo-500 to-indigo-600' }
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-20 left-0 h-[calc(100vh-5rem)] bg-slate-900 z-40 transition-all duration-300 flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-[80px]' : 'w-72'}`}
      >
        {/* Close for mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-lg hover:bg-white/10 transition-colors lg:hidden text-slate-500 hover:text-white"
        >
          <FaTimes className="text-base" />
        </button>

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3.5 top-8 w-7 h-7 bg-slate-800 border border-slate-700 rounded-full items-center justify-center hover:bg-indigo-500 hover:border-indigo-500 transition-all duration-200 group"
        >
          <FaChevronLeft className={`text-[10px] text-slate-400 group-hover:text-white transition-all duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Navigation */}
        <nav className="px-4 pt-8 flex-1" aria-label="Main navigation">
          {!isCollapsed && (
            <p className="px-3 mb-4 text-xs font-semibold text-slate-600 uppercase tracking-widest">Menu</p>
          )}
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => `
                    relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
                    ${isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-indigo-500/5 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'}
                    ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}
                  `}
                  onClick={onClose}
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-indigo-500 rounded-r-full" />
                      )}

                      {/* Icon with background */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                        isActive
                          ? `bg-gradient-to-br ${item.color} shadow-lg shadow-indigo-500/20`
                          : 'bg-slate-800 group-hover:bg-slate-700'
                      }`}>
                        <item.icon className={`text-lg ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      </div>

                      {/* Label */}
                      <div className={`${isCollapsed ? 'lg:hidden' : ''}`}>
                        <span className="text-base font-semibold">{item.label}</span>
                      </div>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className={`px-4 pb-6 ${isCollapsed ? 'lg:px-3' : ''}`}>
          <div className={`border-t border-slate-800 pt-5 ${isCollapsed ? 'lg:flex lg:justify-center' : ''}`}>
            <button className={`flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all duration-200 w-full ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}`}>
              <FaQuestionCircle className="text-lg flex-shrink-0" />
              <span className={`text-base font-medium ${isCollapsed ? 'lg:hidden' : ''}`}>Help & Support</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
