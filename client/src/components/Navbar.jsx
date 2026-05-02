import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '#how-it-works' },
    { name: 'Track Product', path: '/scanner' },
    { name: 'About', path: '#about' }
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 font-inter ${
          scrolled ? 'bg-white shadow-lg py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Left: Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold font-poppins text-gray-900 tracking-tight">
                TraceChain
              </span>
            </Link>

            {/* Center: Desktop Links */}
            <div className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                link.path.startsWith('#') ? (
                  <a 
                    key={link.name} 
                    href={link.path}
                    className={`font-medium transition-colors hover:text-orange-500 ${scrolled ? 'text-gray-700' : 'text-gray-900'}`}
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link 
                    key={link.name} 
                    to={link.path}
                    className={`font-medium transition-colors hover:text-orange-500 ${scrolled ? 'text-gray-700' : 'text-gray-900'}`}
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </div>

            {/* Right: CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/auth"
                className="px-5 py-2.5 rounded-full font-medium text-orange-500 border-2 border-orange-500 hover:bg-orange-50 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/auth"
                className="px-5 py-2.5 rounded-full font-medium bg-orange-500 text-white shadow-md hover:bg-orange-600 transition-colors hover:-translate-y-0.5 transform"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-orange-500 hover:bg-gray-100 transition-colors focus:outline-none"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
            
          </div>
        </div>
      </nav>

      {/* Mobile Slide-down Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[60px] left-0 w-full bg-white shadow-xl z-40 md:hidden font-inter"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              {navLinks.map((link) => (
                link.path.startsWith('#') ? (
                  <a
                    key={link.name}
                    href={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-3 rounded-md text-base font-medium text-gray-900 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-3 rounded-md text-base font-medium text-gray-900 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                )
              ))}
              <div className="pt-4 flex flex-col space-y-3">
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-5 py-3 rounded-full font-medium text-orange-500 border-2 border-orange-500 hover:bg-orange-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-5 py-3 rounded-full font-medium bg-orange-500 text-white shadow-md hover:bg-orange-600 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}