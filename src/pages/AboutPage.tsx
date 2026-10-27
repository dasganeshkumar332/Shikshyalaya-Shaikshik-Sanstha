import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Target,
  Eye,
  CheckCircle2,
  BookOpen,
  Award,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InstituteLogo } from '../components/common/InstituteLogo';

export const AboutPage: React.FC = () => {
  const { settings, language } = useApp();

  const values = [
    {
      title: 'Academic Integrity',
      desc: 'Transparent teaching practices, honest academic guidance, and commitment to genuine student effort.',
    },
    {
      title: 'Conceptual Clarity',
      desc: 'Deep focus on underlying theorems, principles, and analytical logic rather than mechanical memorization.',
    },
    {
      title: 'Student Accessibility',
      desc: 'Approachable faculty members, flexible morning and evening batches, and dedicated doubt-clearing sessions.',
    },
    {
      title: 'Continuous Evaluation',
      desc: 'Regular unit assessments, model test series, and personalized feedback to monitor progress systematically.',
    },
  ];

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>About Our Institution</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#12315A] tracking-tight">
            About Shikshyalaya Shaikshik Sanstha
          </h1>
          <p className="font-['Noto_Sans_Devanagari',sans-serif] text-xl font-bold text-amber-600">
            शिक्षालय शैक्षिक संस्था — {settings.tagline}
          </p>
          <p className="text-slate-600 text-base leading-relaxed">
            An educational institute dedicated to delivering structured academic tuition, curriculum-aligned exam preparation, and holistic academic guidance for higher secondary (+2) and university students in Nepal.
          </p>
        </div>
      </div>

      {/* Main About Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#12315A]">
              Dedicated to Academic Empowerment
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Higher secondary and collegiate examinations under Tribhuvan University (TU), Pokhara University (PU), and the National Examinations Board (NEB) demand rigorous conceptual clarity, structured time management, and adept numerical presentation.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Founded on the belief that every student can achieve distinction when provided with guided mentorship, <strong>SHIKSHYALAYA SHAIKSHIK SANSTHA</strong> bridges the gap between college lectures and board examination requirements. We provide a disciplined academic environment where students can master intricate topics in accounting, finance, economics, physics, and mathematics.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700">
                  <strong>Curriculum-Aligned Instruction:</strong> Every session directly adheres to the official syllabi of TU, PU, and NEB.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700">
                  <strong>Experienced Educators:</strong> Classes are led by qualified subject teachers passionate about student success.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700">
                  <strong>Diverse Learning Options:</strong> Physical classes in Kathmandu and live interactive online streaming for remote learners.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
              <img
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80"
                alt="Faculty and academic learning at Shikshyalaya Shaikshik Sanstha"
                className="w-full h-80 object-cover"
              />
              <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                  Educational Philosophy
                </span>
                <p className="text-sm font-semibold text-[#12315A]">
                  "Feel the magic of learning."
                </p>
                <p className="text-xs text-slate-500">
                  Fostering intellectual curiosity, methodical problem-solving, and professional excellence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vision & Mission Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission */}
          <div className="p-8 rounded-3xl bg-blue-50/60 border border-blue-200/80 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#12315A] text-white flex items-center justify-center shadow-md">
              <Target className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-[#12315A]">Our Mission</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              To deliver high-caliber, structured, and student-centered academic tuition that equips higher secondary and university students with genuine conceptual competence, analytical mastery, and the practical confidence to excel in board examinations and future careers.
            </p>
          </div>

          {/* Vision */}
          <div className="p-8 rounded-3xl bg-amber-50/60 border border-amber-200/80 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Vision</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              To be recognized as Nepal’s premier academic tuition and guidance center, celebrated for ethical education, student-first pedagogy, and measurable academic transformation across management, science, and university faculties.
            </p>
          </div>
        </div>
      </div>

      {/* Core Educational Values */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full">
            Our Pillars
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#12315A]">
            Core Academic Values
          </h2>
          <p className="text-slate-600 text-sm">
            The fundamental principles that guide our educators and learning spaces every day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-all space-y-3"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                0{idx + 1}
              </div>
              <h3 className="text-base font-bold text-slate-800">{val.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#12315A] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold">
              Ready to Strengthen Your Academic Performance?
            </h3>
            <p className="text-xs sm:text-sm text-blue-200 max-w-xl">
              Connect with our counseling desk to find batch timings suited for your semester or year.
            </p>
          </div>
          <Link
            to="/admission"
            className="px-6 py-3 rounded-xl font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-md shrink-0 transition-colors"
          >
            Apply for Admission
          </Link>
        </div>
      </div>
    </div>
  );
};
