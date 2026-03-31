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
    <div className="h-screen overflow-hidden bg-[#f9fafb]">
      <Navbar onToggleSidebar={handleToggleSidebar} />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <main
        className={`mt-[72px] h-[calc(100vh-72px)] overflow-hidden relative transition-all duration-300
          ${sidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-72'}`}
      >
        <div className="h-full overflow-y-auto p-5 md:p-6">
          <Outlet context={{ setSidebarCollapsed, sidebarCollapsed }} />
        </div>
      </main>
    </div>
  );
};

export default Layout;
