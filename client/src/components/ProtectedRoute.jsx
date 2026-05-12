import React from 'react';

import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import {
  Loader2,
  ShieldCheck
} from 'lucide-react';

const ProtectedRoute = ({
  children,
  allowedRoles
}) => {
  const {
    user,
    role,
    loading
  } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center overflow-hidden relative">

        {/* Background Glow */}

        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-40" />

        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-40" />

        {/* Card */}

        <div className="relative bg-white border border-slate-200 rounded-[36px] px-12 py-14 shadow-sm flex flex-col items-center max-w-md w-full">

          {/* Icon */}

          <div className="relative mb-8">

            <div className="w-24 h-24 rounded-[32px] bg-emerald-100 flex items-center justify-center">

              <ShieldCheck className="w-12 h-12 text-emerald-600" />

            </div>

            <div className="absolute inset-0 rounded-[32px] border-[3px] border-emerald-200 border-t-emerald-500 animate-spin" />

          </div>

          {/* Heading */}

          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-3">

            Secure Access

          </h1>

          <p className="text-slate-500 text-center leading-relaxed mb-8">

            Verifying authentication and checking
            protected route permissions.

          </p>

          {/* Loader */}

          <div className="flex items-center gap-3 text-emerald-600 font-semibold">

            <Loader2 className="w-5 h-5 animate-spin" />

            Loading Secure Session...

          </div>

        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (
    allowedRoles &&
    role &&
    !allowedRoles.includes(role)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;