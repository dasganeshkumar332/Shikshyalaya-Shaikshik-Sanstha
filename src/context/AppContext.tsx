import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Course,
  Teacher,
  Notice,
  StudyMaterial,
  GalleryItem,
  SiteSettings,
  AdmissionInquiry,
  ContactMessage,
  UserProfile,
  InquiryStatus,
  StudentGroup,
  StudentGroupMember,
  StudentNoticeBroadcast,
  MockTest,
  MockTestSubmission,
  MockTestRegistration,
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_COURSES,
  INITIAL_TEACHERS,
  INITIAL_NOTICES,
  INITIAL_GALLERY,
  INITIAL_INQUIRIES,
  INITIAL_STUDENT_GROUPS,
  INITIAL_MOCK_TESTS,
  INITIAL_MOCK_TEST_SUBMISSIONS,
  INITIAL_MOCK_TEST_REGISTRATIONS,
} from '../data/initialData';
import { checkSupabaseConnection, SupabaseConnectionStatus } from '../lib/supabase';
import {
  putStoredFile,
  getStoredFile,
  deleteStoredFile,
  IDB_MARKER,
} from '../utils/fileStorage';
import { normalizeMobileNumber, mobileMatches } from '../utils/phone';
import {
  saveInquiryToSupabase,
  saveMockSubmissionToSupabase,
  saveMockRegistrationToSupabase,
  deleteMockRegistrationFromSupabase,
  fetchMockRegistrationsFromSupabase,
  saveContactMessageToSupabase,
  saveStudentGroupToSupabase,
  saveSettingsToSupabase,
  syncAllDataToSupabase,
  fetchInquiriesFromSupabase,
  fetchInquiriesFromSupabaseWithMeta,
  fetchSubmissionsFromSupabase,
  deleteInquiryFromSupabase,
  deleteMultipleInquiriesFromSupabase,
  clearAllInquiriesFromSupabase,
  deleteMockSubmissionFromSupabase,
  clearAllMockSubmissionsFromSupabase,
  clearAllMockRegistrationsFromSupabase,
  deleteStudentGroupFromSupabase,
  clearAllStudentGroupsFromSupabase,
  deleteMockTestFromSupabase,
  clearAllMockTestsFromSupabase,
  deleteNoticeFromSupabase,
  clearAllNoticesFromSupabase,
  saveStudyMaterialToSupabase,
  deleteStudyMaterialFromSupabase,
  clearAllStudyMaterialsFromSupabase,
  fetchStudyMaterialsFromSupabase,
  isLegacySeededMaterialId,
} from '../services/supabaseService';

interface AppContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  resetSettings: () => void;
  
  courses: Course[];
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  togglePublishCourse: (id: string) => void;
  deleteCourse: (id: string) => void;
  clearAllCourses: () => void;
  restoreDefaultCourses: () => number;

  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  clearAllTeachers: () => void;

  notices: Notice[];
  addNotice: (notice: Omit<Notice, 'id'>) => void;
  updateNotice: (id: string, updates: Partial<Notice>) => void;
  deleteNotice: (id: string) => void;
  clearAllNotices: () => void;

  studyMaterials: StudyMaterial[];
  addStudyMaterial: (mat: Omit<StudyMaterial, 'id'>) => void;
  updateStudyMaterial: (id: string, updates: Partial<StudyMaterial>) => void;
  deleteStudyMaterial: (id: string) => void;
  clearAllStudyMaterials: () => void;
  resolveMaterialUrl: (mat: StudyMaterial) => Promise<string | undefined>;

  gallery: GalleryItem[];
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  deleteGalleryItem: (id: string) => void;

  inquiries: AdmissionInquiry[];
  submitAdmissionInquiry: (inquiryData: Omit<AdmissionInquiry, 'id' | 'referenceNumber' | 'status' | 'adminNotes' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateInquiryStatus: (id: string, status: InquiryStatus, note?: string) => void;
  verifyAndEnrollApplicant: (inquiryId: string, customStudentId?: string, note?: string, batchId?: string) => void;
  attachPaymentProofToInquiry: (
    referenceOrPhone: string,
    paymentData: {
      paymentProofUrl: string;
      paymentProofName: string;
      paymentProofSize: string;
      paymentMethod: 'eSewa' | 'Khalti' | 'Bank Transfer / ConnectIPS' | 'Cash / Campus Desk' | 'Other';
      paymentAmount: string;
      transactionReference: string;
      paymentRemarks?: string;
    }
  ) => { success: boolean; message: string; inquiry?: AdmissionInquiry };
  addInquiryNote: (id: string, noteText: string) => void;
  assignInquiryBatch: (inquiryId: string, batchId: string, options?: { replaceOtherCourseBatches?: boolean }) => void;
  deleteInquiry: (id: string) => Promise<void>;
  deleteMultipleInquiries: (ids: string[]) => Promise<void>;
  clearAllInquiries: () => Promise<void>;
  refreshInquiries: () => Promise<{ count: number; added: number; error?: string }>;
  resolveInquiryProofUrl: (inq: AdmissionInquiry) => Promise<string | undefined>;
  exportInquiriesCSV: () => void;

  contactMessages: ContactMessage[];
  submitContactMessage: (msg: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>) => Promise<void>;

  studentGroups: StudentGroup[];
  addStudentGroup: (group: Partial<StudentGroup>) => StudentGroup;
  updateStudentGroup: (id: string, updates: Partial<StudentGroup>) => void;
  deleteStudentGroup: (id: string) => void;
  clearAllStudentGroups: () => void;
  addMemberToGroup: (groupId: string, member: Omit<StudentGroupMember, 'id' | 'addedAt'>) => void;
  bulkAddMembersToGroup: (
    groupId: string,
    data: string | Array<Omit<StudentGroupMember, 'id' | 'addedAt'>>
  ) => number;
  importVerifiedInquiriesToGroup: (groupId: string, inquiryIds?: string[]) => number;
  removeMemberFromGroup: (groupId: string, memberId: string) => void;
  moveMemberToBatch: (fromGroupId: string, memberId: string, toGroupId: string) => void;
  sendGroupBroadcast: (
    groupId: string,
    broadcast: {
      title: string;
      message: string;
      urgency?: 'Normal' | 'Urgent' | 'Emergency Alert' | 'Important' | 'Urgent / Exam Alert';
      channels?: ('In-App Notice' | 'WhatsApp' | 'SMS')[];
      sentBy?: string;
      groupId?: string;
      groupTitle?: string;
    }
  ) => void;
  deleteGroupBroadcast: (groupId: string, broadcastId: string) => void;

  // Mock Tests & Timed Examinations
  mockTests: MockTest[];
  addMockTest: (testData: Partial<MockTest>) => MockTest;
  updateMockTest: (id: string, updates: Partial<MockTest>) => void;
  deleteMockTest: (id: string) => void;
  clearAllMockTests: () => void;
  togglePublishMockTest: (id: string) => void;
  startMockExamTimer: (id: string, options?: { scheduledStartTime?: string; durationMinutes?: number; uploadGraceMinutes?: number }) => void;
  extendMockExamTimer: (id: string, extraMinutes: number, reason?: string) => void;
  concludeMockExamTimer: (id: string) => void;
  resetMockExamTimer: (id: string) => void;

  // Student Submissions & Examiner Feedback
  mockTestSubmissions: MockTestSubmission[];
  deleteMockTestSubmission: (id: string) => void;
  clearAllMockTestSubmissions: () => void;
  submitMockTestAnswer: (submission: Omit<MockTestSubmission, 'id' | 'submittedAt'>) => { success: boolean; submissionId: string; message: string };
  gradeMockTestSubmission: (
    submissionId: string,
    gradeData: {
      marksObtained: number;
      evaluationStatus: 'Submitted' | 'Under Review' | 'Evaluated';
      feedbackRemarks?: string;
      evaluatedBy?: string;
      evaluatedPaperUrl?: string;
      evaluatedPaperName?: string;
    }
  ) => void;
  uploadMockTestResult: (resultData: {
    mockTestId: string;
    studentId: string;
    studentName: string;
    rollNumber?: string;
    studentEmail?: string;
    studentPhone?: string;
    marksObtained: number;
    feedbackRemarks: string;
    evaluatedBy: string;
    answerFileName?: string;
    isLateSubmission?: boolean;
    evaluatedPaperUrl?: string;
    evaluatedPaperName?: string;
  }) => { success: boolean; message: string };

  // Mock Test Registrations (For students interested only in mock tests)
  mockTestRegistrations: MockTestRegistration[];
  registerForMockTest: (data: Omit<MockTestRegistration, 'id' | 'referenceNumber' | 'status' | 'createdAt'>) => MockTestRegistration;
  updateMockTestRegistrationStatus: (id: string, status: MockTestRegistration['status']) => void;
  assignMockRegistrationBatch: (regId: string, batchId: string) => void;
  deleteMockTestRegistration: (id: string) => void;
  clearAllMockTestRegistrations: () => void;
  refreshMockRegistrations: () => Promise<void>;

  currentUser: UserProfile | null;
  loginAsAdmin: (password?: string) => boolean;
  loginAsStudent: (
    studentId: string,
    email: string,
    courseSlugs?: string[],
    studentName?: string,
    enrolledSubjects?: string[]
  ) => boolean;
  updateStudentEnrollment: (courseSlugs: string[]) => void;
  updateStudentEnrolledSubjects: (subjects: string[]) => void;
  isStudentEnrolledInCourse: (courseSlug: string) => boolean;
  isStudentEnrolledInSubject: (courseSlug: string, subjectName: string) => boolean;
  getStudentLiveBatches: () => StudentGroup[];
  getStudentLiveBatchIds: () => string[];
  isStudentAllowedMaterial: (material: StudyMaterial) => boolean;
  isStudentAllowedMockTest: (test: MockTest) => boolean;
  isStudentBatchRestricted: (material: StudyMaterial) => boolean;
  subjectsMatch: (a: string, b: string) => boolean;
  logout: () => void;

  language: 'en' | 'ne';
  toggleLanguage: () => void;

  // Supabase Database Connection & Storage
  supabaseStatus: SupabaseConnectionStatus | null;
  checkSupabaseStatus: () => Promise<SupabaseConnectionStatus>;
  syncAllToSupabase: () => Promise<{ success: boolean; syncedCounts: Record<string, number>; errors: string[] }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'sss_site_settings',
  COURSES: 'sss_courses',
  TEACHERS: 'sss_teachers',
  NOTICES: 'sss_notices',
  MATERIALS: 'sss_materials',
  GALLERY: 'sss_gallery',
  INQUIRIES: 'sss_inquiries',
  CONTACT: 'sss_contact_messages',
  AUTH: 'sss_auth_user',
  LANG: 'sss_lang',
  GROUPS: 'sss_student_groups',
  MOCK_TESTS: 'sss_mock_tests',
  MOCK_SUBMISSIONS: 'sss_mock_submissions',
  MOCK_REGISTRATIONS: 'sss_mock_registrations',
  DELETED_RECORDS: 'sss_deleted_records',
};

type DeletedRecordCategory =
  | 'inquiries'
  | 'mockSubmissions'
  | 'mockRegistrations'
  | 'studyMaterials'
  | 'studentGroups'
  | 'mockTests'
  | 'notices'
  | 'teachers'
  | 'courses';

function readDeletedRecordsMap(): Partial<Record<DeletedRecordCategory, string[]>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_RECORDS);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function getDeletedIdsSet(category: DeletedRecordCategory): Set<string> {
  const map = readDeletedRecordsMap();
  return new Set(Array.isArray(map[category]) ? map[category] : []);
}

function recordDeletedIds(category: DeletedRecordCategory, ids: string[]): void {
  if (!ids.length) return;
  try {
    const map = readDeletedRecordsMap();
    const existing = new Set(Array.isArray(map[category]) ? map[category] : []);
    ids.forEach((id) => {
      if (id) existing.add(id);
    });
    map[category] = Array.from(existing);
    localStorage.setItem(STORAGE_KEYS.DELETED_RECORDS, JSON.stringify(map));
  } catch (err) {
    console.warn('Error persisting deleted record tombstones:', err);
  }
}

function clearDeletedCategory(category: DeletedRecordCategory): void {
  try {
    const map = readDeletedRecordsMap();
    if (map[category]) {
      delete map[category];
      localStorage.setItem(STORAGE_KEYS.DELETED_RECORDS, JSON.stringify(map));
    }
  } catch (err) {
    console.warn('Error clearing deleted record category:', err);
  }
}

const COURSES_RESTORE_KEY = 'sss_courses_restored_all_v4';
const OLD_COURSE_REMOVAL_KEY = 'sss_old_course_removed_v1';
const OBSOLETE_COURSE_SLUGS = new Set([
  'bba-bbm-tu',
  '3-year-bbs-tu',
  'mbs-tu-old',
  'plus-two-old',
  'bbs-tu-old',
]);

function isObsoleteOldCourse(c: Course): boolean {
  return OBSOLETE_COURSE_SLUGS.has(c.slug) || c.courseType === 'Old Course';
}

