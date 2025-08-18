// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaChartLine, FaUsers, FaShieldAlt } from 'react-icons/fa';
import { HiOutlineBanknotes } from "react-icons/hi2";

const FeatureCard = ({ icon, title, children }) => (
  <div className="p-8 text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out">
    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-white rounded-full bg-emerald-500 shadow-emerald-300/50 shadow-lg">
      {React.createElement(icon, { className: 'w-8 h-8' })}
    </div>
    <h3 className="mb-3 text-2xl font-bold text-gray-800">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{children}</p>
  </div>
);

const HomePage = () => {
  return (
    <div className="bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <header className="relative py-24 text-center text-white bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="container relative z-10 mx-auto px-4">
          <HiOutlineBanknotes className="w-20 h-20 mx-auto mb-4 text-emerald-400" />
          <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl">Take Control of Your Finances</h1>
          <p className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto">The smart, simple, and collaborative way to manage your money and achieve your goals.</p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 mt-10 text-lg font-semibold text-white transition-all duration-300 transform rounded-full bg-emerald-600 hover:bg-emerald-700 hover:scale-105 shadow-lg hover:shadow-emerald-400/50"
          >
            Get Started for Free
          </Link>
          <p className="mt-4 text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold underline hover:text-emerald-400">
              Log In
            </Link>
          </p>
        </div>
      </header>

      {/* Features Section */}
      <section className="container py-20 mx-auto px-4">
        <h2 className="mb-16 text-4xl font-bold text-center text-gray-800">Why You'll Love WalletFlow</h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <FeatureCard icon={FaChartLine} title="Visualize Spending">
            See where your money goes with intuitive charts and reports. Make informed decisions and reach your financial goals faster.
          </FeatureCard>
          <FeatureCard icon={FaUsers} title="Collaborate Easily">
            Share budgets with a partner or family. Work together in real-time to stay on track with your shared financial goals.
          </FeatureCard>
          <FeatureCard icon={FaShieldAlt} title="Secure & Private">
            Your financial data is encrypted and protected. We prioritize your privacy and security above all else.
          </FeatureCard>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
