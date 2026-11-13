import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ activeTab, setActiveTab, children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'}
        `}
      >
        {/* Sticky Header */}
        <Header
          activeTab={activeTab}
          setIsMobileOpen={setIsMobileOpen}
          isCollapsed={isCollapsed}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-[#8b5cf6]/10 text-center text-xs text-gray-500 bg-[#0a0914]">
          Customer Segmentation Using Big Data Analytics • College Course Project • React 19 + Spark MLlib + MongoDB
        </footer>
      </div>
    </div>
  );
}

