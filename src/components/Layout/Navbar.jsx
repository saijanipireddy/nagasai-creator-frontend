import { useState } from 'react';
import { FaBell, FaUserCircle, FaBars } from 'react-icons/fa';

const Navbar = ({ onToggleSidebar }) => {
  const [notifications] = useState(3);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-dark-sidebar border-b border-dark-secondary z-50">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left Section - Logo & Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-dark-secondary transition-colors lg:hidden"
          >
            <FaBars className="text-xl" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-dark-accent to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-dark-accent/20">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-dark-accent to-purple-500 bg-clip-text text-transparent">
                Naga sai J
              </span>
              <p className="text-xs text-dark-muted -mt-1">Learning Platform</p>
            </div>
          </div>
        </div>

        {/* Right Section - Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-dark-secondary transition-colors">
            <FaBell className="text-xl" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-dark-accent rounded-full text-xs flex items-center justify-center font-medium">
                {notifications}
              </span>
            )}
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-secondary transition-colors cursor-pointer">
            <FaUserCircle className="text-2xl text-dark-accent" />
            <div className="hidden sm:block">
              <p className="text-sm font-medium">Student</p>
              <p className="text-xs text-dark-muted">Free Learning</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
