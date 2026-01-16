'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { BroadcastSettings } from '@/components/agora/BroadcastSetup';

// Dynamic import for BroadcastSetup (Green Room)
const BroadcastSetup = dynamic(
    () => import('@/components/agora/BroadcastSetup').then(mod => mod.BroadcastSetup),
    { ssr: false }
);

export default function BroadcastPage() {
    const router = useRouter();

    const handleGoLive = (channelName: string, settings: BroadcastSettings) => {
        // Build URL with all settings as query params
        const params = new URLSearchParams({
            host: 'true',
            quality: settings.quality,
            micOn: String(settings.micOn),
            cameraOn: String(settings.cameraOn),
        });

        // Add device IDs if available
        if (settings.cameraDeviceId) {
            params.set('cameraId', settings.cameraDeviceId);
        }
        if (settings.micDeviceId) {
            params.set('micId', settings.micDeviceId);
        }

        // Redirect to the watch page with host param and settings
        router.push(`/watch/${encodeURIComponent(channelName)}?${params.toString()}`);
    };

    return (
        <BroadcastSetup onReady={handleGoLive} />
    );
}
