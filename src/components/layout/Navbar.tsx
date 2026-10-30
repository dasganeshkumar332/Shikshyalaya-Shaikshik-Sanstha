import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Phone,
  Mail,
  GraduationCap,
  User,
  Shield,
  ChevronDown,
  Globe,
  ArrowRight,
  BookOpen,
  MessageCircle,
  FileText,
  Award,
  Landmark,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InstituteLogo } from '../common/InstituteLogo';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  const [loksewaDropdownOpen, setLoksewaDropdownOpen] = useState(false);
  const [examsDropdownOpen, setExamsDropdownOpen] = useState(false);
  const { settings, courses, currentUser, language, toggleLanguage } = useApp();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const academicCourses = courses.filter((c) => c.category !== 'loksewa');
  const loksewaCourses = courses.filter((c) => c.category === 'loksewa');

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100">
      {/* Top Header Utility Bar */}
      <div className="bg-[#12315A] text-slate-200 text-xs py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-slate-300">
            <a
              href={`tel:${settings.contactNumber}`}
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{settings.contactNumber}</span>
            </a>
            <span className="hidden sm:inline text-slate-500">|</span>
            <a
              href={`mailto:${settings.emailAddress}`}
              className="hidden sm:flex items-center gap-1.5 hover:text-amber-400 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>{settings.emailAddress}</span>
            </a>
            <span className="hidden md:inline text-slate-500">|</span>
            <a
              href="https://wa.me/9779767648342"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              title="Chat directly on WhatsApp (+977 9767648342)"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Chat</span>
            </a>
            <span className="hidden lg:inline text-slate-500">|</span>
            <Link
              to="/courses?category=loksewa"
              className="hidden lg:inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-white/10 px-2 py-0.5 rounded transition-colors"
            >
              <span>लोक सेवा आयोग (Loksewa Aayog)</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-[11px] font-medium transition-colors"
              title="Toggle English / नेपाली"
            >
              <Globe className="w-3 h-3 text-amber-400" />
              <span>{language === 'ne' ? 'English' : 'नेपाली'}</span>
            </button>

            {/* Portal / Dashboard Links */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {currentUser.role === 'admin' ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-2.5 py-0.5 rounded text-[11px] transition-colors"
                  >
                    <Shield className="w-3 h-3" />
                    <span>Admin Portal</span>
                  </Link>
                ) : (
                  <Link
                    to="/student/dashboard"
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-2.5 py-0.5 rounded text-[11px] transition-colors"
                  >
                    <User className="w-3 h-3 text-amber-300" />
                    <span>Student Dashboard</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/student/login"
                  className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ne' ? 'विद्यार्थी लगइन' : 'Student Login'}</span>
                </Link>
                <span className="text-slate-600">·</span>
                <Link
                  to="/admin"
                  className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                  title="Administrator login"
                >
                  <Shield className="w-3 h-3 text-slate-400" />
                  <span>Admin</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notice Marquee Bar if active */}
      {settings.isNoticeMarqueeActive && (
        <div className="bg-amber-50 border-b border-amber-200/60 py-1.5 px-4 text-xs text-amber-900 font-medium">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <span className="bg-[#12315A] text-amber-300 text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wide shrink-0">
              Notice
            </span>
            <div className="overflow-hidden whitespace-nowrap">
              <p className="inline-block animate-marquee">{settings.noticeMarqueeText}</p>
            </div>
            <Link to="/notices" className="text-blue-700 hover:underline shrink-0 text-[11px] font-semibold ml-2">
              View All &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20 gap-2">
          {/* Logo & Brand Name - shrink-0 ensures it NEVER compresses or gets overlapped */}
          <Link
            to="/"
            className="flex items-center py-2 shrink-0 select-none mr-2 2xl:mr-5 cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          >
            <InstituteLogo size="md" textColor="dark" customLogoUrl={settings.logoUrl} />
          </Link>

          {/* Desktop Navigation Links - cleaned up to prevent overflow: Teachers, Contact, and About Us removed; Resources restored */}
          <nav className="hidden xl:flex items-center gap-1">
            {/* 1. Home */}
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/')
                  ? 'text-[#2457A7] bg-blue-50/80 font-bold'
                  : 'text-slate-700 hover:text-[#12315A] hover:bg-slate-50'
              }`}
            >
              {language === 'ne' ? 'गृहपृष्ठ' : 'Home'}
            </Link>

            {/* 2. Academic Courses Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCoursesDropdownOpen(true)}
              onMouseLeave={() => setCoursesDropdownOpen(false)}
            >
              <Link
                to="/courses"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive('/courses') && !location.pathname.startsWith('/loksewa')
                    ? 'text-[#2457A7] bg-blue-50/80 font-bold'
                    : 'text-slate-700 hover:text-[#12315A] hover:bg-slate-50'
                }`}
              >
                <span>{language === 'ne' ? 'शैक्षिक कार्यक्रम' : 'Courses'}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </Link>

              {coursesDropdownOpen && (
                <div className="absolute left-0 top-full pt-1.5 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fadeIn space-y-1">
                  <div className="px-2 py-1 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-800">
                      Academic Degree Tuition
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">TU, PU & NEB</span>
                  </div>
                  <div className="space-y-0.5 max-h-[320px] overflow-y-auto">
                    {academicCourses.map((course) => (
                      <Link
                        key={course.id}
                        to={`/courses/${course.slug}`}
                        className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                        onClick={() => setCoursesDropdownOpen(false)}
                      >
                        <div className="p-1 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-[#12315A] group-hover:text-white transition-colors mt-0.5 shrink-0">
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">
                            {course.title}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium truncate">
                            {course.board}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-100 px-2 pb-1">
                    <Link
                      to="/courses"
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center justify-between group"
                      onClick={() => setCoursesDropdownOpen(false)}
                    >
                      <span>View All Academic Courses</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Dedicated Loksewa Aayog (Nepal) Section with RBB & NBL Banking Preparation */}
            <div
              className="relative"
              onMouseEnter={() => setLoksewaDropdownOpen(true)}
              onMouseLeave={() => setLoksewaDropdownOpen(false)}
            >
              <Link
                to="/loksewa"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive('/loksewa')
                    ? 'text-amber-800 bg-amber-100/80 font-bold border border-amber-300/80 shadow-xs'
                    : 'text-slate-800 hover:text-amber-800 hover:bg-amber-50/70'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="font-bold">{language === 'ne' ? 'लोक सेवा आयोग' : 'Loksewa'}</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 shadow-xs">
                  ६औं तह New
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </Link>

              {loksewaDropdownOpen && (
                <div className="absolute left-0 top-full pt-1.5 w-[420px] bg-white rounded-2xl shadow-2xl border border-amber-200/90 p-3.5 z-50 animate-fadeIn space-y-2.5">
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-100 block">
                        लोक सेवा आयोग नेपाल (Loksewa Hub)
                      </span>
                      <p className="text-xs font-extrabold text-white">Civil Service & Banking Preparation</p>
                    </div>
                    <Link
                      to="/loksewa"
                      className="px-2.5 py-1 rounded-lg bg-white text-slate-900 text-[11px] font-bold hover:bg-amber-100 transition-colors shrink-0 shadow-xs"
                      onClick={() => setLoksewaDropdownOpen(false)}
                    >
                      Visit Hub &rarr;
                    </Link>
                  </div>

                  <div className="max-h-[380px] overflow-y-auto space-y-3 pr-1">
                    {/* A. Banking Preparation Section (RBB 4th/6th, NBL 4th/6th) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between px-1 border-b border-amber-100 pb-1">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-900 flex items-center gap-1">
                          <Landmark className="w-3.5 h-3.5 text-amber-600" />
                          <span>Banking Preparation (सरकारी बैंक तयारी)</span>
                        </span>
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                          RBB & NBL 4th/6th
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {/* RBB 4th Level */}
                        <Link
                          to="/courses/loksewa-rbb-level-4"
                          className="p-2 rounded-xl bg-amber-50/50 hover:bg-amber-100/70 border border-amber-200/60 transition-colors group"
                          onClick={() => setLoksewaDropdownOpen(false)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-amber-900">RBB तह ४</span>
                            <span className="text-[8px] font-bold bg-amber-300 text-slate-950 px-1 rounded">सहायक</span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 truncate mt-0.5">
                            RBB 4th Level Assistant
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">प्रशासन तथा नगद</p>
                        </Link>

                        {/* RBB 6th Level */}
                        <Link
                          to="/courses/loksewa-rbb-level-6"
                          className="p-2 rounded-xl bg-amber-50/50 hover:bg-amber-100/70 border border-amber-200/60 transition-colors group"
                          onClick={() => setLoksewaDropdownOpen(false)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-amber-900">RBB तह ६</span>
                            <span className="text-[8px] font-bold bg-amber-400 text-slate-950 px-1 rounded">अधिकृत</span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 truncate mt-0.5">
                            RBB 6th Level Officer
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">प्रशासन, लेखा र IT</p>
                        </Link>

                        {/* NBL 4th Level */}
                        <Link
                          to="/courses/loksewa-nbl-level-4"
                          className="p-2 rounded-xl bg-blue-50/50 hover:bg-blue-100/70 border border-blue-200/60 transition-colors group"
                          onClick={() => setLoksewaDropdownOpen(false)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-blue-900">NBL तह ४</span>
                            <span className="text-[8px] font-bold bg-blue-200 text-blue-950 px-1 rounded">सहायक</span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-blue-800 truncate mt-0.5">
                            NBL 4th Level Assistant
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">कनिष्ठ सहायक तयारी</p>
                        </Link>

                        {/* NBL 6th Level */}
                        <Link
                          to="/courses/loksewa-nbl-level-6"
                          className="p-2 rounded-xl bg-blue-50/50 hover:bg-blue-100/70 border border-blue-200/60 transition-colors group"
                          onClick={() => setLoksewaDropdownOpen(false)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-blue-900">NBL तह ६</span>
                            <span className="text-[8px] font-bold bg-blue-300 text-blue-950 px-1 rounded">अधिकृत</span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-blue-800 truncate mt-0.5">
                            NBL 6th Level Officer
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">सहायक प्रबन्धक</p>
                        </Link>
                      </div>
                    </div>

                    {/* B. Civil Service & Administration Section */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 px-1 block border-b border-slate-100 pb-1">
                        Civil Service & Officers (निजामती तथा स्थानीय तह)
                      </span>

                      <div className="space-y-0.5 pt-0.5">
                        {/* 6th Level Officer */}
                        <Link
                          to="/courses/loksewa-officer-level-6"
                          className="flex items-start gap-2.5 p-2 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 transition-colors group"
                          onClick={() => setLoksewaDropdownOpen(false)}
                        >
                          <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold shrink-0 mt-0.5">
                            <Shield className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-grow">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 truncate">
                                6th Level Officer (अधिकृत छैटौं तह)
                              </p>
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 shrink-0">
                                ६औं तह New
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate">
                              Federal, Provincial & Local Level Services
                            </p>
                          </div>
                        </Link>

                        {/* Section Officer */}
                        <Link
                          to="/courses/loksewa-section-officer"
                          className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                          onClick={() => setLoksewaDropdownOpen(false)}
                        >
                          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-[#12315A] group-hover:text-white shrink-0 mt-0.5">
                            <Shield className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-grow">
                            <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 truncate">
                              Section Officer (शाखा अधिकृत)
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              Gazetted 3rd Class — AAT, Governance, Contemporary Issues
                            </p>
                          </div>
                        </Link>

                        {/* Nayab Subba */}
                        <Link
                          to="/courses/loksewa-nayab-subba"
                          className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                          onClick={() => setLoksewaDropdownOpen(false)}
                        >
                          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-[#12315A] group-hover:text-white shrink-0 mt-0.5">
                            <Shield className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-grow">
                            <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 truncate">
                              Nayab Subba (नायब सुब्बा – Na.Su.)
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              5th Level (५औं तह) — GK, IQ & Service Papers
                            </p>
                          </div>
                        </Link>

                        {/* Kharidar */}
                        <Link
                          to="/courses/loksewa-kharidar"
                          className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                          onClick={() => setLoksewaDropdownOpen(false)}
                        >
                          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-[#12315A] group-hover:text-white shrink-0 mt-0.5">
                            <Shield className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-grow">
                            <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 truncate">
                              Kharidar (खरिदार – 4th Level)
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              4th Level (४औं तह) — SEE/SLC Graduate Entry
                            </p>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Loksewa Quick Actions Bar */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-center text-xs">
                    <Link
                      to="/loksewa"
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 font-bold text-slate-800 transition-colors"
                      onClick={() => setLoksewaDropdownOpen(false)}
                    >
                      Exam Resources (PDF)
                    </Link>
                    <Link
                      to="/admission?category=loksewa"
                      className="p-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 font-bold text-slate-950 transition-colors shadow-xs"
                      onClick={() => setLoksewaDropdownOpen(false)}
                    >
                      Enroll for Loksewa
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Mock Tests & Exam Hub Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setExamsDropdownOpen(true)}
              onMouseLeave={() => setExamsDropdownOpen(false)}
            >
              <Link
                to="/mock-tests"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive('/mock-tests') || isActive('/upload-answer-sheet')
                    ? 'text-[#2457A7] bg-blue-50/80 font-bold'
                    : 'text-slate-700 hover:text-[#12315A] hover:bg-slate-50'
                }`}
              >
                <span>{language === 'ne' ? 'मक परीक्षा तथा मोडल' : 'Mock Tests & Exams'}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </Link>

              {examsDropdownOpen && (
                <div className="absolute left-0 top-full pt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fadeIn space-y-1">
                  <Link
                    to="/mock-tests"
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                    onClick={() => setExamsDropdownOpen(false)}
                  >
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Mock Tests & Papers</p>
                      <p className="text-[10px] text-slate-500">Live timed exams by subject</p>
                    </div>
                  </Link>

                  <Link
                    to="/upload-answer-sheet"
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/80 transition-colors"
                    onClick={() => setExamsDropdownOpen(false)}
                  >
                    <div className="p-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-950">Upload Answer Sheet (PDF)</p>
                      <p className="text-[10px] text-slate-600">Submit handwritten PDF for grading</p>
                    </div>
                  </Link>

                  <Link
                    to="/online-classes"
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                    onClick={() => setExamsDropdownOpen(false)}
                  >
                    <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Online Live Classes</p>
                      <p className="text-[10px] text-slate-500">Daily interactive morning/evening</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* 5. Resources (Restored as a prominent top-level link as requested) */}
            <Link
              to="/study-materials"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/study-materials')
                  ? 'text-[#2457A7] bg-blue-50/80 font-bold'
                  : 'text-slate-700 hover:text-[#12315A] hover:bg-slate-50'
              }`}
            >
              {language === 'ne' ? 'स्रोतहरू' : 'Resources'}
            </Link>

            {/* 6. Notices */}
            <Link
              to="/notices"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/notices')
                  ? 'text-[#2457A7] bg-blue-50/80 font-bold'
                  : 'text-slate-700 hover:text-[#12315A] hover:bg-slate-50'
              }`}
            >
              {language === 'ne' ? 'सूचनाहरू' : 'Notices'}
            </Link>
          </nav>

          {/* Desktop Primary CTAs: Upload Answer Sheet & Apply for Admission */}
          <div className="hidden xl:flex items-center gap-2 shrink-0">
            <Link
              to="/upload-answer-sheet"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 shadow-sm transition-all whitespace-nowrap shrink-0"
              title="Upload your scanned answer sheet in PDF format"
            >
              <FileText className="w-3.5 h-3.5 text-rose-700" />
              <span>{language === 'ne' ? 'उत्तरपुस्तिका (PDF)' : 'Upload PDF'}</span>
            </Link>

            <Link
              to="/admission"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2457A7] to-[#12315A] hover:from-[#1e4685] hover:to-[#0c2240] shadow-sm hover:shadow-md transition-all whitespace-nowrap shrink-0"
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>{language === 'ne' ? 'भर्ना आवेदन' : 'Apply Now'}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 xl:hidden shrink-0">
            <Link
              to="/upload-answer-sheet"
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-[11px] font-bold text-slate-900 bg-amber-400 whitespace-nowrap"
            >
              <span>PDF</span>
            </Link>
            <Link
              to="/admission"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-[#12315A] whitespace-nowrap"
            >
              <span>{language === 'ne' ? 'आवेदन' : 'Apply'}</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg max-h-[82vh] overflow-y-auto">
          {/* Main Links */}
          <Link
            to="/"
            className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/') ? 'text-[#2457A7] bg-blue-50 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {language === 'ne' ? 'गृहपृष्ठ' : 'Home'}
          </Link>

          <Link
            to="/about"
            className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/about') ? 'text-[#2457A7] bg-blue-50 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {language === 'ne' ? 'हाम्रो बारेमा' : 'About Us'}
          </Link>

          {/* Loksewa Aayog Preparation (Nepal) Highlight Section */}
          <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <Link
                to="/loksewa"
                className="text-xs font-black text-amber-950 flex items-center gap-1.5 hover:underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>लोक सेवा आयोग (Loksewa Hub)</span>
              </Link>
              <Link
                to="/loksewa"
                className="text-[10px] font-black text-slate-950 bg-amber-400 px-2 py-0.5 rounded shadow-xs"
                onClick={() => setMobileMenuOpen(false)}
              >
                Visit Hub &rarr;
              </Link>
            </div>
            <div className="space-y-1 pl-1">
              {loksewaCourses.map((c) => {
                const is6th = c.slug === 'loksewa-officer-level-6';
                return (
                  <Link
                    key={c.id}
                    to={`/courses/${c.slug}`}
                    className="flex items-center justify-between text-xs font-bold text-slate-800 hover:text-amber-800 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>• {c.title.replace('Loksewa ', '')}</span>
                    {is6th && (
                      <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded">
                        ६औं तह
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Academic Courses */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Academic Programs (TU, PU, NEB)</span>
            </span>
            <div className="space-y-1 pl-1">
              {academicCourses.map((c) => (
                <Link
                  key={c.id}
                  to={`/courses/${c.slug}`}
                  className="block text-xs text-slate-700 hover:text-blue-700 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  • {c.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Exam Hub Links */}
          <Link
            to="/mock-tests"
            className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/mock-tests') ? 'text-[#2457A7] bg-blue-50 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {language === 'ne' ? 'मक परीक्षा तथा प्रश्नपत्रहरू' : 'Mock Tests & Exam Papers'}
          </Link>

          <Link
            to="/upload-answer-sheet"
            className="block px-3 py-2.5 rounded-lg text-sm font-bold bg-amber-100 text-amber-950 border border-amber-300"
            onClick={() => setMobileMenuOpen(false)}
          >
            {language === 'ne' ? 'उत्तरपुस्तिका बुझाउनुहोस् (PDF ढाँचा)' : 'Upload Answer Sheet (PDF Format)'}
          </Link>

          <Link
            to="/online-classes"
            className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/online-classes') ? 'text-[#2457A7] bg-blue-50 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {language === 'ne' ? 'अनलाइन प्रत्यक्ष कक्षा' : 'Online Live Classes'}
          </Link>

          <Link
            to="/study-materials"
            className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/study-materials') ? 'text-[#2457A7] bg-blue-50 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {language === 'ne' ? 'अध्ययन सामग्री' : 'Study Materials'}
          </Link>

          <Link
            to="/notices"
            className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/notices') ? 'text-[#2457A7] bg-blue-50 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {language === 'ne' ? 'सूचनाहरू' : 'Notices'}
          </Link>

          <Link
            to="/teachers"
            className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/teachers') ? 'text-[#2457A7] bg-blue-50 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {language === 'ne' ? 'शिक्षकहरू' : 'Our Teachers'}
          </Link>

          <Link
            to="/gallery"
            className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/gallery') ? 'text-[#2457A7] bg-blue-50 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {language === 'ne' ? 'ग्यालरी' : 'Photo Gallery'}
          </Link>

          <Link
            to="/contact"
            className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/contact') ? 'text-[#2457A7] bg-blue-50 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {language === 'ne' ? 'सम्पर्क' : 'Contact Us'}
          </Link>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <Link
              to="/student/login"
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="w-4 h-4 text-blue-700" />
              <span>{language === 'ne' ? 'विद्यार्थी लगइन' : 'Student Login'}</span>
            </Link>
            <Link
              to="/admin"
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Shield className="w-4 h-4 text-slate-600" />
              <span>Admin Dashboard</span>
            </Link>
            <Link
              to="/admission"
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-white bg-[#12315A] rounded-lg shadow"
              onClick={() => setMobileMenuOpen(false)}
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>{language === 'ne' ? 'भर्नाको लागि आवेदन दिनुहोस्' : 'Apply for Admission'}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
