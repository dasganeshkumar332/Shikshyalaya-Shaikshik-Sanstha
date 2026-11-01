import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Bell,
  FileText,
  Settings,
  Download,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Filter,
  Eye,
  RotateCcw,
  MessageSquare,
  Lock,
  LogOut,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
  Receipt,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Copy,
  FileCheck,
  QrCode,
  Phone,
  Send,
  UserPlus,
  Share2,
  Radio,
  CheckSquare,
  MessageCircle,
  Clock,
  Award,
  HelpCircle,
  Database,
  RefreshCw,
  Cloud,
  Server,
  Globe,
  Upload,
  Image as ImageIcon,
  Camera,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SQL_SCHEMA,
} from '../lib/supabase';
import {
  InquiryStatus,
  Course,
  Teacher,
  Notice,
  StudyMaterial,
  StudentGroup,
  StudentGroupMember,
  CourseType,
  MockTest,
  MockTestSubmission,
  MockTestRegistration,
  MockExamShiftConfig,
} from '../types';

export const AdminDashboardPage: React.FC = () => {
  const {
    currentUser,
    loginAsAdmin,
    logout,
    settings,
    updateSettings,
    resetSettings,
    courses,
    addCourse,
    updateCourse,
    togglePublishCourse,
    deleteCourse,
    teachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    notices,
    addNotice,
    updateNotice,
    deleteNotice,
    studyMaterials,
    addStudyMaterial,
    updateStudyMaterial,
    deleteStudyMaterial,
    inquiries,
    updateInquiryStatus,
    verifyAndEnrollApplicant,
    addInquiryNote,
    deleteInquiry,
    deleteMultipleInquiries,
    clearAllInquiries,
    exportInquiriesCSV,
    contactMessages,
    studentGroups,
    addStudentGroup,
    updateStudentGroup,
    deleteStudentGroup,
    addMemberToGroup,
    bulkAddMembersToGroup,
    importVerifiedInquiriesToGroup,
    removeMemberFromGroup,
    sendGroupBroadcast,
    deleteGroupBroadcast,
    mockTests,
    addMockTest,
    updateMockTest,
    deleteMockTest,
    togglePublishMockTest,
    mockTestSubmissions,
    gradeMockTestSubmission,
    uploadMockTestResult,
    mockTestRegistrations,
    updateMockTestRegistrationStatus,
    deleteMockTestRegistration,
    refreshMockRegistrations,
    supabaseStatus,
    checkSupabaseStatus,
    syncAllToSupabase,
  } = useApp();

  // Admin authentication state
  const [adminPass, setAdminPass] = useState('');
  const [authError, setAuthError] = useState('');
  const [isRefreshingRegistrations, setIsRefreshingRegistrations] = useState(false);

  // Active dashboard tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'inquiries' | 'registered-students' | 'courses' | 'groups' | 'mock-tests' | 'teachers' | 'notices' | 'materials' | 'settings' | 'database'
  >('overview');

  // Supabase management states
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [supabaseSyncMessage, setSupabaseSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedSqlSchema, setCopiedSqlSchema] = useState(false);
  const [copiedSupabaseKey, setCopiedSupabaseKey] = useState(false);
  const [copiedNetlifySnippet, setCopiedNetlifySnippet] = useState(false);
  const [supabaseTestFeedback, setSupabaseTestFeedback] = useState<string | null>(null);

  // Inquiries filter state
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>('ALL');
  const [selectedInquiryDetail, setSelectedInquiryDetail] = useState<any | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [inquiryToastMessage, setInquiryToastMessage] = useState<string | null>(null);
  const [selectedInquiryIds, setSelectedInquiryIds] = useState<string[]>([]);

  // Payment proof verification states
  const [selectedProofModalUrl, setSelectedProofModalUrl] = useState<string | null>(null);
  const [assignedStudentIdInput, setAssignedStudentIdInput] = useState('');
  const [verificationSuccessToast, setVerificationSuccessToast] = useState<string | null>(null);
  const [copiedWelcomeMessage, setCopiedWelcomeMessage] = useState(false);

  // Student Groups states
  const [groupSearch, setGroupSearch] = useState('');
  const [groupTypeFilter, setGroupTypeFilter] = useState<'ALL' | 'New Course' | 'Old Course'>('ALL');
  const [editingGroup, setEditingGroup] = useState<StudentGroup | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedGroupForBroadcast, setSelectedGroupForBroadcast] = useState<StudentGroup | null>(null);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<StudentGroup | null>(null);
  const [groupToastMessage, setGroupToastMessage] = useState<string | null>(null);

  // Course modal state
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  // Teacher modal state
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  // Notice modal state
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  // Material modal state
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

  // Mock Test & Timed Exam states
  const [editingMockTest, setEditingMockTest] = useState<MockTest | null>(null);
  const [isMockTestModalOpen, setIsMockTestModalOpen] = useState(false);
  const [selectedTestForSubmissions, setSelectedTestForSubmissions] = useState<MockTest | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<MockTestSubmission | null>(null);
  const [isDirectResultModalOpen, setIsDirectResultModalOpen] = useState(false);
  const [mockTestCourseFilter, setMockTestCourseFilter] = useState('ALL');
  const [mockTestYearFilter, setMockTestYearFilter] = useState('ALL');
  const [mockTestSubjectFilter, setMockTestSubjectFilter] = useState('ALL');
  const [mockTestTypeFilter, setMockTestTypeFilter] = useState<'ALL' | 'New Course' | 'Old Course'>('ALL');
  const [mockTestEvaluationStatusFilter, setMockTestEvaluationStatusFilter] = useState<'ALL' | 'Submitted' | 'Evaluated'>('ALL');
  const [mockTestSubView, setMockTestSubView] = useState<'tests' | 'answer-sheets' | 'registrations' | 'shifts'>('tests');
  const [mockTestSearch, setMockTestSearch] = useState('');

  // Registered students search & filter state
  const [regStudentSearch, setRegStudentSearch] = useState('');
  const [regStudentCourseFilter, setRegStudentCourseFilter] = useState('ALL');
  const [regStudentStatusFilter, setRegStudentStatusFilter] = useState('ALL');
  const [regStudentShiftFilter, setRegStudentShiftFilter] = useState('ALL');
  const [regStudentToast, setRegStudentToast] = useState<string | null>(null);

  // Mock Exam Shift Management state (Admin fixes time and shifts)
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<MockExamShiftConfig | null>(null);
  const [shiftNameInput, setShiftNameInput] = useState('');
  const [shiftTimeSlotInput, setShiftTimeSlotInput] = useState('');
  const [shiftReportingTimeInput, setShiftReportingTimeInput] = useState('');
  const [shiftDaysInput, setShiftDaysInput] = useState('Sunday – Friday');
  const [shiftModeInput, setShiftModeInput] = useState('Online & Campus Exam Hall');
  const [shiftIsActiveInput, setShiftIsActiveInput] = useState(true);
  const [shiftNotesInput, setShiftNotesInput] = useState('');
  const [shiftToast, setShiftToast] = useState<string | null>(null);

  const handleOpenAddShift = () => {
    setEditingShift(null);
    setShiftNameInput('');
    setShiftTimeSlotInput('06:30 AM – 09:30 AM');
    setShiftReportingTimeInput('06:15 AM (15 mins prior)');
    setShiftDaysInput('Sunday – Friday');
    setShiftModeInput('Online & Campus Exam Hall');
    setShiftIsActiveInput(true);
    setShiftNotesInput('');
    setIsShiftModalOpen(true);
  };

  const handleOpenEditShift = (shift: MockExamShiftConfig) => {
    setEditingShift(shift);
    setShiftNameInput(shift.shiftName);
    setShiftTimeSlotInput(shift.timeSlot);
    setShiftReportingTimeInput(shift.reportingTime || '');
    setShiftDaysInput(shift.days || 'Sunday – Friday');
    setShiftModeInput(shift.mode || 'Online & Campus Exam Hall');
    setShiftIsActiveInput(shift.isActive);
    setShiftNotesInput(shift.notes || '');
    setIsShiftModalOpen(true);
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftNameInput.trim() || !shiftTimeSlotInput.trim()) {
      alert('Please provide shift name and time slot.');
      return;
    }
    const currentShifts = settings.mockExamShifts || [];
    let updated: MockExamShiftConfig[];
    if (editingShift) {
      updated = currentShifts.map((s) =>
        s.id === editingShift.id
          ? {
              ...s,
              shiftName: shiftNameInput.trim(),
              timeSlot: shiftTimeSlotInput.trim(),
              reportingTime: shiftReportingTimeInput.trim() || undefined,
              days: shiftDaysInput.trim() || undefined,
              mode: shiftModeInput.trim() || undefined,
              isActive: shiftIsActiveInput,
              notes: shiftNotesInput.trim() || undefined,
            }
          : s
      );
    } else {
      const newShift: MockExamShiftConfig = {
        id: `shift-${Date.now()}`,
        shiftName: shiftNameInput.trim(),
        timeSlot: shiftTimeSlotInput.trim(),
        reportingTime: shiftReportingTimeInput.trim() || undefined,
        days: shiftDaysInput.trim() || undefined,
        mode: shiftModeInput.trim() || undefined,
        isActive: shiftIsActiveInput,
        notes: shiftNotesInput.trim() || undefined,
      };
      updated = [...currentShifts, newShift];
    }
    updateSettings({ mockExamShifts: updated });
    setIsShiftModalOpen(false);
    setShiftToast(`Exam shift "${shiftNameInput}" successfully saved!`);
    setTimeout(() => setShiftToast(null), 3500);
  };

  const handleDeleteShift = (shiftId: string, shiftName: string) => {
    if (confirm(`Delete exam shift "${shiftName}"?`)) {
      const currentShifts = settings.mockExamShifts || [];
      const updated = currentShifts.filter((s) => s.id !== shiftId);
      updateSettings({ mockExamShifts: updated });
      setShiftToast(`Shift "${shiftName}" deleted.`);
      setTimeout(() => setShiftToast(null), 3000);
    }
  };

  const handleToggleShiftStatus = (shiftId: string) => {
    const currentShifts = settings.mockExamShifts || [];
    const updated = currentShifts.map((s) => (s.id === shiftId ? { ...s, isActive: !s.isActive } : s));
    updateSettings({ mockExamShifts: updated });
  };

  // Filtered registrations for Registered Students tab
  const filteredRegistrations = useMemo(() => {
    return mockTestRegistrations.filter((reg) => {
      if (regStudentCourseFilter !== 'ALL' && reg.courseSlug !== regStudentCourseFilter) {
        return false;
      }
      if (regStudentStatusFilter !== 'ALL' && reg.status !== regStudentStatusFilter) {
        return false;
      }
      if (regStudentShiftFilter !== 'ALL' && reg.shift !== regStudentShiftFilter) {
        return false;
      }
      if (regStudentSearch.trim()) {
        const q = regStudentSearch.toLowerCase();
        const matchesName = reg.fullName.toLowerCase().includes(q);
        const matchesRef = reg.referenceNumber.toLowerCase().includes(q);
        const matchesPhone = reg.phone.includes(q);
        const matchesEmail = reg.email.toLowerCase().includes(q);
        const matchesRoll = reg.studentRollNo?.toLowerCase().includes(q) || false;
        const matchesSubject = reg.enrolledSubjects?.some((s) => s.toLowerCase().includes(q)) || false;
        const matchesCourse = reg.courseName.toLowerCase().includes(q);
        return matchesName || matchesRef || matchesPhone || matchesEmail || matchesRoll || matchesSubject || matchesCourse;
      }
      return true;
    });
  }, [mockTestRegistrations, regStudentSearch, regStudentCourseFilter, regStudentStatusFilter, regStudentShiftFilter]);

  // Derived available Years / Semesters for admin filtering
  const adminMockTestYears = useMemo(() => {
    if (mockTestCourseFilter !== 'ALL') {
      const course = courses.find((c) => c.slug === mockTestCourseFilter);
      const termsFromCourse = (course?.subjectsOffered || [])
        .map((s) => s.semesterOrYear)
        .filter(Boolean) as string[];
      const termsFromTests = mockTests
        .filter((t) => t.courseSlug === mockTestCourseFilter)
        .map((t) => t.semesterOrYear)
        .filter(Boolean) as string[];
      return Array.from(new Set([...termsFromCourse, ...termsFromTests])).sort();
    }
    const set = new Set<string>();
    courses.forEach((c) => {
      c.subjectsOffered?.forEach((s) => {
        if (s.semesterOrYear) set.add(s.semesterOrYear);
      });
    });
    mockTests.forEach((t) => {
      if (t.semesterOrYear) set.add(t.semesterOrYear);
    });
    return Array.from(set).filter(Boolean).sort();
  }, [courses, mockTests, mockTestCourseFilter]);

  // Derived subjects for admin mock test & submission filtering (refined by course and year)
  const adminMockTestSubjects = useMemo(() => {
    if (mockTestCourseFilter !== 'ALL') {
      const course = courses.find((c) => c.slug === mockTestCourseFilter);
      let courseSubs = course?.subjectsOffered || [];
      if (mockTestYearFilter !== 'ALL') {
        courseSubs = courseSubs.filter((s) => s.semesterOrYear === mockTestYearFilter);
      }
      const subsFromCourse = courseSubs.map((s) => s.name);
      let tests = mockTests.filter((t) => t.courseSlug === mockTestCourseFilter);
      if (mockTestYearFilter !== 'ALL') {
        tests = tests.filter((t) => t.semesterOrYear === mockTestYearFilter);
      }
      const subsFromTests = tests.map((t) => t.subject);
      const subsFromSubmissions = mockTestSubmissions
        .filter((s) => s.courseSlug === mockTestCourseFilter)
        .map((s) => s.subject || '')
        .filter(Boolean);
      return Array.from(new Set([...subsFromCourse, ...subsFromTests, ...subsFromSubmissions])).filter(Boolean).sort();
    }
    const set = new Set<string>();
    courses.forEach((c) => {
      c.subjectsOffered?.forEach((s) => {
        if (mockTestYearFilter === 'ALL' || s.semesterOrYear === mockTestYearFilter) {
          set.add(s.name);
        }
      });
    });
    mockTests.forEach((t) => {
      if (t.subject && (mockTestYearFilter === 'ALL' || t.semesterOrYear === mockTestYearFilter)) {
        set.add(t.subject);
      }
    });
    mockTestSubmissions.forEach((s) => {
      if (s.subject) set.add(s.subject);
    });
    return Array.from(set).filter(Boolean).sort();
  }, [courses, mockTests, mockTestSubmissions, mockTestCourseFilter, mockTestYearFilter]);

  // Keep admin year and subject filter in sync with course filter
  useEffect(() => {
    if (mockTestYearFilter !== 'ALL' && adminMockTestYears.length > 0 && !adminMockTestYears.includes(mockTestYearFilter)) {
      setMockTestYearFilter('ALL');
    }
  }, [mockTestCourseFilter, adminMockTestYears, mockTestYearFilter]);

  useEffect(() => {
    if (mockTestSubjectFilter !== 'ALL' && adminMockTestSubjects.length > 0 && !adminMockTestSubjects.includes(mockTestSubjectFilter)) {
      setMockTestSubjectFilter('ALL');
    }
  }, [mockTestCourseFilter, mockTestYearFilter, adminMockTestSubjects, mockTestSubjectFilter]);

  // Settings form local state
  const [tempSettings, setTempSettings] = useState(settings);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Admin login handling
  if (!currentUser || currentUser.role !== 'admin') {
    const handleAdminLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError('');
      const ok = loginAsAdmin(adminPass);
      if (!ok) {
        setAuthError('Incorrect administrator access code.');
      }
    };

    return (
      <div className="py-20 px-4 sm:px-6">
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
          <div className="bg-[#12315A] text-white p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-md">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">Administrator Portal</h2>
            <p className="text-xs text-blue-200">
              SHIKSHYALAYA SHAIKSHIK SANSTHA Central Administration
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="p-8 space-y-5 text-xs sm:text-sm">
            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {authError}
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Enter Administrator Passcode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Enter passcode (or leave blank for dev access)"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white bg-[#12315A] hover:bg-blue-900 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Unlock Admin Dashboard</span>
            </button>

            <p className="text-[11px] text-slate-400 text-center">
              Secured administrative dashboard. Changes update live database instantly.
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Live Statistics calculation
  const stats = {
    publishedCourses: courses.filter((c) => c.published).length,
    totalTeachers: teachers.filter((t) => t.published).length,
    newInquiries: inquiries.filter((i) => i.status === 'New').length,
    pendingPayments: inquiries.filter((i) => i.hasPaymentProof && !i.paymentVerified).length,
    verifiedStudents: inquiries.filter((i) => i.status === 'Verified & Enrolled').length,
    pendingFollowups: inquiries.filter((i) => i.status === 'Follow-up Required').length,
    publishedNotices: notices.filter((n) => n.published).length,
    studyMaterials: studyMaterials.filter((m) => m.published).length,
    totalMessages: contactMessages.length,
  };

  // Filtered inquiries
  const filteredInquiries = inquiries
    .filter((inq) => {
      if (inquiryStatusFilter === 'ALL') return true;
      if (inquiryStatusFilter === 'Needs Verification') return inq.hasPaymentProof && !inq.paymentVerified;
      if (inquiryStatusFilter === 'Verified & Enrolled') return inq.status === 'Verified & Enrolled';
      return inq.status === inquiryStatusFilter;
    })
    .filter((inq) => {
      if (!inquirySearch.trim()) return true;
      const q = inquirySearch.toLowerCase();
      return (
        inq.fullName.toLowerCase().includes(q) ||
        inq.referenceNumber.toLowerCase().includes(q) ||
        inq.phone.includes(q) ||
        inq.courseName.toLowerCase().includes(q) ||
        (inq.transactionReference && inq.transactionReference.toLowerCase().includes(q)) ||
        (inq.assignedStudentId && inq.assignedStudentId.toLowerCase().includes(q))
      );
    });

  const handleOpenInquiryDetail = (inq: any) => {
    setSelectedInquiryDetail(inq);
    const courseCode = inq.courseSlug.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'SCH';
    const suggestedId =
      inq.assignedStudentId ||
      `SSS-STU-${courseCode}-${inq.referenceNumber ? inq.referenceNumber.slice(-4) : Math.floor(1000 + Math.random() * 9000)}`;
    setAssignedStudentIdInput(suggestedId);
    setVerificationSuccessToast(null);
    setCopiedWelcomeMessage(false);
  };

  // Handle Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(tempSettings);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Admin Top Header Bar */}
      <div className="bg-[#12315A] text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">Admin Management Control Center</h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                Live Admin Mode
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Institute: <strong>{settings.instituteName}</strong> ({settings.instituteDevanagariName})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportInquiriesCSV()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'inquiries', label: `Inquiries (${stats.newInquiries} New)`, icon: GraduationCap },
          { id: 'registered-students', label: `Registered Students (${mockTestRegistrations.length})`, icon: UserCheck },
          { id: 'courses', label: `Courses (${courses.length})`, icon: BookOpen },
          { id: 'groups', label: `Student Groups (${studentGroups.length})`, icon: MessageSquare },
          { id: 'mock-tests', label: `Mock Tests & Exams (${mockTests.length})`, icon: Clock },
          { id: 'teachers', label: `Teachers (${teachers.length})`, icon: Users },
          { id: 'notices', label: `Notices (${notices.length})`, icon: Bell },
          { id: 'materials', label: `Study Materials (${studyMaterials.length})`, icon: FileText },
          { id: 'settings', label: 'Website Settings', icon: Settings },
          { id: 'database', label: 'Supabase Database', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#12315A] text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & LIVE STATISTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Live Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Courses</span>
              <p className="text-xl font-black text-[#12315A]">{stats.publishedCourses}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Active</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Faculty</span>
              <p className="text-xl font-black text-[#12315A]">{stats.totalTeachers}</p>
              <span className="text-[10px] text-blue-600 font-semibold">Teachers</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-amber-300 bg-amber-50/30 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Inquiries</span>
              <p className="text-xl font-black text-amber-600">{stats.newInquiries}</p>
              <span className="text-[10px] text-amber-700 font-bold">New Leads</span>
            </div>

            <div
              onClick={() => setActiveTab('registered-students')}
              className="bg-white p-3.5 rounded-2xl border-2 border-blue-600 shadow-sm space-y-1 cursor-pointer hover:bg-blue-50/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">Mock Students</span>
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <p className="text-xl font-black text-blue-700">{mockTestRegistrations.length}</p>
              <span className="text-[10px] text-blue-800 font-bold underline">Registered List &rarr;</span>
            </div>

            <div
              onClick={() => {
                setInquiryStatusFilter('Needs Verification');
                setActiveTab('inquiries');
              }}
              className="bg-white p-3.5 rounded-2xl border-2 border-amber-500 shadow-sm space-y-1 cursor-pointer hover:bg-amber-50/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Payment Proofs</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              </div>
              <p className="text-xl font-black text-amber-700">{stats.pendingPayments}</p>
              <span className="text-[10px] text-amber-800 font-bold underline">Review & Verify &rarr;</span>
            </div>

            <div
              onClick={() => {
                setInquiryStatusFilter('Verified & Enrolled');
                setActiveTab('inquiries');
              }}
              className="bg-white p-3.5 rounded-2xl border-2 border-emerald-500 shadow-sm space-y-1 cursor-pointer hover:bg-emerald-50/50 transition-colors"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">Enrolled</span>
              <p className="text-xl font-black text-emerald-700">{stats.verifiedStudents}</p>
              <span className="text-[10px] text-emerald-700 font-bold">Verified & Active</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Follow-ups</span>
              <p className="text-xl font-black text-indigo-600">{stats.pendingFollowups}</p>
              <span className="text-[10px] text-indigo-600 font-semibold">Scheduled</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notices</span>
              <p className="text-xl font-black text-[#12315A]">{stats.publishedNotices}</p>
              <span className="text-[10px] text-slate-500 font-semibold">Published</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resources</span>
              <p className="text-xl font-black text-[#12315A]">{stats.studyMaterials}</p>
              <span className="text-[10px] text-purple-600 font-semibold">Notes & Sets</span>
            </div>
          </div>

          {/* Quick Action Cards & Recent Inquiries Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Recent Inquiries Quick Table */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#12315A]">Recent Admission Inquiries & Enrolled Students</h3>
                  <p className="text-xs text-slate-400">Student applications and payment receipts submitted online</p>
                </div>
                <button
                  onClick={() => setActiveTab('inquiries')}
                  className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold">
                      <th className="py-2.5 px-3">Ref ID</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Course</th>
                      <th className="py-2.5 px-3">Payment Proof</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inquiries.slice(0, 6).map((inq) => (
                      <tr key={inq.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{inq.referenceNumber}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{inq.fullName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{inq.courseName}</td>
                        <td className="py-2.5 px-3">
                          {inq.hasPaymentProof ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Receipt className="w-3 h-3 text-amber-600" />
                              <span>{inq.paymentMethod || 'Slip'}</span>
                              {inq.paymentAmount && <span>(Rs.{inq.paymentAmount})</span>}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">No Slip</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inq.status === 'Verified & Enrolled'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inq.status === 'New'
                                ? 'bg-amber-100 text-amber-800'
                                : inq.status === 'Admission Confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {inq.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                handleOpenInquiryDetail(inq);
                                setActiveTab('inquiries');
                              }}
                              className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold cursor-pointer"
                            >
                              {inq.hasPaymentProof && !inq.paymentVerified ? 'Verify Proof' : 'View'}
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (
                                  confirm(
                                    `Are you sure you want to permanently delete inquiry ${inq.referenceNumber} for ${inq.fullName}?`
                                  )
                                ) {
                                  await deleteInquiry(inq.id);
                                  setInquiryToastMessage(
                                    `Inquiry ${inq.referenceNumber} (${inq.fullName}) deleted successfully.`
                                  );
                                  setTimeout(() => setInquiryToastMessage(null), 3500);
                                }
                              }}
                              className="px-2 py-1 rounded text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title={`Delete ${inq.referenceNumber}`}
                            >
                              <Trash2 className="w-3 h-3 text-rose-600" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Admin Management Shortcuts */}
            <div className="lg:col-span-4 bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-[#12315A]">Administrative Controls</h3>
              <p className="text-slate-500">Fast access to manage content without editing source code.</p>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setEditingNotice(null);
                    setIsNoticeModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-left font-bold text-slate-800 hover:border-blue-500 flex items-center justify-between"
                >
                  <span>Publish New Notice</span>
                  <Plus className="w-4 h-4 text-blue-700" />
                </button>
                <button
                  onClick={() => {
                    setEditingMaterial(null);
                    setIsMaterialModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-left font-bold text-slate-800 hover:border-blue-500 flex items-center justify-between"
                >
                  <span>Upload Study Material</span>
                  <Plus className="w-4 h-4 text-blue-700" />
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-left font-bold text-slate-800 hover:border-blue-500 flex items-center justify-between"
                >
                  <span>Update Contact & Branding</span>
                  <Settings className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500">
                <strong>System Notice:</strong> Data changes are persisted in real time into local database storage and synced across the application.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADMISSION INQUIRIES MANAGEMENT */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quick-Switcher between Regular Course Admissions and Mock Exam Registered Students */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-col sm:flex-row items-center gap-2 border border-slate-200 shadow-2xs">
            <button
              type="button"
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#12315A] text-white shadow-xs flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Admission Applications & Inquiries ({inquiries.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('registered-students')}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 hover:text-blue-900 border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-blue-700" />
              <span>Mock Exam Registered Students ({mockTestRegistrations.length}) &rarr;</span>
            </button>
          </div>

          {/* Inquiries Header & Batch Actions */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#12315A]">
                    Admission Inquiries & Student Applications
                  </h3>
                  <p className="text-xs text-slate-500">
                    Total Inquiries: <strong>{inquiries.length}</strong> • Pending Payment Verifications: <strong>{stats.pendingPayments}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Delete Sample / Demo Data Button */}
              {(() => {
                const demoList = inquiries.filter(
                  (i) =>
                    i.id === 'inq-1' ||
                    i.id === 'inq-2' ||
                    i.id === 'inq-3' ||
                    i.id === 'inq-4' ||
                    i.id === 'inq-5' ||
                    i.referenceNumber.startsWith('SSS-ADM-2026-100')
                );
                if (demoList.length === 0) return null;
                return (
                  <button
                    type="button"
                    onClick={async () => {
                      if (
                        confirm(
                          `Delete all ${demoList.length} sample admission records (Aayush, Pooja, Bibek, Sunil, Prashant)?\n\nThis will permanently remove them from both local storage and your Supabase database.`
                        )
                      ) {
                        const ids = demoList.map((d) => d.id);
                        await deleteMultipleInquiries(ids);
                        setInquiryToastMessage(
                          `Successfully deleted ${ids.length} sample inquiry record(s) from database!`
                        );
                        setTimeout(() => setInquiryToastMessage(null), 3500);
                      }
                    }}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Remove sample student inquiry records"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Delete Sample Data ({demoList.length})</span>
                  </button>
                );
              })()}

              {/* Clear All Inquiries Button */}
              {inquiries.length > 0 && (
                <button
                  type="button"
                  onClick={async () => {
                    if (
                      confirm(
                        `Are you sure you want to permanently delete ALL ${inquiries.length} inquiries?\n\nThis cannot be undone.`
                      )
                    ) {
                      await clearAllInquiries();
                      setInquiryToastMessage('All admission inquiries cleared.');
                      setTimeout(() => setInquiryToastMessage(null), 3500);
                    }
                  }}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Wipe all inquiries"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Clear All</span>
                </button>
              )}

              {/* Export CSV Button */}
              <button
                type="button"
                onClick={exportInquiriesCSV}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#12315A] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-blue-700" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Toast Notification Alert */}
          {inquiryToastMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center justify-between shadow-xs animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{inquiryToastMessage}</span>
              </div>
              <button
                onClick={() => setInquiryToastMessage(null)}
                className="text-emerald-700 hover:text-emerald-900 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student, ref ID, phone..."
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs pb-1 sm:pb-0">
              <span className="font-bold text-slate-400 uppercase text-[10px] shrink-0">Filter:</span>
              {(
                [
                  'ALL',
                  'Needs Verification',
                  'Verified & Enrolled',
                  'New',
                  'Contacted',
                  'Follow-up Required',
                  'Admission Confirmed',
                  'Closed',
                ] as const
              ).map((st) => (
                <button
                  key={st}
                  onClick={() => setInquiryStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
                    inquiryStatusFilter === st
                      ? 'bg-[#12315A] text-white shadow-sm'
                      : st === 'Needs Verification'
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{st}</span>
                  {st === 'Needs Verification' && stats.pendingPayments > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                      {stats.pendingPayments}
                    </span>
                  )}
                  {st === 'Verified & Enrolled' && stats.verifiedStudents > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                      {stats.verifiedStudents}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Multi-Select Batch Actions Bar */}
          {selectedInquiryIds.length > 0 && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs animate-fadeIn shadow-xs">
              <div className="flex items-center gap-2 text-rose-950 font-bold">
                <CheckCircle2 className="w-4 h-4 text-rose-600" />
                <span>{selectedInquiryIds.length} student inquiry record(s) selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInquiryIds([])}
                  className="px-3 py-1.5 rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Deselect All
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (
                      confirm(
                        `Permanently delete all ${selectedInquiryIds.length} selected admission inquiry records?\n\nThis will remove them from local storage and Supabase database.`
                      )
                    ) {
                      const count = selectedInquiryIds.length;
                      await deleteMultipleInquiries(selectedInquiryIds);
                      setSelectedInquiryIds([]);
                      setInquiryToastMessage(`Successfully deleted ${count} selected inquiry record(s).`);
                      setTimeout(() => setInquiryToastMessage(null), 3500);
                    }
                  }}
                  className="px-4 py-1.5 rounded-xl text-white bg-rose-600 hover:bg-rose-700 font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedInquiryIds.length})</span>
                </button>
              </div>
            </div>
          )}

          {/* Inquiries Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-3 px-3 w-8 text-center">
                      <input
                        type="checkbox"
                        aria-label="Select all inquiries"
                        checked={
                          filteredInquiries.length > 0 &&
                          filteredInquiries.every((i) => selectedInquiryIds.includes(i.id))
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedInquiryIds(filteredInquiries.map((i) => i.id));
                          } else {
                            setSelectedInquiryIds([]);
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                      />
                    </th>
                    <th className="py-3 px-3">Ref Number</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Program & Level</th>
                    <th className="py-3 px-4">Payment Proof</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Mode & Shift</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInquiries.map((inq) => (
                    <tr
                      key={inq.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        selectedInquiryIds.includes(inq.id) ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Select ${inq.referenceNumber}`}
                          checked={selectedInquiryIds.includes(inq.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInquiryIds((prev) => [...prev, inq.id]);
                            } else {
                              setSelectedInquiryIds((prev) => prev.filter((id) => id !== inq.id));
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {inq.referenceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{inq.fullName}</p>
                        <p className="text-[11px] text-slate-400">{inq.address || 'Address unlisted'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">{inq.courseName}</p>
                        <p className="text-[11px] text-slate-500">{inq.academicLevel}</p>
                      </td>
                      <td className="py-3 px-4">
                        {inq.hasPaymentProof ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (inq.paymentProofUrl) {
                                    setSelectedProofModalUrl(inq.paymentProofUrl);
                                  } else {
                                    handleOpenInquiryDetail(inq);
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
                                title="Click to view payment slip"
                              >
                                <Receipt className="w-3 h-3 text-amber-600" />
                                <span>{inq.paymentMethod || 'Receipt'}</span>
                                {inq.paymentAmount && (
                                  <span className="font-mono text-slate-800">Rs.{inq.paymentAmount}</span>
                                )}
                              </button>
                            </div>
                            <div>
                              {inq.paymentVerified || inq.status === 'Verified & Enrolled' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Enrolled ({inq.assignedStudentId || 'ID Issued'})</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenInquiryDetail(inq)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400 hover:bg-amber-500 text-slate-950 text-[10px] font-bold shadow-2xs transition-colors cursor-pointer"
                                >
                                  <AlertCircle className="w-3 h-3 text-slate-950" />
                                  <span>Verify & Enroll</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-slate-400 text-[11px] block">No slip attached</span>
                            {inq.status === 'Verified & Enrolled' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Manually Enrolled</span>
                              </span>
                            ) : null}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <a href={`tel:${inq.phone}`} className="font-semibold text-blue-700 hover:underline block">
                          {inq.phone}
                        </a>
                        <p className="text-[11px] text-slate-400 truncate max-w-[120px]">{inq.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700">{inq.preferredMode}</span>
                        <p className="text-[11px] text-slate-400">{inq.preferredShift} Batch</p>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={inq.status}
                          onChange={(e) =>
                            updateInquiryStatus(inq.id, e.target.value as InquiryStatus, 'Admin updated status')
                          }
                          className={`px-2 py-1 rounded text-[11px] font-bold border focus:outline-none ${
                            inq.status === 'Verified & Enrolled'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : inq.status === 'New'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : inq.status === 'Admission Confirmed'
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : inq.status === 'Follow-up Required'
                              ? 'bg-purple-100 text-purple-900 border-purple-300'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          <option value="New">New</option>
                          <option value="Verified & Enrolled">Verified & Enrolled</option>
                          <option value="Admission Confirmed">Admission Confirmed</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Follow-up Required">Follow-up Required</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenInquiryDetail(inq)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            {inq.hasPaymentProof && !inq.paymentVerified ? 'Verify Proof' : 'Details'}
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (
                                confirm(
                                  `Are you sure you want to permanently delete inquiry ${inq.referenceNumber} for ${inq.fullName}?`
                                )
                              ) {
                                await deleteInquiry(inq.id);
                                setSelectedInquiryIds((prev) => prev.filter((id) => id !== inq.id));
                                setInquiryToastMessage(
                                  `Inquiry ${inq.referenceNumber} (${inq.fullName}) deleted successfully.`
                                );
                                setTimeout(() => setInquiryToastMessage(null), 3500);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            title={`Delete inquiry ${inq.referenceNumber}`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry Detail & Payment Verification Modal */}
      {selectedInquiryDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto space-y-6 text-xs sm:text-sm">
            <button
              onClick={() => setSelectedInquiryDetail(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {verificationSuccessToast && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="font-bold text-xs">{verificationSuccessToast}</p>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                  Ref: {selectedInquiryDetail.referenceNumber}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    selectedInquiryDetail.status === 'Verified & Enrolled'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Status: {selectedInquiryDetail.status}
                </span>
                {selectedInquiryDetail.assignedStudentId && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                    ID: {selectedInquiryDetail.assignedStudentId}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {selectedInquiryDetail.fullName}
              </h2>
              <p className="text-slate-500 text-xs">
                Submitted on {new Date(selectedInquiryDetail.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Applicant Details */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Course & Board</p>
                <p className="font-bold text-slate-800">{selectedInquiryDetail.courseName}</p>
                <p className="text-xs text-slate-500">{selectedInquiryDetail.board}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Level & Subjects</p>
                <p className="font-bold text-slate-800">{selectedInquiryDetail.academicLevel || 'N/A'}</p>
                <p className="text-xs text-slate-500">
                  {selectedInquiryDetail.subjectsOfInterest || 'All offered subjects'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Contact Details</p>
                <p className="font-bold text-blue-700">{selectedInquiryDetail.phone}</p>
                <p className="text-xs text-slate-500">{selectedInquiryDetail.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Mode & Shift</p>
                <p className="font-bold text-slate-800">{selectedInquiryDetail.preferredMode}</p>
                <p className="text-xs text-slate-500">{selectedInquiryDetail.preferredShift} Batch</p>
              </div>
            </div>

            {selectedInquiryDetail.message && (
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs space-y-1">
                <p className="font-bold text-blue-900 uppercase text-[10px]">Student Message / Query</p>
                <p className="text-slate-700">{selectedInquiryDetail.message}</p>
              </div>
            )}

            {/* PAYMENT PROOF & ENROLLMENT VERIFICATION SECTION */}
            <div className="p-5 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50/50 via-white to-blue-50/30 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-sm text-[#12315A]">
                    Tuition Fee Payment Proof & Student Verification
                  </h3>
                </div>
                {selectedInquiryDetail.hasPaymentProof ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Slip Attached
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    No Slip Uploaded
                  </span>
                )}
              </div>

              {selectedInquiryDetail.hasPaymentProof ? (
                <div className="space-y-4">
                  {/* Voucher Preview & Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    {/* Voucher Image / Slip */}
                    <div className="sm:col-span-5 bg-white p-2 rounded-xl border border-slate-200 shadow-xs text-center space-y-1.5">
                      {selectedInquiryDetail.paymentProofUrl ? (
                        <div>
                          <img
                            src={selectedInquiryDetail.paymentProofUrl}
                            alt="Payment Voucher"
                            onClick={() => setSelectedProofModalUrl(selectedInquiryDetail.paymentProofUrl)}
                            className="w-full h-36 object-contain rounded-lg border border-slate-100 bg-slate-50 hover:opacity-90 transition-opacity cursor-pointer"
                            title="Click to view full voucher preview"
                          />
                          <button
                            type="button"
                            onClick={() => setSelectedProofModalUrl(selectedInquiryDetail.paymentProofUrl)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline mt-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Full Resolution Slip</span>
                          </button>
                        </div>
                      ) : (
                        <div className="h-32 flex flex-col items-center justify-center bg-slate-50 rounded-lg text-slate-400">
                          <Receipt className="w-8 h-8 mb-1" />
                          <p className="text-[11px]">Voucher file attached</p>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-500 font-medium truncate">
                        {selectedInquiryDetail.paymentProofName || 'Voucher_receipt.png'} •{' '}
                        {selectedInquiryDetail.paymentProofSize || 'Image'}
                      </p>
                    </div>

                    {/* Payment Metadata */}
                    <div className="sm:col-span-7 space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                            Payment Method
                          </span>
                          <span className="font-bold text-slate-900">
                            {selectedInquiryDetail.paymentMethod || 'eSewa'}
                          </span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                            Deposited Amount
                          </span>
                          <span className="font-bold text-emerald-700 font-mono text-sm">
                            NPR {selectedInquiryDetail.paymentAmount || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                          Transaction ID / Ref
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {selectedInquiryDetail.transactionReference || 'Not provided'}
                        </span>
                      </div>

                      {selectedInquiryDetail.paymentRemarks && (
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                            Student Payment Remarks
                          </span>
                          <p className="text-slate-700 text-[11px]">
                            {selectedInquiryDetail.paymentRemarks}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Verification Actions Box */}
                  {selectedInquiryDetail.paymentVerified ||
                  selectedInquiryDetail.status === 'Verified & Enrolled' ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 text-emerald-900">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <p className="font-bold text-xs sm:text-sm">
                              Enrolled & Officially Verified Student
                            </p>
                            <p className="text-[11px] text-emerald-800">
                              Verified by {selectedInquiryDetail.verifiedBy || 'Administrator'} • Student ID:{' '}
                              <strong>{selectedInquiryDetail.assignedStudentId}</strong>
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const msg = `Namaste ${selectedInquiryDetail.fullName}! Your admission and payment of NPR ${selectedInquiryDetail.paymentAmount || ''} for ${selectedInquiryDetail.courseName} at Shikshyalaya Shaikshik Sanstha has been verified. Your official Student ID is ${selectedInquiryDetail.assignedStudentId}. Please log in to your Student Portal to access enrolled study materials & live classes: https://shikshyalaya.edu.np/student/login`;
                            navigator.clipboard.writeText(msg);
                            setCopiedWelcomeMessage(true);
                            setTimeout(() => setCopiedWelcomeMessage(false), 2500);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          {copiedWelcomeMessage ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied Welcome Msg!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy WhatsApp/SMS Notification</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-3">
                      <div className="flex items-start gap-2 text-amber-900">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-xs">Awaiting Administrator Verification</p>
                          <p className="text-[11px] text-amber-800">
                            Check the deposited amount and transaction ID against the institute eSewa or bank
                            account. Once verified, approving will activate the student's portal access to
                            study materials.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                            Assign Student ID
                          </label>
                          <input
                            type="text"
                            value={assignedStudentIdInput}
                            onChange={(e) => setAssignedStudentIdInput(e.target.value)}
                            placeholder="e.g. SSS-STU-BBM-2026"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div className="sm:pt-5">
                          <button
                            type="button"
                            onClick={() => {
                              verifyAndEnrollApplicant(
                                selectedInquiryDetail.id,
                                assignedStudentIdInput
                              );
                              setSelectedInquiryDetail((prev: any) => ({
                                ...prev,
                                status: 'Verified & Enrolled',
                                paymentVerified: true,
                                assignedStudentId: assignedStudentIdInput,
                                verifiedBy: currentUser?.name || 'Administrator',
                                verifiedAt: new Date().toISOString(),
                              }));
                              setVerificationSuccessToast(
                                `Student ${selectedInquiryDetail.fullName} has been verified and enrolled with ID ${assignedStudentIdInput}!`
                              );
                            }}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Verify Payment & Enroll Student</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* No payment proof attached case */
                <div className="space-y-3">
                  <p className="text-xs text-slate-600">
                    Student has not yet attached an electronic payment voucher. If they deposited cash directly
                    at the campus admissions desk, you can manually verify and enroll them below.
                  </p>
                  {selectedInquiryDetail.status !== 'Verified & Enrolled' ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={assignedStudentIdInput}
                        onChange={(e) => setAssignedStudentIdInput(e.target.value)}
                        placeholder="Assign Student ID (e.g. SSS-STU-2026)"
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          verifyAndEnrollApplicant(
                            selectedInquiryDetail.id,
                            assignedStudentIdInput,
                            'Student enrolled via direct campus desk payment verification.'
                          );
                          setSelectedInquiryDetail((prev: any) => ({
                            ...prev,
                            status: 'Verified & Enrolled',
                            paymentVerified: true,
                            assignedStudentId: assignedStudentIdInput,
                            verifiedBy: currentUser?.name || 'Administrator',
                            verifiedAt: new Date().toISOString(),
                          }));
                          setVerificationSuccessToast(
                            `Student ${selectedInquiryDetail.fullName} manually enrolled with ID ${assignedStudentIdInput}!`
                          );
                        }}
                        className="px-4 py-2 rounded-xl font-bold text-white bg-[#12315A] hover:bg-blue-900 transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span>Manual Campus Desk Verification & Enroll</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        Enrolled Student • Assigned ID: {selectedInquiryDetail.assignedStudentId}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Internal Admin Notes */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Internal Administrative Follow-up Notes
              </h4>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedInquiryDetail.adminNotes?.map((note: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                      <span className="font-bold text-slate-600">{note.by}</span>
                      <span>{note.date}</span>
                    </div>
                    <p className="text-slate-700">{note.text}</p>
                  </div>
                ))}
              </div>

              {/* Add Note Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Record follow-up result or phone note..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newNoteText.trim()) {
                      addInquiryNote(selectedInquiryDetail.id, newNoteText);
                      setNewNoteText('');
                      // Update active modal view
                      setSelectedInquiryDetail((prev: any) => ({
                        ...prev,
                        adminNotes: [
                          ...(prev.adminNotes || []),
                          { date: new Date().toLocaleDateString(), text: newNoteText, by: 'Administrator' },
                        ],
                      }));
                    }
                  }}
                  className="px-4 py-2 rounded-xl font-bold text-white bg-[#12315A] hover:bg-blue-900 text-xs cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={async () => {
                  if (
                    confirm(
                      `Permanently delete inquiry ${selectedInquiryDetail.referenceNumber} for ${selectedInquiryDetail.fullName}?`
                    )
                  ) {
                    await deleteInquiry(selectedInquiryDetail.id);
                    setSelectedInquiryDetail(null);
                    setInquiryToastMessage(
                      `Inquiry ${selectedInquiryDetail.referenceNumber} has been permanently deleted.`
                    );
                    setTimeout(() => setInquiryToastMessage(null), 3500);
                  }
                }}
                className="px-3.5 py-2 rounded-xl font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs flex items-center gap-1.5 cursor-pointer border border-rose-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete This Inquiry</span>
              </button>

              <button
                onClick={() => setSelectedInquiryDetail(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL RESOLUTION PAYMENT PROOF PREVIEW MODAL */}
      {selectedProofModalUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-[#12315A]">Payment Voucher Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProofModalUrl(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-slate-50 p-2 rounded-2xl border border-slate-200">
              <img
                src={selectedProofModalUrl}
                alt="Payment Voucher Full Preview"
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400 text-[11px]">Official Tuition Deposit Receipt</span>
              <button
                type="button"
                onClick={() => setSelectedProofModalUrl(null)}
                className="px-4 py-2 rounded-xl font-bold bg-[#12315A] text-white hover:bg-blue-900 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: REGISTERED STUDENTS (MOCK EXAMINATIONS) */}
      {activeTab === 'registered-students' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Status & Shift Controller Action Header */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#12315A]">
                    Registered Students — Mock Exam Series
                  </h3>
                  <p className="text-xs text-slate-500">
                    Total Registered Candidates: <strong>{mockTestRegistrations.length}</strong> • Filtered Results: <strong>{filteredRegistrations.length}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={async () => {
                  setIsRefreshingRegistrations(true);
                  await refreshMockRegistrations();
                  setIsRefreshingRegistrations(false);
                  setRegStudentToast('Mock test candidate registrations synced successfully.');
                  setTimeout(() => setRegStudentToast(null), 3000);
                }}
                disabled={isRefreshingRegistrations}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                title="Sync and pull latest candidate registrations from cloud database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingRegistrations ? 'animate-spin text-blue-700' : 'text-blue-600'}`} />
                <span>{isRefreshingRegistrations ? 'Syncing...' : 'Sync / Refresh'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddShift}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Clock className="w-3.5 h-3.5 text-slate-950" />
                <span>+ Fix / Add Exam Shift Time</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const headers = ['Ref Number', 'Name', 'Phone', 'Email', 'Course', 'Semester/Year', 'Subjects', 'Exam Shift', 'Mode', 'Status', 'Date'];
                  const rows = mockTestRegistrations.map((r) => [
                    r.referenceNumber,
                    r.fullName,
                    r.phone,
                    r.email,
                    r.courseName,
                    r.semesterOrYear || '',
                    (r.enrolledSubjects || []).join('; '),
                    r.shift || '',
                    r.preferredMode || '',
                    r.status,
                    r.createdAt,
                  ]);
                  const csvContent =
                    'data:text/csv;charset=utf-8,' +
                    [headers.join(','), ...rows.map((e) => e.map((x) => `"${(x || '').replace(/"/g, '""')}"`).join(','))].join('\n');
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement('a');
                  link.setAttribute('href', encodedUri);
                  link.setAttribute('download', `mock_exam_registered_students_${Date.now()}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {regStudentToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{regStudentToast}</span>
            </div>
          )}

          {shiftToast && (
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-300 text-blue-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>{shiftToast}</span>
            </div>
          )}

          {/* ADMIN-CONFIGURED FIXED EXAM SHIFTS & TIMINGS BAR */}
          <div className="bg-gradient-to-r from-[#12315A] to-[#1e467b] text-white p-5 sm:p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 mb-1">
                  <Clock className="w-3 h-3" />
                  <span>Admin-Fixed Exam Schedules</span>
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Available Exam Shifts & Fixed Hours for Candidates
                </h4>
                <p className="text-xs text-blue-200">
                  Students registering for mock tests must choose from these administrator-authorized time slots.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddShift}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Shift Slot</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {(settings.mockExamShifts || []).map((shift) => (
                <div
                  key={shift.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    shift.isActive
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-amber-300">
                          {shift.shiftName}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            shift.isActive
                              ? 'bg-emerald-400 text-slate-950'
                              : 'bg-slate-400 text-slate-950'
                          }`}
                        >
                          {shift.isActive ? 'Active Slot' : 'Paused'}
                        </span>
                      </div>
                      <p className="font-mono text-xs font-bold mt-1 text-white">
                        {shift.timeSlot}
                      </p>
                      {shift.reportingTime && (
                        <p className="text-[10px] text-blue-200">
                          Reporting: {shift.reportingTime}
                        </p>
                      )}
                      {shift.days && (
                        <p className="text-[10px] text-blue-200">
                          Days: {shift.days}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleShiftStatus(shift.id)}
                        className="p-1 rounded text-white/70 hover:text-white hover:bg-white/20 text-[10px] font-bold"
                        title={shift.isActive ? 'Pause Shift' : 'Activate Shift'}
                      >
                        {shift.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditShift(shift)}
                        className="p-1 rounded text-white/70 hover:text-white hover:bg-white/20"
                        title="Edit Shift"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteShift(shift.id, shift.shiftName)}
                        className="p-1 rounded text-rose-300 hover:text-rose-100 hover:bg-rose-500/20"
                        title="Delete Shift"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidates by name, roll number, phone, email, reference number..."
                value={regStudentSearch}
                onChange={(e) => setRegStudentSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              {/* Filter Course */}
              <select
                value={regStudentCourseFilter}
                onChange={(e) => setRegStudentCourseFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700"
              >
                <option value="ALL">All Programs</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.title}
                  </option>
                ))}
              </select>

              {/* Filter Status */}
              <select
                value={regStudentStatusFilter}
                onChange={(e) => setRegStudentStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="Registered">Registered</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Attended">Attended</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {/* Filter Shift */}
              <select
                value={regStudentShiftFilter}
                onChange={(e) => setRegStudentShiftFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700"
              >
                <option value="ALL">All Exam Shifts</option>
                {(settings.mockExamShifts || []).map((s) => (
                  <option key={s.id} value={`${s.shiftName} (${s.timeSlot})`}>
                    {s.shiftName} ({s.timeSlot})
                  </option>
                ))}
              </select>

              {(regStudentSearch || regStudentCourseFilter !== 'ALL' || regStudentStatusFilter !== 'ALL' || regStudentShiftFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setRegStudentSearch('');
                    setRegStudentCourseFilter('ALL');
                    setRegStudentStatusFilter('ALL');
                    setRegStudentShiftFilter('ALL');
                  }}
                  className="px-2.5 py-2 text-xs text-rose-600 hover:underline font-bold"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Registered Students Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Ref Number</th>
                    <th className="py-3 px-4">Candidate Information</th>
                    <th className="py-3 px-4">Program & Level</th>
                    <th className="py-3 px-4">Registered Subjects</th>
                    <th className="py-3 px-4">Admin-Fixed Shift & Time</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Registration Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <UserCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="font-bold text-slate-700 text-sm">
                          No Registered Candidates Found
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {mockTestRegistrations.length === 0
                            ? 'Students who register for mock tests through the Mock Tests page will automatically show up here.'
                            : 'Try adjusting your search query or filters above.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => {
                      const cleanPhone = (reg.phone || '').replace(/[^0-9]/g, '');
                      return (
                        <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px]">
                              {reg.referenceNumber}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {new Date(reg.createdAt).toLocaleDateString()}
                            </p>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900 text-sm">{reg.fullName}</p>
                            <p className="text-slate-600 font-mono text-[11px] mt-0.5">{reg.phone}</p>
                            {reg.email && (
                              <p className="text-slate-400 text-[10px]">{reg.email}</p>
                            )}
                            {reg.studentRollNo && (
                              <span className="inline-block mt-1 font-mono text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                                Roll: {reg.studentRollNo}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-800">{reg.courseName}</p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {reg.semesterOrYear && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                                  {reg.semesterOrYear}
                                </span>
                              )}
                              {reg.courseType && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                                  {reg.courseType}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {reg.enrolledSubjects && reg.enrolledSubjects.length > 0 ? (
                                reg.enrolledSubjects.map((s) => (
                                  <span
                                    key={s}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200"
                                  >
                                    {s}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">All Course Subjects</span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-950 font-bold px-2.5 py-1 rounded-lg border border-blue-200">
                              <Clock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                              <span className="text-xs">{reg.shift || 'Morning Exam Shift (06:30 AM)'}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {reg.preferredMode || 'Online PDF'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <select
                              value={reg.status}
                              onChange={(e) => {
                                updateMockTestRegistrationStatus(
                                  reg.id,
                                  e.target.value as MockTestRegistration['status']
                                );
                                setRegStudentToast(`Updated status for ${reg.fullName} to "${e.target.value}".`);
                                setTimeout(() => setRegStudentToast(null), 3000);
                              }}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                                reg.status === 'Confirmed'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : reg.status === 'Attended'
                                  ? 'bg-purple-50 text-purple-800 border-purple-300'
                                  : reg.status === 'Completed'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : reg.status === 'Cancelled'
                                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                                  : 'bg-amber-50 text-amber-900 border-amber-300'
                              }`}
                            >
                              <option value="Registered">Registered</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Attended">Attended</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/977${cleanPhone.replace(/^0+/, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                  title="WhatsApp Chat"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Delete mock test registration for ${reg.fullName} (${reg.referenceNumber})?`)) {
                                    deleteMockTestRegistration(reg.id);
                                    setRegStudentToast(`Deleted registration for ${reg.fullName}.`);
                                    setTimeout(() => setRegStudentToast(null), 3000);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete Registration"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COURSE MANAGEMENT */}
      {activeTab === 'courses' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#12315A]">Academic Courses Directory</h3>
              <p className="text-xs text-slate-400">Manage academic programs, subjects, and schedules</p>
            </div>
            <button
              onClick={() => {
                setEditingCourse(null);
                setIsCourseModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#12315A] hover:bg-blue-900 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c) => (
              <div
                key={c.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {c.board}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          c.courseType === 'Old Course'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {c.courseType || 'New Course'}
                      </span>
                    </div>
                    <button
                      onClick={() => togglePublishCourse(c.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        c.published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {c.published ? 'Published' : 'Draft'}
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                  {c.syllabusVersion && (
                    <p className="text-[10px] font-semibold text-slate-500">
                      Syllabus: {c.syllabusVersion}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 line-clamp-2">{c.shortDescription}</p>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Subjects: <strong>{c.subjectsOffered.length}</strong> modules
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Link to={`/courses/${c.slug}`} className="text-blue-700 font-bold hover:underline">
                    View Page &rarr;
                  </Link>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingCourse(c);
                        setIsCourseModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-slate-100"
                      title="Edit Course"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${c.title}?`)) {
                          deleteCourse(c.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Modal */}
      {isCourseModalOpen && (
        <CourseEditModal
          course={editingCourse}
          onClose={() => setIsCourseModalOpen(false)}
          onSave={(data) => {
            if (editingCourse) {
              updateCourse(editingCourse.id, data);
            } else {
              addCourse(data as any);
            }
            setIsCourseModalOpen(false);
          }}
        />
      )}

      {/* TAB: STUDENT GROUPS & IMMEDIATE COMMUNICATION */}
      {activeTab === 'groups' && (
        <div className="space-y-6 animate-fadeIn">
          {groupToastMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{groupToastMessage}</span>
              </div>
              <button
                onClick={() => setGroupToastMessage(null)}
                className="text-emerald-700 hover:text-emerald-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Group Header & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#12315A]">
                  Enrolled Student Groups & Immediate Communication Center
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Notice Broadcast Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Organize enrolled student mobile numbers by academic batch, send instant urgent notice broadcasts, and connect official WhatsApp groups.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingGroup(null);
                setIsGroupModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#12315A] hover:bg-blue-900 shadow transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Create New Student Group</span>
            </button>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Groups</span>
              <p className="text-xl font-black text-[#12315A]">{studentGroups.length}</p>
              <span className="text-[10px] text-blue-600 font-semibold">Cohorts / Batches</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enrolled Students</span>
              <p className="text-xl font-black text-emerald-600">
                {studentGroups.reduce((acc, g) => acc + (g.members?.length || 0), 0)}
              </p>
              <span className="text-[10px] text-emerald-700 font-semibold">Active In Groups</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">WhatsApp Groups</span>
              <p className="text-xl font-black text-emerald-700">
                {studentGroups.filter((g) => g.whatsappGroupLink).length}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">Connected Invites</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Urgent Broadcasts</span>
              <p className="text-xl font-black text-rose-600">
                {studentGroups.reduce((acc, g) => acc + (g.broadcasts?.length || 0), 0)}
              </p>
              <span className="text-[10px] text-rose-700 font-semibold">Notices Sent</span>
            </div>
          </div>

          {/* Search & Course Type Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search groups by batch name, academic course, level, or coordinator..."
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500">Syllabus:</span>
              {(['ALL', 'New Course', 'Old Course'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setGroupTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    groupTypeFilter === type
                      ? type === 'Old Course'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-[#12315A] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type === 'ALL' ? 'All Groups' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Groups Grid */}
          {studentGroups
            .filter((g) => {
              if (groupTypeFilter !== 'ALL' && (g.courseType || 'New Course') !== groupTypeFilter) {
                return false;
              }
              if (!groupSearch.trim()) return true;
              const q = groupSearch.toLowerCase();
              const gName = g.name || g.title || '';
              return (
                gName.toLowerCase().includes(q) ||
                g.courseName.toLowerCase().includes(q) ||
                g.academicLevel.toLowerCase().includes(q) ||
                g.coordinatorName.toLowerCase().includes(q)
              );
            })
            .length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No student groups found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No cohort matches your active search or filter. Create a new group to begin organizing enrolled students.
              </p>
              <button
                onClick={() => {
                  setEditingGroup(null);
                  setIsGroupModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#12315A]"
              >
                Create First Group
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studentGroups
                .filter((g) => {
                  if (groupTypeFilter !== 'ALL' && (g.courseType || 'New Course') !== groupTypeFilter) {
                    return false;
                  }
                  if (!groupSearch.trim()) return true;
                  const q = groupSearch.toLowerCase();
                  const gName = g.name || g.title || '';
                  return (
                    gName.toLowerCase().includes(q) ||
                    g.courseName.toLowerCase().includes(q) ||
                    g.academicLevel.toLowerCase().includes(q) ||
                    g.coordinatorName.toLowerCase().includes(q)
                  );
                })
                .map((g) => (
                  <div
                    key={g.id}
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-blue-300 transition-all"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              g.courseType === 'Old Course'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {g.courseType || 'New Course'}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {g.shift} Shift
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            Batch {g.academicYearOrBatch}
                          </span>
                        </div>

                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {g.members?.length || 0} Students Enrolled
                        </span>
                      </div>

                      {/* Title & Course */}
                      <div>
                        <h4 className="text-base font-bold text-slate-900 leading-snug">{g.name}</h4>
                        <p className="text-xs text-blue-800 font-semibold mt-0.5">
                          {g.courseName} • Level: {g.academicLevel}
                        </p>
                      </div>

                      {/* Coordinator Bar */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Coordinator</p>
                          <p className="font-bold text-slate-800 truncate">{g.coordinatorName}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={`tel:${g.coordinatorPhone}`}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-blue-700 bg-white border border-slate-200 hover:bg-blue-50 flex items-center gap-1 cursor-pointer"
                          >
                            <Phone className="w-3 h-3 text-blue-600" />
                            <span>{g.coordinatorPhone}</span>
                          </a>
                        </div>
                      </div>

                      {/* WhatsApp Official Batch Link Card */}
                      <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-950 text-[11px] flex items-center gap-1.5">
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Official Batch WhatsApp Group</span>
                          </span>
                          {g.whatsappGroupLink ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900">
                              Active Link
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                              No Link Set
                            </span>
                          )}
                        </div>

                        {g.whatsappGroupLink ? (
                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <p className="text-[11px] font-mono text-emerald-800 truncate max-w-[200px]">
                              {g.whatsappGroupLink}
                            </p>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const link = g.whatsappGroupLink || g.whatsappGroupUrl || '';
                                  navigator.clipboard.writeText(link);
                                  setGroupToastMessage(`Copied WhatsApp group link for ${g.name || g.title}!`);
                                  setTimeout(() => setGroupToastMessage(null), 3000);
                                }}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-100 cursor-pointer"
                              >
                                Copy Link
                              </button>
                              <a
                                href={g.whatsappGroupLink || g.whatsappGroupUrl || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 rounded-lg text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1 cursor-pointer"
                              >
                                <span>Open</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">
                            No WhatsApp link configured. Tap Edit to paste group invite link.
                          </p>
                        )}
                      </div>

                      {/* Latest Broadcast Excerpt if Any */}
                      {g.broadcasts && g.broadcasts.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1">
                              <Radio className="w-3 h-3 text-blue-600" />
                              <span>Latest Broadcast</span>
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {g.broadcasts[0].sentAt}
                            </span>
                          </div>
                          <p className="font-bold text-slate-800 text-[11px] truncate">
                            {g.broadcasts[0].title}
                          </p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            {g.broadcasts[0].message}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedGroupForBroadcast(g)}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5 text-amber-300" />
                          <span>Broadcast Notice</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedGroupForMembers(g)}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>Manage Students ({g.members?.length || 0})</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
                        <span className="text-[11px]">Created {g.createdAt}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingGroup(g);
                              setIsGroupModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-slate-100"
                            title="Edit Group"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete group "${g.name}"?`)) {
                                deleteStudentGroup(g.id);
                                setGroupToastMessage(`Group "${g.name}" deleted.`);
                                setTimeout(() => setGroupToastMessage(null), 3000);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Group"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Group Create/Edit Modal */}
      {isGroupModalOpen && (
        <GroupEditModal
          group={editingGroup}
          courses={courses}
          onClose={() => setIsGroupModalOpen(false)}
          onSave={(data) => {
            if (editingGroup) {
              updateStudentGroup(editingGroup.id, data);
              setGroupToastMessage(`Updated student group: ${data.name || editingGroup.name}`);
            } else {
              addStudentGroup(data as any);
              setGroupToastMessage(`Created new student group: ${data.name}`);
            }
            setIsGroupModalOpen(false);
            setTimeout(() => setGroupToastMessage(null), 3000);
          }}
        />
      )}

      {/* Group Immediate Broadcast Notice Modal */}
      {selectedGroupForBroadcast && (
        <GroupBroadcastModal
          group={selectedGroupForBroadcast}
          onClose={() => setSelectedGroupForBroadcast(null)}
          onSendBroadcast={(groupId, data) => {
            sendGroupBroadcast(groupId, data);
            // Refresh reference to modal's group
            const updated = studentGroups.find((item) => item.id === groupId);
            if (updated) setSelectedGroupForBroadcast(updated);
          }}
          onDeleteBroadcast={(groupId, broadcastId) => {
            deleteGroupBroadcast(groupId, broadcastId);
            const updated = studentGroups.find((item) => item.id === groupId);
            if (updated) setSelectedGroupForBroadcast(updated);
          }}
        />
      )}

      {/* Group Members Management Modal */}
      {selectedGroupForMembers && (
        <GroupMembersModal
          group={selectedGroupForMembers}
          inquiries={inquiries}
          onClose={() => setSelectedGroupForMembers(null)}
          onAddMember={(groupId, member) => {
            addMemberToGroup(groupId, member);
            const updated = studentGroups.find((item) => item.id === groupId);
            if (updated) setSelectedGroupForMembers(updated);
          }}
          onBulkAddMembers={(groupId, members) => {
            bulkAddMembersToGroup(groupId, members);
            const updated = studentGroups.find((item) => item.id === groupId);
            if (updated) setSelectedGroupForMembers(updated);
          }}
          onImportFromInquiries={(groupId) => {
            const count = importVerifiedInquiriesToGroup(groupId);
            const updated = studentGroups.find((item) => item.id === groupId);
            if (updated) setSelectedGroupForMembers(updated);
            return count;
          }}
          onRemoveMember={(groupId, memberId) => {
            removeMemberFromGroup(groupId, memberId);
            const updated = studentGroups.find((item) => item.id === groupId);
            if (updated) setSelectedGroupForMembers(updated);
          }}
        />
      )}

      {/* TAB 4: TEACHER MANAGEMENT */}
      {activeTab === 'teachers' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#12315A]">Faculty & Instructor Directory</h3>
              <p className="text-xs text-slate-400">Add, edit, or customize teacher profiles</p>
            </div>
            <button
              onClick={() => {
                setEditingTeacher(null);
                setIsTeacherModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#12315A] hover:bg-blue-900 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Faculty Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-start gap-3.5">
                  <label
                    className="relative group shrink-0 cursor-pointer block"
                    title="Click to change photo from hard drive"
                  >
                    <img
                      src={t.avatarUrl}
                      alt={t.name}
                      className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-200 group-hover:opacity-75 transition-opacity"
                    />
                    <span className="absolute inset-0 bg-slate-950/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-bold transition-opacity">
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>Change</span>
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (reader.result) {
                              updateTeacher(t.id, { avatarUrl: reader.result as string });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{t.name}</h4>
                    <p className="text-xs text-blue-700 font-semibold">{t.designation}</p>
                    <p className="text-[11px] text-slate-400">{t.experience}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 line-clamp-2">
                  {t.qualification}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {t.assignedCourseSlugs.length} Assigned Program(s)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingTeacher(t);
                        setIsTeacherModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-slate-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove teacher profile for ${t.name}?`)) {
                          deleteTeacher(t.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teacher Modal */}
      {isTeacherModalOpen && (
        <TeacherEditModal
          teacher={editingTeacher}
          onClose={() => setIsTeacherModalOpen(false)}
          onSave={(data) => {
            if (editingTeacher) {
              updateTeacher(editingTeacher.id, data);
            } else {
              addTeacher(data as any);
            }
            setIsTeacherModalOpen(false);
          }}
        />
      )}

      {/* TAB 5: NOTICE MANAGEMENT */}
      {activeTab === 'notices' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#12315A]">Public Notice Board Announcements</h3>
              <p className="text-xs text-slate-400">Publish batch schedules, holiday alerts, and admissions</p>
            </div>
            <button
              onClick={() => {
                setEditingNotice(null);
                setIsNoticeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#12315A] hover:bg-blue-900 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Create Announcement</span>
            </button>
          </div>

          <div className="space-y-3">
            {notices.map((n) => (
              <div
                key={n.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {n.category}
                    </span>
                    <span className="text-slate-400 text-[11px]">{n.publishDate}</span>
                    {n.important && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                        High Priority
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                  <p className="text-slate-600 line-clamp-1">{n.content}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingNotice(n);
                      setIsNoticeModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-slate-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete announcement: ${n.title}?`)) {
                        deleteNotice(n.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notice Modal */}
      {isNoticeModalOpen && (
        <NoticeEditModal
          notice={editingNotice}
          onClose={() => setIsNoticeModalOpen(false)}
          onSave={(data) => {
            if (editingNotice) {
              updateNotice(editingNotice.id, data);
            } else {
              addNotice(data as any);
            }
            setIsNoticeModalOpen(false);
          }}
        />
      )}

      {/* TAB 6: STUDY MATERIAL MANAGEMENT */}
      {activeTab === 'materials' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#12315A]">Study Materials & Resource Repository</h3>
              <p className="text-xs text-slate-400">Publish notes, past papers, and access permission levels</p>
            </div>
            <button
              onClick={() => {
                setEditingMaterial(null);
                setIsMaterialModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#12315A] hover:bg-blue-900 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Resource</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyMaterials.map((m) => (
              <div
                key={m.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3 text-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-800">
                      {m.resourceType}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        m.accessLevel === 'Public' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {m.accessLevel}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{m.title}</h4>
                  <p className="text-slate-500 font-medium">
                    {m.courseName} • {m.subject} • {m.semesterOrYear}
                  </p>
                  <p className="text-slate-600 line-clamp-2">{m.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">{m.fileSize} • {m.uploadDate}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingMaterial(m);
                        setIsMaterialModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-slate-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete material ${m.title}?`)) {
                          deleteStudyMaterial(m.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Material Modal */}
      {isMaterialModalOpen && (
        <MaterialEditModal
          material={editingMaterial}
          courses={courses}
          onClose={() => setIsMaterialModalOpen(false)}
          onSave={(data) => {
            if (editingMaterial) {
              updateStudyMaterial(editingMaterial.id, data);
            } else {
              addStudyMaterial(data as any);
            }
            setIsMaterialModalOpen(false);
          }}
        />
      )}

      {/* TAB 7: WEBSITE SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8 animate-fadeIn text-xs sm:text-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#12315A]">Central Website & Brand Settings</h3>
              <p className="text-xs text-slate-500">
                Update institute name, tagline, official contact details, social links, and notice marquee.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Reset all website settings to original default values?')) {
                  resetSettings();
                  setTempSettings(settings);
                }
              }}
              className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>

          {settingsSavedMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Website settings successfully updated and saved!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Institute Identity */}
            <div className="space-y-4">
              <h4 className="font-bold text-[#12315A] uppercase text-xs tracking-wider">
                1. Institutional Identity & Tagline
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Institute Name (English)
                  </label>
                  <input
                    type="text"
                    value={tempSettings.instituteName}
                    onChange={(e) => setTempSettings({ ...tempSettings, instituteName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Institute Name (Nepali Devanagari)
                  </label>
                  <input
                    type="text"
                    value={tempSettings.instituteDevanagariName}
                    onChange={(e) =>
                      setTempSettings({ ...tempSettings, instituteDevanagariName: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-['Noto_Sans_Devanagari',sans-serif]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Tagline</label>
                  <input
                    type="text"
                    value={tempSettings.tagline}
                    onChange={(e) => setTempSettings({ ...tempSettings, tagline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alternative Tagline</label>
                  <input
                    type="text"
                    value={tempSettings.altTagline}
                    onChange={(e) => setTempSettings({ ...tempSettings, altTagline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Custom Logo URL (Optional)</label>
                <input
                  type="text"
                  placeholder="Leave empty to use the official vector emblem"
                  value={tempSettings.logoUrl || ''}
                  onChange={(e) => setTempSettings({ ...tempSettings, logoUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-[#12315A] uppercase text-xs tracking-wider">
                2. Contact & Physical Location
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Phone</label>
                  <input
                    type="text"
                    value={tempSettings.contactNumber}
                    onChange={(e) => setTempSettings({ ...tempSettings, contactNumber: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alternate Phone</label>
                  <input
                    type="text"
                    value={tempSettings.contactNumberAlt || ''}
                    onChange={(e) => setTempSettings({ ...tempSettings, contactNumberAlt: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={tempSettings.emailAddress}
                    onChange={(e) => setTempSettings({ ...tempSettings, emailAddress: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={tempSettings.physicalAddress}
                    onChange={(e) => setTempSettings({ ...tempSettings, physicalAddress: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Office Hours</label>
                  <input
                    type="text"
                    value={tempSettings.officeHours}
                    onChange={(e) => setTempSettings({ ...tempSettings, officeHours: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Social & WhatsApp */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-[#12315A] uppercase text-xs tracking-wider">
                3. Social Media & WhatsApp
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp Phone Number</label>
                  <input
                    type="text"
                    value={tempSettings.whatsappNumber}
                    onChange={(e) => setTempSettings({ ...tempSettings, whatsappNumber: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Facebook Page URL</label>
                  <input
                    type="text"
                    value={tempSettings.facebookUrl}
                    onChange={(e) => setTempSettings({ ...tempSettings, facebookUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">YouTube Channel URL</label>
                  <input
                    type="text"
                    value={tempSettings.youtubeUrl}
                    onChange={(e) => setTempSettings({ ...tempSettings, youtubeUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Top Notice Marquee */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-[#12315A] uppercase text-xs tracking-wider">
                4. Notice Marquee Banner
              </h4>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Banner Text</label>
                <input
                  type="text"
                  value={tempSettings.noticeMarqueeText}
                  onChange={(e) =>
                    setTempSettings({ ...tempSettings, noticeMarqueeText: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempSettings.isNoticeMarqueeActive}
                    onChange={(e) =>
                      setTempSettings({ ...tempSettings, isNoticeMarqueeActive: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-semibold text-slate-700">Display Top Notice Marquee</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempSettings.registrationOpen}
                    onChange={(e) =>
                      setTempSettings({ ...tempSettings, registrationOpen: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-semibold text-slate-700">Admissions Open Status Badge</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl font-bold text-white bg-[#12315A] hover:bg-blue-900 shadow-md transition-colors"
              >
                Save Website Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 8: SUPABASE CLOUD DATABASE & REAL-TIME STORAGE */}
      {activeTab === 'database' && (
        <div className="space-y-6 animate-fadeIn text-xs sm:text-sm">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-[#12315A] to-[#1e4976] text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Supabase PostgreSQL Cloud Database
                    </h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse" />
                      <span>{supabaseStatus?.connected ? 'Online & Configured' : 'Configured'}</span>
                    </span>
                  </div>
                  <p className="text-xs text-blue-200 mt-1">
                    Project ID: <strong className="font-mono text-white">{SUPABASE_PROJECT_ID}</strong> •
                    Storage Endpoint: <span className="font-mono text-blue-100">{SUPABASE_URL}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={isTestingSupabase}
                  onClick={async () => {
                    setIsTestingSupabase(true);
                    setSupabaseTestFeedback(null);
                    try {
                      const res = await checkSupabaseStatus();
                      setSupabaseTestFeedback(
                        res.connected
                          ? `✅ Connection confirmed: Reachable at ${res.url} (${new Date().toLocaleTimeString()})`
                          : `⚠️ Connection test notice: ${res.message}`
                      );
                    } catch (e: any) {
                      setSupabaseTestFeedback(`❌ Connection test failed: ${e?.message}`);
                    } finally {
                      setIsTestingSupabase(false);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                  <span>{isTestingSupabase ? 'Testing...' : 'Test Connection'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSyncingSupabase}
                  onClick={async () => {
                    setIsSyncingSupabase(true);
                    setSupabaseSyncMessage(null);
                    try {
                      const result = await syncAllToSupabase();
                      if (result.success || Object.values(result.syncedCounts).some((c) => c > 0)) {
                        const total = Object.values(result.syncedCounts).reduce((a, b) => a + b, 0);
                        setSupabaseSyncMessage({
                          type: 'success',
                          text: `Successfully synced ${total} records into your Supabase project (Inquiries: ${result.syncedCounts.inquiries}, Submissions: ${result.syncedCounts.mockSubmissions}, Groups: ${result.syncedCounts.studentGroups}, Contacts: ${result.syncedCounts.contactMessages}, Settings: ${result.syncedCounts.settings})!`,
                        });
                      } else {
                        setSupabaseSyncMessage({
                          type: 'error',
                          text: result.errors[0] || 'Sync completed with notice. Ensure your database tables exist via the SQL schema below.',
                        });
                      }
                    } catch (err: any) {
                      setSupabaseSyncMessage({
                        type: 'error',
                        text: `Sync error: ${err?.message}`,
                      });
                    } finally {
                      setIsSyncingSupabase(false);
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-md transition-all cursor-pointer font-black"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>{isSyncingSupabase ? 'Syncing Records...' : 'Sync All Details to Supabase'}</span>
                </button>
              </div>
            </div>

            {/* Live Feedback Alerts */}
            {supabaseTestFeedback && (
              <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-xs font-semibold text-white animate-fadeIn flex items-center justify-between">
                <span>{supabaseTestFeedback}</span>
                <button onClick={() => setSupabaseTestFeedback(null)} className="text-white/70 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {supabaseSyncMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs font-bold animate-fadeIn flex items-center justify-between shadow-xs ${
                  supabaseSyncMessage.type === 'success'
                    ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                    : 'bg-rose-500 text-white border border-rose-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{supabaseSyncMessage.text}</span>
                </div>
                <button onClick={() => setSupabaseSyncMessage(null)} className="opacity-70 hover:opacity-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Configuration & Credentials Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Supabase Project ID
              </span>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <code className="font-mono font-bold text-slate-900 text-xs">{SUPABASE_PROJECT_ID}</code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_PROJECT_ID);
                    alert('Copied Project ID: ' + SUPABASE_PROJECT_ID);
                  }}
                  className="p-1 text-slate-400 hover:text-blue-700"
                  title="Copy Project ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Identifies your hosted Supabase PostgreSQL project instance.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Database REST / API Endpoint
              </span>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <code className="font-mono font-bold text-slate-900 text-xs truncate mr-1">
                  {SUPABASE_URL}
                </code>
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-slate-400 hover:text-blue-700 shrink-0"
                  title="Open Supabase Dashboard"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-[11px] text-slate-500">
                All data packets, student records, and submissions route to this URL.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Publishable API Key
              </span>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <code className="font-mono text-xs text-slate-700 truncate mr-1">
                  {SUPABASE_ANON_KEY.slice(0, 16)}•••••••••
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_ANON_KEY);
                    setCopiedSupabaseKey(true);
                    setTimeout(() => setCopiedSupabaseKey(false), 2500);
                  }}
                  className="p-1 text-slate-400 hover:text-blue-700 shrink-0"
                  title="Copy API Key"
                >
                  {copiedSupabaseKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Client authorization key configured for live writes.
              </p>
            </div>
          </div>

          {/* Database Tables & Live Records Inventory */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Supabase Data Tables & Real-Time Sync Inventory
                </h4>
                <p className="text-xs text-slate-400">
                  Every admission form, PDF answer sheet, contact message, and cohort is stored both in Supabase and offline cache.
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Dual Storage Active (Cloud + Local Cache)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Table: admission_inquiries</span>
                <p className="text-xl font-black text-[#12315A]">{inquiries.length}</p>
                <p className="text-[11px] text-slate-500">Student admissions & vouchers</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Table: mock_test_submissions</span>
                <p className="text-xl font-black text-blue-700">{mockTestSubmissions.length}</p>
                <p className="text-[11px] text-slate-500">Uploaded answer sheets & grades</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Table: contact_messages</span>
                <p className="text-xl font-black text-purple-700">{contactMessages.length}</p>
                <p className="text-[11px] text-slate-500">Contact form submissions</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Table: student_groups</span>
                <p className="text-xl font-black text-amber-700">{studentGroups.length}</p>
                <p className="text-[11px] text-slate-500">Batch groups & student rosters</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Table: mock_tests</span>
                <p className="text-xl font-black text-slate-800">{mockTests.length}</p>
                <p className="text-[11px] text-slate-500">Live timed exam question papers</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Table: notices</span>
                <p className="text-xl font-black text-slate-800">{notices.length}</p>
                <p className="text-[11px] text-slate-500">Announcements & circulars</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Table: study_materials</span>
                <p className="text-xl font-black text-slate-800">{studyMaterials.length}</p>
                <p className="text-[11px] text-slate-500">Notes & PDF syllabi</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Table: site_settings</span>
                <p className="text-xl font-black text-slate-800">1</p>
                <p className="text-[11px] text-slate-500">Institute config & contacts</p>
              </div>
            </div>
          </div>

          {/* SQL Editor Instructions & Schema Script */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-600" />
                  <span>One-Click SQL Schema for Supabase SQL Editor</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  If you are initializing a brand new Supabase project, execute this SQL in your Supabase Dashboard to create all tables and RLS security policies.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                  setCopiedSqlSchema(true);
                  setTimeout(() => setCopiedSqlSchema(false), 2500);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#12315A] hover:bg-blue-900 text-white shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                {copiedSqlSchema ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSqlSchema ? 'Copied SQL Script!' : 'Copy Complete SQL Script'}</span>
              </button>
            </div>

            {/* Quick 3-step guide */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs">
              <p className="font-bold text-amber-950">How to initialize tables in your Supabase account (1 minute):</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-700">
                <li>
                  Open your{' '}
                  <a
                    href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-700 underline"
                  >
                    Supabase SQL Editor (Click here) &rarr;
                  </a>
                </li>
                <li>Click <strong>New Query</strong>, paste the copied SQL schema below, and click <strong>Run</strong>.</li>
                <li>
                  Once run, click <strong>"Sync All Details to Supabase"</strong> above. All student inquiries, answer sheets, and messages will immediately populate your Supabase dashboard!
                </li>
              </ol>
            </div>

            {/* Read-only SQL Code preview */}
            <div className="relative">
              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[11px] max-h-60 overflow-y-auto leading-relaxed border border-slate-800">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>

          {/* Netlify Deployment Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-base">Netlify Production Deployment</h4>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                      <span>Configured & Ready</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pre-configured with <code className="text-teal-700 font-mono font-bold">netlify.toml</code>, SPA catch-all redirect <code className="text-teal-700 font-mono font-bold">public/_redirects</code>, and production headers.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const envSnippet = `VITE_SUPABASE_URL=https://pyjsnwazsbdaupjbaqcd.supabase.co\nVITE_SUPABASE_ANON_KEY=sb_publishable_Sb_og4V9GxxLA_yiZCVMdQ_wfydVcil\nNODE_VERSION=20`;
                    navigator.clipboard.writeText(envSnippet);
                    setCopiedNetlifySnippet(true);
                    setTimeout(() => setCopiedNetlifySnippet(false), 2500);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  {copiedNetlifySnippet ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedNetlifySnippet ? 'Copied Netlify Env!' : 'Copy Netlify Environment Variables'}</span>
                </button>

                <a
                  href="https://app.netlify.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Netlify</span>
                </a>
              </div>
            </div>

            {/* Netlify Build Settings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Build Command</span>
                <p className="font-mono font-bold text-xs text-slate-900">npm run build</p>
                <p className="text-[10px] text-slate-500">Compiles Vite + Tailwind CSS</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Publish Directory</span>
                <p className="font-mono font-bold text-xs text-slate-900">dist</p>
                <p className="text-[10px] text-slate-500">Output production directory</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Node Version</span>
                <p className="font-mono font-bold text-xs text-slate-900">20</p>
                <p className="text-[10px] text-slate-500">Defined in netlify.toml</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">SPA Route Fallback</span>
                <p className="font-mono font-bold text-xs text-slate-900">/* &rarr; /index.html 200</p>
                <p className="text-[10px] text-slate-500">Prevents 404 on page refresh</p>
              </div>
            </div>

            {/* Netlify Environment Variables Box */}
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-400 text-xs uppercase tracking-wider">
                  Netlify Site configuration &rarr; Environment variables:
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Key-Value Pairs</span>
              </div>
              <div className="divide-y divide-slate-800 font-mono text-[11px]">
                <div className="py-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-teal-300 font-bold">VITE_SUPABASE_URL</span>
                  <span className="text-slate-300 text-right truncate">https://pyjsnwazsbdaupjbaqcd.supabase.co</span>
                </div>
                <div className="py-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-teal-300 font-bold">VITE_SUPABASE_ANON_KEY</span>
                  <span className="text-slate-300 text-right truncate">sb_publishable_Sb_og4V9GxxLA_yiZCVMdQ_wfydVcil</span>
                </div>
                <div className="py-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-teal-300 font-bold">NODE_VERSION</span>
                  <span className="text-slate-300 text-right">20</span>
                </div>
              </div>
            </div>

            {/* 2 Deployment Options Guide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                <p className="font-bold text-blue-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Option A: Deploy via GitHub / GitLab</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px]">
                  <li>Push your repository to GitHub.</li>
                  <li>In Netlify, click <strong>"Add new site" &rarr; "Import an existing project"</strong>.</li>
                  <li>Select your repo; Netlify will auto-detect settings from <code className="font-bold">netlify.toml</code>.</li>
                  <li>Add the 2 Supabase environment variables shown above and click <strong>Deploy</strong>.</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Option B: Direct Drag & Drop Deploy</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px]">
                  <li>Run <code className="font-bold">npm run build</code> to generate the <code className="font-bold">dist</code> folder.</li>
                  <li>Go to <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">app.netlify.com/drop</a>.</li>
                  <li>Drag and drop the entire <strong>dist</strong> folder into Netlify.</li>
                  <li>Your site is instantly live with custom subdomain and free HTTPS SSL!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MOCK TESTS & TIMED EXAMINATIONS */}
      {activeTab === 'mock-tests' && (
        <div className="space-y-6">
          {/* Top Header & Actions */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#12315A]">
                    Mock Tests & Timed Examinations Control
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload question papers with strict time limits, manage New vs Old Course options, and evaluate student answer uploads with private examiner feedback.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsDirectResultModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Upload Student Result</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingMockTest(null);
                  setIsMockTestModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Mock Test</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Mock Tests</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{mockTests.length}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {mockTests.filter((t) => t.published).length} Published Live
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Submissions</p>
              <p className="text-2xl font-extrabold text-blue-700 mt-1">{mockTestSubmissions.length}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Student Answer Sheets</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <p className="text-[10px] uppercase font-bold text-slate-400">Evaluated Papers</p>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                {mockTestSubmissions.filter((s) => s.evaluationStatus === 'Evaluated').length}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">With Marks & Examiner Feedback</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <p className="text-[10px] uppercase font-bold text-slate-400">Pending Evaluation</p>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">
                {mockTestSubmissions.filter((s) => s.evaluationStatus !== 'Evaluated').length}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Awaiting Examiner Review</p>
            </div>
          </div>

          {/* Sub-View Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setMockTestSubView('tests')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                mockTestSubView === 'tests'
                  ? 'bg-[#12315A] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Mock Tests & Papers ({mockTests.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setMockTestSubView('answer-sheets')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                mockTestSubView === 'answer-sheets'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Check Answer Sheets by Subject ({mockTestSubmissions.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setMockTestSubView('registrations')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                mockTestSubView === 'registrations'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Mock Test Registrations ({mockTestRegistrations.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setMockTestSubView('shifts')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                mockTestSubView === 'shifts'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Exam Shifts & Timings ({(settings.mockExamShifts || []).length})</span>
            </button>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  mockTestSubView === 'tests'
                    ? 'Search mock tests by title, subject...'
                    : 'Search answer sheets by student name, roll number, subject, title...'
                }
                value={mockTestSearch}
                onChange={(e) => setMockTestSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              {/* Course filter */}
              <select
                value={mockTestCourseFilter}
                onChange={(e) => setMockTestCourseFilter(e.target.value)}
                aria-label="Filter by Course"
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700"
              >
                <option value="ALL">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.title}
                  </option>
                ))}
              </select>

              {/* Year / Semester filter */}
              <select
                value={mockTestYearFilter}
                onChange={(e) => setMockTestYearFilter(e.target.value)}
                aria-label="Filter by Year or Semester"
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700"
              >
                <option value="ALL">All Years / Semesters ({adminMockTestYears.length})</option>
                {adminMockTestYears.map((yr: string) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>

              {/* Subject filter */}
              <select
                value={mockTestSubjectFilter}
                onChange={(e) => setMockTestSubjectFilter(e.target.value)}
                aria-label="Filter by Subject"
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700"
              >
                <option value="ALL">All Subjects ({adminMockTestSubjects.length})</option>
                {adminMockTestSubjects.map((sub: string) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>

              {/* Syllabus type filter */}
              <select
                value={mockTestTypeFilter}
                onChange={(e) => setMockTestTypeFilter(e.target.value as any)}
                aria-label="Filter by Course Type"
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700"
              >
                <option value="ALL">All Syllabi (New & Old)</option>
                <option value="New Course">New Course (Regular)</option>
                <option value="Old Course">Old Course (Backpaper)</option>
              </select>

              {/* Evaluation Status Filter (when viewing answer sheets) */}
              {mockTestSubView === 'answer-sheets' && (
                <select
                  value={mockTestEvaluationStatusFilter}
                  onChange={(e) => setMockTestEvaluationStatusFilter(e.target.value as any)}
                  aria-label="Filter by Status"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700"
                >
                  <option value="ALL">All Evaluation Status</option>
                  <option value="Submitted">Pending Evaluation</option>
                  <option value="Evaluated">Evaluated</option>
                </select>
              )}

              {/* Reset Filters */}
              {(mockTestCourseFilter !== 'ALL' ||
                mockTestYearFilter !== 'ALL' ||
                mockTestSubjectFilter !== 'ALL' ||
                mockTestTypeFilter !== 'ALL' ||
                mockTestEvaluationStatusFilter !== 'ALL' ||
                mockTestSearch) && (
                <button
                  type="button"
                  onClick={() => {
                    setMockTestCourseFilter('ALL');
                    setMockTestYearFilter('ALL');
                    setMockTestSubjectFilter('ALL');
                    setMockTestTypeFilter('ALL');
                    setMockTestEvaluationStatusFilter('ALL');
                    setMockTestSearch('');
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* SUBVIEW 1: MOCK TESTS LIST */}
          {mockTestSubView === 'tests' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-3 px-4">Test Title & Subject</th>
                      <th className="py-3 px-4">Course & Stream</th>
                      <th className="py-3 px-4">Duration & Marks</th>
                      <th className="py-3 px-4">Student Submissions</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mockTests
                      .filter((t) => {
                        if (mockTestCourseFilter !== 'ALL' && t.courseSlug !== mockTestCourseFilter) return false;
                        if (mockTestYearFilter !== 'ALL' && t.semesterOrYear && t.semesterOrYear !== mockTestYearFilter) return false;
                        if (mockTestSubjectFilter !== 'ALL' && t.subject !== mockTestSubjectFilter) return false;
                        if (mockTestTypeFilter !== 'ALL' && t.courseType !== mockTestTypeFilter) return false;
                        if (!mockTestSearch.trim()) return true;
                        const q = mockTestSearch.toLowerCase();
                        return (
                          t.title.toLowerCase().includes(q) ||
                          t.subject.toLowerCase().includes(q) ||
                          t.courseName.toLowerCase().includes(q) ||
                          (t.semesterOrYear && t.semesterOrYear.toLowerCase().includes(q))
                        );
                      })
                      .map((test) => {
                        const testSubs = mockTestSubmissions.filter((s) => (s.mockTestId || s.testId) === test.id);
                        const evaluatedCount = testSubs.filter((s) => s.evaluationStatus === 'Evaluated').length;

                        return (
                          <tr key={test.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">{test.title}</p>
                              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                <p className="text-[11px] text-blue-700 font-bold">
                                  Subject: {test.subject}
                                </p>
                                {test.semesterOrYear && (
                                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.2 rounded-full border border-purple-200">
                                    {test.semesterOrYear}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <p className="font-medium text-slate-700">{test.courseName}</p>
                              <span
                                className={`inline-block mt-0.5 text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${
                                  test.courseType === 'Old Course'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-blue-100 text-blue-900 border border-blue-200'
                                }`}
                              >
                                {test.courseType}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <p className="font-mono text-slate-800 font-semibold">
                                {test.durationMinutes} Mins
                              </p>
                              <p className="text-[10px] text-slate-500">
                                Full: {test.fullMarks} • Pass: {test.passMarks}
                              </p>
                            </td>

                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => setSelectedTestForSubmissions(test)}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                <span>
                                  {testSubs.length} Uploads ({evaluatedCount} Evaluated)
                                </span>
                              </button>
                            </td>

                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => togglePublishMockTest(test.id)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                  test.published
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {test.published ? 'Live Active' : 'Draft Hidden'}
                              </button>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedTestForSubmissions(test)}
                                  className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"
                                  title="Grade Submissions"
                                >
                                  <Award className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingMockTest(test);
                                    setIsMockTestModalOpen(true);
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                                  title="Edit Test Details"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Delete mock test "${test.title}"?`)) {
                                      deleteMockTest(test.id);
                                    }
                                  }}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                                  title="Delete Test"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBVIEW 2: FACULTY ANSWER SHEET CHECKING (FILTERED BY COURSE & SUBJECT) */}
          {mockTestSubView === 'answer-sheets' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
              <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs shadow-2xs">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Faculty Examiner Answer Sheet Evaluation Queue
                    </h3>
                    <p className="text-xs text-slate-500">
                      Filtered by Course: <strong>{mockTestCourseFilter}</strong> • Year/Sem: <strong>{mockTestYearFilter}</strong> • Subject: <strong>{mockTestSubjectFilter}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">
                    Showing {
                      mockTestSubmissions.filter((sub) => {
                        if (mockTestCourseFilter !== 'ALL' && sub.courseSlug !== mockTestCourseFilter) return false;
                        if (mockTestYearFilter !== 'ALL') {
                          const tTest = mockTests.find((t) => t.id === sub.mockTestId || t.id === sub.testId);
                          const subYr = (sub as any).semesterOrYear || tTest?.semesterOrYear;
                          if (subYr && subYr !== mockTestYearFilter) return false;
                        }
                        if (mockTestSubjectFilter !== 'ALL') {
                          const sSub = (sub.subject || '').toLowerCase();
                          const fSub = mockTestSubjectFilter.toLowerCase();
                          if (sSub !== fSub && !sSub.includes(fSub)) return false;
                        }
                        if (mockTestTypeFilter !== 'ALL' && sub.courseType && sub.courseType !== mockTestTypeFilter) return false;
                        if (mockTestEvaluationStatusFilter !== 'ALL' && sub.evaluationStatus !== mockTestEvaluationStatusFilter) return false;
                        if (!mockTestSearch.trim()) return true;
                        const q = mockTestSearch.toLowerCase();
                        return (
                          sub.studentName.toLowerCase().includes(q) ||
                          (sub.rollNumber || '').toLowerCase().includes(q) ||
                          (sub.subject || '').toLowerCase().includes(q) ||
                          (sub.mockTestTitle || sub.testTitle || '').toLowerCase().includes(q)
                        );
                      }).length
                    } submissions
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-3 px-4">Student & Roll No</th>
                      <th className="py-3 px-4">Course & Academic Level</th>
                      <th className="py-3 px-4">Exam Subject</th>
                      <th className="py-3 px-4">Uploaded PDF Paper</th>
                      <th className="py-3 px-4">Evaluation Status</th>
                      <th className="py-3 px-4 text-right">Faculty Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(() => {
                      const filteredSubmissions = mockTestSubmissions.filter((sub) => {
                        if (mockTestCourseFilter !== 'ALL' && sub.courseSlug !== mockTestCourseFilter) return false;
                        if (mockTestYearFilter !== 'ALL') {
                          const tTest = mockTests.find((t) => t.id === sub.mockTestId || t.id === sub.testId);
                          const subYr = (sub as any).semesterOrYear || tTest?.semesterOrYear;
                          if (subYr && subYr !== mockTestYearFilter) return false;
                        }
                        if (mockTestSubjectFilter !== 'ALL') {
                          const sSub = (sub.subject || '').toLowerCase();
                          const fSub = mockTestSubjectFilter.toLowerCase();
                          if (sSub !== fSub && !sSub.includes(fSub)) return false;
                        }
                        if (mockTestTypeFilter !== 'ALL' && sub.courseType && sub.courseType !== mockTestTypeFilter) return false;
                        if (mockTestEvaluationStatusFilter !== 'ALL' && sub.evaluationStatus !== mockTestEvaluationStatusFilter) return false;
                        if (!mockTestSearch.trim()) return true;
                        const q = mockTestSearch.toLowerCase();
                        return (
                          sub.studentName.toLowerCase().includes(q) ||
                          (sub.rollNumber || '').toLowerCase().includes(q) ||
                          (sub.subject || '').toLowerCase().includes(q) ||
                          (sub.mockTestTitle || sub.testTitle || '').toLowerCase().includes(q)
                        );
                      });

                      if (filteredSubmissions.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400">
                              <FileCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                              <p className="font-bold text-slate-700">No student answer sheets match the selected Course, Year/Semester & Subject filters.</p>
                              <p className="text-xs text-slate-400 mt-1">Try selecting "All Years / Semesters" or "All Subjects" to broaden your view.</p>
                            </td>
                          </tr>
                        );
                      }

                      return filteredSubmissions.map((sub) => {
                        const targetTest = mockTests.find((t) => t.id === sub.mockTestId || t.id === sub.testId);
                        const courseObj = courses.find((c) => c.slug === sub.courseSlug);
                        const fullMarks = targetTest?.fullMarks || 100;
                        const submissionYearOrSem = (sub as any).semesterOrYear || targetTest?.semesterOrYear;

                        return (
                          <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">{sub.studentName}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                  Roll: {sub.rollNumber}
                                </span>
                                {sub.studentPhone && (
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {sub.studentPhone}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                              </p>
                            </td>

                            <td className="py-3 px-4">
                              <p className="font-medium text-slate-700">
                                {courseObj?.title || sub.courseSlug}
                              </p>
                              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                <span
                                  className={`inline-block text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${
                                    sub.courseType === 'Old Course'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : 'bg-blue-100 text-blue-900 border border-blue-200'
                                  }`}
                                >
                                  {sub.courseType || 'New Course'}
                                </span>
                                {submissionYearOrSem && (
                                  <span className="inline-block text-[9px] font-bold px-2 py-0.2 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                                    {submissionYearOrSem}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-950 font-bold px-2.5 py-1 rounded-lg border border-amber-200/80">
                                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                                <span>{sub.subject || targetTest?.subject || 'Curriculum Subject'}</span>
                              </div>
                              {sub.mockTestTitle && (
                                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                                  {sub.mockTestTitle}
                                </p>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              {sub.answerFileUrl ? (
                                <div className="space-y-1">
                                  <a
                                    href={sub.answerFileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                                  >
                                    <Download className="w-3.5 h-3.5 text-rose-600" />
                                    <span>{sub.answerFileName || 'Student_Answer_Sheet.pdf'}</span>
                                  </a>
                                  {sub.evaluatedPaperUrl && (
                                    <div>
                                      <a
                                        href={sub.evaluatedPaperUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:underline"
                                      >
                                        <FileCheck className="w-3 h-3" />
                                        <span>Checked Paper Attached</span>
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Typed text only</span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${
                                  sub.evaluationStatus === 'Evaluated'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                                }`}
                              >
                                {sub.evaluationStatus === 'Evaluated'
                                  ? `Evaluated: ${sub.marksObtained}/${fullMarks}`
                                  : 'Pending Evaluation'}
                              </span>
                              {sub.feedbackRemarks && (
                                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 italic">
                                  "{sub.feedbackRemarks}"
                                </p>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setGradingSubmission(sub)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs ml-auto"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>{sub.evaluationStatus === 'Evaluated' ? 'Update Grade' : 'Grade & Feedback'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBVIEW 3: MOCK TEST ONLY REGISTRATIONS */}
          {mockTestSubView === 'registrations' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#12315A]">
                    Students Registered for Mock Tests Series Only
                  </h4>
                  <p className="text-xs text-slate-500">
                    Students interested only in mock examination batches, model papers, and official grading.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={async () => {
                      setIsRefreshingRegistrations(true);
                      await refreshMockRegistrations();
                      setIsRefreshingRegistrations(false);
                      setRegStudentToast('Mock test registrations refreshed from cloud storage.');
                      setTimeout(() => setRegStudentToast(null), 3000);
                    }}
                    disabled={isRefreshingRegistrations}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-900 bg-white hover:bg-blue-50 border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                    title="Pull recent registrations from cloud database"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingRegistrations ? 'animate-spin text-blue-700' : 'text-blue-600'}`} />
                    <span>{isRefreshingRegistrations ? 'Syncing...' : 'Sync / Refresh Cloud'}</span>
                  </button>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Total Registrations: {mockTestRegistrations.length}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-3 px-4">Pass Ref & Date</th>
                      <th className="py-3 px-4">Student Name & Contact</th>
                      <th className="py-3 px-4">Target Course & Shift</th>
                      <th className="py-3 px-4">Registered Subjects</th>
                      <th className="py-3 px-4">Mode</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mockTestRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No mock test registrations recorded yet.
                        </td>
                      </tr>
                    ) : (
                      mockTestRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono">
                            <span className="font-bold text-slate-900">{reg.referenceNumber}</span>
                            <p className="text-[10px] text-slate-400">
                              {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : 'Active'}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{reg.fullName}</p>
                            <p className="text-[11px] text-slate-500">{reg.phone}</p>
                            <p className="text-[10px] text-slate-400">{reg.email}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-blue-900">{reg.courseName}</span>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded">{reg.semesterOrYear}</span>
                              <span>•</span>
                              <span className="font-medium">{reg.shift}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {reg.enrolledSubjects && reg.enrolledSubjects.length > 0 ? (
                                reg.enrolledSubjects.map((s) => (
                                  <span
                                    key={s}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200"
                                  >
                                    {s}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">All Course Subjects</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {reg.preferredMode}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={reg.status}
                              onChange={(e) =>
                                updateMockTestRegistrationStatus(
                                  reg.id,
                                  e.target.value as MockTestRegistration['status']
                                )
                              }
                              className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                                reg.status === 'Confirmed'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : reg.status === 'Completed'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : reg.status === 'Cancelled'
                                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                                  : 'bg-amber-50 text-amber-900 border-amber-300'
                              }`}
                            >
                              <option value="Registered">Registered</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete mock test registration for ${reg.fullName} (${reg.referenceNumber})?`)) {
                                  deleteMockTestRegistration(reg.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Registration"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBVIEW 4: EXAM SHIFTS & TIMINGS MANAGEMENT */}
          {mockTestSubView === 'shifts' && (
            <div className="space-y-6">
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-[#12315A]">
                    Authorized Mock Exam Shifts & Timings
                  </h4>
                  <p className="text-xs text-slate-500">
                    Fix and schedule official start and end times, exam days, and reporting rules for candidates.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddShift}
                  className="px-4 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Exam Shift</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(settings.mockExamShifts || []).map((shift) => (
                  <div
                    key={shift.id}
                    className={`bg-white rounded-3xl border p-5 shadow-2xs space-y-4 transition-all ${
                      shift.isActive ? 'border-slate-200' : 'border-slate-100 opacity-60 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="font-extrabold text-sm text-[#12315A]">
                          {shift.shiftName}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              shift.isActive
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {shift.isActive ? 'Active for Enrollment' : 'Suspended / Paused'}
                          </span>
                          {shift.mode && (
                            <span className="text-[9px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {shift.mode}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleShiftStatus(shift.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                          shift.isActive
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {shift.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/50 border border-blue-100">
                        <span className="text-slate-500 text-[11px] font-medium">Exam Duration Hours:</span>
                        <span className="font-mono font-black text-blue-900">{shift.timeSlot}</span>
                      </div>

                      {shift.reportingTime && (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                          <span className="text-slate-500 text-[11px]">Reporting Time:</span>
                          <span className="font-semibold text-slate-800">{shift.reportingTime}</span>
                        </div>
                      )}

                      {shift.days && (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                          <span className="text-slate-500 text-[11px]">Active Days:</span>
                          <span className="font-semibold text-slate-800">{shift.days}</span>
                        </div>
                      )}

                      {shift.notes && (
                        <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                          "{shift.notes}"
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditShift(shift)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Hours</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteShift(shift.id, shift.shiftName)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Shift"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBMISSIONS & GRADING DRAWER / MODAL */}
      {selectedTestForSubmissions && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-[#12315A] text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                    {selectedTestForSubmissions.courseType}
                  </span>
                  <span className="text-xs text-blue-200">
                    {selectedTestForSubmissions.courseName}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold mt-1">
                  Student Submissions: {selectedTestForSubmissions.title}
                </h3>
                <p className="text-xs text-white/80">
                  Full Marks: {selectedTestForSubmissions.fullMarks} • Time Limit: {selectedTestForSubmissions.durationMinutes} Mins
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTestForSubmissions(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submissions List */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {(() => {
                const subs = mockTestSubmissions.filter(
                  (s) => (s.mockTestId || s.testId) === selectedTestForSubmissions.id
                );
                if (subs.length === 0) {
                  return (
                    <div className="p-10 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs space-y-2">
                      <FileCheck className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-700">No Student Answer Sheets Uploaded Yet</p>
                      <p>When students take this timed mock test and upload their answers, their papers will appear here for grading.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {subs.map((sub) => (
                      <div
                        key={sub.id}
                        className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3 hover:bg-white transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{sub.studentName}</span>
                              <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                Roll: {sub.rollNumber}
                              </span>
                              {sub.isLateSubmission && (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                                  Late Submission
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Phone: <span className="font-mono">{sub.studentPhone || 'N/A'}</span> • Submitted {new Date(sub.submittedAt).toLocaleString()}
                              {sub.timeTakenSeconds && ` • Time taken: ${Math.floor(sub.timeTakenSeconds / 60)}m ${sub.timeTakenSeconds % 60}s`}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                                sub.evaluationStatus === 'Evaluated'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}
                            >
                              {sub.evaluationStatus === 'Evaluated'
                                ? `Evaluated: ${sub.marksObtained}/${selectedTestForSubmissions.fullMarks}`
                                : 'Pending Evaluation'}
                            </span>

                            <button
                              type="button"
                              onClick={() => setGradingSubmission(sub)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>{sub.evaluationStatus === 'Evaluated' ? 'Update Grade' : 'Grade & Feedback'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Uploaded answer paper & typed text */}
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            {sub.answerFileUrl ? (
                              <a
                                href={sub.answerFileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-white border border-blue-300 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>View Student Answer Sheet ({sub.answerFileName || 'PDF'})</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 italic">No external file attached</span>
                            )}
                          </div>

                          {sub.evaluatedPaperUrl && (
                            <a
                              href={sub.evaluatedPaperUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition-colors flex items-center gap-1.5"
                            >
                              <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Checked Paper Attached</span>
                            </a>
                          )}
                        </div>

                        {sub.typedAnswers && (
                          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-line leading-relaxed max-h-32 overflow-y-auto">
                            {sub.typedAnswers}
                          </div>
                        )}

                        {/* Existing examiner feedback if evaluated */}
                        {sub.feedbackRemarks && (
                          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs space-y-1">
                            <p className="font-bold text-amber-950 flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-amber-600" />
                              <span>Examiner Remarks ({sub.evaluatedBy || 'Examiner'}):</span>
                            </p>
                            <p className="text-slate-800 whitespace-pre-line">{sub.feedbackRemarks}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* GRADING & EXAMINER FEEDBACK MODAL */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative space-y-4">
            <button
              type="button"
              onClick={() => setGradingSubmission(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-base font-bold text-[#12315A]">Evaluate Student Answer Sheet</h3>
                <p className="text-xs text-slate-500">
                  Student: <strong>{gradingSubmission.studentName}</strong> (Roll: {gradingSubmission.rollNumber})
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const marksObtained = Number(formData.get('marksObtained') || 0);
                const feedbackRemarks = String(formData.get('feedbackRemarks') || '');
                const evaluatedBy = String(formData.get('evaluatedBy') || '');
                const evaluatedPaperUrl = String(formData.get('evaluatedPaperUrl') || '');

                gradeMockTestSubmission(gradingSubmission.id, {
                  marksObtained,
                  evaluationStatus: 'Evaluated',
                  feedbackRemarks,
                  evaluatedBy,
                  evaluatedPaperUrl: evaluatedPaperUrl || undefined,
                  evaluatedPaperName: evaluatedPaperUrl ? 'Checked_Answer_Sheet.pdf' : undefined,
                });

                setGradingSubmission(null);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  {(() => {
                    const targetTest = mockTests.find(
                      (t) => t.id === gradingSubmission.mockTestId || t.id === gradingSubmission.testId
                    );
                    const targetFullMarks = targetTest?.fullMarks || selectedTestForSubmissions?.fullMarks || 100;
                    return (
                      <>
                        <label className="block font-bold text-slate-700 mb-1">
                          Marks Obtained (Full: {targetFullMarks}) *
                        </label>
                        <input
                          type="number"
                          name="marksObtained"
                          required
                          min={0}
                          max={targetFullMarks}
                          defaultValue={gradingSubmission.marksObtained ?? 75}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white"
                        />
                      </>
                    );
                  })()}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Examiner Name / Faculty *</label>
                  <input
                    type="text"
                    name="evaluatedBy"
                    required
                    defaultValue={gradingSubmission.evaluatedBy || 'Prof. Dr. Narayan Prasad Sharma, Head of Dept.'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Examiner Constructive Feedback & Critique (Visible to this student ONLY) *
                </label>
                <textarea
                  name="feedbackRemarks"
                  required
                  rows={4}
                  defaultValue={
                    gradingSubmission.feedbackRemarks ||
                    `Commendable conceptual clarity in theoretical questions. In numerical questions, review calculation steps carefully. Structure conclusions and point-wise presentation to maximize scores in the upcoming board exam.`
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 font-sans"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Private feedback: Only this student will be able to view these evaluation remarks upon entering their roll number.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Checked Answer Sheet PDF Link (Optional)
                </label>
                <input
                  type="url"
                  name="evaluatedPaperUrl"
                  placeholder="https://example.com/checked-papers/sample_checked.pdf"
                  defaultValue={gradingSubmission.evaluatedPaperUrl || ''}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 shadow-sm cursor-pointer"
                >
                  Publish Result & Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIRECT RESULT UPLOAD MODAL */}
      {isDirectResultModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative space-y-4">
            <button
              type="button"
              onClick={() => setIsDirectResultModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-base font-bold text-[#12315A]">Directly Publish Student Result</h3>
                <p className="text-xs text-slate-500">
                  Assign marks and examiner remarks directly for an enrolled student by roll number.
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const testId = (form.elements.namedItem('testId') as HTMLSelectElement).value;
                const studentName = (form.elements.namedItem('studentName') as HTMLInputElement).value;
                const rollNumber = (form.elements.namedItem('rollNumber') as HTMLInputElement).value;
                const studentPhone = (form.elements.namedItem('studentPhone') as HTMLInputElement).value;
                const marksObtained = Number((form.elements.namedItem('marksObtained') as HTMLInputElement).value);
                const evaluatedBy = (form.elements.namedItem('evaluatedBy') as HTMLInputElement).value;
                const feedbackRemarks = (form.elements.namedItem('feedbackRemarks') as HTMLTextAreaElement).value;
                const evaluatedPaperUrl = (form.elements.namedItem('evaluatedPaperUrl') as HTMLInputElement).value;

                uploadMockTestResult({
                  mockTestId: testId,
                  studentId: rollNumber,
                  studentName,
                  rollNumber,
                  studentPhone,
                  marksObtained,
                  evaluatedBy,
                  feedbackRemarks,
                  evaluatedPaperUrl: evaluatedPaperUrl || undefined,
                });

                setIsDirectResultModalOpen(false);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Mock Test *</label>
                <select
                  name="testId"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  {mockTests.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.courseType} • {t.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    name="studentName"
                    required
                    placeholder="e.g. Ramesh Kumar Adhikari"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Roll Number / Student ID *</label>
                  <input
                    type="text"
                    name="rollNumber"
                    required
                    placeholder="e.g. SSS-STU-2026-08"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Contact Phone *</label>
                  <input
                    type="text"
                    name="studentPhone"
                    required
                    placeholder="e.g. 9841234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marks Obtained *</label>
                  <input
                    type="number"
                    name="marksObtained"
                    required
                    min={0}
                    max={100}
                    defaultValue={78}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Evaluator / Examiner Name *</label>
                <input
                  type="text"
                  name="evaluatedBy"
                  required
                  defaultValue="Prof. Dr. Narayan Prasad Sharma, Head of Department"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Examiner Feedback Remarks *</label>
                <textarea
                  name="feedbackRemarks"
                  required
                  rows={3}
                  defaultValue="Excellent comprehension of the curriculum. Detailed presentation and neat working in numerical questions. Recommended to maintain this time management speed during the upcoming board examination."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-sans"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Checked Paper Link (Optional)</label>
                <input
                  type="url"
                  name="evaluatedPaperUrl"
                  placeholder="https://example.com/checked-papers/sample.pdf"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDirectResultModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow cursor-pointer"
                >
                  Publish Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MOCK TEST MODAL */}
      {isMockTestModalOpen && (
        <MockTestEditModal
          mockTest={editingMockTest}
          courses={courses}
          onClose={() => setIsMockTestModalOpen(false)}
          onSave={(data) => {
            if (editingMockTest) {
              updateMockTest(editingMockTest.id, data);
            } else {
              addMockTest({
                ...(data as any),
                published: true,
              });
            }
            setIsMockTestModalOpen(false);
          }}
        />
      )}

      {/* CREATE / EDIT MOCK EXAM SHIFT MODAL */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto space-y-5 text-xs sm:text-sm">
            <button
              onClick={() => setIsShiftModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-[#12315A]">
                  {editingShift ? 'Edit Mock Exam Shift & Timing' : 'Add New Authorized Exam Shift'}
                </h3>
                <p className="text-xs text-slate-400">
                  Configure fixed examination hours that candidates choose upon registration.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveShift} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Shift Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Exam Shift, Evening Shift, Saturday Special"
                  value={shiftNameInput}
                  onChange={(e) => setShiftNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Exact Time Slot *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 06:30 AM – 09:30 AM"
                    value={shiftTimeSlotInput}
                    onChange={(e) => setShiftTimeSlotInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Fixed exam commencement to conclusion</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Reporting Time (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 06:15 AM (15 mins prior)"
                    value={shiftReportingTimeInput}
                    onChange={(e) => setShiftReportingTimeInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Scheduled Days
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sunday – Friday or Every Saturday"
                    value={shiftDaysInput}
                    onChange={(e) => setShiftDaysInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Exam Delivery Mode
                  </label>
                  <select
                    value={shiftModeInput}
                    onChange={(e) => setShiftModeInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Online & Campus Exam Hall">Online & Campus Exam Hall</option>
                    <option value="Online (PDF Scanned Upload)">Online (PDF Scanned Upload)</option>
                    <option value="Physical Campus Exam Hall Only">Physical Campus Exam Hall Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Administrative Instructions / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Strict attendance required 15 minutes before model question paper rollout."
                  value={shiftNotesInput}
                  onChange={(e) => setShiftNotesInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="shiftActiveCheck"
                  checked={shiftIsActiveInput}
                  onChange={(e) => setShiftIsActiveInput(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="shiftActiveCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Active & Available for Candidate Selection on Website
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsShiftModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-[#12315A] hover:bg-blue-900 shadow cursor-pointer"
                >
                  {editingShift ? 'Save Changes' : 'Authorize & Add Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Course Modal Subcomponent
const CourseEditModal: React.FC<{
  course: Course | null;
  onClose: () => void;
  onSave: (data: Partial<Course>) => void;
}> = ({ course, onClose, onSave }) => {
  const [title, setTitle] = useState(course?.title || '');
  const [board, setBoard] = useState(course?.board || 'Tribhuvan University (TU)');
  const [category, setCategory] = useState(course?.category || 'bachelor');
  const [courseType, setCourseType] = useState<CourseType>(course?.courseType || 'New Course');
  const [syllabusVersion, setSyllabusVersion] = useState(
    course?.syllabusVersion ||
      (course?.courseType === 'Old Course'
        ? 'Old Annual Syllabus (Backpaper Exam Prep)'
        : 'New CBCS / Semester Syllabus')
  );
  const [duration, setDuration] = useState(course?.duration || '');
  const [schedule, setSchedule] = useState(course?.schedule || '');
  const [shortDesc, setShortDesc] = useState(course?.shortDescription || '');
  const [feeInfo, setFeeInfo] = useState(course?.feeInfo || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto space-y-4 text-xs sm:text-sm">
        <button onClick={onClose} className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-[#12315A]">
          {course ? 'Edit Course Details' : 'Create New Academic Course'}
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Course Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          {/* Course Type / Syllabus Structure Selector */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="block font-bold text-slate-800 text-xs">
              Course Syllabus Classification (New vs. Old Course)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCourseType('New Course');
                  if (!syllabusVersion || syllabusVersion.includes('Old Annual')) {
                    setSyllabusVersion('New CBCS / Regular Semester Syllabus');
                  }
                }}
                className={`py-2 px-3 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                  courseType === 'New Course'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                New Course (Regular)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCourseType('Old Course');
                  if (!syllabusVersion || syllabusVersion.includes('New CBCS')) {
                    setSyllabusVersion('Old Annual Syllabus (Backpaper Exam Prep)');
                  }
                }}
                className={`py-2 px-3 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                  courseType === 'Old Course'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Old Course (Backpaper Prep)
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 text-[11px] mb-0.5">
                Syllabus Version Note / Exam Scheme
              </label>
              <input
                type="text"
                value={syllabusVersion}
                placeholder="e.g. Tribhuvan University Revised Syllabus 2080 / Old Annual System"
                onChange={(e) => setSyllabusVersion(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Board / University</label>
              <input
                type="text"
                value={board}
                onChange={(e) => setBoard(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Schedule</label>
            <input
              type="text"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Short Description</label>
            <textarea
              rows={3}
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Fee & Batch Information</label>
            <input
              type="text"
              value={feeInfo}
              onChange={(e) => setFeeInfo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl font-bold text-slate-600 bg-slate-100">
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                title,
                board: board as any,
                category: category as any,
                courseType,
                syllabusVersion,
                duration,
                schedule,
                shortDescription: shortDesc,
                feeInfo,
              })
            }
            className="px-5 py-2 rounded-xl font-bold text-white bg-[#12315A]"
          >
            Save Course
          </button>
        </div>
      </div>
    </div>
  );
};

// Teacher Modal Subcomponent
const TeacherEditModal: React.FC<{
  teacher: Teacher | null;
  onClose: () => void;
  onSave: (data: Partial<Teacher>) => void;
}> = ({ teacher, onClose, onSave }) => {
  const [name, setName] = useState(teacher?.name || '');
  const [designation, setDesignation] = useState(teacher?.designation || '');
  const [qualification, setQualification] = useState(teacher?.qualification || '');
  const [experience, setExperience] = useState(teacher?.experience || '');
  const [bio, setBio] = useState(teacher?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(
    teacher?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto space-y-4 text-xs sm:text-sm">
        <button onClick={onClose} className="absolute top-5 right-5 p-1 text-slate-400">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-[#12315A]">
          {teacher ? 'Edit Faculty Member' : 'Add New Faculty Member'}
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Designation</label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Qualification</label>
            <input
              type="text"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Experience</label>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          {/* Photo upload from computer hard drive */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <label className="block font-bold text-slate-800 text-xs">
              Faculty Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <img
                src={avatarUrl}
                alt={name || 'Faculty'}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md bg-white shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <div className="space-y-1.5 flex-1 min-w-0">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#12315A] hover:bg-blue-900 cursor-pointer shadow-xs transition-colors">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Choose Photo from Hard Drive</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (reader.result) {
                            setAvatarUrl(reader.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                <p className="text-[11px] text-slate-500">
                  Select a JPG, PNG, or WebP picture directly from your computer files.
                </p>
              </div>
            </div>

            <div className="pt-1.5">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Or Photo Image URL / Web Link
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Biography</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl font-bold text-slate-600 bg-slate-100">
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                name,
                designation,
                qualification,
                experience,
                bio,
                avatarUrl,
                specialization: ['Academic Subject Expert'],
                assignedCourseSlugs: ['mbs-tu'],
                published: true,
              })
            }
            className="px-5 py-2 rounded-xl font-bold text-white bg-[#12315A]"
          >
            Save Faculty
          </button>
        </div>
      </div>
    </div>
  );
};

// Notice Modal Subcomponent
const NoticeEditModal: React.FC<{
  notice: Notice | null;
  onClose: () => void;
  onSave: (data: Partial<Notice>) => void;
}> = ({ notice, onClose, onSave }) => {
  const [title, setTitle] = useState(notice?.title || '');
  const [category, setCategory] = useState(notice?.category || 'Admission');
  const [content, setContent] = useState(notice?.content || '');
  const [important, setImportant] = useState(notice?.important || false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto space-y-4 text-xs sm:text-sm">
        <button onClick={onClose} className="absolute top-5 right-5 p-1 text-slate-400">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-[#12315A]">
          {notice ? 'Edit Notice' : 'Publish New Notice'}
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Notice Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="Admission">Admission</option>
              <option value="New Courses">New Courses</option>
              <option value="Class Schedules">Class Schedules</option>
              <option value="Exam Prep">Exam Prep</option>
              <option value="Holidays">Holidays</option>
              <option value="Academic Events">Academic Events</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notice Full Content</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={important}
              onChange={(e) => setImportant(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="font-semibold text-slate-700">Mark as High Priority / Urgent Notice</span>
          </label>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl font-bold text-slate-600 bg-slate-100">
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                title,
                category: category as any,
                content,
                important,
                publishDate: new Date().toISOString().slice(0, 10),
                published: true,
              })
            }
            className="px-5 py-2 rounded-xl font-bold text-white bg-[#12315A]"
          >
            Publish Notice
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COURSE DROPDOWN & FILE UPLOAD HELPERS
// ==========================================
export const getAvailableSemestersForCourse = (course?: Course): string[] => {
  if (!course) return [];
  const set = new Set<string>();

  course.subjectsOffered?.forEach((s) => {
    if (s.semesterOrYear && s.semesterOrYear.trim()) {
      set.add(s.semesterOrYear.trim());
    }
  });

  const slug = course.slug.toLowerCase();
  if (slug.startsWith('bbs')) {
    ['1st Year', '2nd Year', '3rd Year', '4th Year'].forEach((t) => set.add(t));
  } else if (slug.startsWith('mbs')) {
    ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester'].forEach((t) => set.add(t));
  } else if (slug.startsWith('bba') || slug.startsWith('bbm')) {
    [
      '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
      '5th Semester', '6th Semester', '7th Semester', '8th Semester'
    ].forEach((t) => set.add(t));
  } else if (slug.startsWith('plus-two')) {
    ['Grade 11', 'Grade 12'].forEach((t) => set.add(t));
  } else if (slug.startsWith('loksewa') || slug.includes('tsc')) {
    [
      '1st Paper (Objective - 100 Marks)',
      '2nd Paper (Subjective - 100 Marks)',
      '3rd Paper',
      '4th Paper'
    ].forEach((t) => set.add(t));
  }

  return Array.from(set);
};

export const getAvailableSubjectsForCourse = (course?: Course, semesterOrYear?: string): string[] => {
  if (!course || !course.subjectsOffered) return [];
  if (!semesterOrYear || semesterOrYear === 'ALL') {
    return Array.from(new Set(course.subjectsOffered.map((s) => s.name.trim()))).filter(Boolean);
  }

  const sNorm = semesterOrYear.toLowerCase().trim();
  const matched = course.subjectsOffered
    .filter((s) => {
      if (!s.semesterOrYear) return true;
      const termNorm = s.semesterOrYear.toLowerCase().trim();
      return termNorm === sNorm || termNorm.includes(sNorm) || sNorm.includes(termNorm);
    })
    .map((s) => s.name.trim());

  if (matched.length > 0) {
    return Array.from(new Set(matched));
  }
  return Array.from(new Set(course.subjectsOffered.map((s) => s.name.trim()))).filter(Boolean);
};

// ==========================================
// FILE UPLOAD COMPONENT FOR PDF, WORD & IMAGE
// ==========================================
interface UniversalFileUploaderProps {
  label: string;
  acceptTypesLabel?: string;
  currentUrl?: string;
  currentFileName?: string;
  currentFileSize?: string;
  onFileSelect: (fileData: {
    dataUrl: string;
    fileName: string;
    fileSize: string;
    fileType: 'pdf' | 'word' | 'image' | 'other';
  }) => void;
  onClear: () => void;
  onManualUrlChange?: (url: string) => void;
}

const UniversalFileUploader: React.FC<UniversalFileUploaderProps> = ({
  label,
  acceptTypesLabel = 'PDF (.pdf), Word Document (.doc, .docx), or Image (.jpg, .png, .webp)',
  currentUrl,
  currentFileName,
  currentFileSize,
  onFileSelect,
  onClear,
  onManualUrlChange,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState(currentUrl && !currentUrl.startsWith('data:') ? currentUrl : '');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const isImage =
    (currentFileName && /\.(png|jpe?g|webp|gif|svg)$/i.test(currentFileName)) ||
    (currentUrl && currentUrl.startsWith('data:image/'));

  const isWord =
    (currentFileName && /\.(docx?|rtf)$/i.test(currentFileName)) ||
    (currentUrl && currentUrl.includes('wordprocessingml'));

  const isPdf =
    (currentFileName && /\.pdf$/i.test(currentFileName)) ||
    (currentUrl && currentUrl.startsWith('data:application/pdf'));

  const handleProcessFile = (file: File) => {
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    let fileType: 'pdf' | 'word' | 'image' | 'other' = 'other';
    const nameLower = file.name.toLowerCase();
    if (file.type === 'application/pdf' || nameLower.endsWith('.pdf')) {
      fileType = 'pdf';
    } else if (
      file.type.includes('word') ||
      nameLower.endsWith('.docx') ||
      nameLower.endsWith('.doc')
    ) {
      fileType = 'word';
    } else if (file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(nameLower)) {
      fileType = 'image';
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onFileSelect({
        dataUrl: result,
        fileName: file.name,
        fileSize: formattedSize,
        fileType,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block font-bold text-slate-700 text-xs flex items-center gap-1.5">
          <Upload className="w-4 h-4 text-blue-600" />
          <span>{label} *</span>
        </label>
        <button
          type="button"
          onClick={() => setShowManualUrl(!showManualUrl)}
          className="text-[11px] font-semibold text-blue-700 hover:underline cursor-pointer"
        >
          {showManualUrl ? 'Switch to File Upload' : 'Or enter external link / URL'}
        </button>
      </div>

      {showManualUrl ? (
        <div className="space-y-1.5">
          <input
            type="url"
            placeholder="https://example.com/question-paper.pdf or Google Drive link"
            value={manualUrlInput}
            onChange={(e) => {
              setManualUrlInput(e.target.value);
              if (onManualUrlChange) onManualUrlChange(e.target.value);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-[11px] text-slate-400">
            Paste a public Google Drive, Dropbox, or web URL if the file is already hosted online.
          </p>
        </div>
      ) : currentUrl || currentFileName ? (
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {isImage ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                <img
                  src={currentUrl}
                  alt={currentFileName || 'Uploaded image'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : isWord ? (
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-xs border border-blue-200">
                DOCX
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 font-bold text-xs border border-rose-200">
                PDF
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isImage
                      ? 'bg-purple-100 text-purple-800'
                      : isWord
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isImage ? 'Image' : isWord ? 'Word Document' : 'PDF Document'}
                </span>
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Ready
                </span>
              </div>
              <p className="font-bold text-slate-900 text-xs truncate max-w-xs sm:max-w-md mt-0.5">
                {currentFileName || 'Uploaded_Document'}
              </p>
              {currentFileSize && (
                <p className="text-[11px] text-slate-400 font-mono">{currentFileSize}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
              title="Remove file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleProcessFile(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30'
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800">
                Click to browse or drag & drop file
              </p>
              <p className="text-[11px] text-slate-500">
                {acceptTypesLabel}
              </p>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleProcessFile(file);
          e.target.value = '';
        }}
        className="hidden"
      />
    </div>
  );
};

// ==========================================
// 1. MATERIAL EDIT / UPLOAD MODAL
// ==========================================
const MaterialEditModal: React.FC<{
  material: StudyMaterial | null;
  courses: Course[];
  onClose: () => void;
  onSave: (data: Partial<StudyMaterial>) => void;
}> = ({ material, courses, onClose, onSave }) => {
  const [title, setTitle] = useState(material?.title || '');
  const [courseSlug, setCourseSlug] = useState(material?.courseSlug || courses[0]?.slug || '');

  const selectedCourse = useMemo(
    () => courses.find((c) => c.slug === courseSlug) || courses[0],
    [courses, courseSlug]
  );

  // Available semesters for the chosen course
  const availableSemesters = useMemo(
    () => getAvailableSemestersForCourse(selectedCourse),
    [selectedCourse]
  );

  const [selectedSemester, setSelectedSemester] = useState<string>(() => {
    if (material?.semesterOrYear) {
      return availableSemesters.includes(material.semesterOrYear)
        ? material.semesterOrYear
        : '__custom__';
    }
    return availableSemesters[0] || '1st Year';
  });
  const [customSemester, setCustomSemester] = useState<string>(
    material?.semesterOrYear && !availableSemesters.includes(material.semesterOrYear)
      ? material.semesterOrYear
      : ''
  );

  // Effective semester
  const effectiveSemester =
    selectedSemester === '__custom__' ? customSemester : selectedSemester;

  // Available subjects for the chosen course + semester
  const availableSubjects = useMemo(
    () => getAvailableSubjectsForCourse(selectedCourse, effectiveSemester),
    [selectedCourse, effectiveSemester]
  );

  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    if (material?.subject) {
      return availableSubjects.includes(material.subject)
        ? material.subject
        : '__custom__';
    }
    return availableSubjects[0] || '';
  });
  const [customSubject, setCustomSubject] = useState<string>(
    material?.subject && !availableSubjects.includes(material.subject)
      ? material.subject
      : ''
  );

  const effectiveSubject =
    selectedSubject === '__custom__' ? customSubject : selectedSubject;

  // When course changes, auto-select first semester & subject
  const handleCourseChange = (newSlug: string) => {
    setCourseSlug(newSlug);
    const newCourse = courses.find((c) => c.slug === newSlug);
    const newSems = getAvailableSemestersForCourse(newCourse);
    const defaultSem = newSems[0] || '1st Year';
    setSelectedSemester(defaultSem);
    setCustomSemester('');

    const newSubs = getAvailableSubjectsForCourse(newCourse, defaultSem);
    setSelectedSubject(newSubs[0] || '');
    setCustomSubject('');
  };

  // When semester changes, refresh subject selection
  const handleSemesterChange = (newSem: string) => {
    setSelectedSemester(newSem);
    if (newSem !== '__custom__') {
      const newSubs = getAvailableSubjectsForCourse(selectedCourse, newSem);
      if (newSubs.length > 0 && !newSubs.includes(selectedSubject)) {
        setSelectedSubject(newSubs[0]);
      }
    }
  };

  // File Upload State
  const [fileDataUrl, setFileDataUrl] = useState<string>(material?.downloadUrl || '');
  const [uploadedFileName, setUploadedFileName] = useState<string>(
    material?.fileName || material?.attachmentName || (material?.downloadUrl ? 'Study_Material.pdf' : '')
  );
  const [uploadedFileSize, setUploadedFileSize] = useState<string>(material?.fileSize || '');
  const [resourceType, setResourceType] = useState<string>(material?.resourceType || 'PDF Notes');
  const [accessLevel, setAccessLevel] = useState<string>(material?.accessLevel || 'Public');
  const [description, setDescription] = useState(material?.description || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto space-y-4 text-xs sm:text-sm">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-lg font-bold text-[#12315A] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>{material ? 'Edit Study Material' : 'Add Study Material / Question Paper'}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select program, semester, and subject from dropdowns and upload PDF, Word, or image solutions.
          </p>
        </div>

        {/* File Upload Zone */}
        <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200">
          <UniversalFileUploader
            label="Upload Resource File (PDF, Word, or Image)"
            acceptTypesLabel="Supports PDF (.pdf), Word (.doc, .docx), and Image (.jpg, .png, .webp)"
            currentUrl={fileDataUrl}
            currentFileName={uploadedFileName}
            currentFileSize={uploadedFileSize}
            onFileSelect={({ dataUrl, fileName, fileSize, fileType }) => {
              setFileDataUrl(dataUrl);
              setUploadedFileName(fileName);
              setUploadedFileSize(fileSize);

              // Auto-fill document title if empty
              if (!title) {
                const cleanName = fileName
                  .replace(/\.[^/.]+$/, '')
                  .replace(/[-_]/g, ' ')
                  .trim();
                setTitle(cleanName);
              }

              // Auto-adjust resource type based on file extension
              if (fileType === 'word') {
                setResourceType('Word Document / Notes');
              } else if (fileType === 'image') {
                setResourceType('Image / Handwritten Solutions');
              } else if (fileType === 'pdf') {
                setResourceType('PDF Notes');
              }
            }}
            onClear={() => {
              setFileDataUrl('');
              setUploadedFileName('');
              setUploadedFileSize('');
            }}
            onManualUrlChange={(url) => {
              setFileDataUrl(url);
              if (url && !uploadedFileName) {
                setUploadedFileName('Online_Resource.pdf');
              }
            }}
          />
        </div>

        <div className="space-y-3.5">
          {/* Document Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Document Title *
            </label>
            <input
              type="text"
              required
              value={title}
              placeholder="e.g. BBS 4th Year Corporate Finance Chapter 4 Model Numerical Solutions"
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Target Course & Semester Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Target Course *
              </label>
              <select
                value={courseSlug}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {courses.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.title} ({c.board})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Semester or Year (Select from List) *
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => handleSemesterChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableSemesters.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
                <option value="__custom__">+ Enter Custom Semester / Year...</option>
              </select>

              {selectedSemester === '__custom__' && (
                <input
                  type="text"
                  placeholder="e.g. 5th Semester / Year 3"
                  value={customSemester}
                  onChange={(e) => setCustomSemester(e.target.value)}
                  className="w-full mt-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                />
              )}
            </div>
          </div>

          {/* Subject Dropdown & Access Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Subject (Select from Course List) *
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
                <option value="__custom__">+ Enter Custom Subject...</option>
              </select>

              {selectedSubject === '__custom__' && (
                <input
                  type="text"
                  placeholder="e.g. Advanced Financial Management"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full mt-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                />
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Access Level *</label>
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Public">Public (Free Download for All)</option>
                <option value="Enrolled Students">Enrolled Students Only (Locked)</option>
              </select>
            </div>
          </div>

          {/* Resource Type */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Resource Classification *</label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PDF Notes">PDF Notes</option>
              <option value="Word Document / Notes">Word Document / Notes (.docx)</option>
              <option value="Image / Handwritten Solutions">Image / Handwritten Solutions (.jpg/.png)</option>
              <option value="Model Question Papers">Model Question Papers</option>
              <option value="Past Papers">Past TU Board Examination Papers</option>
              <option value="Practice Questions">Practice Questions & Assignments</option>
              <option value="Lecture Slides">Lecture Slides & Formulas</option>
              <option value="Revision Materials">Revision Materials</option>
              <option value="Recorded Videos">Recorded Videos</option>
            </select>
          </div>

          {/* Short Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Short Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Comprehensive chapter breakdown with step-by-step TU board examination numerical solutions."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (!title.trim()) {
                alert('Please enter a Document Title.');
                return;
              }
              if (!effectiveSubject.trim()) {
                alert('Please select or specify a Subject.');
                return;
              }

              onSave({
                title: title.trim(),
                courseSlug,
                courseName: selectedCourse?.title || 'Academic Course',
                board: selectedCourse?.board || 'Board',
                subject: effectiveSubject.trim(),
                semesterOrYear: effectiveSemester.trim(),
                resourceType: resourceType as any,
                accessLevel: accessLevel as any,
                downloadUrl: fileDataUrl || material?.downloadUrl,
                fileName: uploadedFileName || material?.fileName || 'Resource_Document.pdf',
                attachmentName: uploadedFileName || material?.attachmentName || 'Resource_Document.pdf',
                fileSize: uploadedFileSize || material?.fileSize || '2.4 MB',
                uploadDate: new Date().toISOString().slice(0, 10),
                description: description.trim(),
                published: true,
              });
            }}
            className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#12315A] hover:bg-blue-900 shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Save Resource</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. MOCK TEST EDIT / UPLOAD MODAL
// ==========================================
const MockTestEditModal: React.FC<{
  mockTest: MockTest | null;
  courses: Course[];
  onClose: () => void;
  onSave: (data: Partial<MockTest>) => void;
}> = ({ mockTest, courses, onClose, onSave }) => {
  const [title, setTitle] = useState(mockTest?.title || '');
  const [courseSlug, setCourseSlug] = useState(mockTest?.courseSlug || courses[0]?.slug || '');
  const [courseType, setCourseType] = useState<CourseType>(mockTest?.courseType || 'New Course');

  const selectedCourse = useMemo(
    () => courses.find((c) => c.slug === courseSlug) || courses[0],
    [courses, courseSlug]
  );

  // Available semesters for the chosen course
  const availableSemesters = useMemo(
    () => getAvailableSemestersForCourse(selectedCourse),
    [selectedCourse]
  );

  const [selectedSemester, setSelectedSemester] = useState<string>(() => {
    if (mockTest?.semesterOrYear) {
      return availableSemesters.includes(mockTest.semesterOrYear)
        ? mockTest.semesterOrYear
        : '__custom__';
    }
    return availableSemesters[0] || '1st Year';
  });
  const [customSemester, setCustomSemester] = useState<string>(
    mockTest?.semesterOrYear && !availableSemesters.includes(mockTest.semesterOrYear)
      ? mockTest.semesterOrYear
      : ''
  );

  const effectiveSemester =
    selectedSemester === '__custom__' ? customSemester : selectedSemester;

  // Available subjects for the chosen course + semester
  const availableSubjects = useMemo(
    () => getAvailableSubjectsForCourse(selectedCourse, effectiveSemester),
    [selectedCourse, effectiveSemester]
  );

  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    if (mockTest?.subject) {
      return availableSubjects.includes(mockTest.subject)
        ? mockTest.subject
        : '__custom__';
    }
    return availableSubjects[0] || '';
  });
  const [customSubject, setCustomSubject] = useState<string>(
    mockTest?.subject && !availableSubjects.includes(mockTest.subject)
      ? mockTest.subject
      : ''
  );

  const effectiveSubject =
    selectedSubject === '__custom__' ? customSubject : selectedSubject;

  // Handlers for dynamic dropdown cascade
  const handleCourseChange = (newSlug: string) => {
    setCourseSlug(newSlug);
    const newCourse = courses.find((c) => c.slug === newSlug);
    const newSems = getAvailableSemestersForCourse(newCourse);
    const defaultSem = newSems[0] || '1st Year';
    setSelectedSemester(defaultSem);
    setCustomSemester('');

    const newSubs = getAvailableSubjectsForCourse(newCourse, defaultSem);
    setSelectedSubject(newSubs[0] || '');
    setCustomSubject('');
  };

  const handleSemesterChange = (newSem: string) => {
    setSelectedSemester(newSem);
    if (newSem !== '__custom__') {
      const newSubs = getAvailableSubjectsForCourse(selectedCourse, newSem);
      if (newSubs.length > 0 && !newSubs.includes(selectedSubject)) {
        setSelectedSubject(newSubs[0]);
      }
    }
  };

  // Exam details
  const [durationMinutes, setDurationMinutes] = useState<number>(mockTest?.durationMinutes || 180);
  const [fullMarks, setFullMarks] = useState<number>(mockTest?.fullMarks || 100);
  const [passMarks, setPassMarks] = useState<number>(mockTest?.passMarks || 40);
  const [instructions, setInstructions] = useState<string>(
    Array.isArray(mockTest?.instructions)
      ? mockTest.instructions.join('\n')
      : mockTest?.instructions ||
          'Candidates are required to give answers in their own words as far as practicable. Figures in the margin indicate full marks. Upload your scanned handwritten answers before the countdown expires.'
  );
  const [questionText, setQuestionText] = useState<string>(
    mockTest?.questionText ||
      `Group A: Brief Answer Questions (Attempt ALL - 10 x 2 = 20 Marks)\n1. Define Capital Structure and Financial Leverage.\n2. State the primary objective of Financial Management.\n\nGroup B: Descriptive Answer Questions (Attempt Any FIVE - 5 x 10 = 50 Marks)\n3. Explain the Determinants of Dividend Policy in Nepali commercial banks.\n4. Numerical: Calculate Net Present Value (NPV) and Internal Rate of Return (IRR) for Project Alpha and Beta.\n\nGroup C: Comprehensive Analysis Question (Attempt Any ONE - 1 x 30 = 30 Marks)\n5. Detailed Case on Working Capital Management Strategy.`
  );

  // File Upload State
  const [fileDataUrl, setFileDataUrl] = useState<string>(mockTest?.questionPaperUrl || '');
  const [uploadedFileName, setUploadedFileName] = useState<string>(
    mockTest?.questionFileName || mockTest?.questionPaperName || (mockTest?.questionPaperUrl ? 'Official_Question_Paper.pdf' : '')
  );
  const [uploadedFileSize, setUploadedFileSize] = useState<string>(mockTest?.questionPaperSize || '');
  const [uploadedFileType, setUploadedFileType] = useState<string>(mockTest?.questionFileType || 'pdf');

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto space-y-4 text-xs sm:text-sm">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-lg font-bold text-[#12315A] flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>{mockTest ? 'Edit Mock Test Examination' : 'Upload Questions / Create Mock Test'}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select course and subject from dropdowns, and upload official question papers in PDF, Word, or image format.
          </p>
        </div>

        {/* File Upload Zone */}
        <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200">
          <UniversalFileUploader
            label="Question Paper File (PDF, Word, or Image)"
            acceptTypesLabel="Upload official question paper in PDF (.pdf), Word (.doc/.docx), or Image (.jpg/.png)"
            currentUrl={fileDataUrl}
            currentFileName={uploadedFileName}
            currentFileSize={uploadedFileSize}
            onFileSelect={({ dataUrl, fileName, fileSize, fileType }) => {
              setFileDataUrl(dataUrl);
              setUploadedFileName(fileName);
              setUploadedFileSize(fileSize);
              setUploadedFileType(fileType);

              if (!title) {
                const cleanName = fileName
                  .replace(/\.[^/.]+$/, '')
                  .replace(/[-_]/g, ' ')
                  .trim();
                setTitle(`${cleanName} Pre-Board Exam`);
              }
            }}
            onClear={() => {
              setFileDataUrl('');
              setUploadedFileName('');
              setUploadedFileSize('');
              setUploadedFileType('');
            }}
            onManualUrlChange={(url) => {
              setFileDataUrl(url);
              if (url && !uploadedFileName) {
                setUploadedFileName('Official_Question_Paper.pdf');
              }
            }}
          />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) {
              alert('Please enter a Mock Test Examination Title.');
              return;
            }
            if (!effectiveSubject.trim()) {
              alert('Please select or specify a Subject.');
              return;
            }

            onSave({
              title: title.trim(),
              courseSlug,
              courseName: selectedCourse?.title || 'Academic Course',
              courseType,
              semesterOrYear: effectiveSemester.trim() || undefined,
              subject: effectiveSubject.trim(),
              durationMinutes,
              fullMarks,
              passMarks,
              questionPaperUrl: fileDataUrl || undefined,
              questionFileName: uploadedFileName || (fileDataUrl ? 'Official_Question_Paper.pdf' : undefined),
              questionPaperName: uploadedFileName || (fileDataUrl ? 'Official_Question_Paper.pdf' : undefined),
              questionPaperSize: uploadedFileSize || (fileDataUrl ? '2.4 MB' : undefined),
              questionFileType: uploadedFileType || 'pdf',
              instructions: instructions.includes('\n') ? instructions.split('\n').filter(Boolean) : [instructions],
              questionText,
            });
          }}
          className="space-y-3.5"
        >
          {/* Exam Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Mock Test Examination Title *
            </label>
            <input
              type="text"
              required
              value={title}
              placeholder="e.g. BBS 4th Year Corporate Finance Pre-Board Model Exam"
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Target Course & Stream */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Target Academic Course *
              </label>
              <select
                value={courseSlug}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.title} ({c.board})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Syllabus Stream (New vs. Old Course) *
              </label>
              <select
                value={courseType}
                onChange={(e) => setCourseType(e.target.value as CourseType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="New Course">New Course (Current Regular Syllabus)</option>
                <option value="Old Course">Old Course (Backpaper Examination Prep)</option>
              </select>
            </div>
          </div>

          {/* Dynamic Semester & Subject Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Academic Year or Semester (Select from List) *
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => handleSemesterChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableSemesters.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
                <option value="__custom__">+ Enter Custom Semester / Year...</option>
              </select>

              {selectedSemester === '__custom__' && (
                <input
                  type="text"
                  placeholder="e.g. 1st Year, 2nd Year, Grade 11..."
                  value={customSemester}
                  onChange={(e) => setCustomSemester(e.target.value)}
                  className="w-full mt-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                />
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Subject Name (Select from Course List) *
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
                <option value="__custom__">+ Enter Custom Subject Name...</option>
              </select>

              {selectedSubject === '__custom__' && (
                <input
                  type="text"
                  placeholder="e.g. Cost and Management Accounting"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full mt-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                />
              )}
            </div>
          </div>

          {/* Time Limit & Marks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Time Limit (Minutes) *</label>
              <input
                type="number"
                required
                min={10}
                max={360}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Full / Pass Marks *</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  required
                  min={10}
                  value={fullMarks}
                  onChange={(e) => setFullMarks(Number(e.target.value))}
                  className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-200"
                  placeholder="Full"
                />
                <input
                  type="number"
                  required
                  min={5}
                  value={passMarks}
                  onChange={(e) => setPassMarks(Number(e.target.value))}
                  className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-200"
                  placeholder="Pass"
                />
              </div>
            </div>
          </div>

          {/* Exam Instructions */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Exam Instructions</label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          {/* Structured Question Text */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Structured Question Text / Prompts (Displayed directly to students)
            </label>
            <textarea
              rows={4}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-slate-950" />
              <span>{mockTest ? 'Save Changes' : 'Upload Question Paper'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 1. GROUP EDIT MODAL (CREATE / EDIT)
// ==========================================
const GroupEditModal: React.FC<{
  group: StudentGroup | null;
  courses: Course[];
  onClose: () => void;
  onSave: (data: Partial<StudentGroup>) => void;
}> = ({ group, courses, onClose, onSave }) => {
  const [name, setName] = useState(group?.name || group?.title || '');
  const [courseSlug, setCourseSlug] = useState(group?.courseSlug || (courses[0]?.slug || ''));
  const selectedCourse = courses.find((c) => c.slug === courseSlug);
  const [courseType, setCourseType] = useState<CourseType>(
    group?.courseType || selectedCourse?.courseType || 'New Course'
  );
  const [syllabusVersion, setSyllabusVersion] = useState(
    group?.syllabusVersion || selectedCourse?.syllabusVersion || ''
  );
  const [academicLevel, setAcademicLevel] = useState(group?.academicLevel || '1st Year');
  const [academicYearOrBatch, setAcademicYearOrBatch] = useState(
    group?.academicYearOrBatch || group?.batchYear || '2081/82'
  );
  const [shift, setShift] = useState<'Morning' | 'Day' | 'Evening' | 'Flexible' | 'Online' | 'All Shifts'>(
    group?.shift || 'Morning'
  );
  const [whatsappGroupLink, setWhatsappGroupLink] = useState(
    group?.whatsappGroupLink || 'https://chat.whatsapp.com/'
  );
  const [coordinatorName, setCoordinatorName] = useState(
    group?.coordinatorName || 'Prof. Narayan Kafle'
  );
  const [coordinatorPhone, setCoordinatorPhone] = useState(
    group?.coordinatorPhone || '9767648342'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto space-y-4 text-xs sm:text-sm">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-lg font-bold text-[#12315A] flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>{group ? 'Edit Student Group' : 'Create Enrolled Student Group'}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize enrolled students for instant notifications, syllabus updates, and WhatsApp batch broadcasts.
          </p>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Group Cohort Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. BBS 1st Year Morning Batch, MBS Thesis Students, Finance Specialization"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Academic Program *</label>
              <select
                value={courseSlug}
                onChange={(e) => {
                  const s = e.target.value;
                  setCourseSlug(s);
                  const matched = courses.find((c) => c.slug === s);
                  if (matched?.courseType) {
                    setCourseType(matched.courseType);
                  }
                  if (matched?.syllabusVersion) {
                    setSyllabusVersion(matched.syllabusVersion);
                  }
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium"
              >
                {courses.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.title} ({c.board}) {c.courseType ? `[${c.courseType}]` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Class Shift</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="Morning">Morning (6:30 AM - 10:30 AM)</option>
                <option value="Day">Day Shift (11:00 AM - 3:30 PM)</option>
                <option value="Evening">Evening Shift (4:00 PM - 7:30 PM)</option>
                <option value="Flexible">Flexible / Hybrid</option>
                <option value="Online">Online Virtual Batch</option>
              </select>
            </div>
          </div>

          {/* Syllabus Type Selection */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <label className="block font-bold text-slate-800 text-xs">
              Syllabus Structure (New Course vs. Old Course)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCourseType('New Course')}
                className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                  courseType === 'New Course'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                New Course (Regular)
              </button>
              <button
                type="button"
                onClick={() => setCourseType('Old Course')}
                className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                  courseType === 'Old Course'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Old Course (Backpaper Prep)
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              {courseType === 'Old Course'
                ? 'Dedicated to backpaper/chance exams and previous annual academic curriculum.'
                : 'Current regular semester / annual CBCS curriculum.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Academic Year / Term</label>
              <input
                type="text"
                placeholder="e.g. 1st Year / 3rd Semester"
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Batch / Exam Session</label>
              <input
                type="text"
                placeholder="e.g. 2081/82 or 2078 Backpaper"
                value={academicYearOrBatch}
                onChange={(e) => setAcademicYearOrBatch(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium"
              />
            </div>
          </div>

          {/* Official WhatsApp Group Invite Link */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
            <label className="block font-bold text-emerald-950 text-xs flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Official WhatsApp Group Invite Link</span>
            </label>
            <input
              type="url"
              placeholder="https://chat.whatsapp.com/inviteCode..."
              value={whatsappGroupLink}
              onChange={(e) => setWhatsappGroupLink(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-mono"
            />
            <p className="text-[11px] text-emerald-800">
              Students can tap "Join Batch WhatsApp Group" directly from their student dashboard to join this official discussion group.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Faculty Coordinator Name</label>
              <input
                type="text"
                value={coordinatorName}
                onChange={(e) => setCoordinatorName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Coordinator Mobile Phone</label>
              <input
                type="text"
                value={coordinatorPhone}
                onChange={(e) => setCoordinatorPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!name.trim()) return;
              onSave({
                name,
                courseSlug,
                courseName: selectedCourse?.title || 'Academic Course',
                courseType,
                syllabusVersion,
                shift,
                academicLevel,
                academicYearOrBatch,
                whatsappGroupLink,
                coordinatorName,
                coordinatorPhone,
              });
            }}
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#12315A] hover:bg-blue-900 shadow cursor-pointer"
          >
            Save Student Group
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. GROUP BROADCAST NOTICE MODAL
// ==========================================
const GroupBroadcastModal: React.FC<{
  group: StudentGroup;
  onClose: () => void;
  onSendBroadcast: (
    groupId: string,
    data: {
      title: string;
      message: string;
      urgency: 'Normal' | 'Important' | 'Urgent / Exam Alert';
      sentBy: string;
    }
  ) => void;
  onDeleteBroadcast: (groupId: string, broadcastId: string) => void;
}> = ({ group, onClose, onSendBroadcast, onDeleteBroadcast }) => {
  const [title, setTitle] = useState('');
  const [broadcastText, setBroadcastText] = useState('');
  const [urgency, setUrgency] = useState<'Normal' | 'Important' | 'Urgent / Exam Alert'>('Urgent / Exam Alert');
  const [sentBy, setSentBy] = useState(group.coordinatorName || 'Academic Coordinator');
  const [broadcastSentToast, setBroadcastSentToast] = useState(false);
  const [copiedSMSList, setCopiedSMSList] = useState(false);
  const [copiedWhatsAppText, setCopiedWhatsAppText] = useState(false);

  const handleSendInApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !broadcastText.trim()) return;
    onSendBroadcast(group.id, {
      title: title.trim(),
      message: broadcastText.trim(),
      urgency,
      sentBy,
    });
    setBroadcastSentToast(true);
    setTitle('');
    setBroadcastText('');
    setTimeout(() => setBroadcastSentToast(false), 3000);
  };

  const formattedWhatsAppMessage = `📢 *[SHIKSHYALAYA SANSTHA - URGENT NOTICE]*
🎯 *Group:* ${group.name} (${group.courseType || 'Regular'})
⚡ *Priority:* ${urgency}
📌 *Topic:* ${title || 'Notice to Enrolled Students'}

${broadcastText || 'Please check your student portal for class updates and syllabus routines.'}

☎ *Academic Coordinator:* ${group.coordinatorName} (${group.coordinatorPhone})
🌐 *Student Portal:* https://shikshyalaya.edu.np/student/dashboard`;

  const handleOpenWhatsAppBroadcast = () => {
    navigator.clipboard.writeText(formattedWhatsAppMessage);
    setCopiedWhatsAppText(true);
    setTimeout(() => setCopiedWhatsAppText(false), 3000);

    const waUrl = group.whatsappGroupLink && group.whatsappGroupLink.includes('whatsapp.com')
      ? group.whatsappGroupLink
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedWhatsAppMessage)}`;
    window.open(waUrl, '_blank');
  };

  const handleCopySMSNumbers = () => {
    const numbers = group.members.map((m) => m.phone.replace(/[^0-9]/g, '')).filter(Boolean);
    const unique = Array.from(new Set(numbers));
    navigator.clipboard.writeText(unique.join(', '));
    setCopiedSMSList(true);
    setTimeout(() => setCopiedSMSList(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto space-y-5 text-xs sm:text-sm">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Immediate Communication Hub
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#12315A] mt-1">
            Broadcast Urgent Notice: {group.name}
          </h3>
          <p className="text-xs text-slate-500">
            {group.members.length} enrolled students • Shift: {group.shift} • {group.courseType || 'New Course'}
          </p>
        </div>

        {broadcastSentToast && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-xs">
              Notice broadcasted successfully to all {group.members.length} students!
            </span>
          </div>
        )}

        {/* Quick Action Buttons Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
          <button
            type="button"
            onClick={handleOpenWhatsAppBroadcast}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>
              {copiedWhatsAppText ? 'Copied & Opening WhatsApp...' : 'Launch WhatsApp Group Notice'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleCopySMSNumbers}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4 text-blue-600" />
            <span>
              {copiedSMSList
                ? `Copied ${group.members.length} Numbers!`
                : `Copy ${group.members.length} Numbers for SMS Broadcast`}
            </span>
          </button>
        </div>

        {/* In-App Broadcast Form */}
        <form onSubmit={handleSendInApp} className="space-y-3.5 p-4 rounded-2xl border border-slate-200 bg-white">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
            <span>Compose In-App Notice & Alert</span>
            <span className="text-[10px] text-slate-400 font-normal">Pushed to Student Dashboard</span>
          </h4>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notice Headline / Topic *</label>
            <input
              type="text"
              required
              placeholder="e.g. Revised Exam Routine, Sunday Special Numerical Class, Room Change"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notice Content / Instructions *</label>
            <textarea
              required
              rows={3}
              placeholder="Enter exact timing, classroom or Zoom meeting link, preparation guidelines, and required books..."
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Urgency Priority</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="Normal">Normal Announcement</option>
                <option value="Important">Important Class Update</option>
                <option value="Urgent / Exam Alert">Urgent / Exam Alert (High Priority)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Sender Tag</label>
              <input
                type="text"
                value={sentBy}
                onChange={(e) => setSentBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Broadcast Notice to Group</span>
            </button>
          </div>
        </form>

        {/* Broadcast History */}
        <div className="space-y-2 pt-2">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
            <span>Recent Broadcast History ({group.broadcasts?.length || 0})</span>
            <span className="text-[10px] text-slate-400">Stored on student feeds</span>
          </h4>

          {(!group.broadcasts || group.broadcasts.length === 0) ? (
            <p className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-400 text-xs">
              No previous broadcasts recorded for this group.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {group.broadcasts.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          b.urgency === 'Urgent / Exam Alert'
                            ? 'bg-rose-100 text-rose-800'
                            : b.urgency === 'Important'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {b.urgency}
                      </span>
                      <span className="text-slate-400 text-[10px]">{b.sentAt}</span>
                      <span className="text-slate-400 text-[10px]">• By {b.sentBy}</span>
                    </div>
                    <p className="font-bold text-slate-900">{b.title}</p>
                    <p className="text-slate-600 line-clamp-2">{b.message}</p>
                  </div>
                  <button
                    onClick={() => onDeleteBroadcast(group.id, b.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    title="Delete notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. GROUP MEMBERS MODAL (ADD / BULK / SYNC)
// ==========================================
const GroupMembersModal: React.FC<{
  group: StudentGroup;
  inquiries: any[];
  onClose: () => void;
  onAddMember: (groupId: string, member: Omit<StudentGroupMember, 'id' | 'addedAt'>) => void;
  onBulkAddMembers: (
    groupId: string,
    members: Array<Omit<StudentGroupMember, 'id' | 'addedAt'>>
  ) => void;
  onImportFromInquiries: (groupId: string) => number;
  onRemoveMember: (groupId: string, memberId: string) => void;
}> = ({
  group,
  inquiries,
  onClose,
  onAddMember,
  onBulkAddMembers,
  onImportFromInquiries,
  onRemoveMember,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'single' | 'bulk'>('list');
  const [searchMember, setSearchMember] = useState('');
  const [singleName, setSingleName] = useState('');
  const [singlePhone, setSinglePhone] = useState('');
  const [singleRollNo, setSingleRollNo] = useState('');
  const [singleAcademicLevel, setSingleAcademicLevel] = useState(group.academicLevel || '');
  const [bulkText, setBulkText] = useState('');
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Filter group members
  const filteredMembers = (group.members || []).filter((m) => {
    if (!searchMember.trim()) return true;
    const q = searchMember.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      (m.rollNumber && m.rollNumber.toLowerCase().includes(q))
    );
  });

  const handleSingleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleName.trim() || !singlePhone.trim()) return;
    onAddMember(group.id, {
      fullName: singleName.trim(),
      phone: singlePhone.trim(),
      rollNumber: singleRollNo.trim() || undefined,
      academicLevel: singleAcademicLevel.trim() || undefined,
      source: 'manual',
    });
    setSingleName('');
    setSinglePhone('');
    setSingleRollNo('');
    setActiveTab('list');
  };

  const handleBulkAdd = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsed: Array<Omit<StudentGroupMember, 'id' | 'addedAt'>> = [];

    lines.forEach((line) => {
      // Split by comma or tab or spaces
      const parts = line.split(/[,;\t]+/).map((p) => p.trim()).filter(Boolean);
      let name = '';
      let phone = '';

      if (parts.length >= 2) {
        // e.g. "Ramesh Adhikari, 9841000000" or "9841000000, Ramesh Adhikari"
        if (/^\+?\d[\d\s-]{6,}$/.test(parts[0])) {
          phone = parts[0];
          name = parts.slice(1).join(' ');
        } else {
          name = parts[0];
          phone = parts[1];
        }
      } else {
        // single string, look for phone digits
        const phoneMatch = line.match(/\b(\+?977[- ]?)?[987]\d{7,9}\b/);
        if (phoneMatch) {
          phone = phoneMatch[0];
          name = line.replace(phoneMatch[0], '').replace(/[-:,]/g, '').trim() || 'Enrolled Student';
        } else {
          name = line;
          phone = '98' + Math.floor(10000000 + Math.random() * 90000000);
        }
      }

      if (name && phone) {
        parsed.push({
          fullName: name,
          phone,
          academicLevel: group.academicLevel,
          source: 'bulk',
        });
      }
    });

    if (parsed.length > 0) {
      onBulkAddMembers(group.id, parsed);
      setBulkStatus(`Successfully parsed and added ${parsed.length} student contact(s)!`);
      setBulkText('');
      setTimeout(() => {
        setBulkStatus(null);
        setActiveTab('list');
      }, 1500);
    }
  };

  const handleAutoImportInquiries = () => {
    const importedCount = onImportFromInquiries(group.id);
    setImportStatus(
      importedCount > 0
        ? `Successfully imported ${importedCount} verified student(s) matching ${group.courseName}!`
        : `All verified applicants for ${group.courseName} are already in this group.`
    );
    setTimeout(() => setImportStatus(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto space-y-5 text-xs sm:text-sm">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#12315A] flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Manage Student Cohort: {group.name}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Total Enrolled in Group: <strong>{group.members.length}</strong> students •{' '}
              <span className="font-semibold text-blue-700">{group.courseType || 'New Course'}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleAutoImportInquiries}
            className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>1-Click Sync Enrolled Inquiries</span>
          </button>
        </div>

        {importStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {/* Tab switcher: Student List vs Add Single vs Bulk Paste */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'list'
                ? 'bg-[#12315A] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Enrolled Students ({group.members.length})
          </button>
          <button
            onClick={() => setActiveTab('single')}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'single'
                ? 'bg-[#12315A] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            + Add Single Student
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'bulk'
                ? 'bg-[#12315A] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bulk Paste Numbers & Names
          </button>
        </div>

        {/* SUBTAB 1: MEMBERS LIST */}
        {activeTab === 'list' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students by name, roll no, or phone number..."
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50/70"
                />
              </div>
              <span className="text-[11px] text-slate-500 whitespace-nowrap">
                Showing {filteredMembers.length} of {group.members.length}
              </span>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 text-xs space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-600">No students found</p>
                <p className="text-[11px]">Use "+ Add Single Student" or "Bulk Paste Numbers" above to add enrolled students.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto bg-white">
                {filteredMembers.map((m) => {
                  const cleanedDigits = m.phone.replace(/[^0-9]/g, '');
                  const waNumber = cleanedDigits.startsWith('977') ? cleanedDigits : `977${cleanedDigits}`;
                  return (
                    <div
                      key={m.id}
                      className="p-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 truncate">{m.fullName}</span>
                          {m.rollNumber && (
                            <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                              {m.rollNumber}
                            </span>
                          )}
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                            {m.source}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {m.phone} • Added {m.addedAt}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={`https://wa.me/${waNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 cursor-pointer"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={`tel:${m.phone}`}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center gap-1 cursor-pointer"
                          title="Call Student"
                        >
                          <Phone className="w-3 h-3 text-blue-600" />
                          <span>Call</span>
                        </a>

                        <button
                          onClick={() => {
                            if (confirm(`Remove ${m.fullName} from this group?`)) {
                              onRemoveMember(group.id, m.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                          title="Remove from group"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 2: ADD SINGLE STUDENT */}
        {activeTab === 'single' && (
          <form onSubmit={handleSingleAdd} className="space-y-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Add Enrolled Student to Group
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar Adhikari"
                  value={singleName}
                  onChange={(e) => setSingleName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9841234567 / 9767648342"
                  value={singlePhone}
                  onChange={(e) => setSinglePhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Roll / SSS Reg Number</label>
                <input
                  type="text"
                  placeholder="e.g. SSS-BBS-2081-45"
                  value={singleRollNo}
                  onChange={(e) => setSingleRollNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Level / Term</label>
                <input
                  type="text"
                  value={singleAcademicLevel}
                  onChange={(e) => setSingleAcademicLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 rounded-xl font-bold text-slate-600 bg-white border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold text-white bg-blue-700 hover:bg-blue-800 shadow"
              >
                Add Student to Group
              </button>
            </div>
          </form>
        )}

        {/* SUBTAB 3: BULK PASTE NUMBERS & NAMES */}
        {activeTab === 'bulk' && (
          <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Bulk Paste Student Contact Numbers & Names
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Paste student lists directly from Excel, CSV, or WhatsApp exports. Supports formats:
                <code className="text-blue-700 ml-1">Name, 98XXXXXXXX</code> or <code className="text-blue-700">98XXXXXXXX Name</code> (one per line).
              </p>
            </div>

            {bulkStatus && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold">
                {bulkStatus}
              </div>
            )}

            <div>
              <textarea
                rows={6}
                placeholder={`Ramesh Kumar Adhikari, 9841234567\nSita Sharma, 9801234567\nBikash Thapa, 9812345678\nPooja Shrestha, 9860123456`}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                {bulkText.trim() ? `${bulkText.split('\n').filter(Boolean).length} line(s) detected` : 'Empty list'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 bg-white border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkAdd}
                  disabled={!bulkText.trim()}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 shadow cursor-pointer"
                >
                  Parse & Add All Students
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
