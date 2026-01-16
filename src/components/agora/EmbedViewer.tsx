'use client';

import {
    RemoteUser,
    useIsConnected,
    useJoin,
    useRemoteUsers,
} from 'agora-rtc-react';

interface EmbedViewerProps {
    appId: string;
    channelName: string;
    token: string;
    uid: number;
}

export function EmbedViewer({
    appId,
    channelName,
    token,
    uid,
}: EmbedViewerProps) {
    const isConnected = useIsConnected();
    const remoteUsers = useRemoteUsers();

    useJoin(
        { appid: appId, channel: channelName, token: token || null, uid },
        true
    );

    const host = remoteUsers.find(user => user.hasVideo || user.hasAudio);

    return (
        <div className="w-full h-full relative">
            {!isConnected ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            ) : host ? (
                <RemoteUser user={host} style={{ width: '100%', height: '100%' }} />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center">
                        <div className="animate-pulse mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-sm">Waiting for stream...</p>
                    </div>
                </div>
            )}

            {/* Live badge overlay */}
            {isConnected && host && (
                <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-1.5 bg-red-600 px-2 py-1 rounded text-xs text-white font-medium">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        LIVE
                    </div>
                </div>
            )}
        </div>
    );
}
