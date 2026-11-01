import { createClient } from '@supabase/supabase-js';

// Project credentials provided by the user
export const SUPABASE_PROJECT_ID = 'pyjsnwazsbdaupjbaqcd';
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Sb_og4V9GxxLA_yiZCVMdQ_wfydVcil';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SupabaseConnectionStatus {
  connected: boolean;
  projectId: string;
  url: string;
  message: string;
  checkedAt: string;
  tablesStatus?: Record<string, boolean>;
}

/**
 * Checks connection to Supabase and verifies accessible tables
 */
export async function checkSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  const timestamp = new Date().toISOString();
  try {
    // Attempt a light ping/query
    const { error } = await supabase.from('admission_inquiries').select('id').limit(1);

    if (!error) {
      return {
        connected: true,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        message: 'Successfully connected to Supabase project database.',
        checkedAt: timestamp,
      };
    }

    // If table doesn't exist yet (PGRST205 / 404), Supabase API is reachable but schema needs migration
    if (error.code === 'PGRST205' || error.message?.includes('not find') || error.code === '42P01') {
      return {
        connected: true,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        message: 'Connected to Supabase! The tables are ready to be created using the provided SQL schema script.',
        checkedAt: timestamp,
      };
    }

    return {
      connected: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      message: error.message || 'Supabase returned an error during connection test.',
      checkedAt: timestamp,
    };
  } catch (err: any) {
    return {
      connected: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      message: err?.message || 'Network error connecting to Supabase.',
      checkedAt: timestamp,
    };
  }
}

/**
 * SQL script for Supabase SQL Editor to create all required database tables and Row Level Security
 */
