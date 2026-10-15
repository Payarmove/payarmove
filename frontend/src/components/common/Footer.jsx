import React from 'react';
import { useApp } from '../../context/AppContext';

export default function Footer() {
  const { navigateTo } = useApp();

  return (
    <footer className="bg-white border-t border-black/[0.04] py-8 px-6 mt-auto shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-500">
        {/* Left: Brand */}
        <button
          onClick={() => navigateTo('explore')}
          className="font-black tracking-wider text-gray-900 text-sm uppercase"
        >
          PAYAR MOVE
        </button>

        {/* Center: Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-gray-600">
          <button
            onClick={() => navigateTo('explore')}
            className="hover:text-black transition"
          >
            Help
          </button>
          <button
            onClick={() => navigateTo('explore')}
            className="hover:text-black transition"
          >
            Terms
          </button>
          <button
            onClick={() => navigateTo('explore')}
            className="hover:text-black transition"
          >
            Cancellation policy
          </button>
          <button
            onClick={() => navigateTo('explore')}
            className="hover:text-black transition"
          >
            Privacy
          </button>
        </div>

        {/* Right: Copyright */}
        <div className="text-gray-400">
          &copy; {new Date().getFullYear()} PayarMove. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
