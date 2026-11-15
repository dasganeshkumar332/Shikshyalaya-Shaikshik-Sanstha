import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  Download,
  FileText,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { StudyMaterial } from '../../types';
import { dataUrlToBlobUrl, dataUrlToUint8Array, triggerFileDownload } from '../../utils/fileStorage';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface DocumentViewerModalProps {
  material: StudyMaterial;
  sourceUrl: string;
  onClose: () => void;
  onDownload?: () => void;
}

interface PdfPageCanvasProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  zoom: number;
  containerWidth: number;
  onVisible?: (pageNumber: number) => void;
}

const PdfPageCanvas: React.FC<PdfPageCanvasProps> = ({
  pdfDoc,
  pageNumber,
  zoom,
  containerWidth,
  onVisible,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shouldRender, setShouldRender] = useState(pageNumber <= 3);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldRender(true);
            if (entry.intersectionRatio >= 0.35 && onVisible) {
              onVisible(pageNumber);
            }
          }
        }
      },
      { rootMargin: '600px 0px', threshold: [0.05, 0.35] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pageNumber, onVisible]);

  useEffect(() => {
    if (!shouldRender) return;
    let cancelled = false;
    let renderTask: RenderTask | null = null;

    const renderPage = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      setRendering(true);
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const targetWidth = Math.max(280, Math.min(containerWidth - 32, 900));
        const fitScale = targetWidth / baseViewport.width;
        const effectiveScale = fitScale * zoom;
        const outputScale = Math.min(window.devicePixelRatio || 1, 2);

        const viewport = page.getViewport({ scale: effectiveScale });
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const transform =
          outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        renderTask = page.render({
          canvasContext: ctx,
          transform,
          viewport,
          canvas,
        });
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn(`PDF page ${pageNumber} render error:`, err);
        }
      } finally {
        if (!cancelled) setRendering(false);
      }
    };

    renderPage();

    return () => {
      cancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pdfDoc, pageNumber, zoom, containerWidth, shouldRender]);

  return (
    <div
      ref={wrapperRef}
      data-pdf-page={pageNumber}
      className="relative flex flex-col items-center my-2 first:mt-0 last:mb-0"
    >
      <div className="relative bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden min-h-[240px] flex items-center justify-center">
        <canvas ref={canvasRef} className="block max-w-full" />
        {(!shouldRender || rendering) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="w-6 h-6 text-[#12315A] animate-spin" />
          </div>
        )}
      </div>
      <span className="mt-1.5 text-[10px] font-semibold text-slate-500">
        Page {pageNumber} of {pdfDoc.numPages}
      </span>
    </div>
  );
};

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  material,
  sourceUrl,
  onClose,
  onDownload,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(820);
  const [zoom, setZoom] = useState<number>(1);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fallbackBlobUrl, setFallbackBlobUrl] = useState<{ url: string; revoke: boolean } | null>(null);

  const fileName =
    material.fileName ||
    material.attachmentName ||
    `${material.title.replace(/\s+/g, '_')}.pdf`;

  // Close on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Measure viewport width cleanly for PDF fit-to-width rendering
  useEffect(() => {
    const updateWidth = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const parsedData = useMemo(() => {
    const lowerName = fileName.toLowerCase();
    if (sourceUrl.startsWith('data:')) {
      const decoded = dataUrlToUint8Array(sourceUrl, fileName);
      if (decoded) {
        const mime = decoded.mimeType.toLowerCase();
        const isImage = mime.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(lowerName);
        const isPdf = mime === 'application/pdf' || lowerName.endsWith('.pdf');
        const isText =
          mime.startsWith('text/') ||
          mime === 'application/json' ||
          /\.(txt|md|csv|json|log)$/i.test(lowerName);
        return { kind: isImage ? 'image' : isPdf ? 'pdf' : isText ? 'text' : 'other', bytes: decoded.bytes, mime };
      }
    }
    const isImage = /\.(png|jpe?g|webp|gif|svg)(\?|#|$)/i.test(sourceUrl) || /\.(png|jpe?g|webp|gif|svg)$/i.test(lowerName);
    const isPdf = /\.pdf(\?|#|$)/i.test(sourceUrl) || lowerName.endsWith('.pdf');
    const isText = /\.(txt|md|csv|json)(\?|#|$)/i.test(sourceUrl) || /\.(txt|md|csv|json)$/i.test(lowerName);
    return {
      kind: isImage ? 'image' : isPdf ? 'pdf' : isText ? 'text' : 'external',
      bytes: null as Uint8Array | null,
      mime: '',
    };
  }, [sourceUrl, fileName]);

  // Image Blob URL (revoked cleanly on unmount)
  const imageUrlObj = useMemo(() => {
    if (parsedData.kind !== 'image') return null;
    return dataUrlToBlobUrl(sourceUrl, fileName);
  }, [parsedData.kind, sourceUrl, fileName]);

  useEffect(() => {
    return () => {
      if (imageUrlObj?.revoke) {
        URL.revokeObjectURL(imageUrlObj.url);
      }
    };
  }, [imageUrlObj]);

  useEffect(() => {
    return () => {
      if (fallbackBlobUrl?.revoke) {
        URL.revokeObjectURL(fallbackBlobUrl.url);
      }
    };
  }, [fallbackBlobUrl]);

  // Load PDF or Text content inline
  useEffect(() => {
    let active = true;
    let loadedDoc: PDFDocumentProxy | null = null;
    let loadingTask: pdfjsLib.PDFDocumentLoadingTask | null = null;

    setLoading(true);
    setErrorMsg(null);
    setPdfDoc(null);
    setNumPages(0);
    setTextContent(null);

    const loadDocument = async () => {
      if (parsedData.kind === 'image') {
        if (active) setLoading(false);
        return;
      }

      if (parsedData.kind === 'text') {
        try {
          let txt = '';
          if (parsedData.bytes) {
            txt = new TextDecoder('utf-8').decode(parsedData.bytes);
          } else {
            const resp = await fetch(sourceUrl);
            txt = await resp.text();
          }
          if (active) {
            setTextContent(txt);
            setLoading(false);
          }
        } catch {
          if (active) {
            setErrorMsg('Unable to read text file preview.');
            setLoading(false);
          }
        }
        return;
      }

      if (parsedData.kind === 'pdf') {
        try {
          loadingTask = parsedData.bytes
            ? pdfjsLib.getDocument({ data: parsedData.bytes.slice() })
            : pdfjsLib.getDocument({ url: sourceUrl });

          const doc = await loadingTask.promise;
          if (!active) {
            await doc.cleanup().catch(() => {});
            await loadingTask.destroy().catch(() => {});
            return;
          }
          loadedDoc = doc;
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setCurrentPage(1);
          setLoading(false);
        } catch (err) {
          console.warn('PDF.js render failed, falling back to native object/iframe:', err);
          if (active) {
            const blob = dataUrlToBlobUrl(sourceUrl, fileName);
            setFallbackBlobUrl(blob);
            setErrorMsg('pdf-fallback');
            setLoading(false);
          }
        }
        return;
      }

      // Non-PDF Office docs or unknown external URL
      if (active) {
        if (sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://')) {
          const blob = { url: sourceUrl, revoke: false };
          setFallbackBlobUrl(blob);
        }
        setLoading(false);
      }
    };

    loadDocument();

    return () => {
      active = false;
      if (loadedDoc) {
        loadedDoc.cleanup().catch(() => {});
      }
      if (loadingTask) {
        loadingTask.destroy().catch(() => {});
      }
    };
  }, [parsedData, sourceUrl, fileName]);

  const handleDownloadClick = () => {
    if (onDownload) {
      onDownload();
    } else {
      triggerFileDownload(sourceUrl, fileName);
    }
  };

  const jumpToPage = (pageNum: number) => {
    const clamped = Math.max(1, Math.min(numPages, pageNum));
    setCurrentPage(clamped);
    const target = scrollContainerRef.current?.querySelector(`[data-pdf-page="${clamped}"]`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-5xl w-full h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Top Modal Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50 shrink-0">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block truncate">
              {material.subject} • {material.semesterOrYear}
            </span>
            <h4 className="text-sm sm:text-base font-bold text-[#12315A] truncate">
              {material.title}
            </h4>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadClick}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#12315A] hover:bg-blue-900 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 cursor-pointer"
              aria-label="Close document preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Controls Bar (PDF & Images) */}
        {(pdfDoc || parsedData.kind === 'image') && !loading && !errorMsg && (
          <div className="px-4 py-2 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
            <div className="flex items-center gap-2 text-slate-600 font-semibold min-w-0">
              <FileText className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-xs">{fileName}</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {pdfDoc && numPages > 0 && (
                <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => jumpToPage(currentPage - 1)}
                    className="p-0.5 rounded hover:bg-white disabled:opacity-40 cursor-pointer"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-1.5 font-bold text-slate-700 tabular-nums">
                    Page {currentPage} / {numPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= numPages}
                    onClick={() => jumpToPage(currentPage + 1)}
                    className="p-0.5 rounded hover:bg-white disabled:opacity-40 cursor-pointer"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))}
                  className="p-0.5 rounded hover:bg-white cursor-pointer"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5 text-slate-700" />
                </button>
                <span className="px-1.5 font-bold text-slate-700 tabular-nums min-w-[44px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(2.4, +(z + 0.15).toFixed(2)))}
                  className="p-0.5 rounded hover:bg-white cursor-pointer"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-slate-700" />
                </button>
                {zoom !== 1 && (
                  <button
                    type="button"
                    onClick={() => setZoom(1)}
                    className="p-0.5 rounded hover:bg-white cursor-pointer ml-0.5"
                    aria-label="Reset zoom"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Inline Viewer Body */}
        <div
          ref={scrollContainerRef}
          className="flex-1 min-h-0 bg-slate-200/80 overflow-y-auto overflow-x-auto p-3 sm:p-5 flex flex-col items-center"
        >
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-600">
              <Loader2 className="w-8 h-8 text-[#12315A] animate-spin" />
              <p className="text-xs sm:text-sm font-semibold">Loading document preview...</p>
            </div>
          ) : parsedData.kind === 'image' && imageUrlObj ? (
            <div className="my-auto flex items-center justify-center p-4">
              <img
                src={imageUrlObj.url}
                alt={material.title}
                className={`max-w-full max-h-[72vh] object-contain rounded-xl shadow-lg transition-transform duration-150 bg-white ${
                  zoom <= 0.7
                    ? 'scale-75'
                    : zoom < 0.95
                    ? 'scale-90'
                    : zoom <= 1.05
                    ? 'scale-100'
                    : zoom <= 1.25
                    ? 'scale-110'
                    : zoom <= 1.5
                    ? 'scale-125'
                    : 'scale-150'
                }`}
              />
            </div>
          ) : pdfDoc ? (
            <div className="w-full flex flex-col items-center">
              {Array.from({ length: numPages }, (_, idx) => idx + 1).map((pageNum) => (
                <PdfPageCanvas
                  key={pageNum}
                  pdfDoc={pdfDoc}
                  pageNumber={pageNum}
                  zoom={zoom}
                  containerWidth={containerWidth}
                  onVisible={(p) => setCurrentPage(p)}
                />
              ))}
            </div>
          ) : textContent !== null ? (
            <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
              <pre className="whitespace-pre-wrap break-words font-sans text-xs sm:text-sm text-slate-800 leading-relaxed">
                {textContent}
              </pre>
            </div>
          ) : errorMsg === 'pdf-fallback' && fallbackBlobUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <object
                data={fallbackBlobUrl.url}
                type="application/pdf"
                className="w-full h-full min-h-[65vh] rounded-xl bg-white border border-slate-200"
              >
                <iframe
                  src={fallbackBlobUrl.url}
                  title={material.title}
                  className="w-full h-full min-h-[65vh] rounded-xl bg-white border border-slate-200"
                />
              </object>
            </div>
          ) : fallbackBlobUrl ? (
            <iframe
              src={fallbackBlobUrl.url}
              title={material.title}
              className="w-full h-full min-h-[65vh] rounded-xl bg-white border border-slate-200"
            />
          ) : (
            <div className="my-auto max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-4 shadow-sm">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <div className="space-y-1">
                <h5 className="text-sm font-bold text-[#12315A]">
                  Inline Preview Unavailable for This Format
                </h5>
                <p className="text-xs text-slate-500 leading-relaxed">
                  <strong>{fileName}</strong> is not a PDF or image file. Please download it to open with Microsoft Word, PowerPoint, or Excel.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadClick}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-[#12315A] hover:bg-blue-900 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download File</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
