import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Store,
  ScanLine,
  Zap,
  Lock,
  Globe,
  Bell,
  BarChart3,
  Leaf,
  CheckCircle2
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatbotWidget from '../components/ChatbotWidget';

import { useAuth } from '../context/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: 'easeOut'
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen font-inter overflow-x-hidden selection:bg-emerald-100">

      <Navbar />

      {/* HERO SECTION */}

      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">

        {/* Background Effects */}

        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-40 -translate-x-1/2 -translate-y-1/2" />

        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-40 translate-x-1/3 translate-y-1/3" />

        <div className="max-w-7xl mx-auto relative z-10">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

            {/* LEFT */}

            <motion.div
              className="lg:col-span-6"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >

              {/* Badge */}

              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-5 py-2 rounded-full text-sm font-semibold mb-8">

                <Leaf size={16} />

                <span>
                  Smart Food Supply Transparency
                </span>

              </div>

              {/* Heading */}

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-slate-900 mb-8">

                Modern
                <span className="text-emerald-500">
                  {' '}Supply Chain
                </span>

                <br />

                Tracking For
                <br />

                Trusted Food

              </h1>

              {/* Description */}

              <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mb-10">

                Track every product from farm to customer using blockchain,
                AI-powered monitoring, and secure QR verification.

              </p>

              {/* Buttons */}

              <div className="flex flex-col sm:flex-row gap-4 mb-12">

                <Link
                  to="/scanner"
                  className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                >
                  Track Product

                  <ArrowRight size={18} />
                </Link>

                {user ? (
                  <Link
                    to="/dashboard"
                    className="px-8 py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 flex items-center justify-center"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/auth"
                    className="px-8 py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 flex items-center justify-center"
                  >
                    Get Started
                  </Link>
                )}

              </div>

              {/* Stats */}

              <div className="flex flex-wrap gap-8 pt-8 border-t border-slate-200">

                <div className="flex items-center gap-3">

                  <CheckCircle2 className="text-emerald-500" size={20} />

                  <span className="font-medium text-slate-700">
                    10K+ Products
                  </span>

                </div>

                <div className="flex items-center gap-3">

                  <CheckCircle2 className="text-emerald-500" size={20} />

                  <span className="font-medium text-slate-700">
                    Live Tracking
                  </span>

                </div>

                <div className="flex items-center gap-3">

                  <Zap className="text-orange-500" size={20} />

                  <span className="font-medium text-slate-700">
                    AI Monitoring
                  </span>

                </div>

              </div>
            </motion.div>

            {/* RIGHT */}

            <motion.div
              className="lg:col-span-6 relative flex justify-center"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >

              {/* Glow */}

              <div className="absolute top-10 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-50" />

              {/* Image Card */}

              <div className="relative bg-white p-3 rounded-[40px] border border-slate-200 shadow-2xl rotate-[-2deg] hover:rotate-0 transition-all duration-500">

                <img
                  src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1400&auto=format&fit=crop"
                  alt="food supply"
                  className="w-[520px] h-[580px] object-cover rounded-[32px]"
                />

                {/* Floating Card 1 */}

                <motion.div
                  className="absolute -top-6 -left-8 bg-white rounded-3xl border border-slate-200 shadow-xl px-5 py-4 flex items-center gap-4"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >

                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">

                    <ShieldCheck
                      className="text-emerald-600"
                      size={24}
                    />

                  </div>

                  <div>

                    <p className="text-xs text-slate-400 font-medium">
                      Blockchain Verified
                    </p>

                    <h4 className="font-bold text-slate-900">
                      Safe Product
                    </h4>

                  </div>
                </motion.div>

                {/* Floating Card 2 */}

                <motion.div
                  className="absolute -bottom-6 -right-6 bg-white rounded-3xl border border-slate-200 shadow-xl px-5 py-4 flex items-center gap-4"
                  animate={{ y: [0, 10, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >

                  <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">

                    <Truck
                      className="text-orange-500"
                      size={24}
                    />

                  </div>

                  <div>

                    <p className="text-xs text-slate-400 font-medium">
                      Real-time Logistics
                    </p>

                    <h4 className="font-bold text-slate-900">
                      Live Monitoring
                    </h4>

                  </div>
                </motion.div>

                {/* Floating Card 3 */}

                <motion.div
                  className="absolute top-1/2 -right-10 bg-white rounded-3xl border border-slate-200 shadow-xl px-6 py-5"
                  animate={{ y: [0, -12, 0] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >

                  <p className="text-sm text-slate-400 mb-1">
                    Products Tracked
                  </p>

                  <h3 className="text-3xl font-black text-slate-900">
                    10K+
                  </h3>

                </motion.div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section className="py-24 px-4 sm:px-6 lg:px-8">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-20">

            <h2 className="text-5xl font-black tracking-tight text-slate-900 mb-5">
              How TraceChain Works
            </h2>

            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              A simple and transparent workflow powered by blockchain.
            </p>

          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >

            {[
              {
                num: '01',
                icon: Leaf,
                bg: 'bg-emerald-100',
                color: 'text-emerald-600',
                title: 'Register Product',
                desc: 'Farmers create secure product records with QR codes.'
              },
              {
                num: '02',
                icon: ScanLine,
                bg: 'bg-blue-100',
                color: 'text-blue-600',
                title: 'Scan & Update',
                desc: 'Stakeholders update each stage in real time.'
              },
              {
                num: '03',
                icon: Zap,
                bg: 'bg-orange-100',
                color: 'text-orange-500',
                title: 'AI Monitoring',
                desc: 'Automatic risk detection and smart alerts.'
              },
              {
                num: '04',
                icon: Store,
                bg: 'bg-purple-100',
                color: 'text-purple-600',
                title: 'Consumer Verify',
                desc: 'Consumers instantly verify authenticity.'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all duration-300"
              >

                <div className="flex items-center justify-between mb-8">

                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${item.bg}`}>

                    <item.icon
                      className={item.color}
                      size={30}
                    />

                  </div>

                  <span className="text-4xl font-black text-slate-100">
                    {item.num}
                  </span>

                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  {item.title}
                </h3>

                <p className="text-slate-500 leading-relaxed">
                  {item.desc}
                </p>

              </motion.div>
            ))}

          </motion.div>
        </div>
      </section>

      {/* FEATURES */}

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-20">

            <h2 className="text-5xl font-black tracking-tight text-slate-900 mb-5">
              Why Choose TraceChain
            </h2>

            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Built for modern supply chains with security and transparency.
            </p>

          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >

            {[
              {
                icon: Lock,
                bg: 'bg-orange-100',
                color: 'text-orange-500',
                title: 'Tamper-proof Records'
              },
              {
                icon: Bell,
                bg: 'bg-red-100',
                color: 'text-red-500',
                title: 'Real-time Alerts'
              },
              {
                icon: Globe,
                bg: 'bg-blue-100',
                color: 'text-blue-500',
                title: 'Global Access'
              },
              {
                icon: BarChart3,
                bg: 'bg-purple-100',
                color: 'text-purple-600',
                title: 'Advanced Analytics'
              },
              {
                icon: Truck,
                bg: 'bg-emerald-100',
                color: 'text-emerald-600',
                title: 'Shipment Tracking'
              },
              {
                icon: ShieldCheck,
                bg: 'bg-cyan-100',
                color: 'text-cyan-600',
                title: 'Verified Products'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="bg-[#F8FAFC] rounded-[32px] p-8 border border-slate-200 hover:shadow-lg transition-all duration-300"
              >

                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 ${feature.bg}`}>

                  <feature.icon
                    className={feature.color}
                    size={30}
                  />

                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>

                <p className="text-slate-500 leading-relaxed">
                  Powerful infrastructure designed for trusted and scalable
                  food supply chains.
                </p>

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