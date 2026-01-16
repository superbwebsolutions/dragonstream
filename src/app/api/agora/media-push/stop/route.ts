import { NextRequest, NextResponse } from 'next/server';
import { stopMediaPush } from '@/lib/agora/media-push';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { channelName } = body;

        if (!channelName) {
            return NextResponse.json(
                { error: 'channelName is required' },
                { status: 400 }
            );
        }

        const result = await stopMediaPush(channelName);

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Media Push API Error (Stop):', error);
        return NextResponse.json(
            { error: error.message || 'Failed to stop media push' },
            { status: 500 }
        );
    }
}
