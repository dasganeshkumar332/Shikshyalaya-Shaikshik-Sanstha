import { supabase } from '../lib/supabase';
import {
  AdmissionInquiry,
  ContactMessage,
  MockTestSubmission,
  MockTestRegistration,
  StudentGroup,
  MockTest,
  Notice,
  StudyMaterial,
  SiteSettings,
} from '../types';

/**
 * Transforms an AdmissionInquiry object to match database columns and keeps raw JSON
 */
function mapInquiryToRow(inq: AdmissionInquiry) {
  return {
    id: inq.id,
    reference_number: inq.referenceNumber,
    full_name: inq.fullName,
    email: inq.email || null,
    phone: inq.phone,
    address: inq.address || null,
    course_slug: inq.courseSlug,
    course_name: inq.courseName,
    course_type: inq.courseType || 'New Course',
    syllabus_version: inq.syllabusVersion || null,
    board: inq.board || null,
    academic_level: inq.academicLevel || null,
    subjects_of_interest: inq.subjectsOfInterest || null,
    preferred_mode: inq.preferredMode,
    preferred_shift: inq.preferredShift,
    message: inq.message || null,
    has_payment_proof: inq.hasPaymentProof || false,
    payment_proof_url: inq.paymentProofUrl || null,
    payment_proof_name: inq.paymentProofName || null,
    payment_proof_size: inq.paymentProofSize || null,
    payment_method: inq.paymentMethod || null,
    payment_amount: inq.paymentAmount || null,
    transaction_reference: inq.transactionReference || null,
    payment_remarks: inq.paymentRemarks || null,
    payment_verified: inq.paymentVerified || false,
    verified_by: inq.verifiedBy || null,
    verified_at: inq.verifiedAt || null,
    assigned_student_id: inq.assignedStudentId || null,
    status: inq.status,
    admin_notes: inq.adminNotes || [],
    created_at: inq.createdAt || new Date().toISOString(),
    updated_at: inq.updatedAt || new Date().toISOString(),
    raw_data: inq,
  };
}

/**
 * Transforms a MockTestSubmission object to match database columns
 */
function mapSubmissionToRow(sub: MockTestSubmission) {
  return {
    id: sub.id,
    mock_test_id: sub.mockTestId || sub.testId || 'unknown-test',
    mock_test_title: sub.mockTestTitle || sub.testTitle || null,
    course_slug: sub.courseSlug,
    course_type: sub.courseType || 'New Course',
    subject: sub.subject || null,
    student_id: sub.studentId,
    student_name: sub.studentName,
    student_email: sub.studentEmail || null,
    student_phone: sub.studentPhone || null,
    roll_number: sub.rollNumber || null,
    submitted_at: sub.submittedAt || new Date().toISOString(),
    time_taken_seconds: sub.timeTakenSeconds || 0,
    is_late_submission: sub.isLateSubmission || false,
    answer_file_url: sub.answerFileUrl || null,
    answer_file_name: sub.answerFileName || null,
    answer_file_size: sub.answerFileSize || null,
    typed_answers: sub.typedAnswers || null,
    marks_obtained: sub.marksObtained !== undefined ? sub.marksObtained : null,
    evaluation_status: sub.evaluationStatus || 'Submitted',
    evaluated_by: sub.evaluatedBy || null,
    evaluated_at: sub.evaluatedAt || null,
    feedback_remarks: sub.feedbackRemarks || null,
    evaluated_paper_url: sub.evaluatedPaperUrl || null,
    evaluated_paper_name: sub.evaluatedPaperName || null,
    raw_data: sub,
  };
}

/**
 * Transforms a MockTestRegistration object to match database columns
 */
