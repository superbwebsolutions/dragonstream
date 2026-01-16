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
        <div className="fixed inset-0 z-50 bg-black flex flex-col md:flex-row">
            <style jsx global>{`
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

            <div className="w-full md:w-3/4 h-[50vh] md:h-full bg-gray-950 flex flex-col">
                {!isHost && (
                    <div className="h-14 md:h-16 flex items-center justify-between px-4 bg-gray-900 border-b border-yellow-600/20 shrink-0 z-20 relative mobile-landscape-hidden">
                        <a href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                            <div className="p-1.5 rounded-full bg-gray-800 group-hover:bg-gray-700 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </div>
                            <span className="hidden md:inline text-sm font-medium">Back to Tables</span>
                        </a>
                        <button onClick={goToNextStream} className="bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-500 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all border border-yellow-600/30 flex items-center gap-2">
                            <span>Next Table</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden mobile-landscape-fullscreen" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                    {renderVideoContent()}
                </div>

                {!isHost && (
                    <div className="h-auto md:h-36 bg-gray-900 border-t border-yellow-600/20 shrink-0 p-3 md:p-4 overflow-hidden flex flex-col justify-center z-20 relative mobile-landscape-hidden">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-yellow-500 uppercase tracking-wide">Related Tables</span>
                            <span className="h-px flex-1 bg-yellow-600/20"></span>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-yellow-600/50">
                            {relatedStreams.map((stream) => (
                                <Link key={stream.id} href={`/watch/${stream.youtubeId}?platform=youtube&title=${encodeURIComponent(stream.title)}`} className="flex-shrink-0 w-32 md:w-40 group relative">
                                    <div className="aspect-video rounded-lg overflow-hidden border border-white/10 group-hover:border-yellow-500/80 transition-all bg-gray-800">
                                        <Image src={stream.thumbnail} alt={stream.title} width={160} height={90} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                                    </div>
                                    <div className="mt-1 truncate text-[10px] md:text-xs font-medium text-gray-400 group-hover:text-yellow-400 text-center">{stream.title}</div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="hidden md:flex md:w-1/4 h-full flex-col border-l border-yellow-600/20 bg-gray-950">
                {isYoutube ? <MockChatPanel /> : tokenData?.chatToken ? (
                    <AgoraChatProvider appKey={process.env.NEXT_PUBLIC_AGORA_CHAT_APP_KEY!} token={tokenData.chatToken} username={tokenData.username || 'guest'} channelName={channelName} roomId={tokenData.roomId}>
                        <ChatPanel channelName={decodeURIComponent(title)} />
                    </AgoraChatProvider>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        {isTokenLoading ? 'Loading Chat...' : 'Chat Unavailable'}
                    </div>
                )}
            </div>

            <div className="md:hidden flex-1 bg-gray-950 border-t border-yellow-600/20 flex flex-col mobile-landscape-hidden">
                {isYoutube ? <MockChatPanel /> : tokenData?.chatToken ? (
                    <AgoraChatProvider appKey={process.env.NEXT_PUBLIC_AGORA_CHAT_APP_KEY!} token={tokenData.chatToken} username={tokenData.username || 'guest'} channelName={channelName} roomId={tokenData.roomId}>
                        <ChatPanel channelName={decodeURIComponent(title)} />
                    </AgoraChatProvider>
                ) : null}
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
