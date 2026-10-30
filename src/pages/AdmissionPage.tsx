import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
  Clock,
  BookOpen,
  ShieldCheck,
  Shield,
  Phone,
  Mail,
  Copy,
  Check,
  CheckSquare,
  Square,
  X,
  BookCheck,
  Upload,
  Receipt,
  CreditCard,
  Trash2,
  Eye,
  FileCheck,
  QrCode,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassMode, CourseType } from '../types';

export const AdmissionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { courses, submitAdmissionInquiry, attachPaymentProofToInquiry, inquiries, settings, language } = useApp();

  const preselectedCourse = searchParams.get('course') || '';
  const preselectedMode = searchParams.get('mode') || '';

  // Mode: New admission or attaching payment to existing inquiry
  const [activeFormTab, setActiveFormTab] = useState<'new' | 'existing_proof'>('new');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCourseSlug, setSelectedCourseSlug] = useState(preselectedCourse || (courses[0]?.slug || ''));
  const currentCourse = courses.find((c) => c.slug === selectedCourseSlug);
  const [courseType, setCourseType] = useState<CourseType>('New Course');

  // Sync courseType when currentCourse changes
  useEffect(() => {
    if (currentCourse?.courseType) {
      setCourseType(currentCourse.courseType);
    }
  }, [selectedCourseSlug, currentCourse]);

  // Available academic terms (Semesters / Years / Grades)
  const availableTerms = React.useMemo(() => {
    if (!currentCourse) return [];
    const set = new Set<string>();
    currentCourse.subjectsOffered.forEach((s) => {
      if (s.semesterOrYear) set.add(s.semesterOrYear);
    });
    return Array.from(set);
  }, [currentCourse]);

  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [customSubjectText, setCustomSubjectText] = useState('');
  const [preferredMode, setPreferredMode] = useState<ClassMode>((preselectedMode as ClassMode) || 'Offline');
  const [preferredShift, setPreferredShift] = useState<'Morning' | 'Day' | 'Evening' | 'Flexible'>('Morning');
  const [message, setMessage] = useState('');
  const [consentPrivacy, setConsentPrivacy] = useState(true);

  // Payment Proof States
  const [hasPaymentProof, setHasPaymentProof] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [paymentProofName, setPaymentProofName] = useState<string>('');
  const [paymentProofSize, setPaymentProofSize] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'eSewa' | 'Khalti' | 'Bank Transfer / ConnectIPS' | 'Cash / Campus Desk' | 'Other'>('eSewa');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [transactionReference, setTransactionReference] = useState('');
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [copiedPaymentAccount, setCopiedPaymentAccount] = useState<string | null>(null);

  // Existing Application Lookup States
  const [lookupQuery, setLookupQuery] = useState('');
  const [foundInquiry, setFoundInquiry] = useState<any | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [existingSuccessMessage, setExistingSuccessMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successReference, setSuccessReference] = useState<string | null>(null);
  const [submittedWithPayment, setSubmittedWithPayment] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (preselectedCourse) {
      setSelectedCourseSlug(preselectedCourse);
    }
  }, [preselectedCourse]);

  // Sync selected term whenever course or availableTerms change
  useEffect(() => {
    if (availableTerms.length > 0) {
      if (!selectedTerm || !availableTerms.includes(selectedTerm)) {
        setSelectedTerm(availableTerms[0]);
      }
    }
  }, [selectedCourseSlug, availableTerms]);

  // Displayed subjects for currently selected term
  const displayedSubjects = React.useMemo(() => {
    if (!currentCourse) return [];
    if (!selectedTerm || selectedTerm === 'ALL') {
      return currentCourse.subjectsOffered;
    }
    return currentCourse.subjectsOffered.filter((s) => s.semesterOrYear === selectedTerm);
  }, [currentCourse, selectedTerm]);

  const toggleSubject = (subjectItem: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectItem)
        ? prev.filter((s) => s !== subjectItem)
        : [...prev, subjectItem]
    );
  };

  const handleSelectAllTermSubjects = () => {
    const termSubLabels = displayedSubjects.map((s) => (s.code ? `${s.code}: ${s.name}` : s.name));
    setSelectedSubjects((prev) => Array.from(new Set([...prev, ...termSubLabels])));
  };

  const handleClearTermSubjects = () => {
    const termSubLabels = new Set(displayedSubjects.map((s) => (s.code ? `${s.code}: ${s.name}` : s.name)));
    setSelectedSubjects((prev) => prev.filter((s) => !termSubLabels.has(s)));
  };

  const validatePhone = (num: string) => {
    const cleaned = num.replace(/[^0-9]/g, '');
    return cleaned.length >= 7;
  };

  const validateEmail = (mail: string) => {
    if (!mail.trim()) return true; // optional
    const re = /\S+@\S+\.\S+/;
    return re.test(mail);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');

    // Check size limit: max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit. Please upload an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPaymentProofUrl(dataUrl);
      setPaymentProofName(file.name);
      setPaymentProofSize(`${(file.size / 1024).toFixed(0)} KB`);
      setHasPaymentProof(true);
    };
    reader.onerror = () => {
      setUploadError('Failed to read payment voucher image. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePaymentProof = () => {
    setPaymentProofUrl('');
    setPaymentProofName('');
    setPaymentProofSize('');
    setHasPaymentProof(false);
  };

  const handleCopyAccount = (accName: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPaymentAccount(accName);
    setTimeout(() => setCopiedPaymentAccount(null), 2000);
  };

  const handleUseSamplePaymentVoucher = (method: 'eSewa' | 'Khalti' | 'Bank Transfer / ConnectIPS') => {
    setUploadError('');
    const txn =
      method === 'eSewa'
        ? `ESW-${Date.now().toString().slice(-6)}`
        : method === 'Khalti'
        ? `KHL-${Date.now().toString().slice(-6)}`
        : `CIPS-${Date.now().toString().slice(-6)}`;
    const amt = '6500';
    const courseTitle = currentCourse?.title || foundInquiry?.courseName || 'Academic Course';
    const bgFill = method === 'eSewa' ? '%23f0fdf4' : method === 'Khalti' ? '%23faf5ff' : '%23eff6ff';
    const strokeColor = method === 'eSewa' ? '%2322c55e' : method === 'Khalti' ? '%23a855f7' : '%233b82f6';
    const textColor = method === 'eSewa' ? '%23166534' : method === 'Khalti' ? '%236b21a8' : '%231e40af';

    const sampleSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380"><rect width="100%" height="100%" fill="${bgFill}"/><rect x="20" y="20" width="560" height="340" rx="16" fill="%23ffffff" stroke="${strokeColor}" stroke-width="2"/><circle cx="65" cy="65" r="24" fill="${strokeColor}"/><path d="M57 65 l6 6 l14 -14" stroke="%23ffffff" stroke-width="3.5" fill="none" stroke-linecap="round"/><text x="105" y="62" font-family="sans-serif" font-size="18" font-weight="bold" fill="${textColor}">${method} Transaction Verified</text><text x="105" y="82" font-family="sans-serif" font-size="12" fill="%234b5563">Txn ID: ${txn} • Verified Deposit</text><line x1="35" y1="110" x2="565" y2="110" stroke="%23e5e7eb" stroke-dasharray="4"/><text x="45" y="145" font-family="sans-serif" font-size="13" fill="%236b7280">Recipient:</text><text x="180" y="145" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23111827">Shikshyalaya Shaikshik Sanstha</text><text x="45" y="180" font-family="sans-serif" font-size="13" fill="%236b7280">Applicant Name:</text><text x="180" y="180" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23111827">${fullName || foundInquiry?.fullName || 'Enrolling Student'}</text><text x="45" y="215" font-family="sans-serif" font-size="13" fill="%236b7280">Program / Level:</text><text x="180" y="215" font-family="sans-serif" font-size="13" font-weight="bold" fill="${textColor}">${courseTitle}</text><rect x="35" y="245" width="530" height="45" rx="10" fill="${bgFill}" stroke="${strokeColor}" stroke-opacity="0.3"/><text x="50" y="274" font-family="sans-serif" font-size="15" font-weight="bold" fill="${textColor}">Amount Deposited: NPR ${amt}.00</text></svg>`;

    setPaymentProofUrl(sampleSvg);
    setPaymentProofName(`Verified_${method.replace(/[^A-Za-z]/g, '')}_Receipt_${txn}.png`);
    setPaymentProofSize('184 KB');
    setPaymentMethod(method);
    setPaymentAmount(amt);
    setTransactionReference(txn);
    setPaymentRemarks(`Payment for ${courseTitle} tuition fee`);
    setHasPaymentProof(true);
  };

  const handleLookupApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setExistingSuccessMessage('');
    if (!lookupQuery.trim()) {
      setLookupError('Please enter your Reference ID (e.g. SSS-ADM-2026-1001) or registered Mobile Number.');
      return;
    }
    const q = lookupQuery.trim().toLowerCase();
    const qDigits = lookupQuery.replace(/[^0-9]/g, '');
    const found = inquiries.find(
      (inq) =>
        inq.referenceNumber.toLowerCase() === q ||
        (qDigits.length >= 7 && inq.phone.replace(/[^0-9]/g, '') === qDigits) ||
        (inq.email && inq.email.toLowerCase() === q)
    );
    if (!found) {
      setLookupError('No admission application found matching this Reference ID or Mobile Number. Please verify your details.');
      setFoundInquiry(null);
    } else {
      setFoundInquiry(found);
      if (found.hasPaymentProof) {
        setPaymentProofUrl(found.paymentProofUrl || '');
        setPaymentProofName(found.paymentProofName || 'Existing_Voucher.png');
        setPaymentProofSize(found.paymentProofSize || 'Image');
        setPaymentMethod(found.paymentMethod || 'eSewa');
        setPaymentAmount(found.paymentAmount || '');
        setTransactionReference(found.transactionReference || '');
        setPaymentRemarks(found.paymentRemarks || '');
        setHasPaymentProof(true);
      }
    }
  };

  const handleSubmitExistingPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundInquiry) return;
    if (!hasPaymentProof || !paymentProofUrl) {
      setUploadError('Please select or upload a payment slip image first.');
      return;
    }
    setSubmitting(true);
    try {
      const res = attachPaymentProofToInquiry(foundInquiry.referenceNumber, {
        paymentProofUrl,
        paymentProofName: paymentProofName || 'payment_receipt.png',
        paymentProofSize: paymentProofSize || '200 KB',
        paymentMethod,
        paymentAmount: paymentAmount || 'Recorded',
        transactionReference: transactionReference || 'Attached',
        paymentRemarks,
      });
      if (res.success) {
        setExistingSuccessMessage(res.message);
        setFoundInquiry(res.inquiry || null);
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#F59E0B', '#2457A7', '#10B981'],
          });
        } catch (err) {}
      } else {
        setUploadError(res.message);
      }
    } catch (err) {
      setUploadError('Failed to attach payment proof. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }

    if (!phone.trim() || !validatePhone(phone)) {
      setErrorMessage('Please provide a valid contact telephone or mobile number.');
      return;
    }

    if (email && !validateEmail(email)) {
      setErrorMessage('Please provide a valid email address format.');
      return;
    }

    if (!selectedCourseSlug) {
      setErrorMessage('Please select the academic course you wish to enroll in.');
      return;
    }

    if (!consentPrivacy) {
      setErrorMessage('You must acknowledge and consent to the privacy policy.');
      return;
    }

    setSubmitting(true);
    try {
      const courseObj = courses.find((c) => c.slug === selectedCourseSlug);

      let finalSubjectsList = selectedSubjects.join(', ');
      if (customSubjectText.trim()) {
        finalSubjectsList = finalSubjectsList
          ? `${finalSubjectsList} | Additional: ${customSubjectText.trim()}`
          : customSubjectText.trim();
      }
      if (!finalSubjectsList) {
        finalSubjectsList = `All subjects under ${selectedTerm || 'Core Curriculum'}`;
      }

      const refNumber = await submitAdmissionInquiry({
        fullName,
        email: email || 'not-provided@example.com',
        phone,
        address,
        courseSlug: selectedCourseSlug,
        courseName: courseObj?.title || selectedCourseSlug,
        board: courseObj?.board || 'Academic Board',
        academicLevel: selectedTerm || courseObj?.level || 'Standard',
        courseType,
        syllabusVersion:
          courseType === 'Old Course'
            ? courseObj?.syllabusVersion || 'Old Annual/Semester Syllabus (Backpaper Exam Prep)'
            : courseObj?.syllabusVersion || 'New Regular CBCS Syllabus',
        subjectsOfInterest: finalSubjectsList,
        preferredMode,
        preferredShift,
        message,
        hasPaymentProof,
        paymentProofUrl: hasPaymentProof ? paymentProofUrl : undefined,
        paymentProofName: hasPaymentProof ? paymentProofName : undefined,
        paymentProofSize: hasPaymentProof ? paymentProofSize : undefined,
        paymentMethod: hasPaymentProof ? paymentMethod : undefined,
        paymentAmount: hasPaymentProof ? paymentAmount : undefined,
        transactionReference: hasPaymentProof ? transactionReference : undefined,
        paymentRemarks: hasPaymentProof ? paymentRemarks : undefined,
      });

      setSuccessReference(refNumber);
      setSubmittedWithPayment(hasPaymentProof);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#2457A7', '#10B981'],
        });
      } catch (err) {
        // Safe fallback
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred while processing your admission application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyRef = () => {
    if (successReference) {
      navigator.clipboard.writeText(successReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetForm = () => {
    setSuccessReference(null);
    setSubmittedWithPayment(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setSelectedSubjects([]);
    setCustomSubjectText('');
    setMessage('');
    handleRemovePaymentProof();
    setPaymentAmount('');
    setTransactionReference('');
    setPaymentRemarks('');
  };

  return (
    <div className="py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>New Academic Session 2026/2027</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#12315A] tracking-tight">
          Apply for Admission & Enrollment
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Submit your admission application to secure your seat. You can also upload your tuition payment voucher (eSewa, Khalti, ConnectIPS, or Bank Deposit Slip) for fast-track verified enrollment.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation Tabs */}
        {!successReference && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              type="button"
              onClick={() => setActiveFormTab('new')}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeFormTab === 'new'
                  ? 'bg-[#12315A] text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>New Admission Application</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFormTab('existing_proof')}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeFormTab === 'existing_proof'
                  ? 'bg-[#12315A] text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Receipt className="w-4 h-4 text-amber-500" />
              <span>Already Applied? Upload Payment Proof</span>
            </button>
          </div>
        )}

        {successReference ? (
          /* Success Screen */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#12315A]">
                Application Successfully Submitted!
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                Thank you, <strong>{fullName}</strong>. Your application has been logged into the Shikshyalaya Shaikshik Sanstha administration portal.
              </p>
            </div>

            {/* Reference Number Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Official Application Reference Number
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xl sm:text-2xl font-black text-[#12315A] tracking-wider">
                  {successReference}
                </span>
                <button
                  onClick={handleCopyRef}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Copy reference number"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Please quote this reference number during telephone or WhatsApp follow-up.
              </p>
              <p className="text-xs font-bold text-blue-700 pt-1">
                Admissions Desk: <a href="tel:+9779767648342" className="underline hover:text-blue-900">+977 9767648342</a>
              </p>
            </div>

            {/* Payment Proof Status Banner */}
            {submittedWithPayment ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-left text-xs text-emerald-900 space-y-2 max-w-lg mx-auto">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <h4 className="font-bold text-sm text-emerald-950">Payment Proof Attached for Verification</h4>
                </div>
                <p className="text-emerald-800 leading-relaxed">
                  You uploaded a payment voucher via <strong>{paymentMethod}</strong> (Amount: <strong>NPR {paymentAmount || 'Recorded'}</strong>, Ref: <strong>{transactionReference || 'Attached'}</strong>).
                </p>
                <p className="text-[11px] text-emerald-700">
                  Our accounts desk will verify the transaction against the institute statement within regular office hours and activate your full enrolled student portal access.
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left text-xs text-amber-900 space-y-1.5 max-w-lg mx-auto">
                <p className="font-bold">Tuition Fee Payment Pending</p>
                <p className="text-slate-600">
                  You have submitted a preliminary inquiry. To complete your enrollment and unlock study materials, please transfer the fee via eSewa / Khalti / Bank or pay at our campus desk.
                </p>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 text-left text-xs text-slate-700 space-y-2 max-w-lg mx-auto">
              <h4 className="font-bold text-sm text-[#12315A]">What Happens Next?</h4>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                <li>Our academic coordinator will contact you at <strong>{phone}</strong> to confirm your batch timings.</li>
                <li>Your enrolled student access will be activated upon verification of your payment voucher.</li>
                <li>Authorized study materials, revision questions, and live lectures will be unlocked for your enrolled course.</li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/student/login"
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow flex items-center gap-1.5"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Go to Student Portal Login</span>
              </Link>
              <button
                onClick={handleResetForm}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Submit Another Application
              </button>
              <Link
                to="/"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        ) : activeFormTab === 'existing_proof' ? (
          /* EXISTING INQUIRY PAYMENT PROOF UPLOAD SCREEN */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
            <div className="bg-[#12315A] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-400" />
                  <span>Upload Payment Proof for Existing Application</span>
                </h2>
                <p className="text-xs text-blue-200 mt-1">
                  If you already applied online or at our campus desk, attach your payment voucher here to verify enrollment.
                </p>
              </div>
              <div className="text-xs text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Fast-track Student Verification</span>
              </div>
            </div>

            <div className="p-6 sm:p-10 space-y-6 text-xs sm:text-sm">
              {existingSuccessMessage ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-emerald-950">Payment Voucher Uploaded Successfully!</h3>
                  <p className="text-xs text-emerald-800 max-w-md mx-auto">
                    {existingSuccessMessage} Our administration desk will cross-check the voucher and grant your enrolled student portal access.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <Link
                      to="/student/login"
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#12315A] hover:bg-blue-900 transition-colors"
                    >
                      Go to Student Portal
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setFoundInquiry(null);
                        setExistingSuccessMessage('');
                        setLookupQuery('');
                        handleRemovePaymentProof();
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                    >
                      Lookup Another Application
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step 1: Look up applicant by Ref or Phone */}
                  <form onSubmit={handleLookupApplication} className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <label className="block font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Step 1: Find Your Admission Application
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Enter Reference ID (e.g. SSS-ADM-2026-1001) or Mobile Number"
                        value={lookupQuery}
                        onChange={(e) => setLookupQuery(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#12315A] hover:bg-blue-900 transition-colors text-xs cursor-pointer"
                      >
                        Find Application
                      </button>
                    </div>
                    {lookupError && (
                      <p className="text-xs text-rose-600 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{lookupError}</span>
                      </p>
                    )}
                  </form>

                  {foundInquiry && (
                    <form onSubmit={handleSubmitExistingPaymentProof} className="space-y-6 pt-2 animate-fadeIn">
                      {/* Application Found Banner */}
                      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-200 text-blue-900">
                            Ref: {foundInquiry.referenceNumber}
                          </span>
                          <h4 className="text-base font-bold text-slate-900 mt-1">{foundInquiry.fullName}</h4>
                          <p className="text-slate-600">
                            Course: <strong>{foundInquiry.courseName}</strong> ({foundInquiry.board}) • {foundInquiry.academicLevel}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 block sm:inline">
                            Current Status: {foundInquiry.status}
                          </span>
                          {foundInquiry.hasPaymentProof && (
                            <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                              Payment slip previously attached. You may upload an updated voucher below.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Official Payment Accounts */}
                      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-2.5 text-xs">
                        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-amber-600" />
                          <span>Official Payment Channels (Shikshyalaya Shaikshik Sanstha)</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                eSewa Wallet
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyAccount('eSewa', '9767648342')}
                                className="text-[10px] text-blue-700 hover:underline font-semibold cursor-pointer"
                              >
                                {copiedPaymentAccount === 'eSewa' ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                            <p className="font-mono font-bold text-slate-900 text-xs">9767648342</p>
                            <p className="text-[10px] text-slate-500 truncate">Shikshyalaya Shaikshik Sanstha</p>
                          </div>

                          <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                                Khalti Wallet
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyAccount('Khalti', '9767648342')}
                                className="text-[10px] text-blue-700 hover:underline font-semibold cursor-pointer"
                              >
                                {copiedPaymentAccount === 'Khalti' ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                            <p className="font-mono font-bold text-slate-900 text-xs">9767648342</p>
                            <p className="text-[10px] text-slate-500 truncate">Shikshyalaya Shaikshik Sanstha</p>
                          </div>

                          <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                              Bank / ConnectIPS
                            </span>
                            <p className="font-bold text-slate-900 text-xs truncate">Shikshyalaya Sanstha</p>
                            <p className="text-[10px] text-slate-500">Inquire via WhatsApp for A/C</p>
                          </div>
                        </div>
                      </div>

                      {/* Upload Box */}
                      <div className="space-y-4">
                        {!hasPaymentProof ? (
                          <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center transition-colors bg-white cursor-pointer group">
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleFileChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="space-y-2 pointer-events-none">
                              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800">
                                  Click or drag & drop payment voucher screenshot
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WEBP, PDF (Max 5MB)</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-white rounded-2xl border border-emerald-300 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {paymentProofUrl.startsWith('data:image') && (
                                <img
                                  src={paymentProofUrl}
                                  alt="Voucher"
                                  className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                                />
                              )}
                              <div>
                                <p className="text-xs font-bold text-slate-900">{paymentProofName}</p>
                                <p className="text-[11px] text-emerald-700 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Ready to submit</span>
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemovePaymentProof}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* Quick Demo Slips for Instant Testing */}
                        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                          <span className="text-slate-500 text-[11px]">Testing demo?</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleUseSamplePaymentVoucher('eSewa')}
                              className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold cursor-pointer"
                            >
                              + Attach eSewa Demo
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUseSamplePaymentVoucher('Khalti')}
                              className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-300 text-[10px] font-bold cursor-pointer"
                            >
                              + Attach Khalti Demo
                            </button>
                          </div>
                        </div>

                        {/* Voucher Metadata Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1 text-xs">Payment Method</label>
                            <select
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value as any)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                            >
                              <option value="eSewa">eSewa Mobile Wallet</option>
                              <option value="Khalti">Khalti Digital Wallet</option>
                              <option value="Bank Transfer / ConnectIPS">Bank Transfer / ConnectIPS</option>
                              <option value="Cash / Campus Desk">Cash at Campus Desk</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1 text-xs">Deposited Amount (NPR)</label>
                            <input
                              type="text"
                              placeholder="e.g. 5000"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1 text-xs">Transaction ID / Ref</label>
                            <input
                              type="text"
                              placeholder="e.g. ESW-1928374"
                              value={transactionReference}
                              onChange={(e) => setTransactionReference(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1 text-xs">Payment Remarks (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. Paid for 1st installment morning batch"
                            value={paymentRemarks}
                            onChange={(e) => setPaymentRemarks(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full py-3.5 rounded-xl font-bold text-white bg-[#12315A] hover:bg-blue-900 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-4 h-4 text-amber-400" />
                          <span>{submitting ? 'Submitting Voucher...' : 'Upload Payment Voucher & Request Verification'}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          /* Form State */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Top Bar Indicator */}
            <div className="bg-[#12315A] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Student Admission & Enrollment Application</h2>
                <p className="text-xs text-blue-200 mt-1">
                  Complete your details and optionally upload payment proof for immediate student verification.
                </p>
              </div>

              <div className="text-xs text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Verified Official Institute Portal</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8 text-xs sm:text-sm">
              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs uppercase tracking-wide">Submission Error</p>
                    <p className="text-xs">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* 1. Student Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#12315A] border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>1. Student Personal Details</span>
                  <span className="text-[11px] text-slate-400 font-normal">Step 1 of 4</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar Adhikari"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Mobile / Telephone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9767648342 / 98XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="student@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Current City / Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kathmandu / Lalitpur / Pokhara"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Academic Course & Term Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#12315A] border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>2. Academic Program & Subject Selection</span>
                  <span className="text-[11px] text-slate-400 font-normal">Step 2 of 4</span>
                </h3>

                {/* Syllabus / Course Type Selector (Shown only for Academic Courses with Old/New variants) */}
                {currentCourse?.category !== 'loksewa' ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-slate-800 text-xs">
                        Curriculum / Syllabus Category <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-semibold text-slate-500">
                        Regular Semester or Backpaper Exam
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCourseType('New Course');
                          if (selectedCourseSlug.endsWith('-old')) {
                            const regularSlug = selectedCourseSlug.replace('-old', '');
                            if (courses.some((c) => c.slug === regularSlug)) {
                              setSelectedCourseSlug(regularSlug);
                            }
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          courseType === 'New Course'
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#12315A]">New Course</span>
                          {courseType === 'New Course' && (
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Regular Current Semester / CBCS Annual Syllabus
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCourseType('Old Course');
                          const oldSlug = `${selectedCourseSlug}-old`;
                          if (courses.some((c) => c.slug === oldSlug)) {
                            setSelectedCourseSlug(oldSlug);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          courseType === 'Old Course'
                            ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-amber-900">Old Course (Backpaper Prep)</span>
                          {courseType === 'Old Course' && (
                            <span className="w-2 h-2 rounded-full bg-amber-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Annual / Prior Syllabus for Backlog & Chance Exams
                        </p>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
                        <Shield className="w-4 h-4 text-amber-600" />
                        <span>लोक सेवा आयोग / सरकारी सेवा परीक्षा तयारी (Public Service Commission)</span>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                        Official PSC Syllabus
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-900">
                      You are enrolling in specialized Loksewa preparation. Includes daily live whiteboard streaming, OMR mock tests, handwritten PDF subjective evaluation, and authentic study packages.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>{currentCourse?.category === 'loksewa' ? 'Target Loksewa Examination' : 'Target Academic Course'} <span className="text-rose-500">*</span></span>
                      {currentCourse?.category === 'loksewa' ? (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200">
                          {currentCourse.level}
                        </span>
                      ) : currentCourse?.courseType && (
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                          currentCourse.courseType === 'Old Course'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {currentCourse.courseType}
                        </span>
                      )}
                    </label>
                    <select
                      value={selectedCourseSlug}
                      onChange={(e) => {
                        const newSlug = e.target.value;
                        setSelectedCourseSlug(newSlug);
                        const c = courses.find((item) => item.slug === newSlug);
                        if (c?.courseType) {
                          setCourseType(c.courseType);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    >
                      <optgroup label="🏦 Loksewa Banking Preparation (सरकारी बैंक तयारी - RBB, NBL & NRB)">
                        {courses.filter((c) => c.category === 'loksewa' && (c.slug.includes('rbb') || c.slug.includes('nbl') || c.slug.includes('bank'))).map((course) => (
                          <option key={course.slug} value={course.slug}>
                            {course.title}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🛡️ Loksewa Civil & Provincial Services (निजामती तथा स्थानीय तह - ६औं तह, अधिकृत, ना.सु., खरिदार, TSC)">
                        {courses.filter((c) => c.category === 'loksewa' && !(c.slug.includes('rbb') || c.slug.includes('nbl') || c.slug.includes('bank'))).map((course) => (
                          <option key={course.slug} value={course.slug}>
                            {course.title}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Academic Degree Programs (TU, PU, NEB)">
                        {courses.filter((c) => c.category !== 'loksewa').map((course) => (
                          <option key={course.slug} value={course.slug}>
                            {course.title} ({course.board}) {course.courseType ? `[${course.courseType}]` : ''}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>{currentCourse?.category === 'loksewa' ? 'Target Paper / Examination Level' : 'Academic Year / Semester / Term'} <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] text-blue-600 font-semibold">{availableTerms.length} options available</span>
                    </label>
                    <select
                      value={selectedTerm}
                      onChange={(e) => setSelectedTerm(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    >
                      {availableTerms.map((term) => (
                        <option key={term} value={term}>
                          {term}
                        </option>
                      ))}
                      <option value="ALL">All Papers / Complete Course Package</option>
                    </select>
                  </div>
                </div>

                {/* Specific Subjects Selection Box */}
                <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#12315A] flex items-center gap-1.5">
                        <BookCheck className="w-4 h-4 text-emerald-600" />
                        <span>Choose Specific Subject(s) to Study ({selectedTerm || 'All'})</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Click on subjects you wish to study (you can pick individual subjects or full term):
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleSelectAllTermSubjects}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-700 bg-blue-100/80 hover:bg-blue-200 transition-colors cursor-pointer"
                      >
                        Select All ({displayedSubjects.length})
                      </button>
                      <button
                        type="button"
                        onClick={handleClearTermSubjects}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-600 bg-slate-200/80 hover:bg-slate-300 transition-colors cursor-pointer"
                      >
                        Deselect
                      </button>
                    </div>
                  </div>

                  {/* Interactive Subjects Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {displayedSubjects.map((s, idx) => {
                      const subjectLabel = s.code ? `${s.code}: ${s.name}` : s.name;
                      const isSelected = selectedSubjects.includes(subjectLabel);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleSubject(subjectLabel)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-1 ring-blue-500'
                              : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`mt-0.5 shrink-0 rounded ${isSelected ? 'text-blue-700' : 'text-slate-400'}`}>
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            {s.code && (
                              <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 border border-slate-200 mb-0.5">
                                {s.code}
                              </span>
                            )}
                            <p className="text-xs font-bold text-slate-900 leading-tight">
                              {s.name}
                            </p>
                            {s.description && (
                              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                {s.description}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Subjects Summary Pills */}
                  {selectedSubjects.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#12315A] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Selected Specific Subjects ({selectedSubjects.length})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedSubjects([])}
                          className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
                        >
                          Clear all selections
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {selectedSubjects.map((subLabel) => (
                          <span
                            key={subLabel}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-blue-300 text-blue-900 shadow-xs"
                          >
                            <span>{subLabel}</span>
                            <button
                              type="button"
                              onClick={() => toggleSubject(subLabel)}
                              className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional / Custom Subject or Back-Paper */}
                  <div className="pt-2 border-t border-slate-200/80 space-y-1">
                    <label className="block font-bold text-slate-700 text-xs">
                      Additional / Back-Paper / Specific Custom Subjects (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Back paper in Statistics, or specific numerical chapter only..."
                      value={customSubjectText}
                      onChange={(e) => setCustomSubjectText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-slate-400">
                      If you need coaching for back papers from previous terms or specific modules, mention them here.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Learning Preferences */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#12315A] border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>3. Learning Mode & Schedule Preference</span>
                  <span className="text-[11px] text-slate-400 font-normal">Step 3 of 4</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Preferred Class Mode <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={preferredMode}
                      onChange={(e) => setPreferredMode(e.target.value as ClassMode)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Offline">Physical Classroom (Offline in Kathmandu)</option>
                      <option value="Online">Live Interactive Online Classes</option>
                      <option value="Hybrid">Hybrid (Classroom + Online Streaming)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Preferred Batch Shift
                    </label>
                    <select
                      value={preferredShift}
                      onChange={(e) => setPreferredShift(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Morning">Morning Class (5:00 AM – 8:00 AM)</option>
                      <option value="Evening">Evening Class (7:00 PM – 10:00 PM)</option>
                      <option value="Day">Day / Afternoon Batch</option>
                      <option value="Flexible">Flexible / Weekend Timing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Additional Comments or Questions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Mention any specific preparation deadlines, back-exam requirements, or college schedule..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 4. Tuition Fee Payment Proof & Deposit Receipt */}
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#12315A] flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-amber-600" />
                    <span>4. Tuition Fee Payment Proof (For Verified Student Enrollment)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-normal">Step 4 of 4</span>
                </div>

                <div className="bg-gradient-to-r from-amber-50/80 via-blue-50/40 to-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        Fast-Track Student Verification & Course Unlock
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        To immediately verify your enrollment and unlock study materials and video lectures, upload a screenshot or photo of your payment voucher (eSewa, Khalti, ConnectIPS, or Bank Deposit Slip).
                      </p>
                    </div>
                  </div>

                  {/* Institute Official Payment Accounts Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 inline-block">
                          eSewa Wallet
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount('eSewa', '9767648342')}
                          className="text-[10px] text-blue-700 hover:underline font-semibold cursor-pointer"
                        >
                          {copiedPaymentAccount === 'eSewa' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p className="font-mono font-bold text-slate-900 text-sm">9767648342</p>
                      <p className="text-[10px] text-slate-500">Name: Shikshyalaya Shaikshik Sanstha</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 inline-block">
                          Khalti Digital Wallet
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount('Khalti', '9767648342')}
                          className="text-[10px] text-blue-700 hover:underline font-semibold cursor-pointer"
                        >
                          {copiedPaymentAccount === 'Khalti' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p className="font-mono font-bold text-slate-900 text-sm">9767648342</p>
                      <p className="text-[10px] text-slate-500">Name: Shikshyalaya Shaikshik Sanstha</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 inline-block">
                        Bank Transfer / ConnectIPS
                      </span>
                      <p className="font-bold text-slate-900 text-xs truncate">SHIKSHYALAYA SHAIKSHIK SANSTHA</p>
                      <p className="text-[10px] text-slate-500">Inquire via WhatsApp for direct A/C details</p>
                    </div>
                  </div>
                </div>

                {/* Upload Controls & Fields */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                  {uploadError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {!hasPaymentProof ? (
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-700 mb-2">
                        Upload Payment Voucher / Transfer Screenshot
                      </label>
                      <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center transition-colors bg-white cursor-pointer group">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="space-y-2 pointer-events-none">
                          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              Click or drag and drop your payment screenshot here
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Supports JPG, PNG, WEBP, or PDF (Max 5MB)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Demo Quick Voucher Attach */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs">
                        <span className="text-slate-500 text-[11px] font-medium">Testing or instant demo?</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleUseSamplePaymentVoucher('eSewa')}
                            className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 text-[10px] font-bold cursor-pointer"
                          >
                            + Attach eSewa Demo Slip
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUseSamplePaymentVoucher('Khalti')}
                            className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-300 hover:bg-purple-100 text-[10px] font-bold cursor-pointer"
                          >
                            + Attach Khalti Demo Slip
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUseSamplePaymentVoucher('Bank Transfer / ConnectIPS')}
                            className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100 text-[10px] font-bold cursor-pointer"
                          >
                            + Attach ConnectIPS Slip
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Uploaded Payment Proof Card */
                    <div className="p-4 bg-white rounded-2xl border border-emerald-300 shadow-sm space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {paymentProofUrl.startsWith('data:image') ? (
                            <img
                              src={paymentProofUrl}
                              alt="Payment voucher"
                              className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 cursor-pointer"
                              onClick={() => setPreviewModalOpen(true)}
                              title="Click to view full preview"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                              <Receipt className="w-6 h-6" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                Receipt Attached
                              </span>
                              <span className="text-[11px] text-slate-400">{paymentProofSize}</span>
                            </div>
                            <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                              {paymentProofName}
                            </p>
                            <p className="text-[11px] text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Ready to submit for verification</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {paymentProofUrl.startsWith('data:image') && (
                            <button
                              type="button"
                              onClick={() => setPreviewModalOpen(true)}
                              className="p-2 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="View receipt preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleRemovePaymentProof}
                            className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove attachment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Details Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-xs">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="eSewa">eSewa Mobile Wallet</option>
                        <option value="Khalti">Khalti Digital Wallet</option>
                        <option value="Bank Transfer / ConnectIPS">Bank Transfer / ConnectIPS</option>
                        <option value="Cash / Campus Desk">Cash at Campus Desk</option>
                        <option value="Other">Other Electronic Method</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-xs">
                        Deposited Amount (NPR)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 5000 or 12000"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-xs">
                        Transaction ID / Reference
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ESW-1928374 or voucher no."
                        value={transactionReference}
                        onChange={(e) => setTransactionReference(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-xs">
                      Payment Note / Remarks (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Paid from father's eSewa account (Subhash Adhikari) for full 5th sem package"
                      value={paymentRemarks}
                      onChange={(e) => setPaymentRemarks(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Consent and Submit */}
              <div className="space-y-4 pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentPrivacy}
                    onChange={(e) => setConsentPrivacy(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-600 leading-snug">
                    I confirm that the information and payment details provided are genuine, and I agree to receive batch updates and academic information from Shikshyalaya Shaikshik Sanstha.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-700 via-[#12315A] to-[#12315A] hover:from-blue-800 hover:to-slate-900 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-5 h-5 text-amber-400" />
                  <span>
                    {submitting
                      ? 'Registering Application...'
                      : hasPaymentProof
                      ? 'Submit Application with Payment Proof'
                      : 'Submit Admission Application'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Modal for full receipt preview */}
      {previewModalOpen && paymentProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 relative overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900">Payment Voucher Preview</h4>
              <p className="text-xs text-slate-500">{paymentProofName} ({paymentProofSize})</p>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-2 flex items-center justify-center">
              <img
                src={paymentProofUrl}
                alt="Payment proof full preview"
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#12315A] hover:bg-blue-900 cursor-pointer"
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
