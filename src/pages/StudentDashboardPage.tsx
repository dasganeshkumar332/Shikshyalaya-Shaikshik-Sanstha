import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Download,
  FileText,
  LogOut,
  Bell,
  CheckCircle2,
  User,
  Play,
  Award,
  FileCheck,
  ArrowRight,
  Search,
  X,
  Upload,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudyMaterial } from '../types';

type DashboardTab = 'resources' | 'mocktests' | 'notices';

export const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    logout,
    courses,
    studyMaterials,
    notices,
    studentGroups,
    mockTests,
    mockTestSubmissions,
    isStudentEnrolledInSubject,
  } = useApp();

  // Nothing auto-opened: let the student click what they want to see
  const [activeTab, setActiveTab] = useState<DashboardTab | null>(null);
  const [selectedResourceSubject, setSelectedResourceSubject] = useState<string | null>(null);
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('ALL');
  const [activeResourceModal, setActiveResourceModal] = useState<StudyMaterial | null>(null);

  const [selectedMockSubject, setSelectedMockSubject] = useState<string | null>(null);
  const [showEvaluatedResults, setShowEvaluatedResults] = useState(false);

  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);
  const [selectedNoticeCategory, setSelectedNoticeCategory] = useState<string>('ALL');

  if (!currentUser) {
    return (
      <div className="py-20 max-w-md mx-auto px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Authentication Required</h2>
        <p className="text-xs text-slate-500">Please sign in to access your student dashboard.</p>
        <Link
          to="/student/login"
          className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#12315A]"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (currentUser.role !== 'student') {
    return (
      <div className="py-20 max-w-md mx-auto px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Student Portal</h2>
        <p className="text-xs text-slate-500">
          You are currently signed in as {currentUser.role}.
        </p>
        <Link
          to={currentUser.role === 'admin' ? '/admin' : '/'}
          className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#12315A]"
        >
          {currentUser.role === 'admin' ? 'Go to Admin Dashboard' : 'Go to Home'}
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTabClick = (tab: DashboardTab) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
    setSelectedResourceSubject(null);
    setResourceSearch('');
    setResourceTypeFilter('ALL');
    setSelectedMockSubject(null);
    setShowEvaluatedResults(false);
    setExpandedNoticeId(null);
  };

  const enrolledCourses = useMemo(
    () => courses.filter((c) => currentUser.enrolledCourseSlugs?.includes(c.slug)),
    [courses, currentUser.enrolledCourseSlugs]
  );

  // Strictly enrolled study materials ONLY (course + specific subject check)
  const enrolledMaterials = useMemo(() => {
    return studyMaterials.filter(
      (m) => m.published && isStudentEnrolledInSubject(m.courseSlug, m.subject)
    );
  }, [studyMaterials, currentUser, isStudentEnrolledInSubject]);

  // Distinct enrolled subjects that actually have resources
  const resourceSubjectGroups = useMemo(() => {
    const map = new Map<string, { subject: string; semesterOrYear: string; count: number }>();
    enrolledMaterials.forEach((m) => {
      const existing = map.get(m.subject);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(m.subject, {
          subject: m.subject,
          semesterOrYear: m.semesterOrYear,
          count: 1,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.subject.localeCompare(b.subject));
  }, [enrolledMaterials]);

  const materialsForSelectedSubject = useMemo(() => {
    if (!selectedResourceSubject && !resourceSearch.trim()) return [];
    return enrolledMaterials.filter((m) => {
      if (selectedResourceSubject && m.subject !== selectedResourceSubject) {
        return false;
      }
      if (resourceTypeFilter !== 'ALL' && m.resourceType !== resourceTypeFilter) {
        return false;
      }
      if (resourceSearch.trim()) {
        const q = resourceSearch.trim().toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.resourceType.toLowerCase().includes(q) ||
          m.semesterOrYear.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [enrolledMaterials, selectedResourceSubject, resourceTypeFilter, resourceSearch]);

  const availableResourceTypes = useMemo(() => {
    const base = selectedResourceSubject
      ? enrolledMaterials.filter((m) => m.subject === selectedResourceSubject)
      : enrolledMaterials;
    return Array.from(new Set(base.map((m) => m.resourceType)));
  }, [enrolledMaterials, selectedResourceSubject]);

  // Strictly enrolled mock tests ONLY (course + specific subject check)
  const myMockTests = useMemo(() => {
    return (mockTests || []).filter(
      (t) => t.published && isStudentEnrolledInSubject(t.courseSlug, t.subject)
    );
  }, [mockTests, currentUser, isStudentEnrolledInSubject]);

  const mockTestSubjectGroups = useMemo(() => {
    const map = new Map<string, { subject: string; count: number }>();
    myMockTests.forEach((t) => {
      const existing = map.get(t.subject);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(t.subject, { subject: t.subject, count: 1 });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.subject.localeCompare(b.subject));
  }, [myMockTests]);

  const mockTestsForSelectedSubject = useMemo(() => {
    if (!selectedMockSubject) return [];
    return myMockTests.filter((t) => t.subject === selectedMockSubject);
  }, [myMockTests, selectedMockSubject]);

  // Private submissions & evaluated results strictly for this student and their enrolled subjects
  const mySubmissions = useMemo(() => {
    if (!mockTestSubmissions) return [];
    const roll = (currentUser.studentId || '').trim().toLowerCase();
    const phone = (currentUser.phone || '').replace(/[^0-9]/g, '');
    const email = (currentUser.email || '').trim().toLowerCase();
    const enrolledTestIds = new Set(myMockTests.map((t) => t.id));

    return mockTestSubmissions.filter((sub) => {
      const matchRoll = Boolean(roll) && sub.rollNumber?.toLowerCase() === roll;
      const matchId = sub.studentId === currentUser.id || (Boolean(roll) && sub.studentId?.toLowerCase() === roll);
      const matchPhone = phone.length >= 7 && sub.studentPhone?.replace(/[^0-9]/g, '') === phone;
      const matchEmail = Boolean(email) && sub.studentEmail?.toLowerCase() === email;
      if (!(matchRoll || matchId || matchPhone || matchEmail)) return false;

      if (enrolledTestIds.has(sub.testId || sub.mockTestId)) return true;
      if (sub.courseSlug && sub.subject) {
        return isStudentEnrolledInSubject(sub.courseSlug, sub.subject);
      }
      if (sub.courseSlug) {
        return currentUser.enrolledCourseSlugs?.includes(sub.courseSlug) ?? false;
      }
      return true;
    });
  }, [mockTestSubmissions, currentUser, myMockTests, isStudentEnrolledInSubject]);

  // Notices strictly relevant to the student's enrolled course(s) + general institutional notices
  const myNotices = useMemo(() => {
    const enrolledSlugs = currentUser.enrolledCourseSlugs || [];

    const cohortBroadcasts = (studentGroups || [])
      .filter((g) => enrolledSlugs.includes(g.courseSlug))
      .flatMap((g) =>
        (g.broadcasts || []).map((b) => ({
          id: `bc-${b.id}`,
          title: b.title,
          content: b.message,
          category: b.urgency || 'Batch Alert',
          date: b.sentAt,
          important: b.urgency === 'Urgent' || b.urgency === 'Urgent / Exam Alert' || b.urgency === 'Emergency Alert',
          sourceLabel: `${g.courseName} • ${b.sentBy}`,
          attachmentName: undefined as string | undefined,
        }))
      );

    const institutionalNotices = (notices || [])
      .filter((n) => n.published)
      .filter((n) => {
        if (!n.targetCourses || n.targetCourses.length === 0) return true;
        return n.targetCourses.some((slug) => enrolledSlugs.includes(slug));
      })
      .map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        category: n.category,
        date: n.publishDate,
        important: n.important,
        sourceLabel: 'Official Academic Notice',
        attachmentName: n.attachmentName,
      }));

    return [...cohortBroadcasts, ...institutionalNotices];
  }, [notices, studentGroups, currentUser.enrolledCourseSlugs]);

  const noticeCategories = useMemo(() => {
    return Array.from(new Set(myNotices.map((n) => n.category)));
  }, [myNotices]);

  const visibleNotices = useMemo(() => {
    if (selectedNoticeCategory === 'ALL') return myNotices;
    return myNotices.filter((n) => n.category === selectedNoticeCategory);
  }, [myNotices, selectedNoticeCategory]);

  const handleDownloadResource = (mat: StudyMaterial) => {
    if (mat.downloadUrl) {
      const a = document.createElement('a');
      a.href = mat.downloadUrl;
      a.download =
        mat.fileName ||
        mat.attachmentName ||
        `${mat.subject.replace(/\s+/g, '_')}_${mat.title.replace(/\s+/g, '_')}`;
      a.target = '_blank';
      a.rel = 'noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setActiveResourceModal(null);
      return;
    }

    const blob = new Blob(
      [
        `SHIKSHYALAYA SHAIKSHIK SANSTHA\nResource: ${mat.title}\nCourse: ${mat.courseName}\nSubject: ${mat.subject} (${mat.semesterOrYear})\nType: ${mat.resourceType}\nAuthorized Student: ${currentUser.name} (${currentUser.studentId})\n\n${mat.description || ''}\n`,
      ],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mat.subject.replace(/\s+/g, '_')}_${mat.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setActiveResourceModal(null);
  };

  return (
    <div className="py-8 sm:py-10 max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
      {/* Compact Student Header */}
      <div className="bg-gradient-to-r from-[#12315A] via-[#1a4176] to-[#12315A] text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-bold">{currentUser.name}</h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500 text-white">
                Enrolled Student
              </span>
            </div>
            <p className="text-xs text-blue-200">
              ID: <span className="font-mono text-white font-semibold">{currentUser.studentId || 'SSS-STU'}</span>
            </p>
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              {enrolledCourses.map((c) => (
                <span
                  key={c.slug}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-bold text-[11px]"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-800" />
                  <span>{c.title}</span>
                </span>
              ))}
              {currentUser.enrolledSubjects &&
                currentUser.enrolledSubjects.length > 0 &&
                currentUser.enrolledSubjects.map((subj) => (
                  <span
                    key={subj}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/15 text-amber-200 border border-white/20 font-semibold text-[11px]"
                  >
                    <BookOpen className="w-3 h-3 text-amber-300" />
                    <span>{subj}</span>
                  </span>
                ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-100 bg-white/10 hover:bg-white/20 transition-colors cursor-pointer self-start md:self-center"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* 3 Clickable Section Cards: Resources, Mock Tests, Notices */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => handleTabClick('resources')}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
            activeTab === 'resources'
              ? 'bg-[#12315A] text-white border-[#12315A] shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                activeTab === 'resources' ? 'bg-white/15 text-amber-400' : 'bg-blue-50 text-blue-700'
              }`}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Resources</p>
              <p className={`text-[11px] ${activeTab === 'resources' ? 'text-blue-200' : 'text-slate-500'}`}>
                Click to select subject
              </p>
            </div>
          </div>
          <ChevronRight
            className={`w-4 h-4 transition-transform ${
              activeTab === 'resources' ? 'rotate-90 text-amber-400' : 'text-slate-400'
            }`}
          />
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('mocktests')}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
            activeTab === 'mocktests'
              ? 'bg-[#12315A] text-white border-[#12315A] shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                activeTab === 'mocktests' ? 'bg-white/15 text-amber-400' : 'bg-amber-50 text-amber-600'
              }`}
            >
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Mock Tests</p>
              <p className={`text-[11px] ${activeTab === 'mocktests' ? 'text-blue-200' : 'text-slate-500'}`}>
                Click to choose exam
              </p>
            </div>
          </div>
          <ChevronRight
            className={`w-4 h-4 transition-transform ${
              activeTab === 'mocktests' ? 'rotate-90 text-amber-400' : 'text-slate-400'
            }`}
          />
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('notices')}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
            activeTab === 'notices'
              ? 'bg-[#12315A] text-white border-[#12315A] shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                activeTab === 'notices' ? 'bg-white/15 text-amber-400' : 'bg-blue-50 text-blue-700'
              }`}
            >
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Notices</p>
              <p className={`text-[11px] ${activeTab === 'notices' ? 'text-blue-200' : 'text-slate-500'}`}>
                Click to view alerts
              </p>
            </div>
          </div>
          <ChevronRight
            className={`w-4 h-4 transition-transform ${
              activeTab === 'notices' ? 'rotate-90 text-amber-400' : 'text-slate-400'
            }`}
          />
        </button>
      </div>

      {/* Prompt when student hasn't clicked anything yet */}
      {activeTab === null && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-2 shadow-xs">
          <p className="text-sm font-bold text-[#12315A]">Select a section above to continue</p>
          <p className="text-xs text-slate-500">
            Click Resources, Mock Tests, or Notices to open only what you want to view.
          </p>
        </div>
      )}

      {/* TAB 1: RESOURCES (Click subject first -> view only that subject's materials) */}
      {activeTab === 'resources' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#12315A] flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-700" />
                <span>Resources</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedResourceSubject
                  ? `Viewing resources for ${selectedResourceSubject}`
                  : 'Click a subject below to view its study resources.'}
              </p>
            </div>

            {selectedResourceSubject && (
              <button
                type="button"
                onClick={() => {
                  setSelectedResourceSubject(null);
                  setResourceTypeFilter('ALL');
                  setResourceSearch('');
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
              >
                &larr; All Enrolled Subjects
              </button>
            )}
          </div>

          {enrolledMaterials.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No resources available</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No study materials are available for your enrolled subject(s) yet.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={resourceSearch}
                    onChange={(e) => setResourceSearch(e.target.value)}
                    placeholder={
                      selectedResourceSubject
                        ? `Search within ${selectedResourceSubject}...`
                        : 'Search a specific resource by keyword...'
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
                {(selectedResourceSubject || resourceSearch.trim()) && availableResourceTypes.length > 1 && (
                  <select
                    value={resourceTypeFilter}
                    onChange={(e) => setResourceTypeFilter(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Resource Types</option>
                    {availableResourceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Step 1: Clickable Subject Selector (no unrequested list dumped) */}
              {!selectedResourceSubject && !resourceSearch.trim() && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {resourceSubjectGroups.map((grp) => (
                    <button
                      key={grp.subject}
                      type="button"
                      onClick={() => {
                        setSelectedResourceSubject(grp.subject);
                        setResourceTypeFilter('ALL');
                      }}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50/60 hover:border-blue-300 text-left transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                          {grp.semesterOrYear}
                        </span>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-[#12315A] truncate mt-0.5">
                          {grp.subject}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {grp.count} resource{grp.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2: Show resources ONLY for the clicked subject (or active search) */}
              {(selectedResourceSubject || resourceSearch.trim()) && (
                <div className="space-y-4">
                  {materialsForSelectedSubject.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                      No matching resources found for your selection.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {materialsForSelectedSubject.map((mat) => (
                        <div
                          key={mat.id}
                          className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                  mat.resourceType === 'Recorded Videos'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {mat.resourceType}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                {mat.semesterOrYear}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {mat.subject}
                              </span>
                            </div>
                            <h3 className="font-bold text-sm text-slate-900">{mat.title}</h3>
                            {mat.description && (
                              <p className="text-slate-500 text-xs line-clamp-2">{mat.description}</p>
                            )}
                            <p className="text-[11px] text-slate-400">
                              {mat.courseName} • {mat.fileSize} • {mat.uploadDate}
                            </p>
                          </div>

                          <button
                            onClick={() => setActiveResourceModal(mat)}
                            className="px-4 py-2 rounded-xl font-bold text-white bg-[#12315A] hover:bg-blue-900 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            {mat.resourceType === 'Recorded Videos' ? (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current text-rose-400" />
                                <span>Watch</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5 text-amber-400" />
                                <span>Download</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 2: MOCK TESTS (Click subject or Results first -> view only that subject's mock tests) */}
      {activeTab === 'mocktests' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#12315A] flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-700" />
                <span>Mock Tests</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedMockSubject
                  ? `Showing mock tests for ${selectedMockSubject}`
                  : showEvaluatedResults
                  ? 'Viewing your submitted answer sheets & results'
                  : 'Click a subject below to view its mock tests.'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {(selectedMockSubject || showEvaluatedResults) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMockSubject(null);
                    setShowEvaluatedResults(false);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  &larr; Back
                </button>
              )}
              {mySubmissions.length > 0 && !showEvaluatedResults && (
                <button
                  type="button"
                  onClick={() => {
                    setShowEvaluatedResults(true);
                    setSelectedMockSubject(null);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>My Results ({mySubmissions.length})</span>
                </button>
              )}
              <Link
                to="/mock-tests"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#12315A] hover:bg-blue-900 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Open Mock Test Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {!selectedMockSubject && !showEvaluatedResults && (
            myMockTests.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <Award className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No mock tests available</p>
                <p className="text-xs text-slate-500">
                  No mock examinations are currently published for your enrolled subject(s).
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {mockTestSubjectGroups.map((grp) => (
                  <button
                    key={grp.subject}
                    type="button"
                    onClick={() => setSelectedMockSubject(grp.subject)}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50/60 hover:border-blue-300 text-left transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-[#12315A] truncate">
                        {grp.subject}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {grp.count} mock test{grp.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0" />
                  </button>
                ))}
              </div>
            )
          )}

          {selectedMockSubject && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockTestsForSelectedSubject.map((test) => (
                <div
                  key={test.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-blue-300 transition-colors flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          test.courseType === 'Old Course'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {test.courseType}
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{test.durationMinutes} mins</span>
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{test.title}</h3>
                    <p className="text-xs text-slate-600">
                      Subject: <strong>{test.subject}</strong>
                      {test.semesterOrYear ? ` • ${test.semesterOrYear}` : ''}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Full Marks: {test.fullMarks} • Pass Marks: {test.passMarks}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link
                      to={`/mock-tests?course=${encodeURIComponent(test.courseSlug)}&subject=${encodeURIComponent(test.subject)}`}
                      className="flex-1 text-center px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#12315A] hover:bg-blue-900 transition-colors"
                    >
                      Start Timed Exam &rarr;
                    </Link>
                    <Link
                      to={`/upload-answer-sheet?course=${encodeURIComponent(test.courseSlug)}&year=${encodeURIComponent(test.semesterOrYear || '')}&subject=${encodeURIComponent(test.subject)}&testId=${encodeURIComponent(test.id)}`}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 transition-colors flex items-center justify-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload PDF</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showEvaluatedResults && mySubmissions.length > 0 && (
            <div className="space-y-4">
              {mySubmissions.map((sub) => {
                const testMeta = mockTests.find((t) => t.id === (sub.testId || sub.mockTestId));
                const fullMarks = testMeta?.fullMarks || 100;
                const passMarks = testMeta?.passMarks || 40;
                const isPassed = sub.marksObtained !== undefined ? sub.marksObtained >= passMarks : false;
                const displayTitle = sub.testTitle || sub.mockTestTitle || testMeta?.title || 'Mock Examination';
                const displaySubject = sub.subject || testMeta?.subject || 'Enrolled Subject';

                return (
                  <div key={sub.id} className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                        </span>
                        <h4 className="text-sm font-bold text-[#12315A]">{displayTitle}</h4>
                        <p className="text-xs text-slate-600">
                          Subject: <strong>{displaySubject}</strong> • Roll: <span className="font-mono">{sub.rollNumber}</span>
                        </p>
                      </div>

                      <div>
                        {sub.evaluationStatus === 'Evaluated' ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded ${
                                isPassed
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {isPassed ? 'PASSED' : 'NEEDS REVISION'}
                            </span>
                            <div className="bg-slate-900 text-amber-400 font-extrabold text-sm px-3 py-1 rounded-xl">
                              {sub.marksObtained} / {fullMarks}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900">
                            {sub.evaluationStatus === 'Under Review' ? 'Under Review' : 'Awaiting Examiner'}
                          </span>
                        )}
                      </div>
                    </div>

                    {sub.evaluationStatus === 'Evaluated' && sub.feedbackRemarks && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-slate-800 space-y-1">
                        <p className="font-bold text-amber-950">
                          Examiner Remarks {sub.evaluatedBy ? `(${sub.evaluatedBy})` : ''}:
                        </p>
                        <p className="whitespace-pre-line leading-relaxed">{sub.feedbackRemarks}</p>
                      </div>
                    )}

                    {(sub.evaluatedPaperUrl || sub.answerFileUrl) && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {sub.evaluatedPaperUrl && (
                          <a
                            href={sub.evaluatedPaperUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 flex items-center gap-1"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Checked Paper PDF</span>
                          </a>
                        )}
                        {sub.answerFileUrl && (
                          <a
                            href={sub.answerFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>My Answer Sheet</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: NOTICES (Click a headline to expand only what you want to read) */}
      {activeTab === 'notices' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#12315A] flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-700" />
                <span>Notices</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any notice to read its full details.
              </p>
            </div>

            {noticeCategories.length > 1 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedNoticeCategory('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    selectedNoticeCategory === 'ALL'
                      ? 'bg-[#12315A] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
                {noticeCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedNoticeCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      selectedNoticeCategory === cat
                        ? 'bg-[#12315A] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {visibleNotices.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <Bell className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No notices available</p>
              <p className="text-xs text-slate-500">
                There are no active notices for your selection right now.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {visibleNotices.map((n) => {
                const isOpen = expandedNoticeId === n.id;
                return (
                  <div
                    key={n.id}
                    className={`rounded-2xl border transition-all text-xs ${
                      n.important
                        ? 'bg-amber-50/60 border-amber-300'
                        : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedNoticeId(isOpen ? null : n.id)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              n.important ? 'bg-amber-400 text-slate-950' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {n.category}
                          </span>
                          <span className="text-[11px] text-slate-500">{n.date}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                          isOpen ? 'rotate-90 text-blue-700' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-200/70 space-y-2">
                        <p className="text-[11px] font-medium text-slate-500">{n.sourceLabel}</p>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{n.content}</p>
                        {n.attachmentName && (
                          <p className="text-[11px] font-semibold text-blue-800">
                            Attachment: {n.attachmentName}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Resource Access / Download Modal */}
      {activeResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-5 relative">
            <button
              onClick={() => setActiveResourceModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Enrolled Subject Verified
                </span>
                <h3 className="text-base font-bold text-[#12315A] mt-0.5">
                  {activeResourceModal.resourceType === 'Recorded Videos' ? 'Lecture Resource Ready' : 'Study Resource Ready'}
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <p className="font-bold text-slate-900 text-sm">{activeResourceModal.title}</p>
              <p className="text-slate-600">
                <strong>Course:</strong> {activeResourceModal.courseName}
              </p>
              <p className="text-slate-600">
                <strong>Subject:</strong> {activeResourceModal.subject} ({activeResourceModal.semesterOrYear})
              </p>
              <p className="text-slate-600">
                <strong>Type:</strong> {activeResourceModal.resourceType} • {activeResourceModal.fileSize}
              </p>
              {activeResourceModal.description && (
                <p className="text-slate-500 pt-1">{activeResourceModal.description}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDownloadResource(activeResourceModal)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-[#12315A] hover:bg-blue-900 transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>
                  {activeResourceModal.resourceType === 'Recorded Videos' && activeResourceModal.downloadUrl
                    ? 'Open Video Resource'
                    : 'Download Resource'}
                </span>
              </button>
              <button
                onClick={() => setActiveResourceModal(null)}
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
