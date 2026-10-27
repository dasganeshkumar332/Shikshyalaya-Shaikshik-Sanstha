import React from 'react';
import { Link } from 'react-router-dom';
import {
  MonitorPlay,
  Wifi,
  Video,
  ShieldCheck,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  HelpCircle,
  FileText,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OnlineClassesPage: React.FC = () => {
  const { settings, courses } = useApp();

  const modes = [
    {
      title: 'Physical Classroom (Offline)',
      desc: 'Traditional classroom environment in Kathmandu with whiteboard numerical coaching, physical handouts, and in-person peer discussion.',
      idealFor: 'Students located in Kathmandu Valley seeking face-to-face teacher interaction.',
      badge: 'Interactive Classroom',
      color: 'border-blue-200 bg-blue-50/50',
    },
    {
      title: 'Live Online Classes',
      desc: 'Real-time interactive HD sessions via secure digital whiteboard streaming. Students can ask questions live, review screen-shared problem solving, and access recorded revision archives.',
      idealFor: 'Students residing outside Kathmandu, working professionals, and those with commute constraints.',
      badge: 'Accessible Anywhere in Nepal',
      color: 'border-amber-200 bg-amber-50/50',
    },
    {
      title: 'Hybrid Learning Mode',
      desc: 'The best of both worlds: Attend physical classes when possible, and switch seamlessly to live online lectures and recordings during exams or tight work schedules.',
      idealFor: 'MBS and university students with variable work or examination timetables.',
      badge: 'Maximum Flexibility',
      color: 'border-emerald-200 bg-emerald-50/50',
    },
  ];

  const techRequirements = [
    { item: 'Device', desc: 'Laptop, desktop computer, tablet, or smartphone running modern OS.' },
    { item: 'Internet Connection', desc: 'Stable broadband or 4G mobile data (minimum 2–5 Mbps recommended).' },
    { item: 'Software / App', desc: 'Google Meet or Zoom (secure links distributed only to enrolled students).' },
    { item: 'Audio / Video', desc: 'Headphones or earphones with microphone for interactive question periods.' },
  ];

  const stepsToJoin = [
    {
      step: '1',
      title: 'Submit Enrollment Inquiry',
      desc: 'Select your preferred course, semester, and online shift through the admission portal.',
    },
    {
      step: '2',
      title: 'Batch Confirmation & Orientation',
      desc: 'Our academic coordinator verifies your subjects and sends batch timing schedules.',
    },
    {
      step: '3',
      title: 'Receive Secure Class Credentials',
      desc: 'Enrolled students receive dedicated portal access and verified live class meeting credentials.',
    },
    {
      step: '4',
      title: 'Access Notes & Recordings',
      desc: 'Download topic-wise PDF notes and review past problem sessions anytime before examinations.',
    },
  ];

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider">
          <MonitorPlay className="w-3.5 h-3.5" />
          <span>Flexible Learning Modes</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#12315A] tracking-tight">
          Online, Offline & Hybrid Classes
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Learn at your convenience. Shikshyalaya Shaikshik Sanstha offers high-quality learning options structured for +2 and university students across Nepal.
        </p>
      </div>

      {/* 3 Modes Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {modes.map((mode, idx) => (
            <div
              key={idx}
              className={`p-6 sm:p-8 rounded-3xl border ${mode.color} shadow-sm space-y-4 flex flex-col justify-between`}
            >
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-white px-2.5 py-1 rounded-full border border-slate-200 inline-block">
                  {mode.badge}
                </span>
                <h3 className="text-xl font-bold text-[#12315A]">{mode.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{mode.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-200/60">
                <p className="text-xs text-slate-700">
                  <strong className="text-slate-900">Recommended for:</strong> {mode.idealFor}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Access Protection Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold">Secure Class Access Policy</h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                To protect class focus and student privacy, live meeting links (Google Meet / Zoom) and restricted course materials are private and provided solely to verified enrolled students through their authenticated student dashboard.
              </p>
            </div>
          </div>

          <Link
            to="/student/login"
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shrink-0 transition-colors"
          >
            Student Login
          </Link>
        </div>
      </div>

      {/* Technical Requirements & Steps to Join */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Tech Requirements */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                <Wifi className="w-3.5 h-3.5" />
                <span>Prerequisites</span>
              </div>
              <h3 className="text-xl font-bold text-[#12315A]">
                Online Class Technical Requirements
              </h3>
              <p className="text-xs text-slate-500">
                Simple prerequisites to ensure a smooth, uninterrupted online learning experience.
              </p>
            </div>

            <div className="space-y-4">
              {techRequirements.map((req, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{req.item}</h4>
                    <p className="text-xs text-slate-600">{req.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Steps to Join */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md">
                <FileText className="w-3.5 h-3.5" />
                <span>Enrollment Flow</span>
              </div>
              <h3 className="text-xl font-bold text-[#12315A]">
                How to Join Online Classes
              </h3>
              <p className="text-xs text-slate-500">
                Four quick steps to begin your live interactive academic tuition.
              </p>
            </div>

            <div className="space-y-4">
              {stepsToJoin.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {step.step}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{step.title}</h4>
                    <p className="text-xs text-slate-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Online Schedules & Course Availability */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-blue-900 to-[#12315A] text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-6">
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-2xl font-bold">Programs Currently Offered in Online Mode</h3>
            <p className="text-xs sm:text-sm text-blue-200">
              Live morning and evening sessions are available across our academic programs:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div key={course.id} className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  {course.board}
                </span>
                <h4 className="text-sm font-bold text-white">{course.title}</h4>
                <p className="text-xs text-blue-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{course.schedule}</span>
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              to="/admission?mode=Online"
              className="px-6 py-3 rounded-xl font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 transition-colors text-xs sm:text-sm shadow"
            >
              Apply for Online Batch
            </Link>
            <Link
              to="/contact"
              className="px-5 py-3 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors text-xs sm:text-sm"
            >
              Contact Online Class Coordinator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
