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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InstituteLogo } from '../common/InstituteLogo';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  const { settings, courses, currentUser, language, toggleLanguage } = useApp();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { name: language === 'ne' ? 'गृहपृष्ठ' : 'Home', path: '/' },
    { name: language === 'ne' ? 'हाम्रो बारेमा' : 'About Us', path: '/about' },
    { name: language === 'ne' ? 'हाम्रा पाठ्यक्रमहरू' : 'Our Courses', path: '/courses', hasDropdown: true },
    { name: language === 'ne' ? 'शिक्षकहरू' : 'Our Teachers', path: '/teachers' },
    { name: language === 'ne' ? 'अनलाइन कक्षा' : 'Online Classes', path: '/online-classes' },
    { name: language === 'ne' ? 'अध्ययन सामग्री' : 'Study Materials', path: '/study-materials' },
    { name: language === 'ne' ? 'मक परीक्षा' : 'Mock Tests', path: '/mock-tests' },
    { name: language === 'ne' ? 'उत्तरपुस्तिका (PDF)' : 'Upload PDF', path: '/upload-answer-sheet' },
    { name: language === 'ne' ? 'सूचनाहरू' : 'Notices', path: '/notices' },
    { name: language === 'ne' ? 'ग्यालरी' : 'Gallery', path: '/gallery' },
    { name: language === 'ne' ? 'सम्पर्क' : 'Contact Us', path: '/contact' },
  ];

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
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center py-2 min-w-0 flex-shrink" onClick={() => setMobileMenuOpen(false)}>
            <InstituteLogo size="md" textColor="dark" customLogoUrl={settings.logoUrl} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              if (link.hasDropdown) {
                return (
                  <div
                    key={link.path}
                    className="relative"
                    onMouseEnter={() => setCoursesDropdownOpen(true)}
                    onMouseLeave={() => setCoursesDropdownOpen(false)}
                  >
                    <Link
                      to={link.path}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(link.path)
                          ? 'text-[#2457A7] bg-blue-50/80 font-semibold'
                          : 'text-slate-700 hover:text-[#12315A] hover:bg-slate-50'
                      }`}
                    >
                      <span>{link.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                    </Link>

                    {/* Courses Mega Dropdown Menu */}
                    {coursesDropdownOpen && (
                      <div className="absolute left-0 top-full pt-1 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 animate-fadeIn">
                        <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                            Academic Tuition Programs
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {courses.map((course) => (
                            <Link
                              key={course.id}
                              to={`/courses/${course.slug}`}
                              className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group"
                              onClick={() => setCoursesDropdownOpen(false)}
                            >
                              <div className="p-1 rounded bg-blue-50 text-blue-700 group-hover:bg-[#12315A] group-hover:text-white transition-colors mt-0.5">
                                <BookOpen className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                                  {course.title}
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium">
                                  {course.board}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100 text-center">
                          <Link
                            to="/courses"
                            className="text-xs text-blue-700 font-semibold hover:underline inline-flex items-center gap-1"
                            onClick={() => setCoursesDropdownOpen(false)}
                          >
                            <span>Browse All Academic Programs</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-[#2457A7] bg-blue-50/80 font-semibold'
                      : 'text-slate-700 hover:text-[#12315A] hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Primary CTAs: Upload Answer Sheet & Apply for Admission */}
          <div className="hidden xl:flex items-center gap-2.5">
            <Link
              to="/upload-answer-sheet"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 shadow-sm transition-all"
              title="Upload your scanned answer sheet in PDF format"
            >
              <FileText className="w-3.5 h-3.5 text-rose-700" />
              <span>{language === 'ne' ? 'उत्तरपुस्तिका (PDF)' : 'Upload Answer Sheet'}</span>
            </Link>

            <Link
              to="/admission"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#2457A7] to-[#12315A] hover:from-[#1e4685] hover:to-[#0c2240] shadow-sm hover:shadow-md transition-all duration-200"
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>{language === 'ne' ? 'भर्ना आवेदन' : 'Apply Now'}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 xl:hidden">
            <Link
              to="/upload-answer-sheet"
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-[11px] font-bold text-slate-900 bg-amber-400"
            >
              <span>PDF</span>
            </Link>
            <Link
              to="/admission"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-[#12315A]"
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
        <div className="xl:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg max-h-[80vh] overflow-y-auto">
          {navLinks.map((link) => (
            <div key={link.path}>
              <Link
                to={link.path}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(link.path)
                    ? 'text-[#2457A7] bg-blue-50 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
              {link.hasDropdown && (
                <div className="pl-4 pr-2 py-1 space-y-1">
                  {courses.map((course) => (
                    <Link
                      key={course.id}
                      to={`/courses/${course.slug}`}
                      className="block px-3 py-1.5 text-xs text-slate-600 hover:text-blue-700 hover:bg-slate-50 rounded"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      • {course.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <Link
              to="/upload-answer-sheet"
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-bold text-slate-900 bg-amber-400 rounded-lg shadow-xs"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FileText className="w-4 h-4 text-rose-700" />
              <span>{language === 'ne' ? 'उत्तरपुस्तिका बुझाउनुहोस् (PDF ढाँचा)' : 'Upload Answer Sheet (PDF Format)'}</span>
            </Link>
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
