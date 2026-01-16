import { NextRequest, NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole, ChatTokenBuilder } from 'agora-token';

export async function POST(request: NextRequest) {
    try {
        const { channelName, role, uid, username } = await request.json();

        const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
        const appCertificate = process.env.AGORA_APP_CERTIFICATE;

        if (!appId || !appCertificate) {
            return NextResponse.json(
                { error: 'Agora credentials not configured' },
                { status: 500 }
            );
        }

        if (!channelName) {
            return NextResponse.json(
                { error: 'Channel name is required' },
                { status: 400 }
            );
        }

        // Token expires in 1 hour
        const expirationTimeInSeconds = 3600;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        // Generate UID if not provided
        const finalUid = uid || Math.floor(Math.random() * 100000);
        // Use provided username or create unique one with session suffix
        // Random suffix allows same user to join from multiple devices/tabs
        const sessionSuffix = Math.floor(Math.random() * 10000);
        const finalUsername = username || `user_${finalUid}_${sessionSuffix}`;

        // Set role: 1 = Publisher (host), 2 = Subscriber (audience)
        const rtcRole = role === 'host' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

        const token = RtcTokenBuilder.buildTokenWithUid(
            appId,
            appCertificate,
            channelName,
            finalUid,
            rtcRole,
            privilegeExpiredTs,
            privilegeExpiredTs
        );

        // Generate Chat Token (User Token)
        let chatToken = '';
        try {
            console.log('Generating chat token with params:', {
                appId: appId?.substring(0, 8) + '...',
                appCert: appCertificate?.substring(0, 8) + '...',
                username: finalUsername,
                expire: expirationTimeInSeconds
            });

            chatToken = ChatTokenBuilder.buildUserToken(
                appId,
                appCertificate,
                finalUsername,
                expirationTimeInSeconds
            );

            console.log('Chat token generated:', chatToken?.substring(0, 30) + '...', 'length:', chatToken?.length);
        } catch (chatError) {
            console.error('Failed to generate chat token:', chatError);
        }

        const response = {
            token,
            uid: finalUid,
            chatToken,
            username: finalUsername,
            channelName,
            expiresAt: privilegeExpiredTs,
        };

        console.log('API Response keys:', Object.keys(response));
        console.log('chatToken in response:', response.chatToken?.substring(0, 20) + '...');

        return NextResponse.json(response);
    } catch (error) {
        console.error('Token generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate token' },
            { status: 500 }
        );
    }
}
