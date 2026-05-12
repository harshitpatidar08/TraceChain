import React, {
  useState,
  useEffect
} from 'react';

import {
  Link
} from 'react-router-dom';

import {
  Leaf,
  Menu,
  X,
 ArrowRight
} from 'lucide-react';

import {
  motion,
  AnimatePresence
} from 'framer-motion';

import {
  useAuth
} from '../context/AuthContext';

export default function Navbar() {
  const {
    user,
    logout
  } = useAuth();

  const [scrolled, setScrolled] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(
        window.scrollY > 20
      );
    };

    window.addEventListener(
      'scroll',
      handleScroll
    );

    return () =>
      window.removeEventListener(
        'scroll',
        handleScroll
      );
  }, []);

  const navLinks = [
    {
      name: 'Home',
      path: '/'
    },
    {
      name: 'How It Works',
      path: '#how-it-works'
    },
    {
      name: 'Track Product',
      path: '/scanner'
    },
    {
      name: 'About',
      path: '#about'
    }
  ];

  const handleSectionScroll = (
    e,
    sectionId
  ) => {
    e.preventDefault();

    const section =
      document.querySelector(
        sectionId
      );

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }

    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* NAVBAR */}

      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200 py-4 shadow-sm'
            : 'bg-transparent py-6'
        }`}
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center justify-between">

            {/* LOGO */}

            <Link
              to="/"
              className="flex items-center gap-4"
            >

              <div className="w-14 h-14 rounded-[20px] bg-emerald-100 flex items-center justify-center shadow-sm">

                <Leaf className="w-7 h-7 text-emerald-600" />

              </div>

              <div>

                <h1 className="text-2xl font-black tracking-tight text-slate-900">

                  TraceChain

                </h1>

                <p className="text-xs text-slate-500 mt-0.5">

                  Smart Supply Tracking

                </p>

              </div>

            </Link>

            {/* DESKTOP LINKS */}

            <div className="hidden lg:flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-2 shadow-sm">

              {navLinks.map((link) =>
                link.path.startsWith(
                  '#'
                ) ? (
                  <a
                    key={link.name}
                    href={link.path}
                    onClick={(e) =>
                      handleSectionScroll(
                        e,
                        link.path
                      )
                    }
                    className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-[#F8FAFC] hover:text-slate-900 transition-all"
                  >

                    {link.name}

                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-[#F8FAFC] hover:text-slate-900 transition-all"
                  >

                    {link.name}

                  </Link>
                )
              )}

            </div>

            {/* DESKTOP BUTTONS */}

            <div className="hidden lg:flex items-center gap-4">

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all duration-300 flex items-center gap-2 shadow-sm"
                  >

                    Dashboard

                    <ArrowRight className="w-4 h-4" />

                  </Link>

                  <button
                    onClick={logout}
                    className="px-6 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all"
                  >

                    Logout

                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="px-6 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all"
                  >

                    Login

                  </Link>

                  <Link
                    to="/auth"
                    className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all duration-300 flex items-center gap-2 shadow-sm"
                  >

                    Get Started

                    <ArrowRight className="w-4 h-4" />

                  </Link>
                </>
              )}

            </div>

            {/* MOBILE BUTTON */}

            <button
              onClick={() =>
                setMobileMenuOpen(
                  !mobileMenuOpen
                )
              }
              className="lg:hidden w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm"
            >

              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-700" />
              ) : (
                <Menu className="w-5 h-5 text-slate-700" />
              )}

            </button>

          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}

      <AnimatePresence>

        {mobileMenuOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -20
            }}
            transition={{
              duration: 0.25
            }}
            className="fixed top-[88px] left-4 right-4 z-40 lg:hidden"
          >

            <div className="bg-white border border-slate-200 rounded-[32px] shadow-2xl overflow-hidden p-5">

              {/* LINKS */}

              <div className="space-y-2 mb-6">

                {navLinks.map((link) =>
                  link.path.startsWith(
                    '#'
                  ) ? (
                    <a
                      key={link.name}
                      href={link.path}
                      onClick={(e) =>
                        handleSectionScroll(
                          e,
                          link.path
                        )
                      }
                      className="block px-5 py-4 rounded-2xl text-slate-700 font-semibold hover:bg-[#F8FAFC] transition-all"
                    >

                      {link.name}

                    </a>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() =>
                        setMobileMenuOpen(
                          false
                        )
                      }
                      className="block px-5 py-4 rounded-2xl text-slate-700 font-semibold hover:bg-[#F8FAFC] transition-all"
                    >

                      {link.name}

                    </Link>
                  )
                )}

              </div>

              {/* ACTIONS */}

              <div className="border-t border-slate-100 pt-5 flex flex-col gap-3">

                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() =>
                        setMobileMenuOpen(
                          false
                        )
                      }
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white text-center py-4 rounded-2xl font-semibold transition-all"
                    >

                      Dashboard

                    </Link>

                    <button
                      onClick={() => {
                        logout();

                        setMobileMenuOpen(
                          false
                        );
                      }}
                      className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-4 rounded-2xl font-semibold transition-all"
                    >

                      Logout

                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      onClick={() =>
                        setMobileMenuOpen(
                          false
                        )
                      }
                      className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-center py-4 rounded-2xl font-semibold transition-all"
                    >

                      Login

                    </Link>

                    <Link
                      to="/auth"
                      onClick={() =>
                        setMobileMenuOpen(
                          false
                        )
                      }
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white text-center py-4 rounded-2xl font-semibold transition-all"
                    >

                      Get Started

                    </Link>
                  </>
                )}

              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </>
  );
}