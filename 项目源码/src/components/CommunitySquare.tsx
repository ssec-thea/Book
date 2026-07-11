import React, { useState, useEffect } from 'react';
import { Book, Review } from '../types';
import { BookOpen, Star, MapPin, Search, Globe, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';

interface CommunitySquareProps {
  books: Book[];
  reviews: Review[];
  onBookClick: (book: Book) => void;
}

export default function CommunitySquare({ books, reviews, onBookClick }: CommunitySquareProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [publicBooks, setPublicBooks] = useState<Book[]>([]);
  const [publicReviews, setPublicReviews] = useState<Review[]>([]);

  // 独立加载公开内容（不受当前用户限制）
  useEffect(() => {
    const loadPublic = async () => {
      try {
        const [bRes, rRes] = await Promise.all([
          api.books.getPublic({ size: 100 }),
          api.reviews.list({ visibility: 1, size: 100 }),
        ]);
        if (bRes?.data?.list) setPublicBooks(bRes.data.list);
        if (rRes?.data?.list) setPublicReviews(rRes.data.list);
      } catch {
        // 回退：用 props 中的数据过滤
        setPublicBooks(books.filter(b => b.visibility === 'public'));
        setPublicReviews(reviews.filter(r => r.visibility === 'public'));
      }
    };
    loadPublic();
  }, [books, reviews]);

  const filteredBooks = publicBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || book.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredReviews = publicReviews.filter(review => {
    if (categoryFilter === 'All') return true;
    const matchedBook = books.find(b => b.id === review.bookId);
    return matchedBook && matchedBook.category === categoryFilter;
  });

  const categories = ['All', ...Array.from(new Set(publicBooks.map(b => b.category)))];

  return (
    <div className="w-full space-y-8 py-4">
      {/* Search and Filters Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#14110e] border border-[#2c241d] rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9c9284]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search public books by title, author, or setting..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-[#1c1713] border border-[#2c241d] rounded-xl focus:outline-none focus:border-[#dcae1d] text-[#f2efe9]"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                categoryFilter === cat
                  ? 'bg-[#dcae1d] text-[#12100e] font-semibold'
                  : 'bg-[#1c1713] text-[#9c9284] border border-[#2c241d] hover:text-[#f2efe9]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid split: Left Books list, Right Recent Global Reviews feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Books directory */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold tracking-wider font-mono text-[#9c9284] uppercase flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#dcae1d]" /> Shared Library Space
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBooks.map(book => {
              const bookRating = publicReviews.filter(r => r.bookId === book.id);
              const avgScore = bookRating.length > 0 
                ? (bookRating.reduce((acc, r) => acc + r.score, 0) / bookRating.length).toFixed(1)
                : 'No rating';

              return (
                <div
                  key={book.id}
                  onClick={() => onBookClick(book)}
                  className="p-4 bg-[#14110e]/60 border border-[#2c241d]/80 hover:border-[#dcae1d]/50 rounded-2xl cursor-pointer transition-all flex gap-4 group hover:bg-[#1a1612]/30"
                >
                  {book.cover ? (
                    <img src={book.cover} alt={book.title} className="w-16 h-22 object-cover rounded-xl border border-[#2c241d]" />
                  ) : (
                    <div className="w-16 h-22 bg-[#2c241d] rounded-xl flex items-center justify-center text-[10px] font-mono text-[#9c9284]">
                      Book Cover
                    </div>
                  )}

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-[#dcae1d]">
                        {book.country}
                      </span>
                      <h4 className="text-xs font-bold font-serif text-[#f2efe9] truncate group-hover:text-[#dcae1d] transition-all mt-0.5">
                        {book.title}
                      </h4>
                      <p className="text-[10px] text-[#9c9284] truncate mt-0.5">By {book.author}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#2c241d]/40 pt-2 mt-2">
                      <span className="text-[9px] font-mono text-[#9c9284]">{book.category}</span>
                      <span className="text-[9px] font-mono text-[#dcae1d] flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-[#dcae1d]" /> {avgScore}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredBooks.length === 0 && (
              <div className="col-span-full py-12 text-center text-xs text-[#9c9284] italic bg-[#14110e]/30 rounded-2xl border border-dashed border-[#2c241d]">
                No public books matching filter requirements found.
              </div>
            )}
          </div>
        </div>

        {/* Recent Reviews Feed */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wider font-mono text-[#9c9284] uppercase flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#dcae1d]" /> Live Reading Map Footprints
          </h3>

          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
            {filteredReviews.map(review => (
              <div
                key={review.id}
                className="p-4 bg-[#14110e] border border-[#2c241d] rounded-2xl flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#dcae1d]/20 text-[#dcae1d] rounded-full flex items-center justify-center text-xs font-mono font-bold">
                      {review.username.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#f2efe9]">{review.username}</h4>
                      <p className="text-[9px] text-[#9c9284] flex items-center gap-0.5 mt-0.5">
                        <MapPin className="w-2.5 h-2.5" /> {review.locationName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-[#dcae1d]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-2.5 h-2.5 ${i < review.score ? 'fill-[#dcae1d]' : 'text-transparent'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#2c241d]/50 pt-2">
                  <span className="text-[9px] font-mono text-[#dcae1d]">Reviewing: {review.bookTitle}</span>
                  <h5 className="text-xs font-semibold font-serif text-[#f2efe9] mt-1">"{review.title}"</h5>
                  <p className="text-xs text-[#9c9284] mt-1.5 leading-relaxed font-serif line-clamp-3">
                    "{review.content}"
                  </p>
                </div>
              </div>
            ))}

            {filteredReviews.length === 0 && (
              <div className="py-12 text-center text-xs text-[#9c9284] italic">
                No active global reviews recorded.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
