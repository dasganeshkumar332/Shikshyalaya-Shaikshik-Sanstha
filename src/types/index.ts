export type CourseCategory = '+2' | 'bachelor' | 'master';

export type UniversityBoard = 'Tribhuvan University (TU)' | 'Pokhara University (PU)' | 'National Examinations Board (NEB)';

export type ClassMode = 'Online' | 'Offline' | 'Hybrid';

export type InquiryStatus = 'New' | 'Contacted' | 'Follow-up Required' | 'Admission Confirmed' | 'Verified & Enrolled' | 'Closed';

export type CourseType = 'New Course' | 'Old Course';

export interface CourseSubject {
  name: string;
  code?: string;
  description: string;
  semesterOrYear?: string;
  courseType?: 'New Course' | 'Old Course' | 'Both';
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  devanagariTitle?: string;
  courseType?: CourseType;
  syllabusVersion?: string;
  hasOldCourseOption?: boolean;
  newCourseNotes?: string;
  oldCourseNotes?: string;
  shortDescription: string;
  longDescription: string;
  category: CourseCategory;
  board: UniversityBoard;
  duration: string;
  level: string;
  eligibleStudents: string[];
  subjectsOffered: CourseSubject[];
  classModes: ClassMode[];
  schedule: string;
  feeInfo: string;
  featured: boolean;
  published: boolean;
  assignedTeacherIds: string[];
  features: string[];
  metaDescription: string;
}

export interface Teacher {
  id: string;
  name: string;
  devanagariName?: string;
  designation: string;
  qualification: string;
  experience: string;
  specialization: string[];
  assignedCourseSlugs: string[];
  bio: string;
  email?: string;
  phone?: string;
  avatarUrl: string;
  published: boolean;
}

export interface AdmissionInquiry {
  id: string;
  referenceNumber: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  courseSlug: string;
  courseName: string;
  courseType?: CourseType;
  syllabusVersion?: string;
  board?: string;
  academicLevel?: string;
  subjectsOfInterest?: string;
  preferredMode: ClassMode;
  preferredShift: 'Morning' | 'Day' | 'Evening' | 'Flexible';
  message?: string;
  hasPaymentProof?: boolean;
  paymentProofUrl?: string;
  paymentProofName?: string;
  paymentProofSize?: string;
  paymentMethod?: 'eSewa' | 'Khalti' | 'Bank Transfer / ConnectIPS' | 'Cash / Campus Desk' | 'Other';
  paymentAmount?: string;
  transactionReference?: string;
  paymentRemarks?: string;
  paymentVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  assignedStudentId?: string;
  status: InquiryStatus;
  adminNotes: {
    date: string;
    text: string;
    by: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'Unread' | 'Replied' | 'Archived';
  createdAt: string;
}

export interface Notice {
  id: string;
  title: string;
  devanagariTitle?: string;
  category: 'Admission' | 'New Courses' | 'Class Schedules' | 'Exam Prep' | 'Holidays' | 'Academic Events' | 'General';
  content: string;
  publishDate: string;
  expiryDate?: string;
  important: boolean;
  published: boolean;
  attachmentName?: string;
  targetCourses?: string[];
}

export interface StudyMaterial {
  id: string;
  title: string;
  courseSlug: string;
  courseName: string;
  courseType?: CourseType;
  board: string;
  subject: string;
  semesterOrYear: string;
  resourceType: 'PDF Notes' | 'Lecture Slides' | 'Practice Questions' | 'Model Question Papers' | 'Past Papers' | 'Assignments' | 'Revision Materials' | 'Recorded Videos';
  accessLevel: 'Public' | 'Enrolled Students' | 'Restricted';
  fileSize: string;
  uploadDate: string;
  downloadUrl?: string;
  description: string;
  published: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Classes' | 'Teachers' | 'Events' | 'Seminars' | 'Workshops' | 'Student Activities';
  imageUrl: string;
  caption: string;
  date: string;
}

export interface SiteSettings {
  instituteName: string;
  instituteDevanagariName: string;
  tagline: string;
  altTagline: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  contactNumber: string;
  contactNumberAlt?: string;
  emailAddress: string;
  physicalAddress: string;
  locationArea: string;
  city: string;
  country: string;
  officeHours: string;
  whatsappNumber: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  noticeMarqueeText: string;
  isNoticeMarqueeActive: boolean;
  onlineClassesEnabled: boolean;
  registrationOpen: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'student' | 'teacher';
  studentId?: string;
  enrolledCourseSlugs?: string[];
}

export interface StudentGroupMember {
  id: string;
  studentId?: string;
  rollNumber?: string;
  fullName: string;
  phone: string;
  email?: string;
  referenceNumber?: string;
  enrolledCourseSlug?: string;
  semesterOrYear?: string;
  academicLevel?: string;
  source?: string;
  addedAt: string;
  notes?: string;
}

export interface StudentNoticeBroadcast {
  id: string;
  groupId?: string;
  groupTitle?: string;
  title: string;
  message: string;
  urgency: 'Normal' | 'Urgent' | 'Emergency Alert' | 'Important' | 'Urgent / Exam Alert';
  channels?: ('In-App Notice' | 'WhatsApp' | 'SMS')[];
  sentAt: string;
  sentBy: string;
}

export interface StudentGroup {
  id: string;
  title: string;
  name?: string; // alias for title
  code?: string;
  courseSlug: string;
  courseName: string;
  courseType?: CourseType;
  syllabusVersion?: string;
  academicLevel: string;
  shift: 'Morning' | 'Day' | 'Evening' | 'All Shifts' | 'Flexible' | 'Online';
  batchYear: string;
  academicYearOrBatch?: string; // alias for batchYear
  description?: string;
  whatsappGroupUrl?: string;
  whatsappGroupLink?: string; // alias for whatsappGroupUrl
  telegramGroupUrl?: string;
  coordinatorName: string;
  coordinatorPhone: string;
  members: StudentGroupMember[];
  broadcasts: StudentNoticeBroadcast[];
  createdAt: string;
  updatedAt: string;
}

export interface MockTest {
  id: string;
  title: string;
  courseSlug: string;
  courseName: string;
  courseType: CourseType;
  semesterOrYear?: string;
  subject: string;
  subjectCode?: string;
  examDate?: string;
  startTime?: string;
  durationMinutes: number;
  fullMarks: number;
  passMarks: number;
  instructions: string[] | string;
  questionPaperUrl?: string;
  questionPaperName?: string;
  questionFileName?: string;
  questionPaperSize?: string;
  questionText?: string;
  modelAnswerUrl?: string;
  status?: 'Upcoming' | 'Live / In-Progress' | 'Evaluation Closed' | 'Archived';
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MockTestSubmission {
  id: string;
  mockTestId: string;
  testId?: string;
  mockTestTitle?: string;
  testTitle?: string;
  courseSlug: string;
  courseType?: CourseType;
  subject?: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  rollNumber?: string;
  submittedAt: string;
  timeTakenSeconds: number;
  isLateSubmission: boolean;
  answerFileUrl?: string;
  answerFileName?: string;
  answerFileSize?: string;
  typedAnswers?: string;
  marksObtained?: number;
  evaluationStatus: 'Submitted' | 'Under Review' | 'Evaluated';
  evaluatedBy?: string;
  evaluatedAt?: string;
  feedbackRemarks?: string;
  evaluatedPaperUrl?: string;
  evaluatedPaperName?: string;
}