function mapRegistrationToRow(reg: MockTestRegistration) {
  return {
    id: reg.id,
    reference_number: reg.referenceNumber,
    full_name: reg.fullName,
    email: reg.email || null,
    phone: reg.phone,
    course_slug: reg.courseSlug,
    course_name: reg.courseName,
    course_type: reg.courseType || 'New Course',
    semester_or_year: reg.semesterOrYear || null,
    enrolled_subjects: reg.enrolledSubjects || [],
    preferred_mode: reg.preferredMode || 'Online',
    shift: reg.shift || null,
    student_roll_no: reg.studentRollNo || null,
    notes: reg.notes || null,
    status: reg.status || 'Registered',
    created_at: reg.createdAt || new Date().toISOString(),
    raw_data: reg,
  };
}

/**
 * Saves or updates a mock test registration in Supabase
 */
export async function saveMockRegistrationToSupabase(
  reg: MockTestRegistration
): Promise<{ success: boolean; error?: string }> {
  try {
    const row = mapRegistrationToRow(reg);
    const { error } = await supabase.from('mock_test_registrations').upsert(row, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] Could not save registration to mock_test_registrations table:', error.message);
      // Fallback: Store in generic app_storage
      await supabase.from('app_storage').upsert({
        key: `mock_reg:${reg.id}`,
        value: reg,
        updated_at: new Date().toISOString(),
      });
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception saving mock registration:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Deletes a mock test registration from Supabase
 */
export async function deleteMockRegistrationFromSupabase(id: string): Promise<boolean> {
  try {
    await supabase.from('mock_test_registrations').delete().eq('id', id);
    await supabase.from('app_storage').delete().eq('key', `mock_reg:${id}`);
    return true;
  } catch (err) {
    console.warn('[Supabase] Failed to delete mock registration:', err);
    return false;
  }
}

/**
 * Saves or updates an admission inquiry in Supabase
 */
export async function saveInquiryToSupabase(inquiry: AdmissionInquiry): Promise<{ success: boolean; error?: string }> {
  try {
    const row = mapInquiryToRow(inquiry);
    const { error } = await supabase.from('admission_inquiries').upsert(row, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] Could not save inquiry to admission_inquiries table:', error.message);
      // Fallback: Store in generic app_storage
      await supabase.from('app_storage').upsert({
        key: `inquiry:${inquiry.id}`,
        value: inquiry,
        updated_at: new Date().toISOString(),
      });
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception saving inquiry:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Deletes an admission inquiry from Supabase
 */
export async function deleteInquiryFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('admission_inquiries').delete().eq('id', id);
    // Also remove from fallback app_storage if present
    try {
      await supabase.from('app_storage').delete().eq('key', `inquiry:${id}`);
    } catch {
      // ignore
    }
    if (error) {
      console.warn('[Supabase] Could not delete inquiry from admission_inquiries table:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception deleting inquiry:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Deletes multiple admission inquiries by IDs from Supabase
 */
export async function deleteMultipleInquiriesFromSupabase(ids: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    if (!ids.length) return { success: true };
    const { error } = await supabase.from('admission_inquiries').delete().in('id', ids);
    if (error) {
      console.warn('[Supabase] Could not bulk delete inquiries:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception bulk deleting inquiries:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Clears all admission inquiries from Supabase
 */
export async function clearAllInquiriesFromSupabase(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('admission_inquiries').delete().neq('id', '');
    if (error) {
      console.warn('[Supabase] Could not clear admission_inquiries:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception clearing inquiries:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Saves or updates a mock test submission (student answer sheet / result) in Supabase
 */
export async function saveMockSubmissionToSupabase(
  submission: MockTestSubmission
): Promise<{ success: boolean; error?: string }> {
  try {
    const row = mapSubmissionToRow(submission);
    const { error } = await supabase.from('mock_test_submissions').upsert(row, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] Could not save submission to mock_test_submissions:', error.message);
      // Fallback: Store in generic app_storage
      await supabase.from('app_storage').upsert({
        key: `submission:${submission.id}`,
        value: submission,
        updated_at: new Date().toISOString(),
      });
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception saving submission:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Saves a contact form message in Supabase
 */
export async function saveContactMessageToSupabase(
  msg: ContactMessage
): Promise<{ success: boolean; error?: string }> {
  try {
    const row = {
      id: msg.id,
      name: msg.name,
      email: msg.email,
      phone: msg.phone || null,
      subject: msg.subject,
      message: msg.message,
      status: msg.status,
      created_at: msg.createdAt || new Date().toISOString(),
      raw_data: msg,
    };
    const { error } = await supabase.from('contact_messages').upsert(row, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] Could not save to contact_messages table:', error.message);
      await supabase.from('app_storage').upsert({
        key: `contact:${msg.id}`,
        value: msg,
        updated_at: new Date().toISOString(),
      });
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception saving contact message:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Saves a student cohort/group in Supabase
 */
export async function saveStudentGroupToSupabase(group: StudentGroup): Promise<{ success: boolean; error?: string }> {
  try {
    const row = {
      id: group.id,
      title: group.title,
      code: group.code || null,
      course_slug: group.courseSlug,
      course_name: group.courseName,
      course_type: group.courseType || 'New Course',
      syllabus_version: group.syllabusVersion || null,
      academic_level: group.academicLevel || null,
      shift: group.shift || 'Morning',
      batch_year: group.batchYear || '2081/82',
      description: group.description || null,
      whatsapp_group_url: group.whatsappGroupUrl || group.whatsappGroupLink || null,
      telegram_group_url: group.telegramGroupUrl || null,
      coordinator_name: group.coordinatorName,
      coordinator_phone: group.coordinatorPhone,
      members: group.members || [],
      broadcasts: group.broadcasts || [],
      created_at: group.createdAt || new Date().toISOString(),
      updated_at: group.updatedAt || new Date().toISOString(),
      raw_data: group,
    };
    const { error } = await supabase.from('student_groups').upsert(row, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] Could not save student group:', error.message);
      await supabase.from('app_storage').upsert({
        key: `group:${group.id}`,
        value: group,
        updated_at: new Date().toISOString(),
      });
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception saving student group:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Saves website settings to Supabase
 */
export async function saveSettingsToSupabase(settings: SiteSettings): Promise<{ success: boolean; error?: string }> {
  try {
    const row = {
      id: 'main',
      institute_name: settings.instituteName,
      institute_devanagari_name: settings.instituteDevanagariName || null,
      tagline: settings.tagline || null,
      contact_number: settings.contactNumber || null,
      email_address: settings.emailAddress || null,
      physical_address: settings.physicalAddress || null,
      office_hours: settings.officeHours || null,
      whatsapp_number: settings.whatsappNumber || null,
      settings_data: settings,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('site_settings').upsert(row, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] Could not save site settings:', error.message);
      await supabase.from('app_storage').upsert({
        key: 'site_settings',
        value: settings,
        updated_at: new Date().toISOString(),
      });
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception saving site settings:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Sync all current in-memory application records to Supabase in one batch
 */
export async function syncAllDataToSupabase(data: {
  inquiries: AdmissionInquiry[];
  mockSubmissions: MockTestSubmission[];
  mockRegistrations?: MockTestRegistration[];
  contactMessages: ContactMessage[];
  studentGroups: StudentGroup[];
  mockTests: MockTest[];
  notices: Notice[];
  studyMaterials: StudyMaterial[];
  settings: SiteSettings;
}): Promise<{
  success: boolean;
  syncedCounts: Record<string, number>;
  errors: string[];
}> {
  const syncedCounts: Record<string, number> = {
    inquiries: 0,
    mockSubmissions: 0,
    mockRegistrations: 0,
    contactMessages: 0,
    studentGroups: 0,
    mockTests: 0,
    notices: 0,
    studyMaterials: 0,
    settings: 0,
  };
  const errors: string[] = [];

  // 1. Inquiries
  if (data.inquiries.length > 0) {
    try {
      const rows = data.inquiries.map(mapInquiryToRow);
      const { error } = await supabase.from('admission_inquiries').upsert(rows, { onConflict: 'id' });
      if (error) {
        errors.push(`Inquiries: ${error.message}`);
        // Store in app_storage fallback
        await supabase.from('app_storage').upsert({
          key: 'all_inquiries',
          value: data.inquiries,
          updated_at: new Date().toISOString(),
        });
      } else {
        syncedCounts.inquiries = rows.length;
      }
    } catch (e: any) {
      errors.push(`Inquiries: ${e?.message}`);
    }
  }

  // 2. Mock Test Submissions
  if (data.mockSubmissions.length > 0) {
    try {
      const rows = data.mockSubmissions.map(mapSubmissionToRow);
      const { error } = await supabase.from('mock_test_submissions').upsert(rows, { onConflict: 'id' });
      if (error) {
        errors.push(`Mock Submissions: ${error.message}`);
        await supabase.from('app_storage').upsert({
          key: 'all_submissions',
          value: data.mockSubmissions,
          updated_at: new Date().toISOString(),
        });
      } else {
        syncedCounts.mockSubmissions = rows.length;
      }
    } catch (e: any) {
      errors.push(`Mock Submissions: ${e?.message}`);
    }
  }

  // 3. Contact Messages
  if (data.contactMessages.length > 0) {
    try {
      const rows = data.contactMessages.map((msg) => ({
        id: msg.id,
        name: msg.name,
        email: msg.email,
        phone: msg.phone || null,
        subject: msg.subject,
        message: msg.message,
        status: msg.status,
        created_at: msg.createdAt || new Date().toISOString(),
        raw_data: msg,
      }));
      const { error } = await supabase.from('contact_messages').upsert(rows, { onConflict: 'id' });
      if (error) {
        errors.push(`Contact Messages: ${error.message}`);
      } else {
        syncedCounts.contactMessages = rows.length;
      }
    } catch (e: any) {
      errors.push(`Contact Messages: ${e?.message}`);
    }
  }

  // 4. Student Groups
  if (data.studentGroups.length > 0) {
    try {
      const rows = data.studentGroups.map((g) => ({
        id: g.id,
        title: g.title,
        code: g.code || null,
        course_slug: g.courseSlug,
        course_name: g.courseName,
        course_type: g.courseType || 'New Course',
        syllabus_version: g.syllabusVersion || null,
        academic_level: g.academicLevel || null,
        shift: g.shift || 'Morning',
        batch_year: g.batchYear || '2081/82',
        description: g.description || null,
        whatsapp_group_url: g.whatsappGroupUrl || g.whatsappGroupLink || null,
        telegram_group_url: g.telegramGroupUrl || null,
        coordinator_name: g.coordinatorName,
        coordinator_phone: g.coordinatorPhone,
        members: g.members || [],
        broadcasts: g.broadcasts || [],
        created_at: g.createdAt || new Date().toISOString(),
        updated_at: g.updatedAt || new Date().toISOString(),
        raw_data: g,
      }));
      const { error } = await supabase.from('student_groups').upsert(rows, { onConflict: 'id' });
      if (error) {
        errors.push(`Student Groups: ${error.message}`);
      } else {
        syncedCounts.studentGroups = rows.length;
      }
    } catch (e: any) {
      errors.push(`Student Groups: ${e?.message}`);
    }
  }

  // 5. Mock Tests
  if (data.mockTests.length > 0) {
    try {
      const rows = data.mockTests.map((t) => ({
        id: t.id,
        title: t.title,
        course_slug: t.courseSlug,
        course_name: t.courseName,
        course_type: t.courseType || 'New Course',
        semester_or_year: t.semesterOrYear || null,
        subject: t.subject,
        subject_code: t.subjectCode || null,
        exam_date: t.examDate || null,
        start_time: t.startTime || null,
        duration_minutes: t.durationMinutes || 180,
        full_marks: t.fullMarks || 100,
        pass_marks: t.passMarks || 35,
        instructions: t.instructions,
        question_paper_url: t.questionPaperUrl || null,
        question_paper_name: t.questionPaperName || null,
        question_text: t.questionText || null,
        model_answer_url: t.modelAnswerUrl || null,
        status: t.status || 'Live / In-Progress',
        published: t.published !== undefined ? t.published : true,
        created_at: t.createdAt || new Date().toISOString(),
        updated_at: t.updatedAt || new Date().toISOString(),
        raw_data: t,
      }));
      const { error } = await supabase.from('mock_tests').upsert(rows, { onConflict: 'id' });
      if (error) {
        errors.push(`Mock Tests: ${error.message}`);
      } else {
        syncedCounts.mockTests = rows.length;
      }
    } catch (e: any) {
      errors.push(`Mock Tests: ${e?.message}`);
    }
  }

  // 6. Settings
  try {
    const { error } = await supabase.from('site_settings').upsert(
      {
        id: 'main',
        institute_name: data.settings.instituteName,
        institute_devanagari_name: data.settings.instituteDevanagariName || null,
        tagline: data.settings.tagline || null,
        contact_number: data.settings.contactNumber || null,
        email_address: data.settings.emailAddress || null,
        physical_address: data.settings.physicalAddress || null,
        office_hours: data.settings.officeHours || null,
        whatsapp_number: data.settings.whatsappNumber || null,
        settings_data: data.settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (!error) {
      syncedCounts.settings = 1;
    } else {
      errors.push(`Settings: ${error.message}`);
    }
  } catch (e: any) {
    errors.push(`Settings: ${e?.message}`);
  }

  // 7. Mock Test Registrations
  if (data.mockRegistrations && data.mockRegistrations.length > 0) {
    try {
      const rows = data.mockRegistrations.map(mapRegistrationToRow);
      const { error } = await supabase.from('mock_test_registrations').upsert(rows, { onConflict: 'id' });
      if (error) {
        errors.push(`Mock Registrations: ${error.message}`);
        await supabase.from('app_storage').upsert({
          key: 'all_mock_registrations',
          value: data.mockRegistrations,
          updated_at: new Date().toISOString(),
        });
      } else {
        syncedCounts.mockRegistrations = rows.length;
      }
    } catch (e: any) {
      errors.push(`Mock Registrations: ${e?.message}`);
    }
  }

  // Always write comprehensive master backup snapshot to app_storage
  try {
    await supabase.from('app_storage').upsert({
      key: 'shikshyalaya_master_backup',
      value: {
        timestamp: new Date().toISOString(),
        inquiriesCount: data.inquiries.length,
        submissionsCount: data.mockSubmissions.length,
        groupsCount: data.studentGroups.length,
        inquiries: data.inquiries,
        submissions: data.mockSubmissions,
        settings: data.settings,
      },
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Backup store write warning:', err);
  }

  return {
    success: errors.length === 0,
    syncedCounts,
    errors,
  };
}

/**
 * Loads inquiries from Supabase if table is populated
 */
export async function fetchInquiriesFromSupabase(): Promise<AdmissionInquiry[] | null> {
  try {
    const { data, error } = await supabase
      .from('admission_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return null;

    return data.map((row: any) => {
      if (row.raw_data && row.raw_data.referenceNumber) {
        return row.raw_data as AdmissionInquiry;
      }
      return {
        id: row.id,
        referenceNumber: row.reference_number,
        fullName: row.full_name,
        email: row.email || '',
        phone: row.phone,
        address: row.address || undefined,
        courseSlug: row.course_slug,
        courseName: row.course_name,
        courseType: row.course_type,
        syllabusVersion: row.syllabus_version || undefined,
        board: row.board || undefined,
        academicLevel: row.academic_level || undefined,
        subjectsOfInterest: row.subjects_of_interest || undefined,
        preferredMode: row.preferred_mode || 'Online',
        preferredShift: row.preferred_shift || 'Morning',
        message: row.message || undefined,
        hasPaymentProof: row.has_payment_proof || false,
        paymentProofUrl: row.payment_proof_url || undefined,
        paymentProofName: row.payment_proof_name || undefined,
        paymentProofSize: row.payment_proof_size || undefined,
        paymentMethod: row.payment_method || undefined,
        paymentAmount: row.payment_amount || undefined,
        transactionReference: row.transaction_reference || undefined,
        paymentRemarks: row.payment_remarks || undefined,
        paymentVerified: row.payment_verified || false,
        verifiedBy: row.verified_by || undefined,
        verifiedAt: row.verified_at || undefined,
        assignedStudentId: row.assigned_student_id || undefined,
        status: row.status || 'New',
        adminNotes: row.admin_notes || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      } as AdmissionInquiry;
    });
  } catch (err) {
    console.warn('[Supabase] Failed to fetch inquiries:', err);
    return null;
  }
}

/**
 * Loads mock test submissions from Supabase
 */
export async function fetchSubmissionsFromSupabase(): Promise<MockTestSubmission[] | null> {
  try {
    const { data, error } = await supabase
      .from('mock_test_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error || !data || data.length === 0) return null;

    return data.map((row: any) => {
      if (row.raw_data && row.raw_data.studentName) {
        return row.raw_data as MockTestSubmission;
      }
      return {
        id: row.id,
        mockTestId: row.mock_test_id,
        mockTestTitle: row.mock_test_title || undefined,
        courseSlug: row.course_slug,
        courseType: row.course_type || 'New Course',
        subject: row.subject || undefined,
        studentId: row.student_id,
        studentName: row.student_name,
        studentEmail: row.student_email || undefined,
        studentPhone: row.student_phone || undefined,
        rollNumber: row.roll_number || undefined,
        submittedAt: row.submitted_at,
        timeTakenSeconds: row.time_taken_seconds || 0,
        isLateSubmission: row.is_late_submission || false,
        answerFileUrl: row.answer_file_url || undefined,
        answerFileName: row.answer_file_name || undefined,
        answerFileSize: row.answer_file_size || undefined,
        typedAnswers: row.typed_answers || undefined,
        marksObtained: row.marks_obtained !== null ? Number(row.marks_obtained) : undefined,
        evaluationStatus: row.evaluation_status || 'Submitted',
        evaluatedBy: row.evaluated_by || undefined,
        evaluatedAt: row.evaluated_at || undefined,
        feedbackRemarks: row.feedback_remarks || undefined,
        evaluatedPaperUrl: row.evaluated_paper_url || undefined,
        evaluatedPaperName: row.evaluated_paper_name || undefined,
      } as MockTestSubmission;
    });
  } catch (err) {
    console.warn('[Supabase] Failed to fetch submissions:', err);
    return null;
  }
}

/**
 * Loads mock test registrations from Supabase
 */
export async function fetchMockRegistrationsFromSupabase(): Promise<MockTestRegistration[] | null> {
  try {
    const { data, error } = await supabase
      .from('mock_test_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((row: any) => {
        if (row.raw_data && row.raw_data.referenceNumber) {
          return row.raw_data as MockTestRegistration;
        }
        return {
          id: row.id,
          referenceNumber: row.reference_number,
          fullName: row.full_name,
          email: row.email || '',
          phone: row.phone,
          courseSlug: row.course_slug,
          courseName: row.course_name,
          courseType: row.course_type || 'New Course',
          semesterOrYear: row.semester_or_year || undefined,
          enrolledSubjects: Array.isArray(row.enrolled_subjects) ? row.enrolled_subjects : [],
          preferredMode: row.preferred_mode || 'Online',
          shift: row.shift || '',
          studentRollNo: row.student_roll_no || undefined,
          notes: row.notes || undefined,
          status: row.status || 'Registered',
          createdAt: row.created_at || new Date().toISOString(),
        } as MockTestRegistration;
      });
    }

    // Fallback: check app_storage for mock_reg:* keys
    const { data: storageData } = await supabase
      .from('app_storage')
      .select('value')
      .like('key', 'mock_reg:%');

    if (storageData && storageData.length > 0) {
      return storageData.map((s: any) => s.value as MockTestRegistration);
    }

    return null;
  } catch (err) {
    console.warn('[Supabase] Failed to fetch mock registrations:', err);
    return null;
  }
}
