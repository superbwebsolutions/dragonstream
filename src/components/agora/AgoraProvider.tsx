'use client';

import AgoraRTC, { AgoraRTCProvider, IAgoraRTCClient } from 'agora-rtc-react';
import { useEffect, useRef, ReactNode } from 'react';
import { clientConfig, AudienceLatencyLevel } from '@/lib/agora/config';

interface AgoraProviderProps {
    children: ReactNode;
    role: 'host' | 'audience';
}

export function AgoraProvider({ children, role }: AgoraProviderProps) {
    const clientRef = useRef<IAgoraRTCClient | null>(null);

    // Create client only once
    if (!clientRef.current) {
        clientRef.current = AgoraRTC.createClient(clientConfig);

        // Set role
        if (role === 'host') {
            clientRef.current.setClientRole('host');
        } else {
            clientRef.current.setClientRole('audience', {
                level: AudienceLatencyLevel.AUDIENCE_LEVEL_LOW_LATENCY,
            });
        }
    }

    return (
        <AgoraRTCProvider client={clientRef.current}>
            {children}
        </AgoraRTCProvider>
    );
}
