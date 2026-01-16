'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import dynamic from 'next/dynamic';
import { agoraConfig } from '@/lib/agora/config';

// Dynamic imports for Agora components (not available during SSR)
const AgoraProvider = dynamic(
    () => import('@/components/agora/AgoraProvider').then(mod => mod.AgoraProvider),
    { ssr: false }
);

const EmbedViewer = dynamic(
    () => import('@/components/agora/EmbedViewer').then(mod => mod.EmbedViewer),
    {
        ssr: false, loading: () => (
            <div className="w-full h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }
);

interface PageProps {
    params: Promise<{ channelName: string }>;
}

export default function EmbedPage({ params }: PageProps) {
    const { channelName } = use(params);
    const [token, setToken] = useState('');
    const [uid, setUid] = useState(0);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const joinStream = async () => {
            if (!agoraConfig.appId) {
                setError(true);
                return;
            }

            try {
                const response = await fetch('/api/agora/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        channelName,
                        role: 'audience',
                    }),
                });

                if (!response.ok) throw new Error();

                const data = await response.json();
                setToken(data.token);
                setUid(data.uid);
                setReady(true);
            } catch {
                setError(true);
            }
        };

        joinStream();
    }, [channelName]);

    if (error) {
        return (
            <div className="w-full h-screen bg-black flex items-center justify-center">
                <p className="text-gray-500">Unable to load stream</p>
            </div>
        );
    }

    if (!ready) {
        return (
            <div className="w-full h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-black">
            <AgoraProvider role="audience">
                <EmbedViewer
                    appId={agoraConfig.appId}
                    channelName={channelName}
                    token={token}
                    uid={uid}
                />
            </AgoraProvider>
        </div>
    );
}
