import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Clock,
  BookOpen,
  Calendar,
  CheckCircle2,
  Users,
  Award,
  ChevronRight,
  ShieldCheck,
  Send,
  ArrowRight,
  FileText,
  AlertCircle,
  Sparkles,
  History,
  BookmarkCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassMode } from '../types';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { courses, teachers, submitAdmissionInquiry, language } = useApp();

  const course = courses.find(
    (c) =>
      c.slug === slug ||
      (slug === '3-year-bbs-tu' && c.slug === 'bbs-tu-old') ||
      (slug === 'bbs-tu-old' && c.slug === '3-year-bbs-tu')
  );

  // Quick inquiry form state
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMode, setInquiryMode] = useState<ClassMode>('Offline');
  const [inquiryShift, setInquiryShift] = useState<'Morning' | 'Day' | 'Evening' | 'Flexible'>('Morning');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccessRef, setSubmitSuccessRef] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('ALL');
  const [selectedCourseType, setSelectedCourseType] = useState<'All' | 'New Course' | 'Old Course'>(() => {
    if (course?.courseType === 'Old Course' || slug?.includes('3-year') || slug?.includes('old')) {
      return 'Old Course';
    }
    return 'New Course';
  });

  useEffect(() => {
    if (course?.courseType === 'Old Course' || slug?.includes('3-year') || slug?.includes('old')) {
      setSelectedCourseType('Old Course');
    } else {
      setSelectedCourseType('New Course');
    }
    setSelectedTerm('ALL');
  }, [course?.courseType, slug]);

  if (!course) {
    return (
      <div className="py-20 max-w-xl mx-auto px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Course Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested educational course could not be located in our directory.
        </p>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-[#12315A]"
        >
          <span>Browse All Available Courses</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Get assigned teachers
  const assignedTeachers = teachers.filter((t) =>
    course.assignedTeacherIds.includes(t.id) || t.assignedCourseSlugs.includes(course.slug)
  );

  const handleQuickInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!inquiryName.trim() || !inquiryPhone.trim()) {
      setFormError('Please enter your full name and contact phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const ref = await submitAdmissionInquiry({
        fullName: inquiryName,
        email: inquiryEmail || 'not-provided@example.com',
        phone: inquiryPhone,
        courseSlug: course.slug,
        courseName: course.title,
        courseType: course.courseType || 'New Course',
        board: course.board,
        academicLevel: course.level,
        preferredMode: inquiryMode,
        preferredShift: inquiryShift,
        message: inquiryMessage,
      });

      setSubmitSuccessRef(ref);
      setInquiryName('');
      setInquiryEmail('');
      setInquiryPhone('');
      setInquiryMessage('');
    } catch (err) {
      setFormError('Failed to record your inquiry. Please try again or call our office.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-10 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-blue-700">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link to="/courses" className="hover:text-blue-700">Courses</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-semibold text-slate-800">{course.title}</span>
        </nav>
      </div>

      {/* Course Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-[#12315A] via-[#1b4379] to-[#12315A] text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wide">
                {course.board}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  course.courseType === 'Old Course'
                    ? 'bg-amber-300 text-slate-950 shadow-xs'
                    : 'bg-white/20 text-blue-100 border border-white/20'
                }`}
              >
                {course.courseType || 'New Course'}
                {course.syllabusVersion ? ` • ${course.syllabusVersion}` : ''}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold">
                {course.level}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
                Enrollment Open
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              {course.title}
            </h1>

            {course.devanagariTitle && (
              <p className="font-['Noto_Sans_Devanagari',sans-serif] text-lg sm:text-xl font-bold text-amber-300">
                {course.devanagariTitle}
              </p>
            )}

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              {course.shortDescription}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-blue-100">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span><strong>Duration:</strong> {course.duration}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span><strong>Schedule:</strong> {course.schedule}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span><strong>Modes:</strong> {course.classModes.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Course Details (Left) + Quick Inquiry Form (Right) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Comprehensive Course Details */}
          <div className="lg:col-span-8 space-y-10">
            {/* Overview */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#12315A] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-700" />
                <span>Program Overview</span>
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {course.longDescription}
              </p>

              {/* Key Features */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Key Preparation Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {course.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Eligible / Intended Students */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#12315A] flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-700" />
                <span>Intended Students & Eligibility</span>
              </h2>
              <ul className="space-y-2">
                {course.eligibleStudents.map((elig, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span>{elig}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Subjects and Topics Offered by the Institute */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[#12315A] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-700" />
                    <span>Subjects & Curriculum Modules Offered</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Tuition modules offered according to official university / board curriculum and institute schedule ({course.subjectsOffered.length} total subjects across New & Old courses).
                  </p>
                </div>
              </div>

              {/* Syllabus Switcher: New Course vs Old Course */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      Curriculum Scheme Selection
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      Select Course Syllabus Format
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCourseType('New Course');
                        setSelectedTerm('ALL');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedCourseType === 'New Course'
                          ? 'bg-[#12315A] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>New Course</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCourseType('Old Course');
                        setSelectedTerm('ALL');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedCourseType === 'Old Course'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Old Course (Backpaper)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCourseType('All');
                        setSelectedTerm('ALL');
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedCourseType === 'All'
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      All Subjects
                    </button>
                  </div>
                </div>

                {/* Helpful contextual curriculum notes */}
                {selectedCourseType === 'New Course' && course.newCourseNotes && (
                  <div className="text-xs text-blue-900 bg-blue-50/90 border border-blue-200/80 rounded-xl p-3 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong className="font-semibold text-blue-950">New Course Syllabus: </strong>
                      {course.newCourseNotes}
                    </div>
                  </div>
                )}

                {selectedCourseType === 'Old Course' && course.oldCourseNotes && (
                  <div className="text-xs text-amber-950 bg-amber-50 border border-amber-300/80 rounded-xl p-3 flex items-start gap-2.5">
                    <History className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong className="font-semibold text-amber-950">Old Course / Backpaper Support: </strong>
                      {course.oldCourseNotes}
                    </div>
                  </div>
                )}
              </div>

              {/* Semester / Year Filter Tabs filtered for the active course type */}
              {(() => {
                const availableForType = course.subjectsOffered.filter((s) => {
                  if (selectedCourseType === 'All') return true;
                  return !s.courseType || s.courseType === 'Both' || s.courseType === selectedCourseType;
                });

                const distinctTerms = Array.from(
                  new Set(availableForType.map((s) => s.semesterOrYear).filter(Boolean))
                ) as string[];

                if (distinctTerms.length <= 1) return null;

                return (
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-slate-100 pb-3">
                    <button
                      type="button"
                      onClick={() => setSelectedTerm('ALL')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedTerm === 'ALL'
                          ? 'bg-[#12315A] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All ({availableForType.length})
                    </button>
                    {distinctTerms.map((term) => {
                      const count = availableForType.filter((s) => s.semesterOrYear === term).length;
                      return (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setSelectedTerm(term)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            selectedTerm === term
                              ? 'bg-[#12315A] text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {term} ({count})
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Subjects List */}
              <div className="space-y-3.5">
                {(() => {
                  const matchingSubjects = course.subjectsOffered.filter((s) => {
                    if (selectedCourseType !== 'All' && s.courseType && s.courseType !== 'Both' && s.courseType !== selectedCourseType) {
                      return false;
                    }
                    if (selectedTerm !== 'ALL' && s.semesterOrYear !== selectedTerm) {
                      return false;
                    }
                    return true;
                  });

                  if (matchingSubjects.length === 0) {
                    return (
                      <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
                        <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-sm font-semibold text-slate-700">No subjects listed for the chosen selection.</p>
                        <p className="text-xs text-slate-500">Try switching to &quot;All Subjects&quot; or choosing another academic term.</p>
                      </div>
                    );
                  }

                  return matchingSubjects.map((subj, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-white transition-all space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-slate-900 flex flex-wrap items-center gap-2">
                          <span>{subj.name}</span>
                          {subj.code && (
                            <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                              {subj.code}
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              subj.courseType === 'Old Course'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-blue-50 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {subj.courseType === 'Old Course' ? '📜 Old Course' : '✨ New Course'}
                          </span>
                          {subj.semesterOrYear && (
                            <span className="text-[11px] font-semibold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded">
                              {subj.semesterOrYear}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{subj.description}</p>
                    </div>
                  ));
                })()}
              </div>
            </section>

            {/* Assigned Teachers / Faculty */}
            {assignedTeachers.length > 0 && (
              <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#12315A] flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-700" />
                    <span>Course Instructors & Faculty</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Faculty members assigned to lead lectures and numerical drills for this course.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assignedTeachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-4"
                    >
                      <img
                        src={teacher.avatarUrl}
                        alt={teacher.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div className="space-y-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {teacher.name}
                        </h4>
                        <p className="text-[11px] text-blue-700 font-semibold truncate">
                          {teacher.designation}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {teacher.qualification}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Fee & Batch Information Note */}
            <section className="bg-blue-50/60 p-6 rounded-2xl border border-blue-200 text-xs text-slate-700 space-y-2">
              <h3 className="font-bold text-sm text-[#12315A] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>Tuition Fee & Enrollment Information</span>
              </h3>
              <p className="leading-relaxed">{course.feeInfo}</p>
              <p className="text-slate-500">
                Tuition fees are structured affordably with options for subject-specific enrollment or semester packages. Contact the administration desk or submit the inquiry form for batch schedules.
              </p>
            </section>
          </div>

          {/* Right Column: Embedded Quick Admission Inquiry Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white p-6 sm:p-7 rounded-3xl border-2 border-blue-600 shadow-xl space-y-6">
              <div className="space-y-1.5 border-b border-slate-100 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  Direct Enrollment Inquiry
                </span>
                <h3 className="text-lg font-extrabold text-[#12315A]">
                  Inquire for {course.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Submit your details to receive syllabus notes, fee options, and upcoming batch timings.
                </p>
              </div>

              {submitSuccessRef ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-900">Inquiry Submitted!</h4>
                  <p className="text-xs text-emerald-700">
                    Your reference number is: <br />
                    <strong className="text-sm font-mono text-emerald-950">{submitSuccessRef}</strong>
                  </p>
                  <p className="text-[11px] text-emerald-600">
                    Our academic counselor will contact you shortly with batch schedule details.
                  </p>
                  <button
                    onClick={() => setSubmitSuccessRef(null)}
                    className="mt-2 text-xs font-bold text-emerald-800 underline"
                  >
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleQuickInquiry} className="space-y-4 text-xs">
                  {formError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aayush Shrestha"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Mobile / Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9767648342 / 98XXXXXXXX"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="student@example.com"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Class Mode</label>
                      <select
                        value={inquiryMode}
                        onChange={(e) => setInquiryMode(e.target.value as ClassMode)}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Offline">Offline (Classroom)</option>
                        <option value="Online">Online Live</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Preferred Shift</label>
                      <select
                        value={inquiryShift}
                        onChange={(e) => setInquiryShift(e.target.value as any)}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Morning">Morning Class (5:00 AM – 8:00 AM)</option>
                        <option value="Evening">Evening Class (7:00 PM – 10:00 PM)</option>
                        <option value="Day">Day Batch</option>
                        <option value="Flexible">Flexible Timing</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Subject or Query (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Specify your semester, year, or difficult subjects..."
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-700 to-[#12315A] hover:from-blue-800 hover:to-[#0c2240] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4 text-amber-400" />
                    <span>{submitting ? 'Submitting...' : 'Submit Course Inquiry'}</span>
                  </button>

                  <p className="text-center text-[11px] text-slate-500 pt-1">
                    Want to pick specific subjects from a checklist?{' '}
                    <Link to={`/admission?course=${course.slug}`} className="text-blue-700 font-bold hover:underline">
                      Use Detailed Application Form
                    </Link>
                  </p>

                  <p className="text-[10px] text-slate-400 text-center">
                    We respect your privacy. Inquiries are stored securely.
                  </p>
                </form>
              )}

              <div className="pt-2 border-t border-slate-100 text-center">
                <Link
                  to="/admission"
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  Open Full Application Form &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
