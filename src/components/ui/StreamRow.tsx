'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';

interface StreamProps {
    id: string;
    title: string;
    host: string;
    viewers: string;
    thumbnail: string;
    avatar: string;
    category: string;
    youtubeId?: string;
}

export function StreamRow({ title, streams }: { title: string, streams: StreamProps[] }) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = (id: string, youtubeId?: string) => {
        if (!youtubeId) return;

        // Clear any existing timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Small delay to prevent accidental triggers while scrolling
        timeoutRef.current = setTimeout(() => {
            setHoveredId(id);
        }, 500);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setHoveredId(null);
    };

    return (
        <div className="py-6">
            <div className="flex items-center justify-between px-4 md:px-0 mb-4">
                <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
                <button className="text-yellow-400 text-sm font-semibold hover:text-yellow-300 transition-colors">See All</button>
            </div>

            <div className="flex overflow-x-auto gap-4 px-4 md:px-0 pb-4 scrollbar-hide snap-x">
                {streams.map((stream) => (
                    <Link
                        key={stream.id}
                        href={`/watch/${stream.youtubeId || 'dQw4w9WgXcQ'}?platform=youtube&title=${encodeURIComponent(stream.title)}`}
                        className="min-w-[280px] md:min-w-[320px] snap-start group cursor-pointer"
                        onMouseEnter={() => handleMouseEnter(stream.id, stream.youtubeId)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-yellow-600/10 group-hover:border-yellow-500/40 transition-colors bg-gray-900">
                            {/* Autoplay Video on Hover */}
                            {hoveredId === stream.id && stream.youtubeId ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${stream.youtubeId}?autoplay=1&controls=0&mute=1&removetitles=1&showinfo=0&iv_load_policy=3&modestbranding=1&playlist=${stream.youtubeId}&loop=1`}
                                    className="absolute inset-0 w-full h-full z-20 pointer-events-none scale-105"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    title={stream.title}
                                />
                            ) : null}

                            {/* Static Thumbnail (YouTube maxres or fallback) */}
                            <img
                                src={stream.youtubeId ? `https://img.youtube.com/vi/${stream.youtubeId}/maxresdefault.jpg` : stream.thumbnail}
                                alt={stream.title}
                                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${hoveredId === stream.id ? 'opacity-0' : 'opacity-100'}`}
                                onError={(e) => {
                                    // Fallback if maxresdefault doesn't exist (some older videos)
                                    (e.target as HTMLImageElement).src = stream.youtubeId
                                        ? `https://img.youtube.com/vi/${stream.youtubeId}/hqdefault.jpg`
                                        : stream.thumbnail;
                                }}
                            />

                            {/* Live Badge */}
                            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1 z-10">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                Live
                            </div>

                            {/* Viewer Count */}
                            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1 z-10">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                                {stream.viewers}
                            </div>

                            {/* Category Badge */}
                            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-yellow-400 text-[10px] font-medium px-2 py-0.5 rounded border border-yellow-600/20 z-10">
                                {stream.category}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0 border-2 border-transparent group-hover:border-yellow-500 transition-colors">
                                <img src={stream.avatar} alt={stream.host} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-white font-semibold text-sm leading-tight group-hover:text-yellow-400 transition-colors line-clamp-1">{stream.title}</h3>
                                <span className="text-gray-400 text-xs mt-0.5">{stream.host}</span>
                                <span className="text-yellow-500/60 text-xs mt-0.5">{stream.category}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
