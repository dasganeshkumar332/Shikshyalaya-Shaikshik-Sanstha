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
  const { loginAsStudent, currentUser, courses, inquiries, mockTestRegistrations, studentGroups } = useApp();

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
      setError('Please enter your Student ID, Application Reference Number, or Registered Mobile / Email.');
      return;
    }

    const cleanInput = rawInput.toLowerCase();
    const cleanDigits = rawInput.replace(/[^0-9]/g, '');

    // 1. Check if user is an applicant from admission inquiries
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
          `Application Found (${foundInq.referenceNumber}): Your admission application for "${foundInq.courseName}" is currently awaiting administrative payment verification. Please allow our admissions office a short time to review your uploaded voucher, or contact +977 9767648342.`
        );
        return;
      }

      // Found verified inquiry
      const success = loginAsStudent(
        foundInq.assignedStudentId || foundInq.referenceNumber,
        foundInq.email || 'student@shikshyalaya.edu.np',
        [foundInq.courseSlug],
        foundInq.fullName,
        foundInq.enrolledSubjects
      );
      if (success) {
        navigate('/student/dashboard');
      } else {
        setError('Unable to authenticate student profile. Please contact administration.');
      }
      return;
    }

    // 2. Check if student is registered for mock test series
    const foundMockReg = mockTestRegistrations.find(
      (reg) =>
        (reg.referenceNumber && reg.referenceNumber.toLowerCase() === cleanInput) ||
        (reg.studentRollNo && reg.studentRollNo.toLowerCase() === cleanInput) ||
        (reg.email && reg.email.toLowerCase() === cleanInput) ||
        (cleanDigits.length >= 7 && reg.phone.replace(/[^0-9]/g, '') === cleanDigits)
    );

    if (foundMockReg) {
      const success = loginAsStudent(
        foundMockReg.studentRollNo || foundMockReg.referenceNumber,
        foundMockReg.email || `${foundMockReg.phone}@student.shikshyalaya.edu.np`,
        [foundMockReg.courseSlug],
        foundMockReg.fullName,
        foundMockReg.enrolledSubjects
      );
      if (success) {
        navigate('/student/dashboard');
      } else {
        setError('Unable to activate session for this mock test registration.');
      }
      return;
    }

    // 3. Check student group cohort members
    for (const group of studentGroups) {
      const foundMember = group.members.find(
        (m) =>
          (m.studentId && m.studentId.toLowerCase() === cleanInput) ||
          (m.email && m.email.toLowerCase() === cleanInput) ||
          (cleanDigits.length >= 7 && m.phone?.replace(/[^0-9]/g, '') === cleanDigits)
      );
      if (foundMember) {
        const memberId = foundMember.studentId || foundMember.rollNumber || foundMember.referenceNumber || foundMember.id;
        const success = loginAsStudent(
          memberId,
          foundMember.email || `${memberId.toLowerCase()}@shikshyalaya.edu.np`,
          [foundMember.enrolledCourseSlug || group.courseSlug],
          foundMember.fullName,
          foundMember.enrolledSubjects
        );
        if (success) {
          navigate('/student/dashboard');
          return;
        }
      }
    }

    // 4. Authorized demo student credentials
    const demoIds = ['sss-demo-bbm', 'sss-demo-bbs', 'sss-demo-mbs', 'sss-demo-bba', 'sss-demo-sci', 'sss-demo-mgmt', 'sss-demo-pubba'];
    if (demoIds.includes(cleanInput)) {
      const success = loginAsStudent(cleanInput.toUpperCase(), `${cleanInput}@shikshyalaya.edu.np`, [selectedCourseSlug]);
      if (success) {
        navigate('/student/dashboard');
        return;
      }
    }

    // If no verified record exists, strictly deny access!
    setError(
      'Authentication failed: No active enrolled student or registered examinee found matching this ID or phone number. For newly submitted admission applications, administrative verification is required before student portal activation.'
    );
  };

  const handleQuickDemoLogin = (demoId: string, courseSlug: string, name: string) => {
    loginAsStudent(
      demoId,
      `${demoId.toLowerCase()}@shikshyalaya.edu.np`,
      [courseSlug],
      name
    );
    navigate('/student/dashboard');
  };

  const demoAccounts = [
    { id: 'SSS-DEMO-BBM', slug: 'bbm-tu', title: 'BBM (TU) Student', desc: 'Authorized Demo (BBM enrolled)' },
    { id: 'SSS-DEMO-BBS', slug: 'bbs-tu', title: 'BBS (TU) Student', desc: 'Authorized Demo (BBS enrolled)' },
    { id: 'SSS-DEMO-MBS', slug: 'mbs-tu', title: 'MBS (TU) Student', desc: 'Authorized Demo (MBS enrolled)' },
    { id: 'SSS-DEMO-BBA', slug: 'bba-tu', title: 'BBA (TU) Student', desc: 'Authorized Demo (BBA enrolled)' },
    { id: 'SSS-DEMO-SCI', slug: 'plus-two-science', title: '+2 Science Student', desc: 'Authorized Demo (+2 Science)' },
    { id: 'SSS-DEMO-MGMT', slug: 'plus-two-management', title: '+2 Management Student', desc: 'Authorized Demo (+2 Mgmt)' },
    { id: 'SSS-DEMO-PUBBA', slug: 'bba-pokhara-university', title: 'PU BBA Student', desc: 'Authorized Demo (PU BBA)' },
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
                onClick={() => handleQuickDemoLogin(acc.id, acc.slug, acc.title)}
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
