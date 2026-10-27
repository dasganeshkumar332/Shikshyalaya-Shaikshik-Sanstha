import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  Download,
  FileText,
  LogOut,
  Bell,
  CheckCircle2,
  ExternalLink,
  Lock,
  User,
  ShieldCheck,
  Video,
  X,
  Sparkles,
  AlertTriangle,
  Play,
  RotateCcw,
  MessageCircle,
  Phone,
  Radio,
  Users,
  Award,
  FileCheck,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudyMaterial, Course, StudentGroup } from '../types';

export const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    logout,
    courses,
    studyMaterials,
    notices,
    studentGroups,
    updateStudentEnrollment,
    mockTests,
    mockTestSubmissions,
  } = useApp();

  const [activeDownloadModal, setActiveDownloadModal] = useState<StudyMaterial | null>(null);
  const [activeLiveClassModal, setActiveLiveClassModal] = useState<Course | null>(null);
  const [restrictedModalMaterial, setRestrictedModalMaterial] = useState<StudyMaterial | null>(null);
  const [activeTab, setActiveTab] = useState<'enrolled' | 'other'>('enrolled');

  if (!currentUser) {
    return (
      <div className="py-20 max-w-md mx-auto px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Authentication Required</h2>
        <p className="text-xs text-slate-500">Please sign in to access your student portal dashboard.</p>
        <Link
          to="/student/login"
          className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#12315A]"
        >
          Go to Student Login
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Strictly enrolled courses only — NO fallback to un-enrolled courses
  const enrolledCourses = courses.filter((c) =>
    currentUser.enrolledCourseSlugs?.includes(c.slug)
  );

  // Student's assigned groups for communication
  const myGroups = React.useMemo(() => {
    if (!studentGroups || !currentUser) return [];
    return studentGroups.filter((g) => {
      const matchesCourse = currentUser.enrolledCourseSlugs?.includes(g.courseSlug);
      const matchesMember = g.members?.some(
        (m) =>
          (currentUser.phone && m.phone.replace(/[^0-9]/g, '') === currentUser.phone.replace(/[^0-9]/g, '')) ||
          m.fullName.toLowerCase() === currentUser.name.toLowerCase()
      );
      return matchesCourse || matchesMember;
    });
  }, [studentGroups, currentUser]);

  // Strictly enrolled study materials only
  const enrolledMaterials = studyMaterials.filter(
    (m) => m.published && currentUser.enrolledCourseSlugs?.includes(m.courseSlug)
  );

  // Materials of courses where the student is NOT enrolled
  const lockedOtherMaterials = studyMaterials.filter(
    (m) => m.published && !currentUser.enrolledCourseSlugs?.includes(m.courseSlug)
  );

  // Mock tests matching student's enrolled courses
  const myMockTests = React.useMemo(() => {
    if (!mockTests) return [];
    return mockTests.filter(
      (t) =>
        t.published &&
        (!currentUser.enrolledCourseSlugs?.length || currentUser.enrolledCourseSlugs?.includes(t.courseSlug))
    );
  }, [mockTests, currentUser]);

  // Private submissions and evaluations for this student ONLY
  const mySubmissions = React.useMemo(() => {
    if (!mockTestSubmissions || !currentUser) return [];
    const roll = (currentUser.studentId || '').trim().toLowerCase();
    const phone = (currentUser.phone || '').replace(/[^0-9]/g, '');
    const email = (currentUser.email || '').trim().toLowerCase();

    return mockTestSubmissions.filter((sub) => {
      const matchRoll = roll && sub.rollNumber?.toLowerCase() === roll;
      const matchId = sub.studentId === currentUser.id || (roll && sub.studentId?.toLowerCase() === roll);
      const matchPhone = phone && sub.studentPhone?.replace(/[^0-9]/g, '') === phone;
      const matchEmail = email && sub.studentEmail?.toLowerCase() === email;
      return matchRoll || matchId || matchPhone || matchEmail;
    });
  }, [mockTestSubmissions, currentUser]);

  // Quick switcher for testing different enrolled academic batches (New vs Old Course)
  const availablePrograms = [
    { slug: 'bbm-tu', name: 'BBM (TU) [New Course]' },
    { slug: 'bbs-tu', name: 'BBS (TU) [New Course]' },
    { slug: 'bbs-tu-old', name: 'BBS (TU) [Old Course Backpaper]' },
    { slug: 'mbs-tu', name: 'MBS (TU) [New Course]' },
    { slug: 'mbs-tu-old', name: 'MBS (TU) [Old Course Backpaper]' },
    { slug: 'bba-tu', name: 'BBA (TU)' },
    { slug: 'plus-two-management', name: '+2 Management' },
  ];

  const handleSwitchProgram = (slug: string) => {
    updateStudentEnrollment([slug]);
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-[#12315A] via-[#1a4176] to-[#12315A] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xl shadow-md shrink-0">
            <User className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold">{currentUser.name}</h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500 text-white">
                Active Student
              </span>
            </div>
            <p className="text-xs text-blue-200">
              ID: <span className="font-mono text-white font-semibold">{currentUser.studentId || 'SSS-STU-2026-08'}</span> • {currentUser.email}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs">
              <span className="text-blue-200 font-medium">Officially Enrolled:</span>
              {enrolledCourses.length > 0 ? (
                enrolledCourses.map((c) => (
                  <span
                    key={c.slug}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-bold text-[11px] shadow-2xs"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-800" />
                    <span>{c.title}</span>
                  </span>
                ))
              ) : (
                <span className="text-rose-300 font-semibold">No active program enrolled</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Program Enrollment Switcher Bar for testing access verification */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-blue-950">
          <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0" />
          <div>
            <p className="font-bold">Strict Resource Access Control Enforced</p>
            <p className="text-[11px] text-blue-800">
              Students strictly have access only to study materials and live classes of their enrolled batch.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-600">Switch Enrolled Batch:</span>
          {availablePrograms.map((prog) => {
            const isCurrent = currentUser.enrolledCourseSlugs?.includes(prog.slug);
            return (
              <button
                key={prog.slug}
                onClick={() => handleSwitchProgram(prog.slug)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#12315A] text-amber-300 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-blue-100 border border-slate-200'
                }`}
              >
                {prog.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: My Courses & Class Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Enrolled Courses & Private Resources */}
        <div className="lg:col-span-8 space-y-8">
          {/* My Academic Cohort & Immediate Communication Hub */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#12315A] flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                    <span>My Academic Cohort & Immediate Notices</span>
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Live Broadcast Feed
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Connect with your classmates, join the official batch WhatsApp group, and receive real-time notices from your coordinator.
                </p>
              </div>

              {myGroups.length > 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 self-start sm:self-auto">
                  {myGroups.length} Connected Group{myGroups.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {myGroups.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Enrolled Student Group Assignment Pending</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Our administration verifies student registrations within 24 hours. Once assigned to your academic shift, your official batch WhatsApp group and real-time coordinator notices will appear right here.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {myGroups.map((g) => (
                  <div
                    key={g.id}
                    className="p-5 sm:p-6 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/40 via-white to-blue-50/20 space-y-4 shadow-2xs"
                  >
                    {/* Cohort Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              g.courseType === 'Old Course'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {g.courseType || 'New Course'}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {g.shift} Shift
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            Batch {g.academicYearOrBatch}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{g.name}</h3>
                        <p className="text-xs text-slate-500">
                          {g.courseName} • Level: {g.academicLevel}
                        </p>
                      </div>

                      {/* Official WhatsApp Group Join CTA */}
                      {g.whatsappGroupLink && (
                        <a
                          href={g.whatsappGroupLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow transition-transform active:scale-95 shrink-0"
                        >
                          <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                          <span>Join Batch WhatsApp Group</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Coordinator Desk Details */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-white border border-slate-200/80 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                          {g.coordinatorName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Batch Coordinator</p>
                          <p className="font-bold text-slate-800">{g.coordinatorName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`tel:${g.coordinatorPhone}`}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5"
                        >
                          <Phone className="w-3 h-3 text-blue-600" />
                          <span>Call: {g.coordinatorPhone}</span>
                        </a>
                        <a
                          href={`https://wa.me/977${g.coordinatorPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1.5"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    {/* Live Broadcast Notices Feed */}
                    <div className="space-y-2 pt-1">
                      <h4 className="font-bold text-xs text-[#12315A] uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                          <span>Immediate Batch Notices & Alerts</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {g.broadcasts?.length || 0} Broadcast Notice{g.broadcasts?.length !== 1 ? 's' : ''}
                        </span>
                      </h4>

                      {(!g.broadcasts || g.broadcasts.length === 0) ? (
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-500 text-xs italic text-center">
                          All clear! No urgent notices or class schedule alerts posted for this batch today.
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {g.broadcasts.map((b) => (
                            <div
                              key={b.id}
                              className={`p-3.5 rounded-xl border text-xs space-y-1.5 shadow-2xs ${
                                b.urgency === 'Urgent / Exam Alert'
                                  ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                                  : b.urgency === 'Important'
                                  ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                                  : 'bg-white border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                    b.urgency === 'Urgent / Exam Alert'
                                      ? 'bg-rose-200 text-rose-900 font-black'
                                      : b.urgency === 'Important'
                                      ? 'bg-amber-200 text-amber-900'
                                      : 'bg-blue-100 text-blue-900'
                                  }`}
                                >
                                  {b.urgency}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {b.sentAt} • {b.sentBy}
                                </span>
                              </div>
                              <h5 className="font-bold text-sm text-slate-900">{b.title}</h5>
                              <p className="text-slate-700 leading-relaxed whitespace-pre-line text-xs">
                                {b.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Mock Tests & Evaluated Results with Examiner Feedback */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#12315A] flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>My Mock Tests & Evaluated Results</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Timed exam question papers, upload your answers before time expires, and view private marks with examiner remarks.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to="/upload-answer-sheet"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <FileText className="w-4 h-4 text-rose-700" />
                  <span>Upload Answer Sheet (PDF) &rarr;</span>
                </Link>
                <Link
                  to="/mock-tests"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#12315A] hover:bg-blue-900 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Timed Mock Exams</span>
                </Link>
              </div>
            </div>

            {/* Quick Answer Sheet Upload CTA Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-blue-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                  PDF
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Upload Your Scanned Answer Sheet (PDF Format Only)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Have an offline practice paper, TU mock test, or backpaper test? Upload your merged single PDF for faculty grading and written feedback.
                  </p>
                </div>
              </div>
              <Link
                to="/upload-answer-sheet"
                className="px-4 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-500 transition-colors shadow-sm shrink-0 flex items-center justify-center gap-1.5"
              >
                <span>Upload PDF Sheet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Private Results & Examiner Feedback Section */}
            {mySubmissions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>My Evaluated Answer Sheets & Examiner Critique ({mySubmissions.length})</span>
                  </h3>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 font-bold px-2 py-0.5 rounded border border-emerald-200">
                    Confidential to You
                  </span>
                </div>

                <div className="space-y-4">
                  {mySubmissions.map((sub) => {
                    const testMeta = mockTests.find((t) => t.id === (sub.testId || sub.mockTestId));
                    const fullMarks = testMeta?.fullMarks || 100;
                    const passMarks = testMeta?.passMarks || 40;
                    const isPassed = sub.marksObtained !== undefined ? sub.marksObtained >= passMarks : false;
                    const displayTitle = sub.testTitle || sub.mockTestTitle || testMeta?.title || 'Mock Examination';
                    const displaySubject = sub.subject || testMeta?.subject || 'Exam Subject';
                    const displayCourseType = sub.courseType || testMeta?.courseType || 'New Course';

                    return (
                      <div
                        key={sub.id}
                        className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  displayCourseType === 'Old Course'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-blue-100 text-blue-900'
                                }`}
                              >
                                {displayCourseType}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                              </span>
                              {sub.isLateSubmission && (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                                  Late
                                </span>
                              )}
                            </div>
                            <h4 className="text-base font-bold text-[#12315A] mt-1">{displayTitle}</h4>
                            <p className="text-xs text-slate-600">
                              Subject: <strong>{displaySubject}</strong> • Roll: <span className="font-mono">{sub.rollNumber}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {sub.evaluationStatus === 'Evaluated' ? (
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                                    isPassed
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                                  }`}
                                >
                                  {isPassed ? 'PASSED' : 'NEEDS REVISION'}
                                </span>
                                <div className="bg-slate-900 text-amber-400 font-extrabold text-base px-3 py-1 rounded-xl shadow-2xs">
                                  {sub.marksObtained} <span className="text-xs text-slate-300 font-normal">/ {fullMarks}</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900">
                                {sub.evaluationStatus === 'Under Review' ? 'Under Review' : 'Awaiting Examiner'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Examiner Feedback Remarks Critique */}
                        {sub.evaluationStatus === 'Evaluated' && sub.feedbackRemarks && (
                          <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-amber-600" />
                                <span>Official Examiner Feedback & Evaluation Remarks:</span>
                              </span>
                              {sub.evaluatedBy && (
                                <span className="text-slate-600 font-medium">
                                  Examiner: <strong>{sub.evaluatedBy}</strong>
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-white/80 p-3 rounded-xl border border-amber-200/50">
                              {sub.feedbackRemarks}
                            </p>
                          </div>
                        )}

                        {/* Files */}
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                          <div className="text-slate-500">
                            {sub.timeTakenSeconds && (
                              <span>
                                Duration: {Math.floor(sub.timeTakenSeconds / 60)}m {sub.timeTakenSeconds % 60}s
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {sub.evaluatedPaperUrl && (
                              <a
                                href={sub.evaluatedPaperUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition-colors flex items-center gap-1"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                <span>Checked Paper PDF</span>
                              </a>
                            )}
                            {sub.answerFileUrl && (
                              <a
                                href={sub.answerFileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>My Uploaded Answer Sheet</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Enrolled Mock Tests */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-700" />
                <span>Upcoming & Active Mock Exams For Your Courses</span>
              </h3>

              {myMockTests.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No mock tests scheduled for your enrolled course at the moment. Check back soon!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {myMockTests.slice(0, 4).map((test) => (
                    <div
                      key={test.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/30 transition-colors flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${
                              test.courseType === 'Old Course'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-blue-100 text-blue-900'
                            }`}
                          >
                            {test.courseType}
                          </span>
                          <span className="text-[10px] font-mono font-semibold text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>{test.durationMinutes}m</span>
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{test.title}</h4>
                        <p className="text-[11px] text-slate-500">{test.subject} • Full Marks: {test.fullMarks}</p>
                      </div>

                      <Link
                        to="/mock-tests"
                        className="w-full text-center px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#12315A] hover:bg-blue-900 transition-colors"
                      >
                        Start Timed Exam &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Enrolled Courses */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#12315A] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-700" />
                <span>My Enrolled Academic Batches</span>
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                {enrolledCourses.length} Registered Program{enrolledCourses.length !== 1 ? 's' : ''}
              </span>
            </div>

            {enrolledCourses.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">No Active Course Enrollment</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You are not currently enrolled in any academic program. Please submit an admission inquiry to enroll in a batch and unlock study materials.
                </p>
                <Link
                  to="/admission"
                  className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#12315A]"
                >
                  Apply for Admission
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {enrolledCourses.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl border border-blue-200/80 bg-blue-50/20 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                          {c.board}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{c.title}</h3>
                      </div>
                      <Link
                        to={`/courses/${c.slug}`}
                        className="text-xs font-bold text-blue-700 hover:underline"
                      >
                        View Syllabus &rarr;
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{c.schedule}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>Regular Class: Sun – Fri</span>
                      </span>
                    </div>

                    {/* Secure Live Class Link Box for Enrolled Students */}
                    <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <p className="font-bold text-blue-900 flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-blue-700" />
                          <span>Today's Live Class Room ({c.title})</span>
                        </p>
                        <p className="text-[11px] text-blue-700">Digital whiteboard interactive lecture session.</p>
                      </div>
                      <button
                        onClick={() => setActiveLiveClassModal(c)}
                        className="px-3.5 py-1.5 rounded-lg font-bold text-white bg-blue-700 hover:bg-blue-800 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Join Live Lecture</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enrolled Student Resources */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#12315A] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-700" />
                  <span>Academic Study Resources</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Resources are strictly separated by enrolled program.
                </p>
              </div>

              {/* Tab Selector: My Enrolled vs Other Programs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
                <button
                  onClick={() => setActiveTab('enrolled')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'enrolled'
                      ? 'bg-white text-blue-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>My Enrolled ({enrolledMaterials.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('other')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'other'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Other Programs ({lockedOtherMaterials.length})</span>
                </button>
              </div>
            </div>

            {activeTab === 'enrolled' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                  <span>
                    Showing <strong>{enrolledMaterials.length}</strong> unlocked resources for your enrolled program(s)
                  </span>
                  <Link
                    to="/study-materials"
                    className="font-bold text-blue-700 hover:underline"
                  >
                    View All in Library &rarr;
                  </Link>
                </div>

                {enrolledMaterials.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                    No resources uploaded yet for your enrolled program. Check back shortly.
                  </div>
                ) : (
                  enrolledMaterials.map((mat) => (
                    <div
                      key={mat.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            mat.resourceType === 'Recorded Videos' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {mat.resourceType}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Unlocked
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 truncate">{mat.title}</h4>
                        <p className="text-slate-500 text-[11px]">
                          {mat.courseName} • {mat.subject} • {mat.semesterOrYear}
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveDownloadModal(mat)}
                        className="px-3.5 py-2 rounded-lg font-bold text-white bg-[#12315A] hover:bg-blue-900 shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {mat.resourceType === 'Recorded Videos' ? (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current text-rose-400" />
                            <span>Watch</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5 text-amber-400" />
                            <span>Download</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p>
                    <strong>Access Restricted:</strong> The resources below belong to other courses. You cannot view or download them because you are not enrolled in those programs.
                  </p>
                </div>

                {lockedOtherMaterials.slice(0, 6).map((mat) => (
                  <div
                    key={mat.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4 text-xs opacity-85"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                          {mat.resourceType}
                        </span>
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Enrollment Required</span>
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-700 truncate">{mat.title}</h4>
                      <p className="text-slate-400 text-[11px]">
                        Program: <strong className="text-slate-600">{mat.courseName}</strong> • {mat.subject}
                      </p>
                    </div>

                    <button
                      onClick={() => setRestrictedModalMaterial(mat)}
                      className="px-3 py-1.5 rounded-lg font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 shrink-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Locked</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Academic Calendar & Important Notices */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Support / Counselor */}
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl space-y-3 text-xs">
            <h3 className="font-bold text-sm text-amber-950 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-amber-600" />
              <span>Academic Counselor Desk</span>
            </h3>
            <p className="text-amber-900 leading-relaxed">
              Need to add another subject, change your class shift, or request exam numericals? Reach out directly to your assigned faculty coordinator.
            </p>
            <div className="pt-2">
              <Link
                to="/contact"
                className="w-full py-2.5 rounded-xl font-bold text-amber-950 bg-amber-300 hover:bg-amber-400 text-center block transition-colors"
              >
                Contact Counselor Desk
              </Link>
            </div>
          </div>

          {/* Student Notices Feed */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#12315A] flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-700" />
              <span>Academic Notices for Students</span>
            </h3>

            <div className="space-y-3">
              {notices.slice(0, 3).map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-blue-700 uppercase">{n.category}</span>
                    <span>{n.publishDate}</span>
                  </div>
                  <h4 className="font-bold text-slate-800">{n.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Download / Resource Access Modal (Enrolled Student Verified) */}
      {activeDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-5 relative">
            <button
              onClick={() => setActiveDownloadModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Enrolled Access Verified
                </span>
                <h3 className="text-base font-bold text-[#12315A] mt-0.5">
                  Academic Document Ready
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <p className="font-bold text-slate-900 text-sm leading-snug">{activeDownloadModal.title}</p>
              <div className="text-slate-600 space-y-1">
                <p><strong>Course:</strong> {activeDownloadModal.courseName}</p>
                <p><strong>Subject:</strong> {activeDownloadModal.subject} ({activeDownloadModal.semesterOrYear})</p>
                <p><strong>Resource Type:</strong> {activeDownloadModal.resourceType} • {activeDownloadModal.fileSize}</p>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              This document is authorized for <strong>{currentUser.name}</strong> ({currentUser.studentId}) as an officially enrolled student.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => {
                  const blob = new Blob([
                    `SHIKSHYALAYA SHAIKSHIK SANSTHA\nResource: ${activeDownloadModal.title}\nCourse: ${activeDownloadModal.courseName}\nSubject: ${activeDownloadModal.subject}\nStudent: ${currentUser.name} (${currentUser.studentId})\nAuthorized Academic Document.`
                  ], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${activeDownloadModal.subject.replace(/\s+/g, '_')}_${activeDownloadModal.title.replace(/\s+/g, '_')}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  setActiveDownloadModal(null);
                }}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-[#12315A] hover:bg-blue-900 transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Save to Device</span>
              </button>
              <button
                onClick={() => setActiveDownloadModal(null)}
                className="py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Class Session Modal */}
      {activeLiveClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-5 relative">
            <button
              onClick={() => setActiveLiveClassModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Live Classroom Verified
                </span>
                <h3 className="text-base font-bold text-[#12315A] mt-0.5">
                  Virtual Lecture Session
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <p className="font-bold text-slate-900 text-sm">{activeLiveClassModal.title}</p>
              <p className="text-slate-600"><strong>Schedule:</strong> {activeLiveClassModal.schedule}</p>
              <p className="text-slate-600"><strong>Authenticated Student:</strong> {currentUser.name} ({currentUser.studentId})</p>
              <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-emerald-700 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Secure whiteboard meeting link authorized</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <a
                href={activeLiveClassModal.classModes.includes('Online') ? 'https://meet.google.com' : '#'}
                target="_blank"
                rel="noreferrer"
                onClick={() => setActiveLiveClassModal(null)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-sm flex items-center justify-center gap-1.5 text-center"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Launch Virtual Classroom</span>
              </a>
              <button
                onClick={() => setActiveLiveClassModal(null)}
                className="py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restricted Modal for Non-enrolled click */}
      {restrictedModalMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-5 relative">
            <button
              onClick={() => setRestrictedModalMaterial(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Access Denied
                </span>
                <h3 className="text-base font-bold text-[#12315A] mt-0.5">
                  Not Enrolled in {restrictedModalMaterial.courseName}
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <p className="font-bold text-slate-900">{restrictedModalMaterial.title}</p>
              <p className="text-slate-600">
                Course: <strong>{restrictedModalMaterial.courseName}</strong> • Subject: <strong>{restrictedModalMaterial.subject}</strong>
              </p>
              <p className="text-amber-900 font-medium bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 mt-2">
                Your current account is enrolled in <strong>{enrolledCourses.map((c) => c.title).join(', ') || 'no programs'}</strong>. You do not have permission to view or download materials for {restrictedModalMaterial.courseName}.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Link
                to={`/admission?course=${restrictedModalMaterial.courseSlug}`}
                onClick={() => setRestrictedModalMaterial(null)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-[#12315A] hover:bg-blue-900 transition-colors text-center shadow-xs"
              >
                Apply to Enroll in this Course
              </Link>
              <button
                onClick={() => setRestrictedModalMaterial(null)}
                className="py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
