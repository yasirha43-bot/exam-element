import React, { useContext } from 'react';
import { ThemeContext } from '../App';

export default function Contact() {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      darkMode 
        ? 'bg-gray-900' 
        : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl w-full mx-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Form/Content */}
        <div className={`p-8 rounded-3xl shadow-2xl transition-all duration-300 ${
          darkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}>
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
              <span className="text-xl">✓</span>
            </div>
          </div>

          <h1 className={`text-center text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Get in Touch
          </h1>
          <p className={`text-center text-sm mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Have questions about Exam Element? We'd love to hear from you. Reach out and we'll respond within 24 hours.
          </p>

          <div className={`p-6 rounded-2xl mb-6 ${
            darkMode 
              ? 'bg-gray-700/50 border border-gray-600' 
              : 'bg-orange-50 border-2 border-orange-200'
          }`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📧 Email us directly
            </h2>
            <a 
              href="mailto:contact@examelement.com"
              className={`inline-block px-6 py-3 rounded-xl font-bold text-white transition-all duration-200 bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-105`}
            >
              💌 Email Support
            </a>
          </div>

          <div className={`p-6 rounded-2xl ${
            darkMode 
              ? 'bg-gray-700/50 border border-gray-600' 
              : 'bg-orange-50 border-2 border-orange-200'
          }`}>
            <h2 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              💡 What can we help with?
            </h2>
            <ul className={`text-sm space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>✓ Account issues or password reset</li>
              <li>✓ Questions about features</li>
              <li>✓ Subscription or billing support</li>
              <li>✓ General feedback and suggestions</li>
            </ul>
          </div>
        </div>

        {/* Right side - Virus SVG */}
        <div className="hidden lg:flex items-center justify-center">
          <svg width="280" height="280" viewBox="0 0 280 280" className={`rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-orange-50'} p-8`}>
            {/* Central core */}
            <circle cx="140" cy="140" r="50" fill="#f97316" stroke="#ea580c" strokeWidth="3"/>
            
            {/* DNA/RNA inside */}
            <path d="M 120 120 Q 140 130, 160 120" stroke="#fff" strokeWidth="2" fill="none" opacity="0.8"/>
            <path d="M 120 160 Q 140 150, 160 160" stroke="#fff" strokeWidth="2" fill="none" opacity="0.8"/>
            
            {/* Protein spikes around core - Top */}
            <circle cx="140" cy="50" r="15" fill="#fb923c" stroke="#f97316" strokeWidth="2"/>
            <line x1="140" y1="65" x2="140" y2="85" stroke="#f97316" strokeWidth="2"/>
            
            {/* Right protein spikes */}
            <circle cx="220" cy="100" r="15" fill="#fb923c" stroke="#f97316" strokeWidth="2"/>
            <line x1="205" y1="115" x2="185" y2="135" stroke="#f97316" strokeWidth="2"/>
            
            <circle cx="240" cy="140" r="15" fill="#fb923c" stroke="#f97316" strokeWidth="2"/>
            <line x1="225" y1="140" x2="205" y2="140" stroke="#f97316" strokeWidth="2"/>
            
            <circle cx="220" cy="180" r="15" fill="#fb923c" stroke="#f97316" strokeWidth="2"/>
            <line x1="205" y1="165" x2="185" y2="145" stroke="#f97316" strokeWidth="2"/>
            
            {/* Bottom protein spikes */}
            <circle cx="140" cy="230" r="15" fill="#fb923c" stroke="#f97316" strokeWidth="2"/>
            <line x1="140" y1="215" x2="140" y2="195" stroke="#f97316" strokeWidth="2"/>
            
            {/* Left protein spikes */}
            <circle cx="60" cy="180" r="15" fill="#fb923c" stroke="#f97316" strokeWidth="2"/>
            <line x1="75" y1="165" x2="95" y2="145" stroke="#f97316" strokeWidth="2"/>
            
            <circle cx="40" cy="140" r="15" fill="#fb923c" stroke="#f97316" strokeWidth="2"/>
            <line x1="55" y1="140" x2="75" y2="140" stroke="#f97316" strokeWidth="2"/>
            
            <circle cx="60" cy="100" r="15" fill="#fb923c" stroke="#f97316" strokeWidth="2"/>
            <line x1="75" y1="115" x2="95" y2="135" stroke="#f97316" strokeWidth="2"/>
            
            {/* Outer layer indication */}
            <circle cx="140" cy="140" r="90" fill="none" stroke="#fed7aa" strokeWidth="2" strokeDasharray="8,4" opacity="0.6"/>
            
            {/* Label */}
            <text x="140" y="270" fontSize="12" fill="#92400e" fontWeight="bold" textAnchor="middle">Virus Structure</text>
          </svg>
        </div>
      </div>
    </div>
  );
}