function mergeCoursesWithDefaults(existingCourses: Course[], forcePublishRestored = false): Course[] {
  const cleaned = existingCourses.filter((c) => !isObsoleteOldCourse(c));
  const initialOrder = INITIAL_COURSES.map((ic) => ic.slug);

  const syncedExisting = cleaned.map((c) => {
    const initial = INITIAL_COURSES.find((ic) => ic.slug === c.slug || ic.id === c.id);
    if (initial) {
      return {
        ...c,
        id: initial.id,
        slug: initial.slug,
        title: initial.title,
        devanagariTitle: initial.devanagariTitle,
        duration: initial.duration,
        level: initial.level,
        shortDescription: initial.shortDescription,
        longDescription: initial.longDescription,
        metaDescription: initial.metaDescription,
        subjectsOffered: initial.subjectsOffered,
        eligibleStudents: initial.eligibleStudents,
        schedule: initial.schedule,
        assignedTeacherIds: initial.assignedTeacherIds,
        courseType: initial.courseType || 'New Course',
        syllabusVersion: initial.syllabusVersion || c.syllabusVersion,
        hasOldCourseOption: initial.hasOldCourseOption ?? false,
        newCourseNotes: initial.newCourseNotes || c.newCourseNotes,
        oldCourseNotes: undefined,
        published: forcePublishRestored ? true : c.published,
      };
    }
    return c;
  });

  const existingSlugs = new Set(syncedExisting.map((c) => c.slug));
  const existingIds = new Set(syncedExisting.map((c) => c.id));
  const missingDefaults = INITIAL_COURSES.filter(
    (ic) => !existingSlugs.has(ic.slug) && !existingIds.has(ic.id)
  ).map((ic) => ({ ...ic, published: true }));

  const combined = [...syncedExisting, ...missingDefaults];
  return combined.sort((a, b) => {
    const idxA = initialOrder.indexOf(a.slug);
    const idxB = initialOrder.indexOf(b.slug);
    return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
  });
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Settings
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!saved) return INITIAL_SETTINGS;
    const parsed = JSON.parse(saved);
    // Guarantee correct contact number, slogan, office hours and updated notice & social links
    parsed.instituteName = INITIAL_SETTINGS.instituteName;
    parsed.tagline = INITIAL_SETTINGS.tagline;
    parsed.altTagline = INITIAL_SETTINGS.altTagline;
    parsed.officeHours = INITIAL_SETTINGS.officeHours;
    parsed.contactNumber = '+977 9767648342';
    parsed.contactNumberAlt = '+977 9767648342';
    parsed.whatsappNumber = '+9779767648342';
    parsed.facebookUrl = INITIAL_SETTINGS.facebookUrl;
    parsed.youtubeUrl = INITIAL_SETTINGS.youtubeUrl;
    parsed.noticeMarqueeText = INITIAL_SETTINGS.noticeMarqueeText;
    parsed.physicalAddress = INITIAL_SETTINGS.physicalAddress;
    if (!parsed.mockExamShifts || !Array.isArray(parsed.mockExamShifts) || parsed.mockExamShifts.length === 0) {
      parsed.mockExamShifts = INITIAL_SETTINGS.mockExamShifts;
    }
    return { ...INITIAL_SETTINGS, ...parsed };
  });

  // Courses
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
    const needsRestoreAll = localStorage.getItem(COURSES_RESTORE_KEY) !== 'true';
    if (saved === null) {
      if (needsRestoreAll) {
        clearDeletedCategory('courses');
        localStorage.setItem(COURSES_RESTORE_KEY, 'true');
      }
      return INITIAL_COURSES;
    }
    try {
      let parsed: Course[] = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        clearDeletedCategory('courses');
        localStorage.setItem(COURSES_RESTORE_KEY, 'true');
        return INITIAL_COURSES;
      }

      if (needsRestoreAll) {
        clearDeletedCategory('courses');
        const restored = mergeCoursesWithDefaults(parsed, true);
        try {
          localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(restored));
          localStorage.setItem(COURSES_RESTORE_KEY, 'true');
        } catch {}
        return restored;
      }

      // Remove obsolete Old Course slugs without resurrecting intentionally deleted courses
      parsed = parsed.filter((c) => !isObsoleteOldCourse(c));
      const initialOrder = INITIAL_COURSES.map((ic) => ic.slug);
      const updated = parsed.map((c) => {
        const initial = INITIAL_COURSES.find((ic) => ic.slug === c.slug);
        if (initial) {
          return {
            ...c,
            title: initial.title,
            devanagariTitle: initial.devanagariTitle,
            duration: initial.duration,
            level: initial.level,
            shortDescription: initial.shortDescription,
            longDescription: initial.longDescription,
            metaDescription: initial.metaDescription,
            subjectsOffered: initial.subjectsOffered,
            eligibleStudents: initial.eligibleStudents,
            schedule: initial.schedule,
            assignedTeacherIds: initial.assignedTeacherIds,
            courseType: initial.courseType || 'New Course',
            syllabusVersion: initial.syllabusVersion || c.syllabusVersion,
            hasOldCourseOption: initial.hasOldCourseOption ?? false,
            newCourseNotes: initial.newCourseNotes || c.newCourseNotes,
            oldCourseNotes: undefined,
          };
        }
        return c;
      });

      return updated.sort((a, b) => {
        const idxA = initialOrder.indexOf(a.slug);
        const idxB = initialOrder.indexOf(b.slug);
        return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
      });
    } catch {
      return INITIAL_COURSES;
    }
  });

  // Teachers
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEACHERS);
      if (saved === null) return INITIAL_TEACHERS;
      let parsed: Teacher[] = JSON.parse(saved);
      if (!Array.isArray(parsed)) return INITIAL_TEACHERS;
      // Filter out old placeholder/sample teachers without resurrecting deleted teachers
      parsed = parsed.filter((t) => t.id !== 'teacher-3' && t.id !== 'teacher-4' && t.id !== 'teacher-5');
      return parsed.map((t) => {
        let updated = { ...t };
        if (updated.assignedCourseSlugs?.includes('bba-bbm-tu')) {
          const migrated = updated.assignedCourseSlugs.filter((s) => s !== 'bba-bbm-tu');
          if (!migrated.includes('bba-tu')) migrated.push('bba-tu');
          if (!migrated.includes('bbm-tu')) migrated.push('bbm-tu');
          updated.assignedCourseSlugs = migrated;
        }
        const initial = INITIAL_TEACHERS.find((it) => it.id === updated.id);
        if (initial) {
          if (
            updated.id === 'teacher-1' &&
            (updated.name === 'Biswonath Karn' || updated.name === 'Bishwonath Karn' || updated.name === 'Bishwonath karn')
          ) {
            updated.name = initial.name;
          }
          if (updated.id === 'teacher-1' && updated.avatarUrl === '/biswonath_karn.jpg') {
            updated.avatarUrl = initial.avatarUrl;
          }
          if (updated.id === 'teacher-2' && updated.avatarUrl === '/ganesh_das.jpg') {
            updated.avatarUrl = initial.avatarUrl;
          }
          if (updated.id === 'teacher-6') {
            if (updated.name === 'Anish Karn') {
              updated.name = initial.name;
            }
            if (updated.qualification === 'Engineering') {
              updated.qualification = initial.qualification;
            }
            if (updated.experience === 'Experienced Faculty in Mathematics & Statistical Analysis') {
              updated.experience = initial.experience;
            }
            if (
              updated.avatarUrl ===
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
            ) {
              updated.avatarUrl = initial.avatarUrl;
            }
          }
          if (updated.id === 'teacher-7') {
            if (
              updated.avatarUrl ===
              'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80'
            ) {
              updated.avatarUrl = initial.avatarUrl;
            }
            if (updated.experience === 'Experienced Faculty in Economics & Business Law') {
              updated.experience = initial.experience;
            }
          }
          // Keep all admin-saved changes (including uploaded avatarUrl, qualification, experience, etc.)
          return {
            ...initial,
            ...updated,
            avatarUrl: updated.avatarUrl || initial.avatarUrl,
            specialization:
              updated.specialization && updated.specialization.length > 0
                ? updated.specialization
                : initial.specialization,
            assignedCourseSlugs:
              updated.assignedCourseSlugs && updated.assignedCourseSlugs.length > 0
                ? updated.assignedCourseSlugs
                : initial.assignedCourseSlugs,
          };
        }
        return updated;
      });
    } catch {
      return INITIAL_TEACHERS;
    }
  });

  // Notices
  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTICES);
    if (saved === null) return INITIAL_NOTICES;
    try {
      const parsed: Notice[] = JSON.parse(saved);
      if (!Array.isArray(parsed)) return INITIAL_NOTICES;
      return parsed.map((n) => {
        if (n.targetCourses?.includes('bba-bbm-tu')) {
          n.targetCourses = n.targetCourses.filter((s) => s !== 'bba-bbm-tu');
          if (!n.targetCourses.includes('bba-tu')) n.targetCourses.push('bba-tu');
          if (!n.targetCourses.includes('bbm-tu')) n.targetCourses.push('bbm-tu');
        }
        return n;
      });
    } catch {
      return INITIAL_NOTICES;
    }
  });

  // Study Materials (Only admin-uploaded resources; zero pre-seeded samples)
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MATERIALS);
      if (saved === null) return [];
      const parsed: StudyMaterial[] = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      const deletedSet = getDeletedIdsSet('studyMaterials');
      return parsed.filter((m) => m && !isLegacySeededMaterialId(m.id) && !deletedSet.has(m.id));
    } catch {
      return [];
    }
  });

  // Gallery
  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GALLERY);
    if (saved === null) return INITIAL_GALLERY;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_GALLERY;
    } catch {
      return INITIAL_GALLERY;
    }
  });

  // Admission Inquiries
  const [inquiries, setInquiries] = useState<AdmissionInquiry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    if (saved === null) return INITIAL_INQUIRIES;
    try {
      const parsed: AdmissionInquiry[] = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_INQUIRIES;
    } catch {
      return INITIAL_INQUIRIES;
    }
  });

  // Contact Messages
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTACT);
    return saved ? JSON.parse(saved) : [];
  });

  // Student Communication Groups
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GROUPS);
    if (saved === null) return INITIAL_STUDENT_GROUPS;
    try {
      const parsed: StudentGroup[] = JSON.parse(saved);
      if (!Array.isArray(parsed)) return INITIAL_STUDENT_GROUPS;
      return parsed.filter((g) => !OBSOLETE_COURSE_SLUGS.has(g.courseSlug) && g.courseType !== 'Old Course');
    } catch {
      return INITIAL_STUDENT_GROUPS;
    }
  });

  // Mock Tests State
  const [mockTests, setMockTests] = useState<MockTest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOCK_TESTS);
    if (saved === null) return INITIAL_MOCK_TESTS;
    try {
      const parsed: MockTest[] = JSON.parse(saved);
      if (!Array.isArray(parsed)) return INITIAL_MOCK_TESTS;
      const filtered = parsed.filter((t) => !OBSOLETE_COURSE_SLUGS.has(t.courseSlug) && t.courseType !== 'Old Course');
      if (localStorage.getItem(OLD_COURSE_REMOVAL_KEY) !== 'true') {
        try {
          localStorage.setItem(OLD_COURSE_REMOVAL_KEY, 'true');
        } catch {}
      }
      return filtered;
    } catch {
      return INITIAL_MOCK_TESTS;
    }
  });

  // Mock Test Submissions State
  const [mockTestSubmissions, setMockTestSubmissions] = useState<MockTestSubmission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOCK_SUBMISSIONS);
    if (saved === null) return INITIAL_MOCK_TEST_SUBMISSIONS;
    try {
      const parsed: MockTestSubmission[] = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_MOCK_TEST_SUBMISSIONS;
    } catch {
      return INITIAL_MOCK_TEST_SUBMISSIONS;
    }
  });

  // Mock Test Registrations (Students interested only in mock tests)
  const [mockTestRegistrations, setMockTestRegistrations] = useState<MockTestRegistration[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOCK_REGISTRATIONS);
    if (saved === null) return INITIAL_MOCK_TEST_REGISTRATIONS;
    try {
      const parsed: MockTestRegistration[] = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_MOCK_TEST_REGISTRATIONS;
    } catch {
      return INITIAL_MOCK_TEST_REGISTRATIONS;
    }
  });

  // Auth
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
    return saved ? JSON.parse(saved) : null;
  });

  // Language
  const [language, setLanguage] = useState<'en' | 'ne'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    return saved === 'ne' ? 'ne' : 'en';
  });

  // Persistence side effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    } catch (err) {
      console.warn('Error saving teachers to localStorage:', err);
    }
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
  }, [notices]);

  // Hydrate large uploaded study material files from IndexedDB on initial mount
  useEffect(() => {
    let active = true;
    const hydrateMaterialsFromIdb = async () => {
      const markers = studyMaterials.filter((m) => m.downloadUrl === IDB_MARKER);
      if (markers.length === 0) return;
      const entries = await Promise.all(
        markers.map(async (m) => ({
          id: m.id,
          url: await getStoredFile(`material:${m.id}`),
        }))
      );
      if (!active) return;
      const resolvedMap = new Map<string, string>();
      entries.forEach((entry) => {
        if (entry.url) resolvedMap.set(entry.id, entry.url);
      });
      if (resolvedMap.size > 0) {
        setStudyMaterials((prev) =>
          prev.map((m) => (resolvedMap.has(m.id) ? { ...m, downloadUrl: resolvedMap.get(m.id)! } : m))
        );
      }
    };
    hydrateMaterialsFromIdb();
    return () => {
      active = false;
    };
  }, []);

  const persistMaterialsSafely = (mats: StudyMaterial[]) => {
    const compactForLocalStorage = mats.map((m) => {
      if (m.downloadUrl && m.downloadUrl.startsWith('data:')) {
        putStoredFile(`material:${m.id}`, m.downloadUrl).catch(console.warn);
        if (m.downloadUrl.length > 50_000) {
          return { ...m, downloadUrl: IDB_MARKER };
        }
      }
      return m;
    });
    try {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(compactForLocalStorage));
    } catch {
      // Fallback: strip all inline data: URLs to guarantee localStorage save succeeds
      const minimal = compactForLocalStorage.map((m) =>
        m.downloadUrl && m.downloadUrl.startsWith('data:') ? { ...m, downloadUrl: IDB_MARKER } : m
      );
      try {
        localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(minimal));
      } catch (err) {
        console.warn('Error saving studyMaterials to localStorage:', err);
      }
    }
  };

  useEffect(() => {
    persistMaterialsSafely(studyMaterials);
  }, [studyMaterials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
  }, [gallery]);

  const persistInquiriesSafely = (list: AdmissionInquiry[]) => {
    const compactForLocalStorage = list.map((inq) => {
      if (inq.paymentProofUrl && inq.paymentProofUrl.startsWith('data:')) {
        putStoredFile(`inquiry_proof:${inq.id}`, inq.paymentProofUrl).catch(console.warn);
        if (inq.paymentProofUrl.length > 40_000) {
          return { ...inq, paymentProofUrl: IDB_MARKER };
        }
      }
      return inq;
    });
    try {
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(compactForLocalStorage));
    } catch {
      const minimal = compactForLocalStorage.map((inq) =>
        inq.paymentProofUrl && inq.paymentProofUrl.startsWith('data:')
          ? { ...inq, paymentProofUrl: IDB_MARKER }
          : inq
      );
      try {
        localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(minimal));
      } catch (err) {
        console.warn('Error saving inquiries to localStorage:', err);
      }
    }
  };

  // Hydrate large inquiry payment proofs from IndexedDB on initial mount
  useEffect(() => {
    let active = true;
    const hydrateProofsFromIdb = async () => {
      const markers = inquiries.filter((i) => i.paymentProofUrl === IDB_MARKER);
      if (markers.length === 0) return;
      const entries = await Promise.all(
        markers.map(async (i) => ({
          id: i.id,
          url: await getStoredFile(`inquiry_proof:${i.id}`),
        }))
      );
      if (!active) return;
      const resolvedMap = new Map<string, string>();
      entries.forEach((entry) => {
        if (entry.url) resolvedMap.set(entry.id, entry.url);
      });
      if (resolvedMap.size > 0) {
        setInquiries((prev) =>
          prev.map((i) => (resolvedMap.has(i.id) ? { ...i, paymentProofUrl: resolvedMap.get(i.id)! } : i))
        );
      }
    };
    hydrateProofsFromIdb();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    persistInquiriesSafely(inquiries);
  }, [inquiries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTACT, JSON.stringify(contactMessages));
  }, [contactMessages]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANG, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(studentGroups));
  }, [studentGroups]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOCK_TESTS, JSON.stringify(mockTests));
  }, [mockTests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOCK_SUBMISSIONS, JSON.stringify(mockTestSubmissions));
  }, [mockTestSubmissions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOCK_REGISTRATIONS, JSON.stringify(mockTestRegistrations));
  }, [mockTestRegistrations]);

  // Supabase Connection & Cloud Synchronization
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseConnectionStatus | null>(null);

  const checkSupabaseStatus = async (): Promise<SupabaseConnectionStatus> => {
    const status = await checkSupabaseConnection();
    setSupabaseStatus(status);
    return status;
  };

  const mergeInquiryLists = (
    localInqs: AdmissionInquiry[],
    remoteInqs: AdmissionInquiry[]
  ): AdmissionInquiry[] => {
    const deletedSet = getDeletedIdsSet('inquiries');
    const map = new Map<string, AdmissionInquiry>();
    localInqs.forEach((i) => {
      if (i?.id && !deletedSet.has(i.id)) map.set(i.id, i);
    });
    remoteInqs.forEach((remote) => {
      if (!remote?.id || deletedSet.has(remote.id)) return;
      const existing = map.get(remote.id);
      if (!existing) {
        map.set(remote.id, remote);
        return;
      }
      const existingTime = Date.parse(existing.updatedAt || existing.createdAt || '') || 0;
      const remoteTime = Date.parse(remote.updatedAt || remote.createdAt || '') || 0;
      const newer = remoteTime >= existingTime ? remote : existing;
      const older = remoteTime >= existingTime ? existing : remote;
      const resolvedProofUrl =
        newer.paymentProofUrl && newer.paymentProofUrl !== IDB_MARKER
          ? newer.paymentProofUrl
          : older.paymentProofUrl || newer.paymentProofUrl;
      map.set(remote.id, {
        ...older,
        ...newer,
        batchId: newer.batchId || older.batchId,
        batchName: newer.batchName || older.batchName,
        paymentProofUrl: resolvedProofUrl,
      });
    });
    return Array.from(map.values());
  };

  const syncAllToSupabase = async () => {
    const resolvedMaterials = await Promise.all(
      studyMaterials
        .filter((m) => !isLegacySeededMaterialId(m.id))
        .map(async (m) => {
          if (m.downloadUrl === IDB_MARKER) {
            const actualUrl = await getStoredFile(`material:${m.id}`);
            return { ...m, downloadUrl: actualUrl || undefined };
          }
          return m;
        })
    );
    const resolvedInquiries = await Promise.all(
      inquiries.map(async (inq) => {
        if (inq.paymentProofUrl === IDB_MARKER) {
          const actualProof = await getStoredFile(`inquiry_proof:${inq.id}`);
          return { ...inq, paymentProofUrl: actualProof || undefined };
        }
        return inq;
      })
    );
    const res = await syncAllDataToSupabase({
      inquiries: resolvedInquiries,
      mockSubmissions: mockTestSubmissions,
      mockRegistrations: mockTestRegistrations,
      contactMessages,
      studentGroups,
      mockTests,
      notices,
      studyMaterials: resolvedMaterials,
      settings,
    });
    // Re-verify status
    await checkSupabaseStatus();
    return res;
  };

  // Test Supabase connection and pull cloud updates on mount
  useEffect(() => {
    checkSupabaseConnection().then((status) => {
      setSupabaseStatus(status);
    });

    // Check if remote inquiries exist to merge (excluding deleted tombstones)
    fetchInquiriesFromSupabase().then((remoteInqs) => {
      if (remoteInqs && remoteInqs.length > 0) {
        setInquiries((localInqs) => mergeInquiryLists(localInqs, remoteInqs));
      }
    });

    // Check if remote mock submissions exist to merge (excluding deleted tombstones)
    fetchSubmissionsFromSupabase().then((remoteSubs) => {
      if (remoteSubs && remoteSubs.length > 0) {
        const deletedSet = getDeletedIdsSet('mockSubmissions');
        setMockTestSubmissions((localSubs) => {
          const map = new Map<string, MockTestSubmission>();
          localSubs.forEach((s) => {
            if (!deletedSet.has(s.id)) map.set(s.id, s);
          });
          remoteSubs.forEach((s) => {
            if (!deletedSet.has(s.id)) map.set(s.id, s);
          });
          return Array.from(map.values());
        });
      }
    });

    // Check if remote mock candidate registrations exist to merge (excluding deleted tombstones)
    fetchMockRegistrationsFromSupabase().then((remoteRegs) => {
      if (remoteRegs && remoteRegs.length > 0) {
        const deletedSet = getDeletedIdsSet('mockRegistrations');
        setMockTestRegistrations((localRegs) => {
          const map = new Map<string, MockTestRegistration>();
          localRegs.forEach((r) => {
            if (!deletedSet.has(r.id)) map.set(r.id, r);
          });
          remoteRegs.forEach((r) => {
            if (!deletedSet.has(r.id)) map.set(r.id, r);
          });
          return Array.from(map.values());
        });
      }
    });

    // Check if remote admin-uploaded study materials exist to merge (excluding deleted tombstones)
    fetchStudyMaterialsFromSupabase().then((remoteMats) => {
      if (remoteMats && remoteMats.length > 0) {
        const deletedSet = getDeletedIdsSet('studyMaterials');
        setStudyMaterials((localMats) => {
          const map = new Map<string, StudyMaterial>();
          localMats
            .filter((m) => !isLegacySeededMaterialId(m.id) && !deletedSet.has(m.id))
            .forEach((m) => map.set(m.id, m));
          remoteMats
            .filter((m) => !isLegacySeededMaterialId(m.id) && !deletedSet.has(m.id))
            .forEach((remote) => {
              const existing = map.get(remote.id);
              const mergedUrl =
                existing?.downloadUrl && existing.downloadUrl !== IDB_MARKER
                  ? existing.downloadUrl
                  : remote.downloadUrl || existing?.downloadUrl;
              map.set(remote.id, { ...remote, ...existing, downloadUrl: mergedUrl });
            });
          return Array.from(map.values());
        });
      }
    });

    // Instant cross-tab synchronization listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.MOCK_REGISTRATIONS && e.newValue) {
        try {
          const parsed: MockTestRegistration[] = JSON.parse(e.newValue);
          setMockTestRegistrations(parsed);
        } catch {}
      }
      if (e.key === STORAGE_KEYS.INQUIRIES && e.newValue) {
        try {
          const parsed: AdmissionInquiry[] = JSON.parse(e.newValue);
          setInquiries(parsed);
        } catch {}
      }
      if (e.key === STORAGE_KEYS.MOCK_TESTS && e.newValue) {
        try {
          const parsed: MockTest[] = JSON.parse(e.newValue);
          setMockTests(parsed);
        } catch {}
      }
      if (e.key === STORAGE_KEYS.MOCK_SUBMISSIONS && e.newValue) {
        try {
          const parsed: MockTestSubmission[] = JSON.parse(e.newValue);
          setMockTestSubmissions(parsed);
        } catch {}
      }
      if (e.key === STORAGE_KEYS.GROUPS && e.newValue) {
        try {
          const parsed: StudentGroup[] = JSON.parse(e.newValue);
          setStudentGroups(parsed);
        } catch {}
      }
      if (e.key === STORAGE_KEYS.COURSES && e.newValue) {
        try {
          const parsed: Course[] = JSON.parse(e.newValue);
          setCourses(parsed);
        } catch {}
      }
      if (e.key === STORAGE_KEYS.TEACHERS && e.newValue) {
        try {
          const parsed: Teacher[] = JSON.parse(e.newValue);
          setTeachers(parsed);
        } catch {}
      }
      if (e.key === STORAGE_KEYS.NOTICES && e.newValue) {
        try {
          const parsed: Notice[] = JSON.parse(e.newValue);
          setNotices(parsed);
        } catch {}
      }
      if (e.key === STORAGE_KEYS.MATERIALS && e.newValue) {
        try {
          const deletedSet = getDeletedIdsSet('studyMaterials');
          const parsed: StudyMaterial[] = JSON.parse(e.newValue);
          setStudyMaterials(
            parsed.filter((m) => m && !isLegacySeededMaterialId(m.id) && !deletedSet.has(m.id))
          );
        } catch {}
      }
    };

    const handleCustomMockReg = (e: Event) => {
      const customEvent = e as CustomEvent<MockTestRegistration>;
      if (customEvent.detail) {
        setMockTestRegistrations((prev) => {
          if (prev.some((r) => r.id === customEvent.detail.id || r.referenceNumber === customEvent.detail.referenceNumber)) {
            return prev;
          }
          return [customEvent.detail, ...prev];
        });
      }
    };

    const handleCustomTimerChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ testId: string; updates: Partial<MockTest> }>;
      if (customEvent.detail) {
        setMockTests((prev) =>
          prev.map((t) => (t.id === customEvent.detail.testId ? { ...t, ...customEvent.detail.updates } : t))
        );
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mock_test_registered', handleCustomMockReg);
    window.addEventListener('mock_test_timer_changed', handleCustomTimerChanged);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mock_test_registered', handleCustomMockReg);
      window.removeEventListener('mock_test_timer_changed', handleCustomTimerChanged);
    };
  }, []);

  // Actions
  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...newSettings };
      saveSettingsToSupabase(next).catch(console.warn);
      return next;
    });
  };

  const resetSettings = () => {
    setSettings(INITIAL_SETTINGS);
  };

  const addCourse = (courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
    };
    setCourses((prev) => [newCourse, ...prev]);
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const togglePublishCourse = (id: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, published: !c.published } : c))
    );
  };

  const deleteCourse = (id: string) => {
    recordDeletedIds('courses', [id]);
    setCourses((prev) => {
      const next = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearAllCourses = () => {
    recordDeletedIds('courses', courses.map((c) => c.id));
    setCourses([]);
    try {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify([]));
    } catch {}
  };

  const restoreDefaultCourses = () => {
    clearDeletedCategory('courses');
    let addedOrRepublished = 0;
    setCourses((prev) => {
      const prevSlugs = new Set(prev.map((c) => c.slug));
      const prevUnpublished = new Set(prev.filter((c) => !c.published).map((c) => c.slug));
      const next = mergeCoursesWithDefaults(prev, true);
      addedOrRepublished = next.filter(
        (c) => !prevSlugs.has(c.slug) || prevUnpublished.has(c.slug)
      ).length;
      try {
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(next));
        localStorage.setItem(COURSES_RESTORE_KEY, 'true');
      } catch {}
      return next;
    });
    return addedOrRepublished;
  };

  const addTeacher = (teacherData: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: `teacher-${Date.now()}`,
    };
    setTeachers((prev) => {
      const next = [...prev, newTeacher];
      try {
        localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(next));
      } catch (err) {
        console.warn('Error saving new teacher to localStorage:', err);
      }
      return next;
    });
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    setTeachers((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      try {
        localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(next));
      } catch (err) {
        console.warn('Error updating teacher in localStorage:', err);
      }
      return next;
    });
  };

  const deleteTeacher = (id: string) => {
    recordDeletedIds('teachers', [id]);
    setTeachers((prev) => {
      const next = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(next));
      } catch (err) {
        console.warn('Error deleting teacher from localStorage:', err);
      }
      return next;
    });
  };

  const clearAllTeachers = () => {
    recordDeletedIds('teachers', teachers.map((t) => t.id));
    setTeachers([]);
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify([]));
    } catch {}
  };

  const addNotice = (noticeData: Omit<Notice, 'id'>) => {
    const newNotice: Notice = {
      ...noticeData,
      id: `notice-${Date.now()}`,
    };
    setNotices((prev) => [newNotice, ...prev]);
  };

  const updateNotice = (id: string, updates: Partial<Notice>) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );
  };

  const deleteNotice = (id: string) => {
    recordDeletedIds('notices', [id]);
    deleteNoticeFromSupabase(id).catch(console.warn);
    setNotices((prev) => {
      const next = prev.filter((n) => n.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearAllNotices = () => {
    recordDeletedIds('notices', notices.map((n) => n.id));
    clearAllNoticesFromSupabase().catch(console.warn);
    setNotices([]);
    try {
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify([]));
    } catch {}
  };

  const addStudyMaterial = (matData: Omit<StudyMaterial, 'id'>) => {
    const newMat: StudyMaterial = {
      ...matData,
      published: matData.published !== undefined ? matData.published : true,
      id: `mat-${Date.now()}`,
    };
    setStudyMaterials((prev) => {
      const next = [newMat, ...prev];
      persistMaterialsSafely(next);
      return next;
    });
    saveStudyMaterialToSupabase(newMat).catch(console.warn);
  };

  const updateStudyMaterial = (id: string, updates: Partial<StudyMaterial>) => {
    setStudyMaterials((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, ...updates } : m));
      persistMaterialsSafely(next);
      const updatedItem = next.find((m) => m.id === id);
      if (updatedItem) {
        if (updatedItem.downloadUrl === IDB_MARKER) {
          getStoredFile(`material:${updatedItem.id}`)
            .then((url) => saveStudyMaterialToSupabase({ ...updatedItem, downloadUrl: url || undefined }))
            .catch(console.warn);
        } else {
          saveStudyMaterialToSupabase(updatedItem).catch(console.warn);
        }
      }
      return next;
    });
  };

  const deleteStudyMaterial = (id: string) => {
    recordDeletedIds('studyMaterials', [id]);
    deleteStoredFile(`material:${id}`).catch(console.warn);
    deleteStudyMaterialFromSupabase(id).catch(console.warn);
    setStudyMaterials((prev) => {
      const next = prev.filter((m) => m.id !== id);
      persistMaterialsSafely(next);
      return next;
    });
  };

  const clearAllStudyMaterials = () => {
    recordDeletedIds('studyMaterials', studyMaterials.map((m) => m.id));
    studyMaterials.forEach((m) => {
      deleteStoredFile(`material:${m.id}`).catch(console.warn);
    });
    clearAllStudyMaterialsFromSupabase().catch(console.warn);
    setStudyMaterials([]);
    try {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify([]));
    } catch {}
  };

  const resolveMaterialUrl = async (mat: StudyMaterial): Promise<string | undefined> => {
    if (mat.downloadUrl && mat.downloadUrl !== IDB_MARKER) {
      return mat.downloadUrl;
    }
    const stored = await getStoredFile(`material:${mat.id}`);
    return stored || undefined;
  };

  const addGalleryItem = (itemData: Omit<GalleryItem, 'id'>) => {
    const newItem: GalleryItem = {
      ...itemData,
      id: `gal-${Date.now()}`,
    };
    setGallery((prev) => [newItem, ...prev]);
  };

  const deleteGalleryItem = (id: string) => {
    setGallery((prev) => prev.filter((g) => g.id !== id));
  };

  // Submit Admission Inquiry
  const submitAdmissionInquiry = async (
    inquiryData: Omit<AdmissionInquiry, 'id' | 'referenceNumber' | 'status' | 'adminNotes' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    const refNum = `SSS-ADM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const initialNotes = [
      {
        date: new Date().toLocaleDateString(),
        text: `Inquiry submitted online by student for ${inquiryData.courseName}.`,
        by: 'System',
      },
    ];

    if (inquiryData.hasPaymentProof) {
      initialNotes.push({
        date: new Date().toLocaleDateString(),
        text: `Payment proof attached via ${inquiryData.paymentMethod || 'Online Transfer'} (Amount: NPR ${inquiryData.paymentAmount || 'N/A'}, Ref: ${inquiryData.transactionReference || 'N/A'}). Awaiting administrative verification.`,
        by: 'System (Payment Verification)',
      });
    }

    const newInquiry: AdmissionInquiry = {
      ...inquiryData,
      id: `inq-${Date.now()}`,
      referenceNumber: refNum,
      status: 'New',
      paymentVerified: false,
      adminNotes: initialNotes,
      createdAt: now,
      updatedAt: now,
    };

    setInquiries((prev) => {
      const next = [newInquiry, ...prev];
      persistInquiriesSafely(next);
      return next;
    });
    await saveInquiryToSupabase(newInquiry).catch(console.warn);
    return refNum;
  };

  const updateInquiryStatus = (id: string, status: InquiryStatus, note?: string) => {
    const now = new Date().toISOString();
    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id === id) {
          const notes = inq.adminNotes ? [...inq.adminNotes] : [];
          if (note) {
            notes.push({
              date: new Date().toLocaleDateString(),
              text: `Status changed to ${status}: ${note}`,
              by: currentUser?.name || 'Administrator',
            });
          }
          const updated = {
            ...inq,
            status,
            adminNotes: notes,
            updatedAt: now,
          };
          saveInquiryToSupabase(updated).catch(console.warn);
          return updated;
        }
        return inq;
      })
    );
  };

  const verifyAndEnrollApplicant = (id: string, customStudentId?: string, note?: string, batchId?: string) => {
    const now = new Date().toISOString();
    let verifiedInquiry: AdmissionInquiry | null = null;
    let issuedId = '';
    const explicitBatch =
      batchId && batchId !== 'NONE' && batchId !== 'ALL'
        ? studentGroups.find((g) => g.id === batchId)
        : undefined;

    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id === id) {
          const notes = inq.adminNotes ? [...inq.adminNotes] : [];
          const courseCode = inq.courseSlug.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'SCH';
          const mobileLoginId = normalizeMobileNumber(inq.phone) || inq.phone?.trim() || '';
          const autoId =
            customStudentId?.trim() ||
            mobileLoginId ||
            inq.assignedStudentId ||
            `SSS-STU-${courseCode}-${Math.floor(1000 + Math.random() * 9000)}`;
          issuedId = autoId;
          const resolvedBatch =
            explicitBatch ||
            (inq.batchId ? studentGroups.find((g) => g.id === inq.batchId) : undefined);
          const resolvedBatchId = resolvedBatch?.id || inq.batchId;
          const resolvedBatchName = resolvedBatch
            ? resolvedBatch.name || resolvedBatch.title
            : inq.batchName;
          const amountDisplay = inq.paymentAmount ? ` (Payment: NPR ${inq.paymentAmount})` : '';
          const batchSuffix = resolvedBatchName ? ` Batch: ${resolvedBatchName}.` : '';
          notes.push({
            date: new Date().toLocaleDateString(),
            text:
              note ||
              `Payment verified${amountDisplay} & student officially enrolled in ${inq.courseName}. Login ID (Mobile): ${autoId}.${batchSuffix}`,
            by: currentUser?.name || 'Administrator',
          });
          const updated: AdmissionInquiry = {
            ...inq,
            status: 'Verified & Enrolled' as InquiryStatus,
            paymentVerified: true,
            verifiedBy: currentUser?.name || 'Administrator',
            verifiedAt: now,
            assignedStudentId: autoId,
            batchId: resolvedBatchId,
            batchName: resolvedBatchName,
            adminNotes: notes,
            updatedAt: now,
          };
          verifiedInquiry = updated;
          saveInquiryToSupabase(updated).catch(console.warn);
          return updated;
        }
        return inq;
      })
    );

    // Auto-sync into the assigned batch (or matching course group if none explicitly chosen)
    if (verifiedInquiry) {
      const v = verifiedInquiry as AdmissionInquiry;
      setStudentGroups((prev) =>
        prev.map((g) => {
          const isTargetGroup = v.batchId ? g.id === v.batchId : g.courseSlug === v.courseSlug;
          if (isTargetGroup) {
            const exists = g.members.some(
              (m) =>
                m.referenceNumber === v.referenceNumber ||
                (v.phone && m.phone.replace(/[^0-9]/g, '') === v.phone.replace(/[^0-9]/g, ''))
            );
            if (exists) return g;
            const parsedSubjects =
              v.enrolledSubjects && v.enrolledSubjects.length > 0
                ? v.enrolledSubjects
                : v.subjectsOfInterest &&
                  !/^(all subjects under|general mock series|all offered subjects)/i.test(v.subjectsOfInterest.trim())
                ? v.subjectsOfInterest
                    .split(/[,|]+/)
                    .map((s) => s.replace(/^additional:\s*/i, '').trim())
                    .filter(Boolean)
                : undefined;
            const newMem: StudentGroupMember = {
              id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              fullName: v.fullName,
              phone: v.phone,
              email: v.email,
              studentId: issuedId,
              referenceNumber: v.referenceNumber,
              enrolledCourseSlug: v.courseSlug,
              enrolledSubjects: parsedSubjects,
              semesterOrYear: v.academicLevel,
              batchId: g.id,
              batchName: g.name || g.title,
              addedAt: now,
              notes: 'Auto-added upon verified enrollment',
            };
            const updatedGroup = {
              ...g,
              members: [newMem, ...g.members],
              updatedAt: now,
            };
            saveStudentGroupToSupabase(updatedGroup).catch(console.warn);
            return updatedGroup;
          }
          return g;
        })
      );
    }
  };

  const attachPaymentProofToInquiry = (
    referenceOrPhone: string,
    paymentData: {
      paymentProofUrl: string;
      paymentProofName: string;
      paymentProofSize: string;
      paymentMethod: 'eSewa' | 'Khalti' | 'Bank Transfer / ConnectIPS' | 'Cash / Campus Desk' | 'Other';
      paymentAmount: string;
      transactionReference: string;
      paymentRemarks?: string;
    }
  ): { success: boolean; message: string; inquiry?: AdmissionInquiry } => {
    const query = referenceOrPhone.trim().toLowerCase();
    const queryDigits = referenceOrPhone.replace(/[^0-9]/g, '');
    const target = inquiries.find(
      (i) =>
        i.referenceNumber.toLowerCase() === query ||
        (queryDigits.length >= 7 && i.phone.replace(/[^0-9]/g, '') === queryDigits) ||
        i.email.toLowerCase() === query
    );
    if (!target) {
      return {
        success: false,
        message: 'No admission application found matching the provided Reference ID, Phone, or Email.',
      };
    }
    const now = new Date().toISOString();
    const notes = target.adminNotes ? [...target.adminNotes] : [];
    notes.push({
      date: new Date().toLocaleDateString(),
      text: `Payment proof uploaded via ${paymentData.paymentMethod} (Amount: NPR ${paymentData.paymentAmount}, Ref: ${paymentData.transactionReference}). Awaiting administrative verification.`,
      by: 'Student (Self-Upload)',
    });
    const updated: AdmissionInquiry = {
      ...target,
      hasPaymentProof: true,
      paymentProofUrl: paymentData.paymentProofUrl,
      paymentProofName: paymentData.paymentProofName,
      paymentProofSize: paymentData.paymentProofSize,
      paymentMethod: paymentData.paymentMethod,
      paymentAmount: paymentData.paymentAmount,
      transactionReference: paymentData.transactionReference,
      paymentRemarks: paymentData.paymentRemarks,
      adminNotes: notes,
      updatedAt: now,
    };
    setInquiries((prev) => prev.map((i) => (i.id === target.id ? updated : i)));
    saveInquiryToSupabase(updated).catch(console.warn);
    return {
      success: true,
      message: 'Payment voucher uploaded successfully! Pending administrative verification.',
      inquiry: updated,
    };
  };

  const addInquiryNote = (id: string, noteText: string) => {
    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id === id) {
          const updated = {
            ...inq,
            adminNotes: [
              ...(inq.adminNotes || []),
              {
                date: new Date().toLocaleDateString(),
                text: noteText,
                by: currentUser?.name || 'Administrator',
              },
            ],
            updatedAt: new Date().toISOString(),
          };
          saveInquiryToSupabase(updated).catch(console.warn);
          return updated;
        }
        return inq;
      })
    );
  };

  const deleteInquiry = async (id: string) => {
    recordDeletedIds('inquiries', [id]);
    deleteStoredFile(`inquiry_proof:${id}`).catch(console.warn);
    setInquiries((prev) => {
      const updated = prev.filter((inq) => inq.id !== id);
      persistInquiriesSafely(updated);
      return updated;
    });
    await deleteInquiryFromSupabase(id).catch(console.warn);
  };

  const deleteMultipleInquiries = async (ids: string[]) => {
    recordDeletedIds('inquiries', ids);
    ids.forEach((id) => deleteStoredFile(`inquiry_proof:${id}`).catch(console.warn));
    const idSet = new Set(ids);
    setInquiries((prev) => {
      const updated = prev.filter((inq) => !idSet.has(inq.id));
      persistInquiriesSafely(updated);
      return updated;
    });
    await deleteMultipleInquiriesFromSupabase(ids).catch(console.warn);
  };

  const clearAllInquiries = async () => {
    recordDeletedIds('inquiries', inquiries.map((i) => i.id));
    inquiries.forEach((i) => deleteStoredFile(`inquiry_proof:${i.id}`).catch(console.warn));
    setInquiries([]);
    persistInquiriesSafely([]);
    await clearAllInquiriesFromSupabase().catch(console.warn);
  };

  const resolveInquiryProofUrl = async (inq: AdmissionInquiry): Promise<string | undefined> => {
    if (inq.paymentProofUrl && inq.paymentProofUrl !== IDB_MARKER) {
      return inq.paymentProofUrl;
    }
    const stored = await getStoredFile(`inquiry_proof:${inq.id}`);
    return stored || undefined;
  };

  const refreshInquiries = async (): Promise<{ count: number; added: number; error?: string }> => {
    try {
      const res = await fetchInquiriesFromSupabaseWithMeta(false);
      if (res.inquiries && res.inquiries.length > 0) {
        let added = 0;
        setInquiries((localInqs) => {
          const existingIds = new Set(localInqs.map((i) => i.id));
          const deletedSet = getDeletedIdsSet('inquiries');
          added = res.inquiries!.filter((i) => !existingIds.has(i.id) && !deletedSet.has(i.id)).length;
          const merged = mergeInquiryLists(localInqs, res.inquiries!);
          persistInquiriesSafely(merged);
          return merged;
        });
        return { count: res.inquiries.length, added, error: res.error };
      }
      return { count: 0, added: 0, error: res.error };
    } catch (e: any) {
      console.warn('Failed to refresh inquiries from cloud:', e);
      return { count: 0, added: 0, error: e?.message || 'Cloud refresh failed' };
    }
  };

  const exportInquiriesCSV = () => {
    const headers = [
      'Reference Number',
      'Full Name',
      'Email',
      'Phone',
      'Course',
      'Board',
      'Academic Level',
      'Subjects of Interest',
      'Class Mode',
      'Shift',
      'Payment Attached',
      'Payment Method',
      'Amount (NPR)',
      'Transaction Ref',
      'Payment Verified',
      'Status',
      'Submission Date',
    ];

    const rows = inquiries.map((inq) => [
      `"${inq.referenceNumber}"`,
      `"${inq.fullName.replace(/"/g, '""')}"`,
      `"${inq.email}"`,
      `"${inq.phone}"`,
      `"${inq.courseName}"`,
      `"${inq.board || ''}"`,
      `"${inq.academicLevel || ''}"`,
      `"${(inq.subjectsOfInterest || '').replace(/"/g, '""')}"`,
      `"${inq.preferredMode}"`,
      `"${inq.preferredShift}"`,
      `"${inq.hasPaymentProof ? 'Yes' : 'No'}"`,
      `"${inq.paymentMethod || ''}"`,
      `"${inq.paymentAmount || ''}"`,
      `"${inq.transactionReference || ''}"`,
      `"${inq.paymentVerified ? 'Verified' : 'Pending'}"`,
      `"${inq.status}"`,
      `"${new Date(inq.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SSS_Admission_Inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const submitContactMessage = async (msg: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>) => {
    const newMsg: ContactMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      status: 'Unread',
      createdAt: new Date().toISOString(),
    };
    setContactMessages((prev) => [newMsg, ...prev]);
    saveContactMessageToSupabase(newMsg).catch(console.warn);
  };

  // Student Group Management
  const addStudentGroup = (groupData: Partial<StudentGroup>): StudentGroup => {
    const now = new Date().toISOString();
    const groupTitle = (groupData.title || groupData.name || 'New Student Cohort').trim();
    const customCode = groupData.code?.trim();
    const customBatchNumber = groupData.batchNumber?.trim() || undefined;
    const newGroup: StudentGroup = {
      courseSlug: groupData.courseSlug || 'bbs-tu',
      courseName: groupData.courseName || 'Academic Course',
      courseType: groupData.courseType || 'New Course',
      syllabusVersion: groupData.syllabusVersion,
      academicLevel: groupData.academicLevel || '1st Year',
      shift: groupData.shift || 'Morning',
      batchYear: groupData.batchYear || groupData.academicYearOrBatch || '2081/82',
      academicYearOrBatch: groupData.academicYearOrBatch || groupData.batchYear || '2081/82',
      description: groupData.description || '',
      whatsappGroupUrl: groupData.whatsappGroupUrl || groupData.whatsappGroupLink,
      whatsappGroupLink: groupData.whatsappGroupLink || groupData.whatsappGroupUrl,
      coordinatorName: groupData.coordinatorName || 'Prof. Narayan Kafle',
      coordinatorPhone: groupData.coordinatorPhone || '9767648342',
      members: groupData.members || [],
      ...groupData,
      title: groupTitle,
      name: groupTitle,
      batchNumber: customBatchNumber,
      code: customCode || `GRP-${Date.now().toString().slice(-4)}`,
      id: `grp-${Date.now()}`,
      broadcasts: [],
      createdAt: now,
      updatedAt: now,
    };
    setStudentGroups((prev) => [newGroup, ...prev]);
    saveStudentGroupToSupabase(newGroup).catch(console.warn);
    return newGroup;
  };

  const updateStudentGroup = (id: string, updates: Partial<StudentGroup>) => {
    const now = new Date().toISOString();
    let updatedTitle: string | undefined;

    setStudentGroups((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const nextTitle =
            updates.title !== undefined || updates.name !== undefined
              ? (updates.name ?? updates.title ?? g.name ?? g.title).trim()
              : g.name || g.title;
          if (nextTitle && nextTitle !== (g.name || g.title)) {
            updatedTitle = nextTitle;
          }
          const nextBatchNumber =
            updates.batchNumber !== undefined
              ? updates.batchNumber.trim() || undefined
              : g.batchNumber;
          const nextCode =
            updates.code !== undefined
              ? updates.code.trim() || g.code
              : g.code;

          const updated: StudentGroup = {
            ...g,
            ...updates,
            title: nextTitle,
            name: nextTitle,
            batchNumber: nextBatchNumber,
            code: nextCode,
            updatedAt: now,
          };
          saveStudentGroupToSupabase(updated).catch(console.warn);
          return updated;
        }
        return g;
      })
    );

    if (updatedTitle) {
      const newBatchName = updatedTitle;
      setStudyMaterials((prev) =>
        prev.map((m) => {
          if (m.batchId === id) {
            const nextMat = { ...m, batchName: newBatchName };
            saveStudyMaterialToSupabase(nextMat).catch(console.warn);
            return nextMat;
          }
          return m;
        })
      );
      setInquiries((prev) =>
        prev.map((inq) => {
          if (inq.batchId === id) {
            const nextInq = { ...inq, batchName: newBatchName, updatedAt: now };
            saveInquiryToSupabase(nextInq).catch(console.warn);
            return nextInq;
          }
          return inq;
        })
      );
      setMockTests((prev) =>
        prev.map((t) => (t.batchId === id ? { ...t, batchName: newBatchName, updatedAt: now } : t))
      );
      setMockTestSubmissions((prev) =>
        prev.map((s) => {
          if (s.batchId === id) {
            const nextSub = { ...s, batchName: newBatchName };
            saveMockSubmissionToSupabase(nextSub).catch(console.warn);
            return nextSub;
          }
          return s;
        })
      );
      setMockTestRegistrations((prev) =>
        prev.map((r) => {
          if (r.batchId === id) {
            const nextReg = { ...r, batchName: newBatchName };
            saveMockRegistrationToSupabase(nextReg).catch(console.warn);
            return nextReg;
          }
          return r;
        })
      );
      setNotices((prev) =>
        prev.map((n) => (n.targetBatchId === id ? { ...n, targetBatchName: newBatchName } : n))
      );
    }
  };

  const deleteStudentGroup = (id: string) => {
    recordDeletedIds('studentGroups', [id]);
    deleteStudentGroupFromSupabase(id).catch(console.warn);
    setStudentGroups((prev) => {
      const next = prev.filter((g) => g.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearAllStudentGroups = () => {
    recordDeletedIds('studentGroups', studentGroups.map((g) => g.id));
    clearAllStudentGroupsFromSupabase().catch(console.warn);
    setStudentGroups([]);
    try {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify([]));
    } catch {}
  };

  const addMemberToGroup = (groupId: string, memberData: Omit<StudentGroupMember, 'id' | 'addedAt'>) => {
    const now = new Date().toISOString();
    const normalizedMobile = normalizeMobileNumber(memberData.phone);
    const targetGroupMeta = studentGroups.find((g) => g.id === groupId);
    const newMember: StudentGroupMember = {
      ...memberData,
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      studentId: memberData.studentId || normalizedMobile || undefined,
      batchId: memberData.batchId || groupId,
      batchName: memberData.batchName || targetGroupMeta?.name || targetGroupMeta?.title,
      addedAt: now,
    };
    setStudentGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const exists = g.members.some(
            (m) =>
              (m.phone && m.phone.replace(/[^0-9]/g, '') === memberData.phone.replace(/[^0-9]/g, '')) ||
              (m.studentId && memberData.studentId && m.studentId === memberData.studentId)
          );
          if (exists) return g;
          const updatedGroup = {
            ...g,
            members: [...g.members, newMember],
            updatedAt: now,
          };
          saveStudentGroupToSupabase(updatedGroup).catch(console.warn);
          return updatedGroup;
        }
        return g;
      })
    );
  };

  const bulkAddMembersToGroup = (
    groupId: string,
    data: string | Array<Omit<StudentGroupMember, 'id' | 'addedAt'>>
  ): number => {
    const now = new Date().toISOString();
    const targetGroup = studentGroups.find((g) => g.id === groupId);
    if (!targetGroup) return 0;

    const existingPhones = new Set(
      targetGroup.members.map((m) => m.phone.replace(/[^0-9]/g, ''))
    );
    const addedList: StudentGroupMember[] = [];

    if (Array.isArray(data)) {
      for (const item of data) {
        const cleanPhone = item.phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length >= 7 && !existingPhones.has(cleanPhone)) {
          existingPhones.add(cleanPhone);
          addedList.push({
            ...item,
            id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            studentId: item.studentId || normalizeMobileNumber(item.phone) || undefined,
            enrolledCourseSlug: item.enrolledCourseSlug || targetGroup.courseSlug,
            semesterOrYear: item.semesterOrYear || targetGroup.academicLevel,
            batchId: targetGroup.id,
            batchName: targetGroup.name || targetGroup.title,
            addedAt: now,
          });
        }
      }
    } else {
      const lines = data.split('\n').map((l) => l.trim()).filter(Boolean);
      for (const line of lines) {
        const parts = line.split(/[,;\t|\-]/).map((p) => p.trim()).filter(Boolean);
        let name = 'Enrolled Student';
        let phone = '';
        let email = '';

        if (parts.length >= 2) {
          const p1Digits = parts[0].replace(/[^0-9]/g, '');
          const p2Digits = parts[1].replace(/[^0-9]/g, '');
          if (p2Digits.length >= 7) {
            name = parts[0];
            phone = parts[1];
            if (parts[2] && parts[2].includes('@')) email = parts[2];
          } else if (p1Digits.length >= 7) {
            phone = parts[0];
            name = parts[1];
          }
        } else if (parts.length === 1) {
          const digits = parts[0].replace(/[^0-9]/g, '');
          if (digits.length >= 7) {
            phone = parts[0];
          } else {
            name = parts[0];
          }
        }

        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length >= 7 && !existingPhones.has(cleanPhone)) {
          existingPhones.add(cleanPhone);
          addedList.push({
            id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            fullName: name,
            phone: phone || cleanPhone,
            studentId: normalizeMobileNumber(phone || cleanPhone) || undefined,
            email: email || undefined,
            enrolledCourseSlug: targetGroup.courseSlug,
            semesterOrYear: targetGroup.academicLevel,
            batchId: targetGroup.id,
            batchName: targetGroup.name || targetGroup.title,
            addedAt: now,
          });
        }
      }
    }

    if (addedList.length > 0) {
      setStudentGroups((prev) =>
        prev.map((g) => {
          if (g.id === groupId) {
            const updatedGroup = { ...g, members: [...g.members, ...addedList], updatedAt: now };
            saveStudentGroupToSupabase(updatedGroup).catch(console.warn);
            return updatedGroup;
          }
          return g;
        })
      );
    }

    return addedList.length;
  };

  const importVerifiedInquiriesToGroup = (groupId: string, inquiryIds?: string[]): number => {
    const now = new Date().toISOString();
    const targetGroup = studentGroups.find((g) => g.id === groupId);
    if (!targetGroup) return 0;

    const existingPhones = new Set(
      targetGroup.members.map((m) => m.phone.replace(/[^0-9]/g, ''))
    );
    const existingRef = new Set(
      targetGroup.members.map((m) => m.referenceNumber).filter(Boolean)
    );

    const candidates = inquiries.filter((inq) => {
      if (inquiryIds && inquiryIds.length > 0) {
        if (!inquiryIds.includes(inq.id)) return false;
      } else {
        if (inq.courseSlug !== targetGroup.courseSlug && inq.status !== 'Verified & Enrolled') {
          return false;
        }
      }
      return (
        !existingPhones.has(inq.phone.replace(/[^0-9]/g, '')) &&
        !existingRef.has(inq.referenceNumber)
      );
    });

    const newMembers: StudentGroupMember[] = candidates.map((inq) => {
      const parsedSubjects =
        inq.enrolledSubjects && inq.enrolledSubjects.length > 0
          ? inq.enrolledSubjects
          : inq.subjectsOfInterest &&
            !/^(all subjects under|general mock series|all offered subjects)/i.test(inq.subjectsOfInterest.trim())
          ? inq.subjectsOfInterest
              .split(/[,|]+/)
              .map((s) => s.replace(/^additional:\s*/i, '').trim())
              .filter(Boolean)
          : undefined;
      return {
        id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        fullName: inq.fullName,
        phone: inq.phone,
        email: inq.email,
        studentId: inq.assignedStudentId || normalizeMobileNumber(inq.phone) || undefined,
        referenceNumber: inq.referenceNumber,
        enrolledCourseSlug: inq.courseSlug,
        enrolledSubjects: parsedSubjects,
        semesterOrYear: inq.academicLevel,
        batchId: targetGroup.id,
        batchName: targetGroup.name || targetGroup.title,
        addedAt: now,
        notes: inq.paymentVerified ? 'Payment Verified & Enrolled' : undefined,
      };
    });

    if (newMembers.length > 0) {
      setStudentGroups((prev) =>
        prev.map((g) => {
          if (g.id === groupId) {
            const updatedGroup = { ...g, members: [...g.members, ...newMembers], updatedAt: now };
            saveStudentGroupToSupabase(updatedGroup).catch(console.warn);
            return updatedGroup;
          }
          return g;
        })
      );
      const candIds = new Set(candidates.map((c) => c.id));
      setInquiries((prev) =>
        prev.map((inq) => {
          if (candIds.has(inq.id)) {
            const nextInq = {
              ...inq,
              batchId: targetGroup.id,
              batchName: targetGroup.name || targetGroup.title,
              updatedAt: now,
            };
            saveInquiryToSupabase(nextInq).catch(console.warn);
            return nextInq;
          }
          return inq;
        })
      );
    }

    return newMembers.length;
  };

  const removeMemberFromGroup = (groupId: string, memberId: string) => {
    const now = new Date().toISOString();
    setStudentGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const updatedGroup = {
            ...g,
            members: g.members.filter((m) => m.id !== memberId),
            updatedAt: now,
          };
          saveStudentGroupToSupabase(updatedGroup).catch(console.warn);
          return updatedGroup;
        }
        return g;
      })
    );
  };

  const assignInquiryBatch = (
    inquiryId: string,
    batchId: string,
    options?: { replaceOtherCourseBatches?: boolean }
  ) => {
    const now = new Date().toISOString();
    const targetInquiry = inquiries.find((i) => i.id === inquiryId);
    if (!targetInquiry) return;

    const cleanBatchId = batchId && batchId !== 'NONE' && batchId !== 'ALL' ? batchId : '';
    const targetGroup = cleanBatchId ? studentGroups.find((g) => g.id === cleanBatchId) : undefined;
    const targetBatchName = targetGroup ? targetGroup.name || targetGroup.title : undefined;

    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id !== inquiryId) return inq;
        const notes = inq.adminNotes ? [...inq.adminNotes] : [];
        notes.push({
          date: new Date().toLocaleDateString(),
          text: targetGroup
            ? `Assigned to batch "${targetBatchName}".`
            : 'Batch assignment cleared (Unassigned).',
          by: currentUser?.name || 'Administrator',
        });
        const updated: AdmissionInquiry = {
          ...inq,
          batchId: targetGroup?.id,
          batchName: targetBatchName,
          adminNotes: notes,
          updatedAt: now,
        };
        saveInquiryToSupabase(updated).catch(console.warn);
        return updated;
      })
    );

    // Also update mirrored MockTestRegistration if one corresponds to this inquiry
    setMockTestRegistrations((prev) =>
      prev.map((reg) => {
        const isMirror =
          targetInquiry.id === `inq-${reg.id}` ||
          (targetInquiry.referenceNumber && reg.referenceNumber === targetInquiry.referenceNumber);
        if (!isMirror) return reg;
        const nextReg: MockTestRegistration = {
          ...reg,
          batchId: targetGroup?.id,
          batchName: targetBatchName,
        };
        saveMockRegistrationToSupabase(nextReg).catch(console.warn);
        return nextReg;
      })
    );

    const parsedSubjects =
      targetInquiry.enrolledSubjects && targetInquiry.enrolledSubjects.length > 0
        ? targetInquiry.enrolledSubjects
        : targetInquiry.subjectsOfInterest &&
          !/^(all subjects under|general mock series|all offered subjects)/i.test(
            targetInquiry.subjectsOfInterest.trim()
          )
        ? targetInquiry.subjectsOfInterest
            .split(/[,|]+/)
            .map((s) => s.replace(/^additional:\s*/i, '').trim())
            .filter(Boolean)
        : undefined;

    const studentMatches = (m: StudentGroupMember) =>
      (targetInquiry.referenceNumber && m.referenceNumber === targetInquiry.referenceNumber) ||
      (targetInquiry.phone && mobileMatches(m.phone, targetInquiry.phone)) ||
      (targetInquiry.assignedStudentId &&
        m.studentId &&
        m.studentId.toLowerCase() === targetInquiry.assignedStudentId.toLowerCase());

    setStudentGroups((prev) =>
      prev.map((g) => {
        const hasMember = g.members.some(studentMatches);
        if (!targetGroup) {
          if (hasMember && g.courseSlug === targetInquiry.courseSlug) {
            const nextGroup = {
              ...g,
              members: g.members.filter((m) => !studentMatches(m)),
              updatedAt: now,
            };
            saveStudentGroupToSupabase(nextGroup).catch(console.warn);
            return nextGroup;
          }
          return g;
        }

        if (g.id === targetGroup.id) {
          if (hasMember) {
            const nextGroup = {
              ...g,
              members: g.members.map((m) =>
                studentMatches(m) ? { ...m, batchId: g.id, batchName: targetBatchName } : m
              ),
              updatedAt: now,
            };
            saveStudentGroupToSupabase(nextGroup).catch(console.warn);
            return nextGroup;
          }
          const newMember: StudentGroupMember = {
            id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            fullName: targetInquiry.fullName,
            phone: targetInquiry.phone,
            email: targetInquiry.email,
            studentId:
              targetInquiry.assignedStudentId || normalizeMobileNumber(targetInquiry.phone) || undefined,
            referenceNumber: targetInquiry.referenceNumber,
            enrolledCourseSlug: targetInquiry.courseSlug,
            enrolledSubjects: parsedSubjects,
            semesterOrYear: targetInquiry.academicLevel,
            batchId: g.id,
            batchName: targetBatchName,
            addedAt: now,
            notes: targetInquiry.paymentVerified ? 'Payment Verified & Enrolled' : 'Assigned by Admin',
          };
          const nextGroup = {
            ...g,
            members: [newMember, ...g.members],
            updatedAt: now,
          };
          saveStudentGroupToSupabase(nextGroup).catch(console.warn);
          return nextGroup;
        }

        if (
          options?.replaceOtherCourseBatches !== false &&
          hasMember &&
          (g.courseSlug === targetInquiry.courseSlug || g.courseSlug === targetGroup.courseSlug)
        ) {
          const nextGroup = {
            ...g,
            members: g.members.filter((m) => !studentMatches(m)),
            updatedAt: now,
          };
          saveStudentGroupToSupabase(nextGroup).catch(console.warn);
          return nextGroup;
        }

        return g;
      })
    );
  };

  const assignMockRegistrationBatch = (regId: string, batchId: string) => {
    const now = new Date().toISOString();
    const targetReg = mockTestRegistrations.find((r) => r.id === regId);
    if (!targetReg) return;

    const cleanBatchId = batchId && batchId !== 'NONE' && batchId !== 'ALL' ? batchId : '';
    const targetGroup = cleanBatchId ? studentGroups.find((g) => g.id === cleanBatchId) : undefined;
    const targetBatchName = targetGroup ? targetGroup.name || targetGroup.title : undefined;

    setMockTestRegistrations((prev) => {
      const next = prev.map((r) => {
        if (r.id !== regId) return r;
        const updated: MockTestRegistration = {
          ...r,
          batchId: targetGroup?.id,
          batchName: targetBatchName,
        };
        saveMockRegistrationToSupabase(updated).catch(console.warn);
        return updated;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.MOCK_REGISTRATIONS, JSON.stringify(next));
      } catch {}
      return next;
    });

    // Also update mirrored AdmissionInquiry if present
    setInquiries((prev) =>
      prev.map((inq) => {
        const isMirror =
          inq.id === `inq-${regId}` ||
          (targetReg.referenceNumber && inq.referenceNumber === targetReg.referenceNumber);
        if (!isMirror) return inq;
        const nextInq: AdmissionInquiry = {
          ...inq,
          batchId: targetGroup?.id,
          batchName: targetBatchName,
          updatedAt: now,
        };
        saveInquiryToSupabase(nextInq).catch(console.warn);
        return nextInq;
      })
    );

    const regMatches = (m: StudentGroupMember) =>
      (targetReg.referenceNumber && m.referenceNumber === targetReg.referenceNumber) ||
      (targetReg.phone && mobileMatches(m.phone, targetReg.phone)) ||
      (targetReg.studentRollNo &&
        m.studentId &&
        m.studentId.toLowerCase() === targetReg.studentRollNo.toLowerCase());

    setStudentGroups((prev) =>
      prev.map((g) => {
        const hasMember = g.members.some(regMatches);
        if (!targetGroup) {
          if (hasMember && g.courseSlug === targetReg.courseSlug) {
            const nextGroup = {
              ...g,
              members: g.members.filter((m) => !regMatches(m)),
              updatedAt: now,
            };
            saveStudentGroupToSupabase(nextGroup).catch(console.warn);
            return nextGroup;
          }
          return g;
        }

        if (g.id === targetGroup.id) {
          if (hasMember) {
            const nextGroup = {
              ...g,
              members: g.members.map((m) =>
                regMatches(m) ? { ...m, batchId: g.id, batchName: targetBatchName } : m
              ),
              updatedAt: now,
            };
            saveStudentGroupToSupabase(nextGroup).catch(console.warn);
            return nextGroup;
          }
          const newMember: StudentGroupMember = {
            id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            fullName: targetReg.fullName,
            phone: targetReg.phone,
            email: targetReg.email,
            studentId:
              normalizeMobileNumber(targetReg.phone) || targetReg.studentRollNo || targetReg.referenceNumber,
            referenceNumber: targetReg.referenceNumber,
            enrolledCourseSlug: targetReg.courseSlug,
            enrolledSubjects: targetReg.enrolledSubjects,
            semesterOrYear: targetReg.semesterOrYear,
            batchId: g.id,
            batchName: targetBatchName,
            source: 'Mock Test Registration',
            addedAt: now,
            notes: 'Assigned by Admin',
          };
          const nextGroup = {
            ...g,
            members: [newMember, ...g.members],
            updatedAt: now,
          };
          saveStudentGroupToSupabase(nextGroup).catch(console.warn);
          return nextGroup;
        }

        if (
          hasMember &&
          (g.courseSlug === targetReg.courseSlug || g.courseSlug === targetGroup.courseSlug)
        ) {
          const nextGroup = {
            ...g,
            members: g.members.filter((m) => !regMatches(m)),
            updatedAt: now,
          };
          saveStudentGroupToSupabase(nextGroup).catch(console.warn);
          return nextGroup;
        }

        return g;
      })
    );
  };

  const moveMemberToBatch = (fromGroupId: string, memberId: string, toGroupId: string) => {
    if (!toGroupId || fromGroupId === toGroupId) return;
    const now = new Date().toISOString();
    const sourceGroup = studentGroups.find((g) => g.id === fromGroupId);
    const targetGroup = studentGroups.find((g) => g.id === toGroupId);
    if (!sourceGroup || !targetGroup) return;

    const sourceMember = sourceGroup.members.find((m) => m.id === memberId);
    if (!sourceMember) return;

    const targetBatchName = targetGroup.name || targetGroup.title;

    setStudentGroups((prev) =>
      prev.map((g) => {
        if (g.id === fromGroupId) {
          const updatedFrom = {
            ...g,
            members: g.members.filter((m) => m.id !== memberId),
            updatedAt: now,
          };
          saveStudentGroupToSupabase(updatedFrom).catch(console.warn);
          return updatedFrom;
        }
        if (g.id === toGroupId) {
          const alreadyInTarget = g.members.some(
            (m) =>
              (sourceMember.phone && m.phone && mobileMatches(m.phone, sourceMember.phone)) ||
              (sourceMember.studentId &&
                m.studentId &&
                m.studentId.toLowerCase() === sourceMember.studentId.toLowerCase())
          );
          if (alreadyInTarget) return g;
          const movedMember: StudentGroupMember = {
            ...sourceMember,
            batchId: targetGroup.id,
            batchName: targetBatchName,
            enrolledCourseSlug: sourceMember.enrolledCourseSlug || targetGroup.courseSlug,
            addedAt: now,
          };
          const updatedTo = {
            ...g,
            members: [movedMember, ...g.members],
            updatedAt: now,
          };
          saveStudentGroupToSupabase(updatedTo).catch(console.warn);
          return updatedTo;
        }
        return g;
      })
    );

    // Sync matching inquiries & mock registrations
    setInquiries((prev) =>
      prev.map((inq) => {
        const matches =
          (sourceMember.referenceNumber && inq.referenceNumber === sourceMember.referenceNumber) ||
          (sourceMember.phone && inq.phone && mobileMatches(inq.phone, sourceMember.phone));
        if (matches && (inq.batchId === fromGroupId || !inq.batchId || inq.courseSlug === targetGroup.courseSlug)) {
          const nextInq = {
            ...inq,
            batchId: targetGroup.id,
            batchName: targetBatchName,
            updatedAt: now,
          };
          saveInquiryToSupabase(nextInq).catch(console.warn);
          return nextInq;
        }
        return inq;
      })
    );

    setMockTestRegistrations((prev) => {
      let changed = false;
      const next = prev.map((reg) => {
        const matches =
          (sourceMember.referenceNumber && reg.referenceNumber === sourceMember.referenceNumber) ||
          (sourceMember.phone && reg.phone && mobileMatches(reg.phone, sourceMember.phone));
        if (matches && (reg.batchId === fromGroupId || !reg.batchId || reg.courseSlug === targetGroup.courseSlug)) {
          changed = true;
          const nextReg = { ...reg, batchId: targetGroup.id, batchName: targetBatchName };
          saveMockRegistrationToSupabase(nextReg).catch(console.warn);
          return nextReg;
        }
        return reg;
      });
      if (changed) {
        try {
          localStorage.setItem(STORAGE_KEYS.MOCK_REGISTRATIONS, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  const sendGroupBroadcast = (
    groupId: string,
    broadcast: {
      title: string;
      message: string;
      urgency?: 'Normal' | 'Urgent' | 'Emergency Alert' | 'Important' | 'Urgent / Exam Alert';
      channels?: ('In-App Notice' | 'WhatsApp' | 'SMS')[];
      sentBy?: string;
      groupId?: string;
      groupTitle?: string;
    }
  ) => {
    const now = new Date().toISOString();
    const targetGroup = studentGroups.find((x) => x.id === groupId);
    const newBroadcast: StudentNoticeBroadcast = {
      id: `bc-${Date.now()}`,
      groupId,
      groupTitle: broadcast.groupTitle || targetGroup?.title || targetGroup?.name || 'Academic Batch',
      title: broadcast.title,
      message: broadcast.message,
      urgency: broadcast.urgency || 'Normal',
      channels: broadcast.channels || ['In-App Notice', 'WhatsApp', 'SMS'],
      sentAt: now,
      sentBy: broadcast.sentBy || currentUser?.name || 'Academic Administration',
    };

    setStudentGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            broadcasts: [newBroadcast, ...g.broadcasts],
            updatedAt: now,
          };
        }
        return g;
      })
    );

    if (broadcast.urgency !== 'Normal') {
      const g = studentGroups.find((x) => x.id === groupId);
      addNotice({
        title: `[${g?.title || g?.name || 'Batch Notice'}] ${broadcast.title}`,
        category: 'Class Schedules',
        content: broadcast.message,
        publishDate: new Date().toISOString().split('T')[0],
        important: true,
        published: true,
        targetCourses: g?.courseSlug ? [g.courseSlug] : undefined,
      });
    }
  };

  const deleteGroupBroadcast = (groupId: string, broadcastId: string) => {
    setStudentGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              broadcasts: g.broadcasts.filter((b) => b.id !== broadcastId),
            }
          : g
      )
    );
  };

  const loginAsAdmin = (password?: string): boolean => {
    // Strict administrative authentication - Reject blank or arbitrary input
    const cleanPass = (password || '').trim();
    if (!cleanPass) {
      return false;
    }
    const envPass = import.meta.env.VITE_ADMIN_PASSCODE;
    const isValid =
      cleanPass === 'SSS#Admin2026!' ||
      cleanPass === 'admin123' ||
      (Boolean(envPass) && cleanPass === envPass);

    if (isValid) {
      const adminUser: UserProfile = {
        id: 'admin-1',
        email: 'admin@shikshyalaya.edu.np',
        name: 'Institute Administrator',
        role: 'admin',
      };
      setCurrentUser(adminUser);
      try {
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(adminUser));
      } catch {}

      // Immediately fetch latest database records from Supabase on successful admin authentication
      fetchInquiriesFromSupabase(false).then((remoteInqs) => {
        if (remoteInqs && remoteInqs.length > 0) {
          setInquiries((localInqs) => {
            const merged = mergeInquiryLists(localInqs, remoteInqs);
            persistInquiriesSafely(merged);
            return merged;
          });
        }
      });

      fetchSubmissionsFromSupabase(false).then((remoteSubs) => {
        if (remoteSubs && remoteSubs.length > 0) {
          const deletedSet = getDeletedIdsSet('mockSubmissions');
          setMockTestSubmissions((localSubs) => {
            const map = new Map<string, MockTestSubmission>();
            localSubs.forEach((s) => {
              if (!deletedSet.has(s.id)) map.set(s.id, s);
            });
            remoteSubs.forEach((s) => {
              if (!deletedSet.has(s.id)) map.set(s.id, s);
            });
            return Array.from(map.values());
          });
        }
      });

      fetchMockRegistrationsFromSupabase(false).then((remoteRegs) => {
        if (remoteRegs && remoteRegs.length > 0) {
          const deletedSet = getDeletedIdsSet('mockRegistrations');
          setMockTestRegistrations((localRegs) => {
            const map = new Map<string, MockTestRegistration>();
            localRegs.forEach((r) => {
              if (!deletedSet.has(r.id)) map.set(r.id, r);
            });
            remoteRegs.forEach((r) => {
              if (!deletedSet.has(r.id)) map.set(r.id, r);
            });
            const merged = Array.from(map.values());
            try {
              localStorage.setItem(STORAGE_KEYS.MOCK_REGISTRATIONS, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      });

      return true;
    }
    return false;
  };

  const parseInquirySubjects = (inq?: AdmissionInquiry): string[] | undefined => {
    if (!inq) return undefined;
    if (inq.enrolledSubjects && inq.enrolledSubjects.length > 0) {
      return inq.enrolledSubjects;
    }
    const raw = (inq.subjectsOfInterest || '').trim();
    if (!raw || /^(all subjects under|general mock series|all offered subjects)/i.test(raw)) {
      return undefined;
    }
    const parsed = raw
      .split(/[,|]+/)
      .map((s) => s.replace(/^additional:\s*/i, '').trim())
      .filter(Boolean);
    return parsed.length > 0 ? parsed : undefined;
  };

  const loginAsStudent = (
    studentId: string,
    email: string,
    courseSlugs?: string[],
    studentName?: string,
    enrolledSubjects?: string[]
  ): boolean => {
    const inputClean = (studentId || email || '').trim().toLowerCase();
    const phoneClean = normalizeMobileNumber(studentId || email || '');

    if (!inputClean && phoneClean.length < 7) {
      return false;
    }

    // 1. Check strictly VERIFIED admission inquiries
    const matchedInquiry = inquiries.find(
      (inq) =>
        (inq.status === 'Verified & Enrolled' || Boolean(inq.paymentVerified)) &&
        (mobileMatches(studentId || email, inq.phone) ||
          (inq.assignedStudentId && inq.assignedStudentId.toLowerCase() === inputClean) ||
          (inq.referenceNumber && inq.referenceNumber.toLowerCase() === inputClean) ||
          (inq.email && inq.email.toLowerCase() === inputClean))
    );

    // 2. Check registered mock test candidates
    const matchedMockReg = mockTestRegistrations.find(
      (reg) =>
        mobileMatches(studentId || email, reg.phone) ||
        (reg.referenceNumber && reg.referenceNumber.toLowerCase() === inputClean) ||
        (reg.studentRollNo && reg.studentRollNo.toLowerCase() === inputClean) ||
        (reg.email && reg.email.toLowerCase() === inputClean)
    );

    // 3. Check student group cohort members
    let matchedGroupMember: StudentGroupMember | null = null;
    let matchedGroupCourse = '';
    for (const group of studentGroups) {
      const found = group.members.find(
        (m) =>
          mobileMatches(studentId || email, m.phone) ||
          (m.studentId && m.studentId.toLowerCase() === inputClean) ||
          (m.rollNumber && m.rollNumber.toLowerCase() === inputClean) ||
          (m.referenceNumber && m.referenceNumber.toLowerCase() === inputClean) ||
          (m.email && m.email.toLowerCase() === inputClean)
      );
      if (found) {
        matchedGroupMember = found;
        matchedGroupCourse = group.courseSlug;
        break;
      }
    }

    // 4. Authorized demo explorer accounts
    const isDemoId = [
      'sss-demo-bbm',
      'sss-demo-bbs',
      'sss-demo-mbs',
      'sss-demo-bba',
      'sss-demo-sci',
      'sss-demo-mgmt',
      'sss-demo-pubba',
    ].includes(inputClean);

    // If no real student record matches and not an authorized demo ID, REJECT!
    if (!matchedInquiry && !matchedMockReg && !matchedGroupMember && !isDemoId && (!courseSlugs || courseSlugs.length === 0 || !studentName)) {
      return false;
    }

    // Resolve enrollment
    let enrolled = courseSlugs && courseSlugs.length > 0 ? courseSlugs : undefined;
    let resolvedName = studentName;
    let resolvedId = studentId;

    if (matchedInquiry) {
      if (!enrolled) {
        enrolled = [matchedInquiry.courseSlug];
      }
      if (!resolvedName) {
        resolvedName = matchedInquiry.fullName;
      }
      const inqMobile = normalizeMobileNumber(matchedInquiry.phone);
      resolvedId =
        inqMobile ||
        (!resolvedId || resolvedId.includes('@')
          ? matchedInquiry.assignedStudentId || matchedInquiry.referenceNumber
          : resolvedId);
    } else if (matchedMockReg) {
      if (!enrolled) {
        enrolled = [matchedMockReg.courseSlug];
      }
      if (!resolvedName) {
        resolvedName = matchedMockReg.fullName;
      }
      const regMobile = normalizeMobileNumber(matchedMockReg.phone);
      resolvedId =
        regMobile ||
        (!resolvedId || resolvedId.includes('@')
          ? matchedMockReg.studentRollNo || matchedMockReg.referenceNumber
          : resolvedId);
    } else if (matchedGroupMember) {
      if (!enrolled) {
        enrolled = [matchedGroupMember.enrolledCourseSlug || matchedGroupCourse || 'bbm-tu'];
      }
      if (!resolvedName) {
        resolvedName = matchedGroupMember.fullName;
      }
      const memMobile = normalizeMobileNumber(matchedGroupMember.phone);
      resolvedId =
        memMobile ||
        (!resolvedId || resolvedId.includes('@')
          ? matchedGroupMember.studentId ||
            matchedGroupMember.rollNumber ||
            matchedGroupMember.referenceNumber ||
            matchedGroupMember.id ||
            studentId
          : resolvedId);
    } else if (isDemoId) {
      const demoSlugMap: Record<string, string> = {
        'sss-demo-bbm': 'bbm-tu',
        'sss-demo-bbs': 'bbs-tu',
        'sss-demo-mbs': 'mbs-tu',
        'sss-demo-bba': 'bba-tu',
        'sss-demo-sci': 'plus-two-science',
        'sss-demo-mgmt': 'plus-two-management',
        'sss-demo-pubba': 'bba-pokhara-university',
      };
      const slug = demoSlugMap[inputClean] || 'bbm-tu';
      enrolled = [slug];
      resolvedName = resolvedName || 'Authorized Demo Scholar';
      resolvedId = resolvedId || inputClean.toUpperCase();
    }

    if (!enrolled || enrolled.length === 0) {
      return false;
    }

    const firstSlug = enrolled[0];
    const resolvedEnrolledSubjects =
      enrolledSubjects && enrolledSubjects.length > 0
        ? enrolledSubjects
        : matchedMockReg?.enrolledSubjects && matchedMockReg.enrolledSubjects.length > 0
        ? matchedMockReg.enrolledSubjects
        : parseInquirySubjects(matchedInquiry) ||
          (matchedGroupMember?.enrolledSubjects && matchedGroupMember.enrolledSubjects.length > 0
            ? matchedGroupMember.enrolledSubjects
            : undefined);

    const resolvedPhone =
      matchedInquiry?.phone ||
      matchedMockReg?.phone ||
      matchedGroupMember?.phone ||
      (phoneClean.length >= 7 ? phoneClean : undefined);

    const matchedBatches = studentGroups.filter((g) => {
      if (matchedInquiry?.batchId && g.id === matchedInquiry.batchId) return true;
      if (matchedMockReg?.batchId && g.id === matchedMockReg.batchId) return true;
      return g.members.some(
        (m) =>
          (resolvedPhone && mobileMatches(m.phone, resolvedPhone)) ||
          (matchedInquiry?.referenceNumber && m.referenceNumber === matchedInquiry.referenceNumber) ||
          (matchedMockReg?.referenceNumber && m.referenceNumber === matchedMockReg.referenceNumber) ||
          (resolvedId && m.studentId && m.studentId.toLowerCase() === resolvedId.toLowerCase())
      );
    });

    const resolvedBatchIds = Array.from(
      new Set([
        ...(matchedInquiry?.batchId ? [matchedInquiry.batchId] : []),
        ...(matchedMockReg?.batchId ? [matchedMockReg.batchId] : []),
        ...matchedBatches.map((g) => g.id),
      ])
    );
    const resolvedBatchNames = Array.from(
      new Set([
        ...(matchedInquiry?.batchName ? [matchedInquiry.batchName] : []),
        ...(matchedMockReg?.batchName ? [matchedMockReg.batchName] : []),
        ...matchedBatches.map((g) => g.name || g.title),
      ])
    );

    const user: UserProfile = {
      id: `student-${Date.now()}`,
      email: email || matchedInquiry?.email || matchedMockReg?.email || matchedGroupMember?.email || `${(resolvedId || 'student').toLowerCase()}@shikshyalaya.edu.np`,
      name: resolvedName || 'Enrolled Scholar',
      phone: resolvedPhone,
      role: 'student',
      studentId: normalizeMobileNumber(resolvedPhone) || resolvedId || `SSS-STU-${firstSlug.toUpperCase().slice(0, 3)}-2026`,
      enrolledCourseSlugs: enrolled,
      enrolledSubjects: resolvedEnrolledSubjects,
      batchId: resolvedBatchIds[0],
      batchName: resolvedBatchNames[0],
      batchIds: resolvedBatchIds,
      batchNames: resolvedBatchNames,
    };
    setCurrentUser(user);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
    } catch {}
    return true;
  };

  const updateStudentEnrollment = (courseSlugs: string[]) => {
    if (currentUser && currentUser.role === 'student') {
      const updated: UserProfile = {
        ...currentUser,
        enrolledCourseSlugs: courseSlugs,
      };
      setCurrentUser(updated);
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(updated));
    }
  };

  const updateStudentEnrolledSubjects = (subjects: string[]) => {
    if (currentUser && currentUser.role === 'student') {
      const updated: UserProfile = {
        ...currentUser,
        enrolledSubjects: subjects,
      };
      setCurrentUser(updated);
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(updated));
    }
  };

  const isStudentEnrolledInCourse = (courseSlug: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return currentUser.enrolledCourseSlugs?.includes(courseSlug) ?? false;
  };

  const normalizeSubjectParts = (raw: string) => {
    const cleaned = (raw || '')
      .replace(/^[A-Z]{2,5}\s*\d{2,4}\s*[:\-–]\s*/i, '')
      .replace(/&/g, ' and ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    const parenMatches = Array.from(cleaned.matchAll(/\(([^)]+)\)/g)).map((m) => m[1].trim());
    const base = cleaned.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
    const partNums = cleaned.match(/\b(i|ii|iii|iv|1|2|3|4|11|12)\b/g) || [];
    return { full: cleaned, base, parenMatches, partNums };
  };

  const subjectsMatch = (enrolled: string, target: string): boolean => {
    const e = normalizeSubjectParts(enrolled);
    const t = normalizeSubjectParts(target);
    if (!e.full || !t.full) return false;

    if (e.full === t.full || e.base === t.base) return true;
    if (t.parenMatches.some((p) => p === e.full || p === e.base)) return true;
    if (e.parenMatches.some((p) => p === t.full || p === t.base)) return true;

    // Prevent Grade 11 vs Grade 12 or Part I vs Part II cross-leakage
    if (e.partNums.length > 0 && t.partNums.length > 0 && e.partNums.join(',') !== t.partNums.join(',')) {
      return false;
    }

    // Allow suffix qualifier match (e.g. "Business Statistics" -> "Business Statistics & Data Analysis (PU)")
    // only when the enrolled subject starts the target base at a word boundary
    if (
      e.base.length >= 6 &&
      (t.base.startsWith(`${e.base} `) || t.base.startsWith(`${e.base}:`))
    ) {
      return true;
    }
    if (
      t.base.length >= 6 &&
      (e.base.startsWith(`${t.base} `) || e.base.startsWith(`${t.base}:`))
    ) {
      return true;
    }
    return false;
  };

  const isStudentEnrolledInSubject = (courseSlug: string, subjectName: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (!currentUser.enrolledCourseSlugs?.includes(courseSlug)) return false;
    // If student has specific enrolledSubjects restriction:
    if (currentUser.enrolledSubjects && currentUser.enrolledSubjects.length > 0) {
      if (!subjectName || !subjectName.trim()) return false;
      return currentUser.enrolledSubjects.some((s) => subjectsMatch(s, subjectName));
    }
    // If no specific subject restriction list was attached, user can view the enrolled course's subjects
    return true;
  };

  const getStudentLiveBatches = (): StudentGroup[] => {
    if (!currentUser || currentUser.role !== 'student') return [];
    const matchedGroupIds = new Set<string>();

    // Include batches directly where student appears as a member
    studentGroups.forEach((g) => {
      const inMembers = g.members.some(
        (m) =>
          (currentUser.phone && mobileMatches(m.phone, currentUser.phone)) ||
          (currentUser.studentId && m.phone && mobileMatches(m.phone, currentUser.studentId)) ||
          (currentUser.studentId &&
            m.studentId &&
            m.studentId.toLowerCase() === currentUser.studentId.toLowerCase())
      );
      if (inMembers) matchedGroupIds.add(g.id);
    });

    // Live check verified/enrolled inquiries & mock registrations matching this student
    inquiries.forEach((inq) => {
      if (!inq.batchId) return;
      const matches =
        (currentUser.phone && inq.phone && mobileMatches(inq.phone, currentUser.phone)) ||
        (currentUser.studentId && inq.phone && mobileMatches(inq.phone, currentUser.studentId)) ||
        (currentUser.studentId &&
          inq.assignedStudentId &&
          inq.assignedStudentId.toLowerCase() === currentUser.studentId.toLowerCase());
      if (matches) matchedGroupIds.add(inq.batchId);
    });

    mockTestRegistrations.forEach((reg) => {
      if (!reg.batchId) return;
      const matches =
        (currentUser.phone && reg.phone && mobileMatches(reg.phone, currentUser.phone)) ||
        (currentUser.studentId && reg.phone && mobileMatches(reg.phone, currentUser.studentId));
      if (matches) matchedGroupIds.add(reg.batchId);
    });

    // Fallback to session profile batch IDs if live groups haven't been created yet
    if (matchedGroupIds.size === 0) {
      const fromProfile = currentUser.batchIds || (currentUser.batchId ? [currentUser.batchId] : []);
      fromProfile.forEach((id) => matchedGroupIds.add(id));
    }

    return studentGroups.filter((g) => matchedGroupIds.has(g.id));
  };

  const getStudentLiveBatchIds = (): string[] => {
    if (!currentUser || currentUser.role !== 'student') return [];
    const liveIds = getStudentLiveBatches().map((g) => g.id);
    const fromProfile = currentUser.batchIds || (currentUser.batchId ? [currentUser.batchId] : []);
    return Array.from(new Set([...liveIds, ...(liveIds.length === 0 ? fromProfile : [])]));
  };

  const isStudentAllowedMaterial = (material: StudyMaterial): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (!isStudentEnrolledInSubject(material.courseSlug, material.subject)) return false;
    // Common material (no specific batch set or explicitly All Batches)
    if (!material.batchId || material.batchId === 'ALL') return true;

    const liveBatches = getStudentLiveBatches();
    const studentBatchIds = liveBatches.map((b) => b.id);
    if (studentBatchIds.includes(material.batchId)) return true;
    if (
      material.batchName &&
      (liveBatches.some((b) => (b.name || b.title) === material.batchName) ||
        currentUser.batchNames?.includes(material.batchName) ||
        currentUser.batchName === material.batchName)
    ) {
      return true;
    }
    return false;
  };

  const isStudentAllowedMockTest = (test: MockTest): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (!isStudentEnrolledInSubject(test.courseSlug, test.subject)) return false;
    if (!test.batchId || test.batchId === 'ALL') return true;

    const liveBatches = getStudentLiveBatches();
    if (liveBatches.some((b) => b.id === test.batchId)) return true;
    if (
      test.batchName &&
      (liveBatches.some((b) => (b.name || b.title) === test.batchName) ||
        currentUser.batchNames?.includes(test.batchName) ||
        currentUser.batchName === test.batchName)
    ) {
      return true;
    }
    return false;
  };

  const isStudentBatchRestricted = (material: StudyMaterial): boolean => {
    if (!currentUser || currentUser.role !== 'student') return false;
    if (!isStudentEnrolledInSubject(material.courseSlug, material.subject)) return false;
    if (!material.batchId || material.batchId === 'ALL') return false;
    return !isStudentAllowedMaterial(material);
  };

  const registerForMockTest = (
    data: Omit<MockTestRegistration, 'id' | 'referenceNumber' | 'status' | 'createdAt'>
  ): MockTestRegistration => {
    const id = `mockreg-${Date.now()}`;
    const rand = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = `MOCK-REG-2026-${rand}`;
    const cleanBatchId =
      data.batchId && data.batchId !== 'NONE' && data.batchId !== 'ALL' ? data.batchId : undefined;
    const matchedBatch = cleanBatchId ? studentGroups.find((g) => g.id === cleanBatchId) : undefined;
    const resolvedBatchName = matchedBatch
      ? matchedBatch.name || matchedBatch.title
      : cleanBatchId
      ? data.batchName
      : undefined;

    const newReg: MockTestRegistration = {
      ...data,
      batchId: cleanBatchId,
      batchName: resolvedBatchName,
      id,
      referenceNumber,
      status: 'Registered',
      createdAt: new Date().toISOString(),
    };

    setMockTestRegistrations((prev) => {
      const next = [newReg, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.MOCK_REGISTRATIONS, JSON.stringify(next));
      } catch {}
      return next;
    });

    // Save to Supabase cloud table
    saveMockRegistrationToSupabase(newReg).catch(console.warn);

    // If a batch was selected, also enroll into that batch group
    if (matchedBatch) {
      const now = newReg.createdAt;
      const newMember: StudentGroupMember = {
        id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        fullName: newReg.fullName,
        phone: newReg.phone,
        email: newReg.email,
        studentId: normalizeMobileNumber(newReg.phone) || newReg.studentRollNo || newReg.referenceNumber,
        referenceNumber: newReg.referenceNumber,
        enrolledCourseSlug: newReg.courseSlug,
        enrolledSubjects: newReg.enrolledSubjects,
        semesterOrYear: newReg.semesterOrYear,
        batchId: matchedBatch.id,
        batchName: resolvedBatchName,
        source: 'Mock Test Registration',
        addedAt: now,
      };
      setStudentGroups((prev) =>
        prev.map((g) => {
          if (g.id !== matchedBatch.id) return g;
          const exists = g.members.some(
            (m) =>
              (m.phone && mobileMatches(m.phone, newReg.phone)) ||
              m.referenceNumber === newReg.referenceNumber
          );
          if (exists) return g;
          const updatedGroup = { ...g, members: [newMember, ...g.members], updatedAt: now };
          saveStudentGroupToSupabase(updatedGroup).catch(console.warn);
          return updatedGroup;
        })
      );
    }

    // Broadcast across windows / tabs
    try {
      window.dispatchEvent(new CustomEvent('mock_test_registered', { detail: newReg }));
    } catch {}

    // Mirror to inquiries stream so admin gets instant visibility in all tabs/views
    const mirroredInquiry: AdmissionInquiry = {
      id: `inq-${newReg.id}`,
      referenceNumber: newReg.referenceNumber,
      fullName: newReg.fullName,
      email: newReg.email || `${newReg.phone}@student.shikshyalaya.edu.np`,
      phone: newReg.phone,
      courseSlug: newReg.courseSlug,
      courseName: newReg.courseName,
      courseType: newReg.courseType || 'New Course',
      academicLevel: newReg.semesterOrYear || '1st Year',
      subjectsOfInterest: (newReg.enrolledSubjects && newReg.enrolledSubjects.length > 0)
        ? newReg.enrolledSubjects.join(', ')
        : 'General Mock Series',
      preferredMode: (newReg.preferredMode?.includes('Offline') ? 'Offline' : newReg.preferredMode?.includes('Hybrid') ? 'Hybrid' : 'Online') as any,
      preferredShift: ((newReg.shift || '').toLowerCase().includes('evening') ? 'Evening' : (newReg.shift || '').toLowerCase().includes('day') ? 'Day' : 'Morning') as any,
      batchId: cleanBatchId,
      batchName: resolvedBatchName,
      message: `Candidate registered for Mock Examination Series (${newReg.shift || 'General Shift'}) with subjects: ${(newReg.enrolledSubjects || []).join(', ')}.`,
      status: 'New',
      adminNotes: [
        {
          date: new Date().toLocaleDateString(),
          text: `Candidate registered for Mock Examination Series (${newReg.shift || 'General Shift'})${resolvedBatchName ? ` • Batch: ${resolvedBatchName}` : ''} with subjects: ${(newReg.enrolledSubjects || []).join(', ')}.`,
          by: 'Mock Test Registration Portal',
        },
      ],
      createdAt: newReg.createdAt,
      updatedAt: newReg.createdAt,
    };

    setInquiries((prev) => {
      const nextInqs = [mirroredInquiry, ...prev];
      persistInquiriesSafely(nextInqs);
      return nextInqs;
    });
    saveInquiryToSupabase(mirroredInquiry).catch(console.warn);

    return newReg;
  };

  const updateMockTestRegistrationStatus = (id: string, status: MockTestRegistration['status']) => {
    setMockTestRegistrations((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, status } : r));
      const target = next.find((r) => r.id === id);
      if (target) {
        saveMockRegistrationToSupabase(target).catch(console.warn);
      }
      try {
        localStorage.setItem(STORAGE_KEYS.MOCK_REGISTRATIONS, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const deleteMockTestRegistration = (id: string) => {
    recordDeletedIds('mockRegistrations', [id]);
    setMockTestRegistrations((prev) => {
      const next = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.MOCK_REGISTRATIONS, JSON.stringify(next));
      } catch {}
      return next;
    });
    deleteMockRegistrationFromSupabase(id).catch(console.warn);
  };

  const clearAllMockTestRegistrations = () => {
    recordDeletedIds('mockRegistrations', mockTestRegistrations.map((r) => r.id));
    setMockTestRegistrations([]);
    try {
      localStorage.setItem(STORAGE_KEYS.MOCK_REGISTRATIONS, JSON.stringify([]));
    } catch {}
    clearAllMockRegistrationsFromSupabase().catch(console.warn);
  };

  const refreshMockRegistrations = async () => {
    try {
      const remote = await fetchMockRegistrationsFromSupabase();
      if (remote && remote.length > 0) {
        const deletedSet = getDeletedIdsSet('mockRegistrations');
        setMockTestRegistrations((localRegs) => {
          const map = new Map<string, MockTestRegistration>();
          localRegs.forEach((r) => {
            if (!deletedSet.has(r.id)) map.set(r.id, r);
          });
          remote.forEach((r) => {
            if (!deletedSet.has(r.id)) map.set(r.id, r);
          });
          const merged = Array.from(map.values());
          try {
            localStorage.setItem(STORAGE_KEYS.MOCK_REGISTRATIONS, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }

      const remoteInqs = await fetchInquiriesFromSupabase(false);
      if (remoteInqs && remoteInqs.length > 0) {
        setInquiries((localInqs) => {
          const merged = mergeInquiryLists(localInqs, remoteInqs);
          persistInquiriesSafely(merged);
          return merged;
        });
      }
    } catch (e) {
      console.warn('Failed to refresh registrations from cloud:', e);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      sessionStorage.clear();
      // Remove any temporary student search queries or cached session tokens
      localStorage.removeItem('shikshyalaya_student_session');
      localStorage.removeItem('shikshyalaya_last_lookup_roll');
      localStorage.removeItem('shikshyalaya_recent_submission_ref');
    } catch (e) {
      console.warn('Error clearing session storage on logout:', e);
    }
  };

  const addMockTest = (testData: Partial<MockTest>): MockTest => {
    const newTest: MockTest = {
      id: `mock-${Date.now()}`,
      title: testData.title || 'Untitled Mock Test',
      courseSlug: testData.courseSlug || 'bbs-tu',
      courseName: testData.courseName || 'BBS – TU',
      courseType: testData.courseType || 'New Course',
      semesterOrYear: testData.semesterOrYear || '1st Year',
      subject: testData.subject || 'General Subject',
      subjectCode: testData.subjectCode || '',
      batchId: testData.batchId || 'ALL',
      batchName:
        testData.batchId && testData.batchId !== 'ALL'
          ? testData.batchName
          : undefined,
      examDate: testData.examDate || new Date().toISOString().split('T')[0],
      startTime: testData.startTime || '07:00 AM',
      durationMinutes: Number(testData.durationMinutes) || 180,
      fullMarks: Number(testData.fullMarks) || 100,
      passMarks: Number(testData.passMarks) || 35,
      instructions:
        testData.instructions && testData.instructions.length > 0
          ? testData.instructions
          : [
              'All answers must be handwritten on clear blank sheets.',
              'All working notes and rough calculations must be clearly shown.',
              'Scan pages systematically and upload before the countdown timer hits 00:00:00.',
              'Late uploads will be flagged automatically for examiner review.',
            ],
      questionPaperUrl: testData.questionPaperUrl,
      questionPaperName: testData.questionPaperName || 'Question_Paper.pdf',
      questionPaperSize: testData.questionPaperSize || '1.2 MB',
      questionText: testData.questionText || '',
      modelAnswerUrl: testData.modelAnswerUrl,
      status: testData.status || 'Live / In-Progress',
      published: testData.published !== undefined ? testData.published : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMockTests((prev) => [newTest, ...prev]);
    return newTest;
  };

  const updateMockTest = (id: string, updates: Partial<MockTest>) => {
    setMockTests((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              ...updates,
              batchId: updates.batchId !== undefined ? updates.batchId || 'ALL' : t.batchId,
              batchName:
                updates.batchId !== undefined
                  ? updates.batchId && updates.batchId !== 'ALL'
                    ? updates.batchName
                    : undefined
                  : t.batchName,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const deleteMockTest = (id: string) => {
    recordDeletedIds('mockTests', [id]);
    const removedSubs = mockTestSubmissions.filter((s) => s.mockTestId === id).map((s) => s.id);
    recordDeletedIds('mockSubmissions', removedSubs);
    deleteMockTestFromSupabase(id).catch(console.warn);
    setMockTests((prev) => {
      const next = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.MOCK_TESTS, JSON.stringify(next));
      } catch {}
      return next;
    });
    setMockTestSubmissions((prev) => {
      const next = prev.filter((s) => s.mockTestId !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.MOCK_SUBMISSIONS, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearAllMockTests = () => {
    recordDeletedIds('mockTests', mockTests.map((t) => t.id));
    clearAllMockTestsFromSupabase().catch(console.warn);
    setMockTests([]);
    try {
      localStorage.setItem(STORAGE_KEYS.MOCK_TESTS, JSON.stringify([]));
    } catch {}
  };

  const deleteMockTestSubmission = (id: string) => {
    recordDeletedIds('mockSubmissions', [id]);
    deleteMockSubmissionFromSupabase(id).catch(console.warn);
    setMockTestSubmissions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.MOCK_SUBMISSIONS, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearAllMockTestSubmissions = () => {
    recordDeletedIds('mockSubmissions', mockTestSubmissions.map((s) => s.id));
    clearAllMockSubmissionsFromSupabase().catch(console.warn);
    setMockTestSubmissions([]);
    try {
      localStorage.setItem(STORAGE_KEYS.MOCK_SUBMISSIONS, JSON.stringify([]));
    } catch {}
  };

  const togglePublishMockTest = (id: string) => {
    setMockTests((prev) =>
      prev.map((t) => (t.id === id ? { ...t, published: !t.published, updatedAt: new Date().toISOString() } : t))
    );
  };

  const startMockExamTimer = (
    id: string,
    options?: { scheduledStartTime?: string; durationMinutes?: number; uploadGraceMinutes?: number }
  ) => {
    const now = new Date().toISOString();
    const isScheduledFuture = Boolean(
      options?.scheduledStartTime && new Date(options.scheduledStartTime).getTime() > Date.now()
    );
    const timerStatus = isScheduledFuture ? 'scheduled' : 'live';

    setMockTests((prev) => {
      const next = prev.map((t) => {
        if (t.id === id) {
          const updated: MockTest = {
            ...t,
            durationMinutes: options?.durationMinutes || t.durationMinutes || 180,
            uploadGraceMinutes:
              options?.uploadGraceMinutes !== undefined ? options.uploadGraceMinutes : (t.uploadGraceMinutes ?? 15),
            scheduledStartTime: options?.scheduledStartTime || t.scheduledStartTime,
            liveExamStartedAt: isScheduledFuture ? undefined : now,
            extendedMinutes: 0,
            extensionReason: undefined,
            concludedAt: undefined,
            timerStatus,
            status: isScheduledFuture ? 'Upcoming' : 'Live / In-Progress',
            updatedAt: now,
          };
          return updated;
        }
        return t;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.MOCK_TESTS, JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      window.dispatchEvent(
        new CustomEvent('mock_test_timer_changed', {
          detail: {
            testId: id,
            updates: {
              liveExamStartedAt: isScheduledFuture ? undefined : now,
              scheduledStartTime: options?.scheduledStartTime,
              timerStatus,
              status: isScheduledFuture ? 'Upcoming' : 'Live / In-Progress',
              concludedAt: undefined,
            },
          },
        })
      );
    } catch {}
  };

  const extendMockExamTimer = (id: string, extraMinutes: number, reason?: string) => {
    const now = new Date().toISOString();
    setMockTests((prev) => {
      const next = prev.map((t) => {
        if (t.id === id) {
          const currentExt = t.extendedMinutes || 0;
          const nextExt = currentExt + extraMinutes;
          const extensionReason =
            reason || `Admin extended upload window by +${extraMinutes} mins for students.`;
          const updated: MockTest = {
            ...t,
            extendedMinutes: nextExt,
            extensionReason,
            concludedAt: undefined,
            timerStatus: 'upload_grace',
            status: 'Live / In-Progress',
            updatedAt: now,
          };
          return updated;
        }
        return t;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.MOCK_TESTS, JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      window.dispatchEvent(
        new CustomEvent('mock_test_timer_changed', {
          detail: {
            testId: id,
            updates: {
              extendedMinutes: extraMinutes,
              extensionReason: reason || `Admin extended upload window by +${extraMinutes} mins.`,
              timerStatus: 'upload_grace',
              concludedAt: undefined,
            },
          },
        })
      );
    } catch {}
  };

  const concludeMockExamTimer = (id: string) => {
    const now = new Date().toISOString();
    setMockTests((prev) => {
      const next = prev.map((t) => {
        if (t.id === id) {
          const updated: MockTest = {
            ...t,
            concludedAt: now,
            timerStatus: 'concluded',
            status: 'Evaluation Closed',
            updatedAt: now,
          };
          return updated;
        }
        return t;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.MOCK_TESTS, JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      window.dispatchEvent(
        new CustomEvent('mock_test_timer_changed', {
          detail: {
            testId: id,
            updates: {
              concludedAt: now,
              timerStatus: 'concluded',
              status: 'Evaluation Closed',
            },
          },
        })
      );
    } catch {}
  };

  const resetMockExamTimer = (id: string) => {
    const now = new Date().toISOString();
    setMockTests((prev) => {
      const next = prev.map((t) => {
        if (t.id === id) {
          const updated: MockTest = {
            ...t,
            scheduledStartTime: undefined,
            liveExamStartedAt: undefined,
            extendedMinutes: 0,
            extensionReason: undefined,
            concludedAt: undefined,
            timerStatus: 'idle',
            status: 'Upcoming',
            updatedAt: now,
          };
          return updated;
        }
        return t;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.MOCK_TESTS, JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      window.dispatchEvent(
        new CustomEvent('mock_test_timer_changed', {
          detail: {
            testId: id,
            updates: {
              timerStatus: 'idle',
              status: 'Upcoming',
            },
          },
        })
      );
    } catch {}
  };

  const submitMockTestAnswer = (
    submission: Omit<MockTestSubmission, 'id' | 'submittedAt'>
  ): { success: boolean; submissionId: string; message: string } => {
    const id = `sub-${Date.now()}`;
    const newSubmission: MockTestSubmission = {
      ...submission,
      id,
      submittedAt: new Date().toISOString(),
      evaluationStatus: 'Submitted',
    };
    setMockTestSubmissions((prev) => [newSubmission, ...prev]);
    saveMockSubmissionToSupabase(newSubmission).catch(console.warn);
    return {
      success: true,
      submissionId: id,
      message: 'Your answer sheet has been successfully uploaded and queued for examiner review.',
    };
  };

  const gradeMockTestSubmission = (
    submissionId: string,
    gradeData: {
      marksObtained: number;
      evaluationStatus: 'Submitted' | 'Under Review' | 'Evaluated';
      feedbackRemarks?: string;
      evaluatedBy?: string;
      evaluatedPaperUrl?: string;
      evaluatedPaperName?: string;
    }
  ) => {
    setMockTestSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === submissionId) {
          const updated = {
            ...s,
            marksObtained: gradeData.marksObtained,
            evaluationStatus: gradeData.evaluationStatus,
            feedbackRemarks: gradeData.feedbackRemarks,
            evaluatedBy: gradeData.evaluatedBy || 'Teacher / Examiner',
            evaluatedAt: new Date().toISOString(),
            evaluatedPaperUrl: gradeData.evaluatedPaperUrl || s.evaluatedPaperUrl,
            evaluatedPaperName: gradeData.evaluatedPaperName || s.evaluatedPaperName,
          };
          saveMockSubmissionToSupabase(updated).catch(console.warn);
          return updated;
        }
        return s;
      })
    );
  };

  const uploadMockTestResult = (resultData: {
    mockTestId: string;
    studentId: string;
    studentName: string;
    rollNumber?: string;
    studentEmail?: string;
    studentPhone?: string;
    marksObtained: number;
    feedbackRemarks: string;
    evaluatedBy: string;
    answerFileName?: string;
    isLateSubmission?: boolean;
    evaluatedPaperUrl?: string;
    evaluatedPaperName?: string;
  }): { success: boolean; message: string } => {
    const targetTest = mockTests.find((t) => t.id === resultData.mockTestId);
    const existingIndex = mockTestSubmissions.findIndex(
      (s) =>
        s.mockTestId === resultData.mockTestId &&
        (s.studentId.trim().toLowerCase() === resultData.studentId.trim().toLowerCase() ||
          (resultData.rollNumber && s.rollNumber?.trim().toLowerCase() === resultData.rollNumber.trim().toLowerCase()))
    );

    if (existingIndex >= 0) {
      let updatedItem: MockTestSubmission | null = null;
      setMockTestSubmissions((prev) => {
        const copy = [...prev];
        const updated = {
          ...copy[existingIndex],
          marksObtained: resultData.marksObtained,
          feedbackRemarks: resultData.feedbackRemarks,
          evaluatedBy: resultData.evaluatedBy,
          evaluationStatus: 'Evaluated' as const,
          evaluatedAt: new Date().toISOString(),
          evaluatedPaperUrl: resultData.evaluatedPaperUrl || copy[existingIndex].evaluatedPaperUrl,
          evaluatedPaperName: resultData.evaluatedPaperName || copy[existingIndex].evaluatedPaperName,
        };
        copy[existingIndex] = updated;
        updatedItem = updated;
        return copy;
      });
      if (updatedItem) {
        saveMockSubmissionToSupabase(updatedItem).catch(console.warn);
      }
      return { success: true, message: `Marks and examiner feedback updated for ${resultData.studentName}.` };
    }

    const newSub: MockTestSubmission = {
      id: `res-${Date.now()}`,
      mockTestId: resultData.mockTestId,
      mockTestTitle: targetTest?.title || 'Mock Examination',
      courseSlug: targetTest?.courseSlug || 'bbs-tu',
      studentId: resultData.studentId,
      studentName: resultData.studentName,
      studentEmail: resultData.studentEmail || `${resultData.studentId.toLowerCase()}@shikshyalaya.edu.np`,
      studentPhone: resultData.studentPhone || '98XXXXXXXX',
      rollNumber: resultData.rollNumber || resultData.studentId,
      submittedAt: new Date().toISOString(),
      timeTakenSeconds: (targetTest?.durationMinutes || 180) * 60,
      isLateSubmission: resultData.isLateSubmission || false,
      answerFileName: resultData.answerFileName || 'Student_Answer_Sheet.pdf',
      answerFileSize: '2.4 MB',
      marksObtained: resultData.marksObtained,
      evaluationStatus: 'Evaluated',
      evaluatedBy: resultData.evaluatedBy,
      evaluatedAt: new Date().toISOString(),
      feedbackRemarks: resultData.feedbackRemarks,
      evaluatedPaperUrl: resultData.evaluatedPaperUrl,
      evaluatedPaperName: resultData.evaluatedPaperName,
    };

    setMockTestSubmissions((prev) => [newSub, ...prev]);
    saveMockSubmissionToSupabase(newSub).catch(console.warn);
    return { success: true, message: `Official evaluation result published for ${resultData.studentName}.` };
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ne' : 'en'));
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        courses,
        addCourse,
        updateCourse,
        togglePublishCourse,
        deleteCourse,
        clearAllCourses,
        restoreDefaultCourses,
        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        clearAllTeachers,
        notices,
        addNotice,
        updateNotice,
        deleteNotice,
        clearAllNotices,
        studyMaterials,
        addStudyMaterial,
        updateStudyMaterial,
        deleteStudyMaterial,
        clearAllStudyMaterials,
        resolveMaterialUrl,
        gallery,
        addGalleryItem,
        deleteGalleryItem,
        inquiries,
        submitAdmissionInquiry,
        updateInquiryStatus,
        verifyAndEnrollApplicant,
        attachPaymentProofToInquiry,
        addInquiryNote,
        assignInquiryBatch,
        deleteInquiry,
        deleteMultipleInquiries,
        clearAllInquiries,
        refreshInquiries,
        resolveInquiryProofUrl,
        exportInquiriesCSV,
        contactMessages,
        submitContactMessage,
        studentGroups,
        addStudentGroup,
        updateStudentGroup,
        deleteStudentGroup,
        clearAllStudentGroups,
        addMemberToGroup,
        bulkAddMembersToGroup,
        importVerifiedInquiriesToGroup,
        removeMemberFromGroup,
        moveMemberToBatch,
        sendGroupBroadcast,
        deleteGroupBroadcast,
        mockTests,
        addMockTest,
        updateMockTest,
        deleteMockTest,
        clearAllMockTests,
        togglePublishMockTest,
        startMockExamTimer,
        extendMockExamTimer,
        concludeMockExamTimer,
        resetMockExamTimer,
        mockTestSubmissions,
        deleteMockTestSubmission,
        clearAllMockTestSubmissions,
        submitMockTestAnswer,
        gradeMockTestSubmission,
        uploadMockTestResult,
        mockTestRegistrations,
        registerForMockTest,
        updateMockTestRegistrationStatus,
        assignMockRegistrationBatch,
        deleteMockTestRegistration,
        clearAllMockTestRegistrations,
        refreshMockRegistrations,
        currentUser,
        loginAsAdmin,
        loginAsStudent,
        updateStudentEnrollment,
        updateStudentEnrolledSubjects,
        isStudentEnrolledInCourse,
        isStudentEnrolledInSubject,
        getStudentLiveBatches,
        getStudentLiveBatchIds,
        isStudentAllowedMaterial,
        isStudentAllowedMockTest,
        isStudentBatchRestricted,
        subjectsMatch,
        logout,
        language,
        toggleLanguage,
        supabaseStatus,
        checkSupabaseStatus,
        syncAllToSupabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
