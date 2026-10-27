import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  BookOpen,
  ArrowRight,
  Clock,
  Layers,
  GraduationCap,
  Sparkles,
  RotateCcw,
  Award,
  TrendingUp,
  Target,
  Atom,
  Calculator,
  Landmark,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CourseCategory, UniversityBoard, ClassMode } from '../types';

export const CoursesPage: React.FC = () => {
  const { courses, language } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCourseType, setSelectedCourseType] = useState<string>(searchParams.get('type') || 'ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'ALL');
  const [selectedBoard, setSelectedBoard] = useState<string>(searchParams.get('board') || 'ALL');
  const [selectedMode, setSelectedMode] = useState<string>(searchParams.get('mode') || 'ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'title' | 'level'>('featured');

  // Filtered and sorted courses
  const filteredCourses = useMemo(() => {
    return courses
      .filter((c) => c.published)
      .filter((c) => {
        if (selectedCourseType === 'ALL') return true;
        if (selectedCourseType === 'Old Course') {
          return (
            c.courseType === 'Old Course' ||
            c.hasOldCourseOption === true ||
            c.subjectsOffered.some((s) => s.courseType === 'Old Course' || s.courseType === 'Both')
          );
        }
        if (selectedCourseType === 'New Course') {
          return (
            !c.courseType ||
            c.hasOldCourseOption === true ||
            c.subjectsOffered.some((s) => s.courseType === 'New Course' || s.courseType === 'Both')
          );
        }
        return true;
      })
      .filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.shortDescription.toLowerCase().includes(q) ||
          c.subjectsOffered.some((s) => s.name.toLowerCase().includes(q)) ||
          c.board.toLowerCase().includes(q) ||
          (c.courseType && c.courseType.toLowerCase().includes(q)) ||
          (c.syllabusVersion && c.syllabusVersion.toLowerCase().includes(q))
        );
      })
      .filter((c) => {
        if (selectedCategory === 'ALL') return true;
        return c.category === selectedCategory;
      })
      .filter((c) => {
        if (selectedBoard === 'ALL') return true;
        return c.board === selectedBoard;
      })
      .filter((c) => {
        if (selectedMode === 'ALL') return true;
        return c.classModes.includes(selectedMode as ClassMode);
      })
      .sort((a, b) => {
        if (sortBy === 'featured') {
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return a.level.localeCompare(b.level);
      });
  }, [courses, searchQuery, selectedCourseType, selectedCategory, selectedBoard, selectedMode, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCourseType('ALL');
    setSelectedCategory('ALL');
    setSelectedBoard('ALL');
    setSelectedMode('ALL');
    setSortBy('featured');
    setSearchParams({});
  };

  const isFiltered =
    searchQuery !== '' ||
    selectedCourseType !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    selectedBoard !== 'ALL' ||
    selectedMode !== 'ALL';

  return (
    <div className="py-12 sm:py-16 space-y-12">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Academic Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#12315A] tracking-tight">
          Academic Programs & Tuition Courses
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Explore our structured tuition courses designed specifically for Tribhuvan University (TU), Pokhara University (PU), and NEB higher secondary curricula.
        </p>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          {/* Search Row */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by course name, subject, or university (e.g. MBS, BBS, Physics, Statistics)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort courses by"
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="featured">Featured First</option>
                <option value="title">Course Name (A-Z)</option>
                <option value="level">Academic Level</option>
              </select>

              {isFiltered && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Syllabus Type Tabs: New Course vs Old Course */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold w-fit overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Courses' },
              { id: 'New Course', label: 'New Course (Regular Syllabus)' },
              { id: 'Old Course', label: 'Old Course (Backpaper Prep)' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedCourseType(t.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedCourseType === t.id
                    ? t.id === 'Old Course'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-[#12315A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Filter Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
            {/* Course Type / Syllabus */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Syllabus Type
              </label>
              <select
                value={selectedCourseType}
                onChange={(e) => setSelectedCourseType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Syllabi (New & Old)</option>
                <option value="New Course">New Course (Current Regular)</option>
                <option value="Old Course">Old Course (Backpaper / Pre-revision)</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Level / Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Categories (+2, Bachelor, Master)</option>
                <option value="+2">+2 Higher Secondary</option>
                <option value="bachelor">Bachelor Level</option>
                <option value="master">Master Level</option>
              </select>
            </div>

            {/* University / Board */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                University or Board
              </label>
              <select
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Boards & Universities</option>
                <option value="Tribhuvan University (TU)">Tribhuvan University (TU)</option>
                <option value="Pokhara University (PU)">Pokhara University (PU)</option>
                <option value="National Examinations Board (NEB)">National Examinations Board (NEB)</option>
              </select>
            </div>

            {/* Class Mode */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Class Mode
              </label>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Modes (Online, Offline, Hybrid)</option>
                <option value="Online">Online Interactive</option>
                <option value="Offline">Physical Classroom</option>
                <option value="Hybrid">Hybrid (Both)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs sm:text-sm font-semibold text-slate-600">
            Showing <strong className="text-slate-900">{filteredCourses.length}</strong> academic programs
          </p>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No courses match your criteria</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search terms or clearing active filters to browse academic programs.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const getCourseBadgeIcon = (slug: string) => {
                switch (slug) {
                  case 'bbs-tu':
                  case '3-year-bbs-tu':
                  case 'bbs-tu-old':
                    return { icon: Award, bg: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white' };
                  case 'bba-tu':
                    return { icon: TrendingUp, bg: 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' };
                  case 'bbm-tu':
                    return { icon: Target, bg: 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white' };
                  case 'mbs-tu':
                    return { icon: GraduationCap, bg: 'bg-gradient-to-br from-purple-600 to-purple-700 text-white' };
                  case 'plus-two-science':
                    return { icon: Atom, bg: 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white' };
                  case 'plus-two-management':
                    return { icon: Calculator, bg: 'bg-gradient-to-br from-cyan-600 to-cyan-700 text-white' };
                  case 'bba-pokhara-university':
                    return { icon: Landmark, bg: 'bg-gradient-to-br from-teal-600 to-teal-700 text-white' };
                  default:
                    return { icon: BookOpen, bg: 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' };
                }
              };
              const badgeInfo = getCourseBadgeIcon(course.slug);
              const BadgeIcon = badgeInfo.icon;

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:border-blue-400"
                >
                  <div>
                    <div className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-blue-50/20">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0 ${badgeInfo.bg}`}>
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
                      <h2 className="text-lg font-bold text-[#12315A] group-hover:text-blue-700 transition-colors">
                        {course.title}
                      </h2>
                      {course.devanagariTitle && (
                        <p className="text-xs font-['Noto_Sans_Devanagari',sans-serif] text-slate-500 mt-0.5">
                          {course.devanagariTitle}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          New Course
                        </span>
                        {course.hasOldCourseOption && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300">
                            Old Course Available
                          </span>
                        )}
                        {course.syllabusVersion && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            {course.syllabusVersion}
                          </span>
                        )}
                      </div>
                    </div>

                  <div className="p-6 pt-4 space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {course.shortDescription}
                    </p>

                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
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

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span className="truncate max-w-[150px]">{course.schedule}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Admissions Open
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center gap-2">
                  <Link
                    to={`/courses/${course.slug}`}
                    className="flex-1 py-2.5 px-3 rounded-lg text-center text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    View Details
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
        )}
      </div>

      {/* Advisory Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            <strong>Need guidance on subject bundles or semester planning?</strong> Our counselors provide personalized academic mapping for university and +2 students.
          </p>
          <Link
            to="/contact"
            className="px-4 py-2 rounded-lg font-bold text-white bg-[#12315A] hover:bg-blue-900 shrink-0 transition-colors"
          >
            Contact Counselor
          </Link>
        </div>
      </div>
    </div>
  );
};
