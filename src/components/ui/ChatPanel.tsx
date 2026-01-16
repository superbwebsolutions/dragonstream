'use client';

import { useState } from 'react';
import { useAgoraChat } from '@/components/agora/AgoraChatProvider';

interface ChatPanelProps {
    channelName?: string;
    viewerCount?: number;
}

export function ChatPanel({ channelName = 'Live Stream', viewerCount = 125 }: ChatPanelProps) {
    const { messages, sendMessage, username, isConnected } = useAgoraChat();

    // Use passed viewerCount or default
    const displayCount = viewerCount;

    // Use messages from context directly, no local state needed for messages (except maybe input)
    const [input, setInput] = useState('');

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        await sendMessage(input);
        setInput('');
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800">
            {/* Header / Stats */}
            <div className="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-white font-bold text-lg truncate max-w-[70%]">{channelName}</h3>
                    <div className="bg-red-600/90 px-2 py-0.5 rounded text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        Live
                    </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                        <span className="font-medium text-gray-300">{viewerCount} Viewers</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                        <span className="font-medium text-gray-300">1.2K Likes</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className="text-sm">
                        <span className={`font-bold ${msg.color} mr-2`}>{msg.user}:</span>
                        <span className="text-gray-300 break-words">{msg.text}</span>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800 bg-gray-900 shrink-0">
                <form onSubmit={handleSend} className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-black border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors text-[16px] md:text-sm"
                    />
                    <button
                        type="submit"
                        className="bg-yellow-600 hover:bg-yellow-500 text-black p-3 rounded-xl transition-all flex items-center justify-center shrink-0"
                        aria-label="Send message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
