import React, { useState, useMemo, useEffect } from 'react';
import { Book, Review, MapMode } from '../types';
import { COUNTRIES_GEO_MAP } from '../mockData';
import { Globe, Users, FileText, ZoomIn, ZoomOut, Maximize, MapPin, Star, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as d3 from 'd3';

interface WorldMapProps {
  books: Book[];
  reviews: Review[];
  activeBookId?: string | null;
  onBookClick: (book: Book) => void;
}

// 从 API 加载全部公开书评（地图用，不依赖当前用户）
function usePublicReviews(): Review[] {
  const [publicReviews, setPublicReviews] = useState<Review[]>([]);
  useEffect(() => { import('../services/api').then(m => m.api.reviews.list({ visibility: 1, size: 500 }).then(r => { if (r?.data?.list) setPublicReviews(r.data.list); }).catch(() => {})); }, []);
  return publicReviews;
}

// Pastel colors used to render mapped countries when selected/highlighted
const COUNTRY_COLORS: { [code: string]: string } = {
  US: '#50756C', // Slate Green
  CA: '#384B60', // Dark Denim
  CO: '#8E5A54', // Terracotta
  BR: '#6F7F58', // Olive
  GB: '#7E6B80', // Dusty Purple
  FR: '#825662', // Muted Wine
  DE: '#6F6A85', // Cool Lavender
  IT: '#8A7B68', // Clay
  ZA: '#9E8557', // Mustard/Ochre
  RU: '#444C6E', // Navy/Indigo
  CN: '#7A3F3F', // Crimson Rose
  IN: '#9E7450', // Warm Amber
  JP: '#824867', // Muted Plum
  AU: '#405B6E', // Deep Ocean
  ES: '#8c728e', // Soft Lilac
  EG: '#aa8c68', // Antique Gold
  MX: '#bd8048', // Sunlit Clay
  AR: '#4b7596', // Coastal Blue
  KR: '#a65b61', // Soft Crimson
  GR: '#658d7c', // Muted Sage
  SE: '#436173', // Glacier Grey
  TR: '#b36d50', // Warm Sand
  SG: '#4fa19b'  // Muted Emerald
};

export default function WorldMap({ books, reviews, activeBookId, onBookClick }: WorldMapProps) {
  // 加载全部公开书评（地图读者足迹模式用）
  const allPublicReviews = usePublicReviews();
  const mergedReviews = useMemo(() => {
    const seen = new Set(reviews.map(r => r.id));
    const extra = allPublicReviews.filter(r => !seen.has(r.id));
    return [...reviews, ...extra];
  }, [reviews, allPublicReviews]);

  // Map settings
  const [mapMode, setMapMode] = useState<'author_origin' | 'reader_anchor'>('author_origin');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredCountryCode, setHoveredCountryCode] = useState<string | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // High-fidelity GeoJSON state fetched from CDN
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch the detailed, high-fidelity real world map GeoJSON
  useEffect(() => {
    setLoading(true);
    fetch('https://cdn.jsdelivr.net/gh/holtzy/D3-graph-gallery@master/DATA/world.geojson')
      .then(res => {
        if (!res.ok) throw new Error('CDN error');
        return res.json();
      })
      .then(data => {
        setGeoJsonData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load detailed GeoJSON, trying fallback rawgit...', err);
        // Fallback stable secondary URL
        fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
          .then(res => res.json())
          .then(data => {
            setGeoJsonData(data);
            setLoading(false);
          })
          .catch(fallbackErr => {
            console.error('All GeoJSON fetches failed.', fallbackErr);
            setLoading(false);
          });
      });
  }, []);

  // Configure D3 Projection to perfectly map geographic coordinates into our 900x450 viewBox
  // Adjusted scale and center to fit Canada/Russia/Antarctica perfectly
  const projection = useMemo(() => {
    return d3.geoMercator()
      .scale(115)
      .translate([450, 235]); // perfectly center the Mercator projection in 900x450 canvas
  }, []);

  const pathGenerator = useMemo(() => {
    return d3.geoPath().projection(projection);
  }, [projection]);

  // Handle map modes and metadata counts
  const mapStats = useMemo(() => {
    const results: { [code: string]: { books: Book[]; reviews: Review[] } } = {};
    
    // Initialize empty collections for all countries in our coordinates registry
    Object.values(COUNTRIES_GEO_MAP).forEach(info => {
      results[info.code] = { books: [], reviews: [] };
    });

    const filteredBooks = books;

    if (mapMode === 'author_origin') {
      filteredBooks.forEach(book => {
        const geoInfo = Object.entries(COUNTRIES_GEO_MAP).find(([name]) => name.toLowerCase() === book.country.toLowerCase());
        if (geoInfo) {
          const code = geoInfo[1].code;
          if (results[code]) {
            results[code].books.push(book);
          }
        }
      });
    } else if (mapMode === 'reader_anchor') {
      mergedReviews.forEach(review => {
        if (review.visibility === 'private') return;
        if (activeBookId && review.bookId !== activeBookId) return;

        const matchedBook = books.find(b => b.id === review.bookId);
        // 即使无匹配图书也显示公开书评（来自其他用户的公开内容）

        // Extract country from locationName (e.g. "Paris, France" or simply "France")
        const parts = review.locationName.split(',');
        const countryName = (parts[parts.length - 1] || '').trim();
        const geoInfo = Object.entries(COUNTRIES_GEO_MAP).find(([name]) => name.toLowerCase() === countryName.toLowerCase());
        if (geoInfo) {
          const code = geoInfo[1].code;
          if (results[code]) {
            results[code].reviews.push(review);
            if (matchedBook && !results[code].books.some(b => b.id === matchedBook.id)) {
              results[code].books.push(matchedBook);
            }
          }
        }
      });
    }

    const mappedCountryCount = Object.values(results).filter(res => res.books.length > 0 || res.reviews.length > 0).length;
    
    return {
      countryData: results,
      mappedCountryCount
    };
  }, [mapMode, books, mergedReviews, activeBookId]);

  // Map zooming handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.75));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedCountryCode(null);
  };

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Map the country's full name from the feature properties to our ISO code
  const getCountryCodeFromFeature = (feature: any): string | null => {
    const name = feature.properties?.name || '';
    // Custom replacements for standard differences in GeoJSON names
    let normName = name;
    if (name === 'United States of America') normName = 'United States';
    
    const geoInfo = Object.entries(COUNTRIES_GEO_MAP).find(([cName]) => cName.toLowerCase() === normName.toLowerCase());
    return geoInfo ? geoInfo[1].code : null;
  };

  // Get selected country's meta details
  const selectedCountryName = useMemo(() => {
    if (!selectedCountryCode) return '';
    const geoEntry = Object.entries(COUNTRIES_GEO_MAP).find(([_, info]) => info.code === selectedCountryCode);
    return geoEntry ? geoEntry[0] : '';
  }, [selectedCountryCode]);

  const selectedCountryData = selectedCountryCode ? mapStats.countryData[selectedCountryCode] : null;

  return (
    <div className="relative w-full h-[550px] bg-[#0c0a08] border border-[#2c241d] rounded-2xl overflow-hidden select-none">
      
      {/* Map Control Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pointer-events-none">
        
        {/* Left Control Group (Selectors) */}
        <div className="flex flex-wrap items-center gap-3 pointer-events-auto">
          {/* Map Mode Selectors */}
          <div className="flex items-center gap-2 p-1.5 bg-[#14110e]/90 border border-[#2c241d] rounded-xl backdrop-blur-md">
            <button
              onClick={() => { setMapMode('author_origin'); setSelectedCountryCode(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer ${
                mapMode === 'author_origin'
                  ? 'bg-[#dcae1d] text-[#12100e] shadow-md font-semibold'
                  : 'text-[#9c9284] hover:text-[#f2efe9]'
              }`}
            >
              Author origin
            </button>
            <button
              onClick={() => { setMapMode('reader_anchor'); setSelectedCountryCode(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer ${
                mapMode === 'reader_anchor'
                  ? 'bg-[#dcae1d] text-[#12100e] shadow-md font-semibold'
                  : 'text-[#9c9284] hover:text-[#f2efe9]'
              }`}
            >
              Reader footprints
            </button>
          </div>
        </div>

        {/* Right Statistics Displays */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {activeBookId && (
            <span className="text-xs px-2.5 py-1.5 bg-[#824867]/20 border border-[#824867]/50 text-[#f59e0b] rounded-lg animate-pulse flex items-center gap-1.5 font-mono">
              <Eye className="w-3.5 h-3.5" /> Filtered
            </span>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#14110e]/90 border border-[#2c241d] rounded-xl backdrop-blur-md">
            <span className="text-[10px] text-[#9c9284] font-mono uppercase tracking-widest">Books:</span>
            <span className="text-xs font-semibold font-mono text-[#dcae1d]">{books.length}</span>
            <span className="text-[#2c241d] mx-1">|</span>
            <span className="text-[10px] text-[#9c9284] font-mono uppercase tracking-widest">Mapped:</span>
            <span className="text-xs font-semibold font-mono text-[#dcae1d]">{mapStats.mappedCountryCount}</span>
          </div>
        </div>
      </div>

      {/* Loader / Loading Fallback */}
      {loading && (
        <div className="absolute inset-0 z-30 bg-[#0c0a08]/90 flex flex-col items-center justify-center gap-3">
          <Globe className="w-8 h-8 text-[#dcae1d] animate-spin" />
          <p className="text-xs font-mono text-[#9c9284] tracking-wider animate-pulse">
            LOADING REAL WORLD GEOMETRY...
          </p>
        </div>
      )}

      {/* Interactive Map Canvas */}
      <div
        className={`w-full h-full cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox="0 0 900 450"
          className="w-full h-full select-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Ambient Gridlines */}
          <g stroke="#1b1713" strokeWidth="0.5" opacity="0.45" fill="none">
            {Array.from({ length: 19 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="450" />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 50} y2="900" />
            ))}
          </g>

          {/* Oceans backdrop */}
          <rect x="0" y="0" width="900" height="450" fill="transparent" />

          {/* Countries Vectors Group */}
          <g id="world-paths">
            {geoJsonData?.features?.map((feature: any, idx: number) => {
              const code = getCountryCodeFromFeature(feature);
              const isMapped = code ? mapStats.countryData[code] && (mapStats.countryData[code].books.length > 0 || mapStats.countryData[code].reviews.length > 0) : false;
              const isHovered = code && hoveredCountryCode === code;
              const isSelected = code && selectedCountryCode === code;

              // Compute fill color matching high-fidelity palette
              let fill = '#161310'; // Elegant deep slate gray for unmapped
              if (isMapped && code) {
                fill = COUNTRY_COLORS[code] || '#50756C';
              }

              const pathD = pathGenerator(feature);
              if (!pathD) return null;

              return (
                <path
                  key={`country-path-${idx}`}
                  d={pathD}
                  fill={fill}
                  fillOpacity={isSelected ? 1.0 : isHovered ? 0.9 : isMapped ? 0.75 : 0.45}
                  stroke={isSelected ? '#dcae1d' : isHovered ? '#f2efe9' : isMapped ? '#3c3227' : '#1e1a16'}
                  strokeWidth={isSelected ? 1.5 : isHovered ? 1.0 : 0.5}
                  className="transition-all duration-200 ease-out cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (code) {
                      setSelectedCountryCode(code === selectedCountryCode ? null : code);
                    }
                  }}
                  onMouseEnter={() => code && setHoveredCountryCode(code)}
                  onMouseLeave={() => setHoveredCountryCode(null)}
                />
              );
            })}
          </g>

          {/* Country Name Labels Overlay */}
          <g id="country-labels" className="pointer-events-none">
            {Object.entries(COUNTRIES_GEO_MAP).map(([name, info]) => {
              const code = info.code;
              const coord = projection([info.lng, info.lat]);
              if (!coord) return null;

              const [x, y] = coord;
              const isSelected = selectedCountryCode === code;
              const isHovered = hoveredCountryCode === code;
              const countryStat = mapStats.countryData[code];
              const hasData = countryStat && (countryStat.books.length > 0 || countryStat.reviews.length > 0);

              return (
                <g key={`label-${code}`} className="transition-all duration-200">
                  {/* Small clean dot for ALL countries in our database to indicate they are interactive */}
                  <circle
                    cx={x}
                    cy={y}
                    r={1.5}
                    fill={hasData ? "#dcae1d" : "#5c544a"}
                    opacity={hasData ? 0.9 : 0.4}
                  />
                  
                  {/* Country Name Label */}
                  <text
                    x={x}
                    y={y + 8}
                    textAnchor="middle"
                    className="font-mono select-none tracking-wider uppercase font-semibold"
                    style={{
                      fontSize: '5.5px',
                      fill: isSelected ? '#dcae1d' : isHovered ? '#f2efe9' : hasData ? '#bfb49e' : '#5c544a',
                      opacity: isSelected || isHovered ? 1 : hasData ? 0.8 : 0.5,
                      textShadow: '0px 1px 2px rgba(0,0,0,0.9), 1px 0px 1px rgba(0,0,0,0.9)'
                    }}
                  >
                    {name}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Glowing Country/Pins markers Overlay */}
          <g id="pins">
            {Object.entries(COUNTRIES_GEO_MAP).map(([name, info]) => {
              const code = info.code;
              const countryStat = mapStats.countryData[code];
              const hasData = countryStat && (countryStat.books.length > 0 || countryStat.reviews.length > 0);
              
              if (!hasData) return null;

              // Calculate projected coordinate for the country center
              const coord = projection([info.lng, info.lat]);
              if (!coord) return null;

              const [x, y] = coord;
              const isSelected = selectedCountryCode === code;
              const isHovered = hoveredCountryCode === code;

              return (
                <g key={code} className="pointer-events-none">
                  {/* Outer breathing pulse */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 12 : isHovered ? 10 : 8}
                    fill={COUNTRY_COLORS[code] || '#dcae1d'}
                    fillOpacity={0.15}
                    className="animate-ping"
                    style={{ animationDuration: '3s' }}
                  />
                  {/* Solid core pin */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 5 : isHovered ? 4.5 : 3.5}
                    fill="#dcae1d"
                    stroke="#0c0a08"
                    strokeWidth={1.5}
                  />
                </g>
              );
            })}

            {/* If in footprints (Reader Anchor) mode, let's also plot precise reviews as gorgeous pins! */}
            {mapMode === 'reader_anchor' && reviews.map((review) => {
              if (review.visibility === 'private') return null; // Exclude private reviews from footprint map
              if (activeBookId && review.bookId !== activeBookId) return null;

              // Filter by category
              const matchedBook = books.find(b => b.id === review.bookId);
              if (!matchedBook) return null;

              if (review.longitude === undefined || review.latitude === undefined) return null;

              const coord = projection([review.longitude, review.latitude]);
              if (!coord) return null;

              const [x, y] = coord;

              return (
                <g key={review.id} className="cursor-pointer group" onClick={(e) => {
                  e.stopPropagation();
                  // Extract country from locationName and select it!
                  const parts = review.locationName.split(',');
                  const countryName = (parts[parts.length - 1] || '').trim();
                  const geoInfo = Object.entries(COUNTRIES_GEO_MAP).find(([name]) => name.toLowerCase() === countryName.toLowerCase());
                  if (geoInfo) {
                    setSelectedCountryCode(geoInfo[1].code);
                  }
                }}>
                  {/* Floating tooltip preview for review pin on hover */}
                  <foreignObject
                    x={x - 60}
                    y={y - 45}
                    width="120"
                    height="40"
                    className="overflow-visible pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <div className="bg-[#14110e] border border-[#dcae1d] rounded px-2 py-1 shadow-2xl text-[9px] text-[#f2efe9] text-center font-mono">
                      {review.username}
                      <div className="text-[8px] text-[#9c9284] truncate">{review.bookTitle}</div>
                    </div>
                  </foreignObject>

                  {/* Bouncing Pin Marker */}
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                    fill="#f59e0b"
                    stroke="#14110e"
                    strokeWidth={1.5}
                    transform={`translate(${x - 12}, ${y - 20}) scale(1)`}
                    className="animate-bounce"
                    style={{ animationDuration: '2s' }}
                  />
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Hover Information Tooltip Overlay */}
      {!selectedCountryCode && hoveredCountryCode && (
        <div className="absolute bottom-4 left-4 p-3 bg-[#14110e]/95 border border-[#2c241d] rounded-xl text-xs backdrop-blur-md">
          <div className="font-semibold text-serif text-[#f2efe9]">
            {Object.entries(COUNTRIES_GEO_MAP).find(([_, info]) => info.code === hoveredCountryCode)?.[0]}
          </div>
          <div className="text-[10px] text-[#9c9284] mt-1 font-mono">
            {mapMode === 'author_origin' && (
              <span>Registered authors: {mapStats.countryData[hoveredCountryCode]?.books.length || 0}</span>
            )}
            {mapMode === 'reader_anchor' && (
              <span>Logged reviews: {mapStats.countryData[hoveredCountryCode]?.reviews.length || 0}</span>
            )}
          </div>
        </div>
      )}

      {/* Map Control Tools */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-[#14110e]/90 border border-[#2c241d] text-[#9c9284] hover:text-[#f2efe9] hover:bg-[#1a1612] rounded-lg transition-all cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-[#14110e]/90 border border-[#2c241d] text-[#9c9284] hover:text-[#f2efe9] hover:bg-[#1a1612] rounded-lg transition-all cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-[#14110e]/90 border border-[#2c241d] text-[#9c9284] hover:text-[#f2efe9] hover:bg-[#1a1612] rounded-lg transition-all cursor-pointer"
          title="Recenter Map"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Side Info Overlay Panel for Selected Country Data */}
      <AnimatePresence>
        {selectedCountryCode && selectedCountryData && (
          <motion.div
            initial={{ opacity: 0, x: 250 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 250 }}
            className="absolute top-16 bottom-4 right-4 w-[330px] bg-[#14110e]/95 border border-[#2c241d] rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden flex flex-col z-20"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#2c241d] flex items-center justify-between bg-[#1a1612]/50">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#dcae1d]">Territorial Focus</span>
                <h3 className="text-sm font-bold text-serif text-[#f2efe9] flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-4 h-4 text-[#dcae1d]" />
                  {selectedCountryName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCountryCode(null)}
                className="p-1.5 hover:bg-[#2c241d] rounded-lg text-[#9c9284] hover:text-[#f2efe9] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details List Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mapMode === 'author_origin' ? (
                <div>
                  <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#9c9284] mb-2">
                    Authors from {selectedCountryName}
                  </h4>
                  {selectedCountryData.books.length === 0 ? (
                    <div className="text-xs text-[#9c9284] py-8 text-center italic">
                      No authors registered in this region.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCountryData.books.map(book => (
                        <div
                          key={book.id}
                          onClick={() => onBookClick(book)}
                          className="p-3 bg-[#1e1915] border border-[#2c241d] hover:border-[#dcae1d] rounded-xl cursor-pointer transition-all flex gap-3 group"
                        >
                          {book.cover ? (
                            <img src={book.cover} alt={book.title} className="w-12 h-16 object-cover rounded-md border border-[#2c241d]" />
                          ) : (
                            <div className="w-12 h-16 bg-[#2c241d] rounded-md border border-[#3c3227] flex items-center justify-center text-xs font-mono">
                              Book
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-semibold text-serif truncate group-hover:text-[#dcae1d] transition-all">
                              {book.title}
                            </h5>
                            <p className="text-[11px] text-[#9c9284] truncate mt-0.5">{book.author}</p>
                            <span className="inline-block mt-2 text-[10px] bg-[#dcae1d]/10 text-[#dcae1d] px-2 py-0.5 rounded-full font-mono">
                              {book.category}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#9c9284] mb-2">
                    Community Footprint Reviews here
                  </h4>
                  {selectedCountryData.reviews.length === 0 ? (
                    <div className="text-xs text-[#9c9284] py-8 text-center italic">
                      No footprints logged in this region.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCountryData.reviews.map(review => (
                        <div
                          key={review.id}
                          className="p-3 bg-[#1e1915] border border-[#2c241d] rounded-xl flex flex-col gap-2"
                        >
                          <div className="flex items-center gap-2">
                            {review.userAvatar ? (
                              <img src={review.userAvatar} alt={review.username} className="w-6 h-6 rounded-full" />
                            ) : (
                              <div className="w-6 h-6 bg-[#dcae1d]/20 text-[#dcae1d] text-xs font-mono rounded-full flex items-center justify-center">
                                {review.username.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-[#f2efe9] truncate">{review.username}</div>
                              <div className="text-[9px] text-[#9c9284] font-mono">{new Date(review.createdAt).toLocaleDateString()}</div>
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
                          
                          <div className="text-[11px] font-medium text-serif text-[#f2efe9] mt-0.5">
                            {review.title}
                          </div>
                          <p className="text-[11px] text-[#9c9284] line-clamp-3 leading-relaxed">
                            "{review.content}"
                          </p>
                          <div className="border-t border-[#2c241d]/50 pt-1.5 flex items-center justify-between">
                            <span className="text-[9px] text-[#9c9284] italic truncate max-w-[120px]">
                              Book: {review.bookTitle}
                            </span>
                            <button
                              onClick={() => {
                                const matched = books.find(b => b.id === review.bookId);
                                if (matched) onBookClick(matched);
                              }}
                              className="text-[9px] text-[#dcae1d] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              Open Book →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
