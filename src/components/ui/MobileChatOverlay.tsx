'use client';

import { useState, useRef, useEffect } from 'react';
import { useAgoraChat } from '@/components/agora/AgoraChatProvider';

interface ChatMessage {
    user: string;
    text: string;
    color?: string;
    isSelf?: boolean;
}

export function MobileChatOverlay() {
    const [isVisible, setIsVisible] = useState(true);
    const { messages, sendMessage, username } = useAgoraChat();
    const [input, setInput] = useState('');
    const messagesRef = useRef<HTMLDivElement>(null);

    // Swipe detection
    const [touchStart, setTouchStart] = useState<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const currentTouch = e.targetTouches[0].clientX;
        const diff = touchStart - currentTouch;

        // Swipe Left (diff > 50px)
        if (diff > 50) {
            setIsVisible(false);
            setTouchStart(null);
        }
    };

    // Scroll to bottom of messages when new messages arrive
    useEffect(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        await sendMessage(input);
        setInput('');
    };

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="absolute bottom-6 left-4 z-50 bg-black/50 backdrop-blur-md p-2 rounded-full text-white/70 border border-white/10 animate-pulse"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>
        );
    }

    return (
        <div
            className="absolute inset-x-0 bottom-0 z-40 p-4 pb-20 pointer-events-none"
        >
            <div
                className="w-3/4 max-w-sm pointer-events-auto touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
            >
                <div ref={messagesRef} className="space-y-2 max-h-[40vh] overflow-y-auto">
                    {messages.map((msg: ChatMessage, i: number) => (
                        <div key={i} className="bg-black/30 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/5 shadow-sm inline-block max-w-full break-words animate-in slide-in-from-bottom-2 fade-in duration-300 mb-2">
                            <span className={`font-bold ${msg.user === username ? 'text-yellow-400' : (msg.color || 'text-purple-400')} text-xs mr-2`}>{msg.user}</span>
                            <span className="text-white text-sm">{msg.text}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-2 text-white/50 text-[10px] italic ml-1">
                    Swipe left to hide chat
                </div>

                {/* Mobile Input */}
                <form onSubmit={handleSend} className="mt-4 flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Chat..."
                        className="flex-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                    />
                    <button type="submit" className="bg-purple-600 rounded-full p-2 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
