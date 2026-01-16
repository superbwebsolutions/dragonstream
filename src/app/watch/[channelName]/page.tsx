'use client';

// New main Watch Page router
// Unified layout for both YouTube and Agora streams
// Layout: Sandwich (Top Controls - Video - Bottom Controls) | Chat
// Integrated Real-Time Agora Chat

import { use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { allStreamsFlat, StreamItem } from '@/lib/streamData';
import Image from 'next/image';
import Link from 'next/link';

// Components
import { ChatPanel } from '@/components/ui/ChatPanel';
import { AgoraChatProvider } from '@/components/agora/AgoraChatProvider';

// Dynamically import Agora components to avoid SSR issues
const AgoraProvider = dynamic(() => import('@/components/agora/AgoraProvider').then(mod => mod.AgoraProvider), { ssr: false });
const BroadcasterView = dynamic(() => import('@/components/agora/BroadcasterView').then(mod => mod.BroadcasterView), { ssr: false });
const ViewerView = dynamic(() => import('@/components/agora/ViewerView').then(mod => mod.ViewerView), { ssr: false });

interface PageProps {
    params: Promise<{ channelName: string }>;
}

import { Suspense } from 'react';

function WatchPageContent({ channelName }: { channelName: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const title = searchParams.get('title') || 'Live Stream';

    // Platform detection
    const isHost = searchParams.get('host') === 'true';
    const platform = searchParams.get('platform');
    const isYoutube = platform === 'youtube';

    // State for Tokens (Agora RTC + Chat)
    const [tokenData, setTokenData] = useState<{
        token: string;
        uid: number;
        chatToken?: string;
        username?: string;
        roomId?: string;
    } | null>(null);
    const [isTokenLoading, setIsTokenLoading] = useState(!isYoutube);
    const [tokenError, setTokenError] = useState<string | null>(null);

    const [isLoaded, setIsLoaded] = useState(false);

    // Swipe state
    const touchStart = useRef<number | null>(null);
    const touchEnd = useRef<number | null>(null);

    // Navigation and Related Streams
    const currentIndex = allStreamsFlat.findIndex(s => s.youtubeId === channelName);
    const relatedStreams = allStreamsFlat.filter(s => s.youtubeId !== channelName).slice(0, 5);

    const goToNextStream = () => {
        let nextIndex = 0;
        if (currentIndex !== -1) {
            nextIndex = (currentIndex + 1) % allStreamsFlat.length;
        }
        const nextStream = allStreamsFlat[nextIndex];
        router.push(`/watch/${nextStream.youtubeId}?platform=youtube&title=${encodeURIComponent(nextStream.title)}`);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStart.current = e.targetTouches[0].clientY;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEnd.current = e.targetTouches[0].clientY;
    };

    const handleTouchEnd = () => {
        if (!touchStart.current || !touchEnd.current) return;
        const distance = touchStart.current - touchEnd.current;
        const isSwipeUp = distance > 50;

        if (isSwipeUp && !isHost) {
            goToNextStream();
        }
        touchStart.current = null;
        touchEnd.current = null;
    };

    // ==========================================
    // EFFECT: Fetch Agora Token (Agora Mode Only)
    // ==========================================
    useEffect(() => {
        if (isYoutube) return;

        const fetchToken = async () => {
            setIsTokenLoading(true);
            try {
                const response = await fetch('/api/agora/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        channelName,
                        role: isHost ? 'host' : 'audience',
                    }),
                });

                if (!response.ok) throw new Error('Failed to fetch token');
                const data = await response.json();

                // Register/Ensure Agora Chat User and Room
                let chatToken = data.chatToken;
                let roomId = '';
                if (data.username) {
                    try {
                        const registerRes = await fetch('/api/agora/chat-register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                username: data.username,
                                channelName: channelName // Important: pass channelName to ensure room
                            }),
                        });
                        const registerData = await registerRes.json();
                        if (registerData.token) {
                            chatToken = registerData.token;
                        }
                        if (registerData.roomId) {
                            roomId = registerData.roomId;
                        }
                    } catch (regErr) {
                        console.warn('Chat registration failed, falling back to generated token', regErr);
                    }
                }

                // Store RTC token AND Chat token (with roomId)
                setTokenData({
                    token: data.token,
                    uid: data.uid,
                    chatToken: chatToken,
                    username: data.username,
                    roomId: roomId
                });
            } catch (err) {
                console.error(err);
                setTokenError('Failed to join stream. Please try again.');
            } finally {
                setIsTokenLoading(false);
            }
        };

        fetchToken();
    }, [channelName, isHost, isYoutube]);

    // ==========================================
    // RENDER HELPER: Video Content
    // ==========================================
    const renderVideoContent = () => {
        // 1. YouTube View
        if (isYoutube) {
            return (
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                    <div className="w-full aspect-video max-h-full relative">
                        {!isLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-yellow-500 mx-auto mb-4"></div>
                                    <p className="text-yellow-500/60 text-sm">Loading stream...</p>
                                </div>
                            </div>
                        )}
                        <iframe
                            src={`https://www.youtube.com/embed/${channelName}?autoplay=1&mute=1&loop=1&playlist=${channelName}&controls=1&rel=0&modestbranding=1`}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            onLoad={() => setIsLoaded(true)}
                        />
                    </div>
                </div>
            );
        }

        // 2. Agora Loading/Error States
        if (isTokenLoading) {
            return (
                <div className="w-full h-full flex items-center justify-center bg-black">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-yellow-500"></div>
                </div>
            );
        }

        if (tokenError || !tokenData) {
            return (
                <div className="w-full h-full flex items-center justify-center bg-black text-white">
                    <p className="text-red-500 font-bold">{tokenError || 'Stream inaccessible'}</p>
                </div>
            );
        }

        // 3. Agora Views
        return (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
                <div className="w-full h-full relative">
                    <AgoraProvider role={isHost ? 'host' : 'audience'}>
                        {isHost ? (
                            <BroadcasterView
                                channelName={channelName}
                                appId={process.env.NEXT_PUBLIC_AGORA_APP_ID!}
                                token={tokenData.token}
                                uid={tokenData.uid}
                                onLeave={() => router.push('/')}
                            />
                        ) : (
                            <ViewerView
                                channelName={channelName}
                                appId={process.env.NEXT_PUBLIC_AGORA_APP_ID!}
                                token={tokenData.token}
                                uid={tokenData.uid}
                            />
                        )}
                    </AgoraProvider>
                </div>
            </div>
        );
    };

    const MockChatPanel = () => {
        const [mockMessages, setMockMessages] = useState<any[]>([
            { user: 'Lucky888', text: '好牌！', color: 'text-yellow-400' },
            { user: 'DragonKing', text: 'Big win incoming!', color: 'text-red-400' },
        ]);
        const [inputValue, setInputValue] = useState('');
        const chatRef = useRef<HTMLDivElement>(null);
        const [count, setCount] = useState(0);

        useEffect(() => {
            const interval = setInterval(() => {
                const msgs = [
                    { user: 'AceHigh', text: '下注了 all in!', color: 'text-blue-400' },
                    { user: 'MasterWong', text: 'Watch the East wind...', color: 'text-green-400' },
                    { user: 'Fortune99', text: '发财！💰', color: 'text-yellow-300' },
                ];
                const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
                setMockMessages(prev => [...prev.slice(-30), { ...randomMsg, user: randomMsg.user + Math.floor(Math.random() * 100) }]);
            }, 3000);
            setCount(Math.floor(Math.random() * 50 + 10));
            return () => clearInterval(interval);
        }, []);

        useEffect(() => {
            chatRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, [mockMessages]);

        const send = (e: React.FormEvent) => {
            e.preventDefault();
            if (!inputValue.trim()) return;
            setMockMessages(prev => [...prev, { user: 'You', text: inputValue, color: 'text-yellow-400' }]);
            setInputValue('');
        }

        return (
            <div className="flex flex-col h-full bg-gray-950 border-l border-yellow-600/20">
                <div className="p-4 border-b border-yellow-600/20 bg-gray-900">
                    <h2 className="text-white font-bold text-sm truncate">{decodeURIComponent(title)}</h2>
                    <span className="text-xs text-gray-400">{count}K Viewers</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-950">
                    {mockMessages.map((msg, i) => (
                        <div key={i} className="text-sm">
                            <span className={`font-bold ${msg.color} mr-2`}>{msg.user}:</span>
                            <span className="text-gray-300 break-words">{msg.text}</span>
                        </div>
                    ))}
                    <div ref={chatRef} />
                </div>
                <div className="p-4 border-t border-yellow-600/20 bg-gray-900">
                    <form onSubmit={send} className="relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Send a message..."
                            className="w-full bg-gray-800 border border-yellow-600/30 rounded-xl px-4 py-3 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors text-sm"
                        />
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col md:flex-row overflow-hidden select-none">
            <style jsx global>{`
                @media (max-width: 768px) {
                    html, body {
                        overflow: hidden !important;
                        height: 100% !important;
                        position: fixed !important;
                        width: 100% !important;
                    }
                }
                @media (max-width: 768px) and (orientation: landscape) {
                    .mobile-landscape-fullscreen {
                        position: fixed !important;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        z-index: 9999;
                        height: 100vh !important;
                        width: 100vw !important;
                        background: black;
                        border: none !important;
                    }
                    .mobile-landscape-hidden {
                        display: none !important;
                    }
                }
            `}</style>

            {/* MAIN CONTENT AREA: Video + Related + Buttons */}
            <div className="w-full md:w-3/4 h-full bg-gray-950 flex flex-col overflow-hidden">

                {/* Desktop Top Nav (Hidden on Mobile) */}
                {!isHost && (
                    <div className="hidden md:flex h-16 items-center justify-between px-4 bg-gray-900 border-b border-yellow-600/20 shrink-0 z-20 relative">
                        <a href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                            <div className="p-1.5 rounded-full bg-gray-800 group-hover:bg-gray-700 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium">Back to Tables</span>
                        </a>
                        <button onClick={goToNextStream} className="bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-500 px-4 py-2 rounded-full text-sm font-bold transition-all border border-yellow-600/30 flex items-center gap-2">
                            <span>Next Table</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* VIDEO FEED (takes available space on mobile, 75% on desktop) */}
                <div
                    className="flex-1 min-h-0 relative bg-black flex items-center justify-center overflow-hidden mobile-landscape-fullscreen touch-none"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{ touchAction: 'none' }}
                >
                    {renderVideoContent()}

                    {/* Mobile Hint for Swipe */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden pointer-events-none opacity-40">
                        <div className="flex flex-col items-center animate-bounce">
                            <span className="text-[10px] text-white uppercase tracking-widest font-bold">Swipe up for next</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* BOTTOM MOBILE SECTION (Related + Controls) */}
                {!isHost && (
                    <div className="h-auto md:h-36 bg-gray-900 border-t border-yellow-600/20 shrink-0 p-2 md:p-4 overflow-hidden flex flex-col justify-center z-20 relative mobile-landscape-hidden">

                        <div className="flex items-center gap-2 mb-1 md:mb-2">
                            <span className="text-[10px] md:text-xs font-bold text-yellow-500 uppercase tracking-wide">Related Tables</span>
                            <span className="h-px flex-1 bg-yellow-600/20"></span>
                        </div>

                        {/* Related Thumbnails list */}
                        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1 scrollbar-none md:scrollbar-thin">
                            {relatedStreams.map((stream) => (
                                <Link key={stream.id} href={`/watch/${stream.youtubeId}?platform=youtube&title=${encodeURIComponent(stream.title)}`} className="flex-shrink-0 w-24 md:w-40 group relative">
                                    <div className="aspect-video rounded-lg overflow-hidden border border-white/10 group-hover:border-yellow-500/80 transition-all bg-gray-800">
                                        <Image src={stream.thumbnail} alt={stream.title} width={160} height={90} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                                    </div>
                                    <div className="mt-1 truncate text-[9px] md:text-xs font-medium text-gray-400 group-hover:text-yellow-400 text-center">{stream.title}</div>
                                </Link>
                            ))}
                        </div>

                        {/* Mobile Navigation Buttons (Moved here to save space) */}
                        <div className="flex md:hidden items-center justify-between mt-2 pt-2 border-t border-white/5">
                            <a href="/" className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bold uppercase tracking-tight">
                                <div className="p-1 rounded-full bg-gray-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </div>
                                <span>Exit</span>
                            </a>

                            <div className="flex flex-col items-center">
                                <h1 className="text-white text-[10px] font-medium opacity-60 truncate max-w-[120px]">{decodeURIComponent(title)}</h1>
                            </div>

                            <button onClick={goToNextStream} className="flex items-center gap-1.5 text-yellow-500 text-[11px] font-bold uppercase tracking-tight">
                                <span>Next</span>
                                <div className="p-1 rounded-full bg-yellow-600/20 border border-yellow-600/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* CHAT AREA (Desktop Side | Mobile Bottom) */}
            <div className="w-full md:w-1/4 h-[40vh] md:h-full flex flex-col border-t md:border-t-0 md:border-l border-yellow-600/20 bg-gray-950 overflow-hidden shrink-0">
                {isYoutube ? <MockChatPanel /> : tokenData?.chatToken ? (
                    <AgoraChatProvider appKey={process.env.NEXT_PUBLIC_AGORA_CHAT_APP_KEY!} token={tokenData.chatToken} username={tokenData.username || 'guest'} channelName={channelName} roomId={tokenData.roomId}>
                        <ChatPanel channelName={decodeURIComponent(title)} />
                    </AgoraChatProvider>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 text-sm italic">
                        {isTokenLoading ? 'Connecting to Chat...' : 'Chat Unavailable'}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function WatchPage({ params }: PageProps) {
    const { channelName } = use(params);
    return (
        <Suspense fallback={<div className="w-full h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-yellow-500"></div></div>}>
            <WatchPageContent channelName={channelName} />
        </Suspense>
    );
}
