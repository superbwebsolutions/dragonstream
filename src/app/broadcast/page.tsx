'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Dynamic import for BroadcastSetup (Green Room)
const BroadcastSetup = dynamic(
    () => import('@/components/agora/BroadcastSetup').then(mod => mod.BroadcastSetup),
    { ssr: false }
);

export default function BroadcastPage() {
    const router = useRouter();

    const handleGoLive = (channelName: string) => {
        // Redirect to the watch page with host param
        router.push(`/watch/${channelName}?host=true`);
    };

    return (
        <BroadcastSetup onReady={handleGoLive} />
    );
}
