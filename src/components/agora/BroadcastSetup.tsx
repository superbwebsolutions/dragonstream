'use client';

import { useLocalMicrophoneTrack, useLocalCameraTrack, LocalUser } from 'agora-rtc-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AgoraRTC from 'agora-rtc-sdk-ng';

interface BroadcastSetupProps {
    onReady: (channelName: string, settings: BroadcastSettings) => void;
}

export interface BroadcastSettings {
    quality: string;
    cameraDeviceId?: string;
    micDeviceId?: string;
    micOn: boolean;
    cameraOn: boolean;
}

interface MediaDevice {
    deviceId: string;
    label: string;
}

const QUALITY_OPTIONS = [
    { value: '480p_1', label: '480p SD', description: 'Best for slow connections' },
    { value: '720p_2', label: '720p HD', description: 'Balanced quality' },
    { value: '1080p_1', label: '1080p FHD', description: 'Best quality' },
];

export function BroadcastSetup({ onReady }: BroadcastSetupProps) {
    const [channelName, setChannelName] = useState('');
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [quality, setQuality] = useState('720p_2');
    const [showSettings, setShowSettings] = useState(false);

    // Device lists
    const [cameras, setCameras] = useState<MediaDevice[]>([]);
    const [microphones, setMicrophones] = useState<MediaDevice[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<string>('');
    const [selectedMic, setSelectedMic] = useState<string>('');

    // Fetch available devices
    useEffect(() => {
        const getDevices = async () => {
            try {
                // Request permissions first
                await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

                const devices = await AgoraRTC.getDevices();

                const videoDevices = devices
                    .filter(d => d.kind === 'videoinput')
                    .map(d => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 8)}` }));

                const audioDevices = devices
                    .filter(d => d.kind === 'audioinput')
                    .map(d => ({ deviceId: d.deviceId, label: d.label || `Microphone ${d.deviceId.slice(0, 8)}` }));

                setCameras(videoDevices);
                setMicrophones(audioDevices);

                // Set defaults
                if (videoDevices.length > 0 && !selectedCamera) {
                    setSelectedCamera(videoDevices[0].deviceId);
                }
                if (audioDevices.length > 0 && !selectedMic) {
                    setSelectedMic(audioDevices[0].deviceId);
                }
            } catch (err) {
                console.error('Error getting devices:', err);
            }
        };

        getDevices();

        // Listen for device changes
        navigator.mediaDevices.addEventListener('devicechange', getDevices);
        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', getDevices);
        };
    }, []);

    // Create local tracks for preview with selected devices
    const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn, {
        microphoneId: selectedMic || undefined
    });
    const { localCameraTrack } = useLocalCameraTrack(cameraOn, {
        cameraId: selectedCamera || undefined,
        encoderConfig: quality as any
    });

    // Update camera when selection changes
    useEffect(() => {
        if (localCameraTrack && selectedCamera) {
            localCameraTrack.setDevice(selectedCamera).catch(console.error);
        }
    }, [selectedCamera, localCameraTrack]);

    // Update microphone when selection changes
    useEffect(() => {
        if (localMicrophoneTrack && selectedMic) {
            localMicrophoneTrack.setDevice(selectedMic).catch(console.error);
        }
    }, [selectedMic, localMicrophoneTrack]);

    // Update quality when changed
    useEffect(() => {
        if (localCameraTrack) {
            localCameraTrack.setEncoderConfiguration(quality as any).catch(console.error);
        }
    }, [quality, localCameraTrack]);

    const handleStart = () => {
        if (channelName.trim()) {
            onReady(channelName, {
                quality,
                cameraDeviceId: selectedCamera,
                micDeviceId: selectedMic,
                micOn,
                cameraOn
            });
        }
    };

    const currentQuality = QUALITY_OPTIONS.find(q => q.value === quality) || QUALITY_OPTIONS[1];

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

            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-start">

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
                            {/* Quality Badge */}
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full z-10">
                                <span className="text-yellow-400 text-xs font-bold">{currentQuality.label}</span>
                            </div>

                            {/* Status Badge */}
                            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 z-10">
                                <div className={`w-2 h-2 rounded-full ${micOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-white text-xs font-semibold tracking-wide">
                                    {micOn ? 'Mic On' : 'Mic Off'}
                                </span>
                            </div>
                        </LocalUser>

                        {/* Overlay Controls */}
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

                {/* Right: Details & Settings */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Stream Setup</h1>
                        <p className="text-gray-400">Get everything ready for your broadcast.</p>
                    </div>

                    {/* Channel Name */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Channel Title</label>
                        <input
                            type="text"
                            value={channelName}
                            onChange={(e) => setChannelName(e.target.value)}
                            placeholder="What are we doing today?"
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all font-medium"
                        />
                    </div>

                    {/* Quality Selector */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Stream Quality</label>
                        <div className="grid grid-cols-3 gap-2">
                            {QUALITY_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setQuality(option.value)}
                                    className={`p-3 rounded-xl border transition-all text-center ${quality === option.value
                                            ? 'bg-yellow-600/20 border-yellow-500 text-yellow-400'
                                            : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                                        }`}
                                >
                                    <div className="font-bold text-sm">{option.label}</div>
                                    <div className="text-[10px] opacity-70 mt-0.5">{option.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Device Selectors */}
                    <div className="space-y-4">
                        {/* Camera Selector */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                <span className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    Camera
                                </span>
                            </label>
                            <select
                                value={selectedCamera}
                                onChange={(e) => setSelectedCamera(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-all appearance-none cursor-pointer"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                            >
                                {cameras.length === 0 ? (
                                    <option value="">No cameras found</option>
                                ) : (
                                    cameras.map((camera) => (
                                        <option key={camera.deviceId} value={camera.deviceId}>
                                            {camera.label}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        {/* Microphone Selector */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                <span className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                    Microphone
                                </span>
                            </label>
                            <select
                                value={selectedMic}
                                onChange={(e) => setSelectedMic(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-all appearance-none cursor-pointer"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                            >
                                {microphones.length === 0 ? (
                                    <option value="">No microphones found</option>
                                ) : (
                                    microphones.map((mic) => (
                                        <option key={mic.deviceId} value={mic.deviceId}>
                                            {mic.label}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={handleStart}
                        disabled={!channelName.trim()}
                        className="w-full py-4 gradient-gold text-black font-bold text-lg rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>Start Broadcast</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
