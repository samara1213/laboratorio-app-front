// LayoutDashboard.jsx
import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function LayoutDashboard({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleSidebarOpen = () => setSidebarOpen(true);
  const handleSidebarClose = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-[#29313B]">
      <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />
      <main className="flex-1 bg-gray-100 min-h-screen">
        <Topbar onMenuClick={handleSidebarOpen} />
        <section className="p-6">
          {children}
        </section>
      </main>
    </div>
  );
}
