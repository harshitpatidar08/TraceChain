import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, ShieldCheck, Search, Link as LinkIcon, 
  Users, Zap, Wheat, Factory, Truck, Store, User, Lock, 
  ShieldAlert, Smartphone, Globe, BarChart3, ScanLine, ArrowRight,
  ChevronRight, Box, Package, Bell
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatbotWidget from '../components/ChatbotWidget';
import { useAuth } from '../context/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};


export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <div className="bg-white text-gray-900 min-h-screen font-inter w-full overflow-x-hidden selection:bg-orange-200">
      <Navbar />

      {/* SECTION 1: HERO */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
        {/* Abstract background blobs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2 z-0 animate-blob"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/3 -translate-y-1/2 z-0 animate-blob animation-delay-2000"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 pt-10">
          
          {/* Left Column (60%) */}
          <motion.div 
            className="lg:col-span-7 space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-medium text-sm">
              <span>🌿</span>
              <span>Farm to Consumer Tracking</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold font-poppins leading-tight text-gray-900 tracking-tight">
              We Ensure Safe & <br className="hidden md:block"/>
              <span className="text-orange-500 relative">
                Transparent
                {/* Underline swoosh */}
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-orange-300 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 0" stroke="currentColor" strokeWidth="4" fill="transparent" />
                </svg>
              </span> <br className="hidden md:block"/>
              Food Supply Chains
            </h1>
            
            <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
              Scan any product QR code and instantly know where it came from, 
              who handled it, and whether it is safe to consume.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                to="/scanner" 
                className="px-8 py-4 rounded-full bg-orange-500 text-white font-bold text-lg hover:bg-orange-600 hover:-translate-y-1 transition-all shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Track a Product</span>
                <ArrowRight size={20} />
              </Link>
              {user ? (
                <Link 
                  to="/dashboard"
                  className="px-8 py-4 rounded-full border-2 border-orange-200 text-orange-600 font-bold text-lg hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link 
                  to="/auth"
                  className="px-8 py-4 rounded-full border-2 border-orange-200 text-orange-600 font-bold text-lg hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center"
                >
                  Join as Stakeholder
                </Link>
              )}
            </div>
            
            <div className="pt-6 border-t border-gray-100 flex items-center gap-6 flex-wrap">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="text-green-500" size={20} />
                <span className="text-gray-700 font-medium">10,000+ Products Tracked</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="text-green-500" size={20} />
                <span className="text-gray-700 font-medium">5 Supply Chain Stages</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="text-orange-500" size={20} />
                <span className="text-gray-700 font-medium">Real-time AI Alerts</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column (40%) */}
          <motion.div 
            className="lg:col-span-5 relative flex justify-center mt-12 lg:mt-0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            {/* The main circular image */}
            <div className="relative w-72 h-72 sm:w-96 sm:h-96">
              <div className="absolute inset-0 rounded-full border-[6px] border-orange-500/20 animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-4 rounded-full border-[4px] border-orange-500 shadow-2xl overflow-hidden p-1 bg-white">
                <img 
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=500" 
                  alt="Fresh produce" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Floating Card Top Left */}
              <motion.div 
                className="absolute -left-6 sm:-left-12 top-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4 flex items-center space-x-3 border border-gray-100 z-20"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="bg-green-100 p-2 rounded-full">
                  <ShieldCheck className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-0.5">QR Secured</p>
                  <p className="font-bold text-gray-900 leading-none">Verified Product</p>
                </div>
              </motion.div>

              {/* Floating Card Bottom Right */}
              <motion.div 
                className="absolute -right-6 sm:-right-8 bottom-16 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4 flex items-center space-x-3 border border-gray-100 z-20"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="bg-orange-100 p-2 rounded-full">
                  <Box className="text-orange-500" size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-0.5">Active</p>
                  <p className="font-bold text-gray-900 leading-none">AI Risk Detection</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-poppins text-gray-900 mb-4">How TraceChain Works</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {[
              { num: "01", icon: Wheat, color: "text-orange-600 bg-orange-100", title: "Register Product", desc: "Farmer registers product batch and receives a unique QR code with Trace ID." },
              { num: "02", icon: ScanLine, color: "text-blue-600 bg-blue-100", title: "Scan & Update", desc: "Each stakeholder scans the QR and logs their stage details in real time." },
              { num: "03", icon: Zap, color: "text-green-600 bg-green-100", title: "AI Monitoring", desc: "System automatically detects risks like expiry, temperature breach, and stage gaps." },
              { num: "04", icon: Search, color: "text-purple-600 bg-purple-100", title: "Consumer Verify", desc: "Consumer scans QR to see the complete transparent product journey instantly." }
            ].map((step, idx) => (
              <motion.div 
                key={idx} 
                variants={fadeUp} 
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 border-t-4 hover:-translate-y-2 relative"
                style={{ borderTopColor: '#f97316' }}
              >
                <div className="absolute top-0 right-8 -translate-y-1/2">
                  <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-4 border-white">
                    {step.num}
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${step.color}`}>
                  <step.icon size={32} />
                </div>
                <h3 className="text-xl font-bold font-poppins text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 6: FEATURES */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-poppins text-gray-900 mb-4">Why Choose TraceChain?</h2>
            <div className="w-24 h-1 bg-green-500 mx-auto rounded-full"></div>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {[
              { icon: Lock, bg: "bg-orange-100", title: "Tamper-Evident Records", desc: "Every event is cryptographically hashed and chained to the previous." },
              { icon: ShieldAlert, bg: "bg-green-100", title: "AI Risk Detection", desc: "Auto-detects expiry, temperature issues, and supply chain gaps." },
              { icon: Smartphone, bg: "bg-blue-100", title: "Mobile Friendly", desc: "Works on any smartphone browser, no app installation needed." },
              { icon: Globe, bg: "bg-purple-100", title: "Multilingual Support", desc: "Supports Hindi and English for farmers and consumers across India." },
              { icon: Bell, bg: "bg-red-100", title: "Real-time Alerts", desc: "Instant notifications for anomalies sent to admin dashboard." },
              { icon: BarChart3, bg: "bg-teal-100", title: "Full Analytics", desc: "Complete visibility and reporting for administrators." }
            ].map((feat, idx) => (
              <motion.div 
                key={idx} 
                variants={fadeUp}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300 group"
              >
                <div className={`w-14 h-14 ${feat.bg} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feat.icon className="text-gray-900" size={26} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feat.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}