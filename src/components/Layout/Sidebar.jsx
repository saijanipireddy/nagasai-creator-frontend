import { NavLink } from 'react-router-dom';
import { FaHome, FaBook, FaCode, FaTimes, FaChevronLeft } from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const navItems = [
    { path: '/', icon: FaHome, label: 'Dashboard' },
    { path: '/courses', icon: FaBook, label: 'Full Stack Course' },
    { path: '/playground', icon: FaCode, label: 'Code Playground' }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-dark-sidebar border-r border-dark-secondary z-40 transition-all duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'w-64'}`}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-dark-secondary transition-colors lg:hidden"
        >
          <FaTimes />
        </button>

        {/* Collapse toggle for desktop */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-dark-accent rounded-full items-center justify-center hover:bg-dark-accent/80 transition-colors shadow-lg"
        >
          <FaChevronLeft className={`text-xs transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Navigation */}
        <nav className="p-4 mt-8 lg:mt-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-4 p-3 rounded-xl transition-all duration-200
                    ${isActive
                      ? 'bg-dark-accent text-white shadow-lg shadow-dark-accent/20'
                      : 'hover:bg-dark-secondary text-dark-muted hover:text-white'}
                    ${isCollapsed ? 'lg:justify-center' : ''}
                  `}
                  onClick={onClose}
                >
                  <item.icon className="text-xl flex-shrink-0" />
                  <span className={`${isCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

      </aside>
    </>
  );
};

export default Sidebar;
