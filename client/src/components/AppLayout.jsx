import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ChatbotWidget from './ChatbotWidget';
import { 
  Menu, X, LogOut, Bell, Zap, Package, Plus, ListOrdered, 
  Search, User, ScanLine, LayoutDashboard, Boxes, 
  AlertTriangle, ClipboardList 
} from 'lucide-react';

const AppLayout = () => {
  const { user, role, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine current page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/products') || path === '/dashboard/farmer/products') return 'Products';
    if (path.includes('/register')) return 'Register Product';
    if (path.includes('/events')) return 'All Events';
    if (path.includes('/search')) return 'Search Product';
    if (path.includes('/profile')) return 'My Profile';
    if (path.includes('/scan')) return 'Scan & Log';
    if (path.includes('/overview')) return 'Overview';
    if (path.includes('/alerts')) return 'Alerts Center';
    if (path.includes('/product/')) return 'Product Detail';
    return 'Dashboard';
  };

  const farmerLinks = [
    { to: '/dashboard/farmer/products', icon: Package, label: 'My Products' },
    { to: '/dashboard/farmer/register', icon: Plus, label: 'Register Product' },
    { to: '/dashboard/events', icon: ListOrdered, label: 'My Events' },
    { to: '/dashboard/search', icon: Search, label: 'Search Product' },
    { to: '/dashboard/profile', icon: User, label: 'My Profile' },
  ];

  const supplyLinks = [
    { to: '/dashboard/scan', icon: ScanLine, label: 'Scan & Log' },
    { to: '/dashboard/events', icon: ListOrdered, label: 'My Events' },
    { to: '/dashboard/search', icon: Search, label: 'Search Product' },
    { to: '/dashboard/profile', icon: User, label: 'My Profile' },
  ];

  const adminLinks = [
    { to: '/dashboard/admin/overview', icon: LayoutDashboard, label: 'Overview' },
    { to: '/dashboard/admin/products', icon: Boxes, label: 'All Products' },
    { to: '/dashboard/admin/alerts', icon: AlertTriangle, label: 'Alerts Center' },
    { to: '/dashboard/admin/events', icon: ClipboardList, label: 'All Events' },
    { to: '/dashboard/profile', icon: User, label: 'My Profile' },
  ];

  let links = [];
  if (role === 'farmer') links = farmerLinks;
  else if (role === 'admin') links = adminLinks;
  else links = supplyLinks;

  const closeSidebar = () => setSidebarOpen(false);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = user?.user_metadata?.display_name || user?.email || 'User';

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64">
      {/* Top section */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <Zap className="w-6 h-6 text-orange-500 mr-2" />
        <span className="text-xl font-bold text-gray-900">TraceChain</span>
      </div>

      {/* Middle section (nav links) */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? 'border-l-4 border-orange-500 bg-orange-50 text-orange-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <link.icon className="w-5 h-5 mr-3" />
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* Bottom section */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold shrink-0">
            {getInitials(displayName)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
            <span className="inline-block px-3 py-0.5 mt-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {role}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] text-gray-900 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        {SidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 z-50 md:hidden shadow-2xl bg-white"
            >
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="mr-4 md:hidden p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 truncate font-poppins">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-900 transition-colors">
              <Bell className="w-5 h-5" />
              {/* Fake notification badge for design */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <span className="text-sm font-medium text-gray-500 hidden sm:block truncate max-w-[150px]">
              {user?.email}
            </span>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
      
      {/* Global Chatbot for Dashboard */}
      <ChatbotWidget />
    </div>
  );
};

export default AppLayout;
