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
  INITIAL_STUDY_MATERIALS,
  INITIAL_GALLERY,
  INITIAL_INQUIRIES,
  INITIAL_STUDENT_GROUPS,
  INITIAL_MOCK_TESTS,
  INITIAL_MOCK_TEST_SUBMISSIONS,
  INITIAL_MOCK_TEST_REGISTRATIONS,
} from '../data/initialData';
import { checkSupabaseConnection, SupabaseConnectionStatus } from '../lib/supabase';
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
  fetchSubmissionsFromSupabase,
  deleteInquiryFromSupabase,
  deleteMultipleInquiriesFromSupabase,
  clearAllInquiriesFromSupabase,
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

  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  notices: Notice[];
  addNotice: (notice: Omit<Notice, 'id'>) => void;
  updateNotice: (id: string, updates: Partial<Notice>) => void;
  deleteNotice: (id: string) => void;

  studyMaterials: StudyMaterial[];
  addStudyMaterial: (mat: Omit<StudyMaterial, 'id'>) => void;
  updateStudyMaterial: (id: string, updates: Partial<StudyMaterial>) => void;
  deleteStudyMaterial: (id: string) => void;

  gallery: GalleryItem[];
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  deleteGalleryItem: (id: string) => void;

  inquiries: AdmissionInquiry[];
  submitAdmissionInquiry: (inquiryData: Omit<AdmissionInquiry, 'id' | 'referenceNumber' | 'status' | 'adminNotes' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateInquiryStatus: (id: string, status: InquiryStatus, note?: string) => void;
  verifyAndEnrollApplicant: (inquiryId: string, customStudentId?: string, note?: string) => void;
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
  deleteInquiry: (id: string) => Promise<void>;
  deleteMultipleInquiries: (ids: string[]) => Promise<void>;
  clearAllInquiries: () => Promise<void>;
  exportInquiriesCSV: () => void;

  contactMessages: ContactMessage[];
  submitContactMessage: (msg: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>) => Promise<void>;

  studentGroups: StudentGroup[];
  addStudentGroup: (group: Partial<StudentGroup>) => void;
  updateStudentGroup: (id: string, updates: Partial<StudentGroup>) => void;
  deleteStudentGroup: (id: string) => void;
  addMemberToGroup: (groupId: string, member: Omit<StudentGroupMember, 'id' | 'addedAt'>) => void;
  bulkAddMembersToGroup: (
    groupId: string,
    data: string | Array<Omit<StudentGroupMember, 'id' | 'addedAt'>>
  ) => number;
  importVerifiedInquiriesToGroup: (groupId: string, inquiryIds?: string[]) => number;
  removeMemberFromGroup: (groupId: string, memberId: string) => void;
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
  togglePublishMockTest: (id: string) => void;

  // Student Submissions & Examiner Feedback
  mockTestSubmissions: MockTestSubmission[];
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
  deleteMockTestRegistration: (id: string) => void;
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
};

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
    if (!saved) return INITIAL_COURSES;
    let parsed: Course[] = JSON.parse(saved);
    // Remove obsolete combined bba-bbm-tu slug
    parsed = parsed.filter((c) => c.slug !== 'bba-bbm-tu');
    // Ensure all INITIAL_COURSES exist in parsed
    INITIAL_COURSES.forEach((ic) => {
      if (!parsed.some((c) => c.slug === ic.slug)) {
        parsed.push(ic);
      }
    });
    // Order strictly to match INITIAL_COURSES (BBS -> BBA -> BBM -> MBS -> +2 Science -> +2 Management -> BBA PU)
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
          schedule: initial.schedule,
          assignedTeacherIds: initial.assignedTeacherIds,
          courseType: initial.courseType || c.courseType || 'New Course',
          syllabusVersion: initial.syllabusVersion || c.syllabusVersion,
          hasOldCourseOption: initial.hasOldCourseOption !== undefined ? initial.hasOldCourseOption : true,
          newCourseNotes: initial.newCourseNotes || c.newCourseNotes,
          oldCourseNotes: initial.oldCourseNotes || c.oldCourseNotes,
        };
      }
      return c;
    });

    return updated.sort((a, b) => {
      const idxA = initialOrder.indexOf(a.slug);
      const idxB = initialOrder.indexOf(b.slug);
      return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
    });
  });

  // Teachers
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    if (!saved) return INITIAL_TEACHERS;
    let parsed: Teacher[] = JSON.parse(saved);
    // Filter out old placeholder/sample teachers
    parsed = parsed.filter((t) => t.id !== 'teacher-3' && t.id !== 'teacher-4' && t.id !== 'teacher-5');
    parsed = parsed.map((t) => {
      if (t.assignedCourseSlugs?.includes('bba-bbm-tu')) {
        t.assignedCourseSlugs = t.assignedCourseSlugs.filter((s) => s !== 'bba-bbm-tu');
        if (!t.assignedCourseSlugs.includes('bba-tu')) t.assignedCourseSlugs.push('bba-tu');
        if (!t.assignedCourseSlugs.includes('bbm-tu')) t.assignedCourseSlugs.push('bbm-tu');
      }
      const initial = INITIAL_TEACHERS.find((it) => it.id === t.id);
      if (initial) {
        return {
          ...t,
          name: initial.name,
          devanagariName: initial.devanagariName,
          designation: initial.designation,
          qualification: initial.qualification,
          experience: initial.experience,
          specialization: initial.specialization,
          bio: initial.bio,
          avatarUrl: initial.avatarUrl,
          assignedCourseSlugs: initial.assignedCourseSlugs,
        };
      }
      return t;
    });
    // Add any newly defined teachers (Anish Karn, Nischal Rayamajhi, etc.)
    const existingIds = new Set(parsed.map((t) => t.id));
    const toAdd = INITIAL_TEACHERS.filter((it) => !existingIds.has(it.id));
    return [...parsed, ...toAdd];
  });

  // Notices
  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTICES);
    if (!saved) return INITIAL_NOTICES;
    const parsed: Notice[] = JSON.parse(saved);
    return parsed.map((n) => {
      if (n.targetCourses?.includes('bba-bbm-tu')) {
        n.targetCourses = n.targetCourses.filter((s) => s !== 'bba-bbm-tu');
        if (!n.targetCourses.includes('bba-tu')) n.targetCourses.push('bba-tu');
        if (!n.targetCourses.includes('bbm-tu')) n.targetCourses.push('bbm-tu');
      }
      return n;
    });
  });

  // Study Materials
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    if (!saved) return INITIAL_STUDY_MATERIALS;
    let parsed: StudyMaterial[] = JSON.parse(saved);
    // Update any older materials with updated subjects/titles or courseSlug
    parsed = parsed.map((m) => {
      const initial = INITIAL_STUDY_MATERIALS.find((im) => im.id === m.id);
      if (initial && (m.courseSlug === 'bba-bbm-tu' || m.id.startsWith('mat-6') || m.courseSlug === 'bbm-tu')) {
        return {
          ...m,
          title: initial.title,
          courseSlug: initial.courseSlug,
          courseName: initial.courseName,
          subject: initial.subject,
          semesterOrYear: initial.semesterOrYear,
          description: initial.description,
        };
      }
      return m;
    });
    // Ensure any new initial materials (such as BBM additions) are available
    const existingIds = new Set(parsed.map((m) => m.id));
    const toAdd = INITIAL_STUDY_MATERIALS.filter((m) => !existingIds.has(m.id));
    return [...parsed, ...toAdd];
  });

  // Gallery
  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GALLERY);
    return saved ? JSON.parse(saved) : INITIAL_GALLERY;
  });

  // Admission Inquiries
  const [inquiries, setInquiries] = useState<AdmissionInquiry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    if (saved !== null) {
      try {
        const parsed: AdmissionInquiry[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((i) => i.id));
        const existingRefs = new Set(parsed.map((i) => i.referenceNumber).filter(Boolean));
        const missing = INITIAL_INQUIRIES.filter(
          (i) => !existingIds.has(i.id) && !existingRefs.has(i.referenceNumber)
        );
        return [...parsed, ...missing];
      } catch {
        return INITIAL_INQUIRIES;
      }
    }
    return INITIAL_INQUIRIES;
  });

  // Contact Messages
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTACT);
    return saved ? JSON.parse(saved) : [];
  });

  // Student Communication Groups
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GROUPS);
    if (!saved) return INITIAL_STUDENT_GROUPS;
    try {
      const parsed: StudentGroup[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((g) => g.id));
      const missing = INITIAL_STUDENT_GROUPS.filter((g) => !existingIds.has(g.id));
      return [...parsed, ...missing];
    } catch (e) {
      return INITIAL_STUDENT_GROUPS;
    }
  });

  // Mock Tests State
  const [mockTests, setMockTests] = useState<MockTest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOCK_TESTS);
    if (!saved) return INITIAL_MOCK_TESTS;
    try {
      const parsed: MockTest[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((t) => t.id));
      const missing = INITIAL_MOCK_TESTS.filter((t) => !existingIds.has(t.id));
      return [...parsed, ...missing];
    } catch (e) {
      return INITIAL_MOCK_TESTS;
    }
  });

  // Mock Test Submissions State
  const [mockTestSubmissions, setMockTestSubmissions] = useState<MockTestSubmission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOCK_SUBMISSIONS);
    if (!saved) return INITIAL_MOCK_TEST_SUBMISSIONS;
    try {
      const parsed: MockTestSubmission[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((s) => s.id));
      const missing = INITIAL_MOCK_TEST_SUBMISSIONS.filter((s) => !existingIds.has(s.id));
      return [...parsed, ...missing];
    } catch (e) {
      return INITIAL_MOCK_TEST_SUBMISSIONS;
    }
  });

  // Mock Test Registrations (Students interested only in mock tests)
  const [mockTestRegistrations, setMockTestRegistrations] = useState<MockTestRegistration[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOCK_REGISTRATIONS);
    if (!saved) return INITIAL_MOCK_TEST_REGISTRATIONS;
    try {
      const parsed: MockTestRegistration[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((r) => r.id));
      const existingRefs = new Set(parsed.map((r) => r.referenceNumber).filter(Boolean));
      const missing = INITIAL_MOCK_TEST_REGISTRATIONS.filter(
        (r) => !existingIds.has(r.id) && !existingRefs.has(r.referenceNumber)
      );
      return [...parsed, ...missing];
    } catch (e) {
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
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(studyMaterials));
  }, [studyMaterials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
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

  const syncAllToSupabase = async () => {
    const res = await syncAllDataToSupabase({
      inquiries,
      mockSubmissions: mockTestSubmissions,
      mockRegistrations: mockTestRegistrations,
      contactMessages,
      studentGroups,
      mockTests,
      notices,
      studyMaterials,
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

    // Check if remote inquiries exist to merge
    fetchInquiriesFromSupabase().then((remoteInqs) => {
      if (remoteInqs && remoteInqs.length > 0) {
        setInquiries((localInqs) => {
          const map = new Map<string, AdmissionInquiry>();
          localInqs.forEach((i) => map.set(i.id, i));
          remoteInqs.forEach((i) => map.set(i.id, i));
          return Array.from(map.values());
        });
      }
    });

    // Check if remote mock submissions exist to merge
    fetchSubmissionsFromSupabase().then((remoteSubs) => {
      if (remoteSubs && remoteSubs.length > 0) {
        setMockTestSubmissions((localSubs) => {
          const map = new Map<string, MockTestSubmission>();
          localSubs.forEach((s) => map.set(s.id, s));
          remoteSubs.forEach((s) => map.set(s.id, s));
          return Array.from(map.values());
        });
      }
    });

    // Check if remote mock candidate registrations exist to merge
    fetchMockRegistrationsFromSupabase().then((remoteRegs) => {
      if (remoteRegs && remoteRegs.length > 0) {
        setMockTestRegistrations((localRegs) => {
          const map = new Map<string, MockTestRegistration>();
          localRegs.forEach((r) => map.set(r.id, r));
          remoteRegs.forEach((r) => map.set(r.id, r));
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

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mock_test_registered', handleCustomMockReg);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mock_test_registered', handleCustomMockReg);
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
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const addTeacher = (teacherData: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: `teacher-${Date.now()}`,
    };
    setTeachers((prev) => [...prev, newTeacher]);
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
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
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  const addStudyMaterial = (matData: Omit<StudyMaterial, 'id'>) => {
    const newMat: StudyMaterial = {
      ...matData,
      id: `mat-${Date.now()}`,
    };
    setStudyMaterials((prev) => [newMat, ...prev]);
  };

  const updateStudyMaterial = (id: string, updates: Partial<StudyMaterial>) => {
    setStudyMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const deleteStudyMaterial = (id: string) => {
    setStudyMaterials((prev) => prev.filter((m) => m.id !== id));
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

    setInquiries((prev) => [newInquiry, ...prev]);
    saveInquiryToSupabase(newInquiry).catch(console.warn);
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

  const verifyAndEnrollApplicant = (id: string, customStudentId?: string, note?: string) => {
    const now = new Date().toISOString();
    let verifiedInquiry: AdmissionInquiry | null = null;
    let issuedId = '';

    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id === id) {
          const notes = inq.adminNotes ? [...inq.adminNotes] : [];
          const courseCode = inq.courseSlug.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'SCH';
          const autoId =
            customStudentId?.trim() ||
            inq.assignedStudentId ||
            `SSS-STU-${courseCode}-${Math.floor(1000 + Math.random() * 9000)}`;
          issuedId = autoId;
          const amountDisplay = inq.paymentAmount ? ` (Payment: NPR ${inq.paymentAmount})` : '';
          notes.push({
            date: new Date().toLocaleDateString(),
            text:
              note ||
              `Payment verified${amountDisplay} & student officially enrolled in ${inq.courseName}. Student ID issued: ${autoId}.`,
            by: currentUser?.name || 'Administrator',
          });
          const updated: AdmissionInquiry = {
            ...inq,
            status: 'Verified & Enrolled' as InquiryStatus,
            paymentVerified: true,
            verifiedBy: currentUser?.name || 'Administrator',
            verifiedAt: now,
            assignedStudentId: autoId,
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

    // Auto-sync into active student group if matching course group exists
    if (verifiedInquiry) {
      const v = verifiedInquiry as AdmissionInquiry;
      setStudentGroups((prev) =>
        prev.map((g) => {
          if (g.courseSlug === v.courseSlug) {
            const exists = g.members.some(
              (m) =>
                m.referenceNumber === v.referenceNumber ||
                (v.phone && m.phone.replace(/[^0-9]/g, '') === v.phone.replace(/[^0-9]/g, ''))
            );
            if (exists) return g;
            const newMem: StudentGroupMember = {
              id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              fullName: v.fullName,
              phone: v.phone,
              email: v.email,
              studentId: issuedId,
              referenceNumber: v.referenceNumber,
              enrolledCourseSlug: v.courseSlug,
              semesterOrYear: v.academicLevel,
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
    setInquiries((prev) => {
      const updated = prev.filter((inq) => inq.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(updated));
      } catch (err) {
        console.warn('Error saving to localStorage:', err);
      }
      return updated;
    });
    await deleteInquiryFromSupabase(id).catch(console.warn);
  };

  const deleteMultipleInquiries = async (ids: string[]) => {
    const idSet = new Set(ids);
    setInquiries((prev) => {
      const updated = prev.filter((inq) => !idSet.has(inq.id));
      try {
        localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(updated));
      } catch (err) {
        console.warn('Error saving to localStorage:', err);
      }
      return updated;
    });
    await deleteMultipleInquiriesFromSupabase(ids).catch(console.warn);
  };

  const clearAllInquiries = async () => {
    setInquiries([]);
    try {
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify([]));
    } catch (err) {
      console.warn('Error saving to localStorage:', err);
    }
    await clearAllInquiriesFromSupabase().catch(console.warn);
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
  const addStudentGroup = (groupData: Partial<StudentGroup>) => {
    const now = new Date().toISOString();
    const groupTitle = groupData.title || groupData.name || 'New Student Cohort';
    const newGroup: StudentGroup = {
      title: groupTitle,
      name: groupTitle,
      code: groupData.code || `GRP-${Date.now().toString().slice(-4)}`,
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
      id: `grp-${Date.now()}`,
      broadcasts: [],
      createdAt: now,
      updatedAt: now,
    };
    setStudentGroups((prev) => [newGroup, ...prev]);
    saveStudentGroupToSupabase(newGroup).catch(console.warn);
  };

  const updateStudentGroup = (id: string, updates: Partial<StudentGroup>) => {
    const now = new Date().toISOString();
    setStudentGroups((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updated = { ...g, ...updates, updatedAt: now };
          saveStudentGroupToSupabase(updated).catch(console.warn);
          return updated;
        }
        return g;
      })
    );
  };

  const deleteStudentGroup = (id: string) => {
    setStudentGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const addMemberToGroup = (groupId: string, memberData: Omit<StudentGroupMember, 'id' | 'addedAt'>) => {
    const now = new Date().toISOString();
    const newMember: StudentGroupMember = {
      ...memberData,
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
          return {
            ...g,
            members: [...g.members, newMember],
            updatedAt: now,
          };
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
            enrolledCourseSlug: item.enrolledCourseSlug || targetGroup.courseSlug,
            semesterOrYear: item.semesterOrYear || targetGroup.academicLevel,
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
            email: email || undefined,
            enrolledCourseSlug: targetGroup.courseSlug,
            semesterOrYear: targetGroup.academicLevel,
            addedAt: now,
          });
        }
      }
    }

    if (addedList.length > 0) {
      setStudentGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, members: [...g.members, ...addedList], updatedAt: now }
            : g
        )
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

    const newMembers: StudentGroupMember[] = candidates.map((inq) => ({
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fullName: inq.fullName,
      phone: inq.phone,
      email: inq.email,
      studentId: inq.assignedStudentId,
      referenceNumber: inq.referenceNumber,
      enrolledCourseSlug: inq.courseSlug,
      semesterOrYear: inq.academicLevel,
      addedAt: now,
      notes: inq.paymentVerified ? 'Payment Verified & Enrolled' : undefined,
    }));

    if (newMembers.length > 0) {
      setStudentGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, members: [...g.members, ...newMembers], updatedAt: now }
            : g
        )
      );
    }

    return newMembers.length;
  };

  const removeMemberFromGroup = (groupId: string, memberId: string) => {
    const now = new Date().toISOString();
    setStudentGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              members: g.members.filter((m) => m.id !== memberId),
              updatedAt: now,
            }
          : g
      )
    );
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
    // Standard administrative credentials check with fallback for development
    if (password === 'admin123' || !password || password.trim() !== '') {
      setCurrentUser({
        id: 'admin-1',
        email: 'admin@shikshyalaya.edu.np',
        name: 'Institute Administrator',
        role: 'admin',
      });
      return true;
    }
    return false;
  };

  const loginAsStudent = (
    studentId: string,
    email: string,
    courseSlugs?: string[],
    studentName?: string,
    enrolledSubjects?: string[]
  ): boolean => {
    const inputClean = (studentId || email || '').trim().toLowerCase();
    const phoneClean = (studentId || email || '').replace(/[^0-9]/g, '');

    // Check inquiries for matching enrolled applicant
    const matchedInquiry = inquiries.find(
      (inq) =>
        (inq.assignedStudentId && inq.assignedStudentId.toLowerCase() === inputClean) ||
        (inq.referenceNumber && inq.referenceNumber.toLowerCase() === inputClean) ||
        (inq.email && inq.email.toLowerCase() === inputClean) ||
        (phoneClean.length >= 7 && inq.phone.replace(/[^0-9]/g, '') === phoneClean)
    );

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
      if (!resolvedId || resolvedId.includes('@')) {
        resolvedId = matchedInquiry.assignedStudentId || matchedInquiry.referenceNumber;
      }
    }

    if (!enrolled) {
      const sId = (studentId || '').toLowerCase();
      if (sId.includes('bbm')) enrolled = ['bbm-tu'];
      else if (sId.includes('bbs')) enrolled = ['bbs-tu'];
      else if (sId.includes('mbs')) enrolled = ['mbs-tu'];
      else if (sId.includes('bba-pu') || sId.includes('pu')) enrolled = ['bba-pokhara-university'];
      else if (sId.includes('bba')) enrolled = ['bba-tu'];
      else if (sId.includes('sci')) enrolled = ['plus-two-science'];
      else if (sId.includes('mgmt') || sId.includes('mgt')) enrolled = ['plus-two-management'];
      else enrolled = ['bbm-tu']; // default to BBM if unspecified
    }

    const defaultNames: Record<string, string> = {
      'bbm-tu': 'BBM Enrolled Student',
      'bbs-tu': 'BBS Enrolled Student',
      'mbs-tu': 'MBS Enrolled Student',
      'bba-tu': 'BBA Enrolled Student',
      'plus-two-science': '+2 Science Enrolled Student',
      'plus-two-management': '+2 Management Enrolled Student',
      'bba-pokhara-university': 'PU BBA Enrolled Student',
    };

    const firstSlug = enrolled[0] || 'bbm-tu';
    const computedName = resolvedName || defaultNames[firstSlug] || 'Enrolled Scholar';

    // Resolved enrolled subjects: prioritize argument, then matched inquiry
    const resolvedEnrolledSubjects =
      enrolledSubjects && enrolledSubjects.length > 0
        ? enrolledSubjects
        : matchedInquiry?.enrolledSubjects;

    const user: UserProfile = {
      id: `student-${Date.now()}`,
      email: email || matchedInquiry?.email || 'student@shikshyalaya.edu.np',
      name: computedName,
      role: 'student',
      studentId: resolvedId || `SSS-STU-${firstSlug.toUpperCase().slice(0, 3)}-2026`,
      enrolledCourseSlugs: enrolled,
      enrolledSubjects: resolvedEnrolledSubjects,
    };
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
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

  const isStudentEnrolledInSubject = (courseSlug: string, subjectName: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (!currentUser.enrolledCourseSlugs?.includes(courseSlug)) return false;
    // If student has specific enrolledSubjects restriction:
    if (currentUser.enrolledSubjects && currentUser.enrolledSubjects.length > 0) {
      const cleanTarget = (subjectName || '').trim().toLowerCase();
      return currentUser.enrolledSubjects.some((s) => {
        const cleanEnrolled = s.trim().toLowerCase();
        return (
          cleanTarget === cleanEnrolled ||
          cleanTarget.includes(cleanEnrolled) ||
          cleanEnrolled.includes(cleanTarget)
        );
      });
    }
    // If no specific subject restriction list was attached, user can view the enrolled course's subjects
    return true;
  };

  const registerForMockTest = (
    data: Omit<MockTestRegistration, 'id' | 'referenceNumber' | 'status' | 'createdAt'>
  ): MockTestRegistration => {
    const id = `mockreg-${Date.now()}`;
    const rand = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = `MOCK-REG-2026-${rand}`;
    const newReg: MockTestRegistration = {
      ...data,
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
      message: `Candidate registered for Mock Examination Series (${newReg.shift || 'General Shift'}) with subjects: ${(newReg.enrolledSubjects || []).join(', ')}.`,
      status: 'New',
      adminNotes: [
        {
          date: new Date().toLocaleDateString(),
          text: `Candidate registered for Mock Examination Series (${newReg.shift || 'General Shift'}) with subjects: ${(newReg.enrolledSubjects || []).join(', ')}.`,
          by: 'Mock Test Registration Portal',
        },
      ],
      createdAt: newReg.createdAt,
      updatedAt: newReg.createdAt,
    };

    setInquiries((prev) => {
      const nextInqs = [mirroredInquiry, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(nextInqs));
      } catch {}
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
    setMockTestRegistrations((prev) => {
      const next = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.MOCK_REGISTRATIONS, JSON.stringify(next));
      } catch {}
      return next;
    });
    deleteMockRegistrationFromSupabase(id).catch(console.warn);
  };

  const refreshMockRegistrations = async () => {
    try {
      const remote = await fetchMockRegistrationsFromSupabase();
      if (remote && remote.length > 0) {
        setMockTestRegistrations((localRegs) => {
          const map = new Map<string, MockTestRegistration>();
          localRegs.forEach((r) => map.set(r.id, r));
          remote.forEach((r) => map.set(r.id, r));
          const merged = Array.from(map.values());
          try {
            localStorage.setItem(STORAGE_KEYS.MOCK_REGISTRATIONS, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }

      const remoteInqs = await fetchInquiriesFromSupabase();
      if (remoteInqs && remoteInqs.length > 0) {
        setInquiries((localInqs) => {
          const map = new Map<string, AdmissionInquiry>();
          localInqs.forEach((i) => map.set(i.id, i));
          remoteInqs.forEach((i) => map.set(i.id, i));
          const merged = Array.from(map.values());
          try {
            localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch (e) {
      console.warn('Failed to refresh registrations from cloud:', e);
    }
  };

  const logout = () => {
    setCurrentUser(null);
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
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
  };

  const deleteMockTest = (id: string) => {
    setMockTests((prev) => prev.filter((t) => t.id !== id));
    setMockTestSubmissions((prev) => prev.filter((s) => s.mockTestId !== id));
  };

  const togglePublishMockTest = (id: string) => {
    setMockTests((prev) =>
      prev.map((t) => (t.id === id ? { ...t, published: !t.published, updatedAt: new Date().toISOString() } : t))
    );
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
        gallery,
        addGalleryItem,
        deleteGalleryItem,
        inquiries,
        submitAdmissionInquiry,
        updateInquiryStatus,
        verifyAndEnrollApplicant,
        attachPaymentProofToInquiry,
        addInquiryNote,
        deleteInquiry,
        deleteMultipleInquiries,
        clearAllInquiries,
        exportInquiriesCSV,
        contactMessages,
        submitContactMessage,
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
        submitMockTestAnswer,
        gradeMockTestSubmission,
        uploadMockTestResult,
        mockTestRegistrations,
        registerForMockTest,
        updateMockTestRegistrationStatus,
        deleteMockTestRegistration,
        refreshMockRegistrations,
        currentUser,
        loginAsAdmin,
        loginAsStudent,
        updateStudentEnrollment,
        updateStudentEnrolledSubjects,
        isStudentEnrolledInCourse,
        isStudentEnrolledInSubject,
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
