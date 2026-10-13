import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ErrorBoundary from '../common/ErrorBoundary';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lockLayout, setLockLayout] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
      {/* Sidebar - Completely hidden when in locked exam mode */}
      {!lockLayout && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

      {/* Main Area - Expands to full screen without sidebar padding when in locked exam mode */}
      <div className={`flex-1 min-w-0 ${lockLayout ? '' : 'lg:pl-64'} flex flex-col min-h-screen transition-all duration-200`}>
        {/* Header - Completely hidden when in locked exam mode */}
        {!lockLayout && <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />}

        <main className={`flex-1 p-3 xs:p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto ${lockLayout ? 'pt-3 sm:pt-6' : ''}`}>
          <ErrorBoundary>
            <Outlet context={{ setLockLayout }} />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
