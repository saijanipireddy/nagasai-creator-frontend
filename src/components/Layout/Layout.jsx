import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);
  const handleToggleCollapse = useCallback(() => setSidebarCollapsed(prev => !prev), []);

  return (
    <div className="h-screen overflow-hidden bg-dark-bg">
      <Navbar onToggleSidebar={handleToggleSidebar} />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <main
        className={`mt-[72px] h-[calc(100vh-72px)] overflow-hidden relative transition-all duration-300
          ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}
      >
        <div className="p-4 md:p-6 h-full overflow-y-auto">
          <Outlet context={{ setSidebarCollapsed, sidebarCollapsed }} />
        </div>
      </main>
    </div>
  );
};

export default Layout;
