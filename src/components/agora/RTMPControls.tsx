'use client';

import { useState } from 'react';

interface RTMPControlsProps {
    channelName: string;
    isBroadcasting: boolean;
}

export function RTMPControls({ channelName, isBroadcasting }: RTMPControlsProps) {
    const [rtmpUrl, setRtmpUrl] = useState('');
    const [isPushing, setIsPushing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleStartPush = async () => {
        if (!rtmpUrl.trim()) return;
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/agora/media-push/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channelName,
                    rtmpUrl: rtmpUrl.trim(),
                }),
            });

            if (!res.ok) throw new Error('Failed to start RTMP push');

            setIsPushing(true);
        } catch (err) {
            setError('Failed to start stream to external platform');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStopPush = async () => {
        if (!isPushing) return;
        setIsLoading(true);

        try {
            const res = await fetch('/api/agora/media-push/stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channelName }),
            });

            if (!res.ok) throw new Error('Failed to stop RTMP push');

            setIsPushing(false);
        } catch (err) {
            console.error(err);
            // Even if it fails, maybe assume it stopped or let user try again
            setError('Failed to stop external stream');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isBroadcasting) return null;

    return (
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50 mt-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Stream to External Support (YouTube/Twitch)
            </h3>

            <div className="space-y-3">
                {!isPushing ? (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={rtmpUrl}
                            onChange={(e) => setRtmpUrl(e.target.value)}
                            placeholder="rtmp://a.rtmp.youtube.com/live2/..."
                            className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                            onClick={handleStartPush}
                            disabled={isLoading || !rtmpUrl.trim()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors min-w-[100px]"
                        >
                            {isLoading ? 'Starting...' : 'Start'}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            <span className="text-green-400 text-sm font-medium">Pushing to External (RTMP)</span>
                        </div>
                        <button
                            onClick={handleStopPush}
                            disabled={isLoading}
                            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium rounded border border-red-500/30 transition-colors"
                        >
                            {isLoading ? 'Stopping...' : 'Stop Push'}
                        </button>
                    </div>
                )}

                {error && <p className="text-red-400 text-xs">{error}</p>}

                {!isPushing && (
                    <p className="text-gray-500 text-xs">
                        Enter the RTMP Server URL + Stream Key from YouTube Live or Twitch Dashboard.
                    </p>
                )}
            </div>
        </div>
    );
}
