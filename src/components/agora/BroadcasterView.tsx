'use client';

import {
    LocalUser,
    RemoteUser,
    useIsConnected,
    useJoin,
    useLocalMicrophoneTrack,
    useLocalCameraTrack,
    usePublish,
    useRemoteUsers,
} from 'agora-rtc-react';
import { useState, useEffect } from 'react';

interface BroadcasterViewProps {
    appId: string;
    channelName: string;
    token: string;
    uid: number;
    onLeave?: () => void;
}

export function BroadcasterView({
    appId,
    channelName,
    token,
    uid,
    onLeave,
}: BroadcasterViewProps) {
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [quality, setQuality] = useState('1080p_1'); // Default 1080p for clear "High" quality
    const isConnected = useIsConnected();

    // Create local tracks
    const { localMicrophoneTrack, isLoading: isMicLoading } = useLocalMicrophoneTrack(micOn);
    // Initialize with current quality to ensure capability
    const { localCameraTrack, isLoading: isCameraLoading } = useLocalCameraTrack(cameraOn, {
        encoderConfig: quality as any
    });

    // Dynamic Quality Adjustment
    useEffect(() => {
        if (localCameraTrack && !isCameraLoading) {
            console.log('Setting encoder quality to:', quality);
            localCameraTrack.setEncoderConfiguration(quality as any);
        }
    }, [localCameraTrack, isCameraLoading, quality]);

    // Join the channel as host
    useJoin(
        { appid: appId, channel: channelName, token: token || null, uid },
        true
    );

    // Publish local tracks
    usePublish([localMicrophoneTrack, localCameraTrack]);

    // Get remote users (co-hosts if any)
    const remoteUsers = useRemoteUsers();

    const handleLeave = () => {
        if (onLeave) onLeave();
    };

    return (
        <div className="relative w-full h-full bg-black overflow-hidden group">
            {/* Background / Local Video Layer */}
            <div className="absolute inset-0 z-0">
                {(isMicLoading || isCameraLoading) ? (
                    <div className="flex items-center justify-center h-full bg-gray-900">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-r-2 border-purple-500"></div>
                            <span className="text-gray-500 text-sm">Getting camera ready...</span>
                        </div>
                    </div>
                ) : (
                    <LocalUser
                        audioTrack={localMicrophoneTrack}
                        cameraOn={cameraOn}
                        micOn={micOn}
                        videoTrack={localCameraTrack}
                        playAudio={false}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Overlays */}
            <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between pointer-events-none">
                {/* Top Bar - REMOVED (Redundant with sidebar) */}
                <div className="flex items-center justify-between pointer-events-auto">
                    {/* Empty or just remove entire block if easier, but keeping strict structure */}
                </div>

                {/* Bottom Controls */}
                <div className="flex items-center justify-center gap-6 pointer-events-auto pb-8 md:pb-0">
                    {/* Quality Toggle */}
                    <button
                        onClick={() => {
                            const next = quality === '720p_2' ? '1080p_1' : quality === '1080p_1' ? '480p_1' : '720p_2';
                            setQuality(next);
                        }}
                        className="p-4 rounded-full transition-all backdrop-blur-md border border-white/10 bg-white/20 text-white hover:bg-white/30 flex flex-col items-center justify-center relative group/quality"
                        title={`Current: ${quality === '720p_2' ? '720p HD' : quality === '1080p_1' ? '1080p FHD' : '480p SD'}`}
                    >
                        <span className="text-xs font-bold">{quality.split('_')[0].replace('p', '')}</span>
                        <span className="text-[8px] opacity-70">HD</span>
                    </button>

                    <button
                        onClick={() => setMicOn(!micOn)}
                        className={`p-4 rounded-full transition-all backdrop-blur-md border border-white/10 ${micOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-600 text-white hover:bg-red-500'}`}
                    >
                        {micOn ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                        )}
                    </button>

                    <button
                        onClick={handleLeave}
                        className="px-8 py-4 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wide uppercase transition-all shadow-lg shadow-red-600/30"
                    >
                        End Live
                    </button>

                    <button
                        onClick={() => setCameraOn(!cameraOn)}
                        className={`p-4 rounded-full transition-all backdrop-blur-md border border-white/10 ${cameraOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-600 text-white hover:bg-red-500'}`}
                    >
                        {cameraOn ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Remote Co-hosts (Grid overlay) */}
            {remoteUsers.length > 0 && (
                <div className="absolute top-20 right-4 w-32 space-y-2 z-20">
                    {remoteUsers.map((user) => (
                        <div key={user.uid} className="aspect-video bg-gray-800 rounded-lg overflow-hidden border border-white/20 shadow-lg">
                            <RemoteUser user={user} style={{ width: '100%', height: '100%' }} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
