import React, {
  createContext,
  useContext,
  useState,
  useCallback
} from 'react';

import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Clock,
  CheckCheck
} from 'lucide-react';

import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const addNotification = useCallback(
    (message, type = 'info') => {
      const id = Math.random()
        .toString(36)
        .substr(2, 9);

      const newNotification = {
        id,
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false
      };

      setNotifications((prev) => [
        newNotification,
        ...prev
      ]);

      /* Toast UI */

      const baseStyle = {
        borderRadius: '20px',
        padding: '16px 18px',
        background: '#ffffff',
        color: '#0f172a',
        border: '1px solid #e2e8f0',
        fontWeight: '600',
        boxShadow:
          '0 10px 30px rgba(15,23,42,0.08)'
      };

      if (type === 'success') {
        toast.success(message, {
          style: {
            ...baseStyle,
            border: '1px solid #bbf7d0',
            background: '#f0fdf4',
            color: '#166534'
          }
        });
      } else if (type === 'error') {
        toast.error(message, {
          style: {
            ...baseStyle,
            border: '1px solid #fecaca',
            background: '#fef2f2',
            color: '#991b1b'
          }
        });
      } else {
        toast(message, {
          style: {
            ...baseStyle
          },
          icon: '🔔'
        });
      }
    },
    []
  );

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notif) => ({
        ...notif,
        read: true
      }))
    );
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id
          ? { ...notif, read: true }
          : notif
      )
    );
  }, []);

  const unreadCount = notifications.filter(
    (n) => !n.read
  ).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAllAsRead,
        markAsRead,
        unreadCount
      }}
    >
      {/* APP CONTENT */}
      {children}

      {/* FLOATING BUTTON */}

      <button
        onClick={() =>
          setIsPanelOpen(!isPanelOpen)
        }
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-[24px] bg-slate-900 hover:bg-slate-800 text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105"
      >

        <Bell className="w-7 h-7" />

        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 min-w-[28px] h-7 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center px-2 border-4 border-white">

            {unreadCount}

          </div>
        )}
      </button>

      {/* PANEL */}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[430px] bg-white border-l border-slate-200 shadow-2xl z-50 transition-all duration-500 ${
          isPanelOpen
            ? 'translate-x-0'
            : 'translate-x-full'
        }`}
      >

        {/* Header */}

        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-5 z-10">

          <div className="flex items-center justify-between mb-4">

            <div>

              <h2 className="text-2xl font-black text-slate-900">

                Notifications

              </h2>

              <p className="text-slate-500 text-sm mt-1">

                Real-time updates and alerts

              </p>
            </div>

            <button
              onClick={() =>
                setIsPanelOpen(false)
              }
              className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
            >

              <X className="w-5 h-5 text-slate-700" />

            </button>

          </div>

          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-all"
            >

              <CheckCheck className="w-4 h-4" />

              Mark all as read

            </button>
          )}
        </div>

        {/* Notification List */}

        <div className="overflow-y-auto h-[calc(100%-110px)] px-5 py-5 space-y-4 bg-[#F8FAFC]">

          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">

              <div className="w-24 h-24 rounded-[32px] bg-white border border-slate-200 flex items-center justify-center mb-6 shadow-sm">

                <Bell className="w-12 h-12 text-slate-300" />

              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-3">

                No Notifications

              </h3>

              <p className="text-slate-500 leading-relaxed">

                All updates and supply chain alerts
                will appear here.

              </p>

            </div>
          ) : (
            notifications.map((notif) => {
              const typeStyles = {
                success: {
                  icon: (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ),
                  bg: 'bg-emerald-100'
                },
                error: {
                  icon: (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  ),
                  bg: 'bg-red-100'
                },
                info: {
                  icon: (
                    <Info className="w-6 h-6 text-blue-600" />
                  ),
                  bg: 'bg-blue-100'
                }
              };

              const currentStyle =
                typeStyles[notif.type] ||
                typeStyles.info;

              return (
                <div
                  key={notif.id}
                  onClick={() =>
                    markAsRead(notif.id)
                  }
                  className={`bg-white border rounded-[28px] p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ${
                    notif.read
                      ? 'border-slate-200 opacity-75'
                      : 'border-emerald-200'
                  }`}
                >

                  <div className="flex gap-4">

                    {/* Icon */}

                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${currentStyle.bg}`}
                    >

                      {currentStyle.icon}

                    </div>

                    {/* Content */}

                    <div className="flex-1">

                      <div className="flex items-start justify-between gap-4 mb-2">

                        <div>

                          <h4 className="text-base font-bold text-slate-900">

                            {notif.type ===
                            'success'
                              ? 'Success Update'
                              : notif.type ===
                                'error'
                              ? 'Alert'
                              : 'Notification'}

                          </h4>

                          {!notif.read && (
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-slate-400 text-xs shrink-0">

                          <Clock className="w-3 h-3" />

                          {new Date(
                            notif.timestamp
                          ).toLocaleDateString()}

                        </div>
                      </div>

                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">

                        {notif.message}

                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context =
    useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }

  return context;
};