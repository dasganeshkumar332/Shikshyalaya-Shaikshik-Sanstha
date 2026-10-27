import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Award,
  BookOpen,
  Mail,
  Phone,
  Search,
  Info,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TeachersPage: React.FC = () => {
  const { teachers, courses, language } = useApp();
  const [filterCourse, setFilterCourse] = useState<string>('ALL');

  const filteredTeachers = teachers.filter((t) => {
    if (!t.published) return false;
    if (filterCourse === 'ALL') return true;
    return t.assignedCourseSlugs.includes(filterCourse);
  });

  return (
    <div className="py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Faculty & Mentors</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#12315A] tracking-tight">
          Our Experienced Faculty
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Meet the dedicated subject educators guiding students through Tribhuvan University, Pokhara University, and NEB curricula.
        </p>
      </div>


      {/* Filter by Course */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Filter by Program:
            </span>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Faculty Members</option>
              {courses.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500 font-semibold">
            Showing <strong>{filteredTeachers.length}</strong> educators
          </span>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Teacher Photo */}
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={teacher.avatarUrl}
                    alt={teacher.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    {teacher.experience}
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {teacher.name}
                    </h3>
                    {teacher.devanagariName && (
                      <p className="text-xs font-['Noto_Sans_Devanagari',sans-serif] text-slate-500 font-medium">
                        {teacher.devanagariName}
                      </p>
                    )}
                    <p className="text-xs font-bold text-blue-700 mt-1">
                      {teacher.designation}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Qualification
                    </p>
                    <p className="text-xs font-semibold text-slate-700">
                      {teacher.qualification}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Specialization Areas
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.specialization.map((spec, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {teacher.bio}
                  </p>
                </div>
              </div>

              {/* Footer: Assigned courses */}
              <div className="p-6 pt-0 border-t border-slate-100 mt-4">
                <div className="pt-3 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 font-medium">
                    {teacher.assignedCourseSlugs.length} Assigned Program(s)
                  </div>
                  <Link
                    to="/admission"
                    className="text-xs font-bold text-blue-700 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Inquire Class</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
