import React from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Shield,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InstituteLogo } from '../common/InstituteLogo';

export const Footer: React.FC = () => {
  const { settings, courses, language } = useApp();

  return (
    <footer className="bg-[#12315A] text-slate-300 pt-16 pb-8 border-t-4 border-amber-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-700/80">
          {/* Column 1: Institute Brand & About */}
          <div className="space-y-4">
            <InstituteLogo size="md" textColor="light" customLogoUrl={settings.logoUrl} />
            <p className="text-amber-400 font-medium text-xs tracking-wide">
              {settings.tagline}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering students through structured academic tuition, experienced educators, exam-oriented guidance, and comprehensive learning resources for +2 and university-level programs.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings.whatsappNumber ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}` : '#'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                title="Facebook"
              >
                <span className="text-xs font-bold">f</span>
              </a>
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-red-600/30 text-red-400 border border-red-500/40 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                title="YouTube"
              >
                <span className="text-xs font-bold">▶</span>
              </a>
            </div>
          </div>

          {/* Column 2: All 6 Academic Programs */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full inline-block"></span>
              {language === 'ne' ? 'शैक्षिक कार्यक्रमहरू' : 'Academic Programs'}
            </h3>
            <ul className="space-y-2 text-xs">
              {courses.map((course) => (
                <li key={course.id}>
                  <Link
                    to={`/courses/${course.slug}`}
                    className="hover:text-amber-300 transition-colors flex items-center justify-between group py-1"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">
                      {course.title}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full inline-block"></span>
              {language === 'ne' ? 'छिटो नेभिगेसन' : 'Quick Links'}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 py-1">
                  <ArrowRight className="w-3 h-3 text-amber-500" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link to="/teachers" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 py-1">
                  <ArrowRight className="w-3 h-3 text-amber-500" />
                  <span>Our Faculty & Teachers</span>
                </Link>
              </li>
              <li>
                <Link to="/online-classes" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 py-1">
                  <ArrowRight className="w-3 h-3 text-amber-500" />
                  <span>Online & Hybrid Classes</span>
                </Link>
              </li>
              <li>
                <Link to="/study-materials" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 py-1">
                  <ArrowRight className="w-3 h-3 text-amber-500" />
                  <span>Study Materials & Question Banks</span>
                </Link>
              </li>
              <li>
                <Link to="/mock-tests" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 py-1 text-amber-300 font-semibold">
                  <ArrowRight className="w-3 h-3 text-amber-400" />
                  <span>Mock Tests & Timed Exams</span>
                </Link>
              </li>
              <li>
                <Link to="/upload-answer-sheet" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 py-1 text-amber-400 font-bold">
                  <ArrowRight className="w-3 h-3 text-amber-400" />
                  <span>Upload Answer Sheet (PDF Format)</span>
                </Link>
              </li>
              <li>
                <Link to="/notices" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 py-1">
                  <ArrowRight className="w-3 h-3 text-amber-500" />
                  <span>Public Notice Board</span>
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 py-1">
                  <ArrowRight className="w-3 h-3 text-amber-500" />
                  <span>Institute Gallery</span>
                </Link>
              </li>
              <li>
                <Link to="/admission" className="text-amber-400 font-semibold hover:underline flex items-center gap-1.5 py-1">
                  <ArrowRight className="w-3 h-3 text-amber-400" />
                  <span>Apply for Admission</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Office Details */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full inline-block"></span>
              {language === 'ne' ? 'सम्पर्क विवरण' : 'Contact Institute'}
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">{settings.physicalAddress}</p>
                  <p className="text-[11px] text-slate-400">{settings.city}, {settings.country}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <a href={`tel:${settings.contactNumber}`} className="hover:text-amber-300 transition-colors block font-medium">
                    {settings.contactNumber}
                  </a>
                  {settings.contactNumberAlt && settings.contactNumberAlt !== settings.contactNumber && (
                    <a href={`tel:${settings.contactNumberAlt}`} className="text-[11px] text-slate-400 hover:text-amber-300">
                      {settings.contactNumberAlt}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${settings.emailAddress}`} className="hover:text-amber-300 transition-colors font-medium">
                  {settings.emailAddress}
                </a>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400 leading-snug">
                  {settings.officeHours}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} <strong className="text-white">SHIKSHYALAYA SHAIKSHIK SANSTHA</strong> (शिक्षालय शैक्षिक संस्था). All Rights Reserved.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <Link to="/privacy-policy" className="hover:text-slate-200 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-slate-200 transition-colors">
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link to="/admin" className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors">
              <Shield className="w-3 h-3" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
