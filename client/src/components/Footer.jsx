import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Left: Branding */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold font-poppins track-tight">TraceChain</span>
            </div>
            <p className="text-gray-400 max-w-sm font-inter">
              Ensuring safe and transparent food supply chains through blockchain and AI technology.
            </p>
          </div>

          {/* Center: Quick Links */}
          <div className="md:px-8">
            <h3 className="text-lg font-bold mb-6 font-poppins">Quick Links</h3>
            <ul className="space-y-4 font-inter text-gray-400">
              <li>
                <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/scanner" className="hover:text-orange-500 transition-colors">Track Product</Link>
              </li>
              <li>
                <Link to="/scanner" className="hover:text-orange-500 transition-colors">QR Scanner</Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-orange-500 transition-colors">Login / Portal</Link>
              </li>
            </ul>
          </div>

          {/* Right: Connect */}
          <div>
            <h3 className="text-lg font-bold mb-6 font-poppins">Our Mission</h3>
            <p className="text-gray-400 mb-6 font-inter">
              Made with <span className="text-red-500">❤️</span> for food safety in India.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-orange-500 hover:text-white transition-all text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-orange-500 hover:text-white transition-all text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-orange-500 hover:text-white transition-all text-gray-400">
                <Mail size={20} />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col justify-center items-center text-center">
          <p className="text-sm text-gray-500 font-inter">
            © 2026 TraceChain. All rights reserved. | Built for BGI Hackathon 2026 | Team DATA DEFENDERS — Team ID 1686
          </p>
        </div>
      </div>
    </footer>
  );
}