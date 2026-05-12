import React from 'react';
import { Link } from 'react-router-dom';

import {
  Leaf,
  Mail,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-white border-t border-slate-200 overflow-hidden">

      {/* Background Glow */}

      <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">

        {/* Top Section */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-14 mb-16">

          {/* Branding */}

          <div>

            <div className="flex items-center gap-4 mb-6">

              <div className="w-16 h-16 rounded-[24px] bg-emerald-100 flex items-center justify-center shadow-sm">

                <Leaf className="w-8 h-8 text-emerald-600" />

              </div>

              <div>

                <h2 className="text-3xl font-black tracking-tight text-slate-900">

                  TraceChain

                </h2>

                <p className="text-slate-500 text-sm mt-1">

                  Smart Food Supply Tracking

                </p>

              </div>
            </div>

            <p className="text-slate-500 leading-relaxed max-w-md">

              Ensuring transparent and trusted food
              supply chains using blockchain,
              AI-powered monitoring, and secure
              product verification.

            </p>

            {/* Trust Badge */}

            <div className="mt-8 inline-flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3">

              <ShieldCheck className="w-5 h-5 text-emerald-600" />

              <span className="text-sm font-semibold text-emerald-700">

                Blockchain Verified Platform

              </span>

            </div>
          </div>

          {/* Quick Links */}

          <div>

            <h3 className="text-lg font-black text-slate-900 mb-6">

              Quick Links

            </h3>

            <div className="space-y-4">

              {[
                {
                  label: 'Home',
                  href: '/'
                },
                {
                  label: 'Track Product',
                  href: '/scanner'
                },
                {
                  label: 'QR Scanner',
                  href: '/scanner'
                },
                {
                  label: 'Login / Portal',
                  href: '/auth'
                }
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="group flex items-center justify-between bg-[#F8FAFC] hover:bg-white border border-slate-200 rounded-2xl px-5 py-4 transition-all duration-300 hover:shadow-md"
                >

                  <span className="font-semibold text-slate-700 group-hover:text-slate-900">

                    {item.label}

                  </span>

                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-all" />

                </Link>
              ))}

            </div>
          </div>

          {/* Mission */}

          <div>

            <h3 className="text-lg font-black text-slate-900 mb-6">

              Our Mission

            </h3>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-[32px] p-6 mb-6">

              <p className="text-slate-600 leading-relaxed">

                Made with{' '}

                <span className="text-red-500">
                  ❤️
                </span>

                {' '}for food safety,
                transparency, and trusted
                supply chains in India.

              </p>
            </div>

            {/* Socials */}

            <div className="flex items-center gap-4">

              {/* Twitter */}

              <a
                href="#"
                className="w-14 h-14 rounded-2xl bg-white border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 transition-all flex items-center justify-center group shadow-sm"
              >

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-500 group-hover:text-emerald-600"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>

              </a>

              {/* LinkedIn */}

              <a
                href="#"
                className="w-14 h-14 rounded-2xl bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-center group shadow-sm"
              >

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-500 group-hover:text-blue-600"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>

              </a>

              {/* Email */}

              <a
                href="#"
                className="w-14 h-14 rounded-2xl bg-white border border-slate-200 hover:border-orange-200 hover:bg-orange-50 transition-all flex items-center justify-center group shadow-sm"
              >

                <Mail className="w-5 h-5 text-slate-500 group-hover:text-orange-500" />

              </a>

            </div>
          </div>

        </div>

        {/* Bottom */}

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">

          <p className="text-sm text-slate-500 text-center md:text-left">

            © 2026 TraceChain. All rights reserved.

          </p>

          <div className="flex items-center gap-3 text-sm text-slate-400">

            <span>
              Built for BGI Hackathon 2026
            </span>

            <div className="w-1 h-1 rounded-full bg-slate-300" />

            <span className="font-semibold text-slate-600">

              Team DATA DEFENDERS

            </span>

          </div>

        </div>
      </div>
    </footer>
  );
}