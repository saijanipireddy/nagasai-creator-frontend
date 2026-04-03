import { useState, useRef, useEffect } from 'react';
import { FaBars, FaBell, FaSignOutAlt, FaExclamationTriangle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { announcementAPI } from '../../services/api';

const Navbar = ({ onToggleSidebar }) => {
  const { student, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    announcementAPI.getStudentAnnouncements()
      .then(res => setUnreadCount(res.data.unreadCount || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!showLogoutModal) return;
    const handleClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowLogoutModal(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showLogoutModal]);

  useEffect(() => {
    if (!showLogoutModal) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setShowLogoutModal(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showLogoutModal]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-[60px] sm:h-[72px] bg-white z-50 border-b border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between h-full px-3 sm:px-4 lg:px-6">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleSidebar}
              className="p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200 lg:hidden text-gray-500 hover:text-gray-700"
              aria-label="Toggle sidebar"
            >
              <FaBars className="text-lg" />
            </button>

            <Link to="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20">
                  <span className="text-white font-extrabold text-base sm:text-lg">L</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-gray-800 font-bold text-lg leading-tight tracking-tight">LearnFast</h1>
                <p className="text-amber-600 text-[10px] font-semibold tracking-widest uppercase">Learning Platform</p>
              </div>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/announcements')}
              className="relative p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200 text-gray-500 hover:text-gray-700"
              title="Announcements"
            >
              <FaBell className="text-lg" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full ring-2 ring-white px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <div className="w-px h-8 bg-gray-200 mx-1.5 hidden sm:block" />

            <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {student?.name?.charAt(0)?.toUpperCase() || 'S'}
                </span>
              </div>
              <span className="text-gray-700 text-sm font-medium hidden sm:block">
                {student?.name || 'Student'}
              </span>
            </div>

            {/* Logout button */}
            <div className="relative">
              <button
                onClick={() => setShowLogoutModal(prev => !prev)}
                className="p-2.5 rounded-lg hover:bg-red-50 transition-all duration-200 text-gray-400 hover:text-red-500"
                title="Logout"
              >
                <FaSignOutAlt className="text-lg" />
              </button>

              {/* Logout dropdown modal */}
              {showLogoutModal && (
                <div
                  ref={modalRef}
                  className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-5 animate-fadeIn z-50"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaExclamationTriangle className="text-red-500 text-base" />
                    </div>
                    <div>
                      <h3 className="text-gray-800 font-semibold text-sm">Sign Out</h3>
                      <p className="text-gray-500 text-xs mt-0.5">Are you sure you want to logout?</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowLogoutModal(false)}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowLogoutModal(false);
                        logout();
                      }}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 shadow-sm"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
