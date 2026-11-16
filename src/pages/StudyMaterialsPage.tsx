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
  Eye,
  ArrowUpDown,
  Users,
  UserCheck,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudyMaterial, Course } from '../types';
import { triggerFileDownload } from '../utils/fileStorage';
import { DocumentViewerModal } from '../components/common/DocumentViewerModal';
import { sortByDate, DateSortOrder } from '../utils/dateSort';

export const StudyMaterialsPage: React.FC = () => {
  const {
    studyMaterials,
    courses,
    studentGroups,
    currentUser,
    language,
    isStudentEnrolledInSubject,
    isStudentAllowedMaterial,
    isStudentBatchRestricted,
    subjectsMatch,
    resolveMaterialUrl,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // Applied filter states (used to render results)
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedYearOrSemester, setSelectedYearOrSemester] = useState('ALL');
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedAccess, setSelectedAccess] = useState('ALL');

  // Draft filter states inside the filter bar (committed when clicking OK)
  const [draftCourse, setDraftCourse] = useState('ALL');
  const [draftYearOrSemester, setDraftYearOrSemester] = useState('ALL');
  const [draftBatch, setDraftBatch] = useState('ALL');
  const [draftSubject, setDraftSubject] = useState('ALL');
  const [draftType, setDraftType] = useState('ALL');
  const [draftAccess, setDraftAccess] = useState('ALL');
  const [hasConfirmedFilters, setHasConfirmedFilters] = useState(false);

  const [filterEnrolledOnly, setFilterEnrolledOnly] = useState(false);
  const [dateSortOrder, setDateSortOrder] = useState<DateSortOrder>('desc');
  const [activeVideoModal, setActiveVideoModal] = useState<StudyMaterial | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [restrictedMaterial, setRestrictedMaterial] = useState<StudyMaterial | null>(null);
  const [downloadSuccessModal, setDownloadSuccessModal] = useState<StudyMaterial | null>(null);
  const [previewResource, setPreviewResource] = useState<{
    mat: StudyMaterial;
    sourceUrl: string;
  } | null>(null);

  const resourceTypes = useMemo(() => {
    const base = [
      'PDF Notes',
      'Word Document / Notes',
      'Image / Handwritten Solutions',
      'Recorded Videos',
      'Lecture Slides',
      'Practice Questions',
      'Model Question Papers',
      'Past Papers',
      'Assignments',
      'Revision Materials',
    ];
    const extras = studyMaterials
      .map((m) => m.resourceType)
      .filter((t) => Boolean(t) && !base.includes(t));
    return Array.from(new Set([...base, ...extras]));
  }, [studyMaterials]);

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
      case 'loksewa-officer-level-6':
        return 'Loksewa 6th Level Officer (अधिकृत छैटौं)';
      case 'loksewa-nayab-subba':
        return 'Loksewa Nayab Subba (ना.सु.)';
      case 'loksewa-section-officer':
        return 'Loksewa Section Officer (शाखा अधिकृत)';
      case 'loksewa-kharidar':
        return 'Loksewa Kharidar (खरिदार)';
      case 'loksewa-rbb-level-4':
        return 'RBB 4th Level (रा.वा.बैंक तह ४)';
      case 'loksewa-rbb-level-6':
        return 'RBB 6th Level (रा.वा.बैंक तह ६)';
      case 'loksewa-nbl-level-4':
        return 'NBL 4th Level (नेपाल बैंक तह ४)';
      case 'loksewa-nbl-level-6':
        return 'NBL 6th Level (नेपाल बैंक तह ६)';
      case 'loksewa-banking-preparation':
        return 'Loksewa Banking (RBB, NBL, ADBL, NRB)';
      case 'teachers-service-commission-tsc':
        return 'TSC (शिक्षक सेवा आयोग)';
      default:
        return c.title.replace(/4 Years Program on |4 Semester on |8 Semester on |8 Semesters Program/gi, '').trim();
    }
  };

  // Label for the Year / Semester filter column (responds live to draftCourse in the dropdown)
  const yearOrSemesterLabel = useMemo(() => {
    if (draftCourse.startsWith('loksewa') || draftCourse.includes('tsc')) return 'Paper / Exam Level';
    if (draftCourse === 'bbs-tu') return 'Year (BBS)';
    if (draftCourse === 'mbs-tu') return 'Semester (MBS)';
    if (draftCourse === 'bba-tu') return 'Semester (BBA)';
    if (draftCourse === 'bbm-tu') return 'Semester (BBM)';
    if (draftCourse === 'bba-bbm-tu' || draftCourse === 'bba-pokhara-university') return 'Semester';
    if (draftCourse.startsWith('plus-two')) return 'Grade / Year';
    return 'Year / Semester';
  }, [draftCourse]);

  // Dynamic Year or Semester options strictly as per the draftCourse dropdown
  const availableYearsOrSemesters = useMemo(() => {
    if (draftCourse.startsWith('loksewa') || draftCourse.includes('tsc')) {
      const targetCourse = courses.find((c) => c.slug === draftCourse);
      const terms = Array.from(new Set(targetCourse?.subjectsOffered?.map((s) => s.semesterOrYear).filter(Boolean))) as string[];
      return terms.length > 0 ? terms : ['1st Paper (Objective - 100 Marks)', '2nd Paper (Subjective - 100 Marks)'];
    }
    if (draftCourse === 'bbs-tu') {
      return ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    }
    if (draftCourse === 'mbs-tu') {
      return ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester'];
    }
    if (draftCourse === 'bba-tu' || draftCourse === 'bbm-tu' || draftCourse === 'bba-bbm-tu') {
      return [
        '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
        '5th Semester', '6th Semester', '7th Semester', '8th Semester'
      ];
    }
    if (draftCourse === 'plus-two-science' || draftCourse === 'plus-two-management') {
      return ['Grade 11', 'Grade 12'];
    }
    if (draftCourse === 'bba-pokhara-university') {
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
      'Grade 11', 'Grade 12',
      '1st Paper (Objective - 100 Marks)', '2nd Paper (Subjective - 100 Marks)'
    ];
  }, [draftCourse, courses]);

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

  // Available batches matching draft Course + Year/Semester, plus any batch tagged on published materials
  const availableBatches = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; shift?: string; teacherDisplay?: string; isOwnBatch?: boolean }
    >();

    const studentBatchIds = new Set(currentUser?.batchIds || (currentUser?.batchId ? [currentUser.batchId] : []));

    studentGroups.forEach((g) => {
      const courseMatch = draftCourse === 'ALL' || g.courseSlug === draftCourse;
      const yearMatch =
        draftYearOrSemester === 'ALL' ||
        !g.academicLevel ||
        matchesYearOrSemester(g.academicLevel, draftYearOrSemester);
      if (!courseMatch || !yearMatch) return;

      let teacherDisplay = g.teacherName || '';
      if (draftSubject !== 'ALL' && g.subjectTeachers && g.subjectTeachers.length > 0) {
        const subAssign = g.subjectTeachers.find((st) => subjectsMatch(st.subject, draftSubject));
        if (subAssign?.teacherName) {
          teacherDisplay = subAssign.teacherName;
        }
      }

      const baseName = g.title || g.name || 'Academic Batch';
      const batchNoSuffix =
        g.batchNumber && !baseName.toLowerCase().includes(g.batchNumber.toLowerCase())
          ? ` (Batch ${g.batchNumber})`
          : '';

      map.set(g.id, {
        id: g.id,
        name: `${baseName}${batchNoSuffix}`,
        shift: g.shift,
        teacherDisplay,
        isOwnBatch: studentBatchIds.has(g.id),
      });
    });

    studyMaterials.forEach((m) => {
      if (!m.published || !m.batchId || m.batchId === 'ALL' || !m.batchName) return;
      const courseMatch = draftCourse === 'ALL' || m.courseSlug === draftCourse;
      const yearMatch =
        draftYearOrSemester === 'ALL' || matchesYearOrSemester(m.semesterOrYear, draftYearOrSemester);
      if (!courseMatch || !yearMatch) return;
      if (!map.has(m.batchId)) {
        map.set(m.batchId, {
          id: m.batchId,
          name: m.batchName,
          teacherDisplay: m.teacherName,
          isOwnBatch: studentBatchIds.has(m.batchId),
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [studentGroups, studyMaterials, draftCourse, draftYearOrSemester, draftSubject, currentUser, subjectsMatch]);

  const getBatchDisplayLabel = (batchKey: string) => {
    if (batchKey === 'COMMON') return 'Common (All Batches)';
    const fromGroup = studentGroups.find((g) => g.id === batchKey);
    if (fromGroup) {
      const baseName = fromGroup.title || fromGroup.name || batchKey;
      const numSuffix =
        fromGroup.batchNumber && !baseName.toLowerCase().includes(fromGroup.batchNumber.toLowerCase())
          ? ` (Batch ${fromGroup.batchNumber})`
          : '';
      return `${baseName}${numSuffix}`;
    }
    const fromMat = studyMaterials.find((m) => m.batchId === batchKey);
    return fromMat?.batchName || batchKey;
  };

  // Dynamic Subjects as per draft Course, Syllabus Type, and Year/Semester (plus any uploaded materials' subjects)
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();

    const targetCourses =
      draftCourse === 'ALL'
        ? filterEnrolledOnly && currentUser?.role === 'student'
          ? courses.filter((c) => currentUser.enrolledCourseSlugs?.includes(c.slug))
          : courses
        : courses.filter((c) => c.slug === draftCourse);

    targetCourses.forEach((c) => {
      c.subjectsOffered.forEach((s) => {
        if (s.courseType === 'Old Course') return;
        const yearMatch =
          draftYearOrSemester === 'ALL' ||
          matchesYearOrSemester(s.semesterOrYear, draftYearOrSemester);
        if (yearMatch) {
          if (!filterEnrolledOnly || currentUser?.role !== 'student' || isStudentEnrolledInSubject(c.slug, s.name)) {
            set.add(s.name);
          }
        }
      });
    });

    // Also include published admin-uploaded materials' subject names matching active filters
    studyMaterials.forEach((m) => {
      if (!m.published) return;
      const courseMatch = draftCourse === 'ALL' || m.courseSlug === draftCourse;
      const yearMatch =
        draftYearOrSemester === 'ALL' ||
        matchesYearOrSemester(m.semesterOrYear, draftYearOrSemester);
      if (courseMatch && yearMatch && m.subject) {
        if (!filterEnrolledOnly || currentUser?.role !== 'student' || isStudentEnrolledInSubject(m.courseSlug, m.subject)) {
          set.add(m.subject);
        }
      }
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [
    courses,
    studyMaterials,
    draftCourse,
    draftYearOrSemester,
    filterEnrolledOnly,
    currentUser,
    isStudentEnrolledInSubject,
  ]);

  const matchesBatchFilter = (m: StudyMaterial, batchKey: string) => {
    if (batchKey === 'ALL') return true;
    if (batchKey === 'COMMON') return !m.batchId || m.batchId === 'ALL';
    if (m.batchId === batchKey) return true;
    // Also include common materials shared across all batches for the course/subject
    return !m.batchId || m.batchId === 'ALL';
  };

  // Handler when Course dropdown changes: resets downstream Year/Semester, Batch, and Subject in draft
  const handleDraftCourseChange = (newCourse: string) => {
    setDraftCourse(newCourse);
    setDraftYearOrSemester('ALL');
    setDraftBatch('ALL');
    setDraftSubject('ALL');
  };

  // Handler when Year/Semester dropdown changes: resets downstream Batch and Subject in draft
  const handleDraftYearOrSemesterChange = (newYearOrSem: string) => {
    setDraftYearOrSemester(newYearOrSem);
    setDraftBatch('ALL');
    setDraftSubject('ALL');
  };

  // Commit draft filters when user clicks OK
  const handleApplyFilters = () => {
    setSelectedCourse(draftCourse);
    setSelectedYearOrSemester(draftYearOrSemester);
    setSelectedBatch(draftBatch);
    setSelectedSubject(draftSubject);
    setSelectedType(draftType);
    setSelectedAccess(draftAccess);
    setHasConfirmedFilters(true);
  };

  const hasPendingFilterChanges =
    draftCourse !== selectedCourse ||
    draftYearOrSemester !== selectedYearOrSemester ||
    draftBatch !== selectedBatch ||
    draftSubject !== selectedSubject ||
    draftType !== selectedType ||
    draftAccess !== selectedAccess;

  // Filtered study materials matching all APPLIED criteria (sorted by upload date)
  const filteredMaterials = useMemo(() => {
    const filtered = studyMaterials
      .filter((m) => m.published)
      .filter((m) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.courseName.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          (m.teacherName && m.teacherName.toLowerCase().includes(q)) ||
          (m.batchName && m.batchName.toLowerCase().includes(q))
        );
      })
      .filter((m) => {
        if (selectedCourse === 'ALL') return true;
        return m.courseSlug === selectedCourse;
      })
      .filter((m) => {
        if (selectedYearOrSemester === 'ALL') return true;
        return matchesYearOrSemester(m.semesterOrYear, selectedYearOrSemester);
      })
      .filter((m) => matchesBatchFilter(m, selectedBatch))
      .filter((m) => {
        if (selectedSubject === 'ALL') return true;
        return subjectsMatch(m.subject, selectedSubject);
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
          return isStudentAllowedMaterial(m);
        }
        return true;
      });
    return sortByDate(filtered, (m) => m.uploadDate, dateSortOrder, { getId: (m) => m.id });
  }, [
    studyMaterials,
    searchQuery,
    selectedCourse,
    selectedYearOrSemester,
    selectedBatch,
    selectedSubject,
    selectedType,
    selectedAccess,
    filterEnrolledOnly,
    currentUser,
    isStudentAllowedMaterial,
    subjectsMatch,
    dateSortOrder,
  ]);

  // Dynamic counts for each resource type based on live DRAFT filters (so counts update as dropdowns change)
  const resourceCountsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    resourceTypes.forEach((t) => {
      counts[t] = 0;
    });

    studyMaterials
      .filter((m) => m.published)
      .filter((m) => {
        if (filterEnrolledOnly && currentUser?.role === 'student') {
          return isStudentAllowedMaterial(m);
        }
        return true;
      })
      .filter((m) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.courseName.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          (m.teacherName && m.teacherName.toLowerCase().includes(q)) ||
          (m.batchName && m.batchName.toLowerCase().includes(q))
        );
      })
      .filter((m) => draftCourse === 'ALL' || m.courseSlug === draftCourse)
      .filter((m) => draftYearOrSemester === 'ALL' || matchesYearOrSemester(m.semesterOrYear, draftYearOrSemester))
      .filter((m) => matchesBatchFilter(m, draftBatch))
      .filter((m) => draftSubject === 'ALL' || subjectsMatch(m.subject, draftSubject))
      .filter((m) => draftAccess === 'ALL' || m.accessLevel === draftAccess)
      .forEach((m) => {
        if (counts[m.resourceType] !== undefined) {
          counts[m.resourceType]++;
        }
      });

    return counts;
  }, [
    studyMaterials,
    resourceTypes,
    searchQuery,
    draftCourse,
    draftYearOrSemester,
    draftBatch,
    draftSubject,
    draftAccess,
    currentUser,
    isStudentEnrolledInSubject,
    subjectsMatch,
  ]);

  const recordedVideosTotalCount = useMemo(() => {
    return studyMaterials.filter(
      (m) =>
        m.published &&
        m.resourceType === 'Recorded Videos' &&
        (!filterEnrolledOnly || currentUser?.role !== 'student' || isStudentAllowedMaterial(m))
    ).length;
  }, [studyMaterials, filterEnrolledOnly, currentUser, isStudentAllowedMaterial]);

  const isMaterialAccessibleToUser = (material: StudyMaterial) => {
    if (currentUser?.role === 'admin') return true;
    if (material.accessLevel === 'Public') return true;
    return isStudentAllowedMaterial(material);
  };

  const handleDownload = (material: StudyMaterial) => {
    const isAllowed = isMaterialAccessibleToUser(material);

    if (!isAllowed) {
      setRestrictedMaterial(material);
      return;
    }
    setDownloadSuccessModal(material);
  };

  const handlePreviewMaterial = async (material: StudyMaterial) => {
    const isAllowed = isMaterialAccessibleToUser(material);

    if (!isAllowed) {
      setRestrictedMaterial(material);
      return;
    }

    const resolvedUrl = await resolveMaterialUrl(material);
    if (!resolvedUrl) {
      setDownloadSuccessModal(material);
      return;
    }
    setPreviewResource({ mat: material, sourceUrl: resolvedUrl });
  };

  const closePreviewResource = () => {
    setPreviewResource(null);
  };

  const handleOpenVideo = (material: StudyMaterial) => {
    const isAllowed = isMaterialAccessibleToUser(material);

    if (!isAllowed) {
      setRestrictedMaterial(material);
      return;
    }
    setIsPlayingVideo(false);
    setActiveVideoModal(material);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCourse('ALL');
    setSelectedYearOrSemester('ALL');
    setSelectedBatch('ALL');
    setSelectedSubject('ALL');
    setSelectedType('ALL');
    setSelectedAccess('ALL');
    setDraftCourse('ALL');
    setDraftYearOrSemester('ALL');
    setDraftBatch('ALL');
    setDraftSubject('ALL');
    setDraftType('ALL');
    setDraftAccess('ALL');
    setHasConfirmedFilters(false);
    setFilterEnrolledOnly(false);
  };

  const isAnyFilterActive =
    searchQuery !== '' ||
    selectedCourse !== 'ALL' ||
    selectedYearOrSemester !== 'ALL' ||
    selectedBatch !== 'ALL' ||
    selectedSubject !== 'ALL' ||
    selectedType !== 'ALL' ||
    selectedAccess !== 'ALL';

  const isAnyDraftOrActiveFilter =
    isAnyFilterActive ||
    draftCourse !== 'ALL' ||
    draftYearOrSemester !== 'ALL' ||
    draftBatch !== 'ALL' ||
    draftSubject !== 'ALL' ||
    draftType !== 'ALL' ||
    draftAccess !== 'ALL';

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

        {/* Quick Filter: Recorded Videos and Enrolled Materials */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
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
              const nextType = selectedType === 'Recorded Videos' ? 'ALL' : 'Recorded Videos';
              setSelectedType(nextType);
              setDraftType(nextType);
              if (nextType !== 'ALL') setHasConfirmedFilters(true);
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
            onClick={() => {
              const nextType = selectedType === 'PDF Notes' ? 'ALL' : 'PDF Notes';
              setSelectedType(nextType);
              setDraftType(nextType);
              if (nextType !== 'ALL') setHasConfirmedFilters(true);
            }}
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
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50/70 to-blue-50 border border-blue-200/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#12315A] text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-[#12315A]">
                    Student Portal: {currentUser.name} ({currentUser.phone || currentUser.studentId || 'Authenticated'})
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Enrolled Access Verified
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-slate-600 font-medium">Program:</span>
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
                    <span className="text-xs text-rose-600 font-semibold">No active program</span>
                  )}

                  {((currentUser.batchNames && currentUser.batchNames.length > 0) || currentUser.batchName) && (
                    <>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-600 font-medium">Batch:</span>
                      {(currentUser.batchNames && currentUser.batchNames.length > 0
                        ? currentUser.batchNames
                        : currentUser.batchName
                        ? [currentUser.batchName]
                        : []
                      ).map((bName) => (
                        <span
                          key={bName}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 shadow-2xs"
                        >
                          <Users className="w-3 h-3 text-indigo-700" />
                          <span>{bName}</span>
                        </span>
                      ))}
                    </>
                  )}

                  <span className="text-slate-400">|</span>

                  <span className="text-slate-600 font-medium">Enrolled Subject(s):</span>
                  {currentUser.enrolledSubjects && currentUser.enrolledSubjects.length > 0 ? (
                    currentUser.enrolledSubjects.map((subj) => (
                      <span
                        key={subj}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs"
                      >
                        <CheckCircle2 className="w-3 h-3 text-amber-700" />
                        <span>{subj}</span>
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      All Course Subjects
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
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
                <strong>Administrator Mode:</strong> Master access granted to preview, download, and manage study materials across all programs and subjects.
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
                  Student Subject-Level Access Policy
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Academic study materials, past questions, and lecture recordings are reserved exclusively for enrolled students and only for their officially enrolled subjects.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center flex-wrap">
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
                placeholder="Search by topic, subject, batch, teacher, or keyword (e.g. Financial Accounting, Ganesh Das, Morning Batch)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyFilters();
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {isAnyDraftOrActiveFilter && (
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
              1. Filter by Course
              2. Year / Semester
              3. Batch / Assigned Teacher
              4. Subjects
              5. Resource Type
              6. Access Level
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100 text-xs">
            {/* 1. Filter: Course */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Filter by Course
              </label>
              <select
                value={draftCourse}
                onChange={(e) => handleDraftCourseChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Academic Courses ({courses.filter((c) => c.published !== false).length})</option>
                {courses
                  .filter((c) => c.published !== false)
                  .slice()
                  .sort((a, b) => {
                    if (currentUser?.role === 'student') {
                      const aEnrolled = currentUser.enrolledCourseSlugs?.includes(a.slug) ? 1 : 0;
                      const bEnrolled = currentUser.enrolledCourseSlugs?.includes(b.slug) ? 1 : 0;
                      if (aEnrolled !== bEnrolled) return bEnrolled - aEnrolled;
                    }
                    return 0;
                  })
                  .map((c) => {
                    const isEnrolled =
                      currentUser?.role === 'student' &&
                      currentUser.enrolledCourseSlugs?.includes(c.slug);
                    return (
                      <option key={c.slug} value={c.slug}>
                        {getCourseDisplayName(c)}
                        {isEnrolled ? ' ★ Enrolled' : ''}
                      </option>
                    );
                  })}
              </select>
            </div>

            {/* 2. Filter: Years or Semester */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center justify-between">
                <span>{yearOrSemesterLabel}</span>
                {draftYearOrSemester !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => handleDraftYearOrSemesterChange('ALL')}
                    className="text-[10px] text-blue-600 hover:underline font-normal cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </label>
              <select
                value={draftYearOrSemester}
                onChange={(e) => handleDraftYearOrSemesterChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">
                  {draftCourse === 'bbs-tu'
                    ? 'All Years (BBS)'
                    : draftCourse === 'mbs-tu'
                    ? 'All Semesters (MBS)'
                    : draftCourse.startsWith('plus-two')
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

            {/* 3. Filter: Batch / Assigned Teacher */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center justify-between">
                <span>Batch ({availableBatches.length})</span>
                {draftBatch !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setDraftBatch('ALL')}
                    className="text-[10px] text-blue-600 hover:underline font-normal cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </label>
              <select
                value={draftBatch}
                onChange={(e) => setDraftBatch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Batches ({availableBatches.length})</option>
                <option value="COMMON">Common (All Batches)</option>
                {availableBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                    {b.isOwnBatch ? ' ★ Your Batch' : ''}
                    {b.teacherDisplay ? ` — ${b.teacherDisplay}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Filter: Subjects */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center justify-between">
                <span>Subjects ({availableSubjects.length})</span>
                {draftSubject !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setDraftSubject('ALL')}
                    className="text-[10px] text-blue-600 hover:underline font-normal cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </label>
              <select
                value={draftSubject}
                onChange={(e) => setDraftSubject(e.target.value)}
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

            {/* 5. Filter: Resource Type */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center justify-between">
                <span>Resource Type</span>
                {draftType !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setDraftType('ALL')}
                    className="text-[10px] text-blue-600 hover:underline font-normal cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </label>
              <select
                value={draftType}
                onChange={(e) => setDraftType(e.target.value)}
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

            {/* 6. Filter: Access Level */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center justify-between">
                <span>Access Level</span>
                {draftAccess !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setDraftAccess('ALL')}
                    className="text-[10px] text-blue-600 hover:underline font-normal cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </label>
              <select
                value={draftAccess}
                onChange={(e) => setDraftAccess(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Access Levels</option>
                <option value="Public">Public (Free Access)</option>
                <option value="Enrolled Students">Enrolled Students Only</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips + Explicit OK Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-[11px] border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              {isAnyFilterActive ? (
                <>
                  <span className="text-slate-400 font-semibold">Active Filters:</span>

                  {selectedCourse !== 'ALL' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                      <span>
                        Course:{' '}
                        {courses.find((c) => c.slug === selectedCourse)
                          ? getCourseDisplayName(courses.find((c) => c.slug === selectedCourse)!)
                          : selectedCourse}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCourse('ALL');
                          setDraftCourse('ALL');
                          setSelectedYearOrSemester('ALL');
                          setDraftYearOrSemester('ALL');
                          setSelectedBatch('ALL');
                          setDraftBatch('ALL');
                          setSelectedSubject('ALL');
                          setDraftSubject('ALL');
                        }}
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
                        type="button"
                        onClick={() => {
                          setSelectedYearOrSemester('ALL');
                          setDraftYearOrSemester('ALL');
                          setSelectedBatch('ALL');
                          setDraftBatch('ALL');
                          setSelectedSubject('ALL');
                          setDraftSubject('ALL');
                        }}
                        className="hover:text-amber-900 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedBatch !== 'ALL' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 font-semibold border border-indigo-200">
                      <span>Batch: {getBatchDisplayLabel(selectedBatch)}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBatch('ALL');
                          setDraftBatch('ALL');
                        }}
                        className="hover:text-indigo-900 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedSubject !== 'ALL' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                      <span>Subject: {selectedSubject}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSubject('ALL');
                          setDraftSubject('ALL');
                        }}
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
                        type="button"
                        onClick={() => {
                          setSelectedType('ALL');
                          setDraftType('ALL');
                        }}
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
                        type="button"
                        onClick={() => {
                          setSelectedAccess('ALL');
                          setDraftAccess('ALL');
                        }}
                        className="hover:text-slate-900 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </>
              ) : (
                <span className="text-slate-400 font-medium">
                  Select course, year/semester, batch, subject, or resource filters above and click OK to view matching materials.
                </span>
              )}

              {hasPendingFilterChanges && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                  Selection updated — click OK to apply
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-auto">
              {isAnyDraftOrActiveFilter && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={handleApplyFilters}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  hasPendingFilterChanges
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300'
                    : 'bg-[#12315A] hover:bg-blue-900 text-white'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>OK</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Materials List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {!hasConfirmedFilters && selectedSubject === 'ALL' && selectedType === 'ALL' && selectedBatch === 'ALL' && !searchQuery.trim() ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-[#12315A]">
                  Select a Subject to View Resources
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click the specific subject you want to study, or set your filters above and click <strong>OK</strong>.
                </p>
              </div>
              {!currentUser && (
                <Link
                  to="/student/login"
                  className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Log in to access enrolled materials</span>
                </Link>
              )}
            </div>

            {availableSubjects.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-2">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-700">
                  {studyMaterials.length === 0
                    ? 'No study resources have been uploaded by the administrator yet.'
                    : 'No uploaded resources match the selected course, semester, batch, or enrollment criteria.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {availableSubjects.map((sub) => {
                  const subCount = filteredMaterials.filter((m) =>
                    subjectsMatch(m.subject, sub)
                  ).length;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        setSelectedCourse(draftCourse);
                        setSelectedYearOrSemester(draftYearOrSemester);
                        setSelectedBatch(draftBatch);
                        setSelectedType(draftType);
                        setSelectedAccess(draftAccess);
                        setSelectedSubject(sub);
                        setDraftSubject(sub);
                        setHasConfirmedFilters(true);
                      }}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/70 hover:border-blue-300 text-left transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-[#12315A] truncate">
                          {sub}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {subCount} resource{subCount !== 1 ? 's' : ''} available
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                {(selectedSubject !== 'ALL' || hasConfirmedFilters) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubject('ALL');
                      setDraftSubject('ALL');
                      setHasConfirmedFilters(false);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    &larr; All Subjects
                  </button>
                )}
                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  Showing <strong>{filteredMaterials.length}</strong> academic resources matching criteria
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setDateSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#12315A] bg-white border border-slate-200 hover:bg-blue-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-blue-700" />
                  <span>Date: {dateSortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
                </button>
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
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
                {filteredMaterials.map((mat) => {
                  const isCourseEnrolled =
                    currentUser?.role === 'admin' ||
                    (currentUser?.role === 'student' && currentUser.enrolledCourseSlugs?.includes(mat.courseSlug));

                  const isSubjectAllowed =
                    currentUser?.role === 'admin' ||
                    isStudentEnrolledInSubject(mat.courseSlug, mat.subject);

                  const isBatchRestricted =
                    mat.accessLevel !== 'Public' &&
                    currentUser?.role === 'student' &&
                    isStudentBatchRestricted(mat);

                  const hasAccess = isMaterialAccessibleToUser(mat);
                  const isSubjectRestricted =
                    mat.accessLevel !== 'Public' &&
                    currentUser?.role === 'student' &&
                    isCourseEnrolled &&
                    !isSubjectAllowed;

                  return (
                    <div
                      key={mat.id}
                      className={`p-4 sm:p-5 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                        hasAccess
                          ? mat.resourceType === 'Recorded Videos'
                            ? 'hover:bg-rose-50/30'
                            : 'hover:bg-blue-50/30'
                          : isBatchRestricted
                          ? 'bg-indigo-50/30'
                          : isSubjectRestricted
                          ? 'bg-amber-50/30'
                          : 'bg-slate-50/40'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            mat.resourceType === 'Recorded Videos'
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : 'bg-blue-50 text-[#12315A] border-blue-200'
                          }`}
                        >
                          {mat.resourceType === 'Recorded Videos' ? (
                            <Video className="w-5 h-5" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                                mat.resourceType === 'Recorded Videos'
                                  ? 'bg-rose-100 text-rose-800 font-extrabold border border-rose-200'
                                  : 'bg-blue-50 text-blue-800'
                              }`}
                            >
                              <span>{mat.resourceType}</span>
                            </span>

                            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              {mat.semesterOrYear}
                            </span>

                            <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-flex items-center gap-1">
                              <Users className="w-3 h-3 text-indigo-600" />
                              <span>{mat.batchId && mat.batchId !== 'ALL' && mat.batchName ? mat.batchName : 'All Batches'}</span>
                            </span>

                            {mat.teacherName && (
                              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-teal-600" />
                                <span>{mat.teacherName}</span>
                              </span>
                            )}

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                                hasAccess
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : isBatchRestricted
                                  ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold'
                                  : isSubjectRestricted
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                                  : currentUser
                                  ? 'bg-rose-50 text-rose-900 border border-rose-200 font-semibold'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {hasAccess ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Unlocked</span>
                                </>
                              ) : isBatchRestricted ? (
                                <>
                                  <Lock className="w-3 h-3 text-indigo-700" />
                                  <span>Batch Restricted</span>
                                </>
                              ) : isSubjectRestricted ? (
                                <>
                                  <Lock className="w-3 h-3 text-amber-700" />
                                  <span>Subject Restricted</span>
                                </>
                              ) : currentUser ? (
                                <>
                                  <Lock className="w-3 h-3 text-rose-600" />
                                  <span>Course Restricted</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3 text-slate-500" />
                                  <span>Enrolled Only</span>
                                </>
                              )}
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                            {mat.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                            <span><strong>Course:</strong> {mat.courseName}</span>
                            <span>•</span>
                            <span>
                              <strong>Subject:</strong>{' '}
                              <span className={isSubjectRestricted ? 'text-amber-800 font-bold' : ''}>
                                {mat.subject}
                              </span>
                            </span>
                            {mat.teacherName && (
                              <>
                                <span>•</span>
                                <span>
                                  <strong>Teacher:</strong> {mat.teacherName}
                                </span>
                              </>
                            )}
                            {(mat.fileName || mat.attachmentName) && mat.resourceType !== 'Recorded Videos' && (
                              <>
                                <span>•</span>
                                <span className="text-slate-700 font-semibold truncate max-w-xs">
                                  {mat.fileName || mat.attachmentName}
                                </span>
                              </>
                            )}
                          </div>

                          {mat.description && (
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-1">
                              {mat.description}
                            </p>
                          )}

                          {isBatchRestricted && (
                            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-900 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-indigo-700 shrink-0" />
                              <span>
                                Assigned exclusively to <strong>{mat.batchName || 'another batch'}</strong>
                                {mat.teacherName ? ` (Faculty: ${mat.teacherName})` : ''}. Your enrollment is in{' '}
                                <strong>{currentUser?.batchNames?.join(', ') || currentUser?.batchName || 'another batch'}</strong>.
                              </span>
                            </div>
                          )}

                          {isSubjectRestricted && (
                            <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-300 text-[11px] text-amber-900 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                              <span>
                                Enrolled in <strong>{currentUser?.enrolledSubjects?.join(', ')}</strong>. Access to <strong>{mat.subject}</strong> is restricted.
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                          {mat.fileSize} • {mat.uploadDate}
                        </span>

                        {hasAccess ? (
                          mat.resourceType === 'Recorded Videos' ? (
                            <button
                              onClick={() => handleOpenVideo(mat)}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Watch Video</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 shrink-0">
                              {mat.downloadUrl && (
                                <button
                                  type="button"
                                  onClick={() => handlePreviewMaterial(mat)}
                                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#12315A] bg-slate-100 hover:bg-blue-50 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-700" />
                                  <span>View</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleDownload(mat)}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#12315A] hover:bg-[#1f487e] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5 text-amber-400" />
                                <span>Download</span>
                              </button>
                            </div>
                          )
                        ) : isBatchRestricted ? (
                          <button
                            onClick={() => setRestrictedMaterial(mat)}
                            className="px-3 py-2 rounded-xl text-xs font-bold text-indigo-950 bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Lock className="w-3.5 h-3.5 text-indigo-700" />
                            <span>Batch Restricted</span>
                          </button>
                        ) : isSubjectRestricted ? (
                          <button
                            onClick={() => setRestrictedMaterial(mat)}
                            className="px-3 py-2 rounded-xl text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Lock className="w-3.5 h-3.5 text-amber-800" />
                            <span>Subject Restricted</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setRestrictedMaterial(mat)}
                            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Lock className="w-3.5 h-3.5 text-slate-600" />
                            <span>{currentUser ? 'Course Locked' : 'Enroll to Access'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
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
                {restrictedMaterial.batchName && (
                  <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded font-semibold">
                    <strong>Batch:</strong> {restrictedMaterial.batchName}
                  </span>
                )}
                {restrictedMaterial.teacherName && (
                  <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded font-semibold">
                    <strong>Teacher:</strong> {restrictedMaterial.teacherName}
                  </span>
                )}
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">
                  {restrictedMaterial.semesterOrYear}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              {currentUser?.role === 'student' ? (
                (() => {
                  const isCourseEnrolled = currentUser.enrolledCourseSlugs?.includes(restrictedMaterial.courseSlug);
                  const isSubjectAllowed = isStudentEnrolledInSubject(restrictedMaterial.courseSlug, restrictedMaterial.subject);
                  const isBatchBlocked = isStudentBatchRestricted(restrictedMaterial);

                  if (isBatchBlocked) {
                    return (
                      <>
                        <p>
                          You are logged in as <strong>{currentUser.name}</strong> ({currentUser.phone || currentUser.studentId}), enrolled in{' '}
                          <strong>{currentUser.batchNames?.join(', ') || currentUser.batchName || 'your assigned batch'}</strong>.
                        </p>
                        <div className="text-indigo-950 font-medium bg-indigo-50 p-3.5 rounded-xl border border-indigo-200 space-y-2">
                          <p className="font-bold flex items-center gap-1.5 text-indigo-900">
                            <Users className="w-4 h-4 text-indigo-700 shrink-0" />
                            <span>Batch-Specific Faculty Resource</span>
                          </p>
                          <p>
                            This resource is published specifically for{' '}
                            <strong>{restrictedMaterial.batchName || 'another batch'}</strong>
                            {restrictedMaterial.teacherName ? ` taught by ${restrictedMaterial.teacherName}` : ''}.
                          </p>
                          <p className="text-[11px] text-indigo-800">
                            Different teachers handle separate batches, so batch-specific materials are unlocked only for students enrolled in that batch.
                          </p>
                        </div>
                      </>
                    );
                  }

                  if (isCourseEnrolled && !isSubjectAllowed) {
                    return (
                      <>
                        <p>
                          You are logged in as <strong>{currentUser.name}</strong> ({currentUser.phone || currentUser.studentId}), enrolled in <strong>{restrictedMaterial.courseName}</strong>.
                        </p>
                        <div className="text-amber-950 font-medium bg-amber-50 p-3.5 rounded-xl border border-amber-300 space-y-2">
                          <p className="font-bold flex items-center gap-1.5 text-amber-900">
                            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>Subject-Level Enrollment Policy</span>
                          </p>
                          <p>
                            Your official enrollment is currently registered only for:{' '}
                            <strong className="text-amber-900">
                              {currentUser.enrolledSubjects && currentUser.enrolledSubjects.length > 0
                                ? currentUser.enrolledSubjects.join(', ')
                                : 'other specific subjects'}
                            </strong>.
                          </p>
                          <p className="text-[11px] text-amber-800">
                            As per institutional policy, students enrolled for <strong>{currentUser.enrolledSubjects?.[0] || 'one subject'}</strong> are not permitted to access resource materials for <strong>{restrictedMaterial.subject}</strong> without official subject enrollment.
                          </p>
                        </div>
                      </>
                    );
                  }

                  return (
                    <>
                      <p>
                        You are logged in as <strong>{currentUser.name}</strong> ({currentUser.phone || currentUser.studentId}), currently enrolled in:{' '}
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
                  );
                })()
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

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {downloadSuccessModal.downloadUrl && (
                <button
                  type="button"
                  onClick={() => {
                    const target = downloadSuccessModal;
                    setDownloadSuccessModal(null);
                    handlePreviewMaterial(target);
                  }}
                  className="py-2.5 px-4 rounded-xl font-bold text-xs text-[#12315A] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-blue-700" />
                  <span>View Inline</span>
                </button>
              )}
              <button
                onClick={async () => {
                  const resolvedUrl = await resolveMaterialUrl(downloadSuccessModal);
                  if (resolvedUrl) {
                    const fileName =
                      downloadSuccessModal.fileName ||
                      downloadSuccessModal.attachmentName ||
                      `${downloadSuccessModal.subject.replace(/\s+/g, '_')}_${downloadSuccessModal.title.replace(/\s+/g, '_')}.pdf`;
                    triggerFileDownload(resolvedUrl, fileName);
                  } else {
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
                  }
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

      {/* Inline PDF / Image Resource Viewer Modal */}
      {previewResource && (
        <DocumentViewerModal
          material={previewResource.mat}
          sourceUrl={previewResource.sourceUrl}
          onClose={closePreviewResource}
        />
      )}
    </div>
  );
};
