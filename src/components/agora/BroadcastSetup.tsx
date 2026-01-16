'use client';

import { useLocalMicrophoneTrack, useLocalCameraTrack, LocalUser } from 'agora-rtc-react';
import { useState } from 'react';
import Link from 'next/link';

interface BroadcastSetupProps {
    onReady: (channelName: string) => void;
}

export function BroadcastSetup({ onReady }: BroadcastSetupProps) {
    const [channelName, setChannelName] = useState('');
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);

    // Create local tracks for preview
    const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
    const { localCameraTrack } = useLocalCameraTrack(cameraOn);

    const handleStart = () => {
        if (channelName.trim()) {
            onReady(channelName);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative">
            {/* Back Button */}
            <Link
                href="/"
                className="absolute top-6 left-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors z-50"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span>Back</span>
            </Link>

            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">

                {/* Left: Preview */}
                <div className="space-y-6">
                    <div className="relative aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800 ring-1 ring-white/10">
                        <LocalUser
                            audioTrack={localMicrophoneTrack}
                            videoTrack={localCameraTrack}
                            cameraOn={cameraOn}
                            micOn={micOn}
                            playAudio={false}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            className="w-full h-full object-cover"
                        >
                            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 z-10">
                                <div className={`w-2 h-2 rounded-full ${micOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-white text-xs font-semibold tracking-wide">
                                    {micOn ? 'Mic On' : 'Mic Off'}
                                </span>
                            </div>
                        </LocalUser>

                        {/* Overlay Settings - Positioned safely */}
                        <div className="absolute bottom-4 right-4 flex gap-3 z-20">
                            <button
                                onClick={() => setMicOn(!micOn)}
                                className={`p-3 rounded-full backdrop-blur-md transition-all ${micOn ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-red-500 text-white'}`}
                                title="Toggle Microphone"
                            >
                                {micOn ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                )}
                            </button>
                            <button
                                onClick={() => setCameraOn(!cameraOn)}
                                className={`p-3 rounded-full backdrop-blur-md transition-all ${cameraOn ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-red-500 text-white'}`}
                                title="Toggle Camera"
                            >
                                {cameraOn ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-500 text-sm">Check your lighting and audio before going live.</p>
                    </div>
                </div>

                {/* Right: Details */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Stream Setup</h1>
                        <p className="text-gray-400">Get everything ready for your broadcast.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Channel Title</label>
                            <input
                                type="text"
                                value={channelName}
                                onChange={(e) => setChannelName(e.target.value)}
                                placeholder="What are we doing today?"
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={!channelName.trim()}
                        className="w-full py-4 gradient-gold text-black font-bold text-lg rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>Start Broadcast</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </button>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-900">
                        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900/50 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white text-sm font-medium transition-colors border border-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Settings
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900/50 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white text-sm font-medium transition-colors border border-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                            RTMP Keys
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
