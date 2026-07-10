import React, { useState, useRef } from 'react';
import { Book, Review } from '../types';
import { MOCK_USER } from '../mockData';
import { BookOpen, Award, BarChart3, Clock, Calendar, CheckCircle, Mail, MapPin, Edit, Check, X } from 'lucide-react';
import { motion } from 'motion/react';

interface UserProfileDashboardProps {
  books: Book[];
  reviews: Review[];
  currentUser?: { username: string; email: string; avatar: string; bio: string } | null;
  onUpdateUser?: (updatedUser: any) => void;
}

export default function UserProfileDashboard({ books, reviews, currentUser, onUpdateUser }: UserProfileDashboardProps) {
  const user = currentUser || MOCK_USER;

  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(user.username);
  const [editBio, setEditBio] = useState(user.bio);
  const [editAvatar, setEditAvatar] = useState(user.avatar);

  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setEditAvatar(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        username: editUsername,
        bio: editBio,
        avatar: editAvatar
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditUsername(user.username);
    setEditBio(user.bio);
    setEditAvatar(user.avatar);
    setIsEditing(false);
  };

  // Compute some interesting stats
  const totalBooks = books.length;
  const completedBooks = books.filter(b => b.progress === 100).length;
  const totalReadTimeSeconds = books.reduce((acc, b) => acc + (b.readTime || 0), 0);
  const totalMinutes = Math.floor(totalReadTimeSeconds / 60);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Group books by categories for counts
  const categoryDistribution = React.useMemo(() => {
    const counts: { [cat: string]: number } = {};
    books.forEach(b => {
      counts[b.category] = (counts[b.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [books]);

  // Generate SVG bar coordinates for weekly reading habit chart (7 days)
  const readingHabitData = [
    { day: 'Mon', minutes: 15 },
    { day: 'Tue', minutes: 45 },
    { day: 'Wed', minutes: 30 },
    { day: 'Thu', minutes: 60 },
    { day: 'Fri', minutes: 20 },
    { day: 'Sat', minutes: 90 },
    { day: 'Sun', minutes: Math.max(Math.floor(totalMinutes % 120), 40) }
  ];

  const maxMinutes = Math.max(...readingHabitData.map(d => d.minutes), 100);

  return (
    <div className="w-full space-y-8 py-4">
      
      {/* Profile Card banner */}
      <div className="p-6 bg-[#14110e] border border-[#2c241d] rounded-2xl flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#dcae1d]/5 rounded-full blur-3xl pointer-events-none" />

        {isEditing ? (
          <div className="w-full space-y-4 z-10">
            <h3 className="text-sm font-semibold tracking-wider font-mono text-[#dcae1d] uppercase mb-2">Edit Your Reading Desk Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-[#9c9284] uppercase tracking-wider">Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full text-xs p-2.5 bg-[#1c1713] border border-[#2c241d] rounded-xl focus:outline-none focus:border-[#dcae1d] text-[#f2efe9]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-[#9c9284] uppercase tracking-wider">Avatar URL / Upload</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="Avatar URL..."
                    className="flex-1 text-xs p-2.5 bg-[#1c1713] border border-[#2c241d] rounded-xl focus:outline-none focus:border-[#dcae1d] text-[#f2efe9]"
                  />
                  <input
                    ref={avatarFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="px-3 py-2 bg-[#2c241d] hover:bg-[#3c342d] text-xs font-semibold text-[#f2efe9] rounded-xl transition-all border border-[#3c342d] cursor-pointer whitespace-nowrap"
                  >
                    Upload Local
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-[#9c9284] uppercase tracking-wider">Custom Biography / Intro</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#1c1713] border border-[#2c241d] rounded-xl focus:outline-none focus:border-[#dcae1d] text-[#f2efe9] h-16 resize-none leading-relaxed"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={handleCancel}
                className="px-3.5 py-1.5 bg-[#2c241d] hover:bg-[#3c342d] text-xs font-semibold text-[#9c9284] hover:text-[#f2efe9] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3.5 py-1.5 bg-[#dcae1d] hover:bg-[#bda018] text-[#12100e] text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* User avatar */}
            <div className="relative group">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#dcae1d]"
              />
              <button
                onClick={() => setIsEditing(true)}
                className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-xs text-[#dcae1d]"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2 z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-serif text-[#f2efe9]">{user.username}</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mx-auto md:mx-0 px-2.5 py-1 bg-[#1c1713] hover:bg-[#2c241d] border border-[#2c241d] rounded-lg text-[10px] font-mono uppercase tracking-wider text-[#9c9284] hover:text-[#f2efe9] transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Profile
                </button>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-xs text-[#9c9284]">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#dcae1d]" /> {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#dcae1d]" /> World Explorer
                </span>
              </div>

              <p className="text-xs text-[#9c9284] max-w-xl font-serif leading-relaxed italic pt-2">
                "{user.bio}"
              </p>
            </div>
          </>
        )}
      </div>

      {/* Numerical Stats Summary Card Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#14110e] border border-[#2c241d] rounded-2xl text-center">
          <BookOpen className="w-5 h-5 text-[#dcae1d] mx-auto mb-2" />
          <span className="text-[10px] font-mono text-[#9c9284] uppercase tracking-wider block">Total Mapped</span>
          <span className="text-xl font-bold font-mono text-[#f2efe9] mt-1 block">{totalBooks} books</span>
        </div>

        <div className="p-4 bg-[#14110e] border border-[#2c241d] rounded-2xl text-center">
          <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
          <span className="text-[10px] font-mono text-[#9c9284] uppercase tracking-wider block">Finished</span>
          <span className="text-xl font-bold font-mono text-[#f2efe9] mt-1 block">{completedBooks} books</span>
        </div>

        <div className="p-4 bg-[#14110e] border border-[#2c241d] rounded-2xl text-center">
          <Clock className="w-5 h-5 text-[#dcae1d] mx-auto mb-2" />
          <span className="text-[10px] font-mono text-[#9c9284] uppercase tracking-wider block">Reading Duration</span>
          <span className="text-xl font-bold font-mono text-[#f2efe9] mt-1 block">{totalHours} hrs</span>
        </div>

        <div className="p-4 bg-[#14110e] border border-[#2c241d] rounded-2xl text-center">
          <Award className="w-5 h-5 text-amber-500 mx-auto mb-2" />
          <span className="text-[10px] font-mono text-[#9c9284] uppercase tracking-wider block">Total Reviews</span>
          <span className="text-xl font-bold font-mono text-[#f2efe9] mt-1 block">{reviews.length} reviews</span>
        </div>
      </div>

      {/* Detailed charts container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Weekly reading habit chart */}
        <div className="p-5 bg-[#14110e] border border-[#2c241d] rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold tracking-wider font-mono text-[#9c9284] uppercase flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#dcae1d]" /> Weekly Reading Activity
            </h3>
            <span className="text-[10px] font-mono text-[#5c544a]">Minutes spent reading</span>
          </div>

          {/* SVG Custom Interactive Bar Chart */}
          <div className="flex-1 flex items-end justify-between h-48 pt-4 pb-2 px-2 border-b border-[#2c241d]">
            {readingHabitData.map((d, idx) => {
              const barHeightPercent = (d.minutes / maxMinutes) * 100;
              return (
                <div key={d.day} className="flex flex-col items-center justify-end h-full gap-2 group flex-1 relative">
                  
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-all bg-[#2c241d] text-[9px] font-mono px-1.5 py-0.5 rounded text-[#f2efe9] absolute -translate-y-36 z-10 pointer-events-none shadow-md">
                    {d.minutes}m
                  </div>

                  {/* Bar container of fixed height */}
                  <div className="w-6 h-32 bg-[#1c1713] rounded-t border border-[#2c241d] relative flex items-end overflow-hidden">
                    {/* Filled bar */}
                    <div 
                      className="w-full bg-[#2c241d] group-hover:bg-[#dcae1d] transition-all duration-500 relative"
                      style={{ height: `${Math.max(barHeightPercent, 4)}%` }}
                    >
                      <div className="absolute inset-x-0 top-0 h-1 bg-white/20" />
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[#9c9284] group-hover:text-[#f2efe9] transition-all">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="p-5 bg-[#14110e] border border-[#2c241d] rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold tracking-wider font-mono text-[#9c9284] uppercase flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#dcae1d]" /> Genre Diversity
            </h3>
            <span className="text-[10px] font-mono text-[#5c544a]">Counts by category</span>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
            {categoryDistribution.length === 0 ? (
              <p className="text-xs italic text-[#9c9284] py-8 text-center">No categories recorded.</p>
            ) : (
              categoryDistribution.map(([cat, count]) => {
                const percent = (count / totalBooks) * 100;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-serif text-[#f2efe9]">{cat}</span>
                      <span className="font-mono text-[#9c9284]">{count} {count === 1 ? 'book' : 'books'} ({percent.toFixed(0)}%)</span>
                    </div>

                    {/* Styled progress bar background */}
                    <div className="w-full h-1.5 bg-[#2c241d] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#dcae1d]/40 to-[#dcae1d] rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
