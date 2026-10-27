import React from 'react';
import { useApp } from '../context/AppContext';

export const TermsPage: React.FC = () => {
  const { settings } = useApp();

  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      <div className="space-y-3 text-center sm:text-left border-b border-slate-100 pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
          Terms & Academic Policies
        </span>
        <h1 className="text-3xl font-extrabold text-[#12315A]">
          Terms & Conditions
        </h1>
        <p className="text-xs text-slate-500">
          Last revised: October 2026 • {settings.instituteName}
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Nature of Educational Services</h2>
          <p>
            <strong>{settings.instituteName}</strong> is an independent academic coaching and tuition institute providing supplementary tuition, numerical problem-solving sessions, and examination preparation guidance. Submitting an admission inquiry on this website expresses interest in joining a tuition batch and does not constitute formal university admission or legal degree conferral.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Attendance & Code of Conduct</h2>
          <p>
            Students enrolled in either physical classroom or online live batches are expected to maintain academic discipline, attend scheduled lectures promptly, and respect fellow learners and faculty members.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Intellectual Property of Study Materials</h2>
          <p>
            Lecture notes, formula cheat-sheets, model question solutions, and instructional slides prepared by institute educators and distributed through our portal are intended solely for the personal academic study of enrolled students. Unauthorized commercial re-selling or mass republication is strictly prohibited.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Modifications & Batch Timings</h2>
          <p>
            The institute reserves the right to adjust batch timings, classroom assignments, or schedule make-up sessions in accordance with official university examination schedules and public holidays.
          </p>
        </section>
      </div>
    </div>
  );
};
