import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Clock,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  Award,
  BookOpen,
  ArrowRight,
  Shield,
  User,
  GraduationCap,
  Calendar,
  X,
  Send,
  AlertCircle,
  FileCheck,
  Check,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Lock,
  UserPlus,
  Printer,
  QrCode,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MockTest, MockTestSubmission, CourseType, MockTestRegistration } from '../types';

export const MockTestsPage: React.FC = () => {
  const {
    mockTests,
    mockTestSubmissions,
    mockTestRegistrations,
    registerForMockTest,
    courses,
    currentUser,
    submitMockTestAnswer,
    language,
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState<'tests' | 'results' | 'register'>('tests');

  // Dedicated Mock Test Only Registration State
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [regName, setRegName] = useState(currentUser?.name || '');
  const [regEmail, setRegEmail] = useState(currentUser?.email || '');
  const [regPhone, setRegPhone] = useState(currentUser?.phone || '');
  const [regCourseSlug, setRegCourseSlug] = useState('bbs-tu');
  const [regCourseType, setRegCourseType] = useState<CourseType>('New Course');
  const [regYearOrSem, setRegYearOrSem] = useState('1st Year');
  const [regSelectedSubjects, setRegSelectedSubjects] = useState<string[]>(['Business Statistics']);
  const [regPreferredMode, setRegPreferredMode] = useState<'Online (Scanned PDF Submission)' | 'Physical / Campus Exam Hall' | 'Hybrid'>('Online (Scanned PDF Submission)');
  const [regShift, setRegShift] = useState<'Morning (06:30 AM)' | 'Day (11:00 AM)' | 'Evening (05:30 PM)' | 'Weekend Special'>('Morning (06:30 AM)');
  const [regRollNo, setRegRollNo] = useState(currentUser?.studentId || '');
  const [regNotes, setRegNotes] = useState('');
  const [registrationPassModal, setRegistrationPassModal] = useState<MockTestRegistration | null>(null);
  const [regSuccessToast, setRegSuccessToast] = useState(false);

  // Filters
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string>(searchParams.get('course') || 'ALL');
  const [selectedYearOrSem, setSelectedYearOrSem] = useState<string>(searchParams.get('year') || 'ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>(searchParams.get('subject') || 'ALL');
  const [selectedCourseType, setSelectedCourseType] = useState<string>(searchParams.get('type') || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Course, Year & Subject Quick Attender / Uploader Widget State
  const [quickCourseSlug, setQuickCourseSlug] = useState<string>(courses[0]?.slug || '3-year-bbs-tu');
  const [quickYearOrSem, setQuickYearOrSem] = useState<string>('ALL');
  const [quickSubject, setQuickSubject] = useState<string>('');

  // Active Exam Modal State
  const [activeExamTest, setActiveExamTest] = useState<MockTest | null>(null);
  const [examStudentName, setExamStudentName] = useState(currentUser?.name || '');
  const [examRollNumber, setExamRollNumber] = useState(currentUser?.studentId || '');
  const [examStudentPhone, setExamStudentPhone] = useState(currentUser?.phone || '');
  const [examAnswerText, setExamAnswerText] = useState('');
  const [examAnswerFileUrl, setExamAnswerFileUrl] = useState('');
  const [examAnswerFileName, setExamAnswerFileName] = useState('');
  const [examRemainingSeconds, setExamRemainingSeconds] = useState(0);
  const [examTotalSeconds, setExamTotalSeconds] = useState(0);
  const [examIsSubmitted, setExamIsSubmitted] = useState(false);
  const [examSubmitSuccessToast, setExamSubmitSuccessToast] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [examStartTime, setExamStartTime] = useState<number | null>(null);

  // Private Result Lookup State (for checking results without logging in or verifying identity)
  const [lookupRollNumber, setLookupRollNumber] = useState(currentUser?.studentId || '');
  const [lookupPhone, setLookupPhone] = useState(currentUser?.phone || '');
  const [hasSearchedResult, setHasSearchedResult] = useState(false);
  const [selectedResultModal, setSelectedResultModal] = useState<MockTestSubmission | null>(null);

  // Question paper preview modal
  const [previewTest, setPreviewTest] = useState<MockTest | null>(null);

  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Available Years / Semesters for the active course filter
  const availableYearsAndSemesters = useMemo(() => {
    if (selectedCourseSlug !== 'ALL') {
      const course = courses.find((c) => c.slug === selectedCourseSlug);
      const termsFromCourse = (course?.subjectsOffered || [])
        .map((s) => s.semesterOrYear)
        .filter(Boolean) as string[];
      const termsFromTests = mockTests
        .filter((t) => t.courseSlug === selectedCourseSlug)
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
  }, [courses, mockTests, selectedCourseSlug]);

  // Reset year filter if selected course changes and year is not in available list
  useEffect(() => {
    if (selectedYearOrSem !== 'ALL' && availableYearsAndSemesters.length > 0 && !availableYearsAndSemesters.includes(selectedYearOrSem)) {
      setSelectedYearOrSem('ALL');
    }
  }, [selectedCourseSlug, availableYearsAndSemesters, selectedYearOrSem]);

  // Available subjects for active course & active year/semester filter
  const availableSubjects = useMemo(() => {
    if (selectedCourseSlug !== 'ALL') {
      const course = courses.find((c) => c.slug === selectedCourseSlug);
      let courseSubs = course?.subjectsOffered || [];
      if (selectedYearOrSem !== 'ALL') {
        courseSubs = courseSubs.filter((s) => s.semesterOrYear === selectedYearOrSem);
      }
      const subsFromCourse = courseSubs.map((s) => s.name);
      let testsForCourse = mockTests.filter((t) => t.courseSlug === selectedCourseSlug);
      if (selectedYearOrSem !== 'ALL') {
        testsForCourse = testsForCourse.filter((t) => t.semesterOrYear === selectedYearOrSem);
      }
      const subsFromTests = testsForCourse.map((t) => t.subject);
      const combined = Array.from(new Set([...subsFromCourse, ...subsFromTests])).filter(Boolean);
      return combined.sort();
    }
    const set = new Set<string>();
    courses.forEach((c) => {
      c.subjectsOffered?.forEach((s) => {
        if (selectedYearOrSem === 'ALL' || s.semesterOrYear === selectedYearOrSem) {
          set.add(s.name);
        }
      });
    });
    mockTests.forEach((t) => {
      if (t.subject && (selectedYearOrSem === 'ALL' || t.semesterOrYear === selectedYearOrSem)) {
        set.add(t.subject);
      }
    });
    return Array.from(set).filter(Boolean).sort();
  }, [courses, mockTests, selectedCourseSlug, selectedYearOrSem]);

  // Reset subject filter if selected course or year changes and subject is not in available subjects
  useEffect(() => {
    if (selectedSubject !== 'ALL' && availableSubjects.length > 0 && !availableSubjects.includes(selectedSubject)) {
      setSelectedSubject('ALL');
    }
  }, [selectedCourseSlug, selectedYearOrSem, availableSubjects, selectedSubject]);

  // Quick selector available years and semesters
  const quickCourseYearsAndSemesters = useMemo(() => {
    const course = courses.find((c) => c.slug === quickCourseSlug);
    if (!course) return [];
    const terms = (course.subjectsOffered || [])
      .map((s) => s.semesterOrYear)
      .filter(Boolean) as string[];
    const termsFromTests = mockTests
      .filter((t) => t.courseSlug === quickCourseSlug)
      .map((t) => t.semesterOrYear)
      .filter(Boolean) as string[];
    return Array.from(new Set([...terms, ...termsFromTests])).filter(Boolean).sort();
  }, [courses, mockTests, quickCourseSlug]);

  // Quick selector subjects filtered by quickYearOrSem
  const quickCourseSubjects = useMemo(() => {
    const course = courses.find((c) => c.slug === quickCourseSlug);
    if (!course) return [];
    let subs = course.subjectsOffered || [];
    if (quickYearOrSem !== 'ALL') {
      subs = subs.filter((s) => s.semesterOrYear === quickYearOrSem);
    }
    const subNames = subs.map((s) => s.name);
    let tests = mockTests.filter((t) => t.courseSlug === quickCourseSlug);
    if (quickYearOrSem !== 'ALL') {
      tests = tests.filter((t) => t.semesterOrYear === quickYearOrSem);
    }
    const subsFromTests = tests.map((t) => t.subject);
    return Array.from(new Set([...subNames, ...subsFromTests])).filter(Boolean).sort();
  }, [courses, mockTests, quickCourseSlug, quickYearOrSem]);

  // Keep quick subject updated when course or year changes
  useEffect(() => {
    if (quickCourseSubjects.length > 0 && (!quickSubject || !quickCourseSubjects.includes(quickSubject))) {
      setQuickSubject(quickCourseSubjects[0]);
    }
  }, [quickCourseSubjects, quickSubject]);

  // Matching mock tests for quick course, year & subject
  const quickMatchingTests = useMemo(() => {
    if (!quickCourseSlug || !quickSubject) return [];
    const qSubLower = quickSubject.toLowerCase();
    return mockTests.filter(
      (t) =>
        t.courseSlug === quickCourseSlug &&
        (quickYearOrSem === 'ALL' || t.semesterOrYear === quickYearOrSem || t.title.toLowerCase().includes(quickYearOrSem.toLowerCase())) &&
        (t.subject.toLowerCase() === qSubLower ||
          t.subject.toLowerCase().includes(qSubLower) ||
          t.title.toLowerCase().includes(qSubLower))
    );
  }, [mockTests, quickCourseSlug, quickYearOrSem, quickSubject]);

  // Filtered mock tests
  const filteredTests = useMemo(() => {
    return mockTests
      .filter((t) => t.published)
      .filter((t) => {
        if (selectedCourseSlug === 'ALL') return true;
        return t.courseSlug === selectedCourseSlug;
      })
      .filter((t) => {
        if (selectedCourseType === 'ALL') return true;
        return t.courseType === selectedCourseType;
      })
      .filter((t) => {
        if (selectedYearOrSem === 'ALL') return true;
        return (
          t.semesterOrYear === selectedYearOrSem ||
          t.title.toLowerCase().includes(selectedYearOrSem.toLowerCase())
        );
      })
      .filter((t) => {
        if (selectedSubject === 'ALL') return true;
        const subLower = selectedSubject.toLowerCase();
        return (
          t.subject.toLowerCase() === subLower ||
          t.subject.toLowerCase().includes(subLower) ||
          t.title.toLowerCase().includes(subLower)
        );
      })
      .filter((t) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.courseName.toLowerCase().includes(q) ||
          (t.semesterOrYear && t.semesterOrYear.toLowerCase().includes(q)) ||
          (t.instructions &&
            (Array.isArray(t.instructions)
              ? t.instructions.some((inst) => inst.toLowerCase().includes(q))
              : t.instructions.toLowerCase().includes(q)))
        );
      });
  }, [mockTests, selectedCourseSlug, selectedCourseType, selectedYearOrSem, selectedSubject, searchQuery]);

  // Private evaluated results visible to the logged-in student ONLY
  const myEvaluatedSubmissions = useMemo(() => {
    if (!currentUser) return [];
    const roll = (currentUser.studentId || '').trim().toLowerCase();
    const phone = (currentUser.phone || '').replace(/[^0-9]/g, '');
    const email = (currentUser.email || '').trim().toLowerCase();

    return mockTestSubmissions.filter((sub) => {
      const matchRoll = roll && sub.rollNumber?.toLowerCase() === roll;
      const matchId = sub.studentId === currentUser.id || (roll && sub.studentId?.toLowerCase() === roll);
      const matchPhone = phone && sub.studentPhone?.replace(/[^0-9]/g, '') === phone;
      const matchEmail = email && sub.studentEmail?.toLowerCase() === email;
      return matchRoll || matchId || matchPhone || matchEmail;
    });
  }, [mockTestSubmissions, currentUser]);

  // Private search results (requiring exact roll number & verification)
  const searchedSubmissions = useMemo(() => {
    if (!hasSearchedResult || !lookupRollNumber.trim()) return [];
    const roll = lookupRollNumber.trim().toLowerCase();
    const phoneClean = lookupPhone.trim().replace(/[^0-9]/g, '');

    return mockTestSubmissions.filter((sub) => {
      const matchRoll = sub.rollNumber?.toLowerCase() === roll || sub.studentId?.toLowerCase() === roll;
      // If phone is provided, check matching for strict privacy
      if (phoneClean) {
        const subPhoneClean = (sub.studentPhone || '').replace(/[^0-9]/g, '');
        return matchRoll && (subPhoneClean === phoneClean || subPhoneClean.includes(phoneClean));
      }
      return matchRoll;
    });
  }, [mockTestSubmissions, hasSearchedResult, lookupRollNumber, lookupPhone]);

  // Start exam timer
  const handleStartExam = (test: MockTest) => {
    setActiveExamTest(test);
    const durationSec = test.durationMinutes * 60;
    setExamRemainingSeconds(durationSec);
    setExamTotalSeconds(durationSec);
    setExamStartTime(Date.now());
    setExamIsSubmitted(false);
    setShowConfirmSubmit(false);
    setExamAnswerText('');
    setExamAnswerFileUrl('');
    setExamAnswerFileName('');

    // Pre-fill student info if logged in
    if (currentUser) {
      setExamStudentName(currentUser.name || '');
      setExamRollNumber(currentUser.studentId || 'SSS-STU-2026-08');
      setExamStudentPhone(currentUser.phone || '');
    }
  };

  // Timer countdown hook
  useEffect(() => {
    if (!activeExamTest || examIsSubmitted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setExamRemainingSeconds((prev) => {
        if (prev <= 1) {
          // Time expired
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeExamTest, examIsSubmitted]);

  // Format seconds to HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Answer Sheet File Upload (Strictly PDF format)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        alert('Invalid file format! Please upload your answer sheet in PDF format (.pdf) so our university examiners can review all your pages.');
        return;
      }
      setExamAnswerFileName(file.name);
      // For immediate preview create an object URL or simulated cloud storage link
      const fakeUrl = URL.createObjectURL(file);
      setExamAnswerFileUrl(fakeUrl);
    }
  };

  // Quick Demo Answer Sheet generator for test evaluation
  const handleAttachDemoAnswerSheet = () => {
    setExamAnswerFileName('ShikshyaSaugat_AnswerSheet_Scanned.pdf');
    setExamAnswerFileUrl('https://example.com/mock-test-answersheets/sample_submission.pdf');
    setExamAnswerText(
      `[Group A Answers]\nQ1. Managerial Economics focuses on applying economic theory and quantitative tools to managerial decision-making regarding pricing, output, and risk.\nQ2. The law of diminishing returns states that as successive units of a variable factor are added to fixed factors, the marginal product will eventually decline.\n\n[Group B Numerical Section]\nCalculations verified using standard TU BBS/MBS formula. Detailed hand-written workings scanned in attached PDF document.`
    );
  };

  // Submit Answer Sheet
  const handleSubmitExam = () => {
    if (!activeExamTest) return;

    if (!examStudentName.trim() || !examRollNumber.trim()) {
      alert('Please enter your full name and student roll number / ID to submit your answer sheet.');
      return;
    }

    if (!examAnswerFileUrl && !examAnswerText.trim()) {
      alert('Please upload your answer sheet (PDF/Image) or type your answers before submitting.');
      return;
    }

    const elapsedSeconds = examStartTime
      ? Math.round((Date.now() - examStartTime) / 1000)
      : examTotalSeconds - examRemainingSeconds;

    const isLate = examRemainingSeconds <= 0;

    submitMockTestAnswer({
      mockTestId: activeExamTest.id,
      testId: activeExamTest.id,
      mockTestTitle: activeExamTest.title,
      testTitle: activeExamTest.title,
      courseSlug: activeExamTest.courseSlug,
      courseType: activeExamTest.courseType,
      subject: activeExamTest.subject,
      studentId: currentUser?.id || examRollNumber.trim(),
      studentName: examStudentName.trim(),
      studentEmail: currentUser?.email || '',
      studentPhone: examStudentPhone.trim(),
      rollNumber: examRollNumber.trim(),
      answerFileUrl: examAnswerFileUrl || undefined,
      answerFileName: examAnswerFileName || (examAnswerFileUrl ? 'Uploaded_Answer_Sheet.pdf' : undefined),
      typedAnswers: examAnswerText.trim() || undefined,
      timeTakenSeconds: elapsedSeconds,
      isLateSubmission: isLate,
      evaluationStatus: 'Submitted',
    });

    setExamIsSubmitted(true);
    setShowConfirmSubmit(false);
    setExamSubmitSuccessToast(true);

    setTimeout(() => {
      setExamSubmitSuccessToast(false);
      setActiveExamTest(null);
    }, 3000);
  };

  // Timer color states
  const isUrgent = examRemainingSeconds <= 300 && examRemainingSeconds > 0; // Under 5 minutes
  const isWarning = examRemainingSeconds <= 900 && examRemainingSeconds > 300; // Under 15 minutes
  const isExpired = examRemainingSeconds === 0 && activeExamTest !== null;

  // Dynamic available subjects for Mock Test Only registration form
  const regAvailableSubjects = useMemo(() => {
    const course = courses.find((c) => c.slug === regCourseSlug);
    let courseSubs = course?.subjectsOffered || [];
    if (regYearOrSem !== 'ALL') {
      courseSubs = courseSubs.filter((s) => s.semesterOrYear === regYearOrSem);
    }
    const fromCourse = courseSubs.map((s) => s.name);
    const fromTests = mockTests
      .filter((t) => t.courseSlug === regCourseSlug && (regYearOrSem === 'ALL' || t.semesterOrYear === regYearOrSem))
      .map((t) => t.subject);
    const set = Array.from(new Set([...fromCourse, ...fromTests])).filter(Boolean);
    if (set.length === 0) {
      if (regCourseSlug === 'bbs-tu') {
        return ['Business Statistics', 'Microeconomics', 'Business English', 'Principles of Management', 'Financial Accounting'];
      }
      return ['General Model Paper 1', 'General Model Paper 2'];
    }
    return set;
  }, [courses, mockTests, regCourseSlug, regYearOrSem]);

  // Handle Mock Test Registration
  const handleRegisterForMockTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim()) {
      alert('Please enter your full name and mobile number to register for mock exams.');
      return;
    }

    const courseObj = courses.find((c) => c.slug === regCourseSlug);
    const courseName = courseObj ? courseObj.title : 'BBS – TU';

    const newReg = registerForMockTest({
      fullName: regName.trim(),
      email: regEmail.trim() || 'student@shikshyalaya.edu.np',
      phone: regPhone.trim(),
      courseSlug: regCourseSlug,
      courseName,
      courseType: regCourseType,
      semesterOrYear: regYearOrSem,
      enrolledSubjects: regSelectedSubjects.length > 0 ? regSelectedSubjects : ['Business Statistics'],
      preferredMode: regPreferredMode,
      shift: regShift,
      studentRollNo: regRollNo.trim() || undefined,
      notes: regNotes.trim() || undefined,
    });

    setRegistrationPassModal(newReg);
    setRegSuccessToast(true);
    setTimeout(() => setRegSuccessToast(false), 5000);
  };

  return (
    <div className="py-10 sm:py-14 space-y-10 min-h-screen bg-slate-50">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-[#12315A] via-[#1a4176] to-[#12315A] text-white p-8 sm:p-10 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>Institute Examination Portal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Mock Tests & Timed Examination Center
              </h1>
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                Take rigorous board-standard mock tests for Tribhuvan University, Pokhara University, and NEB. Upload your scanned answer sheets within strict exam time limits and receive individual marks with comprehensive examiner feedback.
              </p>
            </div>

            {/* Quick Actions / Stats */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0 flex-wrap">
              <button
                onClick={() => setActiveView('tests')}
                className={`px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  activeView === 'tests'
                    ? 'bg-amber-400 text-slate-950 font-extrabold'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Available Mock Tests ({filteredTests.length})</span>
              </button>

              <button
                onClick={() => setActiveView('register')}
                className={`px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  activeView === 'register'
                    ? 'bg-amber-400 text-slate-950 font-extrabold'
                    : 'bg-gradient-to-r from-amber-500/25 to-amber-400/30 hover:bg-amber-400/40 text-amber-200 border border-amber-400/40'
                }`}
              >
                <UserPlus className="w-4 h-4 text-amber-300" />
                <span>Register for Mock Test Only</span>
              </button>

              <button
                onClick={() => setActiveView('results')}
                className={`px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  activeView === 'results'
                    ? 'bg-amber-400 text-slate-950 font-extrabold'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Check My Results & Feedback</span>
              </button>
            </div>
          </div>

          {/* New Course vs Old Course Guidance Callout */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Both <strong>New Course (Current Syllabus)</strong> and <strong>Old Course (Backpaper Preparation)</strong> question papers are available.
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" /> New Course (Semester / Revised)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Old Course (Annual / Backpaper)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Link to Dedicated PDF Answer Sheet Upload Portal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-blue-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              PDF
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Have an Offline Practice Exam or Completed Model Paper?
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600">
                You can upload your scanned answer sheet directly in <strong>PDF format (.pdf)</strong> for faculty evaluation without waiting for a scheduled live timer.
              </p>
            </div>
          </div>
          <Link
            to="/upload-answer-sheet"
            className="px-4 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-500 transition-colors shadow-xs shrink-0 flex items-center justify-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF Answer Sheet &rarr;</span>
          </Link>
        </div>
      </div>

      {/* VIEW 1: AVAILABLE MOCK TESTS */}
      {activeView === 'tests' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          {/* INTERACTIVE COURSE & SUBJECT EXAM & ANSWER SHEET LAUNCHER */}
          <div className="bg-gradient-to-br from-[#12315A] to-[#1e467b] text-white p-5 sm:p-7 rounded-3xl shadow-md border border-blue-900/40 relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 mb-2 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Quick Course & Subject Exam Hub</span>
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    Attend Exam or Upload Answer Sheet by Subject
                  </h2>
                  <p className="text-xs sm:text-sm text-blue-200">
                    Select your Academic Program and specialized Subject to instantly find scheduled mock tests, download model papers, or upload your handwritten answer sheet (PDF) for faculty review.
                  </p>
                </div>

                <Link
                  to="/upload-answer-sheet"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-xs flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Full PDF Upload Portal &rarr;</span>
                </Link>
              </div>

              {/* Course, Year & Subject Interactive Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-12 gap-3 pt-2">
                {/* 1. Course Selector */}
                <div className="sm:col-span-1 lg:col-span-4 space-y-1">
                  <label className="text-[11px] font-bold text-blue-200 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-amber-300" />
                    <span>1. Select Program / Course:</span>
                  </label>
                  <select
                    value={quickCourseSlug}
                    onChange={(e) => {
                      setQuickCourseSlug(e.target.value);
                      setSelectedCourseSlug(e.target.value);
                      setQuickYearOrSem('ALL');
                      setSelectedYearOrSem('ALL');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 border border-white/20 shadow-xs"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.title} ({c.board})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Year or Semester Selector */}
                <div className="sm:col-span-1 lg:col-span-4 space-y-1">
                  <label className="text-[11px] font-bold text-blue-200 uppercase tracking-wider flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-amber-300" />
                    <span>2. Select Year / Semester:</span>
                  </label>
                  <select
                    value={quickYearOrSem}
                    onChange={(e) => {
                      setQuickYearOrSem(e.target.value);
                      setSelectedYearOrSem(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 border border-white/20 shadow-xs"
                  >
                    <option value="ALL">All Years & Semesters</option>
                    {quickCourseYearsAndSemesters.map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Subject Selector */}
                <div className="sm:col-span-1 lg:col-span-4 space-y-1">
                  <label className="text-[11px] font-bold text-blue-200 uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3 h-3 text-amber-300" />
                    <span>3. Select Subject:</span>
                  </label>
                  <select
                    value={quickSubject}
                    onChange={(e) => {
                      setQuickSubject(e.target.value);
                      setSelectedSubject(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 border border-white/20 shadow-xs"
                  >
                    {quickCourseSubjects.length === 0 ? (
                      <option value="">No subjects found</option>
                    ) : (
                      quickCourseSubjects.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Status & Immediate Action Panel */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-amber-300">
                      Selected:
                    </span>
                    <span className="text-xs font-extrabold text-white bg-white/20 px-2.5 py-0.5 rounded-lg">
                      {quickSubject || 'All Subjects'}
                    </span>
                    {quickYearOrSem !== 'ALL' && (
                      <span className="text-xs font-extrabold text-amber-950 bg-amber-400 px-2 py-0.5 rounded-lg">
                        {quickYearOrSem}
                      </span>
                    )}
                    <span className="text-[11px] text-blue-200">
                      ({courses.find((c) => c.slug === quickCourseSlug)?.title})
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-100">
                    {quickMatchingTests.length > 0
                      ? `${quickMatchingTests.length} Scheduled Official Mock Examination found ready for attendance.`
                      : 'No scheduled timed exam right now, but you can upload your handwritten practice answer sheet (PDF) anytime for examiner evaluation.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0 w-full md:w-auto">
                  {quickMatchingTests.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleStartExam(quickMatchingTests[0])}
                      className="flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Start Timed Exam</span>
                    </button>
                  )}

                  <Link
                    to={`/upload-answer-sheet?course=${quickCourseSlug}&year=${encodeURIComponent(quickYearOrSem !== 'ALL' ? quickYearOrSem : '')}&subject=${encodeURIComponent(quickSubject)}`}
                    className="flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload PDF for this Subject</span>
                  </Link>

                  {quickMatchingTests.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPreviewTest(quickMatchingTests[0])}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Paper</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by test title, subject (e.g. Accountancy, Finance, Physics, Statistics)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>

              {/* Course Selector */}
              <div className="shrink-0 sm:w-52">
                <select
                  value={selectedCourseSlug}
                  onChange={(e) => {
                    setSelectedCourseSlug(e.target.value);
                    if (e.target.value !== 'ALL') {
                      setQuickCourseSlug(e.target.value);
                      setSelectedYearOrSem('ALL');
                      setQuickYearOrSem('ALL');
                    }
                  }}
                  aria-label="Filter by Course"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Academic Programs</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.title} ({c.board})
                    </option>
                  ))}
                </select>
              </div>

              {/* Year or Semester Selector */}
              <div className="shrink-0 sm:w-44">
                <select
                  value={selectedYearOrSem}
                  onChange={(e) => {
                    setSelectedYearOrSem(e.target.value);
                    setQuickYearOrSem(e.target.value);
                  }}
                  aria-label="Filter by Year or Semester"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Years & Semesters ({availableYearsAndSemesters.length})</option>
                  {availableYearsAndSemesters.map((term) => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selector */}
              <div className="shrink-0 sm:w-52">
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    if (e.target.value !== 'ALL') {
                      setQuickSubject(e.target.value);
                    }
                  }}
                  aria-label="Filter by Subject"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Subjects ({availableSubjects.length})</option>
                  {availableSubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset */}
              {(searchQuery || selectedCourseSlug !== 'ALL' || selectedYearOrSem !== 'ALL' || selectedCourseType !== 'ALL' || selectedSubject !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCourseSlug('ALL');
                    setSelectedYearOrSem('ALL');
                    setQuickYearOrSem('ALL');
                    setSelectedSubject('ALL');
                    setSelectedCourseType('ALL');
                  }}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Syllabus Type Pills */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                Syllabus Stream:
              </span>
              {[
                { id: 'ALL', label: 'All Syllabi' },
                { id: 'New Course', label: 'New Course (Regular)' },
                { id: 'Old Course', label: 'Old Course (Backpaper)' },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedCourseType(type.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCourseType === type.id
                      ? type.id === 'Old Course'
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'bg-[#12315A] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mock Tests Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No mock tests found matching this filter</h3>
                <p className="text-xs text-slate-500">
                  Try switching the syllabus stream (New vs Old Course) or clearing the search keyword.
                </p>
              </div>
            ) : (
              filteredTests.map((test) => {
                // Check if the current user has already submitted this test
                const previousSubmission = currentUser
                  ? mockTestSubmissions.find(
                      (s) =>
                        (s.testId || s.mockTestId) === test.id &&
                        (s.studentId === currentUser.id || s.rollNumber === currentUser.studentId)
                    )
                  : null;

                const isOldCourse = test.courseType === 'Old Course';

                return (
                  <div
                    key={test.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-blue-300"
                  >
                    <div>
                      {/* Top Bar */}
                      <div className="p-5 pb-3 border-b border-slate-100 bg-slate-50/70">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              isOldCourse
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-blue-100 text-blue-900 border border-blue-200'
                            }`}
                          >
                            {test.courseType}
                          </span>
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>{test.durationMinutes} Mins ({Math.floor(test.durationMinutes / 60)}h {test.durationMinutes % 60 ? `${test.durationMinutes % 60}m` : ''})</span>
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-[#12315A] group-hover:text-blue-700 transition-colors line-clamp-2">
                          {test.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            Subject: {test.subject}
                          </span>
                          {test.semesterOrYear && (
                            <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {test.semesterOrYear}
                            </span>
                          )}
                          <span className="text-xs text-slate-500 font-medium">
                            • {test.courseName}
                          </span>
                        </div>
                      </div>

                      {/* Content & Marks */}
                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold uppercase text-slate-400">Full Marks</p>
                            <p className="text-base font-extrabold text-slate-900">{test.fullMarks}</p>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold uppercase text-slate-400">Pass Marks</p>
                            <p className="text-base font-extrabold text-emerald-700">{test.passMarks}</p>
                          </div>
                        </div>

                        {test.instructions && (
                          <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 text-[11px] text-amber-950 space-y-1">
                            <p className="font-bold flex items-center gap-1 text-amber-900">
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>Exam Instructions:</span>
                            </p>
                            <p className="line-clamp-2 leading-relaxed text-amber-900/90">{test.instructions}</p>
                          </div>
                        )}

                        {/* Submission Status if user already took this */}
                        {previousSubmission && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-xs flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-blue-900">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="font-semibold">
                                {previousSubmission.evaluationStatus === 'Evaluated'
                                  ? `Evaluated: ${previousSubmission.marksObtained}/${test.fullMarks}`
                                  : 'Answer Sheet Uploaded'}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedResultModal(previousSubmission);
                                setActiveView('results');
                              }}
                              className="text-[11px] font-bold text-blue-700 hover:underline"
                            >
                              View &rarr;
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="p-5 pt-0 border-t border-slate-100 bg-white space-y-2">
                      <div className="flex flex-col gap-2 pt-3">
                        <div className="flex items-center gap-2">
                          {test.questionPaperUrl && (
                            <button
                              onClick={() => setPreviewTest(test)}
                              className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                              title="Preview Question Paper"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Paper</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleStartExam(test)}
                            className="flex-1 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-[#12315A] hover:bg-blue-900 transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Start Timed Exam</span>
                          </button>
                        </div>

                        {/* Direct PDF Answer Sheet Upload Button for this specific Course & Subject */}
                        <Link
                          to={`/upload-answer-sheet?course=${test.courseSlug}&year=${encodeURIComponent(test.semesterOrYear || '')}&subject=${encodeURIComponent(test.subject)}`}
                          className="w-full px-3 py-2 rounded-xl text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5 text-rose-600" />
                          <span>Direct Upload PDF Answer Sheet for {test.subject} &rarr;</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: DEDICATED MOCK TEST ONLY REGISTRATION PORTAL */}
      {activeView === 'register' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8 animate-fadeIn">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-[#12315A] via-[#1a4176] to-[#12315A] text-white p-7 sm:p-9 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Mock Examination Series • Open Registration</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Register for Mock Test Series Only
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
                Interested in taking model board examinations without full tuition enrollment? Register your name and target subjects below to receive model question papers, scheduled examination seats, and individual examiner evaluation with marks & constructive feedback.
              </p>
            </div>
          </div>

          {/* Registration Form Card */}
          <div className="bg-white p-6 sm:p-9 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-[#12315A]">
                Candidate Information & Target Subjects
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Fill in your candidate details to obtain your official Mock Exam Registration Reference Pass.
              </p>
            </div>

            <form onSubmit={handleRegisterForMockTest} className="space-y-6">
              {/* Row 1: Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Candidate Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Adhikari"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mobile / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98XXXXXXXX"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. student@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Row 2: Program, Syllabus Version & Year/Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Program / Course *
                  </label>
                  <select
                    value={regCourseSlug}
                    onChange={(e) => {
                      setRegCourseSlug(e.target.value);
                      if (e.target.value === 'bbs-tu') {
                        setRegYearOrSem('1st Year');
                        setRegSelectedSubjects(['Business Statistics']);
                      } else if (e.target.value === 'mbs-tu') {
                        setRegYearOrSem('1st Semester');
                        setRegSelectedSubjects(['Managerial Economics']);
                      } else {
                        setRegYearOrSem('1st Semester');
                        setRegSelectedSubjects([]);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {courses.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Syllabus Scheme *
                  </label>
                  <select
                    value={regCourseType}
                    onChange={(e) => setRegCourseType(e.target.value as CourseType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="New Course">New Course (Current Regular Syllabus)</option>
                    <option value="Old Course">Old Course (Backpaper / Old Syllabus)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Year or Semester *
                  </label>
                  <select
                    value={regYearOrSem}
                    onChange={(e) => setRegYearOrSem(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {regCourseSlug === 'bbs-tu' ? (
                      <>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </>
                    ) : regCourseSlug.startsWith('plus-two') ? (
                      <>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                      </>
                    ) : (
                      <>
                        <option value="1st Semester">1st Semester</option>
                        <option value="2nd Semester">2nd Semester</option>
                        <option value="3rd Semester">3rd Semester</option>
                        <option value="4th Semester">4th Semester</option>
                        <option value="5th Semester">5th Semester</option>
                        <option value="6th Semester">6th Semester</option>
                        <option value="7th Semester">7th Semester</option>
                        <option value="8th Semester">8th Semester</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Row 3: Target Subjects (Interactive Selection) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Select Target Mock Exam Subjects *
                  </label>
                  <span className="text-[11px] text-blue-700 font-semibold">
                    {regSelectedSubjects.length} subject(s) selected
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Choose only the subjects you want to register for mock exams (e.g. Business Statistics, Microeconomics):
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {regAvailableSubjects.map((sub) => {
                    const isSelected = regSelectedSubjects.includes(sub);
                    return (
                      <button
                        type="button"
                        key={sub}
                        onClick={() => {
                          if (isSelected) {
                            if (regSelectedSubjects.length > 1) {
                              setRegSelectedSubjects(regSelectedSubjects.filter((s) => s !== sub));
                            }
                          } else {
                            setRegSelectedSubjects([...regSelectedSubjects, sub]);
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#12315A] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: Mode, Shift & College Roll */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Preferred Exam Mode
                  </label>
                  <select
                    value={regPreferredMode}
                    onChange={(e) => setRegPreferredMode(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Online (Scanned PDF Submission)">Online (Scanned PDF Submission)</option>
                    <option value="Physical / Campus Exam Hall">Physical / Campus Exam Hall</option>
                    <option value="Hybrid">Hybrid (Both Online & Physical)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Preferred Shift
                  </label>
                  <select
                    value={regShift}
                    onChange={(e) => setRegShift(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Morning (06:30 AM)">Morning (06:30 AM)</option>
                    <option value="Day (11:00 AM)">Day (11:00 AM)</option>
                    <option value="Evening (05:30 PM)">Evening (05:30 PM)</option>
                    <option value="Weekend Special">Weekend Special (Saturday 07:00 AM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    College / Roll No (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 708912 or NCC College"
                    value={regRollNo}
                    onChange={(e) => setRegRollNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Row 5: Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Specific Requests or Syllabus Weak Areas (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Need model paper solution discussion for Business Statistics probability section..."
                  value={regNotes}
                  onChange={(e) => setRegNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Instant pass generation with verified candidate reference number.</span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs sm:text-sm text-slate-950 bg-amber-400 hover:bg-amber-500 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Register & Generate Mock Exam Pass</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Registrations Preview for this session */}
          {mockTestRegistrations.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#12315A] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Recently Registered Mock Test Candidates</span>
                </h4>
                <span className="text-xs text-slate-400 font-semibold">
                  {mockTestRegistrations.length} registered
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockTestRegistrations.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-900">{r.referenceNumber}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {r.status}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">{r.fullName}</p>
                      <p className="text-slate-500 text-[11px]">{r.courseName} • {r.semesterOrYear}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {r.enrolledSubjects?.slice(0, 2).map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                            {s}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => setRegistrationPassModal(r)}
                        className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        View Pass &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: PRIVATE RESULTS & EXAMINER FEEDBACK */}
      {activeView === 'results' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Privacy Notice Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                Strict Private Result & Evaluation Privacy
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                As per institutional policy, exam scores and examiner critique remarks are strictly private. Students can view <strong>their own results only</strong> along with constructive feedback given by the examiner.
              </p>
            </div>
          </div>

          {/* Quick Roll Number & Phone Lookup Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-700" />
              <h3 className="text-base font-bold text-slate-900">
                Individual Result & Examiner Feedback Search
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Enter your official Student Roll Number / ID and registered Contact Number to view your checked answer sheets and remarks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Roll No / Student ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g. SSS-STU-2026-08 or 708912"
                  value={lookupRollNumber}
                  onChange={(e) => setLookupRollNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Registered Phone (For Privacy)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9841234567"
                  value={lookupPhone}
                  onChange={(e) => setLookupPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setHasSearchedResult(true)}
                  disabled={!lookupRollNumber.trim()}
                  className="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <Search className="w-4 h-4" />
                  <span>Look Up My Results</span>
                </button>
              </div>
            </div>
          </div>

          {/* Logged in student's automatic results list */}
          {currentUser && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-700" />
                  <span>My Submissions & Evaluated Papers ({myEvaluatedSubmissions.length})</span>
                </h3>
              </div>

              {myEvaluatedSubmissions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
                  <p className="text-xs text-slate-500">
                    You have not submitted any mock tests yet under your account. Select a test from the "Available Mock Tests" tab to start your examination.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myEvaluatedSubmissions.map((sub) => {
                    const testMeta = mockTests.find((t) => t.id === (sub.testId || sub.mockTestId));
                    const fullMarks = testMeta?.fullMarks || 100;
                    const passMarks = testMeta?.passMarks || 40;
                    const marks = sub.marksObtained;
                    const isPassed = marks !== undefined ? marks >= passMarks : false;
                    const displayTitle = sub.testTitle || sub.mockTestTitle || testMeta?.title || 'Mock Examination';
                    const displaySubject = sub.subject || testMeta?.subject || 'Exam Subject';
                    const displayCourseType = sub.courseType || testMeta?.courseType || 'New Course';

                    return (
                      <div
                        key={sub.id}
                        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5"
                      >
                        {/* Status Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  displayCourseType === 'Old Course'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-blue-100 text-blue-900'
                                }`}
                              >
                                {displayCourseType}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">
                                Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="text-lg font-bold text-[#12315A] mt-1">{displayTitle}</h4>
                            <p className="text-xs text-slate-600">
                              Subject: <strong>{displaySubject}</strong> • Roll: <span className="font-mono">{sub.rollNumber}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            {sub.evaluationStatus === 'Evaluated' ? (
                              <div className="text-right">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                                      isPassed
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                                    }`}
                                  >
                                    {isPassed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                                  </span>
                                  <div className="bg-slate-900 text-amber-400 font-extrabold text-lg px-3 py-1 rounded-xl shadow-xs">
                                    {sub.marksObtained} <span className="text-xs text-slate-300 font-normal">/ {fullMarks}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                {sub.evaluationStatus === 'Under Review' ? 'Paper Under Review' : 'Submitted (Awaiting Examiner)'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Examiner Feedback Section */}
                        {sub.evaluationStatus === 'Evaluated' && sub.feedbackRemarks && (
                          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-amber-600" />
                                <span>Official Examiner Feedback & Evaluation Remarks:</span>
                              </span>
                              {sub.evaluatedBy && (
                                <span className="text-slate-600 font-medium">
                                  Evaluator: <strong>{sub.evaluatedBy}</strong>
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-white/70 p-3.5 rounded-xl border border-amber-200/50">
                              {sub.feedbackRemarks}
                            </p>
                          </div>
                        )}

                        {/* Files & Details */}
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                          <div className="flex items-center gap-4 text-slate-500">
                            {sub.timeTakenSeconds && (
                              <span>
                                Time Taken: <strong>{Math.floor(sub.timeTakenSeconds / 60)}m {sub.timeTakenSeconds % 60}s</strong>
                              </span>
                            )}
                            {sub.isLateSubmission && (
                              <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">
                                Late Submission
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {sub.evaluatedPaperUrl && (
                              <a
                                href={sub.evaluatedPaperUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition-colors flex items-center gap-1"
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
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>My Uploaded Answer Sheet</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Search Results Display (if searched via form) */}
          {hasSearchedResult && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
                Search Results for Roll No: <span className="font-mono text-blue-700">{lookupRollNumber}</span>
              </h3>

              {searchedSubmissions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">No mock test records found</p>
                  <p className="text-xs text-slate-500">
                    Ensure you typed the exact Roll Number and phone number used during exam submission.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchedSubmissions.map((sub) => {
                    const testMeta = mockTests.find((t) => t.id === (sub.testId || sub.mockTestId));
                    const fullMarks = testMeta?.fullMarks || 100;
                    const passMarks = testMeta?.passMarks || 40;
                    const marks = sub.marksObtained;
                    const isPassed = marks !== undefined ? marks >= passMarks : false;
                    const displayTitle = sub.testTitle || sub.mockTestTitle || testMeta?.title || 'Mock Examination';
                    const displaySubject = sub.subject || testMeta?.subject || 'Exam Subject';
                    const displayCourseType = sub.courseType || testMeta?.courseType || 'New Course';

                    return (
                      <div
                        key={sub.id}
                        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-blue-100 text-blue-900">
                                {displayCourseType}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">
                                Student: {sub.studentName}
                              </span>
                            </div>
                            <h4 className="text-lg font-bold text-[#12315A] mt-1">{displayTitle}</h4>
                            <p className="text-xs text-slate-600">
                              Subject: <strong>{displaySubject}</strong> • Roll: <span className="font-mono">{sub.rollNumber}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            {sub.evaluationStatus === 'Evaluated' ? (
                              <div className="text-right">
                                <span
                                  className={`text-xs font-bold px-2.5 py-0.5 rounded mr-2 ${
                                    isPassed
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                                  }`}
                                >
                                  {isPassed ? 'PASSED' : 'NEEDS REVISION'}
                                </span>
                                <div className="inline-block bg-slate-900 text-amber-400 font-extrabold text-lg px-3 py-1 rounded-xl">
                                  {sub.marksObtained} <span className="text-xs text-slate-300 font-normal">/ {fullMarks}</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900">
                                Evaluation in Progress
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Examiner Feedback */}
                        {sub.evaluationStatus === 'Evaluated' && sub.feedbackRemarks && (
                          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-amber-600" />
                                <span>Examiner Evaluation Feedback:</span>
                              </span>
                              {sub.evaluatedBy && (
                                <span className="text-slate-600 font-medium">
                                  Checked by: <strong>{sub.evaluatedBy}</strong>
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-white/80 p-3.5 rounded-xl border border-amber-200/50">
                              {sub.feedbackRemarks}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TIMED EXAM MODAL / ENVIRONMENT */}
      {activeExamTest && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn">
            {/* Modal Header with Live Countdown Timer */}
            <div
              className={`p-4 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                isExpired
                  ? 'bg-rose-700'
                  : isUrgent
                  ? 'bg-rose-600 animate-pulse'
                  : isWarning
                  ? 'bg-amber-600'
                  : 'bg-[#12315A]'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/20 text-white">
                    {activeExamTest.courseType}
                  </span>
                  <span className="text-xs text-blue-200 font-medium">
                    {activeExamTest.courseName}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold line-clamp-1">{activeExamTest.title}</h2>
                <p className="text-xs text-white/80">
                  Subject: {activeExamTest.subject} • Full Marks: {activeExamTest.fullMarks}
                </p>
              </div>

              {/* Countdown Clock Display */}
              <div className="flex items-center gap-3 bg-black/25 px-4 py-2.5 rounded-2xl border border-white/20 shrink-0">
                <Clock className="w-5 h-5 text-amber-300 animate-spin-slow" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-white/70">Time Remaining</p>
                  <p className="text-2xl font-mono font-extrabold tracking-widest text-amber-300">
                    {formatTime(examRemainingSeconds)}
                  </p>
                </div>
              </div>
            </div>

            {/* Time Warning Alert Bar */}
            {isExpired && (
              <div className="bg-rose-100 border-b border-rose-300 px-4 py-2 text-rose-900 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-700" />
                <span>TIME EXPIRED! Submissions made now will be marked as "Late Submission".</span>
              </div>
            )}
            {isUrgent && !isExpired && (
              <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Hurry! Less than 5 minutes remaining. Please scan and upload your answers immediately.</span>
              </div>
            )}

            {/* Modal Body: Split Question & Answer Upload Area */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* Question Paper Preview Bar */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-700" />
                    <span className="text-xs font-bold text-[#12315A] uppercase tracking-wider">
                      Official Question Paper
                    </span>
                  </div>
                  {activeExamTest.questionPaperUrl && (
                    <a
                      href={activeExamTest.questionPaperUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-lg text-xs font-bold text-blue-700 bg-white border border-blue-300 hover:bg-blue-100 transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>
                  )}
                </div>

                {activeExamTest.questionText && (
                  <div className="bg-white p-4 rounded-xl border border-blue-200/60 max-h-48 overflow-y-auto text-xs text-slate-800 whitespace-pre-line leading-relaxed font-mono">
                    {activeExamTest.questionText}
                  </div>
                )}
              </div>

              {/* Student Identity Form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={examStudentName}
                    onChange={(e) => setExamStudentName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Roll Number / Student ID *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SSS-2026-BBS-12"
                    value={examRollNumber}
                    onChange={(e) => setExamRollNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Contact Mobile Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9841234567"
                    value={examStudentPhone}
                    onChange={(e) => setExamStudentPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Answer Sheet Upload Zone */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-rose-600" />
                    <span>Upload Scanned Answer Sheet (Strictly PDF Format .pdf)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAttachDemoAnswerSheet}
                    className="text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Attach Demo PDF Answer Sheet</span>
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-blue-50/20 transition-all">
                  <input
                    type="file"
                    id="exam-answer-file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="exam-answer-file"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-xs border border-rose-200 shadow-2xs">
                      PDF
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {examAnswerFileName ? examAnswerFileName : 'Click to select merged PDF Answer Sheet (.pdf)'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Single multi-page PDF document format required by university examiners (Max 25MB)
                      </p>
                    </div>
                  </label>

                  {examAnswerFileName && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg text-xs font-semibold border border-emerald-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{examAnswerFileName} attached ready for submission</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Typed Answer / Explanations Backup */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Type Written Answers / Summary Notes (Optional)
                </label>
                <textarea
                  rows={4}
                  placeholder="You can also type your answers, group wise numbers, or explanatory remarks here..."
                  value={examAnswerText}
                  onChange={(e) => setExamAnswerText(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to exit the exam? Unsaved answers will be lost.')) {
                    setActiveExamTest(null);
                  }
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel / Exit
              </button>

              <button
                type="button"
                onClick={handleSubmitExam}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Answer Sheet Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION PAPER PREVIEW MODAL */}
      {previewTest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#12315A] text-white">
              <div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                  {previewTest.courseType}
                </span>
                <h3 className="text-base font-bold mt-1">{previewTest.title}</h3>
                <p className="text-xs text-blue-200">
                  {previewTest.subject} • Full Marks: {previewTest.fullMarks}
                </p>
              </div>
              <button
                onClick={() => setPreviewTest(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 font-sans">
              {previewTest.instructions && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-950">
                  <p className="font-bold">Instructions:</p>
                  <p>{previewTest.instructions}</p>
                </div>
              )}

              {/* Image Preview if question paper is an image */}
              {previewTest.questionPaperUrl &&
                (previewTest.questionFileType === 'image' ||
                  previewTest.questionPaperUrl.startsWith('data:image/') ||
                  /\.(png|jpe?g|webp)$/i.test(previewTest.questionFileName || '')) && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 p-2">
                    <p className="text-[11px] font-bold text-slate-500 mb-2">Attached Question Paper Image:</p>
                    <img
                      src={previewTest.questionPaperUrl}
                      alt={previewTest.title}
                      className="max-h-96 w-auto mx-auto rounded-xl object-contain shadow-xs"
                    />
                  </div>
                )}

              {previewTest.questionText ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono whitespace-pre-line leading-relaxed">
                  {previewTest.questionText}
                </div>
              ) : (
                <p className="text-slate-500">
                  Question paper file is attached. Click download below to view the full document.
                </p>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              {previewTest.questionPaperUrl && (
                <a
                  href={previewTest.questionPaperUrl}
                  download={
                    previewTest.questionFileName ||
                    previewTest.questionPaperName ||
                    `${previewTest.title.replace(/\s+/g, '_')}_Paper`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {previewTest.questionFileType === 'image' ||
                    previewTest.questionPaperUrl.startsWith('data:image/') ||
                    /\.(png|jpe?g|webp)$/i.test(previewTest.questionFileName || '')
                      ? 'Download Paper (Image)'
                      : previewTest.questionFileType === 'word' ||
                        /\.(docx?)$/i.test(previewTest.questionFileName || '')
                      ? 'Download Paper (Word DOCX)'
                      : 'Download Paper (PDF)'}
                  </span>
                </a>
              )}
              <button
                onClick={() => {
                  const t = previewTest;
                  setPreviewTest(null);
                  handleStartExam(t);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Start Timed Exam</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSION SUCCESS TOAST */}
      {examSubmitSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideUp">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-bold">Answer Sheet Uploaded Successfully!</p>
            <p className="text-[11px] text-emerald-200">
              Your paper has been sent to the examiner. You will be able to view your score and feedback once evaluated.
            </p>
          </div>
        </div>
      )}

      {/* MOCK TEST ONLY REGISTRATION PASS MODAL */}
      {registrationPassModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-fadeIn">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-[#12315A] to-[#1e467b] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                    Official Exam Pass
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Mock Test Series Registration Pass
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setRegistrationPassModal(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pass Body */}
            <div className="p-6 space-y-4 text-xs text-slate-700 font-sans">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                    Registration Reference Code
                  </p>
                  <p className="text-lg font-black font-mono text-slate-900 mt-0.5">
                    {registrationPassModal.referenceNumber}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {registrationPassModal.status}
                </span>
              </div>

              <div className="space-y-2 border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Candidate Name:</span>
                  <strong className="text-slate-900">{registrationPassModal.fullName}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Contact Phone:</span>
                  <strong className="font-mono text-slate-900">{registrationPassModal.phone}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Program & Scheme:</span>
                  <strong className="text-blue-900">
                    {registrationPassModal.courseName} ({registrationPassModal.semesterOrYear}, {registrationPassModal.courseType})
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Exam Mode & Shift:</span>
                  <span className="font-semibold text-slate-800">
                    {registrationPassModal.preferredMode} • {registrationPassModal.shift}
                  </span>
                </div>
                <div className="pt-1">
                  <span className="text-slate-500 font-medium block mb-1.5">Registered Exam Subjects:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {registrationPassModal.enrolledSubjects && registrationPassModal.enrolledSubjects.length > 0 ? (
                      registrationPassModal.enrolledSubjects.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">All Course Subjects</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>Important Instructions for Mock Candidates:</span>
                </p>
                <ul className="list-disc pl-4 space-y-0.5 text-blue-800">
                  <li>Keep this reference code safe. Use it to submit your papers and view marks.</li>
                  <li>Handwritten answers must be scanned into PDF format (.pdf) for faculty review.</li>
                  <li>Evaluated answer papers and individual remarks are published in the "Check My Results" tab.</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Exam Pass</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRegistrationPassModal(null);
                  setActiveView('tests');
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-500 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Go to Mock Tests</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATION SUCCESS TOAST */}
      {regSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideUp">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-bold">Mock Test Registration Confirmed!</p>
            <p className="text-[11px] text-emerald-200">
              Your official mock exam pass reference has been issued.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
