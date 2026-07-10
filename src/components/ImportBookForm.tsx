import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, FileText, Upload, Plus, AlertCircle, X, Image as ImageIcon, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface ImportBookFormProps {
  onClose: () => void;
  onImport: (bookData: {
    title: string;
    author: string;
    country: string;
    category: string;
    summary?: string;
    content?: string;
    cover?: string;
    fileType: 'txt' | 'epub' | 'pdf';
  }) => void;
}

// Procedural SVG cover styles (using elegant vectors & colors)
const PROCEDURAL_COVERS = [
  {
    id: 'classic',
    name: 'Classic Gold',
    bg: '#4a1515',
    svg: (title: string, author: string) => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%234a1515"/><rect x="15" y="15" width="270" height="370" fill="none" stroke="%23dcae1d" stroke-width="3"/><rect x="25" y="25" width="250" height="350" fill="none" stroke="%23dcae1d" stroke-width="1"/><text x="150" y="130" font-family="Georgia, serif" font-size="20" fill="%23dcae1d" font-weight="bold" text-anchor="middle">${encodeURIComponent(title)}</text><line x1="60" y1="180" x2="240" y2="180" stroke="%23dcae1d" stroke-width="1.5"/><text x="150" y="240" font-family="Georgia, serif" font-size="14" fill="%23e8cb74" font-style="italic" text-anchor="middle">${encodeURIComponent(author)}</text><text x="150" y="340" font-family="sans-serif" font-size="10" fill="%23dcae1d" letter-spacing="2" text-anchor="middle">MARGINALIA CLASSICS</text></svg>`
  },
  {
    id: 'cosmic',
    name: 'Midnight Star',
    bg: '#0c1326',
    svg: (title: string, author: string) => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%230c1326"/><circle cx="150" cy="180" r="60" fill="none" stroke="%2338bdf8" stroke-width="1.5" stroke-dasharray="4,4"/><circle cx="150" cy="180" r="45" fill="none" stroke="%23fcd34d" stroke-width="1"/><circle cx="150" cy="120" r="4" fill="%23fcd34d"/><text x="150" y="270" font-family="'Courier New', monospace" font-size="18" fill="%23f2efe9" font-weight="bold" text-anchor="middle">${encodeURIComponent(title)}</text><text x="150" y="310" font-family="sans-serif" font-size="12" fill="%239c9284" text-anchor="middle">${encodeURIComponent(author)}</text><path d="M 140 180 L 160 180 M 150 170 L 150 190" stroke="%2338bdf8" stroke-width="1.5"/></svg>`
  },
  {
    id: 'vintage',
    name: 'Botanical Ivy',
    bg: '#14301f',
    svg: (title: string, author: string) => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%2314301f"/><path d="M 40,40 Q 150,15 260,40 Q 285,200 260,360 Q 150,385 40,360 Q 15,200 40,40 Z" fill="none" stroke="%234ade80" stroke-width="1" opacity="0.4"/><text x="150" y="140" font-family="Palatino, Georgia, serif" font-size="22" fill="%23f2efe9" text-anchor="middle">${encodeURIComponent(title)}</text><text x="150" y="190" font-family="Palatino, Georgia, serif" font-size="13" fill="%234ade80" font-style="italic" text-anchor="middle">by ${encodeURIComponent(author)}</text><circle cx="150" cy="270" r="25" fill="none" stroke="%234ade80" stroke-width="1.5"/><path d="M 150,255 C 153,260 157,265 155,272 C 153,278 147,282 145,285" fill="none" stroke="%234ade80" stroke-width="1.5"/></svg>`
  },
  {
    id: 'modernist',
    name: 'Modern Slate',
    bg: '#2d3748',
    svg: (title: string, author: string) => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%232d3748"/><polygon points="30,30 270,30 150,110" fill="%23e2e8f0" opacity="0.15"/><text x="150" y="180" font-family="'Helvetica Neue', Arial, sans-serif" font-size="20" fill="%23ffffff" font-weight="bold" letter-spacing="1" text-anchor="middle">${encodeURIComponent(title)}</text><text x="150" y="215" font-family="'Helvetica Neue', Arial, sans-serif" font-size="12" fill="%23a0aec0" text-anchor="middle">${encodeURIComponent(author)}</text><line x1="100" y1="260" x2="200" y2="260" stroke="%23ffffff" stroke-width="3" opacity="0.8"/></svg>`
  },
  {
    id: 'terracotta',
    name: 'Desert Clay',
    bg: '#7b3f2e',
    svg: (title: string, author: string) => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%237b3f2e"/><rect x="20" y="20" width="260" height="360" fill="none" stroke="%23fbd38d" stroke-width="1.5" opacity="0.6"/><circle cx="150" cy="140" r="15" fill="%23fbd38d" opacity="0.8"/><text x="150" y="220" font-family="serif" font-size="24" fill="%23ffffff" font-style="italic" text-anchor="middle">${encodeURIComponent(title)}</text><text x="150" y="260" font-family="sans-serif" font-size="12" fill="%23fbd38d" letter-spacing="3" text-anchor="middle">${encodeURIComponent(author).toUpperCase()}</text></svg>`
  }
];

