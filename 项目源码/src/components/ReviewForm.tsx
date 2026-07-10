import React, { useState } from 'react';
import { Book, Review } from '../types';
import { COUNTRIES_GEO_MAP } from '../mockData';
import { Star, MapPin, Globe, Sparkles, MessageSquare, Shield, X, Map } from 'lucide-react';
import { motion } from 'motion/react';

interface ReviewFormProps {
  book: Book;
  onClose: () => void;
  onSubmit: (reviewData: {
    title: string;
    content: string;
    score: number;
    locationName: string;
    latitude: number;
    longitude: number;
    visibility: 'private' | 'public';
  }) => void;
}

export default function ReviewForm({ book, onClose, onSubmit }: ReviewFormProps) {
  const [score, setScore] = useState<number>(5);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  
  // High-fidelity location dropdown states
  const [selectedCountryName, setSelectedCountryName] = useState<string>('China');
  const [cityInput, setCityInput] = useState<string>('');
  
  const [visibility, setVisibility] = useState<'private' | 'public'>('public');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const availableCountries = Object.keys(COUNTRIES_GEO_MAP);

  // Use Gemini API on the server to auto-write a gorgeous review and suggest geographic coordinates!
  const handleAiAssist = async () => {
    setIsAiGenerating(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/gemini/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          userThoughts: content || 'It is an absolute masterpiece of its genre.',
          score: score
        })
      });

      if (!response.ok) {
        throw new Error('Server returned error from Gemini review proxy');
      }

      const data = await response.json();
      setTitle(data.title || 'Reflections on ' + book.title);
      setContent(data.content || content);
      
      // Auto assign suggested country from AI if match found
      if (data.locationName) {
        const parts = data.locationName.split(',');
        const parsedCountry = (parts[parts.length - 1] || '').trim();
        const match = availableCountries.find(c => c.toLowerCase() === parsedCountry.toLowerCase());
        if (match) {
          setSelectedCountryName(match);
          if (parts.length > 1) {
            setCityInput(parts[0].trim());
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('AI generation unavailable. Standard polished content pre-filled.');
      setTitle(`Reflections on ${book.title}`);
      setContent(`A truly profound work by ${book.author}. The writing is sublime, capturing the core essence of its themes. Reading this book was like undergoing a literary voyage across cultures. Strongly recommended.`);
      setSelectedCountryName(book.country || 'China');
      setCityInput('Capital City');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Please populate all fields (Review title and thoughts).');
      return;
    }

    // Lookup base coordinates from mapping registry
    const baseGeo = COUNTRIES_GEO_MAP[selectedCountryName];
    if (!baseGeo) {
      setErrorMsg('Invalid region selected.');
      return;
    }

    // Add visual jitter offset so multiple reviews in the same country do not overlay directly
    const jitterLat = baseGeo.lat + (Math.random() * 0.8 - 0.4);
    const jitterLng = baseGeo.lng + (Math.random() * 0.8 - 0.4);

    const fullLocationName = cityInput.trim() 
      ? `${cityInput.trim()}, ${selectedCountryName}`
      : selectedCountryName;

    onSubmit({
      title,
      content,
      score,
      locationName: fullLocationName,
      latitude: jitterLat,
      longitude: jitterLng,
      visibility
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-[#14110e] border border-[#2c241d] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#2c241d] flex items-center justify-between bg-[#1a1612]">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#dcae1d]">Review Generator</span>
            <h3 className="text-base font-bold text-serif text-[#f2efe9]">
              Reflect & Map review for "{book.title}"
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#2c241d] rounded-lg text-[#9c9284] hover:text-[#f2efe9] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Star Selection */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-mono text-[#9c9284] uppercase tracking-wider">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setScore(star)}
                  className="p-1 text-[#dcae1d] hover:scale-110 transition-all cursor-pointer bg-transparent border-none"
                >
                  <Star className={`w-5 h-5 ${star <= score ? 'fill-[#dcae1d]' : 'text-[#2c241d]'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* User Thoughts Draft */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono text-[#9c9284] uppercase tracking-wider">Your Thoughts / Notes</label>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What are your impressions, personal reviews, or reading notes for this book?"
              className="w-full min-h-[120px] text-xs p-3 bg-[#1c1713] border border-[#2c241d] rounded-xl focus:outline-none focus:border-[#dcae1d] text-[#f2efe9] leading-relaxed resize-none"
            />
          </div>

          {/* Title and Geographic Mapping Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Title */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-mono text-[#9c9284] uppercase tracking-wider">Review Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., A Masterpiece"
                className="w-full text-xs p-3 bg-[#1c1713] border border-[#2c241d] rounded-xl focus:outline-none focus:border-[#dcae1d] text-[#f2efe9]"
              />
            </div>

            {/* Region Selector (Dropdown) */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-mono text-[#9c9284] uppercase tracking-wider flex items-center gap-1">
                <Map className="w-3.5 h-3.5 text-[#dcae1d]" /> Choose Region
              </label>
              <select
                value={selectedCountryName}
                onChange={(e) => setSelectedCountryName(e.target.value)}
                className="w-full text-xs p-3 bg-[#1c1713] border border-[#2c241d] rounded-xl focus:outline-none focus:border-[#dcae1d] text-[#f2efe9] cursor-pointer"
              >
                {availableCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* City input */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-mono text-[#9c9284] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#dcae1d]" /> Specific City
              </label>
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="E.g., London / Shanghai"
                className="w-full text-xs p-3 bg-[#1c1713] border border-[#2c241d] rounded-xl focus:outline-none focus:border-[#dcae1d] text-[#f2efe9]"
              />
            </div>
          </div>

          {/* Visibility Controls */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-mono text-[#9c9284] uppercase tracking-wider">Visible to Community</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`p-3 rounded-xl border text-left flex gap-3 cursor-pointer transition-all ${
                  visibility === 'public'
                    ? 'border-[#dcae1d] bg-[#dcae1d]/5 text-[#f2efe9]'
                    : 'border-[#2c241d] bg-transparent text-[#9c9284] hover:text-[#f2efe9]'
                }`}
              >
                <Globe className="w-5 h-5 text-[#dcae1d]" />
                <div>
                  <h4 className="text-xs font-semibold">Public Review</h4>
                  <p className="text-[10px] opacity-75 mt-0.5">Plot this review to the world map and share thoughts on Community Square.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`p-3 rounded-xl border text-left flex gap-3 cursor-pointer transition-all ${
                  visibility === 'private'
                    ? 'border-[#dcae1d] bg-[#dcae1d]/5 text-[#f2efe9]'
                    : 'border-[#2c241d] bg-transparent text-[#9c9284] hover:text-[#f2efe9]'
                }`}
              >
                <Shield className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="text-xs font-semibold">Private Note</h4>
                  <p className="text-[10px] opacity-75 mt-0.5">Keep this review private on your virtual desk. Not visible to others.</p>
                </div>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs text-amber-500 font-medium py-1 px-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              {errorMsg}
            </div>
          )}

          {/* Footer actions */}
          <div className="border-t border-[#2c241d] pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent text-[#9c9284] hover:text-[#f2efe9] text-xs font-semibold rounded-xl border border-[#2c241d] hover:bg-[#1a1612] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#dcae1d] hover:bg-[#bda018] text-[#12100e] text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Publish & Map Review
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
