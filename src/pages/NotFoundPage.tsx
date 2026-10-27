import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, BookOpen } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-24 sm:py-32 px-4 text-center max-w-xl mx-auto space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto shadow-sm">
        <Compass className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
          404 Error
        </span>
        <h1 className="text-3xl font-black text-[#12315A]">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          The educational page or resource you are looking for does not exist or may have been relocated.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#12315A] hover:bg-blue-900 transition-colors text-xs"
        >
          Return to Home
        </Link>
        <Link
          to="/courses"
          className="px-6 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-xs flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Browse Academic Programs</span>
        </Link>
      </div>
    </div>
  );
};
