import React, { useState } from 'react';
import {
  Image,
  Calendar,
  X,
  Filter,
  Maximize2,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GalleryItem } from '../types';

export const GalleryPage: React.FC = () => {
  const { gallery, language } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeModalItem, setActiveModalItem] = useState<GalleryItem | null>(null);

  const categories = [
    'Classes',
    'Teachers',
    'Events',
    'Seminars',
    'Workshops',
    'Student Activities',
  ];

  const filteredGallery = gallery.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider">
          <Image className="w-3.5 h-3.5" />
          <span>Campus & Learning Moments</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#12315A] tracking-tight">
          Institute Gallery
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Glimpses of academic lectures, interactive problem-solving sessions, teacher curriculum meetings, and student guidance workshops.
        </p>
      </div>

      {/* Advisory Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Gallery Media Notice:</span>
            <span className="ml-1 text-amber-800">
              Photographs shown below illustrate academic learning sessions and instructional environments. The institute administration can upload, organize, and replace images through the Admin Dashboard.
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-[#12315A] text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Photos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#12315A] text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
              onClick={() => setActiveModalItem(item)}
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 relative">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                  {item.category}
                </div>
              </div>

              <div className="p-5 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>{item.date}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {item.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl space-y-0">
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition-colors"
              aria-label="Close image"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[65vh] bg-slate-950 flex items-center justify-center overflow-hidden">
              <img
                src={activeModalItem.imageUrl}
                alt={activeModalItem.title}
                className="max-h-[65vh] w-auto object-contain mx-auto"
              />
            </div>

            <div className="p-6 bg-white space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-blue-700 uppercase tracking-wider text-[11px]">
                  {activeModalItem.category}
                </span>
                <span>Captured: {activeModalItem.date}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{activeModalItem.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {activeModalItem.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
