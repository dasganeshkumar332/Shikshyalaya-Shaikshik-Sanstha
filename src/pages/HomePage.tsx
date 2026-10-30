import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
  Calendar,
  ChevronDown,
  HelpCircle,
  Clock,
  Sparkles,
  Search,
  BookCheck,
  TrendingUp,
  Brain,
  Compass,
  Briefcase,
  Target,
  Atom,
  Calculator,
  Landmark,
  FileText,
  Shield,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InstituteLogo } from '../components/common/InstituteLogo';

export const getCourseBadge = (slug: string) => {
  switch (slug) {
    case 'loksewa-officer-level-6':
      return {
        icon: Sparkles,
        shortLabel: 'Loksewa 6th Level',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-400',
        iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-amber-200',
        accentColor: 'text-amber-800',
      };
    case 'loksewa-nayab-subba':
      return {
        icon: Shield,
        shortLabel: 'Loksewa Na.Su.',
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        iconBg: 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-200',
        accentColor: 'text-emerald-700',
      };
    case 'loksewa-section-officer':
      return {
        icon: Landmark,
        shortLabel: 'Section Officer',
        badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
        iconBg: 'bg-gradient-to-br from-blue-700 to-indigo-800 text-white shadow-blue-200',
        accentColor: 'text-blue-700',
      };
    case 'loksewa-kharidar':
      return {
        icon: FileText,
        shortLabel: 'Loksewa Kharidar',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        iconBg: 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-amber-200',
        accentColor: 'text-amber-700',
      };
    case 'loksewa-banking-preparation':
      return {
        icon: Briefcase,
        shortLabel: 'Loksewa Banking',
        badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
        iconBg: 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-cyan-200',
        accentColor: 'text-cyan-700',
      };
    case 'teachers-service-commission-tsc':
      return {
        icon: GraduationCap,
        shortLabel: 'TSC (शिक्षक सेवा)',
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
        iconBg: 'bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-rose-200',
        accentColor: 'text-rose-700',
      };
    case 'bbs-tu':
      return {
        icon: Award,
        shortLabel: 'BBS (TU)',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-200',
        accentColor: 'text-amber-600',
      };
    case 'bba-tu':
      return {
        icon: TrendingUp,
        shortLabel: 'BBA (TU)',
        badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
        iconBg: 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-200',
        accentColor: 'text-blue-600',
      };
    case 'bbm-tu':
      return {
        icon: Target,
        shortLabel: 'BBM (TU)',
        badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
        iconBg: 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-indigo-200',
        accentColor: 'text-indigo-600',
      };
    case 'mbs-tu':
      return {
        icon: GraduationCap,
        shortLabel: 'MBS (TU)',
        badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
        iconBg: 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-purple-200',
        accentColor: 'text-purple-600',
      };
    case 'plus-two-science':
      return {
        icon: Atom,
        shortLabel: '+2 Science',
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        iconBg: 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-emerald-200',
        accentColor: 'text-emerald-600',
      };
    case 'plus-two-management':
      return {
        icon: Calculator,
        shortLabel: '+2 Mgmt',
        badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
        iconBg: 'bg-gradient-to-br from-cyan-600 to-cyan-700 text-white shadow-cyan-200',
        accentColor: 'text-cyan-600',
      };
    case 'bba-pokhara-university':
      return {
        icon: Landmark,
        shortLabel: 'BBA (PU)',
        badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
        iconBg: 'bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-teal-200',
        accentColor: 'text-teal-600',
      };
    default:
      return {
        icon: BookOpen,
        shortLabel: 'Course',
        badgeColor: 'bg-slate-100 text-slate-900 border-slate-300',
        iconBg: 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-200',
        accentColor: 'text-blue-600',
      };
  }
};

