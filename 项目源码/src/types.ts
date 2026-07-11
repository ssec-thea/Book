export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
}

export interface Book {
  id: string;
  userId: string; // Owner
  title: string;
  author: string;
  country: string; // Author's nationality (e.g. "China", "United States")
  cover?: string;
  filePath?: string;
  fileUrl?: string;    // OSS 文件访问 URL
  fileType: 'epub' | 'txt' | 'pdf';
  category: string;
  visibility: 'private' | 'public';
  totalPages: number;
  currentPage: number;
  progress: number; // 0 to 100
  readTime: number; // in seconds
  lastReadTime?: string;
  summary?: string; // Optional book summary/description
  content?: string; // Content text for simple reading
  chapters?: Chapter[];
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  title: string;
  content: string;
}

export interface Bookmark {
  id: string;
  bookId: string;
  userId: string;
  position: number; // Character index or page number
  chapterTitle?: string;
  note: string;
  textSnippet: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  title: string;
  content: string;
  score: number; // 1-5
  longitude?: number;
  latitude?: number;
  locationName: string; // E.g., "Paris, France"
  visibility: 'private' | 'public';
  createdAt: string;
}

export type MapMode = 'author_origin' | 'content_location' | 'reader_anchor';
export type CommunitySubMode = 'same_book' | 'all_public';

export interface MapDataPoint {
  countryCode: string; // E.g., "CN", "US"
  countryName: string; // E.g., "China", "United States"
  count: number;
  books: Book[];
  reviews: Review[];
}
