'use client';

import {
    RemoteUser,
    useIsConnected,
    useJoin,
    useRemoteUsers,
} from 'agora-rtc-react';

interface ViewerViewProps {
    appId: string;
    channelName: string;
    token: string;
    uid: number;
}

export function ViewerView({
    appId,
    channelName,
    token,
    uid,
}: ViewerViewProps) {
    const isConnected = useIsConnected();
    const remoteUsers = useRemoteUsers();

    // Join the channel as audience
    useJoin(
        { appid: appId, channel: channelName, token: token || null, uid },
        true
    );

    // Find the host (first remote user publishing video)
    const host = remoteUsers.find(user => user.hasVideo || user.hasAudio);

    return (
        <div className="relative w-full h-full bg-black overflow-hidden group">
            {/* Video Player Layer */}
            <div className="absolute inset-0 z-0">
                {!isConnected ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-r-2 border-purple-500"></div>
                            <span className="text-gray-500 text-sm">Connecting...</span>
                        </div>
                    </div>
                ) : host ? (
                    <RemoteUser
                        user={host}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full bg-gray-900">
                        <div className="text-center p-8">
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </div>
                            <h3 className="text-white font-medium text-lg">Waiting for Host</h3>
                            <p className="text-gray-500 text-sm mt-1">The broadcast hasn't started yet.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Overlays Layer - Clean video feed (indicators moved to ChatPanel) */}
            <div className="absolute inset-0 z-10 p-4 md:p-6 flex flex-col justify-between pointer-events-none">
                {/* Empty for now, or just minimal controls if needed */}
            </div>

            {/* Gradient Overlay for Readability */}

        </div>
    );
}
