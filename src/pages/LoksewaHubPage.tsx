import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Award,
  BookOpen,
  FileText,
  Clock,
  CheckCircle2,
  Download,
  GraduationCap,
  Landmark,
  Briefcase,
  Users,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  FileCheck,
  Check,
  Building2,
  FileUp,
  RotateCcw,
  Eye,
  Send,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Course } from '../types';

export const LoksewaHubPage: React.FC = () => {
  const { courses, studyMaterials, mockTests, submitMockTestAnswer, language } = useApp();

  // All Loksewa Category Courses
  const loksewaCourses = useMemo(() => {
    return courses.filter((c) => c.category === 'loksewa');
  }, [courses]);

  // Main Feature Tabs
  const [activeFeatureTab, setActiveFeatureTab] = useState<'courses' | 'resources' | 'mock-tests' | 'upload'>('courses');

  // Top Segmented Filter Tabs (matching the requested pattern)
  const [selectedQuickTab, setSelectedQuickTab] = useState<string>('ALL');

  // Structured Dropdown Filters (matching the 4-column filter in the user's screenshot)
  const [selectedLevelRank, setSelectedLevelRank] = useState<string>('ALL');
  const [selectedServiceSector, setSelectedServiceSector] = useState<string>('ALL');
  const [selectedPaperStage, setSelectedPaperStage] = useState<string>('ALL');
  const [selectedClassMode, setSelectedClassMode] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'level' | 'title'>('featured');

  // Download toast state
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Quick PDF Answer Sheet Upload State for Loksewa Tab
  const [uploadStudentName, setUploadStudentName] = useState('');
  const [uploadStudentPhone, setUploadStudentPhone] = useState('');
  const [uploadCourseSlug, setUploadCourseSlug] = useState('loksewa-officer-level-6');
  const [uploadPaper, setUploadPaper] = useState('2nd Paper (Subjective - 100 Marks)');
  const [uploadSubject, setUploadSubject] = useState('Governance System, Constitution & Public Administration');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Sync quick segmented tab with level filter
  const handleQuickTabSelect = (tabId: string) => {
    setSelectedQuickTab(tabId);
    setSelectedLevelRank(tabId);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedQuickTab('ALL');
    setSelectedLevelRank('ALL');
    setSelectedServiceSector('ALL');
    setSelectedPaperStage('ALL');
    setSelectedClassMode('ALL');
    setSearchQuery('');
    setSortBy('featured');
  };

  const isFiltered =
    selectedQuickTab !== 'ALL' ||
    selectedLevelRank !== 'ALL' ||
    selectedServiceSector !== 'ALL' ||
    selectedPaperStage !== 'ALL' ||
    selectedClassMode !== 'ALL' ||
    searchQuery.trim() !== '';

  // Filtered Loksewa Courses
  const filteredCourses = useMemo(() => {
    return loksewaCourses
      .filter((c) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            c.title.toLowerCase().includes(q) ||
            (c.devanagariTitle && c.devanagariTitle.toLowerCase().includes(q)) ||
            c.shortDescription.toLowerCase().includes(q) ||
            c.subjectsOffered?.some((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
          if (!matches) return false;
        }

        // Level & Rank filter
        if (selectedLevelRank !== 'ALL') {
          if (selectedLevelRank === 'level-6' && c.slug !== 'loksewa-officer-level-6') return false;
          if (selectedLevelRank === 'rbb-4' && c.slug !== 'loksewa-rbb-level-4') return false;
          if (selectedLevelRank === 'rbb-6' && c.slug !== 'loksewa-rbb-level-6') return false;
          if (selectedLevelRank === 'nbl-4' && c.slug !== 'loksewa-nbl-level-4') return false;
          if (selectedLevelRank === 'nbl-6' && c.slug !== 'loksewa-nbl-level-6') return false;
          if (selectedLevelRank === 'rbb' && !c.slug.includes('rbb')) return false;
          if (selectedLevelRank === 'nbl' && !c.slug.includes('nbl')) return false;
          if (selectedLevelRank === 'level-5' && c.slug !== 'loksewa-nayab-subba') return false;
          if (selectedLevelRank === 'level-4' && c.slug !== 'loksewa-kharidar') return false;
          if (selectedLevelRank === 'officer' && c.slug !== 'loksewa-section-officer') return false;
          if (
            selectedLevelRank === 'banking' &&
            !['loksewa-banking-preparation', 'loksewa-rbb-level-4', 'loksewa-rbb-level-6', 'loksewa-nbl-level-4', 'loksewa-nbl-level-6'].includes(c.slug)
          ) {
            return false;
          }
          if (selectedLevelRank === 'tsc' && c.slug !== 'teachers-service-commission-tsc') return false;
        }

        // Service & Sector filter
        if (selectedServiceSector !== 'ALL') {
          if (selectedServiceSector === 'rbb' && !c.slug.includes('rbb')) return false;
          if (selectedServiceSector === 'nbl' && !c.slug.includes('nbl')) return false;
          const sec = selectedServiceSector.toLowerCase();
          const hasSubjectMatch = c.subjectsOffered?.some(
            (s) => s.name.toLowerCase().includes(sec) || s.description.toLowerCase().includes(sec)
          );
          if (!hasSubjectMatch && !c.shortDescription.toLowerCase().includes(sec) && !c.title.toLowerCase().includes(sec)) {
            return false;
          }
        }

        // Examination Paper Stage filter
        if (selectedPaperStage !== 'ALL') {
          if (selectedPaperStage === '1st-paper') {
            const has1stPaper = c.subjectsOffered?.some((s) => s.semesterOrYear?.includes('1st Paper'));
            if (!has1stPaper) return false;
          } else if (selectedPaperStage === '2nd-paper') {
            const has2ndPaper = c.subjectsOffered?.some((s) => s.semesterOrYear?.includes('2nd Paper'));
            if (!has2ndPaper) return false;
          } else if (selectedPaperStage === '3rd-paper') {
            const has3rdPaper = c.subjectsOffered?.some((s) => s.semesterOrYear?.includes('3rd Paper'));
            if (!has3rdPaper) return false;
          } else if (selectedPaperStage === '4th-paper') {
            const has4thPaper = c.subjectsOffered?.some((s) => s.semesterOrYear?.includes('4th Paper'));
            if (!has4thPaper) return false;
          }
        }

        // Class Mode filter
        if (selectedClassMode !== 'ALL') {
          if (!c.classModes.includes(selectedClassMode as any)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'level') {
          // Sort 6th level and section officer first
          if (a.slug === 'loksewa-officer-level-6') return -1;
          if (b.slug === 'loksewa-officer-level-6') return 1;
          return a.level.localeCompare(b.level);
        }
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [loksewaCourses, searchQuery, selectedLevelRank, selectedServiceSector, selectedPaperStage, selectedClassMode, sortBy]);

  // Filtered Study Materials for Loksewa
  const filteredMaterials = useMemo(() => {
    return studyMaterials.filter((m) => {
      const isLoksewa = loksewaCourses.some((c) => c.slug === m.courseSlug);
      if (!isLoksewa) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !m.title.toLowerCase().includes(q) &&
          !m.subject.toLowerCase().includes(q) &&
          !m.description.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      if (selectedLevelRank !== 'ALL') {
        if (selectedLevelRank === 'level-6' && m.courseSlug !== 'loksewa-officer-level-6') return false;
        if (selectedLevelRank === 'rbb-4' && m.courseSlug !== 'loksewa-rbb-level-4') return false;
        if (selectedLevelRank === 'rbb-6' && m.courseSlug !== 'loksewa-rbb-level-6') return false;
        if (selectedLevelRank === 'nbl-4' && m.courseSlug !== 'loksewa-nbl-level-4') return false;
        if (selectedLevelRank === 'nbl-6' && m.courseSlug !== 'loksewa-nbl-level-6') return false;
        if (selectedLevelRank === 'rbb' && !m.courseSlug.includes('rbb')) return false;
        if (selectedLevelRank === 'nbl' && !m.courseSlug.includes('nbl')) return false;
        if (selectedLevelRank === 'level-5' && m.courseSlug !== 'loksewa-nayab-subba') return false;
        if (selectedLevelRank === 'level-4' && m.courseSlug !== 'loksewa-kharidar') return false;
        if (selectedLevelRank === 'officer' && m.courseSlug !== 'loksewa-section-officer') return false;
        if (
          selectedLevelRank === 'banking' &&
          !['loksewa-banking-preparation', 'loksewa-rbb-level-4', 'loksewa-rbb-level-6', 'loksewa-nbl-level-4', 'loksewa-nbl-level-6'].includes(m.courseSlug)
        ) {
          return false;
        }
        if (selectedLevelRank === 'tsc' && m.courseSlug !== 'teachers-service-commission-tsc') return false;
      }

      if (selectedPaperStage !== 'ALL') {
        if (selectedPaperStage === '1st-paper' && !m.semesterOrYear.includes('1st Paper') && !m.semesterOrYear.includes('Pre-Test')) return false;
        if (selectedPaperStage === '2nd-paper' && !m.semesterOrYear.includes('2nd Paper')) return false;
        if (selectedPaperStage === '3rd-paper' && !m.semesterOrYear.includes('3rd Paper')) return false;
        if (selectedPaperStage === '4th-paper' && !m.semesterOrYear.includes('4th Paper')) return false;
      }

      return true;
    });
  }, [studyMaterials, loksewaCourses, searchQuery, selectedLevelRank, selectedPaperStage]);

  // Filtered Mock Tests for Loksewa
  const filteredMockTests = useMemo(() => {
    return mockTests.filter((t) => {
      const isLoksewa = loksewaCourses.some((c) => c.slug === t.courseSlug);
      if (!isLoksewa) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const instText = Array.isArray(t.instructions) ? t.instructions.join(' ').toLowerCase() : String(t.instructions || '').toLowerCase();
        if (
          !t.title.toLowerCase().includes(q) &&
          !t.subject.toLowerCase().includes(q) &&
          !instText.includes(q)
        ) {
          return false;
        }
      }

      if (selectedLevelRank !== 'ALL') {
        if (selectedLevelRank === 'level-6' && t.courseSlug !== 'loksewa-officer-level-6') return false;
        if (selectedLevelRank === 'rbb-4' && t.courseSlug !== 'loksewa-rbb-level-4') return false;
        if (selectedLevelRank === 'rbb-6' && t.courseSlug !== 'loksewa-rbb-level-6') return false;
        if (selectedLevelRank === 'nbl-4' && t.courseSlug !== 'loksewa-nbl-level-4') return false;
        if (selectedLevelRank === 'nbl-6' && t.courseSlug !== 'loksewa-nbl-level-6') return false;
        if (selectedLevelRank === 'rbb' && !t.courseSlug.includes('rbb')) return false;
        if (selectedLevelRank === 'nbl' && !t.courseSlug.includes('nbl')) return false;
        if (selectedLevelRank === 'level-5' && t.courseSlug !== 'loksewa-nayab-subba') return false;
        if (selectedLevelRank === 'level-4' && t.courseSlug !== 'loksewa-kharidar') return false;
        if (selectedLevelRank === 'officer' && t.courseSlug !== 'loksewa-section-officer') return false;
        if (
          selectedLevelRank === 'banking' &&
          !['loksewa-banking-preparation', 'loksewa-rbb-level-4', 'loksewa-rbb-level-6', 'loksewa-nbl-level-4', 'loksewa-nbl-level-6'].includes(t.courseSlug)
        ) {
          return false;
        }
        if (selectedLevelRank === 'tsc' && t.courseSlug !== 'teachers-service-commission-tsc') return false;
      }

      if (selectedPaperStage !== 'ALL') {
        if (selectedPaperStage === '1st-paper' && !t.semesterOrYear?.includes('1st Paper') && !t.semesterOrYear?.includes('Pre-Test')) return false;
        if (selectedPaperStage === '2nd-paper' && !t.semesterOrYear?.includes('2nd Paper')) return false;
        if (selectedPaperStage === '3rd-paper' && !t.semesterOrYear?.includes('3rd Paper')) return false;
        if (selectedPaperStage === '4th-paper' && !t.semesterOrYear?.includes('4th Paper')) return false;
      }

      return true;
    });
  }, [mockTests, loksewaCourses, searchQuery, selectedLevelRank, selectedPaperStage]);

  const handleDownloadResource = (title: string) => {
    setDownloadNotice(`Downloading: ${title} (Official Loksewa Document)`);
    setTimeout(() => {
      setDownloadNotice(null);
    }, 3500);
  };

  const handleQuickUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadStudentName || !uploadStudentPhone) return;

    submitMockTestAnswer({
      mockTestId: 'loksewa-subjective-upload',
      mockTestTitle: `${uploadCourseSlug} - ${uploadPaper}`,
      courseSlug: uploadCourseSlug,
      studentId: 'GUEST-LOKSEWA',
      studentName: uploadStudentName,
      studentPhone: uploadStudentPhone,
      rollNumber: `LOK-${Date.now().toString().slice(-5)}`,
      timeTakenSeconds: 3600,
      isLateSubmission: false,
      evaluationStatus: 'Submitted',
      answerFileName: uploadFileName || 'Loksewa_Subjective_Answer_Paper.pdf',
      answerFileSize: '3.8 MB',
      answerFileUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
      typedAnswers: `Submitted subjective answer sheet for ${uploadCourseSlug} (${uploadPaper} - ${uploadSubject}). Evaluator please check presentation and legal provisions.`,
    });

    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setUploadFileName('');
    }, 5000);
  };

  return (
    <div className="space-y-10 sm:space-y-14 pb-20">
      {/* SECTION A: Hero Header for Loksewa Hub */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#092347] via-[#0d2f5d] to-[#092347] text-white py-14 sm:py-20">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold tracking-wider uppercase">
              <Shield className="w-3.5 h-3.5" />
              <span>लोक सेवा आयोग नेपाल (Loksewa Aayog Preparation Hub)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Civil Service, Banking & Public Exam Preparation
            </h1>

            <p className="font-['Noto_Sans_Devanagari',sans-serif] text-lg sm:text-xl text-amber-300 font-bold">
              निजामती सेवा, प्रदेश तथा स्थानीय तह (तह ४, ५, ६ र अधिकृत), सरकारी बैंक र शिक्षक सेवा
            </p>

            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
              Specialized coaching guided by serving Joint Secretaries, Under Secretaries, Section Officers, and top merit rankers. Daily GK & IQ drills, structured subjective answer writing, and authenticated PDF evaluation.
            </p>

            {/* Quick Action Navigation */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/admission?category=loksewa"
                className="px-6 py-3 rounded-xl font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-lg hover:shadow-amber-400/20 transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-slate-900" />
                <span>Enroll for Loksewa Exam</span>
              </Link>

              <button
                type="button"
                onClick={() => setActiveFeatureTab('resources')}
                className="px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 border border-blue-400/30 shadow-lg transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Official Syllabi & PDF Notes</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFeatureTab('mock-tests')}
                className="px-6 py-3 rounded-xl font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-lg transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Timed Mock Tests</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFeatureTab('upload')}
                className="px-5 py-3 rounded-xl font-bold text-rose-300 bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <FileUp className="w-4 h-4 text-rose-400" />
                <span>Upload Answer Sheet</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Download Alert Toast */}
      {downloadNotice && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-400 flex items-center gap-3 animate-slideUp">
          <Download className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
          <p className="text-xs font-semibold">{downloadNotice}</p>
        </div>
      )}

      {/* SECTION B: The Core Feature Container (matching the requested filter UI) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Main View Selector (Courses, Resources, Mock Tests, Upload) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveFeatureTab('courses')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeFeatureTab === 'courses'
                  ? 'bg-[#12315A] text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Exam Courses ({filteredCourses.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFeatureTab('resources')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeFeatureTab === 'resources'
                  ? 'bg-[#12315A] text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Syllabus & PDF Resources ({filteredMaterials.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFeatureTab('mock-tests')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeFeatureTab === 'mock-tests'
                  ? 'bg-[#12315A] text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-4 h-4 text-rose-400" />
              <span>Model Tests & Timers ({filteredMockTests.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFeatureTab('upload')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeFeatureTab === 'upload'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FileUp className="w-4 h-4 text-rose-600" />
              <span>Upload PDF Answer Sheet</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 font-semibold">
            Nepal Civil Service, Local Government & Banking Hub
          </span>
        </div>

        {/* =========================================================================
            FEATURE FILTER BAR UNDER LOKSEWA (EXACT REQUESTED STRUCTURE)
           ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          {/* Top Row: Search input + Sort + Reset */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Loksewa courses, syllabi, subjects, 6th level, papers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-14 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
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
                aria-label="Sort Loksewa courses by"
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="level">Exam Level (६औं, ५औं, ४औं, अधिकृत)</option>
                <option value="title">Exam Name (A-Z)</option>
              </select>

              {isFiltered && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Segmented Tabs Row (Matching top row in user's image) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold w-full overflow-x-auto scrollbar-none">
            {[
              { id: 'ALL', label: 'All Loksewa Exams' },
              { id: 'level-6', label: '६औं तह अधिकृत (6th Level Officer)' },
              { id: 'rbb-4', label: 'RBB तह ४ सहायक (RBB Level 4)' },
              { id: 'rbb-6', label: 'RBB तह ६ अधिकृत (RBB Level 6)' },
              { id: 'nbl-4', label: 'NBL तह ४ सहायक (NBL Level 4)' },
              { id: 'nbl-6', label: 'NBL तह ६ अधिकृत (NBL Level 6)' },
              { id: 'level-5', label: '५औं तह नायब सुब्बा (Na.Su.)' },
              { id: 'level-4', label: '४औं तह खरिदार (Kharidar)' },
              { id: 'officer', label: 'शाखा अधिकृत (Section Officer)' },
              { id: 'banking', label: 'सबै सरकारी बैंक (All Banking)' },
              { id: 'tsc', label: 'शिक्षक सेवा आयोग (TSC)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleQuickTabSelect(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedQuickTab === tab.id
                    ? tab.id === 'level-6' || tab.id === 'rbb-6' || tab.id === 'nbl-6'
                      ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                      : 'bg-[#12315A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 4-Column Structured Loksewa Dropdown Grid (Matching user's screenshot) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
            {/* 1. Exam Level / Rank */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Exam Level & Rank (तह / श्रेणी)
              </label>
              <select
                value={selectedLevelRank}
                onChange={(e) => {
                  setSelectedLevelRank(e.target.value);
                  setSelectedQuickTab(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">All Levels & Ranks (सबै तहहरू)</option>
                <option value="level-6">६औं तह अधिकृत (Civil & Province Officer 6th Level)</option>
                <option value="rbb-4">RBB तह ४ सहायक (Rastriya Banijya Bank Level 4 Assistant / Cash)</option>
                <option value="rbb-6">RBB तह ६ अधिकृत (Rastriya Banijya Bank Level 6 Officer)</option>
                <option value="nbl-4">NBL तह ४ सहायक (Nepal Bank Limited Level 4 Junior Assistant)</option>
                <option value="nbl-6">NBL तह ६ अधिकृत (Nepal Bank Limited Level 6 Assistant Manager)</option>
                <option value="level-5">५औं तह नायब सुब्बा (Non-Gazetted 1st Class - Na.Su.)</option>
                <option value="level-4">४औं तह खरिदार (Non-Gazetted 2nd Class - Kharidar)</option>
                <option value="officer">शाखा अधिकृत (Gazetted 3rd Class - Section Officer)</option>
                <option value="banking">सबै सरकारी बैंक (All Banking: RBB, NBL, ADBL, NRB)</option>
                <option value="tsc">शिक्षक सेवा आयोग (TSC Primary, Lower Sec & Sec)</option>
              </select>
            </div>

            {/* 2. Service & Sector */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Service & Sector (सेवा समूह)
              </label>
              <select
                value={selectedServiceSector}
                onChange={(e) => setSelectedServiceSector(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">All Services & Groups (सबै सेवा समूह)</option>
                <option value="rbb">राष्ट्रिय वाणिज्य बैंक (RBB Banking Prep)</option>
                <option value="nbl">नेपाल बैंक लिमिटेड (NBL Banking Prep)</option>
                <option value="प्रशासन">सामान्य प्रशासन (General Administration)</option>
                <option value="लेखा">लेखा तथा सार्वजनिक वित्त (Accounts & Public Finance)</option>
                <option value="राजस्व">राजस्व प्रशासन (Revenue Administration)</option>
                <option value="शिक्षा">शिक्षा प्रशासन / प्रा.स. (Education Admin / Pra.Sa.)</option>
                <option value="परराष्ट्र">परराष्ट्र मामिला (Foreign Affairs)</option>
                <option value="बैंक">सबै सरकारी बैंकिङ (RBB, NBL, ADBL, NRB)</option>
                <option value="शिक्षक">शिक्षक सेवा (School Teaching)</option>
              </select>
            </div>

            {/* 3. Examination Paper Stage */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Examination Paper (परीक्षा पत्र / चरण)
              </label>
              <select
                value={selectedPaperStage}
                onChange={(e) => setSelectedPaperStage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">All Papers (सबै पत्र तथा चरण)</option>
                <option value="1st-paper">1st Paper (Objective GK & IQ / प्रथम पत्र)</option>
                <option value="2nd-paper">2nd Paper (Governance System & Contemporary / द्वितीय पत्र)</option>
                <option value="3rd-paper">3rd Paper (Service Specific Job Knowledge / तृतीय पत्र)</option>
                <option value="4th-paper">4th Paper (Officer Service Paper / चतुर्थ पत्र)</option>
              </select>
            </div>

            {/* 4. Class Mode & Shift */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Class Mode & Shift (माध्यम तथा समय)
              </label>
              <select
                value={selectedClassMode}
                onChange={(e) => setSelectedClassMode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">All Modes (Online, Physical, Hybrid)</option>
                <option value="Online">Online Live Whiteboard (Zoom Interactive)</option>
                <option value="Offline">Physical Classroom (Putalisadak, Kathmandu)</option>
                <option value="Hybrid">Hybrid (Physical + 24/7 Recorded Archives)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Criteria Indicator Bar */}
        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              Showing{' '}
              <strong className="text-slate-900">
                {activeFeatureTab === 'courses'
                  ? `${filteredCourses.length} Courses`
                  : activeFeatureTab === 'resources'
                  ? `${filteredMaterials.length} Documents`
                  : activeFeatureTab === 'mock-tests'
                  ? `${filteredMockTests.length} Mock Tests`
                  : 'Answer Sheet Submission Portal'}
              </strong>{' '}
              under Loksewa Aayog Nepal
            </span>
          </div>
          {isFiltered && (
            <span className="text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
              Filters Active
            </span>
          )}
        </div>

        {/* =========================================================================
            FEATURE VIEW 1: LOKSEWA COURSES & EXAMS
           ========================================================================= */}
        {activeFeatureTab === 'courses' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCourses.map((course) => {
                const is6thLevel = course.slug === 'loksewa-officer-level-6';
                return (
                  <div
                    key={course.id}
                    className={`bg-white rounded-3xl border ${
                      is6thLevel ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-md' : 'border-slate-200/90'
                    } p-6 sm:p-7 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-6 group`}
                  >
                    <div className="space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                              is6thLevel
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-blue-100 text-blue-900 border border-blue-200'
                            }`}
                          >
                            {course.level}
                          </span>
                          {is6thLevel && (
                            <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md uppercase tracking-wide">
                              Federal & Province Level 6
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {course.duration}
                        </span>
                      </div>

                      {/* Title & Devanagari */}
                      <div>
                        <h3 className="text-xl font-extrabold text-[#12315A] group-hover:text-blue-700 transition-colors">
                          {course.title}
                        </h3>
                        {course.devanagariTitle && (
                          <p className="font-['Noto_Sans_Devanagari',sans-serif] text-sm font-bold text-amber-800 mt-0.5">
                            {course.devanagariTitle}
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {course.shortDescription}
                      </p>

                      {/* Papers Grid */}
                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                          Syllabus Structure & Papers Offered ({course.subjectsOffered?.length || 0} Subjects):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {course.subjectsOffered?.slice(0, 4).map((sub, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded-xl bg-white border border-slate-200/90 text-[11px] space-y-0.5"
                            >
                              <div className="flex items-center justify-between font-bold text-slate-900">
                                <span className="truncate">{sub.name}</span>
                                {sub.code && (
                                  <span className="text-[9px] text-blue-600 bg-blue-50 px-1 py-0.2 rounded shrink-0">
                                    {sub.code}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 block truncate">
                                {sub.semesterOrYear}
                              </span>
                            </div>
                          ))}
                        </div>
                        {(course.subjectsOffered?.length || 0) > 4 && (
                          <p className="text-[11px] text-blue-700 font-semibold pt-1">
                            + {(course.subjectsOffered?.length || 0) - 4} more optional service specialization papers
                          </p>
                        )}
                      </div>

                      {/* Class Schedules & Mode */}
                      <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-medium">Morning 5:30 AM & Evening 6:30 PM</span>
                        </div>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Physical + Live Online
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons for this specific exam */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                      <Link
                        to={`/admission?course=${course.slug}`}
                        className="p-2.5 rounded-xl font-bold text-xs text-slate-900 bg-amber-400 hover:bg-amber-300 text-center transition-colors shadow-xs flex items-center justify-center gap-1"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Enroll Now</span>
                      </Link>

                      <Link
                        to={`/courses/${course.slug}`}
                        className="p-2.5 rounded-xl font-bold text-xs text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-center transition-colors flex items-center justify-center gap-1"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                        <span>Full Syllabus</span>
                      </Link>

                      <Link
                        to={`/mock-tests?course=${course.slug}`}
                        className="p-2.5 rounded-xl font-bold text-xs text-slate-800 bg-slate-100 hover:bg-slate-200 text-center transition-colors flex items-center justify-center gap-1"
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-700" />
                        <span>Mock Test</span>
                      </Link>

                      <Link
                        to={`/upload-answer-sheet?course=${course.slug}`}
                        className="p-2.5 rounded-xl font-bold text-xs text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-center transition-colors flex items-center justify-center gap-1"
                      >
                        <FileUp className="w-3.5 h-3.5 text-rose-600" />
                        <span>Upload PDF</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            FEATURE VIEW 2: SYLLABUS & PDF RESOURCES
           ========================================================================= */}
        {activeFeatureTab === 'resources' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map((material) => (
                <div
                  key={material.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                        {material.resourceType}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {material.fileSize}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#12315A] line-clamp-2">
                      {material.title}
                    </h3>

                    <div className="space-y-1 text-xs text-slate-600">
                      <p className="font-semibold text-amber-800">{material.courseName}</p>
                      <p className="text-[11px] text-slate-500">{material.subject} · {material.semesterOrYear}</p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {material.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Uploaded {material.uploadDate}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDownloadResource(material.title)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            FEATURE VIEW 3: TIMED MOCK TESTS & MODEL PAPERS
           ========================================================================= */}
        {activeFeatureTab === 'mock-tests' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMockTests.map((test) => (
                <div
                  key={test.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                        {test.subject}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{test.durationMinutes} Mins</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#12315A]">
                      {test.title}
                    </h3>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p className="font-semibold text-blue-800">{test.courseName}</p>
                      <p className="text-slate-500">{test.semesterOrYear}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Full Marks</span>
                        <span className="font-bold text-slate-900">{test.fullMarks} Marks</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Pass Marks</span>
                        <span className="font-bold text-emerald-700">{test.passMarks} Marks</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                    <Link
                      to={`/mock-tests?course=${test.courseSlug}&testId=${test.id}`}
                      className="w-full px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs text-center transition-colors shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Take Timed Test</span>
                    </Link>

                    <Link
                      to={`/upload-answer-sheet?course=${test.courseSlug}&testId=${test.id}`}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileUp className="w-3.5 h-3.5 text-rose-600" />
                      <span>Upload PDF Sheet</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            FEATURE VIEW 4: DIRECT ANSWER SHEET UPLOAD PORTAL
           ========================================================================= */}
        {activeFeatureTab === 'upload' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-6 max-w-3xl mx-auto">
            <div className="space-y-2 text-center pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <FileUp className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#12315A]">
                Upload Loksewa Written Answer Sheet (PDF)
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Submit your handwritten Paper 2 or Paper 3 answer sheets in PDF format. Serving officers and subject specialists will check your presentation, working notes, and assign marks.
              </p>
            </div>

            {uploadSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Success!</strong> Your Loksewa answer sheet has been submitted for evaluation. You can track remarks using your mobile number.
                </span>
              </div>
            )}

            <form onSubmit={handleQuickUploadSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Adhikari"
                    value={uploadStudentName}
                    onChange={(e) => setUploadStudentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="9767648342 / 98XXXXXXXX"
                    value={uploadStudentPhone}
                    onChange={(e) => setUploadStudentPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Target Loksewa Examination <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={uploadCourseSlug}
                    onChange={(e) => setUploadCourseSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {loksewaCourses.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Target Paper <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={uploadPaper}
                    onChange={(e) => setUploadPaper(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="2nd Paper (Subjective - 100 Marks)">2nd Paper (Governance System & Contemporary)</option>
                    <option value="3rd Paper (Subjective - 100 Marks)">3rd Paper (Service Specific Knowledge)</option>
                    <option value="4th Paper (Subjective - 100 Marks)">4th Paper (Officer Service Paper)</option>
                  </select>
                </div>
              </div>

              {/* Upload Drag Box */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Upload Answer Sheet (PDF Format) <span className="text-rose-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center transition-colors bg-slate-50 cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFileName(e.target.files[0].name);
                      }
                    }}
                    className="hidden"
                    id="loksewa-pdf-upload"
                  />
                  <label htmlFor="loksewa-pdf-upload" className="cursor-pointer space-y-2 block">
                    <FileText className="w-8 h-8 text-rose-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-800">
                      {uploadFileName ? (
                        <span className="text-emerald-700 font-bold">Selected: {uploadFileName}</span>
                      ) : (
                        'Click to browse or drop handwritten answer sheet PDF'
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400">PDF documents up to 25MB supported</p>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Answer Sheet for Evaluation</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SECTION C: Special 6th Level Loksewa Spotlight Banner */}
        <section className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
            <Shield className="w-96 h-96 text-white" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
              <span>Special Focus Batch · अधिकृत छैटौं तह</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black leading-tight">
              Loksewa 6th Level Officer (अधिकृत छैटौं तह) Intensive Batch
            </h2>

            <p className="text-amber-50 text-xs sm:text-sm leading-relaxed">
              Serving provincial (प्रदेश लोक सेवा आयोग) and local government executive officer ranks across General Administration, Accounts & Audit, Revenue, and Education Officer. Rigorous preparation with daily model tests, analytical answer writing, and constitutional masterclasses.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/admission?course=loksewa-officer-level-6"
                className="px-6 py-3 rounded-xl font-bold text-slate-900 bg-white hover:bg-amber-100 shadow-md transition-all text-xs sm:text-sm flex items-center gap-2"
              >
                <span>Enroll in 6th Level Batch</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/courses/loksewa-officer-level-6"
                className="px-5 py-3 rounded-xl font-bold text-white bg-amber-900/40 hover:bg-amber-900/60 border border-white/20 transition-all text-xs sm:text-sm"
              >
                <span>View 6th Level Syllabus</span>
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION D: Why Prepare Loksewa with Shikshyalaya? */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-black text-[#12315A]">
              Why Prepare for Loksewa at Shikshyalaya Shaikshik Sanstha?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Experienced mentorship, structured examination drills, and authentic study resources
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#12315A]">Serving Officers & Top Rankers</h3>
              <p className="text-slate-600 leading-relaxed">
                Direct instruction from Joint Secretaries, Under Secretaries, Section Officers, and Loksewa exam merit rankers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#12315A]">Daily MCQ Drills & Weekly OMR Tests</h3>
              <p className="text-slate-600 leading-relaxed">
                Speed testing on Paper 1 (GK & IQ) every morning with instant negative marking calculations and merit ranking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#12315A]">Handwritten PDF Answer Evaluation</h3>
              <p className="text-slate-600 leading-relaxed">
                Submit handwritten subjective sheets (Papers 2 & 3) online; faculty return annotated feedback highlighting presentation strengths and mark gains.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
