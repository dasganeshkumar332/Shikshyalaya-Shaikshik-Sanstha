import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { TeachersPage } from './pages/TeachersPage';
import { OnlineClassesPage } from './pages/OnlineClassesPage';
import { StudyMaterialsPage } from './pages/StudyMaterialsPage';
import { NoticesPage } from './pages/NoticesPage';
import { GalleryPage } from './pages/GalleryPage';
import { AdmissionPage } from './pages/AdmissionPage';
import { ContactPage } from './pages/ContactPage';
import { StudentLoginPage } from './pages/StudentLoginPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { MockTestsPage } from './pages/MockTestsPage';
import { UploadAnswerSheetPage } from './pages/UploadAnswerSheetPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Scroll to top helper on navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Home */}
              <Route path="/" element={<HomePage />} />

              {/* About Us */}
              <Route path="/about" element={<AboutPage />} />

              {/* All Courses Directory */}
              <Route path="/courses" element={<CoursesPage />} />

              {/* Dedicated Course URLs */}
              <Route path="/courses/mbs-tu" element={<CourseDetailPage />} />
              <Route path="/courses/bbs-tu" element={<CourseDetailPage />} />
              <Route path="/courses/3-year-bbs-tu" element={<CourseDetailPage />} />
              <Route path="/courses/bbs-tu-old" element={<CourseDetailPage />} />
              <Route path="/courses/bba-tu" element={<CourseDetailPage />} />
              <Route path="/courses/bbm-tu" element={<CourseDetailPage />} />
              <Route path="/courses/bba-bbm-tu" element={<CourseDetailPage />} />
              <Route path="/courses/plus-two-science" element={<CourseDetailPage />} />
              <Route path="/courses/plus-two-management" element={<CourseDetailPage />} />
              <Route path="/courses/bba-pokhara-university" element={<CourseDetailPage />} />
              <Route path="/courses/:slug" element={<CourseDetailPage />} />

              {/* Teachers */}
              <Route path="/teachers" element={<TeachersPage />} />

              {/* Online Classes */}
              <Route path="/online-classes" element={<OnlineClassesPage />} />

              {/* Study Materials */}
              <Route path="/study-materials" element={<StudyMaterialsPage />} />

              {/* Mock Tests & Timed Examinations */}
              <Route path="/mock-tests" element={<MockTestsPage />} />

              {/* Upload Answer Sheet Portal (PDF Format) */}
              <Route path="/upload-answer-sheet" element={<UploadAnswerSheetPage />} />
              <Route path="/student/upload-answer-sheet" element={<UploadAnswerSheetPage />} />

              {/* Notices */}
              <Route path="/notices" element={<NoticesPage />} />

              {/* Gallery */}
              <Route path="/gallery" element={<GalleryPage />} />

              {/* Admission Inquiry */}
              <Route path="/admission" element={<AdmissionPage />} />

              {/* Contact Us */}
              <Route path="/contact" element={<ContactPage />} />

              {/* Student Portal */}
              <Route path="/student/login" element={<StudentLoginPage />} />
              <Route path="/student/dashboard" element={<StudentDashboardPage />} />

              {/* Administrator Dashboard */}
              <Route path="/admin" element={<AdminDashboardPage />} />

              {/* Legal Pages */}
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* 404 Not Found */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
