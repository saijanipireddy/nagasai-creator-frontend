import { useState, useRef, useEffect } from 'react';
import { FaBell, FaBars, FaSignOutAlt, FaChevronDown, FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onToggleSidebar }) => {
  const [notifications] = useState(3);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = (user?.name || 'S')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="fixed top-0 left-0 right-0 h-[72px] bg-white border-b border-gray-100 z-50">
      <div className="flex items-center justify-between h-full px-5 lg:px-8">
        {/* Left — Logo & Toggle */}
        <div className="flex items-center gap-5">
          <button
            onClick={onToggleSidebar}
            className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors lg:hidden text-gray-500"
          >
            <FaBars className="text-xl" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/20">
              <span className="text-white font-extrabold text-lg tracking-tight">N</span>
            </div>
            <span className="hidden sm:block text-xl font-extrabold text-gray-900 tracking-tight">NS</span>
          </div>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button className="relative p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600">
            <FaBell className="text-xl" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold ring-2 ring-white">
                {notifications}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="hidden sm:block w-px h-9 bg-gray-200 mx-1" />

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className={`flex items-center gap-3 py-2 px-2.5 pr-4 rounded-xl transition-colors ${profileOpen ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
            >
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-base font-bold">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name || 'Student'}</p>
                <p className="text-xs text-gray-400 leading-tight mt-0.5">Student</p>
              </div>
              <FaChevronDown className={`hidden sm:block text-xs text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-xl shadow-black/8 border border-gray-100 overflow-hidden animate-fadeIn">
                <div className="px-5 py-4 bg-gray-50/50">
                  <p className="text-base font-bold text-gray-900">{user?.name || 'Student'}</p>
                  <p className="text-sm text-gray-400 mt-1">{user?.email || 'student@example.com'}</p>
                </div>
                <div className="py-2 px-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                    <FaUser className="text-gray-400 text-base" />
                    My Profile
                  </button>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <FaSignOutAlt className="text-base" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