export const SUPABASE_SQL_SCHEMA = `-- ===============================================================
-- SHIKSHYALAYA SHAIKSHIK SANSTHA - SUPABASE DATABASE SCHEMA
-- Project ID: pyjsnwazsbdaupjbaqcd
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ===============================================================

-- 1. ADMISSION INQUIRIES & APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.admission_inquiries (
    id TEXT PRIMARY KEY,
    reference_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    address TEXT,
    course_slug TEXT NOT NULL,
    course_name TEXT NOT NULL,
    course_type TEXT DEFAULT 'New Course',
    syllabus_version TEXT,
    board TEXT,
    academic_level TEXT,
    subjects_of_interest TEXT,
    preferred_mode TEXT,
    preferred_shift TEXT,
    message TEXT,
    has_payment_proof BOOLEAN DEFAULT FALSE,
    payment_proof_url TEXT,
    payment_proof_name TEXT,
    payment_proof_size TEXT,
    payment_method TEXT,
    payment_amount TEXT,
    transaction_reference TEXT,
    payment_remarks TEXT,
    payment_verified BOOLEAN DEFAULT FALSE,
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    assigned_student_id TEXT,
    status TEXT DEFAULT 'New',
    admin_notes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB
);

-- 2. MOCK TEST ANSWER SHEETS & EXAM SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.mock_test_submissions (
    id TEXT PRIMARY KEY,
    mock_test_id TEXT NOT NULL,
    mock_test_title TEXT,
    course_slug TEXT NOT NULL,
    course_type TEXT DEFAULT 'New Course',
    subject TEXT,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT,
    student_phone TEXT,
    roll_number TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    time_taken_seconds INTEGER DEFAULT 0,
    is_late_submission BOOLEAN DEFAULT FALSE,
    answer_file_url TEXT,
    answer_file_name TEXT,
    answer_file_size TEXT,
    typed_answers TEXT,
    marks_obtained NUMERIC,
    evaluation_status TEXT DEFAULT 'Submitted',
    evaluated_by TEXT,
    evaluated_at TIMESTAMPTZ,
    feedback_remarks TEXT,
    evaluated_paper_url TEXT,
    evaluated_paper_name TEXT,
    raw_data JSONB
);

-- 3. CONTACT & GENERAL MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Unread',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB
);

-- 4. STUDENT GROUPS & COHORTS TABLE
CREATE TABLE IF NOT EXISTS public.student_groups (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    code TEXT,
    course_slug TEXT NOT NULL,
    course_name TEXT NOT NULL,
    course_type TEXT DEFAULT 'New Course',
    syllabus_version TEXT,
    academic_level TEXT,
    shift TEXT,
    batch_year TEXT,
    description TEXT,
    whatsapp_group_url TEXT,
    telegram_group_url TEXT,
    coordinator_name TEXT,
    coordinator_phone TEXT,
    members JSONB DEFAULT '[]'::jsonb,
    broadcasts JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB
);

-- 5. MOCK TESTS & MODEL PAPERS TABLE
CREATE TABLE IF NOT EXISTS public.mock_tests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    course_slug TEXT NOT NULL,
    course_name TEXT NOT NULL,
    course_type TEXT DEFAULT 'New Course',
    semester_or_year TEXT,
    subject TEXT NOT NULL,
    subject_code TEXT,
    exam_date TEXT,
    start_time TEXT,
    duration_minutes INTEGER DEFAULT 180,
    full_marks NUMERIC DEFAULT 100,
    pass_marks NUMERIC DEFAULT 35,
    instructions JSONB DEFAULT '[]'::jsonb,
    question_paper_url TEXT,
    question_paper_name TEXT,
    question_paper_size TEXT,
    question_text TEXT,
    model_answer_url TEXT,
    status TEXT DEFAULT 'Live / In-Progress',
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB
);

-- 6. PUBLIC NOTICES & ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.notices (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    devanagari_title TEXT,
    category TEXT DEFAULT 'General',
    content TEXT NOT NULL,
    publish_date TEXT NOT NULL,
    expiry_date TEXT,
    important BOOLEAN DEFAULT FALSE,
    published BOOLEAN DEFAULT TRUE,
    attachment_name TEXT,
    target_courses JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB
);

-- 7. STUDY MATERIALS & RESOURCES TABLE
CREATE TABLE IF NOT EXISTS public.study_materials (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    course_slug TEXT NOT NULL,
    course_name TEXT NOT NULL,
    course_type TEXT DEFAULT 'New Course',
    board TEXT,
    subject TEXT NOT NULL,
    semester_or_year TEXT,
    resource_type TEXT NOT NULL,
    access_level TEXT DEFAULT 'Public',
    file_size TEXT,
    upload_date TEXT,
    download_url TEXT,
    description TEXT,
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB
);

-- 8. CENTRAL SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY,
    institute_name TEXT NOT NULL,
    institute_devanagari_name TEXT,
    tagline TEXT,
    contact_number TEXT,
    email_address TEXT,
    physical_address TEXT,
    office_hours TEXT,
    whatsapp_number TEXT,
    settings_data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. GENERIC BACKUP STORE FOR OFFLINE SYNC / DYNAMIC CACHE
CREATE TABLE IF NOT EXISTS public.app_storage (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MOCK TEST CANDIDATE REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.mock_test_registrations (
    id TEXT PRIMARY KEY,
    reference_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    course_slug TEXT NOT NULL,
    course_name TEXT NOT NULL,
    course_type TEXT DEFAULT 'New Course',
    semester_or_year TEXT,
    enrolled_subjects JSONB DEFAULT '[]'::jsonb,
    preferred_mode TEXT,
    shift TEXT,
    student_roll_no TEXT,
    notes TEXT,
    status TEXT DEFAULT 'Registered',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB
);

-- ===============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Allow public insert and read access with anon key for this applet
-- ===============================================================

ALTER TABLE public.admission_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write Inquiries" ON public.admission_inquiries FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.mock_test_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write Submissions" ON public.mock_test_submissions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write Contact" ON public.contact_messages FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write Groups" ON public.student_groups FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write Mock Tests" ON public.mock_tests FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write Notices" ON public.notices FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write Materials" ON public.study_materials FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write Settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.app_storage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write Storage" ON public.app_storage FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.mock_test_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write Registrations" ON public.mock_test_registrations FOR ALL USING (true) WITH CHECK (true);
`;
