import React, { useState, useEffect, useRef, useMemo } from "react";
import { Book, Bookmark, Chapter } from "../types";
import {
  ArrowLeft,
  BookOpen,
  Bookmark as BookmarkIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Coffee,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as pdfjsLib from "pdfjs-dist";
import ePub from "epubjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface BookReaderProps {
  book: Book;
  bookmarks: Bookmark[];
  onBack: (
    readingTimeSeconds: number,
    currentProgress: number,
    currentPageNum: number,
  ) => void;
  onAddBookmark: (
    position: number,
    chapterTitle: string,
    note: string,
    textSnippet: string,
  ) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
}

type ReaderTheme = "parchment" | "dark" | "sepia" | "light";

export default function BookReader({
  book,
  bookmarks,
  onBack,
  onAddBookmark,
  onDeleteBookmark,
}: BookReaderProps) {
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [fontSize, setFontSize] = useState<number>(15); // in px
  const [theme, setTheme] = useState<ReaderTheme>("parchment");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false);
  const [bookmarkNote, setBookmarkNote] = useState<string>("");

  // Page-flipping state within the active chapter
  const [currentPageInChapter, setCurrentPageInChapter] = useState<number>(0);

  // Reading Time tracking
  const startTimeRef = useRef<number>(Date.now());
  const accumulatedTimeRef = useRef<number>(0);

  // Normalize / Guard Chapters List against undefined or empty
  const chapters: Chapter[] = useMemo(() => {
    if (book.chapters && book.chapters.length > 0) {
      return book.chapters;
    }
    return [
      {
        title: "Full Document Content",
        content:
          book.content || "Enjoy reading this magnificent literature voyage!",
      },
    ];
  }, [book]);

  // Initialize chapter index from saved book progress
  useEffect(() => {
    const totalChapters = chapters.length;
    if (book.currentPage && book.totalPages && totalChapters > 0) {
      const savedIndex = Math.min(
        Math.floor((book.currentPage / book.totalPages) * totalChapters),
        totalChapters - 1,
      );
      setCurrentChapterIndex(savedIndex >= 0 ? savedIndex : 0);
    } else {
      setCurrentChapterIndex(0);
    }
    setCurrentPageInChapter(0);
  }, [book, chapters]);

  // Track active reading time
  useEffect(() => {
    startTimeRef.current = Date.now();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        accumulatedTimeRef.current += Math.floor(
          (Date.now() - startTimeRef.current) / 1000,
        );
      } else {
        startTimeRef.current = Date.now();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const safeIndex =
    isNaN(currentChapterIndex) ||
    currentChapterIndex < 0 ||
    currentChapterIndex >= chapters.length
      ? 0
      : currentChapterIndex;

  const currentChapter = chapters[safeIndex] || {
    title: "Chapter",
    content: "Enjoy reading!",
  };

  // Split chapter content into readable pages of roughly 800 characters, respecting paragraphs and line breaks
  const chapterPages = useMemo(() => {
    const text = currentChapter.content || "";
    if (!text.trim()) {
      return ["Enjoy reading this segment!"];
    }

    const computedPages: string[] = [];
    let currentPageText = "";
    const lines = text.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.length > 800) {
        if (currentPageText.trim()) {
          computedPages.push(currentPageText.trim());
          currentPageText = "";
        }
        let index = 0;
        while (index < line.length) {
          const chunk = line.substring(index, index + 800);
          computedPages.push(chunk);
          index += 800;
        }
      } else {
        if ((currentPageText + "\n" + line).length > 800) {
          if (currentPageText.trim()) {
            computedPages.push(currentPageText.trim());
          }
          currentPageText = line;
        } else {
          currentPageText += (currentPageText ? "\n" : "") + line;
        }
      }
    }

    if (currentPageText.trim()) {
      computedPages.push(currentPageText.trim());
    }

    if (computedPages.length === 0) {
      computedPages.push("No content in this segment.");
    }

    return computedPages;
  }, [currentChapter]);

  // Ensure currentPageInChapter is in range
  useEffect(() => {
    if (currentPageInChapter >= chapterPages.length) {
      setCurrentPageInChapter(Math.max(0, chapterPages.length - 1));
    }
  }, [chapterPages, currentPageInChapter]);

  // Handle saving stats on exiting reader
  const handleExit = () => {
    const sessionSeconds =
      Math.floor((Date.now() - startTimeRef.current) / 1000) +
      accumulatedTimeRef.current;

    // Compute total progress accurately
    const totalChapters = chapters.length;
    const progressPercent = Math.min(
      Math.floor(((safeIndex + 1) / totalChapters) * 100),
      100,
    );
    const approxPage = Math.min(
      Math.floor((progressPercent / 100) * book.totalPages),
      book.totalPages,
    );

    onBack(sessionSeconds, progressPercent, approxPage);
  };

  // Flip forwards
  const nextPage = () => {
    // If double page mode (screen size >= md), flip by 2 pages
    const increment = window.innerWidth >= 768 ? 2 : 1;
    if (currentPageInChapter + increment < chapterPages.length) {
      setCurrentPageInChapter((prev) => prev + increment);
    } else {
      // Go to next chapter
      if (safeIndex < chapters.length - 1) {
        setCurrentChapterIndex((prev) => prev + 1);
        setCurrentPageInChapter(0);
      }
    }
  };

  // Flip backwards
  const prevPage = () => {
    const decrement = window.innerWidth >= 768 ? 2 : 1;
    if (currentPageInChapter - decrement >= 0) {
      setCurrentPageInChapter((prev) => prev - decrement);
    } else {
      // Go to previous chapter (end page)
      if (safeIndex > 0) {
        setCurrentChapterIndex((prev) => prev - 1);
        // We will resolve the page count of previous chapter in effect or keep it 0
        setCurrentPageInChapter(0);
      }
    }
  };

  // Add bookmark
  const handleCreateBookmark = () => {
    const textSnippet =
      (chapterPages[currentPageInChapter] || "").substring(0, 80) + "...";
    onAddBookmark(
      safeIndex,
      `${currentChapter.title} (p.${currentPageInChapter + 1})`,
      bookmarkNote || "Manual bookmark",
      textSnippet,
    );
    setBookmarkNote("");
    setShowBookmarks(true);
  };

  // Theme-specific styles
  const themeClasses: Record<
    ReaderTheme,
    { bg: string; text: string; border: string; font: string; cardBg: string }
  > = {
    parchment: {
      bg: "bg-[#ede5d3]",
      cardBg: "bg-[#fbf7ee]",
      text: "text-black",
      border: "border-[#dfd7bf]",
      font: "font-serif",
    },
    dark: {
      bg: "bg-[#090808]",
      cardBg: "bg-[#121010]",
      text: "text-[#e6e1da]",
      border: "border-[#2c241d]",
      font: "font-sans",
    },
    sepia: {
      bg: "bg-[#ebdcb9]",
      cardBg: "bg-[#f5eacf]",
      text: "text-black",
      border: "border-[#e0d2b4]",
      font: "font-serif",
    },
    light: {
      bg: "bg-[#f0ede6]",
      cardBg: "bg-[#faf9f6]",
      text: "text-black",
      border: "border-[#eae8e2]",
      font: "font-sans",
    },
  };

  const currentTheme = themeClasses[theme];

  // Derive Left & Right text for Double Spread
  const leftPageText = chapterPages[currentPageInChapter] || "";
  const rightPageText = chapterPages[currentPageInChapter + 1] || "";

  // ── EPUB/PDF: 远程文件，用简单可靠的阅读器 ──
  if (book.fileType === "epub" && book.fileUrl) {
    return (
      <EpubInlineReader
        fileUrl={book.fileUrl}
        title={book.title}
        onBack={handleExit}
      />
    );
  }

  if (book.fileType === "pdf" && book.fileUrl) {
    return (
      <PdfCanvasReader
        fileUrl={book.fileUrl}
        title={book.title}
        onBack={handleExit}
      />
    );
  }

  // ── TXT: 现有章节阅读器 ──
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col ${currentTheme.bg} transition-colors duration-300 select-none`}
    >
      {/* Top Bar Navigation */}
      <div
        className={`h-14 px-4 border-b ${currentTheme.border} bg-[#14110e]/10 backdrop-blur-md flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handleExit}
            className={`p-2 rounded-lg hover:bg-black/5 transition-all ${currentTheme.text}`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span
              className={`text-[9px] font-mono uppercase tracking-widest ${currentTheme.text} opacity-60`}
            >
              Voyager Reading Desk
            </span>
            <h1
              className={`text-xs md:text-sm font-bold text-serif truncate max-w-[150px] md:max-w-md ${currentTheme.text}`}
            >
              {book.title}
            </h1>
          </div>
        </div>

        {/* Configuration Utilities */}
        <div className="flex items-center gap-2">
          {/* Bookmark Drawer Button */}
          <button
            onClick={() => {
              setShowBookmarks(!showBookmarks);
              setShowSettings(false);
            }}
            className={`p-2 rounded-lg hover:bg-black/5 relative transition-all ${currentTheme.text}`}
            title="Bookmarks"
          >
            <BookmarkIcon className="w-4 h-4" />
            {bookmarks.filter((b) => b.bookId === book.id).length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#dcae1d] rounded-full animate-pulse" />
            )}
          </button>

          {/* Typography Settings Button */}
          <button
            onClick={() => {
              setShowSettings(!showSettings);
              setShowBookmarks(false);
            }}
            className={`p-2 rounded-lg hover:bg-black/5 transition-all ${currentTheme.text}`}
            title="Appearance Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Drawer: Bookmarks list */}
        <AnimatePresence>
          {showBookmarks && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className={`absolute left-0 top-0 bottom-0 w-80 border-r ${currentTheme.border} ${currentTheme.cardBg} z-20 flex flex-col p-4 shadow-2xl`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-black/5 mb-4">
                <h3
                  className={`text-xs font-bold font-mono uppercase tracking-wider ${currentTheme.text}`}
                >
                  Bookmarked Pages
                </h3>
                <button
                  onClick={() => setShowBookmarks(false)}
                  className={`text-xs hover:underline ${currentTheme.text}`}
                >
                  Close
                </button>
              </div>

              {/* Bookmark Creator */}
              <div className="p-3 bg-black/5 rounded-xl mb-4">
                <label
                  className={`text-[10px] font-mono uppercase tracking-wider ${currentTheme.text} opacity-75`}
                >
                  Add note for this page
                </label>
                <textarea
                  value={bookmarkNote}
                  onChange={(e) => setBookmarkNote(e.target.value)}
                  placeholder="E.g., Beautiful metaphor about oceans..."
                  className={`w-full text-xs p-2 bg-white/20 border border-black/10 rounded-lg mt-1 focus:outline-none focus:border-[#dcae1d] resize-none h-14 ${currentTheme.text}`}
                />
                <button
                  onClick={handleCreateBookmark}
                  className="w-full mt-2 bg-[#dcae1d] hover:bg-[#bda018] text-[#12100e] text-xs font-semibold py-1.5 rounded-lg transition-all"
                >
                  Save Bookmark
                </button>
              </div>

              {/* Saved Bookmarks List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {bookmarks.filter((b) => b.bookId === book.id).length === 0 ? (
                  <div
                    className={`text-xs italic text-center py-12 ${currentTheme.text} opacity-50`}
                  >
                    No bookmarks saved on this desk.
                  </div>
                ) : (
                  bookmarks
                    .filter((b) => b.bookId === book.id)
                    .map((b) => (
                      <div
                        key={b.id}
                        className="p-3 bg-white/30 border border-black/5 rounded-xl relative group"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span
                            className={`text-[9px] font-bold font-mono ${currentTheme.text} truncate max-w-[150px]`}
                          >
                            {b.chapterTitle}
                          </span>
                          <button
                            onClick={() => onDeleteBookmark(b.id)}
                            className="text-[10px] text-red-500 hover:underline opacity-0 group-hover:opacity-100 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                        <p
                          className={`text-xs mt-1 leading-relaxed font-medium ${currentTheme.text}`}
                        >
                          "{b.note}"
                        </p>
                        <button
                          onClick={() => {
                            setCurrentChapterIndex(b.position);
                            setCurrentPageInChapter(0);
                            setShowBookmarks(false);
                          }}
                          className={`mt-1.5 text-[9px] ${currentTheme.text} underline font-mono block`}
                        >
                          Jump to segment →
                        </button>
                      </div>
                    ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Drawer: Quick Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`absolute right-4 top-4 w-72 border border-black/10 rounded-2xl p-4 shadow-2xl ${currentTheme.cardBg} z-30 space-y-4`}
            >
              <div className="flex justify-between items-center pb-2 border-b border-black/5">
                <span
                  className={`text-xs font-bold font-mono uppercase ${currentTheme.text}`}
                >
                  Appearance
                </span>
                <button
                  onClick={() => setShowSettings(false)}
                  className={`text-xs ${currentTheme.text} hover:underline`}
                >
                  Done
                </button>
              </div>

              {/* Font Size Selector */}
              <div className="space-y-1.5">
                <label
                  className={`text-[10px] font-mono uppercase tracking-wider ${currentTheme.text} opacity-75`}
                >
                  Font Size: {fontSize}px
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setFontSize((prev) => Math.max(prev - 1, 12))
                    }
                    className={`flex-1 py-1 bg-black/5 rounded-lg text-xs font-semibold ${currentTheme.text}`}
                  >
                    A-
                  </button>
                  <button
                    onClick={() =>
                      setFontSize((prev) => Math.min(prev + 1, 24))
                    }
                    className={`flex-1 py-1 bg-black/5 rounded-lg text-xs font-semibold ${currentTheme.text}`}
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="space-y-1.5">
                <label
                  className={`text-[10px] font-mono uppercase tracking-wider ${currentTheme.text} opacity-75`}
                >
                  Theme Background
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setTheme("parchment")}
                    className="h-10 bg-[#f4efe2] border border-[#dfd7bf] rounded-lg flex items-center justify-center text-[#2b1f15]"
                    title="Parchment"
                  >
                    <Coffee className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTheme("sepia")}
                    className="h-10 bg-[#f4ebd0] border border-[#e0d2b4] rounded-lg flex items-center justify-center text-[#5c4033]"
                    title="Sepia"
                  >
                    <Coffee className="w-4 h-4 text-amber-800" />
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className="h-10 bg-[#0f0d0c] border border-[#26211d] rounded-lg flex items-center justify-center text-[#e6e1da]"
                    title="Classic Dark"
                  >
                    <Moon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTheme("light")}
                    className="h-10 bg-[#faf9f6] border border-[#eae8e2] rounded-lg flex items-center justify-center text-[#1a1a1a]"
                    title="Clean Light"
                  >
                    <Sun className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DOUBLE SPREAD BOOK CANVAS */}
        <div className="flex-1 flex flex-col justify-between py-6 px-4 md:px-12 select-text">
          {/* Chapter Subheader */}
          <div className="text-center pb-2 border-b border-black/5 max-w-4xl mx-auto w-full flex justify-between items-center">
            <span
              className={`text-[10px] font-mono uppercase tracking-wider ${currentTheme.text} opacity-60`}
            >
              Chapter {safeIndex + 1} / {chapters.length}:{" "}
              {currentChapter.title}
            </span>
            <span
              className={`text-[10px] font-mono uppercase tracking-wider ${currentTheme.text} opacity-60`}
            >
              {book.fileType.toUpperCase()} READER
            </span>
          </div>

          {/* Book double page spread layout */}
          <div className="flex-1 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-0.5 bg-black/5 rounded-2xl overflow-hidden shadow-2xl relative my-4 border border-black/10">
            {/* 3D Spine Binding Overlay in center */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[30px] -translate-x-1/2 bg-gradient-to-r from-black/25 via-black/45 to-black/25 z-10 pointer-events-none hidden md:block" />
            <div className="absolute top-0 bottom-0 left-1/2 w-[2px] -translate-x-1/2 bg-black/40 z-10 pointer-events-none hidden md:block" />

            {/* PAGE LEFT (or single page on mobile) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${safeIndex}-${currentPageInChapter}-left`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className={`p-6 md:p-12 ${currentTheme.cardBg} flex flex-col justify-between relative shadow-lg h-full`}
              >
                <div
                  className={`${currentTheme.font} ${currentTheme.text} leading-relaxed text-justify space-y-3`}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {leftPageText.split("\n").map((para, i) => (
                    <p
                      key={i}
                      className="leading-relaxed tracking-wide min-h-[1em]"
                    >
                      {para.trim()}
                    </p>
                  ))}
                </div>

                {/* Page Number Footer Left */}
                <div
                  className={`mt-6 border-t border-black/5 pt-3 flex justify-between items-center text-[10px] font-mono ${currentTheme.text} opacity-50`}
                >
                  <span>{book.title}</span>
                  <span>
                    Page {currentPageInChapter + 1} of {chapterPages.length}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* PAGE RIGHT (hidden on mobile, visible on desktop) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${safeIndex}-${currentPageInChapter}-right`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className={`p-6 md:p-12 ${currentTheme.cardBg} flex flex-col justify-between relative shadow-lg h-full hidden md:flex`}
              >
                {rightPageText ? (
                  <div
                    className={`${currentTheme.font} ${currentTheme.text} leading-relaxed text-justify space-y-3`}
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {rightPageText.split("\n").map((para, i) => (
                      <p
                        key={i}
                        className="leading-relaxed tracking-wide min-h-[1em]"
                      >
                        {para.trim()}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
                    <BookOpen className="w-8 h-8 mb-2" />
                    <p className="text-xs italic font-serif">
                      End of Chapter {safeIndex + 1}
                    </p>
                    {safeIndex < chapters.length - 1 && (
                      <button
                        onClick={() => {
                          setCurrentChapterIndex((prev) => prev + 1);
                          setCurrentPageInChapter(0);
                        }}
                        className="mt-3 px-3 py-1 bg-black/5 hover:bg-black/10 rounded-lg text-xs font-semibold transition-all"
                      >
                        Advance to next chapter →
                      </button>
                    )}
                  </div>
                )}

                {/* Page Number Footer Right */}
                <div
                  className={`mt-6 border-t border-black/5 pt-3 flex justify-between items-center text-[10px] font-mono ${currentTheme.text} opacity-50`}
                >
                  <span>Chapter {safeIndex + 1}</span>
                  <span>
                    Page {currentPageInChapter + 2} of {chapterPages.length}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Book Reader Control Row (Flipping controls) */}
          <div className="max-w-4xl mx-auto w-full flex justify-between items-center px-2">
            <button
              onClick={prevPage}
              disabled={safeIndex === 0 && currentPageInChapter === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border ${currentTheme.border} text-xs font-medium tracking-wide bg-white/40 backdrop-blur-md transition-all ${
                safeIndex === 0 && currentPageInChapter === 0
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-black/5"
              } ${currentTheme.text}`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <span
              className={`text-[10px] font-mono uppercase tracking-widest ${currentTheme.text} opacity-70`}
            >
              Chapter {safeIndex + 1} / {chapters.length} •{" "}
              {Math.min(
                Math.floor(
                  ((currentPageInChapter + 1) / chapterPages.length) * 100,
                ),
                100,
              )}
              % Mapped
            </span>

            <button
              onClick={nextPage}
              disabled={
                safeIndex === chapters.length - 1 &&
                currentPageInChapter >= chapterPages.length - 1
              }
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border ${currentTheme.border} text-xs font-medium tracking-wide bg-white/40 backdrop-blur-md transition-all ${
                safeIndex === chapters.length - 1 &&
                currentPageInChapter >= chapterPages.length - 1
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-black/5"
              } ${currentTheme.text}`}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// EPUB / PDF 阅读器
// ══════════════════════════════════════════════════════

interface EpubPdfReaderProps {
  fileUrl: string;
  fileType: "epub" | "pdf";
  title: string;
  onBack: () => void;
}

function EpubInlineReader({
  fileUrl,
  title,
  onBack,
}: {
  fileUrl: string;
  title: string;
  onBack: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renditionRef = useRef<any>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [progress, setProgress] = useState<string>("Downloading...");

  useEffect(() => {
    let rendition: any = null;
    let book: any = null;
    let cancelled = false;

    const loadEpub = async () => {
      try {
        setError("");
        setIsLoading(true);

        // 通过代理下载 ArrayBuffer（绕过 302 相对路径问题）
        setProgress("Downloading...");
        const proxyUrl = `/api/oss/proxy?url=${encodeURIComponent(fileUrl)}`;
        const resp = await fetch(proxyUrl);
        if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
        const buffer = await resp.arrayBuffer();

        if (cancelled || !containerRef.current) return;

        setProgress("Parsing...");
        book = ePub(buffer);
        await book.ready;

        if (cancelled || !containerRef.current) { book.destroy(); return; }

        rendition = book.renderTo(containerRef.current, {
          width: "100%",
          height: "100%",
          flow: "scrolled",
        });
        renditionRef.current = rendition;

        // 监听位置变化，修复 TOC 跳转后导航失效
        rendition.on("relocated", (loc: any) => {
          console.log("[EPUB] Relocated:", loc);
        });

        await rendition.display();
        setProgress("Ready");
      } catch (err: any) {
        console.error("EPUB load failed:", err);
        setError(`Failed: ${err.message}`);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadEpub();

    return () => {
      cancelled = true;
      if (rendition?.destroy) rendition.destroy();
      if (book?.destroy) book.destroy();
    };
  }, [fileUrl]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0e0c0a] select-none">
      <div className="h-12 px-4 border-b border-[#2c241d] bg-[#14110e]/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-[#2c241d] text-[#9c9284] hover:text-[#f2efe9] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#dcae1d]">EPUB Reader</span>
          <h1 className="text-xs font-bold text-serif text-[#f2efe9] truncate max-w-[200px] mx-auto">{title}</h1>
        </div>
        <span className="text-[10px] font-mono text-[#9c9284]">{progress}</span>
      </div>
      <div className="flex-1 bg-[#181414] relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-[#dcae1d] text-sm z-10">{progress}</div>
        )}
        {error ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-[#f2efe9] px-6 text-center">
            <BookOpen className="w-16 h-16 text-[#dcae1d]" />
            <p>{error}</p>
            <a href={fileUrl} target="_blank" rel="noreferrer" className="px-6 py-2.5 bg-[#dcae1d] hover:bg-[#bda018] text-[#12100e] text-xs font-bold rounded-xl transition-all shadow-lg mt-4">
              Download EPUB
            </a>
          </div>
        ) : (
          <div ref={containerRef} className="w-full h-full overflow-auto" />
        )}
      </div>
      {/* EPUB 翻页导航 — 始终显示 */}
      <div className="h-12 px-6 border-t border-[#2c241d] bg-[#14110e]/80 backdrop-blur-md flex items-center justify-center gap-6 shrink-0">
        <button onClick={() => renditionRef.current?.prev()} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#1c1713] border border-[#2c241d] text-xs text-[#f2efe9] hover:bg-[#2c241d] transition-colors">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <button onClick={() => renditionRef.current?.next()} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#1c1713] border border-[#2c241d] text-xs text-[#f2efe9] hover:bg-[#2c241d] transition-colors">
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <style>{`
        .epub-container { background: #f5f0e8 !important; }
        .epub-view > iframe { background: #f5f0e8 !important; }
      `}</style>
    </div>
  );
}

function PdfCanvasReader({
  fileUrl,
  title,
  onBack,
}: {
  fileUrl: string;
  title: string;
  onBack: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // 加载 PDF
  useEffect(() => {
    let cancelled = false;
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError("");
        const proxyUrl = `/api/oss/proxy?url=${encodeURIComponent(fileUrl)}`;
        const resp = await fetch(proxyUrl);
        if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
        const buffer = await resp.arrayBuffer();
        if (cancelled) return;
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        if (cancelled) { pdf.cleanup(); return; }
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setPageNum(1);
        setLoading(false);
      } catch (err: any) {
        setError(`Failed: ${err.message}`);
        setLoading(false);
      }
    };
    loadPdf();
    return () => { cancelled = true; };
  }, [fileUrl]);

  // 渲染当前页
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let cancelled = false;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    // 清除旧画面
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const render = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        if (cancelled) return;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (e: any) {
        if (e.name !== 'RenderingCancelledException') console.error(e);
      }
    };
    render();
    return () => { cancelled = true; };
  }, [pdfDoc, pageNum]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0e0c0a] select-none">
      <div className="h-12 px-4 border-b border-[#2c241d] bg-[#14110e]/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-[#2c241d] text-[#9c9284] hover:text-[#f2efe9] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#dcae1d]">PDF Reader</span>
          <h1 className="text-xs font-bold text-serif text-[#f2efe9] truncate max-w-[200px] mx-auto">{title}</h1>
        </div>
        <span className="text-[10px] font-mono text-[#9c9284]">{pageNum} / {totalPages}</span>
      </div>
      <div className="flex-1 overflow-auto bg-[#2d2a26] flex justify-center py-4">
        {loading && <div className="text-[#dcae1d] text-sm self-center">Loading PDF...</div>}
        {error && <div className="text-red-400 text-sm self-center">{error}</div>}
        <canvas ref={canvasRef} key={pageNum} className="shadow-2xl" />
      </div>
      <div className="h-12 px-6 border-t border-[#2c241d] bg-[#14110e]/80 backdrop-blur-md flex items-center justify-center gap-6 shrink-0">
        <button onClick={() => setPageNum(p => Math.max(1, p - 1))} disabled={pageNum <= 1} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#1c1713] border border-[#2c241d] text-xs text-[#f2efe9] hover:bg-[#2c241d] transition-colors disabled:opacity-30">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <span className="text-[10px] font-mono text-[#9c9284]">{pageNum} / {totalPages}</span>
        <button onClick={() => setPageNum(p => Math.min(totalPages, p + 1))} disabled={pageNum >= totalPages} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#1c1713] border border-[#2c241d] text-xs text-[#f2efe9] hover:bg-[#2c241d] transition-colors disabled:opacity-30">
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
