import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ChatbotWidget from './ChatbotWidget';
import { useNotifications } from '../context/NotificationContext';
import { 
  Menu, X, LogOut, Bell, Zap, Package, Plus, ListOrdered, 
  Search, User, ScanLine, LayoutDashboard, Boxes, 
  AlertTriangle, ClipboardList, CheckCircle, Info, ShieldCheck
} from 'lucide-react';

const AppLayout = () => {
  const { user, role, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
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
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full bg-white border-r border-slate-100 w-64 shadow-xl shadow-slate-200/50"
    >
      {/* Top section: Logo */}
      <div className="h-20 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-black text-slate-900 tracking-tight">TraceChain</span>
        </div>
      </div>

      {/* Middle section (nav links) */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-2xl font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon className={`mr-3 w-4.5 h-4.5 transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                }`} size={18} />
                <span className="text-sm">{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom section: User Card */}
      <div className="p-4 mt-auto border-t border-slate-100">
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm">
                {getInitials(displayName)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
              <span className="inline-block px-2 py-0.5 mt-0.5 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                {role}
              </span>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-slate-400 font-semibold text-xs hover:text-red-500 hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-100"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
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
              className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
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
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="mr-1 md:hidden p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative" ref={notifRef}>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-200"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </motion.button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white rounded-[24px] shadow-2xl shadow-slate-900/10 border border-slate-100 overflow-hidden z-50 origin-top-right"
                  >
                    <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                      <h3 className="font-black text-slate-900 text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-[9px] uppercase font-black text-emerald-600 hover:text-emerald-700 tracking-widest bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center">
                          <Bell className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No notifications yet</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-50">
                          {notifications.slice(0, 10).map((notif) => (
                            <div 
                              key={notif.id}
                              onClick={() => !notif.read && markAsRead(notif.id)}
                              className={`p-4 flex gap-3 cursor-pointer transition-colors hover:bg-slate-50/50 ${!notif.read ? 'bg-emerald-50/30' : ''}`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {notif.type === 'success' ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                                ) : notif.type === 'warning' ? (
                                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                                ) : (
                                  <Info className="w-4 h-4 text-blue-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className={`text-xs leading-relaxed ${!notif.read ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                                  {notif.message}
                                </p>
                                <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-1.5">
                                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              {!notif.read && (
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-100">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{displayName}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{role}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs">
                {getInitials(displayName)}
              </div>
            </div>
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
