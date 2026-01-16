import { NextRequest, NextResponse } from 'next/server';
import { startMediaPush } from '@/lib/agora/media-push';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { channelName, rtmpUrl } = body;

        if (!channelName || !rtmpUrl) {
            return NextResponse.json(
                { error: 'channelName and rtmpUrl are required' },
                { status: 400 }
            );
        }

        const result = await startMediaPush({
            channelName,
            rtmpUrl,
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Media Push API Error (Start):', error);
        return NextResponse.json(
            { error: error.message || 'Failed to start media push' },
            { status: 500 }
        );
    }
}