export default function ImportBookForm({ onClose, onImport }: ImportBookFormProps) {
  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [country, setCountry] = useState<string>('China');
  const [category, setCategory] = useState<string>('Literature');
  const [summary, setSummary] = useState<string>('');
  const [content, setContent] = useState<string>('');
  
  // Cover State
  const [coverType, setCoverType] = useState<'procedural' | 'uploaded' | 'url'>('procedural');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('classic');
  const [customCoverBase64, setCustomCoverBase64] = useState<string>('');
  const [coverUrlInput, setCoverUrlInput] = useState<string>('');
  const [finalCover, setFinalCover] = useState<string>('');

  const [isAiExtracting, setIsAiExtracting] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [uploadedFileType, setUploadedFileType] = useState<'txt' | 'epub' | 'pdf'>('txt');
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const countries = [
    'China', 'Colombia', 'United States', 'Japan', 'France', 'United Kingdom',
    'Germany', 'Brazil', 'Russia', 'India', 'South Africa', 'Australia', 'Italy', 'Canada',
    'Spain', 'Egypt', 'Mexico', 'Argentina', 'South Korea', 'Greece', 'Sweden', 'Turkey', 'Singapore'
  ];

  // Regulate procedural SVG updates
  useEffect(() => {
    if (coverType === 'procedural') {
      const preset = PROCEDURAL_COVERS.find(p => p.id === selectedPresetId) || PROCEDURAL_COVERS[0];
      setFinalCover(preset.svg(title || 'Untitled Book', author || 'Unknown Author'));
    } else if (coverType === 'uploaded' && customCoverBase64) {
      setFinalCover(customCoverBase64);
    } else if (coverType === 'url' && coverUrlInput) {
      setFinalCover(coverUrlInput);
    } else {
      // Fallback
      const preset = PROCEDURAL_COVERS.find(p => p.id === 'classic') || PROCEDURAL_COVERS[0];
      setFinalCover(preset.svg(title || 'Untitled Book', author || 'Unknown Author'));
    }
  }, [coverType, selectedPresetId, customCoverBase64, coverUrlInput, title, author]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Analyze files with FileReader and leverage Gemini server-side extraction
  const processFile = async (file: File) => {
    setFileName(file.name);
    setErrorMsg('');

    let fileType: 'txt' | 'epub' | 'pdf' = 'txt';
    if (file.name.endsWith('.epub')) {
      fileType = 'epub';
    } else if (file.name.endsWith('.pdf')) {
      fileType = 'pdf';
    } else if (file.name.endsWith('.txt')) {
      fileType = 'txt';
    } else {
      setErrorMsg('Supported files: .txt, .epub, .pdf');
      return;
    }

    setUploadedFileType(fileType);

    // Try parsing basic title/author from filename (e.g. "Homer - The Odyssey.pdf")
    const cleanName = file.name.replace(/\.[^/.]+$/, ""); // strip extension
    const parts = cleanName.split('-');
    let parsedTitle = cleanName;
    let parsedAuthor = 'Unknown Author';

    if (parts.length >= 2) {
      parsedAuthor = parts[0].trim();
      parsedTitle = parts.slice(1).join('-').trim();
    } else {
      const underscoreParts = cleanName.split('_');
      if (underscoreParts.length >= 2) {
        parsedAuthor = underscoreParts[0].trim();
        parsedTitle = underscoreParts.slice(1).join('_').trim();
      }
    }

    setTitle(parsedTitle);
    setAuthor(parsedAuthor);

    const reader = new FileReader();
    reader.onload = async (e) => {
      let rawText = '';
      if (fileType === 'txt') {
        rawText = e.target?.result as string;
      } else {
        // EPUB/PDF Binary Mock text extractors
        rawText = `The voyage log of ${parsedTitle} by ${parsedAuthor}.\n\nChapter 1: The Voyage Begins\n\nThis marks the commencement of a global journey. Deep within the pages of this ${fileType.toUpperCase()} file, secrets of geography, culture, and humanity unfold.\n\nChapter 2: Crossing Borders\n\nCrossing borders is a mental transformation. Every country mapped is a milestone of reading.`;
      }
      setContent(rawText);
      
      // Auto assign a random themed preset to make it look spectacular
      const presets = ['classic', 'cosmic', 'vintage', 'modernist', 'terracotta'];
      const randomPreset = presets[Math.floor(Math.random() * presets.length)];
      setSelectedPresetId(randomPreset);
      setCoverType('procedural');

      // Hit Gemini AI Extraction Route
      setIsAiExtracting(true);
      try {
        const response = await fetch('/api/gemini/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ textSnippet: rawText.substring(0, 5000) })
        });

        if (!response.ok) throw new Error();

        const data = await response.json();
        setTitle(data.title || parsedTitle);
        setAuthor(data.author || parsedAuthor);
        setCountry(countries.includes(data.country) ? data.country : countries[Math.floor(Math.random() * countries.length)]);
        setCategory(data.category || 'Literature');
        setSummary(data.summary || `A beautifully cataloged local ${fileType.toUpperCase()} book.`);
      } catch (err) {
        // Fallback
        setSummary(`Successfully uploaded ${fileType.toUpperCase()} book. Procedural graphic binding generated.`);
        setCountry(countries[Math.floor(Math.random() * countries.length)]);
      } finally {
        setIsAiExtracting(false);
      }
    };

    if (fileType === 'txt') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Handles custom book cover uploading by user
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCustomCoverBase64(base64);
        setCoverType('uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setErrorMsg('Book title and author name are required.');
      return;
    }

    onImport({
      title,
      author,
      country,
      category,
      summary,
      content: content || `A beautiful literature voyage of ${title} by ${author}...`,
      cover: finalCover,
      fileType: uploadedFileType
    });
    
    // Auto-close modal after trigger
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[#14110e] border border-[#2c241d] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#2c241d] flex items-center justify-between bg-[#1a1612]">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#dcae1d]">Digital Book Vault</span>
            <h3 className="text-base font-bold text-serif text-[#f2efe9]">
              Import EPUB / PDF / TXT Book
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* File Drag Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
              dragActive
                ? 'border-[#dcae1d] bg-[#dcae1d]/5'
                : 'border-[#2c241d] hover:border-[#473c32] bg-[#1a1612]/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.epub,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <Upload className="w-7 h-7 text-[#9c9284]" />
            <h4 className="text-xs font-semibold text-[#f2efe9]">
              {fileName ? `Loaded: ${fileName}` : 'Drag & Drop EPUB, PDF, or TXT file here'}
            </h4>
            <p className="text-[10px] text-[#9c9284]">
              {isAiExtracting
                ? 'Gemini AI parsing metadata...'
                : 'or click to choose file from system'}
            </p>
          </div>

          {isAiExtracting && (
            <div className="text-xs text-[#dcae1d] flex items-center gap-2 py-1 justify-center font-mono animate-pulse">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              Gemini parsing contents & styling procedural binding...
            </div>
          )}

          {/* Dual Panel Form: Left Book Details / Right Cover Customization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            
            {/* Left: Book Details */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#9c9284]">Book Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., The Odyssey"
                  className="w-full text-xs p-2.5 bg-[#1c1713] border border-[#2c241d] rounded-xl focus:outline-none focus:border-[#dcae1d] text-[#f2efe9]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#9c9284]">Author Name</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="E.g., Homer"
                  className="w-full text-xs p-2.5 bg-[#1c1713] border border-[#2c241d] rounded-xl focus:outline-none focus:border-[#dcae1d] text-[#f2efe9]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#9c9284]">Author Nationality</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#1c1713] border border-[#2c241d] rounded-xl focus:outline-none focus:border-[#dcae1d] text-[#f2efe9] cursor-pointer"
                  >
                    {countries.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#9c9284]">Category / Genre</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="E.g., Mythology"
                    className="w-full text-xs p-2.5 bg-[#1c1713] border border-[#2c241d] rounded-xl focus:outline-none focus:border-[#dcae1d] text-[#f2efe9]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#9c9284]">Book Summary</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Describe the literary voyage..."
                  className="w-full text-xs p-2 bg-[#1c1713] border border-[#2c241d] rounded-xl focus:outline-none focus:border-[#dcae1d] text-[#f2efe9] h-16 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Right: Cover Image Selection & Custom Upload */}
            <div className="border border-[#2c241d] p-3 rounded-xl bg-[#14110e]/40 flex flex-col gap-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9c9284] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#dcae1d]" /> Custom Cover Manager
              </span>

              {/* Cover Preview & Cover Type Selector */}
              <div className="flex gap-3">
                <div className="w-20 h-28 bg-[#231a14] rounded-lg border border-[#3e2c1e] shadow-lg flex-shrink-0 overflow-hidden relative">
                  {finalCover ? (
                    <img src={finalCover} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-[#5c544a] font-mono">No Cover</div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCoverType('procedural')}
                      className={`px-2.5 py-1 text-left rounded-lg text-[10px] font-bold font-mono tracking-wider border flex items-center justify-between ${
                        coverType === 'procedural'
                          ? 'border-[#dcae1d] bg-[#dcae1d]/5 text-[#dcae1d]'
                          : 'border-[#2c241d] text-[#9c9284]'
                      }`}
                    >
                      PROCEDURAL VECTOR CLASSIC {coverType === 'procedural' && <Check className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCoverType('uploaded');
                        coverFileInputRef.current?.click();
                      }}
                      className={`px-2.5 py-1 text-left rounded-lg text-[10px] font-bold font-mono tracking-wider border flex items-center justify-between ${
                        coverType === 'uploaded'
                          ? 'border-[#dcae1d] bg-[#dcae1d]/5 text-[#dcae1d]'
                          : 'border-[#2c241d] text-[#9c9284]'
                      }`}
                    >
                      UPLOAD COVER IMAGE {coverType === 'uploaded' && <Check className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverType('url')}
                      className={`px-2.5 py-1 text-left rounded-lg text-[10px] font-bold font-mono tracking-wider border flex items-center justify-between ${
                        coverType === 'url'
                          ? 'border-[#dcae1d] bg-[#dcae1d]/5 text-[#dcae1d]'
                          : 'border-[#2c241d] text-[#9c9284]'
                      }`}
                    >
                      COVER IMAGE WEB URL {coverType === 'url' && <Check className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Cover input fields based on active cover selection type */}
              {coverType === 'procedural' && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono uppercase text-[#9c9284]">Procedural Bindings:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {PROCEDURAL_COVERS.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPresetId(p.id)}
                        className={`py-1 px-1.5 border rounded-lg text-[9px] font-bold text-center truncate ${
                          selectedPresetId === p.id
                            ? 'border-[#dcae1d] text-[#dcae1d] bg-[#dcae1d]/5'
                            : 'border-[#2c241d] text-[#9c9284] hover:border-[#473c32]'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {coverType === 'uploaded' && (
                <div className="space-y-1">
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="w-full py-2 border border-dashed border-[#2c241d] hover:border-[#dcae1d] rounded-xl text-[11px] font-semibold text-[#9c9284] hover:text-[#dcae1d] transition-all bg-[#1a1612]/40"
                  >
                    Select Cover Image (PNG, JPG, JPEG)
                  </button>
                  {customCoverBase64 && (
                    <p className="text-[9px] font-mono text-green-500 text-center">✓ Cover image encoded successfully!</p>
                  )}
                </div>
              )}

              {coverType === 'url' && (
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase text-[#9c9284]">Image URL:</span>
                  <input
                    type="text"
                    value={coverUrlInput}
                    onChange={(e) => setCoverUrlInput(e.target.value)}
                    placeholder="E.g., https://unsplash.com/.../photo.jpg"
                    className="w-full text-xs p-2 bg-[#1c1713] border border-[#2c241d] rounded-xl focus:outline-none focus:border-[#dcae1d] text-[#f2efe9]"
                  />
                </div>
              )}

            </div>
          </div>

          {errorMsg && (
            <div className="text-xs text-amber-500 font-medium py-1.5 px-3 bg-amber-500/10 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
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
              className="px-5 py-2 bg-[#dcae1d] hover:bg-[#bda018] text-[#12100e] text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Import Book
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
