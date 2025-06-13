
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { TenantsPage } from './pages/TenantsPage';
import { RoomsPage } from './pages/RoomsPage';
import { HomeIcon, UsersIcon, BuildingOfficeIcon, CogIcon } from './components/Icons'; // Assuming CogIcon for future settings

const App: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <HomeIcon className="w-5 h-5 mr-2" /> },
    { path: '/tenants', label: 'Tenants', icon: <UsersIcon className="w-5 h-5 mr-2" /> },
    { path: '/rooms', label: 'Rooms', icon: <BuildingOfficeIcon className="w-5 h-5 mr-2" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100">
      <header className="bg-slate-800/50 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500">
            Tenant Manager Pro
          </h1>
          <nav className="flex space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out
                  ${location.pathname === item.path 
                    ? 'bg-sky-500 text-white shadow-md' 
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tenants" element={<TenantsPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
        </Routes>
      </main>

      <footer className="bg-slate-800/30 text-center p-4 text-sm text-gray-400 border-t border-slate-700">
        © {new Date().getFullYear()} Tenant Manager Pro. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