export const HomePage: React.FC = () => {
  const { settings, courses, teachers, notices, language } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const featuredCourses = courses;
  const featuredTeachers = teachers.slice(0, 4);
  const recentNotices = notices.slice(0, 4);

  const benefits = [
    {
      title: 'Student-Focused Teaching',
      devanagari: 'विद्यार्थी-केन्द्रित सिकाइ',
      desc: 'Interactive lectures prioritizing individual student queries, learning pace, and clear conceptual understanding.',
      icon: Users,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Exam-Oriented Preparation',
      devanagari: 'परीक्षा-केन्द्रित तयारी',
      desc: 'Rigorous drills on past Tribhuvan University, Pokhara University, and NEB board examination question patterns.',
      icon: BookCheck,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      title: 'Structured Course Coverage',
      devanagari: 'व्यवस्थित पाठ्यक्रम समेटाइ',
      desc: 'Systematic module-by-module syllabus completion ahead of final exams with dedicated revision periods.',
      icon: TrendingUp,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      title: 'Conceptual Understanding',
      devanagari: 'अवधारणागत स्पष्टता',
      desc: 'Moving beyond rote memorization to strengthen fundamental derivations, accounting logic, and business formulas.',
      icon: Brain,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Academic Guidance & Mentoring',
      devanagari: 'शैक्षिक मार्गदर्शन र परामर्श',
      desc: 'Personalized mentoring for university exam strategies, study discipline, and future academic pathway choices.',
      icon: Compass,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      title: 'Supportive Learning Environment',
      devanagari: 'सकारात्मक सिकाइ वातावरण',
      desc: 'Comfortable physical classrooms and high-definition online classes with recorded lectures and digital study notes.',
      icon: Award,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
    },
  ];

  const teachingSteps = [
    {
      step: '01',
      title: 'Understand Academic Requirements',
      desc: 'Assess syllabus scope, university exam grids, and individual student strengths and subject challenges.',
    },
    {
      step: '02',
      title: 'Explain Fundamental Concepts Clearly',
      desc: 'Deliver lucid, step-by-step explanations of core theories, accounting entries, math formulas, and scientific laws.',
    },
    {
      step: '03',
      title: 'Provide Topic-Wise Notes & Resources',
      desc: 'Distribute structured handwritten notes, summary sheets, formula guides, and digital PDF study packages.',
    },
    {
      step: '04',
      title: 'Practice Important Exam Problems',
      desc: 'Solve extensive previous board questions, model papers, and complex numericals directly in class.',
    },
    {
      step: '05',
      title: 'Assessments & Revision Sessions',
      desc: 'Conduct unit evaluations, simulated test papers, and rapid pre-board revision marathons.',
    },
    {
      step: '06',
      title: 'Academic Feedback & Mentoring',
      desc: 'Provide actionable feedback to sharpen exam presentation, time management, and answer structuring.',
    },
  ];

  const faqs = [
    {
      q: 'Which courses and academic programs are available at Shikshyalaya?',
      a: 'We currently provide specialized academic tuition and exam preparation for our academic programs: 4-Year BBS & 3-Year BBS (TU Old Course), MBS - TU, BBA - TU, BBM - TU, +2 Science (NEB), +2 Management (NEB), and BBA – Pokhara University (PU).',
    },
    {
      q: 'Do you provide tuition for Tribhuvan University (TU) programs?',
      a: 'Yes. We offer comprehensive subject-wise tuition for MBS (TU – Semesters 1 to 4), BBS (both Revised 4-Year and 3-Year Legacy Course for backpapers), BBA (TU – Semesters 1 to 8), and BBM (TU – Semesters 1 to 8).',
    },
    {
      q: 'Do you offer +2 Science tuition classes?',
      a: 'Yes. We run dedicated batches for Grade 11 and Grade 12 Science students under NEB, covering Physics, Chemistry, Mathematics, and Biology with emphasis on numerical problem solving and board exam derivations.',
    },
    {
      q: 'Do you offer +2 Management tuition classes?',
      a: 'Yes. Our +2 Management classes cover Principles of Accounting, Economics, Business Mathematics, and Business Studies for both Grade 11 and Grade 12 students.',
    },
    {
      q: 'Is tuition available for BBA under Pokhara University?',
      a: 'Yes. We maintain separate, dedicated tuition classes specifically structured according to the Pokhara University (PU) syllabus, semester grading system, and past PU exam papers.',
    },
    {
      q: 'Are online classes available for students living outside Kathmandu?',
      a: 'Yes! We offer live interactive online classes via digital whiteboard streaming, with digital PDF notes and recorded revision access for students across Nepal.',
    },
    {
      q: 'How can I enroll or apply for admission?',
      a: 'You can submit an online inquiry through our website’s "Apply for Admission" page, or contact our admissions desk via phone or WhatsApp. Our academic counselor will confirm batch timings and guide you through the enrollment process.',
    },
    {
      q: 'How can I obtain study materials and model papers?',
      a: 'Enrolled students can access class notes, question banks, and formula sheets from our "Study Materials" portal. Selected open-access revision resources are also freely accessible to prospective students.',
    },
    {
      q: 'How can I contact the institute for fee details or campus visit?',
      a: 'You can reach us through our contact page, call our administrative phone numbers (+977 9767648342), chat directly on WhatsApp, or visit our office during regular hours (Sunday to Friday 6:00 AM – 7:30 PM).',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* SECTION A: Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#12315A] via-[#1a3d6d] to-[#12315A] text-white py-16 sm:py-24 lg:py-28">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left min-w-0 relative z-20">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Academic Tuition & Exam Preparation</span>
              </div>

              <div className="space-y-2.5">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-black tracking-tight text-white leading-tight">
                  <span className="text-amber-400">SHIKSHYALAYA</span>{' '}
                  <span className="text-white">SHAIKSHIK SANSTHA</span>
                </h1>
                <p className="font-['Noto_Sans_Devanagari',sans-serif] text-xl sm:text-2xl lg:text-3xl font-bold text-amber-300">
                  शिक्षालय शैक्षिक संस्था
                </p>
                <h2 className="text-lg sm:text-xl font-semibold text-blue-200 flex items-center justify-center lg:justify-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  <span>Feel the magic of learning.</span>
                </h2>
              </div>

              <p className="text-slate-200 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Build a strong academic foundation with structured tuition, experienced educators, exam-focused preparation, and personalized academic guidance for +2 and university-level students.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/courses"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-lg hover:shadow-amber-400/20 transition-all duration-200"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Explore Our Courses</span>
                </Link>

                <Link
                  to="/admission"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 border border-blue-400/30 shadow-lg transition-all duration-200"
                >
                  <GraduationCap className="w-5 h-5 text-amber-300" />
                  <span>Apply for Admission</span>
                </Link>

                <Link
                  to="/mock-tests"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-slate-950 bg-white hover:bg-slate-100 shadow-lg transition-all duration-200"
                >
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Mock Tests & Exams</span>
                </Link>

                <Link
                  to="/upload-answer-sheet"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-lg transition-all duration-200"
                >
                  <FileText className="w-4 h-4 text-rose-700" />
                  <span>Upload Answer Sheet (PDF)</span>
                </Link>

                <Link
                  to="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <span>Contact Us</span>
                </Link>
              </div>

              {/* Key Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-blue-800/80 text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">+2 & Uni</p>
                  <p className="text-xs text-blue-200 font-medium">Academic Programs</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white">TU & PU</p>
                  <p className="text-xs text-blue-200 font-medium">Syllabus Guidance</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">3 Modes</p>
                  <p className="text-xs text-blue-200 font-medium">Physical, Online, Hybrid</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative z-10">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-400 to-blue-500 rounded-3xl blur-md opacity-30" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-700">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
                    alt="Students studying in collaborative academic environment at Shikshyalaya Shaikshik Sanstha"
                    className="w-full h-80 sm:h-96 object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Feel the magic of learning.
                    </span>
                    <h3 className="text-lg font-bold">
                      Personalized Guidance for Higher Secondary & University Studies
                    </h3>
                    <p className="text-xs text-slate-300">
                      Structured learning with experienced educators & exam-ready resources.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: Academic Programs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Comprehensive Course Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#12315A] tracking-tight">
              Academic Programs
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Specialized subject coaching and board examination preparation tailored for Tribhuvan University, Pokhara University, and NEB students.
            </p>
          </div>

          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900 transition-colors"
          >
            <span>View All Programs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick Program Directory with BBA and BBM Icons placed just below BBS */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                Quick Program Directory & Academic Icons
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#12315A] mt-1">
                Explore Programs by Academic Icon
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Click any program icon to view semester syllabus & tuition schedules
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: BBS (TU) with BBA (TU) and BBM (TU) Icons Just Below BBS */}
            <div className="lg:col-span-7 bg-gradient-to-br from-amber-50/40 via-slate-50 to-blue-50/40 p-4 sm:p-5 rounded-2xl border border-amber-200/60 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                  TU Faculty of Management (FOM) Undergraduates
                </span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-300">
                  Tribhuvan University
                </span>
              </div>

              {/* 1. BBS (TU) Icon Card */}
              <Link
                to="/courses/bbs-tu"
                className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-white border-2 border-amber-400 hover:border-amber-500 hover:shadow-md transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                        BBS – TU
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                        4 Years Program
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      Bachelor of Business Studies · 1st, 2nd, 3rd & 4th Year Curriculum
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 group-hover:bg-amber-100 transition-colors shrink-0">
                  <span>View Syllabus</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Just Below BBS: Dedicated BBA and BBM Icons Grid */}
              <div className="pt-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-blue-600 font-extrabold">↳</span> Just Below BBS: 8-Semester TU Management Degrees
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">8 Semesters Each</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* BBA (TU) Icon Card */}
                  <Link
                    to="/courses/bba-tu"
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-blue-200 hover:border-blue-500 hover:shadow-md transition-all group shadow-sm"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                          BBA – TU
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          8 Sem
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Bachelor of Business Admin
                      </p>
                    </div>
                  </Link>

                  {/* BBM (TU) Icon Card */}
                  <Link
                    to="/courses/bbm-tu"
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-indigo-200 hover:border-indigo-500 hover:shadow-md transition-all group shadow-sm"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
                      <Target className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                          BBM – TU
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                          8 Sem
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Bachelor of Business Mgmt
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Other Academic Programs (MBS TU, +2 Science, +2 Management, BBA PU) */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3 content-between">
              {/* MBS TU */}
              <Link
                to="/courses/mbs-tu"
                className="flex flex-col justify-between p-3.5 rounded-xl bg-white border border-purple-200 hover:border-purple-500 hover:shadow-md transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                        MBS – TU
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700">
                        Master
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">4 Semester Program</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-2 line-clamp-1">
                  Tribhuvan University Master Degree
                </p>
              </Link>

              {/* +2 Science */}
              <Link
                to="/courses/plus-two-science"
                className="flex flex-col justify-between p-3.5 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 hover:shadow-md transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
                    <Atom className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        +2 Science
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700">
                        NEB
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">Grade 11 & Grade 12</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-2 line-clamp-1">
                  Physics, Chem, Math, Bio
                </p>
              </Link>

              {/* +2 Management */}
              <Link
                to="/courses/plus-two-management"
                className="flex flex-col justify-between p-3.5 rounded-xl bg-white border border-cyan-200 hover:border-cyan-500 hover:shadow-md transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-700 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                        +2 Management
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700">
                        NEB
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">Grade 11 & Grade 12</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-2 line-clamp-1">
                  Account, Economics, Business Studies
                </p>
              </Link>

              {/* BBA - Pokhara University */}
              <Link
                to="/courses/bba-pokhara-university"
                className="flex flex-col justify-between p-3.5 rounded-xl bg-white border border-teal-200 hover:border-teal-500 hover:shadow-md transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        BBA – PU
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-50 text-teal-700">
                        Pokhara Univ
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">8 Semesters Program</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-2 line-clamp-1">
                  Comprehensive PU Curriculum Support
                </p>
              </Link>
            </div>
          </div>

          {/* Dedicated Loksewa Aayog & Public Exams Ribbon */}
          <div className="mt-4 pt-4 border-t border-slate-200/80 bg-gradient-to-r from-emerald-50/60 via-amber-50/50 to-blue-50/60 rounded-xl p-3 sm:p-4 border border-emerald-200/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                  लोक सेवा आयोग नेपाल (Loksewa Aayog & Competitive Examinations)
                </span>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-xs">
                  ६औं तह New Batches Open
                </span>
              </div>
              <Link
                to="/loksewa"
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 group self-start md:self-auto bg-white/70 hover:bg-white px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
              >
                <span>Visit Loksewa Hub & Resources</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <Link
                to="/courses/loksewa-officer-level-6"
                className="p-2.5 rounded-lg bg-amber-50 border-2 border-amber-400 hover:border-amber-500 hover:shadow-xs transition-all text-left group"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-black text-amber-950 group-hover:text-amber-800">अधिकृत ६औं तह</span>
                </div>
                <p className="text-[10px] text-amber-800 font-bold mt-0.5 truncate">Federal & Province</p>
              </Link>

              <Link
                to="/courses/loksewa-nayab-subba"
                className="p-2.5 rounded-lg bg-white border border-emerald-200 hover:border-emerald-500 hover:shadow-xs transition-all text-left group"
              >
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">नायब सुब्बा (Na.Su.)</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">5th Level Non-Gazetted</p>
              </Link>

              <Link
                to="/courses/loksewa-section-officer"
                className="p-2.5 rounded-lg bg-white border border-blue-200 hover:border-blue-500 hover:shadow-xs transition-all text-left group"
              >
                <div className="flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700">शाखा अधिकृत</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">Gazetted 3rd Class</p>
              </Link>

              <Link
                to="/courses/loksewa-kharidar"
                className="p-2.5 rounded-lg bg-white border border-amber-200 hover:border-amber-500 hover:shadow-xs transition-all text-left group"
              >
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-900 group-hover:text-amber-700">खरिदार (Kharidar)</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">4th Level Non-Gazetted</p>
              </Link>

              <Link
                to="/courses/loksewa-banking-preparation"
                className="p-2.5 rounded-lg bg-white border border-cyan-200 hover:border-cyan-500 hover:shadow-xs transition-all text-left group"
              >
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-cyan-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-900 group-hover:text-cyan-700">सरकारी बैंक तयारी</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">RBB, NBL, ADBL, NRB</p>
              </Link>

              <Link
                to="/courses/teachers-service-commission-tsc"
                className="p-2.5 rounded-lg bg-white border border-rose-200 hover:border-rose-500 hover:shadow-xs transition-all text-left group"
              >
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-900 group-hover:text-rose-700">शिक्षक सेवा (TSC)</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">Primary & Secondary</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Academic Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCourses.map((course) => {
            const badge = getCourseBadge(course.slug);
            const BadgeIcon = badge.icon;
            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:border-blue-400"
              >
                <div>
                  {/* Header Badge & Level */}
                  <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0 ${badge.iconBg}`}>
                          <BadgeIcon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {course.board}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200/80">
                        {course.duration}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#12315A] group-hover:text-blue-700 transition-colors">
                      {course.title}
                    </h3>
                    {course.devanagariTitle && (
                      <p className="text-xs font-['Noto_Sans_Devanagari',sans-serif] text-slate-500 mt-0.5">
                        {course.devanagariTitle}
                      </p>
                    )}
                  </div>

                {/* Description & Subjects */}
                <div className="p-6 pt-4 space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {course.shortDescription}
                  </p>

                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Offered Subjects & Modules
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {course.subjectsOffered.slice(0, 3).map((sub, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                        >
                          {sub.name}
                        </span>
                      ))}
                      {course.subjectsOffered.length > 3 && (
                        <span className="text-[11px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                          +{course.subjectsOffered.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span className="truncate">{course.schedule}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center gap-2">
                <Link
                  to={`/courses/${course.slug}`}
                  className="flex-1 py-2.5 px-3 rounded-lg text-center text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  View Course
                </Link>
                <Link
                  to={`/admission?course=${course.slug}`}
                  className="flex-1 py-2.5 px-3 rounded-lg text-center text-xs font-bold text-white bg-[#12315A] hover:bg-[#1a447c] transition-colors"
                >
                  Inquire Now
                </Link>
              </div>
            </div>
          );
        })}
        </div>
      </section>

      {/* SECTION C: Why Choose Shikshyalaya Shaikshik Sanstha? */}
      <section className="bg-[#F5F7FA] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100/70 px-3 py-1 rounded-full">
              Why Choose Shikshyalaya
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#12315A]">
              Our Educational Principles & Student Benefits
            </h2>
            <p className="text-slate-600 text-sm">
              We focus on cultivating true subject mastery, systematic exam competence, and consistent academic discipline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow space-y-3"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${benefit.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{benefit.title}</h3>
                    <p className="text-xs font-['Noto_Sans_Devanagari',sans-serif] text-slate-500 font-medium">
                      {benefit.devanagari}
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION D: Our Teaching Approach */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full">
            Methodology
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#12315A]">
            Our 6-Step Teaching Approach
          </h2>
          <p className="text-slate-600 text-sm">
            A structured academic cycle designed to guide students from foundational understanding to exam excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachingSteps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-all group"
            >
              <span className="text-3xl font-black text-slate-200 group-hover:text-blue-100 transition-colors block mb-2">
                {step.step}
              </span>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION E: Featured Teachers */}
      <section className="bg-slate-50/80 py-16 sm:py-20 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100/70 px-3 py-1 rounded-full">
                Faculty & Guidance
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#12315A] mt-2">
                Meet Our Experienced Teachers
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Dedicated subject specialists committed to mentoring higher secondary and university scholars.
              </p>
            </div>

            <Link
              to="/teachers"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-900 transition-colors"
            >
              <span>Meet All Teachers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="aspect-square w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={teacher.avatarUrl}
                    alt={teacher.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-slate-900/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                    {teacher.experience}
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{teacher.name}</h3>
                  <p className="text-xs font-semibold text-blue-700">{teacher.designation}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{teacher.qualification}</p>
                  <p className="text-xs text-slate-600 line-clamp-2 pt-1">{teacher.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION F: Admission Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#12315A] via-[#1c457d] to-[#12315A] text-white p-8 sm:p-12 lg:p-16 shadow-xl">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full inline-block">
              Admissions Open 2026/2027
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              Start Your Academic Journey with Shikshyalaya
            </h2>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Explore our academic programs and contact us to find the right learning support for your goals. Flexible morning and evening batches with personalized tuition.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/admission"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-md transition-all duration-200"
              >
                <GraduationCap className="w-5 h-5 text-slate-900" />
                <span>Apply for Admission</span>
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
              >
                <span>Ask a Question</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION G: Latest Notices */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full">
              Notice Board
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#12315A] mt-2">
              Latest Academic Notices & Updates
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Stay informed with recent admissions, exam preparation series, and batch schedules.
            </p>
          </div>

          <Link
            to="/notices"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-900 transition-colors"
          >
            <span>View All Notices</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentNotices.map((notice) => (
            <div
              key={notice.id}
              className={`p-5 rounded-2xl border transition-all ${
                notice.important
                  ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              } shadow-sm`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    notice.important ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {notice.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {notice.publishDate}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-2">{notice.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                {notice.content}
              </p>
              <Link
                to={`/notices?id=${notice.id}`}
                className="text-xs font-bold text-blue-700 hover:underline inline-flex items-center gap-1"
              >
                <span>Read Notice</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION H: Frequently Asked Questions */}
      <section className="bg-slate-50 py-16 sm:py-20 border-t border-slate-200/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100/70 px-3 py-1 rounded-full">
              Student Assistance
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#12315A]">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-slate-600 text-sm">
              Answers regarding tuition offerings, enrollment procedures, online modes, and study resources.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-slate-800 hover:text-blue-700 transition-colors"
                  >
                    <span className="text-sm sm:text-base flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-blue-700' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center bg-white p-6 rounded-2xl border border-slate-200 text-xs text-slate-600">
            <p className="font-medium text-slate-800 mb-1">Have a specific question not answered here?</p>
            <p className="mb-3">Our academic counseling team is ready to assist you regarding subject selection and batch timings.</p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
            >
              <span>Contact Admissions Support</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
