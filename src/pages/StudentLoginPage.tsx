import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StudentLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsStudent, currentUser, courses, inquiries } = useApp();

  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCourseSlug, setSelectedCourseSlug] = useState('bbm-tu');
  const [error, setError] = useState('');

  // If already logged in
  if (currentUser && currentUser.role === 'student') {
    navigate('/student/dashboard');
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const rawInput = (studentId || email || '').trim();
    if (!rawInput) {
      setError('Please enter your Student ID, Application Reference Number, or Registered Email.');
      return;
    }

    const cleanInput = rawInput.toLowerCase();
    const cleanDigits = rawInput.replace(/[^0-9]/g, '');

    // Check if user is an applicant from admission inquiries
    const foundInq = inquiries.find(
      (inq) =>
        (inq.referenceNumber && inq.referenceNumber.toLowerCase() === cleanInput) ||
        (inq.assignedStudentId && inq.assignedStudentId.toLowerCase() === cleanInput) ||
        (inq.email && inq.email.toLowerCase() === cleanInput) ||
        (cleanDigits.length >= 7 && inq.phone.replace(/[^0-9]/g, '') === cleanDigits)
    );

    if (foundInq) {
      if (foundInq.status !== 'Verified & Enrolled' && !foundInq.paymentVerified) {
        setError(
          `Application Found (${foundInq.referenceNumber}): Your admission application for "${foundInq.courseName}" is currently awaiting administrative payment verification. Please allow our admissions office a short time to review your uploaded voucher, or contact 9801234567.`
        );
        return;
      }

      // Found verified inquiry
      const success = loginAsStudent(
        foundInq.assignedStudentId || foundInq.referenceNumber,
        foundInq.email || 'student@shikshyalaya.edu.np',
        [foundInq.courseSlug],
        foundInq.fullName
      );
      if (success) {
        navigate('/student/dashboard');
      } else {
        setError('Unable to authenticate student profile.');
      }
      return;
    }

    // Standard credential login
    const c = courses.find((x) => x.slug === selectedCourseSlug);
    const courseTitle = c ? c.title : selectedCourseSlug.toUpperCase();

    const success = loginAsStudent(
      studentId || `SSS-STU-${selectedCourseSlug.slice(0, 3).toUpperCase()}-2026`,
      email || 'student@shikshyalaya.edu.np',
      [selectedCourseSlug],
      `${courseTitle} Enrolled Scholar`
    );

    if (success) {
      navigate('/student/dashboard');
    } else {
      setError('Invalid student credentials.');
    }
  };

  const handleQuickDemoLogin = (courseSlug: string, name: string) => {
    const c = courses.find((x) => x.slug === courseSlug);
    const courseTitle = c ? c.title : courseSlug.toUpperCase();
    loginAsStudent(
      `SSS-STU-${courseSlug.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4)}-2026`,
      `${courseSlug.replace(/[^a-z]/g, '')}.student@shikshyalaya.edu.np`,
      [courseSlug],
      name || `${courseTitle} Student`
    );
    navigate('/student/dashboard');
  };

  const demoAccounts = [
    { slug: 'bbm-tu', title: 'BBM (TU) Student', desc: 'Enrolled in BBM only' },
    { slug: 'bbs-tu', title: 'BBS (TU) Student', desc: 'Enrolled in BBS only' },
    { slug: 'mbs-tu', title: 'MBS (TU) Student', desc: 'Enrolled in MBS only' },
    { slug: 'bba-tu', title: 'BBA (TU) Student', desc: 'Enrolled in BBA only' },
    { slug: 'plus-two-science', title: '+2 Science Student', desc: 'Enrolled in +2 Science only' },
    { slug: 'plus-two-management', title: '+2 Management Student', desc: 'Enrolled in +2 Mgmt only' },
    { slug: 'bba-pokhara-university', title: 'PU BBA Student', desc: 'Enrolled in PU BBA only' },
  ];

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#12315A] text-white p-6 sm:p-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-md">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Student Portal Login</h2>
            <p className="text-xs text-blue-200">
              Access your registered classes, lecture notes & study resources
            </p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Enrolled Academic Program <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedCourseSlug}
                  onChange={(e) => setSelectedCourseSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-800"
                >
                  {courses.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.title} ({c.board})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Resource access will be strictly restricted to this enrolled program.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Student ID or Reference Code
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. SSS-BBM-2026-101"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Portal Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-white bg-[#12315A] hover:bg-blue-900 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In to Student Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Online Applicant Quick Test Helper */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                  <Receipt className="w-4 h-4 text-amber-600" />
                  <span>Applicant Payment Verification Test:</span>
                </div>
                <span className="text-[10px] text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded font-medium">Click to prefill</span>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setStudentId('SSS-STU-BBA-1004');
                    setEmail('prashant.sharma@example.com');
                    setSelectedCourseSlug('bba-tu');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold border border-emerald-300 transition-colors cursor-pointer text-left"
                  title="Officially verified with ConnectIPS payment slip"
                >
                  ✓ Prashant (Verified ID: SSS-STU-BBA-1004)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStudentId('SSS-ADM-2026-1004');
                    setEmail('sunil.thapa@example.com');
                    setSelectedCourseSlug('bbm-tu');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold border border-amber-300 transition-colors cursor-pointer text-left"
                  title="Has eSewa voucher pending admin review"
                >
                  ⏳ Sunil (Ref: SSS-ADM-2026-1004 • eSewa Slip)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Demo Logins to Test Enrollment Separation */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <div>
              <h3 className="font-bold text-sm">One-Click Program Test Logins</h3>
              <p className="text-xs text-slate-500">
                Test how access to study resources changes strictly according to the enrolled course.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {demoAccounts.map((acc) => (
              <button
                key={acc.slug}
                onClick={() => handleQuickDemoLogin(acc.slug, acc.title)}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-all group flex items-start justify-between cursor-pointer"
              >
                <div>
                  <p className="font-bold text-slate-800 group-hover:text-blue-900">{acc.title}</p>
                  <p className="text-[11px] text-slate-500">{acc.desc}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all mt-1" />
              </button>
            ))}
          </div>

          <div className="pt-2 text-center text-xs text-slate-500">
            New prospective student?{' '}
            <Link to="/admission" className="text-blue-700 font-bold hover:underline">
              Apply for Admission
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
