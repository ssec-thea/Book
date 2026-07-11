import React, { useState } from 'react';
import { Book, Review, Bookmark } from '../types';
import { Play, MessageSquare, Bookmark as BookmarkIcon, MapPin, Trash2, X, Star, Calendar, Clock, Globe, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookDetailModalProps {
  book: Book;
  reviews: Review[];
  bookmarks: Bookmark[];
  onClose: () => void;
  onRead: () => void;
  onWriteReview: () => void;
  onDeleteBook: () => void;
  onAddToShelf?: () => void;
  isOwner?: boolean;
}

export default function BookDetailModal({
  book,
  reviews,
  bookmarks,
  onClose,
  onRead,
  onWriteReview,
  onDeleteBook,
  onAddToShelf,
  isOwner = true,
}: BookDetailModalProps) {
  const bookReviews = reviews.filter(r => r.bookId === book.id);
  const bookBookmarks = bookmarks.filter(b => b.bookId === book.id);

  // Format reading time nicely
  const formatReadTime = (totalSeconds: number) => {
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const mins = Math.floor(totalSeconds / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl bg-[#14110e] border border-[#2c241d] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Left Side: Book Cover, Nationality, Primary Actions */}
        <div className="w-full md:w-72 bg-[#1b1713] p-6 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-[#2c241d]">
          <div className="w-full flex flex-col items-center">
            
            {/* Close button for mobile */}
            <div className="w-full flex justify-end md:hidden mb-2">
              <button onClick={onClose} className="p-1.5 hover:bg-[#2c241d] rounded-lg text-[#9c9284]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cover art */}
            {book.cover ? (
              <img
                src={book.cover}
                alt={book.title}
                className="w-40 h-56 object-cover rounded-xl shadow-2xl border border-[#2c241d]"
              />
            ) : (
              <div className="w-40 h-56 bg-[#2c241d] border border-[#3e3226] rounded-xl flex items-center justify-center text-xs font-mono text-[#9c9284] shadow-2xl">
                No Cover Image
              </div>
            )}

            <span className="mt-4 text-[10px] font-mono uppercase tracking-widest text-[#dcae1d] px-2 py-0.5 bg-[#dcae1d]/10 rounded">
              {book.country}
            </span>

            <h3 className="text-lg font-bold text-serif text-center mt-3 text-[#f2efe9] leading-tight">
              {book.title}
            </h3>
            <p className="text-xs text-[#9c9284] text-center mt-1">{book.author}</p>

            {/* Read Stats */}
            <div className="grid grid-cols-2 gap-2 w-full mt-6 bg-[#14110e]/50 p-3 rounded-xl border border-[#2c241d]/50 text-center">
              <div>
                <span className="text-[9px] font-mono text-[#9c9284] uppercase tracking-wider block">Duration</span>
                <span className="text-xs font-bold font-mono text-[#f2efe9] mt-1 block flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-[#dcae1d]" /> {formatReadTime(book.readTime || 0)}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-[#9c9284] uppercase tracking-wider block">Progress</span>
                <span className="text-xs font-bold font-mono text-[#f2efe9] mt-1 block">
                  {book.progress}%
                </span>
              </div>
            </div>
          </div>

          {/* Delete Book action — 仅所有者可见 */}
          {isOwner && (
            <button
              onClick={onDeleteBook}
              className="mt-8 text-[11px] text-red-400 hover:text-red-300 hover:underline flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove from shelf
            </button>
          )}
          {/* Add to My Shelf — 公开图书 */}
          {!isOwner && onAddToShelf && (
            <button
              onClick={onAddToShelf}
              className="mt-8 text-[11px] text-[#dcae1d] hover:text-[#f2efe9] hover:underline flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" /> Add to My Shelf
            </button>
          )}
        </div>

        {/* Right Side: Detailed Info, Tabs, Reviews, Bookmarks */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col max-h-[60vh] md:max-h-none">
          
          {/* Close button for desktop */}
          <div className="hidden md:flex justify-end">
            <button onClick={onClose} className="p-1.5 hover:bg-[#2c241d] rounded-lg text-[#9c9284] hover:text-[#f2efe9] transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-6 flex-1">
            
            {/* Category / Genre info */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9c9284]">Category & Genre</span>
              <p className="text-sm font-semibold text-[#f2efe9] mt-0.5">{book.category}</p>
            </div>

            {/* Summary */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9c9284]">Literary Summary</span>
              <p className="text-xs text-[#9c9284] mt-1.5 leading-relaxed font-serif text-justify">
                {book.summary || 'No summary compiled. Use the reading desk to draft reflections or summarize text.'}
              </p>
            </div>

             {/* Main Action Triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={onRead}
                className="px-4 py-2.5 bg-[#dcae1d] hover:bg-[#bda018] text-[#12100e] text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-[#12100e]" /> Start Reading
              </button>

              <button
                onClick={onWriteReview}
                className="px-4 py-2.5 bg-transparent border border-[#2c241d] hover:border-[#473c32] text-[#f2efe9] text-xs font-semibold rounded-xl hover:bg-[#1b1713] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" /> Log Review
              </button>
            </div>

            {/* Bookmarks Section */}
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#9c9284] mb-2 flex items-center gap-1">
                <BookmarkIcon className="w-3.5 h-3.5" /> Bookmarks ({bookBookmarks.length})
              </h4>
              {bookBookmarks.length === 0 ? (
                <p className="text-xs text-[#9c9284]/60 italic pl-1">No bookmarks added yet. Create them while reading!</p>
              ) : (
                <div className="space-y-2 max-h-24 overflow-y-auto pr-2">
                  {bookBookmarks.map(b => (
                    <div key={b.id} className="p-2.5 bg-[#1a1612] border border-[#2c241d]/50 rounded-xl text-[11px] flex justify-between gap-4">
                      <div className="min-w-0">
                        <span className="font-bold text-[#dcae1d]">{b.chapterTitle}:</span>
                        <span className="text-[#9c9284] ml-1.5 font-serif">"{b.note}"</span>
                      </div>
                      <span className="text-[9px] text-[#5c544a] whitespace-nowrap">{new Date(b.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews list */}
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#9c9284] mb-2 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Reader Reviews ({bookReviews.length})
              </h4>
              {bookReviews.length === 0 ? (
                <p className="text-xs text-[#9c9284]/60 italic pl-1">No reviews written yet. Be the first to share your rating!</p>
              ) : (
                <div className="space-y-3 max-h-36 overflow-y-auto pr-2">
                  {bookReviews.map(r => (
                    <div key={r.id} className="p-3 bg-[#1e1915] border border-[#2c241d] rounded-xl flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-[#f2efe9]">{r.username}</span>
                          <span className="text-[10px] text-[#9c9284] flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" /> {r.locationName}
                          </span>
                        </div>
                        <div className="flex items-center text-[#dcae1d]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-2.5 h-2.5 ${i < r.score ? 'fill-[#dcae1d]' : 'text-transparent'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] font-medium text-serif text-[#f2efe9]">"{r.title}"</p>
                      <p className="text-[11px] text-[#9c9284] leading-relaxed line-clamp-3">
                        {r.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </motion.div>
    </div>
  );
}
