import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Download,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight,
  Video,
  Play,
  X,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  GraduationCap,
  Pause,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudyMaterial, Course } from '../types';

export const StudyMaterialsPage: React.FC = () => {
  const { studyMaterials, courses, currentUser, language } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedCourseType, setSelectedCourseType] = useState<'ALL' | 'New Course' | 'Old Course'>('ALL');
  const [selectedYearOrSemester, setSelectedYearOrSemester] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedAccess, setSelectedAccess] = useState('ALL');
  const [filterEnrolledOnly, setFilterEnrolledOnly] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<StudyMaterial | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [restrictedMaterial, setRestrictedMaterial] = useState<StudyMaterial | null>(null);
  const [downloadSuccessModal, setDownloadSuccessModal] = useState<StudyMaterial | null>(null);

  const resourceTypes = [
    'Recorded Videos',
    'PDF Notes',
    'Lecture Slides',
    'Practice Questions',
    'Model Question Papers',
    'Past Papers',
    'Assignments',
    'Revision Materials',
  ];

  // Concise standardized course name without "4 Year" or "8 Semester"
  const getCourseDisplayName = (c: Course) => {
    switch (c.slug) {
      case 'bbs-tu':
        return 'BBS - TU';
      case 'mbs-tu':
        return 'MBS - TU';
      case 'bba-tu':
        return 'BBA - TU';
      case 'bbm-tu':
        return 'BBM - TU';
      case 'bba-bbm-tu':
        return 'BBA & BBM - TU';
      case 'plus-two-science':
        return '+2 Science (NEB)';
      case 'plus-two-management':
        return '+2 Management (NEB)';
      case 'bba-pokhara-university':
        return 'BBA - Pokhara University (PU)';
      default:
        return c.title.replace(/4 Years Program on |4 Semester on |8 Semester on |8 Semesters Program/gi, '').trim();
    }
  };

  // Label for the Year / Semester filter column
  const yearOrSemesterLabel = useMemo(() => {
    if (selectedCourse === 'bbs-tu') return 'Year (BBS)';
    if (selectedCourse === 'mbs-tu') return 'Semester (MBS)';
    if (selectedCourse === 'bba-tu') return 'Semester (BBA)';
    if (selectedCourse === 'bbm-tu') return 'Semester (BBM)';
    if (selectedCourse === 'bba-bbm-tu' || selectedCourse === 'bba-pokhara-university') return 'Semester';
    if (selectedCourse.startsWith('plus-two')) return 'Grade / Year';
    return 'Year / Semester';
  }, [selectedCourse]);

  // Dynamic Year or Semester options strictly as per the selected course
  const availableYearsOrSemesters = useMemo(() => {
    if (selectedCourse === 'bbs-tu') {
      return ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    }
    if (selectedCourse === 'mbs-tu') {
      return ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester'];
    }
    if (selectedCourse === 'bba-tu' || selectedCourse === 'bbm-tu' || selectedCourse === 'bba-bbm-tu') {
      return [
        '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
        '5th Semester', '6th Semester', '7th Semester', '8th Semester'
      ];
    }
    if (selectedCourse === 'plus-two-science' || selectedCourse === 'plus-two-management') {
      return ['Grade 11', 'Grade 12'];
    }
    if (selectedCourse === 'bba-pokhara-university') {
      return [
        '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
        '5th Semester', '6th Semester', '7th Semester', '8th Semester'
      ];
    }
    // ALL courses selected: return union of available academic terms
    return [
      '1st Year', '2nd Year', '3rd Year', '4th Year',
      '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
      '5th Semester', '6th Semester', '7th Semester', '8th Semester',
      'Grade 11', 'Grade 12'
    ];
  }, [selectedCourse]);

  // Flexible matcher between material/subject semester/year and target filter
  const matchesYearOrSemester = (itemYearOrSem?: string, target?: string) => {
    if (!target || target === 'ALL') return true;
    if (!itemYearOrSem) return false;
    const a = itemYearOrSem.toLowerCase().trim();
    const b = target.toLowerCase().trim();
    if (a === b) return true;
    const aNorm = a.replace(/st|nd|rd|th/g, '').replace(/\s+/g, '');
    const bNorm = b.replace(/st|nd|rd|th/g, '').replace(/\s+/g, '');
    if (aNorm === bNorm) return true;
    if (a.includes('&') && a.includes(bNorm)) return true;

    // Check if both mention the same number with semester/year/grade
    const aNum = a.match(/\d+/)?.[0];
    const bNum = b.match(/\d+/)?.[0];
    if (aNum && bNum && aNum === bNum) {
      const aIsSem = a.includes('sem');
      const bIsSem = b.includes('sem');
      if (aIsSem && bIsSem) return true;

      const aIsYear = a.includes('year');
      const bIsYear = b.includes('year');
      if (aIsYear && bIsYear) return true;

      const aIsGrade = a.includes('grade');
      const bIsGrade = b.includes('grade');
      if (aIsGrade && bIsGrade) return true;
    }

    return false;
  };

  // Dynamic Subjects strictly as per selected Course AND Year/Semester
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();

    const targetCourses = selectedCourse === 'ALL'
      ? courses
      : courses.filter((c) => c.slug === selectedCourse);

    targetCourses.forEach((c) => {
      c.subjectsOffered.forEach((s) => {
        if (selectedYearOrSemester === 'ALL' || matchesYearOrSemester(s.semesterOrYear, selectedYearOrSemester)) {
          set.add(s.name);
        }
      });
    });

    // Also include published materials' subject names matching the course and year/semester
    studyMaterials.forEach((m) => {
      if (!m.published) return;
      const courseMatch = selectedCourse === 'ALL' || m.courseSlug === selectedCourse;
      const yearMatch = selectedYearOrSemester === 'ALL' || matchesYearOrSemester(m.semesterOrYear, selectedYearOrSemester);
      if (courseMatch && yearMatch && m.subject) {
        set.add(m.subject);
      }
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [courses, studyMaterials, selectedCourse, selectedYearOrSemester]);

  // Handler when Course changes: resets downstream Year/Semester and Subject
  const handleCourseChange = (newCourse: string) => {
    setSelectedCourse(newCourse);
    setSelectedYearOrSemester('ALL');
    setSelectedSubject('ALL');
  };

  // Handler when Year/Semester changes: resets downstream Subject
  const handleYearOrSemesterChange = (newYearOrSem: string) => {
    setSelectedYearOrSemester(newYearOrSem);
    setSelectedSubject('ALL');
  };

  // Filtered study materials matching all active criteria
  const filteredMaterials = useMemo(() => {
    return studyMaterials
      .filter((m) => m.published)
      .filter((m) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.courseName.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
        );
      })
      .filter((m) => {
        if (selectedCourse === 'ALL') return true;
        return m.courseSlug === selectedCourse;
      })
      .filter((m) => {
        if (selectedCourseType === 'ALL') return true;
        return (m.courseType || 'New Course') === selectedCourseType;
      })
      .filter((m) => {
        if (selectedYearOrSemester === 'ALL') return true;
        return matchesYearOrSemester(m.semesterOrYear, selectedYearOrSemester);
      })
      .filter((m) => {
        if (selectedSubject === 'ALL') return true;
        return m.subject.toLowerCase() === selectedSubject.toLowerCase();
      })
      .filter((m) => {
        if (selectedType === 'ALL') return true;
        return m.resourceType === selectedType;
      })
      .filter((m) => {
        if (selectedAccess === 'ALL') return true;
        return m.accessLevel === selectedAccess;
      })
      .filter((m) => {
        if (!filterEnrolledOnly) return true;
        if (currentUser?.role === 'student') {
          return currentUser.enrolledCourseSlugs?.includes(m.courseSlug);
        }
        return true;
      });
  }, [studyMaterials, searchQuery, selectedCourse, selectedCourseType, selectedYearOrSemester, selectedSubject, selectedType, selectedAccess, filterEnrolledOnly, currentUser]);

  // Dynamic counts for each resource type based on current Course + Year/Semester + Subject filters
  const resourceCountsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    resourceTypes.forEach((t) => {
      counts[t] = 0;
    });

    studyMaterials
      .filter((m) => m.published)
      .filter((m) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.courseName.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
        );
      })
      .filter((m) => selectedCourse === 'ALL' || m.courseSlug === selectedCourse)
      .filter((m) => selectedCourseType === 'ALL' || (m.courseType || 'New Course') === selectedCourseType)
      .filter((m) => selectedYearOrSemester === 'ALL' || matchesYearOrSemester(m.semesterOrYear, selectedYearOrSemester))
      .filter((m) => selectedSubject === 'ALL' || m.subject.toLowerCase() === selectedSubject.toLowerCase())
      .filter((m) => selectedAccess === 'ALL' || m.accessLevel === selectedAccess)
      .forEach((m) => {
        if (counts[m.resourceType] !== undefined) {
          counts[m.resourceType]++;
        }
      });

    return counts;
  }, [studyMaterials, searchQuery, selectedCourse, selectedCourseType, selectedYearOrSemester, selectedSubject, selectedAccess]);

  const recordedVideosTotalCount = useMemo(() => {
    return studyMaterials.filter((m) => m.published && m.resourceType === 'Recorded Videos').length;
  }, [studyMaterials]);

  const handleDownload = (material: StudyMaterial) => {
    const isEnrolled =
      currentUser?.role === 'admin' ||
      (currentUser?.role === 'student' && currentUser.enrolledCourseSlugs?.includes(material.courseSlug));

    if (!isEnrolled) {
      setRestrictedMaterial(material);
      return;
    }
    setDownloadSuccessModal(material);
  };

  const handleOpenVideo = (material: StudyMaterial) => {
    const isEnrolled =
      currentUser?.role === 'admin' ||
      (currentUser?.role === 'student' && currentUser.enrolledCourseSlugs?.includes(material.courseSlug));

    if (!isEnrolled) {
      setRestrictedMaterial(material);
      return;
    }
    setIsPlayingVideo(false);
    setActiveVideoModal(material);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCourse('ALL');
    setSelectedCourseType('ALL');
    setSelectedYearOrSemester('ALL');
    setSelectedSubject('ALL');
    setSelectedType('ALL');
    setSelectedAccess('ALL');
    setFilterEnrolledOnly(false);
  };

  const isAnyFilterActive =
    searchQuery !== '' ||
    selectedCourse !== 'ALL' ||
    selectedCourseType !== 'ALL' ||
    selectedYearOrSemester !== 'ALL' ||
    selectedSubject !== 'ALL' ||
    selectedType !== 'ALL' ||
    selectedAccess !== 'ALL';

  return (
    <div className="py-12 sm:py-16 space-y-10">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Academic Resource Library</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#12315A] tracking-tight">
          Study Materials & Recorded Lectures
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Access structured notes, previous TU board question solutions, model answers, and recorded video lectures categorized by course, year/semester, and subject.
        </p>

        {/* Quick Filter: Recorded Videos, Enrolled Materials, and Course Type Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {/* Syllabus Category Toggle */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setSelectedCourseType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCourseType === 'ALL'
                  ? 'bg-white text-[#12315A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Syllabi
            </button>
            <button
              onClick={() => setSelectedCourseType('New Course')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCourseType === 'New Course'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              New Course (Regular)
            </button>
            <button
              onClick={() => setSelectedCourseType('Old Course')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCourseType === 'Old Course'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-amber-800'
              }`}
            >
              Old Course (Backpaper Prep)
            </button>
          </div>

          {currentUser?.role === 'student' && (
            <button
              onClick={() => setFilterEnrolledOnly(!filterEnrolledOnly)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                filterEnrolledOnly
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>My Enrolled Program Materials Only</span>
              {filterEnrolledOnly && (
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded">Active</span>
              )}
            </button>
          )}

          <button
            onClick={() => {
              setSelectedType(selectedType === 'Recorded Videos' ? 'ALL' : 'Recorded Videos');
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
              selectedType === 'Recorded Videos'
                ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Video className="w-4 h-4 text-rose-600" />
            <span>Recorded Videos ({resourceCountsByType['Recorded Videos'] ?? recordedVideosTotalCount})</span>
            {selectedType === 'Recorded Videos' && (
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded">Active</span>
            )}
          </button>

          <button
            onClick={() => setSelectedType(selectedType === 'PDF Notes' ? 'ALL' : 'PDF Notes')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
              selectedType === 'PDF Notes'
                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>PDF Notes ({resourceCountsByType['PDF Notes'] ?? 0})</span>
          </button>
        </div>
      </div>

      {/* Student Enrollment Status Indicator Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {currentUser?.role === 'student' ? (
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-blue-50 border border-blue-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#12315A] text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-[#12315A]">
                    Active Student Portal: {currentUser.name} ({currentUser.studentId || 'Authenticated'})
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Enrolled Access Verified
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-slate-600 font-medium">Your Enrolled Program(s):</span>
                  {currentUser.enrolledCourseSlugs && currentUser.enrolledCourseSlugs.length > 0 ? (
                    currentUser.enrolledCourseSlugs.map((slug) => {
                      const c = courses.find((x) => x.slug === slug);
                      return (
                        <span
                          key={slug}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-white text-blue-900 border border-blue-300 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{c ? c.title : slug}</span>
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-rose-600 font-semibold">No active program enrolled</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  You have full download & viewing access for your enrolled program(s). Materials for all other programs remain locked.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <Link
                to="/student/dashboard"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-blue-900 bg-white border border-blue-300 hover:bg-blue-50 transition-colors shadow-xs"
              >
                My Student Dashboard
              </Link>
            </div>
          </div>
        ) : currentUser?.role === 'admin' ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-900 shadow-xs">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>
                <strong>Administrator Mode:</strong> Master access granted to preview, download, and manage study materials across all programs.
              </span>
            </div>
            <Link to="/admin" className="font-bold text-amber-900 hover:underline">
              Admin Portal &rarr;
            </Link>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#12315A] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#12315A]">
                  Student Resource Access Policy
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Academic study materials, past TU question solutions, and video lectures are strictly reserved for enrolled students of each respective program.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
              <Link
                to="/student/login"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#12315A] hover:bg-blue-900 transition-colors shadow-sm"
              >
                Student Login
              </Link>
              <Link
                to="/admission"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                Apply for Admission
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Cascading Filter and Search Box */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by topic, subject code, or keyword (e.g. Strategic Management, Cost Accounting, FIN 687, MKT 511)..."
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

            {isAnyFilterActive && (
              <button
                onClick={resetAllFilters}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>

          {/* Cascading Filter Columns:
              1. Filter by Course (Concise names: BBS-TU, MBS-TU, etc.)
              2. Years or Semester (Strictly as per selected course)
              3. Subjects (Strictly as per selected course and year/semester)
              4. Resource Type (Strictly as per course, year/semester, and subject)
              5. Access Level
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs">
            {/* 1. Filter: Course */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Filter by Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Academic Courses</option>
                {courses.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {getCourseDisplayName(c)}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Filter: Years or Semester (Column on the right of Course) */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center justify-between">
                <span>{yearOrSemesterLabel}</span>
                {selectedYearOrSemester !== 'ALL' && (
                  <button
                    onClick={() => handleYearOrSemesterChange('ALL')}
                    className="text-[10px] text-blue-600 hover:underline font-normal cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </label>
              <select
                value={selectedYearOrSemester}
                onChange={(e) => handleYearOrSemesterChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">
                  {selectedCourse === 'bbs-tu'
                    ? 'All Years (BBS)'
                    : selectedCourse === 'mbs-tu'
                    ? 'All Semesters (MBS)'
                    : selectedCourse.startsWith('plus-two')
                    ? 'All Grades'
                    : 'All Years / Semesters'}
                </option>
                {availableYearsOrSemesters.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Filter: Subjects (Column on the right of Years/Semester) */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center justify-between">
                <span>Subjects ({availableSubjects.length})</span>
                {selectedSubject !== 'ALL' && (
                  <button
                    onClick={() => setSelectedSubject('ALL')}
                    className="text-[10px] text-blue-600 hover:underline font-normal cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Subjects ({availableSubjects.length})</option>
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Filter: Resource Type (Column on the right of Subjects) */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center justify-between">
                <span>Resource Type</span>
                {selectedType !== 'ALL' && (
                  <button
                    onClick={() => setSelectedType('ALL')}
                    className="text-[10px] text-blue-600 hover:underline font-normal cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Resource Types</option>
                {resourceTypes.map((type) => {
                  const count = resourceCountsByType[type] ?? 0;
                  return (
                    <option key={type} value={type}>
                      {type === 'Recorded Videos' ? '📹 Recorded Videos' : type} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 5. Filter: Access Level */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center justify-between">
                <span>Access Level</span>
                {selectedAccess !== 'ALL' && (
                  <button
                    onClick={() => setSelectedAccess('ALL')}
                    className="text-[10px] text-blue-600 hover:underline font-normal cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </label>
              <select
                value={selectedAccess}
                onChange={(e) => setSelectedAccess(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Access Levels</option>
                <option value="Public">Public (Free Access)</option>
                <option value="Enrolled Students">Enrolled Students Only</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips / Pills */}
          {isAnyFilterActive && (
            <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] border-t border-slate-100">
              <span className="text-slate-400 font-semibold">Active Filters:</span>

              {selectedCourse !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                  <span>Course: {getCourseDisplayName(courses.find((c) => c.slug === selectedCourse)!)}</span>
                  <button
                    onClick={() => handleCourseChange('ALL')}
                    className="hover:text-blue-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedYearOrSemester !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                  <span>{yearOrSemesterLabel}: {selectedYearOrSemester}</span>
                  <button
                    onClick={() => handleYearOrSemesterChange('ALL')}
                    className="hover:text-amber-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedSubject !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                  <span>Subject: {selectedSubject}</span>
                  <button
                    onClick={() => setSelectedSubject('ALL')}
                    className="hover:text-emerald-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedType !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 font-semibold border border-rose-200">
                  <span>Resource: {selectedType}</span>
                  <button
                    onClick={() => setSelectedType('ALL')}
                    className="hover:text-rose-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedAccess !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                  <span>Access: {selectedAccess}</span>
                  <button
                    onClick={() => setSelectedAccess('ALL')}
                    className="hover:text-slate-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={resetAllFilters}
                className="text-xs text-rose-600 hover:underline font-semibold ml-auto cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Materials List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs sm:text-sm font-semibold text-slate-600">
            Showing <strong>{filteredMaterials.length}</strong> academic resources matching criteria
          </p>

          {!currentUser && (
            <Link
              to="/student/login"
              className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Log in to unlock enrolled student materials</span>
            </Link>
          )}
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No resources found matching the selected filters</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your Year/Semester, Subject, or Resource Type filter, or search query to find relevant materials.
            </p>
            <button
              onClick={resetAllFilters}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMaterials.map((mat) => {
              const isEnrolled =
                currentUser?.role === 'admin' ||
                (currentUser?.role === 'student' && currentUser.enrolledCourseSlugs?.includes(mat.courseSlug));

              return (
                <div
                  key={mat.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    isEnrolled
                      ? mat.resourceType === 'Recorded Videos'
                        ? 'bg-white border-rose-200 hover:border-rose-400 shadow-sm'
                        : 'bg-white border-slate-200/90 hover:border-blue-300 shadow-sm'
                      : 'bg-slate-50/70 border-slate-200/80 shadow-2xs'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded flex items-center gap-1 ${
                            mat.resourceType === 'Recorded Videos'
                              ? 'bg-rose-100 text-rose-800 font-extrabold border border-rose-200'
                              : 'bg-blue-50 text-blue-800'
                          }`}
                        >
                          {mat.resourceType === 'Recorded Videos' && <Video className="w-3 h-3 text-rose-600" />}
                          <span>{mat.resourceType}</span>
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            mat.courseType === 'Old Course'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {mat.courseType || 'New Course'}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                          isEnrolled
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : currentUser
                            ? 'bg-amber-50 text-amber-900 border border-amber-300 font-semibold'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isEnrolled ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Enrolled • Unlocked</span>
                          </>
                        ) : currentUser ? (
                          <>
                            <Lock className="w-3 h-3 text-amber-600" />
                            <span>Locked (Not Enrolled)</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>Enrolled Students Only</span>
                          </>
                        )}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {mat.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                      <span><strong>Course:</strong> {mat.courseName}</span>
                      <span>•</span>
                      <span><strong>Subject:</strong> {mat.subject}</span>
                      <span>•</span>
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{mat.semesterOrYear}</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {mat.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">{mat.fileSize} • Uploaded {mat.uploadDate}</span>

                    {isEnrolled ? (
                      mat.resourceType === 'Recorded Videos' ? (
                        <button
                          onClick={() => handleOpenVideo(mat)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Watch Video</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDownload(mat)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#12315A] hover:bg-[#1f487e] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-400" />
                          <span>Download / View</span>
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => setRestrictedMaterial(mat)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        <span>{currentUser ? 'Locked (Not Enrolled)' : 'Enroll to Access'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Lecture Player Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 text-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-700 relative space-y-0">
            {/* Top Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Video className="w-3 h-3" />
                  <span>Recorded Video Lecture</span>
                </span>
                <span className="text-xs text-slate-400 font-medium truncate">
                  {activeVideoModal.courseName} • {activeVideoModal.subject} • {activeVideoModal.semesterOrYear}
                </span>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close video player"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Display Screen */}
            <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

              {/* Background Video Visual */}
              <img
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80"
                alt={activeVideoModal.title}
                className="w-full h-full object-cover opacity-60"
              />

              {/* Play Button Overlay */}
              <div className="relative z-10 text-center space-y-3 p-4">
                <button
                  onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-2xl hover:scale-110 transition-transform cursor-pointer ${
                    isPlayingVideo
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                  aria-label={isPlayingVideo ? 'Pause Lecture' : 'Play Lecture'}
                >
                  {isPlayingVideo ? (
                    <Pause className="w-8 h-8 fill-current" />
                  ) : (
                    <Play className="w-8 h-8 fill-current ml-1" />
                  )}
                </button>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-white max-w-xl mx-auto drop-shadow-md">
                    {activeVideoModal.title}
                  </h4>
                  <p className="text-xs text-slate-300 drop-shadow">
                    Duration: {activeVideoModal.fileSize} • Shikshyalaya Faculty Lecture
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-400 mt-1">
                    {isPlayingVideo ? '● Streaming live in 1080p HD' : 'Click to start video lecture stream'}
                  </p>
                </div>
              </div>

              {/* Bottom Video Controls Simulation Bar */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsPlayingVideo(!isPlayingVideo)} className="cursor-pointer">
                    {isPlayingVideo ? <Pause className="w-4 h-4 fill-current text-emerald-400" /> : <Play className="w-4 h-4 fill-current text-white" />}
                  </button>
                  <span>{isPlayingVideo ? '04:15' : '00:00'} / {activeVideoModal.fileSize.replace(/[^0-9]/g, '')}:00</span>
                </div>
                <div className="flex items-center gap-3 font-semibold text-[11px]">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">1080p HD</span>
                  <span>1.0x Speed</span>
                </div>
              </div>
            </div>

            {/* Description & Notes Download */}
            <div className="p-6 bg-slate-900 space-y-3">
              <h4 className="text-sm font-bold text-white">Lecture Overview & Key Concepts:</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeVideoModal.description}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-800">
                <span className="text-slate-400">
                  Recorded classroom session for {activeVideoModal.semesterOrYear} scholars.
                </span>
                <button
                  onClick={() => {
                    const blob = new Blob([
                      `SHIKSHYALAYA SHAIKSHIK SANSTHA\nLecture Notes: ${activeVideoModal.title}\nCourse: ${activeVideoModal.courseName}\nSubject: ${activeVideoModal.subject}\nEnrolled Student: ${currentUser?.name || 'Verified Scholar'}\n`
                    ], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${activeVideoModal.title.replace(/\s+/g, '_')}_Notes.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Accompanying PDF Notes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restricted Access Modal */}
      {restrictedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 relative">
            <button
              onClick={() => setRestrictedMaterial(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                  Enrollment Access Restricted
                </span>
                <h3 className="text-lg font-bold text-[#12315A] mt-0.5">
                  Course Enrollment Required
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs">
              <p className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                Requested Study Material:
              </p>
              <p className="font-bold text-slate-900 text-sm leading-snug">{restrictedMaterial.title}</p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-slate-600">
                <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                  <strong>Program:</strong> {restrictedMaterial.courseName}
                </span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                  <strong>Subject:</strong> {restrictedMaterial.subject}
                </span>
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">
                  {restrictedMaterial.semesterOrYear}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              {currentUser?.role === 'student' ? (
                <>
                  <p>
                    You are logged in as <strong>{currentUser.name}</strong> ({currentUser.studentId}), currently enrolled in:{' '}
                    <span className="font-semibold text-blue-700">
                      {currentUser.enrolledCourseSlugs && currentUser.enrolledCourseSlugs.length > 0
                        ? currentUser.enrolledCourseSlugs.map((s) => courses.find((c) => c.slug === s)?.title || s).join(', ')
                        : 'No active courses'}
                    </span>.
                  </p>
                  <p className="text-amber-900 font-medium bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                    Students are strictly granted access only to the academic resources for programs they are officially enrolled in. Because you are not currently enrolled in <strong>{restrictedMaterial.courseName}</strong>, this resource is locked.
                  </p>
                </>
              ) : (
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  Full study materials, solved past board papers, formula summaries, and recorded classroom lectures for{' '}
                  <strong>{restrictedMaterial.courseName}</strong> are reserved for enrolled students. Please log in or apply for admission.
                </p>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                to={`/admission?course=${restrictedMaterial.courseSlug}`}
                onClick={() => setRestrictedMaterial(null)}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#12315A] hover:bg-blue-900 text-center transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>Enroll in {restrictedMaterial.courseName}</span>
              </Link>
              {!currentUser && (
                <Link
                  to="/student/login"
                  onClick={() => setRestrictedMaterial(null)}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 text-center transition-colors"
                >
                  Student Login
                </Link>
              )}
              {currentUser && (
                <Link
                  to="/student/dashboard"
                  onClick={() => setRestrictedMaterial(null)}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-center transition-colors"
                >
                  My Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Download Success Modal for Verified Enrolled Students */}
      {downloadSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-5 relative">
            <button
              onClick={() => setDownloadSuccessModal(null)}
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
                  Academic Document Unlocked
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <p className="font-bold text-slate-900 text-sm leading-snug">{downloadSuccessModal.title}</p>
              <div className="text-slate-600 space-y-1">
                <p><strong>Course:</strong> {downloadSuccessModal.courseName}</p>
                <p><strong>Subject:</strong> {downloadSuccessModal.subject} ({downloadSuccessModal.semesterOrYear})</p>
                <p><strong>Resource Type:</strong> {downloadSuccessModal.resourceType} • {downloadSuccessModal.fileSize}</p>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Authorized academic document ready for download for <strong>{currentUser?.name || 'Verified Scholar'}</strong>.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => {
                  const blob = new Blob([
                    `SHIKSHYALAYA SHAIKSHIK SANSTHA\nDocument: ${downloadSuccessModal.title}\nCourse: ${downloadSuccessModal.courseName}\nSubject: ${downloadSuccessModal.subject} (${downloadSuccessModal.semesterOrYear})\nAccess Level: Authorized Enrolled Student\n`
                  ], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${downloadSuccessModal.subject.replace(/\s+/g, '_')}_${downloadSuccessModal.title.replace(/\s+/g, '_')}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  setDownloadSuccessModal(null);
                }}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-[#12315A] hover:bg-blue-900 transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Save to Device</span>
              </button>
              <button
                onClick={() => setDownloadSuccessModal(null)}
                className="py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
