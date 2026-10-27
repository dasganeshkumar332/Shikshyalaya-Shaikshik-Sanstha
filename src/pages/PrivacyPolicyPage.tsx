import React from 'react';
import { Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PrivacyPolicyPage: React.FC = () => {
  const { settings } = useApp();

  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      <div className="space-y-3 text-center sm:text-left border-b border-slate-100 pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
          Legal & Privacy
        </span>
        <h1 className="text-3xl font-extrabold text-[#12315A]">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500">
          Last revised: October 2026 • {settings.instituteName}
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            When prospective students submit admission inquiries or contact requests on the website of <strong>{settings.instituteName}</strong>, we collect personal contact details such as name, phone number, email address, preferred academic program, and learning shift.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. How We Use Collected Data</h2>
          <p>
            The collected information is used solely for educational purposes:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            <li>Responding to course and syllabus inquiries.</li>
            <li>Providing batch timing options, fee structure details, and orientation schedules.</li>
            <li>Managing student enrollment records and distributing class credentials.</li>
            <li>Communicating examination schedules, model question releases, and emergency notices.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Non-Disclosure & Security</h2>
          <p>
            We do not sell, rent, or trade student telephone numbers or personal identifiers to third-party commercial marketing entities. Access to student inquiries and records is restricted to authorized administrative counselors and faculty heads.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Contact Inquiries</h2>
          <p>
            If you have questions regarding your stored academic information or wish to update your records, please contact our administrative desk at <strong>{settings.emailAddress}</strong> or <strong>{settings.contactNumber}</strong>.
          </p>
        </section>
      </div>
    </div>
  );
};
