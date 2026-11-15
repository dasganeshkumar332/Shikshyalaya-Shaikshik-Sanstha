import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  Lock,
  LogIn,
  AlertCircle,
  User,
  Shield,
  Eye,
  EyeOff,
  LogOut,
  CheckCircle2,
  Phone,
  Send,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassMode } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    settings,
    courses,
    teachers,
    currentUser,
    loginAsStudent,
    loginAsAdmin,
    logout,
    inquiries,
    mockTestRegistrations,
    studentGroups,
    submitAdmissionInquiry,
  } = useApp();

  const publishedTeachers = teachers.filter((t) => t.published);

  // Unified Login state (handles both Student & Admin automatically)
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginCourseSlug, setLoginCourseSlug] = useState('bbs-tu');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Apply for Admission state
  const [applyName, setApplyName] = useState('');
  const [applyPhone, setApplyPhone] = useState('');
  const [applyEmail, setApplyEmail] = useState('');
  const [applyCourseSlug, setApplyCourseSlug] = useState('bbs-tu');
  const [applySelectedSubjects, setApplySelectedSubjects] = useState<string[]>([]);
  const [applyMode, setApplyMode] = useState<ClassMode>('Offline');
  const [applyShift, setApplyShift] = useState<'Morning' | 'Day' | 'Evening' | 'Flexible'>('Morning');
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccessRef, setApplySuccessRef] = useState<string | null>(null);

  const selectedApplyCourse = courses.find((c) => c.slug === applyCourseSlug) || courses[0];
  const applyCourseSubjectOptions = Array.from(
    new Set((selectedApplyCourse?.subjectsOffered || []).map((s) => s.name).filter(Boolean))
  );

  const toggleApplySubject = (subjectName: string) => {
    setApplySelectedSubjects((prev) =>
      prev.includes(subjectName) ? prev.filter((s) => s !== subjectName) : [...prev, subjectName]
    );
  };

  const handleUnifiedLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const rawInput = loginId.trim();
    const rawPass = loginPassword.trim();

    if (!rawInput) {
      setLoginError('Please enter your Student ID, Mobile Number, Email, or Account Username.');
      return;
    }

    setLoginLoading(true);
    const cleanInput = rawInput.toLowerCase();
    const cleanDigits = rawInput.replace(/[^0-9]/g, '');

    // 1. Automatic Admin Detection & Authentication
    const isAdminIdentifier =
      cleanInput === 'admin' ||
      cleanInput === 'administrator' ||
      cleanInput === 'sss-admin' ||
      cleanInput === 'admin@shikshyalaya.edu.np';

    if (isAdminIdentifier) {
      if (!rawPass) {
        setLoginError('Please enter your administrator passcode to sign in.');
        setLoginLoading(false);
        return;
      }
      const ok = loginAsAdmin(rawPass);
      if (ok) {
        setLoginId('');
        setLoginPassword('');
        navigate('/admin');
      } else {
        setLoginError('Access Denied: Incorrect administrator passcode.');
      }
      setLoginLoading(false);
      return;
    }

    // 2. Check verified admission inquiries
    const foundVerifiedInq = inquiries.find(
      (inq) =>
        (inq.status === 'Verified & Enrolled' || Boolean(inq.paymentVerified)) &&
        ((inq.referenceNumber && inq.referenceNumber.toLowerCase() === cleanInput) ||
          (inq.assignedStudentId && inq.assignedStudentId.toLowerCase() === cleanInput) ||
          (inq.email && inq.email.toLowerCase() === cleanInput) ||
          (cleanDigits.length >= 7 && inq.phone.replace(/[^0-9]/g, '') === cleanDigits))
    );

    if (foundVerifiedInq) {
      const success = loginAsStudent(
        foundVerifiedInq.assignedStudentId || foundVerifiedInq.referenceNumber,
        foundVerifiedInq.email || 'student@shikshyalaya.edu.np',
        [foundVerifiedInq.courseSlug],
        foundVerifiedInq.fullName,
        foundVerifiedInq.enrolledSubjects
      );
      if (success) {
        navigate('/student/dashboard');
      } else {
        setLoginError('Authentication failed. Please verify your details.');
      }
      setLoginLoading(false);
      return;
    }

    // 3. Check mock test registrations
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
        setLoginError('Unable to activate mock test student session.');
      }
      setLoginLoading(false);
      return;
    }

    // 4. Check student group cohort members
    for (const group of studentGroups) {
      const foundMember = group.members.find(
        (m) =>
          (m.studentId && m.studentId.toLowerCase() === cleanInput) ||
          (m.rollNumber && m.rollNumber.toLowerCase() === cleanInput) ||
          (m.referenceNumber && m.referenceNumber.toLowerCase() === cleanInput) ||
          (m.email && m.email.toLowerCase() === cleanInput) ||
          (cleanDigits.length >= 7 && m.phone?.replace(/[^0-9]/g, '') === cleanDigits)
      );
      if (foundMember) {
        const memberId =
          foundMember.studentId || foundMember.rollNumber || foundMember.referenceNumber || foundMember.id;
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

    // 5. Check pending admission inquiries (not yet verified)
    const foundPendingInq = inquiries.find(
      (inq) =>
        (inq.referenceNumber && inq.referenceNumber.toLowerCase() === cleanInput) ||
        (inq.assignedStudentId && inq.assignedStudentId.toLowerCase() === cleanInput) ||
        (inq.email && inq.email.toLowerCase() === cleanInput) ||
        (cleanDigits.length >= 7 && inq.phone.replace(/[^0-9]/g, '') === cleanDigits)
    );

    if (foundPendingInq) {
      setLoginError(
        `Application Found (${foundPendingInq.referenceNumber}): Awaiting administrative payment verification. Contact admissions at ${settings.contactNumber}.`
      );
      setLoginLoading(false);
      return;
    }

    // 6. Authorized demo student credentials
    const demoIds = [
      'sss-demo-bbm',
      'sss-demo-bbs',
      'sss-demo-mbs',
      'sss-demo-bba',
      'sss-demo-sci',
      'sss-demo-mgmt',
      'sss-demo-pubba',
    ];
    if (demoIds.includes(cleanInput)) {
      const success = loginAsStudent(cleanInput.toUpperCase(), `${cleanInput}@shikshyalaya.edu.np`, [loginCourseSlug]);
      if (success) {
        navigate('/student/dashboard');
        return;
      }
    }

    setLoginError(
      'Invalid credentials or unverified account. Please check your ID / phone number, or apply for admission below.'
    );
    setLoginLoading(false);
  };

  const handleHomeApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError('');

    if (!applyName.trim()) {
      setApplyError('Please enter your full name.');
      return;
    }
    const cleanedDigits = applyPhone.replace(/[^0-9]/g, '');
    if (cleanedDigits.length < 7) {
      setApplyError('Please enter a valid contact phone number.');
      return;
    }

    const selectedCourse = courses.find((c) => c.slug === applyCourseSlug) || courses[0];
    if (!selectedCourse) {
      setApplyError('Please select a valid academic program.');
      return;
    }

    setApplySubmitting(true);
    try {
      const ref = await submitAdmissionInquiry({
        fullName: applyName.trim(),
        email: applyEmail.trim() || 'not-provided@shikshyalaya.edu.np',
        phone: applyPhone.trim(),
        courseSlug: selectedCourse.slug,
        courseName: selectedCourse.title,
        courseType: selectedCourse.courseType || 'New Course',
        board: selectedCourse.board,
        academicLevel: selectedCourse.level,
        subjectsOfInterest:
          applySelectedSubjects.length > 0
            ? applySelectedSubjects.join(', ')
            : undefined,
        enrolledSubjects:
          applySelectedSubjects.length > 0 ? applySelectedSubjects : undefined,
        preferredMode: applyMode,
        preferredShift: applyShift,
        message: 'Submitted via Home Page Admission Form',
      });
      setApplySuccessRef(ref);
      setApplyName('');
      setApplyPhone('');
      setApplyEmail('');
      setApplySelectedSubjects([]);
    } catch {
      setApplyError('Unable to submit admission request right now. Please try the full admission page.');
    } finally {
      setApplySubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50/70 min-h-[calc(100vh-140px)]">
      {/* Compact Institutional Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#12315A] via-[#183b6a] to-[#12315A] text-white pt-10 pb-20 sm:pt-14 sm:pb-24">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-2.5">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            <span className="text-amber-400">SHIKSHYALAYA</span>{' '}
            <span className="text-white">SHAIKSHIK SANSTHA</span>
          </h1>
          <p className="font-['Noto_Sans_Devanagari',sans-serif] text-lg sm:text-2xl font-bold text-amber-300">
            शिक्षालय शैक्षिक संस्था
          </p>
          <p className="text-sm sm:text-base font-medium text-blue-200 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span>Feel the magic of learning.</span>
          </p>
        </div>
      </section>

      {/* Main 1st Page Layout: Single Unified Login on top, Apply for Admission below */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 pb-16 sm:pb-24 relative z-20 space-y-8">
        {/* Top Card: Single Unified Login (routes Student -> Student Dashboard, Admin -> Admin Dashboard) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg hover:shadow-xl transition-shadow p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#12315A] via-blue-600 to-amber-500" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            {/* Left Info Panel */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Portal Login</span>
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#12315A] tracking-tight">
                  Sign In
                </h2>
                <p className="font-['Noto_Sans_Devanagari',sans-serif] text-base font-bold text-blue-700 mt-0.5">
                  पोर्टल लगइन
                </p>
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  Sign in with your institutional credentials. You will be automatically directed to your Student Dashboard or Administrative Portal based on your account.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
                <Link
                  to="/student/login"
                  className="font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                >
                  <span>Full Login Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="#apply-admission"
                  className="font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  New student? Apply below ↓
                </a>
              </div>
            </div>

            {/* Right Login Form / Active Session Panel */}
            <div className="lg:col-span-7">
              {currentUser ? (
                currentUser.role === 'admin' ? (
                  <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-5 sm:p-6 space-y-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-[#12315A] text-amber-400 flex items-center justify-center shadow-sm shrink-0">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Administrator Session Active
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1 truncate">
                          {currentUser.name || 'Institute Administrator'}
                        </h4>
                        <p className="text-xs text-slate-600 truncate">{currentUser.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-amber-200/70">
                      <Link
                        to="/admin"
                        className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#12315A] hover:bg-[#1a447c] shadow-sm transition-colors"
                      >
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span>Open Admin Dashboard</span>
                      </Link>
                      <button
                        type="button"
                        onClick={logout}
                        className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-semibold text-xs text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50/80 rounded-2xl border border-emerald-200 p-5 sm:p-6 space-y-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Student Session Active
                          </span>
                          <span className="text-xs text-slate-500 font-mono truncate">
                            {currentUser.id}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5 truncate">
                          {currentUser.name}
                        </h4>
                        <p className="text-xs text-slate-600 truncate">{currentUser.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-emerald-200/60">
                      <Link
                        to="/student/dashboard"
                        className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>Open Student Dashboard</span>
                      </Link>
                      <Link
                        to="/study-materials"
                        className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-semibold text-xs text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                        <span>Materials</span>
                      </Link>
                      <button
                        type="button"
                        onClick={logout}
                        className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-semibold text-xs text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <form onSubmit={handleUnifiedLogin} className="space-y-4">
                  {loginError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-snug">{loginError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor="home-login-id"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                      >
                        User ID / Phone / Email *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="home-login-id"
                          type="text"
                          value={loginId}
                          onChange={(e) => setLoginId(e.target.value)}
                          placeholder="Student ID, Phone, Email, or Username"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="home-login-password"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                      >
                        Password / Passcode
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="home-login-password"
                          type={showPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter password or passcode"
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="home-login-course"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                    >
                      Academic Program (For Student Access)
                    </label>
                    <select
                      id="home-login-course"
                      value={loginCourseSlug}
                      onChange={(e) => setLoginCourseSlug(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                    >
                      {courses.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#12315A] hover:bg-blue-800 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    <LogIn className="w-4 h-4 text-amber-400" />
                    <span>{loginLoading ? 'Authenticating...' : 'Login'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Card: Apply for Admission (Directly Below Login) */}
        <div
          id="apply-admission"
          className="bg-white rounded-3xl border border-slate-200/90 shadow-lg hover:shadow-xl transition-shadow p-6 sm:p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admissions Open</span>
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  2026 / 2081-82
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#12315A] tracking-tight">
                  Apply for Admission
                </h2>
                <p className="font-['Noto_Sans_Devanagari',sans-serif] text-base font-bold text-amber-700 mt-0.5">
                  अनलाइन भर्ना आवेदन फारम
                </p>
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  Enroll in specialized coaching batches for TU Management degrees (BBS, BBA, BBM, MBS), NEB +2 Science & Management, Pokhara University BBA, and Loksewa Aayog preparations.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to={`/admission?course=${applyCourseSlug}`}
                  className="font-bold text-xs text-amber-700 hover:text-amber-900 inline-flex items-center gap-1.5"
                >
                  <span>Open Full Admission Form & Payment Voucher Upload</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-7">
              {applySuccessRef ? (
                <div className="bg-emerald-50/90 rounded-2xl border border-emerald-200 p-5 space-y-3.5">
                  <div className="flex items-center gap-2.5 text-emerald-800">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-sm font-bold">Application Submitted!</p>
                      <p className="text-xs text-emerald-700">Reference Number Generated</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-emerald-200 p-3 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Admission Reference Code
                    </span>
                    <span className="text-base font-black font-mono text-[#12315A]">
                      {applySuccessRef}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Save this reference code. You can upload your payment voucher on the full admission portal or wait for our admissions desk to contact you.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <Link
                      to={`/admission?course=${applyCourseSlug}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-[#12315A] hover:bg-[#1a447c] transition-colors"
                    >
                      <span>Upload Payment Proof / Full Form</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setApplySuccessRef(null)}
                      className="py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                    >
                      Submit Another Application
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleHomeApply} className="space-y-3.5">
                  {applyError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-snug">{applyError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor="home-apply-name"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                      >
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="home-apply-name"
                          type="text"
                          value={applyName}
                          onChange={(e) => setApplyName(e.target.value)}
                          placeholder="Enter student full name"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="home-apply-phone"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                      >
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="home-apply-phone"
                          type="tel"
                          value={applyPhone}
                          onChange={(e) => setApplyPhone(e.target.value)}
                          placeholder="e.g. 98XXXXXXXX"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="home-apply-course"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                      >
                        Academic Program *
                      </label>
                      <select
                        id="home-apply-course"
                        value={applyCourseSlug}
                        onChange={(e) => {
                          setApplyCourseSlug(e.target.value);
                          setApplySelectedSubjects([]);
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium"
                      >
                        {courses.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="home-apply-mode"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                      >
                        Class Mode
                      </label>
                      <select
                        id="home-apply-mode"
                        value={applyMode}
                        onChange={(e) => setApplyMode(e.target.value as ClassMode)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-medium"
                      >
                        <option value="Offline">Physical</option>
                        <option value="Online">Online Live</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="home-apply-shift"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                      >
                        Shift
                      </label>
                      <select
                        id="home-apply-shift"
                        value={applyShift}
                        onChange={(e) => setApplyShift(e.target.value as 'Morning' | 'Day' | 'Evening' | 'Flexible')}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-medium"
                      >
                        <option value="Morning">Morning</option>
                        <option value="Day">Day</option>
                        <option value="Evening">Evening</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    </div>
                  </div>

                  {applyCourseSubjectOptions.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Select Specific Subjects You Want (Optional)
                      </label>
                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        {applyCourseSubjectOptions.map((subj) => {
                          const isSelected = applySelectedSubjects.includes(subj);
                          return (
                            <button
                              key={subj}
                              type="button"
                              onClick={() => toggleApplySubject(subj)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                                isSelected
                                  ? 'bg-[#12315A] text-white border-[#12315A]'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                              }`}
                            >
                              {subj}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={applySubmitting}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    <Send className="w-4 h-4" />
                    <span>{applySubmitting ? 'Submitting...' : 'Apply for Admission'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Faculties List Below Apply for Admission */}
        {publishedTeachers.length > 0 && (
          <div
            id="faculties"
            className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-8 relative overflow-hidden space-y-6"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#12315A] via-blue-700 to-[#12315A]" />

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold uppercase tracking-wider mb-2">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  <span>Academic Mentors</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#12315A] tracking-tight">
                  Our Experienced Faculty
                </h2>
                <p className="font-['Noto_Sans_Devanagari',sans-serif] text-sm font-bold text-blue-700 mt-0.5">
                  हाम्रा अनुभवी प्राध्यापकहरू
                </p>
              </div>

              <Link
                to="/teachers"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 self-start sm:self-auto"
              >
                <span>View Full Faculty Profiles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {publishedTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-slate-50/70 rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 relative">
                      <img
                        src={teacher.avatarUrl}
                        alt={teacher.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                        {teacher.experience}
                      </div>
                    </div>

                    <div className="p-4 space-y-2.5">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#12315A] transition-colors">
                          {teacher.name}
                        </h3>
                        {teacher.devanagariName && (
                          <p className="text-[11px] font-['Noto_Sans_Devanagari',sans-serif] text-slate-500 font-medium">
                            {teacher.devanagariName}
                          </p>
                        )}
                        <p className="text-xs font-bold text-blue-700 mt-0.5">
                          {teacher.designation}
                        </p>
                      </div>

                      <p className="text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                        {teacher.qualification}
                      </p>

                      {teacher.specialization.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {teacher.specialization.map((spec, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-blue-50 text-blue-800 border border-blue-100 px-2 py-0.5 rounded font-semibold"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
