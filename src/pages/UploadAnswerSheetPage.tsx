import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Search,
  Download,
  Eye,
  Clock,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Calendar,
  X,
  FileUp,
  Sparkles,
  HelpCircle,
  Check,
  RotateCcw,
  User,
  Phone,
  Mail,
  Send,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Course, CourseType, MockTestSubmission } from '../types';

export const UploadAnswerSheetPage: React.FC = () => {
  const {
    courses,
    mockTests,
    mockTestSubmissions,
    currentUser,
    submitMockTestAnswer,
    language,
  } = useApp();

  const [searchParams] = useSearchParams();
  const preselectedCourse = searchParams.get('course');
  const preselectedYear = searchParams.get('year');
  const preselectedSubject = searchParams.get('subject');
  const preselectedTestId = searchParams.get('testId');

  const [activeTab, setActiveTab] = useState<'upload' | 'track'>('upload');

  // Form State
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string>(
    preselectedCourse || 'bbs-tu'
  );
  const [selectedCourseType, setSelectedCourseType] = useState<CourseType>('New Course');
  const [selectedYearOrSem, setSelectedYearOrSem] = useState<string>(preselectedYear || '1st Year');
  const [selectedSubject, setSelectedSubject] = useState<string>(preselectedSubject || '');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [subjectCode, setSubjectCode] = useState<string>('');
  const [submissionCategory, setSubmissionCategory] = useState<
    'Mock Test Examination' | 'Terminal / Send-Up Exam' | 'Backpaper Clearance Practice' | 'Weekly Assignment' | 'Faculty Chapter Test'
  >('Mock Test Examination');
  const [boundMockTestId, setBoundMockTestId] = useState<string>(preselectedTestId || '');

  // Student Identity
  const [studentName, setStudentName] = useState(currentUser?.name || '');
  const [studentRollNo, setStudentRollNo] = useState(currentUser?.studentId || '');
  const [studentPhone, setStudentPhone] = useState(currentUser?.phone || '');
  const [studentEmail, setStudentEmail] = useState(currentUser?.email || '');
  const [attemptedNotes, setAttemptedNotes] = useState('');

  // PDF File Upload State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileSize, setPdfFileSize] = useState('');
  const [pdfFileUrl, setPdfFileUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Receipt State
  const [submissionReceipt, setSubmissionReceipt] = useState<{
    id: string;
    referenceCode: string;
    studentName: string;
    rollNumber: string;
    courseTitle: string;
    subject: string;
    fileName: string;
    fileSize: string;
    submittedAt: string;
    category: string;
  } | null>(null);

  // Track Submissions Lookup
  const [trackRollNo, setTrackRollNo] = useState(currentUser?.studentId || '');
  const [trackPhone, setTrackPhone] = useState(currentUser?.phone || '');
  const [hasQueriedTrack, setHasQueriedTrack] = useState(false);
  const [selectedResultDetail, setSelectedResultDetail] = useState<MockTestSubmission | null>(null);
  const [pdfPreviewModal, setPdfPreviewModal] = useState<{ url: string; title: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Get active course metadata
  const currentCourse = courses.find((c) => c.slug === selectedCourseSlug);

  // Sync course type and year when course changes
  useEffect(() => {
    if (!currentCourse) return;
    if (currentCourse.courseType === 'Old Course' || currentCourse.slug.includes('3-year') || currentCourse.slug.includes('old')) {
      setSelectedCourseType('Old Course');
    }
  }, [selectedCourseSlug, currentCourse]);

  // Derived available terms (years or semesters)
  const availableTerms = React.useMemo(() => {
    if (!currentCourse) return [];
    const subjects = currentCourse.subjectsOffered || [];
    const filtered = subjects.filter((s) => {
      if (!s.courseType || s.courseType === 'Both') return true;
      return s.courseType === selectedCourseType;
    });
    const terms = Array.from(new Set(filtered.map((s) => s.semesterOrYear).filter(Boolean))) as string[];
    return terms.length > 0 ? terms : ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  }, [currentCourse, selectedCourseType]);

  // Sync selected term
  useEffect(() => {
    if (availableTerms.length > 0) {
      if (preselectedYear && availableTerms.includes(preselectedYear)) {
        setSelectedYearOrSem(preselectedYear);
        return;
      }
      if (!availableTerms.includes(selectedYearOrSem)) {
        setSelectedYearOrSem(availableTerms[0]);
      }
    }
  }, [availableTerms, preselectedYear, selectedYearOrSem]);

  // Derived available subjects for the selected term & course
  const availableSubjects = React.useMemo(() => {
    if (!currentCourse) return [];
    return currentCourse.subjectsOffered.filter((s) => {
      const matchType = !s.courseType || s.courseType === 'Both' || s.courseType === selectedCourseType;
      const matchTerm = !selectedYearOrSem || s.semesterOrYear === selectedYearOrSem;
      return matchType && matchTerm;
    });
  }, [currentCourse, selectedCourseType, selectedYearOrSem]);

  // Auto-set subject when subjects change
  useEffect(() => {
    if (availableSubjects.length > 0) {
      if (preselectedSubject) {
        const match = availableSubjects.find(
          (s) =>
            s.name.toLowerCase() === preselectedSubject.toLowerCase() ||
            s.name.toLowerCase().includes(preselectedSubject.toLowerCase())
        );
        if (match) {
          setSelectedSubject(match.name);
          setSubjectCode(match.code || '');
          return;
        }
      }
      const first = availableSubjects[0];
      setSelectedSubject(first.name);
      setSubjectCode(first.code || '');
    } else {
      if (preselectedSubject) {
        setSelectedSubject('Other Subject');
        setCustomSubject(preselectedSubject);
      } else {
        setSelectedSubject('Other Subject');
      }
      setSubjectCode('');
    }
  }, [availableSubjects, preselectedSubject]);

  // Handle subject change
  const handleSubjectSelect = (subName: string) => {
    setSelectedSubject(subName);
    if (subName === 'Other Subject') {
      setSubjectCode('');
    } else {
      const found = availableSubjects.find((s) => s.name === subName);
      if (found?.code) setSubjectCode(found.code);
    }
  };

  // Strict PDF Validation and File Selection
  const validateAndSetPdf = (file: File) => {
    setUploadError('');
    const isPdfType = file.type === 'application/pdf';
    const hasPdfExtension = file.name.toLowerCase().endsWith('.pdf');

    if (!isPdfType && !hasPdfExtension) {
      setUploadError(
        'Invalid file format! Answer sheets must be uploaded in PDF format (.pdf). Image files (JPG/PNG) or Word documents (DOCX) are not accepted.'
      );
      setPdfFile(null);
      setPdfFileName('');
      setPdfFileSize('');
      setPdfFileUrl('');
      return;
    }

    // Size limit check (max 50 MB)
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File size exceeds the 50 MB limit. Please compress your PDF before uploading.');
      return;
    }

    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setPdfFile(file);
    setPdfFileName(file.name);
    setPdfFileSize(formattedSize);
    const objectUrl = URL.createObjectURL(file);
    setPdfFileUrl(objectUrl);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetPdf(file);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetPdf(file);
    }
  };

  // Quick Demo Answer Sheet Attachment (for testing workflow)
  const handleAttachDemoPdf = () => {
    setUploadError('');
    setPdfFileName('Shikshyalaya_Student_AnswerSheet_Scanned.pdf');
    setPdfFileSize('2.8 MB');
    setPdfFileUrl('https://example.com/mock-test-answersheets/demo_answer_sheet.pdf');
    setPdfFile(null);
    setAttemptedNotes(
      'Attempted all questions from Group A (10x2=20 marks) and Group B (5x10=50 marks). Detailed working notes and ledger adjustments scanned in 8 high-resolution pages in this PDF.'
    );
  };

  // Handle Form Submission
  const handleSubmitAnswerSheet = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');

    if (!studentName.trim()) {
      setUploadError('Please enter your Full Name.');
      return;
    }

    if (!studentRollNo.trim()) {
      setUploadError('Please enter your Student ID or Examination Roll Number.');
      return;
    }

    if (!studentPhone.trim()) {
      setUploadError('Please enter your contact phone or WhatsApp number for evaluation alerts.');
      return;
    }

    if (!pdfFileName && !pdfFileUrl) {
      setUploadError('Please select or drop your answer sheet in PDF format (.pdf).');
      return;
    }

    setIsSubmitting(true);

    const finalSubjectName = selectedSubject === 'Other Subject' ? (customSubject.trim() || 'General Subject') : selectedSubject;
    const finalCourseName = currentCourse?.title || 'Academic Program';
    const refCode = `SSS-ANS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      submitMockTestAnswer({
        mockTestId: boundMockTestId || `manual-${Date.now()}`,
        testId: boundMockTestId || `manual-${Date.now()}`,
        mockTestTitle: `${finalCourseName} – ${finalSubjectName} Answer Sheet (${submissionCategory})`,
        testTitle: `${finalCourseName} – ${finalSubjectName} Answer Sheet (${submissionCategory})`,
        courseSlug: selectedCourseSlug,
        courseType: selectedCourseType,
        subject: `${finalSubjectName} ${subjectCode ? `(${subjectCode})` : ''}`.trim(),
        studentId: currentUser?.id || studentRollNo.trim(),
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim() || currentUser?.email || '',
        studentPhone: studentPhone.trim(),
        rollNumber: studentRollNo.trim(),
        answerFileUrl: pdfFileUrl || 'https://example.com/mock-test-answersheets/uploaded_sheet.pdf',
        answerFileName: pdfFileName || 'Uploaded_Answer_Sheet.pdf',
        answerFileSize: pdfFileSize || '2.5 MB',
        typedAnswers: attemptedNotes.trim()
          ? `[Submitted via PDF Upload Portal - ${submissionCategory}]\nSubject: ${finalSubjectName} (${selectedYearOrSem})\nStudent Notes:\n${attemptedNotes.trim()}`
          : `[Submitted via PDF Upload Portal - ${submissionCategory}] Attached PDF: ${pdfFileName}`,
        timeTakenSeconds: 7200,
        isLateSubmission: false,
        evaluationStatus: 'Submitted',
      });

      setSubmissionReceipt({
        id: `receipt-${Date.now()}`,
        referenceCode: refCode,
        studentName: studentName.trim(),
        rollNumber: studentRollNo.trim(),
        courseTitle: finalCourseName,
        subject: finalSubjectName,
        fileName: pdfFileName,
        fileSize: pdfFileSize,
        submittedAt: new Date().toLocaleString(),
        category: submissionCategory,
      });

      // Reset PDF form
      setPdfFile(null);
      setPdfFileName('');
      setPdfFileSize('');
      setPdfFileUrl('');
      setAttemptedNotes('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploadError('Failed to record submission. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submissions for the tracking tab
  const trackedSubmissions = React.useMemo(() => {
    const roll = trackRollNo.trim().toLowerCase();
    const phoneClean = trackPhone.trim().replace(/[^0-9]/g, '');

    if (!roll && !phoneClean && currentUser) {
      const uRoll = (currentUser.studentId || '').trim().toLowerCase();
      const uPhone = (currentUser.phone || '').replace(/[^0-9]/g, '');
      const uEmail = (currentUser.email || '').trim().toLowerCase();
      return mockTestSubmissions.filter((sub) => {
        const matchRoll = uRoll && (sub.rollNumber?.toLowerCase() === uRoll || sub.studentId?.toLowerCase() === uRoll);
        const matchPhone = uPhone && sub.studentPhone?.replace(/[^0-9]/g, '') === uPhone;
        const matchEmail = uEmail && sub.studentEmail?.toLowerCase() === uEmail;
        return matchRoll || matchPhone || matchEmail;
      });
    }

    if (!hasQueriedTrack && !currentUser) return [];

    return mockTestSubmissions.filter((sub) => {
      const matchRoll = roll && (sub.rollNumber?.toLowerCase() === roll || sub.studentId?.toLowerCase() === roll);
      if (phoneClean) {
        const subPhoneClean = (sub.studentPhone || '').replace(/[^0-9]/g, '');
        return matchRoll || (subPhoneClean && subPhoneClean === phoneClean);
      }
      return matchRoll;
    });
  }, [mockTestSubmissions, trackRollNo, trackPhone, hasQueriedTrack, currentUser]);

  return (
    <div className="py-10 sm:py-16 space-y-12">
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-[#12315A] via-[#1a3f75] to-[#12315A] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl border border-white/10">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
              <FileUp className="w-3.5 h-3.5" />
              <span>Official Student Submission Portal</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Upload Your Answer Sheet
                <span className="block text-amber-300 text-xl sm:text-2xl font-bold mt-1">
                  (PDF Format Only • PDF ढाँचामा मात्र)
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-2xl">
                Submit your handwritten, scanned answer sheets in <strong>single PDF format (.pdf)</strong> for
                mock tests, terminal send-ups, and backpaper clearance practice (मौका परीक्षा). Our university faculty
                evaluates each paper with marks, step-by-step corrections, and written critique.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Strictly PDF (.pdf) Format</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Faculty Evaluated & Graded</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
                <CheckCircle2 className="w-4 h-4 text-blue-300" />
                <span>Digital Submission Receipt</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container with Tab Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-[#12315A] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Upload New Answer Sheet</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('track')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'track'
                  ? 'bg-[#12315A] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Track Submitted Answer Sheets & Grades</span>
              {trackedSubmissions.length > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {trackedSubmissions.length}
                </span>
              )}
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-700" />
            <span>Turnaround: Faculty evaluation within 24–48 hours</span>
          </div>
        </div>

        {/* TAB 1: UPLOAD ANSWER SHEET */}
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Upload Form */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-[#12315A] flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-blue-700" />
                  <span>Answer Sheet Submission Form</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Fill in your academic and student details, then attach your answer sheet strictly in <strong>PDF format (.pdf)</strong>.
                </p>
              </div>

              {uploadError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs sm:text-sm text-rose-800 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">{uploadError}</div>
                </div>
              )}

              <form onSubmit={handleSubmitAnswerSheet} className="space-y-6">
                {/* SECTION 1: Academic Course & Subject */}
                <div className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                    1. Academic Program & Subject
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Course Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Select Academic Course *
                      </label>
                      <select
                        value={selectedCourseSlug}
                        onChange={(e) => setSelectedCourseSlug(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {courses.map((c) => (
                          <option key={c.id} value={c.slug}>
                            {c.title} ({c.board})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Syllabus Scheme Switcher */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Curriculum Scheme *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCourseType('New Course')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold text-center border cursor-pointer transition-all ${
                            selectedCourseType === 'New Course'
                              ? 'bg-[#12315A] text-white border-[#12315A] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          New Course
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCourseType('Old Course')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold text-center border cursor-pointer transition-all ${
                            selectedCourseType === 'Old Course'
                              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          Old Course (3-Year/Back)
                        </button>
                      </div>
                    </div>

                    {/* Academic Year / Semester */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Year / Semester *
                      </label>
                      <select
                        value={selectedYearOrSem}
                        onChange={(e) => setSelectedYearOrSem(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {availableTerms.map((term) => (
                          <option key={term} value={term}>
                            {term}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Submission Category */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Examination / Test Category *
                      </label>
                      <select
                        value={submissionCategory}
                        onChange={(e) => setSubmissionCategory(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="Mock Test Examination">TU Model Mock Test Examination</option>
                        <option value="Backpaper Clearance Practice">Backpaper Clearance Practice (मौका परीक्षा)</option>
                        <option value="Terminal / Send-Up Exam">Terminal / Pre-Board Send-Up Exam</option>
                        <option value="Weekly Assignment">Weekly Numerical Assignment</option>
                        <option value="Faculty Chapter Test">Faculty Evaluated Chapter Test</option>
                      </select>
                    </div>

                    {/* Subject Selector */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Subject Name *
                      </label>
                      <div className="space-y-2">
                        <select
                          value={selectedSubject}
                          onChange={(e) => handleSubjectSelect(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          {availableSubjects.map((sub) => (
                            <option key={sub.name + (sub.code || '')} value={sub.name}>
                              {sub.name} {sub.code ? `(${sub.code})` : ''}
                            </option>
                          ))}
                          <option value="Other Subject">Other Subject (Custom / Unlisted Paper)</option>
                        </select>

                        {selectedSubject === 'Other Subject' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <input
                              type="text"
                              placeholder="Enter Custom Subject Name (e.g. Business Statistics)"
                              value={customSubject}
                              onChange={(e) => setCustomSubject(e.target.value)}
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              required
                            />
                            <input
                              type="text"
                              placeholder="Subject Code (e.g. MGT 202 / ACC 212)"
                              value={subjectCode}
                              onChange={(e) => setSubjectCode(e.target.value)}
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Student Identification */}
                <div className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                    2. Student Identity & Contact
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Student Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rajesh Basnet"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Student ID / Examination Roll Number *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SSS-STU-BBS-101 or TU Exam Roll"
                        value={studentRollNo}
                        onChange={(e) => setStudentRollNo(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 9851123456 (For result alerts)"
                        value={studentPhone}
                        onChange={(e) => setStudentPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. student@example.com"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: PDF Document Upload Zone */}
                <div className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>3. Answer Sheet Document (Strictly PDF Format)</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleAttachDemoPdf}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Attach Demo PDF Answer Sheet</span>
                    </button>
                  </div>

                  {/* Hidden Input for PDF only */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {/* Drag and Drop Zone */}
                  {!pdfFileName ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                        isDragOver
                          ? 'border-blue-600 bg-blue-50/80 scale-[1.01]'
                          : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 bg-white'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-200 shadow-xs">
                        <FileText className="w-8 h-8" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Drop your PDF Answer Sheet here, or <span className="text-blue-700 underline">Browse</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Supports single-file multi-page <strong>PDF documents (.pdf)</strong> up to 50 MB.
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Accepted format: Adobe Acrobat PDF (.pdf) only</span>
                      </div>
                    </div>
                  ) : (
                    /* Verified PDF Card */
                    <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm font-black text-xs">
                            PDF
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                                {pdfFileName}
                              </h4>
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Verified PDF</span>
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              File Size: <strong>{pdfFileSize}</strong> • Ready for faculty submission
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {pdfFileUrl && (
                            <button
                              type="button"
                              onClick={() => setPdfPreviewModal({ url: pdfFileUrl, title: pdfFileName })}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPdfFile(null);
                              setPdfFileName('');
                              setPdfFileSize('');
                              setPdfFileUrl('');
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove PDF"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Attempted Questions Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Summary of Questions Attempted / Working Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Attempted Group A (Q1 to Q10) and Group B (Q11, Q13, Q14). Numerical step calculation for standard costing included on pages 4-6."
                      value={attemptedNotes}
                      onChange={(e) => setAttemptedNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl font-black text-sm text-slate-950 bg-amber-400 hover:bg-amber-500 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Uploading & Registering PDF Answer Sheet...'
                      : 'Submit Answer Sheet (PDF Format) & Generate Receipt'}
                  </span>
                </button>
              </form>
            </div>

            {/* Right: Submission Rules & PDF Scanning Tips */}
            <div className="lg:col-span-4 space-y-6">
              {/* PDF Format Guarantee Box */}
              <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 space-y-3">
                <div className="flex items-center gap-2.5 text-rose-900 font-bold text-sm">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    PDF
                  </div>
                  <span>Strict Requirement: PDF Format</span>
                </div>
                <p className="text-xs text-rose-950 leading-relaxed">
                  Examiners read numerical workings and verify steps sequentially. To avoid missing or scattered image pages, <strong>all answer sheets must be merged into one continuous PDF file</strong> before uploading.
                </p>
                <div className="pt-1 border-t border-rose-200/60 text-[11px] text-rose-800 space-y-1">
                  <p>✓ All pages right-side up and readable</p>
                  <p>✓ Question numbers clearly highlighted in margins</p>
                  <p>✓ Name and Roll Number on the top of Page 1</p>
                </div>
              </div>

              {/* How to Scan PDF Guide */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-xs">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-700" />
                  <span>How to Create a Clean PDF from Phone</span>
                </h3>

                <ol className="space-y-2.5 text-slate-600 list-decimal list-inside leading-relaxed">
                  <li>
                    <strong className="text-slate-800">Use a Free Mobile Scanner:</strong> Install{' '}
                    <span className="font-semibold text-blue-700">Adobe Scan</span>,{' '}
                    <span className="font-semibold text-blue-700">CamScanner</span>, or use the Scan button in{' '}
                    <span className="font-semibold text-blue-700">Google Drive</span>.
                  </li>
                  <li>
                    <strong className="text-slate-800">Capture in Order:</strong> Photograph your answer pages in order (Page 1, 2, 3...) under proper bright lighting.
                  </li>
                  <li>
                    <strong className="text-slate-800">Export as PDF:</strong> Save or export as a single document named{' '}
                    <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-[10px]">
                      YourName_Subject.pdf
                    </code>.
                  </li>
                  <li>
                    <strong className="text-slate-800">Upload Here:</strong> Drag and drop or browse the saved PDF into the upload box on the left.
                  </li>
                </ol>
              </div>

              {/* Quick Counselor Helpline */}
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-3 text-xs">
                <h3 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-700" />
                  <span>Need Help Submitting?</span>
                </h3>
                <p className="text-amber-900 leading-relaxed">
                  Having trouble converting your images to PDF or encountering file size issues? Contact our examination helpline:
                </p>
                <div className="pt-1 font-mono font-bold text-amber-950 text-sm">
                  WhatsApp: +977 9767648342
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRACK SUBMITTED ANSWER SHEETS */}
        {activeTab === 'track' && (
          <div className="space-y-6">
            {/* Lookup Bar */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="max-w-xl space-y-1">
                <h3 className="text-base font-bold text-[#12315A]">
                  Track Evaluation Status & View Graded Papers
                </h3>
                <p className="text-xs text-slate-500">
                  Enter your Student Roll Number or Phone number to view all your uploaded PDF answer sheets and confidential examiner results.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Enter Student ID or Exam Roll Number (e.g. SSS-STU-BBS-101)..."
                    value={trackRollNo}
                    onChange={(e) => setTrackRollNo(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>

                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Enter Registered Phone / WhatsApp..."
                    value={trackPhone}
                    onChange={(e) => setTrackPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setHasQueriedTrack(true)}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-[#12315A] hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shrink-0"
                >
                  <Search className="w-4 h-4 text-amber-400" />
                  <span>Find My Answer Sheets</span>
                </button>
              </div>
            </div>

            {/* Results Feed */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  Found <strong>{trackedSubmissions.length}</strong> submitted answer sheet(s)
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Strictly Confidential to Student
                </span>
              </div>

              {trackedSubmissions.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">No Answer Sheets Found</h4>
                  <p className="text-xs text-slate-500">
                    {hasQueriedTrack
                      ? 'No submissions matched your search. Check your roll number or phone and try again.'
                      : 'Enter your Student ID/Roll Number above to load your submitted answer sheets.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload an Answer Sheet Now</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {trackedSubmissions.map((sub) => {
                    const testMeta = mockTests.find((t) => t.id === (sub.testId || sub.mockTestId));
                    const fullMarks = testMeta?.fullMarks || 100;
                    const passMarks = testMeta?.passMarks || 40;
                    const isPassed = sub.marksObtained !== undefined ? sub.marksObtained >= passMarks : false;

                    return (
                      <div
                        key={sub.id}
                        className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-100 text-blue-900">
                                {sub.courseType || 'Curriculum Scheme'}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">
                                Submitted {new Date(sub.submittedAt).toLocaleString()}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-[#12315A]">
                              {sub.testTitle || sub.mockTestTitle || 'Answer Sheet Submission'}
                            </h4>
                            <p className="text-xs text-slate-600">
                              Subject: <strong>{sub.subject || 'Academic Paper'}</strong> • Roll Number:{' '}
                              <span className="font-mono font-bold text-slate-800">{sub.rollNumber}</span> • Student:{' '}
                              <strong>{sub.studentName}</strong>
                            </p>
                          </div>

                          {/* Evaluation Status Badge */}
                          <div>
                            {sub.evaluationStatus === 'Evaluated' ? (
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                                    isPassed
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                      : 'bg-rose-100 text-rose-800 border-rose-300'
                                  }`}
                                >
                                  {isPassed ? 'PASSED' : 'NEEDS REVISION'}
                                </span>
                                <div className="bg-slate-900 text-amber-400 font-black text-lg px-3.5 py-1 rounded-xl shadow-xs">
                                  {sub.marksObtained}{' '}
                                  <span className="text-xs text-slate-300 font-normal">/ {fullMarks}</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                                <span>
                                  {sub.evaluationStatus === 'Under Review'
                                    ? 'Under Faculty Review'
                                    : 'Submitted / Awaiting Evaluation'}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Examiner Feedback Remarks Critique if Evaluated */}
                        {sub.evaluationStatus === 'Evaluated' && sub.feedbackRemarks && (
                          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
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
                            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-white/90 p-3 rounded-xl border border-amber-200/60 font-sans">
                              {sub.feedbackRemarks}
                            </p>
                          </div>
                        )}

                        {/* Uploaded PDF Action Links */}
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2">
                          <div className="flex items-center gap-2 text-slate-500">
                            <div className="w-6 h-6 rounded bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px]">
                              PDF
                            </div>
                            <span className="font-medium text-slate-700">{sub.answerFileName || 'Student_Answer_Sheet.pdf'}</span>
                            {sub.answerFileSize && <span>({sub.answerFileSize})</span>}
                          </div>

                          <div className="flex items-center gap-2">
                            {sub.answerFileUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPdfPreviewModal({
                                    url: sub.answerFileUrl!,
                                    title: sub.answerFileName || 'My Uploaded Answer Sheet',
                                  })
                                }
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Uploaded PDF</span>
                              </button>
                            )}

                            {sub.evaluatedPaperUrl && (
                              <a
                                href={sub.evaluatedPaperUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition-colors flex items-center gap-1"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                <span>Download Checked Paper PDF</span>
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
          </div>
        )}
      </div>

      {/* SUCCESS SUBMISSION RECEIPT MODAL */}
      {submissionReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 relative">
            <button
              onClick={() => setSubmissionReceipt(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-300 shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Answer Sheet Registered
              </span>
              <h3 className="text-xl font-black text-[#12315A]">
                Digital Submission Receipt
              </h3>
              <p className="text-xs text-slate-500">
                Your answer sheet has been securely submitted and logged in the faculty evaluation queue.
              </p>
            </div>

            {/* Receipt Details Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Receipt Reference:</span>
                <span className="font-mono font-bold text-[#12315A] text-sm">{submissionReceipt.referenceCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900">{submissionReceipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Roll / Student ID:</span>
                <span className="font-mono font-bold text-slate-900">{submissionReceipt.rollNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Course & Subject:</span>
                <span className="font-bold text-slate-900">{submissionReceipt.courseTitle} • {submissionReceipt.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-medium text-slate-700">{submissionReceipt.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Uploaded File (PDF):</span>
                <span className="font-mono text-emerald-700 font-semibold">{submissionReceipt.fileName} ({submissionReceipt.fileSize})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submission Timestamp:</span>
                <span className="text-slate-600">{submissionReceipt.submittedAt}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Our faculty examiners review numerical steps and provide marks within <strong>24–48 hours</strong>. You can view marks and critiques at any time under the <strong>Track Submissions</strong> tab or in your <strong>Student Dashboard</strong>.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSubmissionReceipt(null);
                  setActiveTab('track');
                  setTrackRollNo(submissionReceipt.rollNumber);
                  setHasQueriedTrack(true);
                }}
                className="flex-1 py-3 rounded-xl font-bold text-xs text-white bg-[#12315A] hover:bg-blue-900 transition-colors shadow-sm cursor-pointer"
              >
                Track in My Submissions &rarr;
              </button>
              <button
                type="button"
                onClick={() => setSubmissionReceipt(null)}
                className="py-3 px-4 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF PREVIEW MODAL */}
      {pdfPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-4 relative">
            <button
              onClick={() => setPdfPreviewModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-rose-600 text-white font-bold flex items-center justify-center text-xs">
                PDF
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 truncate max-w-md">
                  {pdfPreviewModal.title}
                </h3>
                <p className="text-[11px] text-slate-500">PDF Document Verification View</p>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {pdfPreviewModal.title}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Valid PDF Document format. Scanned answer pages verified.
                </p>
              </div>
              <a
                href={pdfPreviewModal.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#12315A] hover:bg-blue-900 transition-colors shadow-sm"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Open in Fullscreen PDF Viewer &rarr;</span>
              </a>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setPdfPreviewModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
