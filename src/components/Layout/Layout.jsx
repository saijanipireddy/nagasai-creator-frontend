import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main
        className={`pt-16 min-h-screen transition-all duration-300
          ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}
      >
        <div className="p-4 md:p-6">
          <Outlet context={{ setSidebarCollapsed, sidebarCollapsed }} />
        </div>
      </main>
    </div>
  );
};

export default Layout;
