import React, { useState, useMemo, useRef } from "react";
import { Book } from "../types";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ShieldAlert,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BookShelf3DProps {
  books: Book[];
  onBookClick: (book: Book) => void;
  onMoveBook: (bookId: string, newCategory: string) => void;
  onDeleteBook: (bookId: string) => void;
}

const STANDARD_CATEGORIES = [
  "Literature",
  "Science Fiction",
  "Magical Realism",
  "Modernist Fiction",
  "Japanese Literature",
  "Historical Fiction",
  "Romantic Fiction",
  "Philosophy",
];

// Global fallback to ensure drag/drop is perfectly robust in sandboxed iframes
let backupDraggedBookId: string | null = null;

export default function BookShelf3D({
  books,
  onBookClick,
  onMoveBook,
  onDeleteBook,
}: BookShelf3DProps) {
  // Local states for dragging
  const [isDraggingActive, setIsDraggingActive] = useState<boolean>(false);
  const [draggedBookId, setDraggedBookId] = useState<string | null>(null);
  const [dragOverShelf, setDragOverShelf] = useState<string | null>(null);
  const [isTrashOver, setIsTrashOver] = useState<boolean>(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Derive all active categories (standard ones plus any custom ones from imported books)
  const allCategories = useMemo(() => {
    const customCats = books
      .map((b) => b.category)
      .filter((cat) => cat && !STANDARD_CATEGORIES.includes(cat));
    // Remove duplicates
    const uniqueCustom = Array.from(new Set(customCats));
    return [...STANDARD_CATEGORIES, ...uniqueCustom];
  }, [books]);

  // Group books by categories
  const booksByCategory = useMemo(() => {
    const groups: { [cat: string]: Book[] } = {};
    allCategories.forEach((cat) => {
      groups[cat] = [];
    });
    books.forEach((b) => {
      const cat = b.category || "Literature";
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(b);
    });
    // Filter down to only categories that have books OR are standard categories
    return Object.entries(groups);
  }, [books, allCategories]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, bookId: string) => {
    draggingRef.current = true;
    setDraggedBookId(bookId);
    backupDraggedBookId = bookId;
    setIsDraggingActive(true);
    e.dataTransfer.setData("text/plain", bookId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDraggingActive(false);
    setDraggedBookId(null);
    backupDraggedBookId = null;
    setDragOverShelf(null);
    setIsTrashOver(false);
    setTimeout(() => { draggingRef.current = false; }, 50);
  };

  const shelfDragCounters = React.useRef<Record<string, number>>({});
  const trashDragCounter = React.useRef<number>(0);
  const draggingRef = useRef(false); // 防止拖动时触发 onClick

  const handleDragEnterShelf = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    e.stopPropagation();
    shelfDragCounters.current[category] =
      (shelfDragCounters.current[category] || 0) + 1;
    setDragOverShelf(category);
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragOverShelf = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (dragOverShelf !== category) {
      setDragOverShelf(category);
    }
  };

  const handleDragLeaveShelf = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    e.stopPropagation();
    shelfDragCounters.current[category] = Math.max(
      (shelfDragCounters.current[category] || 1) - 1,
      0,
    );
    if (shelfDragCounters.current[category] === 0) {
      delete shelfDragCounters.current[category];
      if (dragOverShelf === category) {
        setDragOverShelf(null);
      }
    }
  };

  const handleDropOnShelf = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    const bookId =
      e.dataTransfer.getData("text/plain") ||
      draggedBookId ||
      backupDraggedBookId;
    if (bookId) {
      onMoveBook(bookId, category);
    }
    handleDragEnd();
  };

  const handleDragEnterTrash = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    trashDragCounter.current += 1;
    setIsTrashOver(true);
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragOverTrash = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (!isTrashOver) {
      setIsTrashOver(true);
    }
  };

  const handleDragLeaveTrash = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    trashDragCounter.current = Math.max(trashDragCounter.current - 1, 0);
    if (trashDragCounter.current === 0) {
      setIsTrashOver(false);
    }
  };

  const handleDropOnTrash = (e: React.DragEvent) => {
    e.preventDefault();
    const bookId =
      e.dataTransfer.getData("text/plain") ||
      draggedBookId ||
      backupDraggedBookId;
    if (bookId) {
      const match = books.find((b) => b.id === bookId);
      if (match) {
        setBookToDelete(match);
      }
    }
    handleDragEnd();
  };

  return (
    <div className="w-full space-y-6 py-2 relative min-h-[580px] flex flex-col justify-between select-none">
      {/* Dynamic Instruction & Drag Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-[#14110e]/60 border border-[#231a14]/60 rounded-xl">
        <p className="text-xs text-[#9c9284] flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-[#dcae1d]" />
          <span>
            {isDraggingActive
              ? "⚡ Drag the book onto another shelf, or drop it into the Trash Can to delete it."
              : "💡 Tip: You can drag books to categorize them between shelves, or drag to trash to delete."}
          </span>
        </p>
      </div>

      {/* Shelves Container */}
      <div className="flex-1 space-y-8 my-4 relative">
        {booksByCategory.map(([category, catBooks]) => {
          const isOver = dragOverShelf === category;
          return (
            <div
              key={category}
              onDragEnter={(e) => handleDragEnterShelf(e, category)}
              onDragOver={(e) => handleDragOverShelf(e, category)}
              onDragLeave={(e) => handleDragLeaveShelf(e, category)}
              onDrop={(e) => handleDropOnShelf(e, category)}
              className={`relative rounded-2xl transition-all duration-300 ${
                isOver
                  ? "bg-[#dcae1d]/5 ring-2 ring-[#dcae1d]/40 scale-[1.01]"
                  : "bg-[#14110e]/20"
              }`}
            >
              {/* Row Shelf Name */}
              <div className="flex items-center justify-between mb-2 px-2 pt-2">
                <h3 className="text-xs font-semibold tracking-wider font-mono text-[#9c9284] uppercase flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isOver ? "bg-[#dcae1d] animate-ping" : "bg-[#dcae1d]"}`}
                  ></span>
                  {category}
                </h3>
                <span className="text-[10px] font-mono text-[#5c544a]">
                  {catBooks.length} books
                </span>
              </div>

              {/* Realistic 3D Bookshelf Row */}
              <div className="relative pb-6 px-4 border border-[#231a14]/30 rounded-2xl overflow-x-auto scrollbar-none min-h-[190px]">
                <div className="flex items-end gap-5 md:gap-8 pt-5 px-3">
                  {catBooks.map((book) => {
                    const hue = (book.title.charCodeAt(0) * 12) % 360;
                    const coverStyle = {
                      borderLeft: `4px solid hsl(${hue}, 40%, 25%)`,
                      boxShadow:
                        "8px 8px 16px rgba(0, 0, 0, 0.7), inset -4px 0 8px rgba(0,0,0,0.5)",
                    };

                    const isBeingDragged = draggedBookId === book.id;

                    return (
                      <motion.div
                        key={book.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, book.id)}
                        onDragEnd={handleDragEnd}
                        whileHover={{ y: -10, rotateY: -8, scale: 1.02 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                        }}
                        onClick={() => { if (!draggingRef.current) onBookClick(book); }}
                        className={`relative flex flex-col items-center group cursor-grab active:cursor-grabbing transition-opacity ${
                          isBeingDragged ? "opacity-30" : "opacity-100"
                        }`}
                      >
                        {/* 3D Book Block Wrapper */}
                        <div className="relative w-24 md:w-28 h-32 md:h-36 transition-all duration-300">
                          {/* Book Cover */}
                          {book.cover ? (
                            <div
                              className="w-full h-full rounded-md overflow-hidden relative"
                              style={coverStyle}
                            >
                              <img
                                src={book.cover}
                                alt={book.title}
                                className="w-full h-full object-cover grayscale-10 group-hover:grayscale-0 transition-all duration-300"
                              />
                              {/* Shading Layer */}
                              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20 pointer-events-none" />
                            </div>
                          ) : (
                            <div
                              className="w-full h-full rounded-md flex flex-col justify-between p-2.5"
                              style={{
                                ...coverStyle,
                                backgroundColor: `hsl(${hue}, 20%, 15%)`,
                              }}
                            >
                              <div className="text-[9px] uppercase font-semibold text-[#9c9284] font-mono tracking-wider">
                                {book.country}
                              </div>
                              <div className="text-[11px] font-bold text-serif text-[#f2efe9] line-clamp-3 leading-snug">
                                {book.title}
                              </div>
                              <div className="text-[9px] text-[#9c9284] truncate">
                                {book.author}
                              </div>
                            </div>
                          )}

                          {/* Spine thickness side-face for 3D realism */}
                          <div className="absolute top-0 bottom-0 -left-1 w-1 bg-black/60 rounded-l-md blur-[0.5px]" />

                          {/* Read progress ribbon */}
                          {book.progress > 0 && (
                            <div className="absolute top-2 right-2 px-1 py-0.5 bg-[#dcae1d] text-[#12100e] text-[8px] font-bold font-mono rounded shadow-md">
                              {book.progress === 100
                                ? "READ"
                                : `${book.progress}%`}
                            </div>
                          )}
                        </div>

                        {/* Book Label beneath shelf */}
                        <div className="w-24 md:w-28 mt-2 text-center">
                          <h4 className="text-[11px] font-medium text-[#f2efe9] truncate group-hover:text-[#dcae1d] transition-all">
                            {book.title}
                          </h4>
                          <p className="text-[9px] text-[#9c9284] truncate mt-0.5">
                            {book.author}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Empty state drag slot helper inside row */}
                  {catBooks.length === 0 && (
                    <div className="h-32 w-24 rounded-lg border border-dashed border-[#2c241d] flex flex-col items-center justify-center text-center p-2 text-[#5c544a] text-[10px] bg-black/10">
                      <BookOpen className="w-4 h-4 mb-1 opacity-40" />
                      Empty Shelf
                    </div>
                  )}
                </div>

                {/* Wooden Board/Plank element on the bottom of books */}
                <div className="absolute bottom-0 left-0 right-0 h-3.5 bg-gradient-to-b from-[#2b1f15] to-[#120d09] border-t border-[#3e2c1e] rounded-b-2xl shadow-xl flex items-center px-4">
                  <div className="w-full h-[1px] bg-white/5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Animated Trash Target Area (Slide in ONLY when dragging) */}
      {isDraggingActive && (
        <div
          onDragEnter={handleDragEnterTrash}
          onDragOver={handleDragOverTrash}
          onDragLeave={handleDragLeaveTrash}
          onDrop={handleDropOnTrash}
          style={{
            position: "fixed",
            bottom: "5rem",
            right: "1.5rem",
            zIndex: 40,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`p-6 rounded-full shadow-2xl flex flex-col items-center justify-center border transition-all ${
              isTrashOver
                ? "bg-red-950/90 border-red-500 text-red-400 scale-110 ring-4 ring-red-500/30"
                : "bg-[#181210]/95 border-red-900/50 text-red-600/80 hover:text-red-500"
            }`}
          >
            <Trash2
              className={`w-8 h-8 ${isTrashOver ? "animate-bounce" : "animate-pulse"}`}
            />
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest mt-1.5">
              {isTrashOver ? "Drop to Remove" : "Drag to Delete"}
            </span>
          </motion.div>
        </div>
      )}

      {books.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-[#14110e]/30 border border-dashed border-[#231a14] rounded-2xl">
          <BookOpen className="w-10 h-10 text-[#5c544a] mb-3 animate-pulse" />
          <h4 className="text-sm font-semibold text-[#f2efe9]">
            Your Digital Bookshelf is Empty
          </h4>
          <p className="text-xs text-[#9c9284] mt-1">
            Import some books using the 'Import Book' utility above.
          </p>
        </div>
      )}

      {/* Stunning Custom Deletion Confirmation Modal Overlay */}
      <AnimatePresence>
        {bookToDelete && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#14110e] border border-red-900/30 p-6 rounded-2xl max-w-sm w-full shadow-2xl text-center space-y-4"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-red-950/50 border border-red-500/30 flex items-center justify-center text-red-500">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-serif text-[#f2efe9]">
                  Remove Book from Desk?
                </h3>
                <p className="text-xs text-[#9c9284] leading-relaxed">
                  Are you sure you want to delete{" "}
                  <strong>{bookToDelete.title}</strong>? All reading footprints,
                  stats, and bookmarks will be cleared.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBookToDelete(null)}
                  className="flex-1 py-2 bg-transparent hover:bg-white/5 border border-[#2c241d] text-[#9c9284] hover:text-[#f2efe9] text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Keep Book
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteBook(bookToDelete.id);
                    setBookToDelete(null);
                  }}
                  className="flex-1 py-2 bg-red-900 hover:bg-red-800 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Delete Book
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
