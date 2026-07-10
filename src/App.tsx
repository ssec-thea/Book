import React, { useState, useEffect, useRef } from 'react';
import { Book, Review, Bookmark, MapMode } from './types';
import { INITIAL_BOOKS, INITIAL_REVIEWS, INITIAL_BOOKMARKS } from './mockData';
import WorldMap from './components/WorldMap';
import BookShelf3D from './components/BookShelf3D';
import BookReader from './components/BookReader';
import BookDetailModal from './components/BookDetailModal';
import ReviewForm from './components/ReviewForm';
import ImportBookForm from './components/ImportBookForm';
import CommunitySquare from './components/CommunitySquare';
import UserProfileDashboard from './components/UserProfileDashboard';
import { Library, Map, Users, User, Plus, Compass, Sparkles, LogOut, LogIn, ChevronRight, Check, Key, Mail, Edit3, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabType = 'shelf' | 'map' | 'public' | 'profile';

const PRESET_AVATARS = [
  { name: 'Sienna Sage', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop' },
  { name: 'Elias Slate', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop' },
  { name: 'Aria Ochre', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' },
  { name: 'Julian Amber', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop' },
  { name: 'Luna Indigo', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('map'); // Set Map as default to showcase the beautiful map immediately
  
  // App core persistent states
  const [books, setBooks] = useState<Book[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  
  // Current user state (dynamic login)
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(true); // Start as logged out so they see the form
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  // Registration Form States
  const [regUsername, setRegUsername] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regBio, setRegBio] = useState<string>('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(PRESET_AVATARS[0].url);
  const [regPassword, setRegPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const avatarUploadRef = useRef<HTMLInputElement>(null);

  const handleOnboardingAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelectedAvatarUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Navigation / Modal triggers
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);

  // Filter book reference for the map setting plotting
  const [mapActiveBookFilter, setMapActiveBookFilter] = useState<string | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedBooks = localStorage.getItem('bv_books');
    const savedReviews = localStorage.getItem('bv_reviews');
    const savedBookmarks = localStorage.getItem('bv_bookmarks');
    const savedUser = localStorage.getItem('bv_currentUser');

    if (savedBooks) {
      setBooks(JSON.parse(savedBooks));
    } else {
      setBooks(INITIAL_BOOKS);
      localStorage.setItem('bv_books', JSON.stringify(INITIAL_BOOKS));
    }

    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      setReviews(INITIAL_REVIEWS);
      localStorage.setItem('bv_reviews', JSON.stringify(INITIAL_REVIEWS));
    }

    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    } else {
      setBookmarks(INITIAL_BOOKMARKS);
      localStorage.setItem('bv_bookmarks', JSON.stringify(INITIAL_BOOKMARKS));
    }

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedOut(false);
    } else {
      // Setup default guest profile so they can login immediately
      const defaultUser = {
        username: '书旅行者 (Voyager)',
        email: 'voyager@bookvoyage.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
        bio: '爱读书，也爱丈量世界的旅行者。Believe that reading is a voyage across space and time.'
      };
      setCurrentUser(defaultUser);
      localStorage.setItem('bv_currentUser', JSON.stringify(defaultUser));
      setIsLoggedOut(true); // default to true so they see login first
    }
  }, []);

  // Save states helper
  const saveBooksState = (newBooks: Book[]) => {
    setBooks(newBooks);
    localStorage.setItem('bv_books', JSON.stringify(newBooks));
  };

  const saveReviewsState = (newReviews: Review[]) => {
    setReviews(newReviews);
    localStorage.setItem('bv_reviews', JSON.stringify(newReviews));
  };

  const saveBookmarksState = (newBookmarks: Bookmark[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem('bv_bookmarks', JSON.stringify(newBookmarks));
  };

  // Handle Book Import with smart chapter splitting
  const handleImportBook = (bookData: {
    title: string;
    author: string;
    country: string;
    category: string;
    summary?: string;
    content?: string;
    cover?: string;
    fileType: 'txt' | 'epub' | 'pdf';
  }) => {
    const rawContent = bookData.content || 'Start reading and enjoy the book voyage!';
    
    // Smart Chapter Chunker
    const chapters: { title: string; content: string }[] = [];
    
    // Regular expression to match chapter-like lines (e.g. Chapter 1, 第一章, 第1章, Section 1, etc.)
    const chapterRegex = /(?:^|\r?\n)(Chapter\s+\d+|第[一二三四五六七八九十百千\d]+章|第\s*\d+\s*章|Section\s+\d+|[\d+]\s+[^:\r\n]{3,20})(?:[.:\r\n]|$)/gi;
    
    let match;
    const matches: { index: number; title: string }[] = [];
    
    while ((match = chapterRegex.exec(rawContent)) !== null) {
      matches.push({
        index: match.index,
        title: match[1].trim()
      });
    }
    
    if (matches.length > 0) {
      // Split by detected chapters
      for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index;
        const end = i < matches.length - 1 ? matches[i+1].index : rawContent.length;
        const chapterTitle = matches[i].title;
        let chapterContent = rawContent.substring(start, end).trim();
        chapters.push({
          title: chapterTitle,
          content: chapterContent || 'Enjoy reading this chapter!'
        });
      }
    } else {
      // Fallback: Split by word count/character count blocks of ~3000 characters
      const chunkSize = 3000;
      let currentIndex = 0;
      let chapterNum = 1;
      while (currentIndex < rawContent.length) {
        let end = currentIndex + chunkSize;
        if (end < rawContent.length) {
          // Find next paragraph or newline so we don't cut in the middle of a sentence
          const nextNewline = rawContent.indexOf('\n', end);
          if (nextNewline !== -1 && nextNewline < end + 500) {
            end = nextNewline + 1;
          }
        } else {
          end = rawContent.length;
        }
        const chunk = rawContent.substring(currentIndex, end).trim();
        if (chunk) {
          chapters.push({
            title: `Chapter ${chapterNum}: Segment ${chapterNum}`,
            content: chunk
          });
        }
        currentIndex = end;
        chapterNum++;
      }
    }

    // Fallback if no chapters created
    if (chapters.length === 0) {
      chapters.push({
        title: 'Chapter 1: The Voyage Begins',
        content: rawContent
      });
    }

    const newBook: Book = {
      id: `book_${Date.now()}`,
      userId: currentUser?.username || 'user_1',
      title: bookData.title,
      author: bookData.author,
      country: bookData.country,
      category: bookData.category || 'Literature',
      visibility: 'public',
      totalPages: chapters.length * 10, // 10 pages per chapter segment
      currentPage: 0,
      progress: 0,
      readTime: 0,
      fileType: bookData.fileType,
      cover: bookData.cover || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=300&auto=format&fit=crop', // default cozy book texture
      content: rawContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chapters: chapters
    };

    const updated = [newBook, ...books];
    saveBooksState(updated);
    setIsImportOpen(false);
    setActiveTab('shelf');
  };

  // Handle Book Deletion
  const handleDeleteBook = (bookId: string) => {
    const updated = books.filter(b => b.id !== bookId);
    saveBooksState(updated);
    // clean up associated reviews & bookmarks
    saveReviewsState(reviews.filter(r => r.bookId !== bookId));
    saveBookmarksState(bookmarks.filter(b => b.bookId !== bookId));
    setSelectedBook(null);
  };

  // Handle Moving Book to another Category/Shelf
  const handleMoveBookToCategory = (bookId: string, newCategory: string) => {
    const updated = books.map(b => {
      if (b.id === bookId) {
        return {
          ...b,
          category: newCategory,
          updatedAt: new Date().toISOString()
        };
      }
      return b;
    });
    saveBooksState(updated);
  };

  // Handle publishing a Review
  const handlePublishReview = (reviewData: {
    title: string;
    content: string;
    score: number;
    locationName: string;
    latitude: number;
    longitude: number;
    visibility: 'private' | 'public';
  }) => {
    if (!selectedBook) return;

    const newReview: Review = {
      id: `review_${Date.now()}`,
      userId: currentUser?.username || 'user_1',
      username: currentUser?.username || '书旅行者 (Voyager)',
      userAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      bookAuthor: selectedBook.author,
      title: reviewData.title,
      content: reviewData.content,
      score: reviewData.score,
      locationName: reviewData.locationName,
      latitude: reviewData.latitude,
      longitude: reviewData.longitude,
      visibility: reviewData.visibility,
      createdAt: new Date().toISOString()
    };

    const updatedReviews = [newReview, ...reviews];
    saveReviewsState(updatedReviews);
    setIsReviewOpen(false);
  };

  // Save reader states on closing reader
  const handleCloseReader = (sessionSeconds: number, currentProgress: number, currentPageNum: number) => {
    if (!readingBook) return;

    const updatedBooks = books.map(b => {
      if (b.id === readingBook.id) {
        return {
          ...b,
          progress: currentProgress,
          currentPage: currentPageNum,
          readTime: (b.readTime || 0) + sessionSeconds,
          lastReadTime: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      return b;
    });

    saveBooksState(updatedBooks);
    setReadingBook(null);
  };

  // Handle Bookmark additions
  const handleAddBookmark = (position: number, chapterTitle: string, note: string, textSnippet: string) => {
    if (!readingBook) return;

    const newBookmark: Bookmark = {
      id: `bookmark_${Date.now()}`,
      bookId: readingBook.id,
      userId: currentUser?.username || 'user_1',
      position,
      chapterTitle,
      note,
      textSnippet,
      createdAt: new Date().toISOString()
    };

    saveBookmarksState([...bookmarks, newBookmark]);
  };

  const handleDeleteBookmark = (id: string) => {
    saveBookmarksState(bookmarks.filter(b => b.id !== id));
  };

  // Highlight and focus plot content settings on the map
  const handlePlotStoryPlots = async (book: Book) => {
    setMapActiveBookFilter(book.id);
    setSelectedBook(null);
    setActiveTab('map');
  };

  // User Sign In / Register handlers
  const handleGuestLogin = () => {
    const guestUser = {
      username: '书旅行者 (Voyager)',
      email: 'voyager@bookvoyage.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
      bio: '爱读书，也爱丈量世界的旅行者。Believe that reading is a voyage across space and time.'
    };
    setCurrentUser(guestUser);
    localStorage.setItem('bv_currentUser', JSON.stringify(guestUser));
    setIsLoggedOut(false);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim() || !regEmail.trim()) {
      setAuthError('Username and Email are required.');
      return;
    }

    const newUser = {
      username: regUsername.trim(),
      email: regEmail.trim(),
      avatar: selectedAvatarUrl,
      bio: regBio.trim() || 'A passionate global explorer navigating world literatures.'
    };

    setCurrentUser(newUser);
    localStorage.setItem('bv_currentUser', JSON.stringify(newUser));
    setAuthError('');
    setIsLoggedOut(false);
  };

  const handleLogoutAction = () => {
    setIsLoggedOut(true);
    setAuthTab('login');
  };

  return (
    <div className="min-h-screen bg-[#0e0c0a] text-[#f2efe9] font-sans flex flex-col selection:bg-[#dcae1d]/30 selection:text-[#dcae1d]">
      
      {/* Simulation/App header */}
      <header className="border-b border-[#2c241d] bg-[#14110e]/60 backdrop-blur-md sticky top-0 z-30 px-4 py-3 md:px-6 md:py-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo brand styling matching the screenshot "Marginalia" branding */}
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold font-serif tracking-tight text-[#f2efe9] hover:text-[#dcae1d] transition-colors cursor-pointer">
              Marginalia <span className="font-sans font-normal text-xs text-[#9c9284] ml-2">/ 书旅</span>
            </h1>
            <p className="text-[10px] text-[#9c9284] italic hidden sm:block">
              Margins are where thinking happens
            </p>
          </div>
        </div>

        {/* Central tab navigation bar */}
        {!isLoggedOut && (
          <nav className="flex w-full sm:w-auto items-center bg-[#1c1713] p-1 border border-[#2c241d] rounded-xl order-3 sm:order-none justify-between">
            <button
              onClick={() => setActiveTab('shelf')}
              className={`flex-1 sm:flex-initial py-2 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'shelf'
                  ? 'bg-[#dcae1d] text-[#12100e] shadow-md'
                  : 'text-[#9c9284] hover:text-[#f2efe9]'
              }`}
            >
              <Library className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Shelf</span>
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 sm:flex-initial py-2 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-[#dcae1d] text-[#12100e] shadow-md'
                  : 'text-[#9c9284] hover:text-[#f2efe9]'
              }`}
            >
              <Map className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Global Map</span>
            </button>
            <button
              onClick={() => setActiveTab('public')}
              className={`flex-1 sm:flex-initial py-2 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'public'
                  ? 'bg-[#dcae1d] text-[#12100e] shadow-md'
                  : 'text-[#9c9284] hover:text-[#f2efe9]'
              }`}
            >
              <Compass className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Library Square</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 sm:flex-initial py-2 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#dcae1d] text-[#12100e] shadow-md'
                  : 'text-[#9c9284] hover:text-[#f2efe9]'
              }`}
            >
              <User className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Reading Desk</span>
            </button>
          </nav>
        )}

        {/* Global Action Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!isLoggedOut && (
            <>
              <button
                onClick={() => setIsImportOpen(true)}
                className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-[#dcae1d]/10 text-[#dcae1d] border border-[#dcae1d]/30 hover:border-[#dcae1d]/80 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Import Book
              </button>
              
              <button
                onClick={handleLogoutAction}
                className="p-1.5 sm:p-2 text-[#9c9284] hover:text-red-400 transition-colors"
                title="Log Out / Lock Vault"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-20">
        
        {isLoggedOut ? (
          /* High-Fidelity Dynamic Sign-In & Multi-Tab Registration Interface */
          <div className="max-w-md mx-auto my-12 p-8 bg-[#14110e] border border-[#2c241d] rounded-2xl shadow-2xl relative">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#dcae1d]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center space-y-2 mb-6">
              <Sparkles className="w-9 h-9 text-[#dcae1d] mx-auto animate-pulse" />
              <h2 className="text-xl font-bold text-serif text-[#f2efe9]">Unlock Your Reading Log</h2>
              <p className="text-xs text-[#9c9284]">Access your mapped global footprints, digital shelves, and community notes.</p>
            </div>

            {/* Switch Tabs */}
            <div className="grid grid-cols-2 gap-1 bg-[#1c1713] p-1 border border-[#2c241d] rounded-xl mb-6">
              <button
                onClick={() => { setAuthTab('login'); setAuthError(''); }}
                className={`py-2 text-xs font-bold font-mono tracking-wider uppercase rounded-lg transition-all ${
                  authTab === 'login'
                    ? 'bg-[#dcae1d] text-[#12100e]'
                    : 'text-[#9c9284] hover:text-[#f2efe9]'
                }`}
              >
                SIGN IN
              </button>
              <button
                onClick={() => { setAuthTab('register'); setAuthError(''); }}
                className={`py-2 text-xs font-bold font-mono tracking-wider uppercase rounded-lg transition-all ${
                  authTab === 'register'
                    ? 'bg-[#dcae1d] text-[#12100e]'
                    : 'text-[#9c9284] hover:text-[#f2efe9]'
                }`}
              >
                CREATE ACCOUNT
              </button>
            </div>

            {authTab === 'login' ? (
              /* Sign In Panel */
              <div className="space-y-5">
                <div className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#9c9284] flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#dcae1d]" /> Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue="voyager@bookvoyage.com"
                      className="w-full text-xs p-3 bg-[#1c1713] border border-[#2c241d] rounded-xl focus:outline-none focus:border-[#dcae1d] text-[#f2efe9]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#9c9284] flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-[#dcae1d]" /> Password
                    </label>
                    <input
                      type="password"
                      defaultValue="guestpass123"
                      className="w-full text-xs p-3 bg-[#1c1713] border border-[#2c241d] rounded-xl focus:outline-none focus:border-[#dcae1d] text-[#f2efe9]"
                    />
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    onClick={() => setIsLoggedOut(false)}
                    className="w-full bg-[#dcae1d] hover:bg-[#bda018] text-[#12100e] text-xs font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    Log In & Resume Voyage <ChevronRight className="w-4 h-4" />
                  </button>
                  
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-[#2c241d]"></div>
                    <span className="flex-shrink mx-3 text-[9px] font-mono text-[#5c544a] uppercase tracking-widest">or quick launch</span>
                    <div className="flex-grow border-t border-[#2c241d]"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="w-full py-2.5 bg-[#1c1713] hover:bg-[#2c241d] text-xs font-semibold text-[#9c9284] hover:text-[#f2efe9] rounded-xl transition-all border border-[#2c241d]"
                  >
                    Bypass / Sign In with Guest Profile
                  </button>
                </div>
              </div>
            ) : (
              /* High-Fidelity Creation/Registration Form */
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-3 text-left">
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#9c9284] flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#dcae1d]" /> Custom Username
                    </label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="E.g., LiteraryWanderer"
                      className="w-full text-xs p-2.5 bg-[#1c1713] border border-[#2c241d] rounded-xl focus:outline-none focus:border-[#dcae1d] text-[#f2efe9]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#9c9284] flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#dcae1d]" /> Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="wanderer@voyager.com"
                      className="w-full text-xs p-2.5 bg-[#1c1713] border border-[#2c241d] rounded-xl focus:outline-none focus:border-[#dcae1d] text-[#f2efe9]"
                    />
                  </div>

                  {/* Character Avatar Picker */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#9c9284] flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-[#dcae1d]" /> Choose Avatar
                    </label>
                    <div className="grid grid-cols-5 gap-2 mb-2">
                      {PRESET_AVATARS.map((avatar) => {
                        const isSel = selectedAvatarUrl === avatar.url;
                        return (
                          <button
                            key={avatar.name}
                            type="button"
                            onClick={() => setSelectedAvatarUrl(avatar.url)}
                            className={`w-12 h-12 rounded-full overflow-hidden border relative flex-shrink-0 transition-all ${
                              isSel ? 'border-[#dcae1d] ring-2 ring-[#dcae1d]/45' : 'border-[#2c241d] grayscale opacity-75'
                            }`}
                          >
                            <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                            {isSel && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Check className="w-4 h-4 text-[#dcae1d]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="space-y-1 flex gap-2">
                      <input
                        type="text"
                        value={selectedAvatarUrl}
                        onChange={(e) => setSelectedAvatarUrl(e.target.value)}
                        placeholder="Or paste custom avatar URL..."
                        className="flex-1 text-xs p-2.5 bg-[#1c1713] border border-[#2c241d] rounded-xl focus:outline-none focus:border-[#dcae1d] text-[#f2efe9]"
                      />
                      <input
                        ref={avatarUploadRef}
                        type="file"
                        accept="image/*"
                        onChange={handleOnboardingAvatarUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => avatarUploadRef.current?.click()}
                        className="px-3 py-2 bg-[#2c241d] hover:bg-[#3c342d] text-xs font-semibold text-[#f2efe9] rounded-xl transition-all border border-[#3c342d] cursor-pointer whitespace-nowrap"
                      >
                        Upload Local
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#9c9284] flex items-center gap-1">
                      <Edit3 className="w-3.5 h-3.5 text-[#dcae1d]" /> Custom Biography / Intro
                    </label>
                    <textarea
                      value={regBio}
                      onChange={(e) => setRegBio(e.target.value)}
                      placeholder="E.g., Bibliophile charting the maps of classic fiction..."
                      className="w-full text-xs p-2.5 bg-[#1c1713] border border-[#2c241d] rounded-xl focus:outline-none focus:border-[#dcae1d] text-[#f2efe9] h-14 resize-none leading-relaxed"
                    />
                  </div>

                </div>

                {authError && (
                  <p className="text-xs text-amber-500 font-mono text-center">{authError}</p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#dcae1d] hover:bg-[#bda018] text-[#12100e] text-xs font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Create Account & Log In <Check className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

          </div>
        ) : (
          /* Main active panel views */
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              
              {activeTab === 'shelf' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <div>
                      <h2 className="text-lg font-bold text-serif text-[#f2efe9]">Your Digital Bookshelf</h2>
                      <p className="text-xs text-[#9c9284] mt-0.5">3D physical-styled display of books categorized by literary genre.</p>
                    </div>
                  </div>
                  <BookShelf3D
                    books={books}
                    onBookClick={(book) => setSelectedBook(book)}
                    onMoveBook={handleMoveBookToCategory}
                    onDeleteBook={handleDeleteBook}
                  />
                </div>
              )}

              {activeTab === 'map' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <div>
                      <h2 className="text-lg font-bold text-serif text-[#f2efe9]">Reading Footprint Map</h2>
                      <p className="text-xs text-[#9c9284] mt-0.5">Explore geographic settings, author roots, and community reading hubs worldwide.</p>
                    </div>
                    
                    {mapActiveBookFilter && (
                      <button
                        onClick={() => setMapActiveBookFilter(null)}
                        className="text-xs text-[#dcae1d] hover:underline flex items-center gap-1 border border-[#dcae1d]/20 px-2 py-1 rounded bg-[#dcae1d]/5 font-mono cursor-pointer"
                      >
                        Reset book filter <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <WorldMap
                    books={books}
                    reviews={reviews}
                    activeBookId={mapActiveBookFilter}
                    onBookClick={(book) => setSelectedBook(book)}
                  />
                </div>
              )}

              {activeTab === 'public' && (
                <CommunitySquare
                  books={books}
                  reviews={reviews}
                  onBookClick={(book) => setSelectedBook(book)}
                />
              )}

              {activeTab === 'profile' && (
                <UserProfileDashboard
                  books={books}
                  reviews={reviews}
                  currentUser={currentUser}
                  onUpdateUser={(updatedUser) => {
                    setCurrentUser(updatedUser);
                    localStorage.setItem('bv_currentUser', JSON.stringify(updatedUser));
                  }}
                />
              )}

            </motion.div>
          </AnimatePresence>
        )}

      </main>

      {/* Floating detail panels and reader modal triggers */}
      <AnimatePresence>
        {selectedBook && (
          <BookDetailModal
            book={selectedBook}
            reviews={reviews}
            bookmarks={bookmarks}
            onClose={() => setSelectedBook(null)}
            onRead={() => {
              setReadingBook(selectedBook);
              setSelectedBook(null);
            }}
            onWriteReview={() => {
              setIsReviewOpen(true);
            }}
            onDeleteBook={() => handleDeleteBook(selectedBook.id)}
          />
        )}

        {readingBook && (
          <BookReader
            book={readingBook}
            bookmarks={bookmarks}
            onBack={handleCloseReader}
            onAddBookmark={handleAddBookmark}
            onDeleteBookmark={handleDeleteBookmark}
          />
        )}

        {isReviewOpen && selectedBook && (
          <ReviewForm
            book={selectedBook}
            onClose={() => setIsReviewOpen(false)}
            onSubmit={handlePublishReview}
          />
        )}

        {isImportOpen && (
          <ImportBookForm
            onClose={() => setIsImportOpen(false)}
            onImport={handleImportBook}
          />
        )}
      </AnimatePresence>

      {/* Footer credits */}
      <footer className="py-6 border-t border-[#1c1713] text-center text-[10px] text-[#5c544a] font-mono uppercase tracking-wider bg-[#0c0a08]">
        Marginalia Reading Geography © 2026 • Crafted for BookVoyage
      </footer>

    </div>
  );
}
