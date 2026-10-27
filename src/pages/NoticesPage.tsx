import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bell,
  Calendar,
  Search,
  Filter,
  FileText,
  AlertCircle,
  X,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Notice } from '../types';

export const NoticesPage: React.FC = () => {
  const { notices, language } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedNoticeModal, setSelectedNoticeModal] = useState<Notice | null>(null);

  // Check URL query param ?id=notice-1
  useEffect(() => {
    const noticeId = searchParams.get('id');
    if (noticeId) {
      const found = notices.find((n) => n.id === noticeId);
      if (found) setSelectedNoticeModal(found);
    }
  }, [searchParams, notices]);

  const categories = [
    'Admission',
    'New Courses',
    'Class Schedules',
    'Exam Prep',
    'Holidays',
    'Academic Events',
    'General',
  ];

  const filteredNotices = notices
    .filter((n) => n.published)
    .filter((n) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    })
    .filter((n) => {
      if (selectedCategory === 'ALL') return true;
      return n.category === selectedCategory;
    });

  return (
    <div className="py-12 sm:py-16 space-y-12">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider">
          <Bell className="w-3.5 h-3.5" />
          <span>Official Announcements</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#12315A] tracking-tight">
          Notices & Academic Updates
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Stay informed regarding new batch admissions, semester revision marathons, examination schedules, and institutional notices.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline shrink-0">
              Category:
            </span>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-[#12315A] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Notices
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#12315A] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notices Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {filteredNotices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">No notices in this category</h3>
            <p className="text-xs text-slate-500">
              Select another category or clear your search to view all published announcements.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotices.map((notice) => (
              <div
                key={notice.id}
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                  notice.important
                    ? 'bg-amber-50/40 border-amber-200 hover:border-amber-400 shadow-sm'
                    : 'bg-white border-slate-200/90 hover:border-blue-300 shadow-sm'
                }`}
                onClick={() => setSelectedNoticeModal(notice)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        notice.important
                          ? 'bg-amber-500 text-slate-950 font-extrabold'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {notice.category}
                    </span>
                    {notice.important && (
                      <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>High Priority</span>
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    Published on {notice.publishDate}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                  {notice.title}
                </h3>
                {notice.devanagariTitle && (
                  <p className="text-xs font-['Noto_Sans_Devanagari',sans-serif] text-slate-500 font-medium mb-2">
                    {notice.devanagariTitle}
                  </p>
                )}

                <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {notice.content}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 text-xs">
                  <span className="font-bold text-blue-700 hover:underline">
                    View Full Announcement &rarr;
                  </span>
                  {notice.attachmentName && (
                    <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>{notice.attachmentName}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notice Detail Modal */}
      {selectedNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedNoticeModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                  {selectedNoticeModal.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedNoticeModal.publishDate}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {selectedNoticeModal.title}
              </h2>

              {selectedNoticeModal.devanagariTitle && (
                <p className="text-sm font-['Noto_Sans_Devanagari',sans-serif] text-slate-600 font-semibold">
                  {selectedNoticeModal.devanagariTitle}
                </p>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {selectedNoticeModal.content}
            </div>

            {selectedNoticeModal.attachmentName && (
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-700" />
                  <span className="font-semibold text-slate-800">{selectedNoticeModal.attachmentName}</span>
                </div>
                <button
                  onClick={() => {
                    const blob = new Blob([
                      `SHIKSHYALAYA SHAIKSHIK SANSTHA - OFFICIAL NOTICE ATTACHMENT\nNotice: ${selectedNoticeModal.title}\nAttachment: ${selectedNoticeModal.attachmentName}\nPublished Date: ${selectedNoticeModal.publishDate}\n\n${selectedNoticeModal.content}`
                    ], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    const attachName = selectedNoticeModal.attachmentName || 'notice_attachment.pdf';
                    a.download = attachName.replace(/\s+/g, '_');
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-1 rounded-lg font-bold bg-[#12315A] text-white hover:bg-blue-900 cursor-pointer"
                >
                  Download Attachment
                </button>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Shikshyalaya Shaikshik Sanstha Official Notice</span>
              <button
                onClick={() => setSelectedNoticeModal(null)}
                className="px-4 py-2 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
